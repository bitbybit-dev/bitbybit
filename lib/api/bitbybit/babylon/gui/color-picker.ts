
import { Context } from "../../../context";
import * as GUI from "@babylonjs/gui";
import * as Inputs from "../../../inputs/inputs";

export class BabylonGuiColorPicker {

    constructor(private readonly context: Context) { }

    /**
     * Creates color picker
     * @param inputs color picker properties
     * @returns color picker
     * @group create
     * @shortname color picker
     * @disposableOutput true
     */
    createColorPicker(inputs: Inputs.BabylonGui.CreateColorPickerDto): GUI.ColorPicker {
        const colorPicker = new GUI.ColorPicker(inputs.name);

        if (inputs.height) {
            colorPicker.height = inputs.height;
        } else {
            colorPicker.height = "300px";
        }
        if (inputs.width) {
            colorPicker.width = inputs.width;
        } else {
            colorPicker.width = "300px";
        }

        colorPicker.color = inputs.color;
        if (inputs.container) {
            inputs.container.addControl(colorPicker);
        }
        return colorPicker;
    }

}
