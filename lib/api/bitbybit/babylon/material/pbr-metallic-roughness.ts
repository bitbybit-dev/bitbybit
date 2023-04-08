
import { Context } from '../../../context';
import {
    Color3,
    Matrix, PBRMetallicRoughnessMaterial, Ray, Vector3
} from '@babylonjs/core';
import * as Inputs from '../../../inputs/inputs';
import { Color } from '../../color';
import { BitByBitBlocklyHelperService } from "../../../../bit-by-bit-blockly-helper.service";

export class BabylonMaterialPbrMetallicRoughness {

    constructor(private readonly context: Context, private readonly color: Color) { }

    /**
     * Create PBR metallic roughnes material.
     * @param inputs required to set up metallic roughness material
     * @returns PBR metallic roughness material
     * @group create
     * @shortname material
     * @disposableOutput true
     */
    create(inputs: Inputs.BabylonMaterial.PBRMetallicRoughnessDto): PBRMetallicRoughnessMaterial {
        const mat = new PBRMetallicRoughnessMaterial(inputs.name, this.context.scene);
        mat.baseColor = Color3.FromHexString(inputs.baseColor);
        mat.metallic = inputs.metallic;
        mat.roughness = inputs.roughness;
        mat.alpha = inputs.alpha;
        mat.backFaceCulling = inputs.backFaceCulling;
        mat.zOffset = inputs.zOffset;
        mat.alphaMode = 1;
        return mat;
    }

    /**
     * Sets the base color of material
     * @param inputs base color and material
     * @group set
     * @shortname base color
     */
    setBaseColor(inputs: Inputs.BabylonMaterial.BaseColorDto): void {
        const mat = inputs.material;
        mat.baseColor = Color3.FromHexString(inputs.baseColor);
    }
    /**
     * Sets the metallic property of material
     * @param inputs metallic value
     * @group set
     * @shortname metallic
     */
    setMetallic(inputs: Inputs.BabylonMaterial.MetallicDto): void {
        const mat = inputs.material;
        mat.metallic = inputs.metallic;
    }
    /**
     * Sets the roughness of material
     * @param inputs roughness value
     * @group set
     * @shortname roughness
     */
    setRoughness(inputs: Inputs.BabylonMaterial.RoughnessDto): void {
        const mat = inputs.material;
        mat.roughness = inputs.roughness;
    }
    /**
     * Sets the alpha of material
     * @param inputs alpha value
     * @group set
     * @shortname alpha
     */
    setAlpha(inputs: Inputs.BabylonMaterial.AlphaDto): void {
        const mat = inputs.material;
        mat.alpha = inputs.alpha;
    }
    /**
     * Sets the back face culling of material
     * @param inputs back face culling boolean
     * @group set
     * @shortname back face culling
     */
    setBackFaceCulling(inputs: Inputs.BabylonMaterial.BackFaceCullingDto): void {
        const mat = inputs.material;
        mat.backFaceCulling = inputs.backFaceCulling;
    }

    /**
     * Gets the base color of material
     * @param inputs base color and material
     * @return base color
     * @group get
     * @shortname base color
     */
    getBaseColor(inputs: Inputs.BabylonMaterial.MaterialPropDto): string {
        const mat = inputs.material;
        const r = BitByBitBlocklyHelperService.remap(mat.baseColor.r, 0, 1, 0, 255);
        const g = BitByBitBlocklyHelperService.remap(mat.baseColor.g, 0, 1, 0, 255);
        const b = BitByBitBlocklyHelperService.remap(mat.baseColor.b, 0, 1, 0, 255);

        return this.color.rgbToHex({ r, g, b });
    }

    /**
     * Gets the metallic property of material
     * @param inputs metallic value
     * @return metallic value
     * @group get
     * @shortname metallic
     */
    getMetallic(inputs: Inputs.BabylonMaterial.MaterialPropDto): number {
        return inputs.material.metallic;
    }

    /**
     * Gets the roughness of material
     * @param inputs roughness value
     * @return roughness value
     * @group get
     * @shortname roughness
     */
    getRoughness(inputs: Inputs.BabylonMaterial.MaterialPropDto): number {
        return inputs.material.roughness;
    }

    /**
     * Gets the alpha of material
     * @param inputs alpha value
     * @return alpha value
     * @group get
     * @shortname alpha
     */
    getAlpha(inputs: Inputs.BabylonMaterial.MaterialPropDto): number {
        return inputs.material.alpha;
    }

    /**
     * Gets the back face culling of material
     * @param inputs back face culling boolean
     * @return backfaceculling boolean
     * @group get
     * @shortname back face culling
     */
    getBackFaceCulling(inputs: Inputs.BabylonMaterial.MaterialPropDto): boolean {
        return inputs.material.backFaceCulling
    }
}
