import type { Base } from "@bitbybit-dev/base";
import { arcThroughThreePoints, pointsOnArc } from "@bitbybit-dev/base/lib/api/services/helpers/arcs";
import { axisPlacementFrame, directionOf, numbersOf, pointOf } from "../build/placement";
import { radiansPerUnit } from "../build/project";
import type { ModelSnapshot } from "../model/snapshot";
import type { IfcValue } from "../step/step-types";
import { isEnumeration, isList, isReference, isTyped } from "../step/values";
import { UnsupportedGeometryError } from "./errors";
import type { ConicFrame, CurveTrim } from "./geometry-types";

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

function withoutRepeats(points: readonly Base.Point2[]): Base.Point2[] {
    const extent = points.reduce((largest, [x, y]) => Math.max(largest, Math.abs(x), Math.abs(y)), 0);
    const tolerance = extent * DUPLICATE_RATIO;
    const same = (a: Base.Point2, b: Base.Point2): boolean => Math.abs(a[0] - b[0]) <= tolerance && Math.abs(a[1] - b[1]) <= tolerance;
    const kept = points.filter((point, at) => at === 0 || !same(point, points[at - 1]!));
    return kept.length > 1 && same(kept[0]!, kept[kept.length - 1]!) ? kept.slice(0, -1) : kept;
}

function arcSegments(sweep: number): number {
    return Math.max(MIN_ARC_SEGMENTS, Math.ceil(Math.abs(sweep) / (FULL_TURN / SEGMENTS_PER_TURN) - SEGMENT_SLACK));
}

function sweepBetween(start: number, end: number, counterClockwise: boolean): number {
    const ahead = (((end - start) % FULL_TURN) + FULL_TURN) % FULL_TURN;
    if (ahead < ANGLE_TOLERANCE || FULL_TURN - ahead < ANGLE_TOLERANCE) {
        return counterClockwise ? FULL_TURN : -FULL_TURN;
    }
    return counterClockwise ? ahead : ahead - FULL_TURN;
}

function threePointArc(start: Base.Point2, middle: Base.Point2, end: Base.Point2): Base.Point2[] {
    const from: Base.Point3 = [start[0], start[1], 0];
    const to: Base.Point3 = [end[0], end[1], 0];
    const arc = arcThroughThreePoints(from, [middle[0], middle[1], 0], to);
    return arc ? pointsOnArc(arc, from, to, arcSegments(arc.sweep)).map(([x, y]) => [x, y]) : [start, middle, end];
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
    private angleUnit: number | undefined;

    constructor(model: ModelSnapshot) {
        this.model = model;
    }

    outline(curve: number): Base.Point2[] {
        return withoutRepeats(this.path(curve, 0));
    }

    private get radiansPerUnit(): number {
        this.angleUnit ??= radiansPerUnit(this.model);
        return this.angleUnit;
    }

    private path(curve: number, depth: number): Base.Point2[] {
        if (depth > MAX_CURVE_DEPTH) {
            throw new UnsupportedGeometryError(`#${curve} nests curves more than ${MAX_CURVE_DEPTH} deep, or through itself`);
        }
        const type = this.model.entity(curve).type;
        switch (type) {
            case "IfcPolyline": {
                const points = this.model.attribute(curve, "Points");
                return (isList(points) ? points : []).map((point) => {
                    const [x, y] = pointOf(this.model, point);
                    return [x, y];
                });
            }
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
            default:
                throw new UnsupportedGeometryError(`An ${type} outline is not supported yet`);
        }
    }

    private indexed(curve: number): Base.Point2[] {
        const list = this.model.attribute(curve, "Points");
        if (!isReference(list)) {
            throw new UnsupportedGeometryError(`#${curve} has no points`);
        }
        const coordinates = this.model.attribute(list.ref, "CoordList");
        const all: Base.Point2[] = (isList(coordinates) ? coordinates : []).map((item, index) => {
            const numbers = numbersOf(item, `#${list.ref} point ${index}`);
            return [numbers[0] ?? 0, numbers[1] ?? 0];
        });
        const segments = this.model.attribute(curve, "Segments");
        if (!isList(segments)) {
            return all;
        }
        const pointAt = (index: number): Base.Point2 => {
            const point = all[index - 1];
            if (!point) {
                throw new UnsupportedGeometryError(`#${curve} names point ${index}, which its list does not hold`);
            }
            return point;
        };
        const points: Base.Point2[] = [];
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

    private composite(curve: number, depth: number): Base.Point2[] {
        const segments = this.model.attribute(curve, "Segments");
        const points: Base.Point2[] = [];
        for (const segment of isList(segments) ? segments : []) {
            if (!isReference(segment)) {
                throw new UnsupportedGeometryError(`#${curve} has a segment that is not a reference`);
            }
            const parent = this.model.attribute(segment.ref, "ParentCurve");
            if (!isReference(parent)) {
                throw new UnsupportedGeometryError(`#${segment.ref} has no parent curve`);
            }
            const path = this.path(parent.ref, depth + 1);
            points.push(...(this.model.attribute(segment.ref, "SameSense") === false ? [...path].reverse() : path));
        }
        if (!points.length) {
            throw new UnsupportedGeometryError(`#${curve} has no segments`);
        }
        return points;
    }

    private trimOf(value: IfcValue, curve: number, name: string): CurveTrim {
        let point: Base.Point2 | undefined;
        let parameter: number | undefined;
        for (const item of isList(value) ? value : []) {
            if (isReference(item)) {
                const [x, y] = pointOf(this.model, item);
                point = [x, y];
            } else if (isTyped(item) && item.type.toUpperCase() === PARAMETER_VALUE && typeof item.value === "number" && Number.isFinite(item.value)) {
                parameter = item.value;
            }
        }
        if (point === undefined && parameter === undefined) {
            throw new UnsupportedGeometryError(`#${curve} has no ${name} it can be trimmed at`);
        }
        return { point, parameter };
    }

    private trimmed(curve: number): Base.Point2[] {
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
        const exact = (trim: CurveTrim): Base.Point2 | undefined => (byParameter && trim.parameter !== undefined ? undefined : trim.point);
        return this.conic(basis.ref, start, sweepBetween(start, end, forward), exact(first), exact(second));
    }

    private linePoint(line: number, trim: CurveTrim, byParameter: boolean): Base.Point2 {
        if (trim.point !== undefined && !(byParameter && trim.parameter !== undefined)) {
            return trim.point;
        }
        const [x, y] = pointOf(this.model, this.model.attribute(line, "Pnt"));
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
        return [x + dx * step, y + dy * step];
    }

    private conicAngle(conic: number, trim: CurveTrim, byParameter: boolean): number {
        if (trim.parameter !== undefined && (byParameter || trim.point === undefined)) {
            return trim.parameter * this.radiansPerUnit;
        }
        const { origin, x, y, radii } = this.conicFrame(conic);
        const dx = trim.point![0] - origin[0];
        const dy = trim.point![1] - origin[1];
        return Math.atan2((dx * y[0] + dy * y[1]) / radii[1], (dx * x[0] + dy * x[1]) / radii[0]);
    }

    private conicFrame(conic: number): ConicFrame {
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

    private conic(conic: number, start: number, sweep: number, from: Base.Point2 | undefined, to: Base.Point2 | undefined): Base.Point2[] {
        const { origin, x, y, radii } = this.conicFrame(conic);
        const segments = arcSegments(sweep);
        const points: Base.Point2[] = [];
        for (let step = 0; step <= segments; step++) {
            const angle = start + sweep * step / segments;
            const along = radii[0] * Math.cos(angle);
            const across = radii[1] * Math.sin(angle);
            points.push([origin[0] + along * x[0] + across * y[0], origin[1] + along * x[1] + across * y[1]]);
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
