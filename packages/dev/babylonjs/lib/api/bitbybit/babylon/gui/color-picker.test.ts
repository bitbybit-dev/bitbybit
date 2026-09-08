import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as BABYLON from "../../../../gui-enriched-babylon";
import { createHeadlessScene, HeadlessScene } from "../../../__test__/headless";
import { BabylonGuiColorPicker } from "./color-picker";
import * as Inputs from "../../../inputs";

describe("BabylonGuiColorPicker", () => {
    let headless: HeadlessScene;
    let service: BabylonGuiColorPicker;

    beforeEach(() => {
        headless = createHeadlessScene();
        service = new BabylonGuiColorPicker(headless.context);
    });

    afterEach(() => {
        headless.dispose();
    });

    const pickerFor = (adjust: (inputs: Inputs.BabylonGui.CreateColorPickerDto) => void = () => undefined): BABYLON.GUI.ColorPicker => {
        const inputs = new Inputs.BabylonGui.CreateColorPickerDto("picker", "#ff0000", "#ffffff");
        adjust(inputs);
        return service.createColorPicker(inputs);
    };

    describe("createColorPicker", () => {
        it("should carry the name and colour it was given", () => {
            // Act
            const picker = pickerFor();

            // Assert
            expect(picker.name).toBe("picker");
            expect(picker.color).toBe("#ffffff");
        });

        it("should start on the default colour it was given", () => {
            // Act
            const picker = pickerFor();

            // Assert
            expect(service.getColorPickerValue(new Inputs.BabylonGui.ColorPickerDto(picker))).toBe("#FF0000");
        });

        it("should leave the value alone when no default colour was given", () => {
            // Arrange
            const before = new BABYLON.GUI.ColorPicker("reference").value.toHexString();

            // Act
            const picker = pickerFor((inputs) => { inputs.defaultColor = ""; });

            // Assert
            expect(service.getColorPickerValue(new Inputs.BabylonGui.ColorPickerDto(picker))).toBe(before);
        });

        it("should take a square default size when none was asked for", () => {
            // Act
            const picker = pickerFor();

            // Assert
            expect(picker.width).toBe("300px");
            expect(picker.height).toBe("300px");
        });

        it("should stay square on the width it was given, whatever height was asked for", () => {
            // Act
            const picker = pickerFor((inputs) => { inputs.width = "100px"; inputs.height = "120px"; });

            // Assert
            expect(picker.width).toBe("100px");
            expect(picker.height).toBe("100px");
        });

        it("should take a size that drives both sides at once when one was given", () => {
            // Act
            const picker = pickerFor((inputs) => { inputs.size = "80px"; });

            // Assert
            expect(service.getColorPickerSize(new Inputs.BabylonGui.ColorPickerDto(picker))).toBe("80px");
        });
    });

    describe("the writers and the readers", () => {
        it("should set and read the value as a hex string", () => {
            // Arrange
            const picker = pickerFor();

            // Act
            service.setColorPickerValue(new Inputs.BabylonGui.SetColorPickerValueDto(picker, "#00FF00"));

            // Assert
            expect(service.getColorPickerValue(new Inputs.BabylonGui.ColorPickerDto(picker))).toBe("#00FF00");
        });

        it("should set and read the size", () => {
            // Arrange
            const picker = pickerFor();

            // Act
            service.setColorPickerSize(new Inputs.BabylonGui.SetColorPickerSizeDto(picker, "150px"));

            // Assert
            expect(service.getColorPickerSize(new Inputs.BabylonGui.ColorPickerDto(picker))).toBe("150px");
        });

        it("should fall back to the default size when none was given", () => {
            // Arrange
            const picker = pickerFor();
            const inputs = new Inputs.BabylonGui.SetColorPickerSizeDto(picker);
            inputs.size = undefined;

            // Act
            service.setColorPickerSize(inputs);

            // Assert
            expect(service.getColorPickerSize(new Inputs.BabylonGui.ColorPickerDto(picker))).toBe("300px");
        });

        it("should hand the picker back from every writer", () => {
            // Arrange
            const picker = pickerFor();

            // Assert
            expect(service.setColorPickerValue(new Inputs.BabylonGui.SetColorPickerValueDto(picker, "#000000"))).toBe(picker);
            expect(service.setColorPickerSize(new Inputs.BabylonGui.SetColorPickerSizeDto(picker, "10px"))).toBe(picker);
        });
    });

    describe("createColorPickerObservableSelector", () => {
        it("should hand back the selector it was given, which is what an event is bound by", () => {
            // Act
            const selector = service.createColorPickerObservableSelector(
                new Inputs.BabylonGui.ColorPickerObservableSelectorDto(Inputs.BabylonGui.colorPickerObservableSelectorEnum.onValueChangedObservable));

            // Assert
            expect(selector).toBe(Inputs.BabylonGui.colorPickerObservableSelectorEnum.onValueChangedObservable);
        });
    });
});
