import * as BABYLON from "@babylonjs/core";
import { Base } from "./base-inputs";

/* eslint-disable @typescript-eslint/no-namespace */
export namespace BabylonRay {
    export class BaseRayDto {
        constructor(origin?: Base.Point3, direction?: Base.Vector3, length?: number) {
            if (origin !== undefined) { this.origin = origin; }
            if (direction !== undefined) { this.direction = direction; }
            if (length !== undefined) { this.length = length; }
        }
        /**
         * Origin of the ray
         */
        origin: Base.Point3;
        /**
         * Direction of the ray
         */
        direction: Base.Vector3;
        /**
         * Length of the ray
         */
        length?: number;
    }
    export class RayDto {
        constructor(ray?: BABYLON.Ray) {
            if (ray !== undefined) { this.ray = ray; }
        }
        /**
         * ray to analyze
         */
        ray: BABYLON.Ray;
    }
    export class FromToDto {
        constructor(from?: Base.Point3, to?: Base.Point3) {
            if (from !== undefined) { this.from = from; }
            if (to !== undefined) { this.to = to; }
        }
        /**
         * From point
         */
        from: Base.Point3;
        /**
         * To point
         */
        to: Base.Point3;
    }
}
