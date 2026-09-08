import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as BABYLON from "../../../../gui-enriched-babylon";
import { createHeadlessScene, HeadlessScene } from "../../../__test__/headless";
import { BabylonGuiCheckbox } from "./checkbox";
import * as Inputs from "../../../inputs";

describe("BabylonGuiCheckbox", () => {
    let headless: HeadlessScene;
    let service: BabylonGuiCheckbox;

    beforeEach(() => {
        headless = createHeadlessScene();
        service = new BabylonGuiCheckbox(headless.context);
    });

    afterEach(() => {
        headless.dispose();
    });

    const checkboxFor = (adjust: (inputs: Inputs.BabylonGui.CreateCheckboxDto) => void = () => undefined): BABYLON.GUI.Checkbox => {
        const inputs = new Inputs.BabylonGui.CreateCheckboxDto("agree", true, 0.6, "#ffffff", "#000000");
        adjust(inputs);
        return service.createCheckbox(inputs);
    };

    describe("createCheckbox", () => {
        it("should carry the name, state, ratio and colours it was given", () => {
            // Act
            const checkbox = checkboxFor();

            // Assert
            expect(checkbox.name).toBe("agree");
            expect(checkbox.isChecked).toBe(true);
            expect(checkbox.checkSizeRatio).toBe(0.6);
            expect(checkbox.color).toBe("#ffffff");
            expect(checkbox.background).toBe("#000000");
        });

        it("should be square at a fixed size when no size was asked for", () => {
            // Act
            const checkbox = checkboxFor();

            // Assert
            expect(checkbox.width).toBe("32px");
            expect(checkbox.height).toBe("32px");
        });

        it("should take a size of its own over the default", () => {
            // Act
            const checkbox = checkboxFor((inputs) => { inputs.width = "50px"; inputs.height = "50px"; });

            // Assert
            expect(checkbox.width).toBe("50px");
            expect(checkbox.height).toBe("50px");
        });
    });

    describe("the writers and the readers", () => {
        it("should set and read the background", () => {
            // Arrange
            const checkbox = checkboxFor();

            // Act
            service.setBackground(new Inputs.BabylonGui.SetCheckboxBackgroundDto(checkbox, "#123456"));

            // Assert
            expect(service.getBackground(new Inputs.BabylonGui.CheckboxDto(checkbox))).toBe("#123456");
        });

        it("should set and read the check size ratio", () => {
            // Arrange
            const checkbox = checkboxFor();

            // Act
            service.setCheckSizeRatio(new Inputs.BabylonGui.SetCheckboxCheckSizeRatioDto(checkbox, 0.9));

            // Assert
            expect(service.getCheckSizeRatio(new Inputs.BabylonGui.CheckboxDto(checkbox))).toBe(0.9);
        });

        it("should set and read the checked state", () => {
            // Arrange
            const checkbox = checkboxFor();

            // Act
            service.setIsChecked(new Inputs.BabylonGui.SetCheckboxIsCheckedDto(checkbox, false));

            // Assert
            expect(service.getIsChecked(new Inputs.BabylonGui.CheckboxDto(checkbox))).toBe(false);
        });

        it("should hand the checkbox back from every writer", () => {
            // Arrange
            const checkbox = checkboxFor();

            // Assert
            expect(service.setBackground(new Inputs.BabylonGui.SetCheckboxBackgroundDto(checkbox, "#fff"))).toBe(checkbox);
            expect(service.setCheckSizeRatio(new Inputs.BabylonGui.SetCheckboxCheckSizeRatioDto(checkbox, 0.5))).toBe(checkbox);
            expect(service.setIsChecked(new Inputs.BabylonGui.SetCheckboxIsCheckedDto(checkbox, true))).toBe(checkbox);
        });
    });

    describe("createCheckboxObservableSelector", () => {
        it("should hand back the selector it was given, which is what an event is bound by", () => {
            // Act
            const selector = service.createCheckboxObservableSelector(
                new Inputs.BabylonGui.CheckboxObservableSelectorDto(Inputs.BabylonGui.checkboxObservableSelectorEnum.onIsCheckedChangedObservable));

            // Assert
            expect(selector).toBe(Inputs.BabylonGui.checkboxObservableSelectorEnum.onIsCheckedChangedObservable);
        });
    });
});
