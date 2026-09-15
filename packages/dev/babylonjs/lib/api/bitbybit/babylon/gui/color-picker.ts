
import { Context } from "../../../context";
import * as BABYLON from "../../../../gui-enriched-babylon";
import * as Inputs from "../../../inputs";

/**
 * Color pickers: a color wheel with a square for lightness and saturation, giving a hex color.
 * Subscribe to the value changed event to react to the user.
 */
export class BabylonGuiColorPicker {

    constructor(_context: Context) { }

    /**
     * Creates a color picker starting at `defaultColor`; `size` sets both its width and height, as
     * a pixel string or a fraction, and defaults to 300 pixels.
     * @param inputs - The name, the starting color, the color, the optional width, height and size
     * @returns The color picker
     * @group create
     * @shortname color picker
     * @disposableOutput true
     * @example
     * ```typescript
     * const picker = bitbybit.babylon.gui.colorPicker.createColorPicker({ name: "faceColor", defaultColor: "#f0cebb", color: "#f0cebb", size: "200px" });
     * panel.addControl(picker);
     * picker.onValueChangedObservable.add((color) => { console.log(color.toHexString()); });
     * ```
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
     * Moves a color picker to a hex color, which fires its value changed event like a user pick
     * would.
     * @param inputs - The color picker and the hex color
     * @returns The same color picker
     * @group set
     * @shortname set colo picker value
     */
    setColorPickerValue(inputs: Inputs.BabylonGui.SetColorPickerValueDto): BABYLON.GUI.ColorPicker {
        inputs.colorPicker.value = BABYLON.Color3.FromHexString(inputs.color);
        return inputs.colorPicker;
    }

    /**
     * Sets the width and height of a color picker together, as a pixel string or a fraction of the
     * parent.
     * @param inputs - The color picker and the size
     * @returns The same color picker
     * @group set
     * @shortname set color picker size
     */
    setColorPickerSize(inputs: Inputs.BabylonGui.SetColorPickerSizeDto): BABYLON.GUI.ColorPicker {
        inputs.colorPicker.size = inputs.size ?? "300px";
        return inputs.colorPicker;
    }

    /**
     * Reads the color a color picker currently holds, as a hex string.
     * @param inputs - The color picker
     * @returns The hex color
     * @group get
     * @shortname get color picker value
     */
    getColorPickerValue(inputs: Inputs.BabylonGui.ColorPickerDto): string {
        return inputs.colorPicker.value.toHexString();
    }

    /**
     * Reads the size of a color picker, its width and height together.
     * @param inputs - The color picker
     * @returns The size
     * @group get
     * @shortname get color picker size
     */
    getColorPickerSize(inputs: Inputs.BabylonGui.ColorPickerDto): string | number {
        return inputs.colorPicker.size;
    }

    /**
     * Passes through the name of a color picker event, its value changing, as a typed selector for
     * code that subscribes to color picker events by name.
     * @param inputs - The event selector
     * @returns The same selector
     * @group create
     * @shortname color picker observable selector
     */
    createColorPickerObservableSelector(inputs: Inputs.BabylonGui.ColorPickerObservableSelectorDto): Inputs.BabylonGui.colorPickerObservableSelectorEnum {
        return inputs.selector;
    }
}
