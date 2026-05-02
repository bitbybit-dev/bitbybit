# Bitbybit API + Three.js Example (Node.js SDK)

A Node.js server built with Express that creates a Dragon Cup via the [`@bitbybit-dev/cad-cloud-sdk`](https://www.npmjs.com/package/@bitbybit-dev/cad-cloud-sdk) and renders it in Three.js.

This example is functionally identical to [nodejs-rest](../nodejs-rest), but replaces hand-rolled `fetch` calls with the type-safe SDK client.

## Prerequisites

- Node.js 18+
- A Bitbybit API key — purchase one at [bitbybit.dev/auth/pick-plan](https://bitbybit.dev/auth/pick-plan). The key needs the **models** and **tasks** scopes.

## Setup

    npm install

## Configure API Key

Create a `.env` file (git-ignored) from the example:

    cp .env.example .env

Then fill in your key:

    BITBYBIT_API_KEY=bbk_your_key_here
    BITBYBIT_API_URL=https://api.bitbybit.dev

> Keep your API key safe. Never commit it, share it, or include it in client-side code.

## Development

    npm run dev

Open http://localhost:3000

## Production

    npm run build
    npm start

## How It Works

1. **Frontend** (`/`) — Three.js page with a "Generate Dragon Cup" button.
2. **Backend** (`POST /api/generate`) — Uses `BitbybitClient` from the SDK to create a dragon cup model, automatically polls the task until complete, returns a pre-signed GLB download URL.
3. **Frontend** loads the GLB into Three.js via `GLTFLoader`.

## Learn More

- [SDK Documentation](https://learn.bitbybit.dev/api/sdk/typescript/intro)
- [Validation & Error Handling](https://learn.bitbybit.dev/api/sdk/typescript/validation)
- [Cloud CAD API Overview](https://learn.bitbybit.dev/api/category/cloud-cad-api)
