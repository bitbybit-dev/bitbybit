import * as BABYLON from "@babylonjs/core";
import { Context } from "../../../context";
import * as Inputs from "../../../inputs";

/**
 * The building blocks the `webXr.simple` entry points are made of, for applications that hold the
 * class directly: creating the default XR experience from the full set of options, or with none,
 * and reading its base experience and feature manager to add features such as hand tracking or hit
 * testing yourself.
 */
export class BabylonWebXRBase {

    constructor(
        private readonly context: Context,
    ) {
    }

    /**
     * Starts the default WebXR experience with the given options, which choose the session features
     * to enable, the floor meshes for teleporting and the per-feature settings.
     * @param inputs - The XR experience options
     * @returns The default XR experience
     * @group scene
     * @shortname default xr experience async
     * @disposableOutput true
     */
    async createDefaultXRExperienceAsync(inputs: Inputs.BabylonWebXR.WebXRDefaultExperienceOptions): Promise<BABYLON.WebXRDefaultExperience> {
        const options: BABYLON.WebXRDefaultExperienceOptions = {};
        if (inputs.disableDefaultUI !== undefined) {
            options.disableDefaultUI = inputs.disableDefaultUI;
        }
        return this.context.scene.createDefaultXRExperienceAsync(options);
    }

    /**
     * Starts the default WebXR experience with the engine's defaults: the enter-XR button, pointer
     * selection and teleportation with no floor meshes.
     * @returns The default XR experience
     * @group scene
     * @shortname default xr experience no opt. async
     * @disposableOutput true
     */
    async createDefaultXRExperienceNoOptionsAsync(): Promise<BABYLON.WebXRDefaultExperience> {
        return this.context.scene.createDefaultXRExperienceAsync();
    }

    /**
     * Reads the base experience helper of a default XR experience, which manages the session itself
     * and is what the feature manager hangs off.
     * @param inputs - The default XR experience
     * @returns The base experience helper
     * @group get
     * @shortname get base experience
     */
    getBaseExperience(inputs: Inputs.BabylonWebXR.WebXRDefaultExperienceDto): BABYLON.WebXRExperienceHelper {
        return inputs.webXRDefaultExperience.baseExperience;
    }

    /**
     * Reads the feature manager of a base experience, through which XR features such as hand
     * tracking, hit testing or anchors are enabled and configured.
     * @param inputs - The base experience helper
     * @returns The feature manager
     * @group get
     * @shortname get feature manager
     */
    getFeatureManager(inputs: Inputs.BabylonWebXR.WebXRExperienceHelperDto): BABYLON.WebXRFeaturesManager {
        return inputs.baseExperience.featuresManager;
    }

}
