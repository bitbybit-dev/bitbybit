/* eslint-disable @typescript-eslint/no-namespace */
import * as BABYLON from "@babylonjs/core";
import { Base } from "./base-inputs";

// tslint:disable-next-line: no-namespace
export namespace BabylonLight {
    export class ShadowLightDirectionToTargetDto {
        constructor(shadowLight?: BABYLON.ShadowLight, target?: Base.Vector3) {
            if (shadowLight !== undefined) { this.shadowLight = shadowLight; }
            if (target !== undefined) { this.target = target; }
        }
        /**
         * Shadow light to update
         * @default undefined
         */
        shadowLight: BABYLON.ShadowLight;
        /**
         * The direction target
         * @default undefined
         */
        target?: Base.Vector3;
    }

    export class ShadowLightPositionDto {
        constructor(shadowLight?: BABYLON.ShadowLight, position?: Base.Vector3) {
            if (shadowLight !== undefined) { this.shadowLight = shadowLight; }
            if (position !== undefined) { this.position = position; }
        }
        /**
         * Shadow light to update
         * @default undefined
         */
        shadowLight: BABYLON.ShadowLight;
        /**
         * The position
         * @default undefined
         */
        position?: Base.Vector3;
    }

}
