
import "@babylonjs/loaders";
import { KHR_materials_variants } from "@babylonjs/loaders/glTF/2.0/Extensions/KHR_materials_variants";
import { Context } from "../../../context";
import * as BABYLON from "@babylonjs/core";
import * as Inputs from "../../../inputs";

/**
 * Advanced glTF/glb tooling on top of the basic import/export in io. It keeps the rich asset container instead of
 * collapsing everything into a single mesh, which unlocks KHR_materials_variants, animation groups and other glTF
 * level features that need the loaded asset graph.
 */
export class BabylonGltf {

    constructor(private readonly context: Context) {
    }

    /**
     * Loads a glTF or glb file from a url into the scene and returns the asset container. The container keeps references
     * to the meshes, materials, animation groups and the root node so that features like material variants keep working.
     * @param inputs asset file name and root url
     * @returns Babylon asset container of the loaded gltf
     * @group load
     * @shortname gltf container from url
     */
    async loadAssetContainerFromUrl(inputs: Inputs.Asset.AssetFileByUrlDto): Promise<BABYLON.AssetContainer> {
        const container = await BABYLON.LoadAssetContainerAsync(inputs.rootUrl + inputs.assetFile, this.context.scene);
        this.addContainer(container, inputs.hidden);
        return container;
    }

    /**
     * Loads a glTF or glb file from an uploaded asset file into the scene and returns the asset container.
     * @param inputs asset file
     * @returns Babylon asset container of the loaded glTF
     * @group load
     * @shortname gltf container from file
     */
    async loadAssetContainer(inputs: Inputs.Asset.AssetFileDto): Promise<BABYLON.AssetContainer> {
        const container = await BABYLON.LoadAssetContainerAsync(inputs.assetFile, this.context.scene);
        this.addContainer(container, inputs.hidden);
        return container;
    }

    /**
     * Gets the root transform node of a loaded glTF asset. Material variant operations require this node.
     * @param inputs asset container
     * @returns root transform node
     * @group get
     * @shortname gltf root node
     */
    getRootNode(inputs: Inputs.BabylonGltf.AssetContainerDto): BABYLON.TransformNode {
        return inputs.assetContainer.rootNodes.find(n => n instanceof BABYLON.TransformNode) as BABYLON.TransformNode;
    }

    /**
     * Gets all meshes of a loaded glTF asset container.
     * @param inputs asset container
     * @returns meshes
     * @group get
     * @shortname gltf meshes
     */
    getMeshes(inputs: Inputs.BabylonGltf.AssetContainerDto): BABYLON.AbstractMesh[] {
        return inputs.assetContainer.meshes;
    }

    /**
     * Lists the names of the KHR_materials_variants material variants declared by a loaded glTF asset.
     * @param inputs glTF root node
     * @returns names of available material variants
     * @group variants
     * @shortname list material variants
     */
    listMaterialVariants(inputs: Inputs.BabylonGltf.GltfRootNodeDto): string[] {
        return KHR_materials_variants.GetAvailableVariants(inputs.rootNode);
    }

    /**
     * Activates a KHR_materials_variants material variant by name, swapping the materials of the asset accordingly.
     * @param inputs glTF root node and variant name
     * @group variants
     * @shortname select material variant
     */
    selectMaterialVariant(inputs: Inputs.BabylonGltf.SelectVariantDto): void {
        KHR_materials_variants.SelectVariant(inputs.rootNode, inputs.variantName);
    }

    /**
     * Gets the currently selected KHR_materials_variants material variant of a loaded glTF asset.
     * @param inputs glTF root node
     * @returns name of the selected material variant, or nothing if none is selected
     * @group variants
     * @shortname get selected material variant
     */
    getSelectedMaterialVariant(inputs: Inputs.BabylonGltf.GltfRootNodeDto): string | string[] {
        return KHR_materials_variants.GetLastSelectedVariant(inputs.rootNode);
    }

    /**
     * Resets the materials of a loaded glTF asset back to the original KHR_materials_variants default.
     * @param inputs glTF root node
     * @group variants
     * @shortname reset material variant
     */
    resetMaterialVariant(inputs: Inputs.BabylonGltf.GltfRootNodeDto): void {
        KHR_materials_variants.Reset(inputs.rootNode);
    }

    /**
     * Gets the animation groups of a loaded glTF asset container.
     * @param inputs asset container
     * @returns animation groups
     * @group animations
     * @shortname gltf animation groups
     */
    getAnimationGroups(inputs: Inputs.BabylonGltf.AssetContainerDto): BABYLON.AnimationGroup[] {
        return inputs.assetContainer.animationGroups;
    }

    /**
     * Lists the names of the animation groups of a loaded glTF asset container.
     * @param inputs asset container
     * @returns names of the animation groups
     * @group animations
     * @shortname list animation groups
     */
    listAnimationGroupNames(inputs: Inputs.BabylonGltf.AssetContainerDto): string[] {
        return inputs.assetContainer.animationGroups.map(a => a.name);
    }

    /**
     * Starts playing an animation group of a loaded glTF asset.
     * @param inputs animation group and playback options
     * @group animations
     * @shortname play animation group
     */
    playAnimationGroup(inputs: Inputs.BabylonGltf.PlayAnimationGroupDto): void {
        inputs.animationGroup.speedRatio = inputs.speedRatio;
        inputs.animationGroup.start(inputs.loop, inputs.speedRatio);
    }

    /**
     * Stops an animation group of a loaded glTF asset.
     * @param inputs animation group
     * @group animations
     * @shortname stop animation group
     */
    stopAnimationGroup(inputs: Inputs.BabylonGltf.AnimationGroupDto): void {
        inputs.animationGroup.stop();
    }

    private addContainer(container: BABYLON.AssetContainer, hidden: boolean): void {
        container.addAllToScene();
        const sgs = this.context.scene.metadata?.shadowGenerators as BABYLON.ShadowGenerator[];
        container.meshes.forEach(mesh => {
            mesh.isPickable = false;
            if (hidden) {
                mesh.isVisible = false;
            }
            if (sgs && sgs.length > 0) {
                try {
                    mesh.receiveShadows = true;
                } catch { /* some meshes do not support receiving shadows */ }
                sgs.forEach(sg => sg.addShadowCaster(mesh));
            }
        });
    }
}
