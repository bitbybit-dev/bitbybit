/* eslint-disable @typescript-eslint/no-namespace */
import * as BABYLON from "@babylonjs/core";

// tslint:disable-next-line: no-namespace
export namespace BabylonIO {
    export class ExportSceneGlbDto {
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
        /**
         * File name that should be used for the scene.
         * @default bitbybit-scene
         */
        fileName = "bitbybit-scene";
    }
    export class ExportMeshToStlDto {
        /**
         * Mesh or meshes to export
         */
        mesh: BABYLON.Mesh;
        /**
         * File name that should be used for the scene.
         * @default bitbybit-mesh
         */
        fileName: string;
    }
}
