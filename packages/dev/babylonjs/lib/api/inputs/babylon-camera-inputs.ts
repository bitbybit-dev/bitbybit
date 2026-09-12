import * as BABYLON from "@babylonjs/core";
import { Base } from "./base-inputs";

/* eslint-disable @typescript-eslint/no-namespace */
/**
 * Parameters for cameras: position, target, field of view, near and far clipping planes, and the
 * settings specific to free, target and arc-rotate cameras.
 */
export namespace BabylonCamera {
    /**
     * Feeds `babylon.camera.arcRotate.create`: where the orbiting camera starts around its target,
     * how far it can zoom and orbit, and how fast it reacts.
     */
    export class ArcRotateCameraDto {
        constructor(radius?: number, alpha?: number, beta?: number, lowerRadiusLimit?: number, upperRadiusLimit?: number, lowerAlphaLimit?: number, upperAlphaLimit?: number, lowerBetaLimit?: number, upperBetaLimit?: number, angularSensibilityX?: number, angularSensibilityY?: number, panningSensibility?: number, wheelPrecision?: number, maxZ?: number) {
            if (radius !== undefined) { this.radius = radius; }
            if (alpha !== undefined) { this.alpha = alpha; }
            if (beta !== undefined) { this.beta = beta; }
            if (lowerRadiusLimit !== undefined) { this.lowerRadiusLimit = lowerRadiusLimit; }
            if (upperRadiusLimit !== undefined) { this.upperRadiusLimit = upperRadiusLimit; }
            if (lowerAlphaLimit !== undefined) { this.lowerAlphaLimit = lowerAlphaLimit; }
            if (upperAlphaLimit !== undefined) { this.upperAlphaLimit = upperAlphaLimit; }
            if (lowerBetaLimit !== undefined) { this.lowerBetaLimit = lowerBetaLimit; }
            if (upperBetaLimit !== undefined) { this.upperBetaLimit = upperBetaLimit; }
            if (angularSensibilityX !== undefined) { this.angularSensibilityX = angularSensibilityX; }
            if (angularSensibilityY !== undefined) { this.angularSensibilityY = angularSensibilityY; }
            if (panningSensibility !== undefined) { this.panningSensibility = panningSensibility; }
            if (wheelPrecision !== undefined) { this.wheelPrecision = wheelPrecision; }
            if (maxZ !== undefined) { this.maxZ = maxZ; }
        }
        /**
         * Distance from the target the camera starts at, in scene units
         * @default 20
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        radius = 20;
        /**
         * The point the camera looks at and orbits around
         * @default [0, 0, 0]
         */
        target: Base.Point3 = [0, 0, 0];
        /**
         * The camera's angle around the vertical axis, in degrees
         * @default 45
         * @minimum -360
         * @maximum 360
         * @step 1
         */
        alpha = 45;
        /**
         * The camera's angle down from straight above, in degrees; 90 is level with the target
         * @default 70
         * @minimum -360
         * @maximum 360
         * @step 1
         */
        beta = 70;
        /**
         * The closest the camera may zoom to the target, in scene units; left out, there is no
         * limit
         * @default undefined
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         * @optional true
         */
        lowerRadiusLimit?: number | undefined;
        /**
         * The farthest the camera may zoom from the target, in scene units; left out, there is no
         * limit
         * @default undefined
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         * @optional true
         */
        upperRadiusLimit?: number | undefined;
        /**
         * The smallest angle around the vertical axis the camera may orbit to, in degrees; left
         * out, it orbits freely
         * @default undefined
         * @minimum -360
         * @maximum 360
         * @step 1
         * @optional true
         */
        lowerAlphaLimit?: number | undefined;
        /**
         * The largest angle around the vertical axis the camera may orbit to, in degrees; left out,
         * it orbits freely
         * @default undefined
         * @minimum -360
         * @maximum 360
         * @step 1
         * @optional true
         */
        upperAlphaLimit?: number | undefined;
        /**
         * How close to straight above the camera may go, in degrees down from the top; 0 would look
         * straight down
         * @default 1
         * @minimum -360
         * @maximum 360
         * @step 1
         */
        lowerBetaLimit = 1;
        /**
         * How close to straight below the camera may go, in degrees down from the top; 180 would
         * look straight up
         * @default 179
         * @minimum -360
         * @maximum 360
         * @step 1
         */
        upperBetaLimit = 179;
        /**
         * How much pointer movement a horizontal orbit takes; lower turns faster
         * @default 1000
         * @minimum 0
         * @maximum Infinity
         * @step 10
         */
        angularSensibilityX = 1000;
        /**
         * How much pointer movement a vertical orbit takes; lower turns faster
         * @default 1000
         * @minimum 0
         * @maximum Infinity
         * @step 10
         */
        angularSensibilityY = 1000;
        /**
         * How much pointer movement a pan takes; lower pans faster, so lower it for large models
         * @default 1000
         * @minimum 0
         * @maximum Infinity
         * @step 100
         */
        panningSensibility = 1000;
        /**
         * How much wheel movement a zoom step takes; lower zooms faster, so lower it for large
         * models
         * @default 3
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        wheelPrecision = 3;
        /**
         * The farthest distance the camera draws, in scene units; anything beyond is not rendered
         * @default 1000
         * @minimum 0
         * @maximum Infinity
         * @step 10
         */
        maxZ = 1000;
    }
    /**
     * Feeds `babylon.camera.free.create` with where the flying camera starts and what it looks at.
     */
    export class FreeCameraDto {
        constructor(position?: Base.Point3, target?: Base.Point3) {
            if (position !== undefined) { this.position = position; }
            if (target !== undefined) { this.target = target; }
        }
        /**
         * Where the camera starts
         * @default [20, 20, 20]
         */
        position: Base.Point3 = [20, 20, 20];
        /**
         * The point the camera looks at to begin with
         * @default [0, 0, 0]
         */
        target: Base.Point3 = [0, 0, 0];
    }
    /**
     * Feeds `babylon.camera.target.create` with where the fixed camera sits and what it looks at.
     */
    export class TargetCameraDto {
        constructor(position?: Base.Point3, target?: Base.Point3) {
            if (position !== undefined) { this.position = position; }
            if (target !== undefined) { this.target = target; }
        }
        /**
         * Where the camera sits
         * @default [20, 20, 20]
         */
        position: Base.Point3 = [20, 20, 20];
        /**
         * The point the camera looks at
         * @default [0, 0, 0]
         */
        target: Base.Point3 = [0, 0, 0];
    }
    /**
     * Feeds `babylon.camera.setPosition` and the camera getters with a camera and the point to move
     * it to.
     */
    export class PositionDto {
        constructor(camera?: BABYLON.TargetCamera, position?: Base.Point3) {
            if (camera !== undefined) { this.camera = camera; }
            if (position !== undefined) { this.position = position; }
        }
        /**
         * The camera to move or read
         */
        camera!: BABYLON.TargetCamera;
        /**
         * Where to move the camera
         * @default [20, 20, 20]
         */
        position: Base.Point3 = [20, 20, 20];
    }
    /**
     * Feeds `babylon.camera.setSpeed` with a camera and how fast its controls move it.
     */
    export class SpeedDto {
        constructor(camera?: BABYLON.TargetCamera, speed?: number) {
            if (camera !== undefined) { this.camera = camera; }
            if (speed !== undefined) { this.speed = speed; }
        }
        /**
         * The camera to change
         */
        camera!: BABYLON.TargetCamera;
        /**
         * How fast the controls move the camera; 1 is the default pace
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        speed = 1;
    }
    /**
     * Feeds `babylon.camera.setTarget` with a camera and the point to look at.
     */
    export class TargetDto {
        constructor(camera?: BABYLON.TargetCamera, target?: Base.Point3) {
            if (camera !== undefined) { this.camera = camera; }
            if (target !== undefined) { this.target = target; }
        }
        /**
         * The camera to turn
         */
        camera!: BABYLON.TargetCamera;
        /**
         * The point the camera is turned to look at
         * @default [0, 0, 0]
         */
        target: Base.Point3 = [0, 0, 0];
    }
    /**
     * Feeds `babylon.camera.setMinZ` with a camera and its near clipping distance.
     */
    export class MinZDto {
        constructor(camera?: BABYLON.Camera, minZ?: number) {
            if (camera !== undefined) { this.camera = camera; }
            if (minZ !== undefined) { this.minZ = minZ; }
        }
        /**
         * The camera to change
         */
        camera!: BABYLON.Camera;
        /**
         * The distance below which nothing is drawn, in scene units; keep it above 0 on large
         * scenes for depth precision
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 0.01
         */
        minZ = 0;
    }
    /**
     * Feeds `babylon.camera.setMaxZ` with a camera and its far clipping distance.
     */
    export class MaxZDto {
        constructor(camera?: BABYLON.Camera, maxZ?: number) {
            if (camera !== undefined) { this.camera = camera; }
            if (maxZ !== undefined) { this.maxZ = maxZ; }
        }
        /**
         * The camera to change
         */
        camera!: BABYLON.Camera;
        /**
         * The distance beyond which nothing is drawn, in scene units
         * @default 1000
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        maxZ = 1000;
    }

    /**
     * Feeds `babylon.camera.makeCameraOrthographic` with a camera and the four edges of its flat,
     * distance-free view.
     */
    export class OrthographicDto {
        constructor(camera?: BABYLON.Camera, orthoLeft?: number, orthoRight?: number, orthoTop?: number, orthoBottom?: number) {
            if (camera !== undefined) { this.camera = camera; }
            if (orthoLeft !== undefined) { this.orthoLeft = orthoLeft; }
            if (orthoRight !== undefined) { this.orthoRight = orthoRight; }
            if (orthoTop !== undefined) { this.orthoTop = orthoTop; }
            if (orthoBottom !== undefined) { this.orthoBottom = orthoBottom; }
        }
        /**
         * The camera to switch to orthographic projection
         */
        camera!: BABYLON.Camera;
        /**
         * The left edge of the view, in scene units from the camera's axis; 0 falls back to -1
         * @default -1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        orthoLeft = -1;
        /**
         * The right edge of the view, in scene units from the camera's axis; 0 falls back to 1
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        orthoRight = 1;
        /**
         * The bottom edge of the view, in scene units from the camera's axis; 0 falls back to -1
         * @default -1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        orthoBottom = -1;
        /**
         * The top edge of the view, in scene units from the camera's axis; 0 falls back to 1
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        orthoTop = 1;
    }

    /**
     * Feeds `babylon.camera.makeCameraPerspective`, `freezeProjectionMatrix` and
     * `unfreezeProjectionMatrix` with the one camera to change.
     */
    export class CameraDto {
        constructor(camera?: BABYLON.Camera) {
            if (camera !== undefined) { this.camera = camera; }
        }
        /**
         * The camera to change
         */
        camera!: BABYLON.Camera;
    }
}
