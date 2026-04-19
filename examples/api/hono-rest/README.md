# Bitbybit API + Three.js Example

A [Cloudflare Worker](https://developers.cloudflare.com/workers/) built with [Hono](https://hono.dev/) that creates a Dragon Cup via the [bitbybit REST API](https://bitbybit.dev) and renders it in [Three.js](https://threejs.org/).

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- A **bitbybit API key** — purchase one at [bitbybit.dev/auth/pick-plan](https://bitbybit.dev/auth/pick-plan). The key needs the **models** and **tasks** scopes.

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

Paste your `bbk_...` key when prompted.

> **⚠️ Keep your API key safe.** Treat it like a password — anyone with your key can make API calls on your behalf and consume your quota. Never commit it to version control, share it in chat, paste it in client-side code, or include it in public repositories. If you suspect a key has been leaked, revoke it immediately in your bitbybit.dev dashboard and generate a new one. The `.dev.vars` file is listed in `.gitignore` for this reason, and this example keeps the key strictly server-side in the Cloudflare Worker environment.

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

1. **Frontend** (`/`) — A minimal Three.js page with a "Generate Dragon Cup" button.
2. **Backend** (`POST /api/generate`) — Calls `api.bitbybit.dev` to create a dragon cup model, polls the task until complete, and returns a pre-signed GLB download URL.
3. **Frontend** loads the GLB URL into Three.js via `GLTFLoader`.
