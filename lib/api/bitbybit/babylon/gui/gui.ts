
import { Context } from "../../../context";
import { BabylonGuiAdvancedDynamicTexture } from "./advanced-dynamic-texture";
import { BabylonGuiStackPanel } from "./stack-panel";
import { BabylonGuiContainer } from "./container";
import { BabylonGuiButton } from "./button";
import { BabylonGuiControl } from "./control";
import { BabylonGuiSlider } from "./slider";
import { BabylonGuiTextBlock } from "./text-block";

export class BabylonGui {
    advancedDynamicTexture: BabylonGuiAdvancedDynamicTexture;
    control: BabylonGuiControl;
    container: BabylonGuiContainer;
    stackPanel: BabylonGuiStackPanel;
    button: BabylonGuiButton;
    slider: BabylonGuiSlider;
    textBlock: BabylonGuiTextBlock;

    constructor(private readonly context: Context) {
        this.advancedDynamicTexture = new BabylonGuiAdvancedDynamicTexture(context);
        this.control = new BabylonGuiControl(context);
        this.container = new BabylonGuiContainer(context);
        this.stackPanel = new BabylonGuiStackPanel(context);
        this.button = new BabylonGuiButton(context);
        this.slider = new BabylonGuiSlider(context);
        this.textBlock = new BabylonGuiTextBlock(context);
    }

}
