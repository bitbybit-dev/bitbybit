import { Camera, TargetCamera } from "@babylonjs/core";
import { Base } from "./base-inputs";

/* eslint-disable @typescript-eslint/no-namespace */
export namespace BabylonCamera {
    export class ArcRotateCameraDto {
        /**
         * Defines the camera distance from its target. This radius will be used to rotate the camera around the target as default.
         * @default 20
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        radius = 20;
        /**
         * Target of the arc rotate camera. Camera will look at and rotate around this point by default.
         * @default [0, 0, 0]
         */
        target: Base.Point3 = [0, 0, 0];
        /**
         * Defines the camera rotation along the longitudinal (horizontal) axis in degrees
         * @default 45
         * @minimum -360
         * @maximum 360
         * @step 1
         */
        alpha = 45;
        /**
         * Defines the camera rotation along the latitudinal (vertical) axis in degrees. This is counted from top down, where 0 is looking from top straight down.
         * @default 70
         * @minimum -360
         * @maximum 360
         * @step 1
         */
        beta = 70;
        /**
         * Lower beta limit - camera rotation along the latitudinal (vertical) axis in degrees. This is counted from the top down, where 0 is looking from top straight down.
         * @default 1
         * @minimum -360
         * @maximum 360
         * @step 1
         */
        lowerBetaLimit = 1;
        /**
         * Upper beta limit - camera rotation along the longitudinal (vertical) axis in degrees. This is counted from the top down, where 180 is looking from bottom straight up.
         * @default 179
         * @minimum -360
         * @maximum 360
         * @step 1
         */
        upperBetaLimit = 179;
        /**
         * Angular sensibility along x (horizontal) axis of the camera
         * @default 1000
         * @minimum 0
         * @maximum Infinity
         * @step 10
         */
        angularSensibilityX = 1000;
        /**
         * Angular sensibility along y (vertical) axis of the camera
         * @default 1000
         * @minimum 0
         * @maximum Infinity
         * @step 10
         */
        angularSensibilityY = 1000;
        /**
         * Panning sensibility. The lower this number gets the faster camera will move when panning.
         * @default 1000
         * @minimum 0
         * @maximum Infinity
         * @step 100
         */
        panningSensibility = 1000;
        /**
         * Wheel precision. The lower this number gets the faster camera will move when zooming.
         * @default 3
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        wheelPrecision = 3;
        /**
         * Maximum distance the camera can see. Objects that are further away from the camera than this value will not be rendered.
         * @default 1000
         * @minimum 0
         * @maximum Infinity
         * @step 10
         */
        maxZ = 1000;
    }
    export class FreeCameraDto {
        /**
         * Position of the free camera
         */
        position: Base.Point3;
        /**
         * Target of the free camera
         */
        target: Base.Point3 = [0, 0, 0];
    }
    export class TargetCameraDto {
        /**
         * Position of the free camera
         */
        position: Base.Point3;
        /**
         * Target of the free camera
         */
        target: Base.Point3 = [0, 0, 0];
    }
    export class PositionDto {
        /**
         * Target camera
         */
        camera: TargetCamera;
        /**
         * Position of the free camera
         */
        position: Base.Point3;
    }
    export class SpeedDto {
        /**
         * Target camera
         */
        camera: TargetCamera;
        /**
         * speed of the camera
         */
        speed: number;
    }
    export class TargetDto {
        /**
         * Target camera
         */
        camera: TargetCamera;
        /**
         * target of the camera
         */
        target: Base.Point3;
    }
    export class MinZDto {
        /**
         * Free camera
         */
        camera: Camera;
        /**
         * minZ of the camera
         */
        minZ = 0;
    }
    export class MaxZDto {
        /**
         * Free camera
         */
        camera: Camera;
        /**
         * maxZ of the camera
         */
        maxZ = 0;
    }

    export class CameraDto {
        /**
         * Camera
         */
        camera: Camera;
    }
}
