/* eslint-disable @typescript-eslint/no-namespace */
import * as BABYLON from "@babylonjs/core";

// tslint:disable-next-line: no-namespace
export namespace BabylonIO {
    export class ExportSceneGlbDto {
        constructor(fileName?: string, discardSkyboxAndGrid?: boolean) {
            if (fileName !== undefined) { this.fileName = fileName; }
            if (discardSkyboxAndGrid !== undefined) { this.discardSkyboxAndGrid = discardSkyboxAndGrid; }
        }
        /**
         * File name that should be used for the scene.
         * @default bitbybit-scene
         */
        fileName = "bitbybit-scene";
        /**
         * Discard skybox and grid
         * @default false
         * @optional true
         */
        discardSkyboxAndGrid? = false;
    }
    export class ExportSceneDto {
        constructor(fileName?: string) {
            if (fileName !== undefined) { this.fileName = fileName; }
        }
        /**
         * File name that should be used for the scene.
         * @default bitbybit-scene
         */
        fileName = "bitbybit-scene";
    }
    export class ExportMeshToStlDto {
        constructor(mesh?: BABYLON.Mesh, fileName?: string) {
            if (mesh !== undefined) { this.mesh = mesh; }
            if (fileName !== undefined) { this.fileName = fileName; }
        }
        /**
         * Mesh to export
         */
        mesh: BABYLON.Mesh;
        /**
         * File name that should be used for the scene.
         * @default bitbybit-mesh
         */
        fileName: string;
    }
    export class ExportMeshesToStlDto {
        constructor(meshes?: BABYLON.Mesh[], fileName?: string) {
            if (meshes !== undefined) { this.meshes = meshes; }
            if (fileName !== undefined) { this.fileName = fileName; }
        }
        /**
         * Meshes to export
         */
        meshes: BABYLON.Mesh[];
        /**
         * File name that should be used for the scene.
         * @default bitbybit-mesh
         */
        fileName: string;
    }
}
