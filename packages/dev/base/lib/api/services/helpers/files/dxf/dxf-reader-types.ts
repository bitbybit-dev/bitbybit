import type * as Inputs from "../../../../inputs";
import type { NurbsCurveForm } from "../../curves/nurbs-forms";

type Point3 = Inputs.Base.Point3;
type Vec3 = Inputs.Base.Vector3;

export interface DxfGroup {
    readonly code: number;
    readonly value: string;
    readonly line: number;
}

export interface DxfEntityRecord {
    readonly type: string;
    readonly groups: readonly DxfGroup[];
    readonly vertices: readonly DxfEntityRecord[];
}

export interface ReadLine {
    readonly kind: "line";
    readonly start: Point3;
    readonly end: Point3;
}

export interface ReadConic {
    readonly kind: "conic";
    readonly center: Point3;
    readonly xAxis: Vec3;
    readonly yAxis: Vec3;
    readonly start: number;
    readonly sweep: number;
}

export interface ReadPolyline {
    readonly kind: "polyline";
    readonly points: readonly Point3[];
    readonly bulges: readonly number[];
    readonly closed: boolean;
    readonly normal: Vec3;
}

export interface ReadSpline {
    readonly kind: "spline";
    readonly curve: NurbsCurveForm;
}

export interface ReadFitSpline {
    readonly kind: "fit";
    readonly points: readonly Point3[];
    readonly startTangent: Vec3 | undefined;
    readonly endTangent: Vec3 | undefined;
    readonly closed: boolean;
}

export type ReadSegment = ReadLine | ReadConic | ReadPolyline | ReadSpline | ReadFitSpline;

export interface OwnSegments {
    readonly segments: readonly ReadSegment[];
    readonly work: number;
    readonly flaw: string | undefined;
    readonly skipped: string | undefined;
}

export interface ReadStyle {
    readonly layer: string;
    readonly color: string;
    readonly lineType: Inputs.IO.lineTypeEnum;
}

export interface PlanarTurn {
    readonly scale: number;
    readonly rotation: number;
}

export interface ReadText {
    readonly value: string;
    readonly position: Point3;
    readonly height: number;
    readonly anchor: "start" | "middle" | "end";
    readonly rotation: number;
    readonly widthFactor: number;
}

export interface ReadHatch {
    readonly boundaries: readonly (readonly ReadSegment[])[];
    readonly pattern: Inputs.IO.hatchPatternEnum;
    readonly angle: number;
    readonly spacing: number;
    readonly simplified: boolean;
}

export interface ReadEntity {
    readonly style: ReadStyle;
    readonly segments: readonly ReadSegment[];
    readonly text?: ReadText;
    readonly hatch?: ReadHatch;
}

export interface ReadLayer {
    readonly name: string;
    readonly color: string;
    readonly lineType: Inputs.IO.lineTypeEnum;
    readonly hidden: boolean;
}

export interface ReadDrawing {
    readonly version: string;
    readonly unit: Inputs.Base.unitOfLengthEnum | undefined;
    readonly layers: readonly ReadLayer[];
    readonly entities: readonly ReadEntity[];
    readonly warnings: readonly string[];
}
