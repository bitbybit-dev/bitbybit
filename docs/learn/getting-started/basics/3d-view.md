---
sidebar_position: 6
title: The 3D View
sidebar_label: The 3D View
description: Working with the 3D view of the coding editors - turning, panning and zooming the camera, the camera gizmo's views, split screen and full screen, and exporting what is drawn as GLB, STL or a picture.
topic: platform.basics.3d-view
type: how-to
verified: 2026-10-11
tags: [getting-started, rete, blockly, typescript]
---

# The 3D view

Whatever a script draws appears in the 3D view, beside the editor or instead of it. The view is the same in Rete, Blockly and the TypeScript editor.

## Look around

The camera turns around a point it looks at:

| To | Do |
|---|---|
| Turn around the model | drag with the left mouse button, or use the arrow keys after clicking into the view |
| Move sideways | drag with the right mouse button |
| Come closer or go back | turn the mouse wheel, or pinch on a trackpad |

The **camera gizmo** in the corner of the view helps when you lose your bearings. Its <Ui>Zoom in</Ui> and <Ui>Zoom out</Ui> buttons step the camera by a fifth of its distance, and its axes turn the camera to look straight along one: <Ui>View from the front</Ui>, from the back, left, right, top, or <Ui>View from below</Ui>. Click the axis you already face and the camera goes round to the other side. Turn the gizmo off under <Ui>More</Ui> > <Ui>Settings</Ui> if you prefer a clean view.

Each run starts with a fresh scene: the shapes of the run before are cleared, and the camera is placed again. A script can place it itself through the `bitbybit.babylon.camera` functions.

## Give it room

With <Ui>Split-screen mode</Ui> on, which is the default on a computer, the editor and the 3D view sit side by side. Drag the divider between them to share the window differently. The <Ui>Show 3D fullscreen (hide editor)</Ui> button by the divider gives the 3D view the whole window; <Ui>Exit fullscreen (show editor)</Ui> brings the editor back.

With split screen off, and always on a phone, the editor and the 3D view take turns: <Ui>Swap Canvas</Ui> on the left, or <kbd>F4</kbd>, switches between them. [Editor settings](./editor-settings) has the switch.

## Take it with you

<Ui>More</Ui> > <Ui>Export model</Ui> downloads what the script drew:

- <Ui>GLB (web, AR and 3D tools)</Ui>, the faces of every drawn shape with their colours and materials, for web pages, AR viewers and 3D programs;
- <Ui>STL (3D printing)</Ui>, the same faces as one mesh for a slicer;
- <Ui>Picture of the 3D view (PNG)</Ui>, the view as you see it.

Edge lines, hidden components, the background and the ground the scene adds are left out. Run the script first: with nothing drawn the menu says so. For exact CAD files, such as STEP for another CAD program, a script calls the export functions itself: [getting a model out](/learn/code/common/concepts/getting-a-model-out) shows how.
