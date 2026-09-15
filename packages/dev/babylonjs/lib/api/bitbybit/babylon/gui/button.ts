
import { Context } from "../../../context";
import * as BABYLON from "../../../../gui-enriched-babylon";
import * as Inputs from "../../../inputs";

/**
 * Push buttons with a text label. Subscribe to the button's pointer click event to run code when it
 * is pressed; the label, colors and size can be changed after creation with the `control` methods.
 */
export class BabylonGuiButton {

    constructor(_context: Context) { }

    /**
     * Creates a button with a text label, text color, background and font size; sizes are pixel
     * strings or fractions of the parent, and a size left out is chosen by the engine.
     * @param inputs - The name, the label, the colors, the optional size and the font size
     * @returns The button
     * @group create
     * @shortname create simple button
     * @disposableOutput true
     * @example
     * ```typescript
     * const button = bitbybit.babylon.gui.button.createSimpleButton({ name: "run", label: "Run", color: "black", background: "#f0cebb", width: "200px", height: "40px", fontSize: 24 });
     * panel.addControl(button);
     * button.onPointerClickObservable.add(() => { console.log("clicked"); });
     * ```
     */
    createSimpleButton(inputs: Inputs.BabylonGui.CreateButtonDto): BABYLON.GUI.Button {
        const button = BABYLON.GUI.Button.CreateSimpleButton(inputs.name, inputs.label);

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

        return button;
    }

    /**
     * Changes the label shown on a button to the given text.
     * @param inputs - The button and the text
     * @returns The same button
     * @group set
     * @shortname set button text
     */
    setButtonText(inputs: Inputs.BabylonGui.SetButtonTextDto): BABYLON.GUI.Button {
        inputs.button.textBlock!.text = inputs.text;
        return inputs.button;
    }

    /**
     * Reads the label currently shown on a button.
     * @param inputs - The button
     * @returns The label text
     * @group get
     * @shortname get button text
     */
    getButtonText(inputs: Inputs.BabylonGui.ButtonDto): string {
        return inputs.button.textBlock!.text;
    }

}
