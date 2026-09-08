import * as Inputs from "../../inputs";
import { uniqueName } from "../../unique-name";
import * as SERIALIZERS from "@babylonjs/serializers";
import * as BABYLON from "@babylonjs/core";
import { Context } from "../../context";

export class BabylonIO {

    private supportedFileFormats = [
        "glb", "gltf", "stl", "obj",
    ];
    private objectUrl!: string;

    constructor(private readonly context: Context) { }

    /**
     * Imports mesh from the asset that you have uploaded for the project.
     * You must upload your assets to your project via project management page.
     * @returns scene loaded mesh
     * @group load
     * @shortname asset
     * @drawable true
     */
    async loadAssetIntoScene(inputs: Inputs.Asset.AssetFileDto): Promise<BABYLON.Mesh> {
        const type = inputs.assetFile.name.split(".").pop()!;

        if (this.supportedFileFormats.includes(type.toLocaleLowerCase())) {
            try {
                return await this.loadAsset("", "", inputs.assetFile, inputs.hidden);
            }
            catch (e) {
                throw new Error(String(e), { cause: e });
            }
        } else {
            throw Error(`Unsupported file format detected: ${type}`);
        }
    }

    /**
     * Imports mesh from the asset that you have uploaded for the project.
     * You must upload your assets to your project via project management page.
     * @returns scene loaded mesh
     * @group load
     * @shortname asset
     */
    async loadAssetIntoSceneNoReturn(inputs: Inputs.Asset.AssetFileDto): Promise<void> {
        await this.loadAssetIntoScene(inputs);
    }

    /**
     * Imports mesh from the asset url that you have uploaded to an accessible web storage.
     * Keep in mind that files need to be publically accessible for this to work, be sure that CORS access is enabled for the assets.
     * @returns scene loaded mesh
     * @group load
     * @shortname asset from url
     * @drawable true
     */
    async loadAssetIntoSceneFromRootUrl(inputs: Inputs.Asset.AssetFileByUrlDto): Promise<BABYLON.Mesh> {
        const type = inputs.assetFile.split(".").pop()!;

        if (this.supportedFileFormats.includes(type.toLocaleLowerCase())) {
            try {
                return await this.loadAsset("", inputs.rootUrl, inputs.assetFile, inputs.hidden);
            }
            catch (e) {
                throw new Error(String(e), { cause: e });
            }
        } else {
            throw Error(`Unsupported file format detected: ${type}`);
        }
    }
    /**
     * Imports mesh from the asset url that you have uploaded to an accessible web storage.
     * Keep in mind that files need to be publically accessible for this to work, be sure that CORS access is enabled for the assets.
     * @returns scene loaded mesh
     * @group load
     * @shortname asset from url
     */
    async loadAssetIntoSceneFromRootUrlNoReturn(inputs: Inputs.Asset.AssetFileByUrlDto): Promise<void> {
        await this.loadAssetIntoSceneFromRootUrl(inputs);
    }
    /**
     * Loads GLB binary data directly into the scene from a Uint8Array.
     * This is useful when you have GLB data from sources like OCCT's convertStepToGltf method.
     * @param inputs GLB data as Uint8Array and optional configuration
     * @returns scene loaded mesh
     * @group load
     * @shortname glb from array buffer
     * @drawable true
     */
    async loadGlbFromArrayBuffer(inputs: Inputs.Asset.AssetGlbDataDto): Promise<BABYLON.Mesh> {
        const buffer = inputs.glbData.buffer.slice(inputs.glbData.byteOffset, inputs.glbData.byteOffset + inputs.glbData.byteLength) as ArrayBuffer;
        const blob = new Blob([buffer], { type: "model/gltf-binary" });
        const file = new File([blob], inputs.fileName, { type: "model/gltf-binary" });
        return await this.loadAsset("", "", file, inputs.hidden);
    }

    /**
     * Loads GLB binary data directly into the scene from a Uint8Array without returning the mesh.
     * This is useful when you have GLB data from sources like OCCT's convertStepToGltf method.
     * @param inputs GLB data as Uint8Array and optional configuration
     * @group load
     * @shortname glb from array buffer no return
     * @drawable true
     */
    async loadGlbFromArrayBufferNoReturn(inputs: Inputs.Asset.AssetGlbDataDto): Promise<void> {
        await this.loadGlbFromArrayBuffer(inputs);
    }

    /**
     * Exports the whole scene to .babylon scene format. You can then edit it further in babylonjs editors.
     * @param inputs filename
     * @group export
     * @shortname babylon scene
     */
    exportBabylon(inputs: Inputs.BabylonIO.ExportSceneDto): void {
        const metadata = this.context.scene.metadata;
        this.context.scene.metadata = undefined;
        if (this.objectUrl) {
            window.URL.revokeObjectURL(this.objectUrl);
        }

        let strScene: string;
        try {
            strScene = JSON.stringify(BABYLON.SceneSerializer.Serialize(this.context.scene));
        } finally {
            this.context.scene.metadata = metadata;
        }

        let filename = inputs.fileName;
        if (filename.toLowerCase().lastIndexOf(".babylon") !== filename.length - 8 || filename.length < 9) {
            filename += ".babylon";
        }

        const blob = new Blob([strScene], { type: "octet/stream" });

        this.objectUrl = (window.webkitURL || window.URL).createObjectURL(blob);

        const fileLink = document.createElement("a");
        fileLink.href = this.objectUrl;
        fileLink.target = "_self";
        fileLink.download = filename;
        fileLink.click();
        fileLink.remove();
    }

    /**
     * Exports the whole scene to .glb format. This file format has become industry standard for web models.
     * @param inputs filename
     * @group export
     * @shortname gltf scene
     */
    exportGLB(inputs: Inputs.BabylonIO.ExportSceneGlbDto): void {
        const options: SERIALIZERS.IExportOptions = {
            metadataSelector: (metadata: { gltf?: { extras?: unknown } } | undefined) => metadata?.gltf?.extras,
        };
        if (inputs.discardSkyboxAndGrid) {
            options.shouldExportNode = (m: BABYLON.Node) => m.name !== "bitbybit-hdrSkyBox" && !m.name.includes("bitbybit-ground");
        }
        SERIALIZERS.GLTF2Export.GLBAsync(this.context.scene, inputs.fileName, options)
            .then((glb) => glb.downloadFiles())
            .catch((error: unknown) => console.error(`Failed to export the scene to ${inputs.fileName}:`, error));
    }

    /**
     * Exports the mesh with its children to stl
     * @param inputs filename and the mesh
     * @group export
     * @shortname babylon mesh to stl
     */
    async exportMeshToStl(inputs: Inputs.BabylonIO.ExportMeshToStlDto): Promise<any> {
        const allChildren = inputs.mesh.getChildMeshes();
        let childrenMeshes: BABYLON.Mesh[] = [];
        if (allChildren && allChildren.length > 0) {
            childrenMeshes = allChildren.filter(s => !(s instanceof BABYLON.LinesMesh || s instanceof BABYLON.GreasedLineMesh)) as BABYLON.Mesh[];
        }
        let meshes: BABYLON.Mesh[] = [inputs.mesh, ...childrenMeshes];
        meshes = meshes.filter(m => m.isVisible);
        SERIALIZERS.STLExport.CreateSTL(meshes, true, inputs.fileName, true, true, true);
        return Promise.resolve({});
    }

    /**
   * Exports the meshes to stl
   * @param inputs filename and the mesh
   * @group export
   * @shortname babylon meshes to stl
   */
    async exportMeshesToStl(inputs: Inputs.BabylonIO.ExportMeshesToStlDto): Promise<any> {
        const meshes: BABYLON.Mesh[] = [];
        inputs.meshes.forEach((mesh) => {
            const allChildren = mesh.getChildMeshes();
            let childrenMeshes: BABYLON.Mesh[] = [];
            if (allChildren && allChildren.length > 0) {
                childrenMeshes = allChildren.filter(s => !(s instanceof BABYLON.LinesMesh || s instanceof BABYLON.GreasedLineMesh)) as BABYLON.Mesh[];
            }
            meshes.push(mesh);
            if (childrenMeshes.length > 0) {
                meshes.push(...childrenMeshes);
            }
        });

        SERIALIZERS.STLExport.CreateSTL(meshes, true, inputs.fileName, true, true, true);
        return Promise.resolve({});
    }

    private async loadAsset(_meshNames: any, rootUrl: string, fileOrName: string | File, importHidden: boolean): Promise<BABYLON.Mesh> {
        const res = await BABYLON.SceneLoader.ImportMeshAsync("", rootUrl, fileOrName, this.context.scene);
        const sgs = this.context.scene.metadata.shadowGenerators as BABYLON.ShadowGenerator[];
        const container = new BABYLON.Mesh(uniqueName("ImportedMeshContainer"), this.context.scene);
        if (sgs.length > 0) {
            res.meshes.forEach(mesh => {
                mesh.isPickable = false;
                if (importHidden) {
                    mesh.isVisible = false;
                }
                const children = mesh.getChildMeshes();
                children.forEach(c => {
                    c.isPickable = false;
                    if (importHidden) {
                        c.isVisible = false;
                    }
                });
                if (this.context.scene.metadata.shadowGenerators.length > 0) {
                    try {
                        mesh.receiveShadows = true;
                    } catch {
                        // A loaded mesh without a material cannot receive shadows; the rest of the
                        // scene setup should still run.
                    }
                    sgs.forEach(sg => {
                        sg.addShadowCaster(mesh);
                    });
                    const children = mesh.getChildMeshes();
                    children.forEach(child => {
                        try {
                            child.receiveShadows = true;
                        } catch {
                            // As above, for a child of the loaded mesh.
                        }
                        sgs.forEach(sg => {
                            sg.addShadowCaster(child);
                        });
                    });
                }
            });
        }
        const root = res.meshes.find(m => m.name === "__root__")!;
        root.parent = container;
        return container;
    }

}
