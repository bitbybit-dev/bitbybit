---
sidebar_position: 2
title: 3D Inspector
sidebar_label: 3D Inspector
description: The 3D inspector on bitbybit.dev opens glTF, GLB and STL files in your browser - its scene tree and model information, warnings about heavy models, wireframe, exploded view, opacity, up axis and material variants.
topic: platform.tools.inspector
type: how-to
verified: 2026-10-11
tags: [getting-started, gltf]
---

# 3D inspector

The 3D inspector opens a 3D file to see what is inside it before you use it: how its parts are arranged, how heavy it is, what its materials and textures are. It runs in your browser, and the file is not sent anywhere.

It is part of the Silver and Gold plans. Signed in on one of them, open it from the bitbybit.dev menu, or go to [bitbybit.dev/3d-inspector](https://bitbybit.dev/3d-inspector).

## Open a file

Drop a `.glb`, `.gltf` or `.stl` file on the view, or press <Ui>Browse files</Ui>. Files up to 500 MB open. The camera frames the model; press <Ui>Zoom to Fit</Ui> to frame it again at any time.

## What the toolbar does

| Button | What it does |
|---|---|
| <Ui>Open File</Ui> | opens another file |
| <Ui>Zoom to Fit</Ui> | frames the whole model |
| <Ui>Show Environment</Ui>, <Ui>Show Ground</Ui> | adds a sky that metals reflect, and a ground under the model |
| wireframe | turns a wireframe on over the faces, then shows the wireframe only, then off again; its colour and thickness can be set |
| <Ui>Explode parts</Ui> | pulls the parts away from each other, by a slider |
| <Ui>Show Scene Tree</Ui> | opens the scene panel |
| <Ui>Background color</Ui> | changes the colour behind the model |
| <Ui>Model up axis</Ui> | stands a Z-up model upright with <Ui>Z</Ui> |
| opacity slider | makes the model see-through, to look inside |
| <Ui>Fullscreen</Ui> | gives the view the whole screen |

Click a part to highlight it; click it again to bring the camera to it.

## The scene panel

**Model Info** counts the model's triangles, vertices, meshes, instances, nodes, materials and textures, lists every texture with its size, and warns about what makes a model slow on the web: 2 million triangles or more, 500 meshes or more, textures of 4096 pixels or more, or 32 textures or more.

The **hierarchy** lists every node with its kind and triangle count. Focus the camera on one, or hide and show it with its eye. A file with material variants (`KHR_materials_variants`) lists them under **Material Variants**, to switch between them.

The inspector shows; it does not change or export the file, and it does not play animations.
