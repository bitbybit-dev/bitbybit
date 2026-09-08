import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as BABYLON from "../../../../gui-enriched-babylon";
import { createHeadlessScene, HeadlessScene } from "../../../__test__/headless";
import { BabylonGuiInputText } from "./input-text";
import * as Inputs from "../../../inputs";

describe("BabylonGuiInputText", () => {
    let headless: HeadlessScene;
    let service: BabylonGuiInputText;

    beforeEach(() => {
        headless = createHeadlessScene();
        service = new BabylonGuiInputText(headless.context);
    });

    afterEach(() => {
        headless.dispose();
    });

    const inputTextFor = (adjust: (inputs: Inputs.BabylonGui.CreateInputTextDto) => void = () => undefined): BABYLON.GUI.InputText => {
        const inputs = new Inputs.BabylonGui.CreateInputTextDto("field", "#ffffff", "#000000");
        inputs.text = "typed";
        inputs.placeholder = "type here";
        adjust(inputs);
        return service.createInputText(inputs);
    };

    describe("createInputText", () => {
        it("should carry the name, text, placeholder and colours it was given", () => {
            // Act
            const inputText = inputTextFor();

            // Assert
            expect(inputText.name).toBe("field");
            expect(service.getText(new Inputs.BabylonGui.InputTextDto(inputText))).toBe("typed");
            expect(service.getPlaceholder(new Inputs.BabylonGui.InputTextDto(inputText))).toBe("type here");
            expect(inputText.color).toBe("#ffffff");
            expect(service.getBackground(new Inputs.BabylonGui.InputTextDto(inputText))).toBe("#000000");
        });

        it("should span the width it is given and take a fixed height when no size was asked for", () => {
            // Act
            const inputText = inputTextFor();

            // Assert
            expect(inputText.width).toBe("100%");
            expect(inputText.height).toBe("56px");
        });

        it("should take a size of its own over the defaults", () => {
            // Act
            const inputText = inputTextFor((inputs) => { inputs.width = "300px"; inputs.height = "40px"; });

            // Assert
            expect(inputText.width).toBe("300px");
            expect(inputText.height).toBe("40px");
        });
    });

    describe("the writers and the readers", () => {
        it("should set and read the background", () => {
            // Arrange
            const inputText = inputTextFor();

            // Act
            service.setBackground(new Inputs.BabylonGui.SetInputTextBackgroundDto(inputText, "#222222"));

            // Assert
            expect(service.getBackground(new Inputs.BabylonGui.InputTextDto(inputText))).toBe("#222222");
        });

        it("should set and read the text", () => {
            // Arrange
            const inputText = inputTextFor();

            // Act
            service.setText(new Inputs.BabylonGui.SetInputTextTextDto(inputText, "changed"));

            // Assert
            expect(service.getText(new Inputs.BabylonGui.InputTextDto(inputText))).toBe("changed");
        });

        it("should set and read the placeholder", () => {
            // Arrange
            const inputText = inputTextFor();

            // Act
            service.setPlaceholder(new Inputs.BabylonGui.SetInputTextPlaceholderDto(inputText, "your name"));

            // Assert
            expect(service.getPlaceholder(new Inputs.BabylonGui.InputTextDto(inputText))).toBe("your name");
        });

        it("should hand the input back from every writer", () => {
            // Arrange
            const inputText = inputTextFor();

            // Assert
            expect(service.setBackground(new Inputs.BabylonGui.SetInputTextBackgroundDto(inputText, "#fff"))).toBe(inputText);
            expect(service.setText(new Inputs.BabylonGui.SetInputTextTextDto(inputText, "a"))).toBe(inputText);
            expect(service.setPlaceholder(new Inputs.BabylonGui.SetInputTextPlaceholderDto(inputText, "b"))).toBe(inputText);
        });
    });

    describe("createInputTextObservableSelector", () => {
        it("should hand back the selector it was given, which is what an event is bound by", () => {
            // Act
            const selector = service.createInputTextObservableSelector(
                new Inputs.BabylonGui.InputTextObservableSelectorDto(Inputs.BabylonGui.inputTextObservableSelectorEnum.onTextChangedObservable));

            // Assert
            expect(selector).toBe(Inputs.BabylonGui.inputTextObservableSelectorEnum.onTextChangedObservable);
        });
    });
});
