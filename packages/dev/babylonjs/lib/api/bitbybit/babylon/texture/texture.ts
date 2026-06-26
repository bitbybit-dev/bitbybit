
import { Context } from "../../../context";
import * as BABYLON from "@babylonjs/core";
import * as Inputs from "../../../inputs";

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
        const texture = new BABYLON.Texture(inputs.url, this.context.scene, undefined, inputs.invertY, this.context.getSamplingMode(inputs.samplingMode));
        texture.uScale = inputs.uScale;
        texture.vScale = inputs.vScale;
        texture.wAng = inputs.wAng;
        texture.invertZ = inputs.invertZ;
        texture.uOffset = inputs.uOffset;
        texture.vOffset = inputs.vOffset;
        return texture;
    }

    /**
     * Creates an image texture intended for decals and projections. Wrap modes are clamped so the image is not tiled,
     * and the alpha channel is respected by default. Feed the result into decal creation or decal map projection.
     * @param inputs required to set up the image texture
     * @returns Babylon texture that can be projected onto meshes
     * @group create
     * @shortname image texture
     * @disposableOutput true
     */
    createImage(inputs: Inputs.BabylonTexture.TextureImageDto): BABYLON.Texture {
        const texture = new BABYLON.Texture(inputs.url, this.context.scene, undefined, inputs.invertY, this.context.getSamplingMode(inputs.samplingMode));
        texture.name = inputs.name;
        texture.hasAlpha = inputs.hasAlpha;
        texture.wrapU = BABYLON.Texture.CLAMP_ADDRESSMODE;
        texture.wrapV = BABYLON.Texture.CLAMP_ADDRESSMODE;
        return texture;
    }

}
