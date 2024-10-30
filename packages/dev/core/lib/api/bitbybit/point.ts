import { ContextBase } from "../context";
import { GeometryHelper } from "../geometry-helper";
import * as Inputs from "../inputs/inputs";
import { Base } from "../inputs/inputs";
import { Line } from "./line";
import { Transforms } from "./transforms";

/**
 * Contains various methods for points. Point in bitbybit is simply an array containing 3 numbers for [x, y, z].
 * Because of this form Point can be interchanged with Vector, which also is an array in [x, y, z] form.
 * When creating 2D points, z coordinate is simply set to 0 - [x, y, 0].
 */

export class Point {

    constructor(private readonly context: ContextBase, private readonly geometryHelper: GeometryHelper, private readonly line: Line, private readonly transforms: Transforms) { }

    /**
     * Transforms the single point
     * @param inputs Contains a point and the transformations to apply
     * @returns Transformed point
     * @group transforms
     * @shortname transform point
     * @drawable true
     */
    transformPoint(inputs: Inputs.Point.TransformPointDto): Inputs.Base.Point3 {
        const transformation = inputs.transformation;
        let transformedControlPoints = [inputs.point];
        transformedControlPoints = this.geometryHelper.transformControlPoints(transformation, transformedControlPoints);
        return transformedControlPoints[0];
    }

    /**
     * Transforms multiple points
     * @param inputs Contains points and the transformations to apply
     * @returns Transformed points
     * @group transforms
     * @shortname transform points
     * @drawable true
     */
    transformPoints(inputs: Inputs.Point.TransformPointsDto): Inputs.Base.Point3[] {
        return this.geometryHelper.transformControlPoints(inputs.transformation, inputs.points);
    }

    /**
     * Transforms multiple points by multiple transformations
     * @param inputs Contains points and the transformations to apply
     * @returns Transformed points
     * @group transforms
     * @shortname transforms for points
     * @drawable true
     */
    transformsForPoints(inputs: Inputs.Point.TransformsForPointsDto): Inputs.Base.Point3[] {
        if (inputs.points.length !== inputs.transformation.length) {
            throw new Error("You must provide equal nr of points and transformations");
        }
        return inputs.points.map((pt, index) => {
            return this.geometryHelper.transformControlPoints(inputs.transformation[index], [pt])[0];
        });
    }

    /**
     * Translate multiple points
     * @param inputs Contains points and the translation vector
     * @returns Translated points
     * @group transforms
     * @shortname translate points
     * @drawable true
     */
    translatePoints(inputs: Inputs.Point.TranslatePointsDto): Inputs.Base.Point3[] {
        const translationTransform = this.transforms.translationXYZ({ translation: inputs.translation });
        return this.geometryHelper.transformControlPoints(translationTransform, inputs.points);
    }

    /**
     * Translate multiple points
     * @param inputs Contains points and the translation vector
     * @returns Translated points
     * @group transforms
     * @shortname translate points with vectors
     * @drawable true
     */
    translatePointsWithVectors(inputs: Inputs.Point.TranslatePointsWithVectorsDto): Inputs.Base.Point3[] {
        if (inputs.points.length !== inputs.translations.length) {
            throw new Error("You must provide equal nr of points and translations");
        }
        const translationTransforms = this.transforms.translationsXYZ({ translations: inputs.translations });
        return inputs.points.map((pt, index) => {
            return this.geometryHelper.transformControlPoints(translationTransforms[index], [pt])[0];
        });
    }

    /**
     * Translate multiple points by x, y, z values provided
     * @param inputs Contains points and the translation in x y and z
     * @returns Translated points
     * @group transforms
     * @shortname translate xyz points
     * @drawable true
     */
    translateXYZPoints(inputs: Inputs.Point.TranslateXYZPointsDto): Inputs.Base.Point3[] {
        const translationTransform = this.transforms.translationXYZ({ translation: [inputs.x, inputs.y, inputs.z] });
        return this.geometryHelper.transformControlPoints(translationTransform, inputs.points);
    }

    /**
     * Scale multiple points by providing center point and x, y, z scale factors
     * @param inputs Contains points, center point and scale factors
     * @returns Scaled points
     * @group transforms
     * @shortname scale points on center
     * @drawable true
     */
    scalePointsCenterXYZ(inputs: Inputs.Point.ScalePointsCenterXYZDto): Inputs.Base.Point3[] {
        const scaleTransforms = this.transforms.scaleCenterXYZ({ center: inputs.center, scaleXyz: inputs.scaleXyz });
        return this.geometryHelper.transformControlPoints(scaleTransforms, inputs.points);
    }

    /**
     * Rotate multiple points by providing center point, axis and degrees of rotation
     * @param inputs Contains points, axis, center point and angle of rotation
     * @returns Rotated points
     * @group transforms
     * @shortname rotate points center axis
     * @drawable true
     */
    rotatePointsCenterAxis(inputs: Inputs.Point.RotatePointsCenterAxisDto): Inputs.Base.Point3[] {
        const rotationTransforms = this.transforms.rotationCenterAxis({ center: inputs.center, axis: inputs.axis, angle: inputs.angle });
        return this.geometryHelper.transformControlPoints(rotationTransforms, inputs.points);
    }

    /**
     * Measures the closest distance between a point and a collection of points
     * @param inputs Point from which to measure and points to measure the distance against
     * @returns Distance to closest point
     * @group extract
     * @shortname distance to closest pt
     * @drawable false
     */
    closestPointFromPointsDistance(inputs: Inputs.Point.ClosestPointFromPointsDto): number {
        return this.closestPointFromPointData(inputs).distance;
    }

    /**
     * Finds the closest point index between a point and a collection of points. Caution, index is not 0 based, it starts with 1.
     * @param inputs Point from which to find the index in a collection of points
     * @returns Closest point index
     * @group extract
     * @shortname index of closest pt
     * @drawable false
     */
    closestPointFromPointsIndex(inputs: Inputs.Point.ClosestPointFromPointsDto): number {
        return this.closestPointFromPointData(inputs).index;
    }

    /**
     * Finds the closest point in a collection
     * @param inputs Point and points collection to find the closest point in
     * @returns Closest point
     * @group extract
     * @shortname closest pt
     * @drawable true
     */
    closestPointFromPoints(inputs: Inputs.Point.ClosestPointFromPointsDto): Inputs.Base.Point3 {
        return this.closestPointFromPointData(inputs).point as Inputs.Base.Point3;
    }

    /**
     * Finds the distance between two points
     * @param inputs Coordinates of start and end points
     * @returns Distance
     * @group measure
     * @shortname distance
     * @drawable false
     */
    distance(inputs: Inputs.Point.StartEndPointsDto): number {
        const x = inputs.endPoint[0] - inputs.startPoint[0];
        const y = inputs.endPoint[1] - inputs.startPoint[1];
        const z = inputs.endPoint[2] - inputs.startPoint[2];
        return Math.sqrt(x * x + y * y + z * z);
    }

    /**
     * Finds the distances between the start point and multiple end points
     * @param inputs Coordinates of start and end points
     * @returns Distances
     * @group measure
     * @shortname distances to points
     * @drawable false
     */
    distancesToPoints(inputs: Inputs.Point.StartEndPointsListDto): number[] {
        return inputs.endPoints.map(pt => {
            return this.distance({ startPoint: inputs.startPoint, endPoint: pt });
        });
    }

    /**
     * Multiply point by a specified amount
     * @param inputs The point to be multiplied and the amount of points to create
     * @returns Distance
     * @group transforms
     * @shortname multiply point
     * @drawable true
     */
    multiplyPoint(inputs: Inputs.Point.MultiplyPointDto): Inputs.Base.Point3[] {
        const points = [];
        for (let i = 0; i < inputs.amountOfPoints; i++) {
            points.push([inputs.point[0], inputs.point[1], inputs.point[2]]);
        }
        return points;
    }

    /**
     * Get x coordinate of the point
     * @param inputs The point
     * @returns X coordinate
     * @group get
     * @shortname x coord
     * @drawable false
     */
    getX(inputs: Inputs.Point.PointDto): number {
        return inputs.point[0];
    }

    /**
     * Get y coordinate of the point
     * @param inputs The point
     * @returns Y coordinate
     * @group get
     * @shortname y coord
     * @drawable false
     */
    getY(inputs: Inputs.Point.PointDto): number {
        return inputs.point[1];
    }

    /**
     * Get z coordinate of the point
     * @param inputs The point
     * @returns Z coordinate
     * @group get
     * @shortname z coord
     * @drawable false
     */
    getZ(inputs: Inputs.Point.PointDto): number {
        return inputs.point[2];
    }

    /**
     * Get average point of points
     * @param inputs The points
     * @returns point
     * @group extract
     * @shortname average point
     * @drawable true
     */
    averagePoint(inputs: Inputs.Point.PointsDto): Base.Point3 {
        const xVals = [];
        const yVals = [];
        const zVals = [];

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
     * Creates the xyz point
     * @param inputs xyz information
     * @returns point 3d
     * @group create
     * @shortname point xyz
     * @drawable true
     */
    pointXYZ(inputs: Inputs.Point.PointXYZDto): Inputs.Base.Point3 {
        return [inputs.x, inputs.y, inputs.z];
    }

    /**
     * Creates the xy point
     * @param inputs xy information
     * @returns point 3d
     * @group create
     * @shortname point xy
     * @drawable false
     */
    pointXY(inputs: Inputs.Point.PointXYDto): Inputs.Base.Point2 {
        return [inputs.x, inputs.y];
    }

    /**
     * Creates the spiral out of multiple points
     * @param inputs Spiral information
     * @returns Specified number of points in the array along the spiral
     * @group create
     * @shortname spiral
     * @drawable true
     */
    spiral(inputs: Inputs.Point.SpiralDto): Inputs.Base.Point3[] {
        const phi = inputs.phi;
        const b = Math.log(phi) / (Math.PI / inputs.widening);
        const spiral = [];
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
     * Creates a flat point grid on XY plane. This grid contains center points for hexagons of the given radius.
     * Be aware that we control only the nr of hexagons to be made and not the length and width of the grid.
     * @param inputs Information about hexagon and the grid
     * @returns Points in the array on the grid
     * @group create
     * @shortname hex grid
     * @drawable true
     */
    hexGrid(inputs: Inputs.Point.HexGridCentersDto): Inputs.Base.Point3[] {
        const xLength = Math.sqrt(Math.pow(inputs.radiusHexagon, 2) - Math.pow(inputs.radiusHexagon / 2, 2));
        const points = [];
        for (let ix = 0; ix < inputs.nrHexagonsX; ix++) {
            const coordX = ix * xLength * 2;
            for (let iy = 0; iy < inputs.nrHexagonsY; iy++) {
                const coordY = (inputs.radiusHexagon + inputs.radiusHexagon / 2) * iy;
                const adjustX = coordX + (iy % 2 === 0 ? 0 : xLength);
                points.push([adjustX, coordY, 0]);
            }
        }

        if (inputs.orientOnCenter) {
            const compensateX = points[points.length - 1][0] / 2;
            const compensateY = points[points.length - 1][1] / 2;
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
     * Removes consecutive duplicates from the point array with tolerance
     * @param inputs points, tolerance and check first and last
     * @returns Points in the array without consecutive duplicates
     * @group clean
     * @shortname remove duplicates
     * @drawable true
     */
    removeConsecutiveDuplicates(inputs: Inputs.Point.RemoveConsecutiveDuplicatesDto): Inputs.Base.Point3[] {
        return this.geometryHelper.removeConsecutivePointDuplicates(inputs.points, inputs.checkFirstAndLast, inputs.tolerance);
    }

    private closestPointFromPointData(inputs: Inputs.Point.ClosestPointFromPointsDto): {
        index: number, point: Inputs.Base.Point3, distance: number
    } {
        let distance = Number.MAX_SAFE_INTEGER;
        let closestPointIndex: number;
        let point: Inputs.Base.Point3;
        for (let i = 0; i < inputs.points.length; i++) {
            const pt = inputs.points[i];
            const currentDist = this.context.verb.core.Vec.dist(inputs.point, pt);
            if (currentDist < distance) {
                distance = currentDist;
                closestPointIndex = i;
                point = pt as Inputs.Base.Point3;
            }
        }
        return { index: closestPointIndex + 1, distance, point };
    }

}
