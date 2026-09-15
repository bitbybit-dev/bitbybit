/* eslint-disable @typescript-eslint/no-namespace */
import * as BABYLON from "@babylonjs/core";
import { Base } from "./base-inputs";

// tslint:disable-next-line: no-namespace
/**
 * Parameters for lights: direction, position, intensity, color, range and the shadow settings for
 * point, directional, spot and hemispheric lights.
 */
export namespace BabylonLight {
    /**
     * Feeds `babylon.lights.shadowLight.setDirectionToTarget` with a light and the point to aim it
     * at.
     */
    export class ShadowLightDirectionToTargetDto {
        constructor(shadowLight?: BABYLON.ShadowLight, target?: Base.Vector3) {
            if (shadowLight !== undefined) { this.shadowLight = shadowLight; }
            if (target !== undefined) { this.target = target; }
        }
        /**
         * The shadow-casting light to aim
         * @default undefined
         */
        shadowLight!: BABYLON.ShadowLight;
        /**
         * The point the light is turned to shine at
         * @default undefined
         */
        target!: Base.Vector3;
    }

    /**
     * Feeds `babylon.lights.shadowLight.setPosition` with a light and the point to move it to.
     */
    export class ShadowLightPositionDto {
        constructor(shadowLight?: BABYLON.ShadowLight, position?: Base.Vector3) {
            if (shadowLight !== undefined) { this.shadowLight = shadowLight; }
            if (position !== undefined) { this.position = position; }
        }
        /**
         * The shadow-casting light to move
         * @default undefined
         */
        shadowLight!: BABYLON.ShadowLight;
        /**
         * The point the light is moved to; for a directional light, where its shadows are computed
         * from
         * @default undefined
         */
        position!: Base.Vector3;
    }

}
