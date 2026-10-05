
import { uniqueName } from "../../../unique-name";
import type { Context } from "../../../context";
import * as BABYLON from "@babylonjs/core";
import * as Inputs from "../../../inputs";
import { resolveDto } from "@bitbybit-dev/base";
import type * as Resolved from "../../../resolved-inputs";

/**
 * Sticking images onto meshes, the way a label or a logo sits on a product. A geometry decal is a
 * thin clipped mesh hugging the surface, which works on any static mesh; a decal map paints into
 * the mesh's own texture space instead, adds no geometry, follows deformation and lets many
 * projections build up, but needs clean UV coordinates.
 */
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
        const resolved = resolveDto(Inputs.BabylonDecal.CreateMeshDecalDto, inputs) as Resolved.BabylonDecal.CreateMeshDecalDto;
        const decal = BABYLON.MeshBuilder.CreateDecal(uniqueName("Decal"), resolved.sourceMesh, {
            position: new BABYLON.Vector3(...resolved.position),
            normal: new BABYLON.Vector3(...resolved.normal),
            size: new BABYLON.Vector3(...resolved.size),
            angle: resolved.angle,
            cullBackFaces: resolved.cullBackFaces,
            localMode: resolved.localMode,
        });

        const material = new BABYLON.StandardMaterial(uniqueName("DecalMaterial"), this.context.scene);
        material.diffuseTexture = resolved.texture;
        material.diffuseTexture.hasAlpha = true;
        material.useAlphaFromDiffuseTexture = true;
        material.zOffset = resolved.zOffset;
        material.backFaceCulling = resolved.cullBackFaces;
        decal.material = material;

        decal.setParent(resolved.sourceMesh);
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
        const resolved = resolveDto(Inputs.BabylonDecal.EnableDecalMapDto, inputs) as Resolved.BabylonDecal.EnableDecalMapDto;
        const renderer = new BABYLON.MeshUVSpaceRenderer(resolved.mesh, this.context.scene, {
            width: resolved.width,
            height: resolved.height,
        });
        resolved.mesh.decalMap = renderer;
        const material = resolved.material as BABYLON.Material & { decalMap?: { isEnabled: boolean } };
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
        const resolved = resolveDto(Inputs.BabylonDecal.ProjectDecalDto, inputs) as Resolved.BabylonDecal.ProjectDecalDto;
        resolved.decalMap.renderTexture(
            resolved.texture,
            new BABYLON.Vector3(...resolved.position),
            new BABYLON.Vector3(...resolved.normal),
            new BABYLON.Vector3(...resolved.size),
            resolved.angle,
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
