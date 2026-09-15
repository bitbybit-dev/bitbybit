import * as BABYLON from "@babylonjs/core";

/* eslint-disable @typescript-eslint/no-namespace */
/**
 * Parameters for WebXR: entering virtual or augmented reality, the reference space to use, and the
 * options for controllers, teleportation and hit testing.
 */
export namespace BabylonWebXR {

    /**
     * Feeds `babylon.webXr.base.createDefaultXRExperienceAsync` with the engine's options for a
     * WebXR session: which features to start, the floor meshes for teleporting, and per-feature
     * settings.
     */
    export class WebXRDefaultExperienceOptions {
        constructor(disableDefaultUI?: boolean) {
            if (disableDefaultUI !== undefined) { this.disableDefaultUI = disableDefaultUI; }
        }
        /**
         * Enable or disable default UI to enter XR
         * @optional true
         */
        disableDefaultUI?: boolean | undefined;
        /**
         * Should pointer selection not initialize.
         * Note that disabling pointer selection also disables teleportation.
         * Defaults to false.
         * @optional true
         */
        disablePointerSelection?: boolean | undefined;
        /**
         * Should teleportation not initialize. Defaults to false.
         * @optional true
         */
        disableTeleportation?: boolean | undefined;
        /**
         * Should nearInteraction not initialize. Defaults to false.
         * @optional true
         */
        disableNearInteraction?: boolean | undefined;
        /**
         * Should hand tracking be disabled. Defaults to false.
         * @optional true
         */
        disableHandTracking?: boolean | undefined;
        /**
         * Floor meshes that will be used for teleport
         * @optional true
         */
        floorMeshes?: BABYLON.AbstractMesh[] | undefined;
        /**
         * When true, the first frame does not reset the position from the previous camera; mainly
         * for AR
         * @optional true
         */
        ignoreNativeCameraTransformation?: boolean | undefined;
        /**
         * Optional configuration for the XR input object
         * @optional true
         */
        inputOptions?: Partial<BABYLON.IWebXRInputOptions> | undefined;
        /**
         * optional configuration for pointer selection
         * @optional true
         */
        pointerSelectionOptions?: Partial<BABYLON.IWebXRControllerPointerSelectionOptions> | undefined;
        /**
         * optional configuration for near interaction
         * @optional true
         */
        nearInteractionOptions?: Partial<BABYLON.IWebXRNearInteractionOptions> | undefined;
        /**
         * optional configuration for hand tracking
         * @optional true
         */
        handSupportOptions?: Partial<BABYLON.IWebXRHandTrackingOptions> | undefined;
        /**
         * optional configuration for teleportation
         * @optional true
         */
        teleportationOptions?: Partial<BABYLON.IWebXRTeleportationOptions> | undefined;
        /**
         * optional configuration for the output canvas
         * @optional true
         */
        outputCanvasOptions?: BABYLON.WebXRManagedOutputCanvasOptions | undefined;
        /**
         * optional UI options. This can be used among other to change session mode and reference space type
         * @optional true
         */
        uiOptions?: Partial<BABYLON.WebXREnterExitUIOptions> | undefined;
        /**
         * When loading teleportation and pointer select, use stable versions instead of latest.
         * @optional true
         */
        useStablePlugins?: boolean | undefined;
        /**
         * An optional rendering group id that will be set globally for teleportation, pointer selection and default controller meshes
         * @optional true
         */
        renderingGroupId?: number | undefined;
        /**
         * A list of optional features to init the session with
         * If set to true, all features we support will be added
         * @optional true
         */
        optionalFeatures?: boolean | string[] | undefined;
    }

    /**
     * Feeds the `babylon.webXr.simple` teleportation experiences with the meshes the user can
     * teleport onto.
     */
    export class DefaultWebXRWithTeleportationDto {
        constructor(groundMeshes?: BABYLON.Mesh[]) {
            if (groundMeshes !== undefined) { this.groundMeshes = groundMeshes; }
        }
        /**
         * The meshes the user may teleport onto, normally the floor
         */
        groundMeshes!: BABYLON.Mesh[];
    }
    /**
     * Feeds `babylon.webXr.base.getBaseExperience` with the default XR experience to read from.
     */
    export class WebXRDefaultExperienceDto {
        constructor(webXRDefaultExperience?: BABYLON.WebXRDefaultExperience) {
            if (webXRDefaultExperience !== undefined) { this.webXRDefaultExperience = webXRDefaultExperience; }
        }
        /**
         * The default XR experience a create method gave back
         */
        webXRDefaultExperience!: BABYLON.WebXRDefaultExperience;
    }

    /**
     * Feeds `babylon.webXr.base.getFeatureManager` with the base experience to read the feature
     * manager from.
     */
    export class WebXRExperienceHelperDto {
        constructor(baseExperience?: BABYLON.WebXRExperienceHelper) {
            if (baseExperience !== undefined) { this.baseExperience = baseExperience; }
        }
        /**
         * The base experience helper, as `getBaseExperience` reads it from the default experience
         */
        baseExperience!: BABYLON.WebXRExperienceHelper;
    }
}
