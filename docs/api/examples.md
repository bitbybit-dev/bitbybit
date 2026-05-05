---
sidebar_position: 2
title: Example Projects
sidebar_label: Examples
description: "Run the Bitbybit CAD Cloud API example projects locally — React frontend with five interchangeable backend implementations (Node.js, Hono, .NET)."
tags: [examples, quickstart, api, react, threejs]
---

# Example Projects

The SDK ships with a complete set of working examples: a **shared React frontend** and **five interchangeable backend implementations**. They show how to integrate the Bitbybit CAD Cloud API into a real web application — from single CAD operations to multi-step pipelines with file uploads.

:::tip Source code
All examples live in the [`examples/api/`](https://github.com/bitbybit-dev/bitbybit/tree/master/examples/api) folder of the repository.
:::

## Architecture

```
┌─────────────────────────────┐        ┌─────────────────────────────┐
│        frontend/            │        │  (choose one backend)       │
│  React 19 + Vite + Three.js │──/api──▶  hono-rest | hono-sdk      │──▶  api.bitbybit.dev
│  Port 5173                  │ proxy  │  nodejs-rest | nodejs-sdk   │
│                             │        │  dotnet-rest               │
└─────────────────────────────┘        │  Port 3000                  │
                                       └─────────────────────────────┘
```

The frontend never talks to the Bitbybit API directly — your **API key stays on the server**. Vite's development proxy forwards all `/api/*` requests to `localhost:3000`, so the same frontend works with any of the five backends.

## Backend Variants

| Folder | Framework | API Style | Key Difference |
|--------|-----------|-----------|----------------|
| **hono-rest** | [Hono](https://hono.dev) (Cloudflare Workers) | Raw REST | Direct `fetch` calls — no SDK dependency |
| **hono-sdk** | [Hono](https://hono.dev) (Cloudflare Workers) | TypeScript SDK | Type-safe SDK with client-side validation |
| **nodejs-rest** | [Express 5](https://expressjs.com) (Node.js) | Raw REST | Direct `fetch` calls — no SDK dependency |
| **nodejs-sdk** | [Express 5](https://expressjs.com) (Node.js) | TypeScript SDK | Type-safe SDK with client-side validation |
| **dotnet-rest** | [ASP.NET Core](https://learn.microsoft.com/aspnet/core) (.NET 10) | Raw REST | Direct `HttpClient` calls — no SDK dependency |

### REST vs SDK

The two approaches exist so you can choose the right level of abstraction:

- **REST backends** make raw HTTP calls and handle polling, file upload, and error handling manually. They are useful if you want to understand the API protocol, or if you are integrating from a language without an SDK.
- **SDK backends** use [`@bitbybit-dev/cad-cloud-sdk`](/api/sdk/typescript/intro) which provides type-safe methods, automatic polling, client-side request validation, and a typed [`step()`](/api/sdk/typescript/pipelines) helper for building pipelines. This is the recommended approach for TypeScript projects.

## Quick Start

### Prerequisites

- **Node.js** ≥ 20 (for the frontend and Node.js/Hono backends)
- **.NET** ≥ 10 (only for the `dotnet-rest` backend)
- A **Bitbybit API key** — get one from [bitbybit.dev](https://bitbybit.dev)

### 1. Configure your API key

**Node.js backends** (`nodejs-rest/` or `nodejs-sdk/`) use a `.env` file:

```env title="nodejs-sdk/.env"
BITBYBIT_API_KEY=your-api-key-here
BITBYBIT_API_URL=https://api.bitbybit.dev
```

**Hono backends** (`hono-rest/` or `hono-sdk/`) use a `.dev.vars` file:

```env title="hono-sdk/.dev.vars"
BITBYBIT_API_KEY=your-api-key-here
BITBYBIT_API_URL=https://api.bitbybit.dev
```

**.NET backend** (`dotnet-rest/`) uses `appsettings.Development.json` (gitignored):

```json title="dotnet-rest/appsettings.Development.json"
{
  "Bitbybit": {
    "ApiKey": "your-api-key-here",
    "ApiUrl": "https://api.bitbybit.dev"
  }
}
```

### 2. Start a backend

```bash
cd examples/api/nodejs-sdk   # or hono-sdk, nodejs-rest, hono-rest
npm install
npm run dev                   # starts on port 3000
```

For the .NET backend:

```bash
cd examples/api/dotnet-rest
dotnet run                    # starts on port 3000
```

### 3. Start the frontend

In a **separate terminal**:

```bash
cd examples/api/frontend
npm install
npm run dev                   # starts on port 5173
```

### 4. Open the app

Navigate to **http://localhost:5173**. You should see a UI with buttons for each demo scenario.

:::info Switching backends
Stop the current backend, `cd` into a different one, and run `npm run dev`. The frontend does not need to restart — the Vite proxy automatically picks up the new backend.
:::

## What the Examples Cover

### Single CAD Operation

Click **Generate** to create a parametric "dragon cup" model via `client.models.run("dragon-cup", {...})`. The backend submits the request, polls until the task completes, and returns a glTF download URL. The frontend loads the glTF into a Three.js scene.

### Batch Generation

Click **Generate Batch** to create 3 model variations concurrently. Demonstrates parallel API calls.

### Pipelines

Pipelines let you chain multiple CAD operations in a single request, referencing earlier step results with `$ref:N` tokens. The examples include:

| Button | Pipeline | Key Concepts |
|--------|----------|-------------|
| **Translate → Union → Fillet** | Create two boxes, translate one, union, fillet edges | `$ref:N` step references |
| **Map Cylinders** | Create cylinders at different positions using iteration | `map` step, `$item`, `$index` |
| **Map Spheres** | Create spheres of varying radii | `map` step, `$item` |
| **Choice** | Conditionally create a box or cylinder | `choice` step, branching |
| **File Input** | Upload a STEP file, fillet its edges | `$file:N` references, file upload |

For a deep dive into pipeline syntax and features, see the [Pipelines guide](/api/sdk/typescript/pipelines).

## API Routes

All five backends expose the same routes so the frontend is fully interchangeable:

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/generate` | Single CAD operation |
| `POST` | `/api/generate-batch` | Parallel batch generation |
| `GET` | `/api/task/:id` | Poll / fetch task result |
| `POST` | `/api/pipeline/translate-union-fillet` | Pipeline: multi-step modeling |
| `POST` | `/api/pipeline/map-cylinders` | Pipeline: map iteration |
| `POST` | `/api/pipeline/map-spheres` | Pipeline: map iteration |
| `POST` | `/api/pipeline/choice` | Pipeline: conditional logic |
| `POST` | `/api/pipeline/file-input` | Pipeline: file upload + processing |
| `POST` | `/api/validate-demo` | Validation demo (SDK backends only, no frontend UI yet) |
| `GET` | `/api/proxy-download?url=...` | Proxy glTF downloads (avoids CORS) |

## Key Implementation Details

### File Upload Flow

The API uses a **3-step presigned URL flow** for file uploads:

1. `POST /api/v1/files/upload` — request an upload slot (returns `fileId` + presigned URL).
2. `PUT` the raw bytes to the presigned URL.
3. `POST /api/v1/files/:id/confirm` — confirm the upload.

The SDK handles this automatically via `client.files.uploadBytes()`. The REST examples implement it manually in `bitbybit-client.ts` (TypeScript) or `BitbybitClient.cs` (C#).

### Download Proxy

Three.js's `GLTFLoader` can't load cross-origin URLs without CORS headers. The backends include a `/api/proxy-download` endpoint that fetches the glTF binary from the Bitbybit CDN and streams it back to the frontend.

### Environment Variables

| Backend type | File | Variables |
|-------------|------|-----------|
| Node.js | `.env` | `BITBYBIT_API_KEY`, `BITBYBIT_API_URL` |
| Hono | `.dev.vars` | `BITBYBIT_API_KEY`, `BITBYBIT_API_URL` |
| .NET | `appsettings.Development.json` | `Bitbybit:ApiKey`, `Bitbybit:ApiUrl` |

:::warning Security
Never commit your API key to version control. `.env`, `.dev.vars`, and `appsettings.Development.json` are all listed in `.gitignore`.
:::

## Project Structure

```
examples/api/
├── frontend/                 # React 19 + Vite + Three.js
│   ├── src/App.tsx           # Main app — orchestrates panels
│   ├── src/panels/           # UI panels for each demo
│   ├── src/components/       # Three.js viewer, shared UI
│   └── vite.config.ts        # Dev proxy: /api → localhost:3000
│
├── hono-rest/                # Cloudflare Worker (raw fetch)
│   └── src/
│       ├── index.ts          # Hono routes
│       └── bitbybit-client.ts
│
├── hono-sdk/                 # Cloudflare Worker (SDK)
│   └── src/
│       ├── index.ts          # Hono routes + validation error handling
│       └── bitbybit-client.ts
│
├── nodejs-rest/              # Express 5 (raw fetch)
│   └── src/
│       ├── index.ts          # Express routes
│       └── bitbybit-client.ts
│
├── nodejs-sdk/               # Express 5 (SDK)
│   └── src/
│       ├── index.ts          # Express routes + validation error handling
│       └── bitbybit-client.ts
│
└── dotnet-rest/              # ASP.NET Core (.NET 10, raw HttpClient)
    ├── Program.cs            # Minimal API routes
    ├── BitbybitClient.cs     # API calls via HttpClient + polling
    └── appsettings.json      # Config (API key in Development override)
```
