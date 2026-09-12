import { GeometryHelper } from "./geometry-helper";
import * as Inputs from "../inputs";
import { Transforms } from "./transforms";
import { Vector } from "./vector";
import * as Models from "../models";
import { Lists } from "./lists";

/**
 * Points as plain number arrays. A point is `[x, y, z]` with Y pointing up, the same shape as a
 * vector, so the two can be passed to each other's methods; a 2D point is `[x, y]`. Every method
 * returns new points or numbers and never changes its inputs. Angles are in degrees and lengths in
 * model units.
 */

export class Point {

    constructor(private readonly geometryHelper: GeometryHelper, private readonly transforms: Transforms, private readonly vector: Vector, private readonly lists: Lists) { }

    /**
     * Applies a transformation matrix, or a list of them in order, to one point.
     *
     * Example: point [0,0,0] with a translation by [5,5,0] -> [5,5,0]
     * @param inputs - The point and the transformation to apply
     * @returns The transformed point
     * @group transforms
     * @shortname transform point
     * @drawable true
     * @example
     * ```typescript
     * const moved = bitbybit.point.transformPoint({
     *     point: [0, 0, 0],
     *     transformation: bitbybit.transforms.translationXYZ({ translation: [5, 5, 0] }),
     * });
     * ```
     */
    transformPoint(inputs: Inputs.Point.TransformPointDto): Inputs.Base.Point3 {
        const transformation = inputs.transformation;
        let transformedControlPoints = [inputs.point];
        transformedControlPoints = this.geometryHelper.transformControlPoints(transformation, transformedControlPoints);
        return transformedControlPoints[0]!;
    }

    /**
     * Applies the same transformation matrix, or list of them in order, to every point.
     *
     * Example: five points with a 90 degree rotation -> all five rotated together
     * @param inputs - The points and the transformation to apply to each
     * @returns The transformed points, in the same order
     * @group transforms
     * @shortname transform points
     * @drawable true
     * @example
     * ```typescript
     * const rotated = bitbybit.point.transformPoints({
     *     points: [[1, 0, 0], [2, 0, 0]],
     *     transformation: bitbybit.transforms.rotationCenterAxis({ center: [0, 0, 0], axis: [0, 1, 0], angle: 90 }),
     * });
     * ```
     */
    transformPoints(inputs: Inputs.Point.TransformPointsDto): Inputs.Base.Point3[] {
        return this.geometryHelper.transformControlPoints(inputs.transformation, inputs.points);
    }

    /**
     * Applies a different transformation to each point: the first transformation to the first
     * point, and so on.
     *
     * The two lists must have the same length, or an error is thrown.
     * Example: three points with three translations -> each point moved by its own translation
     * @param inputs - The points and one transformation per point
     * @returns The transformed points, in the same order
     * @group transforms
     * @shortname transforms for points
     * @drawable true
     * @example
     * ```typescript
     * const placed = bitbybit.point.transformsForPoints({
     *     points: [[0, 0, 0], [1, 0, 0]],
     *     transformation: bitbybit.transforms.translationsXYZ({ translations: [[0, 1, 0], [0, 2, 0]] }),
     * });
     * ```
     */
    transformsForPoints(inputs: Inputs.Point.TransformsForPointsDto): Inputs.Base.Point3[] {
        if (inputs.points.length !== inputs.transformation.length) {
            throw new Error("You must provide equal nr of points and transformations");
        }
        return inputs.points.map((pt, index) => {
            return this.geometryHelper.transformControlPoints(inputs.transformation[index]!, [pt])[0]!;
        });
    }

    /**
     * Moves every point by the same vector.
     *
     * Example: points [[0,0,0], [1,0,0]] by [5,5,0] -> [[5,5,0], [6,5,0]]
     * @param inputs - The points and the vector to move them by
     * @returns The moved points, in the same order
     * @group transforms
     * @shortname translate points
     * @drawable true
     * @example
     * ```typescript
     * const moved = bitbybit.point.translatePoints({ points: [[0, 0, 0], [1, 0, 0]], translation: [5, 5, 0] });
     * ```
     */
    translatePoints(inputs: Inputs.Point.TranslatePointsDto): Inputs.Base.Point3[] {
        const translationTransform = this.transforms.translationXYZ({ translation: inputs.translation });
        return this.geometryHelper.transformControlPoints(translationTransform, inputs.points);
    }

    /**
     * Moves each point by its own vector: the first point by the first vector, and so on.
     *
     * The two lists must have the same length, or an error is thrown.
     * Example: three points with three vectors -> each point moved by its own vector
     * @param inputs - The points and one vector per point
     * @returns The moved points, in the same order
     * @group transforms
     * @shortname translate points with vectors
     * @drawable true
     * @example
     * ```typescript
     * const moved = bitbybit.point.translatePointsWithVectors({
     *     points: [[0, 0, 0], [1, 0, 0]],
     *     translations: [[0, 1, 0], [0, 2, 0]],
     * });
     * ```
     */
    translatePointsWithVectors(inputs: Inputs.Point.TranslatePointsWithVectorsDto): Inputs.Base.Point3[] {
        if (inputs.points.length !== inputs.translations.length) {
            throw new Error("You must provide equal nr of points and translations");
        }
        const translationTransforms = this.transforms.translationsXYZ({ translations: inputs.translations });
        return inputs.points.map((pt, index) => {
            return this.geometryHelper.transformControlPoints(translationTransforms[index]!, [pt])[0]!;
        });
    }

    /**
     * Moves every point by the given x, y and z amounts.
     *
     * Example: point [0,0,0] with x=10, y=5, z=0 -> [10,5,0]
     * @param inputs - The points and the distance to move along each axis
     * @returns The moved points, in the same order
     * @group transforms
     * @shortname translate xyz points
     * @drawable true
     * @example
     * ```typescript
     * const lifted = bitbybit.point.translateXYZPoints({ points: [[0, 0, 0], [1, 0, 0]], x: 0, y: 5, z: 0 });
     * ```
     */
    translateXYZPoints(inputs: Inputs.Point.TranslateXYZPointsDto): Inputs.Base.Point3[] {
        const translationTransform = this.transforms.translationXYZ({ translation: [inputs.x, inputs.y, inputs.z] });
        return this.geometryHelper.transformControlPoints(translationTransform, inputs.points);
    }

    /**
     * Scales points away from or toward a center, with its own factor per axis.
     *
     * Example: point [10,0,0] about center [5,0,0] with factors [2,1,1] -> [15,0,0]
     * @param inputs - The points, the center to scale about and the factor per axis
     * @returns The scaled points, in the same order
     * @group transforms
     * @shortname scale points on center
     * @drawable true
     * @example
     * ```typescript
     * const stretched = bitbybit.point.scalePointsCenterXYZ({
     *     points: [[10, 0, 0], [0, 10, 0]],
     *     center: [0, 0, 0],
     *     scaleXyz: [2, 1, 1],
     * });
     * ```
     */
    scalePointsCenterXYZ(inputs: Inputs.Point.ScalePointsCenterXYZDto): Inputs.Base.Point3[] {
        const scaleTransforms = this.transforms.scaleCenterXYZ({ center: inputs.center, scaleXyz: inputs.scaleXyz });
        return this.geometryHelper.transformControlPoints(scaleTransforms, inputs.points);
    }

    /**
     * Stretches points along one direction, measured from a center; distances across that direction
     * stay as they are.
     *
     * Example: point [10,0,0] from center [0,0,0] along [1,0,0] with scale 2 -> [20,0,0]
     * @param inputs - The points, the center, the direction to stretch along and the factor
     * @returns The stretched points, in the same order
     * @group transforms
     * @shortname stretch points dir from center
     * @drawable true
     * @example
     * ```typescript
     * const taller = bitbybit.point.stretchPointsDirFromCenter({
     *     points: [[0, 1, 0], [0, 2, 0]],
     *     center: [0, 0, 0],
     *     direction: [0, 1, 0],
     *     scale: 2,
     * });
     * ```
     */
    stretchPointsDirFromCenter(inputs: Inputs.Point.StretchPointsDirFromCenterDto): Inputs.Base.Point3[] {
        const stretchTransforms = this.transforms.stretchDirFromCenter({ center: inputs.center, scale: inputs.scale, direction: inputs.direction });
        return this.geometryHelper.transformControlPoints(stretchTransforms, inputs.points);
    }

    /**
     * Rotates points around an axis that passes through a center.
     *
     * The angle is in degrees and turns counter-clockwise when the axis points toward you.
     * Example: point [10,0,0] around the Y axis through [0,0,0] by 90 -> [0,0,-10]
     * @param inputs - The points, the axis direction, the center it passes through and the angle in degrees
     * @returns The rotated points, in the same order
     * @group transforms
     * @shortname rotate points center axis
     * @drawable true
     * @example
     * ```typescript
     * const turned = bitbybit.point.rotatePointsCenterAxis({
     *     points: [[10, 0, 0]],
     *     center: [0, 0, 0],
     *     axis: [0, 1, 0],
     *     angle: 90,
     * });
     * ```
     */
    rotatePointsCenterAxis(inputs: Inputs.Point.RotatePointsCenterAxisDto): Inputs.Base.Point3[] {
        const rotationTransforms = this.transforms.rotationCenterAxis({ center: inputs.center, axis: inputs.axis, angle: inputs.angle });
        return this.geometryHelper.transformControlPoints(rotationTransforms, inputs.points);
    }

    /**
     * Finds the smallest axis-aligned box that holds all the points.
     *
     * The result carries the min and max corners, the center, and the width (X), height (Y) and
     * length (Z).
     * Example: points [[0,0,0], [10,5,3]] -> min [0,0,0], max [10,5,3], center [5,2.5,1.5]
     * @param inputs - The points to enclose
     * @returns The bounding box with its corners, center and sizes
     * @group extract
     * @shortname bounding box pts
     * @drawable true
     * @example
     * ```typescript
     * const box = bitbybit.point.boundingBoxOfPoints({ points: [[0, 0, 0], [10, 5, 3], [-2, 1, 1]] });
     * ```
     */
    boundingBoxOfPoints(inputs: Inputs.Point.PointsDto): Inputs.Base.BoundingBox {
        const xVals: number[] = [];
        const yVals: number[] = [];
        const zVals: number[] = [];

        inputs.points.forEach(pt => {
            xVals.push(pt[0]);
            yVals.push(pt[1]);
            zVals.push(pt[2]);
        });

        const min = [Math.min(...xVals), Math.min(...yVals), Math.min(...zVals)] as Inputs.Base.Point3;
        const max = [Math.max(...xVals), Math.max(...yVals), Math.max(...zVals)] as Inputs.Base.Point3;
        const center = [
            (min[0] + max[0]) / 2,
            (min[1] + max[1]) / 2,
            (min[2] + max[2]) / 2,
        ] as Inputs.Base.Point3;
        const width = max[0] - min[0];
        const height = max[1] - min[1];
        const length = max[2] - min[2];
        return {
            min,
            max,
            center,
            width,
            height,
            length,
        };
    }

    /**
     * Measures the distance from a point to the nearest point in a list.
     *
     * Example: point [0,0,0] and points [[5,0,0], [10,0,0], [3,0,0]] -> 3
     * @param inputs - The point to measure from and the points to search
     * @returns The distance to the nearest point, in model units
     * @group extract
     * @shortname distance to closest pt
     * @drawable false
     * @example
     * ```typescript
     * const nearest = bitbybit.point.closestPointFromPointsDistance({ point: [0, 0, 0], points: [[5, 0, 0], [3, 0, 0]] });
     * ```
     */
    closestPointFromPointsDistance(inputs: Inputs.Point.ClosestPointFromPointsDto): number {
        return this.closestPointFromPointData(inputs).distance;
    }

    /**
     * Finds the position of the nearest point in a list, counted from 1.
     *
     * Example: point [0,0,0] and points [[5,0,0], [10,0,0], [3,0,0]] -> 3
     * @param inputs - The point to measure from and the points to search
     * @returns The 1-based index of the nearest point
     * @group extract
     * @shortname index of closest pt
     * @drawable false
     * @example
     * ```typescript
     * const index = bitbybit.point.closestPointFromPointsIndex({ point: [0, 0, 0], points: [[5, 0, 0], [3, 0, 0]] });
     * ```
     */
    closestPointFromPointsIndex(inputs: Inputs.Point.ClosestPointFromPointsDto): number {
        return this.closestPointFromPointData(inputs).index;
    }

    /**
     * Finds the nearest point in a list to a given point.
     *
     * Example: point [0,0,0] and points [[5,0,0], [10,0,0], [3,0,0]] -> [3,0,0]
     * @param inputs - The point to measure from and the points to search
     * @returns The nearest point
     * @group extract
     * @shortname closest pt
     * @drawable true
     * @example
     * ```typescript
     * const nearest = bitbybit.point.closestPointFromPoints({ point: [0, 0, 0], points: [[5, 0, 0], [3, 0, 0]] });
     * ```
     */
    closestPointFromPoints(inputs: Inputs.Point.ClosestPointFromPointsDto): Inputs.Base.Point3 {
        return this.closestPointFromPointData(inputs).point;
    }

    /**
     * Measures the straight-line distance between two points.
     *
     * Example: [0,0,0] to [3,4,0] -> 5
     * @param inputs - The two points
     * @returns The distance in model units
     * @group measure
     * @shortname distance
     * @drawable false
     * @example
     * ```typescript
     * const d = bitbybit.point.distance({ startPoint: [0, 0, 0], endPoint: [3, 4, 0] });
     * ```
     */
    distance(inputs: Inputs.Point.StartEndPointsDto): number {
        const x = inputs.endPoint[0] - inputs.startPoint[0];
        const y = inputs.endPoint[1] - inputs.startPoint[1];
        const z = inputs.endPoint[2] - inputs.startPoint[2];
        return Math.sqrt(x * x + y * y + z * z);
    }

    /**
     * Measures the distance from one point to each point in a list.
     *
     * Example: start [0,0,0] and end points [[3,0,0], [0,4,0], [5,0,0]] -> [3, 4, 5]
     * @param inputs - The start point and the points to measure to
     * @returns One distance per end point, in the same order
     * @group measure
     * @shortname distances to points
     * @drawable false
     * @example
     * ```typescript
     * const distances = bitbybit.point.distancesToPoints({ startPoint: [0, 0, 0], endPoints: [[3, 0, 0], [0, 4, 0]] });
     * ```
     */
    distancesToPoints(inputs: Inputs.Point.StartEndPointsListDto): number[] {
        return inputs.endPoints.map(pt => {
            return this.distance({ startPoint: inputs.startPoint, endPoint: pt });
        });
    }

    /**
     * Repeats one point a given number of times in a list.
     *
     * Example: point [5,5,0] three times -> [[5,5,0], [5,5,0], [5,5,0]]
     * @param inputs - The point and how many copies to make
     * @returns The list of copies
     * @group transforms
     * @shortname multiply point
     * @drawable true
     * @example
     * ```typescript
     * const copies = bitbybit.point.multiplyPoint({ point: [5, 5, 0], amountOfPoints: 3 });
     * ```
     */
    multiplyPoint(inputs: Inputs.Point.MultiplyPointDto): Inputs.Base.Point3[] {
        const points: Inputs.Base.Point3[] = [];
        for (let i = 0; i < inputs.amountOfPoints; i++) {
            points.push([inputs.point[0], inputs.point[1], inputs.point[2]]);
        }
        return points;
    }

    /**
     * Reads the X value of a point.
     *
     * Example: [5,10,3] -> 5
     * @param inputs - The point
     * @returns The X value
     * @group get
     * @shortname x coord
     * @drawable false
     */
    getX(inputs: Inputs.Point.PointDto): number {
        return inputs.point[0];
    }

    /**
     * Reads the Y value of a point, the one that points up.
     *
     * Example: [5,10,3] -> 10
     * @param inputs - The point
     * @returns The Y value
     * @group get
     * @shortname y coord
     * @drawable false
     */
    getY(inputs: Inputs.Point.PointDto): number {
        return inputs.point[1];
    }

    /**
     * Reads the Z value of a point.
     *
     * Example: [5,10,3] -> 3
     * @param inputs - The point
     * @returns The Z value
     * @group get
     * @shortname z coord
     * @drawable false
     */
    getZ(inputs: Inputs.Point.PointDto): number {
        return inputs.point[2];
    }

    /**
     * Finds the average of the points, which is their center of mass when they weigh the same.
     *
     * Example: [[0,0,0], [10,0,0], [10,10,0]] -> [6.67,3.33,0]
     * @param inputs - The points to average
     * @returns The average point
     * @group extract
     * @shortname average point
     * @drawable true
     * @example
     * ```typescript
     * const center = bitbybit.point.averagePoint({ points: [[0, 0, 0], [10, 0, 0], [10, 10, 0]] });
     * ```
     */
    averagePoint(inputs: Inputs.Point.PointsDto): Inputs.Base.Point3 {
        const xVals: number[] = [];
        const yVals: number[] = [];
        const zVals: number[] = [];

        inputs.points.forEach(pt => {
            xVals.push(pt[0]);
            yVals.push(pt[1]);
            zVals.push(pt[2]);
        });

        return [
            xVals.reduce((p, c) => p + c, 0) / inputs.points.length,
            yVals.reduce((p, c) => p + c, 0) / inputs.points.length,
            zVals.reduce((p, c) => p + c, 0) / inputs.points.length,
        ];
    }

    /**
     * Builds a 3D point from its x, y and z values.
     *
     * Example: x=10, y=5, z=3 -> [10,5,3]
     * @param inputs - The three values
     * @returns The point `[x, y, z]`
     * @group create
     * @shortname point xyz
     * @drawable true
     * @example
     * ```typescript
     * const point = bitbybit.point.pointXYZ({ x: 10, y: 5, z: 3 });
     * ```
     */
    pointXYZ(inputs: Inputs.Point.PointXYZDto): Inputs.Base.Point3 {
        return [inputs.x, inputs.y, inputs.z];
    }

    /**
     * Builds a 2D point from its x and y values.
     *
     * Example: x=10, y=5 -> [10,5]
     * @param inputs - The two values
     * @returns The point `[x, y]`
     * @group create
     * @shortname point xy
     * @drawable false
     * @example
     * ```typescript
     * const point = bitbybit.point.pointXY({ x: 10, y: 5 });
     * ```
     */
    pointXY(inputs: Inputs.Point.PointXYDto): Inputs.Base.Point2 {
        return [inputs.x, inputs.y];
    }

    /**
     * Lays out points along a logarithmic spiral in the XY plane, from the origin outward to
     * `radius`.
     *
     * `numberPoints` sets how many points are placed, `phi` and `widening` how quickly the spiral
     * opens, and `factor` where along the curve it starts. Every point has z = 0.
     * @param inputs - The point count, the radius and the shape of the spiral
     * @returns The points along the spiral, from the center outward
     * @group create
     * @shortname spiral
     * @drawable true
     * @example
     * ```typescript
     * const points = bitbybit.point.spiral({ phi: 0.9, numberPoints: 100, widening: 3, radius: 10, factor: 1 });
     * ```
     */
    spiral(inputs: Inputs.Point.SpiralDto): Inputs.Base.Point3[] {
        const phi = inputs.phi;
        const b = Math.log(phi) / (Math.PI / inputs.widening);
        const spiral: Inputs.Base.Point3[] = [];
        const step = inputs.radius / inputs.numberPoints;
        for (let i = 0; i < inputs.radius; i += step) {
            const th = Math.log(i / inputs.factor) / b;
            const x = i * Math.cos(th);
            const y = i * Math.sin(th);
            spiral.push([x ? x : 0, y ? y : 0, 0]);
        }
        return spiral;
    }

    /**
     * Lays out the centers of a honeycomb of hexagons in the XY plane.
     *
     * `radiusHexagon` is the distance from a hexagon's center to a corner; columns run along X and
     * rows along Y, every second row shifted by half a column. `orientOnCenter` centers the grid on
     * the origin, `pointsOnGround` lays it on the XZ plane.
     * @param inputs - The hexagon size, how many columns and rows, and where to place the grid
     * @returns The center points, row by row
     * @group create
     * @shortname hex grid
     * @drawable true
     * @example
     * ```typescript
     * const centers = bitbybit.point.hexGrid({ radiusHexagon: 1, nrHexagonsX: 5, nrHexagonsY: 4, orientOnCenter: true, pointsOnGround: false });
     * ```
     */
    hexGrid(inputs: Inputs.Point.HexGridCentersDto): Inputs.Base.Point3[] {
        const xLength = Math.sqrt(Math.pow(inputs.radiusHexagon, 2) - Math.pow(inputs.radiusHexagon / 2, 2));
        const points: Inputs.Base.Point3[] = [];
        for (let ix = 0; ix < inputs.nrHexagonsX; ix++) {
            const coordX = ix * xLength * 2;
            for (let iy = 0; iy < inputs.nrHexagonsY; iy++) {
                const coordY = (inputs.radiusHexagon + inputs.radiusHexagon / 2) * iy;
                const adjustX = coordX + (iy % 2 === 0 ? 0 : xLength);
                points.push([adjustX, coordY, 0]);
            }
        }

        if (inputs.orientOnCenter) {
            const compensateX = points[points.length - 1]![0] / 2;
            const compensateY = points[points.length - 1]![1] / 2;
            points.forEach((p, index) => {
                points[index] = [p[0] - compensateX, p[1] - compensateY, 0];
            });
        }

        if (inputs.pointsOnGround) {
            points.forEach((p, index) => {
                points[index] = [p[0], 0, p[1]];
            });
        }

        return points;
    }

    /**
     * Lays out a honeycomb of hexagons that fills a given width and height, sizing the hexagons
     * from the counts.
     *
     * The result carries the center points and the six corners of every hexagon. A corner points up
     * unless `flatTop` is set; the extend flags stretch the outer rows past the edges to cover the
     * rectangle without a jagged border.
     * @param inputs - The area to fill, the hexagon counts, the orientation and the placement options
     * @returns The centers and the corner points of every hexagon
     * @group create
     * @shortname scaled hex grid to fit
     * @drawable false
     * @example
     * ```typescript
     * const grid = bitbybit.point.hexGridScaledToFit({
     *     width: 10,
     *     height: 10,
     *     nrHexagonsInWidth: 5,
     *     nrHexagonsInHeight: 5,
     *     flatTop: false,
     *     centerGrid: true,
     * });
     * ```
     */
    hexGridScaledToFit(inputs: Inputs.Point.HexGridScaledToFitDto): Models.Point.HexGridData {
        let width = inputs.width ?? 10;
        let height = inputs.height ?? 10;
        let nrHexagonsInHeight = inputs.nrHexagonsInHeight ?? 10;
        let nrHexagonsInWidth = inputs.nrHexagonsInWidth ?? 10;
        let extendTop = inputs.extendTop ?? false;
        let extendBottom = inputs.extendBottom ?? false;
        let extendLeft = inputs.extendLeft ?? false;
        let extendRight = inputs.extendRight ?? false;
        const {

            flatTop = false,
            centerGrid = false,
            pointsOnGround = false
        } = inputs;

        if (flatTop) {
            const oldWidth = width;
            width = height;
            height = oldWidth;
            const oldNrHexagonsInWidth = nrHexagonsInWidth;
            nrHexagonsInWidth = nrHexagonsInHeight;
            nrHexagonsInHeight = oldNrHexagonsInWidth;
            const extendTopOld = extendTop;
            const extendBottomOld = extendBottom;
            const extendLeftOld = extendLeft;
            const extendRightOld = extendRight;
            extendTop = extendLeftOld;
            extendBottom = extendRightOld;
            extendLeft = extendBottomOld;
            extendRight = extendTopOld;
        }

        if (width <= 0 || height <= 0 || nrHexagonsInWidth < 1 || nrHexagonsInHeight < 1) {
            console.warn("Hex grid dimensions and counts must be positive.");
            return { centers: [], hexagons: [], shortestDistEdge: undefined, longestDistEdge: undefined, maxFilletRadius: undefined };
        }

        const BASE_RADIUS = 1.0;
        const unscaledCenters = this.hexGrid({
            radiusHexagon: BASE_RADIUS,
            nrHexagonsX: nrHexagonsInWidth,
            nrHexagonsY: nrHexagonsInHeight,
            orientOnCenter: false,
            pointsOnGround: false
        });

        if (unscaledCenters.length === 0) {
            return { centers: [], hexagons: [], shortestDistEdge: undefined, longestDistEdge: undefined, maxFilletRadius: undefined };
        }

        const unscaledHexagons: Inputs.Base.Point3[][] = unscaledCenters.map(center =>
            this.getRegularHexagonVertices(center, BASE_RADIUS)
        );

        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        for (const hex of unscaledHexagons) {
            for (const vertex of hex) {
                if (vertex[0] < minX) minX = vertex[0];
                if (vertex[0] > maxX) maxX = vertex[0];
                if (vertex[1] < minY) minY = vertex[1];
                if (vertex[1] > maxY) maxY = vertex[1];
            }
        }

        const unscaledWidth = maxX - minX;
        const unscaledHeight = maxY - minY;

        const scaleX = (unscaledWidth > 1e-9) ? width / unscaledWidth : 1;
        const scaleY = (unscaledHeight > 1e-9) ? height / unscaledHeight : 1;

        let scaledCenters: Inputs.Base.Point3[] = unscaledCenters.map(p => [
            (p[0] - minX) * scaleX,
            (p[1] - minY) * scaleY,
            0
        ]);

        let scaledHexagons: Inputs.Base.Point3[][] = unscaledHexagons.map(hex =>
            hex.map(v => [
                (v[0] - minX) * scaleX,
                (v[1] - minY) * scaleY,
                0
            ])
        );

        let shortestDistEdge = Infinity;
        let longestDistEdge = -Infinity;
        let maxFilletRadius = 0;

        if (scaledHexagons.length !== 0) {
            const firstHex = scaledHexagons[0]!;
            maxFilletRadius = this.safestPointsMaxFilletHalfLine({
                points: firstHex,
                checkLastWithFirst: true,
                tolerance: 1e-7
            });
            firstHex.forEach((pt, index) => {
                const nextPt = firstHex[(index + 1) % firstHex.length]!;
                const dist = this.distance({ startPoint: pt, endPoint: nextPt });
                if (dist < shortestDistEdge) {
                    shortestDistEdge = dist;
                }
                if (dist > longestDistEdge) {
                    longestDistEdge = dist;
                }
            });

            if (extendTop || extendBottom || extendLeft || extendRight) {
                const pt1Pointy = firstHex[0]!;
                const pt2Pointy = firstHex[1]!;
                const cellHeight = pt1Pointy[1] - pt2Pointy[1];
                const cellWidth = pt2Pointy[0] - pt1Pointy[0];

                if (extendTop && !extendBottom) {
                    const transform = {
                        center: [0, 0, 0],
                        direction: [0, 1, 0],
                        scale: height / (height - cellHeight),
                    } as Inputs.Point.StretchPointsDirFromCenterDto;
                    scaledHexagons = scaledHexagons.map(hex => {
                        transform.points = hex;
                        return this.stretchPointsDirFromCenter(transform);
                    });
                    transform.points = scaledCenters;
                    scaledCenters = this.stretchPointsDirFromCenter(transform);
                }
                if (extendBottom && !extendTop) {
                    const transform = {
                        center: [0, height, 0],
                        direction: [0, -1, 0],
                        scale: height / (height - cellHeight),
                    } as Inputs.Point.StretchPointsDirFromCenterDto;
                    scaledHexagons = scaledHexagons.map(hex => {
                        transform.points = hex;
                        return this.stretchPointsDirFromCenter(transform);
                    });
                    transform.points = scaledCenters;
                    scaledCenters = this.stretchPointsDirFromCenter(transform);
                }
                if (extendTop && extendBottom) {
                    const transform = {
                        center: [0, height / 2, 0],
                        direction: [0, 1, 0],
                        scale: height / (height - cellHeight * 2),
                    } as Inputs.Point.StretchPointsDirFromCenterDto;
                    scaledHexagons = scaledHexagons.map(hex => {
                        transform.points = hex;
                        return this.stretchPointsDirFromCenter(transform);
                    });
                    transform.points = scaledCenters;
                    scaledCenters = this.stretchPointsDirFromCenter(transform);
                }
                if (extendLeft && !extendRight) {
                    const transform = {
                        center: [width, 0, 0],
                        direction: [1, 0, 0],
                        scale: width / (width - cellWidth),
                    } as Inputs.Point.StretchPointsDirFromCenterDto;
                    scaledHexagons = scaledHexagons.map(hex => {
                        transform.points = hex;
                        return this.stretchPointsDirFromCenter(transform);
                    });
                    transform.points = scaledCenters;
                    scaledCenters = this.stretchPointsDirFromCenter(transform);
                }
                if (extendRight && !extendLeft) {
                    const transform = {
                        center: [0, 0, 0],
                        direction: [1, 0, 0],
                        scale: width / (width - cellWidth),
                    } as Inputs.Point.StretchPointsDirFromCenterDto;
                    scaledHexagons = scaledHexagons.map(hex => {
                        transform.points = hex;
                        return this.stretchPointsDirFromCenter(transform);
                    });
                    transform.points = scaledCenters;
                    scaledCenters = this.stretchPointsDirFromCenter(transform);
                }
                if (extendLeft && extendRight) {
                    const transform = {
                        center: [width / 2, 0, 0],
                        direction: [1, 0, 0],
                        scale: width / (width - cellWidth * 2),
                    } as Inputs.Point.StretchPointsDirFromCenterDto;
                    scaledHexagons = scaledHexagons.map(hex => {
                        transform.points = hex;
                        return this.stretchPointsDirFromCenter(transform);
                    });
                    transform.points = scaledCenters;
                    scaledCenters = this.stretchPointsDirFromCenter(transform);
                }
            }
        }

        if (flatTop) {
            scaledCenters = this.rotatePointsCenterAxis({
                points: scaledCenters,
                center: [width / 2, height / 2, 0],
                axis: [0, 0, 1],
                angle: 90
            });
            scaledHexagons = scaledHexagons.map(hex => {
                return this.rotatePointsCenterAxis({
                    points: hex,
                    center: [width / 2, height / 2, 0],
                    axis: [0, 0, 1],
                    angle: 90
                });
            });

            const vecTranslation = this.vector.sub({
                first: [height / 2, width / 2, 0],
                second: [width / 2, height / 2, 0]
            }) as Inputs.Base.Vector3;
            scaledCenters = this.translatePoints({
                points: scaledCenters,
                translation: vecTranslation
            });
            scaledHexagons = scaledHexagons.map(hex => {
                return this.translatePoints({
                    points: hex,
                    translation: vecTranslation
                });
            });
        }


        if (centerGrid) {
            let shiftX = width / 2;
            let shiftY = height / 2;

            if (flatTop) {
                shiftX = height / 2;
                shiftY = width / 2;
            }

            for (let i = 0; i < scaledCenters.length; i++) {
                scaledCenters[i]![0] -= shiftX;
                scaledCenters[i]![1] -= shiftY;
            }
            for (let i = 0; i < scaledHexagons.length; i++) {
                for (let j = 0; j < scaledHexagons[i]!.length; j++) {
                    scaledHexagons[i]![j]![0] -= shiftX;
                    scaledHexagons[i]![j]![1] -= shiftY;
                }
            }
        }

        if (pointsOnGround) {
            for (let i = 0; i < scaledCenters.length; i++) {
                scaledCenters[i] = [scaledCenters[i]![0], 0, scaledCenters[i]![1]];
            }
            for (let i = 0; i < scaledHexagons.length; i++) {
                for (let j = 0; j < scaledHexagons[i]!.length; j++) {
                    scaledHexagons[i]![j] = [scaledHexagons[i]![j]![0], 0, scaledHexagons[i]![j]![1]];
                }
            }
        }

        if(flatTop){
            const grouped = this.lists.groupNth<Inputs.Base.Point3[]>({
                list: scaledHexagons.reverse(),
                nrElements: inputs.nrHexagonsInWidth ?? 10,
                keepRemainder: true,
            });
            const res = this.lists.flipLists({
                list: grouped
            });
            res.forEach(s => s.reverse());
            scaledHexagons = res.flat();

            const groupedCenters = this.lists.groupNth<Inputs.Base.Point3>({
                list: scaledCenters.reverse(),
                nrElements: inputs.nrHexagonsInWidth ?? 10,
                keepRemainder: true,
            });
            const resCenters = this.lists.flipLists({
                list: groupedCenters
            });
            resCenters.forEach(s => s.reverse());
            scaledCenters = resCenters.flat();
        }

        return {
            centers: scaledCenters,
            hexagons: scaledHexagons,
            shortestDistEdge,
            longestDistEdge,
            maxFilletRadius
        };
    }

    /**
     * Finds the largest fillet that fits a corner: the arc touches both segments and stays inside
     * them.
     *
     * The corner is `end`; `start` and `center` are the far ends of the two segments that meet
     * there. The radius is limited by the shorter segment. A straight or folded-back corner, or a
     * segment shorter than `tolerance`, gives 0.
     * @param inputs - The far end of each segment, the corner they share, and the tolerance
     * @returns The largest fillet radius, in model units
     * @group fillet
     * @shortname max fillet radius
     * @drawable false
     * @example
     * ```typescript
     * const radius = bitbybit.point.maxFilletRadius({ start: [10, 0, 0], center: [0, 10, 0], end: [0, 0, 0], tolerance: 1e-7 });
     * ```
     */
    maxFilletRadius(
        inputs: Inputs.Point.ThreePointsToleranceDto
    ): number {
        const { start: p1, center: p2, end: c, tolerance = 1e-7 } = inputs;

        const v1 = this.vector.sub({ first: p1, second: c }) as Inputs.Base.Vector3;
        const v2 = this.vector.sub({ first: p2, second: c }) as Inputs.Base.Vector3;

        const len1 = this.vector.length({ vector: v1 });
        const len2 = this.vector.length({ vector: v2 });

        if (len1 < tolerance || len2 < tolerance) {
            return 0;
        }

        const normV1 = this.vector.normalized({ vector: v1 });
        const normV2 = this.vector.normalized({ vector: v2 });
        if (!normV1 || !normV2) {
            return 0;
        }

        const cosAlpha = Math.max(-1.0, Math.min(1.0, this.vector.dot({ first: normV1, second: normV2 })));

        if (cosAlpha > 1.0 - tolerance) {
            return 0;
        }
        if (cosAlpha < -1.0 + tolerance) {
            return 0;
        }

        const alpha = Math.acos(cosAlpha);

        const tanHalfAlpha = Math.tan(alpha / 2.0);

        if (tanHalfAlpha < tolerance) {
            return 0;
        }

        const maxRadius = Math.min(len1, len2) * tanHalfAlpha;

        return maxRadius;
    }

    /**
     * Finds the largest fillet at a corner whose arc touches each segment within its nearer half,
     * so neighboring corners of a polyline can each be filleted without the arcs overlapping.
     *
     * The corner is `end`; `start` and `center` are the far ends of the two segments. A straight or
     * folded-back corner, or a segment shorter than `tolerance`, gives 0.
     * @param inputs - The far end of each segment, the corner they share, and the tolerance
     * @returns The largest fillet radius under the half-segment rule, in model units
     * @group fillet
     * @shortname max fillet radius half line
     * @drawable false
     * @example
     * ```typescript
     * const radius = bitbybit.point.maxFilletRadiusHalfLine({ start: [10, 0, 0], center: [0, 10, 0], end: [0, 0, 0], tolerance: 1e-7 });
     * ```
     */
    maxFilletRadiusHalfLine(
        inputs: Inputs.Point.ThreePointsToleranceDto
    ): number {
        const { start: p1, center: p2, end: c, tolerance = 1e-7 } = inputs;

        const v1 = this.vector.sub({ first: p1, second: c }) as Inputs.Base.Vector3;
        const v2 = this.vector.sub({ first: p2, second: c }) as Inputs.Base.Vector3;

        const len1 = this.vector.length({ vector: v1 });
        const len2 = this.vector.length({ vector: v2 });

        if (len1 < tolerance || len2 < tolerance) {
            return 0;
        }

        const normV1 = this.vector.normalized({ vector: v1 });
        const normV2 = this.vector.normalized({ vector: v2 });

        if (!normV1 || !normV2) {
            return 0;
        }

        const cosAlpha = Math.max(-1.0, Math.min(1.0, this.vector.dot({ first: normV1, second: normV2 })));

        if (cosAlpha > 1.0 - tolerance || cosAlpha < -1.0 + tolerance) {
            return 0;
        }

        const alpha = Math.acos(cosAlpha);
        const tanHalfAlpha = Math.tan(alpha / 2.0);

        if (tanHalfAlpha < tolerance) {
            return 0;
        }

        const maxRadius = Math.min(len1 / 2.0, len2 / 2.0) * tanHalfAlpha;

        return maxRadius;
    }

    /**
     * Finds the largest fillet for every corner of a polyline, each limited to the nearer half of
     * its segments so the fillets never overlap.
     *
     * With `checkLastWithFirst` on, the polyline is treated as closed and the two corners at the
     * ends are included. Fewer than three points give an empty list.
     * @param inputs - The polyline points, whether it is closed, and the tolerance
     * @returns One radius per corner, in the order of the corners
     * @group fillet
     * @shortname max fillets half line
     * @drawable false
     * @example
     * ```typescript
     * const radii = bitbybit.point.maxFilletsHalfLine({
     *     points: [[0, 0, 0], [10, 0, 0], [10, 10, 0], [0, 10, 0]],
     *     checkLastWithFirst: true,
     *     tolerance: 1e-7,
     * });
     * ```
     */
    maxFilletsHalfLine(
        inputs: Inputs.Point.PointsMaxFilletsHalfLineDto
    ): number[] {
        const { points, checkLastWithFirst = false, tolerance = 1e-7 } = inputs;
        const n = points.length;
        const results: number[] = [];

        if (n < 3) {
            return results;
        }

        for (let i = 1; i < n - 1; i++) {
            const p_prev = points[i - 1]!;
            const p_corner = points[i]!;
            const p_next = points[i + 1]!;

            const cornerInput: Inputs.Point.ThreePointsToleranceDto = {
                start: p_prev,
                center: p_next,
                end: p_corner,
                tolerance: tolerance
            };
            results.push(this.maxFilletRadiusHalfLine(cornerInput));
        }

        if (checkLastWithFirst && n >= 3) {
            const p_prev_start = points[n - 1]!;
            const p_corner_start = points[0]!;
            const p_next_start = points[1]!;
            const startCornerInput: Inputs.Point.ThreePointsToleranceDto = {
                start: p_prev_start,
                center: p_next_start,
                end: p_corner_start,
                tolerance: tolerance
            };
            results.push(this.maxFilletRadiusHalfLine(startCornerInput));

            const p_prev_end = points[n - 2]!;
            const p_corner_end = points[n - 1]!;
            const p_next_end = points[0]!;
            const endCornerInput: Inputs.Point.ThreePointsToleranceDto = {
                start: p_prev_end,
                center: p_next_end,
                end: p_corner_end,
                tolerance: tolerance
            };
            results.push(this.maxFilletRadiusHalfLine(endCornerInput));
        }

        return results;
    }

    /**
     * Finds one fillet radius that fits every corner of a polyline: the smallest of the per-corner
     * maximums under the half-segment rule.
     *
     * With `checkLastWithFirst` on, the polyline is treated as closed. Fewer than three points, or
     * any corner that allows no fillet, give 0.
     * @param inputs - The polyline points, whether it is closed, and the tolerance
     * @returns The radius that fits every corner, in model units
     * @group fillet
     * @shortname safest fillet radii points
     * @drawable false
     * @example
     * ```typescript
     * const radius = bitbybit.point.safestPointsMaxFilletHalfLine({
     *     points: [[0, 0, 0], [10, 0, 0], [10, 10, 0], [0, 10, 0]],
     *     checkLastWithFirst: true,
     *     tolerance: 1e-7,
     * });
     * ```
     */
    safestPointsMaxFilletHalfLine(
        inputs: Inputs.Point.PointsMaxFilletsHalfLineDto
    ): number {
        const allMaxRadii = this.maxFilletsHalfLine(inputs);

        if (allMaxRadii.length === 0) {
            return 0;
        }

        const safestRadius = Math.min(...allMaxRadii);

        return Math.max(0, safestRadius);
    }

    /**
     * Removes a point when it repeats the one right before it; the same point further away is kept.
     *
     * With `checkFirstAndLast` on, a last point that repeats the first is dropped too. Points
     * within `tolerance` of each other count as the same.
     * Example: [[0,0,0], [0,0,0], [1,0,0], [1,0,0], [2,0,0]] -> [[0,0,0], [1,0,0], [2,0,0]]
     * @param inputs - The points, the tolerance and whether to compare the first and last
     * @returns The points without consecutive repeats
     * @group clean
     * @shortname remove duplicates
     * @drawable true
     * @example
     * ```typescript
     * const cleaned = bitbybit.point.removeConsecutiveDuplicates({
     *     points: [[0, 0, 0], [0, 0, 0], [1, 0, 0]],
     *     tolerance: 1e-7,
     *     checkFirstAndLast: false,
     * });
     * ```
     */
    removeConsecutiveDuplicates(inputs: Inputs.Point.RemoveConsecutiveDuplicatesDto): Inputs.Base.Point3[] {
        return this.geometryHelper.removeConsecutivePointDuplicates(inputs.points, inputs.checkFirstAndLast, inputs.tolerance);
    }

    /**
     * Finds the direction at right angles to the plane through three points, with length 1.
     *
     * The direction follows the right-hand rule going from the first point to the second to the
     * third; `reverseNormal` flips it. Points on one line have no plane, so the result is
     * undefined.
     * Example: [0,0,0], [1,0,0], [0,1,0] -> [0,0,1]
     * @param inputs - The three points and whether to flip the result
     * @returns The unit normal, or undefined when the points are on one line
     * @group create
     * @shortname normal from 3 points
     * @drawable true
     * @example
     * ```typescript
     * const normal = bitbybit.point.normalFromThreePoints({
     *     point1: [0, 0, 0],
     *     point2: [1, 0, 0],
     *     point3: [0, 1, 0],
     *     reverseNormal: false,
     * });
     * ```
     */
    normalFromThreePoints(inputs: Inputs.Point.ThreePointsNormalDto): Inputs.Base.Vector3 | undefined {
        const p1 = inputs.point1;
        const p2 = inputs.point2;
        const p3 = inputs.point3;

        if (!p1 || !p2 || !p3 || p1.length !== 3 || p2.length !== 3 || p3.length !== 3) {
            throw new Error("All points must be arrays of 3 numbers [x, y, z]");
        }

        const ax = p2[0] - p1[0];
        const ay = p2[1] - p1[1];
        const az = p2[2] - p1[2];

        const bx = p3[0] - p1[0];
        const by = p3[1] - p1[1];
        const bz = p3[2] - p1[2];

        let nx = (ay * bz) - (az * by);
        let ny = (az * bx) - (ax * bz);
        let nz = (ax * by) - (ay * bx);

        if (nx === 0 && ny === 0 && nz === 0) {
            console.warn("Points are collinear or coincident; cannot calculate a unique normal.");
            return undefined;
        }

        if (inputs.reverseNormal) {
            nx = -nx;
            ny = -ny;
            nz = -nz;
        }

        return this.vector.normalized({ vector: [nx, ny, nz] }) as Inputs.Base.Vector3;
    }

    private closestPointFromPointData(inputs: Inputs.Point.ClosestPointFromPointsDto): {
        index: number, point: Inputs.Base.Point3, distance: number
    } {
        let distance = Number.MAX_SAFE_INTEGER;
        let closestPointIndex!: number;
        let point!: Inputs.Base.Point3;
        for (let i = 0; i < inputs.points.length; i++) {
            const pt = inputs.points[i]!;
            const currentDist = this.distance({ startPoint: inputs.point, endPoint: pt });
            if (currentDist < distance) {
                distance = currentDist;
                closestPointIndex = i;
                point = pt;
            }
        }
        return { index: closestPointIndex + 1, distance, point };
    }

    /**
     * Tells whether two points are closer together than a tolerance.
     *
     * Example: [1.0000001, 2, 3] and [1, 2, 3] with tolerance 1e-6 -> true
     * @param inputs - The two points and the tolerance
     * @returns True when the distance between them is below the tolerance
     * @group measure
     * @shortname two points almost equal
     * @drawable false
     * @example
     * ```typescript
     * const same = bitbybit.point.twoPointsAlmostEqual({ point1: [1, 2, 3], point2: [1, 2, 3.0000001], tolerance: 1e-6 });
     * ```
     */
    twoPointsAlmostEqual(inputs: Inputs.Point.TwoPointsToleranceDto): boolean {
        const p1 = inputs.point1;
        const p2 = inputs.point2;
        const dist = this.distance({ startPoint: p1, endPoint: p2 });
        return dist < (inputs.tolerance ?? 1e-7);
    }

    /**
     * Sorts points by X, then by Y for equal X, then by Z.
     *
     * Example: [[5,0,0], [1,0,0], [3,0,0]] -> [[1,0,0], [3,0,0], [5,0,0]]
     * @param inputs - The points to sort
     * @returns A sorted copy of the points
     * @group sort
     * @shortname sort points
     * @drawable true
     * @example
     * ```typescript
     * const sorted = bitbybit.point.sortPoints({ points: [[5, 0, 0], [1, 0, 0], [3, 0, 0]] });
     * ```
     */
    sortPoints(inputs: Inputs.Point.PointsDto): Inputs.Base.Point3[] {
        return [...inputs.points].sort((a, b) => {
            if (a[0] !== b[0]) return a[0] - b[0];
            if (a[1] !== b[1]) return a[1] - b[1];
            return a[2] - b[2];
        });
    }

    /**
     * Calculates the 6 vertices of a regular flat-top hexagon.
     * @param center The center point [x, y, z].
     * @param radius The radius (distance from center to vertex).
     * @returns An array of 6 Point3 vertices in counter-clockwise order.
     */
    private getRegularHexagonVertices(center: Inputs.Base.Point3, radius: number): Inputs.Base.Point3[] {
        const vertices: Inputs.Base.Point3[] = [];
        const cx = center[0];
        const cy = center[1];
        const cz = center[2];

        const angleStep = Math.PI / 3;

        for (let i = 0; i < 6; i++) {
            const angle = angleStep * i;
            vertices.push([
                cx + radius * Math.sin(angle),
                cy + radius * Math.cos(angle),
                cz
            ]);
        }
        return vertices;
    }
}
