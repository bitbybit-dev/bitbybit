/**
 * Internal, framework-agnostic model produced by the SVG parser/normalizer.
 *
 * The whole point of this layer is to "understand" SVG entirely in TypeScript
 * (XML structure, the `d` mini-language, transforms, the style cascade and units)
 * and reduce it to a tiny, exact geometric vocabulary that the OCCT layer can
 * turn into wires/faces without knowing anything about SVG.
 *
 * The vocabulary is intentionally the *complete* closed set of curve families
 * expressible in SVG path data: line, quadratic bezier, cubic bezier and
 * elliptical arc. Every other SVG construct (rect, circle, ellipse, polyline,
 * polygon, rounded corners, smooth-curve shorthands) reduces to these.
 *
 * Coordinates here are still in SVG user space (Y points down). The conversion
 * to CAD space (Y up, scaling, target plane) happens later, in the builder, so
 * that the normalizer stays a pure, easily-testable SVG concern.
 */

import { Base } from "@bitbybit-dev/base";

export type SvgSegment =
    | SvgLineSegment
    | SvgQuadSegment
    | SvgCubicSegment
    | SvgArcSegment;

/** Straight line to `to`. */
export interface SvgLineSegment {
    type: "line";
    to: Base.Point2;
}

/** Quadratic bezier with single control point `c` to `to`. */
export interface SvgQuadSegment {
    type: "quad";
    c: Base.Point2;
    to: Base.Point2;
}

/** Cubic bezier with control points `c1`, `c2` to `to`. */
export interface SvgCubicSegment {
    type: "cubic";
    c1: Base.Point2;
    c2: Base.Point2;
    to: Base.Point2;
}

/**
 * Elliptical arc in *center parametrization* (already converted from SVG's
 * endpoint parametrization, and already transformed). This maps directly onto
 * an OCCT trimmed `Geom_Ellipse`/`Geom_Circle` and survives arbitrary affine
 * transforms (a circle arc under a non-uniform/sheared transform becomes a
 * rotated ellipse arc, faithfully captured here).
 */
export interface SvgArcSegment {
    type: "arc";
    /** End point of the arc. */
    to: Base.Point2;
    /** Ellipse center. */
    center: Base.Point2;
    /** Semi-axis along the (rotated) x direction. */
    rx: number;
    /** Semi-axis along the (rotated) y direction. */
    ry: number;
    /** Rotation of the ellipse x-axis, radians, CCW in SVG user space. */
    xAxisRotation: number;
    /** Start angle on the ellipse, radians. */
    startAngle: number;
    /** Signed sweep angle, radians (negative = clockwise in SVG user space). */
    deltaAngle: number;
}

/** One contiguous run of segments — an SVG subpath (between move/close commands). */
export interface SvgSubpath {
    /** Absolute start point of the subpath. */
    start: Base.Point2;
    /** Ordered segments. The first segment starts at `start`. */
    segments: SvgSegment[];
    /** Whether the subpath was explicitly closed (`Z`). */
    closed: boolean;
}

/**
 * Presentation metadata resolved for an element through the style cascade.
 * Values are normalized but kept close to SVG semantics so callers can use them
 * directly (e.g. colour a 3D shape by `fill`, or use `strokeWidth` as extrusion
 * or ribbon thickness — the "strength" of a stroke).
 */
export interface SvgStyle {
    /** Resolved fill colour (e.g. "#ff0000", "none"), or undefined if not set. */
    fill?: string;
    /** Resolved stroke colour, or undefined if not set. */
    stroke?: string;
    /** Stroke width in user units (the "strength" of the line). */
    strokeWidth?: number;
    /** Combined opacity in [0,1]. */
    opacity?: number;
    fillOpacity?: number;
    strokeOpacity?: number;
    /** SVG fill rule that governs how holes are determined. */
    fillRule?: "nonzero" | "evenodd";
    /** True when the element resolves to display:none / visibility:hidden. */
    hidden?: boolean;
}

/** A single drawable SVG element, normalized to subpaths + resolved style. */
export interface SvgElement {
    /** SVG tag name: "path" | "rect" | "circle" | "ellipse" | "line" | "polyline" | "polygon". */
    tag: string;
    /** `id` attribute, if any. */
    id?: string;
    /** `class` attribute, verbatim, if any. */
    className?: string;
    /** Resolved presentation style. */
    style: SvgStyle;
    /** Geometry as subpaths in SVG user space (transforms already baked in). */
    subpaths: SvgSubpath[];
}

/** The whole parsed document reduced to drawable elements + frame info. */
export interface SvgScene {
    elements: SvgElement[];
    /** viewBox as [minX, minY, width, height] if present. */
    viewBox?: [number, number, number, number];
    /** Intrinsic width/height in user units if resolvable. */
    width?: number;
    height?: number;
    /** Non-fatal issues encountered while parsing (unsupported features, etc.). */
    warnings: string[];
}
