
import { Context } from "../../context";
import * as BABYLON from "@babylonjs/core";
import * as Inputs from "../../inputs";


/**
 * Utilities around the rendered image: taking a screenshot of the scene at a chosen size through
 * any camera, as an image data URL to use or as a download.
 */
export class BabylonTools {

    constructor(private readonly context: Context) { }

    /**
     * Renders the scene through `camera`, or the active camera when none is given, at the given
     * size and gives the image back as a data URL.
     *
     * `mimeType` picks the format and `quality` from 0 to 1 the compression of lossy formats such
     * as JPEG.
     * @param inputs - The camera, the size, the image type and the quality
     * @returns The image as a data URL
     * @group screenshots
     * @shortname create screenshot
     * @example
     * ```typescript
     * const image = await bitbybit.babylon.tools.createScreenshot({ camera: bitbybit.babylon.scene.getActiveCamera(), width: 1920, height: 1080, mimeType: "image/png", quality: 1 });
     * ```
     */
    async createScreenshot(inputs: Inputs.BabylonTools.ScreenshotDto): Promise<string> {
        const camera = inputs.camera ? inputs.camera : this.context.scene.activeCamera;
        return BABYLON.Tools.CreateScreenshotAsync(this.context.engine, camera!, { width: inputs.width, height: inputs.height }, inputs.mimeType, inputs.quality);
    }
    /**
     * Renders the scene through `camera`, or the active camera when none is given, at the given
     * size and downloads the image in the browser.
     * @param inputs - The camera, the size, the image type and the quality
     * @returns The text `done` once the download has started
     * @group screenshots
     * @shortname create screenshot and download
     * @example
     * ```typescript
     * await bitbybit.babylon.tools.createScreenshotAndDownload({ camera: bitbybit.babylon.scene.getActiveCamera(), width: 1920, height: 1080, mimeType: "image/png", quality: 1 });
     * ```
     */
    async createScreenshotAndDownload(inputs: Inputs.BabylonTools.ScreenshotDto): Promise<string> {
        return new Promise((resolve, _) => {
            const camera = inputs.camera ? inputs.camera : this.context.scene.activeCamera;
            return BABYLON.Tools.CreateScreenshot(this.context.engine, camera!, { width: inputs.width, height: inputs.height }, () => {
                resolve("done");
            }, inputs.mimeType, true, inputs.quality);
        });

    }
}
