
import { Context } from "../../../context";
import { BabylonGuiAdvancedDynamicTexture } from "./advanced-dynamic-texture";
import { BabylonGuiStackPanel } from "./stack-panel";
import { BabylonGuiContainer } from "./container";
import { BabylonGuiButton } from "./button";
import { BabylonGuiControl } from "./control";
import { BabylonGuiSlider } from "./slider";
import { BabylonGuiTextBlock } from "./text-block";
import { BabylonGuiRadioButton } from "./radio-button";
import { BabylonGuiCheckbox } from "./checkbox";
import { BabylonGuiInputText } from "./input-text";
import { BabylonGuiColorPicker } from "./color-picker";
import { BabylonGuiImage } from "./image";

export class BabylonGui {
    advancedDynamicTexture: BabylonGuiAdvancedDynamicTexture;
    control: BabylonGuiControl;
    container: BabylonGuiContainer;
    stackPanel: BabylonGuiStackPanel;
    button: BabylonGuiButton;
    slider: BabylonGuiSlider;
    textBlock: BabylonGuiTextBlock;
    radioButton: BabylonGuiRadioButton;
    checkbox: BabylonGuiCheckbox;
    inputText: BabylonGuiInputText;
    colorPicker: BabylonGuiColorPicker;
    image: BabylonGuiImage;

    constructor(private readonly context: Context) {
        this.advancedDynamicTexture = new BabylonGuiAdvancedDynamicTexture(context);
        this.control = new BabylonGuiControl(context);
        this.container = new BabylonGuiContainer(context);
        this.stackPanel = new BabylonGuiStackPanel(context);
        this.button = new BabylonGuiButton(context);
        this.slider = new BabylonGuiSlider(context);
        this.textBlock = new BabylonGuiTextBlock(context);
        this.radioButton = new BabylonGuiRadioButton(context);
        this.checkbox = new BabylonGuiCheckbox(context);
        this.inputText = new BabylonGuiInputText(context);
        this.colorPicker = new BabylonGuiColorPicker(context);
        this.image = new BabylonGuiImage(context);
    }

}
