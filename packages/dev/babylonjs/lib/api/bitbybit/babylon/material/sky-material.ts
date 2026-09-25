
import { Context } from "../../../context";
import * as BABYLON from "@babylonjs/core";
import { SkyMaterial } from "@babylonjs/materials";
import * as Inputs from "../../../inputs";
import { resolveDto } from "@bitbybit-dev/base";
import * as Resolved from "../../../resolved-inputs";

/**
 * A procedural daytime sky computed from atmosphere settings rather than an image: where the sun
 * is, how hazy the air is and how bright the sky glows. Put the material on a large inside-out box
 * or sphere around the scene and move the sun with `inclination` and `azimuth`, or with an explicit
 * `sunPosition`.
 */
export class BabylonMaterialSky {

    constructor(private readonly context: Context) { }

    /**
     * Creates a sky material from atmosphere settings; only the values you give are applied over
     * the defaults.
     *
     * `inclination` from -0.5 to 0.5 lifts the sun from the horizon and `azimuth` from 0 to 1 turns
     * it around the sky; `turbidity` adds haze and `luminance` sets the overall brightness.
     * @param inputs - The atmosphere settings and the sun placement
     * @returns The sky material
     * @group create
     * @shortname sky material
     * @example
     * ```typescript
     * const sky = bitbybit.babylon.material.skyMaterial.create({ luminance: 1, turbidity: 10, rayleigh: 2, mieCoefficient: 0.005, mieDirectionalG: 0.8, distance: 500, inclination: 0.49, azimuth: 0.25, sunPosition: [0, 100, 100], useSunPosition: false, cameraOffset: [0, 0, 0], up: [0, 1, 0], dithering: false });
     * const dome = bitbybit.babylon.meshBuilder.createSphere({ diameter: 1000, segments: 32, sideOrientation: Bit.Inputs.BabylonMesh.sideOrientationEnum.backside, enableShadows: false });
     * bitbybit.babylon.mesh.setMaterial({ babylonMesh: dome, material: sky, includeChildren: false });
     * ```
     */
    create(inputs: Inputs.BabylonMaterial.SkyMaterialDto): SkyMaterial {
        const resolved = resolveDto(Inputs.BabylonMaterial.SkyMaterialDto, inputs) as Resolved.BabylonMaterial.SkyMaterialDto;
        const name = "bitbybit-skyMaterial";
        const mat = new SkyMaterial(name, this.context.scene);
        mat.luminance = resolved.luminance;
        mat.turbidity = resolved.turbidity;
        mat.rayleigh = resolved.rayleigh;
        mat.mieCoefficient = resolved.mieCoefficient;
        mat.mieDirectionalG = resolved.mieDirectionalG;
        mat.distance = resolved.distance;
        mat.inclination = resolved.inclination;
        mat.azimuth = resolved.azimuth;
        if (resolved.sunPosition !== undefined) {
            mat.sunPosition = new BABYLON.Vector3(resolved.sunPosition[0], resolved.sunPosition[1], resolved.sunPosition[2]);
        }
        mat.useSunPosition = resolved.useSunPosition;
        if (resolved.cameraOffset !== undefined) {
            mat.cameraOffset = new BABYLON.Vector3(resolved.cameraOffset[0], resolved.cameraOffset[1], resolved.cameraOffset[2]);
        }
        mat.up = new BABYLON.Vector3(resolved.up[0], resolved.up[1], resolved.up[2]);
        mat.dithering = resolved.dithering;

        return mat;
    }

    /**
     * Changes the overall brightness of a sky material, between 0 and 1.
     * @param inputs - The material and the luminance
     * @group set
     * @shortname set luminance
     */
    setLuminance(inputs: Inputs.BabylonMaterial.LuminanceDto): void {
        const resolved = resolveDto(Inputs.BabylonMaterial.LuminanceDto, inputs) as Resolved.BabylonMaterial.LuminanceDto;
        const mat = resolved.material;
        mat.luminance = resolved.luminance;
    }

    /**
     * Changes how hazy a sky material's air is; more haze whitens the sky and spreads the sun's
     * glow.
     * @param inputs - The material and the turbidity
     * @group set
     * @shortname set turbidity
     */
    setTurbidity(inputs: Inputs.BabylonMaterial.TurbidityDto): void {
        const resolved = resolveDto(Inputs.BabylonMaterial.TurbidityDto, inputs) as Resolved.BabylonMaterial.TurbidityDto;
        const mat = resolved.material;
        mat.turbidity = resolved.turbidity;
    }

    /**
     * Changes how strongly a sky material scatters light in the way that makes a clear sky blue;
     * higher is a deeper, brighter blue.
     * @param inputs - The material and the Rayleigh value
     * @group set
     * @shortname set rayleigh
     */
    setRayleigh(inputs: Inputs.BabylonMaterial.RayleighDto): void {
        const resolved = resolveDto(Inputs.BabylonMaterial.RayleighDto, inputs) as Resolved.BabylonMaterial.RayleighDto;
        const mat = resolved.material;
        mat.rayleigh = resolved.rayleigh;
    }

    /**
     * Changes how much haze a sky material has around the sun, between 0 and 0.1; more makes a
     * wider, whiter glow.
     * @param inputs - The material and the Mie coefficient
     * @group set
     * @shortname set mieCoefficient
     */
    setMieCoefficient(inputs: Inputs.BabylonMaterial.MieCoefficientDto): void {
        const resolved = resolveDto(Inputs.BabylonMaterial.MieCoefficientDto, inputs) as Resolved.BabylonMaterial.MieCoefficientDto;
        const mat = resolved.material;
        mat.mieCoefficient = resolved.mieCoefficient;
    }

    /**
     * Changes how tightly a sky material's haze glow gathers around the sun; values near 1 make a
     * small bright halo, lower values spread it.
     * @param inputs - The material and the Mie directional value
     * @group set
     * @shortname set mieDirectionalG
     */
    setMieDirectionalG(inputs: Inputs.BabylonMaterial.MieDirectionalGDto): void {
        const resolved = resolveDto(Inputs.BabylonMaterial.MieDirectionalGDto, inputs) as Resolved.BabylonMaterial.MieDirectionalGDto;
        const mat = resolved.material;
        mat.mieDirectionalG = resolved.mieDirectionalG;
    }

    /**
     * Changes how far the sky dome sits from the camera in a sky material, which changes how the
     * horizon reads.
     * @param inputs - The material and the distance
     * @group set
     * @shortname set distance
     */
    setDistance(inputs: Inputs.BabylonMaterial.DistanceDto): void {
        const resolved = resolveDto(Inputs.BabylonMaterial.DistanceDto, inputs) as Resolved.BabylonMaterial.DistanceDto;
        const mat = resolved.material;
        mat.distance = resolved.distance;
    }

    /**
     * Changes how high the sun stands in a sky material, from -0.5 below the horizon through 0 at
     * the horizon to 0.5 overhead; ignored while `useSunPosition` is on.
     * @param inputs - The material and the inclination
     * @group set
     * @shortname set inclination
     * @example
     * ```typescript
     * bitbybit.babylon.material.skyMaterial.setInclination({ material: sky, inclination: 0.1 });
     * ```
     */
    setInclination(inputs: Inputs.BabylonMaterial.InclinationDto): void {
        const resolved = resolveDto(Inputs.BabylonMaterial.InclinationDto, inputs) as Resolved.BabylonMaterial.InclinationDto;
        const mat = resolved.material;
        mat.inclination = resolved.inclination;
    }

    /**
     * Changes where around the horizon the sun stands in a sky material, from 0 to 1 for a full
     * turn; ignored while `useSunPosition` is on.
     * @param inputs - The material and the azimuth
     * @group set
     * @shortname set azimuth
     */
    setAzimuth(inputs: Inputs.BabylonMaterial.AzimuthDto): void {
        const resolved = resolveDto(Inputs.BabylonMaterial.AzimuthDto, inputs) as Resolved.BabylonMaterial.AzimuthDto;
        const mat = resolved.material;
        mat.azimuth = resolved.azimuth;
    }

    /**
     * Places the sun of a sky material at an explicit direction vector; it takes effect only while
     * `useSunPosition` is on, otherwise inclination and azimuth decide.
     * @param inputs - The material and the sun position vector
     * @group set
     * @shortname set sun position
     * @example
     * ```typescript
     * bitbybit.babylon.material.skyMaterial.setUseSunPosition({ material: sky, useSunPosition: true });
     * bitbybit.babylon.material.skyMaterial.setSunPosition({ material: sky, sunPosition: [0, 50, 100] });
     * ```
     */
    setSunPosition(inputs: Inputs.BabylonMaterial.SunPositionDto): void {
        const mat = inputs.material;
        mat.sunPosition = new BABYLON.Vector3(inputs.sunPosition[0], inputs.sunPosition[1], inputs.sunPosition[2]);
    }

    /**
     * Chooses whether a sky material places the sun from `sunPosition`, when true, or from
     * inclination and azimuth, when false.
     * @param inputs - The material and the flag
     * @group set
     * @shortname set use sun position
     */
    setUseSunPosition(inputs: Inputs.BabylonMaterial.UseSunPositionDto): void {
        const resolved = resolveDto(Inputs.BabylonMaterial.UseSunPositionDto, inputs) as Resolved.BabylonMaterial.UseSunPositionDto;
        const mat = resolved.material;
        mat.useSunPosition = resolved.useSunPosition;
    }

    /**
     * Shifts the horizon of a sky material by an offset vector, so the sky can sit higher or lower
     * relative to the camera.
     * @param inputs - The material and the offset vector
     * @group set
     * @shortname set camera offset
     */
    setCameraOffset(inputs: Inputs.BabylonMaterial.CameraOffsetDto): void {
        const mat = inputs.material;
        mat.cameraOffset = new BABYLON.Vector3(inputs.cameraOffset[0], inputs.cameraOffset[1], inputs.cameraOffset[2]);
    }

    /**
     * Changes which direction a sky material treats as up, normally `[0, 1, 0]`; change it for
     * scenes that use another axis as up.
     * @param inputs - The material and the up vector
     * @group set
     * @shortname set up
     */
    setUp(inputs: Inputs.BabylonMaterial.UpDto): void {
        const mat = inputs.material;
        mat.up = new BABYLON.Vector3(inputs.up[0], inputs.up[1], inputs.up[2]);
    }

    /**
     * Turns dithering on or off for a sky material; on, it adds fine noise that hides color banding
     * in smooth gradients.
     * @param inputs - The material and the flag
     * @group set
     * @shortname set dithering
     */
    setDithering(inputs: Inputs.BabylonMaterial.DitheringDto): void {
        const resolved = resolveDto(Inputs.BabylonMaterial.DitheringDto, inputs) as Resolved.BabylonMaterial.DitheringDto;
        const mat = resolved.material;
        mat.dithering = resolved.dithering;
    }

    /**
     * Reads the overall brightness of a sky material.
     * @param inputs - The material
     * @returns The luminance
     * @group get
     * @shortname get luminance
     */
    getLuminance(inputs: Inputs.BabylonMaterial.SkyMaterialPropDto): number {
        return inputs.skyMaterial.luminance;
    }

    /**
     * Reads how hazy a sky material's air is.
     * @param inputs - The material
     * @returns The turbidity
     * @group get
     * @shortname get turbidity
     */
    getTurbidity(inputs: Inputs.BabylonMaterial.SkyMaterialPropDto): number {
        return inputs.skyMaterial.turbidity;
    }

    /**
     * Reads the Rayleigh scattering strength of a sky material, the setting behind its blue.
     * @param inputs - The material
     * @returns The Rayleigh value
     * @group get
     * @shortname get rayleigh
     */
    getRayleigh(inputs: Inputs.BabylonMaterial.SkyMaterialPropDto): number {
        return inputs.skyMaterial.rayleigh;
    }

    /**
     * Reads how much haze a sky material has around the sun.
     * @param inputs - The material
     * @returns The Mie coefficient
     * @group get
     * @shortname get mieCoefficient
     */
    getMieCoefficient(inputs: Inputs.BabylonMaterial.SkyMaterialPropDto): number {
        return inputs.skyMaterial.mieCoefficient;
    }

    /**
     * Reads how tightly a sky material's haze glow gathers around the sun.
     * @param inputs - The material
     * @returns The Mie directional value
     * @group get
     * @shortname get mieDirectionalG
     */
    getMieDirectionalG(inputs: Inputs.BabylonMaterial.SkyMaterialPropDto): number {
        return inputs.skyMaterial.mieDirectionalG;
    }

    /**
     * Reads how far the sky dome sits from the camera in a sky material.
     * @param inputs - The material
     * @returns The distance
     * @group get
     * @shortname get distance
     */
    getDistance(inputs: Inputs.BabylonMaterial.SkyMaterialPropDto): number {
        return inputs.skyMaterial.distance;
    }

    /**
     * Reads how high the sun stands in a sky material, from -0.5 to 0.5.
     * @param inputs - The material
     * @returns The inclination
     * @group get
     * @shortname get inclination
     */
    getInclination(inputs: Inputs.BabylonMaterial.SkyMaterialPropDto): number {
        return inputs.skyMaterial.inclination;
    }

    /**
     * Reads where around the horizon the sun stands in a sky material, from 0 to 1.
     * @param inputs - The material
     * @returns The azimuth
     * @group get
     * @shortname get azimuth
     */
    getAzimuth(inputs: Inputs.BabylonMaterial.SkyMaterialPropDto): number {
        return inputs.skyMaterial.azimuth;
    }

    /**
     * Reads the sun direction of a sky material; when `useSunPosition` is off it reflects the
     * inclination and azimuth.
     * @param inputs - The material
     * @returns The sun position vector
     * @group get
     * @shortname get sun position
     */
    getSunPosition(inputs: Inputs.BabylonMaterial.SkyMaterialPropDto): Inputs.Base.Vector3{
        return inputs.skyMaterial.sunPosition.asArray();
    }

    /**
     * Reads whether a sky material places the sun from `sunPosition` rather than from inclination
     * and azimuth.
     * @param inputs - The material
     * @returns True when the explicit sun position is used
     * @group get
     * @shortname get use sun position
     */
    getUseSunPosition(inputs: Inputs.BabylonMaterial.SkyMaterialPropDto): boolean {
        return inputs.skyMaterial.useSunPosition;
    }

    /**
     * Reads the horizon offset vector of a sky material.
     * @param inputs - The material
     * @returns The offset vector
     * @group get
     * @shortname get camera offset
     */
    getCameraOffset(inputs: Inputs.BabylonMaterial.SkyMaterialPropDto): Inputs.Base.Vector3 {
        return inputs.skyMaterial.cameraOffset.asArray();
    }

    /**
     * Reads the direction a sky material treats as up.
     * @param inputs - The material
     * @returns The up vector
     * @group get
     * @shortname get up
     */
    getUp(inputs: Inputs.BabylonMaterial.SkyMaterialPropDto): Inputs.Base.Vector3 {
        return inputs.skyMaterial.up.asArray();
    }

    /**
     * Reads whether a sky material dithers its gradients to hide color banding.
     * @param inputs - The material
     * @returns True when dithering is on
     * @group get
     * @shortname get dithering
     */
    getDithering(inputs: Inputs.BabylonMaterial.SkyMaterialPropDto): boolean {
        return inputs.skyMaterial.dithering;
    }
}
