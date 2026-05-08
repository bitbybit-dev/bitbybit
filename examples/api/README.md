# Bitbybit CAD Cloud API - Example Projects

This folder contains a **shared React frontend** and **five interchangeable backend implementations** that demonstrate how to integrate the Bitbybit CAD Cloud API into a web application.

## Architecture

```
┌─────────────────────────────┐        ┌─────────────────────────────┐
│        frontend/            │        │  Bitbybit CAD Cloud API     │
│  React 19 + Vite + Three.js │──/api──▶  (choose one backend)      │──▶  api.bitbybit.dev
│  Port 5173                  │ proxy  │  Port 3000                  │
└─────────────────────────────┘        └─────────────────────────────┘
```

The frontend never calls the Bitbybit API directly - your **API key stays on the server**. Vite's dev proxy forwards `/api/*` requests to `localhost:3000`, so the frontend works identically with any of the five backends.

## Backend Variants

| Folder | Framework | API Style | Description |
|--------|-----------|-----------|-------------|
| `hono-rest/` | Hono (Cloudflare Workers) | Raw REST | Direct `fetch` calls to the Bitbybit REST API |
| `hono-sdk/` | Hono (Cloudflare Workers) | TypeScript SDK | Uses `@bitbybit-dev/cad-cloud-sdk` with client-side validation |
| `nodejs-rest/` | Express 5 (Node.js) | Raw REST | Direct `fetch` calls to the Bitbybit REST API |
| `nodejs-sdk/` | Express 5 (Node.js) | TypeScript SDK | Uses `@bitbybit-dev/cad-cloud-sdk` with client-side validation |
| `dotnet-rest/` | ASP.NET Core (.NET 10) | Raw REST | Direct `HttpClient` calls to the Bitbybit REST API |

All five backends expose the same `/api/*` routes, so the frontend is completely interchangeable between them.

### REST vs SDK

- **REST backends** (`hono-rest`, `nodejs-rest`) make raw HTTP calls and handle polling, file upload, and error handling manually. Good for understanding the API protocol or integrating into languages without an SDK.
- **SDK backends** (`hono-sdk`, `nodejs-sdk`) use `@bitbybit-dev/cad-cloud-sdk` which provides type-safe methods, automatic polling, client-side request validation, and a typed `step()` helper for building pipelines. Recommended for TypeScript projects.

## Prerequisites

- **Node.js** ≥ 20 (for the frontend and Node.js/Hono backends)
- **.NET** ≥ 10 (only for the `dotnet-rest` backend)
- A **Bitbybit API key** - get one from [bitbybit.dev](https://bitbybit.dev)
- For Hono backends: **Wrangler** CLI (installed as a dev dependency)

## Quick Start

### 1. Pick a backend and configure your API key

**For Node.js backends** (`nodejs-rest/` or `nodejs-sdk/`):

```bash
cd nodejs-sdk          # or nodejs-rest
cp .env.example .env   # if .env.example exists, otherwise create .env manually
```

Add your key to `.env`:

```
BITBYBIT_API_KEY=your-api-key-here
BITBYBIT_API_URL=https://api.bitbybit.dev
```

**For Hono backends** (`hono-rest/` or `hono-sdk/`):

Create a `.dev.vars` file in the backend folder:

```
BITBYBIT_API_KEY=your-api-key-here
BITBYBIT_API_URL=https://api.bitbybit.dev
```

**For the .NET backend** (`dotnet-rest/`):

Edit `appsettings.Development.json` (gitignored):

```json
{
  "Bitbybit": {
    "ApiKey": "your-api-key-here",
    "ApiUrl": "https://api.bitbybit.dev"
  }
}
```

### 2. Install dependencies and start the backend

```bash
cd nodejs-sdk          # or whichever backend you chose
npm install
npm run dev            # starts on port 3000
```

**For the .NET backend:**

```bash
cd dotnet-rest
dotnet run             # starts on port 3000
```

### 3. Start the frontend (in a separate terminal)

```bash
cd frontend
npm install
npm run dev            # starts on port 5173 with /api proxy → localhost:3000
```

### 4. Open the app

Navigate to **http://localhost:5173** in your browser.

## What the Examples Demonstrate

### Single CAD Operation
Click **Generate** to create a parametric "dragon cup" model via `client.models.run("dragon-cup", {...})`. The backend submits the request, polls until the task completes, and returns a glTF download URL. The frontend loads it into a Three.js scene.

### Batch Generation
Click **Generate Batch** to create 3 model variations in parallel. Demonstrates concurrent API calls.

### Pipelines
The app includes several pipeline examples accessible via dedicated buttons:

| Pipeline | What it does |
|----------|-------------|
| **Translate → Union → Fillet** | Creates two boxes, translates one, unions them, fillets edges - demonstrates `$ref:N` step references |
| **Map Cylinders** | Uses a `map` step to create cylinders at different positions - demonstrates iteration with `$item` and `$index` |
| **Map Spheres** | Maps over an array of radii to create multiple spheres - demonstrates `$item` references |
| **Choice** | Uses a `choice` step to conditionally create a box or cylinder - demonstrates branching logic |
| **File Input** | Upload a STEP file, fillet its edges - demonstrates `$file:N` references and the file upload flow |

## Project Structure

```
frontend/
├── src/
│   ├── App.tsx              # Main app - orchestrates panels
│   ├── panels/              # UI panels for each feature
│   └── components/          # Three.js viewer, shared UI
├── vite.config.ts           # Dev proxy: /api → localhost:3000
└── package.json

hono-rest/                   # Cloudflare Worker backend (raw fetch)
├── src/
│   ├── index.ts             # Hono routes
│   ├── bitbybit-client.ts   # API calls via raw fetch + polling
│   └── types.ts             # Env bindings
├── wrangler.jsonc
└── package.json

hono-sdk/                    # Cloudflare Worker backend (SDK)
├── src/
│   ├── index.ts             # Hono routes + BitbybitValidationError handling
│   ├── bitbybit-client.ts   # API calls via BitbybitClient SDK
│   └── types.ts             # Env bindings
├── wrangler.jsonc
└── package.json

nodejs-rest/                 # Express backend (raw fetch)
├── src/
│   ├── index.ts             # Express routes
│   ├── bitbybit-client.ts   # API calls via raw fetch + polling
│   └── types.ts             # Env type
└── package.json

nodejs-sdk/                  # Express backend (SDK)
├── src/
│   ├── index.ts             # Express routes + BitbybitValidationError handling
│   ├── bitbybit-client.ts   # API calls via BitbybitClient SDK
│   └── types.ts
└── package.json

dotnet-rest/                 # ASP.NET Core backend (raw HttpClient)
├── Program.cs               # Minimal API routes
├── BitbybitClient.cs        # API calls via HttpClient + polling
├── appsettings.json         # Config (API key in Development override)
└── dotnet-rest.csproj       # .NET project file
```

## API Routes

All backends expose these routes (consumed by the frontend):

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/generate` | Single CAD operation (dragon cup) |
| `POST` | `/api/generate-batch` | Parallel batch generation |
| `GET` | `/api/task/:id` | Poll / fetch task result |
| `POST` | `/api/pipeline/translate-union-fillet` | Pipeline: translate → union → fillet |
| `POST` | `/api/pipeline/map-cylinders` | Pipeline: map cylinders |
| `POST` | `/api/pipeline/map-spheres` | Pipeline: map spheres |
| `POST` | `/api/pipeline/choice` | Pipeline: conditional logic |
| `POST` | `/api/pipeline/file-input` | Pipeline: file upload + fillet |
| `POST` | `/api/validate-demo` | Validation demo (SDK backends only, no frontend UI yet) |
| `GET` | `/api/proxy-download?url=...` | Proxy glTF downloads (avoids CORS) |

## Tips

- **Switching backends**: Stop the current backend, `cd` into a different one, run `npm run dev`. The frontend doesn't need to restart.
- **Environment variables**: Node.js backends use `.env`, Hono backends use `.dev.vars`, .NET uses `appsettings.Development.json`.
- **CORS**: Not an issue in development because Vite proxies `/api` requests. In production, configure CORS on your backend or serve the frontend from the same origin.
- **File uploads**: The frontend sends files as `multipart/form-data`. The backend uploads them to Bitbybit via a 3-step presigned URL flow, then passes the `fileId` to the pipeline.
