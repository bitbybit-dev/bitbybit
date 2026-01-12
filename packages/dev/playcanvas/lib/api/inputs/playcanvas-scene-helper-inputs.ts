/* eslint-disable @typescript-eslint/no-namespace */

import * as pc from "playcanvas";
import { Base } from "./base-inputs";
import { PlayCanvasCamera } from "./playcanvas-camera-inputs";

/**
 * Interface for orbit camera internal state and methods (PlayCanvas).
 */
export interface PlayCanvasOrbitCameraInstance {
    autoRender: boolean;
    distanceMax: number;
    distanceMin: number;
    pitchAngleMax: number;
    pitchAngleMin: number;
    inertiaFactor: number;
    focusEntity: pc.Entity | null;
    frameOnStart: boolean;
    distance: number;
    pitch: number;
    yaw: number;
    pivotPoint: pc.Vec3;
    focus(focusEntity: pc.Entity): void;
    resetAndLookAtPoint(resetPoint: pc.Vec3, lookAtPoint: pc.Vec3): void;
    resetAndLookAtEntity(resetPoint: pc.Vec3, entity: pc.Entity): void;
    reset(yaw: number, pitch: number, distance: number): void;
    update(dt: number): void;
}

/**
 * Interface for input handlers (mouse, touch).
 */
export interface PlayCanvasInputHandler {
    destroy(): void;
}

/**
 * Orbit camera controller returned by create method.
 */
export interface PlayCanvasOrbitCameraController {
    orbitCamera: PlayCanvasOrbitCameraInstance;
    cameraEntity: pc.Entity;
    mouseInput: PlayCanvasInputHandler | null;
    touchInput: PlayCanvasInputHandler | null;
    update: (dt: number) => void;
    destroy: () => void;
}

/**
 * Result object returned by initPlayCanvas helper function.
 */
export interface InitPlayCanvasResult {
    /** The PlayCanvas application */
    app: pc.Application;
    /** The root scene entity */
    scene: pc.Entity;
    /** The directional light entity */
    directionalLight: pc.Entity;
    /** The ground entity (if enabled) */
    ground: pc.Entity | null;
    /** The orbit camera controller (if enabled) */
    orbitCamera: PlayCanvasOrbitCameraController | null;
    /** Cleanup function to dispose resources */
    dispose: () => void;
}

export namespace PlayCanvasScene {
    export class InitPlayCanvasDto {
        constructor(
            canvasId?: string,
            sceneSize?: number,
            backgroundColor?: string,
            enableShadows?: boolean,
            enableGround?: boolean,
            groundCenter?: Base.Point3,
            groundScaleFactor?: number,
            groundColor?: string,
            groundOpacity?: number,
            ambientLightColor?: string,
            ambientLightIntensity?: number,
            directionalLightColor?: string,
            directionalLightIntensity?: number,
            shadowMapSize?: number
        ) {
            if (canvasId !== undefined) { this.canvasId = canvasId; }
            if (sceneSize !== undefined) { this.sceneSize = sceneSize; }
            if (backgroundColor !== undefined) { this.backgroundColor = backgroundColor; }
            if (enableShadows !== undefined) { this.enableShadows = enableShadows; }
            if (enableGround !== undefined) { this.enableGround = enableGround; }
            if (groundCenter !== undefined) { this.groundCenter = groundCenter; }
            if (groundScaleFactor !== undefined) { this.groundScaleFactor = groundScaleFactor; }
            if (groundColor !== undefined) { this.groundColor = groundColor; }
            if (groundOpacity !== undefined) { this.groundOpacity = groundOpacity; }
            if (ambientLightColor !== undefined) { this.ambientLightColor = ambientLightColor; }
            if (ambientLightIntensity !== undefined) { this.ambientLightIntensity = ambientLightIntensity; }
            if (directionalLightColor !== undefined) { this.directionalLightColor = directionalLightColor; }
            if (directionalLightIntensity !== undefined) { this.directionalLightIntensity = directionalLightIntensity; }
            if (shadowMapSize !== undefined) { this.shadowMapSize = shadowMapSize; }
        }

        /**
         * The ID of the canvas element to render to. If not provided, a new canvas will be created and appended to document.body.
         * @default undefined
         */
        canvasId?: string;

        /**
         * The size of the scene in world units. This determines ground size, light positions, and shadow bounds.
         * @default 20
         * @minimum 1
         * @maximum Infinity
         * @step 10
         */
        sceneSize = 20;

        /**
         * Background color of the scene in hex format.
         * @default "#1a1c1f"
         */
        backgroundColor = "#1a1c1f";

        /**
         * Enable shadow mapping for realistic shadows.
         * @default true
         */
        enableShadows = true;

        /**
         * Enable the ground plane.
         * @default true
         */
        enableGround = true;

        /**
         * Center position of the ground plane [x, y, z].
         * @default [0, 0, 0]
         */
        groundCenter: Base.Point3 = [0, 0, 0];

        /**
         * Scale factor for the ground size relative to scene size. Values greater than 1 make the ground larger than the scene size.
         * @default 2
         * @minimum 0.5
         * @maximum 10
         * @step 0.5
         */
        groundScaleFactor = 2;

        /**
         * Color of the ground plane in hex format.
         * @default "#333333"
         */
        groundColor = "#333333";

        /**
         * Opacity of the ground plane (0 = fully transparent, 1 = fully opaque).
         * @default 1
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        groundOpacity = 1;

        /**
         * Ambient light color. PlayCanvas uses ambient light instead of hemisphere light.
         * @default "#888888"
         */
        ambientLightColor = "#888888";

        /**
         * Intensity factor for ambient light (applied to RGB values).
         * @default 1
         * @minimum 0
         * @maximum 10
         * @step 0.1
         */
        ambientLightIntensity = 1;

        /**
         * Color of the directional light (sun light).
         * @default "#ffffff"
         */
        directionalLightColor = "#ffffff";

        /**
         * Intensity of the directional light.
         * @default 1.5
         * @minimum 0
         * @maximum 10
         * @step 0.1
         */
        directionalLightIntensity = 1.5;

        /**
         * Size of the shadow map in pixels (higher = sharper shadows but more GPU intensive).
         * @default 2048
         * @minimum 256
         * @maximum 8192
         * @step 256
         */
        shadowMapSize = 2048;

        /**
         * Enable automatic creation of an orbit camera controller.
         * @default true
         */
        enableOrbitCamera = true;

        /**
         * Options for the orbit camera. Only used if enableOrbitCamera is true.
         * If not provided, scene-aware defaults will be computed based on sceneSize.
         * Uses the same DTO as the standalone orbit camera creation.
         * @optional true
         */
        orbitCameraOptions?: PlayCanvasCamera.OrbitCameraDto;
    }
}
