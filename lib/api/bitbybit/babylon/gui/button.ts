
import { Context } from "../../../context";
import * as GUI from "@babylonjs/gui";
import * as Inputs from "../../../inputs/inputs";

export class BabylonGuiButton {

    constructor(private readonly context: Context) { }

    /**
     * Creates simple button
     * @param inputs button properties
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

}
