import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as BABYLON from "@babylonjs/core";
import * as GUI from "@babylonjs/gui";
import { createHeadlessScene, HeadlessScene } from "../../../__test__/headless";
import { BabylonGuiAdvancedDynamicTexture } from "./advanced-dynamic-texture";
import * as Inputs from "../../../inputs";

describe("BabylonGuiAdvancedDynamicTexture", () => {
    let headless: HeadlessScene;
    let service: BabylonGuiAdvancedDynamicTexture;

    beforeEach(() => {
        headless = createHeadlessScene();
        service = new BabylonGuiAdvancedDynamicTexture(headless.context);
    });

    afterEach(() => {
        headless.dispose();
    });

    describe("createFullScreenUI", () => {
        it("should build a texture on the context's scene under the name it was given", () => {
            // Act
            const texture = service.createFullScreenUI(new Inputs.BabylonGui.CreateFullScreenUIDto("ui"));

            // Assert
            expect(texture).toBeInstanceOf(GUI.AdvancedDynamicTexture);
            expect(texture.name).toBe("ui");
            expect(texture.getScene()).toBe(headless.scene);
        });

        it("should host the controls added to it", () => {
            // Arrange
            const texture = service.createFullScreenUI(new Inputs.BabylonGui.CreateFullScreenUIDto("ui"));
            const control = new GUI.TextBlock("label", "hello");

            // Act
            texture.addControl(control);

            // Assert
            expect(texture.getChildren()[0]?.children).toContain(control);
        });

        it("should scale itself to the rendering resolution when it was asked to", () => {
            // Act
            const texture = service.createFullScreenUI(new Inputs.BabylonGui.CreateFullScreenUIDto("ui", true, true));

            // Assert
            expect(texture.renderScale).toBeGreaterThan(0);
        });
    });

    describe("createForMesh", () => {
        it("should build a texture bound to the mesh it was given", () => {
            // Arrange
            const mesh = BABYLON.MeshBuilder.CreatePlane("plane", { size: 1 }, headless.scene);

            // Act
            const texture = service.createForMesh(new Inputs.BabylonGui.CreateForMeshDto(mesh, 512, 512));

            // Assert
            expect(texture).toBeInstanceOf(GUI.AdvancedDynamicTexture);
            expect(mesh.material).toBeDefined();
        });

        it("should build the texture at the size it was given", () => {
            // Arrange
            const mesh = BABYLON.MeshBuilder.CreatePlane("plane", { size: 1 }, headless.scene);

            // Act
            const texture = service.createForMesh(new Inputs.BabylonGui.CreateForMeshDto(mesh, 256, 128));

            // Assert
            expect(texture.getSize()).toEqual({ width: 256, height: 128 });
        });

        it("should build the texture at the sampling mode it was asked for", () => {
            // Arrange
            const mesh = BABYLON.MeshBuilder.CreatePlane("plane", { size: 1 }, headless.scene);
            const inputs = new Inputs.BabylonGui.CreateForMeshDto(mesh, 256, 256);
            inputs.sampling = Inputs.BabylonTexture.samplingModeEnum.nearest;

            // Act
            const texture = service.createForMesh(inputs);

            // Assert
            expect(texture.samplingMode).toBe(headless.context.getSamplingMode(Inputs.BabylonTexture.samplingModeEnum.nearest));
        });
    });
});
