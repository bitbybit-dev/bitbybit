
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

    /**
     * Set stack panel is vertical
     * @param inputs with stack panel and is vertical
     * @returns stack panel with changed is vertical
     * @group set
     * @shortname set stack panel is vertical
     */
    setIsVertical(inputs: Inputs.BabylonGui.SetStackPanelIsVerticalDto): GUI.StackPanel {
        inputs.stackPanel.isVertical = inputs.isVertical;
        return inputs.stackPanel;
    }

    /**
     * Set stack panel spacing
     * @param inputs with stack panel and spacing
     * @returns stack panel with changed spacing
     * @group set
     * @shortname set stack panel spacing
     */
    setSpacing(inputs: Inputs.BabylonGui.SetStackPanelSpacingDto): GUI.StackPanel {
        inputs.stackPanel.spacing = inputs.spacing;
        return inputs.stackPanel;
    }

    /**
     * Set stack panel width
     * @param inputs with stack panel and width
     * @returns stack panel with changed width
     * @group set
     * @shortname set stack panel width
     */
    setWidth(inputs: Inputs.BabylonGui.SetStackPanelWidthDto): GUI.StackPanel {
        inputs.stackPanel.width = inputs.width;
        return inputs.stackPanel;
    }

    /**
     * Set stack panel height
     * @param inputs with stack panel and height
     * @returns stack panel with changed height
     * @group set
     * @shortname set stack panel height
     */
    setHeight(inputs: Inputs.BabylonGui.SetStackPanelHeightDto): GUI.StackPanel {
        inputs.stackPanel.height = inputs.height;
        return inputs.stackPanel;
    }

    /**
     * Set stack panel color
     * @param inputs with stack panel and color
     * @returns stack panel with changed color
     * @group set
     * @shortname set stack panel color
     */
    setColor(inputs: Inputs.BabylonGui.SetStackPanelColorDto): GUI.StackPanel {
        inputs.stackPanel.color = inputs.color;
        return inputs.stackPanel;
    }

    /**
     * Set stack panel background
     * @param inputs with stack panel and background
     * @returns stack panel with changed background
     * @group set
     * @shortname set stack panel background
     */
    setBackground(inputs: Inputs.BabylonGui.SetStackPanelBackgroundDto): GUI.StackPanel {
        inputs.stackPanel.background = inputs.background;
        return inputs.stackPanel;
    }

    /**
     * Get stack panel is vertical
     * @param inputs with stack panel
     * @returns stack panel is vertical
     * @group get
     * @shortname get stack panel is vertical
     */
    getIsVertical(inputs: Inputs.BabylonGui.StackPanelDto): boolean {
        return inputs.stackPanel.isVertical;
    }

    /**
     * Get stack panel spacing
     * @param inputs with stack panel
     * @returns stack panel spacing
     * @group get
     * @shortname get stack panel spacing
     */
    getSpacing(inputs: Inputs.BabylonGui.StackPanelDto): number {
        return inputs.stackPanel.spacing;
    }

    /**
     * Get stack panel width
     * @param inputs with stack panel
     * @returns stack panel width
     * @group get
     * @shortname get stack panel width
     */
    getWidth(inputs: Inputs.BabylonGui.StackPanelDto): string | number {
        return inputs.stackPanel.width;
    }

    /**
     * Get stack panel height
     * @param inputs with stack panel
     * @returns stack panel height
     * @group get
     * @shortname get stack panel height
     */
    getHeight(inputs: Inputs.BabylonGui.StackPanelDto): string | number {
        return inputs.stackPanel.height;
    }

    /**
     * Get stack panel color
     * @param inputs with stack panel
     * @returns stack panel color
     * @group get
     * @shortname get stack panel color
     */
    getColor(inputs: Inputs.BabylonGui.StackPanelDto): string {
        return inputs.stackPanel.color;
    }

    /**
     * Get stack panel background
     * @param inputs with stack panel
     * @returns stack panel background
     * @group get
     * @shortname get stack panel background
     */
    getBackground(inputs: Inputs.BabylonGui.StackPanelDto): string {
        return inputs.stackPanel.background;
    }

}
