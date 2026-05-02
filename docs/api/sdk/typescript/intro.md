---
sidebar_position: 1
title: TypeScript SDK
sidebar_label: Overview
description: "@bitbybit-dev/cad-cloud-sdk — type-safe TypeScript SDK for the Bitbybit CAD Cloud API. Install, initialize, and start generating 3D models in minutes."
tags: [sdk, typescript, api]
---

# TypeScript SDK

The [`@bitbybit-dev/cad-cloud-sdk`](https://www.npmjs.com/package/@bitbybit-dev/cad-cloud-sdk) package gives you a type-safe client for the Bitbybit CAD Cloud API. It works in Node.js, Deno, Bun, and Cloudflare Workers — anywhere that has native `fetch`.

:::warning Server-side only
Never use this SDK in frontend code. Your API key must stay on the server.
:::

## Install

```bash
npm install @bitbybit-dev/cad-cloud-sdk
```

## Initialize

```ts
import { BitbybitClient } from "@bitbybit-dev/cad-cloud-sdk";

const client = new BitbybitClient({
    apiKey: process.env.BITBYBIT_API_KEY!,
});
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `apiKey` | `string` | *required* | Your API key. Get one at [bitbybit.dev/auth/pick-plan](https://bitbybit.dev/auth/pick-plan). |
| `baseUrl` | `string` | `https://api.bitbybit.dev` | API base URL. |

## Your first model

Generate a Dragon Cup and get download URLs — the SDK handles polling automatically:

```ts
const { taskId, downloads } = await client.models.run("dragon-cup", {
    params: { height: 10, radiusBottom: 5 },
    outputs: { formats: ["gltf"] },
});

// downloads contains all result formats (glb, metadata, etc.)
const glb = downloads.find(d => d.format === "glb");
console.log("GLB download:", glb?.downloadUrl);
```

## Client structure

The client exposes five endpoint groups:

| Property | Purpose | Guide |
|----------|---------|-------|
| `client.models` | Generate parametric 3D models | [Models](./models) |
| `client.cad` | Execute, pipeline, and compound CAD operations | [CAD Operations](./cad-operations) |
| `client.convert` | STEP → glTF file conversion | [Conversion](./conversion) |
| `client.tasks` | Poll, list, cancel, retry tasks | [Tasks](./tasks) |
| `client.files` | Upload and manage files | [Files](./files) |

## Error handling

All API errors throw `BitbybitApiError`:

```ts
import { BitbybitApiError } from "@bitbybit-dev/cad-cloud-sdk";

try {
    await client.models.run("dragon-cup", {
        outputs: { formats: ["gltf"] },
    });
} catch (err) {
    if (err instanceof BitbybitApiError) {
        console.error(err.code);       // "VALIDATION_ERROR"
        console.error(err.message);    // human-readable message
        console.error(err.statusCode); // HTTP status
        console.error(err.details);    // validation details (if any)
    }
}
```

## Polling

All high-level methods (`models.run`, `cad.executeAndPoll`, `convert.stepToGltfAndPoll`, etc.) poll automatically. You can configure polling behavior:

```ts
const { downloadUrl } = await client.models.run("dragon-cup", {
    outputs: { formats: ["gltf"] },
}, {
    intervalMs: 3000,       // poll every 3 s (default: 2000)
    maxAttempts: 60,        // give up after 60 polls (default: 120)
    resultFormat: "step",   // download STEP instead of GLB
    onProgress: (task) => {
        console.log(`Status: ${task.status}, progress: ${task.progress}`);
    },
    signal: AbortSignal.timeout(120_000), // hard timeout
});
```

:::caution Polling interval
Intervals below 1 second may trigger rate-limiting. The default of 2 seconds is recommended.
:::

## Type imports

All types are available from the main entry point:

```ts
import type {
    DragonCupParams,
    PhoneNestParams,
    TaskDetail,
    TaskStatus,
    OutputOptions,
} from "@bitbybit-dev/cad-cloud-sdk";
```

## Requirements

- Node.js 18+ (or any runtime with native `fetch`)
- A Bitbybit API key with appropriate scopes

## Code examples

Full working examples live in the GitHub repo:

- [**Node.js + SDK**](https://github.com/bitbybit-dev/bitbybit/tree/master/examples/api/nodejs-sdk) — Express server
- [**Hono + SDK**](https://github.com/bitbybit-dev/bitbybit/tree/master/examples/api/hono-sdk) — Cloudflare Workers

Each example includes a server with API routes and a Three.js browser frontend for previewing generated models.
