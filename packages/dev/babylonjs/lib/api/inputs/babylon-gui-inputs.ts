/* eslint-disable @typescript-eslint/no-namespace */
import * as BABYLON from "../../gui-enriched-babylon";
import { BabylonTexture } from "./babylon-texture-inputs";

// tslint:disable-next-line: no-namespace
/**
 * Parameters for the in-scene 2D interface: buttons, sliders, checkboxes, color pickers, text blocks,
 * input fields, images and the containers that lay them out. Use it for controls that live inside the
 * 3D canvas rather than in the surrounding page.
 */
export namespace BabylonGui {

    /**
     * Horizontal alignment of an in-scene GUI control within its container.
     */
    export enum horizontalAlignmentEnum {
        left = "left",
        center = "center",
        right = "right"
    }

    /**
     * Vertical alignment of an in-scene GUI control within its container.
     */
    export enum verticalAlignmentEnum {
        top = "top",
        center = "center",
        bottom = "bottom"
    }
    export enum inputTextObservableSelectorEnum {
        /** Observable raised when the text changes */
        onTextChangedObservable = "onTextChangedObservable",
        /** Observable raised just before an entered character is to be added */
        onBeforeKeyAddObservable = "onBeforeKeyAddObservable",
        /** Observable raised when the text is highlighted */
        onTextHighlightObservable = "onTextHighlightObservable",
        /** Observable raised when copy event is triggered */
        onTextCopyObservable = "onTextCopyObservable",
        /** Observable raised when cut event is triggered */
        onTextCutObservable = "onTextCutObservable",
        /** Observable raised when paste event is triggered */
        onTextPasteObservable = "onTextPasteObservable"
    }
    export enum sliderObservableSelectorEnum {
        /**
         * Raised when the value has changed
         */
        onValueChangedObservable = "onValueChangedObservable"
    }
    export enum colorPickerObservableSelectorEnum {
        /**
         * Raised when the value has changed
         */
        onValueChangedObservable = "onValueChangedObservable"
    }
    export enum textBlockObservableSelectorEnum {
        /**
         * Raised when the text has changed
         */
        onTextChangedObservable = "onTextChangedObservable"
    }
    export enum checkboxObservableSelectorEnum {
        /**
         * Raised when the checkbox is checked or unchecked
         */
        onIsCheckedChangedObservable = "onIsCheckedChangedObservable"
    }
    export enum radioButtonObservableSelectorEnum {
        /**
         * Raised when the radio button is checked or unchecked
         */
        onIsCheckedChangedObservable = "onIsCheckedChangedObservable"
    }
    export enum controlObservableSelectorEnum {
        onFocusObservable = "onFocusObservable",
        onBlurObservable = "onBlurObservable",
        /**
         * Observable that fires whenever the accessibility event of the control has changed
         */
        onAccessibilityTagChangedObservable = "onAccessibilityTagChangedObservable",
        /**
         * An event triggered when pointer wheel is scrolled
         */
        onWheelObservable = "onWheelObservable",
        /**
         * An event triggered when the pointer moves over the control.
         */
        onPointerMoveObservable = "onPointerMoveObservable",
        /**
         * An event triggered when the pointer moves out of the control.
         */
        onPointerOutObservable = "onPointerOutObservable",
        /**
         * An event triggered when the pointer taps the control
         */
        onPointerDownObservable = "onPointerDownObservable",
        /**
         * An event triggered when pointer up
         */
        onPointerUpObservable = "onPointerUpObservable",
        /**
         * An event triggered when a control is clicked on
         */
        onPointerClickObservable = "onPointerClickObservable",
        /**
         * An event triggered when a control receives an ENTER key down event
         */
        onEnterPressedObservable = "onEnterPressedObservable",
        /**
         * An event triggered when pointer enters the control
         */
        onPointerEnterObservable = "onPointerEnterObservable",
        /**
         * An event triggered when the control is marked as dirty
         */
        onDirtyObservable = "onDirtyObservable",
        /**
         * An event triggered before drawing the control
         */
        onBeforeDrawObservable = "onBeforeDrawObservable",
        /**
         * An event triggered after the control was drawn
         */
        onAfterDrawObservable = "onAfterDrawObservable",
        /**
         * An event triggered when the control has been disposed
         */
        onDisposeObservable = "onDisposeObservable",
        /**
         * An event triggered when the control isVisible is changed
         */
        onIsVisibleChangedObservable = "onIsVisibleChangedObservable"
    }

    /**
     * Feeds `babylon.gui.advancedDynamicTexture.createFullScreenUI`: the name of the full-screen
     * GUI layer, whether it draws in front of the scene and whether it scales with pixel density.
     */
    export class CreateFullScreenUIDto {
        constructor(name?: string, foreground?: boolean, adaptiveScaling?: boolean) {
            if (name !== undefined) { this.name = name; }
            if (foreground !== undefined) { this.foreground = foreground; }
            if (adaptiveScaling !== undefined) { this.adaptiveScaling = adaptiveScaling; }
        }
        /**
         * Name the GUI layer is known by in the scene
         * @default fullscreen
         */
        name = "fullscreen";
        /**
         * When true, the layer is drawn in front of the scene; when false, behind it
         * @default true
         */
        foreground?: boolean | undefined;
        /**
         * When true, the layer scales with the screen's pixel density so controls keep their size
         * on dense displays
         * @default false
         */
        adaptiveScaling?: boolean | undefined;
    }

    /**
     * Feeds `babylon.gui.advancedDynamicTexture.createForMesh`: the mesh a GUI texture is wrapped
     * onto, the texture size and the pointer, alpha, flip and sampling options.
     */
    export class CreateForMeshDto {
        constructor(mesh?: BABYLON.AbstractMesh, width?: number, height?: number, supportPointerMove?: boolean, onlyAlphaTesting?: boolean, invertY?: boolean, sampling?: BabylonTexture.samplingModeEnum) {
            if (mesh !== undefined) { this.mesh = mesh; }
            if (width !== undefined) { this.width = width; }
            if (height !== undefined) { this.height = height; }
            if (supportPointerMove !== undefined) { this.supportPointerMove = supportPointerMove; }
            if (onlyAlphaTesting !== undefined) { this.onlyAlphaTesting = onlyAlphaTesting; }
            if (invertY !== undefined) { this.invertY = invertY; }
            if (sampling !== undefined) { this.sampling = sampling; }
        }
        /**
         * The mesh the GUI is drawn on; it needs texture coordinates, a plane being the usual
         * choice
         * @default undefined
         */
        mesh!: BABYLON.AbstractMesh;
        /**
         * Width of the GUI texture in pixels; left out, the engine chooses
         * @default undefined
         * @optional true
         */
        width?: number | undefined;
        /**
         * Height of the GUI texture in pixels; left out, the engine chooses
         * @default undefined
         * @optional true
         */
        height?: number | undefined;
        /**
         * When true, controls on the mesh react to the pointer moving over them, at some extra cost
         * @default true
         */
        supportPointerMove = true;
        /**
         * When true, transparent pixels are cut out instead of blended, which avoids sorting
         * problems
         * @default false
         */
        onlyAlphaTesting = false;
        /**
         * When true, the texture is flipped top to bottom; the default is right for most meshes
         * @default true
         */
        invertY = true;
        /**
         * How texture pixels are read when scaled: nearest keeps hard pixels, bilinear and
         * trilinear blend them
         * @default trilinear
         */
        sampling = BabylonTexture.samplingModeEnum.trilinear;
    }

    /**
     * Feeds `babylon.gui.stackPanel.createStackPanel`: the name, direction, spacing, optional sizes
     * and colors of a panel that lines its children up.
     */
    export class CreateStackPanelDto {
        constructor(name?: string, isVertical?: boolean, spacing?: number, width?: number | string, height?: number | string, color?: string, background?: string) {
            if (name !== undefined) { this.name = name; }
            if (isVertical !== undefined) { this.isVertical = isVertical; }
            if (spacing !== undefined) { this.spacing = spacing; }
            if (width !== undefined) { this.width = width; }
            if (height !== undefined) { this.height = height; }
            if (color !== undefined) { this.color = color; }
            if (background !== undefined) { this.background = background; }
        }
        /**
         * Name the panel is known by, which `control.getControlByName` finds it by
         * @default stackPanel
         */
        name = "stackPanel";
        /**
         * When true, children stack top to bottom; when false, left to right
         * @default true
         */
        isVertical = true;
        /**
         * Gap between neighboring children, in pixels
         * @default 0
         */
        spacing = 0;
        /**
         * Width as a pixel string or a fraction; give it for a vertical panel and leave it out for
         * a horizontal one, which sizes from its children
         * @default undefined
         * @optional true
         */
        width!: number | string;
        /**
         * Height as a pixel string or a fraction; give it for a horizontal panel and leave it out
         * for a vertical one, which sizes from its children
         * @default undefined
         * @optional true
         */
        height!: number | string;
        /**
         * CSS color of the panel's text and border; the default is fully transparent
         * @default #00000000
         */
        color = "#00000000";
        /**
         * CSS color behind the children; the default is a translucent black so the panel can be
         * seen
         * @default #00000055
         */
        background = "#00000055";
    }
    /**
     * Feeds `babylon.gui.stackPanel.setIsVertical` with a stack panel and its stacking direction.
     */
    export class SetStackPanelIsVerticalDto {
        constructor(stackPanel?: BABYLON.GUI.StackPanel, isVertical?: boolean) {
            if (stackPanel !== undefined) { this.stackPanel = stackPanel; }
            if (isVertical !== undefined) { this.isVertical = isVertical; }
        }
        /**
         * The stack panel to change in place
         * @default undefined
         */
        stackPanel!: BABYLON.GUI.StackPanel;
        /**
         * When true, children stack top to bottom; when false, left to right
         * @default true
         */
        isVertical = true;
    }
    /**
     * Feeds `babylon.gui.stackPanel.setSpacing` with a stack panel and the gap between its
     * children.
     */
    export class SetStackPanelSpacingDto {
        constructor(stackPanel?: BABYLON.GUI.StackPanel, spacing?: number) {
            if (stackPanel !== undefined) { this.stackPanel = stackPanel; }
            if (spacing !== undefined) { this.spacing = spacing; }
        }
        /**
         * The stack panel to change in place
         * @default undefined
         */
        stackPanel!: BABYLON.GUI.StackPanel;
        /**
         * Gap between neighboring children, in pixels
         * @default 0
         */
        spacing = 0;
    }
    /**
     * Feeds `babylon.gui.stackPanel.setWidth` with a stack panel and its new width.
     */
    export class SetStackPanelWidthDto {
        constructor(stackPanel?: BABYLON.GUI.StackPanel, width?: number | string) {
            if (stackPanel !== undefined) { this.stackPanel = stackPanel; }
            if (width !== undefined) { this.width = width; }
        }
        /**
         * The stack panel to change in place
         * @default undefined
         */
        stackPanel!: BABYLON.GUI.StackPanel;
        /**
         * Width as a pixel string such as `300px` or a fraction of the parent from 0 to 1
         * @default undefined
         * @optional true
         */
        width!: number | string;
    }
    /**
     * Feeds `babylon.gui.stackPanel.setHeight` with a stack panel and its new height.
     */
    export class SetStackPanelHeightDto {
        constructor(stackPanel?: BABYLON.GUI.StackPanel, height?: number | string) {
            if (stackPanel !== undefined) { this.stackPanel = stackPanel; }
            if (height !== undefined) { this.height = height; }
        }
        /**
         * The stack panel to change in place
         * @default undefined
         */
        stackPanel!: BABYLON.GUI.StackPanel;
        /**
         * Height as a pixel string such as `300px` or a fraction of the parent from 0 to 1
         * @default undefined
         * @optional true
         */
        height!: number | string;
    }
    /**
     * Feeds the `babylon.gui.stackPanel` getters with the stack panel to read from.
     */
    export class StackPanelDto {
        constructor(stackPanel?: BABYLON.GUI.StackPanel) {
            if (stackPanel !== undefined) { this.stackPanel = stackPanel; }
        }
        /**
         * The stack panel to read from
         * @default undefined
         */
        stackPanel!: BABYLON.GUI.StackPanel;
    }
    /**
     * Feeds the slider observable selector method with the name of the slider event to select.
     */
    export class SliderObservableSelectorDto {
        constructor(selector: sliderObservableSelectorEnum) {
            this.selector = selector;
        }
        /**
         * Which slider event, by its observable name
         * @default onValueChangedObservable
         */
        selector: sliderObservableSelectorEnum;
    }
    /**
     * Feeds the color picker observable selector method with the name of the color picker event to
     * select.
     */
    export class ColorPickerObservableSelectorDto {
        constructor(selector: colorPickerObservableSelectorEnum) {
            this.selector = selector;
        }
        /**
         * Which color picker event, by its observable name
         * @default onValueChangedObservable
         */
        selector: colorPickerObservableSelectorEnum;
    }
    /**
     * Feeds the text field observable selector method with the name of the text field event to
     * select.
     */
    export class InputTextObservableSelectorDto {
        constructor(selector: inputTextObservableSelectorEnum) {
            this.selector = selector;
        }
        /**
         * Which text field event, by its observable name
         * @default onTextChangedObservable
         */
        selector: inputTextObservableSelectorEnum;
    }
    /**
     * Feeds the radio button observable selector method with the name of the radio button event to
     * select.
     */
    export class RadioButtonObservableSelectorDto {
        constructor(selector: radioButtonObservableSelectorEnum) {
            this.selector = selector;
        }
        /**
         * Which radio button event, by its observable name
         * @default onIsCheckedChangedObservable
         */
        selector: radioButtonObservableSelectorEnum;
    }

    /**
     * Feeds the checkbox observable selector method with the name of the checkbox event to select.
     */
    export class CheckboxObservableSelectorDto {
        constructor(selector: checkboxObservableSelectorEnum) {
            this.selector = selector;
        }
        /**
         * Which checkbox event, by its observable name
         * @default onIsCheckedChangedObservable
         */
        selector: checkboxObservableSelectorEnum;
    }

    /**
     * Feeds the control observable selector method with the name of the control event to select.
     */
    export class ControlObservableSelectorDto {
        constructor(selector: controlObservableSelectorEnum) {
            this.selector = selector;
        }
        /**
         * Which control event, by its observable name
         * @default onPointerClickObservable
         */
        selector: controlObservableSelectorEnum;
    }
    /**
     * Feeds the text block observable selector method with the name of the text block event to
     * select.
     */
    export class TextBlockObservableSelectorDto {
        constructor(selector: textBlockObservableSelectorEnum) {
            this.selector = selector;
        }
        /**
         * Which text block event, by its observable name
         * @default onTextChangedObservable
         */
        selector: textBlockObservableSelectorEnum;
    }
    /**
     * Feeds the `babylon.gui.container` getters with the container to read from.
     */
    export class ContainerDto {
        constructor(container?: BABYLON.GUI.Container) {
            if (container !== undefined) { this.container = container; }
        }
        /**
         * The container to read from, a stack panel or the root of a GUI texture
         * @default undefined
         */
        container!: BABYLON.GUI.Container;
    }
    /**
     * Feeds `babylon.gui.container.addControls`: the container, the controls to put in it and
     * whether to empty it first.
     */
    export class AddControlsToContainerDto {
        constructor(container?: BABYLON.GUI.StackPanel, controls?: BABYLON.GUI.Control[], clearControlsFirst?: boolean) {
            if (container !== undefined) { this.container = container; }
            if (controls !== undefined) { this.controls = controls; }
            if (clearControlsFirst !== undefined) { this.clearControlsFirst = clearControlsFirst; }
        }
        /**
         * The panel or root that receives the controls as its children
         * @default undefined
         */
        container!: BABYLON.GUI.Container;
        /**
         * The controls to add, in the order they should appear
         * @default undefined
         */
        controls!: BABYLON.GUI.Control[];
        /**
         * When true, the container is emptied first, so the order is exactly the list's
         * @default true
         */
        clearControlsFirst = true;
    }
    /**
     * Feeds `babylon.gui.control.getControlByName` with the container to search and the name to
     * look for.
     */
    export class GetControlByNameDto {
        constructor(container?: BABYLON.GUI.Container, name?: string) {
            if (container !== undefined) { this.container = container; }
            if (name !== undefined) { this.name = name; }
        }
        /**
         * The container searched, children included
         * @default undefined
         */
        container!: BABYLON.GUI.Container;
        /**
         * The name the control was created with
         * @default controlName
         */
        name = "controlName";
    }
    /**
     * Feeds `babylon.gui.control.setIsVisible` with a control and whether it is shown.
     */
    export class SetControlIsVisibleDto {
        constructor(control?: BABYLON.GUI.Control, isVisible?: boolean) {
            if (control !== undefined) { this.control = control; }
            if (isVisible !== undefined) { this.isVisible = isVisible; }
        }
        /**
         * The control to change in place
         * @default undefined
         */
        control!: BABYLON.GUI.Control;
        /**
         * When true, the control is shown; when false, hidden while keeping its place in the layout
         * @default true
         */
        isVisible = true;
    }
    /**
     * Feeds `babylon.gui.control.setIsReadonly` with a control and whether it ignores input.
     */
    export class SetControlIsReadonlyDto {
        constructor(control?: BABYLON.GUI.Control, isReadOnly?: boolean) {
            if (control !== undefined) { this.control = control; }
            if (isReadOnly !== undefined) { this.isReadOnly = isReadOnly; }
        }
        /**
         * The control to change in place
         * @default undefined
         */
        control!: BABYLON.GUI.Control;
        /**
         * When true, the control is shown normally but ignores input
         * @default false
         */
        isReadOnly = false;
    }
    /**
     * Feeds `babylon.gui.control.setIsEnabled` with a control and whether it is active.
     */
    export class SetControlIsEnabledDto {
        constructor(control?: BABYLON.GUI.Control, isEnabled?: boolean) {
            if (control !== undefined) { this.control = control; }
            if (isEnabled !== undefined) { this.isEnabled = isEnabled; }
        }
        /**
         * The control to change in place
         * @default undefined
         */
        control!: BABYLON.GUI.Control;
        /**
         * When true, the control is active; when false, it is drawn dimmed and ignores input
         * @default true
         */
        isEnabled = true;
    }
    /**
     * Feeds `babylon.gui.image.createImage`: the name, the picture's address, a color and the
     * optional size of an image control.
     */
    export class CreateImageDto {
        constructor(name?: string, url?: string, color?: string, width?: number | string, height?: number | string) {
            if (name !== undefined) { this.name = name; }
            if (url !== undefined) { this.url = url; }
            if (color !== undefined) { this.color = color; }
            if (width !== undefined) { this.width = width; }
            if (height !== undefined) { this.height = height; }
        }
        /**
         * Name the image is known by, which `control.getControlByName` finds it by
         * @default imageName
         */
        name = "imageName";
        /**
         * Address the picture is loaded from
         * @default undefined
         */
        url!: string;
        /**
         * CSS color of the control, used for its border
         * @default black
         */
        color = "black";
        /**
         * Width, as a pixel string such as `200px` or a fraction of the parent from 0 to 1; left
         * out, the engine chooses
         * @default undefined
         * @optional true
         */
        width?: number | string | undefined;
        /**
         * Height, as a pixel string such as `200px` or a fraction of the parent from 0 to 1; left
         * out, the engine chooses
         * @default undefined
         * @optional true
         */
        height?: number | string | undefined;
    }
    /**
     * Feeds `babylon.gui.image.setSourceUrl` with an image control and the address of its new
     * picture.
     */
    export class SetImageUrlDto {
        constructor(image?: BABYLON.GUI.Image, url?: string) {
            if (image !== undefined) { this.image = image; }
            if (url !== undefined) { this.url = url; }
        }
        /**
         * The image control to change in place
         * @default undefined
         */
        image!: BABYLON.GUI.Image;
        /**
         * Address the new picture is loaded from
         * @default undefined
         */
        url!: string;
    }
    /**
     * Feeds `babylon.gui.image.getSourceUrl` with the image control to read from.
     */
    export class ImageDto {
        constructor(image?: BABYLON.GUI.Image) {
            if (image !== undefined) { this.image = image; }
        }
        /**
         * The image control to read from
         * @default undefined
         */
        image!: BABYLON.GUI.Image;
    }
    /**
     * Feeds `babylon.gui.button.createSimpleButton`: the name, label, colors, optional size and
     * font size of a button.
     */
    export class CreateButtonDto {
        constructor(name?: string, label?: string, color?: string, background?: string, width?: number | string, height?: number | string, fontSize?: number) {
            if (name !== undefined) { this.name = name; }
            if (label !== undefined) { this.label = label; }
            if (color !== undefined) { this.color = color; }
            if (background !== undefined) { this.background = background; }
            if (width !== undefined) { this.width = width; }
            if (height !== undefined) { this.height = height; }
            if (fontSize !== undefined) { this.fontSize = fontSize; }
        }
        /**
         * Name the button is known by, which `control.getControlByName` finds it by
         * @default buttonName
         */
        name = "buttonName";
        /**
         * The text shown on the button
         * @default Click me!
         */
        label = "Click me!";
        /**
         * CSS color of the label text
         * @default black
         */
        color = "black";
        /**
         * CSS color of the button's face
         * @default #f0cebb
         */
        background = "#f0cebb";
        /**
         * Width, as a pixel string such as `200px` or a fraction of the parent from 0 to 1; left
         * out, the engine chooses
         * @default undefined
         * @optional true
         */
        width?: number | string | undefined;
        /**
         * Height, as a pixel string such as `200px` or a fraction of the parent from 0 to 1; left
         * out, the engine chooses
         * @default undefined
         * @optional true
         */
        height?: number | string | undefined;
        /**
         * Font size of the label, in pixels
         * @default 24
         */
        fontSize = 24;
    }
    /**
     * Feeds `babylon.gui.button.setButtonText` with a button and its new label.
     */
    export class SetButtonTextDto {
        constructor(button?: BABYLON.GUI.Button, text?: string) {
            if (button !== undefined) { this.button = button; }
            if (text !== undefined) { this.text = text; }
        }
        /**
         * The button to change in place
         * @default undefined
         */
        button!: BABYLON.GUI.Button;
        /**
         * The text shown on the button from then on
         * @default Click me!
         */
        text = "Click me!";
    }
    /**
     * Feeds `babylon.gui.button.getButtonText` with the button to read from.
     */
    export class ButtonDto {
        constructor(button?: BABYLON.GUI.Button) {
            if (button !== undefined) { this.button = button; }
        }
        /**
         * The button to read from
         * @default undefined
         */
        button!: BABYLON.GUI.Button;
    }

    /**
     * Feeds `babylon.gui.colorPicker.createColorPicker`: the name, starting color and optional
     * sizes of a color picker.
     */
    export class CreateColorPickerDto {
        constructor(name?: string, defaultColor?: string, color?: string, width?: number | string, height?: number | string, size?: number | string) {
            if (name !== undefined) { this.name = name; }
            if (defaultColor !== undefined) { this.defaultColor = defaultColor; }
            if (color !== undefined) { this.color = color; }
            if (width !== undefined) { this.width = width; }
            if (height !== undefined) { this.height = height; }
            if (size !== undefined) { this.size = size; }
        }
        /**
         * Name the color picker is known by, which `control.getControlByName` finds it by
         * @default colorPickerName
         */
        name = "colorPickerName";
        /**
         * Hex color the picker starts on
         * @default #f0cebb
         */
        defaultColor = "#f0cebb";
        /**
         * CSS color of the control's border
         * @default #f0cebb
         */
        color = "#f0cebb";
        /**
         * Width as a pixel string or a fraction; left out, 300 pixels
         * @default undefined
         * @optional true
         */
        width?: number | string | undefined;
        /**
         * Height as a pixel string or a fraction; left out, 300 pixels
         * @default undefined
         * @optional true
         */
        height?: number | string | undefined;
        /**
         * Width and height together, as a pixel string or a fraction; it overrides both when given
         * @default 300px
         * @optional true
         */
        size?: number | string | undefined;
    }
    /**
     * Feeds `babylon.gui.colorPicker.setColorPickerValue` with a color picker and the color to move
     * it to.
     */
    export class SetColorPickerValueDto {
        constructor(colorPicker?: BABYLON.GUI.ColorPicker, color?: string) {
            if (colorPicker !== undefined) { this.colorPicker = colorPicker; }
            if (color !== undefined) { this.color = color; }
        }
        /**
         * The color picker to change in place
         * @default undefined
         */
        colorPicker!: BABYLON.GUI.ColorPicker;
        /**
         * Hex color the picker is set to
         * @default undefined
         */
        color!: string;
    }
    /**
     * Feeds `babylon.gui.colorPicker.setColorPickerSize` with a color picker and its new size.
     */
    export class SetColorPickerSizeDto {
        constructor(colorPicker?: BABYLON.GUI.ColorPicker, size?: number | string) {
            if (colorPicker !== undefined) { this.colorPicker = colorPicker; }
            if (size !== undefined) { this.size = size; }
        }
        /**
         * The color picker to change in place
         * @default undefined
         */
        colorPicker!: BABYLON.GUI.ColorPicker;
        /**
         * Width and height together, as a pixel string or a fraction
         * @default 300px
         * @optional true
         */
        size?: number | string | undefined;
    }
    /**
     * Feeds the `babylon.gui.colorPicker` getters with the color picker to read from.
     */
    export class ColorPickerDto {
        constructor(colorPicker?: BABYLON.GUI.ColorPicker) {
            if (colorPicker !== undefined) { this.colorPicker = colorPicker; }
        }
        /**
         * The color picker to read from
         * @default undefined
         */
        colorPicker!: BABYLON.GUI.ColorPicker;
    }
    /**
     * Feeds `babylon.gui.checkbox.createCheckbox`: the name, starting state, mark size, colors and
     * optional size of a checkbox.
     */
    export class CreateCheckboxDto {
        constructor(name?: string, isChecked?: boolean, checkSizeRatio?: number, color?: string, background?: string, width?: number | string, height?: number | string) {
            if (name !== undefined) { this.name = name; }
            if (isChecked !== undefined) { this.isChecked = isChecked; }
            if (checkSizeRatio !== undefined) { this.checkSizeRatio = checkSizeRatio; }
            if (color !== undefined) { this.color = color; }
            if (background !== undefined) { this.background = background; }
            if (width !== undefined) { this.width = width; }
            if (height !== undefined) { this.height = height; }
        }
        /**
         * Name the checkbox is known by, which `control.getControlByName` finds it by
         * @default checkboxName
         */
        name = "checkboxName";
        /**
         * When true, the checkbox starts checked
         * @default false
         */
        isChecked = false;
        /**
         * How much of the square the inner mark fills, from 0 to 1
         * @default 0.8
         * @minimum 0
         * @maximum 1
         * @step 0.05
         */
        checkSizeRatio = 0.8;
        /**
         * CSS color of the mark and the border
         * @default #f0cebb
         */
        color = "#f0cebb";
        /**
         * CSS color of the square behind the mark
         * @default black
         */
        background = "black";
        /**
         * Width, as a pixel string such as `200px` or a fraction of the parent from 0 to 1; left
         * out, the engine chooses
         * @default undefined
         * @optional true
         */
        width?: number | string | undefined;
        /**
         * Height, as a pixel string such as `200px` or a fraction of the parent from 0 to 1; left
         * out, the engine chooses
         * @default undefined
         * @optional true
         */
        height?: number | string | undefined;
    }

    /**
     * Feeds `babylon.gui.control.setFontSize` with a control and the font size of its text.
     */
    export class SetControlFontSizeDto {
        constructor(control?: BABYLON.GUI.Control, fontSize?: number) {
            if (control !== undefined) { this.control = control; }
            if (fontSize !== undefined) { this.fontSize = fontSize; }
        }
        /**
         * The control to change in place
         * @default undefined
         */
        control!: BABYLON.GUI.Control;
        /**
         * Font size of the control's text, in pixels
         * @default 24
         */
        fontSize = 24;
    }
    /**
     * Feeds `babylon.gui.control.setHeight` with a control and its new height.
     */
    export class SetControlHeightDto {
        constructor(control?: BABYLON.GUI.Control, height?: number | string) {
            if (control !== undefined) { this.control = control; }
            if (height !== undefined) { this.height = height; }
        }
        /**
         * The control to change in place
         * @default undefined
         */
        control!: BABYLON.GUI.Control;
        /**
         * Height as a pixel string such as `40px` or a fraction of the parent from 0 to 1
         * @default undefined
         */
        height!: number | string;
    }
    /**
     * Feeds `babylon.gui.control.setWidth` with a control and its new width.
     */
    export class SetControlWidthDto {
        constructor(control?: BABYLON.GUI.Control, width?: number | string) {
            if (control !== undefined) { this.control = control; }
            if (width !== undefined) { this.width = width; }
        }
        /**
         * The control to change in place
         * @default undefined
         */
        control!: BABYLON.GUI.Control;
        /**
         * Width as a pixel string such as `200px` or a fraction of the parent from 0 to 1
         * @default undefined
         */
        width!: number | string;
    }
    /**
     * Feeds `babylon.gui.control.setColor` with a control and its new main color.
     */
    export class SetControlColorDto {
        constructor(control?: BABYLON.GUI.Control, color?: string) {
            if (control !== undefined) { this.control = control; }
            if (color !== undefined) { this.color = color; }
        }
        /**
         * The control to change in place
         * @default undefined
         */
        control!: BABYLON.GUI.Control;
        /**
         * CSS color of the control's text or fill, depending on its kind
         * @default #f0cebb
         */
        color = "#f0cebb";
    }
    /**
     * Feeds `babylon.gui.container.setBackground` with a container and its new background color.
     */
    export class SetContainerBackgroundDto {
        constructor(container?: BABYLON.GUI.Container, background?: string) {
            if (container !== undefined) { this.container = container; }
            if (background !== undefined) { this.background = background; }
        }
        /**
         * The container to change in place
         * @default undefined
         */
        container!: BABYLON.GUI.Container;
        /**
         * CSS color behind the container's children; an eight-digit hex makes it translucent
         * @default black
         */
        background = "black";
    }
    /**
     * Feeds `babylon.gui.container.setIsReadonly` with a container and whether it and its children
     * ignore input.
     */
    export class SetContainerIsReadonlyDto {
        constructor(container?: BABYLON.GUI.Container, isReadOnly?: boolean) {
            if (container !== undefined) { this.container = container; }
            if (isReadOnly !== undefined) { this.isReadOnly = isReadOnly; }
        }
        /**
         * The container to change in place
         * @default undefined
         */
        container!: BABYLON.GUI.Container;
        /**
         * When true, the container and everything in it are shown normally but ignore input
         * @default false
         */
        isReadOnly = false;
    }
    /**
     * Feeds `babylon.gui.checkbox.setBackground` with a checkbox and the color of its square.
     */
    export class SetCheckboxBackgroundDto {
        constructor(checkbox?: BABYLON.GUI.Checkbox, background?: string) {
            if (checkbox !== undefined) { this.checkbox = checkbox; }
            if (background !== undefined) { this.background = background; }
        }
        /**
         * The checkbox to change in place
         * @default undefined
         */
        checkbox!: BABYLON.GUI.Checkbox;
        /**
         * CSS color of the square behind the mark
         * @default black
         */
        background = "black";
    }
    /**
     * Feeds `babylon.gui.checkbox.setCheckSizeRatio` with a checkbox and how large its mark is.
     */
    export class SetCheckboxCheckSizeRatioDto {
        constructor(checkbox?: BABYLON.GUI.Checkbox, checkSizeRatio?: number) {
            if (checkbox !== undefined) { this.checkbox = checkbox; }
            if (checkSizeRatio !== undefined) { this.checkSizeRatio = checkSizeRatio; }
        }
        /**
         * The checkbox to change in place
         * @default undefined
         */
        checkbox!: BABYLON.GUI.Checkbox;
        /**
         * How much of the square the inner mark fills, from 0 to 1
         * @default 0.8
         * @minimum 0
         * @maximum 1
         * @step 0.05
         */
        checkSizeRatio = 0.8;
    }

    /**
     * Feeds the `babylon.gui.checkbox` getters with the checkbox to read from.
     */
    export class CheckboxDto {
        constructor(checkbox?: BABYLON.GUI.Checkbox) {
            if (checkbox !== undefined) { this.checkbox = checkbox; }
        }
        /**
         * The checkbox to read from
         * @default undefined
         */
        checkbox!: BABYLON.GUI.Checkbox;
    }

    /**
     * Feeds the `babylon.gui.control` getters with the control to read from, of any kind.
     */
    export class ControlDto {
        constructor(control?: BABYLON.GUI.Control) {
            if (control !== undefined) { this.control = control; }
        }
        /**
         * The control to read from, of any kind
         * @default undefined
         */
        control!: BABYLON.GUI.Control;
    }

    /**
     * Feeds `babylon.gui.checkbox.setIsChecked` with a checkbox and its new state.
     */
    export class SetCheckboxIsCheckedDto {
        constructor(checkbox?: BABYLON.GUI.Checkbox, isChecked?: boolean) {
            if (checkbox !== undefined) { this.checkbox = checkbox; }
            if (isChecked !== undefined) { this.isChecked = isChecked; }
        }
        /**
         * The checkbox to change in place
         * @default undefined
         */
        checkbox!: BABYLON.GUI.Checkbox;
        /**
         * When true, the checkbox becomes checked; the change fires its event like a click
         * @default false
         */
        isChecked = false;
    }

    /**
     * Feeds `babylon.gui.inputText.createInputText`: the name, starting text, placeholder, colors
     * and optional size of a text field.
     */
    export class CreateInputTextDto {
        constructor(name?: string, color?: string, background?: string, width?: number | string, height?: number | string) {
            if (name !== undefined) { this.name = name; }
            if (color !== undefined) { this.color = color; }
            if (background !== undefined) { this.background = background; }
            if (width !== undefined) { this.width = width; }
            if (height !== undefined) { this.height = height; }
        }
        /**
         * Name the text field is known by, which `control.getControlByName` finds it by
         * @default inputName
         */
        name = "inputName";
        /**
         * The text the field starts with; empty shows the placeholder
         * @default
         */
        text!: string;
        /**
         * The hint shown while the field is empty
         * @default
         */
        placeholder!: string;
        /**
         * CSS color of the typed text
         * @default #f0cebb
         */
        color = "#f0cebb";
        /**
         * CSS color behind the text
         * @default black
         */
        background = "black";
        /**
         * Width, as a pixel string such as `200px` or a fraction of the parent from 0 to 1; left
         * out, the engine chooses
         * @default undefined
         * @optional true
         */
        width?: number | string | undefined;
        /**
         * Height, as a pixel string such as `200px` or a fraction of the parent from 0 to 1; left
         * out, the engine chooses
         * @default undefined
         * @optional true
         */
        height?: number | string | undefined;
    }
    /**
     * Feeds `babylon.gui.inputText.setBackground` with a text field and its new background color.
     */
    export class SetInputTextBackgroundDto {
        constructor(inputText?: BABYLON.GUI.InputText, background?: string) {
            if (inputText !== undefined) { this.inputText = inputText; }
            if (background !== undefined) { this.background = background; }
        }
        /**
         * The text field to change in place
         * @default undefined
         */
        inputText!: BABYLON.GUI.InputText;
        /**
         * CSS color behind the text
         * @default black
         */
        background = "black";
    }
    /**
     * Feeds `babylon.gui.inputText.setText` with a text field and the text to put in it.
     */
    export class SetInputTextTextDto {
        constructor(inputText?: BABYLON.GUI.InputText, text?: string) {
            if (inputText !== undefined) { this.inputText = inputText; }
            if (text !== undefined) { this.text = text; }
        }
        /**
         * The text field to change in place
         * @default undefined
         */
        inputText!: BABYLON.GUI.InputText;
        /**
         * The text the field holds from then on; the change fires its event like typing
         * @default
         */
        text!: string;
    }
    /**
     * Feeds `babylon.gui.inputText.setPlaceholder` with a text field and its new hint.
     */
    export class SetInputTextPlaceholderDto {
        constructor(inputText?: BABYLON.GUI.InputText, placeholder?: string) {
            if (inputText !== undefined) { this.inputText = inputText; }
            if (placeholder !== undefined) { this.placeholder = placeholder; }
        }
        /**
         * The text field to change in place
         * @default undefined
         */
        inputText!: BABYLON.GUI.InputText;
        /**
         * The hint shown while the field is empty
         * @default
         */
        placeholder!: string;
    }
    /**
     * Feeds the `babylon.gui.inputText` getters with the text field to read from.
     */
    export class InputTextDto {
        constructor(inputText?: BABYLON.GUI.InputText) {
            if (inputText !== undefined) { this.inputText = inputText; }
        }
        /**
         * The text field to read from
         * @default undefined
         */
        inputText!: BABYLON.GUI.InputText;
    }

    /**
     * Feeds `babylon.gui.radioButton.createRadioButton`: the name, group, starting state, dot size,
     * colors and optional size of a radio button.
     */
    export class CreateRadioButtonDto {
        constructor(name?: string, group?: string, isChecked?: boolean, checkSizeRatio?: number, color?: string, background?: string, width?: number | string, height?: number | string) {
            if (name !== undefined) { this.name = name; }
            if (group !== undefined) { this.group = group; }
            if (isChecked !== undefined) { this.isChecked = isChecked; }
            if (checkSizeRatio !== undefined) { this.checkSizeRatio = checkSizeRatio; }
            if (color !== undefined) { this.color = color; }
            if (background !== undefined) { this.background = background; }
            if (width !== undefined) { this.width = width; }
            if (height !== undefined) { this.height = height; }
        }
        /**
         * Name the radio button is known by, which `control.getControlByName` finds it by
         * @default radioBtnName
         */
        name = "radioBtnName";
        /**
         * Radio buttons sharing a group let only one of them be checked at a time
         * @default
         * @optional true
         */
        group!: string;
        /**
         * When true, the radio button starts checked
         * @default false
         */
        isChecked = false;
        /**
         * How much of the circle the inner dot fills, from 0 to 1
         * @default 0.8
         * @minimum 0
         * @maximum 1
         * @step 0.05
         */
        checkSizeRatio = 0.8;
        /**
         * CSS color of the dot and the border
         * @default #f0cebb
         */
        color = "#f0cebb";
        /**
         * CSS color of the circle behind the dot
         * @default black
         */
        background = "black";
        /**
         * Width, as a pixel string such as `200px` or a fraction of the parent from 0 to 1; left
         * out, the engine chooses
         * @default undefined
         * @optional true
         */
        width?: number | string | undefined;
        /**
         * Height, as a pixel string such as `200px` or a fraction of the parent from 0 to 1; left
         * out, the engine chooses
         * @default undefined
         * @optional true
         */
        height?: number | string | undefined;
    }
    /**
     * Feeds `babylon.gui.radioButton.setCheckSizeRatio` with a radio button and how large its dot
     * is.
     */
    export class SetRadioButtonCheckSizeRatioDto {
        constructor(radioButton?: BABYLON.GUI.RadioButton, checkSizeRatio?: number) {
            if (radioButton !== undefined) { this.radioButton = radioButton; }
            if (checkSizeRatio !== undefined) { this.checkSizeRatio = checkSizeRatio; }
        }
        /**
         * The radio button to change in place
         * @default undefined
         */
        radioButton!: BABYLON.GUI.RadioButton;
        /**
         * How much of the circle the inner dot fills, from 0 to 1
         * @default 0.8
         * @minimum 0
         * @maximum 1
         * @step 0.05
         */
        checkSizeRatio = 0.8;
    }
    /**
     * Feeds `babylon.gui.radioButton.setGroup` with a radio button and the group it joins.
     */
    export class SetRadioButtonGroupDto {
        constructor(radioButton?: BABYLON.GUI.RadioButton, group?: string) {
            if (radioButton !== undefined) { this.radioButton = radioButton; }
            if (group !== undefined) { this.group = group; }
        }
        /**
         * The radio button to change in place
         * @default undefined
         */
        radioButton!: BABYLON.GUI.RadioButton;
        /**
         * The group joined; only one radio button per group can be checked
         * @default
         */
        group!: string;
    }
    /**
     * Feeds `babylon.gui.radioButton.setBackground` with a radio button and the color of its
     * circle.
     */
    export class SetRadioButtonBackgroundDto {
        constructor(radioButton?: BABYLON.GUI.RadioButton, background?: string) {
            if (radioButton !== undefined) { this.radioButton = radioButton; }
            if (background !== undefined) { this.background = background; }
        }
        /**
         * The radio button to change in place
         * @default undefined
         */
        radioButton!: BABYLON.GUI.RadioButton;
        /**
         * CSS color of the circle behind the dot
         * @default black
         */
        background = "black";
    }
    /**
     * Feeds the `babylon.gui.radioButton` getters with the radio button to read from.
     */
    export class RadioButtonDto {
        constructor(radioButton?: BABYLON.GUI.RadioButton) {
            if (radioButton !== undefined) { this.radioButton = radioButton; }
        }
        /**
         * The radio button to read from
         * @default undefined
         */
        radioButton!: BABYLON.GUI.RadioButton;
    }
    /**
     * Feeds `babylon.gui.slider.createSlider`: the name, range, starting value, step, direction,
     * colors, optional size and thumb of a slider.
     */
    export class CreateSliderDto {
        constructor(name?: string, minimum?: number, maximum?: number, value?: number, step?: number, isVertical?: boolean, color?: string, background?: string, width?: number | string, height?: number | string, displayThumb?: boolean) {
            if (name !== undefined) { this.name = name; }
            if (minimum !== undefined) { this.minimum = minimum; }
            if (maximum !== undefined) { this.maximum = maximum; }
            if (value !== undefined) { this.value = value; }
            if (step !== undefined) { this.step = step; }
            if (isVertical !== undefined) { this.isVertical = isVertical; }
            if (color !== undefined) { this.color = color; }
            if (background !== undefined) { this.background = background; }
            if (width !== undefined) { this.width = width; }
            if (height !== undefined) { this.height = height; }
            if (displayThumb !== undefined) { this.displayThumb = displayThumb; }
        }
        /**
         * Name the slider is known by, which `control.getControlByName` finds it by
         * @default sliderName
         */
        name = "sliderName";
        /**
         * The value at the left or bottom end
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        minimum = 0;
        /**
         * The value at the right or top end
         * @default 10
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        maximum = 10;
        /**
         * The value the slider starts at, between the minimum and maximum
         * @default 5
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        value = 5;
        /**
         * The increment the value moves in; 1 gives whole numbers, 0 moves smoothly
         * @default 0.01
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.01
         */
        step = 0.01;
        /**
         * When true, the slider runs bottom to top; when false, left to right
         * @default false
         */
        isVertical = false;
        /**
         * CSS color of the filled part of the track
         * @default #f0cebb
         */
        color = "#f0cebb";
        /**
         * CSS color of the unfilled part of the track
         * @default black
         */
        background = "black";
        /**
         * Width as a pixel string or a fraction; left out, a horizontal slider fills the parent and
         * a vertical one is 42 pixels
         * @default undefined
         * @optional true
         */
        width?: number | string | undefined;
        /**
         * Height as a pixel string or a fraction; left out, a vertical slider fills the parent and
         * a horizontal one is 42 pixels
         * @default undefined
         * @optional true
         */
        height?: number | string | undefined;
        /**
         * When true, the draggable thumb is drawn; when false, only the track
         * @default true
         */
        displayThumb = true;
    }
    /**
     * Feeds `babylon.gui.textBlock.createTextBlock`: the name, text, color, optional size and font
     * size of a text block.
     */
    export class CreateTextBlockDto {
        constructor(name?: string, text?: string, color?: string, width?: number | string, height?: number | string) {
            if (name !== undefined) { this.name = name; }
            if (text !== undefined) { this.text = text; }
            if (color !== undefined) { this.color = color; }
            if (width !== undefined) { this.width = width; }
            if (height !== undefined) { this.height = height; }
        }
        /**
         * Name the text block is known by, which `control.getControlByName` finds it by
         * @default textBlockName
         */
        name = "textBlockName";
        /**
         * The text shown
         * @default Hello World!
         */
        text = "Hello World!";
        /**
         * CSS color of the text
         * @default #f0cebb
         */
        color = "#f0cebb";
        /**
         * Width, as a pixel string such as `200px` or a fraction of the parent from 0 to 1; left
         * out, the engine chooses
         * @default undefined
         * @optional true
         */
        width?: number | string | undefined;
        /**
         * Height, as a pixel string such as `200px` or a fraction of the parent from 0 to 1; left
         * out, the engine chooses
         * @default undefined
         * @optional true
         */
        height?: number | string | undefined;
        /**
         * Font size of the text, in pixels
         * @default 24
         */
        fontSize = 24;
    }

    /**
     * Feeds `babylon.gui.textBlock.setText` with a text block and its new text.
     */
    export class SetTextBlockTextDto {
        constructor(textBlock?: BABYLON.GUI.TextBlock, text?: string) {
            if (textBlock !== undefined) { this.textBlock = textBlock; }
            if (text !== undefined) { this.text = text; }
        }
        /**
         * The text block to change in place
         * @default undefined
         */
        textBlock!: BABYLON.GUI.TextBlock;
        /**
         * The text shown from then on
         * @default undefined
         */
        text!: string;
    }

    /**
     * Feeds `babylon.gui.textBlock.setRsizeToFit` with a text block and whether it sizes itself to
     * its text.
     */
    export class SetTextBlockResizeToFitDto {
        constructor(textBlock?: BABYLON.GUI.TextBlock, resizeToFit?: boolean) {
            if (textBlock !== undefined) { this.textBlock = textBlock; }
            if (resizeToFit !== undefined) { this.resizeToFit = resizeToFit; }
        }
        /**
         * The text block to change in place
         * @default undefined
         */
        textBlock!: BABYLON.GUI.TextBlock;
        /**
         * When true, the block grows or shrinks to fit its text instead of keeping its set size
         * @default false
         */
        resizeToFit = false;
    }
    /**
     * Feeds `babylon.gui.textBlock.setTextWrapping` with a text block and how it handles text wider
     * than itself.
     */
    export class SetTextBlockTextWrappingDto {
        constructor(textBlock?: BABYLON.GUI.TextBlock, textWrapping?: boolean) {
            if (textBlock !== undefined) { this.textBlock = textBlock; }
            if (textWrapping !== undefined) { this.textWrapping = textWrapping; }
        }
        /**
         * The text block to change in place
         * @default undefined
         */
        textBlock!: BABYLON.GUI.TextBlock;
        /**
         * True wraps onto new lines, false clips, or one of the engine's modes such as ellipsis
         * @default undefined
         */
        textWrapping!: boolean | BABYLON.GUI.TextWrapping;
    }
    /**
     * Feeds `babylon.gui.textBlock.setLineSpacing` with a text block and the extra space between
     * its lines.
     */
    export class SetTextBlockLineSpacingDto {
        constructor(textBlock?: BABYLON.GUI.TextBlock, lineSpacing?: string | number) {
            if (textBlock !== undefined) { this.textBlock = textBlock; }
            if (lineSpacing !== undefined) { this.lineSpacing = lineSpacing; }
        }
        /**
         * The text block to change in place
         * @default undefined
         */
        textBlock!: BABYLON.GUI.TextBlock;
        /**
         * Extra space between lines, as pixels or a string such as `4px`
         * @default undefined
         */
        lineSpacing!: string | number;
    }
    /**
     * Feeds the `babylon.gui.textBlock` getters with the text block to read from.
     */
    export class TextBlockDto {
        constructor(textBlock?: BABYLON.GUI.TextBlock) {
            if (textBlock !== undefined) { this.textBlock = textBlock; }
        }
        /**
         * The text block to read from
         * @default undefined
         */
        textBlock!: BABYLON.GUI.TextBlock;
    }

    /**
     * Feeds `babylon.gui.slider.changeSliderThumb`: the slider and the shape, color, width,
     * clamping and visibility of its thumb.
     */
    export class SliderThumbDto {
        constructor(slider?: BABYLON.GUI.Slider, isThumbCircle?: boolean, thumbColor?: string, thumbWidth?: string | number, isThumbClamped?: boolean, displayThumb?: boolean) {
            if (slider !== undefined) { this.slider = slider; }
            if (isThumbCircle !== undefined) { this.isThumbCircle = isThumbCircle; }
            if (thumbColor !== undefined) { this.thumbColor = thumbColor; }
            if (thumbWidth !== undefined) { this.thumbWidth = thumbWidth; }
            if (isThumbClamped !== undefined) { this.isThumbClamped = isThumbClamped; }
            if (displayThumb !== undefined) { this.displayThumb = displayThumb; }
        }
        /**
         * The slider whose thumb is restyled in place
         * @default undefined
         */
        slider!: BABYLON.GUI.Slider;
        /**
         * When true, the thumb is round; when false, square
         * @default false
         */
        isThumbCircle = false;
        /**
         * CSS color of the thumb
         * @default white
         */
        thumbColor = "white";
        /**
         * Width of the thumb as a pixel string or a fraction; left out, the engine chooses
         * @default undefined
         * @optional true
         */
        thumbWidth?: string | number | undefined;
        /**
         * When true, the thumb stays inside the track at the ends instead of overhanging it
         * @default false
         */
        isThumbClamped = false;
        /**
         * When true, the thumb is drawn; when false, only the track
         * @default true
         */
        displayThumb = true;
    }
    /**
     * Feeds the `babylon.gui.slider` getters with the slider to read from.
     */
    export class SliderDto {
        constructor(slider?: BABYLON.GUI.Slider) {
            if (slider !== undefined) { this.slider = slider; }
        }
        /**
         * The slider to read from
         * @default undefined
         */
        slider!: BABYLON.GUI.Slider;
    }
    /**
     * Feeds `babylon.gui.slider.setBorderColor` with a slider and the color of the line around its
     * track.
     */
    export class SliderBorderColorDto {
        constructor(slider?: BABYLON.GUI.Slider, borderColor?: string) {
            if (slider !== undefined) { this.slider = slider; }
            if (borderColor !== undefined) { this.borderColor = borderColor; }
        }
        /**
         * The slider to change in place
         * @default undefined
         */
        slider!: BABYLON.GUI.Slider;
        /**
         * CSS color of the line around the track
         * @default white
         */
        borderColor = "white";
    }
    /**
     * Feeds `babylon.gui.slider.setBackgroundColor` with a slider and the color of the unfilled
     * track.
     */
    export class SliderBackgroundColorDto {
        constructor(slider?: BABYLON.GUI.Slider, backgroundColor?: string) {
            if (slider !== undefined) { this.slider = slider; }
            if (backgroundColor !== undefined) { this.backgroundColor = backgroundColor; }
        }
        /**
         * The slider to change in place
         * @default undefined
         */
        slider!: BABYLON.GUI.Slider;
        /**
         * CSS color of the unfilled part of the track
         * @default black
         */
        backgroundColor = "black";
    }
    /**
     * Feeds `babylon.gui.slider.setValue`, `setMinimum`, `setMaximum` and `setStep` with a slider
     * and the number to set.
     */
    export class SetSliderValueDto {
        constructor(slider?: BABYLON.GUI.Slider, value?: number) {
            if (slider !== undefined) { this.slider = slider; }
            if (value !== undefined) { this.value = value; }
        }
        /**
         * The slider to change in place
         * @default undefined
         */
        slider!: BABYLON.GUI.Slider;
        /**
         * The number set: the current value, the minimum, the maximum or the step, depending on the
         * method
         * @default 5
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        value: number = 5;
    }
    /**
     * Feeds `babylon.gui.control.changeControlPadding` with a control and the space kept clear on
     * each side of it.
     */
    export class PaddingLeftRightTopBottomDto {
        constructor(control?: BABYLON.GUI.Control, paddingLeft?: number | string, paddingRight?: number | string, paddingTop?: number | string, paddingBottom?: number | string) {
            if (control !== undefined) { this.control = control; }
            if (paddingLeft !== undefined) { this.paddingLeft = paddingLeft; }
            if (paddingRight !== undefined) { this.paddingRight = paddingRight; }
            if (paddingTop !== undefined) { this.paddingTop = paddingTop; }
            if (paddingBottom !== undefined) { this.paddingBottom = paddingBottom; }
        }
        /**
         * The control to change in place
         * @default undefined
         */
        control!: BABYLON.GUI.Control;
        /**
         * Space kept clear on the left, as a pixel string or a fraction; left out, it stays as it
         * is
         * @default undefined
         * @optional true
         */
        paddingLeft!: number | string;
        /**
         * Space kept clear on the right, as a pixel string or a fraction; left out, it stays as it
         * is
         * @default undefined
         * @optional true
         */
        paddingRight!: number | string;
        /**
         * Space kept clear at the top, as a pixel string or a fraction; left out, it stays as it is
         * @default undefined
         * @optional true
         */
        paddingTop!: number | string;
        /**
         * Space kept clear at the bottom, as a pixel string or a fraction; left out, it stays as it
         * is
         * @default undefined
         * @optional true
         */
        paddingBottom!: number | string;
    }
    /**
     * Feeds `babylon.gui.control.cloneControl`: the control to copy, the container the copy goes
     * into, its name and its host texture.
     */
    export class CloneControlDto {
        constructor(control?: BABYLON.GUI.Control, container?: BABYLON.GUI.Container, name?: string, host?: BABYLON.GUI.AdvancedDynamicTexture) {
            if (control !== undefined) { this.control = control; }
            if (container !== undefined) { this.container = container; }
            if (name !== undefined) { this.name = name; }
            if (host !== undefined) { this.host = host; }
        }
        /**
         * The control to copy; it stays as it is
         * @default undefined
         */
        control!: BABYLON.GUI.Control;
        /**
         * The container the copy is added to; left out, the copy is not placed anywhere yet
         * @default undefined
         * @optional true
         */
        container?: BABYLON.GUI.Container | undefined;
        /**
         * Name the copy is known by
         * @default clonedControl
         */
        name = "clonedControl";
        /**
         * The GUI texture the copy belongs to; left out, the original's host is used
         * @default undefined
         * @optional true
         */
        host?: BABYLON.GUI.AdvancedDynamicTexture | undefined;
    }
    /**
     * Feeds `babylon.gui.control.changeControlAlignment` and `textBlock.alignText` with a control
     * and where it sits inside its parent.
     */
    export class AlignmentDto<T> {
        constructor(control?: T, horizontalAlignment?: horizontalAlignmentEnum, verticalAlignment?: verticalAlignmentEnum) {
            if (control !== undefined) { this.control = control; }
            if (horizontalAlignment !== undefined) { this.horizontalAlignment = horizontalAlignment; }
            if (verticalAlignment !== undefined) { this.verticalAlignment = verticalAlignment; }
        }
        /**
         * The control to align in place
         * @default undefined
         */
        control!: T;
        /**
         * Left, center or right inside the parent
         * @default center
         */
        horizontalAlignment: horizontalAlignmentEnum = horizontalAlignmentEnum.center;
        /**
         * Top, center or bottom inside the parent
         * @default center
         */
        verticalAlignment: verticalAlignmentEnum = verticalAlignmentEnum.center;
    }

    /**
     * Feeds `babylon.gui.textBlock.setTextOutline` with a text block and the width and color of the
     * outline around its letters.
     */
    export class SetTextBlockTextOutlineDto {
        constructor(textBlock?: BABYLON.GUI.TextBlock, outlineWidth?: number, outlineColor?: string) {
            if (textBlock !== undefined) { this.textBlock = textBlock; }
            if (outlineWidth !== undefined) { this.outlineWidth = outlineWidth; }
            if (outlineColor !== undefined) { this.outlineColor = outlineColor; }
        }
        /**
         * The text block to change in place
         * @default undefined
         */
        textBlock!: BABYLON.GUI.TextBlock;
        /**
         * Width of the outline around the letters, in pixels; 0 removes it
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        outlineWidth: number = 0;
        /**
         * CSS color of the outline
         * @default white
         */
        outlineColor = "white";
    }
}