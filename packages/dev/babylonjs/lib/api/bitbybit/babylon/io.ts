import * as Inputs from "../../inputs";
import * as SERIALIZERS from "@babylonjs/serializers";
import * as BABYLON from "@babylonjs/core";
import { Context } from "../../context";

export class BabylonIO {

    private supportedFileFormats = [
        "glb", "gltf", "stl", "obj",
    ];
    private objectUrl: string;

    constructor(private readonly context: Context) { }

    /**
     * Imports mesh from the asset that you have uploaded for the project.
     * You must upload your assets to your project via project management page.
     * @returns scene loaded mesh
     * @group load
     * @shortname asset
     */
    async loadAssetIntoScene(inputs: Inputs.Asset.AssetFileDto): Promise<BABYLON.Mesh> {
        const type = inputs.assetFile.name.split(".").pop();

        if (this.supportedFileFormats.includes(type.toLocaleLowerCase())) {
            try {
                return await this.loadAsset("", "", inputs.assetFile, inputs.hidden);
            }
            catch (e) {
                throw Error(e);
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
        this.loadAssetIntoScene(inputs);
    }

    /**
     * Imports mesh from the asset url that you have uploaded to an accessible web storage.
     * Keep in mind that files need to be publically accessible for this to work, be sure that CORS access is enabled for the assets.
     * @returns scene loaded mesh
     * @group load
     * @shortname asset from url
     */
    async loadAssetIntoSceneFromRootUrl(inputs: Inputs.Asset.AssetFileByUrlDto): Promise<BABYLON.Mesh> {
        const type = inputs.assetFile.split(".").pop();

        if (this.supportedFileFormats.includes(type.toLocaleLowerCase())) {
            try {
                return await this.loadAsset("", inputs.rootUrl, inputs.assetFile, inputs.hidden);
            }
            catch (e) {
                throw Error(e);
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
        this.loadAssetIntoSceneFromRootUrl(inputs);
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

        const serializedScene = BABYLON.SceneSerializer.Serialize(this.context.scene);
        this.context.scene.metadata = metadata;
        const strScene = JSON.stringify(serializedScene);

        let filename = inputs.fileName;
        if (filename.toLowerCase().lastIndexOf(".babylon") !== filename.length - 8 || filename.length < 9) {
            filename += ".babylon";
        }

        const blob = new Blob([strScene], { type: "octet/stream" });

        // turn blob into an object URL; saved as a member, so can be cleaned out later
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
        let options;
        if (inputs.discardSkyboxAndGrid) {
            options = {
                shouldExportNode: (m: BABYLON.Node) => {
                    if (m.name !== "bitbybit-hdrSkyBox" && !m.name.includes("bitbybit-ground")) {
                        return true;
                    }
                    return false;
                }
            };
        }
        // we need to handle metadata otherwise gltf files may fail due to circular JSON structures
        const metadata = this.context.scene.metadata;
        delete this.context.scene.metadata;
        SERIALIZERS.GLTF2Export.GLBAsync(this.context.scene, inputs.fileName, options).then((glb) => {
            glb.downloadFiles();
            this.context.scene.metadata = metadata;
        });
    }

    /**
     * Exports the mesh with its children to stl
     * @param inputs filename and the mesh
     * @group export
     * @shortname babylon mesh to stl
     */
    async exportMeshToStl(inputs: Inputs.BabylonIO.ExportMeshToStlDto): Promise<any> {
        const allChildren = inputs.mesh.getChildMeshes();
        let childrenMeshes = [];
        if (allChildren && allChildren.length > 0) {
            childrenMeshes = allChildren.filter(s => !(s instanceof BABYLON.LinesMesh || s instanceof BABYLON.GreasedLineMesh));
        }
        let meshes: BABYLON.Mesh[] = [inputs.mesh, ...childrenMeshes];
        meshes = meshes.filter(m => m.isVisible);
        SERIALIZERS.STLExport.CreateSTL(meshes as BABYLON.Mesh[], true, inputs.fileName, true, true, true);
        return Promise.resolve({});
    }

    /**
   * Exports the meshes to stl
   * @param inputs filename and the mesh
   * @group export
   * @shortname babylon meshes to stl
   */
    async exportMeshesToStl(inputs: Inputs.BabylonIO.ExportMeshesToStlDto): Promise<any> {
        let meshes: BABYLON.Mesh[];
        inputs.meshes.forEach((mesh) => {
            const allChildren = mesh.getChildMeshes();
            let childrenMeshes = [];
            if (allChildren && allChildren.length > 0) {
                childrenMeshes = allChildren.filter(s => !(s instanceof BABYLON.LinesMesh || s instanceof BABYLON.GreasedLineMesh));
            }
            meshes.push(mesh);
            if (childrenMeshes.length > 0) {
                meshes.push(...childrenMeshes);
            }
        });

        SERIALIZERS.STLExport.CreateSTL(meshes as BABYLON.Mesh[], true, inputs.fileName, true, true, true);
        return Promise.resolve({});
    }


    private async loadAsset(meshNames: any, rootUrl: string, fileOrName: string | File, importHidden: boolean): Promise<BABYLON.Mesh> {
        const res = await BABYLON.SceneLoader.ImportMeshAsync("", rootUrl, fileOrName, this.context.scene);
        const sgs = this.context.scene.metadata.shadowGenerators as BABYLON.ShadowGenerator[];
        const container = new BABYLON.Mesh("ImportedMeshContainer" + Math.random(), this.context.scene);
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
                    } catch { }
                    sgs.forEach(sg => {
                        sg.addShadowCaster(mesh);
                    });
                    const children = mesh.getChildMeshes();
                    children.forEach(child => {
                        try {
                            child.receiveShadows = true;
                        } catch { }
                        sgs.forEach(sg => {
                            sg.addShadowCaster(child);
                        });
                    });
                }
            });
        }
        res.meshes.forEach(mesh => {
            mesh.parent = container;
        });
        return container;
    }

}
