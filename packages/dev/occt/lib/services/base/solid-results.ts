import type { BitbybitOcctModule, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { distance3, subtract3 } from "@bitbybit-dev/base/lib/api/services/helpers/geometry/vectors";
import type * as Inputs from "../../api/inputs";
import { withKernelFailure } from "./kernel-refusals";
import { release, releasedOnError } from "./release";
import { reindexedHistory, repairedIndexes } from "./repaired-history";
import type { Rounding, RoundingFailures } from "./rounding-types";

const LEAST_VOLUME = 1e-21;

const VOLUME_PROPERTIES = 4;

const WITH_GEOMETRY = true;

const VOLUME_SLACK = 1.000001;

const BOX_VALUES = 6;

const AXES = [0, 1, 2] as const;

const MOST_GROWTH_OF_DIAGONAL = 0.01;

interface Box {
    readonly min: Inputs.Base.Point3;
    readonly max: Inputs.Base.Point3;
}

function boxOf(occ: BitbybitOcctModule, shape: TopoDS_Shape): Box | undefined {
    const box = occ.BoundingBoxOf(shape);
    return box.length < BOX_VALUES ? undefined : { min: [box[0]!, box[1]!, box[2]!], max: [box[3]!, box[4]!, box[5]!] };
}

function boxVolumeOf(occ: BitbybitOcctModule, shape: TopoDS_Shape): number {
    const box = boxOf(occ, shape);
    if (box === undefined) {
        return 0;
    }
    const [width, height, depth] = subtract3(box.max, box.min);
    return width * height * depth;
}

function overshoot(around: Box, box: Box): number {
    return Math.max(...AXES.flatMap(axis => [around.min[axis] - box.min[axis], box.max[axis] - around.max[axis]]));
}

function leavesBoxOf(occ: BitbybitOcctModule, input: TopoDS_Shape, made: TopoDS_Shape): boolean {
    const around = boxOf(occ, input);
    const loose = boxOf(occ, made);
    if (around === undefined || loose === undefined || overshoot(around, loose) <= 0) {
        return false;
    }
    const tight = occ.TightBoundingBox(made);
    const out = overshoot(around, { min: [tight.XMin, tight.YMin, tight.ZMin], max: [tight.XMax, tight.YMax, tight.ZMax] });
    if (out <= 0) {
        return false;
    }
    return !(out <= MOST_GROWTH_OF_DIAGONAL * distance3(around.min, around.max)) || out > occ.ValidityReport(made).maxTolerance;
}

export function holdsSolid(occ: BitbybitOcctModule, shape: TopoDS_Shape): boolean {
    return occ.CountSubShapes(shape, occ.TopAbs_ShapeEnum.SOLID, false) > 0;
}

export function signedSolidVolume(occ: BitbybitOcctModule, made: TopoDS_Shape): number | undefined {
    return holdsSolid(occ, made) ? occ.VolumePropertiesOfEach([made])[0] ?? 0 : undefined;
}

export function isInsideOutVolume(signedVolume: number | undefined): boolean {
    return signedVolume !== undefined && signedVolume < -LEAST_VOLUME;
}

function holdsSolidInsideOut(occ: BitbybitOcctModule, shape: TopoDS_Shape): boolean {
    const solids = occ.SolidsOf(shape, false);
    try {
        const properties = occ.VolumePropertiesOfEach(solids);
        return solids.some((_solid, at) => isInsideOutVolume(properties[at * VOLUME_PROPERTIES]));
    } finally {
        solids.forEach(release);
    }
}

export function isEmptyVolume(signedVolume: number | undefined): boolean {
    return signedVolume !== undefined && Math.abs(signedVolume) <= LEAST_VOLUME;
}

export function isInsideOut(occ: BitbybitOcctModule, made: TopoDS_Shape): boolean {
    return isInsideOutVolume(signedSolidVolume(occ, made));
}

export function isBrokenResult(occ: BitbybitOcctModule, made: TopoDS_Shape, asSolid: boolean): boolean {
    if (made.IsNull()) {
        return true;
    }
    if (!asSolid || occ.ShapeIsValid(made)) {
        return false;
    }
    const volume = Math.abs(occ.VolumePropertiesOfEach([made])[0] ?? Number.NaN);
    return !holdsSolid(occ, made) || !(volume > LEAST_VOLUME) || volume > boxVolumeOf(occ, made) * VOLUME_SLACK;
}

type RoundingVerdict = "sound" | "insideOut" | "broken";

function roundingVerdict(occ: BitbybitOcctModule, input: TopoDS_Shape, made: TopoDS_Shape, asSolid: boolean): RoundingVerdict {
    if (made.IsNull() || leavesBoxOf(occ, input, made)) {
        return "broken";
    }
    if (!asSolid) {
        return "sound";
    }
    const signedVolume = signedSolidVolume(occ, made);
    if (signedVolume !== undefined && holdsSolidInsideOut(occ, made)) {
        return "insideOut";
    }
    if (signedVolume !== undefined && !(signedVolume > LEAST_VOLUME)) {
        return "broken";
    }
    return !occ.ShapeIsValid(made) && (signedVolume === undefined || signedVolume > boxVolumeOf(occ, made) * VOLUME_SLACK) ? "broken" : "sound";
}

function isMended(occ: BitbybitOcctModule, input: TopoDS_Shape, repaired: TopoDS_Shape): boolean {
    const signedVolume = signedSolidVolume(occ, repaired);
    return signedVolume !== undefined && signedVolume > LEAST_VOLUME && signedVolume <= boxVolumeOf(occ, repaired) * VOLUME_SLACK
        && !holdsSolidInsideOut(occ, repaired) && occ.ShapeIsValid(repaired) && !leavesBoxOf(occ, input, repaired);
}

function mended(occ: BitbybitOcctModule, input: TopoDS_Shape, made: TopoDS_Shape, failures: RoundingFailures): Rounding {
    const copy = occ.BRepBuilderAPI_Copy_Shape(made, WITH_GEOMETRY);
    return releasedOnError([copy], () => {
        const repaired = withKernelFailure(occ, () => occ.ShapeFix_Shape_Perform(copy), failures.insideOut);
        if (!releasedOnError([repaired], () => isMended(occ, input, repaired))) {
            repaired.delete();
            throw failures.insideOut();
        }
        return {
            shape: repaired,
            made,
            reindexed: history => {
                const indexes = repairedIndexes(occ, copy, repaired);
                if (indexes === undefined) {
                    throw failures.unnumbered();
                }
                return reindexedHistory(history, indexes);
            },
            release: () => [made, copy].forEach(release),
        };
    });
}

/**
 * What a fillet or chamfer hands back of what its maker made: the shape itself when it is sound, or,
 * when any of its solids came out inside out, the copy of it OCCT's shape repair turns right, if
 * that is valid, holds no solid inside out, holds a volume a solid can have and stays inside the box
 * of what was rounded. The repair works on a copy because it rewrites the curves the edges keep on
 * their faces, and what the maker made shares its untouched edges with what was rounded. Anything
 * else is freed and refused. `reindexed` numbers a history read against what the maker made on the
 * shape handed back; once it has been read, `releaseMade` frees what the maker made, and the copy,
 * if it was repaired.
 */
export function soundRounding(occ: BitbybitOcctModule, input: TopoDS_Shape, made: TopoDS_Shape, asSolid: boolean, failures: RoundingFailures): Rounding {
    const verdict = roundingVerdict(occ, input, made, asSolid);
    if (verdict === "sound") {
        return { shape: made, made, reindexed: history => history, release: () => undefined };
    }
    if (verdict === "insideOut") {
        return releasedOnError([made], () => mended(occ, input, made, failures));
    }
    made.delete();
    throw failures.broken();
}

export function releaseMade(rounding: Rounding): void {
    rounding.release();
}

export function soundRoundingShape(occ: BitbybitOcctModule, input: TopoDS_Shape, made: TopoDS_Shape, asSolid: boolean, failures: RoundingFailures): TopoDS_Shape {
    const rounding = soundRounding(occ, input, made, asSolid, failures);
    releaseMade(rounding);
    return rounding.shape;
}

export function unbrokenRounding<T extends TopoDS_Shape>(occ: BitbybitOcctModule, input: TopoDS_Shape, made: T, failure: () => Error): T {
    if (roundingVerdict(occ, input, made, false) !== "sound") {
        made.delete();
        throw failure();
    }
    return made;
}
