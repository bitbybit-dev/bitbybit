---
sidebar_position: 3
title: CAD Operations
sidebar_label: CAD Operations
description: "Run single operations, chained pipelines, and parallel compound tasks with the Bitbybit SDK."
tags: [sdk, typescript, cad]
---

# CAD Operations

The `client.cad` endpoint lets you run raw CAD kernel operations — anything from creating primitives to boolean operations and transforms. Operations are identified by their fully-qualified name (e.g. `occt.shapes.solid.createSphere`).

## Execute a single operation

```ts
const created = await client.cad.execute({
    operation: "occt.shapes.solid.createSphere",
    params: { radius: 5, center: [0, 0, 0] },
});

// Poll and download manually
const task = await client.tasks.poll(created.taskId);
const downloads = await client.tasks.getResults(task.taskId);
const glb = downloads.find(d => d.format === "glb");
console.log(glb?.downloadUrl);
```

### Execute + poll shorthand

```ts
const { taskId, downloads } = await client.cad.executeAndPoll({
    operation: "occt.shapes.solid.createSphere",
    params: { radius: 5, center: [0, 0, 0] },
});

const glb = downloads.find(d => d.format === "glb");
console.log(glb?.downloadUrl);
```

## Pipelines

Chain multiple operations sequentially. Each step can reference previous steps' outputs using `$ref:N` syntax (zero-based index):

```ts
const created = await client.cad.pipeline({
    steps: [
        {
            operation: "occt.shapes.solid.createBox",
            params: { width: 10, length: 10, height: 10, center: [0, 0, 0] },
        },
        {
            operation: "occt.shapes.solid.createSphere",
            params: { radius: 6, center: [0, 0, 0] },
        },
        {
            operation: "occt.booleans.difference",
            params: {
                shape: "$ref:0",      // box from step 0
                shapes: ["$ref:1"],   // sphere from step 1
                keepEdges: false,
            },
        },
    ],
    outputs: { formats: ["gltf", "step"] },
});
```

### Pipeline + poll shorthand

```ts
const { downloads } = await client.cad.pipelineAndPoll({
    steps: [
        { operation: "occt.shapes.solid.createSphere", params: { radius: 3 } },
        { operation: "occt.shapes.solid.createBox", params: { width: 4, length: 4, height: 4 } },
        { operation: "occt.booleans.union", params: { shape: "$ref:0", shapes: ["$ref:1"] } },
    ],
    outputs: { formats: ["gltf"] },
});

const glb = downloads.find(d => d.format === "glb");
console.log(glb?.downloadUrl);
```

## Compound (parallel)

Run multiple independent operations in parallel. Each item becomes a separate sub-task:

```ts
const compound = await client.cad.compound({
    parallel: true,
    items: [
        { operation: "occt.shapes.solid.createSphere", params: { radius: 3 } },
        { operation: "occt.shapes.solid.createBox", params: { width: 5, length: 5, height: 5 } },
    ],
});

// Poll the parent task
const task = await client.tasks.poll(compound.taskId);

// Get the compound result manifest
const manifest = await client.tasks.getCompoundResult(compound.taskId);
```
