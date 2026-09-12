
import { Context } from "../../../context";
import * as BABYLON from "../../../../gui-enriched-babylon";
import * as Inputs from "../../../inputs";

/**
 * A stack panel lays its child controls out one after another, top to bottom or left to right, with
 * a spacing between them, and is the usual way to build a column of controls. Add it to a GUI
 * texture and its children to it with `container.addControls`.
 */
export class BabylonGuiStackPanel {

    constructor(_context: Context) { }

    /**
     * Creates a panel that stacks its children vertically, or horizontally when `isVertical` is
     * false, with `spacing` pixels between them.
     *
     * Give a vertical panel a width and a horizontal one a height; the other size grows with the
     * children.
     * @param inputs - The name, the direction, the spacing, the optional sizes and the colors
     * @returns The stack panel
     * @group create
     * @shortname create stack panel
     * @disposableOutput true
     * @example
     * ```typescript
     * const panel = bitbybit.babylon.gui.stackPanel.createStackPanel({ name: "panel", isVertical: true, spacing: 8, width: "300px", height: "400px", color: "#00000000", background: "#00000055" });
     * ui.addControl(panel);
     * ```
     */
    createStackPanel(inputs: Inputs.BabylonGui.CreateStackPanelDto): BABYLON.GUI.StackPanel {
        const stackPanel = new BABYLON.GUI.StackPanel(inputs.name);
        stackPanel.isVertical = inputs.isVertical;
        stackPanel.spacing = inputs.spacing;
        stackPanel.onDisposeObservable.add((s) => {
            (s as BABYLON.GUI.StackPanel).clearControls();
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
        return stackPanel;
    }

    /**
     * Switches a stack panel between stacking its children top to bottom, when true, and left to
     * right.
     * @param inputs - The stack panel and the flag
     * @returns The same stack panel
     * @group set
     * @shortname set stack panel is vertical
     */
    setIsVertical(inputs: Inputs.BabylonGui.SetStackPanelIsVerticalDto): BABYLON.GUI.StackPanel {
        inputs.stackPanel.isVertical = inputs.isVertical;
        return inputs.stackPanel;
    }

    /**
     * Sets the gap in pixels between the children of a stack panel.
     * @param inputs - The stack panel and the spacing
     * @returns The same stack panel
     * @group set
     * @shortname set stack panel spacing
     */
    setSpacing(inputs: Inputs.BabylonGui.SetStackPanelSpacingDto): BABYLON.GUI.StackPanel {
        inputs.stackPanel.spacing = inputs.spacing;
        return inputs.stackPanel;
    }

    /**
     * Sets the width of a stack panel, as a pixel string or a fraction of the parent; a horizontal
     * panel sizes its width from its children instead.
     * @param inputs - The stack panel and the width
     * @returns The same stack panel
     * @group set
     * @shortname set stack panel width
     */
    setWidth(inputs: Inputs.BabylonGui.SetStackPanelWidthDto): BABYLON.GUI.StackPanel {
        inputs.stackPanel.width = inputs.width;
        return inputs.stackPanel;
    }

    /**
     * Sets the height of a stack panel, as a pixel string or a fraction of the parent; a vertical
     * panel sizes its height from its children instead.
     * @param inputs - The stack panel and the height
     * @returns The same stack panel
     * @group set
     * @shortname set stack panel height
     */
    setHeight(inputs: Inputs.BabylonGui.SetStackPanelHeightDto): BABYLON.GUI.StackPanel {
        inputs.stackPanel.height = inputs.height;
        return inputs.stackPanel;
    }

    /**
     * Reads whether a stack panel stacks its children top to bottom.
     * @param inputs - The stack panel
     * @returns True when the panel is vertical
     * @group get
     * @shortname get stack panel is vertical
     */
    getIsVertical(inputs: Inputs.BabylonGui.StackPanelDto): boolean {
        return inputs.stackPanel.isVertical;
    }

    /**
     * Reads the gap in pixels between the children of a stack panel.
     * @param inputs - The stack panel
     * @returns The spacing
     * @group get
     * @shortname get stack panel spacing
     */
    getSpacing(inputs: Inputs.BabylonGui.StackPanelDto): number {
        return inputs.stackPanel.spacing;
    }

    /**
     * Reads the width of a stack panel, as a pixel string or a fraction.
     * @param inputs - The stack panel
     * @returns The width
     * @group get
     * @shortname get stack panel width
     */
    getWidth(inputs: Inputs.BabylonGui.StackPanelDto): string | number {
        return inputs.stackPanel.width;
    }

    /**
     * Reads the height of a stack panel, as a pixel string or a fraction.
     * @param inputs - The stack panel
     * @returns The height
     * @group get
     * @shortname get stack panel height
     */
    getHeight(inputs: Inputs.BabylonGui.StackPanelDto): string | number {
        return inputs.stackPanel.height;
    }
}
