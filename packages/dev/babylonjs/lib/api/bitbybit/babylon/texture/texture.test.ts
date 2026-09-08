import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as BABYLON from "@babylonjs/core";
import { createHeadlessScene, HeadlessScene } from "../../../__test__/headless";
import { BabylonTexture } from "./texture";
import * as Inputs from "../../../inputs";

const PIXEL = "data:image/gif;base64,R0lGODlhAQABAAAAACw=";

describe("BabylonTexture", () => {
    let headless: HeadlessScene;
    let service: BabylonTexture;

    beforeEach(() => {
        headless = createHeadlessScene();
        service = new BabylonTexture(headless.context);
    });

    afterEach(() => {
        headless.dispose();
    });

    describe("createSimple", () => {
        it("should build the texture on the context's scene from the url it was given", () => {
            // Act
            const texture = service.createSimple(new Inputs.BabylonTexture.TextureSimpleDto("tex", PIXEL));

            // Assert
            expect(texture).toBeInstanceOf(BABYLON.Texture);
            expect(texture.getScene()).toBe(headless.scene);
            expect(texture.url).toBe(PIXEL);
        });

        it("should take the tiling it was given", () => {
            // Act
            const texture = service.createSimple(new Inputs.BabylonTexture.TextureSimpleDto(
                "tex", PIXEL, true, false, 0.5, 2, 3, 0.1, 0.2));

            // Assert
            expect(texture.uScale).toBe(2);
            expect(texture.vScale).toBe(3);
            expect(texture.uOffset).toBe(0.1);
            expect(texture.vOffset).toBe(0.2);
            expect(texture.wAng).toBe(0.5);
        });

        it("should take the axis flips it was given", () => {
            // Act
            const texture = service.createSimple(new Inputs.BabylonTexture.TextureSimpleDto(
                "tex", PIXEL, false, true));

            // Assert
            expect(texture.invertZ).toBe(true);
        });

        it("should build the texture at the sampling mode it was asked for", () => {
            // Act
            const texture = service.createSimple(new Inputs.BabylonTexture.TextureSimpleDto(
                "tex", PIXEL, true, false, 0, 1, 1, 0, 0, Inputs.BabylonTexture.samplingModeEnum.nearest));

            // Assert
            expect(texture.samplingMode).toBe(headless.context.getSamplingMode(Inputs.BabylonTexture.samplingModeEnum.nearest));
        });
    });

    describe("createImage", () => {
        it("should build the texture under the name it was given", () => {
            // Act
            const texture = service.createImage(new Inputs.BabylonTexture.TextureImageDto("logo", PIXEL));

            // Assert
            expect(texture.name).toBe("logo");
            expect(texture.url).toBe(PIXEL);
        });

        it("should stop the image repeating past its own edges", () => {
            // Act
            const texture = service.createImage(new Inputs.BabylonTexture.TextureImageDto("logo", PIXEL));

            // Assert
            expect(texture.wrapU).toBe(BABYLON.Texture.CLAMP_ADDRESSMODE);
            expect(texture.wrapV).toBe(BABYLON.Texture.CLAMP_ADDRESSMODE);
        });

        it("should take the transparency it was told about", () => {
            // Act
            const texture = service.createImage(new Inputs.BabylonTexture.TextureImageDto("logo", PIXEL, true));

            // Assert
            expect(texture.hasAlpha).toBe(true);
        });
    });
});
