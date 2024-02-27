/* eslint-disable @typescript-eslint/no-namespace */
import * as BABYLON from "@babylonjs/core";
import { Base } from "./base-inputs";

// tslint:disable-next-line: no-namespace
export namespace BabylonMaterial {
    export class PBRMetallicRoughnessDto {
        constructor(name?: string, baseColor?: Base.Color, metallic?: number, roughness?: number, alpha?: number, backFaceCulling?: boolean, zOffset?: number) {
            if (name !== undefined) { this.name = name; }
            if (baseColor !== undefined) { this.baseColor = baseColor; }
            if (metallic !== undefined) { this.metallic = metallic; }
            if (roughness !== undefined) { this.roughness = roughness; }
            if (alpha !== undefined) { this.alpha = alpha; }
            if (backFaceCulling !== undefined) { this.backFaceCulling = backFaceCulling; }
            if (zOffset !== undefined) { this.zOffset = zOffset; }
        }
        /**
         * Name of the material
         * @default Custom Material
         */
        name = "Custom Material";
        /**
         * Base color of the material
         * @default #0000ff
         */
        baseColor: Base.Color = "#0000ff";
        /**
         * Metallic value of the material
         * @default 0.6
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        metallic = 0.6;
        /**
         * Roughness value of the material
         * @default 0.5
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        roughness = 0.5;
        /**
         * Defines the transparency of the material
         * @default 1
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        alpha = 1;
        /**
         * Identifies if both sides of the surface should have material applied
         * @default false
         */
        backFaceCulling = false;
        /**
         * Defines the z offset of the material
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        zOffset = 0;
    }

    export class BaseColorDto {
        constructor(material?: BABYLON.PBRMetallicRoughnessMaterial, baseColor?: Base.Color) {
            if (material !== undefined) { this.material = material; }
            if (baseColor !== undefined) { this.baseColor = baseColor; }
        }
        /**
         * Material to update
         * @default undefined
         */
        material: BABYLON.PBRMetallicRoughnessMaterial;
        /**
         * Base color of the material
         * @default #0000ff
         */
        baseColor?: Base.Color = "#0000ff";
    }
    export class MaterialPropDto {
        constructor(material?: BABYLON.PBRMetallicRoughnessMaterial) {
            if (material !== undefined) { this.material = material; }
        }
        /**
         * Material to investigate
         * @default undefined
         */
        material: BABYLON.PBRMetallicRoughnessMaterial;
    }
    export class MetallicDto {
        constructor(material?: BABYLON.PBRMetallicRoughnessMaterial, metallic?: number) {
            if (material !== undefined) { this.material = material; }
            if (metallic !== undefined) { this.metallic = metallic; }
        }
        /**
         * Material to update
         * @default undefined
         */
        material: BABYLON.PBRMetallicRoughnessMaterial;
        /**
         * Metallic value of the material
         * @default 0.5
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        metallic?: number;
    }
    export class RoughnessDto {
        constructor(material?: BABYLON.PBRMetallicRoughnessMaterial, roughness?: number) {
            if (material !== undefined) { this.material = material; }
            if (roughness !== undefined) { this.roughness = roughness; }
        }
        /**
         * Material to update
         * @default undefined
         */
        material: BABYLON.PBRMetallicRoughnessMaterial;
        /**
         * Roughness value of the material
         * @default 0.5
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        roughness?: number;
    }
    export class AlphaDto {
        constructor(material?: BABYLON.PBRMetallicRoughnessMaterial, alpha?: number) {
            if (material !== undefined) { this.material = material; }
            if (alpha !== undefined) { this.alpha = alpha; }
        }
        /**
         * Material to update
         * @default undefined
         */
        material: BABYLON.PBRMetallicRoughnessMaterial;
        /**
         * Alpha value of the material
         * @default 0.5
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        alpha?: number;
    }
    export class BackFaceCullingDto {
        constructor(material?: BABYLON.PBRMetallicRoughnessMaterial, backFaceCulling?: boolean) {
            if (material !== undefined) { this.material = material; }
            if (backFaceCulling !== undefined) { this.backFaceCulling = backFaceCulling; }
        }
        /**
         * Material to update
         * @default undefined
         */
        material: BABYLON.PBRMetallicRoughnessMaterial;
        /**
         * back face culling
         * @default true
         */
        backFaceCulling? = true;
    }
    export class BaseTextureDto {
        constructor(material?: BABYLON.PBRMetallicRoughnessMaterial, baseTexture?: BABYLON.Texture) {
            if (material !== undefined) { this.material = material; }
            if (baseTexture !== undefined) { this.baseTexture = baseTexture; }
        }
        /**
         * Material to update
         * @default undefined
         */
        material: BABYLON.PBRMetallicRoughnessMaterial;
        /**
         * Base texture of the material
         * @default undefined
         */
        baseTexture: BABYLON.Texture;
    }
}
