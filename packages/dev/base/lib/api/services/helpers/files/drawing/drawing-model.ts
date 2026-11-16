import * as Inputs from "../../../../inputs";
import { InputError } from "../../../../kernel-calls";
import { hexChannels, hexOfChannels } from "../../color/color-forms";
import { angleWithinTurn } from "../../curves/conic-arcs";
import { clampedForm, clampedUniformKnots, periodicUniformForm } from "../../curves/nurbs-forms";
import type { NurbsCurveForm } from "../../curves/nurbs-forms";
import { unitOf } from "../../geometry/frame-axes";
import { radiansOf } from "../../geometry/scalars";
import { distance3, dot3 } from "../../geometry/vectors";
import type { DrawingArc, DrawingCircle, DrawingEllipse, DrawingLine, DrawingPart, DrawingPath, DrawingPolyline, DrawingSegment, DrawingSpline } from "./drawing-types";
import {
    DEFAULT_LAYER, DEFAULT_SPLINE_DEGREE, FIRST_PRINTABLE_CODE, FORBIDDEN_LAYER_CHARACTERS, FULL_TURN_DEGREES, HIGHEST_SPLINE_DEGREE, LARGEST_NUMBER, LEAST_WEIGHT,
    PERPENDICULAR_COSINE, POINT_SIZES, SAME_POINT,
} from "./drawing.constants";
import { DXF_MAX_NAME_LENGTH } from "../dxf/dxf.constants";

type Point3 = Inputs.Base.Point3;
type Vec3 = Inputs.Base.Vector3;
type SegmentInput = Inputs.IO.DrawingPathDto["segments"][number];

const PLUS_Z: Vec3 = [0, 0, 1];
const LINE_TYPES = new Set<string>(Object.values(Inputs.IO.lineTypeEnum));

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null;

const isDrawable = (value: unknown): value is number => typeof value === "number" && Math.abs(value) < LARGEST_NUMBER;

const finiteNumber = (value: unknown, property: string): number => {
    if (!isDrawable(value)) {
        throw new InputError(`\`${property}\` must be a finite number below ${LARGEST_NUMBER} in size.`, property);
    }
    return value;
};

export const positiveNumber = (value: unknown, property: string): number => {
    const checked = finiteNumber(value, property);
    if (checked <= 0) {
        throw new InputError(`\`${property}\` must be above 0; it is ${checked}.`, property);
    }
    return checked;
};

const pointOf = (value: unknown, property: string): Point3 => {
    if (!Array.isArray(value) || !POINT_SIZES.includes(value.length) || !value.every(isDrawable)) {
        throw new InputError(`\`${property}\` must be a point of 2 or 3 finite numbers below ${LARGEST_NUMBER} in size.`, property);
    }
    return [value[0]!, value[1]!, value[2] ?? 0];
};

const directionOf = (value: unknown, property: string): Vec3 => {
    if (value === undefined) {
        return PLUS_Z;
    }
    const direction = unitOf(pointOf(value, property));
    if (direction === undefined) {
        throw new InputError(`\`${property}\` must not be a zero vector.`, property);
    }
    return direction;
};

const numbersOf = (value: unknown, property: string): number[] => {
    if (!Array.isArray(value)) {
        throw new InputError(`\`${property}\` must be a list of numbers.`, property);
    }
    return value.map((entry, at) => finiteNumber(entry, `${property}[${at}]`));
};

const lineOf = (segment: Record<string, unknown>, property: string): DrawingLine => ({
    kind: "line",
    start: pointOf(segment["start"], `${property}.start`),
    end: pointOf(segment["end"], `${property}.end`),
});

const circleOf = (segment: Record<string, unknown>, property: string): DrawingCircle => ({
    kind: "circle",
    center: pointOf(segment["center"], `${property}.center`),
    radius: positiveNumber(segment["radius"], `${property}.radius`),
    normal: directionOf(segment["normal"], `${property}.normal`),
});

const arcOf = (segment: Record<string, unknown>, property: string): DrawingArc => {
    const startDegrees = angleWithinTurn(finiteNumber(segment["startAngle"], `${property}.startAngle`), FULL_TURN_DEGREES);
    const endDegrees = angleWithinTurn(finiteNumber(segment["endAngle"], `${property}.endAngle`), FULL_TURN_DEGREES);
    const turn = angleWithinTurn(endDegrees - startDegrees, FULL_TURN_DEGREES);
    return {
        kind: "arc",
        center: pointOf(segment["center"], `${property}.center`),
        radius: positiveNumber(segment["radius"], `${property}.radius`),
        startAngle: radiansOf(startDegrees),
        endAngle: radiansOf(startDegrees + (turn === 0 ? FULL_TURN_DEGREES : turn)),
        startDegrees,
        endDegrees,
        normal: directionOf(segment["normal"], `${property}.normal`),
    };
};

const polylineOf = (segment: Record<string, unknown>, property: string): DrawingPolyline => {
    const given = segment["points"] as unknown[];
    let points = given.map((point, at) => pointOf(point, `${property}.points[${at}]`));
    if (points.length < 2) {
        throw new InputError(`\`${property}.points\` must hold at least 2 points; it holds ${points.length}.`, `${property}.points`);
    }
    let bulges = segment["bulges"] === undefined ? points.map(() => 0) : numbersOf(segment["bulges"], `${property}.bulges`);
    if (bulges.length !== points.length && bulges.length !== points.length - 1) {
        throw new InputError(`\`${property}.bulges\` must hold one bulge per point (${points.length}); it holds ${bulges.length}.`, `${property}.bulges`);
    }
    bulges = points.map((_, at) => bulges[at] ?? 0);
    let closed = segment["closed"] === true;
    if (points.length > 2 && distance3(points[0]!, points[points.length - 1]!) <= SAME_POINT) {
        points = points.slice(0, -1);
        bulges = bulges.slice(0, -1);
        closed = true;
    }
    const planar = points.every(point => point[2] === points[0]![2]);
    if (!planar && bulges.some(bulge => bulge !== 0)) {
        throw new InputError(`\`${property}\` has bulges, so its points must share one Z; a 3D polyline takes no bulges.`, `${property}.bulges`);
    }
    return { kind: "polyline", points, bulges, closed, planar };
};

const checkedKnots = (knots: number[], pointCount: number, degree: number, property: string): number[] => {
    if (knots.length !== pointCount + degree + 1) {
        throw new InputError(`\`${property}\` must hold ${pointCount + degree + 1} knots (the control points and the degree together, plus 1); it holds ${knots.length}.`, property);
    }
    if (knots.some((knot, at) => at > 0 && knot < knots[at - 1]!)) {
        throw new InputError(`\`${property}\` must never decrease.`, property);
    }
    if (!(knots[degree]! < knots[pointCount]!)) {
        throw new InputError(`\`${property}\` gives the curve no length: knot ${degree} must be below knot ${pointCount}.`, property);
    }
    let run = 0;
    for (let at = degree + 1; at < pointCount; at++) {
        run = knots[at] === knots[at - 1] ? run + 1 : 1;
        if (run > degree && knots[at]! > knots[degree]! && knots[at]! < knots[pointCount]!) {
            throw new InputError(`\`${property}\` repeats an inner knot more often than the degree, which breaks the curve apart.`, property);
        }
    }
    return knots;
};

const splineOf = (segment: Record<string, unknown>, property: string): DrawingSpline => {
    const points = (segment["controlPoints"] as unknown[]).map((point, at) => pointOf(point, `${property}.controlPoints[${at}]`));
    const degree = segment["degree"] === undefined ? DEFAULT_SPLINE_DEGREE : finiteNumber(segment["degree"], `${property}.degree`);
    if (!Number.isInteger(degree) || degree < 1 || degree > HIGHEST_SPLINE_DEGREE) {
        throw new InputError(`\`${property}.degree\` must be a whole number from 1 to ${HIGHEST_SPLINE_DEGREE}; it is ${degree}.`, `${property}.degree`);
    }
    if (points.length <= degree) {
        throw new InputError(`\`${property}.controlPoints\` must hold more points than the degree (${degree}); it holds ${points.length}.`, `${property}.controlPoints`);
    }
    const weights = segment["weights"] === undefined ? points.map(() => 1) : numbersOf(segment["weights"], `${property}.weights`);
    if (weights.length !== points.length || weights.some(weight => weight < LEAST_WEIGHT)) {
        throw new InputError(`\`${property}.weights\` must hold one weight of at least ${LEAST_WEIGHT} per control point (${points.length}).`, `${property}.weights`);
    }
    const overweight = points.findIndex((point, at) => point.some(coordinate => !isDrawable(coordinate * weights[at]!)));
    if (overweight >= 0) {
        throw new InputError(`\`${property}.weights[${overweight}]\` scales its control point to ${LARGEST_NUMBER} or more, past what a curve can be drawn from.`, `${property}.weights`);
    }
    let form: NurbsCurveForm;
    if (segment["knots"] !== undefined) {
        form = { degree, points, weights, knots: checkedKnots(numbersOf(segment["knots"], `${property}.knots`), points.length, degree, `${property}.knots`) };
    } else if (segment["closed"] === true) {
        form = periodicUniformForm(points, weights, degree);
    } else {
        form = { degree, points, weights, knots: clampedUniformKnots(points.length, degree) };
    }
    return { kind: "spline", curve: clampedForm(form) };
};

const ellipseOf = (segment: Record<string, unknown>, property: string): DrawingEllipse => {
    const majorAxis = pointOf(segment["majorAxis"], `${property}.majorAxis`);
    const majorDirection = unitOf(majorAxis);
    if (majorDirection === undefined) {
        throw new InputError(`\`${property}.majorAxis\` must not be a zero vector.`, `${property}.majorAxis`);
    }
    const ratio = positiveNumber(segment["ratio"], `${property}.ratio`);
    if (ratio > 1) {
        throw new InputError(`\`${property}.ratio\` must be at most 1, the minor axis being the shorter; it is ${ratio}.`, `${property}.ratio`);
    }
    const normal = directionOf(segment["normal"], `${property}.normal`);
    if (Math.abs(dot3(normal, majorDirection)) > PERPENDICULAR_COSINE) {
        throw new InputError(`\`${property}.majorAxis\` must lie in the ellipse's plane, perpendicular to its normal.`, `${property}.majorAxis`);
    }
    const start = segment["startParameter"] === undefined ? 0 : angleWithinTurn(finiteNumber(segment["startParameter"], `${property}.startParameter`), 2 * Math.PI);
    const end = segment["endParameter"] === undefined ? 2 * Math.PI : finiteNumber(segment["endParameter"], `${property}.endParameter`);
    const turn = angleWithinTurn(end - start, 2 * Math.PI);
    return {
        kind: "ellipse",
        center: pointOf(segment["center"], `${property}.center`),
        majorAxis,
        ratio,
        start,
        end: start + (turn === 0 ? 2 * Math.PI : turn),
        normal,
    };
};

const segmentOf = (segment: SegmentInput | undefined, property: string): DrawingSegment => {
    if (!isRecord(segment)) {
        throw new InputError(`\`${property}\` must be a segment.`, property);
    }
    if (segment["majorAxis"] !== undefined) {
        return ellipseOf(segment, property);
    }
    if (segment["center"] !== undefined && (segment["startAngle"] !== undefined || segment["endAngle"] !== undefined)) {
        return arcOf(segment, property);
    }
    if (segment["center"] !== undefined && segment["radius"] !== undefined) {
        return circleOf(segment, property);
    }
    if (segment["start"] !== undefined && segment["end"] !== undefined) {
        return lineOf(segment, property);
    }
    if (Array.isArray(segment["points"])) {
        return polylineOf(segment, property);
    }
    if (Array.isArray(segment["controlPoints"])) {
        return splineOf(segment, property);
    }
    throw new InputError(`\`${property}\` is not a line, arc, circle, polyline, spline or ellipse segment.`, property);
};

const layerOf = (value: unknown, property: string): string => {
    const layer = typeof value === "string" ? value.trim() : "";
    if (layer === "") {
        return DEFAULT_LAYER;
    }
    if (layer.length > DXF_MAX_NAME_LENGTH) {
        throw new InputError(`\`${property}\` is ${layer.length} characters long; a layer name holds at most ${DXF_MAX_NAME_LENGTH}.`, property);
    }
    if (FORBIDDEN_LAYER_CHARACTERS.test(layer) || [...layer].some(character => character.charCodeAt(0) < FIRST_PRINTABLE_CODE)) {
        throw new InputError(`\`${property}\` "${layer}" holds a character layer names may not: < > / \\ " : ; ? * | = \` or a control character.`, property);
    }
    return layer;
};

const colorOf = (value: unknown, property: string): string => {
    const channels = typeof value === "string" && value.startsWith("#") ? hexChannels(value) : undefined;
    if (channels === undefined) {
        throw new InputError(`\`${property}\` must be a hex color such as #ff0000.`, property);
    }
    return hexOfChannels(channels);
};

const lineTypeOf = (value: unknown, property: string): Inputs.IO.lineTypeEnum => {
    if (value === undefined) {
        return Inputs.IO.lineTypeEnum.continuous;
    }
    if (typeof value !== "string" || !LINE_TYPES.has(value)) {
        throw new InputError(`\`${property}\` must be one of ${[...LINE_TYPES].join(", ")}.`, property);
    }
    return value as Inputs.IO.lineTypeEnum;
};

export const drawingPathOf = (path: Inputs.IO.DrawingPathDto | undefined, property: string): DrawingPath => {
    if (typeof path !== "object" || path === null || !Array.isArray(path.segments)) {
        throw new InputError(`\`${property}.segments\` must be a list of segments.`, `${property}.segments`);
    }
    return { segments: path.segments.map((segment, at) => segmentOf(segment, `${property}.segments[${at}]`)) };
};

export const drawingPartsOf = (parts: readonly unknown[] | undefined, property: string): DrawingPart[] => {
    if (!Array.isArray(parts)) {
        throw new InputError(`\`${property}\` must be a list of path parts.`, property);
    }
    return parts.map((part: unknown, at: number) => {
        const where = `${property}[${at}]`;
        if (!isRecord(part) || !Array.isArray(part["paths"])) {
            throw new InputError(`\`${where}.paths\` must be a list of paths.`, `${where}.paths`);
        }
        const paths = part["paths"] as (Inputs.IO.DrawingPathDto | undefined)[];
        return {
            layer: layerOf(part["layer"] ?? DEFAULT_LAYER, `${where}.layer`),
            color: colorOf(part["color"] ?? "#000000", `${where}.color`),
            lineType: lineTypeOf(part["lineType"], `${where}.lineType`),
            paths: paths.map((path, index) => drawingPathOf(path, `${where}.paths[${index}]`)),
        };
    });
};
