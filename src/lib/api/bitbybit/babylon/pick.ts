
import { Context } from '../../context';
import { Matrix, PickingInfo, AbstractMesh, Sprite } from '@babylonjs/core';
import * as Inputs from '../../inputs/inputs';
import { Base } from '../../inputs/inputs';


export class BabylonPick {

    constructor(private readonly context: Context) { }
    /**
     * Get a hit result of picking with ray
     * @param inputs ray to use for picking
     * @returns Picking info
     */
    pickWithRay(inputs: Inputs.BabylonPick.RayDto): PickingInfo {
        const scene = this.context.scene;
        return scene.pickWithRay(inputs.ray);
    }

    /**
     * Pick with picking ray of the current mouse position in the active camera
     * @returns Picking info
     */
    pickWithPickingRay(): PickingInfo {
        const scene = this.context.scene;
        const ray = scene.createPickingRay(scene.pointerX, scene.pointerY, Matrix.Identity(), this.context.scene.activeCamera, false);
        return scene.pickWithRay(ray);
    }

    /**
     * Get the distance to the object if picking result exists
     * @param inputs picking result
     * @returns Distance
     */
    getDistance(inputs: Inputs.BabylonPick.PickInfo): number {
        return inputs.pickInfo.distance;
    }

    /**
     * Get the picked mesh
     * @param inputs picking result
     * @returns Picked mesh
     */
    getPickedMesh(inputs: Inputs.BabylonPick.PickInfo): AbstractMesh {
        return inputs.pickInfo.pickedMesh;
    }

    /**
     * Get the picked point
     * @param inputs picking result
     * @returns Picked point
     */
    getPickedPoint(inputs: Inputs.BabylonPick.PickInfo): Base.Point3 {
        const pt = inputs.pickInfo.pickedPoint;
        return [pt.x, pt.y, pt.z];
    }

    /**
     * Check if pick ray hit something in the scene or not
     * @param inputs picking result
     * @returns Indication of a hit
     */
    hit(inputs: Inputs.BabylonPick.PickInfo): boolean {
        return inputs.pickInfo.hit;
    }

    /**
     * Gets the unique submesh id if it was picked
     * @param inputs picking result
     * @returns Submesh id
     */
    getSubMeshId(inputs: Inputs.BabylonPick.PickInfo): number {
        return inputs.pickInfo.subMeshId;
    }

    /**
     * Gets the unique submesh face id if it was picked
     * @param inputs picking result
     * @returns Submesh face id
     */
    getSubMeshFaceId(inputs: Inputs.BabylonPick.PickInfo): number {
        return inputs.pickInfo.subMeshFaceId;
    }

    /**
     * Gets the the barycentric U coordinate that is used when calculating the texture coordinates of the collision
     * @param inputs picking result
     * @returns U coordinate
     */
    getBU(inputs: Inputs.BabylonPick.PickInfo): number {
        return inputs.pickInfo.bu;
    }

    /**
     * Gets the the barycentric V coordinate that is used when calculating the texture coordinates of the collision
     * @param inputs picking result
     * @returns V coordinate
     */
    getBV(inputs: Inputs.BabylonPick.PickInfo): number {
        return inputs.pickInfo.bv;
    }

    /**
     * Get the picked sprite
     * @param inputs picking result
     * @returns Picked sprite
     */
    getPickedSprite(inputs: Inputs.BabylonPick.PickInfo): Sprite {
        return inputs.pickInfo.pickedSprite;
    }
}
