/* eslint-disable @typescript-eslint/no-namespace */
import * as BABYLON from "@babylonjs/core";

// tslint:disable-next-line: no-namespace
/**
 * Parameters for glTF and GLB: the file or URL to import, what to do with its nodes, materials,
 * textures and animations, and the options that control export back out.
 */
export namespace BabylonGltf {

    /**
     * Feeds the `babylon.gltf` methods that read a loaded asset container: its root node, meshes
     * and animation groups.
     */
    export class AssetContainerDto {
        constructor(assetContainer?: BABYLON.AssetContainer) {
            if (assetContainer !== undefined) { this.assetContainer = assetContainer; }
        }
        /**
         * The container a glTF or glb load gave back, holding the meshes, materials, animations and
         * root node
         * @default undefined
         */
        assetContainer!: BABYLON.AssetContainer;
    }

    /**
     * Feeds the `babylon.gltf` material variant methods with the root node of a loaded glTF asset,
     * as `getRootNode` reads it.
     */
    export class GltfRootNodeDto {
        constructor(rootNode?: BABYLON.TransformNode) {
            if (rootNode !== undefined) { this.rootNode = rootNode; }
        }
        /**
         * The root transform node of a loaded glTF asset; material variants are looked up from it
         * @default undefined
         */
        rootNode!: BABYLON.TransformNode;
    }

    /**
     * Feeds `babylon.gltf.selectMaterialVariant` with the root node of a loaded glTF asset and the
     * name of the material variant to switch to.
     */
    export class SelectVariantDto {
        constructor(rootNode?: BABYLON.TransformNode, variantName?: string) {
            if (rootNode !== undefined) { this.rootNode = rootNode; }
            if (variantName !== undefined) { this.variantName = variantName; }
        }
        /**
         * The root transform node of a loaded glTF asset that declares material variants
         * @default undefined
         */
        rootNode!: BABYLON.TransformNode;
        /**
         * The variant to activate, one of the names `listMaterialVariants` gives
         * @default undefined
         */
        variantName!: string;
    }

    /**
     * Feeds `babylon.gltf.playAnimationGroup` with the animation to start, whether it repeats and
     * how fast it plays.
     */
    export class PlayAnimationGroupDto {
        constructor(animationGroup?: BABYLON.AnimationGroup, loop?: boolean, speedRatio?: number) {
            if (animationGroup !== undefined) { this.animationGroup = animationGroup; }
            if (loop !== undefined) { this.loop = loop; }
            if (speedRatio !== undefined) { this.speedRatio = speedRatio; }
        }
        /**
         * The animation from a loaded asset, as `getAnimationGroups` lists them
         * @default undefined
         */
        animationGroup!: BABYLON.AnimationGroup;
        /**
         * When true, the animation starts over each time it reaches its end
         * @default true
         */
        loop = true;
        /**
         * Playback speed where 1 is normal, 2 twice as fast and 0.5 half speed
         * @default 1
         * @step 0.1
         */
        speedRatio = 1;
    }

    /**
     * Feeds `babylon.gltf.stopAnimationGroup` with the running animation to stop where it is.
     */
    export class AnimationGroupDto {
        constructor(animationGroup?: BABYLON.AnimationGroup) {
            if (animationGroup !== undefined) { this.animationGroup = animationGroup; }
        }
        /**
         * The animation from a loaded asset, as `getAnimationGroups` lists them
         * @default undefined
         */
        animationGroup!: BABYLON.AnimationGroup;
    }
}
