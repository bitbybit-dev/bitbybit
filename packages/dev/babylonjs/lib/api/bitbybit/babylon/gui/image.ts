
import { Context } from "../../../context";
import * as BABYLON from "../../../../gui-enriched-babylon";
import * as Inputs from "../../../inputs";

/**
 * Images shown as GUI controls, loaded from a URL, for logos, icons and pictures beside other
 * controls.
 */
export class BabylonGuiImage {

    constructor(_context: Context) { }

    /**
     * Creates an image control that loads its picture from `url`; sizes are pixel strings or
     * fractions of the parent, and a size left out is chosen by the engine.
     * @param inputs - The name, the URL, the color and the optional size
     * @returns The image control
     * @group create
     * @shortname create image
     * @disposableOutput true
     * @example
     * ```typescript
     * const logo = bitbybit.babylon.gui.image.createImage({ name: "logo", url: "https://example.com/logo.png", color: "black", width: "120px", height: "60px" });
     * panel.addControl(logo);
     * ```
     */
    createImage(inputs: Inputs.BabylonGui.CreateImageDto): BABYLON.GUI.Image {
        const image = new BABYLON.GUI.Image(inputs.name, inputs.url);
        if (inputs.width) {
            image.width = inputs.width;
        } else {
            image.width = "200px";
        }
        if (inputs.height) {
            image.height = inputs.height;
        } else {
            image.height = "200px";
        }

        image.color = inputs.color;
       
        return image;
    }

    /**
     * Changes the picture an image control shows by giving it a new URL to load.
     * @param inputs - The image control and the URL
     * @returns The same image control
     * @group set
     * @shortname set image source url
     */
    setSourceUrl(inputs: Inputs.BabylonGui.SetImageUrlDto): BABYLON.GUI.Image {
        inputs.image.source = inputs.url;
        return inputs.image;
    }

    /**
     * Reads the URL an image control loads its picture from.
     * @param inputs - The image control
     * @returns The URL
     * @group get
     * @shortname get image source url
     */
    getSourceUrl(inputs: Inputs.BabylonGui.ImageDto): string {
        return inputs.image.source!;
    }

}
