import type { TopoDS_Face, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import * as Inputs from "../../api/inputs";
import type * as Models from "../../api/models";
import type { DesignOutcome } from "./cache";
import { hashBytes, hashText, release, stableJson } from "./cache";
import { sha256 } from "./digest";
import { bodyOf, contextOf, faceCount, faceFrame, faceSignatures, profileNames } from "./helpers";
import { tripleOf } from "./placement";
import type { FaceNames } from "./names";
import { carryNames, give, nameOf } from "./names";
import { DesignProblem, failedWith, pointer, unlessTrapped } from "./problems";
import { resolveFaces } from "./references";
import type { BodyState, DesignPlan, DesignRun, DesignShellLid } from "./state";
import { bodyKey, sketchKey } from "./state";
import { ownValue } from "./structure";
import { numberOf } from "./values";

type Prism = Models.OCCT.DesignBossFeature | Models.OCCT.DesignPocketFeature;

function oneFace(reference: Models.OCCT.DesignFaceReference, body: string, run: DesignRun, path: string): number {
    const faces = resolveFaces(reference, contextOf(bodyOf(body, run), run), path);
    if (faces.length !== 1) {
        throw new DesignProblem(path, `one face of "${body}" is needed here, and the reference finds ${faces.length}`);
    }
    return faces[0]!;
}

function shelled(feature: Models.OCCT.DesignShellFeature, path: string, run: DesignRun): DesignOutcome {
    const body = bodyOf(feature.body, run);
    const thickness = numberOf(feature.thickness, run.parameters, pointer(path, "thickness"));
    if (thickness === 0) {
        throw new DesignProblem(pointer(path, "thickness"), "the thickness is 0");
    }
    const open = resolveFaces(feature.open, contextOf(body, run), pointer(path, "open"));
    const reasons: string[] = [];
    const made = byJoins(feature.id, body, open, -thickness, reasons, run) ?? (thickness > 0 ? byCutting(feature.id, body, open, thickness, reasons, run) : undefined);
    if (made === undefined) {
        throw new DesignProblem(pointer(path, "thickness"), `the shell could not be built (${reasons.join("; ")})`);
    }
    run.trace?.set(path, { indexes: open, join: made.join, ...(made.lids === undefined ? {} : { lids: made.lids }) });
    return { kind: "body", shape: made.shape, names: made.names };
}

const SHELL_JOINS = [Inputs.OCCT.joinTypeEnum.arc, Inputs.OCCT.joinTypeEnum.intersection] as const;

const LID_REACH = 2;

const DIRECTION_TOLERANCE = 1e-9;

const SAME_DIRECTION = 1 - DIRECTION_TOLERANCE;

const LID_TOLERANCE = 1e-6;

interface Shelled {
    shape: TopoDS_Shape;
    names: FaceNames;
    join: string;
    lids?: DesignShellLid[];
}

function joined(id: string, body: BodyState, open: number[], faces: TopoDS_Shape[], offset: number, joinType: Inputs.OCCT.joinTypeEnum, run: DesignRun): Shelled | string {
    const made = run.occt.operations.makeThickSolidByJoinWithHistory({ shape: body.shape, shapes: faces, offset, joinType });
    const hollow = made.history.facesFromFaces.some(walls => walls.length > 0);
    if (!hollow || !run.occt.shapeFix.isValid({ shape: made.shape })) {
        release(made.shape);
        return hollow ? `with ${joinType} joins the solid is not valid` : `with ${joinType} joins nothing was hollowed`;
    }
    const given = new Map<number, string[]>();
    open.forEach(index => give(given, made.history.faces[index] ?? [], nameOf(id, "rim")));
    made.history.facesFromFaces.forEach(offsets => give(given, offsets, nameOf(id, "inner")));
    return { shape: made.shape, names: carryNames(faceCount(made.shape, run), [{ names: body.names, history: made.history }], given), join: joinType };
}

function byJoins(id: string, body: BodyState, open: number[], offset: number, reasons: string[], run: DesignRun): Shelled | undefined {
    const faces = open.map(index => run.occt.shapes.face.getFace({ shape: body.shape, index }));
    try {
        for (const joinType of SHELL_JOINS) {
            const tried = unlessTrapped(() => joined(id, body, open, faces, offset, joinType, run), failedWith(`with ${joinType} joins`));
            if (typeof tried !== "string") {
                return tried;
            }
            reasons.push(tried);
        }
        return undefined;
    } finally {
        faces.forEach(release);
    }
}

function innerSolidOf(shape: TopoDS_Shape, thickness: number, run: DesignRun): TopoDS_Shape | undefined {
    const offset = run.occt.operations.offsetAdv({ shape, distance: -thickness, tolerance: 1e-7, joinType: Inputs.OCCT.joinTypeEnum.intersection, removeIntEdges: false });
    if (run.occt.shapes.shape.getShapeType({ shape: offset }) !== Inputs.OCCT.shapeTypeEnum.shell) {
        release(offset);
        return undefined;
    }
    const inner = run.occt.shapes.solid.fromClosedShell({ shape: offset });
    release(offset);
    if (!run.occt.shapeFix.isValid({ shape: inner })) {
        release(inner);
        return undefined;
    }
    return inner;
}

function lidsOf(body: BodyState, open: number[], inner: TopoDS_Shape, thickness: number, run: DesignRun): DesignShellLid[] | undefined {
    const outer = faceSignatures(body.shape, run);
    const faces = faceSignatures(inner, run);
    const lids: DesignShellLid[] = [];
    for (const index of open) {
        const face = outer[index];
        if (face === undefined || face.type !== Inputs.OCCT.surfaceTypeEnum.plane) {
            return undefined;
        }
        const [minX, minY, minZ] = face.box.min;
        const [maxX, maxY, maxZ] = face.box.max;
        const tolerance = LID_TOLERANCE * Math.max(1, Math.hypot(maxX - minX, maxY - minY, maxZ - minZ));
        const below = faces.find(candidate => candidate.type === Inputs.OCCT.surfaceTypeEnum.plane
            && run.base.vector.dot({ first: candidate.normal, second: face.normal }) > SAME_DIRECTION
            && Math.abs(run.base.vector.dot({ first: run.base.vector.sub({ first: candidate.centre, second: face.centre }), second: face.normal }) + thickness) <= tolerance);
        if (below === undefined) {
            return undefined;
        }
        lids.push({ face: below.index, direction: tripleOf(run.base.vector.mul({ vector: face.normal, scalar: thickness * LID_REACH })) });
    }
    return lids;
}

function cut(id: string, body: BodyState, open: number[], thickness: number, inner: TopoDS_Shape, run: DesignRun): Shelled | string {
    const lids = lidsOf(body, open, inner, thickness, run);
    if (lids === undefined) {
        return "by cutting, an open face is not flat or has no inner face below it";
    }
    const hollow = run.occt.booleans.differenceWithHistory({ shape: body.shape, shapes: [inner], keepEdges: false });
    const hollowGiven = new Map<number, string[]>();
    hollow.histories.slice(1).forEach(history => give(hollowGiven, history.faces.flat(), nameOf(id, "inner")));
    const hollowNames = carryNames(faceCount(hollow.shape, run), hollow.histories.slice(0, 1).map(history => ({ names: body.names, history })), hollowGiven);
    const tools = lids.map(lid => {
        const face = run.occt.shapes.face.getFace({ shape: inner, index: lid.face });
        const tool = run.occt.operations.extrude({ shape: face, direction: lid.direction });
        release(face);
        return tool;
    });
    const opened = run.occt.booleans.differenceWithHistory({ shape: hollow.shape, shapes: tools, keepEdges: false });
    tools.forEach(release);
    release(hollow.shape);
    if (!run.occt.shapeFix.isValid({ shape: opened.shape })) {
        release(opened.shape);
        return "by cutting, the solid is not valid";
    }
    const given = new Map<number, string[]>();
    opened.histories.slice(1).forEach(history => give(given, history.faces.flat(), nameOf(id, "rim")));
    opened.histories.slice(0, 1).forEach(history => hollow.histories.slice(0, 1).forEach(first => {
        give(given, open.flatMap(index => first.faces[index] ?? []).flatMap(face => history.faces[face] ?? []), nameOf(id, "rim"));
    }));
    const names = carryNames(faceCount(opened.shape, run), opened.histories.slice(0, 1).map(history => ({ names: hollowNames, history })), given);
    return { shape: opened.shape, names, join: "cut", lids };
}

function byCutting(id: string, body: BodyState, open: number[], thickness: number, reasons: string[], run: DesignRun): Shelled | undefined {
    const tried = unlessTrapped<Shelled | string>(() => {
        const inner = innerSolidOf(body.shape, thickness, run);
        if (inner === undefined) {
            return "by cutting, the inward offset is not one closed solid";
        }
        try {
            return cut(id, body, open, thickness, inner, run);
        } finally {
            release(inner);
        }
    }, failedWith("by cutting"));
    if (typeof tried === "string") {
        reasons.push(tried);
        return undefined;
    }
    return tried;
}

function drilled(feature: Models.OCCT.DesignHoleFeature, path: string, run: DesignRun): DesignOutcome {
    const body = bodyOf(feature.body, run);
    const frame = faceFrame(feature.on, feature.origin, feature.direction, body, path, "on", run);
    run.trace?.set(path, { frame });
    const frames = feature.at.map((position, index): Inputs.Base.Frame => {
        const x = Array.isArray(position) ? numberOf(position[0], run.parameters, pointer(path, "at", index, 0)) : numberOf(position.x, run.parameters, pointer(path, "at", index, "x"));
        const y = Array.isArray(position) ? numberOf(position[1], run.parameters, pointer(path, "at", index, 1)) : numberOf(position.y, run.parameters, pointer(path, "at", index, "y"));
        return { origin: run.base.frame.pointToWorld({ frame, point: [x, y, 0] }), normal: frame.normal, direction: frame.direction };
    });
    const common = {
        shape: body.shape,
        frames,
        diameter: numberOf(feature.diameter, run.parameters, pointer(path, "diameter")),
        depth: feature.depth === undefined ? 0 : numberOf(feature.depth, run.parameters, pointer(path, "depth")),
        tipAngle: feature.tipAngle === undefined ? 0 : numberOf(feature.tipAngle, run.parameters, pointer(path, "tipAngle")),
    };
    const { counterbore, countersink } = feature;
    const made = counterbore !== undefined
        ? run.occt.features.counterboredHolesWithHistory({
            ...common,
            counterboreDiameter: numberOf(counterbore.diameter, run.parameters, pointer(path, "counterbore", "diameter")),
            counterboreDepth: numberOf(counterbore.depth, run.parameters, pointer(path, "counterbore", "depth")),
        })
        : countersink !== undefined
            ? run.occt.features.countersunkHolesWithHistory({
                ...common,
                countersinkDiameter: numberOf(countersink.diameter, run.parameters, pointer(path, "countersink", "diameter")),
                countersinkAngle: numberOf(countersink.angle, run.parameters, pointer(path, "countersink", "angle")),
            })
            : run.occt.features.holesWithHistory(common);
    const given = new Map<number, string[]>();
    made.histories.slice(1).forEach((hole, index) => {
        const position = feature.at[index]!;
        give(given, hole.faces.flat(), nameOf(feature.id, "wall"), ...(Array.isArray(position) ? [] : [nameOf(feature.id, "wall", position.id)]));
    });
    return { kind: "body", shape: made.shape, names: carryNames(faceCount(made.shape, run), [{ names: body.names, history: made.histories[0]! }], given) };
}

function extentOf(feature: Prism, path: string, run: DesignRun): Pick<Inputs.OCCT.PrismFeatureDto<TopoDS_Shape, TopoDS_Face>, "extent" | "length" | "untilFaceIndex"> {
    if (feature.distance !== undefined) {
        const length = numberOf(feature.distance, run.parameters, pointer(path, "distance"));
        if (length <= 0) {
            throw new DesignProblem(pointer(path, "distance"), `the distance is above 0, not ${length}`);
        }
        return { extent: Inputs.OCCT.featureExtentEnum.length, length };
    }
    if (feature.until !== undefined) {
        return { extent: Inputs.OCCT.featureExtentEnum.untilFace, untilFaceIndex: oneFace(feature.until, feature.body, run, pointer(path, "until")) };
    }
    return { extent: Inputs.OCCT.featureExtentEnum.throughAll };
}

function prismed(feature: Prism, path: string, run: DesignRun): DesignOutcome {
    const body = bodyOf(feature.body, run);
    const sketch = run.sketches.get(feature.profile)!;
    const sketchFaceIndex = oneFace(sketch.face!, feature.body, run, pointer(path, "profile"));
    const direction = feature.type === "boss" ? sketch.normal : tripleOf(run.base.vector.neg({ vector: sketch.normal }));
    const extent = extentOf(feature, path, run);
    run.trace?.set(path, { sketchFace: sketchFaceIndex, ...(extent.untilFaceIndex === undefined ? {} : { untilFace: extent.untilFaceIndex }) });
    const inputs: Inputs.OCCT.PrismFeatureDto<TopoDS_Shape, TopoDS_Face> = { shape: body.shape, profile: sketch.shape, sketchFaceIndex, direction, ...extent };
    const made = feature.type === "boss" ? run.occt.features.bossWithHistory(inputs) : run.occt.features.pocketWithHistory(inputs);
    const given = profileNames(feature.id, [{ history: made.histories[1]!, commands: sketch.commands }]);
    return { kind: "body", shape: made.shape, names: carryNames(faceCount(made.shape, run), [{ names: body.names, history: made.histories[0]! }], given) };
}

function pushedOrPulled(feature: Models.OCCT.DesignPushPullFeature, path: string, run: DesignRun): DesignOutcome {
    const body = bodyOf(feature.body, run);
    const indexes = feature.face.count === undefined
        ? [oneFace(feature.face, feature.body, run, pointer(path, "face"))]
        : resolveFaces(feature.face, contextOf(body, run), pointer(path, "face"));
    const distance = numberOf(feature.distance, run.parameters, pointer(path, "distance"));
    if (distance === 0) {
        throw new DesignProblem(pointer(path, "distance"), "the distance is not 0: above 0 pulls the faces out, below 0 pushes them in");
    }
    run.trace?.set(path, { indexes });
    const made = run.occt.features.pushPullFacesWithHistory({ shape: body.shape, indexes, distance });
    const given = new Map<number, string[]>();
    made.histories.forEach(history => give(given, indexes.flatMap(index => history.faces[index] ?? []), nameOf(feature.id, "end")));
    return { kind: "body", shape: made.shape, names: carryNames(faceCount(made.shape, run), made.histories.map(history => ({ names: body.names, history })), given) };
}

function removed(feature: Models.OCCT.DesignRemoveFacesFeature, path: string, run: DesignRun): DesignOutcome {
    const body = bodyOf(feature.body, run);
    const indexes = resolveFaces(feature.faces, contextOf(body, run), pointer(path, "faces"));
    run.trace?.set(path, { indexes });
    const made = run.occt.features.removeFacesWithHistory({ shape: body.shape, indexes });
    return { kind: "body", shape: made.shape, names: carryNames(faceCount(made.shape, run), made.histories.map(history => ({ names: body.names, history })), new Map()) };
}

type LocalFeature = Models.OCCT.DesignShellFeature | Models.OCCT.DesignHoleFeature | Models.OCCT.DesignPushPullFeature | Models.OCCT.DesignRemoveFacesFeature | Prism;

/** Shells, drills, raises, sinks, pushes or pulls the body a feature names, or removes faces from it. */
export function localPlan(feature: LocalFeature, path: string, run: DesignRun): DesignPlan {
    switch (feature.type) {
        case "shell":
            return { reads: [bodyKey(feature.body)], make: () => shelled(feature, path, run) };
        case "hole":
            return { reads: [bodyKey(feature.body)], make: () => drilled(feature, path, run) };
        case "pushPull":
            return { reads: [bodyKey(feature.body)], make: () => pushedOrPulled(feature, path, run) };
        case "removeFaces":
            return { reads: [bodyKey(feature.body)], make: () => removed(feature, path, run) };
        default:
            return { reads: [sketchKey(feature.profile), bodyKey(feature.body)], make: () => prismed(feature, path, run) };
    }
}

type ImportFormat = NonNullable<Models.OCCT.DesignImportFeature["format"]>;

function formatOf(feature: Models.OCCT.DesignImportFeature, asset: Models.OCCT.DesignAsset, data: string | Uint8Array, path: string): ImportFormat {
    if (feature.format !== undefined) {
        return feature.format;
    }
    const media = (asset.mediaType ?? "").toLowerCase();
    const extension = /\.([A-Za-z0-9]+)$/.exec(asset.uri.split(/[?#]/)[0]!)?.[1]?.toLowerCase() ?? "";
    if (media.includes("step") || extension === "step" || extension === "stp") {
        return "step";
    }
    if (media.includes("iges") || extension === "iges" || extension === "igs") {
        return "iges";
    }
    if (media.includes("brep") || extension === "brep" || extension === "brp") {
        return typeof data === "string" ? "brep" : "brep-binary";
    }
    throw new DesignProblem(pointer(path, "format"), `the format of "${asset.uri}" cannot be told from its media type or extension: give format`);
}

function imported(feature: Models.OCCT.DesignImportFeature, asset: Models.OCCT.DesignAsset, data: string | Uint8Array, path: string, run: DesignRun): DesignOutcome {
    const format = formatOf(feature, asset, data, path);
    run.trace?.set(path, { format });
    let shape: TopoDS_Shape | undefined;
    if (format === "brep-binary") {
        shape = run.occt.io.loadBrepBinary({ brepData: typeof data === "string" ? new TextEncoder().encode(data) : data });
    } else if (format === "brep") {
        shape = run.occt.io.loadBrep({ brepData: typeof data === "string" ? data : new TextDecoder().decode(data) });
    } else {
        shape = run.occt.io.loadSTEPorIGES({ filetext: typeof data === "string" ? data : new Uint8Array(data).buffer, fileName: `asset.${format}`, adjustZtoY: false });
    }
    if (shape === undefined) {
        throw new DesignProblem(pointer(path, "asset"), `"${asset.uri}" holds no shape`);
    }
    const names = Array.from({ length: faceCount(shape, run) }, (_, index) => [nameOf(feature.id, "face"), nameOf(feature.id, "face", String(index))].sort());
    return { kind: "body", shape, names };
}

/**
 * Starts a body from an asset, checking the data the build was given for it against the SHA-256 the
 * document records. The digest of the data and the asset's entry are part of the feature's hash, so
 * changed data or a changed entry rebuilds.
 */
export function importPlan(feature: Models.OCCT.DesignImportFeature, path: string, run: DesignRun): DesignPlan {
    const given = ownValue(run.assets, feature.asset);
    if (given === undefined) {
        throw new DesignProblem(pointer(path, "asset"), `the build was given no data for the asset "${feature.asset}"`);
    }
    const data = typeof given === "string" || given instanceof Uint8Array ? given : new Uint8Array(given);
    const asset = run.declaredAssets.find(declared => declared.id === feature.asset)!;
    let key = typeof data === "string" ? `text ${data.length} ${hashText(data)}` : `bytes ${data.length} ${hashBytes(data)}`;
    if (asset.sha256 !== undefined) {
        const digest = sha256(typeof data === "string" ? new TextEncoder().encode(data) : data);
        if (asset.sha256 !== digest) {
            throw new DesignProblem(pointer(path, "asset"), `the data given for "${feature.asset}" has the SHA-256 ${digest}, not the ${asset.sha256} the document records`);
        }
        key = digest;
    }
    return { reads: [], salt: `${key} ${stableJson(asset)}`, make: () => imported(feature, asset, data, path, run) };
}
