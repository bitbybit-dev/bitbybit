// A fragment of the OCCT inputs namespace: scripts/gen-inputs.mjs assembles every file in this
// directory, in the order set by scripts/inputs.config.mjs, into ../occ-inputs.ts. Edit here, then regenerate.
import { Base } from "@bitbybit-dev/base";

/** Straight line to `to`. */
export class PathLineSegment {
    constructor(to?: Base.Point2) {
        if (to !== undefined) { this.to = to; }
    }
    /**
     * Segment kind discriminator.
     * @default line
     */
    type = "line" as const;
    /**
     * End point of the line.
     * @default undefined
     */
    to!: Base.Point2;
}
/** Quadratic bezier with control point `c` to `to`. */
export class PathQuadraticSegment {
    constructor(c?: Base.Point2, to?: Base.Point2) {
        if (c !== undefined) { this.c = c; }
        if (to !== undefined) { this.to = to; }
    }
    /**
     * Segment kind discriminator.
     * @default quadratic
     */
    type = "quadratic" as const;
    /**
     * Control point.
     * @default undefined
     */
    c!: Base.Point2;
    /**
     * End point.
     * @default undefined
     */
    to!: Base.Point2;
}
/** Cubic bezier with control points `c1`, `c2` to `to`. */
export class PathCubicSegment {
    constructor(c1?: Base.Point2, c2?: Base.Point2, to?: Base.Point2) {
        if (c1 !== undefined) { this.c1 = c1; }
        if (c2 !== undefined) { this.c2 = c2; }
        if (to !== undefined) { this.to = to; }
    }
    /**
     * Segment kind discriminator.
     * @default cubic
     */
    type = "cubic" as const;
    /**
     * First control point.
     * @default undefined
     */
    c1!: Base.Point2;
    /**
     * Second control point.
     * @default undefined
     */
    c2!: Base.Point2;
    /**
     * End point.
     * @default undefined
     */
    to!: Base.Point2;
}
/** Elliptical arc in center parametrization (angles in radians). */
export class PathArcSegment {
    constructor(to?: Base.Point2, center?: Base.Point2, rx?: number, ry?: number, xAxisRotation?: number, startAngle?: number, deltaAngle?: number) {
        if (to !== undefined) { this.to = to; }
        if (center !== undefined) { this.center = center; }
        if (rx !== undefined) { this.rx = rx; }
        if (ry !== undefined) { this.ry = ry; }
        if (xAxisRotation !== undefined) { this.xAxisRotation = xAxisRotation; }
        if (startAngle !== undefined) { this.startAngle = startAngle; }
        if (deltaAngle !== undefined) { this.deltaAngle = deltaAngle; }
    }
    /**
     * Segment kind discriminator.
     * @default arc
     */
    type = "arc" as const;
    /**
     * End point of the arc.
     * @default undefined
     */
    to!: Base.Point2;
    /**
     * Ellipse center.
     * @default undefined
     */
    center!: Base.Point2;
    /**
     * Semi-axis along the (rotated) x direction.
     * @default 0
     */
    rx = 0;
    /**
     * Semi-axis along the (rotated) y direction.
     * @default 0
     */
    ry = 0;
    /**
     * Rotation of the ellipse x-axis in radians (CCW in path space).
     * @default 0
     */
    xAxisRotation = 0;
    /**
     * Start angle on the ellipse in radians.
     * @default 0
     */
    startAngle = 0;
    /**
     * Signed sweep angle in radians (negative = clockwise in path space).
     * @default 0
     */
    deltaAngle = 0;
}
/**
 * One segment of an SVG-style path: a line, a quadratic or cubic Bezier, or an arc. A path is a
 * list of these, which is how imported SVG outlines are represented before they become wires.
 */
export type PathSegment = PathLineSegment | PathQuadraticSegment | PathCubicSegment | PathArcSegment;

/** A contiguous run of segments. The first segment starts at `start`. */
export class PathSubpath {
    constructor(start?: Base.Point2, segments?: PathSegment[], closed?: boolean) {
        if (start !== undefined) { this.start = start; }
        if (segments !== undefined) { this.segments = segments; }
        if (closed !== undefined) { this.closed = closed; }
    }
    /**
     * Absolute start point of the subpath.
     * @default undefined
     */
    start!: Base.Point2;
    /**
     * Ordered segments; the first segment starts at `start`.
     * @default undefined
     */
    segments!: PathSegment[];
    /**
     * Whether the subpath is closed.
     * @default false
     */
    closed = false;
}

/**
 * How closed subpaths of a filled element are turned into faces.
 * - `none`: no faces, only the outline wires.
 * - `auto`: build faces honoring each element's own SVG fill-rule (nonzero/evenodd).
 * - `nonzero`: force the non-zero winding rule.
 * - `evenOdd`: force the even-odd rule.
 * - `perSubpath`: every closed subpath becomes its own independent face (no holes).
 */
export enum svgFaceStrategyEnum {
    none = "none",
    auto = "auto",
    nonzero = "nonzero",
    evenOdd = "evenOdd",
    perSubpath = "perSubpath"
}

/**
 * Placement of a 2D path into 3D CAD space. Defaults map SVG user space
 * (Y down, top-left origin) onto the XY plane upright (Y up).
 */
export class PathPlacementDto {
    constructor(scale?: number, flipY?: boolean, origin?: Base.Point3) {
        if (scale !== undefined) { this.scale = scale; }
        if (flipY !== undefined) { this.flipY = flipY; }
        if (origin !== undefined) { this.origin = origin; }
    }
    /**
     * Uniform scale applied to path coordinates.
     * @default 1
     */
    scale = 1;
    /**
     * Negate Y so an SVG appears upright (Y up) in CAD.
     * @default true
     */
    flipY = true;
    /**
     * Translation applied after scale/flip.
     * @default [0, 0, 0]
     */
    origin: Base.Point3 = [0, 0, 0];
}

/**
 * Generic builder input: turn one or more subpaths into wires and,
 * optionally, faces. SVG-agnostic.
 */
export class ShapeFromPathDto {
    constructor(subpaths?: PathSubpath[], makeFaces?: boolean, joinSegments?: boolean, tolerance?: number, scale?: number, flipY?: boolean, origin?: Base.Point3) {
        if (subpaths !== undefined) { this.subpaths = subpaths; }
        if (makeFaces !== undefined) { this.makeFaces = makeFaces; }
        if (joinSegments !== undefined) { this.joinSegments = joinSegments; }
        if (tolerance !== undefined) { this.tolerance = tolerance; }
        if (scale !== undefined) { this.scale = scale; }
        if (flipY !== undefined) { this.flipY = flipY; }
        if (origin !== undefined) { this.origin = origin; }
    }
    /**
     * Subpaths describing the geometry.
     * @default undefined
     */
    subpaths!: PathSubpath[];
    /**
     * Build faces from the (closed) subpaths in addition to wires.
     * @default false
     */
    makeFaces = false;
    /**
     * Join each subpath's segments into a single curve where possible.
     * @default true
     */
    joinSegments = true;
    /**
     * Tolerance used when joining/sewing segments.
     * @default 1e-7
     */
    tolerance = 1e-7;
    /**
     * Uniform scale applied to path coordinates.
     * @default 1
     */
    scale = 1;
    /**
     * Negate Y so the path appears upright (Y up) in CAD.
     * @default true
     */
    flipY = true;
    /**
     * Translation applied after scale/flip.
     * @default [0, 0, 0]
     */
    origin: Base.Point3 = [0, 0, 0];
}

/** Options for the SVG importer. */
export class LoadSVGDto {
    constructor(svg?: string, faceStrategy?: svgFaceStrategyEnum, makeRibbons?: boolean, includeInvisible?: boolean, joinSegments?: boolean, tolerance?: number, scale?: number, flipY?: boolean, alignment?: Base.basicAlignmentEnum, direction?: Base.Vector3, center?: Base.Point3) {
        if (svg !== undefined) { this.svg = svg; }
        if (faceStrategy !== undefined) { this.faceStrategy = faceStrategy; }
        if (makeRibbons !== undefined) { this.makeRibbons = makeRibbons; }
        if (includeInvisible !== undefined) { this.includeInvisible = includeInvisible; }
        if (joinSegments !== undefined) { this.joinSegments = joinSegments; }
        if (tolerance !== undefined) { this.tolerance = tolerance; }
        if (scale !== undefined) { this.scale = scale; }
        if (flipY !== undefined) { this.flipY = flipY; }
        if (alignment !== undefined) { this.alignment = alignment; }
        if (direction !== undefined) { this.direction = direction; }
        if (center !== undefined) { this.center = center; }
    }
    /**
     * SVG document text.
     * @default <svg width="19.125pt" height="19.125pt" viewBox="0 0 19.125 19.125" overflow="visible" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M11.122705,15.698935 L15.272235,15.698935 C15.57419,15.729545 15.91649,15.387245 15.88588,15.08529 L15.88588,4.039708 C15.91649,3.737754 15.57419,3.395453 15.272235,3.426065 L9.572815,3.426065 C9.27086,3.395453 8.92856,3.737754 8.95917,4.039708 L8.95917,6.945415 C8.95604,7.118435 9.042725,7.30507 9.17695,7.414295 C9.30713,7.528305 9.50566,7.58247 9.675705,7.55037 C10.575375,7.32287 11.76631,8.055895 11.96849,8.96159 C12.311025,9.824045 11.739055,11.10017 10.86733,11.418385 C10.660165,11.503245 10.50001,11.752675 10.509065,11.976365 L10.509065,15.08529 C10.47845,15.387245 10.82075,15.729545 11.122705,15.698935 z" stroke="#f0cebb" stroke-width="0.5" fill-opacity="0" /><path d="M8.913155,15.698935 L4.226653,15.698935 C3.924699,15.729545 3.582398,15.387245 3.613009,15.08529 L3.613009,4.039708 C3.582398,3.737754 3.924699,3.395453 4.226653,3.426065 L7.36326,3.426065 C7.665215,3.395453 8.00752,3.737754 7.976905,4.039708 L7.976905,9.5625 C7.9468,10.306505 8.479485,11.13613 9.16853,11.418385 C9.375695,11.503245 9.53585,11.752675 9.5268,11.976365 L9.5268,15.08529 C9.55741,15.387245 9.21511,15.729545 8.913155,15.698935 z" stroke="#f0cebb" stroke-width="0.5" fill-opacity="0" /></svg>
     */
    svg: string = '<svg width="19.125pt" height="19.125pt" viewBox="0 0 19.125 19.125" overflow="visible" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M11.122705,15.698935 L15.272235,15.698935 C15.57419,15.729545 15.91649,15.387245 15.88588,15.08529 L15.88588,4.039708 C15.91649,3.737754 15.57419,3.395453 15.272235,3.426065 L9.572815,3.426065 C9.27086,3.395453 8.92856,3.737754 8.95917,4.039708 L8.95917,6.945415 C8.95604,7.118435 9.042725,7.30507 9.17695,7.414295 C9.30713,7.528305 9.50566,7.58247 9.675705,7.55037 C10.575375,7.32287 11.76631,8.055895 11.96849,8.96159 C12.311025,9.824045 11.739055,11.10017 10.86733,11.418385 C10.660165,11.503245 10.50001,11.752675 10.509065,11.976365 L10.509065,15.08529 C10.47845,15.387245 10.82075,15.729545 11.122705,15.698935 z" stroke="#f0cebb" stroke-width="0.5" fill-opacity="0" /><path d="M8.913155,15.698935 L4.226653,15.698935 C3.924699,15.729545 3.582398,15.387245 3.613009,15.08529 L3.613009,4.039708 C3.582398,3.737754 3.924699,3.395453 4.226653,3.426065 L7.36326,3.426065 C7.665215,3.395453 8.00752,3.737754 7.976905,4.039708 L7.976905,9.5625 C7.9468,10.306505 8.479485,11.13613 9.16853,11.418385 C9.375695,11.503245 9.53585,11.752675 9.5268,11.976365 L9.5268,15.08529 C9.55741,15.387245 9.21511,15.729545 8.913155,15.698935 z" stroke="#f0cebb" stroke-width="0.5" fill-opacity="0" /></svg>';
    /**
     * How closed, filled shapes become faces. `none` keeps only the outline wires; `auto` honors
     * each element's SVG fill-rule; `nonzero`/`evenOdd` force a rule; `perSubpath` makes one face
     * per closed subpath (no holes). Falls back to the wire when a face cannot be built.
     * @default none
     */
    faceStrategy: svgFaceStrategyEnum = svgFaceStrategyEnum.none;
    /**
     * Build ribbon faces from stroked paths. Not supported yet; stroked paths are returned as wires.
     * @default false
     */
    makeRibbons = false;
    /**
     * Include elements resolved as display:none / visibility:hidden.
     * @default false
     */
    includeInvisible = false;
    /**
     * Join each subpath's segments into a single curve where possible.
     * @default true
     */
    joinSegments = true;
    /**
     * Tolerance used when joining/sewing segments.
     * @default 1e-7
     */
    tolerance = 1e-7;
    /**
     * Uniform scale applied to the SVG coordinates.
     * @default 1
     */
    scale = 1;
    /**
     * Negate Y so the SVG appears upright (Y up) before placement.
     * @default true
     */
    flipY = true;
    /**
     * How the drawing's bounding box aligns to `center` (e.g. midMid centers it on the origin).
     * @default midMid
     */
    alignment: Base.basicAlignmentEnum = Base.basicAlignmentEnum.midMid;
    /**
     * Plane normal the drawing is laid onto. The default [0, 1, 0] lays it flat on the ground.
     * @default [0, 1, 0]
     */
    direction: Base.Vector3 = [0, 1, 0];
    /**
     * Point the aligned drawing is placed at.
     * @default [0, 0, 0]
     */
    center: Base.Point3 = [0, 0, 0];
}

/** One imported SVG element: its geometry shape plus resolved metadata (an output, not an input). */
export class SVGShape<T> {
    /** The built shape: a wire, or a face when requested. */
    shape!: T;
    /** True when `shape` is a face, false when it is a wire. */
    isFace!: boolean;
    /** SVG tag the shape came from: "path" | "rect" | "circle" | ... */
    elementType!: string;
    /** Whether the source subpaths were closed. */
    closed!: boolean;
    /** Resolved fill colour, if any. */
    fill?: string | undefined;
    /** Resolved stroke colour, if any. */
    stroke?: string | undefined;
    /** Stroke width (the "strength" of the line), if any. */
    strokeWidth?: number | undefined;
    /** Combined opacity in [0, 1], if any. */
    opacity?: number | undefined;
    /** Element id, if any. */
    id?: string | undefined;
    /** Element class attribute, if any. */
    className?: string | undefined;
}

/** Result of importing an SVG document (an output, not an input). */
export class SVGResult<T> {
    /** One entry per drawable element, in document order. */
    shapes!: SVGShape<T>[];
    /** viewBox as [minX, minY, width, height] if present. */
    viewBox?: [number, number, number, number] | undefined;
    /** Non-fatal parsing/building issues. */
    warnings!: string[];
}
