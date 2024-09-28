
import { Context } from "../../../context";
import * as GUI from "@babylonjs/gui";
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
    createRadioButton(inputs: Inputs.BabylonGui.CreateRadioButtonDto): GUI.RadioButton {
        const radioButton = new GUI.RadioButton(inputs.name);

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
        if (inputs.container) {
            inputs.container.addControl(radioButton);
        }
        return radioButton;
    }

    /**
     * Sets the radio button height
     * @param inputs radio button and height
     * @group set
     * @shortname set radio button height
     */
    setHeight(inputs: Inputs.BabylonGui.SetRadioButtonHeightDto): void {
        inputs.radioButton.height = inputs.height;
    }

    /**
     * Sets the radio button width
     * @param inputs radio button and width
     * @group set
     * @shortname set radio button width
     */
    setWidth(inputs: Inputs.BabylonGui.SetRadioButtonWidthDto): void {
        inputs.radioButton.width = inputs.width;
    }

    /**
     * Sets the radio button check size ratio
     * @param inputs radio button and check size ratio
     * @group set
     * @shortname set radio button check size ratio
     */
    setCheckSizeRatio(inputs: Inputs.BabylonGui.SetRadioButtonCheckSizeRatioDto): void {
        inputs.radioButton.checkSizeRatio = inputs.checkSizeRatio;
    }

    /**
     * Sets the radio button group
     * @param inputs radio button and group
     * @group set
     * @shortname set radio button group
     */
    setGroup(inputs: Inputs.BabylonGui.SetRadioButtonGroupDto): void {
        inputs.radioButton.group = inputs.group;
    }

    /**
     * Sets the radio button color
     * @param inputs radio button and color
     * @group set
     * @shortname set radio button color
     */
    setColor(inputs: Inputs.BabylonGui.SetRadioButtonColorDto): void {
        inputs.radioButton.color = inputs.color;
    }

    /**
     * Sets the radio button background
     * @param inputs radio button and background
     * @group set
     * @shortname set radio button background
     */
    setBackground(inputs: Inputs.BabylonGui.SetRadioButtonBackgroundDto): void {
        inputs.radioButton.background = inputs.background;
    }

    /**
     * Gets the radio button height
     * @param inputs radio button
     * @group get
     * @shortname get radio button height
     */
    getHeight(inputs: Inputs.BabylonGui.RadioButtonDto): string | number {
        return inputs.radioButton.height;
    }

    /**
     * Gets the radio button width
     * @param inputs radio button
     * @group get
     * @shortname get radio button width
     */
    getWidth(inputs: Inputs.BabylonGui.RadioButtonDto): string | number {
        return inputs.radioButton.width;
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
     * Gets the radio button color
     * @param inputs radio button
     * @group get
     * @shortname get radio button color
     */
    getColor(inputs: Inputs.BabylonGui.RadioButtonDto): string {
        return inputs.radioButton.color;
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
