
import { Context } from "../../../context";
import * as GUI from "@babylonjs/gui";
import * as Inputs from "../../../inputs/inputs";

export class BabylonGuiContainer {

    constructor(private readonly context: Context) { }

    /**
     * Adds control to container
     * @param inputs with container and control
     * @returns control that was added to container
     * @group controls
     * @shortname add control to container
     */
    addControl(inputs: Inputs.BabylonGui.AddControlToContainerDto): GUI.Control {
        inputs.container.addControl(inputs.control);
        return inputs.control;
    }

    /**
     * Fix control order in container based on the index provided for the control
     * @param inputs with container and control order index
     * @returns control that needs to fix the order
     * @group order
     * @shortname fix control order in container
     */
    fixControlOrderInContainer(inputs: Inputs.BabylonGui.FixControlOrderInContainerDto): GUI.Control {
        inputs.container.removeControl(inputs.control);
        inputs.container.addControl(inputs.control);
        const controls = inputs.container.children;
        const index = inputs.orderIndex;
        if (index < controls.length) {
            controls.splice(index, 0, controls.pop());
        }
        return inputs.control;
    }

    /**
     * Sets the container background
     * @param inputs container and background
     * @group set
     * @shortname set container background
     */
    setBackground(inputs: Inputs.BabylonGui.SetContainerBackgroundDto): GUI.Container {
        inputs.container.background = inputs.background;
        return inputs.container;
    }

    /**
     * Gets the container background
     * @param inputs container
     * @group get
     * @shortname get container background
     */
    getBackground(inputs: Inputs.BabylonGui.ContainerDto): string {
        return inputs.container.background;
    }

}
