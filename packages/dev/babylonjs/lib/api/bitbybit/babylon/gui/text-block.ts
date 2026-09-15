
import { Context } from "../../../context";
import * as BABYLON from "../../../../gui-enriched-babylon";
import * as Inputs from "../../../inputs";

/**
 * Text labels: a block of text with a color, font size, alignment, optional outline, wrapping and
 * line spacing. Use one for titles and readouts next to other controls.
 */
export class BabylonGuiTextBlock {

    constructor(_context: Context) { }

    /**
     * Creates a block of text with a color and font size; sizes are pixel strings or fractions of
     * the parent, and a size left out is chosen by the engine.
     * @param inputs - The name, the text, the color, the optional size and the font size
     * @returns The text block
     * @group create
     * @shortname create text block
     * @disposableOutput true
     * @example
     * ```typescript
     * const title = bitbybit.babylon.gui.textBlock.createTextBlock({ name: "title", text: "Radius", color: "#f0cebb", width: "300px", height: "40px", fontSize: 24 });
     * panel.addControl(title);
     * ```
     */
    createTextBlock(inputs: Inputs.BabylonGui.CreateTextBlockDto): BABYLON.GUI.TextBlock {
        const textBlock = new BABYLON.GUI.TextBlock(inputs.name, inputs.text);

        if (inputs.width) {
            textBlock.width = inputs.width;
        } else {
            textBlock.width = 1;
        }
        if (inputs.height) {
            textBlock.height = inputs.height;
        } else {
            textBlock.height = "42px";
        }
        textBlock.fontSize = inputs.fontSize;
        textBlock.color = inputs.color;
      
        return textBlock;
    }

    /**
     * Sets where the text sits inside its block: left, center or right, and top, center or bottom.
     * @param inputs - The text block and the two alignments
     * @returns The same text block
     * @group positioning
     * @shortname align text block text
     * @example
     * ```typescript
     * bitbybit.babylon.gui.textBlock.alignText({ control: title, horizontalAlignment: Bit.Inputs.BabylonGui.horizontalAlignmentEnum.left, verticalAlignment: Bit.Inputs.BabylonGui.verticalAlignmentEnum.center });
     * ```
     */
    alignText(inputs: Inputs.BabylonGui.AlignmentDto<BABYLON.GUI.TextBlock>): BABYLON.GUI.TextBlock {
        switch (inputs.horizontalAlignment) {
            case Inputs.BabylonGui.horizontalAlignmentEnum.left:
                inputs.control.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
                break;
            case Inputs.BabylonGui.horizontalAlignmentEnum.right:
                inputs.control.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
                break;
            case Inputs.BabylonGui.horizontalAlignmentEnum.center:
                inputs.control.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
                break;
        }
        switch (inputs.verticalAlignment) {
            case Inputs.BabylonGui.verticalAlignmentEnum.top:
                inputs.control.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
                break;
            case Inputs.BabylonGui.verticalAlignmentEnum.bottom:
                inputs.control.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
                break;
            case Inputs.BabylonGui.verticalAlignmentEnum.center:
                inputs.control.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
                break;
        }
        return inputs.control;
    }

    /**
     * Draws an outline around the letters of a text block, `outlineWidth` pixels wide in
     * `outlineColor`, which keeps text readable over a busy scene; 0 removes it.
     * @param inputs - The text block, the outline width and the outline color
     * @returns The same text block
     * @group set
     * @shortname text outline
     * @example
     * ```typescript
     * bitbybit.babylon.gui.textBlock.setTextOutline({ textBlock: title, outlineWidth: 2, outlineColor: "black" });
     * ```
     */
    setTextOutline(inputs: Inputs.BabylonGui.SetTextBlockTextOutlineDto): BABYLON.GUI.TextBlock {
        inputs.textBlock.outlineWidth = inputs.outlineWidth;
        inputs.textBlock.outlineColor = inputs.outlineColor;
        return inputs.textBlock;
    }

    /**
     * Changes the text a text block shows to the given text.
     * @param inputs - The text block and the text
     * @returns The same text block
     * @group set
     * @shortname set text block text
     * @example
     * ```typescript
     * bitbybit.babylon.gui.textBlock.setText({ textBlock: readout, text: "Radius: 7.5" });
     * ```
     */
    setText(inputs: Inputs.BabylonGui.SetTextBlockTextDto): BABYLON.GUI.TextBlock {
        inputs.textBlock.text = inputs.text;
        return inputs.textBlock;
    }

    /**
     * Lets a text block grow or shrink to fit its text, when true, instead of keeping its set size.
     * @param inputs - The text block and the flag
     * @returns The same text block
     * @group set
     * @shortname set resize to fit
     */
    setRsizeToFit(inputs: Inputs.BabylonGui.SetTextBlockResizeToFitDto): BABYLON.GUI.TextBlock {
        inputs.textBlock.resizeToFit = inputs.resizeToFit;
        return inputs.textBlock;
    }

    /**
     * Sets how a text block handles text wider than itself: wrap onto new lines when true, clip
     * when false, or one of the engine's wrapping modes such as ellipsis.
     * @param inputs - The text block and the wrapping mode
     * @returns The same text block
     * @group set
     * @shortname set text wrapping
     */
    setTextWrapping(inputs: Inputs.BabylonGui.SetTextBlockTextWrappingDto): BABYLON.GUI.TextBlock {
        inputs.textBlock.textWrapping = inputs.textWrapping;
        return inputs.textBlock;
    }

    /**
     * Sets the extra space between the lines of a wrapped text block, as pixels or a string such as
     * `4px`.
     * @param inputs - The text block and the line spacing
     * @returns The same text block
     * @group set
     * @shortname set line spacing
     */
    setLineSpacing(inputs: Inputs.BabylonGui.SetTextBlockLineSpacingDto): BABYLON.GUI.TextBlock {
        inputs.textBlock.lineSpacing = inputs.lineSpacing;
        return inputs.textBlock;
    }

    /**
     * Reads the text a text block currently shows.
     * @param inputs - The text block
     * @returns The text
     * @group get
     * @shortname get text block text
     */
    getText(inputs: Inputs.BabylonGui.TextBlockDto): string {
        return inputs.textBlock.text;
    }

    /**
     * Reads how a text block handles text wider than itself.
     * @param inputs - The text block
     * @returns The wrapping mode
     * @group get
     * @shortname get text wrapping
     */
    getTextWrapping(inputs: Inputs.BabylonGui.TextBlockDto): boolean | BABYLON.GUI.TextWrapping {
        return inputs.textBlock.textWrapping;
    }

    /**
     * Reads the extra space between the lines of a text block.
     * @param inputs - The text block
     * @returns The line spacing
     * @group get
     * @shortname get line spacing
     */
    getLineSpacing(inputs: Inputs.BabylonGui.TextBlockDto): string | number {
        return inputs.textBlock.lineSpacing;
    }

    /**
     * Reads the width of the outline around a text block's letters, 0 meaning none.
     * @param inputs - The text block
     * @returns The outline width
     * @group get
     * @shortname get outline width
     */
    getOutlineWidth(inputs: Inputs.BabylonGui.TextBlockDto): number {
        return inputs.textBlock.outlineWidth;
    }

    /**
     * Reads whether a text block resizes itself to fit its text.
     * @param inputs - The text block
     * @returns True when it resizes to fit
     * @group get
     * @shortname get resize to fit
     */
    getResizeToFit(inputs: Inputs.BabylonGui.TextBlockDto): boolean {
        return inputs.textBlock.resizeToFit;
    }

    /**
     * Reads where the text sits horizontally in its block, as the engine's number for left, center
     * or right.
     * @param inputs - The text block
     * @returns The horizontal alignment code
     * @group get
     * @shortname get text horizontal alignment
     */
    getTextHorizontalAlignment(inputs: Inputs.BabylonGui.TextBlockDto): number {
        return inputs.textBlock.textHorizontalAlignment;
    }

    /**
     * Reads where the text sits vertically in its block, as the engine's number for top, center or
     * bottom.
     * @param inputs - The text block
     * @returns The vertical alignment code
     * @group get
     * @shortname get text vertical alignment
     */
    getTextVerticalAlignment(inputs: Inputs.BabylonGui.TextBlockDto): number {
        return inputs.textBlock.textVerticalAlignment;
    }

    /**
     * Passes through the name of a text block event, its text changing, as a typed selector for
     * code that subscribes to text block events by name.
     * @param inputs - The event selector
     * @returns The same selector
     * @group create
     * @shortname text block observable selector
     */
    createTextBlockObservableSelector(inputs: Inputs.BabylonGui.TextBlockObservableSelectorDto): Inputs.BabylonGui.textBlockObservableSelectorEnum {
        return inputs.selector;
    }
}
