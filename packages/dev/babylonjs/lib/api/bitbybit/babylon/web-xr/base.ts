import * as BABYLON from "@babylonjs/core";
import { Context } from "../../../context";
import * as Inputs from "../../../inputs/inputs";

export class BabylonWebXRBase {

    constructor(
        private readonly context: Context,
    ) {
    }

    /**
     * Creates default XR experience
     * @param inputs Options for basic configuration
     * @group scene
     * @shortname default xr experience async
     * @disposableOutput true
     */
    async createDefaultXRExperienceAsync(inputs: Inputs.BabylonWebXR.WebXRDefaultExperienceOptions): Promise<BABYLON.WebXRDefaultExperience> {
        return this.context.scene.createDefaultXRExperienceAsync(inputs);
    }

    /**
     * Creates default XR experience
     * @param inputs Options for basic configuration
     * @group scene
     * @shortname default xr experience no opt. async
     * @disposableOutput true
     */
    async createDefaultXRExperienceNoOptionsAsync(): Promise<BABYLON.WebXRDefaultExperience> {
        return this.context.scene.createDefaultXRExperienceAsync();
    }

    /**
     * Returns the base experience of the default XR experience
     * @param inputs Inputs with the default XR experience
     * @group get
     * @shortname get base experience
     */
    getBaseExperience(inputs: Inputs.BabylonWebXR.WebXRDefaultExperienceDto): BABYLON.WebXRExperienceHelper {
        return inputs.webXRDefaultExperience.baseExperience;
    }

    /**
     * Returns the feature manager of the default XR experience
     * @param inputs Inputs with the default XR experience
     * @group get
     * @shortname get feature manager
     */
    getFeatureManager(inputs: Inputs.BabylonWebXR.WebXRExperienceHelperDto): BABYLON.WebXRFeaturesManager {
        return inputs.baseExperience.featuresManager;
    }

}
