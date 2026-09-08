import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as BABYLON from "@babylonjs/core";
import { Color, MathBitByBit } from "@bitbybit-dev/base";
import { createHeadlessScene, HeadlessScene } from "../../../__test__/headless";
import { BabylonMaterialPbrMetallicRoughness } from "./pbr-metallic-roughness";
import * as Inputs from "../../../inputs";

describe("BabylonMaterialPbrMetallicRoughness", () => {
    let headless: HeadlessScene;
    let service: BabylonMaterialPbrMetallicRoughness;

    beforeEach(() => {
        headless = createHeadlessScene();
        service = new BabylonMaterialPbrMetallicRoughness(headless.context, new Color(new MathBitByBit()));
    });

    afterEach(() => {
        headless.dispose();
    });

    const materialFor = (adjust: (inputs: Inputs.BabylonMaterial.PBRMetallicRoughnessDto) => void = () => undefined): BABYLON.PBRMetallicRoughnessMaterial => {
        const inputs = new Inputs.BabylonMaterial.PBRMetallicRoughnessDto("mat", "#ff0000", undefined, 0.2, 0.8, 1, true, 0);
        adjust(inputs);
        return service.create(inputs);
    };

    const propsOf = (material: BABYLON.PBRMetallicRoughnessMaterial): Inputs.BabylonMaterial.MaterialPropDto =>
        new Inputs.BabylonMaterial.MaterialPropDto(material);

    describe("create", () => {
        it("should build the material on the context's scene under the name it was given", () => {
            // Act
            const material = materialFor();

            // Assert
            expect(material).toBeInstanceOf(BABYLON.PBRMetallicRoughnessMaterial);
            expect(material.getScene()).toBe(headless.scene);
            expect(material.name).toBe("mat");
        });

        it("should take the colour and the surface it was given", () => {
            // Act
            const material = materialFor();

            // Assert
            expect(service.getBaseColor(propsOf(material))).toBe("#ff0000");
            expect(service.getMetallic(propsOf(material))).toBe(0.2);
            expect(service.getRoughness(propsOf(material))).toBe(0.8);
            expect(service.getAlpha(propsOf(material))).toBe(1);
            expect(service.getBackFaceCulling(propsOf(material))).toBe(true);
        });

        it("should take the depth offset it was given", () => {
            // Act
            const material = materialFor((inputs) => { inputs.zOffset = 3; });

            // Assert
            expect(material.zOffset).toBe(3);
        });

        it("should emit light of its own only when it was given an emissive colour", () => {
            // Act
            const emitting = materialFor((inputs) => { inputs.emissiveColor = "#00ff00"; });
            const plain = materialFor();

            // Assert
            expect(emitting.emissiveColor.toHexString()).toBe("#00FF00");
            expect(plain.emissiveColor.equals(new BABYLON.Color3(0, 0, 0))).toBe(true);
        });

        it("should fall back to its default values where nothing was asked for", () => {
            // Arrange
            const inputs = new Inputs.BabylonMaterial.PBRMetallicRoughnessDto("mat");
            Object.assign(inputs, {
                baseColor: undefined,
                metallic: undefined,
                roughness: undefined,
                alpha: undefined,
                backFaceCulling: undefined,
            });

            // Act
            const material = service.create(inputs);

            // Assert
            expect(service.getBaseColor(propsOf(material))).toBe("#0000ff");
            expect(service.getMetallic(propsOf(material))).toBe(0.5);
            expect(service.getRoughness(propsOf(material))).toBe(0.5);
            expect(service.getAlpha(propsOf(material))).toBe(0.5);
            expect(service.getBackFaceCulling(propsOf(material))).toBe(true);
        });
    });

    describe("the writers and the readers", () => {
        it("should set and read the base colour", () => {
            // Arrange
            const material = materialFor();

            // Act
            service.setBaseColor(new Inputs.BabylonMaterial.BaseColorDto(material, "#00ff00"));

            // Assert
            expect(service.getBaseColor(propsOf(material))).toBe("#00ff00");
        });

        it("should set and read how metallic the surface is", () => {
            // Arrange
            const material = materialFor();

            // Act
            service.setMetallic(new Inputs.BabylonMaterial.MetallicDto(material, 1));

            // Assert
            expect(service.getMetallic(propsOf(material))).toBe(1);
        });

        it("should set and read how rough the surface is", () => {
            // Arrange
            const material = materialFor();

            // Act
            service.setRoughness(new Inputs.BabylonMaterial.RoughnessDto(material, 0.1));

            // Assert
            expect(service.getRoughness(propsOf(material))).toBe(0.1);
        });

        it("should set and read the transparency", () => {
            // Arrange
            const material = materialFor();

            // Act
            service.setAlpha(new Inputs.BabylonMaterial.AlphaDto(material, 0.25));

            // Assert
            expect(service.getAlpha(propsOf(material))).toBe(0.25);
        });

        it("should set and read whether the back faces are drawn", () => {
            // Arrange
            const material = materialFor();

            // Act
            service.setBackFaceCulling(new Inputs.BabylonMaterial.BackFaceCullingDto(material, false));

            // Assert
            expect(service.getBackFaceCulling(propsOf(material))).toBe(false);
        });

        it("should set and read the base texture", () => {
            // Arrange
            const material = materialFor();
            const texture = new BABYLON.Texture(null, headless.scene);

            // Act
            service.setBaseTexture(new Inputs.BabylonMaterial.BaseTextureDto(material, texture));

            // Assert
            expect(service.getBaseTexture(propsOf(material))).toBe(texture);
        });

        it("should fall back to the default value where a writer was given nothing", () => {
            // Arrange
            const material = materialFor();
            const baseColor = new Inputs.BabylonMaterial.BaseColorDto(material);
            const metallic = new Inputs.BabylonMaterial.MetallicDto(material);
            const alpha = new Inputs.BabylonMaterial.AlphaDto(material);
            const backFaceCulling = new Inputs.BabylonMaterial.BackFaceCullingDto(material);
            Object.assign(baseColor, { baseColor: undefined });
            Object.assign(metallic, { metallic: undefined });
            Object.assign(alpha, { alpha: undefined });
            Object.assign(backFaceCulling, { backFaceCulling: undefined });

            // Act
            service.setBaseColor(baseColor);
            service.setMetallic(metallic);
            service.setAlpha(alpha);
            service.setBackFaceCulling(backFaceCulling);

            // Assert
            expect(service.getBaseColor(propsOf(material))).toBe("#0000ff");
            expect(service.getMetallic(propsOf(material))).toBe(0.5);
            expect(service.getAlpha(propsOf(material))).toBe(0.5);
            expect(service.getBackFaceCulling(propsOf(material))).toBe(true);
        });
    });
});
