
import { Context } from "../../../context";
import * as BABYLON from "../../../../gui-enriched-babylon";
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
    createFullScreenUI(inputs: Inputs.BabylonGui.CreateFullScreenUIDto): BABYLON.GUI.AdvancedDynamicTexture {
        const sampling = BABYLON.Texture.BILINEAR_SAMPLINGMODE;
        const texture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI(inputs.name, inputs.foreground, this.context.scene, sampling, inputs.adaptiveScaling);
        return texture;
    }

}
