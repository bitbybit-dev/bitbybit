/* eslint-disable @typescript-eslint/no-namespace */
import * as BABYLON from "@babylonjs/core";
import { Base } from "./base-inputs";

/**
 * Parameters for moving objects in the scene: translation, rotation around an axis or a pivot, and
 * scaling, applied to a mesh or a node rather than to the underlying geometry.
 */
export namespace BabylonTransforms {

    /**
     * Feeds `babylon.transforms.rotationCenterAxis`: the angle, the axis direction and the point
     * the axis passes through.
     */
    export class RotationCenterAxisDto {
        constructor(angle?: number, axis?: Base.Vector3, center?: Base.Point3) {
            if (angle !== undefined) { this.angle = angle; }
            if (axis !== undefined) { this.axis = axis; }
            if (center !== undefined) { this.center = center; }
        }
        /**
         * How far to turn, in degrees; positive follows the right-hand rule around the axis
         * @default 90
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        angle = 90;
        /**
         * The direction of the axis, as `[x, y, z]`
         * @default [0, 1, 0]
         */
        axis: Base.Vector3 = [0, 1, 0];
        /**
         * A point the axis passes through; it stays where it is
         * @default [0, 0, 0]
         */
        center: Base.Point3 = [0, 0, 0];
    }
    /**
     * A mesh and the matrix, or matrices, to apply to it; kept for scripts that transform meshes
     * with the base `transforms` results.
     */
    export class TransformBabylonMeshDto {
        constructor(mesh?: BABYLON.Mesh, transformation?: Base.TransformMatrixes) {
            if (mesh !== undefined) { this.mesh = mesh; }
            if (transformation !== undefined) { this.transformation = transformation; }
        }
        /**
         * The mesh the matrices are applied to
         * @default undefined
         */
        mesh!: BABYLON.Mesh;
        /**
         * One 4x4 matrix or a list applied in order, as the `transforms` methods produce
         * @default undefined
         */
        transformation!: Base.TransformMatrixes;
    }
    /**
     * Feeds `babylon.transforms.rotationCenterX`, `rotationCenterY` and `rotationCenterZ` with the
     * angle and the point the axis passes through.
     */
    export class RotationCenterDto {
        constructor(angle?: number, center?: Base.Point3) {
            if (angle !== undefined) { this.angle = angle; }
            if (center !== undefined) { this.center = center; }
        }
        /**
         * How far to turn, in degrees; positive follows the right-hand rule around the axis
         * @default 90
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        angle = 90;
        /**
         * A point the axis passes through; it stays where it is
         * @default [0, 0, 0]
         */
        center: Base.Point3 = [0, 0, 0];
    }
    /**
     * Feeds `babylon.transforms.rotationCenterYawPitchRoll` with three angles and the point they
     * turn around.
     */
    export class RotationCenterYawPitchRollDto {
        constructor(yaw?: number, pitch?: number, roll?: number, center?: Base.Point3) {
            if (yaw !== undefined) { this.yaw = yaw; }
            if (pitch !== undefined) { this.pitch = pitch; }
            if (roll !== undefined) { this.roll = roll; }
            if (center !== undefined) { this.center = center; }
        }
        /**
         * The turn around the Y axis, in degrees
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        yaw = 0;
        /**
         * The turn around the X axis, in degrees
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        pitch = 0;
        /**
         * The turn around the Z axis, in degrees
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        roll = 0;
        /**
         * The point the rotation is applied around; it stays where it is
         * @default [0, 0, 0]
         */
        center: Base.Point3 = [0, 0, 0];
    }
    /**
     * Feeds `babylon.transforms.scaleXYZ` with a scale factor per axis, measured from the origin.
     */
    export class ScaleXYZDto {
        constructor(scaleXyz?: Base.Vector3) {
            if (scaleXyz !== undefined) { this.scaleXyz = scaleXyz; }
        }
        /**
         * The factors along X, Y and Z: `[1, 2, 1]` doubles Y and keeps X and Z
         * @default [1, 1, 1]
         */
        scaleXyz: Base.Vector3 = [1, 1, 1];
    }
    /**
     * Feeds `babylon.transforms.scaleCenterXYZ` with a scale factor per axis and the point that
     * stays in place.
     */
    export class ScaleCenterXYZDto {
        constructor(center?: Base.Point3, scaleXyz?: Base.Vector3) {
            if (center !== undefined) { this.center = center; }
            if (scaleXyz !== undefined) { this.scaleXyz = scaleXyz; }
        }
        /**
         * The point the scaling is measured from; it stays where it is
         * @default [0, 0, 0]
         */
        center: Base.Point3 = [0, 0, 0];
        /**
         * The factors along X, Y and Z: `[1, 2, 1]` doubles Y and keeps X and Z
         * @default [1, 1, 1]
         */
        scaleXyz: Base.Vector3 = [1, 1, 1];
    }
    /**
     * Feeds `babylon.transforms.uniformScale` with one factor for every axis, measured from the
     * origin.
     */
    export class UniformScaleDto {
        constructor(scale?: number) {
            if (scale !== undefined) { this.scale = scale; }
        }
        /**
         * The factor on every axis; 1 keeps the size, 2 doubles it
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        scale = 1;
    }
    /**
     * Feeds `babylon.transforms.uniformScaleFromCenter` with one factor for every axis and the
     * point that stays in place.
     */
    export class UniformScaleFromCenterDto {
        constructor(scale?: number, center?: Base.Point3) {
            if (scale !== undefined) { this.scale = scale; }
            if (center !== undefined) { this.center = center; }
        }
        /**
         * The factor on every axis; 1 keeps the size, 2 doubles it
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        scale = 1;
        /**
         * The point the scaling is measured from; it stays where it is
         * @default [0, 0, 0]
         */
        center: Base.Point3 = [0, 0, 0];
    }
    /**
     * Feeds `babylon.transforms.translationXYZ` with the vector to move by.
     */
    export class TranslationXYZDto {
        constructor(translation?: Base.Vector3) {
            if (translation !== undefined) { this.translation = translation; }
        }
        /**
         * The distances to move along X, Y and Z, in scene units
         * @default [0, 0, 0]
         */
        translation: Base.Vector3 = [0, 0, 0];
    }
    /**
     * Feeds `babylon.transforms.translationsXYZ` with several vectors, one move each.
     */
    export class TranslationsXYZDto {
        constructor(translations?: Base.Vector3[]) {
            if (translations !== undefined) { this.translations = translations; }
        }
        /**
         * One `[x, y, z]` move per result, in the same order
         * @default undefined
         */
        translations!: Base.Vector3[];
    }
}
