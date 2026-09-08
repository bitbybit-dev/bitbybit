import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import * as BABYLON from "@babylonjs/core";
import { createHeadlessScene, HeadlessScene } from "../../__test__/headless";
import { BabylonTools } from "./tools";
import * as Inputs from "../../inputs";

const takenWith = vi.hoisted(() => ({ calls: [] as unknown[][] }));

vi.mock("@babylonjs/core", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@babylonjs/core")>();
    return {
        ...actual,
        Tools: {
            ...actual.Tools,
            CreateScreenshotAsync: (...args: unknown[]): Promise<string> => {
                takenWith.calls.push(args);
                return Promise.resolve("data:image/png;base64,");
            },
            CreateScreenshot: (...args: unknown[]): void => {
                takenWith.calls.push(args);
                const done = args[3] as () => void;
                done();
            },
        },
    };
});

describe("BabylonTools", () => {
    let headless: HeadlessScene;
    let service: BabylonTools;

    beforeEach(() => {
        takenWith.calls = [];
        headless = createHeadlessScene();
        service = new BabylonTools(headless.context);
    });

    afterEach(() => {
        headless.dispose();
    });

    describe("createScreenshot", () => {
        it("should hand back what the engine rendered", async () => {
            // Act
            const image = await service.createScreenshot(new Inputs.BabylonTools.ScreenshotDto(undefined, 800, 600));

            // Assert
            expect(image).toBe("data:image/png;base64,");
        });

        it("should shoot from the scene's active camera when it was given none", async () => {
            // Act
            await service.createScreenshot(new Inputs.BabylonTools.ScreenshotDto(undefined, 800, 600));

            // Assert
            expect(takenWith.calls[0]![1]).toBe(headless.scene.activeCamera);
        });

        it("should shoot from the camera it was given", async () => {
            // Arrange
            const camera = new BABYLON.FreeCamera("other", new BABYLON.Vector3(0, 0, -5), headless.scene);

            // Act
            await service.createScreenshot(new Inputs.BabylonTools.ScreenshotDto(camera, 800, 600));

            // Assert
            expect(takenWith.calls[0]![1]).toBe(camera);
        });

        it("should shoot at the size, format and quality it was asked for", async () => {
            // Act
            await service.createScreenshot(new Inputs.BabylonTools.ScreenshotDto(undefined, 320, 240, "image/jpeg", 0.6));

            // Assert
            expect(takenWith.calls[0]![2]).toEqual({ width: 320, height: 240 });
            expect(takenWith.calls[0]![3]).toBe("image/jpeg");
            expect(takenWith.calls[0]![4]).toBe(0.6);
        });
    });

    describe("createScreenshotAndDownload", () => {
        it("should wait for the engine to finish before it says it is done", async () => {
            // Act
            const result = await service.createScreenshotAndDownload(
                new Inputs.BabylonTools.ScreenshotDto(undefined, 800, 600));

            // Assert
            expect(result).toBe("done");
        });

        it("should shoot from the scene's active camera when it was given none", async () => {
            // Act
            await service.createScreenshotAndDownload(new Inputs.BabylonTools.ScreenshotDto(undefined, 800, 600));

            // Assert
            expect(takenWith.calls[0]![1]).toBe(headless.scene.activeCamera);
        });

        it("should ask the engine to hand the file to the browser", async () => {
            // Act
            await service.createScreenshotAndDownload(new Inputs.BabylonTools.ScreenshotDto(undefined, 800, 600));

            // Assert
            expect(takenWith.calls[0]![5]).toBe(true);
        });
    });
});
