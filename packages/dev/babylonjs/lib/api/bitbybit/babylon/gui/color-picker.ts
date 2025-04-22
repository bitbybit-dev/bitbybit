
import { Context } from "../../../context";
import * as BABYLON from "../../../../gui-enriched-babylon";
import * as Inputs from "../../../inputs";

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
    createColorPicker(inputs: Inputs.BabylonGui.CreateColorPickerDto): BABYLON.GUI.ColorPicker {
        const colorPicker = new BABYLON.GUI.ColorPicker(inputs.name);

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
        if (inputs.size) {
            colorPicker.size = inputs.size;
        }

        if (inputs.defaultColor) {
            colorPicker.value = BABYLON.Color3.FromHexString(inputs.defaultColor);
        }
        colorPicker.color = inputs.color;
        return colorPicker;
    }

    /**
     * Sets color picker value color
     * @param inputs color picker and color
     * @returns color picker
     * @group set
     * @shortname set colo picker value
     */
    setColorPickerValue(inputs: Inputs.BabylonGui.SetColorPickerValueDto): BABYLON.GUI.ColorPicker {
        inputs.colorPicker.value = BABYLON.Color3.FromHexString(inputs.color);
        return inputs.colorPicker;
    }

    /**
     * Sets color picker size (width and height)
     * @param inputs color picker and size
     * @returns color picker
     * @group set
     * @shortname set color picker size
     */
    setColorPickerSize(inputs: Inputs.BabylonGui.SetColorPickerSizeDto): BABYLON.GUI.ColorPicker {
        inputs.colorPicker.size = inputs.size;
        return inputs.colorPicker;
    }

    /**
     * Gets color picker value color
     * @param inputs color picker
     * @returns color
     * @group get
     * @shortname get color picker value
     */
    getColorPickerValue(inputs: Inputs.BabylonGui.ColorPickerDto): string {
        return inputs.colorPicker.value.toHexString();
    }

    /**
     * Gets color picker size
     * @param inputs color picker
     * @returns size
     * @group get
     * @shortname get color picker size
     */
    getColorPickerSize(inputs: Inputs.BabylonGui.ColorPickerDto): string | number {
        return inputs.colorPicker.size;
    }

    /**
    * Creates the selector of an observable for color picker
    * @param inputs observable name
    * @returns color picker observable selector
    * @group create
    * @shortname color picker observable selector
    */
    createColorPickerObservableSelector(inputs: Inputs.BabylonGui.ColorPickerObservableSelectorDto): Inputs.BabylonGui.colorPickerObservableSelectorEnum {
        return inputs.selector;
    }
}
