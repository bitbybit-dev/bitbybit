import type * as Inputs from "../../../../inputs";
import type { NurbsCurveForm } from "../../curves/nurbs-forms";
import type { HatchFamilyTurn } from "./drawing.constants";

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

export type DrawingTextAnchor = "start" | "middle" | "end";

export interface DrawingText {
    readonly value: string;
    readonly position: Point3;
    readonly height: number;
    readonly anchor: DrawingTextAnchor;
    readonly rotation: number;
    readonly rotationDegrees: number;
    readonly widthFactor: number;
    readonly width: number;
}

export interface DrawingHatch {
    readonly boundaries: readonly DrawingPath[];
    readonly pattern: Inputs.IO.hatchPatternEnum;
    readonly angle: number;
    readonly spacing: number;
}

export interface DrawingHatchFamily {
    readonly turn: HatchFamilyTurn;
    readonly angle: number;
    readonly direction: Inputs.Base.Point2;
    readonly across: Inputs.Base.Point2;
    readonly phase: number;
}

export interface DrawingLoop {
    readonly points: readonly Inputs.Base.Point2[];
    readonly bulges: readonly number[];
}

export interface DrawingPart {
    readonly layer: string;
    readonly color: string;
    readonly lineType: Inputs.IO.lineTypeEnum;
    readonly lineWeight: number | undefined;
    readonly paths: readonly DrawingPath[];
    readonly texts: readonly DrawingText[];
    readonly hatches: readonly DrawingHatch[];
}

export interface DrawingBounds {
    readonly min: Point3;
    readonly max: Point3;
}

export interface DrawingDimension {
    readonly kind: Inputs.IO.dimensionKindEnum;
    readonly start: Inputs.Base.Point2;
    readonly end: Inputs.Base.Point2;
    readonly direction: Inputs.Base.Vector2 | undefined;
    readonly offset: number;
    readonly sweep: number;
    readonly text: string;
    readonly textHeight: number;
    readonly arrowLength: number;
}

export interface DimensionLayout {
    readonly lines: Inputs.Base.Point2[][];
    readonly fills: Inputs.Base.Point2[][];
    readonly text: DrawingText;
}

export interface DimensionLine {
    readonly from: Inputs.Base.Point2;
    readonly to: Inputs.Base.Point2;
    readonly arrowAtFrom: boolean;
}

export interface TextInk {
    readonly low: number;
    readonly high: number;
}
