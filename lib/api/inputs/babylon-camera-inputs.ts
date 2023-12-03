import { Camera, FreeCamera, TargetCamera } from "@babylonjs/core";
import { Base } from "./base-inputs";

/* eslint-disable @typescript-eslint/no-namespace */


// tslint:disable-next-line: no-namespace
export namespace BabylonCamera {
    export class ArcRotateCameraDto {
        /**
         * Defines the camera rotation along the longitudinal axis
         */
        alpha = 0;
        /**
         * Defines the camera rotation along the latitudinal axis
         */
        beta = 10;
        /**
         * Defines the camera distance from its target
         */
        radius = 10;
        /**
         * Target of the arc rotate camera
         */
        target?: Base.Point3 = [0, 0, 0];
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
