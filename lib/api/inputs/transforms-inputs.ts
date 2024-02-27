/* eslint-disable @typescript-eslint/no-namespace */
import * as BABYLON from "@babylonjs/core";
import { Base } from "./base-inputs";

export namespace Transforms {

    export class RotationCenterAxisDto {
        constructor(angle?: number, axis?: Base.Vector3, center?: Base.Point3) {
            if (angle !== undefined) { this.angle = angle; }
            if (axis !== undefined) { this.axis = axis; }
            if (center !== undefined) { this.center = center; }
        }
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
    export class TransformBabylonMeshDto {
        constructor(mesh?: BABYLON.Mesh, transformation?: Base.TransformMatrixes) {
            if (mesh !== undefined) { this.mesh = mesh; }
            if (transformation !== undefined) { this.transformation = transformation; }
        }
        /**
         * Mesh to transform
         * @default undefined
         */
        mesh: BABYLON.Mesh;
        /**
         * Transformation(s) to apply
         * @default undefined
         */
        transformation: Base.TransformMatrixes;
    }
    export class RotationCenterDto {
        constructor(angle?: number, center?: Base.Point3) {
            if (angle !== undefined) { this.angle = angle; }
            if (center !== undefined) { this.center = center; }
        }
        /**
         * Angle of rotation in degrees
         * @default 90
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        angle = 90;
        /**
         * The center from which the axis is pointing
         * @default [0, 0, 0]
         */
        center: Base.Point3 = [0, 0, 0];
    }
    export class RotationCenterYawPitchRollDto {
        constructor(yaw?: number, pitch?: number, roll?: number, center?: Base.Point3) {
            if (yaw !== undefined) { this.yaw = yaw; }
            if (pitch !== undefined) { this.pitch = pitch; }
            if (roll !== undefined) { this.roll = roll; }
            if (center !== undefined) { this.center = center; }
        }
        /**
         * Yaw angle (Rotation around X) in degrees
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        yaw = 0;
        /**
         * Pitch angle (Rotation around Y) in degrees
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        pitch = 0;
        /**
         * Roll angle (Rotation around Z) in degrees
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        roll = 0;
        /**
         * The center from which the rotations are applied
         * @default [0, 0, 0]
         */
        center: Base.Point3 = [0, 0, 0];
    }
    export class ScaleXYZDto {
        constructor(scaleXyz?: Base.Vector3) {
            if (scaleXyz !== undefined) { this.scaleXyz = scaleXyz; }
        }
        /**
         * Scaling factors for each axis [1, 2, 1] means that Y axis will be scaled 200% and both x and z axis will remain on 100%
         * @default [1, 1, 1]
         */
        scaleXyz: Base.Vector3 = [1, 1, 1];
    }
    export class ScaleCenterXYZDto {
        constructor(center?: Base.Point3, scaleXyz?: Base.Vector3) {
            if (center !== undefined) { this.center = center; }
            if (scaleXyz !== undefined) { this.scaleXyz = scaleXyz; }
        }
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
    export class UniformScaleDto {
        constructor(scale?: number) {
            if (scale !== undefined) { this.scale = scale; }
        }
        /**
         * Uniform scale factor for all x, y, z directions. 1 will keep everything on original size, 2 will scale 200%;
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        scale = 1;
    }
    export class UniformScaleFromCenterDto {
        constructor(scale?: number, center?: Base.Point3) {
            if (scale !== undefined) { this.scale = scale; }
            if (center !== undefined) { this.center = center; }
        }
        /**
         * Scale factor for all x, y, z directions. 1 will keep everything on original size, 2 will scale 200%;
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        scale = 1;
        /**
         * Center position of the scaling
         * @default [0, 0, 0]
         */
        center: Base.Point3 = [0, 0, 0];
    }
    export class TranslationXYZDto {
        constructor(translation?: Base.Vector3) {
            if (translation !== undefined) { this.translation = translation; }
        }
        /**
         * Translation vector with [x, y, z] distances
         * @default [0, 0, 0]
         */
        translation: Base.Vector3 = [0, 0, 0];
    }
    export class TranslationsXYZDto {
        constructor(translations?: Base.Vector3[]) {
            if (translations !== undefined) { this.translations = translations; }
        }
        /**
         * Translation vectors with [x, y, z] distances
         * @default undefined
         */
        translations: Base.Vector3[];
    }
}
