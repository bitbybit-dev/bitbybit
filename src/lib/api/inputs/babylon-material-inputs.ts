import { Camera, FreeCamera, PBRMetallicRoughnessMaterial, TargetCamera } from '@babylonjs/core';
import { Base } from './base-inputs';

// tslint:disable-next-line: no-namespace
export namespace BabylonMaterial {
    export class PBRMetallicRoughnessDto {
        /**
         * Name of the material
         */
        name = 'Custom Material';
        /**
         * Base color of the material
         */
        baseColor: string = '#0000ff';
        /**
         * Metallic value of the material
         */
        metallic: number = 0.6;
        /**
         * Roughness value of the material
         */
        roughness: number = 0.5;
        /**
         * Defines the transparency of the material
         */
        alpha = 1;
        /**
         * Identifies if both sides of the surface should have material applied
         */
        backFaceCulling = false;
    }

    export class BaseColorDto {
        /**
         * Material to update
         */
        material: PBRMetallicRoughnessMaterial
        /**
         * Base color of the material
         */
        baseColor?: string;
    }
    export class MetallicDto {
        /**
         * Material to update
         */
        material: PBRMetallicRoughnessMaterial
        /**
         * Metallic value of the material
         */
        metallic?: number;
    }
    export class RoughnessDto {
        /**
         * Material to update
         */
        material: PBRMetallicRoughnessMaterial
        /**
         * Roughness value of the material
         */
        roughness?: number;
    }
    export class AlphaDto {
        /**
         * Material to update
         */
        material: PBRMetallicRoughnessMaterial
        /**
         * Alpha value of the material
         */
        alpha?: number;
    }
    export class BackFaceCullingDto {
        /**
         * Material to update
         */
        material: PBRMetallicRoughnessMaterial
        /**
         * back face culling
         */
         backFaceCulling?: boolean;
    }
}
