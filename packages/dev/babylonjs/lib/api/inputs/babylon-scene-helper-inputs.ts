/* eslint-disable @typescript-eslint/no-namespace */

import * as BABYLON from "@babylonjs/core";
import { Base } from "./base-inputs";
import { BabylonCamera } from "./babylon-camera-inputs";

/**
 * Result object returned by initBabylonJS helper function.
 */
export interface InitBabylonJSResult {
    /** The BabylonJS scene */
    scene: BABYLON.Scene;
    /** The BabylonJS engine */
    engine: BABYLON.Engine;
    /** The hemispheric light */
    hemisphericLight: BABYLON.HemisphericLight;
    /** The directional light (for shadows) */
    directionalLight: BABYLON.DirectionalLight;
    /** The ground mesh (if enabled) */
    ground: BABYLON.Mesh | null;
    /** The arc rotate camera (if enabled) */
    arcRotateCamera: BABYLON.ArcRotateCamera | null;
    /** Start the render loop */
    startRenderLoop: (onRender?: () => void) => void;
    /** Cleanup function to remove resize listener and dispose resources */
    dispose: () => void;
}

export namespace BabylonJSScene {
    export class InitBabylonJSDto {
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
            hemisphereLightSkyColor?: string,
            hemisphereLightGroundColor?: string,
            hemisphereLightIntensity?: number,
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
            if (hemisphereLightSkyColor !== undefined) { this.hemisphereLightSkyColor = hemisphereLightSkyColor; }
            if (hemisphereLightGroundColor !== undefined) { this.hemisphereLightGroundColor = hemisphereLightGroundColor; }
            if (hemisphereLightIntensity !== undefined) { this.hemisphereLightIntensity = hemisphereLightIntensity; }
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
         * Sky color for the hemisphere light (illumination from above).
         * @default "#ffffff"
         */
        hemisphereLightSkyColor = "#ffffff";

        /**
         * Ground color for the hemisphere light (illumination from below).
         * @default "#444444"
         */
        hemisphereLightGroundColor = "#444444";

        /**
         * Intensity of the hemisphere light.
         * @default 1
         * @minimum 0
         * @maximum 10
         * @step 0.1
         */
        hemisphereLightIntensity = 1;

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
         * Enable automatic creation of an arc rotate camera.
         * @default true
         */
        enableArcRotateCamera = true;

        /**
         * Options for the arc rotate camera. Only used if enableArcRotateCamera is true.
         * If not provided, scene-aware defaults will be computed based on sceneSize.
         * Uses the same DTO as the standalone arc rotate camera creation.
         * @optional true
         */
        arcRotateCameraOptions?: BabylonCamera.ArcRotateCameraDto;
    }
}
