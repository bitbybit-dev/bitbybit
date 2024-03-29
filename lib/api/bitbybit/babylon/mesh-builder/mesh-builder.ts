
import { Context } from "../../../context";
import * as BABYLON from "@babylonjs/core";
import * as Inputs from "../../../inputs/inputs";
import { BabylonMesh } from "../mesh";

export class BabylonMeshBuilder {

    constructor(private readonly context: Context, private readonly mesh: BabylonMesh) {
    }

    /**
     * Creates a box mesh
     * @param inputs required to set up basic box
     * @returns Babylon mesh
     * @group create simple
     * @shortname box
     * @disposableOutput true
     */
    createBox(inputs: Inputs.BabylonMeshBuilder.CreateBoxDto): BABYLON.Mesh {
        const mesh = BABYLON.MeshBuilder.CreateBox("BabylonMesh" + Math.random(), {
            width: inputs.width,
            height: inputs.height,
            depth: inputs.depth,
            sideOrientation: this.mesh.getSideOrientation(inputs.sideOrientation),
        }, this.context.scene);
        this.enableShadows(mesh);
        return mesh;
    }

    /**
     * Creates a cube mesh
     * @param inputs required to set up basic cube
     * @returns Babylon mesh
     * @group create simple
     * @shortname cube
     * @disposableOutput true
     */
    createCube(inputs: Inputs.BabylonMeshBuilder.CreateCubeDto): BABYLON.Mesh {
        const mesh = BABYLON.MeshBuilder.CreateBox("BabylonMesh" + Math.random(), {
            size: inputs.size,
            sideOrientation: this.mesh.getSideOrientation(inputs.sideOrientation),
        }, this.context.scene);
        this.enableShadows(mesh);
        return mesh;
    }

    /**
     * Creates a square plane mesh
     * @param inputs required to set up basic cube
     * @returns Babylon mesh
     * @group create simple
     * @shortname square plane
     * @disposableOutput true
     */
    createSquarePlane(inputs: Inputs.BabylonMeshBuilder.CreateSquarePlaneDto): BABYLON.Mesh {
        const mesh = BABYLON.MeshBuilder.CreatePlane("BabylonMesh" + Math.random(), {
            size: inputs.size,
            sideOrientation: this.mesh.getSideOrientation(inputs.sideOrientation),
        }, this.context.scene);
        this.enableShadows(mesh);
        return mesh;
    }

    /**
     * Creates a rectangle plane mesh
     * @param inputs required to set up basic cube
     * @returns Babylon mesh
     * @group create simple
     * @shortname rectangle plane
     * @disposableOutput true
     */
    createRectanglePlane(inputs: Inputs.BabylonMeshBuilder.CreateRectanglePlaneDto): BABYLON.Mesh {
        const mesh = BABYLON.MeshBuilder.CreatePlane("BabylonMesh" + Math.random(), {
            width: inputs.width,
            height: inputs.height,
            sideOrientation: this.mesh.getSideOrientation(inputs.sideOrientation),
        }, this.context.scene);
        this.enableShadows(mesh);
        return mesh;
    }

    private enableShadows(mesh: BABYLON.Mesh) {
        if (this.context.scene.metadata.shadowGenerators) {
            mesh.receiveShadows = true;
            const sgs = this.context.scene.metadata.shadowGenerators as BABYLON.ShadowGenerator[];
            sgs.forEach(s => {
                s.addShadowCaster(mesh);
            });
        }
    }

}
