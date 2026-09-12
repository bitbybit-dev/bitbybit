
import { Context } from "../../context";
import * as BABYLON from "@babylonjs/core";
import * as Inputs from "../../inputs";
import { Base } from "../../inputs";

/**
 * Rays: a start point and a direction, optionally with a length, used to pick what lies along a
 * line of sight or to test intersections. `createPickingRay` builds the ray from the camera through
 * the pointer, the others build one from points.
 */
export class BabylonRay {

    constructor(private readonly context: Context) { }

    /**
     * Builds a ray from the active camera through the pointer's current position on the canvas, the
     * ray a click would pick with.
     * @returns The ray
     * @group create
     * @shortname create picking ray
     * @example
     * ```typescript
     * const ray = bitbybit.babylon.ray.createPickingRay();
     * const pick = bitbybit.babylon.pick.pickWithRay({ ray });
     * ```
     */
    createPickingRay(): BABYLON.Ray {
        const scene = this.context.scene;
        return scene.createPickingRay(scene.pointerX, scene.pointerY, BABYLON.Matrix.Identity(), this.context.scene.activeCamera, false);
    }

    /**
     * Builds a ray starting at `origin` and pointing along `direction`; `length` limits how far it
     * reaches, and 0 or nothing leaves it unlimited.
     * @param inputs - The origin, the direction and the optional length
     * @returns The ray
     * @group create
     * @shortname create custom ray
     * @example
     * ```typescript
     * const ray = bitbybit.babylon.ray.createRay({ origin: [0, 10, 0], direction: [0, -1, 0], length: 100 });
     * ```
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
     * Builds a ray that starts at `from`, points toward `to` and is exactly as long as the distance
     * between them.
     * @param inputs - The start point and the end point
     * @returns The ray
     * @group create
     * @shortname create ray from to
     * @example
     * ```typescript
     * const ray = bitbybit.babylon.ray.createRayFromTo({ from: [0, 10, 0], to: [0, 0, 0] });
     * ```
     */
    createRayFromTo(inputs: Inputs.BabylonRay.FromToDto): BABYLON.Ray {
        const or = new BABYLON.Vector3(inputs.from[0], inputs.from[1], inputs.from[2]);
        const to = new BABYLON.Vector3(inputs.to[0], inputs.to[1], inputs.to[2]);
        return BABYLON.Ray.CreateNewFromTo(or, to);
    }


    /**
     * Reads the point a ray starts from, as a point in the scene.
     * @param inputs - The ray
     * @returns The origin point
     * @group get
     * @shortname get ray origin
     */
    getOrigin(inputs: Inputs.BabylonRay.RayDto): Base.Point3 {
        const or = inputs.ray.origin;
        return [or.x, or.y, or.z];
    }

    /**
     * Reads the direction a ray points in, as a unit vector.
     * @param inputs - The ray
     * @returns The direction vector
     * @group get
     * @shortname get ray direction
     */
    getDirection(inputs: Inputs.BabylonRay.RayDto): Base.Vector3 {
        const dir = inputs.ray.direction;
        return [dir.x, dir.y, dir.z];
    }

    /**
     * Reads how far a ray reaches; an unlimited ray reports a very large number.
     * @param inputs - The ray
     * @returns The length
     * @group get
     * @shortname get ray length
     */
    getLength(inputs: Inputs.BabylonRay.RayDto): number {
        return inputs.ray.length;
    }
}
