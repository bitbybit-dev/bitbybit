
import { Context } from "../../../context";
import * as GUI from "@babylonjs/gui";
import * as Inputs from "../../../inputs/inputs";

export class BabylonGuiControl {

    constructor(private readonly context: Context) { }

    /**
     * Change the padding for the control
     * @param inputs the control and the padding values
     * @returns control that has changed padding
     * @group positioning
     * @shortname change padding
     */
    changeControlPadding(inputs: Inputs.BabylonGui.PaddingLeftRightTopBottomDto): GUI.Control {
        if (inputs.paddingLeft !== undefined) {
            inputs.control.paddingLeft = inputs.paddingLeft;
        }
        if (inputs.paddingRight !== undefined) {
            inputs.control.paddingRight = inputs.paddingRight;
        }
        if (inputs.paddingTop !== undefined) {
            inputs.control.paddingTop = inputs.paddingTop;
        }
        if (inputs.paddingBottom !== undefined) {
            inputs.control.paddingBottom = inputs.paddingBottom;
        }
        return inputs.control;
    }

    /**
     * Change the alignment for the control
     * @param inputs the control and the alignment values
     * @returns control that has changed alignment
     * @group positioning
     * @shortname change alignment
     */
    changeControlAlignment(inputs: Inputs.BabylonGui.AlignmentDto<GUI.Control>): GUI.Control {
        switch (inputs.horizontalAlignment) {
            case "left":
                inputs.control.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
                break;
            case "right":
                inputs.control.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
                break;
            case "center":
                inputs.control.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
                break;
        }
        switch (inputs.verticalAlignment) {
            case "top":
                inputs.control.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
                break;
            case "bottom":
                inputs.control.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
                break;
            case "center":
                inputs.control.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
                break;
        }
        return inputs.control;
    }

    /**
     * Clone control
     * @param inputs control to clone
     * @returns cloned control
     * @group create
     * @shortname clone control
     * @disposableOutput true
     */
    cloneControl(inputs: Inputs.BabylonGui.CloneControlDto): GUI.Control {
        const clonedControl = inputs.control.clone(inputs.host);
        if (inputs.container) {
            inputs.container.addControl(clonedControl);
        }
        if (inputs.name) {
            clonedControl.name = inputs.name;
        }
        return clonedControl;
    }

    /**
    * Creates the selector of an observable for a control
    * @param inputs observable name
    * @group create
    * @shortname control observable selector
    */
    createControlObservableSelector(inputs: Inputs.BabylonGui.ControlObservableSelectorDto): Inputs.BabylonGui.controlObservableSelectorEnum {
        return inputs.selector;
    }

    /**
     * Get control by name
     * @param inputs container and control name
     * @returns control with the name
     * @group get
     * @shortname get control by name
     */
    getControlByName(inputs: Inputs.BabylonGui.GetControlByNameDto): GUI.Control {
        return inputs.container.children.find(c => c.name === inputs.name);
    }

    /**
     * Sets the control height
     * @param inputs control and height
     * @group set
     * @shortname set control height
     */
    setHeight(inputs: Inputs.BabylonGui.SetControlHeightDto): GUI.Control {
        inputs.control.height = inputs.height;
        return inputs.control;
    }

    /**
     * Sets the control width
     * @param inputs control and width
     * @group set
     * @shortname set control width
     */
    setWidth(inputs: Inputs.BabylonGui.SetControlWidthDto): GUI.Control {
        inputs.control.width = inputs.width;
        return inputs.control;
    }

    /**
     * Sets the control color
     * @param inputs control and color
     * @group set
     * @shortname set control color
     */
    setColor(inputs: Inputs.BabylonGui.SetControlColorDto): GUI.Control {
        inputs.control.color = inputs.color;
        return inputs.control;
    }

    /**
     * Set font size
     * @param inputs control and font size
     * @returns control with changed font size
     * @group set
     * @shortname set control font size
     */
    setFontSize(inputs: Inputs.BabylonGui.SetControlFontSizeDto): GUI.Control {
        inputs.control.fontSize = inputs.fontSize;
        return inputs.control;
    }

    /**
     * Gets the height
     * @param inputs control
     * @group get
     * @shortname get control height
     */
    getHeight(inputs: Inputs.BabylonGui.ControlDto): string | number {
        return inputs.control.height;
    }

    /**
     * Gets the width
     * @param inputs control
     * @group get
     * @shortname get control width
     */
    getWidth(inputs: Inputs.BabylonGui.ControlDto): string | number {
        return inputs.control.width;
    }

    /**
     * Gets the color
     * @param inputs control
     * @group get
     * @shortname get control color
     */
    getColor(inputs: Inputs.BabylonGui.ControlDto): string {
        return inputs.control.color;
    }

    /**
     * Get control font size
     * @param inputs control
     * @returns control font size
     * @group get
     * @shortname get control font size
     */
    getFontSize(inputs: Inputs.BabylonGui.ControlDto): string | number {
        return inputs.control.fontSize;
    }
}
