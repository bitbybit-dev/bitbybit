
import { Context } from "../../../context";
import * as BABYLON from "@babylonjs/core";
import * as Inputs from "../../../inputs";
import { Color } from "@bitbybit-dev/base";

/**
 * Physically based materials of the metallic-roughness kind, the standard way to describe a real
 * surface: a base color, how metallic it is from 0 for plastic or paint to 1 for bare metal, how
 * rough from 0 for a mirror finish to 1 for matte, an opacity and an optional texture. Create one,
 * then give it to meshes with `mesh.setMaterial` or through the drawing options.
 */
export class BabylonMaterialPbrMetallicRoughness {

    constructor(private readonly context: Context, private readonly color: Color) { }

    /**
     * Creates a metallic-roughness material with the given color, metallic and roughness values,
     * opacity, back-face culling and optional emissive color.
     *
     * Metallic 0 looks like paint or plastic and 1 like bare metal; roughness 0 is a mirror finish
     * and 1 is matte. `alpha` below 1 makes the surface see-through.
     * @param inputs - The name, colors, metallic and roughness values, opacity, culling and z offset
     * @returns The material
     * @group create
     * @shortname pbr material
     * @disposableOutput true
     * @example
     * ```typescript
     * const brushed = bitbybit.babylon.material.pbrMetallicRoughness.create({ name: "brushed", baseColor: "#c0c0c0", emissiveColor: "#000000", metallic: 1, roughness: 0.4, alpha: 1, backFaceCulling: true, zOffset: 0 });
     * bitbybit.babylon.mesh.setMaterial({ babylonMesh: mesh, material: brushed, includeChildren: true });
     * ```
     */
    create(inputs: Inputs.BabylonMaterial.PBRMetallicRoughnessDto): BABYLON.PBRMetallicRoughnessMaterial {
        const mat = new BABYLON.PBRMetallicRoughnessMaterial(inputs.name, this.context.scene);
        mat.baseColor = BABYLON.Color3.FromHexString(inputs.baseColor ?? "#0000ff");
        mat.metallic = inputs.metallic ?? 0.5;
        mat.roughness = inputs.roughness ?? 0.5;
        mat.alpha = inputs.alpha ?? 0.5;
        mat.backFaceCulling = inputs.backFaceCulling ?? true;
        mat.zOffset = inputs.zOffset;
        mat.alphaMode = 1;
        if(inputs.emissiveColor){
            mat.emissiveColor = BABYLON.Color3.FromHexString(inputs.emissiveColor);
        }
        return mat;
    }

    /**
     * Changes the base color of a material, the color its surface has under white light, from a hex
     * string.
     * @param inputs - The material and the hex color
     * @group set
     * @shortname set base color
     */
    setBaseColor(inputs: Inputs.BabylonMaterial.BaseColorDto): void {
        const mat = inputs.material;
        mat.baseColor = BABYLON.Color3.FromHexString(inputs.baseColor ?? "#0000ff");
    }
    /**
     * Changes how metallic a material looks, from 0 for paint or plastic to 1 for bare metal.
     * @param inputs - The material and the metallic value
     * @group set
     * @shortname set metallic
     */
    setMetallic(inputs: Inputs.BabylonMaterial.MetallicDto): void {
        const mat = inputs.material;
        mat.metallic = inputs.metallic ?? 0.5;
    }
    /**
     * Changes how rough a material's surface is, from 0 for a mirror finish to 1 for fully matte.
     * @param inputs - The material and the roughness value
     * @group set
     * @shortname set roughness
     */
    setRoughness(inputs: Inputs.BabylonMaterial.RoughnessDto): void {
        const mat = inputs.material;
        mat.roughness = inputs.roughness ?? 0.5;
    }
    /**
     * Changes the opacity of a material, from 0 for invisible to 1 for solid; values between make
     * the surface see-through.
     * @param inputs - The material and the opacity
     * @group set
     * @shortname set alpha
     */
    setAlpha(inputs: Inputs.BabylonMaterial.AlphaDto): void {
        const mat = inputs.material;
        mat.alpha = inputs.alpha ?? 0.5;
    }
    /**
     * Sets whether the back of each face is skipped when drawing; culling is faster, while drawing
     * both sides shows the inside of open or single-sided meshes.
     * @param inputs - The material and the culling flag
     * @group set
     * @shortname set back face culling
     */
    setBackFaceCulling(inputs: Inputs.BabylonMaterial.BackFaceCullingDto): void {
        const mat = inputs.material;
        mat.backFaceCulling = inputs.backFaceCulling ?? true;
    }

    /**
     * Gives a material an image texture that replaces its base color across the surface, as
     * `texture.createSimple` makes one.
     * @param inputs - The material and the texture
     * @group set
     * @shortname set base texture
     * @example
     * ```typescript
     * const texture = bitbybit.babylon.texture.createSimple({ name: "wood", url: "https://example.com/wood.jpg", invertY: false, invertZ: false, wAng: 0, uScale: 1, vScale: 1, uOffset: 0, vOffset: 0, samplingMode: Bit.Inputs.BabylonTexture.samplingModeEnum.trilinear });
     * bitbybit.babylon.material.pbrMetallicRoughness.setBaseTexture({ material, baseTexture: texture });
     * ```
     */
    setBaseTexture(inputs: Inputs.BabylonMaterial.BaseTextureDto): void {
        const mat = inputs.material;
        mat.baseTexture = inputs.baseTexture;
    }

    /**
     * Reads the base color of a material as a hex string.
     * @param inputs - The material
     * @returns The base color as a hex string
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
     * Reads how metallic a material is, from 0 to 1.
     * @param inputs - The material
     * @returns The metallic value
     * @group get
     * @shortname get metallic
     */
    getMetallic(inputs: Inputs.BabylonMaterial.MaterialPropDto): number {
        return inputs.material.metallic;
    }

    /**
     * Reads how rough a material's surface is, from 0 to 1.
     * @param inputs - The material
     * @returns The roughness value
     * @group get
     * @shortname get roughness
     */
    getRoughness(inputs: Inputs.BabylonMaterial.MaterialPropDto): number {
        return inputs.material.roughness;
    }

    /**
     * Reads the opacity of a material, from 0 to 1.
     * @param inputs - The material
     * @returns The opacity
     * @group get
     * @shortname get alpha
     */
    getAlpha(inputs: Inputs.BabylonMaterial.MaterialPropDto): number {
        return inputs.material.alpha;
    }

    /**
     * Reads whether a material skips the back of each face when drawing.
     * @param inputs - The material
     * @returns True when back faces are culled
     * @group get
     * @shortname get back face culling
     */
    getBackFaceCulling(inputs: Inputs.BabylonMaterial.MaterialPropDto): boolean {
        return inputs.material.backFaceCulling;
    }

    /**
     * Reads the image texture a material uses in place of its base color, if it has one.
     * @param inputs - The material
     * @returns The base texture
     * @group get
     * @shortname get base texture
     */
    getBaseTexture(inputs: Inputs.BabylonMaterial.MaterialPropDto): BABYLON.BaseTexture {
        return inputs.material.baseTexture!;
    }
}
