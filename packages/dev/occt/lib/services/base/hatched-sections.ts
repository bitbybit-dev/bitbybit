import type { TopoDS_Compound, TopoDS_Edge, TopoDS_Face, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import type { IO } from "@bitbybit-dev/base/lib/api/inputs/io-inputs";
import type * as Inputs from "../../api/inputs";
import type * as Models from "../../api/models";
import type { OccHelper } from "../../occ-helper";
import { exactTracing } from "./drawing.service";
import { sliceAlongFrames } from "./frame-cuts";
import { GROUND_FRAME, NEIGHBOUR_TURNS, SPACE_AXES } from "./hatched-sections.constants";
import type { CapsBox, CutShape, HatchSettings } from "./hatched-sections-types";
import { release, released, releasedOnError } from "./release";

const boundariesOf = (och: OccHelper, face: TopoDS_Face, toGround: Inputs.Base.TransformMatrixes, settings: HatchSettings): IO.DrawingPathDto[] => {
    const grounded = och.transformsService.transformByMatrix({ shape: face, transformation: toGround });
    return released([grounded], () => och.drawingService.pathsOfShape({ ...exactTracing(settings.curveTolerance), shape: grounded }));
};

const cutOf = (och: OccHelper, shape: TopoDS_Shape, frame: Inputs.Base.Frame, toGround: Inputs.Base.TransformMatrixes, settings: HatchSettings): CutShape => {
    const copied = och.occ.BRepBuilderAPI_Copy_Shape(shape, false);
    const [caps] = released([copied], () => sliceAlongFrames(och, copied, [frame], true, settings.tolerance));
    return releasedOnError([caps!], () => {
        const faces = och.shapeGettersService.getFaces({ shape: caps! });
        return releasedOnError(faces, () => ({
            caps: caps!,
            faces,
            boundaries: faces.map(face => boundariesOf(och, face, toGround, settings)),
            box: faces.length === 0 ? undefined : boxOf(och, caps!),
        }));
    });
};

const boxOf = (och: OccHelper, caps: TopoDS_Compound): CapsBox => {
    const { min, max } = och.operationsService.boundingBoxOfShape({ shape: caps });
    return { min, max };
};

const boxesNear = (a: CapsBox, b: CapsBox, gap: number): boolean =>
    SPACE_AXES.every(axis => a.min[axis]! - gap <= b.max[axis]! && b.min[axis]! - gap <= a.max[axis]!);

const capsNear = (och: OccHelper, a: CutShape, b: CutShape, gap: number): boolean => {
    if (a.box === undefined || b.box === undefined || !boxesNear(a.box, b.box, gap)) {
        return false;
    }
    const [onA, onB] = och.operationsService.closestPointsBetweenTwoShapes(a.caps, b.caps);
    return och.base.point.distance({ startPoint: onA, endPoint: onB }) <= gap;
};

const anglesOf = (och: OccHelper, cuts: readonly CutShape[], settings: HatchSettings): number[] => {
    const turns: number[] = [];
    cuts.forEach((cut, at) => {
        if (!settings.neighbourAngles || cut.box === undefined) {
            turns.push(NEIGHBOUR_TURNS[0]!);
            return;
        }
        const taken = new Set<number>();
        for (let earlier = 0; earlier < at; earlier++) {
            if (capsNear(och, cuts[earlier]!, cut, settings.spacing)) {
                taken.add(turns[earlier]!);
            }
        }
        turns.push(NEIGHBOUR_TURNS.find(turn => !taken.has(turn)) ?? NEIGHBOUR_TURNS[at % NEIGHBOUR_TURNS.length]!);
    });
    return turns.map(turn => settings.angle + turn);
};

const linesOf = (och: OccHelper, frame: Inputs.Base.Frame, hatch: IO.DrawingHatchDto, settings: HatchSettings): TopoDS_Compound => {
    const segments = och.base.io.drawing.clippedHatchLines({ ...hatch, tolerance: settings.curveTolerance });
    const ends = och.base.frame.pointsToWorld({ frame, points: segments.flatMap(([start, end]) => [[start[0], start[1], 0], [end[0], end[1], 0]] as Inputs.Base.Point3[]) });
    const edges: TopoDS_Edge[] = [];
    return released(edges, () => {
        for (let at = 0; at + 1 < ends.length; at += 2) {
            edges.push(och.edgesService.lineEdge({ start: ends[at]!, end: ends[at + 1]! }));
        }
        return och.converterService.makeCompound({ shapes: edges });
    });
};

const capsOf = (och: OccHelper, cut: CutShape, frame: Inputs.Base.Frame, angle: number, settings: HatchSettings, made: TopoDS_Compound[]): Models.OCCT.HatchedSectionCap<TopoDS_Shape>[] =>
    cut.faces.map((face, at) => {
        const hatch: IO.DrawingHatchDto = { boundaries: cut.boundaries[at]!, pattern: settings.pattern, angle, spacing: settings.spacing };
        const lines = linesOf(och, frame, hatch, settings);
        made.push(lines);
        return { face, lines, hatch };
    });

export const hatchedSectionOf = (och: OccHelper, shapes: readonly TopoDS_Shape[], frame: Inputs.Base.Frame, settings: HatchSettings): Models.OCCT.HatchedSection<TopoDS_Shape> => {
    const toGround = och.base.frame.matrixFromTo({ from: frame, to: GROUND_FRAME });
    const cuts: CutShape[] = [];
    const made: TopoDS_Compound[] = [];
    try {
        shapes.forEach(shape => { cuts.push(cutOf(och, shape, frame, toGround, settings)); });
        const angles = anglesOf(och, cuts, settings);
        return { frame, shapes: cuts.map((cut, at) => ({ angle: angles[at]!, caps: capsOf(och, cut, frame, angles[at]!, settings, made) })) };
    } catch (error) {
        cuts.forEach(cut => { cut.faces.forEach(release); });
        made.forEach(release);
        throw error;
    } finally {
        cuts.forEach(cut => { release(cut.caps); });
    }
};
