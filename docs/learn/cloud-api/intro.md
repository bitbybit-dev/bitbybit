---
sidebar_position: 1
title: Cloud CAD API
description: Generate parametric 3D CAD models, convert STEP files, and run OpenCASCADE operations via HTTP.
---

# Cloud CAD API

The Bitbybit Cloud CAD API lets you generate parametric 3D models, convert STEP files to glTF, and execute arbitrary OpenCASCADE operations — all from a simple HTTP interface backed by high-performance WASM workers.

## Quick links

| Resource | Link |
|----------|------|
| **Interactive API reference** | [API Reference](/api/openapi-docs/bitbybit-cad-cloud-api) |
| **TypeScript SDK** | [`@bitbybit-dev/cad-cloud-sdk`](https://www.npmjs.com/package/@bitbybit-dev/cad-cloud-sdk) |
| **Base URL** | `https://api.bitbybit.dev` |

## Authentication

All endpoints (except `/health`) require an API key passed as the `x-api-key` header:

```bash
curl https://api.bitbybit.dev/api/v1/models \
  -H "x-api-key: bbk_your_key_here"
```

Keys are scoped — each key carries permissions for specific endpoint groups (`models`, `cad`, `convert`, `files`, `tasks`).

## Async task model

Every operation that creates or transforms geometry is **asynchronous**:

1. **Submit** — `POST` your request → receive **202 Accepted** with a `taskId`
2. **Poll** — `GET /api/v1/tasks/{taskId}` until `status` is `completed` (or `failed`)
3. **Download** — `GET /api/v1/tasks/{taskId}/result/{format}` → pre-signed download URL

The SDK handles polling automatically via `models.run()`, `cad.executeAndPoll()`, etc.

## Available models

| Model | Description |
|-------|-------------|
| `dragon-cup` | Parametric dragon-scale cup with configurable height, radius, thickness, cell pattern |
| `phone-nest` | Parametric phone stand/nest with optional ornamental perforations |

All model parameters are optional — default values produce a valid model. See the [interactive API reference](/api/openapi-docs/bitbybit-cad-cloud-api) for full parameter documentation.

## Output formats

| Format | Extension | Description |
|--------|-----------|-------------|
| `gltf` | `.glb` | Web-ready 3D mesh |
| `step` | `.stp` | Native CAD exchange format |
| `stpz` | `.stpz` | Compressed STEP |
| `decomposed-mesh` | `.json` | Structured mesh data with face/edge decomposition |

## SDK quickstart

```bash
npm install @bitbybit-dev/cad-cloud-sdk
```

```typescript
import { BitbybitClient } from "@bitbybit-dev/cad-cloud-sdk";

const client = new BitbybitClient({ apiKey: "bbk_your_key" });

// Generate a dragon cup and get the glTF download URL
const result = await client.models.run("dragon-cup", {
    params: { height: 10, radiusBottom: 5 },
    outputs: { formats: ["gltf"] },
});

console.log(result.downloadUrl);
```

## Endpoints overview

### Models
- `GET /api/v1/models` — list available models
- `GET /api/v1/models/{name}/params` — get parameter definitions
- `POST /api/v1/models/{name}` — generate a model (async)

### Tasks
- `GET /api/v1/tasks` — list tasks
- `GET /api/v1/tasks/{id}` — get task status
- `GET /api/v1/tasks/{id}/result/{format}` — download result
- `DELETE /api/v1/tasks/{id}` — cancel a task
- `POST /api/v1/tasks/{id}/retry` — retry a failed task

### CAD operations
- `POST /api/v1/cad/execute` — run a single OCCT operation (async)
- `POST /api/v1/cad/pipeline` — run a chained pipeline (async)

### Conversion
- `POST /api/v1/convert/step-to-gltf` — simple STEP → glTF (async)
- `POST /api/v1/convert/step-to-gltf-advanced` — full-control conversion (async)

### Files
- `POST /api/v1/files/upload` — get a pre-signed upload URL
- `POST /api/v1/files/{id}/confirm` — confirm upload
- `GET /api/v1/files` — list files
- `GET /api/v1/files/{id}` — get file details
- `DELETE /api/v1/files/{id}` — delete a file

For full request/response schemas, see the [interactive API reference](/api/openapi-docs/bitbybit-cad-cloud-api).
