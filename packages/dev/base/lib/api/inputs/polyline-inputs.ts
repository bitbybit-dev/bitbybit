/* eslint-disable @typescript-eslint/no-namespace */
import type { Base } from "./base-inputs";

/**
 * Parameters for connected sequences of line segments: the point list that defines the path, whether
 * it closes back on itself, and the options for measuring, transforming and converting a polyline into
 * a kernel wire ready for solid modelling.
 */
export namespace Polyline {
    /**
     * Points and a closed flag for `polyline.create`.
     */
    export class PolylineCreateDto {
        /**
         * Provide options without default values
         */
        constructor(points?: Base.Point3[], isClosed?: boolean) {
            if (points !== undefined) { this.points = points; }
            if (isClosed !== undefined) { this.isClosed = isClosed; }
        }
        /**
         * The points of the polyline, in order along it.
         * @default undefined
         */
        points!: Base.Point3[];
        /**
         * When true, the polyline joins its last point back to its first.
         * @default false
         */
        isClosed?: boolean | undefined = false;
    }
    /**
     * A polyline as a plain object: its points in order, whether it closes back on itself, and an
     * optional color for drawing.
     */
    export class PolylinePropertiesDto {
        /**
         * Provide options without default values
         */
        constructor(points?: Base.Point3[], isClosed?: boolean) {
            if (points !== undefined) { this.points = points; }
            if (isClosed !== undefined) { this.isClosed = isClosed; }
        }
        /**
         * The points of the polyline, in order along it.
         * @default undefined
         */
        points!: Base.Point3[];
        /**
         * When true, the polyline joins its last point back to its first.
         * @default false
         */
        isClosed?: boolean | undefined = false;
        /**
         * A color used when the polyline is drawn, as a hex text such as `#ff0000` or as `[r, g,
         * b]` values from 0 to 1.
         * @default undefined
         * @optional true
         */
        color?: string | number[] | undefined;
    }
    /**
     * One polyline for the methods that read it: `polyline.length`, `polyline.getPoints`,
     * `polyline.polylineToSegments` and the rest.
     */
    export class PolylineDto {
        constructor(polyline?: PolylinePropertiesDto) {
            if (polyline !== undefined) { this.polyline = polyline; }
        }
        /**
         * The polyline object with its points.
         * @default undefined
         */
        polyline!: PolylinePropertiesDto;
    }
    /**
     * A list of polylines, for methods that take several at once.
     */
    export class PolylinesDto {
        constructor(polylines?: PolylinePropertiesDto[]) {
            if (polylines !== undefined) { this.polylines = polylines; }
        }
        /**
         * The polyline objects.
         * @default undefined
         */
        polylines!: PolylinePropertiesDto[];
    }
    /**
     * A polyline and the transformation `polyline.transformPolyline` applies to its points.
     */
    export class TransformPolylineDto {
        constructor(polyline?: PolylinePropertiesDto, transformation?: Base.TransformMatrixes) {
            if (polyline !== undefined) { this.polyline = polyline; }
            if (transformation !== undefined) { this.transformation = transformation; }
        }
        /**
         * The polyline whose points are transformed; a new polyline is returned.
         * @default undefined
         */
        polyline!: PolylinePropertiesDto;
        /**
         * A transformation matrix, or a list of them applied in order.
         * @default undefined
         */
        transformation!: Base.TransformMatrixes;
    }
    /**
     * One polyline and how to draw it: its width, color and opacity, and whether the drawn mesh
     * will be updated later.
     */
    export class DrawPolylineDto<T> {
        /**
         * Provide options without default values
         */
        constructor(polyline?: PolylinePropertiesDto, opacity?: number, colours?: string | string[], size?: number, updatable?: boolean, polylineMesh?: T) {
            if (polyline !== undefined) { this.polyline = polyline; }
            if (opacity !== undefined) { this.opacity = opacity; }
            if (colours !== undefined) { this.colours = colours; }
            if (size !== undefined) { this.size = size; }
            if (updatable !== undefined) { this.updatable = updatable; }
            if (polylineMesh !== undefined) { this.polylineMesh = polylineMesh; }
        }
        /**
         * The polyline to draw, with its points and closed flag.
         * @default undefined
         */
        polyline!: PolylinePropertiesDto;
        /**
         * How opaque the line is, from 0 (invisible) to 1 (solid).
         * @default 1
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        opacity?: number | undefined = 1;
        /**
         * Color of the line as a hex text such as `#ff0000`; a list of texts is also accepted.
         * @default #444444
         */
        colours?: string | string[] | undefined = "#444444";
        /**
         * Width of the drawn line.
         * @default 3
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        size?: number | undefined = 3;
        /**
         * When true, the drawn mesh is built so its points can be changed later without redrawing.
         * @default false
         */
        updatable?: boolean | undefined = false;
        /**
         * A mesh drawn earlier for this polyline; when given it is updated in place instead of a
         * new one being made.
         * @default undefined
         * @optional true
         */
        polylineMesh?: T | undefined;
    }
    /**
     * A list of polylines and how to draw them: their width, colors and opacity, and whether the
     * drawn mesh will be updated later.
     */
    export class DrawPolylinesDto<T> {
        /**
         * Provide options without default values
         */
        constructor(polylines?: PolylinePropertiesDto[], opacity?: number, colours?: string | string[], size?: number, updatable?: boolean, polylinesMesh?: T) {
            if (polylines !== undefined) { this.polylines = polylines; }
            if (opacity !== undefined) { this.opacity = opacity; }
            if (colours !== undefined) { this.colours = colours; }
            if (size !== undefined) { this.size = size; }
            if (updatable !== undefined) { this.updatable = updatable; }
            if (polylinesMesh !== undefined) { this.polylinesMesh = polylinesMesh; }
        }
        /**
         * The polylines to draw, each with its points and closed flag.
         * @default undefined
         */
        polylines!: PolylinePropertiesDto[];
        /**
         * How opaque the lines are, from 0 (invisible) to 1 (solid).
         * @default 1
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        opacity?: number | undefined = 1;
        /**
         * One hex color text for all polylines, or one text per polyline.
         * @default #444444
         */
        colours?: string | string[] | undefined = "#444444";
        /**
         * Width of the drawn lines.
         * @default 3
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        size?: number | undefined = 3;
        /**
         * When true, the drawn mesh is built so the points can be changed later without redrawing.
         * @default false
         */
        updatable?: boolean | undefined = false;
        /**
         * A mesh drawn earlier for these polylines; when given it is updated in place instead of a
         * new one being made.
         * @default undefined
         * @optional true
         */
        polylinesMesh?: T | undefined;
    }
    /**
     * Loose segments and a tolerance for `polyline.sortSegmentsIntoPolylines`.
     */
    export class SegmentsToleranceDto {
        constructor(segments?: Base.Segment3[]) {
            if (segments !== undefined) { this.segments = segments; }
        }
        /**
         * The segments to join, each a pair of points, in any order.
         * @default undefined
         */
        segments!: Base.Segment3[];
        /**
         * Two segment ends closer than this, in model units, count as touching.
         * @default 1e-5
         * @minimum 0
         * @maximum Infinity
         * @step 1e-5
         */
        tolerance?: number | undefined = 1e-5;
    }
    /**
     * A polyline and a tolerance for `polyline.polylineSelfIntersection`,
     * `polyline.maxFilletsHalfLine` and `polyline.safestFilletRadius`.
     */
    export class PolylineToleranceDto {
        constructor(polyline?: PolylinePropertiesDto, tolerance?: number) {
            if (polyline !== undefined) { this.polyline = polyline; }
            if (tolerance !== undefined) { this.tolerance = tolerance; }
        }
        /**
         * The polyline to examine.
         * @default undefined
         */
        polyline!: PolylinePropertiesDto;
        /**
         * Distance, in model units, below which two points count as the same.
         * @default 1e-5
         * @minimum 0
         * @maximum Infinity
         * @step 1e-5
         */
        tolerance?: number | undefined = 1e-5;
    }
    /**
     * Two polylines and a tolerance for `polyline.twoPolylineIntersection`.
     */
    export class TwoPolylinesToleranceDto {
        constructor(polyline1?: PolylinePropertiesDto, polyline2?: PolylinePropertiesDto, tolerance?: number) {
            if (polyline1 !== undefined) { this.polyline1 = polyline1; }
            if (polyline2 !== undefined) { this.polyline2 = polyline2; }
            if (tolerance !== undefined) { this.tolerance = tolerance; }
        }
        /**
         * The first polyline.
         * @default undefined
         */
        polyline1!: PolylinePropertiesDto;
        /**
         * The second polyline.
         * @default undefined
         */
        polyline2!: PolylinePropertiesDto;
        /**
         * Crossing points closer together than this, in model units, are reported once.
         * @default 1e-5
         * @minimum 0
         * @maximum Infinity
         * @step 1e-5
         */
        tolerance?: number | undefined = 1e-5;
    }
    /**
     * A flat outline for `polyline.signedArea2d`, `polyline.perimeter2d` and the other 2D polygon
     * methods: its points in order, the last joining back to the first.
     */
    export class Polygon2Dto {
        constructor(points?: Base.Point2[]) {
            if (points !== undefined) { this.points = points; }
        }
        /**
         * The outline's corners in order; the last joins back to the first.
         * @default undefined
         */
        points!: Base.Point2[];
    }
    /**
     * A flat outline and a point for `polyline.isPointInside2d`.
     */
    export class PointInPolygon2Dto {
        constructor(points?: Base.Point2[], point?: Base.Point2) {
            if (points !== undefined) { this.points = points; }
            if (point !== undefined) { this.point = point; }
        }
        /**
         * The outline's corners in order; the last joins back to the first.
         * @default undefined
         */
        points!: Base.Point2[];
        /**
         * The point to test.
         * @default undefined
         */
        point!: Base.Point2;
    }
    /**
     * A flat outline and the way `polyline.orient2d` should make it run.
     */
    export class OrientPolygon2Dto {
        constructor(points?: Base.Point2[], counterClockwise?: boolean) {
            if (points !== undefined) { this.points = points; }
            if (counterClockwise !== undefined) { this.counterClockwise = counterClockwise; }
        }
        /**
         * The outline's corners in order; the last joins back to the first.
         * @default undefined
         */
        points!: Base.Point2[];
        /**
         * When true the outline is made to run counter-clockwise, when false clockwise.
         * @default true
         */
        counterClockwise?: boolean | undefined = true;
    }
    /**
     * A flat outline and the arcs `polyline.roundCorners2d` rounds its corners with.
     */
    export class RoundPolygon2Dto {
        constructor(points?: Base.Point2[], radius?: number, radiusList?: number[], segments?: number) {
            if (points !== undefined) { this.points = points; }
            if (radius !== undefined) { this.radius = radius; }
            if (radiusList !== undefined) { this.radiusList = radiusList; }
            if (segments !== undefined) { this.segments = segments; }
        }
        /**
         * The outline's corners in order; the last joins back to the first.
         * @default undefined
         */
        points!: Base.Point2[];
        /**
         * The radius every corner is rounded with; 0 leaves corners sharp.
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radius?: number | undefined = 1;
        /**
         * A radius per corner, in the order of `points`, used instead of `radius` when given.
         * @default undefined
         * @optional true
         */
        radiusList?: number[] | undefined;
        /**
         * How many straight pieces draw a quarter turn of arc; a smaller turn takes fewer.
         * @default 8
         * @minimum 1
         * @maximum Infinity
         * @step 1
         */
        segments?: number | undefined = 8;
    }
    /**
     * A path and, optionally, the directions it starts and ends in, for `polyline.tangents`.
     */
    export class PolylineTangentsDto {
        constructor(polyline?: PolylinePropertiesDto, startTangent?: Base.Vector3, endTangent?: Base.Vector3) {
            if (polyline !== undefined) { this.polyline = polyline; }
            if (startTangent !== undefined) { this.startTangent = startTangent; }
            if (endTangent !== undefined) { this.endTangent = endTangent; }
        }
        /**
         * The path, an open polyline of at least two points; one with `isClosed` set is refused.
         * @default undefined
         */
        polyline!: PolylinePropertiesDto;
        /**
         * The direction at the first point; left out, the first segment's.
         * @default undefined
         * @optional true
         */
        startTangent?: Base.Vector3 | undefined;
        /**
         * The direction at the last point; left out, the last segment's.
         * @default undefined
         * @optional true
         */
        endTangent?: Base.Vector3 | undefined;
    }
    /**
     * A path and the direction a profile's X axis starts in, for `polyline.sweepFrames` and
     * `polyline.sweepPlacements`.
     */
    export class PolylineSweepDto {
        constructor(polyline?: PolylinePropertiesDto, firstDirection?: Base.Vector3) {
            if (polyline !== undefined) { this.polyline = polyline; }
            if (firstDirection !== undefined) { this.firstDirection = firstDirection; }
        }
        /**
         * The path, an open polyline of at least two points; one with `isClosed` set is refused.
         * @default undefined
         */
        polyline!: PolylinePropertiesDto;
        /**
         * Roughly where the profile's X axis points at the start; it is turned square to the path.
         * @default [1, 0, 0]
         */
        firstDirection?: Base.Vector3 | undefined = [1, 0, 0];
    }
    /**
     * A path and the arcs `polyline.roundCorners` rounds its corners with.
     */
    export class RoundPolylineDto {
        constructor(polyline?: PolylinePropertiesDto, radius?: number, segments?: number) {
            if (polyline !== undefined) { this.polyline = polyline; }
            if (radius !== undefined) { this.radius = radius; }
            if (segments !== undefined) { this.segments = segments; }
        }
        /**
         * The path, an open polyline of at least two points; one with `isClosed` set is refused.
         * @default undefined
         */
        polyline!: PolylinePropertiesDto;
        /**
         * The radius each corner is rounded with; it shrinks where the segments beside it are short.
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radius?: number | undefined = 1;
        /**
         * How many straight pieces draw a quarter turn of arc; a smaller turn takes fewer.
         * @default 8
         * @minimum 1
         * @maximum Infinity
         * @step 1
         */
        segments?: number | undefined = 8;
    }
}
