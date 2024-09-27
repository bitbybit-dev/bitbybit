
import { Context } from "../../../context";
import * as GUI from "@babylonjs/gui";
import * as BABYLON from "@babylonjs/core";

import * as Inputs from "../../../inputs/inputs";

export class BabylonGuiAdvancedDynamicTexture {

    constructor(private readonly context: Context) { }

    /**
     * Creates full screen UI
     * @param inputs with name of advanced texture, foreground, sampling and adaptive scaling
     * @group spaces
     * @shortname create full screen ui
     * @disposableOutput true
     */
    createFullScreenUI(inputs: Inputs.BabylonGui.CreateFullScreenUIDto): GUI.AdvancedDynamicTexture {
        const sampling = BABYLON.Texture.BILINEAR_SAMPLINGMODE;
        const texture = GUI.AdvancedDynamicTexture.CreateFullscreenUI(inputs.name, inputs.foreground, this.context.scene, sampling, inputs.adaptiveScaling);
        return texture;
    }

}
