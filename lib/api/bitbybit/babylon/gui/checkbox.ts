
import { Context } from "../../../context";
import * as GUI from "@babylonjs/gui";
import * as Inputs from "../../../inputs/inputs";

export class BabylonGuiCheckbox {

    constructor(private readonly context: Context) { }

    /**
     * Creates checkbox
     * @param inputs checkbox properties
     * @returns checkbox
     * @group create
     * @shortname create checkbox
     * @disposableOutput true
     */
    createCheckbox(inputs: Inputs.BabylonGui.CreateCheckboxDto): GUI.Checkbox {
        const checkbox = new GUI.Checkbox(inputs.name);

        if (inputs.height) {
            checkbox.height = inputs.height;
        } else {
            checkbox.height = "32px";
        }
        if (inputs.width) {
            checkbox.width = inputs.width;
        } else {
            checkbox.width = "32px";
        }

        checkbox.checkSizeRatio = inputs.checkSizeRatio;
        checkbox.color = inputs.color;
        checkbox.isChecked = inputs.isChecked;
        checkbox.background = inputs.background;
        if (inputs.container) {
            inputs.container.addControl(checkbox);
        }
        return checkbox;
    }

    /**
     * Sets the checkbox height
     * @param inputs checkbox and height
     * @group set
     * @shortname set checkbox height
     */
    setHeight(inputs: Inputs.BabylonGui.SetCheckboxHeightDto): GUI.Checkbox {
        inputs.checkbox.height = inputs.height;
        return inputs.checkbox;
    }

    /**
     * Sets the checkbox width
     * @param inputs checkbox and width
     * @group set
     * @shortname set checkbox width
     */
    setWidth(inputs: Inputs.BabylonGui.SetCheckboxWidthDto): GUI.Checkbox {
        inputs.checkbox.width = inputs.width;
        return inputs.checkbox;
    }

    /**
     * Sets the checkbox color
     * @param inputs checkbox and color
     * @group set
     * @shortname set checkbox color
     */
    setColor(inputs: Inputs.BabylonGui.SetCheckboxColorDto): GUI.Checkbox {
        inputs.checkbox.color = inputs.color;
        return inputs.checkbox;
    }

    /**
     * Sets the checkbox background
     * @param inputs checkbox and background
     * @group set
     * @shortname set checkbox background
     */
    setBackground(inputs: Inputs.BabylonGui.SetCheckboxBackgroundDto): GUI.Checkbox {
        inputs.checkbox.background = inputs.background;
        return inputs.checkbox;
    }

    /**
     * Sets the checkbox check size ratio
     * @param inputs checkbox and check size ratio
     * @group set
     * @shortname set checkbox check size ratio
     */
    setCheckSizeRatio(inputs: Inputs.BabylonGui.SetCheckboxCheckSizeRatioDto): GUI.Checkbox {
        inputs.checkbox.checkSizeRatio = inputs.checkSizeRatio;
        return inputs.checkbox;
    }

    /**
     * Sets the checkbox is checked
     * @param inputs checkbox and is checked
     * @group set
     * @shortname set checkbox is checked
     */
    setIsChecked(inputs: Inputs.BabylonGui.SetCheckboxIsCheckedDto): GUI.Checkbox {
        inputs.checkbox.isChecked = inputs.isChecked;
        return inputs.checkbox;
    }

    /**
     * Gets the height
     * @param inputs checkbox
     * @group get
     * @shortname get checkbox height
     */
    getHeight(inputs: Inputs.BabylonGui.CheckboxDto): string | number {
        return inputs.checkbox.height;
    }

    /**
     * Gets the width
     * @param inputs checkbox
     * @group get
     * @shortname get checkbox width
     */
    getWidth(inputs: Inputs.BabylonGui.CheckboxDto): string | number {
        return inputs.checkbox.width;
    }

    /**
     * Gets the check size ratio
     * @param inputs checkbox
     * @group get
     * @shortname get check size ratio
     */
    getCheckSizeRatio(inputs: Inputs.BabylonGui.CheckboxDto): number {
        return inputs.checkbox.checkSizeRatio;
    }

    /**
     * Gets the is checked
     * @param inputs checkbox
     * @group get
     * @shortname get is checked
     */
    getIsChecked(inputs: Inputs.BabylonGui.CheckboxDto): boolean {
        return inputs.checkbox.isChecked;
    }

    /**
     * Gets the color
     * @param inputs checkbox
     * @group get
     * @shortname get checkbox color
     */
    getColor(inputs: Inputs.BabylonGui.CheckboxDto): string {
        return inputs.checkbox.color;
    }

    /**
     * Gets the background
     * @param inputs checkbox
     * @group get
     * @shortname get checkbox background
     */
    getBackground(inputs: Inputs.BabylonGui.CheckboxDto): string {
        return inputs.checkbox.background;
    }

    /**
    * Creates the selector of an observable for the checkbox
    * @param inputs observable name
    * @group create
    * @shortname checkbox observable selector
    */
    createCheckboxObservableSelector(inputs: Inputs.BabylonGui.CheckboxObservableSelectorDto): Inputs.BabylonGui.checkboxObservableSelectorEnum {
        return inputs.selector;
    }
}
