import type * as Inputs from "../../../../inputs";
import type { EllipseArc2 } from "../../geometry/ellipse-arcs";

type Point2 = Inputs.Base.Point2;

export interface SvgLineSegment {
    type: "line";
    to: Point2;
}

export interface SvgQuadSegment {
    type: "quad";
    c: Point2;
    to: Point2;
}

export interface SvgCubicSegment {
    type: "cubic";
    c1: Point2;
    c2: Point2;
    to: Point2;
}

export interface SvgArcSegment extends EllipseArc2 {
    type: "arc";
    to: Point2;
}

export type SvgSegment = SvgLineSegment | SvgQuadSegment | SvgCubicSegment | SvgArcSegment;

export interface SvgSubpath {
    start: Point2;
    segments: SvgSegment[];
    closed: boolean;
}

export interface ScannedSvgNumbers {
    numbers: number[];
    malformed: boolean;
}
