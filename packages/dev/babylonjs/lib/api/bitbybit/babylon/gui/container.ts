
import { Context } from "../../../context";
import * as BABYLON from "../../../../gui-enriched-babylon";
import * as Inputs from "../../../inputs";

/**
 * What every container control shares: adding child controls, a background color and the read-only
 * state. Stack panels are containers, and so is the root of a GUI texture.
 */
export class BabylonGuiContainer {

    constructor(_context: Context) { }

    /**
     * Adds controls to a container in the given order; with `clearControlsFirst` true the container
     * is emptied first, so the order is exactly the list's.
     * @param inputs - The container, the controls and whether to empty the container first
     * @returns The same container
     * @group controls
     * @shortname add controls to container
     * @example
     * ```typescript
     * bitbybit.babylon.gui.container.addControls({ container: panel, controls: [title, slider, button], clearControlsFirst: true });
     * ```
     */
    addControls(inputs: Inputs.BabylonGui.AddControlsToContainerDto): BABYLON.GUI.Container {
        if(inputs.clearControlsFirst && inputs.container.clearControls){
            inputs.container.clearControls();
        }
        inputs.controls.forEach(control => inputs.container.addControl(control));
        return inputs.container;
    }

    /**
     * Sets the background color of a container as a CSS color; an eight-digit hex such as
     * `#00000055` makes it translucent.
     * @param inputs - The container and the background color
     * @returns The same container
     * @group set
     * @shortname set container background
     */
    setBackground(inputs: Inputs.BabylonGui.SetContainerBackgroundDto): BABYLON.GUI.Container {
        inputs.container.background = inputs.background;
        return inputs.container;
    }

    /**
     * Makes a container and everything in it read-only or editable again.
     * @param inputs - The container and the flag
     * @returns The same container
     * @group set
     * @shortname set container is readonly
     */
    setIsReadonly(inputs: Inputs.BabylonGui.SetContainerIsReadonlyDto): BABYLON.GUI.Container {
        inputs.container.isReadOnly = inputs.isReadOnly;
        return inputs.container;
    }

    /**
     * Reads the background color of a container as a CSS color string.
     * @param inputs - The container
     * @returns The background color
     * @group get
     * @shortname get container background
     */
    getBackground(inputs: Inputs.BabylonGui.ContainerDto): string {
        return inputs.container.background;
    }

    /**
     * Reads whether a container and its children are read-only.
     * @param inputs - The container
     * @returns True when the container is read-only
     * @group get
     * @shortname get container is readonly
     */
    getIsReadonly(inputs: Inputs.BabylonGui.ContainerDto): boolean {
        return inputs.container.isReadOnly;
    }

}
