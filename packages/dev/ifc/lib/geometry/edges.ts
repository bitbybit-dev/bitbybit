import type { Base } from "@bitbybit-dev/base";
import { knotDomain, nurbsCurvePoint } from "@bitbybit-dev/base/lib/api/services/helpers/nurbs";
import { add3, dot3, length3, scale3, subtract3 } from "@bitbybit-dev/base/lib/api/services/helpers/vectors";
import { numbersOf } from "../build/placement";
import type { ModelSnapshot } from "../model/snapshot";
import type { IfcValue } from "../step/step-types";
import { isReference } from "../step/values";
import { arcSegments, sweepBetween, type CurveSampler } from "./curves";
import { UnsupportedGeometryError } from "./errors";
import type { BSplineCurve } from "./geometry-types";
import { referencesIn } from "./references";
import { CLOSED_EDGE_RATIO, GOLDEN_SECTION, PARAMETER_SEARCH_STEPS, PARAMETER_SEARCH_TOLERANCE, WEIGHTED_POINTS_RATIO } from "./edges.constants";

const CURVE_ON_SURFACE: ReadonlySet<string> = new Set(["IfcSurfaceCurve", "IfcIntersectionCurve", "IfcSeamCurve"]);
const SPLINES: ReadonlySet<string> = new Set(["IfcBSplineCurveWithKnots", "IfcRationalBSplineCurveWithKnots"]);

function distance(a: Base.Point3, b: Base.Point3): number {
    return length3(subtract3(a, b));
}

function nearestParameter(spline: BSplineCurve, point: Base.Point3, from: number, to: number): number {
    const at = (t: number): number => distance(nurbsCurvePoint(spline.degree, spline.points, spline.weights, spline.knots, t), point);
    let best = from;
    let bestDistance = Infinity;
    for (let step = 0; step <= PARAMETER_SEARCH_STEPS; step++) {
        const t = from + ((to - from) * step) / PARAMETER_SEARCH_STEPS;
        const d = at(t);
        if (d < bestDistance) {
            best = t;
            bestDistance = d;
        }
    }
    const width = (to - from) / PARAMETER_SEARCH_STEPS;
    let low = Math.max(from, best - width);
    let high = Math.min(to, best + width);
    while (high - low > PARAMETER_SEARCH_TOLERANCE * (to - from)) {
        const left = high - GOLDEN_SECTION * (high - low);
        const right = low + GOLDEN_SECTION * (high - low);
        if (at(left) < at(right)) {
            high = right;
        } else {
            low = left;
        }
    }
    return (low + high) / 2;
}

export function dividedByWeights(spline: BSplineCurve): BSplineCurve {
    const weights = spline.weights ?? [];
    return { ...spline, points: spline.points.map((point, at) => scale3(point, 1 / (weights[at] ?? 1))) };
}

export class EdgeSampler {
    private readonly model: ModelSnapshot;
    private readonly curves: CurveSampler;
    private readonly sampled = new Map<number, Base.Point3[]>();

    constructor(model: ModelSnapshot, curves: CurveSampler) {
        this.model = model;
        this.curves = curves;
    }

    loop(loop: number): Base.Point3[] {
        const type = this.model.typeOf(loop);
        if (type === "IfcPolyLoop") {
            return this.references(loop, "Polygon").map((point) => this.pointAt(point));
        }
        if (type !== "IfcEdgeLoop") {
            throw new UnsupportedGeometryError(`A face bounded by an ${type ?? `unknown #${loop}`} is not supported yet`);
        }
        const points: Base.Point3[] = [];
        for (const oriented of this.references(loop, "EdgeList")) {
            const element = this.value(oriented, "EdgeElement");
            if (!isReference(element)) {
                throw new UnsupportedGeometryError(`#${oriented} has no edge`);
            }
            const along = this.edge(element.ref);
            const run = this.value(oriented, "Orientation") === false ? [...along].reverse() : along;
            points.push(...run.slice(0, -1));
        }
        return points;
    }

    private edge(edge: number): Base.Point3[] {
        const known = this.sampled.get(edge);
        if (known) {
            return known;
        }
        const start = this.vertex(this.value(edge, "EdgeStart"), edge);
        const end = this.vertex(this.value(edge, "EdgeEnd"), edge);
        const geometry = this.value(edge, "EdgeGeometry");
        const points = isReference(geometry) ? this.along(geometry.ref, start, end, this.value(edge, "SameSense") !== false) : [start, end];
        const exact = [start, ...points.slice(1, -1), end];
        this.sampled.set(edge, exact);
        return exact;
    }

    private along(curve: number, start: Base.Point3, end: Base.Point3, sameSense: boolean): Base.Point3[] {
        const type = this.model.entity(curve).type;
        if (type === "IfcLine") {
            return [start, end];
        }
        if (CURVE_ON_SURFACE.has(type)) {
            const curve3 = this.model.attribute(curve, "Curve3D");
            if (!isReference(curve3)) {
                throw new UnsupportedGeometryError(`#${curve} has no curve in space`);
            }
            return this.along(curve3.ref, start, end, sameSense);
        }
        if (type === "IfcCircle" || type === "IfcEllipse") {
            return this.conic(curve, start, end, sameSense);
        }
        if (SPLINES.has(type)) {
            return this.spline(curve, start, end, sameSense);
        }
        const path = this.curves.path(curve);
        const forward = distance(path[0]!, start) + distance(path[path.length - 1]!, end) <= distance(path[0]!, end) + distance(path[path.length - 1]!, start);
        return forward ? path : [...path].reverse();
    }

    private conic(conic: number, start: Base.Point3, end: Base.Point3, sameSense: boolean): Base.Point3[] {
        const { origin, x, y, radii } = this.curves.conicFrame(conic);
        const angleOf = (point: Base.Point3): number => {
            const offset = subtract3(point, origin);
            return Math.atan2(dot3(offset, y) / radii[1], dot3(offset, x) / radii[0]);
        };
        const first = angleOf(start);
        const sweep = sweepBetween(first, angleOf(end), sameSense);
        const segments = arcSegments(sweep);
        return Array.from({ length: segments + 1 }, (_, step) => {
            const angle = first + (sweep * step) / segments;
            return add3(origin, add3(scale3(x, radii[0] * Math.cos(angle)), scale3(y, radii[1] * Math.sin(angle))));
        });
    }

    private spline(curve: number, start: Base.Point3, end: Base.Point3, sameSense: boolean): Base.Point3[] {
        const spline = this.meetingVertices(this.curves.bspline(curve), start, end);
        const [from, to] = knotDomain(spline.degree, spline.knots);
        const closed = distance(start, end) <= CLOSED_EDGE_RATIO * Math.max(1, length3(start));
        if (closed) {
            return this.curves.splinePoints(spline, sameSense ? from : to, sameSense ? to : from);
        }
        return this.curves.splinePoints(spline, nearestParameter(spline, start, from, to), nearestParameter(spline, end, from, to));
    }

    private meetingVertices(spline: BSplineCurve, start: Base.Point3, end: Base.Point3): BSplineCurve {
        if (spline.weights === undefined) {
            return spline;
        }
        const reach = Math.max(1, length3(start), length3(end)) * WEIGHTED_POINTS_RATIO;
        const misses = (candidate: BSplineCurve): number => {
            const [from, to] = knotDomain(candidate.degree, candidate.knots);
            const [first, last] = [from, to].map((t) => nurbsCurvePoint(candidate.degree, candidate.points, candidate.weights, candidate.knots, t));
            return Math.min(distance(first!, start) + distance(last!, end), distance(first!, end) + distance(last!, start));
        };
        if (misses(spline) <= reach) {
            return spline;
        }
        const divided = dividedByWeights(spline);
        return misses(divided) <= reach ? divided : spline;
    }

    private vertex(value: IfcValue, edge: number): Base.Point3 {
        const geometry = isReference(value) ? this.value(value.ref, "VertexGeometry") : null;
        if (!isReference(geometry)) {
            throw new UnsupportedGeometryError(`#${edge} has a vertex without a point`);
        }
        return this.pointAt(geometry.ref);
    }

    private pointAt(point: number): Base.Point3 {
        const coordinates = numbersOf(this.value(point, "Coordinates"), `#${point} Coordinates`);
        return [coordinates[0] ?? 0, coordinates[1] ?? 0, coordinates[2] ?? 0];
    }

    private value(id: number, name: string): IfcValue {
        return this.model.valueOf(this.model.peek(id), name);
    }

    private references(id: number, name: string): readonly number[] {
        return referencesIn(this.model, id, name);
    }
}
