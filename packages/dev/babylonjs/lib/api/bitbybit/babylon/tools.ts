
import { Context } from "../../context";
import * as BABYLON from "@babylonjs/core";
import * as Inputs from "../../inputs/inputs";


export class BabylonTools {

    constructor(private readonly context: Context) { }

    /**
     * Creates a screenshot of the scene
     * @group screenshots
     * @shortname create screenshot
     */
    async createScreenshot(inputs: Inputs.BabylonTools.ScreenshotDto): Promise<string> {
        const camera = inputs.camera ? inputs.camera : this.context.scene.activeCamera;
        return BABYLON.Tools.CreateScreenshotAsync(this.context.engine, camera, { width: inputs.width, height: inputs.height }, inputs.mimeType, inputs.quality);
    }
    /**
     * Creates a screenshot of the scene and download file
     * @group screenshots
     * @shortname create screenshot and download
     */
    async createScreenshotAndDownload(inputs: Inputs.BabylonTools.ScreenshotDto): Promise<string> {
        return new Promise((resolve, _) => {
            const camera = inputs.camera ? inputs.camera : this.context.scene.activeCamera;
            return BABYLON.Tools.CreateScreenshot(this.context.engine, camera, { width: inputs.width, height: inputs.height }, () => {
                resolve("done");
            }, inputs.mimeType, true, inputs.quality);
        });

    }
}
