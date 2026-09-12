/* eslint-disable @typescript-eslint/no-namespace */
import * as BABYLON from "@babylonjs/core";

// tslint:disable-next-line: no-namespace
/**
 * Parameters for engine-level import and export: the objects to write, the target format, and the
 * settings applied when reading a file back into the scene.
 */
export namespace BabylonIO {
    /**
     * Feeds `babylon.io.exportGLB` with the file name and whether to leave out the skybox and
     * ground this library adds.
     */
    export class ExportSceneGlbDto {
        constructor(fileName?: string, discardSkyboxAndGrid?: boolean) {
            if (fileName !== undefined) { this.fileName = fileName; }
            if (discardSkyboxAndGrid !== undefined) { this.discardSkyboxAndGrid = discardSkyboxAndGrid; }
        }
        /**
         * Name of the downloaded glb file, without the extension
         * @default bitbybit-scene
         */
        fileName = "bitbybit-scene";
        /**
         * When true, the skybox and ground meshes this library adds are left out of the file
         * @default false
         * @optional true
         */
        discardSkyboxAndGrid?: boolean | undefined = false;
    }
    /**
     * Feeds `babylon.io.exportBabylon` with the name of the downloaded `.babylon` file.
     */
    export class ExportSceneDto {
        constructor(fileName?: string) {
            if (fileName !== undefined) { this.fileName = fileName; }
        }
        /**
         * Name of the downloaded file; `.babylon` is added when missing
         * @default bitbybit-scene
         */
        fileName = "bitbybit-scene";
    }
    /**
     * Feeds `babylon.io.exportMeshToStl` with the mesh to write, with its visible children, and the
     * file name.
     */
    export class ExportMeshToStlDto {
        constructor(mesh?: BABYLON.Mesh, fileName?: string) {
            if (mesh !== undefined) { this.mesh = mesh; }
            if (fileName !== undefined) { this.fileName = fileName; }
        }
        /**
         * The mesh written to the file together with its visible child meshes; lines are left out
         */
        mesh!: BABYLON.Mesh;
        /**
         * Name of the downloaded STL file
         * @default bitbybit-mesh
         */
        fileName = "bitbybit-mesh";
    }
    /**
     * Feeds `babylon.io.exportMeshesToStl` with the meshes to write into one file and the file
     * name.
     */
    export class ExportMeshesToStlDto {
        constructor(meshes?: BABYLON.Mesh[], fileName?: string) {
            if (meshes !== undefined) { this.meshes = meshes; }
            if (fileName !== undefined) { this.fileName = fileName; }
        }
        /**
         * The meshes written to the file, each with its child meshes; lines are left out
         */
        meshes!: BABYLON.Mesh[];
        /**
         * Name of the downloaded STL file
         * @default bitbybit-mesh
         */
        fileName = "bitbybit-mesh";
    }
}
