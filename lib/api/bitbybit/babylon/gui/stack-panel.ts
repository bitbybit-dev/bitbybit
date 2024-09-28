
import { Context } from "../../../context";
import * as GUI from "@babylonjs/gui";
import * as Inputs from "../../../inputs/inputs";

export class BabylonGuiStackPanel {

    constructor(private readonly context: Context) { }

    /**
     * Creates stack panel
     * @param inputs stack panel props
     * @group create
     * @shortname create stack panel
     * @disposableOutput true
     */
    createStackPanel(inputs: Inputs.BabylonGui.CreateStackPanelDto): GUI.StackPanel {
        const stackPanel = new GUI.StackPanel(inputs.name);
        stackPanel.isVertical = inputs.isVertical;
        stackPanel.spacing = inputs.spacing;
        stackPanel.onDisposeObservable.add((s: GUI.StackPanel) => {
            s.clearControls();
        });
        if (inputs.width !== undefined) {
            stackPanel.width = inputs.width;
        } else {
            stackPanel.width = 1;
        }
        if (inputs.height !== undefined) {
            stackPanel.height = inputs.height;
        }
        if (inputs.color !== undefined) {
            stackPanel.color = inputs.color;
        }
        if (inputs.background !== undefined) {
            stackPanel.background = inputs.background;
        }
        if (inputs.container) {
            inputs.container.addControl(stackPanel);
        }
        return stackPanel;
    }

}
