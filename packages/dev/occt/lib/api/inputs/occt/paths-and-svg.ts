// A fragment of the OCCT inputs namespace: scripts/gen-inputs.mjs assembles every file in this
// directory, in the order set by scripts/inputs.config.mjs, into ../occ-inputs.ts. Edit here, then regenerate.
import { Base } from "@bitbybit-dev/base";

/**
 * A straight segment of a path, running from the previous point to `to`.
 */
export class PathLineSegment {
    constructor(to?: Base.Point2) {
        if (to !== undefined) { this.to = to; }
    }
    /**
     * The segment kind, always `line`.
     * @default line
     */
    type = "line" as const;
    /**
     * The 2D point the segment ends at.
     * @default undefined
     */
    to!: Base.Point2;
}
/**
 * A quadratic Bezier segment of a path: one control point pulls the curve on its way from the
 * previous point to `to`.
 */
export class PathQuadraticSegment {
    constructor(c?: Base.Point2, to?: Base.Point2) {
        if (c !== undefined) { this.c = c; }
        if (to !== undefined) { this.to = to; }
    }
    /**
     * The segment kind, always `quadratic`.
     * @default quadratic
     */
    type = "quadratic" as const;
    /**
     * The 2D control point the curve is pulled toward.
     * @default undefined
     */
    c!: Base.Point2;
    /**
     * The 2D point the segment ends at.
     * @default undefined
     */
    to!: Base.Point2;
}
/**
 * A cubic Bezier segment of a path: two control points shape the curve on its way from the previous
 * point to `to`.
 */
export class PathCubicSegment {
    constructor(c1?: Base.Point2, c2?: Base.Point2, to?: Base.Point2) {
        if (c1 !== undefined) { this.c1 = c1; }
        if (c2 !== undefined) { this.c2 = c2; }
        if (to !== undefined) { this.to = to; }
    }
    /**
     * The segment kind, always `cubic`.
     * @default cubic
     */
    type = "cubic" as const;
    /**
     * The 2D control point that shapes the curve as it leaves the previous point.
     * @default undefined
     */
    c1!: Base.Point2;
    /**
     * The 2D control point that shapes the curve as it arrives at `to`.
     * @default undefined
     */
    c2!: Base.Point2;
    /**
     * The 2D point the segment ends at.
     * @default undefined
     */
    to!: Base.Point2;
}
/**
 * An elliptical arc segment of a path, given by its ellipse's center, radii and rotation and the
 * angles it sweeps; all angles are in radians.
 */
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
     * The segment kind, always `arc`.
     * @default arc
     */
    type = "arc" as const;
    /**
     * The 2D point the arc ends at.
     * @default undefined
     */
    to!: Base.Point2;
    /**
     * The 2D center of the ellipse the arc lies on.
     * @default undefined
     */
    center!: Base.Point2;
    /**
     * The half-width of the ellipse along its rotated x axis.
     * @default 0
     */
    rx = 0;
    /**
     * The half-width of the ellipse along its rotated y axis.
     * @default 0
     */
    ry = 0;
    /**
     * How far the ellipse is turned in the plane, in radians, counterclockwise in path space.
     * @default 0
     */
    xAxisRotation = 0;
    /**
     * The angle on the ellipse where the arc starts, in radians.
     * @default 0
     */
    startAngle = 0;
    /**
     * How far the arc sweeps from its start, in radians; negative sweeps clockwise in path space.
     * @default 0
     */
    deltaAngle = 0;
}
/**
 * One segment of an SVG-style path: a line, a quadratic or cubic Bezier, or an arc. A path is a
 * list of these, which is how imported SVG outlines are represented before they become wires.
 */
export type PathSegment = PathLineSegment | PathQuadraticSegment | PathCubicSegment | PathArcSegment;

/**
 * One continuous run of a path: a start point, its segments in order and whether it closes back on
 * itself.
 */
export class PathSubpath {
    constructor(start?: Base.Point2, segments?: PathSegment[], closed?: boolean) {
        if (start !== undefined) { this.start = start; }
        if (segments !== undefined) { this.segments = segments; }
        if (closed !== undefined) { this.closed = closed; }
    }
    /**
     * The 2D point the first segment starts at.
     * @default undefined
     */
    start!: Base.Point2;
    /**
     * The segments in order, each starting where the previous one ended.
     * @default undefined
     */
    segments!: PathSegment[];
    /**
     * When true, the run closes from its last point back to `start`.
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
 * How a 2D path is placed into 3D: scaled, flipped from SVG's downward Y to Y up, and moved to an
 * origin. The part the path and SVG inputs share.
 */
export class PathPlacementDto {
    constructor(scale?: number, flipY?: boolean, origin?: Base.Point3) {
        if (scale !== undefined) { this.scale = scale; }
        if (flipY !== undefined) { this.flipY = flipY; }
        if (origin !== undefined) { this.origin = origin; }
    }
    /**
     * A factor applied to every path coordinate; 1 keeps the size.
     * @default 1
     */
    scale = 1;
    /**
     * When true, Y is negated so a drawing made with Y pointing down, as in SVG, comes out upright.
     * @default true
     */
    flipY = true;
    /**
     * The point the scaled and flipped drawing is moved to.
     * @default [0, 0, 0]
     */
    origin: Base.Point3 = [0, 0, 0];
}

/**
 * Subpaths and build options for `path.shapeFromPath`, which turns them into wires and, when asked,
 * faces.
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
     * The runs of segments that describe the outline, one wire each.
     * @default undefined
     */
    subpaths!: PathSubpath[];
    /**
     * When true, closed subpaths become faces as well as wires.
     * @default false
     */
    makeFaces = false;
    /**
     * When true, consecutive segments of a subpath are merged into a single edge where they can be.
     * @default true
     */
    joinSegments = true;
    /**
     * How far apart segment ends may be and still join, in model units.
     * @default 1e-7
     */
    tolerance = 1e-7;
    /**
     * A factor applied to every path coordinate; 1 keeps the size.
     * @default 1
     */
    scale = 1;
    /**
     * When true, Y is negated so a drawing made with Y pointing down comes out upright.
     * @default true
     */
    flipY = true;
    /**
     * The point the scaled and flipped drawing is moved to.
     * @default [0, 0, 0]
     */
    origin: Base.Point3 = [0, 0, 0];
}

/**
 * SVG text and import options for `svg.loadSVG` and `svg.loadSVGStructured`: which elements to
 * keep, whether to build faces, and how to scale and place the drawing.
 */
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
     * The text of the SVG document.
     * @default <svg width="19.125pt" height="19.125pt" viewBox="0 0 19.125 19.125" overflow="visible" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M11.122705,15.698935 L15.272235,15.698935 C15.57419,15.729545 15.91649,15.387245 15.88588,15.08529 L15.88588,4.039708 C15.91649,3.737754 15.57419,3.395453 15.272235,3.426065 L9.572815,3.426065 C9.27086,3.395453 8.92856,3.737754 8.95917,4.039708 L8.95917,6.945415 C8.95604,7.118435 9.042725,7.30507 9.17695,7.414295 C9.30713,7.528305 9.50566,7.58247 9.675705,7.55037 C10.575375,7.32287 11.76631,8.055895 11.96849,8.96159 C12.311025,9.824045 11.739055,11.10017 10.86733,11.418385 C10.660165,11.503245 10.50001,11.752675 10.509065,11.976365 L10.509065,15.08529 C10.47845,15.387245 10.82075,15.729545 11.122705,15.698935 z" stroke="#f0cebb" stroke-width="0.5" fill-opacity="0" /><path d="M8.913155,15.698935 L4.226653,15.698935 C3.924699,15.729545 3.582398,15.387245 3.613009,15.08529 L3.613009,4.039708 C3.582398,3.737754 3.924699,3.395453 4.226653,3.426065 L7.36326,3.426065 C7.665215,3.395453 8.00752,3.737754 7.976905,4.039708 L7.976905,9.5625 C7.9468,10.306505 8.479485,11.13613 9.16853,11.418385 C9.375695,11.503245 9.53585,11.752675 9.5268,11.976365 L9.5268,15.08529 C9.55741,15.387245 9.21511,15.729545 8.913155,15.698935 z" stroke="#f0cebb" stroke-width="0.5" fill-opacity="0" /></svg>
     */
    svg: string = '<svg width="19.125pt" height="19.125pt" viewBox="0 0 19.125 19.125" overflow="visible" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M11.122705,15.698935 L15.272235,15.698935 C15.57419,15.729545 15.91649,15.387245 15.88588,15.08529 L15.88588,4.039708 C15.91649,3.737754 15.57419,3.395453 15.272235,3.426065 L9.572815,3.426065 C9.27086,3.395453 8.92856,3.737754 8.95917,4.039708 L8.95917,6.945415 C8.95604,7.118435 9.042725,7.30507 9.17695,7.414295 C9.30713,7.528305 9.50566,7.58247 9.675705,7.55037 C10.575375,7.32287 11.76631,8.055895 11.96849,8.96159 C12.311025,9.824045 11.739055,11.10017 10.86733,11.418385 C10.660165,11.503245 10.50001,11.752675 10.509065,11.976365 L10.509065,15.08529 C10.47845,15.387245 10.82075,15.729545 11.122705,15.698935 z" stroke="#f0cebb" stroke-width="0.5" fill-opacity="0" /><path d="M8.913155,15.698935 L4.226653,15.698935 C3.924699,15.729545 3.582398,15.387245 3.613009,15.08529 L3.613009,4.039708 C3.582398,3.737754 3.924699,3.395453 4.226653,3.426065 L7.36326,3.426065 C7.665215,3.395453 8.00752,3.737754 7.976905,4.039708 L7.976905,9.5625 C7.9468,10.306505 8.479485,11.13613 9.16853,11.418385 C9.375695,11.503245 9.53585,11.752675 9.5268,11.976365 L9.5268,15.08529 C9.55741,15.387245 9.21511,15.729545 8.913155,15.698935 z" stroke="#f0cebb" stroke-width="0.5" fill-opacity="0" /></svg>';
    /**
     * How filled shapes become faces: `none` keeps only wires, `auto` follows each element's fill
     * rule, `nonzero` and `evenOdd` force a rule, `perSubpath` makes one face per closed subpath
     * without holes.
     * @default none
     */
    faceStrategy: svgFaceStrategyEnum = svgFaceStrategyEnum.none;
    /**
     * Reserved for building ribbon faces from stroked paths; not supported yet, stroked paths stay
     * wires.
     * @default false
     */
    makeRibbons = false;
    /**
     * When true, elements hidden by `display: none` or `visibility: hidden` are imported too.
     * @default false
     */
    includeInvisible = false;
    /**
     * When true, consecutive segments of a subpath are merged into a single edge where they can be.
     * @default true
     */
    joinSegments = true;
    /**
     * How far apart segment ends may be and still join, in model units.
     * @default 1e-7
     */
    tolerance = 1e-7;
    /**
     * A factor applied to the SVG coordinates; 1 keeps the size.
     * @default 1
     */
    scale = 1;
    /**
     * When true, Y is negated so the drawing comes out upright, since SVG has Y pointing down.
     * @default true
     */
    flipY = true;
    /**
     * Which point of the drawing's bounding box sits on `center`; `midMid` centers it.
     * @default midMid
     */
    alignment: Base.basicAlignmentEnum = Base.basicAlignmentEnum.midMid;
    /**
     * The normal of the plane the drawing is laid on; the default lays it flat on the ground.
     * @default [0, 1, 0]
     */
    direction: Base.Vector3 = [0, 1, 0];
    /**
     * The point the aligned drawing is placed at.
     * @default [0, 0, 0]
     */
    center: Base.Point3 = [0, 0, 0];
}

/**
 * One imported SVG element as `svg.loadSVGStructured` returns it: the built shape and the style
 * resolved for it. An output, not an input.
 */
export class SVGShape<T> {
    /**
     * The built shape: a wire, or a face when one was asked for and could be built.
     */
    shape!: T;
    /**
     * True when `shape` is a face, false when it is a wire.
     */
    isFace!: boolean;
    /**
     * The SVG tag the shape came from, such as `path`, `rect` or `circle`.
     */
    elementType!: string;
    /**
     * Whether the element's outline was closed.
     */
    closed!: boolean;
    /**
     * The fill color that applied to the element, if any.
     */
    fill?: string | undefined;
    /**
     * The stroke color that applied to the element, if any.
     */
    stroke?: string | undefined;
    /**
     * The stroke width that applied to the element, if any.
     */
    strokeWidth?: number | undefined;
    /**
     * The combined opacity of the element from 0 to 1, if any was set.
     */
    opacity?: number | undefined;
    /**
     * The element's `id` attribute, if any.
     */
    id?: string | undefined;
    /**
     * The element's `class` attribute, if any.
     */
    className?: string | undefined;
}

/**
 * What `svg.loadSVGStructured` returns: one shape per drawable element, the view box and any
 * warnings. An output, not an input.
 */
export class SVGResult<T> {
    /**
     * One entry per drawable element, in document order.
     */
    shapes!: SVGShape<T>[];
    /**
     * The document's view box as `[minX, minY, width, height]`, when it has one.
     */
    viewBox?: [number, number, number, number] | undefined;
    /**
     * Problems met while parsing or building that did not stop the import.
     */
    warnings!: string[];
}
