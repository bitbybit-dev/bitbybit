
import { Context } from "../../../context";
import * as BABYLON from "../../../../gui-enriched-babylon";
import * as Inputs from "../../../inputs";

/**
 * Checkboxes: square toggles that are on or off, for yes or no choices. Subscribe to the checked
 * changed event to react to the user.
 */
export class BabylonGuiCheckbox {

    constructor(_context: Context) { }

    /**
     * Creates a checkbox that starts checked or not; `checkSizeRatio` is how much of the square the
     * inner mark fills.
     * @param inputs - The name, the checked state, the mark size, the colors and the optional size
     * @returns The checkbox
     * @group create
     * @shortname create checkbox
     * @disposableOutput true
     * @example
     * ```typescript
     * const checkbox = bitbybit.babylon.gui.checkbox.createCheckbox({ name: "showEdges", isChecked: true, checkSizeRatio: 0.8, color: "#f0cebb", background: "black", width: "30px", height: "30px" });
     * panel.addControl(checkbox);
     * checkbox.onIsCheckedChangedObservable.add((checked) => { console.log(checked); });
     * ```
     */
    createCheckbox(inputs: Inputs.BabylonGui.CreateCheckboxDto): BABYLON.GUI.Checkbox {
        const checkbox = new BABYLON.GUI.Checkbox(inputs.name);

        if (inputs.height) {
            checkbox.height = inputs.height;
        } else {
            checkbox.height = "32px";
        }
        if (inputs.width) {
            checkbox.width = inputs.width;
        } else {
            checkbox.width = "32px";
        }

        checkbox.checkSizeRatio = inputs.checkSizeRatio;
        checkbox.color = inputs.color;
        checkbox.isChecked = inputs.isChecked;
        checkbox.background = inputs.background;

        return checkbox;
    }

    /**
     * Sets the background color of a checkbox's square, as a CSS color.
     * @param inputs - The checkbox and the background color
     * @returns The same checkbox
     * @group set
     * @shortname set checkbox background
     */
    setBackground(inputs: Inputs.BabylonGui.SetCheckboxBackgroundDto): BABYLON.GUI.Checkbox {
        inputs.checkbox.background = inputs.background;
        return inputs.checkbox;
    }

    /**
     * Sets how much of a checkbox's square its inner mark fills, from 0 to 1.
     * @param inputs - The checkbox and the ratio
     * @returns The same checkbox
     * @group set
     * @shortname set checkbox check size ratio
     */
    setCheckSizeRatio(inputs: Inputs.BabylonGui.SetCheckboxCheckSizeRatioDto): BABYLON.GUI.Checkbox {
        inputs.checkbox.checkSizeRatio = inputs.checkSizeRatio;
        return inputs.checkbox;
    }

    /**
     * Checks or unchecks a checkbox, which fires its checked changed event like a click would.
     * @param inputs - The checkbox and the flag
     * @returns The same checkbox
     * @group set
     * @shortname set checkbox is checked
     */
    setIsChecked(inputs: Inputs.BabylonGui.SetCheckboxIsCheckedDto): BABYLON.GUI.Checkbox {
        inputs.checkbox.isChecked = inputs.isChecked;
        return inputs.checkbox;
    }

    /**
     * Reads how much of a checkbox's square its inner mark fills.
     * @param inputs - The checkbox
     * @returns The ratio
     * @group get
     * @shortname get check size ratio
     */
    getCheckSizeRatio(inputs: Inputs.BabylonGui.CheckboxDto): number {
        return inputs.checkbox.checkSizeRatio;
    }

    /**
     * Reads whether a checkbox is currently checked, true for on.
     * @param inputs - The checkbox
     * @returns True when checked
     * @group get
     * @shortname get is checked
     */
    getIsChecked(inputs: Inputs.BabylonGui.CheckboxDto): boolean {
        return inputs.checkbox.isChecked;
    }

    /**
     * Reads the background color of a checkbox's square.
     * @param inputs - The checkbox
     * @returns The background color
     * @group get
     * @shortname get checkbox background
     */
    getBackground(inputs: Inputs.BabylonGui.CheckboxDto): string {
        return inputs.checkbox.background;
    }

    /**
     * Passes through the name of a checkbox event, its checked state changing, as a typed selector
     * for code that subscribes to checkbox events by name.
     * @param inputs - The event selector
     * @returns The same selector
     * @group create
     * @shortname checkbox observable selector
     */
    createCheckboxObservableSelector(inputs: Inputs.BabylonGui.CheckboxObservableSelectorDto): Inputs.BabylonGui.checkboxObservableSelectorEnum {
        return inputs.selector;
    }
}
