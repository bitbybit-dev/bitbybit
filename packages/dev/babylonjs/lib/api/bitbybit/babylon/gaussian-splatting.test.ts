import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as BABYLON from "@babylonjs/core";
import { createHeadlessScene, HeadlessScene } from "../../__test__/headless";
import { BabylonGaussianSplatting } from "./gaussian-splatting";
import * as Inputs from "../../inputs";

describe("BabylonGaussianSplatting", () => {
    let headless: HeadlessScene;
    let service: BabylonGaussianSplatting;

    beforeEach(() => {
        headless = createHeadlessScene();
        service = new BabylonGaussianSplatting(headless.context);
    });

    afterEach(() => {
        headless.dispose();
    });

    describe("create", () => {
        it("should build nothing when it was given no url to load from", async () => {
            // Act
            const mesh = await service.create(new Inputs.BabylonGaussianSplatting.CreateGaussianSplattingMeshDto());

            // Assert
            expect(mesh).toBeUndefined();
        });
    });

    describe("clone", () => {
        it("should produce a second mesh under a name of its own", () => {
            // Arrange
            const mesh = new BABYLON.GaussianSplattingMesh("splats", null, headless.scene);

            // Act
            const clone = service.clone(new Inputs.BabylonGaussianSplatting.GaussianSplattingMeshDto(mesh));

            // Assert
            expect(clone).not.toBe(mesh);
            expect(clone.name).toContain("gaussian-splatting");
        });
    });

    describe("getSplatPositions", () => {
        it("should read one point per splat, three of every four floats the engine holds", () => {
            // Arrange
            const mesh = new BABYLON.GaussianSplattingMesh("splats", null, headless.scene);
            Object.assign(mesh, { _splatPositions: new Float32Array([1, 2, 3, 0.5, 4, 5, 6, 0.25]) });

            // Act
            const points = service.getSplatPositions(new Inputs.BabylonGaussianSplatting.GaussianSplattingMeshDto(mesh));

            // Assert
            expect(points).toEqual([[1, 2, 3], [4, 5, 6]]);
        });

        it("should read no points off a mesh that has loaded nothing yet", () => {
            // Arrange
            const mesh = new BABYLON.GaussianSplattingMesh("splats", null, headless.scene);
            Object.assign(mesh, { _splatPositions: null });

            // Act
            const points = service.getSplatPositions(new Inputs.BabylonGaussianSplatting.GaussianSplattingMeshDto(mesh));

            // Assert
            expect(points).toEqual([]);
        });
    });
});
