import * as BABYLON from "@babylonjs/core";

/* eslint-disable @typescript-eslint/no-namespace */
export namespace BabylonWebXR {

    export class WebXRDefaultExperienceOptions {
        constructor(disableDefaultUI?: boolean) {
            if (disableDefaultUI !== undefined) { this.disableDefaultUI = disableDefaultUI; }
        }
        /**
         * Enable or disable default UI to enter XR
         * @optional true
         */
        disableDefaultUI?: boolean;
        /**
         * Should pointer selection not initialize.
         * Note that disabling pointer selection also disables teleportation.
         * Defaults to false.
         * @optional true
         */
        disablePointerSelection?: boolean;
        /**
         * Should teleportation not initialize. Defaults to false.
         * @optional true
         */
        disableTeleportation?: boolean;
        /**
         * Should nearInteraction not initialize. Defaults to false.
         * @optional true
         */
        disableNearInteraction?: boolean;
        /**
         * Should hand tracking be disabled. Defaults to false.
         * @optional true
         */
        disableHandTracking?: boolean;
        /**
         * Floor meshes that will be used for teleport
         * @optional true
         */
        floorMeshes?: BABYLON.AbstractMesh[];
        /**
         * If set to true, the first frame will not be used to reset position
         * The first frame is mainly used when copying transformation from the old camera
         * Mainly used in AR
         * @optional true
         */
        ignoreNativeCameraTransformation?: boolean;
        /**
         * Optional configuration for the XR input object
         * @optional true
         */
        inputOptions?: Partial<BABYLON.IWebXRInputOptions>;
        /**
         * optional configuration for pointer selection
         * @optional true
         */
        pointerSelectionOptions?: Partial<BABYLON.IWebXRControllerPointerSelectionOptions>;
        /**
         * optional configuration for near interaction
         * @optional true
         */
        nearInteractionOptions?: Partial<BABYLON.IWebXRNearInteractionOptions>;
        /**
         * optional configuration for hand tracking
         * @optional true
         */
        handSupportOptions?: Partial<BABYLON.IWebXRHandTrackingOptions>;
        /**
         * optional configuration for teleportation
         * @optional true
         */
        teleportationOptions?: Partial<BABYLON.IWebXRTeleportationOptions>;
        /**
         * optional configuration for the output canvas
         * @optional true
         */
        outputCanvasOptions?: BABYLON.WebXRManagedOutputCanvasOptions;
        /**
         * optional UI options. This can be used among other to change session mode and reference space type
         * @optional true
         */
        uiOptions?: Partial<BABYLON.WebXREnterExitUIOptions>;
        /**
         * When loading teleportation and pointer select, use stable versions instead of latest.
         * @optional true
         */
        useStablePlugins?: boolean;
        /**
         * An optional rendering group id that will be set globally for teleportation, pointer selection and default controller meshes
         * @optional true
         */
        renderingGroupId?: number;
        /**
         * A list of optional features to init the session with
         * If set to true, all features we support will be added
         * @optional true
         */
        optionalFeatures?: boolean | string[];
    }

    export class DefaultWebXRWithTeleportationDto {
        constructor(groundMeshes?: BABYLON.Mesh[]) {
            if (groundMeshes !== undefined) { this.groundMeshes = groundMeshes; }
        }
        /**
         * Create XR experience with ground meshes
         */
        groundMeshes: BABYLON.Mesh[];
    }
    export class WebXRDefaultExperienceDto {
        constructor(webXRDefaultExperience?: BABYLON.WebXRDefaultExperience) {
            if (webXRDefaultExperience !== undefined) { this.webXRDefaultExperience = webXRDefaultExperience; }
        }
        /**
         * Web XR default experience
         */
        webXRDefaultExperience: BABYLON.WebXRDefaultExperience;
    }

    export class WebXRExperienceHelperDto {
        constructor(baseExperience?: BABYLON.WebXRExperienceHelper) {
            if (baseExperience !== undefined) { this.baseExperience = baseExperience; }
        }
        /**
         * Base experience
         */
        baseExperience: BABYLON.WebXRExperienceHelper;
    }
}
