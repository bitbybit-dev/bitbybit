
import { Context } from '../../context';
import {
    Matrix, Ray, Vector3
} from '@babylonjs/core';
import * as Inputs from '../../inputs/inputs';
import { Base } from '../../inputs/inputs';

export class BabylonRay {

    constructor(private readonly context: Context) { }

    /**
     * Creates a picking ray of the current mouse position in the active camera
     * @returns Ray
     */
    createPickingRay(): Ray {
        const scene = this.context.scene;
        return scene.createPickingRay(scene.pointerX, scene.pointerY, Matrix.Identity(), this.context.scene.activeCamera, false);
    }

    /**
     * Create a ray that start at origin, has direction vector and optionally length
     * @param inputs origin, direction and length
     * @returns ray
     */
    createRay(inputs: Inputs.BabylonRay.BaseRayDto): Ray {
        const or = new Vector3(inputs.origin[0], inputs.origin[1], inputs.origin[2]);
        const dir = new Vector3(inputs.direction[0], inputs.direction[1], inputs.direction[2]);
        let length;
        if (inputs.length !== 0) {
            length = inputs.length;
        }
        return new Ray(or, dir, length);
    }

    /**
     * Create a ray from one point to another
     * @param inputs origin, direction and length
     * @returns ray
     */
    createRayFromTo(inputs: Inputs.BabylonRay.FromToDto): Ray {
        const or = new Vector3(inputs.from[0], inputs.from[1], inputs.from[2]);
        const to = new Vector3(inputs.to[0], inputs.to[1], inputs.to[2]);
        return Ray.CreateNewFromTo(or, to);
    }


    /**
     * Get the origin of the ray
     * @param inputs ray
     * @returns origin point
     */
    getOrigin(inputs: Inputs.BabylonRay.RayDto): Base.Point3 {
        const or = inputs.ray.origin;
        return [or.x, or.y, or.z];
    }

    /**
     * Get the direction of the ray
     * @param inputs ray
     * @returns direction vector
     */
    getDirection(inputs: Inputs.BabylonRay.RayDto): Base.Vector3 {
        const dir = inputs.ray.direction;
        return [dir.x, dir.y, dir.z];
    }

    /**
     * Get the length of the ray
     * @param inputs ray
     * @returns length
     */
    getLength(inputs: Inputs.BabylonRay.RayDto): number {
        return inputs.ray.length;
    }
}
