/* eslint-disable @typescript-eslint/no-namespace */
import { Base } from "./base-inputs";
import * as BABYLON from "@babylonjs/core";

// tslint:disable-next-line: no-namespace
export namespace BabylonTools {

    export class ScreenshotDto {
        constructor(camera?: BABYLON.Camera, width?: number, height?: number, mimeType?: string, quality?: number) {
            if (camera !== undefined) { this.camera = camera; }
            if (mimeType !== undefined) { this.mimeType = mimeType; }
            if (quality !== undefined) { this.quality = quality; }
            if (width !== undefined) { this.width = width; }
            if (height !== undefined) { this.height = height; }
        }
        /**
         * Camera to be used. If not set, active camera will be used
         * @default undefined
         */
        camera: BABYLON.Camera;
        /**
         * width of the screenshot
         * @default 1920
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        width = 1920;
        /**
         * height of the screenshot
         * @default 1080
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        height = 1080;
        /**
         * The mime type
         * @default image/png
         */
        mimeType: string;
        /**
         * quality of the screenshot
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        quality = 1;
    }

}
