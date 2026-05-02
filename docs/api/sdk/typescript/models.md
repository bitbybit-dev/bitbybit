---
sidebar_position: 2
title: Models
sidebar_label: Models
description: "Generate parametric 3D models with the Bitbybit SDK — submit, poll, batch, and download results with full TypeScript intellisense."
tags: [sdk, typescript, models]
---

# Models

The `client.models` endpoint generates parametric 3D models. Known models like `dragon-cup` and `phone-nest` provide full parameter intellisense in TypeScript.

## List available models

```ts
const { models } = await client.models.list();
// ["dragon-cup", "phone-nest", ...]
```

## Get parameter definitions

Fetch the parameter schema, types, defaults, and constraints for a model:

```ts
const def = await client.models.getParams("dragon-cup");
console.log(def.params);   // parameter definitions
console.log(def.defaults);  // default values
```

Batch-fetch multiple models at once:

```ts
const { definitions } = await client.models.getDefinitions([
    "dragon-cup",
    "phone-nest",
]);
```

## Generate a model (high-level)

`models.run()` submits the request, polls until completion, and returns download URLs for all output formats (plus metadata):

```ts
const { taskId, downloads } = await client.models.run("dragon-cup", {
    params: {
        height: 8,
        radiusBottom: 4,
        radiusTopOffset: 2,
        thickness: 0.6,
    },
    outputs: { formats: ["gltf"] },
});

// downloads is an array of { format, downloadUrl, filename }
const glb = downloads.find(d => d.format === "glb");
const metadata = downloads.find(d => d.format === "metadata");
console.log("GLB:", glb?.downloadUrl);
console.log("Metadata:", metadata?.downloadUrl);
```

Request multiple output formats:

```ts
const { downloads } = await client.models.run("dragon-cup", {
    outputs: { formats: ["gltf", "step"] },
});

// downloads will contain glb, step, and metadata entries
for (const d of downloads) {
    console.log(`${d.format}: ${d.downloadUrl}`);
}
```

### Polling options

Pass a third argument to control polling:

```ts
const result = await client.models.run("dragon-cup", {
    params: { height: 12, thickness: 0.8 },
    outputs: { formats: ["gltf"] },
}, {
    intervalMs: 3000,
    maxAttempts: 60,
    onProgress: (task) => console.log(task.status),
    signal: AbortSignal.timeout(120_000),
});
```

## Submit only (low-level)

If you want to manage polling yourself, use `submit()`:

```ts
const created = await client.models.submit("phone-nest", {
    params: { applyOrnaments: true },
    outputs: { formats: ["step", "gltf"] },
});

console.log(created.taskId);    // use with client.tasks.poll()
console.log(created.statusUrl); // relative poll URL
```

## Batch generation

Generate multiple parameter variations in parallel. The API creates a compound task with one sub-task per item:

```ts
const { taskId, subTasks } = await client.models.batchRun("dragon-cup", {
    items: [
        { params: { height: 4, radiusBottom: 4, thickness: 2 } },
        { params: { height: 7, radiusBottom: 4, thickness: 0.5 } },
        { params: { height: 9, radiusBottom: 2, thickness: 0.5 } },
    ],
    outputs: { formats: ["gltf"] },
});

for (const sub of subTasks) {
    const glb = sub.downloads.find(d => d.format === "glb");
    console.log(`Variation ${sub.index}: ${glb?.downloadUrl ?? "failed"}`);
}
```

For low-level control, use `batchSubmit()` to get the compound task ID without waiting:

```ts
const compound = await client.models.batchSubmit("dragon-cup", {
    items: [
        { params: { height: 6 } },
        { params: { height: 10 } },
    ],
    outputs: { formats: ["gltf"] },
});

// Poll compound task manually
const task = await client.tasks.poll(compound.taskId);
```

## Typed parameters

When you pass a known model name, TypeScript provides full intellisense for parameters:

```ts
// ✅ TypeScript knows DragonCupParams — autocomplete works
await client.models.run("dragon-cup", {
    params: { height: 8, radiusBottom: 4 },
    outputs: { formats: ["gltf"] },
});
```

The SDK accepts any string as a model name (typed as `<K extends string>`), but the API will reject names that don't match a registered model.
