---
sidebar_position: 1
title: STEP to glTF Converter
sidebar_label: Converter
description: The converter on bitbybit.dev turns a STEP model into a GLB file for the web, in your browser - who can use it, the files it takes, the meshing and Draco options of its simple and advanced modes, and its limits.
topic: platform.tools.converter
type: how-to
verified: 2026-10-11
tags: [getting-started, step, gltf]
---

# STEP to glTF converter

The converter turns a CAD model saved as STEP into a GLB file, the binary glTF that web pages, AR viewers and 3D programs read. It runs the Bitbybit OCCT Kernel in your browser: the file never leaves your computer and nothing is stored.

It is part of the Silver and Gold plans. Signed in on one of them, open it from the bitbybit.dev menu, or go to [bitbybit.dev/converter](https://bitbybit.dev/converter). Members of other plans see a page that offers to upgrade.

## Convert a file

1. Drop a `.step`, `.stp` or `.stpz` file on <Ui>Drop your STEP file here</Ui>, or click it to choose one. Files up to 200 MB are accepted.
2. Leave the options as they are for a first try, or adjust them (below).
3. Press <Ui>Convert to GLB</Ui>. A timer runs while it works.
4. When it is done, <Ui>Preview</Ui> shows the result in 3D, and <Ui>Download</Ui> saves it, named like the STEP file but ending in `.glb`.

## Simple options

**Meshing** decides how finely the exact curved surfaces are divided into triangles:

| Option | Default | What it does |
|---|---|---|
| <Ui>Mesh Precision</Ui> | 0.005 | how far a triangle may stray from the true surface; smaller is finer and heavier |
| <Ui>Mesh Angle</Ui> | 0.5 | the largest angle, in radians, between neighbouring triangles on a curve |
| <Ui>Relative Deflection</Ui> | on | precision as a share of each part's size rather than an absolute distance |

**Draco Compression**, off by default, makes the file much smaller at a small cost in accuracy; turn on <Ui>Enable</Ui> and set the <Ui>Compression Level</Ui> and the bits kept for positions, normals, texture coordinates and colours. A viewer needs Draco support to open such a file; most web viewers have it.

## Advanced options

Switch to <Ui>Advanced</Ui> for more control:

- **Reading:** whether to keep the model's colours, names, materials, layers and properties.
- **Advanced Meshing:** parallel meshing, a face count limit, merging faces, and splitting large meshes for 16-bit indices.
- **Export:** parallel writing, embedded textures, forced texture coordinates, and how nodes and meshes are named (by product, by instance, or both).
- **Transform:** <Ui>Adjust Z to Y</Ui>, on by default, stands a Z-up CAD model upright in Y-up glTF; <Ui>Scale</Ui> changes the units, such as 0.001 to turn millimetres into metres.

In simple mode these keep the converter's defaults.

## Limits

Everything happens on your device, so a very large model takes as long as your computer needs, and can run out of memory. Split such a model into parts, or convert it on [CAD Cloud](/api/cloud-api), which runs conversions on servers and in parallel, from code.
