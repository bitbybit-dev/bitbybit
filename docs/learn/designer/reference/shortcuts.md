---
sidebar_position: 2
title: "Designer keyboard shortcuts"
sidebar_label: "Keyboard shortcuts"
description: "The Designer's keyboard shortcuts on Windows, Linux and macOS, each with the command it runs, taken from the commands themselves so the list is never out of date."
topic: designer.reference.shortcuts
type: reference
tags: [designer]
---

{/* Generated from the Designer itself; edits to this page are overwritten. */}

# Designer keyboard shortcuts

Keys run their command while the Designer has the focus and you are not typing in a field. The menus show each command's key beside it, and <Ui>Help</Ui> > <Ui>Find a command</Ui> finds every command, keyed or not.

| Windows and Linux | macOS | Command | What it does |
|---|---|---|---|
| <kbd>Ctrl+S</kbd> | <kbd>⌘S</kbd> | [Save](./commands.md#designer-file-save) | Saves the project where it was opened from. |
| <kbd>Ctrl+Z</kbd> | <kbd>⌘Z</kbd> | [Undo](./commands.md#designer-edit-undo) | Undoes your last change to this document. |
| <kbd>Ctrl+Shift+Z</kbd> | <kbd>⌘⇧Z</kbd> | [Redo](./commands.md#designer-edit-redo) | Does again what you last undid. |
| <kbd>Del</kbd> | <kbd>Del</kbd> | [Delete](./commands.md#designer-edit-delete) | Deletes the selected feature, with withDependents also everything that uses it; with faces picked in the view and no feature selected, removes those faces (Delete face). |
| <kbd>Esc</kbd> | <kbd>Esc</kbd> | [Clear selection](./commands.md#designer-selection-clear) | Unpicks every face and edge picked in the view. |
| <kbd>1</kbd> | <kbd>1</kbd> | [Pick faces and edges](./commands.md#designer-selection-pick-all) | Lets a click in the view pick a face or an edge, whichever is under the pointer. |
| <kbd>2</kbd> | <kbd>2</kbd> | [Pick faces only](./commands.md#designer-selection-pick-faces) | Lets a click in the view pick only faces, passing over the edges near the pointer. |
| <kbd>3</kbd> | <kbd>3</kbd> | [Pick edges only](./commands.md#designer-selection-pick-edges) | Lets a click in the view pick only edges, so faces are never picked by mistake. |
| <kbd>Enter</kbd> | <kbd>Enter</kbd> | [OK](./commands.md#designer-dialog-ok) | Applies the open dialog: adds the feature or solid, or keeps the edit. |
| <kbd>Shift+F</kbd> | <kbd>⇧F</kbd> | [Zoom to selection](./commands.md#designer-view-focus) | Zooms onto a component, sub-assembly or part, glowing it until the next click; with none named, onto the selected one, else the part the last pick lies on. |
| <kbd>F</kbd> | <kbd>F</kbd> | [Fit all](./commands.md#designer-view-fit) | Frames the whole model. |
| <kbd>Shift+7</kbd> | <kbd>⇧7</kbd> | [Iso view](./commands.md#designer-view-iso) | Turns the camera to the iso view. |
| <kbd>Shift+1</kbd> | <kbd>⇧1</kbd> | [Front view](./commands.md#designer-view-front) | Turns the camera to the front view. |
| <kbd>Shift+2</kbd> | <kbd>⇧2</kbd> | [Back view](./commands.md#designer-view-back) | Turns the camera to the back view. |
| <kbd>Shift+3</kbd> | <kbd>⇧3</kbd> | [Left view](./commands.md#designer-view-left) | Turns the camera to the left view. |
| <kbd>Shift+4</kbd> | <kbd>⇧4</kbd> | [Right view](./commands.md#designer-view-right) | Turns the camera to the right view. |
| <kbd>Shift+5</kbd> | <kbd>⇧5</kbd> | [Top view](./commands.md#designer-view-top) | Turns the camera to the top view. |
| <kbd>Shift+6</kbd> | <kbd>⇧6</kbd> | [Bottom view](./commands.md#designer-view-bottom) | Turns the camera to the bottom view. |
| <kbd>N</kbd> | <kbd>N</kbd> | [Look at](./commands.md#designer-view-look-at) | Turns the camera square onto the picked face. |
| <kbd>G</kbd> | <kbd>G</kbd> | [Show or hide the grid](./commands.md#designer-view-grid) | The ground grid, scaled to the model. |
| <kbd>L</kbd> | <kbd>L</kbd> | [Line](./commands.md#designer-sketch-line) | Draws straight segments point by point; click the start again to close the outline, Enter to stop. |
| <kbd>A</kbd> | <kbd>A</kbd> | [Arc](./commands.md#designer-sketch-arc) | Draws an arc on from the pen: click where it ends, then a point it passes through. |
| <kbd>T</kbd> | <kbd>T</kbd> | [Tangent arc](./commands.md#designer-sketch-tangent-arc) | Draws an arc that leaves the last segment smoothly: click where it ends. |
| <kbd>R</kbd> | <kbd>R</kbd> | [Rectangle](./commands.md#designer-sketch-rectangle) | Draws a rectangle from two opposite corners. |
| <kbd>C</kbd> | <kbd>C</kbd> | [Circle](./commands.md#designer-sketch-circle) | Draws a circle from its centre and a point on it. |
| <kbd>P</kbd> | <kbd>P</kbd> | [Polygon](./commands.md#designer-sketch-polygon) | Draws a regular polygon from its centre and a corner. |
| <kbd>Enter</kbd> | <kbd>Enter</kbd> | [Finish the outline](./commands.md#designer-sketch-finish) | Stops drawing the current outline and leaves it open. |
| <kbd>Esc</kbd> | <kbd>Esc</kbd> | [Stop drawing](./commands.md#designer-sketch-cancel-step) | Drops the point just placed, then stops the outline, then puts the tool down. |
| <kbd>E</kbd> | <kbd>E</kbd> | [Extrude](./commands.md#designer-part-extrude) | Sweeps a sketch's face straight along its normal, or along a direction. |
| <kbd>Ctrl+K</kbd> | <kbd>⌘K</kbd> | [Find a command](./commands.md#designer-help-commands) | Searches every command by name. |
