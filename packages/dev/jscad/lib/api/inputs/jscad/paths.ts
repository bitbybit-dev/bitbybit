// A fragment of the JSCAD inputs namespace: scripts/gen-inputs.mjs assembles every file in this
// directory, in the order set by scripts/inputs.config.mjs, into ../jscad-inputs.ts. Edit here, then regenerate.
import { Base } from "../base-inputs";
import { JSCADEntity, PolylinePropertiesDto } from "./entities-and-enums";

/**
 * Feeds `polygon.createFromPolyline` with the polyline whose points become the outline of a filled
 * 2D shape.
 */
export class PolylineDto {
    constructor(polyline?: PolylinePropertiesDto) {
        if (polyline !== undefined) { this.polyline = polyline; }
    }
    /**
     * The polyline whose points, in order, outline the shape; only X and Y are used
     */
    polyline!: PolylinePropertiesDto;
}
/**
 * Feeds `polygon.createFromCurve` with a NURBS curve, which is sampled into points to outline a
 * filled 2D shape.
 */
export class CurveDto {
    constructor(curve?: any) {
        if (curve !== undefined) { this.curve = curve; }
    }
    /**
     * A NURBS curve that can be sampled into points; only X and Y of the samples are used
     */
    curve: any;
}
/**
 * Feeds `polygon.createFromPoints` with the outline points of a filled 2D shape, listed in order
 * around it.
 */
export class PointsDto {
    constructor(points?: Base.Point3[]) {
        if (points !== undefined) { this.points = points; }
    }
    /**
     * The outline points in order, at least three; only X and Y are used
     */
    points!: Base.Point3[];
}
/**
 * Feeds `path.close` and `polygon.createFromPath` with the one 2D path to work on; a 2D shape or a
 * solid throws an error.
 */
export class PathDto {
    constructor(path?: JSCADEntity) {
        if (path !== undefined) { this.path = path; }
    }
    /**
     * The 2D path to work on; it stays as it is and a new path or shape comes back
     * @default undefined
     */
    path!: JSCADEntity;
}
/**
 * Feeds `path.createFromPoints`: the points a new 2D path runs through and whether it closes back
 * to the first.
 */
export class PathFromPointsDto {
    constructor(points?: Base.Point2[], closed?: boolean) {
        if (points !== undefined) { this.points = points; }
        if (closed !== undefined) { this.closed = closed; }
    }
    /**
     * The points the path runs through, in order; only X and Y are used and repeated consecutive
     * points are dropped
     * @default undefined
     */
    points!: Base.Point2[];
    /**
     * When true, the last point joins back to the first and the path accepts no more points
     * @default false
     */
    closed = false;
}
/**
 * Feeds `path.createPathsFromPoints` with several point lists, one 2D path each; a list ending on
 * its first point makes a closed path.
 */
export class PathsFromPointsDto {
    constructor(pointsLists?: Base.Point3[][] | Base.Point2[][]) {
        if (pointsLists !== undefined) { this.pointsLists = pointsLists; }
    }
    /**
     * One list of points per path, in the order the paths should come back; a list whose last point
     * equals its first gives a closed path
     * @default undefined
     */
    pointsLists!: Base.Point3[][] | Base.Point2[][];
}
/**
 * Feeds `path.createFromPolyline`: the polyline a new 2D path runs through and whether it closes
 * back to the first point.
 */
export class PathFromPolylineDto {
    constructor(polyline?: PolylinePropertiesDto, closed?: boolean) {
        if (polyline !== undefined) { this.polyline = polyline; }
        if (closed !== undefined) { this.closed = closed; }
    }
    /**
     * The polyline whose points the path runs through; only X and Y are used and its own closed
     * flag is ignored
     * @default undefined
     */
    polyline!: PolylinePropertiesDto;
    /**
     * When true, the last point joins back to the first and the path accepts no more points
     * @default false
     */
    closed = false;
}
/**
 * A 2D path and a NURBS curve to add to its end. No method reads it at present; sample the curve
 * into points and use `path.appendPoints` instead.
 */
export class PathAppendCurveDto {
    constructor(curve?: JSCADEntity, path?: JSCADEntity) {
        if (curve !== undefined) { this.curve = curve; }
        if (path !== undefined) { this.path = path; }
    }
    /**
     * A NURBS curve whose sampled points would extend the path
     * @default undefined
     */
    curve!: JSCADEntity;
    /**
     * The open 2D path that would be extended
     * @default undefined
     */
    path!: JSCADEntity;
}
/**
 * Feeds `path.appendPoints`: an open 2D path and the points to add after its last point.
 */
export class PathAppendPointsDto {
    constructor(points?: Base.Point2[], path?: JSCADEntity) {
        if (points !== undefined) { this.points = points; }
        if (path !== undefined) { this.path = path; }
    }
    /**
     * The points to add after the path's last point, in order; only X and Y are used
     * @default undefined
     */
    points!: Base.Point2[];
    /**
     * The open 2D path to extend; it stays as it is and a longer copy comes back. A closed path
     * throws an error
     * @default undefined
     */
    path!: JSCADEntity;
}
/**
 * Feeds `path.appendPolyline`: an open 2D path and the polyline whose points are added after its
 * last point.
 */
export class PathAppendPolylineDto {
    constructor(polyline?: PolylinePropertiesDto, path?: JSCADEntity) {
        if (polyline !== undefined) { this.polyline = polyline; }
        if (path !== undefined) { this.path = path; }
    }
    /**
     * The polyline whose points are added after the path's last point; only X and Y are used
     * @default undefined
     */
    polyline!: PolylinePropertiesDto;
    /**
     * The open 2D path to extend; it stays as it is and a longer copy comes back. A closed path
     * throws an error
     * @default undefined
     */
    path!: JSCADEntity;
}
/**
 * Feeds `path.appendArc`: an open 2D path with at least one point, the point the arc ends on, the
 * ellipse the arc is cut from and which of the four fitting arcs to take.
 */
export class PathAppendArcDto {
    constructor(path?: JSCADEntity, endPoint?: Base.Point2, xAxisRotation?: number, clockwise?: boolean, large?: boolean, segments?: number, radiusX?: number, radiusY?: number) {
        if (path !== undefined) { this.path = path; }
        if (endPoint !== undefined) { this.endPoint = endPoint; }
        if (xAxisRotation !== undefined) { this.xAxisRotation = xAxisRotation; }
        if (clockwise !== undefined) { this.clockwise = clockwise; }
        if (large !== undefined) { this.large = large; }
        if (segments !== undefined) { this.segments = segments; }
        if (radiusX !== undefined) { this.radiusX = radiusX; }
        if (radiusY !== undefined) { this.radiusY = radiusY; }
    }
    /**
     * The open 2D path to extend, with at least one point; the arc starts at its last point
     * @default undefined
     */
    path!: JSCADEntity;
    /**
     * Where the arc ends, as a 2D point in the XY plane
     * @default [1, 1]
     */
    endPoint: Base.Point2 = [1, 1];
    /**
     * Tilt of the ellipse the arc is cut from, in degrees from the X axis; it changes nothing for a
     * circle
     * @default 90
     * @minimum -Infinity
     * @maximum Infinity
     * @step 1
     */
    xAxisRotation = 90;
    /**
     * When true, the arc turns clockwise from the start to the end point; false turns
     * counter-clockwise
     * @default true
     */
    clockwise = true;
    /**
     * When true, the longer of the two arcs between the points is taken, more than half the ellipse
     * @default false
     */
    large = false;
    /**
     * Number of straight pieces for a full ellipse; the arc gets its proportional share
     * @default 24
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    segments = 24;
    /**
     * Half width of the ellipse along its own X axis, in model units; scaled up when too small to
     * reach the end point
     * @default 1
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    radiusX = 1;
    /**
     * Half height of the ellipse along its own Y axis, in model units; equal to `radiusX` for a
     * circular arc
     * @default 1
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    radiusY = 1;
}
