
import { Context } from "../../../context";
import * as BABYLON from "../../../../gui-enriched-babylon";
import * as Inputs from "../../../inputs";

export class BabylonGuiAdvancedDynamicTexture {

    constructor(private readonly context: Context) { }

    /**
     * Creates full screen UI
     * @param inputs with name of advanced texture, foreground, sampling and adaptive scaling
     * @returns advanced dynamic texture
     * @group spaces
     * @shortname create full screen ui
     * @disposableOutput true
     */
    createFullScreenUI(inputs: Inputs.BabylonGui.CreateFullScreenUIDto): BABYLON.GUI.AdvancedDynamicTexture {
        const sampling = BABYLON.Texture.BILINEAR_SAMPLINGMODE;
        const texture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI(inputs.name, inputs.foreground, this.context.scene, sampling, inputs.adaptiveScaling);
        return texture;
    }

    /**
     * Creates advanced dynamic texture for a mesh
     * @param inputs with mesh, width, height, support pointer move, only alpha testing, invert y and sampling
     * @returns advanced dynamic texture
     * @group spaces
     * @shortname create for mesh
     * @disposableOutput true
     */
    createForMesh(inputs: Inputs.BabylonGui.CreateForMeshDto): BABYLON.GUI.AdvancedDynamicTexture {
        const sampling = this.context.getSamplingMode(inputs.sampling);
        const texture = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(inputs.mesh, inputs.width, inputs.height, inputs.supportPointerMove, inputs.onlyAlphaTesting, inputs.invertY, undefined, sampling);
        return texture;
    }


}
