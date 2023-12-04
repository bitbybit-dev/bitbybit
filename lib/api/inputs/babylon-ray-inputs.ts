import { Ray } from "@babylonjs/core";
import { Base } from "./base-inputs";
/* eslint-disable @typescript-eslint/no-namespace */
export namespace BabylonRay {
    export class BaseRayDto {
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
        /**
         * ray to analyze
         */
        ray: Ray;
    }
    export class FromToDto {
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
