import { GeometryHelper } from "./geometry-helper";
import * as Inputs from "../inputs";
import { Transforms } from "./transforms";
import { Vector } from "./vector";
import * as Models from "../models";

/**
 * Contains various methods for points. Point in bitbybit is simply an array containing 3 numbers for [x, y, z].
 * Because of this form Point can be interchanged with Vector, which also is an array in [x, y, z] form.
 * When creating 2D points, z coordinate is simply set to 0 - [x, y, 0].
 */

export class Point {

    constructor(private readonly geometryHelper: GeometryHelper, private readonly transforms: Transforms, private readonly vector: Vector) { }

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
     * Stretch multiple points by providing center point, direction and uniform scale factor
     * @param inputs Contains points, center point, direction and scale factor
     * @returns Stretched points
     * @group transforms
     * @shortname stretch points dir from center
     * @drawable true
     */
    stretchPointsDirFromCenter(inputs: Inputs.Point.StretchPointsDirFromCenterDto): Inputs.Base.Point3[] {
        const stretchTransforms = this.transforms.stretchDirFromCenter({ center: inputs.center, scale: inputs.scale, direction: inputs.direction });
        return this.geometryHelper.transformControlPoints(stretchTransforms, inputs.points);
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
     * Gets a bounding box of the points
     * @param inputs Points
     * @returns Bounding box of points
     * @group extract
     * @shortname bounding box pts
     * @drawable true
     */
    boundingBoxOfPoints(inputs: Inputs.Point.PointsDto): Inputs.Base.BoundingBox {
        const xVals = [];
        const yVals = [];
        const zVals = [];

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
    averagePoint(inputs: Inputs.Point.PointsDto): Inputs.Base.Point3 {
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
     * Creates a pointy-top hexagon grid, scaling hexagons to fit specified dimensions exactly.
     * Returns both center points and the vertices of each (potentially scaled) hexagon.
     * Hexagons are ordered column-first, then row-first.
     * @param inputs Information about the desired grid dimensions and hexagon counts.
     * @returns An object containing the array of center points and an array of hexagon vertex arrays.
     * @group create
     * @shortname scaled hex grid to fit
     * @drawable false
     */
    hexGridScaledToFit(inputs: Inputs.Point.HexGridScaledToFitDto): Models.Point.HexGridData {
        const {
            width,
            height,
            nrHexagonsInHeight,
            nrHexagonsInWidth,
            extendTop = false,
            extendBottom = false,
            extendLeft = false,
            extendRight = false,
            centerGrid = false,
            pointsOnGround = false
        } = inputs;

        // --- Input Validation ---
        if (width <= 0 || height <= 0 || nrHexagonsInWidth < 1 || nrHexagonsInHeight < 1) {
            console.warn("Hex grid dimensions and counts must be positive.");
            return { centers: [], hexagons: [], shortestDistEdge: undefined, longestDistEdge: undefined, maxFilletRadius: undefined };
        }

        // --- Generate Unscaled Regular Grid Centers (Radius = 1) ---
        // Use the *existing* hexGrid function, ensuring it doesn't center or project yet.
        const BASE_RADIUS = 1.0;
        const unscaledCenters = this.hexGrid({
            radiusHexagon: BASE_RADIUS,
            nrHexagonsX: nrHexagonsInWidth,
            nrHexagonsY: nrHexagonsInHeight,
            orientOnCenter: false, // Important: Do not center here
            pointsOnGround: false  // Keep on XY plane for now
        });

        if (unscaledCenters.length === 0) {
            return { centers: [], hexagons: [], shortestDistEdge: undefined, longestDistEdge: undefined, maxFilletRadius: undefined }; // Return empty if base grid failed
        }

        // --- Generate Unscaled Regular Hexagon Vertices (Radius = 1) ---
        const unscaledHexagons: Inputs.Base.Point3[][] = unscaledCenters.map(center =>
            this.getRegularHexagonVertices(center, BASE_RADIUS)
        );

        // --- Determine Dimensions of the Unscaled Grid Bounding Box ---
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

        // --- Step 4: Calculate Scaling Factors ---
        // Handle potential zero dimensions if only 1 hex (W/H would be based on hex size)
        const scaleX = (unscaledWidth > 1e-9) ? width / unscaledWidth : 1;
        const scaleY = (unscaledHeight > 1e-9) ? height / unscaledHeight : 1;
        // If unscaled W/H is 0 (e.g., 1x1 grid), scale=1 means the final hex will have
        // width/height derived from its regular R=1 shape, not fitting totalW/H.
        // This might need adjustment if a single hex *must* fill the total W/H.
        // For now, assume nrU/nrV > 1 or accept R=1 size for single hex.

        // --- Scale Centers and Vertices ---
        // Scale relative to the min corner of the unscaled grid (minX, minY)
        const scaledCenters: Inputs.Base.Point3[] = unscaledCenters.map(p => [
            (p[0] - minX) * scaleX,
            (p[1] - minY) * scaleY,
            0 // Keep Z=0 for now
        ]);

        let scaledHexagons: Inputs.Base.Point3[][] = unscaledHexagons.map(hex =>
            hex.map(v => [
                (v[0] - minX) * scaleX,
                (v[1] - minY) * scaleY,
                0 // Keep Z=0 for now
            ])
        );

        let shortestDistEdge = Infinity;
        let longestDistEdge = -Infinity;
        let maxFilletRadius = 0;

        // --- Calculate Shortes/Longest & Extensions ---
        if (scaledHexagons.length !== 0) {
            const firstHex = scaledHexagons[0];
            maxFilletRadius = this.safestPointsMaxFilletHalfLine({
                points: firstHex,
                checkLastWithFirst: true,
                tolerance: 1e-7
            });
            // Calculate the shortest and longest edge distances
            firstHex.forEach((pt, index) => {
                const nextPt = firstHex[(index + 1) % firstHex.length];
                const dist = this.distance({ startPoint: pt, endPoint: nextPt });
                if (dist < shortestDistEdge) {
                    shortestDistEdge = dist;
                }
                if (dist > longestDistEdge) {
                    longestDistEdge = dist;
                }
            });

            if (extendTop || extendBottom || extendLeft || extendRight) {
                const pt1Pointy = firstHex[0];
                const pt2Pointy = firstHex[1];
                const cellHeight = pt1Pointy[1] - pt2Pointy[1];
                const cellWidth = pt2Pointy[0] - pt1Pointy[0];

                if (extendTop && !extendBottom) {
                    scaledHexagons = scaledHexagons.map(hex => {
                        return this.stretchPointsDirFromCenter({
                            points: hex,
                            center: [0, 0, 0],
                            direction: [0, 1, 0],
                            scale: height / (height - cellHeight),
                        });
                    });
                }
                if (extendBottom && !extendTop) {
                    scaledHexagons = scaledHexagons.map(hex => {
                        return this.stretchPointsDirFromCenter({
                            points: hex,
                            center: [0, height, 0],
                            direction: [0, -1, 0],
                            scale: height / (height - cellHeight),
                        });
                    });
                }
                if (extendTop && extendBottom) {
                    scaledHexagons = scaledHexagons.map(hex => {
                        return this.stretchPointsDirFromCenter({
                            points: hex,
                            center: [0, height / 2, 0],
                            direction: [0, 1, 0],
                            scale: height / (height - cellHeight * 2),
                        });
                    });
                }
                if (extendLeft && !extendRight) {
                    scaledHexagons = scaledHexagons.map(hex => {
                        return this.stretchPointsDirFromCenter({
                            points: hex,
                            center: [width, 0, 0],
                            direction: [1, 0, 0],
                            scale: width / (width - cellWidth),
                        });
                    });
                }
                if (extendRight && !extendLeft) {
                    scaledHexagons = scaledHexagons.map(hex => {
                        return this.stretchPointsDirFromCenter({
                            points: hex,
                            center: [0, 0, 0],
                            direction: [1, 0, 0],
                            scale: width / (width - cellWidth),
                        });
                    });
                }
                if (extendLeft && extendRight) {
                    scaledHexagons = scaledHexagons.map(hex => {
                        return this.stretchPointsDirFromCenter({
                            points: hex,
                            center: [width / 2, 0, 0],
                            direction: [1, 0, 0],
                            scale: width / (width - cellWidth * 2),
                        });
                    });
                }
            }
        }

        // --- Apply Optional Centering ---
        // Center the scaled grid (currently starting at [0,0]) around [0,0]
        if (centerGrid) {
            const shiftX = width / 2;
            const shiftY = height / 2;

            for (let i = 0; i < scaledCenters.length; i++) {
                scaledCenters[i][0] -= shiftX;
                scaledCenters[i][1] -= shiftY;
            }
            for (let i = 0; i < scaledHexagons.length; i++) {
                for (let j = 0; j < scaledHexagons[i].length; j++) {
                    scaledHexagons[i][j][0] -= shiftX;
                    scaledHexagons[i][j][1] -= shiftY;
                }
            }
        }

        // --- Apply Optional Ground Projection ---
        if (pointsOnGround) {
            for (let i = 0; i < scaledCenters.length; i++) {
                scaledCenters[i] = [scaledCenters[i][0], 0, scaledCenters[i][1]];
            }
            for (let i = 0; i < scaledHexagons.length; i++) {
                for (let j = 0; j < scaledHexagons[i].length; j++) {
                    scaledHexagons[i][j] = [scaledHexagons[i][j][0], 0, scaledHexagons[i][j][1]];
                }
            }
        }

        // --- Return Result ---
        return {
            centers: scaledCenters,
            hexagons: scaledHexagons,
            shortestDistEdge,
            longestDistEdge,
            maxFilletRadius
        };
    }

    /**
     * Calculates the maximum possible fillet radius at a corner formed by two line segments
     * sharing an endpoint (C), such that the fillet arc is tangent to both segments
     * and lies entirely within them.
     * @param inputs three points and the tolerance
     * @returns the maximum fillet radius
     * @group fillet
     * @shortname max fillet radius
     * @drawable false
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

        // Calculate the cosine of the angle between the vectors
        // Clamp to [-1, 1] to avoid potential domain errors with acos due to floating point inaccuracies
        const cosAlpha = Math.max(-1.0, Math.min(1.0, this.vector.dot({ first: normV1, second: normV2 })));

        // Check for collinearity
        // If vectors point in the same direction (angle ~ 0), no fillet
        if (cosAlpha > 1.0 - tolerance) {
            return 0;
        }
        // If vectors point in opposite directions (angle ~ 180 deg), no corner for a fillet
        if (cosAlpha < -1.0 + tolerance) {
            return 0;
        }

        // Calculate the angle alpha (0 < alpha < PI)
        const alpha = Math.acos(cosAlpha);

        // Calculate tan(alpha / 2)
        // alpha/2 is between 0 and PI/2, so tan is positive and non-zero
        const tanHalfAlpha = Math.tan(alpha / 2.0);

        // If tanHalfAlpha is extremely small (alpha near 0, shouldn't happen due to collinearity check), return 0
        if (tanHalfAlpha < tolerance) {
            return 0;
        }

        // The distance 'd' from corner C to the tangent point must be less than or equal to the segment lengths.
        // d = r / tan(alpha/2) <= min(len1, len2)
        // r <= min(len1, len2) * tan(alpha/2)
        const maxRadius = Math.min(len1, len2) * tanHalfAlpha;

        return maxRadius;
    }

    /**
     * Calculates the maximum possible fillet radius at a corner C, such that the fillet arc
     * is tangent to both segments (P1-C, P2-C) and the tangent points lie within
     * the first half of each segment (measured from C).
     * @param inputs three points and the tolerance
     * @returns the maximum fillet radius
     * @group fillet
     * @shortname max fillet radius half line
     * @drawable false
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
            return 0; // Collinear
        }

        const alpha = Math.acos(cosAlpha);
        const tanHalfAlpha = Math.tan(alpha / 2.0);

        if (tanHalfAlpha < tolerance) {
            return 0;
        }

        // The distance 'd' from corner C to the tangent point must be less than or equal
        // to HALF the length of each segment.
        // d = r / tan(alpha/2) <= min(len1 / 2, len2 / 2)
        // r <= min(len1 / 2, len2 / 2) * tan(alpha/2)
        const maxRadius = Math.min(len1 / 2.0, len2 / 2.0) * tanHalfAlpha;

        return maxRadius;
    }

    /**
     * Calculates the maximum possible fillet radius at each corner of a polyline formed by 
     * formed by a series of points. The fillet radius is calculated for each internal
     * corner and optionally for the closing corners if the polyline is closed.
     * @param inputs Points, checkLastWithFirst flag, and tolerance
     * @returns Array of maximum fillet radii for each corner
     * @group fillet
     * @shortname max fillets half line
     * @drawable false
     */
    maxFilletsHalfLine(
        inputs: Inputs.Point.PointsMaxFilletsHalfLineDto
    ): number[] {
        const { points, checkLastWithFirst = false, tolerance = 1e-7 } = inputs;
        const n = points.length;
        const results: number[] = [];

        // Need at least 3 points to form a corner
        if (n < 3) {
            return results;
        }

        // 1. Calculate fillets for internal corners (P[1] to P[n-2])
        for (let i = 1; i < n - 1; i++) {
            const p_prev = points[i - 1];
            const p_corner = points[i];
            const p_next = points[i + 1];

            // Map geometric points to the DTO structure used by calculateMaxFilletRadiusHalfLine
            // DTO: { start: P_prev, center: P_next, end: P_corner, tolerance }
            const cornerInput: Inputs.Point.ThreePointsToleranceDto = {
                start: p_prev,
                center: p_next,
                end: p_corner,
                tolerance: tolerance
            };
            results.push(this.maxFilletRadiusHalfLine(cornerInput));
        }

        // 2. Calculate fillets for closing corners if it's a closed polyline
        if (checkLastWithFirst && n >= 3) {
            // Corner at P[0] (formed by P[n-1]-P[0] and P[1]-P[0])
            const p_prev_start = points[n - 1]; // Previous point is the last point
            const p_corner_start = points[0];
            const p_next_start = points[1];
            const startCornerInput: Inputs.Point.ThreePointsToleranceDto = {
                start: p_prev_start,
                center: p_next_start,
                end: p_corner_start,
                tolerance: tolerance
            };
            results.push(this.maxFilletRadiusHalfLine(startCornerInput));

            // Corner at P[n-1] (formed by P[n-2]-P[n-1] and P[0]-P[n-1])
            const p_prev_end = points[n - 2];
            const p_corner_end = points[n - 1];
            const p_next_end = points[0];     // Next point wraps around to the first point
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
     * Calculates the single safest maximum fillet radius that can be applied
     * uniformly to all corners of collection of points, based on the 'half-line' constraint.
     * This is determined by finding the minimum of the maximum possible fillet
     * radii calculated for each individual corner.
     * @param inputs Defines the points, whether it's closed, and an optional tolerance.
     * @returns The smallest value from the results of pointsMaxFilletsHalfLine.
     *          Returns 0 if the polyline has fewer than 3 points or if any
     *          calculated maximum radius is 0.
     * @group fillet
     * @shortname safest fillet radii points
     * @drawable false
     */
    safestPointsMaxFilletHalfLine(
        inputs: Inputs.Point.PointsMaxFilletsHalfLineDto
    ): number {
        const allMaxRadii = this.maxFilletsHalfLine(inputs);

        if (allMaxRadii.length === 0) {
            // No corners, or fewer than 3 points. No fillet possible.
            return 0;
        }

        // Find the minimum radius among all calculated maximums.
        // If any corner calculation resulted in 0, the safest radius is 0.
        const safestRadius = Math.min(...allMaxRadii);

        // Ensure we don't return a negative radius if Math.min had weird input (shouldn't happen here)
        return Math.max(0, safestRadius);
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

    /**
     * Creates a normal vector from 3 points
     * @param inputs Three points and the reverse normal flag
     * @returns Normal vector
     * @group create
     * @shortname normal from 3 points
     * @drawable true
     */
    normalFromThreePoints(inputs: Inputs.Point.ThreePointsNormalDto): Inputs.Base.Vector3 {
        const p1 = inputs.point1;
        const p2 = inputs.point2;
        const p3 = inputs.point3;

        if (!p1 || !p2 || !p3 || p1.length !== 3 || p2.length !== 3 || p3.length !== 3) {
            throw new Error("All points must be arrays of 3 numbers [x, y, z]");
        }

        // Calculate vector A = p2 - p1
        const ax = p2[0] - p1[0];
        const ay = p2[1] - p1[1];
        const az = p2[2] - p1[2];

        // Calculate vector B = p3 - p1
        const bx = p3[0] - p1[0];
        const by = p3[1] - p1[1];
        const bz = p3[2] - p1[2];

        // Calculate the cross product N = A x B
        let nx = (ay * bz) - (az * by);
        let ny = (az * bx) - (ax * bz);
        let nz = (ax * by) - (ay * bx);

        // Check for collinear points (resulting in a zero vector)
        // A zero vector indicates the points don't form a unique plane.
        // You might want to handle this case depending on your application.
        if (nx === 0 && ny === 0 && nz === 0) {
            console.warn("Points are collinear or coincident; cannot calculate a unique normal.");
            return undefined; // Or return [0, 0, 0] if that's acceptable
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
        let closestPointIndex: number;
        let point: Inputs.Base.Point3;
        for (let i = 0; i < inputs.points.length; i++) {
            const pt = inputs.points[i];
            const currentDist = this.distance({ startPoint: inputs.point, endPoint: pt });
            if (currentDist < distance) {
                distance = currentDist;
                closestPointIndex = i;
                point = pt as Inputs.Base.Point3;
            }
        }
        return { index: closestPointIndex + 1, distance, point };
    }

    /**
     * Checks if two points are almost equal
     * @param inputs Two points and the tolerance
     * @returns true if the points are almost equal
     * @group measure
     * @shortname two points almost equal
     * @drawable false
     */
    twoPointsAlmostEqual(inputs: Inputs.Point.TwoPointsToleranceDto): boolean {
        const p1 = inputs.point1;
        const p2 = inputs.point2;
        const dist = this.distance({ startPoint: p1, endPoint: p2 });
        return dist < inputs.tolerance;
    }

    /**
     * Sorts points lexicographically (X, then Y, then Z) 
     * @param inputs points
     * @returns sorted points
     * @group sort
     * @shortname sort points
     * @drawable true
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
                cz // Maintain original Z
            ]);
        }
        return vertices;
    }
}
