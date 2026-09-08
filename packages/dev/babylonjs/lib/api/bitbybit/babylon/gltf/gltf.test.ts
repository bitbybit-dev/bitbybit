import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as BABYLON from "@babylonjs/core";
import { createHeadlessScene, addShadowGenerator, HeadlessScene } from "../../../__test__/headless";
import { BabylonGltf } from "./gltf";
import * as Inputs from "../../../inputs";

const gltfWith = (nodes: unknown[], meshes: unknown[] = []): string => JSON.stringify({
    asset: { version: "2.0" },
    scene: 0,
    scenes: [{ nodes: nodes.map((_, index) => index) }],
    nodes,
    meshes,
});

const EMPTY_GLTF = gltfWith([]);
const ONE_NODE_GLTF = gltfWith([{ name: "part" }]);

const fileOf = (content: string, name = "part.gltf"): File =>
    new File([content], name, { type: "model/gltf+json" });

describe("BabylonGltf", () => {
    let headless: HeadlessScene;
    let service: BabylonGltf;

    beforeEach(() => {
        headless = createHeadlessScene();
        service = new BabylonGltf(headless.context);
    });

    afterEach(() => {
        headless.dispose();
    });

    describe("loadAssetContainer", () => {
        it("should hand back a container built on the context's scene", async () => {
            // Act
            const container = await service.loadAssetContainer(
                new Inputs.Asset.AssetFileDto(fileOf(EMPTY_GLTF)));

            // Assert
            expect(container).toBeInstanceOf(BABYLON.AssetContainer);
            expect(container.scene).toBe(headless.scene);
        });

        it("should put everything the file brought in into the scene", async () => {
            // Act
            const container = await service.loadAssetContainer(
                new Inputs.Asset.AssetFileDto(fileOf(ONE_NODE_GLTF)));

            // Assert
            expect(container.transformNodes.length + container.meshes.length).toBeGreaterThan(0);
            expect(headless.scene.getNodeByName("part") ?? headless.scene.getNodeByName("__root__")).toBeTruthy();
        });

        it("should leave what it loaded out of picking", async () => {
            // Act
            const container = await service.loadAssetContainer(
                new Inputs.Asset.AssetFileDto(fileOf(ONE_NODE_GLTF)));

            // Assert
            expect(container.meshes.every(mesh => mesh.isPickable === false)).toBe(true);
        });

        it("should leave what it loaded visible by default", async () => {
            // Act
            const container = await service.loadAssetContainer(
                new Inputs.Asset.AssetFileDto(fileOf(ONE_NODE_GLTF)));

            // Assert
            expect(container.meshes.every(mesh => mesh.isVisible === true)).toBe(true);
        });

        it("should hide what it loaded when it was asked to", async () => {
            // Act
            const container = await service.loadAssetContainer(
                new Inputs.Asset.AssetFileDto(fileOf(ONE_NODE_GLTF), true));

            // Assert
            expect(container.meshes.every(mesh => mesh.isVisible === false)).toBe(true);
        });

        it("should sign what it loaded up to the shadow generators the scene carries", async () => {
            // Arrange
            const generator = addShadowGenerator(headless.scene);

            // Act
            const container = await service.loadAssetContainer(
                new Inputs.Asset.AssetFileDto(fileOf(ONE_NODE_GLTF)));

            // Assert
            const casters = generator.getShadowMap()!.renderList ?? [];
            expect(container.meshes.every(mesh => casters.includes(mesh))).toBe(true);
            expect(container.meshes.every(mesh => mesh.receiveShadows === true)).toBe(true);
        });
    });

    describe("loadAssetContainerFromUrl", () => {
        it("should join the root url and the file name before it loads", async () => {
            // Act
            const container = await service.loadAssetContainerFromUrl(
                new Inputs.Asset.AssetFileByUrlDto(EMPTY_GLTF, "data:"));

            // Assert
            expect(container).toBeInstanceOf(BABYLON.AssetContainer);
            expect(container.scene).toBe(headless.scene);
        });

        it("should hide what it loaded from a url when it was asked to", async () => {
            // Act
            const container = await service.loadAssetContainerFromUrl(
                new Inputs.Asset.AssetFileByUrlDto(ONE_NODE_GLTF, "data:", true));

            // Assert
            expect(container.meshes.every(mesh => mesh.isVisible === false)).toBe(true);
        });
    });

    describe("what a container holds", () => {
        it("should hand out the root node the file hangs off", async () => {
            // Arrange
            const container = await service.loadAssetContainer(
                new Inputs.Asset.AssetFileDto(fileOf(ONE_NODE_GLTF)));

            // Act
            const root = service.getRootNode(new Inputs.BabylonGltf.AssetContainerDto(container));

            // Assert
            expect(root).toBeInstanceOf(BABYLON.TransformNode);
            expect(container.rootNodes).toContain(root);
        });

        it("should hand out the meshes it brought in", async () => {
            // Arrange
            const container = await service.loadAssetContainer(
                new Inputs.Asset.AssetFileDto(fileOf(ONE_NODE_GLTF)));

            // Act
            const meshes = service.getMeshes(new Inputs.BabylonGltf.AssetContainerDto(container));

            // Assert
            expect(meshes).toBe(container.meshes);
        });
    });

    describe("the material variants a file may carry", () => {
        it("should list nothing for a file that carries no variants", async () => {
            // Arrange
            const container = await service.loadAssetContainer(
                new Inputs.Asset.AssetFileDto(fileOf(ONE_NODE_GLTF)));
            const root = service.getRootNode(new Inputs.BabylonGltf.AssetContainerDto(container));

            // Act
            const variants = service.listMaterialVariants(new Inputs.BabylonGltf.GltfRootNodeDto(root));

            // Assert
            expect(variants).toEqual([]);
        });

        it("should refuse to report a selection on a file that carries no variants", async () => {
            // Arrange
            const container = await service.loadAssetContainer(
                new Inputs.Asset.AssetFileDto(fileOf(ONE_NODE_GLTF)));
            const root = service.getRootNode(new Inputs.BabylonGltf.AssetContainerDto(container));

            // Act
            const act = (): string | string[] =>
                service.getSelectedMaterialVariant(new Inputs.BabylonGltf.GltfRootNodeDto(root));

            // Assert
            expect(act).toThrow(/KHR_materials_variants/);
        });

        it("should refuse to reset a file that carries no variants", async () => {
            // Arrange
            const container = await service.loadAssetContainer(
                new Inputs.Asset.AssetFileDto(fileOf(ONE_NODE_GLTF)));
            const root = service.getRootNode(new Inputs.BabylonGltf.AssetContainerDto(container));

            // Act
            const act = (): void => service.resetMaterialVariant(new Inputs.BabylonGltf.GltfRootNodeDto(root));

            // Assert
            expect(act).toThrow(/KHR_materials_variants/);
        });

        it("should refuse to select a variant on a file that carries none", async () => {
            // Arrange
            const container = await service.loadAssetContainer(
                new Inputs.Asset.AssetFileDto(fileOf(ONE_NODE_GLTF)));
            const root = service.getRootNode(new Inputs.BabylonGltf.AssetContainerDto(container));

            // Act
            const act = (): void =>
                service.selectMaterialVariant(new Inputs.BabylonGltf.SelectVariantDto(root, "red"));

            // Assert
            expect(act).toThrow(/KHR_materials_variants/);
        });
    });

    describe("the animations a file may carry", () => {
        it("should hand out the animation groups it brought in", async () => {
            // Arrange
            const container = await service.loadAssetContainer(
                new Inputs.Asset.AssetFileDto(fileOf(ONE_NODE_GLTF)));

            // Act
            const groups = service.getAnimationGroups(new Inputs.BabylonGltf.AssetContainerDto(container));

            // Assert
            expect(groups).toBe(container.animationGroups);
        });

        it("should list the names of the animation groups it brought in", async () => {
            // Arrange
            const container = await service.loadAssetContainer(
                new Inputs.Asset.AssetFileDto(fileOf(ONE_NODE_GLTF)));
            container.animationGroups.push(new BABYLON.AnimationGroup("spin", headless.scene));

            // Act
            const names = service.listAnimationGroupNames(new Inputs.BabylonGltf.AssetContainerDto(container));

            // Assert
            expect(names).toEqual(["spin"]);
        });

        it("should start an animation group at the speed and looping it was given", () => {
            // Arrange
            const group = new BABYLON.AnimationGroup("spin", headless.scene);
            const animation = new BABYLON.Animation("a", "position.x", 30,
                BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
            animation.setKeys([{ frame: 0, value: 0 }, { frame: 30, value: 1 }]);
            group.addTargetedAnimation(animation, new BABYLON.TransformNode("node", headless.scene));

            // Act
            service.playAnimationGroup(new Inputs.BabylonGltf.PlayAnimationGroupDto(group, true, 2));

            // Assert
            expect(group.isPlaying).toBe(true);
            expect(group.speedRatio).toBe(2);
            expect(group.loopAnimation).toBe(true);
        });

        it("should stop an animation group that was playing", () => {
            // Arrange
            const group = new BABYLON.AnimationGroup("spin", headless.scene);
            const animation = new BABYLON.Animation("a", "position.x", 30,
                BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
            animation.setKeys([{ frame: 0, value: 0 }, { frame: 30, value: 1 }]);
            group.addTargetedAnimation(animation, new BABYLON.TransformNode("node", headless.scene));
            service.playAnimationGroup(new Inputs.BabylonGltf.PlayAnimationGroupDto(group, true, 1));

            // Act
            service.stopAnimationGroup(new Inputs.BabylonGltf.AnimationGroupDto(group));

            // Assert
            expect(group.isPlaying).toBe(false);
        });
    });
});
