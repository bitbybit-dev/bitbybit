import { Base } from "./base-inputs";

// tslint:disable-next-line: no-namespace
export namespace Transforms {

    export class RotationCenterAxisDto {
        /**
         * Angle of rotation in degrees
         */
        angle: number;
        /**
         * Axis vector for rotation
         */
        axis: Base.Vector3;
        /**
         * The center from which the axis is pointing
         */
        center: Base.Point3;
    }
    export class RotationCenterDto {
        /**
         * Angle of rotation in degrees
         */
        angle: number;
        /**
         * The center from which the axis is pointing
         */
        center: Base.Point3;
    }
    export class RotationCenterYawPitchRollDto {
        /**
         * Yaw angle (Rotation around X) in degrees
         */
        yaw: number;
        /**
         * Pitch angle (Rotation around Y) in degrees
         */
        pitch: number;
        /**
         * Roll angle (Rotation around Z) in degrees
         */
        roll: number;
        /**
         * The center from which the rotations are applied
         */
        center: Base.Point3;
    }
    export class ScaleXYZDto {
        /**
         * Scaling factors for each axis [1, 2, 1] means that Y axis will be scaled 200% and both x and z axis will remain on 100%
         */
        scaleXyz: Base.Vector3;
    }
    export class ScaleCenterXYZDto {
        /**
         * The center from which the scaling is applied
         */
        center: Base.Point3;
        /**
         * Scaling factors for each axis [1, 2, 1] means that Y axis will be scaled 200% and both x and z axis will remain on 100%
         */
        scaleXyz: Base.Vector3;
    }
    export class UniformScaleDto {
        /**
         * Uniform scale factor for all x, y, z directions. 1 will keep everything on original size, 2 will scale 200%;
         */
        scale: number;
    }
    export class UniformScaleFromCenterDto {
        /**
         * Scale factor for all x, y, z directions. 1 will keep everything on original size, 2 will scale 200%;
         */
        scale: number;
        /**
         * Center position of the scaling
         */
        center: Base.Point3;
    }
    export class TranslationXYZDto {
        /**
         * Translation vector with [x, y, z] distances
         */
        translation: Base.Vector3;
    }

}
