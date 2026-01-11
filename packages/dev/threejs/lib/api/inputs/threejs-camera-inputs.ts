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

export namespace ThreeJSCamera {
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
         * Pivot point of the orbit camera. Camera will look at and rotate around this point.
         * @default [0, 0, 0]
         */
        pivotPoint: Base.Point3 = [0, 0, 0];
        /**
         * Defines the camera distance from its pivot point. This distance will be used to orbit the camera around the pivot.
         * @default 20
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        distance = 20;
        /**
         * Defines the camera pitch angle (rotation along the horizontal axis) in degrees. 0 is horizontal, positive is looking up, negative is looking down.
         * @default 30
         * @minimum -90
         * @maximum 90
         * @step 1
         */
        pitch = 30;
        /**
         * Defines the camera yaw angle (rotation along the vertical axis) in degrees.
         * @default 45
         * @minimum -360
         * @maximum 360
         * @step 1
         */
        yaw = 45;
        /**
         * Minimum distance - how close can the camera be to the pivot point
         * @default 0.1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        distanceMin = 0.1;
        /**
         * Maximum distance - how far can the camera be from the pivot point
         * @default 1000
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        distanceMax = 1000;
        /**
         * Minimum pitch angle in degrees
         * @default -90
         * @minimum -90
         * @maximum 90
         * @step 1
         */
        pitchAngleMin = -90;
        /**
         * Maximum pitch angle in degrees
         * @default 90
         * @minimum -90
         * @maximum 90
         * @step 1
         */
        pitchAngleMax = 90;
        /**
         * Mouse orbit sensitivity (how much the camera rotates with mouse movement)
         * @default 0.3
         * @minimum 0
         * @maximum 10
         * @step 0.1
         */
        orbitSensitivity = 0.3;
        /**
         * Mouse zoom sensitivity (how much the camera zooms with mouse wheel)
         * @default 0.15
         * @minimum 0
         * @maximum 10
         * @step 0.01
         */
        distanceSensitivity = 0.15;
        /**
         * Pan sensitivity (how fast the camera pans with mouse/touch)
         * @default 1
         * @minimum 0
         * @maximum 10
         * @step 0.1
         */
        panSensitivity = 1;
        /**
         * Inertia factor for smooth camera movement (0 = no inertia, higher values = more inertia/smoother movement)
         * @default 0.1
         * @minimum 0
         * @maximum 1
         * @step 0.05
         */
        inertiaFactor = 0.1;
        /**
         * Whether the camera should trigger automatic rendering on changes
         * @default true
         */
        autoRender = true;
        /**
         * Whether to frame the focus object on start
         * @default true
         */
        frameOnStart = true;
        /**
         * Enable damping (smooth camera transitions)
         * @default true
         */
        enableDamping = true;
        /**
         * Damping factor for smooth transitions (lower = smoother but slower)
         * @default 0.1
         * @minimum 0.01
         * @maximum 1
         * @step 0.01
         */
        dampingFactor = 0.1;
        /**
         * Optional focus object to frame the camera on. If provided, camera will adjust to view this object.
         * @optional true
         */
        focusObject?: THREEJS.Object3D;
        /**
         * Container element to attach event listeners to. If not provided, uses the renderer's DOM element.
         * @optional true
         */
        domElement?: HTMLElement;
    }

    export class CameraDto {
        constructor(camera?: THREEJS.PerspectiveCamera | THREEJS.OrthographicCamera) {
            if (camera !== undefined) { this.camera = camera; }
        }
        /**
         * ThreeJS camera
         * @default undefined
         */
        camera: THREEJS.PerspectiveCamera | THREEJS.OrthographicCamera;
    }

    export class PositionDto {
        constructor(camera?: THREEJS.PerspectiveCamera | THREEJS.OrthographicCamera, position?: Base.Point3) {
            if (camera !== undefined) { this.camera = camera; }
            if (position !== undefined) { this.position = position; }
        }
        /**
         * ThreeJS camera
         * @default undefined
         */
        camera: THREEJS.PerspectiveCamera | THREEJS.OrthographicCamera;
        /**
         * Position of the camera
         * @default [0, 0, 0]
         */
        position: Base.Point3 = [0, 0, 0];
    }

    export class PivotPointDto {
        constructor(orbitCamera?: OrbitCameraController, pivotPoint?: Base.Point3) {
            if (orbitCamera !== undefined) { this.orbitCamera = orbitCamera; }
            if (pivotPoint !== undefined) { this.pivotPoint = pivotPoint; }
        }
        /**
         * Orbit camera controller instance
         * @default undefined
         */
        orbitCamera: OrbitCameraController;
        /**
         * Pivot point for the orbit camera
         * @default [0, 0, 0]
         */
        pivotPoint: Base.Point3 = [0, 0, 0];
    }

    export class FocusObjectDto {
        constructor(orbitCamera?: OrbitCameraController, object?: THREEJS.Object3D, padding?: number) {
            if (orbitCamera !== undefined) { this.orbitCamera = orbitCamera; }
            if (object !== undefined) { this.object = object; }
            if (padding !== undefined) { this.padding = padding; }
        }
        /**
         * Orbit camera controller instance
         * @default undefined
         */
        orbitCamera: OrbitCameraController;
        /**
         * Object to focus the camera on
         * @default undefined
         */
        object: THREEJS.Object3D;
        /**
         * Padding multiplier for the focus distance (1 = tight fit, higher = more space around object)
         * @default 1.5
         * @minimum 1
         * @maximum 5
         * @step 0.1
         */
        padding = 1.5;
    }

    export class ResetCameraDto {
        constructor(orbitCamera?: OrbitCameraController, yaw?: number, pitch?: number, distance?: number) {
            if (orbitCamera !== undefined) { this.orbitCamera = orbitCamera; }
            if (yaw !== undefined) { this.yaw = yaw; }
            if (pitch !== undefined) { this.pitch = pitch; }
            if (distance !== undefined) { this.distance = distance; }
        }
        /**
         * Orbit camera controller instance
         * @default undefined
         */
        orbitCamera: OrbitCameraController;
        /**
         * Yaw angle in degrees
         * @default 45
         * @minimum -360
         * @maximum 360
         * @step 1
         */
        yaw = 45;
        /**
         * Pitch angle in degrees
         * @default 30
         * @minimum -90
         * @maximum 90
         * @step 1
         */
        pitch = 30;
        /**
         * Distance from pivot point
         * @default 20
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        distance = 20;
    }

    export class OrbitCameraControllerDto {
        constructor(orbitCamera?: OrbitCameraController) {
            if (orbitCamera !== undefined) { this.orbitCamera = orbitCamera; }
        }
        /**
         * Orbit camera controller instance
         * @default undefined
         */
        orbitCamera: OrbitCameraController;
    }

    export class SetDistanceLimitsDto {
        constructor(orbitCamera?: OrbitCameraController, min?: number, max?: number) {
            if (orbitCamera !== undefined) { this.orbitCamera = orbitCamera; }
            if (min !== undefined) { this.min = min; }
            if (max !== undefined) { this.max = max; }
        }
        /**
         * Orbit camera controller instance
         * @default undefined
         */
        orbitCamera: OrbitCameraController;
        /**
         * Minimum distance
         * @default 0.1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        min = 0.1;
        /**
         * Maximum distance
         * @default 1000
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        max = 1000;
    }

    export class SetPitchLimitsDto {
        constructor(orbitCamera?: OrbitCameraController, min?: number, max?: number) {
            if (orbitCamera !== undefined) { this.orbitCamera = orbitCamera; }
            if (min !== undefined) { this.min = min; }
            if (max !== undefined) { this.max = max; }
        }
        /**
         * Orbit camera controller instance
         * @default undefined
         */
        orbitCamera: OrbitCameraController;
        /**
         * Minimum pitch angle in degrees
         * @default -90
         * @minimum -90
         * @maximum 90
         * @step 1
         */
        min = -90;
        /**
         * Maximum pitch angle in degrees
         * @default 90
         * @minimum -90
         * @maximum 90
         * @step 1
         */
        max = 90;
    }
}
