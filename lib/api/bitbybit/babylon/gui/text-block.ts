
import { Context } from "../../../context";
import * as GUI from "@babylonjs/gui";
import * as Inputs from "../../../inputs/inputs";

export class BabylonGuiTextBlock {

    constructor(private readonly context: Context) { }

    /**
     * Creates text block
     * @param inputs text block properties
     * @group create
     * @shortname create text block
     * @disposableOutput true
     */
    createTextBlock(inputs: Inputs.BabylonGui.CreateTextBlockDto): GUI.TextBlock {
        const textBlock = new GUI.TextBlock(inputs.name, inputs.text);

        if (inputs.height) {
            textBlock.height = inputs.height;
        } else {
            textBlock.height = 1;
        }
        if (inputs.width) {
            textBlock.width = inputs.width;
        } else {
            textBlock.width = "42px";
        }
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
        inputs.container.addControl(textBlock);
        return textBlock;
    }

    /**
     * Change the alignment for the text
     * @param inputs the text block and the alignment values
     * @returns control that has changed text alignment
     * @group positioning
     * @shortname align text block text
     */
    alignText(inputs: Inputs.BabylonGui.AlignmentDto<GUI.TextBlock>): GUI.TextBlock {
        switch (inputs.horizontalAlignment) {
            case Inputs.BabylonGui.horizontalAlignmentEnum.left:
                inputs.control.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
                break;
            case Inputs.BabylonGui.horizontalAlignmentEnum.right:
                inputs.control.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
                break;
            case Inputs.BabylonGui.horizontalAlignmentEnum.center:
                inputs.control.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
                break;
        }
        switch (inputs.verticalAlignment) {
            case Inputs.BabylonGui.verticalAlignmentEnum.top:
                inputs.control.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
                break;
            case Inputs.BabylonGui.verticalAlignmentEnum.bottom:
                inputs.control.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
                break;
            case Inputs.BabylonGui.verticalAlignmentEnum.center:
                inputs.control.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
                break;
        }
        return inputs.control;
    }

    /**
   * Change the text outline for the text
   * @param inputs the text block and the outline values
   * @returns control that has changed text outline
   * @group set
   * @shortname text outline
   */
    setTextOutline(inputs: Inputs.BabylonGui.SetTextBlockTextOutlineDto): GUI.TextBlock {
        inputs.textBlock.outlineWidth = inputs.outlineWidth;
        inputs.textBlock.outlineColor = inputs.outlineColor;
        return inputs.textBlock;
    }

    /**
     * Sets the new text to the text block
     * @param inputs text block and text
     * @returns control that has changed text
     * @group set
     * @shortname set text block text
     */
    setText(inputs: Inputs.BabylonGui.SetTextBlockTextDto): GUI.TextBlock {
        inputs.textBlock.text = inputs.text;
        return inputs.textBlock;
    }

    /**
     * Enable or disable resize to fit
     * @param inputs text block and boolean value
     * @returns control that has enabled or disabled resize to fit
     * @group set
     * @shortname set resize to fit
     */
    setRsizeToFit(inputs: Inputs.BabylonGui.SetTextBlockResizeToFitDto): GUI.TextBlock {
        inputs.textBlock.resizeToFit = inputs.resizeToFit;
        return inputs.textBlock;
    }

    /**
     * Sets the new text wrapping to the text block
     * @param inputs text block and text wrapping
     * @returns control that has changed text wrapping
     * @group set
     * @shortname set text wrapping
     */
    setTextWrapping(inputs: Inputs.BabylonGui.SetTextBlockTextWrappingDto): GUI.TextBlock {
        inputs.textBlock.textWrapping = inputs.textWrapping;
        return inputs.textBlock;
    }

    /**
     * Sets the line spacing of the text
     * @param inputs text block and line spacing
     * @returns control that has changed line spacing
     * @group set
     * @shortname set line spacing
     */
    setLineSpacing(inputs: Inputs.BabylonGui.SetTextBlockLineSpacingDto): GUI.TextBlock {
        inputs.textBlock.lineSpacing = inputs.lineSpacing;
        return inputs.textBlock;
    }

    /**
     * Gets the text of the text block
     * @param inputs text block
     * @returns text of the text block
     * @group get
     * @shortname get text block text
     */
    getText(inputs: Inputs.BabylonGui.TextBlockDto): string {
        return inputs.textBlock.text;
    }

    /**
     * Gets the text wrapping of the text block
     * @param inputs text block
     * @returns text wrapping of the text block
     * @group get
     * @shortname get text wrapping
     */
    getTextWrapping(inputs: Inputs.BabylonGui.TextBlockDto): boolean | GUI.TextWrapping {
        return inputs.textBlock.textWrapping;
    }

    /**
     * Gets the line spacing of the text block
     * @param inputs text block
     * @returns line spacing of the text block
     * @group get
     * @shortname get line spacing
     */
    getLineSpacing(inputs: Inputs.BabylonGui.TextBlockDto): string | number {
        return inputs.textBlock.lineSpacing;
    }

    /**
     * Gets the outline width of the text block
     * @param inputs text block
     * @returns outline width of the text block
     * @group get
     * @shortname get outline width
     */
    getOutlineWidth(inputs: Inputs.BabylonGui.TextBlockDto): number {
        return inputs.textBlock.outlineWidth;
    }

    /**
     * Gets the resize to fit of the text block
     * @param inputs text block
     * @returns resize to fit of the text block
     * @group get
     * @shortname get resize to fit
     */
    getResizeToFit(inputs: Inputs.BabylonGui.TextBlockDto): boolean {
        return inputs.textBlock.resizeToFit;
    }

    /**
     * Gets the text horizontal alignment of the text block
     * @param inputs text block
     * @returns text horizontal alignment of the text block
     * @group get
     * @shortname get text horizontal alignment
     */
    getTextHorizontalAlignment(inputs: Inputs.BabylonGui.TextBlockDto): number {
        return inputs.textBlock.textHorizontalAlignment;
    }

    /**
     * Gets the text vertical alignment of the text block
     * @param inputs text block
     * @returns text vertical alignment of the text block
     * @group get
     * @shortname get text vertical alignment
     */
    getTextVerticalAlignment(inputs: Inputs.BabylonGui.TextBlockDto): number {
        return inputs.textBlock.textVerticalAlignment;
    }

    /**
    * Creates the selector of an observable for a text block
    * @param inputs observable name
    * @group create
    * @shortname text block observable selector
    */
    createTextBlockObservableSelector(inputs: Inputs.BabylonGui.TextBlockObservableSelectorDto): Inputs.BabylonGui.textBlockObservableSelectorEnum {
        return inputs.selector;
    }
}
