
import { Context } from "../../../context";
import * as BABYLON from "@babylonjs/core";
import * as Inputs from "../../../inputs/inputs";

export class BabylonTexture {

    constructor(private readonly context: Context) {
    }

    /**
     * Creates texture from URL from a few basic options. If you loaded the asset via the file, create object url and pass it here.
     * @param inputs required to set up basic texture
     * @returns Babylon texture that can be used with materials
     * @group create
     * @shortname simple texture
     * @disposableOutput true
     */
    createSimple(inputs: Inputs.BabylonTexture.TextureSimpleDto): BABYLON.Texture {
        const texture = new BABYLON.Texture(inputs.url, this.context.scene, undefined, inputs.invertY, this.getSamplingMode(inputs.samplingMode));
        texture.uScale = inputs.uScale;
        texture.vScale = inputs.vScale;
        texture.wAng = inputs.wAng;
        texture.invertZ = inputs.invertZ;
        texture.uOffset = inputs.uOffset;
        texture.vOffset = inputs.vOffset;
        return texture;
    }
    
    private getSamplingMode(samplingMode: Inputs.BabylonTexture.samplingModeEnum): number {
        switch (samplingMode) {
            case Inputs.BabylonTexture.samplingModeEnum.nearest:
                return BABYLON.Texture.NEAREST_SAMPLINGMODE;
            case Inputs.BabylonTexture.samplingModeEnum.bilinear:
                return BABYLON.Texture.BILINEAR_SAMPLINGMODE;
            case Inputs.BabylonTexture.samplingModeEnum.trilinear:
                return BABYLON.Texture.TRILINEAR_SAMPLINGMODE;
            default:
                return BABYLON.Texture.NEAREST_SAMPLINGMODE;
        }
    }
}
