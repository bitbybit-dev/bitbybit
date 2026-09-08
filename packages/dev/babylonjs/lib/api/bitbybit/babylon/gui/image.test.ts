import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as BABYLON from "../../../../gui-enriched-babylon";
import { createHeadlessScene, HeadlessScene } from "../../../__test__/headless";
import { BabylonGuiImage } from "./image";
import * as Inputs from "../../../inputs";

const URL_ONE = "data:image/gif;base64,R0lGODlhAQABAAAAACw=";
const URL_TWO = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";

describe("BabylonGuiImage", () => {
    let headless: HeadlessScene;
    let service: BabylonGuiImage;

    beforeEach(() => {
        headless = createHeadlessScene();
        service = new BabylonGuiImage(headless.context);
    });

    afterEach(() => {
        headless.dispose();
    });

    const imageFor = (adjust: (inputs: Inputs.BabylonGui.CreateImageDto) => void = () => undefined): BABYLON.GUI.Image => {
        const inputs = new Inputs.BabylonGui.CreateImageDto("picture", URL_ONE, "#ffffff");
        adjust(inputs);
        return service.createImage(inputs);
    };

    describe("createImage", () => {
        it("should carry the name, source and colour it was given", () => {
            // Act
            const image = imageFor();

            // Assert
            expect(image.name).toBe("picture");
            expect(service.getSourceUrl(new Inputs.BabylonGui.ImageDto(image))).toBe(URL_ONE);
            expect(image.color).toBe("#ffffff");
        });

        it("should take a square default size when none was asked for", () => {
            // Act
            const image = imageFor();

            // Assert
            expect(image.width).toBe("200px");
            expect(image.height).toBe("200px");
        });

        it("should take a size of its own over the default", () => {
            // Act
            const image = imageFor((inputs) => { inputs.width = "64px"; inputs.height = "48px"; });

            // Assert
            expect(image.width).toBe("64px");
            expect(image.height).toBe("48px");
        });
    });

    describe("setSourceUrl", () => {
        it("should point the image at another source and hand it back", () => {
            // Arrange
            const image = imageFor();

            // Act
            const result = service.setSourceUrl(new Inputs.BabylonGui.SetImageUrlDto(image, URL_TWO));

            // Assert
            expect(service.getSourceUrl(new Inputs.BabylonGui.ImageDto(image))).toBe(URL_TWO);
            expect(result).toBe(image);
        });
    });
});
