# @bitbybit-dev/ifc-worker

The [@bitbybit-dev/ifc](https://www.npmjs.com/package/@bitbybit-dev/ifc) library behind a web worker, so reading, authoring and writing IFC building models never blocks the page.

<img src="https://bitbybit.dev/files/site/git-cover.png" alt="Picture showing bitbybit.dev platform">

> **Beta.** The API's names and inputs may still change before the first stable version.

## Overview

Every method of `@bitbybit-dev/ifc` is here under the same dotted path, answering with a promise. Models live in the worker: a call that makes a model hands back a small handle, `{ hash, type: "ifc-model" }`, which the next call takes in its place. A call made again with the same inputs is answered from the worker's cache, except the calls meant to differ each time: `model.create` without a `seed` and `model.write` without a `timeStamp` run every time.

The renderer packages ([@bitbybit-dev/babylonjs](https://www.npmjs.com/package/@bitbybit-dev/babylonjs), [@bitbybit-dev/threejs](https://www.npmjs.com/package/@bitbybit-dev/threejs), [@bitbybit-dev/playcanvas](https://www.npmjs.com/package/@bitbybit-dev/playcanvas)) include it as `bitbybit.ifc`: their `initBitByBit` hands the worker you pass as `workers.ifcWorker` to `bitbybit.ifcWorkerManager.setIfcWorker`, and code that calls `bitbybit.init` itself makes that call too. Use this package directly when you want IFC without them.

## The worker file

```typescript
// ifc.worker.ts
import { initializationComplete, onMessageInput } from "@bitbybit-dev/ifc-worker";

initializationComplete();
addEventListener("message", ({ data }) => onMessageInput(data, postMessage));
```

## Using it

```typescript
import { BitByBitIFC } from "@bitbybit-dev/ifc-worker";

const bitbybit = new BitByBitIFC();
bitbybit.init(new Worker(new URL("./ifc.worker.ts", import.meta.url), { type: "module" }));

let model = await bitbybit.ifc.model.create({ name: "House", seed: "house-1" });
model = await bitbybit.ifc.spatial.addStorey({ model, id: "ground", elevation: 0 });
model = await bitbybit.ifc.walls.add({ model, storey: "ground", start: [0, 0], end: [6000, 0], height: 3000 });
const text = await bitbybit.ifc.model.write({ model, fileName: "house.ifc" });
```

With a renderer package's `bitbybit` object, draw a model by describing it as a recipe and building the recipe with the Manifold kernel:

```typescript
const recipe = await bitbybit.ifc.geometry.recipe({ model });
const solids = await bitbybit.manifold.recipes.build({ recipe, adjustZtoY: true });
await bitbybit.draw.drawAnyAsync({ entity: solids });
```

`ifcWorkerManager.ifcWorkerState$` reports the worker's state: `loading` once it is handed over, `initialised` once it has started, then `computing` and `loaded` as calls come and go. A worker whose script cannot load reports `failed`, and every call waiting on it is rejected.

`IFCWorkerMock` runs the library on the same thread through the same messages, each mock with models of its own and every message copied as a worker's would be, for tests and for scripts that need no worker.

## Links

| Resource | URL |
|----------|-----|
| **GitHub** | https://github.com/bitbybit-dev/bitbybit/tree/master/packages/dev/ifc-worker |
| **Monorepo** | https://github.com/bitbybit-dev/bitbybit |
| **NPM** | https://www.npmjs.com/package/@bitbybit-dev/ifc-worker |
| **Documentation** | https://learn.bitbybit.dev/learn/npm-packages/ifc |
