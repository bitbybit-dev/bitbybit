import { Mesh } from "@babylonjs/core";

// tslint:disable-next-line: no-namespace
export namespace BabylonIO {
    export class ExportSceneDto {
        /**
         * File name that should be used for the scene.
         */
        filename: string;
    }
    export class ExportMeshToStlDto {
        /**
         * Mesh or meshes to export
         */
        mesh: Mesh;
        /**
         * File name that should be used for the scene.
         */
        filename: string;
    }
}
