import * as pc from "playcanvas";
import { Base } from "./base-inputs";

/* eslint-disable @typescript-eslint/no-namespace */
export namespace PlayCanvasCamera {
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
         * Inertia factor for smooth camera movement (0 = no inertia, 1 = maximum inertia)
         * @default 0
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        inertiaFactor = 0;
        /**
         * Whether the camera should automatically render the scene
         * @default true
         */
        autoRender = true;
        /**
         * Whether to frame the focus entity on start
         * @default true
         */
        frameOnStart = true;
        /**
         * Optional focus entity to frame the camera on. If provided, camera will adjust to view this entity.
         * @optional true
         */
        focusEntity?: pc.Entity;
    }

    export class CameraDto {
        constructor(camera?: pc.Entity) {
            if (camera !== undefined) { this.camera = camera; }
        }
        /**
         * PlayCanvas camera entity
         * @default undefined
         */
        camera: pc.Entity;
    }

    export class PositionDto {
        constructor(camera?: pc.Entity, position?: Base.Point3) {
            if (camera !== undefined) { this.camera = camera; }
            if (position !== undefined) { this.position = position; }
        }
        /**
         * PlayCanvas camera entity
         * @default undefined
         */
        camera: pc.Entity;
        /**
         * Position of the camera
         * @default [0, 0, 0]
         */
        position: Base.Point3 = [0, 0, 0];
    }

    export class PivotPointDto {
        constructor(orbitCamera?: any, pivotPoint?: Base.Point3) {
            if (orbitCamera !== undefined) { this.orbitCamera = orbitCamera; }
            if (pivotPoint !== undefined) { this.pivotPoint = pivotPoint; }
        }
        /**
         * Orbit camera instance
         * @default undefined
         */
        orbitCamera: any;
        /**
         * Pivot point for the orbit camera
         * @default [0, 0, 0]
         */
        pivotPoint: Base.Point3 = [0, 0, 0];
    }

    export class FocusEntityDto {
        constructor(orbitCamera?: any, entity?: pc.Entity) {
            if (orbitCamera !== undefined) { this.orbitCamera = orbitCamera; }
            if (entity !== undefined) { this.entity = entity; }
        }
        /**
         * Orbit camera instance
         * @default undefined
         */
        orbitCamera: any;
        /**
         * Entity to focus the camera on
         * @default undefined
         */
        entity: pc.Entity;
    }

    export class ResetCameraDto {
        constructor(orbitCamera?: any, yaw?: number, pitch?: number, distance?: number) {
            if (orbitCamera !== undefined) { this.orbitCamera = orbitCamera; }
            if (yaw !== undefined) { this.yaw = yaw; }
            if (pitch !== undefined) { this.pitch = pitch; }
            if (distance !== undefined) { this.distance = distance; }
        }
        /**
         * Orbit camera instance
         * @default undefined
         */
        orbitCamera: any;
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
}
