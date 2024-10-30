
import { Context } from "../../../context";
import * as BABYLON from "../../../../gui-enriched-babylon";
import * as Inputs from "../../../inputs/inputs";

export class BabylonGuiRadioButton {

    constructor(private readonly context: Context) { }

    /**
     * Creates radio button
     * @param inputs radio button properties
     * @returns radio button
     * @group create
     * @shortname create radio button
     * @disposableOutput true
     */
    createRadioButton(inputs: Inputs.BabylonGui.CreateRadioButtonDto): BABYLON.GUI.RadioButton {
        const radioButton = new BABYLON.GUI.RadioButton(inputs.name);

        if (inputs.height) {
            radioButton.height = inputs.height;
        } else {
            radioButton.height = "32px";
        }
        if (inputs.width) {
            radioButton.width = inputs.width;
        } else {
            radioButton.width = "32px";
        }

        radioButton.checkSizeRatio = inputs.checkSizeRatio;
        radioButton.group = inputs.group;
        radioButton.color = inputs.color;
        radioButton.isChecked = inputs.isChecked;
        radioButton.background = inputs.background;
   
        return radioButton;
    }

    /**
     * Sets the radio button check size ratio
     * @param inputs radio button and check size ratio
     * @group set
     * @shortname set radio button check size ratio
     */
    setCheckSizeRatio(inputs: Inputs.BabylonGui.SetRadioButtonCheckSizeRatioDto): BABYLON.GUI.RadioButton {
        inputs.radioButton.checkSizeRatio = inputs.checkSizeRatio;
        return inputs.radioButton;
    }

    /**
     * Sets the radio button group
     * @param inputs radio button and group
     * @group set
     * @shortname set radio button group
     */
    setGroup(inputs: Inputs.BabylonGui.SetRadioButtonGroupDto): BABYLON.GUI.RadioButton {
        inputs.radioButton.group = inputs.group;
        return inputs.radioButton;
    }

    /**
     * Sets the radio button background
     * @param inputs radio button and background
     * @group set
     * @shortname set radio button background
     */
    setBackground(inputs: Inputs.BabylonGui.SetRadioButtonBackgroundDto): BABYLON.GUI.RadioButton {
        inputs.radioButton.background = inputs.background;
        return inputs.radioButton;
    }

    /**
     * Gets the radio button check size ratio
     * @param inputs radio button
     * @group get
     * @shortname get radio button check size ratio
     */
    getCheckSizeRatio(inputs: Inputs.BabylonGui.RadioButtonDto): number {
        return inputs.radioButton.checkSizeRatio;
    }

    /**
     * Gets the radio button group
     * @param inputs radio button
     * @group get
     * @shortname get radio button group
     */
    getGroup(inputs: Inputs.BabylonGui.RadioButtonDto): string {
        return inputs.radioButton.group;
    }

    /**
     * Gets the radio button background
     * @param inputs radio button
     * @group get
     * @shortname get radio button background
     */
    getBackground(inputs: Inputs.BabylonGui.RadioButtonDto): string {
        return inputs.radioButton.background;
    }

    /**
    * Creates the selector of an observable for the radio button
    * @param inputs observable name
    * @group create
    * @shortname radio button observable selector
    */
    createRadioButtonObservableSelector(inputs: Inputs.BabylonGui.RadioButtonObservableSelectorDto): Inputs.BabylonGui.radioButtonObservableSelectorEnum {
        return inputs.selector;
    }
}
