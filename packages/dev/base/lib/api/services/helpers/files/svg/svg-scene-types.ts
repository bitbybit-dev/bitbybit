import type { SvgSubpath } from "./svg-path-types";

export type {
    SvgArcSegment, SvgCubicSegment, SvgLineSegment, SvgQuadSegment, SvgSegment, SvgSubpath,
} from "./svg-path-types";

/**
 * Presentation metadata resolved for an element through the style cascade.
 * Values are normalized but kept close to SVG semantics so callers can use them
 * directly (e.g. colour a 3D shape by `fill`, or use `strokeWidth` as extrusion
 * or ribbon thickness, the "strength" of a stroke).
 */
export interface SvgStyle {
    /** Resolved fill colour (e.g. "#ff0000", "none"), or undefined if not set. */
    fill?: string;
    /** Resolved stroke colour, or undefined if not set. */
    stroke?: string;
    /** Stroke width in the root's user units, scaled by the element's transforms. */
    strokeWidth?: number;
    /** Dash and gap lengths of a dashed stroke, scaled as `strokeWidth` is; an odd list is repeated once, as SVG draws it. Left out for a solid stroke. */
    strokeDashArray?: number[];
    /** Opacity in [0,1], multiplied down from every ancestor that sets one. */
    opacity?: number;
    fillOpacity?: number;
    strokeOpacity?: number;
    /** SVG fill rule that governs how holes are determined. */
    fillRule?: "nonzero" | "evenodd";
    /** True when the element or an ancestor has display:none, or the element resolves to visibility:hidden. */
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
    /** The Inkscape layer the element is drawn on: the label, else the id, of the nearest enclosing group Inkscape marks as a layer. */
    layer?: string;
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
    /** The page's width and height in CSS pixels, 96 to the inch, when both are known, from `width` and `height` or from the view box. */
    width?: number;
    height?: number;
    /** Millimetres one root user unit stands for horizontally, from the page size and the view box. */
    millimetresPerUserUnit?: number;
    /** Non-fatal issues encountered while parsing (unsupported features, etc.). */
    warnings: string[];
}
