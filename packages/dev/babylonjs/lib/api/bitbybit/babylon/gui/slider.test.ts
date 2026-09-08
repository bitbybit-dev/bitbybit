import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as BABYLON from "../../../../gui-enriched-babylon";
import { createHeadlessScene, HeadlessScene } from "../../../__test__/headless";
import { BabylonGuiSlider } from "./slider";
import * as Inputs from "../../../inputs";

describe("BabylonGuiSlider", () => {
    let headless: HeadlessScene;
    let service: BabylonGuiSlider;

    beforeEach(() => {
        headless = createHeadlessScene();
        service = new BabylonGuiSlider(headless.context);
    });

    afterEach(() => {
        headless.dispose();
    });

    const sliderFor = (adjust: (inputs: Inputs.BabylonGui.CreateSliderDto) => void = () => undefined): BABYLON.GUI.Slider => {
        const inputs = new Inputs.BabylonGui.CreateSliderDto("size", 0, 100, 50, 1, false, "#ff0000", "#000000");
        adjust(inputs);
        return service.createSlider(inputs);
    };

    describe("createSlider", () => {
        it("should build a slider over the range it was given", () => {
            // Act
            const slider = sliderFor();

            // Assert
            expect(slider.minimum).toBe(0);
            expect(slider.maximum).toBe(100);
            expect(slider.value).toBe(50);
            expect(slider.step).toBe(1);
        });

        it("should name the slider and colour it as it was told", () => {
            // Act
            const slider = sliderFor();

            // Assert
            expect(slider.name).toBe("size");
            expect(slider.color).toBe("#ff0000");
            expect(slider.background).toBe("#000000");
        });

        it("should lay a horizontal slider across the space and give it a fixed height", () => {
            // Act
            const slider = sliderFor();

            // Assert
            expect(slider.width).toBe("100%");
            expect(slider.height).toBe("42px");
        });

        it("should stand a vertical slider up the space and give it a fixed width", () => {
            // Act
            const slider = sliderFor((inputs) => { inputs.isVertical = true; });

            // Assert
            expect(slider.height).toBe("100%");
            expect(slider.width).toBe("42px");
        });

        it("should take a width and height of its own over either default", () => {
            // Act
            const horizontal = sliderFor((inputs) => { inputs.width = "200px"; inputs.height = "20px"; });
            const vertical = sliderFor((inputs) => { inputs.isVertical = true; inputs.width = "20px"; inputs.height = "200px"; });

            // Assert
            expect([horizontal.width, horizontal.height]).toEqual(["200px", "20px"]);
            expect([vertical.width, vertical.height]).toEqual(["20px", "200px"]);
        });
    });

    describe("changeSliderThumb", () => {
        it("should take the thumb's shape, colour and width", () => {
            // Arrange
            const slider = sliderFor();

            // Act
            service.changeSliderThumb(new Inputs.BabylonGui.SliderThumbDto(slider, true, "#00ff00", "10px", true));

            // Assert
            expect(service.getIsThumbCircle(new Inputs.BabylonGui.SliderDto(slider))).toBe(true);
            expect(service.getThumbColor(new Inputs.BabylonGui.SliderDto(slider))).toBe("#00ff00");
            expect(service.getThumbWidth(new Inputs.BabylonGui.SliderDto(slider))).toBe("10px");
            expect(service.getIsThumbClamped(new Inputs.BabylonGui.SliderDto(slider))).toBe(true);
        });
    });

    describe("the writers and the readers", () => {
        it("should set and read the border colour", () => {
            // Arrange
            const slider = sliderFor();

            // Act
            service.setBorderColor(new Inputs.BabylonGui.SliderBorderColorDto(slider, "#123456"));

            // Assert
            expect(service.getBorderColor(new Inputs.BabylonGui.SliderDto(slider))).toBe("#123456");
        });

        it("should set and read the background colour", () => {
            // Arrange
            const slider = sliderFor();

            // Act
            service.setBackgroundColor(new Inputs.BabylonGui.SliderBackgroundColorDto(slider, "#654321"));

            // Assert
            expect(service.getBackgroundColor(new Inputs.BabylonGui.SliderDto(slider))).toBe("#654321");
        });

        it("should set and read the maximum", () => {
            // Arrange
            const slider = sliderFor();

            // Act
            service.setMaximum(new Inputs.BabylonGui.SetSliderValueDto(slider, 200));

            // Assert
            expect(service.getMaximum(new Inputs.BabylonGui.SliderDto(slider))).toBe(200);
        });

        it("should set and read the minimum", () => {
            // Arrange
            const slider = sliderFor();

            // Act
            service.setMinimum(new Inputs.BabylonGui.SetSliderValueDto(slider, 10));

            // Assert
            expect(service.getMinimum(new Inputs.BabylonGui.SliderDto(slider))).toBe(10);
        });

        it("should set and read the step", () => {
            // Arrange
            const slider = sliderFor();

            // Act
            service.setStep(new Inputs.BabylonGui.SetSliderValueDto(slider, 5));

            // Assert
            expect(service.getStep(new Inputs.BabylonGui.SliderDto(slider))).toBe(5);
        });

        it("should set and read the value", () => {
            // Arrange
            const slider = sliderFor();

            // Act
            service.setValue(new Inputs.BabylonGui.SetSliderValueDto(slider, 75));

            // Assert
            expect(service.getValue(new Inputs.BabylonGui.SliderDto(slider))).toBe(75);
        });

        it("should read which way the slider runs", () => {
            // Arrange
            const slider = sliderFor((inputs) => { inputs.isVertical = true; });

            // Assert
            expect(service.getIsVertical(new Inputs.BabylonGui.SliderDto(slider))).toBe(true);
        });

        it("should read whether the thumb is drawn at all", () => {
            // Arrange
            const slider = sliderFor((inputs) => { inputs.displayThumb = false; });

            // Assert
            expect(service.getDisplayThumb(new Inputs.BabylonGui.SliderDto(slider))).toBe(false);
        });
    });

    describe("createSliderObservableSelector", () => {
        it("should hand back the selector it was given, which is what an event is bound by", () => {
            // Act
            const selector = service.createSliderObservableSelector(
                new Inputs.BabylonGui.SliderObservableSelectorDto(Inputs.BabylonGui.sliderObservableSelectorEnum.onValueChangedObservable));

            // Assert
            expect(selector).toBe(Inputs.BabylonGui.sliderObservableSelectorEnum.onValueChangedObservable);
        });
    });
});
