# {{PROJECT_NAME}}

A sheet-metal channel that you shape in the browser and unfold on [Bitbybit CAD Cloud](https://bitbybit.dev/cad-cloud). The part, its measurements, the K-factor estimate of its flat length and the STEP download all run in your browser on the open-source [Bitbybit](https://bitbybit.dev) packages. The exact flat pattern, with its bend lines and bend table, comes from the cloud's sheet-metal unfold, a Pro algorithm that exists only there, and comes back as STEP and as a DXF written in the browser.

```bash
npm install                # both workspaces
npm run dev:backend        # http://localhost:3000, holds the key
npm run dev:frontend       # http://localhost:5173, proxies /api to the backend
npm run smoke              # both smokes, each typechecking and linting first; no key and no network needed
npm run lint               # the lint rules, at error, across both
```

## What needs CAD Cloud and where to get it

| | |
|---|---|
| What runs in the browser | building the channel, measuring it, the flat-length estimate, the STEP download of the part, the DXF of the flat pattern once it is back |
| What runs on CAD Cloud | the unfold itself: one call from `backend/src/cloud.ts` to the Pro endpoint, returning the flat pattern and the bend report |
| Plan needed | any [CAD Cloud plan](https://bitbybit.dev/cad-cloud); the key needs the `cad`, `files` and `tasks` scopes; every unfold is one metered task |
| Where keys live | [Bitbybit Studio](https://studio.bitbybit.dev/keys/billing), which also shows the tasks this app ran |
| Where the key goes | `backend/.env` as `BITBYBIT_API_KEY=...`; it never reaches the browser |
| Without a key | the backend answers 503, the page explains it with these links, and everything that runs in the browser keeps working |

Why a backend at all: the browser could not hold the key without exposing it. The backend is forty lines of Express whose only job is to keep the key on the server and forward one request.

## How it is put together

| File | Role |
|---|---|
| `frontend/src/model.ts` | the channel as a rounded centre line swept with the sheet's section, with mounting holes in the base and a slot in each flange where they fit, its volume, the K-factor estimate |
| `frontend/src/flat.ts` | reads the cloud's report: bend lines and a summary |
| `frontend/src/cloud-access.ts` | the access state: ready, locked without a key, backend unreachable, error |
| `frontend/src/main.ts` | scene, kernel, rebuilds, the unfold call, the two views, the downloads |
| `backend/src/app.ts`, `backend/src/cloud.ts` | the unfold route and the gateway over the CAD Cloud SDK |
| `frontend/scripts/smoke.ts`, `backend/scripts/smoke.ts` | headless checks of the geometry and of the route, with a fake gateway |

## Working with an AI agent

`AGENTS.md` explains the project to a coding agent, including what needs the cloud and why, and the free Bitbybit CAD MCP server is configured for Claude Code, Cursor and VS Code. Ask for a different profile or a hole pattern, then let it run `npm run smoke`.

Scaffolded by `@bitbybit-dev/create-app` {{CLI_VERSION}}. [Documentation](https://learn.bitbybit.dev), [the packages](https://github.com/bitbybit-dev/bitbybit), [Discord](https://discord.gg/GSe3VMe).
