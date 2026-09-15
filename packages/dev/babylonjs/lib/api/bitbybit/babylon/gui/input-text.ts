 

import { Context } from "../../../context";
import * as Inputs from "../../../inputs";
import * as BABYLON from "../../../../gui-enriched-babylon";

/**
 * Single-line text fields the user can type into, with a placeholder shown while empty. Subscribe
 * to the text changed event to react to typing.
 */
export class BabylonGuiInputText {
    
    constructor(_context: Context) { }

    /**
     * Creates a text field holding `text`, showing `placeholder` while it is empty, in the given
     * colors; sizes are pixel strings or fractions of the parent.
     * @param inputs - The name, the text, the placeholder, the colors and the optional size
     * @returns The text field
     * @group create
     * @shortname create input text
     * @disposableOutput true
     * @example
     * ```typescript
     * const input = bitbybit.babylon.gui.inputText.createInputText({ name: "label", text: "", placeholder: "Type a label", color: "#f0cebb", background: "black", width: "300px", height: "40px" });
     * panel.addControl(input);
     * input.onTextChangedObservable.add((field) => { console.log(field.text); });
     * ```
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
     * Sets the background color of a text field, as a CSS color.
     * @param inputs - The text field and the background color
     * @returns The same text field
     * @group set
     * @shortname set input text background
     */
    setBackground(inputs: Inputs.BabylonGui.SetInputTextBackgroundDto): BABYLON.GUI.InputText {
        inputs.inputText.background = inputs.background;
        return inputs.inputText;
    }

    /**
     * Replaces the text a text field holds, which fires its text changed event like typing would.
     * @param inputs - The text field and the text
     * @returns The same text field
     * @group set
     * @shortname set input text text
     */
    setText(inputs: Inputs.BabylonGui.SetInputTextTextDto): BABYLON.GUI.InputText {
        inputs.inputText.text = inputs.text;
        return inputs.inputText;
    }

    /**
     * Sets the hint a text field shows while it is empty.
     * @param inputs - The text field and the placeholder
     * @returns The same text field
     * @group set
     * @shortname set input text placeholder
     */
    setPlaceholder(inputs: Inputs.BabylonGui.SetInputTextPlaceholderDto): BABYLON.GUI.InputText {
        inputs.inputText.placeholderText = inputs.placeholder;
        return inputs.inputText;
    }

    /**
     * Reads the background color of a text field.
     * @param inputs - The text field
     * @returns The background color
     * @group get
     * @shortname get input text background
     */
    getBackground(inputs: Inputs.BabylonGui.InputTextDto): string {
        return inputs.inputText.background;
    }

    /**
     * Reads the text a text field currently holds, as typed by the user.
     * @param inputs - The text field
     * @returns The text
     * @group get
     * @shortname get input text text
     */
    getText(inputs: Inputs.BabylonGui.InputTextDto): string {
        return inputs.inputText.text;
    }

    /**
     * Reads the hint a text field shows while it is empty.
     * @param inputs - The text field
     * @returns The placeholder
     * @group get
     * @shortname get input text placeholder
     */
    getPlaceholder(inputs: Inputs.BabylonGui.InputTextDto): string {
        return inputs.inputText.placeholderText;
    }

    /**
     * Passes through the name of a text field event, its text changing, as a typed selector for
     * code that subscribes to text field events by name.
     * @param inputs - The event selector
     * @returns The same selector
     * @group create
     * @shortname input text observable selector
     */
    createInputTextObservableSelector(inputs: Inputs.BabylonGui.InputTextObservableSelectorDto): Inputs.BabylonGui.inputTextObservableSelectorEnum {
        return inputs.selector;
    }
}
