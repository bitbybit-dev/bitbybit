import { Injectable } from "@angular/core";
import * as Inputs from '../../inputs/inputs';
import { GLTF2Export } from '@babylonjs/serializers/glTF/2.0';
import { MeshBuilder, SceneLoader, SceneSerializer, ShadowGenerator } from "@babylonjs/core";
import { Context } from "../../context";


export class BabylonIO {

    private supportedFileFormats = [
        'glb', 'GLB', 'stl', 'STL', 'obj', 'OBJ',
    ]
    private objectUrl: string;

    constructor(private readonly context: Context) { }

    /**
     * Imports mesh from the asset that you have uploaded for the project. You must upload your assets to your project via project management page.
     * <div>
     *  <img src="../assets/images/blockly-images/babylon/io/loadAssetIntoScene1.svg" alt="Blockly Image"/>
     *  <img src="../assets/images/blockly-images/babylon/io/loadAssetIntoScene2.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_babylon_io.BabylonIO.html#loadAssetIntoScene
     * @param inputs
     * @returns scene loaded mesh
     */
     async loadAssetIntoScene(inputs: Inputs.Asset.AssetFileDto): Promise<any> {
        const type = inputs.assetFile.name.split('.').pop();

        if (this.supportedFileFormats.includes(type)) {
            try {
                const res = await SceneLoader.ImportMeshAsync('', '', inputs.assetFile, this.context.scene);
             
                const sgs = this.context.scene.metadata.shadowGenerators as ShadowGenerator[];
                const container = MeshBuilder.CreateBox('ImportedMeshContainer' + Math.random(), { size: 0.000001 }, this.context.scene);
                if (sgs.length > 0) {
                    res.meshes.forEach(mesh => {
                        if (this.context.scene.metadata.shadowGenerators.length > 0) {
                            mesh.receiveShadows = true;
                            sgs.forEach(sg => {
                                sg.addShadowCaster(mesh);
                            })
                            const children = mesh.getChildMeshes();
                            children.forEach(child => {
                                child.receiveShadows = true;
                                sgs.forEach(sg => {
                                    sg.addShadowCaster(child);
                                })
                            })
                        }
                    })
                }
                res.meshes.forEach(mesh => {
                    mesh.parent = container;
                })
                return container;
            }
            catch (e) {
                throw Error(e);
            }
        } else {
            throw Error(`Unsupported file format detected: ${type}`);
        }
    }

    /**
     * Exports the whole scene to .babylon scene format. You can then edit it further in babylonjs editors.
     * <div>
     *  <img src="../assets/images/blockly-images/babylon/io/exportBabylon.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_babylon_io.BabylonIO.html#exportBabylon
     * @param inputs filename
     */
    exportBabylon(inputs: Inputs.BabylonIO.ExportSceneDto) {
        const metadata = this.context.scene.metadata;
        this.context.scene.metadata = undefined;
        console.log(metadata);
        if (this.objectUrl) {
            window.URL.revokeObjectURL(this.objectUrl);
        }

        var serializedScene = SceneSerializer.Serialize(this.context.scene);
        this.context.scene.metadata = metadata;
        this.context.scene.metadata;
        var strScene = JSON.stringify(serializedScene);

        let filename = inputs.filename;
        if (filename.toLowerCase().lastIndexOf(".babylon") !== filename.length - 8 || filename.length < 9) {
            filename += ".babylon";
        }

        var blob = new Blob([strScene], { type: "octet/stream" });

        // turn blob into an object URL; saved as a member, so can be cleaned out later
        this.objectUrl = (window.webkitURL || window.URL).createObjectURL(blob);

        const fileLink = document.createElement('a');
        fileLink.href = this.objectUrl;
        fileLink.target = '_self';
        fileLink.download = filename;
        fileLink.click();
        fileLink.remove();
    }

    /**
     * Exports the whole scene to .glb format. This file format has become industry standard for web models.
     * <div>
     *  <img src="../assets/images/blockly-images/babylon/io/exportBabylon.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_babylon_io.BabylonIO.html#exportBabylon
     * @param inputs filename
     */
    exportGLB(inputs: Inputs.BabylonIO.ExportSceneDto) {
        GLTF2Export.GLBAsync(this.context.scene, inputs.filename).then((glb) => {
            glb.downloadFiles();
        });
    }
}