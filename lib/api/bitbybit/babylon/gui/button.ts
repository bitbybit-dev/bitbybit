
import { Context } from "../../../context";
import * as GUI from "@babylonjs/gui";
import * as Inputs from "../../../inputs/inputs";

export class BabylonGuiButton {

    constructor(private readonly context: Context) { }

    /**
     * Creates simple button
     * @param inputs button properties
     * @returns button
     * @group create
     * @shortname create simple button
     * @disposableOutput true
     */
    createSimpleButton(inputs: Inputs.BabylonGui.CreateButtonDto): GUI.Button {
        const button = GUI.Button.CreateSimpleButton(inputs.name, inputs.label);

        if (inputs.width) {
            button.width = inputs.width;
        } else {
            button.width = 1;
        }
        if (inputs.height) {
            button.height = inputs.height;
        } else {
            button.height = "42px";
        }

        button.color = inputs.color;
        button.fontSize = inputs.fontSize;
        button.background = inputs.background;
        inputs.container.addControl(button);
        return button;
    }

    /**
     * Set button color
     * @param inputs button and color
     * @returns button with changed color
     * @group set
     * @shortname set button color
     */
    setButtonColor(inputs: Inputs.BabylonGui.SetButtonColorDto): GUI.Button {
        inputs.button.color = inputs.color;
        return inputs.button;
    }

    /**
     * Set button background
     * @param inputs button and background
     * @returns button with changed background
     * @group set
     * @shortname set button background
     */
    setButtonBackground(inputs: Inputs.BabylonGui.SetButtonBackgroundDto): GUI.Button {
        inputs.button.background = inputs.background;
        return inputs.button;
    }

    /**
     * Set button font size
     * @param inputs button and font size
     * @returns button with changed font size
     * @group set
     * @shortname set button font size
     */
    setButtonFontSize(inputs: Inputs.BabylonGui.SetButtonFontSizeDto): GUI.Button {
        inputs.button.fontSize = inputs.fontSize;
        return inputs.button;
    }

    /**
     * Set button height
     * @param inputs button and height
     * @returns button with changed height
     * @group set
     * @shortname set button height
     */
    setButtonHeight(inputs: Inputs.BabylonGui.SetButtonHeightDto): GUI.Button {
        inputs.button.height = inputs.height;
        return inputs.button;
    }

    /**
     * Set button width
     * @param inputs button and width
     * @returns button with changed width
     * @group set
     * @shortname set button width
     */
    setButtonWidth(inputs: Inputs.BabylonGui.SetButtonWidthDto): GUI.Button {
        inputs.button.width = inputs.width;
        return inputs.button;
    }

    /**
     * Set button text
     * @param inputs button and text
     * @returns button with changed text
     * @group set
     * @shortname set button text
     */
    setButtonText(inputs: Inputs.BabylonGui.SetButtonTextDto): GUI.Button {
        inputs.button.textBlock.text = inputs.text;
        return inputs.button;
    }

    /**
     * Get button color
     * @param inputs button
     * @returns button color
     * @group get
     * @shortname get button color
     */
    getButtonColor(inputs: Inputs.BabylonGui.ButtonDto): string {
        return inputs.button.color;
    }

    /**
     * Get button background
     * @param inputs button
     * @returns button background
     * @group get
     * @shortname get button background
     */
    getButtonBackground(inputs: Inputs.BabylonGui.ButtonDto): string {
        return inputs.button.background;
    }

    /**
     * Get button font size
     * @param inputs button
     * @returns button font size
     * @group get
     * @shortname get button font size
     */
    getButtonFontSize(inputs: Inputs.BabylonGui.ButtonDto): string | number {
        return inputs.button.fontSize;
    }

    /**
     * Get button height
     * @param inputs button
     * @returns button height
     * @group get
     * @shortname get button height
     */
    getButtonHeight(inputs: Inputs.BabylonGui.ButtonDto): string | number {
        return inputs.button.height;
    }

    /**
     * Get button width
     * @param inputs button
     * @returns button width
     * @group get
     * @shortname get button width
     */
    getButtonWidth(inputs: Inputs.BabylonGui.ButtonDto): string | number {
        return inputs.button.width;
    }

    /**
     * Get button text
     * @param inputs button
     * @returns button text
     * @group get
     * @shortname get button text
     */
    getButtonText(inputs: Inputs.BabylonGui.ButtonDto): string {
        return inputs.button.textBlock.text;
    }

}
