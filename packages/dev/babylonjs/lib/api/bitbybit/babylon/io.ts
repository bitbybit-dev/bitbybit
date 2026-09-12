import * as Inputs from "../../inputs";
import { uniqueName } from "../../unique-name";
import * as SERIALIZERS from "@babylonjs/serializers";
import * as BABYLON from "@babylonjs/core";
import { Context } from "../../context";

/**
 * Loading models into the scene and exporting it: glTF, glb, STL and OBJ files come in from a File,
 * a URL or raw glb bytes as one container mesh with their children under it, and the whole scene or
 * chosen meshes go out as .babylon, glb or STL downloads.
 */
export class BabylonIO {

    private supportedFileFormats = [
        "glb", "gltf", "stl", "obj",
    ];
    private objectUrl!: string;

    constructor(private readonly context: Context) { }

    /**
     * Loads a glTF, glb, STL or OBJ model from a File into the scene and gives back a container
     * mesh with the model's meshes as its children; any other extension throws an error.
     *
     * The loaded meshes cast and receive shadows and start hidden when `hidden` is true.
     * @param inputs - The model file and whether it starts hidden
     * @returns The container mesh holding the loaded model
     * @group load
     * @shortname asset
     * @drawable true
     * @example
     * ```typescript
     * const file = await bitbybit.asset.getFile({ fileName: "chair.glb" });
     * const model = await bitbybit.babylon.io.loadAssetIntoScene({ assetFile: file, hidden: false });
     * ```
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
     * Loads a glTF, glb, STL or OBJ model from a File into the scene, as `loadAssetIntoScene` does,
     * without giving the mesh back.
     * @param inputs - The model file and whether it starts hidden
     * @group load
     * @shortname asset
     * @example
     * ```typescript
     * const file = await bitbybit.asset.getFile({ fileName: "chair.glb" });
     * await bitbybit.babylon.io.loadAssetIntoSceneNoReturn({ assetFile: file, hidden: false });
     * ```
     */
    async loadAssetIntoSceneNoReturn(inputs: Inputs.Asset.AssetFileDto): Promise<void> {
        await this.loadAssetIntoScene(inputs);
    }

    /**
     * Loads a glTF, glb, STL or OBJ model from a web address into the scene and gives back a
     * container mesh with the model's meshes as its children.
     *
     * `rootUrl` is the folder and `assetFile` the file name in it, so textures beside the model
     * resolve too; the server must allow cross-origin requests.
     * @param inputs - The folder URL, the file name and whether it starts hidden
     * @returns The container mesh holding the loaded model
     * @group load
     * @shortname asset from url
     * @drawable true
     * @example
     * ```typescript
     * const model = await bitbybit.babylon.io.loadAssetIntoSceneFromRootUrl({ rootUrl: "https://example.com/models/", assetFile: "chair.glb", hidden: false });
     * ```
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
     * Loads a model from a web address into the scene, as `loadAssetIntoSceneFromRootUrl` does,
     * without giving the mesh back.
     * @param inputs - The folder URL, the file name and whether it starts hidden
     * @group load
     * @shortname asset from url
     * @example
     * ```typescript
     * await bitbybit.babylon.io.loadAssetIntoSceneFromRootUrlNoReturn({ rootUrl: "https://example.com/models/", assetFile: "chair.glb", hidden: false });
     * ```
     */
    async loadAssetIntoSceneFromRootUrlNoReturn(inputs: Inputs.Asset.AssetFileByUrlDto): Promise<void> {
        await this.loadAssetIntoSceneFromRootUrl(inputs);
    }
    /**
     * Loads a glb model held as bytes into the scene, such as the output of
     * `occt.io.convertStepToGltf`, and gives back a container mesh with the model's meshes as its
     * children.
     * @param inputs - The glb bytes, a name for the model and whether it starts hidden
     * @returns The container mesh holding the loaded model
     * @group load
     * @shortname glb from array buffer
     * @drawable true
     * @example
     * ```typescript
     * const glb = await bitbybit.occt.io.convertStepToGltf({ stepData: file, meshPrecision: 0.005, meshAngle: 0.5, meshRelative: true, internalVerticesMode: false, controlSurfaceDeflection: false });
     * const model = await bitbybit.babylon.io.loadGlbFromArrayBuffer({ glbData: glb, fileName: "part.glb", hidden: false });
     * ```
     */
    async loadGlbFromArrayBuffer(inputs: Inputs.Asset.AssetGlbDataDto): Promise<BABYLON.Mesh> {
        const buffer = inputs.glbData.buffer.slice(inputs.glbData.byteOffset, inputs.glbData.byteOffset + inputs.glbData.byteLength) as ArrayBuffer;
        const blob = new Blob([buffer], { type: "model/gltf-binary" });
        const file = new File([blob], inputs.fileName, { type: "model/gltf-binary" });
        return await this.loadAsset("", "", file, inputs.hidden);
    }

    /**
     * Loads a glb model held as bytes into the scene, as `loadGlbFromArrayBuffer` does, without
     * giving the mesh back.
     * @param inputs - The glb bytes, a name for the model and whether it starts hidden
     * @group load
     * @shortname glb from array buffer no return
     * @drawable true
     * @example
     * ```typescript
     * await bitbybit.babylon.io.loadGlbFromArrayBufferNoReturn({ glbData: glb, fileName: "part.glb", hidden: false });
     * ```
     */
    async loadGlbFromArrayBufferNoReturn(inputs: Inputs.Asset.AssetGlbDataDto): Promise<void> {
        await this.loadGlbFromArrayBuffer(inputs);
    }

    /**
     * Downloads the whole scene as a `.babylon` file, the engine's own JSON format that its editors
     * and loaders read back; the extension is added when missing.
     * @param inputs - The file name
     * @group export
     * @shortname babylon scene
     * @example
     * ```typescript
     * bitbybit.babylon.io.exportBabylon({ fileName: "my-scene" });
     * ```
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
     * Downloads the whole scene as a glb file, the binary glTF that most 3D tools and web viewers
     * read; `discardSkyboxAndGrid` leaves out the skybox and ground this library adds.
     * @param inputs - The file name and whether to leave out the skybox and ground
     * @group export
     * @shortname gltf scene
     * @example
     * ```typescript
     * bitbybit.babylon.io.exportGLB({ fileName: "my-scene", discardSkyboxAndGrid: true });
     * ```
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
     * Downloads a mesh and its visible child meshes as one STL file, the plain triangle format 3D
     * printers take; lines are left out.
     * @param inputs - The mesh and the file name
     * @returns An empty object once the download has started
     * @group export
     * @shortname babylon mesh to stl
     * @example
     * ```typescript
     * await bitbybit.babylon.io.exportMeshToStl({ mesh, fileName: "part" });
     * ```
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
     * Downloads several meshes, with their child meshes, as one STL file; lines are left out.
     * @param inputs - The meshes and the file name
     * @returns An empty object once the download has started
     * @group export
     * @shortname babylon meshes to stl
     * @example
     * ```typescript
     * await bitbybit.babylon.io.exportMeshesToStl({ meshes: [meshA, meshB], fileName: "parts" });
     * ```
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
