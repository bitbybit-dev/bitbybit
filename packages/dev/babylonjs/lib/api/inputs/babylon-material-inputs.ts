/* eslint-disable @typescript-eslint/no-namespace */
import * as BABYLON from "@babylonjs/core";
import { Base } from "./base-inputs";
import * as MATERIALS from "@babylonjs/materials";

// tslint:disable-next-line: no-namespace
/**
 * Parameters for materials: base color, metallic and roughness, emissive and ambient contributions,
 * alpha and blending, backface culling, and the texture slots a physically-based material accepts.
 */
export namespace BabylonMaterial {
    /**
     * Feeds `babylon.material.pbrMetallicRoughness.create`: the name, colors, metallic and
     * roughness values, opacity, culling and depth offset of a new material.
     */
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
         * Name the material is known by in the scene
         * @default Custom Material
         */
        name = "Custom Material";
        /**
         * Hex color of the surface under white light
         * @default #0000ff
         */
        baseColor: Base.Color = "#0000ff";
        /**
         * Hex color the surface glows with on its own, regardless of lighting; black glows not at
         * all
         * @default #000000
         */
        emissiveColor?: Base.Color | undefined = "#000000";
        /**
         * How metallic the surface is, from 0 for paint or plastic to 1 for bare metal
         * @default 0.6
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        metallic = 0.6;
        /**
         * How rough the surface is, from 0 for a mirror finish to 1 for fully matte
         * @default 0.5
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        roughness = 0.5;
        /**
         * Opacity from 0 for invisible to 1 for solid; values between make the surface see-through
         * @default 1
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        alpha = 1;
        /**
         * When true, the back of each face is skipped, which is faster; false shows both sides of
         * open meshes
         * @default false
         */
        backFaceCulling = false;
        /**
         * Depth offset that pulls the surface toward or away from the camera when it fights with
         * another at the same depth; 0 for none
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        zOffset = 0;
    }

    /**
     * Feeds `babylon.material.pbrMetallicRoughness.setBaseColor` with a material and its new base
     * color.
     */
    export class BaseColorDto {
        constructor(material?: BABYLON.PBRMetallicRoughnessMaterial, baseColor?: Base.Color) {
            if (material !== undefined) { this.material = material; }
            if (baseColor !== undefined) { this.baseColor = baseColor; }
        }
        /**
         * The material to change in place
         * @default undefined
         */
        material!: BABYLON.PBRMetallicRoughnessMaterial;
        /**
         * Hex color of the surface under white light
         * @default #0000ff
         */
        baseColor?: Base.Color | undefined = "#0000ff";
    }
    /**
     * Feeds the `babylon.material.pbrMetallicRoughness` getters with the one material to read from.
     */
    export class MaterialPropDto {
        constructor(material?: BABYLON.PBRMetallicRoughnessMaterial) {
            if (material !== undefined) { this.material = material; }
        }
        /**
         * The material to read from
         * @default undefined
         */
        material!: BABYLON.PBRMetallicRoughnessMaterial;
    }
    /**
     * Feeds the `babylon.material.skyMaterial` getters with the one sky material to read from.
     */
    export class SkyMaterialPropDto {
        constructor(skyMaterial?: MATERIALS.SkyMaterial) {
            if (skyMaterial !== undefined) { this.skyMaterial = skyMaterial; }
        }
        /**
         * The sky material to read from
         * @default undefined
         */
        skyMaterial!: MATERIALS.SkyMaterial;
    }
    /**
     * Feeds `babylon.material.pbrMetallicRoughness.setMetallic` with a material and its new
     * metallic value.
     */
    export class MetallicDto {
        constructor(material?: BABYLON.PBRMetallicRoughnessMaterial, metallic?: number) {
            if (material !== undefined) { this.material = material; }
            if (metallic !== undefined) { this.metallic = metallic; }
        }
        /**
         * The material to change in place
         * @default undefined
         */
        material!: BABYLON.PBRMetallicRoughnessMaterial;
        /**
         * How metallic the surface is, from 0 for paint or plastic to 1 for bare metal
         * @default 0.5
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        metallic?: number | undefined = 0.5;
    }
    /**
     * Feeds `babylon.material.pbrMetallicRoughness.setRoughness` with a material and its new
     * roughness.
     */
    export class RoughnessDto {
        constructor(material?: BABYLON.PBRMetallicRoughnessMaterial, roughness?: number) {
            if (material !== undefined) { this.material = material; }
            if (roughness !== undefined) { this.roughness = roughness; }
        }
        /**
         * The material to change in place
         * @default undefined
         */
        material!: BABYLON.PBRMetallicRoughnessMaterial;
        /**
         * How rough the surface is, from 0 for a mirror finish to 1 for fully matte
         * @default 0.5
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        roughness?: number | undefined = 0.5;
    }
    /**
     * Feeds `babylon.material.pbrMetallicRoughness.setAlpha` with a material and its new opacity.
     */
    export class AlphaDto {
        constructor(material?: BABYLON.PBRMetallicRoughnessMaterial, alpha?: number) {
            if (material !== undefined) { this.material = material; }
            if (alpha !== undefined) { this.alpha = alpha; }
        }
        /**
         * The material to change in place
         * @default undefined
         */
        material!: BABYLON.PBRMetallicRoughnessMaterial;
        /**
         * Opacity from 0 for invisible to 1 for solid
         * @default 0.5
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        alpha?: number | undefined = 0.5;
    }
    /**
     * Feeds `babylon.material.pbrMetallicRoughness.setBackFaceCulling` with a material and whether
     * back faces are skipped.
     */
    export class BackFaceCullingDto {
        constructor(material?: BABYLON.PBRMetallicRoughnessMaterial, backFaceCulling?: boolean) {
            if (material !== undefined) { this.material = material; }
            if (backFaceCulling !== undefined) { this.backFaceCulling = backFaceCulling; }
        }
        /**
         * The material to change in place
         * @default undefined
         */
        material!: BABYLON.PBRMetallicRoughnessMaterial;
        /**
         * When true, the back of each face is skipped when drawing; false shows both sides
         * @default true
         */
        backFaceCulling?: boolean | undefined = true;
    }
    /**
     * Feeds `babylon.material.pbrMetallicRoughness.setBaseTexture` with a material and the image
     * texture that replaces its base color.
     */
    export class BaseTextureDto {
        constructor(material?: BABYLON.PBRMetallicRoughnessMaterial, baseTexture?: BABYLON.Texture) {
            if (material !== undefined) { this.material = material; }
            if (baseTexture !== undefined) { this.baseTexture = baseTexture; }
        }
        /**
         * The material to change in place
         * @default undefined
         */
        material!: BABYLON.PBRMetallicRoughnessMaterial;
        /**
         * The image texture spread over the surface in place of the base color
         * @default undefined
         */
        baseTexture!: BABYLON.Texture;
    }

    /**
     * Feeds `babylon.material.skyMaterial.create`: the atmosphere settings of a procedural sky and
     * where its sun stands. Values left out keep the engine's defaults.
     */
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
         * Overall brightness of the sky, between 0 and 1
         * @default 1
         * @minimum 0
         * @maximum 1
         * @step 0.01
         */
        luminance = 1;
        /**
         * How hazy the air is; more haze whitens the sky and spreads the glow of the sun
         * @default 10
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        turbidity = 10;
        /**
         * How strongly light scatters the way that makes a clear sky blue; higher is a deeper blue
         * @default 2
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        rayleigh = 2;
        /**
         * How much haze gathers around the sun, between 0 and 0.1; more makes a wider, whiter glow
         * @default 0.005
         * @minimum 0
         * @maximum Infinity
         * @step 0.001
         */
        mieCoefficient = 0.005;
        /**
         * How tightly the haze glow gathers around the sun; near 1 gives a small bright halo, lower
         * spreads it
         * @default 0.8
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        mieDirectionalG = 0.8;
        /**
         * How far the sky dome sits from the camera, which changes how the horizon reads
         * @default 500
         * @minimum 0
         * @maximum Infinity
         * @step 10
         */
        distance = 500;
        /**
         * How high the sun stands, from -0.5 below the horizon through 0 at the horizon to 0.5
         * overhead
         * @default 0.49
         * @minimum -0.5
         * @maximum 0.5
         * @step 0.01
         */
        inclination = 0.49;
        /**
         * Where around the horizon the sun stands, from 0 to 1 for a full turn
         * @default 0.25
         * @minimum 0
         * @maximum 1
         * @step 0.01
         */
        azimuth = 0.25;
        /**
         * An explicit direction to the sun, used only while `useSunPosition` is true; otherwise it
         * is derived from the inclination and azimuth
         * @default undefined
         * @optional true
         */
        sunPosition!: Base.Vector3;
        /**
         * When true, the sun is placed from `sunPosition`; when false, from inclination and azimuth
         * @default false
         */
        useSunPosition = false;
        /**
         * An offset vector that shifts the horizon relative to the camera
         * @default undefined
         * @optional true
         */
        cameraOffset!: Base.Vector3;
        /**
         * The direction the sky treats as up; `[0, 1, 0]` for the usual Y-up scene
         * @default [0, 1, 0]
         */
        up = [0, 1, 0];
        /**
         * When true, fine noise hides color banding in the smooth gradients of the sky
         * @default false
         */
        dithering = false;
    }
    /**
     * Feeds `babylon.material.skyMaterial.setLuminance` with a sky material and its new brightness.
     */
    export class LuminanceDto {
        constructor(material?: MATERIALS.SkyMaterial, luminance?: number) {
            if (material !== undefined) { this.material = material; }
            if (luminance !== undefined) { this.luminance = luminance; }
        }
        /**
         * The sky material to change in place
         * @default undefined
         */
        material!: MATERIALS.SkyMaterial;
        /**
         * Overall brightness of the sky, between 0 and 1
         * @default 1
         * @minimum 0
         * @maximum 1
         * @step 0.01
         */
        luminance?: number | undefined = 1;
    }
    /**
     * Feeds `babylon.material.skyMaterial.setTurbidity` with a sky material and its new haziness.
     */
    export class TurbidityDto {
        constructor(material?: MATERIALS.SkyMaterial, turbidity?: number) {
            if (material !== undefined) { this.material = material; }
            if (turbidity !== undefined) { this.turbidity = turbidity; }
        }
        /**
         * The sky material to change in place
         * @default undefined
         */
        material!: MATERIALS.SkyMaterial;
        /**
         * How hazy the air is; more haze whitens the sky and spreads the glow of the sun
         * @default 10
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        turbidity?: number | undefined = 10;
    }
    /**
     * Feeds `babylon.material.skyMaterial.setRayleigh` with a sky material and its new Rayleigh
     * scattering.
     */
    export class RayleighDto {
        constructor(material?: MATERIALS.SkyMaterial, rayleigh?: number) {
            if (material !== undefined) { this.material = material; }
            if (rayleigh !== undefined) { this.rayleigh = rayleigh; }
        }
        /**
         * The sky material to change in place
         * @default undefined
         */
        material!: MATERIALS.SkyMaterial;
        /**
         * How strongly light scatters the way that makes a clear sky blue; higher is a deeper blue
         * @default 2
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        rayleigh?: number | undefined = 2;
    }
    /**
     * Feeds `babylon.material.skyMaterial.setMieCoefficient` with a sky material and how much haze
     * surrounds its sun.
     */
    export class MieCoefficientDto {
        constructor(material?: MATERIALS.SkyMaterial, mieCoefficient?: number) {
            if (material !== undefined) { this.material = material; }
            if (mieCoefficient !== undefined) { this.mieCoefficient = mieCoefficient; }
        }
        /**
         * The sky material to change in place
         * @default undefined
         */
        material!: MATERIALS.SkyMaterial;
        /**
         * How much haze gathers around the sun, between 0 and 0.1; more makes a wider, whiter glow
         * @default 0.005
         * @minimum 0
         * @maximum Infinity
         * @step 0.001
         */
        mieCoefficient?: number | undefined = 0.005;
    }
    /**
     * Feeds `babylon.material.skyMaterial.setMieDirectionalG` with a sky material and how tightly
     * its haze glow gathers around the sun.
     */
    export class MieDirectionalGDto {
        constructor(material?: MATERIALS.SkyMaterial, mieDirectionalG?: number) {
            if (material !== undefined) { this.material = material; }
            if (mieDirectionalG !== undefined) { this.mieDirectionalG = mieDirectionalG; }
        }
        /**
         * The sky material to change in place
         * @default undefined
         */
        material!: MATERIALS.SkyMaterial;
        /**
         * How tightly the haze glow gathers around the sun; near 1 gives a small bright halo, lower
         * spreads it
         * @default 0.8
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        mieDirectionalG?: number | undefined = 0.8;
    }
    /**
     * Feeds `babylon.material.skyMaterial.setDistance` with a sky material and how far its dome
     * sits from the camera.
     */
    export class DistanceDto {
        constructor(material?: MATERIALS.SkyMaterial, distance?: number) {
            if (material !== undefined) { this.material = material; }
            if (distance !== undefined) { this.distance = distance; }
        }
        /**
         * The sky material to change in place
         * @default undefined
         */
        material!: MATERIALS.SkyMaterial;
        /**
         * How far the sky dome sits from the camera, which changes how the horizon reads
         * @default 500
         * @minimum 0
         * @maximum Infinity
         * @step 10
         */
        distance?: number | undefined = 500;
    }
    /**
     * Feeds `babylon.material.skyMaterial.setInclination` with a sky material and how high its sun
     * stands.
     */
    export class InclinationDto {
        constructor(material?: MATERIALS.SkyMaterial, inclination?: number) {
            if (material !== undefined) { this.material = material; }
            if (inclination !== undefined) { this.inclination = inclination; }
        }
        /**
         * The sky material to change in place
         * @default undefined
         */
        material!: MATERIALS.SkyMaterial;
        /**
         * How high the sun stands, from -0.5 below the horizon through 0 at the horizon to 0.5
         * overhead
         * @default 0.49
         * @minimum -0.5
         * @maximum 0.5
         * @step 0.01
         */
        inclination?: number | undefined = 0.49;
    }
    /**
     * Feeds `babylon.material.skyMaterial.setAzimuth` with a sky material and where around the
     * horizon its sun stands.
     */
    export class AzimuthDto {
        constructor(material?: MATERIALS.SkyMaterial, azimuth?: number) {
            if (material !== undefined) { this.material = material; }
            if (azimuth !== undefined) { this.azimuth = azimuth; }
        }
        /**
         * The sky material to change in place
         * @default undefined
         */
        material!: MATERIALS.SkyMaterial;
        /**
         * Where around the horizon the sun stands, from 0 to 1 for a full turn
         * @default 0.25
         * @minimum 0
         * @maximum 1
         * @step 0.01
         */
        azimuth?: number | undefined = 0.25;
    }
    /**
     * Feeds `babylon.material.skyMaterial.setSunPosition` with a sky material and an explicit
     * direction to its sun.
     */
    export class SunPositionDto {
        constructor(material?: MATERIALS.SkyMaterial, sunPosition?: Base.Vector3) {
            if (material !== undefined) { this.material = material; }
            if (sunPosition !== undefined) { this.sunPosition = sunPosition; }
        }
        /**
         * The sky material to change in place
         * @default undefined
         */
        material!: MATERIALS.SkyMaterial;
        /**
         * The direction to the sun as `[x, y, z]`; used only while `useSunPosition` is true,
         * otherwise inclination and azimuth decide
         * @default undefined
         */
        sunPosition!: Base.Vector3;
    }
    /**
     * Feeds `babylon.material.skyMaterial.setUseSunPosition` with a sky material and which way its
     * sun is placed.
     */
    export class UseSunPositionDto {
        constructor(material?: MATERIALS.SkyMaterial, useSunPosition?: boolean) {
            if (material !== undefined) { this.material = material; }
            if (useSunPosition !== undefined) { this.useSunPosition = useSunPosition; }
        }
        /**
         * The sky material to change in place
         * @default undefined
         */
        material!: MATERIALS.SkyMaterial;
        /**
         * When true, the sun is placed from `sunPosition`; when false, from inclination and azimuth
         * @default false
         */
        useSunPosition?: boolean | undefined = false;
    }
    /**
     * Feeds `babylon.material.skyMaterial.setCameraOffset` with a sky material and the offset that
     * shifts its horizon.
     */
    export class CameraOffsetDto {
        constructor(material?: MATERIALS.SkyMaterial, cameraOffset?: Base.Vector3) {
            if (material !== undefined) { this.material = material; }
            if (cameraOffset !== undefined) { this.cameraOffset = cameraOffset; }
        }
        /**
         * The sky material to change in place
         * @default undefined
         */
        material!: MATERIALS.SkyMaterial;
        /**
         * An offset vector that shifts the horizon relative to the camera
         * @default undefined
         */
        cameraOffset!: Base.Vector3;
    }
    /**
     * Feeds `babylon.material.skyMaterial.setUp` with a sky material and the direction it treats as
     * up.
     */
    export class UpDto {
        constructor(material?: MATERIALS.SkyMaterial, up?: Base.Vector3) {
            if (material !== undefined) { this.material = material; }
            if (up !== undefined) { this.up = up; }
        }
        /**
         * The sky material to change in place
         * @default undefined
         */
        material!: MATERIALS.SkyMaterial;
        /**
         * The direction the sky treats as up; `[0, 1, 0]` for the usual Y-up scene
         * @default undefined
         */
        up!: Base.Vector3;
    }
    /**
     * Feeds `babylon.material.skyMaterial.setDithering` with a sky material and whether it dithers
     * its gradients.
     */
    export class DitheringDto {
        constructor(material?: MATERIALS.SkyMaterial, dithering?: boolean) {
            if (material !== undefined) { this.material = material; }
            if (dithering !== undefined) { this.dithering = dithering; }
        }
        /**
         * The sky material to change in place
         * @default undefined
         */
        material!: MATERIALS.SkyMaterial;
        /**
         * When true, fine noise hides color banding in the smooth gradients of the sky
         * @default false
         */
        dithering?: boolean | undefined = false;
    }

}
