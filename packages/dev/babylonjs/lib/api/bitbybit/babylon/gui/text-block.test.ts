import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as BABYLON from "../../../../gui-enriched-babylon";
import { createHeadlessScene, HeadlessScene } from "../../../__test__/headless";
import { BabylonGuiTextBlock } from "./text-block";
import * as Inputs from "../../../inputs";

describe("BabylonGuiTextBlock", () => {
    let headless: HeadlessScene;
    let service: BabylonGuiTextBlock;

    beforeEach(() => {
        headless = createHeadlessScene();
        service = new BabylonGuiTextBlock(headless.context);
    });

    afterEach(() => {
        headless.dispose();
    });

    const textBlockFor = (adjust: (inputs: Inputs.BabylonGui.CreateTextBlockDto) => void = () => undefined): BABYLON.GUI.TextBlock => {
        const inputs = new Inputs.BabylonGui.CreateTextBlockDto("caption", "hello", "#ff0000");
        adjust(inputs);
        return service.createTextBlock(inputs);
    };

    describe("createTextBlock", () => {
        it("should carry the name, text, colour and font size it was given", () => {
            // Act
            const textBlock = textBlockFor((inputs) => { inputs.fontSize = 18; });

            // Assert
            expect(textBlock.name).toBe("caption");
            expect(textBlock.text).toBe("hello");
            expect(textBlock.color).toBe("#ff0000");
            expect(textBlock.fontSize).toBe("18px");
        });

        it("should span the width it is given and take a fixed height when no size was asked for", () => {
            // Act
            const textBlock = textBlockFor();

            // Assert
            expect(textBlock.width).toBe("100%");
            expect(textBlock.height).toBe("42px");
        });

        it("should take a size of its own over the defaults", () => {
            // Act
            const textBlock = textBlockFor((inputs) => { inputs.width = "120px"; inputs.height = "20px"; });

            // Assert
            expect(textBlock.width).toBe("120px");
            expect(textBlock.height).toBe("20px");
        });
    });

    describe("alignText", () => {
        it.each([
            [Inputs.BabylonGui.horizontalAlignmentEnum.left, BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT],
            [Inputs.BabylonGui.horizontalAlignmentEnum.right, BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT],
            [Inputs.BabylonGui.horizontalAlignmentEnum.center, BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER],
        ])("should align the text %s horizontally", (alignment, expected) => {
            // Arrange
            const textBlock = textBlockFor();

            // Act
            service.alignText(new Inputs.BabylonGui.AlignmentDto<BABYLON.GUI.TextBlock>(textBlock, alignment));

            // Assert
            expect(service.getTextHorizontalAlignment(new Inputs.BabylonGui.TextBlockDto(textBlock))).toBe(expected);
        });

        it.each([
            [Inputs.BabylonGui.verticalAlignmentEnum.top, BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP],
            [Inputs.BabylonGui.verticalAlignmentEnum.bottom, BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM],
            [Inputs.BabylonGui.verticalAlignmentEnum.center, BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER],
        ])("should align the text %s vertically", (alignment, expected) => {
            // Arrange
            const textBlock = textBlockFor();

            // Act
            service.alignText(new Inputs.BabylonGui.AlignmentDto<BABYLON.GUI.TextBlock>(textBlock, undefined, alignment));

            // Assert
            expect(service.getTextVerticalAlignment(new Inputs.BabylonGui.TextBlockDto(textBlock))).toBe(expected);
        });

        it("should align the text of the block it was given and hand it back", () => {
            // Arrange
            const textBlock = textBlockFor();

            // Act
            const result = service.alignText(new Inputs.BabylonGui.AlignmentDto<BABYLON.GUI.TextBlock>(textBlock));

            // Assert
            expect(result).toBe(textBlock);
        });
    });

    describe("the writers and the readers", () => {
        it("should set and read the outline", () => {
            // Arrange
            const textBlock = textBlockFor();

            // Act
            service.setTextOutline(new Inputs.BabylonGui.SetTextBlockTextOutlineDto(textBlock, 3, "#000000"));

            // Assert
            expect(service.getOutlineWidth(new Inputs.BabylonGui.TextBlockDto(textBlock))).toBe(3);
            expect(textBlock.outlineColor).toBe("#000000");
        });

        it("should set and read the text", () => {
            // Arrange
            const textBlock = textBlockFor();

            // Act
            service.setText(new Inputs.BabylonGui.SetTextBlockTextDto(textBlock, "goodbye"));

            // Assert
            expect(service.getText(new Inputs.BabylonGui.TextBlockDto(textBlock))).toBe("goodbye");
        });

        it("should set and read whether the block resizes to fit", () => {
            // Arrange
            const textBlock = textBlockFor();

            // Act
            service.setRsizeToFit(new Inputs.BabylonGui.SetTextBlockResizeToFitDto(textBlock, true));

            // Assert
            expect(service.getResizeToFit(new Inputs.BabylonGui.TextBlockDto(textBlock))).toBe(true);
        });

        it("should turn a request to wrap into word wrapping, which is how it is read back", () => {
            // Arrange
            const textBlock = textBlockFor();
            const reference = new BABYLON.GUI.TextBlock("reference", "hello");
            reference.textWrapping = true;

            // Act
            service.setTextWrapping(new Inputs.BabylonGui.SetTextBlockTextWrappingDto(textBlock, true));

            // Assert
            expect(service.getTextWrapping(new Inputs.BabylonGui.TextBlockDto(textBlock))).toBe(reference.textWrapping);
        });

        it("should set and read line spacing", () => {
            // Arrange
            const textBlock = textBlockFor();

            // Act
            service.setLineSpacing(new Inputs.BabylonGui.SetTextBlockLineSpacingDto(textBlock, "5px"));

            // Assert
            expect(service.getLineSpacing(new Inputs.BabylonGui.TextBlockDto(textBlock))).toBe("5px");
        });

        it("should hand the text block back from every writer", () => {
            // Arrange
            const textBlock = textBlockFor();

            // Assert
            expect(service.setText(new Inputs.BabylonGui.SetTextBlockTextDto(textBlock, "a"))).toBe(textBlock);
            expect(service.setTextOutline(new Inputs.BabylonGui.SetTextBlockTextOutlineDto(textBlock, 1, "#000"))).toBe(textBlock);
            expect(service.setRsizeToFit(new Inputs.BabylonGui.SetTextBlockResizeToFitDto(textBlock, false))).toBe(textBlock);
            expect(service.setTextWrapping(new Inputs.BabylonGui.SetTextBlockTextWrappingDto(textBlock, false))).toBe(textBlock);
            expect(service.setLineSpacing(new Inputs.BabylonGui.SetTextBlockLineSpacingDto(textBlock, 0))).toBe(textBlock);
        });
    });

    describe("createTextBlockObservableSelector", () => {
        it("should hand back the selector it was given, which is what an event is bound by", () => {
            // Act
            const selector = service.createTextBlockObservableSelector(
                new Inputs.BabylonGui.TextBlockObservableSelectorDto(Inputs.BabylonGui.textBlockObservableSelectorEnum.onTextChangedObservable));

            // Assert
            expect(selector).toBe(Inputs.BabylonGui.textBlockObservableSelectorEnum.onTextChangedObservable);
        });
    });
});
