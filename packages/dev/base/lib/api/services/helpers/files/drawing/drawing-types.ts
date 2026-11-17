import type * as Inputs from "../../../../inputs";
import type { NurbsCurveForm } from "../../curves/nurbs-forms";

type Point3 = Inputs.Base.Point3;
type Vec3 = Inputs.Base.Vector3;

export interface DrawingLine {
    readonly kind: "line";
    readonly start: Point3;
    readonly end: Point3;
}

export interface DrawingCircle {
    readonly kind: "circle";
    readonly center: Point3;
    readonly radius: number;
    readonly normal: Vec3;
}

export interface DrawingArc {
    readonly kind: "arc";
    readonly center: Point3;
    readonly radius: number;
    readonly startAngle: number;
    readonly endAngle: number;
    readonly startDegrees: number;
    readonly endDegrees: number;
    readonly normal: Vec3;
}

export interface DrawingPolyline {
    readonly kind: "polyline";
    readonly points: readonly Point3[];
    readonly bulges: readonly number[];
    readonly closed: boolean;
    readonly planar: boolean;
}

export interface DrawingEllipse {
    readonly kind: "ellipse";
    readonly center: Point3;
    readonly majorAxis: Vec3;
    readonly ratio: number;
    readonly start: number;
    readonly end: number;
    readonly normal: Vec3;
}

export interface DrawingSpline {
    readonly kind: "spline";
    readonly curve: NurbsCurveForm;
}

export type DrawingSegment = DrawingLine | DrawingCircle | DrawingArc | DrawingPolyline | DrawingEllipse | DrawingSpline;

export interface DrawingPath {
    readonly segments: readonly DrawingSegment[];
}

export interface DrawingPart {
    readonly layer: string;
    readonly color: string;
    readonly lineType: Inputs.IO.lineTypeEnum;
    readonly paths: readonly DrawingPath[];
}

export interface DrawingBounds {
    readonly min: Point3;
    readonly max: Point3;
}
