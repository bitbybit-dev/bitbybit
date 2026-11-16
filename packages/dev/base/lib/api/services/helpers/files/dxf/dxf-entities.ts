import type * as Inputs from "../../../../inputs";
import { angleWithinTurn } from "../../curves/conic-arcs";
import { isRationalPiece } from "../../curves/nurbs-forms";
import { vectorToLocal } from "../../geometry/frame-axes";
import { distance3 } from "../../geometry/vectors";
import { ocsAxesOf, segmentSamples } from "../drawing/drawing-geometry";
import type { DrawingArc, DrawingCircle, DrawingEllipse, DrawingLine, DrawingPolyline, DrawingSegment, DrawingSpline } from "../drawing/drawing-types";
import { LINE_TYPE_PATTERNS, SAME_POINT } from "../drawing/drawing.constants";
import { nearestAciIndex, trueColorOf } from "./dxf-colors";
import type { DxfText } from "./dxf-text";
import type { DxfVersion } from "./dxf-tables";
import { DXF_CLOSED_FLAG, DXF_EXTRUSION_CODES, DXF_KNOT_TOLERANCE, DXF_OTHER_POINT_CODES, DXF_POINT_CODES, DXF_POLYLINE_3D_FLAG, DXF_RATIONAL_FLAG, DXF_TURN_SLACK } from "./dxf.constants";

type Point3 = Inputs.Base.Point3;
type Vec3 = Inputs.Base.Vector3;

export interface DxfEntityStyle {
    readonly layer: string;
    readonly color: string;
    readonly lineType: Inputs.IO.lineTypeEnum | undefined;
}

export interface DxfEntityContext {
    readonly text: DxfText;
    readonly version: DxfVersion;
    readonly owner: string;
    readonly colorFormat: "aci" | "truecolor";
    readonly curveTolerance: number;
}

const PLANAR_FLAG = 8;
const VERTEX_3D_FLAG = "32";
const PLUS_Z: Vec3 = [0, 0, 1];

const isModern = (context: DxfEntityContext): boolean => context.version === "AC1015";

const isPlusZ = (normal: Vec3): boolean => normal[0] === 0 && normal[1] === 0 && normal[2] > 0;

const openEntity = (context: DxfEntityContext, kind: string, style: DxfEntityStyle, owner = context.owner): string => {
    const text = context.text;
    text.pair("0", kind);
    let handle = "";
    if (isModern(context)) {
        handle = text.nextHandle();
        text.pair("5", handle);
        text.pair("330", owner);
        text.pair("100", "AcDbEntity");
    }
    text.name("8", style.layer);
    if (style.lineType !== undefined) {
        text.pair("6", LINE_TYPE_PATTERNS[style.lineType]!.name);
    }
    text.pair("62", String(nearestAciIndex(style.color)));
    if (isModern(context) && context.colorFormat === "truecolor") {
        text.pair("420", String(trueColorOf(style.color)));
    }
    return handle;
};

const writeLine = (context: DxfEntityContext, line: DrawingLine, style: DxfEntityStyle): void => {
    openEntity(context, "LINE", style);
    if (isModern(context)) {
        context.text.pair("100", "AcDbLine");
    }
    context.text.point(DXF_POINT_CODES, line.start);
    context.text.point(DXF_OTHER_POINT_CODES, line.end);
};

const writeCircleOrArc = (context: DxfEntityContext, segment: DrawingCircle | DrawingArc, style: DxfEntityStyle): void => {
    const axes = ocsAxesOf(segment.normal);
    const isWhole = segment.kind === "circle" || segment.endAngle - segment.startAngle >= 2 * Math.PI - DXF_TURN_SLACK;
    openEntity(context, isWhole ? "CIRCLE" : "ARC", style);
    const text = context.text;
    if (isModern(context)) {
        text.pair("100", "AcDbCircle");
    }
    text.point(DXF_POINT_CODES, vectorToLocal(axes, segment.center));
    text.real("40", segment.radius);
    if (!isPlusZ(segment.normal)) {
        text.point(DXF_EXTRUSION_CODES, segment.normal);
    }
    if (!isWhole && segment.kind === "arc") {
        if (isModern(context)) {
            text.pair("100", "AcDbArc");
        }
        text.real("50", segment.startDegrees);
        text.real("51", segment.endDegrees);
    }
};

const writeLightPolyline = (context: DxfEntityContext, points: readonly Point3[], bulges: readonly number[], closed: boolean, style: DxfEntityStyle): void => {
    openEntity(context, "LWPOLYLINE", style);
    const text = context.text;
    text.pair("100", "AcDbPolyline");
    text.pair("90", String(points.length));
    text.pair("70", closed ? "1" : "0");
    if (points[0]![2] !== 0) {
        text.real("38", points[0]![2]);
    }
    points.forEach((point, at) => {
        text.real("10", point[0]);
        text.real("20", point[1]);
        const bulge = bulges[at] ?? 0;
        if (bulge !== 0) {
            text.real("42", bulge);
        }
    });
};

const writeHeavyPolyline = (context: DxfEntityContext, points: readonly Point3[], bulges: readonly number[], closed: boolean, planar: boolean, style: DxfEntityStyle): void => {
    const owner = openEntity(context, "POLYLINE", style);
    const text = context.text;
    const vertexStyle = { ...style, lineType: undefined };
    if (isModern(context)) {
        text.pair("100", "AcDb3dPolyline");
    }
    text.pair("66", "1");
    text.point(DXF_POINT_CODES, [0, 0, planar ? points[0]![2] : 0]);
    text.pair("70", String((closed ? DXF_CLOSED_FLAG : 0) + (planar ? 0 : DXF_POLYLINE_3D_FLAG)));
    points.forEach((point, at) => {
        openEntity(context, "VERTEX", vertexStyle, owner);
        if (isModern(context)) {
            text.pair("100", "AcDbVertex");
            text.pair("100", "AcDb3dPolylineVertex");
        }
        text.point(DXF_POINT_CODES, point);
        const bulge = bulges[at] ?? 0;
        if (planar && bulge !== 0) {
            text.real("42", bulge);
        }
        text.pair("70", planar ? "0" : VERTEX_3D_FLAG);
    });
    openEntity(context, "SEQEND", vertexStyle, owner);
};

const writePoints = (context: DxfEntityContext, points: readonly Point3[], bulges: readonly number[], closed: boolean, style: DxfEntityStyle): void => {
    const planar = points.every(point => point[2] === points[0]![2]);
    if (planar && isModern(context)) {
        writeLightPolyline(context, points, bulges, closed, style);
    } else {
        writeHeavyPolyline(context, points, bulges, closed, planar, style);
    }
};

const writePolyline = (context: DxfEntityContext, polyline: DrawingPolyline, style: DxfEntityStyle): void =>
    writePoints(context, polyline.points, polyline.bulges, polyline.closed, style);

const writeSamples = (context: DxfEntityContext, segment: DrawingSpline | DrawingEllipse, style: DxfEntityStyle): void => {
    const samples = segmentSamples(segment, context.curveTolerance, context.text.budget);
    context.text.refuseWhenSpent();
    const closed = samples.length > 2 && distance3(samples[0]!, samples[samples.length - 1]!) <= SAME_POINT;
    const points = closed ? samples.slice(0, -1) : samples;
    writePoints(context, points, [], closed, style);
};

const writeSpline = (context: DxfEntityContext, spline: DrawingSpline, style: DxfEntityStyle): void => {
    const curve = spline.curve;
    const planar = curve.points.every(point => point[2] === curve.points[0]![2]);
    const rational = isRationalPiece(curve);
    openEntity(context, "SPLINE", style);
    const text = context.text;
    text.pair("100", "AcDbSpline");
    if (planar) {
        text.point(DXF_EXTRUSION_CODES, PLUS_Z);
    }
    text.pair("70", String((planar ? PLANAR_FLAG : 0) + (rational ? DXF_RATIONAL_FLAG : 0)));
    text.pair("71", String(curve.degree));
    text.pair("72", String(curve.knots.length));
    text.pair("73", String(curve.points.length));
    text.pair("74", "0");
    text.pair("42", DXF_KNOT_TOLERANCE);
    text.pair("43", DXF_KNOT_TOLERANCE);
    for (const knot of curve.knots) {
        text.real("40", knot);
    }
    curve.points.forEach((point, at) => {
        text.point(DXF_POINT_CODES, point);
        if (rational) {
            text.real("41", curve.weights[at]!);
        }
    });
};

const writeEllipse = (context: DxfEntityContext, ellipse: DrawingEllipse, style: DxfEntityStyle): void => {
    openEntity(context, "ELLIPSE", style);
    const text = context.text;
    const isWhole = ellipse.end - ellipse.start >= 2 * Math.PI - DXF_TURN_SLACK;
    text.pair("100", "AcDbEllipse");
    text.point(DXF_POINT_CODES, ellipse.center);
    text.point(DXF_OTHER_POINT_CODES, ellipse.majorAxis);
    text.point(DXF_EXTRUSION_CODES, ellipse.normal);
    text.real("40", ellipse.ratio);
    text.real("41", isWhole ? 0 : angleWithinTurn(ellipse.start, 2 * Math.PI));
    text.real("42", isWhole ? 2 * Math.PI : angleWithinTurn(ellipse.end, 2 * Math.PI));
};

export const writeSegment = (context: DxfEntityContext, segment: DrawingSegment, style: DxfEntityStyle): void => {
    switch (segment.kind) {
        case "line":
            writeLine(context, segment, style);
            break;
        case "circle":
        case "arc":
            writeCircleOrArc(context, segment, style);
            break;
        case "polyline":
            writePolyline(context, segment, style);
            break;
        case "spline":
            if (isModern(context)) {
                writeSpline(context, segment, style);
            } else {
                writeSamples(context, segment, style);
            }
            break;
        case "ellipse":
            if (isModern(context)) {
                writeEllipse(context, segment, style);
            } else {
                writeSamples(context, segment, style);
            }
            break;
    }
};
