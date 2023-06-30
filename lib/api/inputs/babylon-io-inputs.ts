/* eslint-disable @typescript-eslint/no-namespace */
import { Mesh } from "@babylonjs/core";

// tslint:disable-next-line: no-namespace
export namespace BabylonIO {
    export class ExportSceneDto {
        /**
         * File name that should be used for the scene.
         * @default bitbybit-scene
         */
        filename = "bitbybit-scene";
    }
    export class ExportMeshToStlDto {
        /**
         * Mesh or meshes to export
         */
        mesh: Mesh;
        /**
         * File name that should be used for the scene.
         * @default bitbybit-mesh
         */
        filename: string;
    }
}
