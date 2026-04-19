# Bitbybit API + Three.js Example (Node.js)

A Node.js server built with Express that creates a Dragon Cup via the bitbybit REST API and renders it in Three.js.

## Prerequisites

- Node.js 18+
- A bitbybit API key — purchase one at bitbybit.dev/auth/pick-plan. The key needs the **models** and **tasks** scopes.

## Setup

    npm install

## Configure API Key

Create a `.env` file (git-ignored) from the example:

    cp .env.example .env

Then fill in your key:

    BITBYBIT_API_KEY=bbk_your_key_here
    BITBYBIT_API_URL=https://api.bitbybit.dev

> ⚠️ Keep your API key safe. Never commit it, share it, or include it in client-side code.

## Development

    npm run dev

Open http://localhost:3000

## Production

    npm run build
    npm start

## How It Works

1. **Frontend** (`/`) — Three.js page with a "Generate Dragon Cup" button.
2. **Backend** (`POST /api/generate`) — Calls `api.bitbybit.dev`, polls the task until complete, returns a pre-signed GLB download URL.
3. **Frontend** loads the GLB into Three.js via `GLTFLoader`.
