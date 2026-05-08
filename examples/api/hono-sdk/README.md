# Bitbybit API + Three.js Example (Hono + SDK)

A [Cloudflare Worker](https://developers.cloudflare.com/workers/) built with [Hono](https://hono.dev/) that generates a Dragon Cup via the [@bitbybit-dev/cad-cloud-sdk](https://www.npmjs.com/package/@bitbybit-dev/cad-cloud-sdk) and renders it in [Three.js](https://threejs.org/).

For full SDK documentation, see the [TypeScript SDK guide](https://learn.bitbybit.dev/api/sdk/typescript/intro).

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- A Bitbybit API key - get one at [bitbybit.dev/auth/pick-plan](https://bitbybit.dev/auth/pick-plan)

## Setup

```bash
npm install
```

## Configure API Key

### Local development

Create a `.dev.vars` file in this directory (it is git-ignored):

```
BITBYBIT_API_KEY=bbk_your_key_here
```

### Deployed worker

Store the key as a Cloudflare secret:

```bash
npx wrangler secret put BITBYBIT_API_KEY
```

## Development

```bash
npm run dev
```

Open [http://localhost:8787](http://localhost:8787) in your browser.

## Deploy

```bash
npm run deploy
```

## How It Works

1. **Frontend** (`/`) - A minimal Three.js page with buttons to generate models.
2. **Backend** (`POST /api/generate`) - Uses `BitbybitClient` from the SDK to create a dragon cup model, automatically polls the task until complete, and returns a pre-signed GLB download URL.
3. **Frontend** loads the GLB URL into Three.js via `GLTFLoader`.

## Learn More

- [SDK Documentation](https://learn.bitbybit.dev/api/sdk/typescript/intro)
- [Client-side Validation](https://learn.bitbybit.dev/api/sdk/typescript/validation)
- [API Reference](https://learn.bitbybit.dev/api/api-reference)
