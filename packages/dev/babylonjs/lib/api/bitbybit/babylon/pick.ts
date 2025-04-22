
import { Context } from "../../context";
import * as BABYLON from "@babylonjs/core";
import * as Inputs from "../../inputs/inputs";
import { Base } from "../../inputs";


export class BabylonPick {

    constructor(private readonly context: Context) { }
    /**
     * Get a hit result of picking with ray
     * @param inputs ray to use for picking     
     * @group pick
     * @shortname pick with custom ray
     * @returns Picking info
     */
    pickWithRay(inputs: Inputs.BabylonPick.RayDto): BABYLON.PickingInfo {
        const scene = this.context.scene;
        return scene.pickWithRay(inputs.ray);
    }

    /**
     * Pick with picking ray of the current mouse position in the active camera
     * @group pick
     * @shortname pick with picking ray
     * @returns Picking info
     */
    pickWithPickingRay(): BABYLON.PickingInfo {
        const scene = this.context.scene;
        const ray = scene.createPickingRay(scene.pointerX, scene.pointerY, BABYLON.Matrix.Identity(), this.context.scene.activeCamera, false);
        return scene.pickWithRay(ray);
    }

    /**
     * Get the distance to the object if picking result exists
     * @param inputs picking result
     * @group get from pick info
     * @shortname pick distance
     * @returns Distance
     */
    getDistance(inputs: Inputs.BabylonPick.PickInfo): number {
        return inputs.pickInfo.distance;
    }

    /**
     * Get the picked mesh
     * @param inputs picking result
     * @group get from pick info
     * @shortname picked mesh
     * @returns Picked mesh
     */
    getPickedMesh(inputs: Inputs.BabylonPick.PickInfo): BABYLON.AbstractMesh {
        return inputs.pickInfo.pickedMesh;
    }

    /**
     * Get the picked point
     * @param inputs picking result
     * @group get from pick info
     * @shortname picked point
     * @returns Picked point
     */
    getPickedPoint(inputs: Inputs.BabylonPick.PickInfo): Base.Point3 {
        const pt = inputs.pickInfo.pickedPoint;
        return [pt.x, pt.y, pt.z];
    }

    /**
     * Check if pick ray hit something in the scene or not
     * @param inputs picking result
     * @group get from pick info
     * @shortname hit
     * @returns Indication of a hit
     */
    hit(inputs: Inputs.BabylonPick.PickInfo): boolean {
        return inputs.pickInfo.hit;
    }

    /**
     * Gets the unique submesh id if it was picked
     * @param inputs picking result
     * @group get from pick info
     * @shortname sub mesh id
     * @returns Submesh id
     */
    getSubMeshId(inputs: Inputs.BabylonPick.PickInfo): number {
        return inputs.pickInfo.subMeshId;
    }

    /**
     * Gets the unique submesh face id if it was picked
     * @param inputs picking result
     * @group get from pick info
     * @shortname sub mesh face id
     * @returns Submesh face id
     */
    getSubMeshFaceId(inputs: Inputs.BabylonPick.PickInfo): number {
        return inputs.pickInfo.subMeshFaceId;
    }

    /**
     * Gets the the barycentric U coordinate that is used when calculating the texture coordinates of the collision
     * @param inputs picking result
     * @group get from pick info
     * @shortname picked bu
     * @returns U coordinate
     */
    getBU(inputs: Inputs.BabylonPick.PickInfo): number {
        return inputs.pickInfo.bu;
    }

    /**
     * Gets the the barycentric V coordinate that is used when calculating the texture coordinates of the collision
     * @param inputs picking result
     * @group get from pick info
     * @shortname picked bv
     * @returns V coordinate
     */
    getBV(inputs: Inputs.BabylonPick.PickInfo): number {
        return inputs.pickInfo.bv;
    }

    /**
     * Get the picked sprite
     * @param inputs picking result
     * @group get from pick info
     * @shortname picked sprite
     * @returns Picked sprite
     */
    getPickedSprite(inputs: Inputs.BabylonPick.PickInfo): BABYLON.Sprite {
        return inputs.pickInfo.pickedSprite;
    }
}
