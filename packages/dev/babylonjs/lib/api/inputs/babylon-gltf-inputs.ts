/* eslint-disable @typescript-eslint/no-namespace */
import * as BABYLON from "@babylonjs/core";

// tslint:disable-next-line: no-namespace
export namespace BabylonGltf {

    export class AssetContainerDto {
        constructor(assetContainer?: BABYLON.AssetContainer) {
            if (assetContainer !== undefined) { this.assetContainer = assetContainer; }
        }
        /**
         * Asset container produced when loading a glTF or glb file. Holds the meshes, materials, animations and the root node.
         * @default undefined
         */
        assetContainer: BABYLON.AssetContainer;
    }

    export class GltfRootNodeDto {
        constructor(rootNode?: BABYLON.TransformNode) {
            if (rootNode !== undefined) { this.rootNode = rootNode; }
        }
        /**
         * Root transform node of a loaded glTF asset. Material variants and other glTF level operations work on this node.
         * @default undefined
         */
        rootNode: BABYLON.TransformNode;
    }

    export class SelectVariantDto {
        constructor(rootNode?: BABYLON.TransformNode, variantName?: string) {
            if (rootNode !== undefined) { this.rootNode = rootNode; }
            if (variantName !== undefined) { this.variantName = variantName; }
        }
        /**
         * Root transform node of a loaded glTF asset that declares KHR_materials_variants.
         * @default undefined
         */
        rootNode: BABYLON.TransformNode;
        /**
         * Name of the material variant to activate. Use list material variants to discover the available names.
         * @default undefined
         */
        variantName: string;
    }

    export class PlayAnimationGroupDto {
        constructor(animationGroup?: BABYLON.AnimationGroup, loop?: boolean, speedRatio?: number) {
            if (animationGroup !== undefined) { this.animationGroup = animationGroup; }
            if (loop !== undefined) { this.loop = loop; }
            if (speedRatio !== undefined) { this.speedRatio = speedRatio; }
        }
        /**
         * Animation group to play.
         * @default undefined
         */
        animationGroup: BABYLON.AnimationGroup;
        /**
         * Loop the animation.
         * @default true
         */
        loop = true;
        /**
         * Playback speed ratio where 1 is normal speed.
         * @default 1
         * @step 0.1
         */
        speedRatio = 1;
    }

    export class AnimationGroupDto {
        constructor(animationGroup?: BABYLON.AnimationGroup) {
            if (animationGroup !== undefined) { this.animationGroup = animationGroup; }
        }
        /**
         * Animation group to operate on.
         * @default undefined
         */
        animationGroup: BABYLON.AnimationGroup;
    }
}
