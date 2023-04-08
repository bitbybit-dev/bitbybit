import { Camera, FreeCamera, PBRMetallicRoughnessMaterial, TargetCamera } from '@babylonjs/core';
import { Base } from './base-inputs';

// tslint:disable-next-line: no-namespace
export namespace BabylonMaterial {
    export class PBRMetallicRoughnessDto {
        /**
         * Name of the material
         * @default Custom Material
         */
        name: string = 'Custom Material';
        /**
         * Base color of the material
         * @default #0000ff
         */
        baseColor: Base.Color = '#0000ff';
        /**
         * Metallic value of the material
         * @default 0.6
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        metallic: number = 0.6;
        /**
         * Roughness value of the material
         * @default 0.5
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        roughness: number = 0.5;
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
        /**
         * Material to update
         * @default undefined
         */
        material: PBRMetallicRoughnessMaterial
        /**
         * Base color of the material
         * @default #0000ff
         */
        baseColor?: Base.Color = '#0000ff';
    }
    export class MaterialPropDto {
        /**
         * Material to investigate
         * @default undefined
         */
        material: PBRMetallicRoughnessMaterial
    }
    export class MetallicDto {
        /**
         * Material to update
         * @default undefined
         */
        material: PBRMetallicRoughnessMaterial
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
        /**
         * Material to update
         * @default undefined
         */
        material: PBRMetallicRoughnessMaterial
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
        /**
         * Material to update
         * @default undefined
         */
        material: PBRMetallicRoughnessMaterial
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
        /**
         * Material to update
         * @default undefined
         */
        material: PBRMetallicRoughnessMaterial
        /**
         * back face culling
         * @default true
         */
        backFaceCulling?: boolean = true;
    }
}
