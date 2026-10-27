import type { Base } from "@bitbybit-dev/base";
import { squareFrame, unitOf } from "@bitbybit-dev/base/lib/api/services/helpers/geometry/frame-axes";
import type { RefinedSurfaceMesh } from "@bitbybit-dev/base/lib/api/services/helpers/helper-types";
import { refinedSurfaceMesh } from "@bitbybit-dev/base/lib/api/services/helpers/curves/surface-triangulation";
import { newellNormal } from "@bitbybit-dev/base/lib/api/services/helpers/geometry/triangulation";
import { between2, cross3, distance2, dot3, length3, subtract3 } from "@bitbybit-dev/base/lib/api/services/helpers/geometry/vectors";
import { angleOfCosine } from "@bitbybit-dev/base/lib/api/services/helpers/geometry/scalars";
import type { ModelSnapshot } from "../model/snapshot";
import type { IfcValue } from "../step/step-types";
import { isList, isReference } from "../step/values";
import type { CurveSampler } from "./curves";
import type { EdgeSampler } from "./edges";
import { UnsupportedGeometryError } from "./errors";
import type { AssembledFace, BoundLoop, CutEdge, FaceLoop, ParametricSurface, PolePoint } from "./geometry-types";
import { CUT_SAMPLES, CUT_SLACK, CUT_TURN, FIT_PROBES, FIT_TOLERANCE, MIN_LOOP_POINTS, NORMAL_STEP, TRIANGLE_CORNERS } from "./surfaces.constants";
import { parametricSurface, plane } from "./surfaces";

const OUTER_BOUND = "IfcFaceOuterBound";
const FACE_SURFACE = "IfcFaceSurface";

function unwrapped(value: number, previous: number, period: number | undefined): number {
    return period === undefined ? value : value + period * Math.round((previous - value) / period);
}

function signedArea(uv: readonly Base.Point2[]): number {
    let twice = 0;
    for (let at = 0, previous = uv.length - 1; at < uv.length; previous = at++) {
        twice += uv[previous]![0] * uv[at]![1] - uv[at]![0] * uv[previous]![1];
    }
    return twice / 2;
}

function planeThrough(points: readonly Base.Point3[]): ParametricSurface {
    const normal = newellNormal(points.flat(), points.map((_, at) => at));
    const frame = squareFrame(points[0]!, normal, subtract3(points[1]!, points[0]!));
    if (typeof frame === "string") {
        throw new UnsupportedGeometryError("A face bounded by edges has no area");
    }
    return plane(frame);
}

export class AdvancedFaces {
    private readonly model: ModelSnapshot;
    private readonly curves: CurveSampler;
    private readonly edges: EdgeSampler;
    private readonly surfaces = new Map<number, ParametricSurface | undefined>();

    constructor(model: ModelSnapshot, curves: CurveSampler, edges: EdgeSampler) {
        this.model = model;
        this.curves = curves;
        this.edges = edges;
    }

    face(face: number, bounds: readonly number[]): RefinedSurfaceMesh {
        const loops = bounds.map((bound) => this.bound(bound));
        const surfaceValue = this.model.schema.isSubtypeOf(this.model.typeOf(face) ?? "", FACE_SURFACE) ? this.value(face, "FaceSurface") : null;
        const surface = isReference(surfaceValue) ? this.fitting(surfaceValue.ref, loops) : planeThrough(loops.find((loop) => loop.outer)?.points ?? loops[0]!.points);
        const sameSense = !isReference(surfaceValue) || this.value(face, "SameSense") !== false;
        const placed = loops.map((loop) => this.parameters(surface, loop));
        const { uv, positions, indices } = this.assembled(surface, placed, sameSense);
        const mesh = refinedSurfaceMesh(uv, positions, indices, (u, v) => surface.point(u, v));
        return this.oriented(mesh, surface, uv, sameSense);
    }

    private surface(surface: number): ParametricSurface {
        if (!this.surfaces.has(surface)) {
            this.surfaces.set(surface, parametricSurface(this.model, this.curves, surface));
        }
        const known = this.surfaces.get(surface);
        if (!known) {
            throw new UnsupportedGeometryError(`A face on an ${this.model.entity(surface).type} is not supported yet`);
        }
        return known;
    }

    private fitting(surface: number, loops: readonly BoundLoop[]): ParametricSurface {
        const written = this.surface(surface);
        if (this.model.entity(surface).type !== "IfcRationalBSplineSurfaceWithKnots") {
            return written;
        }
        const probes = loops.flatMap((loop) => loop.points).filter((_, at, all) => at % Math.max(1, Math.floor(all.length / FIT_PROBES)) === 0);
        const missOf = (candidate: ParametricSurface): number => Math.max(...probes.map((point) => {
            const [u, v] = candidate.parameters(point, undefined);
            return length3(subtract3(candidate.point(u, v), point));
        }));
        const reach = Math.max(1, ...probes.map(length3)) * FIT_TOLERANCE;
        const asWritten = missOf(written);
        if (asWritten <= reach) {
            return written;
        }
        const divided = parametricSurface(this.model, this.curves, surface, true);
        return divided && missOf(divided) < asWritten ? divided : written;
    }

    private bound(bound: number): BoundLoop {
        const loop = this.value(bound, "Bound");
        if (!isReference(loop)) {
            throw new UnsupportedGeometryError(`#${bound} has no loop`);
        }
        const points = this.edges.loop(loop.ref);
        if (points.length < MIN_LOOP_POINTS) {
            throw new UnsupportedGeometryError(`#${bound} bounds no area`);
        }
        return { points: this.value(bound, "Orientation") === false ? [...points].reverse() : points, uv: [], winding: [0, 0], outer: this.model.schema.isSubtypeOf(this.model.peek(bound).type, OUTER_BOUND) };
    }

    private parameters(surface: ParametricSurface, loop: BoundLoop): BoundLoop {
        const uv: Base.Point2[] = [];
        const points: Base.Point3[] = [];
        let previous: Base.Point2 | undefined;
        let pole: PolePoint | undefined;
        const regular = loop.points.findIndex((point) => !surface.parameters(point, undefined).some(Number.isNaN));
        const turned = regular > 0 ? [...loop.points.slice(regular), ...loop.points.slice(0, regular)] : loop.points;
        turned.forEach((point) => {
            const [u, v] = surface.parameters(point, previous);
            const undefinedAxis = Number.isNaN(u) ? 0 : Number.isNaN(v) ? 1 : -1;
            if (undefinedAxis >= 0 && previous) {
                const arrival: Base.Point2 = undefinedAxis === 0 ? [previous[0], v] : [u, previous[1]];
                pole ??= { axis: undefinedAxis, at: uv.length };
                uv.push(arrival, arrival);
                points.push(point, point);
                previous = arrival;
                return;
            }
            const placed: Base.Point2 = previous ? [unwrapped(u, previous[0], surface.periods[0]), unwrapped(v, previous[1], surface.periods[1])] : [u, v];
            if (pole && uv.length === pole.at + 2) {
                const departure: Base.Point2 = pole.axis === 0 ? [placed[0], uv[pole.at]![1]] : [uv[pole.at]![0], placed[1]];
                uv[pole.at + 1] = departure;
            }
            uv.push(placed);
            points.push(point);
            previous = placed;
        });
        if (pole) {
            this.leastWound(surface, uv, pole.axis, pole.at + 1);
        }
        const winding = [0, 1].map((axis) => this.windingOf(surface, uv, axis)) as [number, number];
        return { ...loop, points, uv, winding };
    }

    private windingOf(surface: ParametricSurface, uv: readonly Base.Point2[], axis: number): number {
        const period = surface.periods[axis];
        if (period === undefined) {
            return 0;
        }
        const first = uv[0]!;
        const last = uv[uv.length - 1]!;
        return Math.round((unwrapped(first[axis]!, last[axis]!, period) - first[axis]!) / period);
    }

    private leastWound(surface: ParametricSurface, uv: Base.Point2[], axis: number, from: number): void {
        const period = surface.periods[axis];
        const winding = this.windingOf(surface, uv, axis);
        if (period === undefined || winding === 0) {
            return;
        }
        for (let at = from; at < uv.length; at++) {
            const point = uv[at]!;
            uv[at] = axis === 0 ? [point[0] - winding * period, point[1]] : [point[0], point[1] - winding * period];
        }
    }

    private assembled(surface: ParametricSurface, loops: readonly (BoundLoop)[], sameSense: boolean): AssembledFace {
        const winding = loops.filter((loop) => loop.winding[0] !== 0 || loop.winding[1] !== 0);
        const plain = loops.filter((loop) => loop.winding[0] === 0 && loop.winding[1] === 0);
        let outer: FaceLoop;
        let holes: FaceLoop[];
        if (winding.length === 0) {
            const flagged = plain.findIndex((loop) => loop.outer);
            const largest = plain.map((loop) => Math.abs(signedArea(loop.uv))).reduce((best, area, at, areas) => (area > areas[best]! ? at : best), 0);
            const index = flagged >= 0 ? flagged : largest;
            outer = plain[index]!;
            holes = plain.filter((_, at) => at !== index);
        } else if (winding.length === 2) {
            outer = this.stitched(surface, winding[0]!, winding[1]!);
            holes = plain;
        } else if (winding.length === 1) {
            outer = this.closedAtPole(surface, winding[0]!, sameSense);
            holes = plain;
        } else {
            throw new UnsupportedGeometryError(`A face whose ${winding.length} loops wrap around its surface is not supported yet`);
        }
        const uv: Base.Point2[] = [];
        const positions: Base.Point3[] = [];
        const indices = [outer, ...holes.map((hole) => this.shiftedInto(surface, hole, outer))].map((loop) => loop.uv.map((point, at) => {
            uv.push(point);
            positions.push(loop.points[at]!);
            return uv.length - 1;
        }));
        return { uv, positions, indices };
    }

    private shiftedInto(surface: ParametricSurface, hole: FaceLoop, outer: FaceLoop): FaceLoop {
        const shift = [0, 1].map((axis) => {
            const period = surface.periods[axis];
            if (period === undefined) {
                return 0;
            }
            const low = Math.min(...outer.uv.map((point) => point[axis]!));
            const mean = hole.uv.reduce((sum, point) => sum + point[axis]!, 0) / hole.uv.length;
            return -period * Math.floor((mean - low) / period);
        });
        return { ...hole, uv: hole.uv.map(([u, v]) => [u + shift[0]!, v + shift[1]!]) };
    }

    private stitched(surface: ParametricSurface, first: FaceLoop, second: FaceLoop): FaceLoop {
        const axis = first.winding[0] !== 0 ? 0 : 1;
        const period = surface.periods[axis]!;
        if (second.winding[axis] !== -first.winding[axis] || first.winding[1 - axis] !== 0 || second.winding[1 - axis] !== 0) {
            throw new UnsupportedGeometryError("A face whose loops wrap around its surface the same way is not supported yet");
        }
        const shift = (point: Base.Point2, by: number): Base.Point2 => (axis === 0 ? [point[0] + by, point[1]] : [point[0], point[1] + by]);
        const start = first.uv[0]!;
        const closing = shift(start, first.winding[axis] * period);
        const distances = second.uv.map((point) => {
            const aligned = unwrapped(point[axis], closing[axis], period);
            return distance2([aligned, point[1 - axis]!], [closing[axis], closing[1 - axis]!]);
        });
        const join = distances.indexOf(Math.min(...distances));
        const turned = [...second.uv.slice(join), ...second.uv.slice(0, join)];
        const turnedPoints = [...second.points.slice(join), ...second.points.slice(0, join)];
        const run: Base.Point2[] = [];
        for (const point of turned) {
            const previous = run[run.length - 1] ?? closing;
            run.push(axis === 0 ? [unwrapped(point[0], previous[0], period), point[1]] : [point[0], unwrapped(point[1], previous[1], period)]);
        }
        const back = shift(run[0]!, second.winding[axis] * period);
        const cut = this.across(surface, closing, run[0]!);
        const offset = second.winding[axis] * period;
        const cutBack = [...cut.uv].reverse().map((point) => shift(point, offset));
        return {
            points: [...first.points, first.points[0]!, ...cut.points, ...turnedPoints, turnedPoints[0]!, ...[...cut.points].reverse()],
            uv: [...first.uv, closing, ...cut.uv, ...run, back, ...cutBack],
            winding: [0, 0],
        };
    }

    private closedAtPole(surface: ParametricSurface, loop: FaceLoop, sameSense: boolean): FaceLoop {
        const axis = loop.winding[0] !== 0 ? 0 : 1;
        const across = 1 - axis;
        const direction = Math.sign(loop.winding[axis]);
        const left = axis === 0 ? direction : -direction;
        const pole = surface.pole(across, sameSense ? left : -left);
        if (pole === undefined) {
            throw new UnsupportedGeometryError("A face that wraps around its surface without closing over a pole is not supported yet");
        }
        const period = surface.periods[axis]!;
        const start = loop.uv[0]!;
        const end: Base.Point2 = axis === 0 ? [start[0] + loop.winding[0] * period, start[1]] : [start[0], start[1] + loop.winding[1] * period];
        const atPole = (point: Base.Point2): Base.Point2 => (axis === 0 ? [point[0], pole] : [pole, point[1]]);
        const poleUv = atPole(start);
        const polePoint = surface.point(poleUv[0], poleUv[1]);
        const up = this.across(surface, end, atPole(end));
        const turn = loop.winding[axis] * period;
        const down = [...up.uv].reverse().map(([u, v]): Base.Point2 => (axis === 0 ? [u - turn, v] : [u, v - turn]));
        return {
            points: [...loop.points, loop.points[0]!, ...up.points, polePoint, polePoint, ...[...up.points].reverse()],
            uv: [...loop.uv, end, ...up.uv, atPole(end), poleUv, ...down],
            winding: [0, 0],
        };
    }

    private across(surface: ParametricSurface, from: Base.Point2, to: Base.Point2): CutEdge {
        const at = (t: number): Base.Point2 => between2(from, to, t);
        let turned = 0;
        let previous: Base.Vector3 | undefined;
        for (let step = 0; step <= CUT_SAMPLES; step++) {
            const unit = unitOf(this.surfaceNormal(surface, at(step / CUT_SAMPLES)));
            if (unit === undefined) {
                continue;
            }
            if (previous) {
                turned += angleOfCosine(dot3(previous, unit));
            }
            previous = unit;
        }
        const segments = Math.min(CUT_SAMPLES, Math.max(1, Math.ceil(turned / CUT_TURN - CUT_SLACK)));
        const uv = Array.from({ length: segments - 1 }, (_, step) => at((step + 1) / segments));
        return { uv, points: uv.map(([u, v]) => surface.point(u, v)) };
    }

    private oriented(mesh: RefinedSurfaceMesh, surface: ParametricSurface, uv: readonly Base.Point2[], sameSense: boolean): RefinedSurfaceMesh {
        let agreement = 0;
        for (let at = 0; at + 2 < mesh.triangles.length; at += TRIANGLE_CORNERS) {
            const [a, b, c] = [mesh.triangles[at]!, mesh.triangles[at + 1]!, mesh.triangles[at + 2]!];
            const normal = cross3(subtract3(mesh.positions[b]!, mesh.positions[a]!), subtract3(mesh.positions[c]!, mesh.positions[a]!));
            if (a < uv.length && length3(normal) > 0) {
                agreement += Math.sign(dot3(normal, this.surfaceNormal(surface, uv[a]!)));
            }
        }
        if ((agreement >= 0) === sameSense) {
            return mesh;
        }
        const triangles = [...mesh.triangles];
        for (let at = 0; at + 2 < triangles.length; at += TRIANGLE_CORNERS) {
            [triangles[at + 1], triangles[at + 2]] = [triangles[at + 2]!, triangles[at + 1]!];
        }
        return { positions: mesh.positions, triangles };
    }

    private surfaceNormal(surface: ParametricSurface, [u, v]: Base.Point2): Base.Vector3 {
        const step = NORMAL_STEP * Math.max(1, Math.abs(u), Math.abs(v));
        return cross3(subtract3(surface.point(u + step, v), surface.point(u - step, v)), subtract3(surface.point(u, v + step), surface.point(u, v - step)));
    }

    private value(id: number, name: string): IfcValue {
        return this.model.valueOf(this.model.peek(id), name);
    }
}

export function faceBounds(model: ModelSnapshot, face: number): readonly number[] {
    const known = model.referenceList(face);
    if (known && model.typeOf(face) === "IfcFace") {
        return known;
    }
    const bounds = model.valueOf(model.peek(face), "Bounds");
    return (isList(bounds) ? bounds : []).filter(isReference).map((bound) => bound.ref);
}
