
import { Context } from "../../../context";
import * as BABYLON from "../../../../gui-enriched-babylon";
import * as Inputs from "../../../inputs/inputs";

export class BabylonGuiImage {

    constructor(private readonly context: Context) { }

    /**
     * Creates image
     * @param inputs image properties
     * @returns image
     * @group create
     * @shortname create image
     * @disposableOutput true
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
        if (inputs.container) {
            inputs.container.addControl(image);
        }
        return image;
    }

    /**
     * Sets image source url
     * @param inputs image and url
     * @returns image
     * @group set
     * @shortname set image source url
     */
    setSourceUrl(inputs: Inputs.BabylonGui.SetImageUrlDto): BABYLON.GUI.Image {
        inputs.image.source = inputs.url;
        return inputs.image;
    }

    /**
     * Gets image source url
     * @param inputs image
     * @returns image source url
     * @group get
     * @shortname get image source url
     */
    getSourceUrl(inputs: Inputs.BabylonGui.ImageDto): string {
        return inputs.image.source;
    }

}
