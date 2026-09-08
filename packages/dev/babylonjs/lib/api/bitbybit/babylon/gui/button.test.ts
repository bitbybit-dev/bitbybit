import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as BABYLON from "../../../../gui-enriched-babylon";
import { createHeadlessScene, HeadlessScene } from "../../../__test__/headless";
import { BabylonGuiButton } from "./button";
import * as Inputs from "../../../inputs";

describe("BabylonGuiButton", () => {
    let headless: HeadlessScene;
    let service: BabylonGuiButton;

    beforeEach(() => {
        headless = createHeadlessScene();
        service = new BabylonGuiButton(headless.context);
    });

    afterEach(() => {
        headless.dispose();
    });

    const buttonFor = (adjust: (inputs: Inputs.BabylonGui.CreateButtonDto) => void = () => undefined): BABYLON.GUI.Button => {
        const inputs = new Inputs.BabylonGui.CreateButtonDto("go", "Go", "#ffffff", "#000000");
        adjust(inputs);
        return service.createSimpleButton(inputs);
    };

    describe("createSimpleButton", () => {
        it("should carry the name, colours and font size it was given", () => {
            // Act
            const button = buttonFor((inputs) => { inputs.fontSize = 20; });

            // Assert
            expect(button.name).toBe("go");
            expect(button.color).toBe("#ffffff");
            expect(button.background).toBe("#000000");
            expect(button.fontSize).toBe("20px");
        });

        it("should put the label into the button's own text block", () => {
            // Act
            const button = buttonFor();

            // Assert
            expect(service.getButtonText(new Inputs.BabylonGui.ButtonDto(button))).toBe("Go");
        });

        it("should span the width it is given and take a fixed height when no size was asked for", () => {
            // Act
            const button = buttonFor();

            // Assert
            expect(button.width).toBe("100%");
            expect(button.height).toBe("42px");
        });

        it("should take a size of its own over the defaults", () => {
            // Act
            const button = buttonFor((inputs) => { inputs.width = "150px"; inputs.height = "60px"; });

            // Assert
            expect(button.width).toBe("150px");
            expect(button.height).toBe("60px");
        });
    });

    describe("setButtonText", () => {
        it("should reword the label and hand the button back", () => {
            // Arrange
            const button = buttonFor();

            // Act
            const result = service.setButtonText(new Inputs.BabylonGui.SetButtonTextDto(button, "Stop"));

            // Assert
            expect(service.getButtonText(new Inputs.BabylonGui.ButtonDto(button))).toBe("Stop");
            expect(result).toBe(button);
        });
    });
});
