import type { BitbybitOcctModule, TopoDS_Edge, TopoDS_Wire } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import type * as Inputs from "../../api/inputs";
import type { EdgeEnds, EdgeSample, StraightCorner } from "./straight-corners-types";
import { dot3, length3, subtract3 } from "@bitbybit-dev/base/lib/api/services/helpers/geometry/vectors";

type Point3 = Inputs.Base.Point3;
type Vector3 = Inputs.Base.Vector3;

const STRAIGHT_TOLERANCE = 1e-9;
const SAME_POINT_TOLERANCE = 1e-7;

function sampleEdge(occ: BitbybitOcctModule, edge: TopoDS_Edge, param: number, sign: number): EdgeSample {
    const evaluated = occ.EvaluateEdgeCurve(edge, param);
    const point = evaluated.Point;
    const tangent = evaluated.Tangent;
    const sample: EdgeSample = {
        point: [point.X(), point.Y(), point.Z()] as Point3,
        direction: [tangent.X() * sign, tangent.Y() * sign, tangent.Z() * sign] as Vector3,
    };
    point.delete();
    tangent.delete();
    evaluated.delete();
    return sample;
}

function endsOf(occ: BitbybitOcctModule, edge: TopoDS_Edge): EdgeEnds {
    const { First, Last } = occ.BRep_Tool_GetEdgeParameters(edge);
    const reversed = edge.Orientation() === occ.TopAbs_Orientation.REVERSED;
    const sign = reversed ? -1 : 1;
    const first = sampleEdge(occ, edge, First, sign);
    const last = sampleEdge(occ, edge, Last, sign);
    return reversed
        ? { end: first.point, endDirection: first.direction, startDirection: last.direction }
        : { end: last.point, endDirection: last.direction, startDirection: first.direction };
}

function continues(incoming: Vector3, outgoing: Vector3): boolean {
    const length = length3(incoming) * length3(outgoing);
    if (length === 0) {
        return false;
    }
    const cosine = dot3(incoming, outgoing) / length;
    return 1 - cosine < STRAIGHT_TOLERANCE;
}

export function straightCorners(occ: BitbybitOcctModule, wire: TopoDS_Wire): StraightCorner[] {
    const edges = occ.EdgesAlongWire(wire);
    const ends = edges.map(edge => endsOf(occ, edge));
    edges.forEach(edge => edge.delete());
    const corners = wire.Closed() ? ends.length : ends.length - 1;
    const straight: StraightCorner[] = [];
    for (let corner = 0; corner < corners; corner++) {
        const into = ends[corner]!;
        const outOf = ends[(corner + 1) % ends.length]!;
        if (continues(into.endDirection, outOf.startDirection)) {
            straight.push({ index: corner, point: into.end });
        }
    }
    return straight;
}

export function isStraightCorner(straight: readonly StraightCorner[], point: Point3): boolean {
    return straight.some(({ point: each }) => length3(subtract3(each, point)) < SAME_POINT_TOLERANCE);
}

export function withoutStraightCorners(radii: readonly number[], straight: readonly StraightCorner[]): number[] {
    const skipped = new Set(straight.map(corner => corner.index));
    return radii.map((radius, corner) => skipped.has(corner) ? 0 : radius);
}
