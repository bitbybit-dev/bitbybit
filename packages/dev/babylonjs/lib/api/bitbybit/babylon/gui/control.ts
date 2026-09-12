
import { Context } from "../../../context";
import * as BABYLON from "../../../../gui-enriched-babylon";
import * as Inputs from "../../../inputs";

/**
 * What every GUI control shares, whatever its kind: padding, alignment inside its parent, size,
 * color, font size, visibility, the enabled and read-only states and cloning. Sizes are pixel
 * strings such as `200px` or fractions of the parent from 0 to 1. The setters change the control in
 * place and give it back so calls can be chained.
 */
export class BabylonGuiControl {

    constructor(_context: Context) { }

    /**
     * Sets the space kept clear around a control inside its parent, per side; a side left out keeps
     * its padding. Values are pixel strings such as `10px` or fractions of the parent.
     * @param inputs - The control and the four paddings
     * @returns The same control
     * @group positioning
     * @shortname change padding
     * @example
     * ```typescript
     * bitbybit.babylon.gui.control.changeControlPadding({ control: button, paddingLeft: "10px", paddingRight: "10px", paddingTop: "4px", paddingBottom: "4px" });
     * ```
     */
    changeControlPadding(inputs: Inputs.BabylonGui.PaddingLeftRightTopBottomDto): BABYLON.GUI.Control {
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
     * Sets where a control sits inside its parent: left, center or right, and top, center or
     * bottom.
     * @param inputs - The control and the two alignments
     * @returns The same control
     * @group positioning
     * @shortname change alignment
     * @example
     * ```typescript
     * bitbybit.babylon.gui.control.changeControlAlignment({ control: panel, horizontalAlignment: Bit.Inputs.BabylonGui.horizontalAlignmentEnum.left, verticalAlignment: Bit.Inputs.BabylonGui.verticalAlignmentEnum.top });
     * ```
     */
    changeControlAlignment(inputs: Inputs.BabylonGui.AlignmentDto<BABYLON.GUI.Control>): BABYLON.GUI.Control {
        switch (inputs.horizontalAlignment) {
            case "left":
                inputs.control.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
                break;
            case "right":
                inputs.control.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
                break;
            case "center":
                inputs.control.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
                break;
        }
        switch (inputs.verticalAlignment) {
            case "top":
                inputs.control.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
                break;
            case "bottom":
                inputs.control.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
                break;
            case "center":
                inputs.control.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
                break;
        }
        return inputs.control;
    }

    /**
     * Makes a copy of a control with all its settings, names it and adds it to `container` when one
     * is given; `host` is the GUI texture the copy belongs to.
     * @param inputs - The control, the optional container, the name and the optional host texture
     * @returns The copy
     * @group create
     * @shortname clone control
     * @disposableOutput true
     * @example
     * ```typescript
     * const second = bitbybit.babylon.gui.control.cloneControl({ control: button, container: panel, name: "second", host: ui });
     * ```
     */
    cloneControl(inputs: Inputs.BabylonGui.CloneControlDto): BABYLON.GUI.Control {
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
     * Passes through the name of a control event, such as a pointer click or pointer enter, as a
     * typed selector for code that subscribes to control events by name.
     * @param inputs - The event selector
     * @returns The same selector
     * @group create
     * @shortname control observable selector
     * @example
     * ```typescript
     * const selector = bitbybit.babylon.gui.control.createControlObservableSelector({ selector: Bit.Inputs.BabylonGui.controlObservableSelectorEnum.onPointerClickObservable });
     * ```
     */
    createControlObservableSelector(inputs: Inputs.BabylonGui.ControlObservableSelectorDto): Inputs.BabylonGui.controlObservableSelectorEnum {
        return inputs.selector;
    }

    /**
     * Finds a control by its name inside a container, searching its children too.
     * @param inputs - The container and the name
     * @returns The control with that name
     * @group get
     * @shortname get control by name
     * @example
     * ```typescript
     * const button = bitbybit.babylon.gui.control.getControlByName({ container: panel, name: "buttonName" });
     * ```
     */
    getControlByName(inputs: Inputs.BabylonGui.GetControlByNameDto): BABYLON.GUI.Control {
        return inputs.container.children.find(c => c.name === inputs.name)!;
    }

    /**
     * Shows or hides a control; a hidden control keeps its place in a stack panel's layout.
     * @param inputs - The control and the flag
     * @returns The same control
     * @group set
     * @shortname set control is visible
     */
    setIsVisible(inputs: Inputs.BabylonGui.SetControlIsVisibleDto): BABYLON.GUI.Control {
        inputs.control.isVisible = inputs.isVisible;
        return inputs.control;
    }

    /**
     * Makes a control read-only or editable again; a read-only control is shown normally but
     * ignores input.
     * @param inputs - The control and the flag
     * @returns The same control
     * @group set
     * @shortname set control is readonly
     */
    setIsReadonly(inputs: Inputs.BabylonGui.SetControlIsReadonlyDto): BABYLON.GUI.Control {
        inputs.control.isReadOnly = inputs.isReadOnly;
        return inputs.control;
    }

    /**
     * Enables or disables a control; a disabled control is drawn dimmed and ignores input.
     * @param inputs - The control and the flag
     * @returns The same control
     * @group set
     * @shortname set control is enabled
     */
    setIsEnabled(inputs: Inputs.BabylonGui.SetControlIsEnabledDto): BABYLON.GUI.Control {
        inputs.control.isEnabled = inputs.isEnabled;
        return inputs.control;
    }

    /**
     * Sets the height of a control, as a pixel string such as `40px` or a fraction of the parent
     * from 0 to 1.
     * @param inputs - The control and the height
     * @returns The same control
     * @group set
     * @shortname set control height
     */
    setHeight(inputs: Inputs.BabylonGui.SetControlHeightDto): BABYLON.GUI.Control {
        inputs.control.height = inputs.height;
        return inputs.control;
    }

    /**
     * Sets the width of a control, as a pixel string such as `200px` or a fraction of the parent
     * from 0 to 1.
     * @param inputs - The control and the width
     * @returns The same control
     * @group set
     * @shortname set control width
     */
    setWidth(inputs: Inputs.BabylonGui.SetControlWidthDto): BABYLON.GUI.Control {
        inputs.control.width = inputs.width;
        return inputs.control;
    }

    /**
     * Sets the main color of a control, the text color of a button or text block and the fill color
     * of a slider or checkbox, as a CSS color.
     * @param inputs - The control and the color
     * @returns The same control
     * @group set
     * @shortname set control color
     */
    setColor(inputs: Inputs.BabylonGui.SetControlColorDto): BABYLON.GUI.Control {
        inputs.control.color = inputs.color;
        return inputs.control;
    }

    /**
     * Sets the font size of a control's text, as a number of pixels or a string such as `24px`.
     * @param inputs - The control and the font size
     * @returns The same control
     * @group set
     * @shortname set control font size
     */
    setFontSize(inputs: Inputs.BabylonGui.SetControlFontSizeDto): BABYLON.GUI.Control {
        inputs.control.fontSize = inputs.fontSize;
        return inputs.control;
    }

    /**
     * Reads the height of a control, as a pixel string or a fraction of the parent.
     * @param inputs - The control
     * @returns The height
     * @group get
     * @shortname get control height
     */
    getHeight(inputs: Inputs.BabylonGui.ControlDto): string | number {
        return inputs.control.height;
    }

    /**
     * Reads the width of a control, as a pixel string or a fraction of the parent.
     * @param inputs - The control
     * @returns The width
     * @group get
     * @shortname get control width
     */
    getWidth(inputs: Inputs.BabylonGui.ControlDto): string | number {
        return inputs.control.width;
    }

    /**
     * Reads the main color of a control as a CSS color string.
     * @param inputs - The control
     * @returns The color
     * @group get
     * @shortname get control color
     */
    getColor(inputs: Inputs.BabylonGui.ControlDto): string {
        return inputs.control.color;
    }

    /**
     * Reads the font size of a control's text, as a string such as `24px` or a number of pixels.
     * @param inputs - The control
     * @returns The font size
     * @group get
     * @shortname get control font size
     */
    getFontSize(inputs: Inputs.BabylonGui.ControlDto): string | number {
        return inputs.control.fontSize;
    }

    /**
     * Reads whether a control is shown rather than hidden.
     * @param inputs - The control
     * @returns True when the control is visible
     * @group get
     * @shortname get control is visible
     */
    getIsVisible(inputs: Inputs.BabylonGui.ControlDto): boolean {
        return inputs.control.isVisible;
    }

    /**
     * Reads whether a control ignores input while still being shown normally.
     * @param inputs - The control
     * @returns True when the control is read-only
     * @group get
     * @shortname get control is readonly
     */
    getIsReadonly(inputs: Inputs.BabylonGui.ControlDto): boolean {
        return inputs.control.isReadOnly;
    }

    /**
     * Reads whether a control is enabled rather than dimmed and inactive.
     * @param inputs - The control
     * @returns True when the control is enabled
     * @group get
     * @shortname get control is enabled
     */
    getIsEnabled(inputs: Inputs.BabylonGui.ControlDto): boolean {
        return inputs.control.isEnabled;
    }
}
