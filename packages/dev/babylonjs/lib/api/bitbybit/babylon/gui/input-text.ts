/* eslint-disable @typescript-eslint/no-namespace */

import { Context } from "../../../context";
import * as Inputs from "../../../inputs";
import * as BABYLON from "../../../../gui-enriched-babylon";

export class BabylonGuiInputText {
    
    constructor(private readonly context: Context) { }

    /**
     * Creates input text
     * @param inputs input text properties
     * @returns input text
     * @group create
     * @shortname create input text
     * @disposableOutput true
     */
    createInputText(inputs: Inputs.BabylonGui.CreateInputTextDto): BABYLON.GUI.InputText {
        const inputText = new BABYLON.GUI.InputText(inputs.name);

        if (inputs.height) {
            inputText.height = inputs.height;
        } else {
            inputText.height = "56px";
        }
        if (inputs.width) {
            inputText.width = inputs.width;
        } else {
            inputText.width = 1;
        }
        inputText.text = inputs.text;
        inputText.placeholderText = inputs.placeholder;
        inputText.color = inputs.color;
        inputText.background = inputs.background;
      
        return inputText;
    }

    /**
     * Sets the input text background
     * @param inputs input text and background
     * @returns input text
     * @group set
     * @shortname set input text background
     */
    setBackground(inputs: Inputs.BabylonGui.SetInputTextBackgroundDto): BABYLON.GUI.InputText {
        inputs.inputText.background = inputs.background;
        return inputs.inputText;
    }

    /**
     * Sets the input text text
     * @param inputs input text and text
     * @returns input text
     * @group set
     * @shortname set input text text
     */
    setText(inputs: Inputs.BabylonGui.SetInputTextTextDto): BABYLON.GUI.InputText {
        inputs.inputText.text = inputs.text;
        return inputs.inputText;
    }

    /**
     * Sets the input text placeholder
     * @param inputs input text and placeholder
     * @returns input text
     * @group set
     * @shortname set input text placeholder
     */
    setPlaceholder(inputs: Inputs.BabylonGui.SetInputTextPlaceholderDto): BABYLON.GUI.InputText {
        inputs.inputText.placeholderText = inputs.placeholder;
        return inputs.inputText;
    }

    /**
     * Gets the input text background
     * @param inputs input text
     * @returns input text background
     * @group get
     * @shortname get input text background
     */
    getBackground(inputs: Inputs.BabylonGui.InputTextDto): string {
        return inputs.inputText.background;
    }

    /**
     * Gets the input text text
     * @param inputs input text
     * @returns input text text
     * @group get
     * @shortname get input text text
     */
    getText(inputs: Inputs.BabylonGui.InputTextDto): string {
        return inputs.inputText.text;
    }

    /**
     * Gets the input text placeholder
     * @param inputs input text
     * @returns input text placeholder
     * @group get
     * @shortname get input text placeholder
     */
    getPlaceholder(inputs: Inputs.BabylonGui.InputTextDto): string {
        return inputs.inputText.placeholderText;
    }

    /**
     * Creates the selector of an observable for the input text
     * @param inputs observable name
     * @group create
     * @shortname input text observable selector
     */
    createInputTextObservableSelector(inputs: Inputs.BabylonGui.InputTextObservableSelectorDto): Inputs.BabylonGui.inputTextObservableSelectorEnum {
        return inputs.selector;
    }
}
