/* eslint-disable @typescript-eslint/no-namespace */
import * as BABYLON from "@babylonjs/core";
import { Base } from "./base-inputs";
import { SkyMaterial } from "@babylonjs/materials";

// tslint:disable-next-line: no-namespace
export namespace BabylonMaterial {
    export class PBRMetallicRoughnessDto {
        constructor(name?: string, baseColor?: Base.Color, emissiveColor?: Base.Color, metallic?: number, roughness?: number, alpha?: number, backFaceCulling?: boolean, zOffset?: number) {
            if (name !== undefined) { this.name = name; }
            if (baseColor !== undefined) { this.baseColor = baseColor; }
            if (emissiveColor !== undefined) { this.emissiveColor = emissiveColor; }
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
         * Emissive color of the material
         * @default #000000
         */
        emissiveColor?: Base.Color = "#000000";
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
    export class SkyMaterialPropDto {
        constructor(skyMaterial?: SkyMaterial) {
            if (skyMaterial !== undefined) { this.skyMaterial = skyMaterial; }
        }
        /**
         * Material to investigate
         * @default undefined
         */
        skyMaterial: SkyMaterial;
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

    export class SkyMaterialDto {
        constructor(luminance?: number, turbidity?: number, rayleigh?: number, mieCoefficient?: number, mieDirectionalG?: number, distance?: number, inclination?: number, azimuth?: number, sunPosition?: Base.Vector3, useSunPosition?: boolean, cameraOffset?: Base.Vector3, up?: Base.Vector3, dithering?: boolean) {
            if (luminance !== undefined) { this.luminance = luminance; }
            if (turbidity !== undefined) { this.turbidity = turbidity; }
            if (rayleigh !== undefined) { this.rayleigh = rayleigh; }
            if (mieCoefficient !== undefined) { this.mieCoefficient = mieCoefficient; }
            if (mieDirectionalG !== undefined) { this.mieDirectionalG = mieDirectionalG; }
            if (distance !== undefined) { this.distance = distance; }
            if (inclination !== undefined) { this.inclination = inclination; }
            if (azimuth !== undefined) { this.azimuth = azimuth; }
            if (sunPosition !== undefined) { this.sunPosition = sunPosition; }
            if (useSunPosition !== undefined) { this.useSunPosition = useSunPosition; }
            if (cameraOffset !== undefined) { this.cameraOffset = cameraOffset; }
            if (up !== undefined) { this.up = up; }
            if (dithering !== undefined) { this.dithering = dithering; }
        }

        /**
         * Defines the overall luminance of sky in interval ]0, 1[.
         * @default 1
         * @minimum 0
         * @maximum 1
         * @step 0.01
         * 
         */
        luminance = 1;
        /**
         * Defines the amount (scattering) of haze as opposed to molecules in atmosphere.         
         * @default 10
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        turbidity = 10;
        /**
         * Defines the sky appearance (light intensity).
         * @default 2
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        rayleigh = 2;
        /**
         * Defines the mieCoefficient in interval [0, 0.1] which affects the property .mieDirectionalG.
         * @default 0.005
         * @minimum 0
         * @maximum Infinity
         * @step 0.001
         */
        mieCoefficient = 0.005;
        /**
         * Defines the amount of haze particles following the Mie scattering theory.
         * @default 0.8
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        mieDirectionalG = 0.8;
        /**
         * Defines the distance of the sun according to the active scene camera.
         * @default 500
         * @minimum 0
         * @maximum Infinity
         * @step 10
         */
        distance = 500;
        /**
         * Defines the sun inclination, in interval [-0.5, 0.5]. When the inclination is not 0, the sun is said
         * "inclined".
         * @default 0.49
         * @minimum -0.5
         * @maximum 0.5
         * @step 0.01
         */
        inclination = 0.49;
        /**
         * Defines the solar azimuth in interval [0, 1]. The azimuth is the angle in the horizontal plan between
         * an object direction and a reference direction.
         * @default 0.25
         * @minimum 0
         * @maximum 1
         * @step 0.01
         */
        azimuth = 0.25;
        /**
         * Defines the sun position in the sky on (x,y,z). If the property .useSunPosition is set to false, then
         * the property is overridden by the inclination and the azimuth and can be read at any moment.
         * @default undefined
         * @optional true
         */
        sunPosition: Base.Vector3;
        /**
         * Defines if the sun position should be computed (inclination and azimuth) according to the given
         * .sunPosition property.
         * @default false
         */
        useSunPosition = false;
        /**
         * Defines an offset vector used to get a horizon offset.
         * @example skyMaterial.cameraOffset.y = camera.globalPosition.y // Set horizon relative to 0 on the Y axis
         * @default undefined
         * @optional true
         */
        cameraOffset: Base.Vector3;
        /**
         * Defines the vector the skyMaterial should consider as up. (default is Vector3(0, 1, 0) as returned by Vector3.Up())
         * @default [0, 1, 0]
         */
        up = [0, 1, 0];
        /**
         * Defines if sky should be dithered.
         * @default false
         */
        dithering = false;
    }
    export class LuminanceDto {
        constructor(material?: SkyMaterial, luminance?: number) {
            if (material !== undefined) { this.material = material; }
            if (luminance !== undefined) { this.luminance = luminance; }
        }
        /**
         * Material to update
         * @default undefined
         */
        material: SkyMaterial;
        /**
         * Defines the overall luminance of sky in interval ]0, 1[.
         * @default 1
         * @minimum 0
         * @maximum 1
         * @step 0.01
         */
        luminance?: number;
    }
    export class TurbidityDto {
        constructor(material?: SkyMaterial, turbidity?: number) {
            if (material !== undefined) { this.material = material; }
            if (turbidity !== undefined) { this.turbidity = turbidity; }
        }
        /**
         * Material to update
         * @default undefined
         */
        material: SkyMaterial;
        /**
         * Defines the amount (scattering) of haze as opposed to molecules in atmosphere.
         * @default 10
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        turbidity?: number;
    }
    export class RayleighDto {
        constructor(material?: SkyMaterial, rayleigh?: number) {
            if (material !== undefined) { this.material = material; }
            if (rayleigh !== undefined) { this.rayleigh = rayleigh; }
        }
        /**
         * Material to update
         * @default undefined
         */
        material: SkyMaterial;
        /**
         * Defines the sky appearance (light intensity).
         * @default 2
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        rayleigh?: number;
    }
    export class MieCoefficientDto {
        constructor(material?: SkyMaterial, mieCoefficient?: number) {
            if (material !== undefined) { this.material = material; }
            if (mieCoefficient !== undefined) { this.mieCoefficient = mieCoefficient; }
        }
        /**
         * Material to update
         * @default undefined
         */
        material: SkyMaterial;
        /**
         * Defines the mieCoefficient in interval [0, 0.1] which affects the property .mieDirectionalG.
         * @default 0.005
         * @minimum 0
         * @maximum Infinity
         * @step 0.001
         */
        mieCoefficient?: number;
    }
    export class MieDirectionalGDto {
        constructor(material?: SkyMaterial, mieDirectionalG?: number) {
            if (material !== undefined) { this.material = material; }
            if (mieDirectionalG !== undefined) { this.mieDirectionalG = mieDirectionalG; }
        }
        /**
         * Material to update
         * @default undefined
         */
        material: SkyMaterial;
        /**
         * Defines the amount of haze particles following the Mie scattering theory.
         * @default 0.8
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        mieDirectionalG?: number;
    }
    export class DistanceDto {
        constructor(material?: SkyMaterial, distance?: number) {
            if (material !== undefined) { this.material = material; }
            if (distance !== undefined) { this.distance = distance; }
        }
        /**
         * Material to update
         * @default undefined
         */
        material: SkyMaterial;
        /**
         * Defines the distance of the sun according to the active scene camera.
         * @default 500
         * @minimum 0
         * @maximum Infinity
         * @step 10
         */
        distance?: number;
    }
    export class InclinationDto {
        constructor(material?: SkyMaterial, inclination?: number) {
            if (material !== undefined) { this.material = material; }
            if (inclination !== undefined) { this.inclination = inclination; }
        }
        /**
         * Material to update
         * @default undefined
         */
        material: SkyMaterial;
        /**
         * Defines the sun inclination, in interval [-0.5, 0.5]. When the inclination is not 0, the sun is said
         * "inclined".
         * @default 0.49
         * @minimum -0.5
         * @maximum 0.5
         * @step 0.01
         */
        inclination?: number;
    }
    export class AzimuthDto {
        constructor(material?: SkyMaterial, azimuth?: number) {
            if (material !== undefined) { this.material = material; }
            if (azimuth !== undefined) { this.azimuth = azimuth; }
        }
        /**
         * Material to update
         * @default undefined
         */
        material: SkyMaterial;
        /**
         * Defines the solar azimuth in interval [0, 1]. The azimuth is the angle in the horizontal plan between
         * an object direction and a reference direction.
         * @default 0.25
         * @minimum 0
         * @maximum 1
         * @step 0.01
         */
        azimuth?: number;
    }
    export class SunPositionDto {
        constructor(material?: SkyMaterial, sunPosition?: Base.Vector3) {
            if (material !== undefined) { this.material = material; }
            if (sunPosition !== undefined) { this.sunPosition = sunPosition; }
        }
        /**
         * Material to update
         * @default undefined
         */
        material: SkyMaterial;
        /**
         * Defines the sun position in the sky on (x,y,z). If the property .useSunPosition is set to false, then
         * the property is overridden by the inclination and the azimuth and can be read at any moment.
         * @default undefined
         */
        sunPosition?: Base.Vector3;
    }
    export class UseSunPositionDto {
        constructor(material?: SkyMaterial, useSunPosition?: boolean) {
            if (material !== undefined) { this.material = material; }
            if (useSunPosition !== undefined) { this.useSunPosition = useSunPosition; }
        }
        /**
         * Material to update
         * @default undefined
         */
        material: SkyMaterial;
        /**
         * Defines if the sun position should be computed (inclination and azimuth) according to the given
         * .sunPosition property.
         * @default false
         */
        useSunPosition?: boolean;
    }
    export class CameraOffsetDto {
        constructor(material?: SkyMaterial, cameraOffset?: Base.Vector3) {
            if (material !== undefined) { this.material = material; }
            if (cameraOffset !== undefined) { this.cameraOffset = cameraOffset; }
        }
        /**
         * Material to update
         * @default undefined
         */
        material: SkyMaterial;
        /**
         * Defines an offset vector used to get a horizon offset.
         * @example skyMaterial.cameraOffset.y = camera.globalPosition.y // Set horizon relative to 0 on the Y axis
         * @default undefined
         */
        cameraOffset?: Base.Vector3;
    }
    export class UpDto {
        constructor(material?: SkyMaterial, up?: Base.Vector3) {
            if (material !== undefined) { this.material = material; }
            if (up !== undefined) { this.up = up; }
        }
        /**
         * Material to update
         * @default undefined
         */
        material: SkyMaterial;
        /**
         * Defines the vector the skyMaterial should consider as up. (default is Vector3(0, 1, 0) as returned by Vector3.Up())
         * @default undefined
         */
        up?: Base.Vector3;
    }
    export class DitheringDto {
        constructor(material?: SkyMaterial, dithering?: boolean) {
            if (material !== undefined) { this.material = material; }
            if (dithering !== undefined) { this.dithering = dithering; }
        }
        /**
         * Material to update
         * @default undefined
         */
        material: SkyMaterial;
        /**
         * Defines if sky should be dithered.
         * @default false
         */
        dithering?: boolean;
    }

}
