import * as pc from "playcanvas";
import { Base } from "./base-inputs";

/* eslint-disable @typescript-eslint/no-namespace */
/**
 * Parameters for PlayCanvas cameras: position, target, field of view and clipping planes, plus the
 * orbit settings that decide how a user moves the view.
 */
export namespace PlayCanvasCamera {
    /**
     * Feeds `playcanvas.camera.orbitCamera.create`: where the orbiting camera starts around its
     * pivot, how far it may zoom and tilt, how fast it reacts and how its motion is smoothed.
     */
    export class OrbitCameraDto {
        constructor(
            distance?: number,
            pitch?: number,
            yaw?: number,
            distanceMin?: number,
            distanceMax?: number,
            pitchAngleMin?: number,
            pitchAngleMax?: number,
            orbitSensitivity?: number,
            distanceSensitivity?: number,
            inertiaFactor?: number,
            autoRender?: boolean,
            frameOnStart?: boolean
        ) {
            if (distance !== undefined) { this.distance = distance; }
            if (pitch !== undefined) { this.pitch = pitch; }
            if (yaw !== undefined) { this.yaw = yaw; }
            if (distanceMin !== undefined) { this.distanceMin = distanceMin; }
            if (distanceMax !== undefined) { this.distanceMax = distanceMax; }
            if (pitchAngleMin !== undefined) { this.pitchAngleMin = pitchAngleMin; }
            if (pitchAngleMax !== undefined) { this.pitchAngleMax = pitchAngleMax; }
            if (orbitSensitivity !== undefined) { this.orbitSensitivity = orbitSensitivity; }
            if (distanceSensitivity !== undefined) { this.distanceSensitivity = distanceSensitivity; }
            if (inertiaFactor !== undefined) { this.inertiaFactor = inertiaFactor; }
            if (autoRender !== undefined) { this.autoRender = autoRender; }
            if (frameOnStart !== undefined) { this.frameOnStart = frameOnStart; }
        }
        /**
         * The point the camera looks at and circles around
         * @default [0, 0, 0]
         */
        pivotPoint: Base.Point3 = [0, 0, 0];
        /**
         * How far from the pivot the camera starts, in scene units
         * @default 20
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        distance = 20;
        /**
         * How far above or below the pivot the camera starts, in degrees; 0 is level, positive is
         * above looking down
         * @default 30
         * @minimum -90
         * @maximum 90
         * @step 1
         */
        pitch = 30;
        /**
         * How far around the vertical axis the camera starts, in degrees
         * @default 45
         * @minimum -360
         * @maximum 360
         * @step 1
         */
        yaw = 45;
        /**
         * The closest the camera may zoom to the pivot, in scene units
         * @default 0.1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        distanceMin = 0.1;
        /**
         * The farthest the camera may zoom from the pivot, in scene units
         * @default 1000
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        distanceMax = 1000;
        /**
         * The lowest the camera may tilt, in degrees; -90 looks straight up from below
         * @default -90
         * @minimum -90
         * @maximum 90
         * @step 1
         */
        pitchAngleMin = -90;
        /**
         * The highest the camera may tilt, in degrees; 90 looks straight down from above
         * @default 90
         * @minimum -90
         * @maximum 90
         * @step 1
         */
        pitchAngleMax = 90;
        /**
         * How far a pointer drag turns the camera; higher turns faster
         * @default 0.3
         * @minimum 0
         * @maximum 10
         * @step 0.1
         */
        orbitSensitivity = 0.3;
        /**
         * How far a wheel step zooms the camera; higher zooms faster
         * @default 0.5
         * @minimum 0
         * @maximum 10
         * @step 0.01
         */
        distanceSensitivity = 0.5;
        /**
         * How much the camera keeps gliding after a drag, from 0 for none to 1 for most
         * @default 0.1
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        inertiaFactor = 0.1;
        /**
         * When true, the scene is rendered again whenever the camera moves
         * @default true
         */
        autoRender = true;
        /**
         * When true and a focus object is given, the camera starts framed on it
         * @default true
         */
        frameOnStart = true;
        /**
         * An entity to frame the camera on at the start, when given
         * @optional true
         */
        focusEntity?: pc.Entity | undefined;
    }

    /**
     * A PlayCanvas camera to work on; kept for camera methods that take just the camera.
     */
    export class CameraDto {
        constructor(camera?: pc.Entity) {
            if (camera !== undefined) { this.camera = camera; }
        }
        /**
         * The camera to work on
         * @default undefined
         */
        camera!: pc.Entity;
    }

    /**
     * A PlayCanvas camera and the point to move it to; kept for camera methods that place the
     * camera.
     */
    export class PositionDto {
        constructor(camera?: pc.Entity, position?: Base.Point3) {
            if (camera !== undefined) { this.camera = camera; }
            if (position !== undefined) { this.position = position; }
        }
        /**
         * The camera to move
         * @default undefined
         */
        camera!: pc.Entity;
        /**
         * The point to move the camera to
         * @default [0, 0, 0]
         */
        position: Base.Point3 = [0, 0, 0];
    }

    /**
     * Feeds `playcanvas.camera.orbitCamera.setPivotPoint` and `getPivotPoint` with the controller
     * and the point the camera circles around.
     */
    export class PivotPointDto {
        constructor(orbitCamera?: any, pivotPoint?: Base.Point3) {
            if (orbitCamera !== undefined) { this.orbitCamera = orbitCamera; }
            if (pivotPoint !== undefined) { this.pivotPoint = pivotPoint; }
        }
        /**
         * The orbit camera controller, as `create` gave it
         * @default undefined
         */
        orbitCamera: any;
        /**
         * The point the camera looks at and circles around
         * @default [0, 0, 0]
         */
        pivotPoint: Base.Point3 = [0, 0, 0];
    }

    /**
     * Feeds `playcanvas.camera.orbitCamera.focusOnEntity` with the controller and the entity to
     * frame.
     */
    export class FocusEntityDto {
        constructor(orbitCamera?: any, entity?: pc.Entity) {
            if (orbitCamera !== undefined) { this.orbitCamera = orbitCamera; }
            if (entity !== undefined) { this.entity = entity; }
        }
        /**
         * The orbit camera controller, as `create` gave it
         * @default undefined
         */
        orbitCamera: any;
        /**
         * The entity the camera backs off to fit in view
         * @default undefined
         */
        entity!: pc.Entity;
    }

    /**
     * Feeds `playcanvas.camera.orbitCamera.resetCamera` with the controller and the angles and
     * distance to put the camera at.
     */
    export class ResetCameraDto {
        constructor(orbitCamera?: any, yaw?: number, pitch?: number, distance?: number) {
            if (orbitCamera !== undefined) { this.orbitCamera = orbitCamera; }
            if (yaw !== undefined) { this.yaw = yaw; }
            if (pitch !== undefined) { this.pitch = pitch; }
            if (distance !== undefined) { this.distance = distance; }
        }
        /**
         * The orbit camera controller, as `create` gave it
         * @default undefined
         */
        orbitCamera: any;
        /**
         * How far around the vertical axis, in degrees
         * @default 45
         * @minimum -360
         * @maximum 360
         * @step 1
         */
        yaw = 45;
        /**
         * How far above or below the pivot, in degrees; positive is above looking down
         * @default 30
         * @minimum -90
         * @maximum 90
         * @step 1
         */
        pitch = 30;
        /**
         * How far from the pivot, in scene units
         * @default 20
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        distance = 20;
    }
}
