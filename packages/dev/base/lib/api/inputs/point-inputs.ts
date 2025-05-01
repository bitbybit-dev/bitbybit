/* eslint-disable @typescript-eslint/no-namespace */
import { Base } from "./base-inputs";

export namespace Point {
    export class PointDto {
        constructor(point?: Base.Point3) {
            if (point !== undefined) { this.point = point; }
        }
        /**
         * Point
         * @default undefined
         */
        point: Base.Point3;
    }
    export class PointXYZDto {
        constructor(x?: number, y?: number, z?: number) {
            if (x !== undefined) { this.x = x; }
            if (y !== undefined) { this.y = y; }
            if (z !== undefined) { this.z = z; }
        }
        /**
         * Point
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        x = 0;
        /**
         * Point
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        y = 0;
        /**
        * Point
        * @default 0
        * @minimum -Infinity
        * @maximum Infinity
        * @step 0.1
        */
        z = 0;
    }
    export class PointXYDto {
        constructor(x?: number, y?: number) {
            if (x !== undefined) { this.x = x; }
            if (y !== undefined) { this.y = y; }
        }
        /**
         * Point
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        x = 0;
        /**
         * Point
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        y = 0;
    }
    export class PointsDto {
        constructor(points?: Base.Point3[]) {
            if (points !== undefined) { this.points = points; }
        }
        /**
         * Points
         * @default undefined
         */
        points: Base.Point3[];
    }
    export class TwoPointsDto {
        constructor(point1?: Base.Point3, point2?: Base.Point3) {
            if (point1 !== undefined) { this.point1 = point1; }
            if (point2 !== undefined) { this.point2 = point2; }
        }
        /**
         * Point 1
         * @default undefined
         */
        point1: Base.Point3;
        /**
         * Point 2
         * @default undefined
         */
        point2: Base.Point3;
    }
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
         * Point
         * @default undefined
         */
        point: Base.Point3;
        /**
         * Value between 0 and 1
         * @default 1
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        opacity = 1;
        /**
         * Size of the point
         * @default 3
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        size = 3;
        /**
         * Hex colour string
         * @default #444444
         */
        colours: string | string[] = "#444444";
        /**
         * Indicates wether the position of this point will change in time
         * @default false
         */
        updatable = false;
        /**
         * Point mesh variable in case it already exists and needs updating
         * @default undefined
         */
        pointMesh?: T;
    }
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
         * Point
         * @default undefined
         */
        points: Base.Point3[];
        /**
         * Value between 0 and 1
         * @default 1
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        opacity = 1;
        /**
         * Size of the points
         * @default 0.1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        size = 0.1;
        /**
         * Hex colour string or collection of strings
         * @default #444444
         */
        colours: string | string[] = "#444444";
        /**
         * Indicates wether the position of this point will change in time
         * @default false
         */
        updatable = false;
        /**
         * Points mesh variable in case it already exists and needs updating
         * @default undefined
         */
        pointsMesh?: T;
    }
    export class TransformPointDto {
        constructor(point?: Base.Point3, transformation?: Base.TransformMatrixes) {
            if (point !== undefined) { this.point = point; }
            if (transformation !== undefined) { this.transformation = transformation; }
        }
        /**
         * Point to transform
         * @default undefined
         */
        point: Base.Point3;
        /**
         * Transformation matrix or a list of transformation matrixes
         * @default undefined
         */
        transformation: Base.TransformMatrixes;
    }
    export class TransformPointsDto {
        constructor(points?: Base.Point3[], transformation?: Base.TransformMatrixes) {
            if (points !== undefined) { this.points = points; }
            if (transformation !== undefined) { this.transformation = transformation; }
        }
        /**
         * Points to transform
         * @default undefined
         */
        points: Base.Point3[];
        /**
         * Transformation matrix or a list of transformation matrixes
         * @default undefined
         */
        transformation: Base.TransformMatrixes;
    }
    export class TranslatePointsWithVectorsDto {
        constructor(points?: Base.Point3[], translations?: Base.Vector3[]) {
            if (points !== undefined) { this.points = points; }
            if (translations !== undefined) { this.translations = translations; }
        }
        /**
         * Points to transform
         * @default undefined
         */
        points: Base.Point3[];
        /**
         * Translation vectors for each point
         * @default undefined
         */
        translations: Base.Vector3[];
    }
    export class TranslatePointsDto {
        constructor(points?: Base.Point3[], translation?: Base.Vector3) {
            if (points !== undefined) { this.points = points; }
            if (translation !== undefined) { this.translation = translation; }
        }
        /**
         * Points to transform
         * @default undefined
         */
        points: Base.Point3[];
        /**
         * Translation vector with x, y and z values
         * @default undefined
         */
        translation: Base.Vector3;
    }
    export class TranslateXYZPointsDto {
        constructor(points?: Base.Point3[], x?: number, y?: number, z?: number) {
            if (points !== undefined) { this.points = points; }
            if (x !== undefined) { this.x = x; }
            if (y !== undefined) { this.y = y; }
            if (z !== undefined) { this.z = z; }
        }
        /**
         * Points to transform
         * @default undefined
         */
        points: Base.Point3[];
        /**
         * X vector value
         * @default 0
         */
        x = 0;
        /**
        * Y vector value
        * @default 1
        */
        y = 1;
        /**
        * Z vector value
        * @default 0
        */
        z = 0;
    }

    export class ScalePointsCenterXYZDto {
        constructor(points?: Base.Point3[], center?: Base.Point3, scaleXyz?: Base.Vector3) {
            if (points !== undefined) { this.points = points; }
            if (center !== undefined) { this.center = center; }
            if (scaleXyz !== undefined) { this.scaleXyz = scaleXyz; }
        }
        /**
         * Points to transform
         * @default undefined
         */
        points: Base.Point3[];
        /**
         * The center from which the scaling is applied
         * @default [0, 0, 0]
         */
        center: Base.Point3 = [0, 0, 0];
        /**
         * Scaling factors for each axis [1, 2, 1] means that Y axis will be scaled 200% and both x and z axis will remain on 100%
         * @default [1, 1, 1]
         */
        scaleXyz: Base.Vector3 = [1, 1, 1];
    }

    export class StretchPointsDirFromCenterDto {
        constructor(points?: Base.Point3[], center?: Base.Point3, direction?: Base.Vector3, scale?: number) {
            if (points !== undefined) { this.points = points; }
            if (center !== undefined) { this.center = center; }
            if (direction !== undefined) { this.direction = direction; }
            if (scale !== undefined) { this.scale = scale; }
        }
        /**
         * Points to transform
         * @default undefined
         */
        points?: Base.Point3[];
        /**
         * The center from which the scaling is applied
         * @default [0, 0, 0]
         */
        center?: Base.Point3 = [0, 0, 0];
        /**
         * Stretch direction vector
         * @default [0, 0, 1]
         */
        direction?: Base.Vector3 = [0, 0, 1];
        /**
         * The scale factor to apply along the direction vector. 1.0 means no change.
         * @default 2
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        scale? = 2;
    }
    export class RotatePointsCenterAxisDto {
        constructor(points?: Base.Point3[], angle?: number, axis?: Base.Vector3, center?: Base.Point3) {
            if (points !== undefined) { this.points = points; }
            if (angle !== undefined) { this.angle = angle; }
            if (axis !== undefined) { this.axis = axis; }
            if (center !== undefined) { this.center = center; }
        }
        /**
        * Points to transform
        * @default undefined
        */
        points: Base.Point3[];
        /**
         * Angle of rotation in degrees
         * @default 90
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        angle = 90;
        /**
         * Axis vector for rotation
         * @default [0, 1, 0]
         */
        axis: Base.Vector3 = [0, 1, 0];
        /**
         * The center from which the axis is pointing
         * @default [0, 0, 0]
         */
        center: Base.Point3 = [0, 0, 0];
    }
    export class TransformsForPointsDto {
        constructor(points?: Base.Point3[], transformation?: Base.TransformMatrixes[]) {
            if (points !== undefined) { this.points = points; }
            if (transformation !== undefined) { this.transformation = transformation; }
        }
        /**
         * Points to transform
         * @default undefined
         */
        points: Base.Point3[];
        /**
         * Transformations that have to match nr of points
         * @default undefined
         */
        transformation: Base.TransformMatrixes[];
    }
    export class ThreePointsNormalDto {
        constructor(point1?: Base.Point3, point2?: Base.Point3, point3?: Base.Point3, reverseNormal?: boolean) {
            if (point1 !== undefined) { this.point1 = point1; }
            if (point2 !== undefined) { this.point2 = point2; }
            if (point3 !== undefined) { this.point3 = point3; }
            if (reverseNormal !== undefined) { this.reverseNormal = reverseNormal; }
        }
        /**
         * Point 1
         * @default undefined
         */
        point1: Base.Point3;
        /**
         * Point 2
         * @default undefined
         */
        point2: Base.Point3;
        /**
         * Point 3
         * @default undefined
         */
        point3: Base.Point3;
        /**
         * Reverse normal direction
         * @default false
         */
        reverseNormal = false;
    }
    export class RemoveConsecutiveDuplicatesDto {
        constructor(points?: Base.Point3[], tolerance?: number, checkFirstAndLast?: boolean) {
            if (points !== undefined) { this.points = points; }
            if (tolerance !== undefined) { this.tolerance = tolerance; }
            if (checkFirstAndLast !== undefined) { this.checkFirstAndLast = checkFirstAndLast; }
        }
        /**
         * Points to transform
         * @default undefined
         */
        points: Base.Point3[];
        /**
         * Tolerance for removing duplicates
         * @default 1e-7
         * @minimum 0
         * @maximum Infinity
         * @step 1e-7
         */
        tolerance = 1e-7;
        /**
         * Check first and last point for duplicates
         */
        checkFirstAndLast = false;
    }
    export class ClosestPointFromPointsDto {
        constructor(points?: Base.Point3[], point?: Base.Point3) {
            if (points !== undefined) { this.points = points; }
            if (point !== undefined) { this.point = point; }
        }
        /**
         * Points to transform
         * @default undefined
         */
        points: Base.Point3[];
        /**
         * Transformation matrix or a list of transformation matrixes
         * @default undefined
         */
        point: Base.Point3;
    }
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
        point1?: Base.Point3;
        /**
         * Second point to compare
         * @default undefined
         */
        point2?: Base.Point3;
        /**
         * Tolerance for the calculation
         * @default 1e-7
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1e-7
         */
        tolerance? = 1e-7;
    }
    export class StartEndPointsDto {
        constructor(startPoint?: Base.Point3, endPoint?: Base.Point3) {
            if (startPoint !== undefined) { this.startPoint = startPoint; }
            if (endPoint !== undefined) { this.endPoint = endPoint; }
        }
        /**
         * Start point
         * @default undefined
         */
        startPoint: Base.Point3;
        /**
         * End point
         * @default undefined
         */
        endPoint: Base.Point3;
    }
    export class StartEndPointsListDto {
        constructor(startPoint?: Base.Point3, endPoints?: Base.Point3[]) {
            if (startPoint !== undefined) { this.startPoint = startPoint; }
            if (endPoints !== undefined) { this.endPoints = endPoints; }
        }
        /**
         * Start point
         * @default undefined
         */
        startPoint: Base.Point3;
        /**
         * End point
         * @default undefined
         */
        endPoints: Base.Point3[];
    }

    export class MultiplyPointDto {
        constructor(point?: Base.Point3, amountOfPoints?: number) {
            if (point !== undefined) { this.point = point; }
            if (amountOfPoints !== undefined) { this.amountOfPoints = amountOfPoints; }
        }
        /**
         * Point for multiplication
         * @default undefined
         */
        point: Base.Point3;
        /**
         * Number of points to create in the list
         * @default undefined
         */
        amountOfPoints: number;
    }

    export class SpiralDto {
        constructor(radius?: number, numberPoints?: number, widening?: number, factor?: number, phi?: number) {
            if (radius !== undefined) { this.radius = radius; }
            if (numberPoints !== undefined) { this.numberPoints = numberPoints; }
            if (widening !== undefined) { this.widening = widening; }
            if (factor !== undefined) { this.factor = factor; }
            if (phi !== undefined) { this.phi = phi; }
        }
        /**
         * Identifies phi angle
         * @default 0.9
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        phi = 0.9;
        /**
         * Identifies how many points will be created
         * @default 200
         * @minimum 0
         * @maximum Infinity
         * @step 10
         */
        numberPoints = 200;
        /**
         * Widening factor of the spiral
         * @default 3
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        widening = 3;
        /**
         * Radius of the spiral
         * @default 6
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radius = 6;
        /**
         * Factor of the spiral
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        factor = 1;
    }
    export class HexGridScaledToFitDto {
        constructor(wdith?: number, height?: number, nrHexagonsU?: number, nrHexagonsV?: number, centerGrid?: boolean, pointsOnGround?: boolean) {
            if (wdith !== undefined) { this.width = wdith; }
            if (height !== undefined) { this.height = height; }
            if (nrHexagonsU !== undefined) { this.nrHexagonsU = nrHexagonsU; }
            if (nrHexagonsV !== undefined) { this.nrHexagonsV = nrHexagonsV; }
            if (centerGrid !== undefined) { this.centerGrid = centerGrid; }
            if (pointsOnGround !== undefined) { this.pointsOnGround = pointsOnGround; }
        }
        /** Total desired width for the grid area. The hexagon size will be derived from this and nrHexagonsU.
         * @default 10
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        width? = 10;
        /** Total desired height for the grid area. Note: due to hexagon geometry, the actual grid height might differ slightly if maintaining regular hexagons based on width.
         * @default 10
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
        */
        height? = 10;
        /** Number of hexagons desired horizontally (U direction).
         * @default 10
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        nrHexagonsU? = 10;
        /** Number of hexagons desired vertically (V direction).
         * @default 10
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        nrHexagonsV? = 10;
        /** If true, shift the entire grid up by half hex height. 
         * @default false
        */
        extendTop? = false;
        /** If true, shift the entire grid down by half hex height. 
         * @default false
        */
        extendBottom? = false;
        /** If true, shift the entire grid left by half hex width. 
         * @default false
        */
        extendLeft? = false;
        /** If true, shift the entire grid right by half hex width. 
         * @default false
        */
        extendRight? = false;
        /** If true, the grid center (based on totalWidth/totalHeight) will be at [0,0,0].
         * @default false
         */
        centerGrid? = false;
        /** If true, swaps Y and Z coordinates and sets Y to 0, placing points on the XZ ground plane.
         * @default false
         */
        pointsOnGround? = false;
    }
    export class HexGridCentersDto {
        constructor(nrHexagonsX?: number, nrHexagonsY?: number, radiusHexagon?: number, orientOnCenter?: boolean, pointsOnGround?: boolean) {
            if (nrHexagonsX !== undefined) { this.nrHexagonsX = nrHexagonsX; }
            if (nrHexagonsY !== undefined) { this.nrHexagonsY = nrHexagonsY; }
            if (radiusHexagon !== undefined) { this.radiusHexagon = radiusHexagon; }
            if (orientOnCenter !== undefined) { this.orientOnCenter = orientOnCenter; }
            if (pointsOnGround !== undefined) { this.pointsOnGround = pointsOnGround; }
        }
        /**
         * Number of hexagons on Y direction
         * @default 21
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        nrHexagonsY = 21;
        /**
         * Number of Hexagons on Z direction
         * @default 21
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        nrHexagonsX = 21;
        /**
         * radius of a single hexagon
         * @default 0.2
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radiusHexagon: number;
        /**
         * Orient hexagon points grid on center
         * @default false
         */
        orientOnCenter = false;
        /**
         * Orient points on the ground
         * @default false
         */
        pointsOnGround = false;
    }
}
