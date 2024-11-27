
import * as BABYLON from "@babylonjs/core";
import { Inputs } from ".";
import { ContextBase } from "@bitbybit-dev/core";

export class Context extends ContextBase {

    scene: BABYLON.Scene;
    engine: BABYLON.Engine | BABYLON.WebGPUEngine;
    havokPlugin: BABYLON.HavokPlugin;
   
    getSamplingMode(samplingMode: Inputs.BabylonTexture.samplingModeEnum): number {
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
