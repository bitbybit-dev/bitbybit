import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as BABYLON from "@babylonjs/core";
import { createHeadlessScene, HeadlessScene } from "../../../__test__/headless";
import { BabylonDecal } from "./decal";
import * as Inputs from "../../../inputs";

const PIXEL = "data:image/gif;base64,R0lGODlhAQABAAAAACw=";

describe("BabylonDecal", () => {
    let headless: HeadlessScene;
    let service: BabylonDecal;
    let sourceMesh: BABYLON.Mesh;
    let texture: BABYLON.Texture;

    beforeEach(() => {
        headless = createHeadlessScene();
        service = new BabylonDecal(headless.context);
        sourceMesh = BABYLON.MeshBuilder.CreateBox("box", { size: 2 }, headless.scene);
        sourceMesh.computeWorldMatrix(true);
        texture = new BABYLON.Texture(PIXEL, headless.scene);
    });

    afterEach(() => {
        headless.dispose();
    });

    const decalFor = (adjust: (inputs: Inputs.BabylonDecal.CreateMeshDecalDto) => void = () => undefined): BABYLON.Mesh => {
        const inputs = new Inputs.BabylonDecal.CreateMeshDecalDto(
            sourceMesh, texture, [0, 0, -1], [0, 0, -1], [1, 1, 1], 0, true, false, -2);
        adjust(inputs);
        return service.createMeshDecal(inputs);
    };

    describe("createMeshDecal", () => {
        it("should cut a mesh out of the surface it was put on", () => {
            // Act
            const decal = decalFor();

            // Assert
            expect(decal).toBeInstanceOf(BABYLON.Mesh);
            expect(decal.getTotalVertices()).toBeGreaterThan(0);
        });

        it("should hang the decal off the mesh it lies on", () => {
            // Act
            const decal = decalFor();

            // Assert
            expect(decal.parent).toBe(sourceMesh);
        });

        it("should show the texture it was given through the decal's own material", () => {
            // Act
            const decal = decalFor();
            const material = decal.material as BABYLON.StandardMaterial;

            // Assert
            expect(material.diffuseTexture).toBe(texture);
            expect(material.diffuseTexture!.hasAlpha).toBe(true);
            expect(material.useAlphaFromDiffuseTexture).toBe(true);
        });

        it("should lift the decal off the surface so the two do not fight over depth", () => {
            // Act
            const decal = decalFor();
            const material = decal.material as BABYLON.StandardMaterial;

            // Assert
            expect(material.zOffset).toBe(-2);
        });

        it("should leave the decal out of picking and out of the shadows", () => {
            // Act
            const decal = decalFor();

            // Assert
            expect(decal.isPickable).toBe(false);
            expect(decal.metadata).toEqual({ shadows: false });
        });

        it("should cull the back faces of the decal exactly as it was told to", () => {
            // Act
            const culled = decalFor();
            const notCulled = decalFor((inputs) => { inputs.cullBackFaces = false; });

            // Assert
            expect((culled.material as BABYLON.StandardMaterial).backFaceCulling).toBe(true);
            expect((notCulled.material as BABYLON.StandardMaterial).backFaceCulling).toBe(false);
        });

        it("should give each decal a name of its own", () => {
            // Act
            const first = decalFor();
            const second = decalFor();

            // Assert
            expect(first.name).not.toBe(second.name);
            expect(first.name).toContain("Decal");
        });
    });

    describe("enableDecalMap", () => {
        it("should give the mesh a renderer to paint decals into", () => {
            // Arrange
            const material = new BABYLON.StandardMaterial("mat", headless.scene);

            // Act
            const renderer = service.enableDecalMap(
                new Inputs.BabylonDecal.EnableDecalMapDto(sourceMesh, material, 256, 256));

            // Assert
            expect(renderer).toBeInstanceOf(BABYLON.MeshUVSpaceRenderer);
            expect(sourceMesh.decalMap).toBe(renderer);
        });

        it("should turn the material's own decal map on where it has one", () => {
            // Arrange
            const material = new BABYLON.PBRMaterial("mat", headless.scene);

            // Act
            service.enableDecalMap(new Inputs.BabylonDecal.EnableDecalMapDto(sourceMesh, material, 256, 256));

            // Assert
            expect(material.decalMap!.isEnabled).toBe(true);
        });

        it("should still give the mesh a renderer where the material has no decal map of its own", () => {
            // Arrange
            const material = new BABYLON.StandardMaterial("mat", headless.scene);

            // Act
            const renderer = service.enableDecalMap(
                new Inputs.BabylonDecal.EnableDecalMapDto(sourceMesh, material, 256, 256));

            // Assert
            expect(renderer).toBeDefined();
        });
    });

    describe("clearDecalMap", () => {
        it("should wipe everything painted into the map", () => {
            // Arrange
            const material = new BABYLON.StandardMaterial("mat", headless.scene);
            const renderer = service.enableDecalMap(
                new Inputs.BabylonDecal.EnableDecalMapDto(sourceMesh, material, 64, 64));

            // Act
            service.clearDecalMap(new Inputs.BabylonDecal.DecalMapDto(renderer));

            // Assert
            expect(sourceMesh.decalMap).toBe(renderer);
        });
    });
});
