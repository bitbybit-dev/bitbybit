/* eslint-disable @typescript-eslint/no-namespace */
import type * as BABYLON from "@babylonjs/core";

/**
 * Parameters for engine utilities: screenshots, canvas sizing, color conversion and the other helpers
 * that sit around the scene rather than inside it.
 */
export namespace BabylonTools {

    /**
     * Feeds `babylon.tools.createScreenshot` and `createScreenshotAndDownload`: the camera to
     * render through, the image size, format and quality.
     */
    export class ScreenshotDto {
        constructor(camera?: BABYLON.Camera, width?: number, height?: number, mimeType?: string, quality?: number) {
            if (camera !== undefined) { this.camera = camera; }
            if (mimeType !== undefined) { this.mimeType = mimeType; }
            if (quality !== undefined) { this.quality = quality; }
            if (width !== undefined) { this.width = width; }
            if (height !== undefined) { this.height = height; }
        }
        /**
         * The camera to render through; left out, the active camera is used
         * @default undefined
         * @optional true
         */
        camera?: BABYLON.Camera | undefined;
        /**
         * Pixel width of the image
         * @default 1920
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        width?: number | undefined = 1920;
        /**
         * Pixel height of the image
         * @default 1080
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        height?: number | undefined = 1080;
        /**
         * Image format as a MIME type, such as `image/png` or `image/jpeg`
         * @default image/png
         */
        mimeType?: string | undefined = "image/png";
        /**
         * Compression quality from 0 to 1 for lossy formats such as JPEG; PNG ignores it
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        quality?: number | undefined = 1;
    }

}
