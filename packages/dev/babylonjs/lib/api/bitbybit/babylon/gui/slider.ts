
import { Context } from "../../../context";
import * as BABYLON from "../../../../gui-enriched-babylon";
import * as Inputs from "../../../inputs";

/**
 * Sliders for picking a number between a minimum and a maximum by dragging a thumb, horizontally or
 * vertically. Subscribe to the value changed event to react to the user; the range, step, value,
 * colors and thumb can be changed after creation.
 */
export class BabylonGuiSlider {

    constructor(_context: Context) { }

    /**
     * Creates a slider that picks a number from `minimum` to `maximum` in multiples of `step`,
     * starting at `value`.
     *
     * A horizontal slider takes the parent's width unless `width` is given; a vertical one takes
     * its height. The thumb is white until `changeSliderThumb` changes it.
     * @param inputs - The name, the range, the value, the step, the direction, the colors, the optional size and the thumb flag
     * @returns The slider
     * @group create
     * @shortname create slider
     * @disposableOutput true
     * @example
     * ```typescript
     * const slider = bitbybit.babylon.gui.slider.createSlider({ name: "radius", minimum: 1, maximum: 20, value: 5, step: 0.5, isVertical: false, color: "#f0cebb", background: "black", width: "300px", height: "40px", displayThumb: true });
     * panel.addControl(slider);
     * slider.onValueChangedObservable.add((value) => { console.log(value); });
     * ```
     */
    createSlider(inputs: Inputs.BabylonGui.CreateSliderDto): BABYLON.GUI.Slider {
        const slider = new BABYLON.GUI.Slider(inputs.name);

        slider.minimum = inputs.minimum;
        slider.maximum = inputs.maximum;
        slider.value = inputs.value;
        slider.step = inputs.step;
        slider.isVertical = inputs.isVertical;
        slider.displayThumb = inputs.displayThumb;
        slider.thumbColor = "white";

        if (inputs.isVertical) {
            if (inputs.height) {
                slider.height = inputs.height;
            } else {
                slider.height = 1;
            }
            if (inputs.width) {
                slider.width = inputs.width;
            } else {
                slider.width = "42px";
            }
        } else {
            if (inputs.width) {
                slider.width = inputs.width;
            } else {
                slider.width = 1;
            }
            if (inputs.height) {
                slider.height = inputs.height;
            } else {
                slider.height = "42px";
            }
        }

        slider.color = inputs.color;
        slider.background = inputs.background;
      
        return slider;
    }

    /**
     * Restyles the thumb of a slider: round or square, its color and width, whether it stays inside
     * the track and whether it is shown at all.
     * @param inputs - The slider, the thumb shape, color and width, the clamped flag and the display flag
     * @returns The same slider
     * @group set
     * @shortname set slider thumb
     * @example
     * ```typescript
     * bitbybit.babylon.gui.slider.changeSliderThumb({ slider, isThumbCircle: true, thumbColor: "white", thumbWidth: "20px", isThumbClamped: true, displayThumb: true });
     * ```
     */
    changeSliderThumb(inputs: Inputs.BabylonGui.SliderThumbDto): BABYLON.GUI.Slider {
        inputs.slider.thumbColor = inputs.thumbColor;
        inputs.slider.isThumbCircle = inputs.isThumbCircle;
        inputs.slider.isThumbClamped = inputs.isThumbClamped;
        inputs.slider.displayThumb = inputs.displayThumb;
        if (inputs.thumbWidth) {
            inputs.slider.thumbWidth = inputs.thumbWidth;
        }
        return inputs.slider;
    }

    /**
     * Sets the color of the line around a slider's track, as a CSS color.
     * @param inputs - The slider and the border color
     * @returns The same slider
     * @group set
     * @shortname set slider border color
     */
    setBorderColor(inputs: Inputs.BabylonGui.SliderBorderColorDto): BABYLON.GUI.Slider {
        inputs.slider.borderColor = inputs.borderColor;
        return inputs.slider;
    }

    /**
     * Sets the color of the unfilled part of a slider's track, as a CSS color.
     * @param inputs - The slider and the background color
     * @returns The same slider
     * @group set
     * @shortname set slider background color
     */
    setBackgroundColor(inputs: Inputs.BabylonGui.SliderBackgroundColorDto): BABYLON.GUI.Slider {
        inputs.slider.background = inputs.backgroundColor;
        return inputs.slider;
    }

    /**
     * Sets the largest value a slider can reach, the value at its right or top end.
     * @param inputs - The slider and the maximum
     * @returns The same slider
     * @group set
     * @shortname set slider maximum
     */
    setMaximum(inputs: Inputs.BabylonGui.SetSliderValueDto): BABYLON.GUI.Slider {
        inputs.slider.maximum = inputs.value;
        return inputs.slider;
    }

    /**
     * Sets the smallest value a slider can reach, the value at its left or bottom end.
     * @param inputs - The slider and the minimum
     * @returns The same slider
     * @group set
     * @shortname set slider minimum
     */
    setMinimum(inputs: Inputs.BabylonGui.SetSliderValueDto): BABYLON.GUI.Slider {
        inputs.slider.minimum = inputs.value;
        return inputs.slider;
    }

    /**
     * Sets the increment a slider moves in, so 1 gives whole numbers only and 0 lets it move
     * smoothly.
     * @param inputs - The slider and the step
     * @returns The same slider
     * @group set
     * @shortname set slider step
     */
    setStep(inputs: Inputs.BabylonGui.SetSliderValueDto): BABYLON.GUI.Slider {
        inputs.slider.step = inputs.value;
        return inputs.slider;
    }

    /**
     * Moves a slider to a value, which fires its value changed event like a user drag would.
     * @param inputs - The slider and the value
     * @returns The same slider
     * @group set
     * @shortname set slider value
     * @example
     * ```typescript
     * bitbybit.babylon.gui.slider.setValue({ slider, value: 7.5 });
     * ```
     */
    setValue(inputs: Inputs.BabylonGui.SetSliderValueDto): BABYLON.GUI.Slider {
        inputs.slider.value = inputs.value;
        return inputs.slider;
    }

    /**
     * Passes through the name of a slider event, its value changing, as a typed selector for code
     * that subscribes to slider events by name.
     * @param inputs - The event selector
     * @returns The same selector
     * @group create
     * @shortname slider observable selector
     */
    createSliderObservableSelector(inputs: Inputs.BabylonGui.SliderObservableSelectorDto): Inputs.BabylonGui.sliderObservableSelectorEnum {
        return inputs.selector;
    }

    /**
     * Reads the color of the line around a slider's track.
     * @param inputs - The slider
     * @returns The border color
     * @group get
     * @shortname get slider border color
     */
    getBorderColor(inputs: Inputs.BabylonGui.SliderDto): string {
        return inputs.slider.borderColor;
    }

    /**
     * Reads the color of the unfilled part of a slider's track.
     * @param inputs - The slider
     * @returns The background color
     * @group get
     * @shortname get slider background color
     */
    getBackgroundColor(inputs: Inputs.BabylonGui.SliderDto): string {
        return inputs.slider.background;
    }

    /**
     * Reads the largest value a slider can reach.
     * @param inputs - The slider
     * @returns The maximum
     * @group get
     * @shortname get slider maximum
     */
    getMaximum(inputs: Inputs.BabylonGui.SliderDto): number {
        return inputs.slider.maximum;
    }

    /**
     * Reads the smallest value a slider can reach.
     * @param inputs - The slider
     * @returns The minimum
     * @group get
     * @shortname get slider minimum
     */
    getMinimum(inputs: Inputs.BabylonGui.SliderDto): number {
        return inputs.slider.minimum;
    }

    /**
     * Reads the increment a slider moves in, 0 meaning smooth movement.
     * @param inputs - The slider
     * @returns The step
     * @group get
     * @shortname get slider step
     */
    getStep(inputs: Inputs.BabylonGui.SliderDto): number {
        return inputs.slider.step;
    }

    /**
     * Reads the current value of a slider, between its minimum and maximum.
     * @param inputs - The slider
     * @returns The value
     * @group get
     * @shortname get slider value
     */
    getValue(inputs: Inputs.BabylonGui.SliderDto): number {
        return inputs.slider.value;
    }

    /**
     * Reads the color of a slider's thumb as a CSS color string.
     * @param inputs - The slider
     * @returns The thumb color
     * @group get
     * @shortname get slider thumb color
     */
    getThumbColor(inputs: Inputs.BabylonGui.SliderDto): string {
        return inputs.slider.thumbColor;
    }

    /**
     * Reads the width of a slider's thumb, as a pixel string or a fraction.
     * @param inputs - The slider
     * @returns The thumb width
     * @group get
     * @shortname get slider thumb width
     */
    getThumbWidth(inputs: Inputs.BabylonGui.SliderDto): string | number {
        return inputs.slider.thumbWidth;
    }

    /**
     * Reads whether a slider runs bottom to top rather than left to right.
     * @param inputs - The slider
     * @returns True when the slider is vertical
     * @group get
     * @shortname get slider is vertical
     */
    getIsVertical(inputs: Inputs.BabylonGui.SliderDto): boolean {
        return inputs.slider.isVertical;
    }

    /**
     * Reads whether a slider shows its thumb or only the track.
     * @param inputs - The slider
     * @returns True when the thumb is shown
     * @group get
     * @shortname get slider display thumb
     */
    getDisplayThumb(inputs: Inputs.BabylonGui.SliderDto): boolean {
        return inputs.slider.displayThumb;
    }

    /**
     * Reads whether a slider's thumb is round rather than square.
     * @param inputs - The slider
     * @returns True when the thumb is round
     * @group get
     * @shortname get slider is thumb circle
     */
    getIsThumbCircle(inputs: Inputs.BabylonGui.SliderDto): boolean {
        return inputs.slider.isThumbCircle;
    }

    /**
     * Reads whether a slider's thumb stays inside the track at the ends instead of overhanging it.
     * @param inputs - The slider
     * @returns True when the thumb is clamped
     * @group get
     * @shortname get slider is thumb clamped
     */
    getIsThumbClamped(inputs: Inputs.BabylonGui.SliderDto): boolean {
        return inputs.slider.isThumbClamped;
    }

}
