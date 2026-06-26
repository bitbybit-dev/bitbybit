
import { Context } from "../../../context";
import * as BABYLON from "@babylonjs/core";
import * as Inputs from "../../../inputs";

export class BabylonDecal {

    constructor(private readonly context: Context) {
    }

    /**
     * Creates a geometry decal that projects an image onto a mesh. The decal is a clipped child mesh that hugs the
     * surface of the source mesh, which makes it work with any material and on any static mesh. It adds geometry, so
     * for deforming meshes or many accumulating decals prefer the decal map approach instead.
     * @param inputs source mesh, image texture and projection parameters
     * @returns Babylon mesh representing the decal, parented to the source mesh
     * @group create
     * @shortname mesh decal
     * @disposableOutput true
     * @drawable true
     */
    createMeshDecal(inputs: Inputs.BabylonDecal.CreateMeshDecalDto): BABYLON.Mesh {
        const decal = BABYLON.MeshBuilder.CreateDecal("Decal" + Math.random(), inputs.sourceMesh, {
            position: new BABYLON.Vector3(...inputs.position),
            normal: new BABYLON.Vector3(...inputs.normal),
            size: new BABYLON.Vector3(...inputs.size),
            angle: inputs.angle,
            cullBackFaces: inputs.cullBackFaces,
            localMode: inputs.localMode,
        });

        const material = new BABYLON.StandardMaterial("DecalMaterial" + Math.random(), this.context.scene);
        material.diffuseTexture = inputs.texture as BABYLON.Texture;
        material.diffuseTexture.hasAlpha = true;
        material.useAlphaFromDiffuseTexture = true;
        material.zOffset = inputs.zOffset;
        material.backFaceCulling = inputs.cullBackFaces;
        decal.material = material;

        // keep the decal glued to the source mesh as it moves
        decal.setParent(inputs.sourceMesh);
        decal.isPickable = false;
        decal.metadata = { shadows: false };
        return decal;
    }

    /**
     * Enables a UV-space decal map on a mesh and turns on the decal map plugin of its material. Unlike geometry decals
     * this projects images directly into the mesh texture space, so no geometry is added, decals follow deformation and
     * multiple projections accumulate into a single map. The mesh must have proper, non-overlapping UV coordinates.
     * @param inputs mesh, its material and the resolution of the decal map
     * @returns Babylon decal map renderer used to project images
     * @group create
     * @shortname enable decal map
     * @disposableOutput true
     */
    enableDecalMap(inputs: Inputs.BabylonDecal.EnableDecalMapDto): BABYLON.MeshUVSpaceRenderer {
        const renderer = new BABYLON.MeshUVSpaceRenderer(inputs.mesh, this.context.scene, {
            width: inputs.width,
            height: inputs.height,
        });
        inputs.mesh.decalMap = renderer;
        // the material decal map plugin reads the map produced by the renderer and blends it in the shader
        const material = inputs.material as BABYLON.Material & { decalMap?: { isEnabled: boolean } };
        if (material.decalMap) {
            material.decalMap.isEnabled = true;
        }
        return renderer;
    }

    /**
     * Projects an image into a decal map. Each call adds the image at the given location, accumulating onto previously
     * projected decals. Use it together with a decal map enabled on the mesh.
     * @param inputs decal map renderer, image texture and projection parameters
     * @group update
     * @shortname project decal
     */
    projectDecal(inputs: Inputs.BabylonDecal.ProjectDecalDto): void {
        inputs.decalMap.renderTexture(
            inputs.texture,
            new BABYLON.Vector3(...inputs.position),
            new BABYLON.Vector3(...inputs.normal),
            new BABYLON.Vector3(...inputs.size),
            inputs.angle,
        );
    }

    /**
     * Clears all projected decals from a decal map, resetting it to empty.
     * @param inputs decal map renderer
     * @group update
     * @shortname clear decal map
     */
    clearDecalMap(inputs: Inputs.BabylonDecal.DecalMapDto): void {
        inputs.decalMap.clear();
    }
}
