import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { SkyMaterial } from "@babylonjs/materials";
import { createHeadlessScene, HeadlessScene } from "../../../__test__/headless";
import { BabylonMaterialSky } from "./sky-material";
import * as Inputs from "../../../inputs";

describe("BabylonMaterialSky", () => {
    let headless: HeadlessScene;
    let service: BabylonMaterialSky;

    beforeEach(() => {
        headless = createHeadlessScene();
        service = new BabylonMaterialSky(headless.context);
    });

    afterEach(() => {
        headless.dispose();
    });

    const propsOf = (material: SkyMaterial): Inputs.BabylonMaterial.SkyMaterialPropDto =>
        new Inputs.BabylonMaterial.SkyMaterialPropDto(material);

    describe("create", () => {
        it("should build a sky material on the context's scene", () => {
            // Act
            const material = service.create(new Inputs.BabylonMaterial.SkyMaterialDto());

            // Assert
            expect(material).toBeInstanceOf(SkyMaterial);
            expect(material.getScene()).toBe(headless.scene);
            expect(material.name).toBe("bitbybit-skyMaterial");
        });

        it("should take every scattering term it was given", () => {
            // Act
            const material = service.create(
                new Inputs.BabylonMaterial.SkyMaterialDto(0.5, 8, 3, 0.01, 0.7, 400, 0.3, 0.6));

            // Assert
            expect(service.getLuminance(propsOf(material))).toBe(0.5);
            expect(service.getTurbidity(propsOf(material))).toBe(8);
            expect(service.getRayleigh(propsOf(material))).toBe(3);
            expect(service.getMieCoefficient(propsOf(material))).toBe(0.01);
            expect(service.getMieDirectionalG(propsOf(material))).toBe(0.7);
            expect(service.getDistance(propsOf(material))).toBe(400);
            expect(service.getInclination(propsOf(material))).toBe(0.3);
            expect(service.getAzimuth(propsOf(material))).toBe(0.6);
        });

        it("should take the sun placement it was given", () => {
            // Act
            const material = service.create(new Inputs.BabylonMaterial.SkyMaterialDto(
                undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined,
                [1, 2, 3], true));

            // Assert
            expect(service.getSunPosition(propsOf(material))).toEqual([1, 2, 3]);
            expect(service.getUseSunPosition(propsOf(material))).toBe(true);
        });

        it("should take the camera offset, the up direction and the dithering it was given", () => {
            // Act
            const material = service.create(new Inputs.BabylonMaterial.SkyMaterialDto(
                undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined,
                undefined, undefined, [0, 10, 0], [0, 0, 1], true));

            // Assert
            expect(service.getCameraOffset(propsOf(material))).toEqual([0, 10, 0]);
            expect(service.getUp(propsOf(material))).toEqual([0, 0, 1]);
            expect(service.getDithering(propsOf(material))).toBe(true);
        });

        it("should leave a term the shader's own where none was asked for", () => {
            // Arrange
            const reference = new SkyMaterial("reference", headless.scene);
            const inputs = new Inputs.BabylonMaterial.SkyMaterialDto();
            Object.assign(inputs, { luminance: undefined, turbidity: undefined });

            // Act
            const material = service.create(inputs);

            // Assert
            expect(service.getLuminance(propsOf(material))).toBe(reference.luminance);
            expect(service.getTurbidity(propsOf(material))).toBe(reference.turbidity);
        });
    });

    describe("the writers", () => {
        let material: SkyMaterial;

        beforeEach(() => {
            material = service.create(new Inputs.BabylonMaterial.SkyMaterialDto());
        });

        it("should set the luminance", () => {
            // Act
            service.setLuminance(new Inputs.BabylonMaterial.LuminanceDto(material, 0.2));

            // Assert
            expect(service.getLuminance(propsOf(material))).toBe(0.2);
        });

        it("should set the turbidity", () => {
            // Act
            service.setTurbidity(new Inputs.BabylonMaterial.TurbidityDto(material, 20));

            // Assert
            expect(service.getTurbidity(propsOf(material))).toBe(20);
        });

        it("should set the rayleigh term", () => {
            // Act
            service.setRayleigh(new Inputs.BabylonMaterial.RayleighDto(material, 4));

            // Assert
            expect(service.getRayleigh(propsOf(material))).toBe(4);
        });

        it("should set the mie coefficient", () => {
            // Act
            service.setMieCoefficient(new Inputs.BabylonMaterial.MieCoefficientDto(material, 0.02));

            // Assert
            expect(service.getMieCoefficient(propsOf(material))).toBe(0.02);
        });

        it("should set the mie directional term", () => {
            // Act
            service.setMieDirectionalG(new Inputs.BabylonMaterial.MieDirectionalGDto(material, 0.9));

            // Assert
            expect(service.getMieDirectionalG(propsOf(material))).toBe(0.9);
        });

        it("should set the distance", () => {
            // Act
            service.setDistance(new Inputs.BabylonMaterial.DistanceDto(material, 700));

            // Assert
            expect(service.getDistance(propsOf(material))).toBe(700);
        });

        it("should set the inclination", () => {
            // Act
            service.setInclination(new Inputs.BabylonMaterial.InclinationDto(material, 0.1));

            // Assert
            expect(service.getInclination(propsOf(material))).toBe(0.1);
        });

        it("should set the azimuth", () => {
            // Act
            service.setAzimuth(new Inputs.BabylonMaterial.AzimuthDto(material, 0.8));

            // Assert
            expect(service.getAzimuth(propsOf(material))).toBe(0.8);
        });

        it("should set the sun position", () => {
            // Act
            service.setSunPosition(new Inputs.BabylonMaterial.SunPositionDto(material, [5, 6, 7]));

            // Assert
            expect(service.getSunPosition(propsOf(material))).toEqual([5, 6, 7]);
        });

        it("should set whether the sun position is used at all", () => {
            // Act
            service.setUseSunPosition(new Inputs.BabylonMaterial.UseSunPositionDto(material, true));

            // Assert
            expect(service.getUseSunPosition(propsOf(material))).toBe(true);
        });

        it("should set the camera offset", () => {
            // Act
            service.setCameraOffset(new Inputs.BabylonMaterial.CameraOffsetDto(material, [0, 100, 0]));

            // Assert
            expect(service.getCameraOffset(propsOf(material))).toEqual([0, 100, 0]);
        });

        it("should set the up direction", () => {
            // Act
            service.setUp(new Inputs.BabylonMaterial.UpDto(material, [1, 0, 0]));

            // Assert
            expect(service.getUp(propsOf(material))).toEqual([1, 0, 0]);
        });

        it("should set the dithering", () => {
            // Act
            service.setDithering(new Inputs.BabylonMaterial.DitheringDto(material, true));

            // Assert
            expect(service.getDithering(propsOf(material))).toBe(true);
        });
    });

    describe("the writers when a value is left out", () => {
        it("should fall back to the default value for each term", () => {
            // Arrange
            const material = service.create(new Inputs.BabylonMaterial.SkyMaterialDto());
            const luminance = new Inputs.BabylonMaterial.LuminanceDto(material);
            const turbidity = new Inputs.BabylonMaterial.TurbidityDto(material);
            const rayleigh = new Inputs.BabylonMaterial.RayleighDto(material);
            const distance = new Inputs.BabylonMaterial.DistanceDto(material);
            Object.assign(luminance, { luminance: undefined });
            Object.assign(turbidity, { turbidity: undefined });
            Object.assign(rayleigh, { rayleigh: undefined });
            Object.assign(distance, { distance: undefined });

            // Act
            service.setLuminance(luminance);
            service.setTurbidity(turbidity);
            service.setRayleigh(rayleigh);
            service.setDistance(distance);

            // Assert
            expect(service.getLuminance(propsOf(material))).toBe(1);
            expect(service.getTurbidity(propsOf(material))).toBe(10);
            expect(service.getRayleigh(propsOf(material))).toBe(2);
            expect(service.getDistance(propsOf(material))).toBe(500);
        });
    });
});
