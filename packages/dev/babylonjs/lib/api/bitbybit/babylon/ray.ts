
import { Context } from "../../context";
import * as BABYLON from "@babylonjs/core";
import * as Inputs from "../../inputs/inputs";
import { Base } from "../../inputs";

export class BabylonRay {

    constructor(private readonly context: Context) { }

    /**
     * Creates a picking ray of the current mouse position in the active camera
     * @group create
     * @shortname create picking ray
     * @returns Ray
     */
    createPickingRay(): BABYLON.Ray {
        const scene = this.context.scene;
        return scene.createPickingRay(scene.pointerX, scene.pointerY, BABYLON.Matrix.Identity(), this.context.scene.activeCamera, false);
    }

    /**
     * Create a ray that start at origin, has direction vector and optionally length
     * @param inputs origin, direction and length
     * @group create
     * @shortname create custom ray
     * @returns ray
     */
    createRay(inputs: Inputs.BabylonRay.BaseRayDto): BABYLON.Ray {
        const or = new BABYLON.Vector3(inputs.origin[0], inputs.origin[1], inputs.origin[2]);
        const dir = new BABYLON.Vector3(inputs.direction[0], inputs.direction[1], inputs.direction[2]);
        let length;
        if (inputs.length !== 0) {
            length = inputs.length;
        }
        return new BABYLON.Ray(or, dir, length);
    }

    /**
     * Create a ray from one point to another
     * @param inputs origin, direction and length
     * @group create
     * @shortname create ray from to
     * @returns ray
     */
    createRayFromTo(inputs: Inputs.BabylonRay.FromToDto): BABYLON.Ray {
        const or = new BABYLON.Vector3(inputs.from[0], inputs.from[1], inputs.from[2]);
        const to = new BABYLON.Vector3(inputs.to[0], inputs.to[1], inputs.to[2]);
        return BABYLON.Ray.CreateNewFromTo(or, to);
    }


    /**
     * Get the origin of the ray
     * @param inputs ray
     * @group get
     * @shortname get ray origin
     * @returns origin point
     */
    getOrigin(inputs: Inputs.BabylonRay.RayDto): Base.Point3 {
        const or = inputs.ray.origin;
        return [or.x, or.y, or.z];
    }

    /**
     * Get the direction of the ray
     * @param inputs ray
     * @group get
     * @shortname get ray direction
     * @returns direction vector
     */
    getDirection(inputs: Inputs.BabylonRay.RayDto): Base.Vector3 {
        const dir = inputs.ray.direction;
        return [dir.x, dir.y, dir.z];
    }

    /**
     * Get the length of the ray
     * @param inputs ray
     * @group get
     * @shortname get ray length
     * @returns length
     */
    getLength(inputs: Inputs.BabylonRay.RayDto): number {
        return inputs.ray.length;
    }
}
