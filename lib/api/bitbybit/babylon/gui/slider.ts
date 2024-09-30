
import { Context } from "../../../context";
import * as BABYLON from "../../../../gui-enriched-babylon";
import * as Inputs from "../../../inputs/inputs";

export class BabylonGuiSlider {

    constructor(private readonly context: Context) { }

    /**
     * Creates slider
     * @param inputs slider properties
     * @returns slider
     * @group create
     * @shortname create slider
     * @disposableOutput true
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
        if(inputs.container){
            inputs.container.addControl(slider);
        }
        return slider;
    }

    /**
     * Changes slider thumb properties
     * @param inputs slider properties* 
     * @returns slider
     * @group set
     * @shortname set slider thumb
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
     * Changes slider border color
     * @param inputs slider border color
     * @returns slider
     * @group set
     * @shortname set slider border color
     */
    setBorderColor(inputs: Inputs.BabylonGui.SliderBorderColorDto): BABYLON.GUI.Slider {
        inputs.slider.borderColor = inputs.borderColor;
        return inputs.slider;
    }

    /**
     * Changes slider background color
     * @param inputs slider background color
     * @returns slider
     * @group set
     * @shortname set slider background color
     */
    setBackgroundColor(inputs: Inputs.BabylonGui.SliderBackgroundColorDto): BABYLON.GUI.Slider {
        inputs.slider.background = inputs.backgroundColor;
        return inputs.slider;
    }

    /**
     * Changes slider maximum value
     * @param inputs slider maximum value
     * @returns slider
     * @group set
     * @shortname set slider maximum
     */
    setMaximum(inputs: Inputs.BabylonGui.SetSliderValueDto): BABYLON.GUI.Slider {
        inputs.slider.maximum = inputs.value;
        return inputs.slider;
    }

    /**
     * Changes slider minimum value
     * @param inputs slider minimum value
     * @returns slider
     * @group set
     * @shortname set slider minimum
     */
    setMinimum(inputs: Inputs.BabylonGui.SetSliderValueDto): BABYLON.GUI.Slider {
        inputs.slider.minimum = inputs.value;
        return inputs.slider;
    }

    /**
     * Changes slider step value
     * @param inputs slider step value
     * @returns slider
     * @group set
     * @shortname set slider step
     */
    setStep(inputs: Inputs.BabylonGui.SetSliderValueDto): BABYLON.GUI.Slider {
        inputs.slider.step = inputs.value;
        return inputs.slider;
    }

    /**
     * Changes slider value
     * @param inputs slider value
     * @returns slider
     * @group set
     * @shortname set slider value
     */
    setValue(inputs: Inputs.BabylonGui.SetSliderValueDto): BABYLON.GUI.Slider {
        inputs.slider.value = inputs.value;
        return inputs.slider;
    }

    /**
    * Creates the selector of an observable for a slider
    * @param inputs observable name
    * @returns slider observable selector
    * @group create
    * @shortname slider observable selector
    */
    createSliderObservableSelector(inputs: Inputs.BabylonGui.SliderObservableSelectorDto): Inputs.BabylonGui.sliderObservableSelectorEnum {
        return inputs.selector;
    }

    /**
     * Gets the slider border color
     * @param slider slider
     * @returns slider border color
     * @group get
     * @shortname get slider border color
     */
    getBorderColor(inputs: Inputs.BabylonGui.SliderDto): string {
        return inputs.slider.borderColor;
    }

    /**
     * Gets the slider background color
     * @param slider slider
     * @returns slider background color
     * @group get
     * @shortname get slider background color
     */
    getBackgroundColor(inputs: Inputs.BabylonGui.SliderDto): string {
        return inputs.slider.background;
    }

    /**
     * Gets the slider maximum value
     * @param slider slider
     * @returns slider maximum value
     * @group get
     * @shortname get slider maximum
     */
    getMaximum(inputs: Inputs.BabylonGui.SliderDto): number {
        return inputs.slider.maximum;
    }

    /**
     * Gets the slider minimum value
     * @param slider slider
     * @returns slider minimum value
     * @group get
     * @shortname get slider minimum
     */
    getMinimum(inputs: Inputs.BabylonGui.SliderDto): number {
        return inputs.slider.minimum;
    }

    /**
     * Gets the slider step value
     * @param slider slider
     * @returns slider step value
     * @group get
     * @shortname get slider step
     */
    getStep(inputs: Inputs.BabylonGui.SliderDto): number {
        return inputs.slider.step;
    }

    /**
     * Gets the slider value
     * @param slider slider
     * @returns slider value
     * @group get
     * @shortname get slider value
     */
    getValue(inputs: Inputs.BabylonGui.SliderDto): number {
        return inputs.slider.value;
    }

    /**
     * Gets the slider thumb color
     * @param slider slider
     * @returns slider thumb color
     * @group get
     * @shortname get slider thumb color
     */
    getThumbColor(inputs: Inputs.BabylonGui.SliderDto): string {
        return inputs.slider.thumbColor;
    }

    /**
     * Gets the slider thumb width
     * @param slider slider
     * @returns slider thumb width
     * @group get
     * @shortname get slider thumb width
     */
    getThumbWidth(inputs: Inputs.BabylonGui.SliderDto): string | number {
        return inputs.slider.thumbWidth;
    }

    /**
     * Gets the slider is vertical
     * @param slider slider
     * @returns slider is vertical
     * @group get
     * @shortname get slider is vertical
     */
    getIsVertical(inputs: Inputs.BabylonGui.SliderDto): boolean {
        return inputs.slider.isVertical;
    }

    /**
     * Gets the slider display thumb
     * @param slider slider
     * @returns slider display thumb
     * @group get
     * @shortname get slider display thumb
     */
    getDisplayThumb(inputs: Inputs.BabylonGui.SliderDto): boolean {
        return inputs.slider.displayThumb;
    }

    /**
     * Gets the slider is thumb circle
     * @param slider slider
     * @returns slider is thumb circle
     * @group get
     * @shortname get slider is thumb circle
     */
    getIsThumbCircle(inputs: Inputs.BabylonGui.SliderDto): boolean {
        return inputs.slider.isThumbCircle;
    }

    /**
     * Gets the slider is thumb clamped
     * @param slider slider
     * @returns slider is thumb clamped
     * @group get
     * @shortname get slider is thumb clamped
     */
    getIsThumbClamped(inputs: Inputs.BabylonGui.SliderDto): boolean {
        return inputs.slider.isThumbClamped;
    }

}
