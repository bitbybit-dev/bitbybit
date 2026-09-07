// A fragment of the JSCAD inputs namespace: scripts/gen-inputs.mjs assembles every file in this
// directory, in the order set by scripts/inputs.config.mjs, into ../jscad-inputs.ts. Edit here, then regenerate.
import { Base } from "../base-inputs";
import { JSCADEntity, PolylinePropertiesDto } from "./entities-and-enums";

export class PolylineDto {
    constructor(polyline?: PolylinePropertiesDto) {
        if (polyline !== undefined) { this.polyline = polyline; }
    }
    /**
     * Polyline with points
     */
    polyline!: PolylinePropertiesDto;
}
export class CurveDto {
    constructor(curve?: any) {
        if (curve !== undefined) { this.curve = curve; }
    }
    /**
     * Nurbs curve
     */
    curve: any;
}
export class PointsDto {
    constructor(points?: Base.Point3[]) {
        if (points !== undefined) { this.points = points; }
    }
    /**
     * Points
     */
    points!: Base.Point3[];
}
export class PathDto {
    constructor(path?: JSCADEntity) {
        if (path !== undefined) { this.path = path; }
    }
    /**
     * 2D path
     * @default undefined
     */
    path!: JSCADEntity;
}
export class PathFromPointsDto {
    constructor(points?: Base.Point2[], closed?: boolean) {
        if (points !== undefined) { this.points = points; }
        if (closed !== undefined) { this.closed = closed; }
    }
    /**
     * Points through which to create a path
     * @default undefined
     */
    points!: Base.Point2[];
    /**
     * Indicates wether we want to create a closed path
     * @default false
     */
    closed = false;
}
export class PathsFromPointsDto {
    constructor(pointsLists?: Base.Point3[][] | Base.Point2[][]) {
        if (pointsLists !== undefined) { this.pointsLists = pointsLists; }
    }
    /**
     * Points
     * @default undefined
     */
    pointsLists!: Base.Point3[][] | Base.Point2[][];
}
export class PathFromPolylineDto {
    constructor(polyline?: PolylinePropertiesDto, closed?: boolean) {
        if (polyline !== undefined) { this.polyline = polyline; }
        if (closed !== undefined) { this.closed = closed; }
    }
    /**
     * Polyline
     * @default undefined
     */
    polyline!: PolylinePropertiesDto;
    /**
     * Indicates wether we want to create a closed path
     * @default false
     */
    closed = false;
}
export class PathAppendCurveDto {
    constructor(curve?: JSCADEntity, path?: JSCADEntity) {
        if (curve !== undefined) { this.curve = curve; }
        if (path !== undefined) { this.path = path; }
    }
    /**
     * Verb Nurbs curve
     * @default undefined
     */
    curve!: JSCADEntity;
    /**
     * Path to append the curve to
     * @default undefined
     */
    path!: JSCADEntity;
}
export class PathAppendPointsDto {
    constructor(points?: Base.Point2[], path?: JSCADEntity) {
        if (points !== undefined) { this.points = points; }
        if (path !== undefined) { this.path = path; }
    }
    /**
     * Points to append
     * @default undefined
     */
    points!: Base.Point2[];
    /**
     * Path to append the points to
     * @default undefined
     */
    path!: JSCADEntity;
}
export class PathAppendPolylineDto {
    constructor(polyline?: PolylinePropertiesDto, path?: JSCADEntity) {
        if (polyline !== undefined) { this.polyline = polyline; }
        if (path !== undefined) { this.path = path; }
    }
    /**
     * Polyline to append
     * @default undefined
     */
    polyline!: PolylinePropertiesDto;
    /**
     * Path to append the polyline to
     * @default undefined
     */
    path!: JSCADEntity;
}
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
     * Path to append the arc to
     * @default undefined
     */
    path!: JSCADEntity;
    /**
     * End point of an arc
     * @default [1, 1]
     */
    endPoint: Base.Point2 = [1, 1];
    /**
     * Rotation (degrees) of the X axis of the arc with respect to the X axis of the coordinate system
     * @default 90
     * @minimum -Infinity
     * @maximum Infinity
     * @step 1
     */
    xAxisRotation = 90;
    /**
     * Draw an arc clockwise with respect to the center point
     * @default true
     */
    clockwise = true;
    /**
     * Draw an arc longer than PI radians
     * @default false
     */
    large = false;
    /**
     * Number of segments for the arc
     * @default 24
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    segments = 24;
    /**
     * X radius of an arc
     * @default 1
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    radiusX = 1;
    /**
     * Y radius of an arc
     * @default 1
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    radiusY = 1;
}
