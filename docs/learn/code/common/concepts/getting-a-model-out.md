---
sidebar_position: 7
title: Getting a Model Out
sidebar_label: Getting a Model Out
description: How to take what a script makes out of Bitbybit - the editors' Export model menu for GLB, STL and pictures, and from code STEP and IGES for CAD programs, STL and OBJ for printing, GLB for the web, BREP, SVG and DXF drawings.
topic: code.concepts.getting-a-model-out
type: how-to
tags: [code, occt, babylonjs]
---

# Getting a model out

What a script makes can leave Bitbybit as a file.

**Without code**, <Ui>More</Ui> > <Ui>Export model</Ui> in the coding editors downloads what the script drew as GLB or STL, or a picture of the 3D view; [the 3D view](/learn/getting-started/basics/3d-view) describes it. That is the quickest way, and it takes the drawn triangles.

**With code**, a script exports what it chooses, at the precision and in the format it chooses, including exact CAD formats such as STEP. Each function below is the same in every editor; in Rete and Blockly you find it by its path, under <Ui>occt</Ui> > <Ui>io</Ui> or <Ui>babylon</Ui> > <Ui>io</Ui>.

## Which format

| For | Format | Function |
|---|---|---|
| Another CAD program, exactly | STEP | `bitbybit.occt.io.saveShapeSTEP` |
| An assembly with names and colours | STEP | the [assembly](../occt/assembly/intro) functions |
| 3D printing | STL | `bitbybit.occt.io.saveShapeStl` |
| Other mesh tools | OBJ, PLY | `bitbybit.occt.io.saveShapeObj`, `saveShapePly` |
| The web, AR and game engines | GLB | `bitbybit.babylon.io.exportGLB` |
| OpenCascade itself | BREP | `bitbybit.occt.io.saveShapeBrep` |
| Laser cutting and drawings | DXF, SVG | [DXF drawings](../occt/io/dxf-file-format-for-2d-drawings), `bitbybit.occt.io.saveShapeSvg` |

STEP, BREP and IGES keep the exact geometry. STL, OBJ, PLY and GLB keep triangles, divided as finely as their `precision` asks.

## Download or keep

Each `save` function starts a download in the browser. Its `...AndReturn` twin, such as `saveShapeSTEPAndReturn`, gives the file's content back to the script instead, to upload, measure or pass on:

```typescript
const box = await bitbybit.occt.shapes.solid.createBox({ width: 40, length: 30, height: 10, center: [0, 5, 0] });
await bitbybit.occt.io.saveShapeSTEP({ shape: box, fileName: "box.step", adjustYtoZ: false, tryDownload: true });
const stl = await bitbybit.occt.io.saveShapeStlAndReturn({ shape: box, fileName: "box.stl", precision: 0.01, adjustYtoZ: false, binary: true });
```

A download from a script runs every time the script runs, which in Rete is every change. Put the save last, and keep its `tryDownload` off while you work: turn it on when you want the file.

## Which way up

CAD programs usually treat Z as up, where Bitbybit treats Y as up. `adjustYtoZ` on the save functions turns the model for them, but it mirrors the part as it does; to keep a part as it is, turn it a quarter turn about X with `bitbybit.occt.transforms.rotate` before saving instead.

## A picture

<Ui>More</Ui> > <Ui>Export model</Ui> > <Ui>Picture of the 3D view (PNG)</Ui> saves the view as it is. From code, `bitbybit.babylon.tools.createScreenshotAndDownload` does the same, at a size and through a camera you choose.

## From the Designer and CAD Cloud

The [Designer](/learn/designer/get-started/export-import) exports STEP, GLB, STL and BREP from its menu, without code. [CAD Cloud](/api/cloud-api) returns STEP, glTF and mesh files from a server.
