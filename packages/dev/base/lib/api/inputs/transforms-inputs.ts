/* eslint-disable @typescript-eslint/no-namespace */
import { Base } from "./base-inputs";

/**
 * Parameters for building transformation matrices: translations, rotations around an axis or a center,
 * uniform and non-uniform scaling, and the composition of several transforms into one. The result is a
 * matrix that any geometry API will accept, so the same transform can be applied to points, curves and
 * solids alike.
 */
export namespace Transforms {

    /**
     * An axis, a center and an angle for `transforms.rotationCenterAxis`.
     */
    export class RotationCenterAxisDto {
        constructor(angle?: number, axis?: Base.Vector3, center?: Base.Point3) {
            if (angle !== undefined) { this.angle = angle; }
            if (axis !== undefined) { this.axis = axis; }
            if (center !== undefined) { this.center = center; }
        }
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
         * A point the axis passes through; it stays in place.
         * @default [0, 0, 0]
         */
        center: Base.Point3 = [0, 0, 0];
    }
    /**
     * A center and an angle for `transforms.rotationCenterX`, `transforms.rotationCenterY` and
     * `transforms.rotationCenterZ`.
     */
    export class RotationCenterDto {
        constructor(angle?: number, center?: Base.Point3) {
            if (angle !== undefined) { this.angle = angle; }
            if (center !== undefined) { this.center = center; }
        }
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
         * The point the axis passes through; it stays in place.
         * @default [0, 0, 0]
         */
        center: Base.Point3 = [0, 0, 0];
    }
    /**
     * Three angles and a center for `transforms.rotationCenterYawPitchRoll`.
     */
    export class RotationCenterYawPitchRollDto {
        constructor(yaw?: number, pitch?: number, roll?: number, center?: Base.Point3) {
            if (yaw !== undefined) { this.yaw = yaw; }
            if (pitch !== undefined) { this.pitch = pitch; }
            if (roll !== undefined) { this.roll = roll; }
            if (center !== undefined) { this.center = center; }
        }
        /**
         * The turn about the Y axis, in degrees.
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        yaw = 0;
        /**
         * The turn about the X axis, in degrees.
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        pitch = 0;
        /**
         * The turn about the Z axis, in degrees.
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        roll = 0;
        /**
         * The point the rotation turns around; it stays in place.
         * @default [0, 0, 0]
         */
        center: Base.Point3 = [0, 0, 0];
    }
    /**
     * A factor per axis for `transforms.scaleXYZ`, measured from the origin.
     */
    export class ScaleXYZDto {
        constructor(scaleXyz?: Base.Vector3) {
            if (scaleXyz !== undefined) { this.scaleXyz = scaleXyz; }
        }
        /**
         * The factor for each axis as `[x, y, z]`: `[1, 2, 1]` doubles distances along Y and leaves
         * X and Z as they are.
         * @default [1, 1, 1]
         */
        scaleXyz: Base.Vector3 = [1, 1, 1];
    }
    /**
     * A center, a direction and a factor for `transforms.stretchDirFromCenter`.
     */
    export class StretchDirCenterDto {
        constructor(scale?: number, center?: Base.Point3, direction?: Base.Vector3) {
            if (scale !== undefined) { this.scale = scale; }
            if (center !== undefined) { this.center = center; }
            if (direction !== undefined) { this.direction = direction; }
        }
        /**
         * The point that stays in place; distances are measured from it.
         * @default [0, 0, 0]
         */
        center?: Base.Point3 | undefined = [0, 0, 0];
        /**
         * The direction to stretch along; its length does not matter. Distances across it do not
         * change.
         * @default [0, 0, 1]
         */
        direction?: Base.Vector3 | undefined = [0, 0, 1];
        /**
         * The factor applied along the direction; 1 changes nothing, 2 doubles distances from the
         * center along it.
         * @default 2
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        scale?: number | undefined = 2;
    }
    /**
     * A center and a factor per axis for `transforms.scaleCenterXYZ`.
     */
    export class ScaleCenterXYZDto {
        constructor(center?: Base.Point3, scaleXyz?: Base.Vector3) {
            if (center !== undefined) { this.center = center; }
            if (scaleXyz !== undefined) { this.scaleXyz = scaleXyz; }
        }
        /**
         * The point that stays in place while everything else moves away from it or toward it.
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
     * One factor for `transforms.uniformScale`, applied on every axis from the origin.
     */
    export class UniformScaleDto {
        constructor(scale?: number) {
            if (scale !== undefined) { this.scale = scale; }
        }
        /**
         * The factor on every axis: 1 changes nothing, 2 doubles every size and distance from the
         * origin.
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        scale = 1;
    }
    /**
     * One factor and a center for `transforms.uniformScaleFromCenter`.
     */
    export class UniformScaleFromCenterDto {
        constructor(scale?: number, center?: Base.Point3) {
            if (scale !== undefined) { this.scale = scale; }
            if (center !== undefined) { this.center = center; }
        }
        /**
         * The factor on every axis: 1 changes nothing, 2 doubles every size and distance from the
         * center.
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        scale = 1;
        /**
         * The point that stays in place while everything else moves away from it or toward it.
         * @default [0, 0, 0]
         */
        center: Base.Point3 = [0, 0, 0];
    }
    /**
     * A vector for `transforms.translationXYZ`, which builds the matrix that moves by it.
     */
    export class TranslationXYZDto {
        constructor(translation?: Base.Vector3) {
            if (translation !== undefined) { this.translation = translation; }
        }
        /**
         * How far to move along each axis, as `[x, y, z]` in model units.
         * @default [0, 0, 0]
         */
        translation: Base.Vector3 = [0, 0, 0];
    }
    /**
     * Several vectors for `transforms.translationsXYZ`, one transformation each.
     */
    export class TranslationsXYZDto {
        constructor(translations?: Base.Vector3[]) {
            if (translations !== undefined) { this.translations = translations; }
        }
        /**
         * The vectors to move by, each `[x, y, z]` in model units; the result keeps their order.
         * @default undefined
         */
        translations!: Base.Vector3[];
    }
}
