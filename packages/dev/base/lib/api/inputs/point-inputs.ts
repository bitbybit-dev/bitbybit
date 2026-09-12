/* eslint-disable @typescript-eslint/no-namespace */
import { Base } from "./base-inputs";

/**
 * Parameters for creating and working with points: single points, points spread along a line or a
 * curve, points in rectangular and hexagonal grids, spirals and other structured sets, plus the
 * options for transforming, sorting, closest-point queries and distance measurement. Structured point
 * sets are where most parametric models begin.
 */
export namespace Point {
    /**
     * One point for `point.getX`, `point.getY` and `point.getZ`.
     */
    export class PointDto {
        constructor(point?: Base.Point3) {
            if (point !== undefined) { this.point = point; }
        }
        /**
         * The point as `[x, y, z]`.
         * @default undefined
         */
        point!: Base.Point3;
    }
    /**
     * The three values `point.pointXYZ` puts together into `[x, y, z]`.
     */
    export class PointXYZDto {
        constructor(x?: number, y?: number, z?: number) {
            if (x !== undefined) { this.x = x; }
            if (y !== undefined) { this.y = y; }
            if (z !== undefined) { this.z = z; }
        }
        /**
         * The X value, the first entry.
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        x = 0;
        /**
         * The Y value, the second entry; Y is up.
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        y = 0;
        /**
         * The Z value, the third entry.
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        z = 0;
    }
    /**
     * The two values `point.pointXY` puts together into `[x, y]`.
     */
    export class PointXYDto {
        constructor(x?: number, y?: number) {
            if (x !== undefined) { this.x = x; }
            if (y !== undefined) { this.y = y; }
        }
        /**
         * The X value, the first entry.
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        x = 0;
        /**
         * The Y value, the second entry.
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        y = 0;
    }
    /**
     * A list of points for the methods that read them together: `point.boundingBoxOfPoints`,
     * `point.averagePoint` and `point.sortPoints`.
     */
    export class PointsDto {
        constructor(points?: Base.Point3[]) {
            if (points !== undefined) { this.points = points; }
        }
        /**
         * The points, each `[x, y, z]`.
         * @default undefined
         */
        points!: Base.Point3[];
    }
    /**
     * Two points, for methods that relate one point to another.
     */
    export class TwoPointsDto {
        constructor(point1?: Base.Point3, point2?: Base.Point3) {
            if (point1 !== undefined) { this.point1 = point1; }
            if (point2 !== undefined) { this.point2 = point2; }
        }
        /**
         * The first point.
         * @default undefined
         */
        point1!: Base.Point3;
        /**
         * The second point.
         * @default undefined
         */
        point2!: Base.Point3;
    }
    /**
     * One point and how to draw it: its size, color and opacity, and whether the drawn mesh will
     * be updated later.
     */
    export class DrawPointDto<T> {
        /**
         * Provide options without default values
         */
        constructor(point?: Base.Point3, opacity?: number, size?: number, colours?: string | string[], updatable?: boolean, pointMesh?: T) {
            if (point !== undefined) { this.point = point; }
            if (opacity !== undefined) { this.opacity = opacity; }
            if (size !== undefined) { this.size = size; }
            if (colours !== undefined) { this.colours = colours; }
            if (updatable !== undefined) { this.updatable = updatable; }
            if (pointMesh !== undefined) { this.pointMesh = pointMesh; }
        }
        /**
         * The point to draw, as `[x, y, z]`.
         * @default undefined
         */
        point!: Base.Point3;
        /**
         * How opaque the point is, from 0 (invisible) to 1 (solid).
         * @default 1
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        opacity = 1;
        /**
         * Size of the drawn point, in model units.
         * @default 3
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        size = 3;
        /**
         * Color of the point as a hex string such as `#ff0000`; a list of strings is also
         * accepted.
         * @default #444444
         */
        colours: string | string[] = "#444444";
        /**
         * When true, the drawn mesh is built so its position can be changed later without
         * redrawing.
         * @default false
         */
        updatable = false;
        /**
         * A mesh drawn earlier for this point; when given it is updated in place instead of a new
         * one being made.
         * @default undefined
         */
        pointMesh?: T | undefined;
    }
    /**
     * A list of points and how to draw them: their size, colors and opacity, and whether the drawn
     * mesh will be updated later.
     */
    export class DrawPointsDto<T> {
        /**
         * Provide options without default values
         */
        constructor(points?: Base.Point3[], opacity?: number, size?: number, colours?: string | string[], updatable?: boolean, pointsMesh?: T) {
            if (points !== undefined) { this.points = points; }
            if (opacity !== undefined) { this.opacity = opacity; }
            if (size !== undefined) { this.size = size; }
            if (colours !== undefined) { this.colours = colours; }
            if (updatable !== undefined) { this.updatable = updatable; }
            if (pointsMesh !== undefined) { this.pointsMesh = pointsMesh; }
        }
        /**
         * The points to draw, each `[x, y, z]`.
         * @default undefined
         */
        points!: Base.Point3[];
        /**
         * How opaque the points are, from 0 (invisible) to 1 (solid).
         * @default 1
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        opacity = 1;
        /**
         * Size of each drawn point, in model units.
         * @default 0.1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        size = 0.1;
        /**
         * One hex color string for all points, or one string per point.
         * @default #444444
         */
        colours: string | string[] = "#444444";
        /**
         * When true, the drawn mesh is built so the positions can be changed later without
         * redrawing.
         * @default false
         */
        updatable = false;
        /**
         * A mesh drawn earlier for these points; when given it is updated in place instead of a new
         * one being made.
         * @default undefined
         */
        pointsMesh?: T | undefined;
    }
    /**
     * One point and the transformation `point.transformPoint` applies to it.
     */
    export class TransformPointDto {
        constructor(point?: Base.Point3, transformation?: Base.TransformMatrixes) {
            if (point !== undefined) { this.point = point; }
            if (transformation !== undefined) { this.transformation = transformation; }
        }
        /**
         * The point to transform; it is not changed, a new point is returned.
         * @default undefined
         */
        point!: Base.Point3;
        /**
         * A transformation matrix, or a list of them applied in order.
         * @default undefined
         */
        transformation!: Base.TransformMatrixes;
    }
    /**
     * Points and the one transformation `point.transformPoints` applies to all of them.
     */
    export class TransformPointsDto {
        constructor(points?: Base.Point3[], transformation?: Base.TransformMatrixes) {
            if (points !== undefined) { this.points = points; }
            if (transformation !== undefined) { this.transformation = transformation; }
        }
        /**
         * The points to transform; they are not changed and the result keeps their order.
         * @default undefined
         */
        points!: Base.Point3[];
        /**
         * A transformation matrix, or a list of them applied in order, used for every point.
         * @default undefined
         */
        transformation!: Base.TransformMatrixes;
    }
    /**
     * Points and one vector per point for `point.translatePointsWithVectors`; the two lists must
     * have the same length.
     */
    export class TranslatePointsWithVectorsDto {
        constructor(points?: Base.Point3[], translations?: Base.Vector3[]) {
            if (points !== undefined) { this.points = points; }
            if (translations !== undefined) { this.translations = translations; }
        }
        /**
         * The points to move.
         * @default undefined
         */
        points!: Base.Point3[];
        /**
         * One vector per point, in the same order; the first point moves by the first vector.
         * @default undefined
         */
        translations!: Base.Vector3[];
    }
    /**
     * Points and the one vector `point.translatePoints` moves them all by.
     */
    export class TranslatePointsDto {
        constructor(points?: Base.Point3[], translation?: Base.Vector3) {
            if (points !== undefined) { this.points = points; }
            if (translation !== undefined) { this.translation = translation; }
        }
        /**
         * The points to move.
         * @default undefined
         */
        points!: Base.Point3[];
        /**
         * The vector every point moves by, as `[x, y, z]`.
         * @default undefined
         */
        translation!: Base.Vector3;
    }
    /**
     * Points and the distance along each axis that `point.translateXYZPoints` moves them.
     */
    export class TranslateXYZPointsDto {
        constructor(points?: Base.Point3[], x?: number, y?: number, z?: number) {
            if (points !== undefined) { this.points = points; }
            if (x !== undefined) { this.x = x; }
            if (y !== undefined) { this.y = y; }
            if (z !== undefined) { this.z = z; }
        }
        /**
         * The points to move.
         * @default undefined
         */
        points!: Base.Point3[];
        /**
         * Distance to move along X, in model units.
         * @default 0
         */
        x = 0;
        /**
         * Distance to move along Y, which is up, in model units.
         * @default 1
         */
        y = 1;
        /**
         * Distance to move along Z, in model units.
         * @default 0
         */
        z = 0;
    }

    /**
     * Points, a center and a factor per axis for `point.scalePointsCenterXYZ`.
     */
    export class ScalePointsCenterXYZDto {
        constructor(points?: Base.Point3[], center?: Base.Point3, scaleXyz?: Base.Vector3) {
            if (points !== undefined) { this.points = points; }
            if (center !== undefined) { this.center = center; }
            if (scaleXyz !== undefined) { this.scaleXyz = scaleXyz; }
        }
        /**
         * The points to scale; they are not changed and the result keeps their order.
         * @default undefined
         */
        points!: Base.Point3[];
        /**
         * The point that stays in place while the others move away from it or toward it.
         * @default [0, 0, 0]
         */
        center: Base.Point3 = [0, 0, 0];
        /**
         * The factor for each axis as `[x, y, z]`: `[1, 2, 1]` doubles distances along Y and leaves
         * X and Z as they are.
         * @default [1, 1, 1]
         */
        scaleXyz: Base.Vector3 = [1, 1, 1];
    }

    /**
     * Points, a center, a direction and a factor for `point.stretchPointsDirFromCenter`, which
     * scales only along that direction.
     */
    export class StretchPointsDirFromCenterDto {
        constructor(points?: Base.Point3[], center?: Base.Point3, direction?: Base.Vector3, scale?: number) {
            if (points !== undefined) { this.points = points; }
            if (center !== undefined) { this.center = center; }
            if (direction !== undefined) { this.direction = direction; }
            if (scale !== undefined) { this.scale = scale; }
        }
        /**
         * The points to stretch; they are not changed and the result keeps their order.
         * @default undefined
         */
        points!: Base.Point3[];
        /**
         * The point that stays in place; distances are measured from it.
         * @default [0, 0, 0]
         */
        center?: Base.Point3 | undefined = [0, 0, 0];
        /**
         * The direction to stretch along; distances across it do not change.
         * @default [0, 0, 1]
         */
        direction?: Base.Vector3 | undefined = [0, 0, 1];
        /**
         * The factor applied along the direction; 1 leaves the points as they are, 2 doubles their
         * distance from the center along it.
         * @default 2
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        scale?: number | undefined = 2;
    }
    /**
     * Points, an axis, a center and an angle for `point.rotatePointsCenterAxis`.
     */
    export class RotatePointsCenterAxisDto {
        constructor(points?: Base.Point3[], angle?: number, axis?: Base.Vector3, center?: Base.Point3) {
            if (points !== undefined) { this.points = points; }
            if (angle !== undefined) { this.angle = angle; }
            if (axis !== undefined) { this.axis = axis; }
            if (center !== undefined) { this.center = center; }
        }
        /**
         * The points to rotate; they are not changed and the result keeps their order.
         * @default undefined
         */
        points!: Base.Point3[];
        /**
         * How far to turn, in degrees; positive is counter-clockwise when the axis points toward
         * you.
         * @default 90
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        angle = 90;
        /**
         * The direction of the axis to turn around.
         * @default [0, 1, 0]
         */
        axis: Base.Vector3 = [0, 1, 0];
        /**
         * A point the axis passes through.
         * @default [0, 0, 0]
         */
        center: Base.Point3 = [0, 0, 0];
    }
    /**
     * Points and one transformation per point for `point.transformsForPoints`; the two lists must
     * have the same length.
     */
    export class TransformsForPointsDto {
        constructor(points?: Base.Point3[], transformation?: Base.TransformMatrixes[]) {
            if (points !== undefined) { this.points = points; }
            if (transformation !== undefined) { this.transformation = transformation; }
        }
        /**
         * The points to transform, as many as there are transformations; the result keeps their
         * order.
         * @default undefined
         */
        points!: Base.Point3[];
        /**
         * One transformation per point, in the same order; each may be a matrix or a list of
         * matrices applied in order.
         * @default undefined
         */
        transformation!: Base.TransformMatrixes[];
    }
    /**
     * Three points that define a plane, for `point.normalFromThreePoints`.
     */
    export class ThreePointsNormalDto {
        constructor(point1?: Base.Point3, point2?: Base.Point3, point3?: Base.Point3, reverseNormal?: boolean) {
            if (point1 !== undefined) { this.point1 = point1; }
            if (point2 !== undefined) { this.point2 = point2; }
            if (point3 !== undefined) { this.point3 = point3; }
            if (reverseNormal !== undefined) { this.reverseNormal = reverseNormal; }
        }
        /**
         * The first point; the normal is measured from here.
         * @default undefined
         */
        point1!: Base.Point3;
        /**
         * The second point.
         * @default undefined
         */
        point2!: Base.Point3;
        /**
         * The third point; going from the first to the second to the third counter-clockwise puts
         * the normal toward you.
         * @default undefined
         */
        point3!: Base.Point3;
        /**
         * When true, the normal is flipped to point the other way.
         * @default false
         */
        reverseNormal = false;
    }
    /**
     * A corner for `point.maxFilletRadius` and `point.maxFilletRadiusHalfLine`: the corner point is
     * `end`, and `start` and `center` are the far ends of the two segments that meet there.
     */
    export class ThreePointsToleranceDto {
        constructor(start?: Base.Point3, center?: Base.Point3, end?: Base.Point3, tolerance?: number) {
            if (start !== undefined) { this.start = start; }
            if (center !== undefined) { this.center = center; }
            if (end !== undefined) { this.end = end; }
            if (tolerance !== undefined) { this.tolerance = tolerance; }
        }
        /**
         * The far end of the first segment.
         * @default undefined
         */
        start!: Base.Point3;
        /**
         * The far end of the second segment, not the corner.
         * @default undefined
         */
        center!: Base.Point3;
        /**
         * The corner where the two segments meet.
         * @default undefined
         */
        end!: Base.Point3;
        /**
         * A segment shorter than this, or an angle within it of straight or folded back, gives a
         * radius of 0.
         * @default 1e-7
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1e-7
         */
        tolerance = 1e-7;
    }
    /**
     * A polyline's points for `point.maxFilletsHalfLine` and `point.safestPointsMaxFilletHalfLine`,
     * and whether it closes back on itself.
     */
    export class PointsMaxFilletsHalfLineDto {
        constructor(points?: Base.Point3[], checkLastWithFirst?: boolean, tolerance?: number) {
            if (points !== undefined) { this.points = points; }
            if (checkLastWithFirst !== undefined) { this.checkLastWithFirst = checkLastWithFirst; }
            if (tolerance !== undefined) { this.tolerance = tolerance; }
        }
        /**
         * The points of the polyline, in order; at least three make a corner.
         * @default undefined
         */
        points!: Base.Point3[];
        /**
         * When true, the polyline is closed and the corners at its first and last points are
         * included.
         * @default false
         */
        checkLastWithFirst?: boolean | undefined = false;
        /**
         * A segment shorter than this, or an angle within it of straight or folded back, gives a
         * radius of 0.
         * @default 1e-7
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1e-7
         */
        tolerance?: number | undefined = 1e-7;
    }
    /**
     * Points to filter with `point.removeConsecutiveDuplicates`, and how close two points must be
     * to count as the same.
     */
    export class RemoveConsecutiveDuplicatesDto {
        constructor(points?: Base.Point3[], tolerance?: number, checkFirstAndLast?: boolean) {
            if (points !== undefined) { this.points = points; }
            if (tolerance !== undefined) { this.tolerance = tolerance; }
            if (checkFirstAndLast !== undefined) { this.checkFirstAndLast = checkFirstAndLast; }
        }
        /**
         * The points to filter; their order is kept.
         * @default undefined
         */
        points!: Base.Point3[];
        /**
         * Two points count as the same when every coordinate differs by less than this.
         * @default 1e-7
         * @minimum 0
         * @maximum Infinity
         * @step 1e-7
         */
        tolerance?: number | undefined = 1e-7;
        /**
         * When true, a last point that repeats the first is dropped as well, which closes a loop
         * cleanly.
         */
        checkFirstAndLast = false;
    }
    /**
     * A point and a list to search for `point.closestPointFromPoints`,
     * `point.closestPointFromPointsDistance` and `point.closestPointFromPointsIndex`.
     */
    export class ClosestPointFromPointsDto {
        constructor(points?: Base.Point3[], point?: Base.Point3) {
            if (points !== undefined) { this.points = points; }
            if (point !== undefined) { this.point = point; }
        }
        /**
         * Points to search through
         * @default undefined
         */
        points!: Base.Point3[];
        /**
         * The point to measure from; the closest of `points` to it is the result
         * @default undefined
         */
        point!: Base.Point3;
    }
    /**
     * Two points and a tolerance for `point.twoPointsAlmostEqual`.
     */
    export class TwoPointsToleranceDto {
        constructor(point1?: Base.Point3, point2?: Base.Point3, tolerance?: number) {
            if (point1 !== undefined) { this.point1 = point1; }
            if (point2 !== undefined) { this.point2 = point2; }
            if (tolerance !== undefined) { this.tolerance = tolerance; }
        }
        /**
         * First point to compare
         * @default undefined
         */
        point1!: Base.Point3;
        /**
         * Second point to compare
         * @default undefined
         */
        point2!: Base.Point3;
        /**
         * The points count as equal when the distance between them is below this.
         * @default 1e-7
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1e-7
         */
        tolerance?: number | undefined = 1e-7;
    }
    /**
     * Two points for `point.distance`: where a measurement starts and where it ends.
     */
    export class StartEndPointsDto {
        constructor(startPoint?: Base.Point3, endPoint?: Base.Point3) {
            if (startPoint !== undefined) { this.startPoint = startPoint; }
            if (endPoint !== undefined) { this.endPoint = endPoint; }
        }
        /**
         * The point the measurement starts from.
         * @default undefined
         */
        startPoint!: Base.Point3;
        /**
         * The point the measurement ends at.
         * @default undefined
         */
        endPoint!: Base.Point3;
    }
    /**
     * One start point and many end points for `point.distancesToPoints`.
     */
    export class StartEndPointsListDto {
        constructor(startPoint?: Base.Point3, endPoints?: Base.Point3[]) {
            if (startPoint !== undefined) { this.startPoint = startPoint; }
            if (endPoints !== undefined) { this.endPoints = endPoints; }
        }
        /**
         * The point every distance is measured from.
         * @default undefined
         */
        startPoint!: Base.Point3;
        /**
         * The points to measure to; the result keeps their order.
         * @default undefined
         */
        endPoints!: Base.Point3[];
    }

    /**
     * One point and a count for `point.multiplyPoint`, which repeats it.
     */
    export class MultiplyPointDto {
        constructor(point?: Base.Point3, amountOfPoints?: number) {
            if (point !== undefined) { this.point = point; }
            if (amountOfPoints !== undefined) { this.amountOfPoints = amountOfPoints; }
        }
        /**
         * The point to repeat.
         * @default undefined
         */
        point!: Base.Point3;
        /**
         * How many copies to make.
         * @default undefined
         */
        amountOfPoints!: number;
    }

    /**
     * The shape of the logarithmic spiral `point.spiral` lays out: how many points, how far it
     * reaches and how quickly it opens.
     */
    export class SpiralDto {
        constructor(radius?: number, numberPoints?: number, widening?: number, factor?: number, phi?: number) {
            if (radius !== undefined) { this.radius = radius; }
            if (numberPoints !== undefined) { this.numberPoints = numberPoints; }
            if (widening !== undefined) { this.widening = widening; }
            if (factor !== undefined) { this.factor = factor; }
            if (phi !== undefined) { this.phi = phi; }
        }
        /**
         * Growth ratio of the spiral; values near 1 make a tight spiral, larger values open it
         * faster.
         * @default 0.9
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        phi = 0.9;
        /**
         * How many points to place along the spiral.
         * @default 200
         * @minimum 0
         * @maximum Infinity
         * @step 10
         */
        numberPoints = 200;
        /**
         * How much the spiral widens per turn; larger values spread the turns further apart.
         * @default 3
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        widening = 3;
        /**
         * The distance from the origin the last point reaches, in model units.
         * @default 6
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radius = 6;
        /**
         * Scales the distance before the angle is computed, which turns the whole spiral; 1 leaves
         * it as it is.
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        factor = 1;
    }
    /**
     * The area, counts and orientation for `point.hexGridScaledToFit`, which sizes hexagons so the
     * given number of them fills the width and height.
     */
    export class HexGridScaledToFitDto {
        constructor(wdith?: number, height?: number, nrHexagonsU?: number, nrHexagonsV?: number, centerGrid?: boolean, pointsOnGround?: boolean) {
            if (wdith !== undefined) { this.width = wdith; }
            if (height !== undefined) { this.height = height; }
            if (nrHexagonsU !== undefined) { this.nrHexagonsInHeight = nrHexagonsU; }
            if (nrHexagonsV !== undefined) { this.nrHexagonsInWidth = nrHexagonsV; }
            if (centerGrid !== undefined) { this.centerGrid = centerGrid; }
            if (pointsOnGround !== undefined) { this.pointsOnGround = pointsOnGround; }
        }
        /**
         * The total width to fill, in model units; the hexagon size follows from it and
         * `nrHexagonsInWidth`.
         * @default 10
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        width?: number | undefined = 10;
        /**
         * The total height to fill, in model units. Regular hexagons may not tile it exactly, so
         * the real height can differ slightly.
         * @default 10
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        height?: number | undefined = 10;
        /**
         * How many hexagons across.
         * @default 10
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        nrHexagonsInWidth?: number | undefined = 10;
        /**
         * How many hexagons from top to bottom.
         * @default 10
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        nrHexagonsInHeight?: number | undefined = 10;
        /**
         * When true, the hexagons have a flat edge at the top and bottom; when false a corner
         * points up.
         * @default false
         */
        flatTop?: boolean | undefined = false;
        /**
         * When true, the grid is stretched so its top row reaches past the top edge, filling the rectangle
         * without a jagged border there.
         * @default false
         */
        extendTop?: boolean | undefined = false;
        /**
         * When true, the grid is stretched so its bottom row reaches past the bottom edge, filling the
         * rectangle without a jagged border there.
         * @default false
         */
        extendBottom?: boolean | undefined = false;
        /**
         * When true, the grid is stretched so its left column reaches past the left edge, filling the
         * rectangle without a jagged border there.
         * @default false
         */
        extendLeft?: boolean | undefined = false;
        /**
         * When true, the grid is stretched so its right column reaches past the right edge, filling the
         * rectangle without a jagged border there.
         * @default false
         */
        extendRight?: boolean | undefined = false;
        /**
         * When true, the middle of the grid sits at the origin instead of its corner.
         * @default false
         */
        centerGrid?: boolean | undefined = false;
        /**
         * When true, the grid lies on the XZ ground plane (Y becomes 0) instead of the XY plane.
         * @default false
         */
        pointsOnGround?: boolean | undefined = false;
    }
    /**
     * The hexagon size, the column and row counts and the placement for `point.hexGrid`.
     */
    export class HexGridCentersDto {
        constructor(nrHexagonsX?: number, nrHexagonsY?: number, radiusHexagon?: number, orientOnCenter?: boolean, pointsOnGround?: boolean) {
            if (nrHexagonsX !== undefined) { this.nrHexagonsX = nrHexagonsX; }
            if (nrHexagonsY !== undefined) { this.nrHexagonsY = nrHexagonsY; }
            if (radiusHexagon !== undefined) { this.radiusHexagon = radiusHexagon; }
            if (orientOnCenter !== undefined) { this.orientOnCenter = orientOnCenter; }
            if (pointsOnGround !== undefined) { this.pointsOnGround = pointsOnGround; }
        }
        /**
         * How many rows of hexagons along Y.
         * @default 21
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        nrHexagonsY = 21;
        /**
         * How many columns of hexagons along X.
         * @default 21
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        nrHexagonsX = 21;
        /**
         * Distance from a hexagon's center to one of its corners, in model units.
         * @default 0.2
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radiusHexagon: number = 0.2;
        /**
         * When true, the middle of the grid sits at the origin instead of its corner.
         * @default false
         */
        orientOnCenter = false;
        /**
         * When true, the grid lies on the XZ ground plane (Y becomes 0) instead of the XY plane.
         * @default false
         */
        pointsOnGround = false;
    }
}
