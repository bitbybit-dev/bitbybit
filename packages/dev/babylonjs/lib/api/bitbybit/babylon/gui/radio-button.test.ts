import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as BABYLON from "../../../../gui-enriched-babylon";
import { createHeadlessScene, HeadlessScene } from "../../../__test__/headless";
import { BabylonGuiRadioButton } from "./radio-button";
import * as Inputs from "../../../inputs";

describe("BabylonGuiRadioButton", () => {
    let headless: HeadlessScene;
    let service: BabylonGuiRadioButton;

    beforeEach(() => {
        headless = createHeadlessScene();
        service = new BabylonGuiRadioButton(headless.context);
    });

    afterEach(() => {
        headless.dispose();
    });

    const radioButtonFor = (adjust: (inputs: Inputs.BabylonGui.CreateRadioButtonDto) => void = () => undefined): BABYLON.GUI.RadioButton => {
        const inputs = new Inputs.BabylonGui.CreateRadioButtonDto("small", "sizes", true, 0.7, "#ffffff", "#000000");
        adjust(inputs);
        return service.createRadioButton(inputs);
    };

    describe("createRadioButton", () => {
        it("should carry the name, group, state, ratio and colours it was given", () => {
            // Act
            const radioButton = radioButtonFor();

            // Assert
            expect(radioButton.name).toBe("small");
            expect(radioButton.group).toBe("sizes");
            expect(radioButton.isChecked).toBe(true);
            expect(radioButton.checkSizeRatio).toBe(0.7);
            expect(radioButton.color).toBe("#ffffff");
            expect(radioButton.background).toBe("#000000");
        });

        it("should be square at a fixed size when no size was asked for", () => {
            // Act
            const radioButton = radioButtonFor();

            // Assert
            expect(radioButton.width).toBe("32px");
            expect(radioButton.height).toBe("32px");
        });

        it("should take a size of its own over the default", () => {
            // Act
            const radioButton = radioButtonFor((inputs) => { inputs.width = "48px"; inputs.height = "48px"; });

            // Assert
            expect(radioButton.width).toBe("48px");
            expect(radioButton.height).toBe("48px");
        });
    });

    describe("the writers and the readers", () => {
        it("should set and read the check size ratio", () => {
            // Arrange
            const radioButton = radioButtonFor();

            // Act
            service.setCheckSizeRatio(new Inputs.BabylonGui.SetRadioButtonCheckSizeRatioDto(radioButton, 0.4));

            // Assert
            expect(service.getCheckSizeRatio(new Inputs.BabylonGui.RadioButtonDto(radioButton))).toBe(0.4);
        });

        it("should set and read the group", () => {
            // Arrange
            const radioButton = radioButtonFor();

            // Act
            service.setGroup(new Inputs.BabylonGui.SetRadioButtonGroupDto(radioButton, "colours"));

            // Assert
            expect(service.getGroup(new Inputs.BabylonGui.RadioButtonDto(radioButton))).toBe("colours");
        });

        it("should set and read the background", () => {
            // Arrange
            const radioButton = radioButtonFor();

            // Act
            service.setBackground(new Inputs.BabylonGui.SetRadioButtonBackgroundDto(radioButton, "#333333"));

            // Assert
            expect(service.getBackground(new Inputs.BabylonGui.RadioButtonDto(radioButton))).toBe("#333333");
        });

        it("should hand the radio button back from every writer", () => {
            // Arrange
            const radioButton = radioButtonFor();

            // Assert
            expect(service.setCheckSizeRatio(new Inputs.BabylonGui.SetRadioButtonCheckSizeRatioDto(radioButton, 0.5))).toBe(radioButton);
            expect(service.setGroup(new Inputs.BabylonGui.SetRadioButtonGroupDto(radioButton, "a"))).toBe(radioButton);
            expect(service.setBackground(new Inputs.BabylonGui.SetRadioButtonBackgroundDto(radioButton, "#fff"))).toBe(radioButton);
        });
    });

    describe("createRadioButtonObservableSelector", () => {
        it("should hand back the selector it was given, which is what an event is bound by", () => {
            // Act
            const selector = service.createRadioButtonObservableSelector(
                new Inputs.BabylonGui.RadioButtonObservableSelectorDto(Inputs.BabylonGui.radioButtonObservableSelectorEnum.onIsCheckedChangedObservable));

            // Assert
            expect(selector).toBe(Inputs.BabylonGui.radioButtonObservableSelectorEnum.onIsCheckedChangedObservable);
        });
    });
});
