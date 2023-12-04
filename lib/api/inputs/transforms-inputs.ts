/* eslint-disable @typescript-eslint/no-namespace */
import { Base } from "./base-inputs";

export namespace Transforms {

    export class RotationCenterAxisDto {
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
    export class RotationCenterDto {
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
        /**
         * Scaling factors for each axis [1, 2, 1] means that Y axis will be scaled 200% and both x and z axis will remain on 100%
         * @default [1, 1, 1]
         */
        scaleXyz: Base.Vector3 = [1, 1, 1];
    }
    export class ScaleCenterXYZDto {
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
        /**
         * Translation vector with [x, y, z] distances
         * @default [0, 0, 0]
         */
        translation: Base.Vector3 = [0, 0, 0];
    }
    export class TranslationsXYZDto {
        /**
         * Translation vectors with [x, y, z] distances
         * @default undefined
         */
        translations: Base.Vector3[];
    }
}
