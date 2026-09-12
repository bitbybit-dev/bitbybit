
import { Context } from "../../../context";
import * as BABYLON from "../../../../gui-enriched-babylon";
import * as Inputs from "../../../inputs";

/**
 * Radio buttons: round toggles of which only one per `group` can be checked at a time, for picking
 * one option from a few. Subscribe to the checked changed event to react to the user.
 */
export class BabylonGuiRadioButton {

    constructor(_context: Context) { }

    /**
     * Creates a radio button in a `group`; checking one radio button unchecks the others of the
     * same group. `checkSizeRatio` is how much of the circle the inner dot fills.
     * @param inputs - The name, the group, the checked state, the dot size, the colors and the optional size
     * @returns The radio button
     * @group create
     * @shortname create radio button
     * @disposableOutput true
     * @example
     * ```typescript
     * const optionA = bitbybit.babylon.gui.radioButton.createRadioButton({ name: "optionA", group: "material", isChecked: true, checkSizeRatio: 0.8, color: "#f0cebb", background: "black", width: "30px", height: "30px" });
     * panel.addControl(optionA);
     * optionA.onIsCheckedChangedObservable.add((checked) => { console.log(checked); });
     * ```
     */
    createRadioButton(inputs: Inputs.BabylonGui.CreateRadioButtonDto): BABYLON.GUI.RadioButton {
        const radioButton = new BABYLON.GUI.RadioButton(inputs.name);

        if (inputs.height) {
            radioButton.height = inputs.height;
        } else {
            radioButton.height = "32px";
        }
        if (inputs.width) {
            radioButton.width = inputs.width;
        } else {
            radioButton.width = "32px";
        }

        radioButton.checkSizeRatio = inputs.checkSizeRatio;
        radioButton.group = inputs.group;
        radioButton.color = inputs.color;
        radioButton.isChecked = inputs.isChecked;
        radioButton.background = inputs.background;
   
        return radioButton;
    }

    /**
     * Sets how much of a radio button's circle its inner dot fills, from 0 to 1.
     * @param inputs - The radio button and the ratio
     * @returns The same radio button
     * @group set
     * @shortname set radio button check size ratio
     */
    setCheckSizeRatio(inputs: Inputs.BabylonGui.SetRadioButtonCheckSizeRatioDto): BABYLON.GUI.RadioButton {
        inputs.radioButton.checkSizeRatio = inputs.checkSizeRatio;
        return inputs.radioButton;
    }

    /**
     * Moves a radio button to a group; only one radio button of a group can be checked at a time.
     * @param inputs - The radio button and the group name
     * @returns The same radio button
     * @group set
     * @shortname set radio button group
     */
    setGroup(inputs: Inputs.BabylonGui.SetRadioButtonGroupDto): BABYLON.GUI.RadioButton {
        inputs.radioButton.group = inputs.group;
        return inputs.radioButton;
    }

    /**
     * Sets the background color of a radio button's circle, as a CSS color.
     * @param inputs - The radio button and the background color
     * @returns The same radio button
     * @group set
     * @shortname set radio button background
     */
    setBackground(inputs: Inputs.BabylonGui.SetRadioButtonBackgroundDto): BABYLON.GUI.RadioButton {
        inputs.radioButton.background = inputs.background;
        return inputs.radioButton;
    }

    /**
     * Reads how much of a radio button's circle its inner dot fills.
     * @param inputs - The radio button
     * @returns The ratio
     * @group get
     * @shortname get radio button check size ratio
     */
    getCheckSizeRatio(inputs: Inputs.BabylonGui.RadioButtonDto): number {
        return inputs.radioButton.checkSizeRatio;
    }

    /**
     * Reads the group a radio button belongs to.
     * @param inputs - The radio button
     * @returns The group name
     * @group get
     * @shortname get radio button group
     */
    getGroup(inputs: Inputs.BabylonGui.RadioButtonDto): string {
        return inputs.radioButton.group;
    }

    /**
     * Reads the background color of a radio button's circle.
     * @param inputs - The radio button
     * @returns The background color
     * @group get
     * @shortname get radio button background
     */
    getBackground(inputs: Inputs.BabylonGui.RadioButtonDto): string {
        return inputs.radioButton.background;
    }

    /**
     * Passes through the name of a radio button event, its checked state changing, as a typed
     * selector for code that subscribes to radio button events by name.
     * @param inputs - The event selector
     * @returns The same selector
     * @group create
     * @shortname radio button observable selector
     */
    createRadioButtonObservableSelector(inputs: Inputs.BabylonGui.RadioButtonObservableSelectorDto): Inputs.BabylonGui.radioButtonObservableSelectorEnum {
        return inputs.selector;
    }
}
