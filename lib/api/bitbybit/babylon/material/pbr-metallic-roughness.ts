
import { Context } from "../../../context";
import * as BABYLON from "@babylonjs/core";
import * as Inputs from "../../../inputs/inputs";
import { Color } from "../../color";

export class BabylonMaterialPbrMetallicRoughness {

    constructor(private readonly context: Context, private readonly color: Color) { }

    /**
     * Create PBR metallic roughnes material.
     * @param inputs required to set up metallic roughness material
     * @returns PBR metallic roughness material
     * @group create
     * @shortname pbr material
     * @disposableOutput true
     */
    create(inputs: Inputs.BabylonMaterial.PBRMetallicRoughnessDto): BABYLON.PBRMetallicRoughnessMaterial {
        const mat = new BABYLON.PBRMetallicRoughnessMaterial(inputs.name, this.context.scene);
        mat.baseColor = BABYLON.Color3.FromHexString(inputs.baseColor);
        mat.metallic = inputs.metallic;
        mat.roughness = inputs.roughness;
        mat.alpha = inputs.alpha;
        mat.backFaceCulling = inputs.backFaceCulling;
        mat.zOffset = inputs.zOffset;
        mat.alphaMode = 1;
        if(inputs.emissiveColor){
            mat.emissiveColor = BABYLON.Color3.FromHexString(inputs.emissiveColor);
        }
        return mat;
    }

    /**
     * Sets the base color of material
     * @param inputs base color and material
     * @group set
     * @shortname set base color
     */
    setBaseColor(inputs: Inputs.BabylonMaterial.BaseColorDto): void {
        const mat = inputs.material;
        mat.baseColor = BABYLON.Color3.FromHexString(inputs.baseColor);
    }
    /**
     * Sets the metallic property of material
     * @param inputs metallic value
     * @group set
     * @shortname set metallic
     */
    setMetallic(inputs: Inputs.BabylonMaterial.MetallicDto): void {
        const mat = inputs.material;
        mat.metallic = inputs.metallic;
    }
    /**
     * Sets the roughness of material
     * @param inputs roughness value
     * @group set
     * @shortname set roughness
     */
    setRoughness(inputs: Inputs.BabylonMaterial.RoughnessDto): void {
        const mat = inputs.material;
        mat.roughness = inputs.roughness;
    }
    /**
     * Sets the alpha of material
     * @param inputs alpha value
     * @group set
     * @shortname set alpha
     */
    setAlpha(inputs: Inputs.BabylonMaterial.AlphaDto): void {
        const mat = inputs.material;
        mat.alpha = inputs.alpha;
    }
    /**
     * Sets the back face culling of material
     * @param inputs back face culling boolean
     * @group set
     * @shortname set back face culling
     */
    setBackFaceCulling(inputs: Inputs.BabylonMaterial.BackFaceCullingDto): void {
        const mat = inputs.material;
        mat.backFaceCulling = inputs.backFaceCulling;
    }

    /**
     * Sets the texture of material
     * @param inputs texture and material
     * @group set
     * @shortname set base texture
     */
    setBaseTexture(inputs: Inputs.BabylonMaterial.BaseTextureDto): void {
        const mat = inputs.material;
        mat.baseTexture = inputs.baseTexture;
    }

    /**
     * Gets the base color of material
     * @param inputs material
     * @return base color
     * @group get
     * @shortname get base color
     */
    getBaseColor(inputs: Inputs.BabylonMaterial.MaterialPropDto): string {
        const mat = inputs.material;
        const r = this.context.remap(mat.baseColor.r, 0, 1, 0, 255);
        const g = this.context.remap(mat.baseColor.g, 0, 1, 0, 255);
        const b = this.context.remap(mat.baseColor.b, 0, 1, 0, 255);

        return this.color.rgbToHex({ r, g, b, min: 0, max: 255 });
    }

    /**
     * Gets the metallic property of material
     * @param inputs material
     * @return metallic value
     * @group get
     * @shortname get metallic
     */
    getMetallic(inputs: Inputs.BabylonMaterial.MaterialPropDto): number {
        return inputs.material.metallic;
    }

    /**
     * Gets the roughness of material
     * @param inputs material
     * @return roughness value
     * @group get
     * @shortname get roughness
     */
    getRoughness(inputs: Inputs.BabylonMaterial.MaterialPropDto): number {
        return inputs.material.roughness;
    }

    /**
     * Gets the alpha of material
     * @param inputs material
     * @return alpha value
     * @group get
     * @shortname get alpha
     */
    getAlpha(inputs: Inputs.BabylonMaterial.MaterialPropDto): number {
        return inputs.material.alpha;
    }

    /**
     * Gets the back face culling of material
     * @param inputs material
     * @return backfaceculling boolean
     * @group get
     * @shortname get back face culling
     */
    getBackFaceCulling(inputs: Inputs.BabylonMaterial.MaterialPropDto): boolean {
        return inputs.material.backFaceCulling;
    }

    /**
     * Get the base texture of material
     * @param inputs material
     * @group get
     * @shortname get base texture
     */
    getBaseTexture(inputs: Inputs.BabylonMaterial.MaterialPropDto): BABYLON.BaseTexture {
        return inputs.material.baseTexture;
    }
}
