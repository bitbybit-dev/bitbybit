/* eslint-disable @typescript-eslint/no-namespace */
import { Base } from "./base-inputs";

// tslint:disable-next-line: no-namespace
export namespace Manifold {
    export type ManifoldPointer = { hash: number, type: string };
    export type CrossSectionPointer = { hash: number, type: string };

    export enum fillRuleEnum {
        evenOdd = "EvenOdd",
        nonZero = "NonZero",
        positive = "Positive",
        negative = "Negative"
    }
    export enum manifoldJoinTypeEnum {
        square = "Square",
        round = "Round",
        miter = "Miter"
    }
    export class DrawManifoldOrCrossSectionDto<T, M> {
        /**
         * Provide options without default values
         */
        constructor(manifoldOrCrossSection?: T, faceOpacity?: number, faceMaterial?: M, faceColour?: Base.Color, crossSectionColour?: Base.Color, crossSectionWidth?: number, crossSectionOpacity?: number, computeNormals?: boolean) {
            if (manifoldOrCrossSection !== undefined) { this.manifoldOrCrossSection = manifoldOrCrossSection; }
            if (faceOpacity !== undefined) { this.faceOpacity = faceOpacity; }
            if (faceMaterial !== undefined) { this.faceMaterial = faceMaterial; }
            if (faceColour !== undefined) { this.faceColour = faceColour; }
            if (crossSectionColour !== undefined) { this.crossSectionColour = crossSectionColour; }
            if (crossSectionWidth !== undefined) { this.crossSectionWidth = crossSectionWidth; }
            if (crossSectionOpacity !== undefined) { this.crossSectionOpacity = crossSectionOpacity; }
            if (computeNormals !== undefined) { this.computeNormals = computeNormals; }
        }
        /**
         * Manifold geometry
         * @default undefined
         */
        manifoldOrCrossSection?: T;
        /**
         * Face opacity value between 0 and 1
         * @default 1
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        faceOpacity = 1;
        /**
         * Face material
         * @default undefined
         * @optional true
         */
        faceMaterial?: M;
        /**
         * Hex colour string for face colour
         * @default #ff0000
         */
        faceColour: Base.Color = "#ff0000";
        /**
         * Hex colour string for cross section drawing
         * @default #ff00ff
         */
        crossSectionColour: Base.Color = "#ff00ff";
        /**
         * Width of cross section lines
         * @default 2
         */
        crossSectionWidth = 2;
        /**
         * Cross section opacity value between 0 and 1
         * @default 1
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        crossSectionOpacity = 1;
        /**
         * Compute normals for the shape
         * @default false
         */
        computeNormals = false;
    }
    export class DrawManifoldsOrCrossSectionsDto<T, M> {
        /**
         * Provide options without default values
         */
        constructor(manifoldsOrCrossSections?: T[], faceOpacity?: number, faceMaterial?: M, faceColour?: Base.Color, crossSectionColour?: Base.Color, crossSectionWidth?: number, crossSectionOpacity?: number, computeNormals?: boolean) {
            if (manifoldsOrCrossSections !== undefined) { this.manifoldsOrCrossSections = manifoldsOrCrossSections; }
            if (faceOpacity !== undefined) { this.faceOpacity = faceOpacity; }
            if (faceMaterial !== undefined) { this.faceMaterial = faceMaterial; }
            if (faceColour !== undefined) { this.faceColour = faceColour; }
            if (crossSectionColour !== undefined) { this.crossSectionColour = crossSectionColour; }
            if (crossSectionWidth !== undefined) { this.crossSectionWidth = crossSectionWidth; }
            if (crossSectionOpacity !== undefined) { this.crossSectionOpacity = crossSectionOpacity; }
            if (computeNormals !== undefined) { this.computeNormals = computeNormals; }
        }
        /**
         * Manifold geometry
         * @default undefined
         */
        manifoldsOrCrossSections?: T[];
        /**
         * Face material
         * @default undefined
         * @optional true
         */
        faceMaterial?: M;
        /**
         * Hex colour string for face colour
         * @default #ff0000
         */
        faceColour: Base.Color = "#ff0000";
        /**
         * Face opacity value between 0 and 1
         * @default 1
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        faceOpacity = 1;
        /**
         * Hex colour string for cross section drawing
         * @default #ff00ff
         */
        crossSectionColour: Base.Color = "#ff00ff";
        /**
         * Width of cross section lines
         * @default 2
         */
        crossSectionWidth = 2;
        /**
         * Cross section opacity value between 0 and 1
         * @default 1
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        crossSectionOpacity = 1;
        /**
         * Compute normals for the shape
         * @default false
         */
        computeNormals = false;
    }
    export class CubeDto {
        constructor(center?: boolean, size?: number) {
            if (center !== undefined) { this.center = center; }
            if (size !== undefined) { this.size = size; }
        }
        /**
         * Place cube on the center
         * @default true
         */
        center = true;
        /**
         * Size of the cube
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        size = 1;
    }
    export class CreateContourSectionDto {
        constructor(polygons?: Base.Vector2[][], fillRule?: fillRuleEnum) {
            if (polygons !== undefined) { this.polygons = polygons; }
            if (fillRule !== undefined) { this.fillRule = fillRule; }
        }
        /**
         * Polygons to use for the contour section
         * @default undefined
         */
        polygons: Base.Vector2[][];
        /**
         * Fill rule for the contour section
         * @default EvenOdd
         */
        fillRule: fillRuleEnum = fillRuleEnum.evenOdd;
    }
    export class SquareDto {
        constructor(center?: boolean, size?: number) {
            if (center !== undefined) { this.center = center; }
            if (size !== undefined) { this.size = size; }
        }
        /**
         * Place cube on the center
         * @default false
         */
        center = false;
        /**
         * Size of the cube
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        size = 1;
    }
    export class SphereDto {
        constructor(radius?: number, circularSegments?: number) {
            if (radius !== undefined) { this.radius = radius; }
            if (circularSegments !== undefined) { this.circularSegments = circularSegments; }
        }
        /**
         * Radius of the sphere
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radius = 1;
        /**
          * Circular segments of the sphere
          * @default 32
          * @minimum 0
          * @maximum Infinity
          * @step 1
          */
        circularSegments: number;
    }
    export class CylinderDto {
        constructor(height?: number, radiusLow?: number, radiusHigh?: number, circularSegments?: number, center?: boolean) {
            if (height !== undefined) { this.height = height; }
            if (radiusLow !== undefined) { this.radiusLow = radiusLow; }
            if (radiusHigh !== undefined) { this.radiusHigh = radiusHigh; }
            if (circularSegments !== undefined) { this.circularSegments = circularSegments; }
            if (center !== undefined) { this.center = center; }
        }
        /**
         * Height of the cylinder
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        height = 1;
        /**
         * Radius of the cylinder
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radiusLow = 1;
        /**
         * Radius of the cylinder
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radiusHigh = 1;
        /**
         * Circular segments of the cylinder
         * @default 32
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        circularSegments = 32;
        /**
         * Place cylinder on the center
         * @default true
         */
        center = true;
    }
    export class CircleDto {
        constructor(radius?: number, circularSegments?: number) {
            if (radius !== undefined) { this.radius = radius; }
            if (circularSegments !== undefined) { this.circularSegments = circularSegments; }
        }
        /**
         * Radius of the cylinder
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radius = 1;
        /**
         * Circular segments of the cylinder
         * @default 32
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        circularSegments = 32;
    }
    export class RectangleDto {
        constructor(length?: number, height?: number, center?: boolean) {
            if (length !== undefined) { this.length = length; }
            if (height !== undefined) { this.height = height; }
            if (center !== undefined) { this.center = center; }
        }
        /**
         * Length of the rectangle
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        length = 1;
        /**
         * Height of the rectangle
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        height = 1;
        /**
         * Place rectangle on the center
         * @default false
         */
        center = false;
    }
    export class ManifoldDto<T> {
        constructor(manifold?: T) {
            if (manifold !== undefined) { this.manifold = manifold; }
        }
        /**
         * Manifold shape
         */
        manifold: T;
    }
    export class CountDto {
        constructor(count?: number) {
            if (count !== undefined) { this.count = count; }
        }
        /**
         * Nr to count
         */
        count: number;
    }
    export class ManifoldsMinGapDto<T> {
        constructor(manifold1?: T, manifold2?: T, searchLength?: number) {
            if (manifold1 !== undefined) { this.manifold1 = manifold1; }
            if (manifold2 !== undefined) { this.manifold2 = manifold2; }
            if (searchLength !== undefined) { this.searchLength = searchLength; }
        }
        /**
         * Manifold shape
         */
        manifold1: T;
        /**
         * Manifold shape
         */
        manifold2: T;
        /**
         * Length of the search gap
         * @default 100
         * @minimum 0
         * @maximum Infinity
         * @step 10
         */
        searchLength = 100;
    }
    export class ManifoldToleranceDto<T> {
        constructor(manifold?: T, tolerance?: number) {
            if (manifold !== undefined) { this.manifold = manifold; }
            if (tolerance !== undefined) { this.tolerance = tolerance; }
        }
        /**
         * Manifold shape
         */
        manifold: T;
        /**
         * Tolerance value
         * @default 1e-6
         * @minimum 0
         * @maximum Infinity
         * @step 1e-7
         */
        tolerance = 1e-6;
    }
    export class HullPointsDto<T> {
        constructor(points?: T) {
            if (points !== undefined) { this.points = points; }
        }
        /**
         * Points to hull
         */
        points: T;
    }
    export class SliceDto<T> {
        constructor(manifold?: T) {
            if (manifold !== undefined) { this.manifold = manifold; }
        }
        /**
         * Manifold shape
         */
        manifold: T;
        /**
         * Height of the slice
         * @default 0.5
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        height = 0.5;
    }
    export class CrossSectionDto<T> {
        constructor(crossSection?: T) {
            if (crossSection !== undefined) { this.crossSection = crossSection; }
        }
        /**
         * Cross section
         */
        crossSection: T;
    }
    export class CrossSectionsDto<T> {
        constructor(crossSections?: T[]) {
            if (crossSections !== undefined) { this.crossSections = crossSections; }
        }
        /**
         * Cross sections
         */
        crossSections: T[];
    }
    export class ExtrudeDto<T> {
        constructor(crossSection?: T) {
            if (crossSection !== undefined) { this.crossSection = crossSection; }
        }
        /**
         * Extrude cross section shape
         */
        crossSection: T;
        /**
         * Height of the extrusion
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        height = 1;
        /**
         * Number of divisions
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        nDivisions = 1;
        /**
         * Twist degrees
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        twistDegrees = 0;
        /**
         * Scale top
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        scaleTopX = 1;
        /**
         * Scale top
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        scaleTopY = 1;
        /**
         * Center the extrusion
         * @default true
        */
        center = true;
    }

    export class RevolveDto<T> {
        constructor(crossSection?: T, revolveDegrees?: number, matchProfile?: boolean, circularSegments?: number) {
            if (crossSection !== undefined) { this.crossSection = crossSection; }
            if (revolveDegrees !== undefined) { this.revolveDegrees = revolveDegrees; }
            if (matchProfile !== undefined) { this.matchProfile = matchProfile; }
            if (circularSegments !== undefined) { this.circularSegments = circularSegments; }
        }
        /**
         * Revolve cross section shape
         */
        crossSection: T;
        /**
         * Extrude cross section shape
         * @default 360
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        revolveDegrees: number;
        /**
         * Default manifold library will adjust profile when generating revolved shape. We prefer it to be matching the profile by default. Set to false to use default manifold library behavior.
         * @default true
         */
        matchProfile = true;
        /**
         * Circular segments
         * @default 32
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        circularSegments = 32;
    }
    export class OffsetDto<T> {
        constructor(crossSection?: T, delta?: number, joinType?: manifoldJoinTypeEnum, miterLimit?: number, circularSegments?: number) {
            if (crossSection !== undefined) { this.crossSection = crossSection; }
            if (delta !== undefined) { this.delta = delta; }
            if (joinType !== undefined) { this.joinType = joinType; }
            if (miterLimit !== undefined) { this.miterLimit = miterLimit; }
            if (circularSegments !== undefined) { this.circularSegments = circularSegments; }
        }
        /**
         * Revolve cross section shape
         */
        crossSection: T;
        /**
         * Extrude cross section shape
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        delta: number;
        /**
         * Join type
         * @default round
         */
        joinType: manifoldJoinTypeEnum = manifoldJoinTypeEnum.round;
        /**
         * Circular segments
         * @default 2
         * @minimum 2
         * @maximum Infinity
         * @step 0.1
         */
        miterLimit = 2;
        /**
         * Circular segments
         * @default 32
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        circularSegments = 32;
    }

    export class SimplifyDto<T> {
        constructor(crossSection?: T, epsilon?: number) {
            if (crossSection !== undefined) { this.crossSection = crossSection; }
            if (epsilon !== undefined) { this.epsilon = epsilon; }
        }
        /**
         * Revolve cross section shape
         */
        crossSection: T;
        /**
         * Extrude cross section shape
         * @default 1e-6
         * @minimum 0
         * @maximum Infinity
         * @step 1e-7
         */
        epsilon = 1e-6;
    }

    export class ComposeDto<T> {
        constructor(polygons?: T) {
            if (polygons !== undefined) { this.polygons = polygons; }
        }
        /**
         * Polygons to compose
         */
        polygons: T;
    }
    export class MirrorCrossSectionDto<T> {
        constructor(crossSection?: T, normal?: Base.Vector2) {
            if (crossSection !== undefined) { this.crossSection = crossSection; }
            if (normal !== undefined) { this.normal = normal; }
        }
        /**
         * Manifold shape
         */
        crossSection: T;
        /**
         * The normal vector of the plane to be mirrored over
         * @default [1,0]
         */
        normal: Base.Vector2 = [1, 0];
    }
    export class Scale2DCrossSectionDto<T> {
        constructor(crossSection?: T, vector?: Base.Vector2) {
            if (crossSection !== undefined) { this.crossSection = crossSection; }
            if (vector !== undefined) { this.vector = vector; }
        }
        /**
         * Manifold shape
         */
        crossSection: T;
        /**
         * The normal vector of the plane to be mirrored over
         * @default [2,2]
         */
        vector: Base.Vector2 = [2, 2];
    }
    export class TranslateCrossSectionDto<T> {
        constructor(crossSection?: T, vector?: Base.Vector2) {
            if (crossSection !== undefined) { this.crossSection = crossSection; }
            if (vector !== undefined) { this.vector = vector; }
        }
        /**
         * Manifold shape
         */
        crossSection: T;
        /**
         * The translation vector
         * @default undefined
         */
        vector: Base.Vector2;
    }
    export class RotateCrossSectionDto<T> {
        constructor(crossSection?: T, degrees?: number) {
            if (crossSection !== undefined) { this.crossSection = crossSection; }
            if (degrees !== undefined) { this.degrees = degrees; }
        }
        /**
         * Manifold shape
         */
        crossSection: T;
        /**
         * The rotation vector in eulers
         * @default 45
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        degrees: number;
    }
    export class ScaleCrossSectionDto<T> {
        constructor(crossSection?: T, factor?: number) {
            if (crossSection !== undefined) { this.crossSection = crossSection; }
            if (factor !== undefined) { this.factor = factor; }
        }
        /**
         * Manifold shape
         */
        crossSection: T;
        /**
         * The normal vector of the plane to be mirrored over
         * @default 2
         */
        factor = 2;
    }
    export class TranslateXYCrossSectionDto<T> {
        constructor(crossSection?: T, x?: number, y?: number) {
            if (crossSection !== undefined) { this.crossSection = crossSection; }
            if (x !== undefined) { this.x = x; }
            if (y !== undefined) { this.y = y; }
        }
        /**
         * Manifold shape
         */
        crossSection: T;
        /**
         * The translation X axis
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        x = 0;
        /**
         * The translation Y axis
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        y = 0;
    }

    export class TransformCrossSectionDto<T> {
        constructor(crossSection?: T, transform?: Base.TransformMatrix3x3) {
            if (crossSection !== undefined) { this.crossSection = crossSection; }
            if (transform !== undefined) { this.transform = transform; }
        }
        /**
         * Cross section
         */
        crossSection: T;
        /**
         * The transform matrix to apply
         * @default undefined
         */
        transform: Base.TransformMatrix3x3;
    }
    export class MirrorDto<T> {
        constructor(manifold?: T, normal?: Base.Vector3) {
            if (manifold !== undefined) { this.manifold = manifold; }
            if (normal !== undefined) { this.normal = normal; }
        }
        /**
         * Manifold shape
         */
        manifold: T;
        /**
         * The normal vector of the plane to be mirrored over
         * @default [1,0,0]
         */
        normal: Base.Vector3 = [1, 0, 0];
    }
    export class Scale3DDto<T> {
        constructor(manifold?: T, vector?: Base.Vector3) {
            if (manifold !== undefined) { this.manifold = manifold; }
            if (vector !== undefined) { this.vector = vector; }
        }
        /**
         * Manifold shape
         */
        manifold: T;
        /**
         * The normal vector of the plane to be mirrored over
         * @default [2,2,2]
         */
        vector: Base.Vector3 = [2, 2, 2];
    }
    export class TranslateDto<T> {
        constructor(manifold?: T, vector?: Base.Vector3) {
            if (manifold !== undefined) { this.manifold = manifold; }
            if (vector !== undefined) { this.vector = vector; }
        }
        /**
         * Manifold shape
         */
        manifold: T;
        /**
         * The translation vector
         * @default undefined
         */
        vector: Base.Vector3;
    }
    export class RotateDto<T> {
        constructor(manifold?: T, vector?: Base.Vector3) {
            if (manifold !== undefined) { this.manifold = manifold; }
            if (vector !== undefined) { this.vector = vector; }
        }
        /**
         * Manifold shape
         */
        manifold: T;
        /**
         * The rotation vector in eulers
         * @default undefined
         */
        vector: Base.Vector3;
    }
    export class RotateXYZDto<T> {
        constructor(manifold?: T, x?: number, y?: number, z?: number) {
            if (manifold !== undefined) { this.manifold = manifold; }
            if (x !== undefined) { this.x = x; }
            if (y !== undefined) { this.y = y; }
            if (z !== undefined) { this.z = z; }
        }
        /**
         * Manifold shape
         */
        manifold: T;
        /**
         * The rotation vector in eulers on X axis
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        x = 0;
        /**
         * The rotation vector in eulers on Y axis
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        y = 0;
        /**
         * The rotation vector in eulers on Z axis
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        z = 0;
    }
    export class ScaleDto<T> {
        constructor(manifold?: T, factor?: number) {
            if (manifold !== undefined) { this.manifold = manifold; }
            if (factor !== undefined) { this.factor = factor; }
        }
        /**
         * Manifold shape
         */
        manifold: T;
        /**
         * The normal vector of the plane to be mirrored over
         * @default 2
         */
        factor = 2;
    }
    export class TranslateXYZDto<T> {
        constructor(manifold?: T, x?: number, y?: number, z?: number) {
            if (manifold !== undefined) { this.manifold = manifold; }
            if (x !== undefined) { this.x = x; }
            if (y !== undefined) { this.y = y; }
            if (z !== undefined) { this.z = z; }
        }
        /**
         * Manifold shape
         */
        manifold: T;
        /**
         * The translation X axis
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        x = 0;
        /**
         * The translation Y axis
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        y = 0;
        /**
         * The translation Z axis
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        z = 0;
    }
    export class TransformDto<T> {
        constructor(manifold?: T, transform?: Base.TransformMatrix) {
            if (manifold !== undefined) { this.manifold = manifold; }
            if (transform !== undefined) { this.transform = transform; }
        }
        /**
         * Manifold shape
         */
        manifold: T;
        /**
         * The transform matrix to apply
         * @default undefined
         */
        transform: Base.TransformMatrix;
    }
    export class TransformsDto<T> {
        constructor(manifold?: T, transforms?: Base.TransformMatrixes) {
            if (manifold !== undefined) { this.manifold = manifold; }
            if (transforms !== undefined) { this.transforms = transforms; }
        }
        /**
         * Manifold shape
         */
        manifold: T;
        /**
         * The transform matrixes to apply
         * @default undefined
         */
        transforms: Base.TransformMatrixes;
    }
    export class TwoCrossSectionsDto<T> {
        constructor(crossSection1?: T, crossSection2?: T) {
            if (crossSection1 !== undefined) { this.crossSection1 = crossSection1; }
            if (crossSection2 !== undefined) { this.crossSection2 = crossSection2; }
        }
        /**
         * Manifold shape
         */
        crossSection1: T;
        /**
         * Manifold shape
         */
        crossSection2: T;
    }
    export class TwoManifoldsDto<T> {
        constructor(manifold1?: T, manifold2?: T) {
            if (manifold1 !== undefined) { this.manifold1 = manifold1; }
            if (manifold2 !== undefined) { this.manifold2 = manifold2; }
        }
        /**
         * Manifold shape
         */
        manifold1: T;
        /**
         * Manifold shape
         */
        manifold2: T;
    }
    export class ManifoldsDto<T> {
        constructor(manifolds?: T[]) {
            if (manifolds !== undefined) { this.manifolds = manifolds; }
        }
        /**
         * Manifolds
         */
        manifolds: T[];
    }

    export class ManifoldToMeshDto<T> {
        constructor(manifold?: T, normalIdx?: number) {
            if (manifold !== undefined) { this.manifold = manifold; }
            if (normalIdx !== undefined) { this.normalIdx = normalIdx; }
        }
        /**
         * Manifold shape
         */
        manifold: T;
        /**
         * Optional normal index
         */
        normalIdx?: number;
    }
    export class ManifoldsToMeshesDto<T> {
        constructor(manifolds?: T[], normalIdx?: number[]) {
            if (manifolds !== undefined) { this.manifolds = manifolds; }
            if (normalIdx !== undefined) { this.normalIdx = normalIdx; }
        }
        /**
         * Manifold shape
         */
        manifolds: T[];
        /**
         * Optional normal indexes
         */
        normalIdx?: number[];
    }
    export class DecomposeManifoldOrCrossSectionDto<T> {
        constructor(manifoldOrCrossSection?: T, normalIdx?: number) {
            if (manifoldOrCrossSection !== undefined) { this.manifoldOrCrossSection = manifoldOrCrossSection; }
            if (normalIdx !== undefined) { this.normalIdx = normalIdx; }
        }
        /**
         * Manifold shape
         */
        manifoldOrCrossSection: T;
        /**
         * Optional normal index
         */
        normalIdx?: number;
    }
    export class ManifoldOrCrossSectionDto<T> {
        constructor(manifoldOrCrossSection?: T) {
            if (manifoldOrCrossSection !== undefined) { this.manifoldOrCrossSection = manifoldOrCrossSection; }
        }
        /**
         * Manifold or cross section
         */
        manifoldOrCrossSection: T;
    }
    export class ManifoldsOrCrossSectionsDto<T> {
        constructor(manifoldsOrCrossSections?: T[]) {
            if (manifoldsOrCrossSections !== undefined) { this.manifoldsOrCrossSections = manifoldsOrCrossSections; }
        }
        /**
         * Manifolds or cross sections
         */
        manifoldsOrCrossSections: T[];
    }
    export class DecomposeManifoldsOrCrossSectionsDto<T> {
        constructor(manifoldsOrCrossSections?: T[], normalIdx?: number[]) {
            if (manifoldsOrCrossSections !== undefined) { this.manifoldsOrCrossSections = manifoldsOrCrossSections; }
            if (normalIdx !== undefined) { this.normalIdx = normalIdx; }
        }
        /**
         * Manifold shape
         */
        manifoldsOrCrossSections: T[];
        /**
         * Optional normal indexes
         */
        normalIdx?: number[];
    }
}
