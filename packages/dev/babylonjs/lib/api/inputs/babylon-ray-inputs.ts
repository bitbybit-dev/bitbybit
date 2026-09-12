import * as BABYLON from "@babylonjs/core";
import { Base } from "./base-inputs";

/* eslint-disable @typescript-eslint/no-namespace */
/**
 * Parameters for rays: origin, direction and length, and the options for casting one at the scene and
 * reading back what it hit.
 */
export namespace BabylonRay {
    /**
     * Feeds `babylon.ray.createRay` with where a ray starts, which way it points and, optionally,
     * how far it reaches.
     */
    export class BaseRayDto {
        constructor(origin?: Base.Point3, direction?: Base.Vector3, length?: number) {
            if (origin !== undefined) { this.origin = origin; }
            if (direction !== undefined) { this.direction = direction; }
            if (length !== undefined) { this.length = length; }
        }
        /**
         * The point the ray starts from
         */
        origin!: Base.Point3;
        /**
         * The way the ray points, as `[x, y, z]`
         */
        direction!: Base.Vector3;
        /**
         * How far the ray reaches, in scene units; 0 or left out makes it unlimited
         */
        length?: number | undefined;
    }
    /**
     * Feeds the `babylon.ray` getters with the ray whose origin, direction or length is read.
     */
    export class RayDto {
        constructor(ray?: BABYLON.Ray) {
            if (ray !== undefined) { this.ray = ray; }
        }
        /**
         * The ray whose origin, direction or length is read
         */
        ray!: BABYLON.Ray;
    }
    /**
     * Feeds `babylon.ray.createRayFromTo` with the two points a ray runs between.
     */
    export class FromToDto {
        constructor(from?: Base.Point3, to?: Base.Point3) {
            if (from !== undefined) { this.from = from; }
            if (to !== undefined) { this.to = to; }
        }
        /**
         * The point the ray starts from
         */
        from!: Base.Point3;
        /**
         * The point the ray ends at; the ray is exactly this far long
         */
        to!: Base.Point3;
    }
}
