/* eslint-disable @typescript-eslint/no-namespace */
import * as GUI from "@babylonjs/gui";

// tslint:disable-next-line: no-namespace
export namespace BabylonGui {

    export enum horizontalAlignmentEnum {
        left = "left",
        center = "center",
        right = "right"
    }

    export enum verticalAlignmentEnum {
        top = "top",
        center = "center",
        bottom = "bottom"
    }

    export enum sliderObservableSelectorEnum {
        onValueChangedObservable = "onValueChangedObservable"
    }

    export enum controlObservableSelectorEnum {
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

    export class CreateFullScreenUIDto {
        constructor(name?: string, foreground?: boolean, adaptiveScaling?: boolean) {
            if (name !== undefined) { this.name = name; }
            if (foreground !== undefined) { this.foreground = foreground; }
            if (adaptiveScaling !== undefined) { this.adaptiveScaling = adaptiveScaling; }
        }
        /**
         * Name of advanced texture
         * @default fullscreen
         */
        name = "fullscreen";
        /**
         * Foreground
         * @default true
         */
        foreground?: boolean;
        /**
         * Adaptive scaling
         * @default false
         */
        adaptiveScaling?: boolean;
    }

    export class CreateStackPanelDto {
        constructor(container?: GUI.Container, name?: string, isVertical?: boolean, spacing?: number, width?: number | string, height?: number | string, color?: string, background?: string) {
            if (container !== undefined) { this.container = container; }
            if (name !== undefined) { this.name = name; }
            if (isVertical !== undefined) { this.isVertical = isVertical; }
            if (spacing !== undefined) { this.spacing = spacing; }
            if (width !== undefined) { this.width = width; }
            if (height !== undefined) { this.height = height; }
            if (color !== undefined) { this.color = color; }
            if (background !== undefined) { this.background = background; }
        }
        /**
         * Container to which the stack panel will be added
         * @default undefined
         */
        container: GUI.Container;
        /**
         * Name of stack panel
         * @default stackPanel
         */
        name = "stackPanel";
        /**
         * Horizontal or vertical
         * @default true
         */
        isVertical = true;
        /**
         * Spacing between each child in pixels
         * @default 0
         */
        spacing = 0;
        /**
         * Width of the stack panel. This value should not be set when in horizontal mode as it will be computed automatically.
         * @default undefined
         * @optional true
         */
        width: number | string;
        /**
         * Height of the stack panel. This value should not be set when in vertical mode as it will be computed automatically.
         * @default undefined
         * @optional true
         */
        height: number | string;
        /**
        * Color of the stack panel
        * @default #00000000
        */
        color = "#00000000";
        /**
         * Background of the stack panel. We give transparency to the background by default so that it would be visible
         * @default #00000055
         */
        background = "#00000055";
    }
    export class SliderObservableSelectorDto {
        constructor(selector: sliderObservableSelectorEnum) {
            this.selector = selector;
        }
        /**
         * Selector for the observable
         * @default onValueChangedObservable
         */
        selector: sliderObservableSelectorEnum;
    }
    export class ControlObservableSelectorDto {
        constructor(selector: controlObservableSelectorEnum) {
            this.selector = selector;
        }
        /**
         * Selector for the observable
         * @default onPointerClickObservable
         */
        selector: controlObservableSelectorEnum;
    }
    export class AddControlToContainerDto {
        constructor(container?: GUI.StackPanel, control?: GUI.Control) {
            if (container !== undefined) { this.container = container; }
            if (control !== undefined) { this.control = control; }
        }
        /**
         * Container to add control to
         * @default undefined
         */
        container: GUI.Container;
        /**
         * Control to add
         * @default undefined
         */
        control: GUI.Control;
    }

    export class FixControlOrderInContainerDto {
        constructor(container?: GUI.StackPanel, control?: GUI.Control, orderIndex?: number) {
            if (container !== undefined) { this.container = container; }
            if (control !== undefined) { this.control = control; }
            if (orderIndex !== undefined) { this.orderIndex = orderIndex; }
        }
        /**
         * Container in which control needs to be fixed
         * @default undefined
         */
        container: GUI.Container;
        /**
         * Control to fix
         * @default undefined
         */
        control: GUI.Control;
        /**
         * Order of the control
         * @default 0
         */
        orderIndex: number;
    }

    export class CreateButtonDto {
        constructor(container?: GUI.Container, name?: string, label?: string, color?: string, background?: string, width?: number | string, height?: number | string, fontSize?: number) {
            if (container !== undefined) { this.container = container; }
            if (name !== undefined) { this.name = name; }
            if (label !== undefined) { this.label = label; }
            if (color !== undefined) { this.color = color; }
            if (background !== undefined) { this.background = background; }
            if (width !== undefined) { this.width = width; }
            if (height !== undefined) { this.height = height; }
            if (fontSize !== undefined) { this.fontSize = fontSize; }
        }
        /**
         * Container to which the button will be added
         * @default undefined
         */
        container: GUI.Container;
        /**
         * Name of the button
         * @default buttonName
         */
        name = "buttonName";
        /**
         * Text of the button
         * @default Click me!
         */
        label = "Click me!";
        /**
         * Color of the button
         * @default black
         */
        color = "black";
        /**
         * Background of the button
         * @default #f0cebb
         */
        background = "#f0cebb";
        /**
         * Width of the button
         * @default undefined
         * @optional true
         */
        width?: number | string;
        /**
         * Height of the button
         * @default undefined
         * @optional true
         */
        height?: number | string;
        /**
         * Font size of the button
         * @default 12
         */
        fontSize = 12;
    }

    export class CreateSliderDto {
        constructor(container?: GUI.Container, name?: string, minimum?: number, maximum?: number, value?: number, step?: number, isVertical?: boolean, color?: string, background?: string, width?: number | string, height?: number | string, displayThumb?: boolean) {
            if (container !== undefined) { this.container = container; }
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
         * Container to which the slider will be added
         * @default undefined
         */
        container: GUI.Container;
        /**
         * Name of the button
         * @default sliderName
         */
        name = "sliderName";
        /**
         * Minimum value of the slider
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        minimum = 0;
        /**
         * Maximum value of the slider
         * @default 10
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        maximum = 10;
        /**
         * Value of the slider
         * @default 5
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        value = 5;
        /**
         * Step of the slider
         * @default 0.01
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.01
         */
        step = 0.01;
        /**
         * Is slider vertical
         * @default false
         */
        isVertical = false;
        /**
         * Color of the button
         * @default #f0cebb
         */
        color = "#f0cebb";
        /**
         * Background of the button
         * @default black
         */
        background = "black";
        /**
         * Width of the button
         * @default undefined
         * @optional true
         */
        width?: number | string;
        /**
         * Height of the button
         * @default undefined
         * @optional true
         */
        height?: number | string;
        /**
         * Should display thumb
         * @default true
         */
        displayThumb = true;
    }

    export class SliderThumbDto {
        constructor(slider?: GUI.Slider, isThumbCircle?: boolean, thumbColor?: string, thumbWidth?: string | number, isThumbClamped?: boolean, displayThumb?: boolean) {
            if (slider !== undefined) { this.slider = slider; }
            if (isThumbCircle !== undefined) { this.isThumbCircle = isThumbCircle; }
            if (thumbColor !== undefined) { this.thumbColor = thumbColor; }
            if (thumbWidth !== undefined) { this.thumbWidth = thumbWidth; }
            if (isThumbClamped !== undefined) { this.isThumbClamped = isThumbClamped; }
            if (displayThumb !== undefined) { this.displayThumb = displayThumb; }
        }
        /**
         * Slider for which the thumb needs to be updated
         * @default undefined
         */
        slider: GUI.Slider;
        /**
         * Is thumb circle
         * @default false
         */
        isThumbCircle = false;
        /**
         * Color of the thumb
         * @default white
         */
        thumbColor = "white";
        /**
         * Thumb width
         * @default undefined
         * @optional true
         */
        thumbWidth?: string | number;
        /**
         * Is thumb clamped
         * @default false
         */
        isThumbClamped = false;
        /**
         * Should display thumb
         * @default true
         */
        displayThumb = true;
    }

    export class PaddingLeftRightTopBottomDto {
        constructor(control?: GUI.Control, paddingLeft?: number | string, paddingRight?: number | string, paddingTop?: number | string, paddingBottom?: number | string) {
            if (control !== undefined) { this.control = control; }
            if (paddingLeft !== undefined) { this.paddingLeft = paddingLeft; }
            if (paddingRight !== undefined) { this.paddingRight = paddingRight; }
            if (paddingTop !== undefined) { this.paddingTop = paddingTop; }
            if (paddingBottom !== undefined) { this.paddingBottom = paddingBottom; }
        }
        /**
         * Control to change the padding
         * @default undefined
         */
        control: GUI.Control;
        /**
         * Padding left of the stack panel
         * @default undefined
         * @optional true
         */
        paddingLeft: number | string;
        /**
         * Padding right of the stack panel
         * @default undefined
         * @optional true
         */
        paddingRight: number | string;
        /**
         * Padding top of the stack panel
         * @default undefined
         * @optional true
         */
        paddingTop: number | string;
        /**
         * Padding bottom of the stack panel
         * @default undefined
         * @optional true
         */
        paddingBottom: number | string;
    }

    export class AlignmentDto {
        constructor(control?: GUI.Control, horizontalAlignment?: horizontalAlignmentEnum, verticalAlignment?: verticalAlignmentEnum) {
            if (control !== undefined) { this.control = control; }
            if (horizontalAlignment !== undefined) { this.horizontalAlignment = horizontalAlignment; }
            if (verticalAlignment !== undefined) { this.verticalAlignment = verticalAlignment; }
        }
        /**
         * Control to change the padding
         * @default undefined
         */
        control: GUI.Control;
        /**
         * Alignment horizontal
         * @default center
         */
        horizontalAlignment: horizontalAlignmentEnum;
        /**
         * Alignment horizontal
         * @default center
         */
        verticalAlignment: verticalAlignmentEnum;
    }
}