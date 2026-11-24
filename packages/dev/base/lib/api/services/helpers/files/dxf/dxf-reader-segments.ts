import type * as Inputs from "../../../../inputs";
import { angleWithinTurn } from "../../curves/conic-arcs";
import { pointToWorld, unitOf } from "../../geometry/frame-axes";
import { radiansOf } from "../../geometry/scalars";
import { cross3, length3, scale3 } from "../../geometry/vectors";
import { ocsAxesOf } from "../drawing/drawing-geometry";
import { DEFAULT_SPLINE_DEGREE } from "../drawing/drawing.constants";
import type { DxfEntityRecord, OwnSegments, ReadSegment } from "./dxf-reader-types";
import {
    CONIC_WORK, DEGREES_PER_TURN, GROUP, LINE_WORK, MAX_FIT_POINTS, MAX_SPLINE_DEGREE, MESH_FLAG, PERIODIC_FLAG, POLYFACE_FLAG, SPLINE_FRAME_VERTEX_FLAG, Y_OFFSET, Z_OFFSET,
} from "./dxf-reader.constants";
import { DXF_CLOSED_FLAG, DXF_EXTRUSION_CODES, DXF_OTHER_POINT_CODES, DXF_POINT_CODES, DXF_POLYLINE_3D_FLAG, DXF_RATIONAL_FLAG } from "./dxf.constants";
import { numberIn, numberOf, numbersOf } from "./dxf-tokens";

type Point3 = Inputs.Base.Point3;
type Vec3 = Inputs.Base.Vector3;

const FULL_TURN = 2 * Math.PI;

export const segmentWork = (segment: ReadSegment): number => {
    switch (segment.kind) {
        case "line":
            return LINE_WORK;
        case "conic":
            return CONIC_WORK;
        case "spline":
            return segment.curve.points.length;
        case "fit":
            return segment.points.length;
        default:
            return segment.points.length + segment.bulges.filter(bulge => bulge !== 0).length;
    }
};

const drawn = (segments: ReadSegment[]): OwnSegments => ({ segments, work: segments.reduce((total, segment) => total + segmentWork(segment), 0), flaw: undefined, skipped: undefined });

const flawOf = (type: string, reason: string): OwnSegments => ({ segments: [], work: 0, flaw: `${type}\n${reason}`, skipped: undefined });

export const recordPointOf = (record: DxfEntityRecord, codes: readonly number[], fallback: Point3 = [0, 0, 0]): Point3 =>
    [numberOf(record, codes[0]!, fallback[0]), numberOf(record, codes[1]!, fallback[1]), numberOf(record, codes[2]!, fallback[2])];

export const recordNormalOf = (record: DxfEntityRecord): Vec3 => unitOf(recordPointOf(record, DXF_EXTRUSION_CODES, [0, 0, 1])) ?? [0, 0, 1];

const pointsOf = (record: DxfEntityRecord, xCode: number): Point3[] => {
    const points: Point3[] = [];
    for (const group of record.groups) {
        if (group.code === xCode) {
            points.push([numberIn(group), 0, 0]);
        } else if (group.code === xCode + Y_OFFSET && points.length > 0) {
            points[points.length - 1]![1] = numberIn(group);
        } else if (group.code === xCode + Z_OFFSET && points.length > 0) {
            points[points.length - 1]![2] = numberIn(group);
        }
    }
    return points;
};

const circleOf = (record: DxfEntityRecord): ReadSegment => {
    const axes = ocsAxesOf(recordNormalOf(record));
    const radius = numberOf(record, GROUP.radius, 0);
    const angleOf = (code: number): number => radiansOf(angleWithinTurn(numberOf(record, code, 0), DEGREES_PER_TURN));
    const start = record.type === "ARC" ? angleOf(GROUP.startAngle) : 0;
    const end = record.type === "ARC" ? angleOf(GROUP.endAngle) : FULL_TURN;
    const turn = angleWithinTurn(end - start, FULL_TURN);
    return {
        kind: "conic",
        center: pointToWorld(axes, recordPointOf(record, DXF_POINT_CODES)),
        xAxis: scale3(axes.x, radius),
        yAxis: scale3(axes.y, radius),
        start,
        sweep: turn === 0 ? FULL_TURN : turn,
    };
};

const ellipseOf = (record: DxfEntityRecord): OwnSegments => {
    const major = recordPointOf(record, DXF_OTHER_POINT_CODES);
    const minor = unitOf(cross3(recordNormalOf(record), major));
    if (minor === undefined || length3(major) === 0) {
        return flawOf("ELLIPSE", "its major axis has no length or runs along its extrusion");
    }
    const start = angleWithinTurn(numberOf(record, GROUP.startParameter, 0), FULL_TURN);
    const end = numberOf(record, GROUP.endParameter, FULL_TURN);
    const turn = angleWithinTurn(end - start, FULL_TURN);
    return drawn([{ kind: "conic", center: recordPointOf(record, DXF_POINT_CODES), xAxis: major, yAxis: scale3(minor, length3(major) * numberOf(record, GROUP.ratio, 1)), start, sweep: turn === 0 ? FULL_TURN : turn }]);
};

const polylineOf = (type: string, points: Point3[], bulges: number[], closed: boolean, normal: Vec3): OwnSegments => {
    if (points.length < 2) {
        return flawOf(type, "it has fewer than two points");
    }
    return drawn([{ kind: "polyline", points, bulges, closed, normal }]);
};

const lightPolylineOf = (record: DxfEntityRecord): OwnSegments => {
    const axes = ocsAxesOf(recordNormalOf(record));
    const elevation = numberOf(record, GROUP.elevation, 0);
    const points: Point3[] = [];
    const bulges: number[] = [];
    for (const group of record.groups) {
        if (group.code === GROUP.x) {
            points.push([numberIn(group), 0, elevation]);
            bulges.push(0);
        } else if (group.code === GROUP.y && points.length > 0) {
            points[points.length - 1]![1] = numberIn(group);
        } else if (group.code === GROUP.bulge && bulges.length > 0) {
            bulges[bulges.length - 1] = numberIn(group);
        }
    }
    return polylineOf(record.type, points.map(point => pointToWorld(axes, point)), bulges, (numberOf(record, GROUP.flags, 0) & DXF_CLOSED_FLAG) !== 0, recordNormalOf(record));
};

const heavyPolylineOf = (record: DxfEntityRecord): OwnSegments => {
    const flags = numberOf(record, GROUP.flags, 0);
    if ((flags & (POLYFACE_FLAG | MESH_FLAG)) !== 0) {
        return { segments: [], work: 0, flaw: undefined, skipped: "POLYLINE mesh" };
    }
    const vertices = record.vertices.filter(vertex => (numberOf(vertex, GROUP.flags, 0) & SPLINE_FRAME_VERTEX_FLAG) === 0);
    const closed = (flags & DXF_CLOSED_FLAG) !== 0;
    if ((flags & DXF_POLYLINE_3D_FLAG) !== 0) {
        return polylineOf(record.type, vertices.map(vertex => recordPointOf(vertex, DXF_POINT_CODES)), vertices.map(() => 0), closed, [0, 0, 1]);
    }
    const axes = ocsAxesOf(recordNormalOf(record));
    const elevation = numberOf(record, GROUP.elevationZ, 0);
    const points = vertices.map(vertex => pointToWorld(axes, [numberOf(vertex, GROUP.x, 0), numberOf(vertex, GROUP.y, 0), elevation]));
    return polylineOf(record.type, points, vertices.map(vertex => numberOf(vertex, GROUP.bulge, 0)), closed, recordNormalOf(record));
};

const splineOf = (record: DxfEntityRecord): OwnSegments => {
    const flags = numberOf(record, GROUP.flags, 0);
    const degree = numberOf(record, GROUP.degree, DEFAULT_SPLINE_DEGREE);
    if (degree > MAX_SPLINE_DEGREE) {
        return flawOf("SPLINE", `its degree is above ${MAX_SPLINE_DEGREE}, the highest a kernel curve takes`);
    }
    const controls = pointsOf(record, GROUP.controlX);
    const knots = numbersOf(record, GROUP.knot);
    if (controls.length > degree && knots.length === controls.length + degree + 1 && degree >= 1 && Number.isInteger(degree)) {
        const weights = numbersOf(record, GROUP.weight);
        const rational = (flags & DXF_RATIONAL_FLAG) !== 0 && weights.length === controls.length && weights.every(weight => weight > 0);
        return drawn([{ kind: "spline", curve: { degree, points: controls, weights: rational ? weights : controls.map(() => 1), knots } }]);
    }
    const fits = pointsOf(record, GROUP.fitX);
    if (fits.length > MAX_FIT_POINTS) {
        return flawOf("SPLINE", `it has more than ${MAX_FIT_POINTS} fit points, more than one spline is interpolated through`);
    }
    if (fits.length >= 2) {
        const start = pointsOf(record, GROUP.startTangentX)[0];
        const end = pointsOf(record, GROUP.endTangentX)[0];
        return drawn([{ kind: "fit", points: fits, startTangent: start, endTangent: end, closed: (flags & (DXF_CLOSED_FLAG | PERIODIC_FLAG)) !== 0 }]);
    }
    return flawOf("SPLINE", "it holds neither control points with knots to match nor two fit points");
};

export const readSegmentsOf = (record: DxfEntityRecord): OwnSegments => {
    switch (record.type) {
        case "LINE":
            return drawn([{ kind: "line", start: recordPointOf(record, DXF_POINT_CODES), end: recordPointOf(record, DXF_OTHER_POINT_CODES) }]);
        case "CIRCLE":
        case "ARC":
            return drawn([circleOf(record)]);
        case "ELLIPSE":
            return ellipseOf(record);
        case "LWPOLYLINE":
            return lightPolylineOf(record);
        case "POLYLINE":
            return heavyPolylineOf(record);
        default:
            return splineOf(record);
    }
};
