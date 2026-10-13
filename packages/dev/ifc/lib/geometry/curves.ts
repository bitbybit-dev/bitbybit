import type { Base } from "@bitbybit-dev/base";
import { arcThroughThreePoints, pointsOnArc } from "@bitbybit-dev/base/lib/api/services/helpers/arcs";
import { pathLength3 } from "@bitbybit-dev/base/lib/api/services/helpers/paths";
import { pointToLocal, squareFrame, type FrameAxes } from "@bitbybit-dev/base/lib/api/services/helpers/frame-axes";
import { expandedKnots, knotDomain, nurbsCurvePoint } from "@bitbybit-dev/base/lib/api/services/helpers/nurbs";
import { newellNormal } from "@bitbybit-dev/base/lib/api/services/helpers/triangulation";
import { add3, dot3, scale3, subtract3 } from "@bitbybit-dev/base/lib/api/services/helpers/vectors";
import { axisPlacementFrame, directionOf, numbersOf, pointOf } from "../build/placement";
import { radiansPerUnit } from "../build/project";
import type { ModelSnapshot } from "../model/snapshot";
import type { IfcValue } from "../step/step-types";
import { isEnumeration, isList, isReference, isTyped } from "../step/values";
import { UnsupportedGeometryError } from "./errors";
import type { BSplineCurve, ConicFrame, CurveTrim } from "./geometry-types";

const FULL_TURN = 2 * Math.PI;
const SEGMENTS_PER_TURN = 32;
const MIN_ARC_SEGMENTS = 2;
const MAX_CURVE_DEPTH = 64;
const DUPLICATE_RATIO = 1e-9;
const ANGLE_TOLERANCE = 1e-9;
const SEGMENT_SLACK = 1e-9;
const ARC_POINTS = 3;
const ARC_INDEX = "IFCARCINDEX";
const PARAMETER_VALUE = "IFCPARAMETERVALUE";
const PLANE_RATIO = 1e-6;
const SEGMENTS_PER_SPAN = 8;
const MAX_SPLINE_SEGMENTS = 512;

function withoutRepeats(points: readonly Base.Point2[]): Base.Point2[] {
    const extent = points.reduce((largest, [x, y]) => Math.max(largest, Math.abs(x), Math.abs(y)), 0);
    const tolerance = extent * DUPLICATE_RATIO;
    const same = (a: Base.Point2, b: Base.Point2): boolean => Math.abs(a[0] - b[0]) <= tolerance && Math.abs(a[1] - b[1]) <= tolerance;
    const kept = points.filter((point, at) => at === 0 || !same(point, points[at - 1]!));
    return kept.length > 1 && same(kept[0]!, kept[kept.length - 1]!) ? kept.slice(0, -1) : kept;
}

function withoutRepeatedPoints(points: readonly Base.Point3[]): Base.Point3[] {
    const extent = points.reduce((largest, point) => Math.max(largest, ...point.map(Math.abs)), 0);
    const tolerance = extent * DUPLICATE_RATIO;
    return points.filter((point, at) => at === 0 || point.some((value, axis) => Math.abs(value - points[at - 1]![axis]!) > tolerance));
}

export function arcSegments(sweep: number): number {
    return Math.max(MIN_ARC_SEGMENTS, Math.ceil(Math.abs(sweep) / (FULL_TURN / SEGMENTS_PER_TURN) - SEGMENT_SLACK));
}

export function sweepBetween(start: number, end: number, counterClockwise: boolean): number {
    const ahead = (((end - start) % FULL_TURN) + FULL_TURN) % FULL_TURN;
    if (ahead < ANGLE_TOLERANCE || FULL_TURN - ahead < ANGLE_TOLERANCE) {
        return counterClockwise ? FULL_TURN : -FULL_TURN;
    }
    return counterClockwise ? ahead : ahead - FULL_TURN;
}

function threePointArc(start: Base.Point3, middle: Base.Point3, end: Base.Point3): Base.Point3[] {
    const arc = arcThroughThreePoints(start, middle, end);
    return arc ? pointsOnArc(arc, start, end, arcSegments(arc.sweep)) : [start, middle, end];
}

function indexList(value: IfcValue): readonly number[] {
    const inner = isTyped(value) ? value.value : value;
    if (!isList(inner) || !inner.every((item): item is number => typeof item === "number" && Number.isSafeInteger(item))) {
        throw new UnsupportedGeometryError("A curve segment is not a list of point indices");
    }
    return inner;
}

export class CurveSampler {
    private readonly model: ModelSnapshot;
    private readonly density: number;
    private angleUnit: number | undefined;

    constructor(model: ModelSnapshot, density = 1) {
        this.model = model;
        this.density = density;
    }

    outline(curve: number, plane?: FrameAxes): Base.Point2[] {
        return withoutRepeats(plane === undefined ? this.sampled(curve, 0).map(([x, y]) => [x, y]) : this.polylineIn(curve, plane));
    }

    path(curve: number): Base.Point3[] {
        return withoutRepeatedPoints(this.sampled(curve, 0));
    }

    endTangents(curve: number, depth = 0): readonly [Base.Vector3 | undefined, Base.Vector3 | undefined] {
        if (depth > MAX_CURVE_DEPTH) {
            return [undefined, undefined];
        }
        const type = this.model.entity(curve).type;
        if (type === "IfcCircle" || type === "IfcEllipse") {
            const tangent = this.conicTangent(curve, 0, 1);
            return [tangent, tangent];
        }
        if (type === "IfcCompositeCurve" || type === "IfcCompositeCurveOnSurface") {
            const segments = this.model.attribute(curve, "Segments");
            const list = (isList(segments) ? segments : []).filter(isReference);
            const ends = (segment: number | undefined, last: boolean): Base.Vector3 | undefined => {
                const parent = segment === undefined ? null : this.model.attribute(segment, "ParentCurve");
                if (!isReference(parent)) {
                    return undefined;
                }
                const reversed = this.model.attribute(segment!, "SameSense") === false;
                const [start, end] = this.endTangents(parent.ref, depth + 1);
                const chosen = last !== reversed ? end : start;
                return chosen && reversed ? scale3(chosen, -1) : chosen;
            };
            return [ends(list[0]?.ref, false), ends(list[list.length - 1]?.ref, true)];
        }
        if (type !== "IfcTrimmedCurve") {
            return [undefined, undefined];
        }
        const basis = this.model.attribute(curve, "BasisCurve");
        if (!isReference(basis) || !["IfcCircle", "IfcEllipse"].includes(this.model.entity(basis.ref).type)) {
            return [undefined, undefined];
        }
        const preference = this.model.attribute(curve, "MasterRepresentation");
        const byParameter = isEnumeration(preference) && preference.enum === "PARAMETER";
        const first = this.conicAngle(basis.ref, this.trimOf(this.model.attribute(curve, "Trim1"), curve, "Trim1"), byParameter);
        const second = this.conicAngle(basis.ref, this.trimOf(this.model.attribute(curve, "Trim2"), curve, "Trim2"), byParameter);
        const sweep = sweepBetween(first, second, this.model.attribute(curve, "SenseAgreement") !== false);
        return [this.conicTangent(basis.ref, first, Math.sign(sweep)), this.conicTangent(basis.ref, first + sweep, Math.sign(sweep))];
    }

    parameterSpan(curve: number): number | undefined {
        const type = this.model.entity(curve).type;
        if (type === "IfcPolyline") {
            return Math.max(0, this.polylinePoints(curve).length - 1);
        }
        if (type !== "IfcTrimmedCurve") {
            return undefined;
        }
        const basis = this.model.attribute(curve, "BasisCurve");
        const first = this.trimOf(this.model.attribute(curve, "Trim1"), curve, "Trim1");
        const second = this.trimOf(this.model.attribute(curve, "Trim2"), curve, "Trim2");
        if (!isReference(basis) || first.parameter === undefined || second.parameter === undefined) {
            return undefined;
        }
        const basisType = this.model.entity(basis.ref).type;
        if (basisType === "IfcLine") {
            return Math.abs(second.parameter - first.parameter);
        }
        if (basisType !== "IfcCircle" && basisType !== "IfcEllipse") {
            return undefined;
        }
        const forward = this.model.attribute(curve, "SenseAgreement") !== false;
        const sweep = sweepBetween(first.parameter * this.radiansPerUnit, second.parameter * this.radiansPerUnit, forward);
        return Math.abs(sweep) / this.radiansPerUnit;
    }

    lengthSpan(curve: number): number | undefined {
        const type = this.model.entity(curve).type;
        if (type === "IfcPolyline") {
            return pathLength3(this.polylinePoints(curve));
        }
        const basis = type === "IfcTrimmedCurve" ? this.model.attribute(curve, "BasisCurve") : null;
        if (!isReference(basis)) {
            return undefined;
        }
        const basisType = this.model.entity(basis.ref).type;
        if (basisType === "IfcLine") {
            return pathLength3(this.trimmed(curve));
        }
        const radius = basisType === "IfcCircle" ? this.model.attribute(basis.ref, "Radius") : null;
        const turn = this.parameterSpan(curve);
        return typeof radius === "number" && turn !== undefined ? radius * turn * this.radiansPerUnit : undefined;
    }

    planeOf(curve: number): FrameAxes | undefined {
        if (this.model.entity(curve).type !== "IfcPolyline") {
            return undefined;
        }
        const points = this.polylinePoints(curve);
        if (points.every((point) => point[2] === 0)) {
            return undefined;
        }
        const plane = points.length < ARC_POINTS ? "normal" : squareFrame(points[0]!, newellNormal(points.flat(), points.map((_, at) => at)), subtract3(points[1]!, points[0]!));
        if (typeof plane === "string") {
            throw new UnsupportedGeometryError(`#${curve} is an outline with no area`);
        }
        const extent = points.reduce((largest, point) => Math.max(largest, ...point.map((value, axis) => Math.abs(value - points[0]![axis]!))), 0);
        if (points.some((point) => Math.abs(pointToLocal(plane, point)[2]) > extent * PLANE_RATIO)) {
            throw new UnsupportedGeometryError(`#${curve} is an outline whose points do not lie in one plane`);
        }
        return plane;
    }

    private get radiansPerUnit(): number {
        this.angleUnit ??= radiansPerUnit(this.model);
        return this.angleUnit;
    }

    private sampled(curve: number, depth: number): Base.Point3[] {
        if (depth > MAX_CURVE_DEPTH) {
            throw new UnsupportedGeometryError(`#${curve} nests curves more than ${MAX_CURVE_DEPTH} deep, or through itself`);
        }
        const type = this.model.entity(curve).type;
        switch (type) {
            case "IfcPolyline":
                return this.polylinePoints(curve);
            case "IfcIndexedPolyCurve":
                return this.indexed(curve);
            case "IfcCompositeCurve":
            case "IfcCompositeCurveOnSurface":
                return this.composite(curve, depth);
            case "IfcTrimmedCurve":
                return this.trimmed(curve);
            case "IfcCircle":
            case "IfcEllipse":
                return this.conic(curve, 0, FULL_TURN, undefined, undefined);
            case "IfcBSplineCurveWithKnots":
            case "IfcRationalBSplineCurveWithKnots": {
                const spline = this.bspline(curve);
                return this.splinePoints(spline, ...knotDomain(spline.degree, spline.knots));
            }
            default:
                throw new UnsupportedGeometryError(`An ${type} outline is not supported yet`);
        }
    }

    private polylinePoints(curve: number): Base.Point3[] {
        const points = this.model.attribute(curve, "Points");
        return (isList(points) ? points : []).map((point) => pointOf(this.model, point));
    }

    private polylineIn(curve: number, plane: FrameAxes): Base.Point2[] {
        if (this.model.entity(curve).type !== "IfcPolyline") {
            throw new UnsupportedGeometryError(`#${curve} lies outside its profile's plane, which only a polyline may`);
        }
        return this.polylinePoints(curve).map((point) => {
            const [x, y] = pointToLocal(plane, point);
            return [x, y];
        });
    }

    private indexed(curve: number): Base.Point3[] {
        const list = this.model.attribute(curve, "Points");
        if (!isReference(list)) {
            throw new UnsupportedGeometryError(`#${curve} has no points`);
        }
        const coordinates = this.model.attribute(list.ref, "CoordList");
        const all: Base.Point3[] = (isList(coordinates) ? coordinates : []).map((item, index) => {
            const numbers = numbersOf(item, `#${list.ref} point ${index}`);
            return [numbers[0] ?? 0, numbers[1] ?? 0, numbers[2] ?? 0];
        });
        const segments = this.model.attribute(curve, "Segments");
        if (!isList(segments)) {
            return all;
        }
        const pointAt = (index: number): Base.Point3 => {
            const point = all[index - 1];
            if (!point) {
                throw new UnsupportedGeometryError(`#${curve} names point ${index}, which its list does not hold`);
            }
            return point;
        };
        const points: Base.Point3[] = [];
        let last: number | undefined;
        for (const segment of segments) {
            const indices = indexList(segment);
            const named = indices.map(pointAt);
            const isArc = isTyped(segment) && segment.type.toUpperCase() === ARC_INDEX;
            if (isArc && named.length !== ARC_POINTS) {
                throw new UnsupportedGeometryError(`#${curve} has an arc through ${named.length} points, not ${ARC_POINTS}`);
            }
            const sampled = isArc ? threePointArc(named[0]!, named[1]!, named[2]!) : named;
            points.push(...(last !== undefined && last === indices[0] ? sampled.slice(1) : sampled));
            last = indices[indices.length - 1];
        }
        return points;
    }

    private composite(curve: number, depth: number): Base.Point3[] {
        const segments = this.model.attribute(curve, "Segments");
        const points: Base.Point3[] = [];
        for (const segment of isList(segments) ? segments : []) {
            if (!isReference(segment)) {
                throw new UnsupportedGeometryError(`#${curve} has a segment that is not a reference`);
            }
            const parent = this.model.attribute(segment.ref, "ParentCurve");
            if (!isReference(parent)) {
                throw new UnsupportedGeometryError(`#${segment.ref} has no parent curve`);
            }
            const path = this.sampled(parent.ref, depth + 1);
            points.push(...(this.model.attribute(segment.ref, "SameSense") === false ? [...path].reverse() : path));
        }
        if (!points.length) {
            throw new UnsupportedGeometryError(`#${curve} has no segments`);
        }
        return points;
    }

    private trimOf(value: IfcValue, curve: number, name: string): CurveTrim {
        let point: Base.Point3 | undefined;
        let parameter: number | undefined;
        for (const item of isList(value) ? value : []) {
            if (isReference(item)) {
                point = pointOf(this.model, item);
            } else if (isTyped(item) && item.type.toUpperCase() === PARAMETER_VALUE && typeof item.value === "number" && Number.isFinite(item.value)) {
                parameter = item.value;
            }
        }
        if (point === undefined && parameter === undefined) {
            throw new UnsupportedGeometryError(`#${curve} has no ${name} it can be trimmed at`);
        }
        return { point, parameter };
    }

    private trimmed(curve: number): Base.Point3[] {
        const basis = this.model.attribute(curve, "BasisCurve");
        if (!isReference(basis)) {
            throw new UnsupportedGeometryError(`#${curve} has no basis curve`);
        }
        const preference = this.model.attribute(curve, "MasterRepresentation");
        const byParameter = isEnumeration(preference) && preference.enum === "PARAMETER";
        const first = this.trimOf(this.model.attribute(curve, "Trim1"), curve, "Trim1");
        const second = this.trimOf(this.model.attribute(curve, "Trim2"), curve, "Trim2");
        const forward = this.model.attribute(curve, "SenseAgreement") !== false;
        const type = this.model.entity(basis.ref).type;
        if (type === "IfcLine") {
            return [this.linePoint(basis.ref, first, byParameter), this.linePoint(basis.ref, second, byParameter)];
        }
        if (type !== "IfcCircle" && type !== "IfcEllipse") {
            throw new UnsupportedGeometryError(`A trimmed ${type} is not supported yet`);
        }
        const start = this.conicAngle(basis.ref, first, byParameter);
        const end = this.conicAngle(basis.ref, second, byParameter);
        const exact = (trim: CurveTrim): Base.Point3 | undefined => (byParameter && trim.parameter !== undefined ? undefined : trim.point);
        return this.conic(basis.ref, start, sweepBetween(start, end, forward), exact(first), exact(second));
    }

    private linePoint(line: number, trim: CurveTrim, byParameter: boolean): Base.Point3 {
        if (trim.point !== undefined && !(byParameter && trim.parameter !== undefined)) {
            return trim.point;
        }
        const [x, y, z] = pointOf(this.model, this.model.attribute(line, "Pnt"));
        const vector = this.model.attribute(line, "Dir");
        if (!isReference(vector)) {
            throw new UnsupportedGeometryError(`#${line} has no direction`);
        }
        const [dx, dy, dz] = directionOf(this.model, this.model.attribute(vector.ref, "Orientation"), [1, 0, 0]);
        const magnitude = this.model.attribute(vector.ref, "Magnitude");
        const length = Math.hypot(dx, dy, dz);
        if (typeof magnitude !== "number" || !(length > 0)) {
            throw new UnsupportedGeometryError(`#${vector.ref} has no direction or no magnitude`);
        }
        const step = trim.parameter! * magnitude / length;
        return [x + dx * step, y + dy * step, z + dz * step];
    }

    private conicAngle(conic: number, trim: CurveTrim, byParameter: boolean): number {
        if (trim.parameter !== undefined && (byParameter || trim.point === undefined)) {
            return trim.parameter * this.radiansPerUnit;
        }
        const { origin, x, y, radii } = this.conicFrame(conic);
        const offset = subtract3(trim.point!, origin);
        return Math.atan2(dot3(offset, y) / radii[1], dot3(offset, x) / radii[0]);
    }

    conicFrame(conic: number): ConicFrame {
        const position = this.model.attribute(conic, "Position");
        if (!isReference(position)) {
            throw new UnsupportedGeometryError(`#${conic} has no position`);
        }
        const frame = axisPlacementFrame(this.model, position.ref);
        const circle = this.model.entity(conic).type === "IfcCircle";
        const first = this.model.attribute(conic, circle ? "Radius" : "SemiAxis1");
        const second = circle ? first : this.model.attribute(conic, "SemiAxis2");
        if (typeof first !== "number" || typeof second !== "number" || !(first > 0) || !(second > 0)) {
            throw new UnsupportedGeometryError(`#${conic} has no radius above zero`);
        }
        return { origin: frame.origin, x: frame.x, y: frame.y, radii: [first, second] };
    }

    bspline(curve: number): BSplineCurve {
        const degree = this.model.attribute(curve, "Degree");
        const controls = this.model.attribute(curve, "ControlPointsList");
        const multiplicities = this.model.attribute(curve, "KnotMultiplicities");
        const knots = this.model.attribute(curve, "Knots");
        const isWhole = (value: IfcValue): value is number[] => isList(value) && value.every((item) => typeof item === "number" && Number.isFinite(item));
        if (typeof degree !== "number" || !(degree >= 1) || !isList(controls) || !isWhole(multiplicities) || !isWhole(knots)) {
            throw new UnsupportedGeometryError(`#${curve} is not a B-spline curve it can read`);
        }
        const points = controls.map((point) => pointOf(this.model, point));
        const expanded = expandedKnots(knots, multiplicities);
        if (expanded.length !== points.length + degree + 1) {
            throw new UnsupportedGeometryError(`#${curve} has ${expanded.length} knots for ${points.length} control points of degree ${degree}`);
        }
        const weights = this.model.entity(curve).type === "IfcRationalBSplineCurveWithKnots" ? this.model.attribute(curve, "WeightsData") : null;
        return { degree, points, weights: isWhole(weights) ? weights : undefined, knots: expanded };
    }

    splinePoints(spline: BSplineCurve, from: number, to: number): Base.Point3[] {
        const spans = new Set(spline.knots).size - 1;
        const segments = Math.min(MAX_SPLINE_SEGMENTS * this.density, Math.max(SEGMENTS_PER_SPAN, spans * SEGMENTS_PER_SPAN * spline.degree) * this.density);
        return Array.from({ length: segments + 1 }, (_, at) => nurbsCurvePoint(spline.degree, spline.points, spline.weights, spline.knots, from + ((to - from) * at) / segments));
    }

    private conicTangent(conic: number, angle: number, sense: number): Base.Vector3 {
        const { x, y, radii } = this.conicFrame(conic);
        return scale3(add3(scale3(x, -radii[0] * Math.sin(angle)), scale3(y, radii[1] * Math.cos(angle))), sense);
    }

    private conic(conic: number, start: number, sweep: number, from: Base.Point3 | undefined, to: Base.Point3 | undefined): Base.Point3[] {
        const { origin, x, y, radii } = this.conicFrame(conic);
        const segments = arcSegments(sweep) * this.density;
        const points: Base.Point3[] = [];
        for (let step = 0; step <= segments; step++) {
            const angle = start + sweep * step / segments;
            points.push(add3(origin, add3(scale3(x, radii[0] * Math.cos(angle)), scale3(y, radii[1] * Math.sin(angle)))));
        }
        if (from) {
            points[0] = from;
        }
        if (to) {
            points[segments] = to;
        }
        return points;
    }
}
