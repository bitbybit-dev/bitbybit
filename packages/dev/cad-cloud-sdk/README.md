# @bitbybit-dev/cad-cloud-sdk

Type-safe TypeScript SDK for the [Bitbybit CAD Cloud API](https://learn.bitbybit.dev/api/cloud-api). Generate parametric 3D models, run CAD operations, convert STEP files, and manage async tasks - all with full intellisense.

> **Server-side only.** Never expose your API key in frontend code.

## Scaffold a full project

The fastest way to get started is with our CLI - it scaffolds a complete backend + React frontend with this SDK pre-configured:

```bash
npx @bitbybit-dev/create-app my-cloud-project --type cloud
```

Choose from 5 backend templates: Hono + SDK, Hono + REST, Node.js + SDK, Node.js + REST, or .NET + REST. Each includes ready-to-run examples with model generation, batch operations, and [CAD pipelines](https://learn.bitbybit.dev/api/sdk/typescript/pipelines).

## Install

```bash
npm install @bitbybit-dev/cad-cloud-sdk
```

## Quick start

```ts
import { BitbybitClient } from "@bitbybit-dev/cad-cloud-sdk";

const client = new BitbybitClient({
    apiKey: process.env.BITBYBIT_API_KEY!,
});

// Generate a dragon cup - polls automatically, returns all download URLs
const { downloads } = await client.models.run("dragon-cup", {
    params: { height: 10, radiusBottom: 5 },
    outputs: { formats: ["gltf"] },
});

// downloads: [{ format: "glb", downloadUrl, filename }, { format: "metadata", ... }]
const glb = downloads.find(d => d.format === "glb");
console.log("GLB download:", glb?.downloadUrl);
```

## What's included

| Endpoint | What it does |
|----------|-------------|
| `client.models` | Generate parametric 3D models (single + batch) |
| `client.cad` | Execute operations, pipelines, and compound tasks |
| `client.convert` | STEP → glTF conversion (simple + advanced) |
| `client.tasks` | Poll, list, cancel, retry, and download results |
| `client.files` | Upload and manage files for conversion |

All high-level methods (`models.run`, `cad.executeAndPoll`, `convert.stepToGltfAndPoll`) handle polling automatically and return all download URLs (including metadata) in a single `downloads` array.

## Error handling

```ts
import { BitbybitApiError } from "@bitbybit-dev/cad-cloud-sdk";

try {
    await client.models.run("dragon-cup", { outputs: { formats: ["gltf"] } });
} catch (err) {
    if (err instanceof BitbybitApiError) {
        console.error(err.code, err.message, err.statusCode);
    }
}
```

## Documentation

Full guides with examples for every endpoint:

- **[SDK Overview](https://learn.bitbybit.dev/api/sdk/typescript/intro)** - setup, polling, error handling, type imports
- **[Models](https://learn.bitbybit.dev/api/sdk/typescript/models)** - parametric model generation and batch runs
- **[CAD Operations](https://learn.bitbybit.dev/api/sdk/typescript/cad-operations)** - execute, pipeline, compound
- **[Conversion](https://learn.bitbybit.dev/api/sdk/typescript/conversion)** - STEP → glTF with simple and advanced options
- **[Tasks](https://learn.bitbybit.dev/api/sdk/typescript/tasks)** - task lifecycle management
- **[Files](https://learn.bitbybit.dev/api/sdk/typescript/files)** - file upload and management
- **[API Reference](https://learn.bitbybit.dev/api/openapi-docs/bitbybit-cad-cloud-api)** - full OpenAPI endpoint reference

## Working examples

- [Node.js + SDK](https://github.com/bitbybit-dev/bitbybit/tree/master/examples/api/nodejs-sdk) - Express server with Three.js frontend
- [Hono + SDK](https://github.com/bitbybit-dev/bitbybit/tree/master/examples/api/hono-sdk) - Cloudflare Workers with Three.js frontend

## Requirements

- Node.js 18+ (or any runtime with native `fetch`)
- A Bitbybit API key - get one at [bitbybit.dev/auth/pick-plan](https://bitbybit.dev/auth/pick-plan)

This package is part of the [Bitbybit monorepo](https://github.com/bitbybit-dev/bitbybit).

## License

MIT
