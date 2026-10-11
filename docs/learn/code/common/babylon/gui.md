---
sidebar_position: 4
title: The GUI - Buttons, Sliders and Text over the Scene
sidebar_label: GUI
description: The bitbybit.babylon.gui functions build an interface inside the 3D view - a full-screen layer or one on a mesh, containers and stack panels, text, buttons, sliders, checkboxes, colour pickers, inputs and images - with an example in Rete, Blockly and TypeScript and a table of every function.
topic: code.babylon.gui
type: explanation
tags: [code, babylonjs]
---

import BitByBitRenderCanvas from '@site/src/components/BitByBitRenderCanvas';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# The GUI: buttons, sliders and text over the scene

A script cannot reach the page around the editor, so it builds its interface inside the 3D view, with BabylonJS's GUI. The same interface runs wherever the script runs, in the editor, in a runner on another website, or in an app.

## How a GUI is put together

1. **A layer to draw on.** `advancedDynamicTexture.createFullScreenUI` covers the whole view; `createForMesh` wraps a layer onto a mesh, for a screen inside the scene.
2. **Containers** arrange controls: a `stackPanel` stacks them vertically or side by side, and a `container` holds any controls you add with `addControls`.
3. **Controls**: `textBlock`, `button`, `slider`, `checkbox`, `radioButton`, `colorPicker`, `inputText` and `image`, each created with its size, colours and text, and each with getters and setters to change it later.

Here a full-screen layer gets one line of text:

{/* example:gui-label:start - generated from the example's steps for each editor; edits between these markers are overwritten */}

<Tabs groupId="editor" queryString>
<TabItem value="rete" label="Rete">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"{\"id\":\"rete-v2-json\",\"nodes\":{\"screen\":{\"id\":\"screen\",\"name\":\"bitbybit.babylon.gui.advancedDynamicTexture.createFullScreenUI\",\"customName\":\"full screen ui\",\"async\":false,\"drawable\":false,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"name\":\"fullscreen\",\"foreground\":true,\"adaptiveScaling\":false},\"inputs\":{},\"position\":[40,40]},\"title\":{\"id\":\"title\",\"name\":\"bitbybit.babylon.gui.textBlock.createTextBlock\",\"customName\":\"text block\",\"async\":false,\"drawable\":false,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"name\":\"textBlockName\",\"text\":\"Made with bitbybit\",\"color\":\"#f0cebb\",\"fontSize\":48},\"inputs\":{},\"position\":[40,420]},\"controls\":{\"id\":\"controls\",\"name\":\"bitbybit.lists.createList\",\"customName\":\"create list\",\"async\":false,\"drawable\":false,\"data\":{},\"inputs\":{\"listElements\":{\"connections\":[{\"node\":\"title\",\"output\":\"result\",\"data\":{}}]}},\"position\":[460,420]},\"add\":{\"id\":\"add\",\"name\":\"bitbybit.babylon.gui.container.addControls\",\"customName\":\"add controls\",\"async\":false,\"drawable\":false,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"clearControlsFirst\":true},\"inputs\":{\"container\":{\"connections\":[{\"node\":\"screen\",\"output\":\"result\",\"data\":{}}]},\"controls\":{\"connections\":[{\"node\":\"controls\",\"output\":\"list\",\"data\":{}}]}},\"position\":[880,40]}},\"modules\":{}}","type":"rete"}}
  title="A title over the 3D view in Rete"
  description="A full-screen GUI layer with one line of text on it, drawn over the scene."
/>

</TabItem>
<TabItem value="blockly" label="Blockly">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"<xml xmlns=\"https://developers.google.com/blockly/xml\"><variables><variable id=\"screen\">screen</variable><variable id=\"shown\">shown</variable></variables><block type=\"variables_set\" x=\"40\" y=\"40\"><field name=\"VAR\" id=\"screen\">screen</field><value name=\"VALUE\"><block type=\"bitbybit.babylon.gui.advancedDynamicTexture.createFullScreenUI\"><value name=\"Name\"><block type=\"text\"><field name=\"TEXT\">fullscreen</field></block></value><value name=\"Foreground\"><block type=\"logic_boolean\"><field name=\"BOOL\">TRUE</field></block></value><value name=\"AdaptiveScaling\"><block type=\"logic_boolean\"><field name=\"BOOL\">FALSE</field></block></value></block></value><next><block type=\"variables_set\"><field name=\"VAR\" id=\"shown\">shown</field><value name=\"VALUE\"><block type=\"bitbybit.babylon.gui.container.addControls\"><value name=\"Container\"><block type=\"variables_get\"><field name=\"VAR\" id=\"screen\">screen</field></block></value><value name=\"Controls\"><block type=\"bitbybit.lists.addItem\"><value name=\"List\"><block type=\"bitbybit.lists.createEmptyList\"></block></value><value name=\"Item\"><block type=\"bitbybit.babylon.gui.textBlock.createTextBlock\"><value name=\"Name\"><block type=\"text\"><field name=\"TEXT\">textBlockName</field></block></value><value name=\"Text\"><block type=\"text\"><field name=\"TEXT\">Made with bitbybit</field></block></value><value name=\"Color\"><block type=\"text\"><field name=\"TEXT\">#f0cebb</field></block></value><value name=\"FontSize\"><block type=\"math_number\"><field name=\"NUM\">48</field></block></value></block></value><value name=\"Clone\"><block type=\"logic_boolean\"><field name=\"BOOL\">FALSE</field></block></value></block></value><value name=\"ClearControlsFirst\"><block type=\"logic_boolean\"><field name=\"BOOL\">TRUE</field></block></value></block></value></block></next></block></xml>","type":"blockly"}}
  title="A title over the 3D view in Blockly"
  description="A full-screen GUI layer with one line of text on it, drawn over the scene."
/>

</TabItem>
<TabItem value="typescript" label="TypeScript">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"const gui = bitbybit.babylon.gui;\nconst screen = gui.advancedDynamicTexture.createFullScreenUI({ name: \"screen\", foreground: true, adaptiveScaling: false });\nconst title = gui.textBlock.createTextBlock({ name: \"title\", text: \"Made with bitbybit\", color: \"#f0cebb\", width: \"100%\", height: \"80px\", fontSize: 48 });\ngui.container.addControls({ container: screen, controls: [title], clearControlsFirst: false });","type":"typescript"}}
  title="A title over the 3D view in TypeScript"
  description="A full-screen GUI layer with one line of text on it, drawn over the scene."
/>

</TabItem>
</Tabs>

{/* example:gui-label:end */}

## Reacting to the person

Controls report what happens to them through BabylonJS observables: a button's click, a slider's new value, a checkbox ticked. In TypeScript, add a function to the observable, such as `onValueChangedObservable` on a slider, and rebuild what depends on it. In Rete, the [flow components](/learn/getting-started/rete/flow) listen to observables and GUI buttons; in Blockly, the time category's observable block does.

## Every function

{/* api:babylon.gui:start - generated from the API index; edits between these markers are overwritten */}

| Function | What it does |
|---|---|
| [`advancedDynamicTexture.createForMesh`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiAdvancedDynamicTexture#createForMesh) | Creates a GUI texture wrapped onto a mesh, so controls added to it appear on the mesh's surface in the scene; the mesh needs texture coordinates, a plane being the usual choice. |
| [`advancedDynamicTexture.createFullScreenUI`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiAdvancedDynamicTexture#createFullScreenUI) | Creates the full-screen layer that GUI controls are added to, drawn over the whole canvas in front of the scene when `foreground` is true; `adaptiveScaling` scales the layer with the screen's pixel density. |
| [`button.createSimpleButton`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiButton#createSimpleButton) | Creates a button with a text label, text color, background and font size; sizes are pixel strings or fractions of the parent, and a size left out is chosen by the engine. |
| [`button.getButtonText`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiButton#getButtonText) | Reads the label currently shown on a button. |
| [`button.setButtonText`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiButton#setButtonText) | Changes the label shown on a button to the given text. |
| [`checkbox.createCheckbox`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiCheckbox#createCheckbox) | Creates a checkbox that starts checked or not; `checkSizeRatio` is how much of the square the inner mark fills. |
| [`checkbox.createCheckboxObservableSelector`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiCheckbox#createCheckboxObservableSelector) | Passes through the name of a checkbox event, its checked state changing, as a typed selector for code that subscribes to checkbox events by name. |
| [`checkbox.getBackground`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiCheckbox#getBackground) | Reads the background color of a checkbox's square. |
| [`checkbox.getCheckSizeRatio`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiCheckbox#getCheckSizeRatio) | Reads how much of a checkbox's square its inner mark fills. |
| [`checkbox.getIsChecked`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiCheckbox#getIsChecked) | Reads whether a checkbox is currently checked, true for on. |
| [`checkbox.setBackground`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiCheckbox#setBackground) | Sets the background color of a checkbox's square, as a CSS color. |
| [`checkbox.setCheckSizeRatio`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiCheckbox#setCheckSizeRatio) | Sets how much of a checkbox's square its inner mark fills, from 0 to 1. |
| [`checkbox.setIsChecked`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiCheckbox#setIsChecked) | Checks or unchecks a checkbox, which fires its checked changed event like a click would. |
| [`colorPicker.createColorPicker`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiColorPicker#createColorPicker) | Creates a color picker starting at `defaultColor`; `size` sets both its width and height, as a pixel string or a fraction, and defaults to 300 pixels. |
| [`colorPicker.createColorPickerObservableSelector`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiColorPicker#createColorPickerObservableSelector) | Passes through the name of a color picker event, its value changing, as a typed selector for code that subscribes to color picker events by name. |
| [`colorPicker.getColorPickerSize`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiColorPicker#getColorPickerSize) | Reads the size of a color picker, its width and height together. |
| [`colorPicker.getColorPickerValue`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiColorPicker#getColorPickerValue) | Reads the color a color picker currently holds, as a hex string. |
| [`colorPicker.setColorPickerSize`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiColorPicker#setColorPickerSize) | Sets the width and height of a color picker together, as a pixel string or a fraction of the parent. |
| [`colorPicker.setColorPickerValue`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiColorPicker#setColorPickerValue) | Moves a color picker to a hex color, which fires its value changed event like a user pick would. |
| [`container.addControls`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiContainer#addControls) | Adds controls to a container in the given order; with `clearControlsFirst` true the container is emptied first, so the order is exactly the list's. |
| [`container.getBackground`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiContainer#getBackground) | Reads the background color of a container as a CSS color string. |
| [`container.getIsReadonly`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiContainer#getIsReadonly) | Reads whether a container and its children are read-only. |
| [`container.setBackground`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiContainer#setBackground) | Sets the background color of a container as a CSS color; an eight-digit hex such as `#00000055` makes it translucent. |
| [`container.setIsReadonly`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiContainer#setIsReadonly) | Makes a container and everything in it read-only or editable again. |
| [`control.changeControlAlignment`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiControl#changeControlAlignment) | Sets where a control sits inside its parent: left, center or right, and top, center or bottom. |
| [`control.changeControlPadding`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiControl#changeControlPadding) | Sets the space kept clear around a control inside its parent, per side; a side left out keeps its padding. |
| [`control.cloneControl`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiControl#cloneControl) | Makes a copy of a control with all its settings, names it and adds it to `container` when one is given; `host` is the GUI texture the copy belongs to. |
| [`control.createControlObservableSelector`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiControl#createControlObservableSelector) | Passes through the name of a control event, such as a pointer click or pointer enter, as a typed selector for code that subscribes to control events by name. |
| [`control.getColor`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiControl#getColor) | Reads the main color of a control as a CSS color string. |
| [`control.getControlByName`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiControl#getControlByName) | Finds a control by its name inside a container, searching its children too. |
| [`control.getFontSize`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiControl#getFontSize) | Reads the font size of a control's text, as a string such as `24px` or a number of pixels. |
| [`control.getHeight`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiControl#getHeight) | Reads the height of a control, as a pixel string or a fraction of the parent. |
| [`control.getIsEnabled`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiControl#getIsEnabled) | Reads whether a control is enabled rather than dimmed and inactive. |
| [`control.getIsReadonly`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiControl#getIsReadonly) | Reads whether a control ignores input while still being shown normally. |
| [`control.getIsVisible`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiControl#getIsVisible) | Reads whether a control is shown rather than hidden. |
| [`control.getWidth`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiControl#getWidth) | Reads the width of a control, as a pixel string or a fraction of the parent. |
| [`control.setColor`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiControl#setColor) | Sets the main color of a control, the text color of a button or text block and the fill color of a slider or checkbox, as a CSS color. |
| [`control.setFontSize`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiControl#setFontSize) | Sets the font size of a control's text, as a number of pixels or a string such as `24px`. |
| [`control.setHeight`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiControl#setHeight) | Sets the height of a control, as a pixel string such as `40px` or a fraction of the parent from 0 to 1. |
| [`control.setIsEnabled`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiControl#setIsEnabled) | Enables or disables a control; a disabled control is drawn dimmed and ignores input. |
| [`control.setIsReadonly`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiControl#setIsReadonly) | Makes a control read-only or editable again; a read-only control is shown normally but ignores input. |
| [`control.setIsVisible`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiControl#setIsVisible) | Shows or hides a control; a hidden control keeps its place in a stack panel's layout. |
| [`control.setWidth`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiControl#setWidth) | Sets the width of a control, as a pixel string such as `200px` or a fraction of the parent from 0 to 1. |
| [`image.createImage`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiImage#createImage) | Creates an image control that loads its picture from `url`; sizes are pixel strings or fractions of the parent, and a size left out is chosen by the engine. |
| [`image.getSourceUrl`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiImage#getSourceUrl) | Reads the URL an image control loads its picture from. |
| [`image.setSourceUrl`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiImage#setSourceUrl) | Changes the picture an image control shows by giving it a new URL to load. |
| [`inputText.createInputText`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiInputText#createInputText) | Creates a text field holding `text`, showing `placeholder` while it is empty, in the given colors; sizes are pixel strings or fractions of the parent. |
| [`inputText.createInputTextObservableSelector`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiInputText#createInputTextObservableSelector) | Passes through the name of a text field event, its text changing, as a typed selector for code that subscribes to text field events by name. |
| [`inputText.getBackground`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiInputText#getBackground) | Reads the background color of a text field. |
| [`inputText.getPlaceholder`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiInputText#getPlaceholder) | Reads the hint a text field shows while it is empty. |
| [`inputText.getText`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiInputText#getText) | Reads the text a text field currently holds, as typed by the user. |
| [`inputText.setBackground`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiInputText#setBackground) | Sets the background color of a text field, as a CSS color. |
| [`inputText.setPlaceholder`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiInputText#setPlaceholder) | Sets the hint a text field shows while it is empty. |
| [`inputText.setText`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiInputText#setText) | Replaces the text a text field holds, which fires its text changed event like typing would. |
| [`radioButton.createRadioButton`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiRadioButton#createRadioButton) | Creates a radio button in a `group`; checking one radio button unchecks the others of the same group. |
| [`radioButton.createRadioButtonObservableSelector`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiRadioButton#createRadioButtonObservableSelector) | Passes through the name of a radio button event, its checked state changing, as a typed selector for code that subscribes to radio button events by name. |
| [`radioButton.getBackground`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiRadioButton#getBackground) | Reads the background color of a radio button's circle. |
| [`radioButton.getCheckSizeRatio`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiRadioButton#getCheckSizeRatio) | Reads how much of a radio button's circle its inner dot fills. |
| [`radioButton.getGroup`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiRadioButton#getGroup) | Reads the group a radio button belongs to. |
| [`radioButton.setBackground`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiRadioButton#setBackground) | Sets the background color of a radio button's circle, as a CSS color. |
| [`radioButton.setCheckSizeRatio`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiRadioButton#setCheckSizeRatio) | Sets how much of a radio button's circle its inner dot fills, from 0 to 1. |
| [`radioButton.setGroup`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiRadioButton#setGroup) | Moves a radio button to a group; only one radio button of a group can be checked at a time. |
| [`slider.changeSliderThumb`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiSlider#changeSliderThumb) | Restyles the thumb of a slider: round or square, its color and width, whether it stays inside the track and whether it is shown at all. |
| [`slider.createSlider`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiSlider#createSlider) | Creates a slider that picks a number from `minimum` to `maximum` in multiples of `step`, starting at `value`. |
| [`slider.createSliderObservableSelector`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiSlider#createSliderObservableSelector) | Passes through the name of a slider event, its value changing, as a typed selector for code that subscribes to slider events by name. |
| [`slider.getBackgroundColor`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiSlider#getBackgroundColor) | Reads the color of the unfilled part of a slider's track. |
| [`slider.getBorderColor`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiSlider#getBorderColor) | Reads the color of the line around a slider's track. |
| [`slider.getDisplayThumb`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiSlider#getDisplayThumb) | Reads whether a slider shows its thumb or only the track. |
| [`slider.getIsThumbCircle`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiSlider#getIsThumbCircle) | Reads whether a slider's thumb is round rather than square. |
| [`slider.getIsThumbClamped`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiSlider#getIsThumbClamped) | Reads whether a slider's thumb stays inside the track at the ends instead of overhanging it. |
| [`slider.getIsVertical`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiSlider#getIsVertical) | Reads whether a slider runs bottom to top rather than left to right. |
| [`slider.getMaximum`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiSlider#getMaximum) | Reads the largest value a slider can reach. |
| [`slider.getMinimum`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiSlider#getMinimum) | Reads the smallest value a slider can reach. |
| [`slider.getStep`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiSlider#getStep) | Reads the increment a slider moves in, 0 meaning smooth movement. |
| [`slider.getThumbColor`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiSlider#getThumbColor) | Reads the color of a slider's thumb as a CSS color string. |
| [`slider.getThumbWidth`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiSlider#getThumbWidth) | Reads the width of a slider's thumb, as a pixel string or a fraction. |
| [`slider.getValue`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiSlider#getValue) | Reads the current value of a slider, between its minimum and maximum. |
| [`slider.setBackgroundColor`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiSlider#setBackgroundColor) | Sets the color of the unfilled part of a slider's track, as a CSS color. |
| [`slider.setBorderColor`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiSlider#setBorderColor) | Sets the color of the line around a slider's track, as a CSS color. |
| [`slider.setMaximum`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiSlider#setMaximum) | Sets the largest value a slider can reach, the value at its right or top end. |
| [`slider.setMinimum`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiSlider#setMinimum) | Sets the smallest value a slider can reach, the value at its left or bottom end. |
| [`slider.setStep`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiSlider#setStep) | Sets the increment a slider moves in, so 1 gives whole numbers only and 0 lets it move smoothly. |
| [`slider.setValue`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiSlider#setValue) | Moves a slider to a value, which fires its value changed event like a user drag would. |
| [`stackPanel.createStackPanel`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiStackPanel#createStackPanel) | Creates a panel that stacks its children vertically, or horizontally when `isVertical` is false, with `spacing` pixels between them. |
| [`stackPanel.getHeight`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiStackPanel#getHeight) | Reads the height of a stack panel, as a pixel string or a fraction. |
| [`stackPanel.getIsVertical`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiStackPanel#getIsVertical) | Reads whether a stack panel stacks its children top to bottom. |
| [`stackPanel.getSpacing`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiStackPanel#getSpacing) | Reads the gap in pixels between the children of a stack panel. |
| [`stackPanel.getWidth`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiStackPanel#getWidth) | Reads the width of a stack panel, as a pixel string or a fraction. |
| [`stackPanel.setHeight`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiStackPanel#setHeight) | Sets the height of a stack panel, as a pixel string or a fraction of the parent; a vertical panel sizes its height from its children instead. |
| [`stackPanel.setIsVertical`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiStackPanel#setIsVertical) | Switches a stack panel between stacking its children top to bottom, when true, and left to right. |
| [`stackPanel.setSpacing`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiStackPanel#setSpacing) | Sets the gap in pixels between the children of a stack panel. |
| [`stackPanel.setWidth`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiStackPanel#setWidth) | Sets the width of a stack panel, as a pixel string or a fraction of the parent; a horizontal panel sizes its width from its children instead. |
| [`textBlock.alignText`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiTextBlock#alignText) | Sets where the text sits inside its block: left, center or right, and top, center or bottom. |
| [`textBlock.createTextBlock`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiTextBlock#createTextBlock) | Creates a block of text with a color and font size; sizes are pixel strings or fractions of the parent, and a size left out is chosen by the engine. |
| [`textBlock.createTextBlockObservableSelector`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiTextBlock#createTextBlockObservableSelector) | Passes through the name of a text block event, its text changing, as a typed selector for code that subscribes to text block events by name. |
| [`textBlock.getLineSpacing`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiTextBlock#getLineSpacing) | Reads the extra space between the lines of a text block. |
| [`textBlock.getOutlineWidth`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiTextBlock#getOutlineWidth) | Reads the width of the outline around a text block's letters, 0 meaning none. |
| [`textBlock.getResizeToFit`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiTextBlock#getResizeToFit) | Reads whether a text block resizes itself to fit its text. |
| [`textBlock.getText`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiTextBlock#getText) | Reads the text a text block currently shows. |
| [`textBlock.getTextHorizontalAlignment`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiTextBlock#getTextHorizontalAlignment) | Reads where the text sits horizontally in its block, as the engine's number for left, center or right. |
| [`textBlock.getTextVerticalAlignment`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiTextBlock#getTextVerticalAlignment) | Reads where the text sits vertically in its block, as the engine's number for top, center or bottom. |
| [`textBlock.getTextWrapping`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiTextBlock#getTextWrapping) | Reads how a text block handles text wider than itself. |
| [`textBlock.setLineSpacing`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiTextBlock#setLineSpacing) | Sets the extra space between the lines of a wrapped text block, as pixels or a string such as `4px`. |
| [`textBlock.setRsizeToFit`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiTextBlock#setRsizeToFit) | Lets a text block grow or shrink to fit its text, when true, instead of keeping its set size. |
| [`textBlock.setText`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiTextBlock#setText) | Changes the text a text block shows to the given text. |
| [`textBlock.setTextOutline`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiTextBlock#setTextOutline) | Draws an outline around the letters of a text block, `outlineWidth` pixels wide in `outlineColor`, which keeps text readable over a busy scene; 0 removes it. |
| [`textBlock.setTextWrapping`](https://docs.bitbybit.dev/classes/Bit.BabylonGuiTextBlock#setTextWrapping) | Sets how a text block handles text wider than itself: wrap onto new lines when true, clip when false, or one of the engine's wrapping modes such as ellipsis. |

{/* api:babylon.gui:end */}
