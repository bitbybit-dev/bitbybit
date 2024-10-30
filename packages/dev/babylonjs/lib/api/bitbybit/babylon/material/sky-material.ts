
import { Context } from "../../../context";
import * as BABYLON from "@babylonjs/core";
import { SkyMaterial } from "@babylonjs/materials";
import * as Inputs from "../../../inputs/inputs";

export class BabylonMaterialSky {

    constructor(private readonly context: Context) { }

    /**
     * Create Sky Material
     * @param inputs required to set up the sky material
     * @returns Sky material
     * @group create
     * @shortname sky material
     */
    create(inputs: Inputs.BabylonMaterial.SkyMaterialDto): SkyMaterial {
        const name = "bitbybit-skyMaterial";
        const mat = new SkyMaterial(name, this.context.scene);
        if (inputs.luminance !== undefined) {
            mat.luminance = inputs.luminance;
        }
        if (inputs.turbidity !== undefined) {
            mat.turbidity = inputs.turbidity;
        }
        if (inputs.rayleigh !== undefined) {
            mat.rayleigh = inputs.rayleigh;
        }
        if (inputs.mieCoefficient !== undefined) {
            mat.mieCoefficient = inputs.mieCoefficient;
        }
        if (inputs.mieDirectionalG !== undefined) {
            mat.mieDirectionalG = inputs.mieDirectionalG;
        }
        if (inputs.distance !== undefined) {
            mat.distance = inputs.distance;
        }
        if (inputs.inclination !== undefined) {
            mat.inclination = inputs.inclination;
        }
        if (inputs.azimuth !== undefined) {
            mat.azimuth = inputs.azimuth;
        }
        if (inputs.sunPosition !== undefined) {
            mat.sunPosition = new BABYLON.Vector3(inputs.sunPosition[0], inputs.sunPosition[1], inputs.sunPosition[2]);
        }
        if (inputs.useSunPosition !== undefined) {
            mat.useSunPosition = inputs.useSunPosition;
        }
        if (inputs.cameraOffset !== undefined) {
            mat.cameraOffset = new BABYLON.Vector3(inputs.cameraOffset[0], inputs.cameraOffset[1], inputs.cameraOffset[2]);
        }
        if (inputs.up !== undefined) {
            mat.up = new BABYLON.Vector3(inputs.up[0], inputs.up[1], inputs.up[2]);
        }
        if (inputs.dithering !== undefined) {
            mat.dithering = inputs.dithering;
        }

        return mat;
    }

    /**
     * Sets the luminance of the sky material
     * @param inputs luminance value and material
     * @group set
     * @shortname set luminance
     */
    setLuminance(inputs: Inputs.BabylonMaterial.LuminanceDto): void {
        const mat = inputs.material;
        mat.luminance = inputs.luminance;
    }

    /**
     * Sets the turbidity of the sky material
     * @param inputs turbidity value and material
     * @group set
     * @shortname set turbidity
     */
    setTurbidity(inputs: Inputs.BabylonMaterial.TurbidityDto): void {
        const mat = inputs.material;
        mat.turbidity = inputs.turbidity;
    }

    /**
     * Sets the rayleigh of the sky material
     * @param inputs rayleigh value and material
     * @group set
     * @shortname set rayleigh
     */
    setRayleigh(inputs: Inputs.BabylonMaterial.RayleighDto): void {
        const mat = inputs.material;
        mat.rayleigh = inputs.rayleigh;
    }

    /**
     * Sets the mieCoefficient of the sky material
     * @param inputs mieCoefficient value and material
     * @group set
     * @shortname set mieCoefficient
     */
    setMieCoefficient(inputs: Inputs.BabylonMaterial.MieCoefficientDto): void {
        const mat = inputs.material;
        mat.mieCoefficient = inputs.mieCoefficient;
    }

    /**
     * Sets the mieDirectionalG of the sky material
     * @param inputs mieDirectionalG value and material
     * @group set
     * @shortname set mieDirectionalG
     */
    setMieDirectionalG(inputs: Inputs.BabylonMaterial.MieDirectionalGDto): void {
        const mat = inputs.material;
        mat.mieDirectionalG = inputs.mieDirectionalG;
    }

    /**
     * Sets the distance of the sky material
     * @param inputs distance value and material
     * @group set
     * @shortname set distance
     */
    setDistance(inputs: Inputs.BabylonMaterial.DistanceDto): void {
        const mat = inputs.material;
        mat.distance = inputs.distance;
    }

    /**
     * Sets the inclination of the sky material
     * @param inputs inclination value and material
     * @group set
     * @shortname set inclination
     */
    setInclination(inputs: Inputs.BabylonMaterial.InclinationDto): void {
        const mat = inputs.material;
        mat.inclination = inputs.inclination;
    }

    /**
     * Sets the azimuth of the sky material
     * @param inputs azimuth value and material
     * @group set
     * @shortname set azimuth
     */
    setAzimuth(inputs: Inputs.BabylonMaterial.AzimuthDto): void {
        const mat = inputs.material;
        mat.azimuth = inputs.azimuth;
    }

    /**
     * Sets the sun position of the sky material
     * @param inputs sun position value and material
     * @group set
     * @shortname set sun position
     */
    setSunPosition(inputs: Inputs.BabylonMaterial.SunPositionDto): void {
        const mat = inputs.material;
        mat.sunPosition = new BABYLON.Vector3(inputs.sunPosition[0], inputs.sunPosition[1], inputs.sunPosition[2]);
    }

    /**
     * Sets the use sun position of the sky material
     * @param inputs use sun position value and material
     * @group set
     * @shortname set use sun position
     */
    setUseSunPosition(inputs: Inputs.BabylonMaterial.UseSunPositionDto): void {
        const mat = inputs.material;
        mat.useSunPosition = inputs.useSunPosition;
    }

    /**
     * Sets the camera offset of the sky material
     * @param inputs camera offset value and material
     * @group set
     * @shortname set camera offset
     */
    setCameraOffset(inputs: Inputs.BabylonMaterial.CameraOffsetDto): void {
        const mat = inputs.material;
        mat.cameraOffset = new BABYLON.Vector3(inputs.cameraOffset[0], inputs.cameraOffset[1], inputs.cameraOffset[2]);
    }

    /**
     * Sets the up of the sky material
     * @param inputs up value and material
     * @group set
     * @shortname set up
     */
    setUp(inputs: Inputs.BabylonMaterial.UpDto): void {
        const mat = inputs.material;
        mat.up = new BABYLON.Vector3(inputs.up[0], inputs.up[1], inputs.up[2]);
    }

    /**
     * Sets the dithering of the sky material
     * @param inputs dithering value and material
     * @group set
     * @shortname set dithering
     */
    setDithering(inputs: Inputs.BabylonMaterial.DitheringDto): void {
        const mat = inputs.material;
        mat.dithering = inputs.dithering;
    }

    /**
     * Gets the luminance of the sky material
     * @param inputs material
     * @group get
     * @shortname get luminance
     */
    getLuminance(inputs: Inputs.BabylonMaterial.SkyMaterialPropDto): number {
        return inputs.skyMaterial.luminance;
    }

    /**
     * Gets the turbidity of the sky material
     * @param inputs material
     * @group get
     * @shortname get turbidity
     */
    getTurbidity(inputs: Inputs.BabylonMaterial.SkyMaterialPropDto): number {
        return inputs.skyMaterial.turbidity;
    }

    /**
     * Gets the rayleigh of the sky material
     * @param inputs material
     * @group get
     * @shortname get rayleigh
     */
    getRayleigh(inputs: Inputs.BabylonMaterial.SkyMaterialPropDto): number {
        return inputs.skyMaterial.rayleigh;
    }

    /**
     * Gets the mieCoefficient of the sky material
     * @param inputs material
     * @group get
     * @shortname get mieCoefficient
     */
    getMieCoefficient(inputs: Inputs.BabylonMaterial.SkyMaterialPropDto): number {
        return inputs.skyMaterial.mieCoefficient;
    }

    /**
     * Gets the mieDirectionalG of the sky material
     * @param inputs material
     * @group get
     * @shortname get mieDirectionalG
     */
    getMieDirectionalG(inputs: Inputs.BabylonMaterial.SkyMaterialPropDto): number {
        return inputs.skyMaterial.mieDirectionalG;
    }

    /**
     * Gets the distance of the sky material
     * @param inputs material
     * @group get
     * @shortname get distance
     */
    getDistance(inputs: Inputs.BabylonMaterial.SkyMaterialPropDto): number {
        return inputs.skyMaterial.distance;
    }

    /**
     * Gets the inclination of the sky material
     * @param inputs material
     * @group get
     * @shortname get inclination
     */
    getInclination(inputs: Inputs.BabylonMaterial.SkyMaterialPropDto): number {
        return inputs.skyMaterial.inclination;
    }

    /**
     * Gets the azimuth of the sky material
     * @param inputs material
     * @group get
     * @shortname get azimuth
     */
    getAzimuth(inputs: Inputs.BabylonMaterial.SkyMaterialPropDto): number {
        return inputs.skyMaterial.azimuth;
    }

    /**
     * Gets the sun position of the sky material
     * @param inputs material
     * @group get
     * @shortname get sun position
     */
    getSunPosition(inputs: Inputs.BabylonMaterial.SkyMaterialPropDto): Inputs.Base.Vector3{
        return inputs.skyMaterial.sunPosition.asArray();
    }

    /**
     * Gets the use sun position of the sky material
     * @param inputs material
     * @group get
     * @shortname get use sun position
     */
    getUseSunPosition(inputs: Inputs.BabylonMaterial.SkyMaterialPropDto): boolean {
        return inputs.skyMaterial.useSunPosition;
    }

    /**
     * Gets the camera offset of the sky material
     * @param inputs material
     * @group get
     * @shortname get camera offset
     */
    getCameraOffset(inputs: Inputs.BabylonMaterial.SkyMaterialPropDto): Inputs.Base.Vector3 {
        return inputs.skyMaterial.cameraOffset.asArray();
    }

    /**
     * Gets the up of the sky material
     * @param inputs material
     * @group get
     * @shortname get up
     */
    getUp(inputs: Inputs.BabylonMaterial.SkyMaterialPropDto): Inputs.Base.Vector3 {
        return inputs.skyMaterial.up.asArray();
    }

    /**
     * Gets the dithering of the sky material
     * @param inputs material
     * @group get
     * @shortname get dithering
     */
    getDithering(inputs: Inputs.BabylonMaterial.SkyMaterialPropDto): boolean {
        return inputs.skyMaterial.dithering;
    }
}
