
import { Context } from "../../../context";
import * as GUI from "@babylonjs/gui";
import * as Inputs from "../../../inputs/inputs";

export class BabylonGuiSlider {

    constructor(private readonly context: Context) { }

    /**
     * Creates slider
     * @param inputs slider properties
     * @group create
     * @shortname create slider
     * @disposableOutput true
     */
    createSlider(inputs: Inputs.BabylonGui.CreateSliderDto): GUI.Slider {
        const slider = new GUI.Slider();

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
        inputs.container.addControl(slider);
        return slider;
    }

    /**
     * Changes slider thumb properties
     * @param inputs slider properties
     * @group change
     * @shortname change slider thumb
     */
    changeSliderThumb(inputs: Inputs.BabylonGui.SliderThumbDto): GUI.Slider {
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
    * Creates the selector of an observable for a slider
    * @param inputs observable name
    * @group create
    * @shortname slider observable selector
    */
    createSliderObservableSelector(inputs: Inputs.BabylonGui.SliderObservableSelectorDto): Inputs.BabylonGui.sliderObservableSelectorEnum {
        return inputs.selector;
    }
}
