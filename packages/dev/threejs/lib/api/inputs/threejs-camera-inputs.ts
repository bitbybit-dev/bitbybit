/* eslint-disable @typescript-eslint/no-namespace */

import * as THREEJS from "three";
import { Base } from "./base-inputs";

/**
 * Interface for orbit camera internal state and methods.
 * Exposed through OrbitCameraController.orbitCamera property.
 */
export interface OrbitCameraInstance {
    autoRender: boolean;
    distanceMax: number;
    distanceMin: number;
    pitchAngleMax: number;
    pitchAngleMin: number;
    inertiaFactor: number;
    enableDamping: boolean;
    dampingFactor: number;
    focusObject: THREEJS.Object3D | null;
    frameOnStart: boolean;
    distance: number;
    pitch: number;
    yaw: number;
    pivotPoint: THREEJS.Vector3;
    focus(focusObject: THREEJS.Object3D, padding?: number): void;
    resetAndLookAtPoint(resetPoint: THREEJS.Vector3, lookAtPoint: THREEJS.Vector3): void;
    resetAndLookAtObject(resetPoint: THREEJS.Vector3, object: THREEJS.Object3D): void;
    reset(yaw: number, pitch: number, distance: number): void;
    update(dt: number): void;
    initializePivotPoint(point: THREEJS.Vector3): void;
}

/**
 * Interface for input handlers (mouse, touch, keyboard).
 */
export interface InputHandler {
    destroy(): void;
}

/**
 * Orbit camera controller returned by create method.
 * Contains the camera, orbit controls, and input handlers.
 */
export interface OrbitCameraController {
    orbitCamera: OrbitCameraInstance;
    camera: THREEJS.PerspectiveCamera;
    mouseInput: InputHandler | null;
    touchInput: InputHandler | null;
    keyboardInput: InputHandler | null;
    update: (dt: number) => void;
    destroy: () => void;
}

/**
 * Parameters for Three.js cameras: position, target, field of view and clipping planes, plus the
 * orbit-control settings that decide how a user moves the view.
 */
export namespace ThreeJSCamera {
    /**
     * Feeds `three.camera.orbitCamera.create`: where the orbiting camera starts around its pivot,
     * how far it may zoom and tilt, how fast it reacts and how its motion is smoothed.
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
            panSensitivity?: number,
            inertiaFactor?: number,
            autoRender?: boolean,
            frameOnStart?: boolean,
            enableDamping?: boolean,
            dampingFactor?: number
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
            if (panSensitivity !== undefined) { this.panSensitivity = panSensitivity; }
            if (inertiaFactor !== undefined) { this.inertiaFactor = inertiaFactor; }
            if (autoRender !== undefined) { this.autoRender = autoRender; }
            if (frameOnStart !== undefined) { this.frameOnStart = frameOnStart; }
            if (enableDamping !== undefined) { this.enableDamping = enableDamping; }
            if (dampingFactor !== undefined) { this.dampingFactor = dampingFactor; }
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
         * @default 0.15
         * @minimum 0
         * @maximum 10
         * @step 0.01
         */
        distanceSensitivity = 0.15;
        /**
         * How far a pan drag moves the pivot; higher pans faster
         * @default 1
         * @minimum 0
         * @maximum 10
         * @step 0.1
         */
        panSensitivity = 1;
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
         * When true, camera moves ease in and out instead of stopping dead
         * @default true
         */
        enableDamping = true;
        /**
         * How quickly damped moves settle; lower is smoother but slower
         * @default 0.1
         * @minimum 0.01
         * @maximum 1
         * @step 0.01
         */
        dampingFactor = 0.1;
        /**
         * An object to frame the camera on at the start, when given
         * @optional true
         */
        focusObject?: THREEJS.Object3D | undefined;
        /**
         * The element the pointer and touch listeners attach to; left out, the whole page
         * @optional true
         */
        domElement?: HTMLElement | undefined;
    }

    /**
     * A Three.js camera to work on; kept for camera methods that take just the camera.
     */
    export class CameraDto {
        constructor(camera?: THREEJS.PerspectiveCamera | THREEJS.OrthographicCamera) {
            if (camera !== undefined) { this.camera = camera; }
        }
        /**
         * The camera to work on
         * @default undefined
         */
        camera!: THREEJS.PerspectiveCamera | THREEJS.OrthographicCamera;
    }

    /**
     * A Three.js camera and the point to move it to; kept for camera methods that place the camera.
     */
    export class PositionDto {
        constructor(camera?: THREEJS.PerspectiveCamera | THREEJS.OrthographicCamera, position?: Base.Point3) {
            if (camera !== undefined) { this.camera = camera; }
            if (position !== undefined) { this.position = position; }
        }
        /**
         * The camera to move
         * @default undefined
         */
        camera!: THREEJS.PerspectiveCamera | THREEJS.OrthographicCamera;
        /**
         * The point to move the camera to
         * @default [0, 0, 0]
         */
        position: Base.Point3 = [0, 0, 0];
    }

    /**
     * Feeds `three.camera.orbitCamera.setPivotPoint` and `getPivotPoint` with the controller and
     * the point the camera circles around.
     */
    export class PivotPointDto {
        constructor(orbitCamera?: OrbitCameraController, pivotPoint?: Base.Point3) {
            if (orbitCamera !== undefined) { this.orbitCamera = orbitCamera; }
            if (pivotPoint !== undefined) { this.pivotPoint = pivotPoint; }
        }
        /**
         * The orbit camera controller, as `create` gave it
         * @default undefined
         */
        orbitCamera!: OrbitCameraController;
        /**
         * The point the camera looks at and circles around
         * @default [0, 0, 0]
         */
        pivotPoint: Base.Point3 = [0, 0, 0];
    }

    /**
     * Feeds `three.camera.orbitCamera.focusOnObject` with the controller, the object to frame and
     * how much space to leave around it.
     */
    export class FocusObjectDto {
        constructor(orbitCamera?: OrbitCameraController, object?: THREEJS.Object3D, padding?: number) {
            if (orbitCamera !== undefined) { this.orbitCamera = orbitCamera; }
            if (object !== undefined) { this.object = object; }
            if (padding !== undefined) { this.padding = padding; }
        }
        /**
         * The orbit camera controller, as `create` gave it
         * @default undefined
         */
        orbitCamera!: OrbitCameraController;
        /**
         * The object the camera backs off to fit in view
         * @default undefined
         */
        object!: THREEJS.Object3D;
        /**
         * Space left around the object as a factor; 1 fits it tightly, 1.5 leaves half again as
         * much room
         * @default 1.5
         * @minimum 1
         * @maximum 5
         * @step 0.1
         */
        padding = 1.5;
    }

    /**
     * Feeds `three.camera.orbitCamera.resetCamera` with the controller and the angles and distance
     * to put the camera at.
     */
    export class ResetCameraDto {
        constructor(orbitCamera?: OrbitCameraController, yaw?: number, pitch?: number, distance?: number) {
            if (orbitCamera !== undefined) { this.orbitCamera = orbitCamera; }
            if (yaw !== undefined) { this.yaw = yaw; }
            if (pitch !== undefined) { this.pitch = pitch; }
            if (distance !== undefined) { this.distance = distance; }
        }
        /**
         * The orbit camera controller, as `create` gave it
         * @default undefined
         */
        orbitCamera!: OrbitCameraController;
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

    /**
     * Feeds the `three.camera.orbitCamera` getters with the controller to read from.
     */
    export class OrbitCameraControllerDto {
        constructor(orbitCamera?: OrbitCameraController) {
            if (orbitCamera !== undefined) { this.orbitCamera = orbitCamera; }
        }
        /**
         * The orbit camera controller, as `create` gave it
         * @default undefined
         */
        orbitCamera!: OrbitCameraController;
    }

    /**
     * Feeds `three.camera.orbitCamera.setDistanceLimits` with the controller and how close and how
     * far the camera may zoom.
     */
    export class SetDistanceLimitsDto {
        constructor(orbitCamera?: OrbitCameraController, min?: number, max?: number) {
            if (orbitCamera !== undefined) { this.orbitCamera = orbitCamera; }
            if (min !== undefined) { this.min = min; }
            if (max !== undefined) { this.max = max; }
        }
        /**
         * The orbit camera controller, as `create` gave it
         * @default undefined
         */
        orbitCamera!: OrbitCameraController;
        /**
         * The closest the camera may zoom to the pivot, in scene units
         * @default 0.1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        min = 0.1;
        /**
         * The farthest the camera may zoom from the pivot, in scene units
         * @default 1000
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        max = 1000;
    }

    /**
     * Feeds `three.camera.orbitCamera.setPitchLimits` with the controller and how far down and up
     * the camera may tilt.
     */
    export class SetPitchLimitsDto {
        constructor(orbitCamera?: OrbitCameraController, min?: number, max?: number) {
            if (orbitCamera !== undefined) { this.orbitCamera = orbitCamera; }
            if (min !== undefined) { this.min = min; }
            if (max !== undefined) { this.max = max; }
        }
        /**
         * The orbit camera controller, as `create` gave it
         * @default undefined
         */
        orbitCamera!: OrbitCameraController;
        /**
         * The lowest the camera may tilt, in degrees; 0 keeps it above the ground plane
         * @default -90
         * @minimum -90
         * @maximum 90
         * @step 1
         */
        min = -90;
        /**
         * The highest the camera may tilt, in degrees; 90 looks straight down
         * @default 90
         * @minimum -90
         * @maximum 90
         * @step 1
         */
        max = 90;
    }
}
