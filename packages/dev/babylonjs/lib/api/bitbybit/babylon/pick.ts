
import { Context } from "../../context";
import * as BABYLON from "@babylonjs/core";
import * as Inputs from "../../inputs";
import { Base } from "../../inputs";


/**
 * Finding what is under a ray or the pointer: a pick shoots a ray into the scene and reports the
 * first pickable mesh it hits, where, how far away and on which face. `pickWithPickingRay` uses the
 * pointer's current position; the other methods read parts of a picking result.
 */
export class BabylonPick {

    constructor(private readonly context: Context) { }
    /**
     * Shoots a ray into the scene and reports the first pickable mesh it hits, with the hit point
     * and distance; read the parts with the other methods here.
     * @param inputs - The ray
     * @returns The picking result
     * @group pick
     * @shortname pick with custom ray
     * @example
     * ```typescript
     * const ray = bitbybit.babylon.ray.createRay({ origin: [0, 10, 0], direction: [0, -1, 0], length: 100 });
     * const pick = bitbybit.babylon.pick.pickWithRay({ ray });
     * const hit = bitbybit.babylon.pick.hit({ pickInfo: pick });
     * ```
     */
    pickWithRay(inputs: Inputs.BabylonPick.RayDto): BABYLON.PickingInfo {
        const scene = this.context.scene;
        return scene.pickWithRay(inputs.ray)!;
    }

    /**
     * Shoots a ray from the active camera through the pointer's current position and reports the
     * first pickable mesh it hits, the way a click selects.
     * @returns The picking result
     * @group pick
     * @shortname pick with picking ray
     * @example
     * ```typescript
     * bitbybit.babylon.scene.onPointerDown({ statement_update: () => {
     *     const pick = bitbybit.babylon.pick.pickWithPickingRay();
     *     if (bitbybit.babylon.pick.hit({ pickInfo: pick })) {
     *         console.log(bitbybit.babylon.pick.getPickedPoint({ pickInfo: pick }));
     *     }
     * } });
     * ```
     */
    pickWithPickingRay(): BABYLON.PickingInfo {
        const scene = this.context.scene;
        const ray = scene.createPickingRay(scene.pointerX, scene.pointerY, BABYLON.Matrix.Identity(), this.context.scene.activeCamera, false);
        return scene.pickWithRay(ray)!;
    }

    /**
     * Reads how far along the ray the hit was, in scene units; meaningful only when `hit` is true.
     * @param inputs - The picking result
     * @returns The distance to the hit
     * @group get from pick info
     * @shortname pick distance
     */
    getDistance(inputs: Inputs.BabylonPick.PickInfo): number {
        return inputs.pickInfo.distance;
    }

    /**
     * Reads the mesh a pick hit; meaningful only when `hit` is true.
     * @param inputs - The picking result
     * @returns The mesh that was hit
     * @group get from pick info
     * @shortname picked mesh
     */
    getPickedMesh(inputs: Inputs.BabylonPick.PickInfo): BABYLON.AbstractMesh {
        return inputs.pickInfo.pickedMesh!;
    }

    /**
     * Reads the point in the scene where a pick hit the mesh; meaningful only when `hit` is true.
     * @param inputs - The picking result
     * @returns The hit point
     * @group get from pick info
     * @shortname picked point
     */
    getPickedPoint(inputs: Inputs.BabylonPick.PickInfo): Base.Point3 {
        const pt = inputs.pickInfo.pickedPoint!;
        return [pt.x, pt.y, pt.z];
    }

    /**
     * Tells whether a pick hit anything at all; check it before reading the mesh, point or
     * distance.
     * @param inputs - The picking result
     * @returns True when something was hit
     * @group get from pick info
     * @shortname hit
     */
    hit(inputs: Inputs.BabylonPick.PickInfo): boolean {
        return inputs.pickInfo.hit;
    }

    /**
     * Reads the index of the sub-mesh that was hit, for meshes split into several material
     * sections.
     * @param inputs - The picking result
     * @returns The sub-mesh index
     * @group get from pick info
     * @shortname sub mesh id
     */
    getSubMeshId(inputs: Inputs.BabylonPick.PickInfo): number {
        return inputs.pickInfo.subMeshId;
    }

    /**
     * Reads the index of the triangle that was hit within its sub-mesh.
     * @param inputs - The picking result
     * @returns The face index
     * @group get from pick info
     * @shortname sub mesh face id
     */
    getSubMeshFaceId(inputs: Inputs.BabylonPick.PickInfo): number {
        return inputs.pickInfo.subMeshFaceId;
    }

    /**
     * Reads the first barycentric coordinate of the hit inside its triangle, the weight of the
     * triangle's second vertex, used to work out texture coordinates.
     * @param inputs - The picking result
     * @returns The barycentric U coordinate
     * @group get from pick info
     * @shortname picked bu
     */
    getBU(inputs: Inputs.BabylonPick.PickInfo): number {
        return inputs.pickInfo.bu;
    }

    /**
     * Reads the second barycentric coordinate of the hit inside its triangle, the weight of the
     * triangle's third vertex, used to work out texture coordinates.
     * @param inputs - The picking result
     * @returns The barycentric V coordinate
     * @group get from pick info
     * @shortname picked bv
     */
    getBV(inputs: Inputs.BabylonPick.PickInfo): number {
        return inputs.pickInfo.bv;
    }

    /**
     * Reads the sprite a pick hit, when sprites rather than meshes were picked.
     * @param inputs - The picking result
     * @returns The sprite that was hit
     * @group get from pick info
     * @shortname picked sprite
     */
    getPickedSprite(inputs: Inputs.BabylonPick.PickInfo): BABYLON.Sprite {
        return inputs.pickInfo.pickedSprite!;
    }
}
