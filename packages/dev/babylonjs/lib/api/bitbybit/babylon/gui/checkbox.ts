
import { Context } from "../../../context";
import * as BABYLON from "../../../../gui-enriched-babylon";
import * as Inputs from "../../../inputs";

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
    createCheckbox(inputs: Inputs.BabylonGui.CreateCheckboxDto): BABYLON.GUI.Checkbox {
        const checkbox = new BABYLON.GUI.Checkbox(inputs.name);

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

        return checkbox;
    }

    /**
     * Sets the checkbox background
     * @param inputs checkbox and background
     * @group set
     * @shortname set checkbox background
     */
    setBackground(inputs: Inputs.BabylonGui.SetCheckboxBackgroundDto): BABYLON.GUI.Checkbox {
        inputs.checkbox.background = inputs.background;
        return inputs.checkbox;
    }

    /**
     * Sets the checkbox check size ratio
     * @param inputs checkbox and check size ratio
     * @group set
     * @shortname set checkbox check size ratio
     */
    setCheckSizeRatio(inputs: Inputs.BabylonGui.SetCheckboxCheckSizeRatioDto): BABYLON.GUI.Checkbox {
        inputs.checkbox.checkSizeRatio = inputs.checkSizeRatio;
        return inputs.checkbox;
    }

    /**
     * Sets the checkbox is checked
     * @param inputs checkbox and is checked
     * @group set
     * @shortname set checkbox is checked
     */
    setIsChecked(inputs: Inputs.BabylonGui.SetCheckboxIsCheckedDto): BABYLON.GUI.Checkbox {
        inputs.checkbox.isChecked = inputs.isChecked;
        return inputs.checkbox;
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
