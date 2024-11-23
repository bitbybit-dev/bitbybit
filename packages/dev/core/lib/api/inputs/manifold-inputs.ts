/* eslint-disable @typescript-eslint/no-namespace */
import { Base } from "./base-inputs";

// tslint:disable-next-line: no-namespace
export namespace Manifold {
    export type ManifoldPointer = { hash: number, type: string };

    export class DrawManifoldDto<T, M> {
        /**
         * Provide options without default values
         */
        constructor(manifold?: T, faceOpacity?: number, faceMaterial?: M, faceColour?: Base.Color) {
            if (manifold !== undefined) { this.manifold = manifold; }
            if (faceOpacity !== undefined) { this.faceOpacity = faceOpacity; }
            if (faceMaterial !== undefined) { this.faceMaterial = faceMaterial; }
            if (faceColour !== undefined) { this.faceColour = faceColour; }
        }
        /**
         * Manifold geometry
         * @default undefined
         */
        manifold?: T;
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
    export class CylinderDto{
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
    export class ManifoldDto<T> {
        constructor(manifold?: T) {
            if (manifold !== undefined) { this.manifold = manifold; }
        }
        /**
         * Manifold shape
         */
        manifold: T;
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
         * @default undefined
         */
        x = 0;
        /**
         * The rotation vector in eulers on Y axis
         * @default undefined
         */
        y = 0;
        /**
         * The rotation vector in eulers on Z axis
         * @default undefined
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
         * @default undefined
         */
        x = 0;
        /**
         * The translation Y axis
         * @default undefined
         */
        y = 0;
        /**
         * The translation Z axis
         * @default undefined
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
}
