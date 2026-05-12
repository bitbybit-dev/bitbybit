---
sidebar_position: 4
title: Conversion
sidebar_label: Conversion
description: "Convert STEP files to glTF with the Bitbybit SDK - simple and advanced modes with full control over tessellation and export options."
tags: [sdk, typescript, conversion]
---

# Conversion

The `client.convert` endpoint converts STEP/STP files to glTF (.glb). Upload the file first via `client.files`, then convert it.

## Simple conversion

Default settings - just point it at a file:

```ts
import { readFile } from "node:fs/promises";

// 1. Upload the STEP file
const data = await readFile("model.step");
const confirmed = await client.files.uploadBytes("model.step", data);

// 2. Convert - polls automatically, returns all downloads
const { downloads } = await client.convert.stepToGltfAndPoll({
    stepFileId: confirmed.fileId,
    meshPrecision: 0.1,
});

const glb = downloads.find(d => d.format === "glb");
console.log("GLB:", glb?.downloadUrl);
```

### Submit-only (low-level)

```ts
const created = await client.convert.stepToGltf({
    stepFileId: confirmed.fileId,
});
// Poll manually: client.tasks.poll(created.taskId)
```

## Advanced conversion

Full control over tessellation, naming, coordinate systems, and export options:

```ts
const { downloads } = await client.convert.stepToGltfAdvancedAndPoll({
    stepFileId: confirmed.fileId,
    options: {
        // Attribute extraction
        readColors: true,
        readNames: true,
        readMaterials: true,
        readLayers: true,
        readProps: true,

        // Mesh tessellation
        meshDeflection: 0.05,       // linear deflection (lower = finer)
        meshAngle: 0.5,             // angular deflection in radians
        meshParallel: true,         // faster tessellation

        // Mesh optimization
        faceCountThreshold: 200000, // max triangles before LOD kicks in (-1 to disable)
        mergeFaces: true,           // merge co-planar faces
        splitIndices16: false,      // 16-bit indices for compatibility

        // glTF output
        parallelWrite: true,
        embedTextures: true,
        forceUVExport: false,

        // Naming
        nodeNameFormat: "instanceOrProduct",
        meshNameFormat: "productOrInstance",

        // Transform
        transformFormat: "trs",     // "compact" | "mat4" | "trs"

        // Coordinate system
        adjustZtoY: true,           // Z-up (CAD) → Y-up (glTF/WebGL)

        // Scale
        scale: 0.001,               // mm to meters
    },
});
```

### Available options

| Option | Type | Description |
|--------|------|-------------|
| `readColors` | `boolean` | Extract color attributes from STEP |
| `readNames` | `boolean` | Extract product/instance names |
| `readMaterials` | `boolean` | Extract material definitions |
| `readLayers` | `boolean` | Extract layer/group structure |
| `readProps` | `boolean` | Extract custom properties (part numbers, metadata) |
| `meshDeflection` | `number` | Linear deflection `[0.005, 10]` - lower = finer |
| `meshAngle` | `number` | Angular deflection in radians `[0.01, π]` |
| `meshParallel` | `boolean` | Parallel tessellation |
| `faceCountThreshold` | `integer` | Max triangles before LOD reduction (`-1` to disable) |
| `mergeFaces` | `boolean` | Merge co-planar adjacent faces |
| `splitIndices16` | `boolean` | Use 16-bit index buffers (max 65535 vertices per mesh) |
| `parallelWrite` | `boolean` | Parallel glTF file generation |
| `embedTextures` | `boolean` | Embed texture data in .glb |
| `forceUVExport` | `boolean` | Generate UVs even without textures |
| `nodeNameFormat` | `string` | Node naming strategy from STEP labels |
| `meshNameFormat` | `string` | Mesh naming strategy from STEP labels |
| `transformFormat` | `string` | `"compact"`, `"mat4"`, or `"trs"` |
| `adjustZtoY` | `boolean` | Convert Z-up to Y-up |
| `scale` | `number` | Uniform scale factor |
