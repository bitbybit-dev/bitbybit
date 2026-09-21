## This template: CAD Cloud app with {{BACKEND_NAME}}

Two packages. `backend/` holds the API key in `backend/{{SECRET_FILE}}`, calls the Bitbybit CAD Cloud REST API and exposes `/api/*`. `frontend/` (React, Vite, Three.js) calls only the backend, through Vite's dev proxy, and loads the glTF results it gets back. The key never reaches the browser; keep it that way, and keep every call to `api.bitbybit.dev` inside `backend/`.

Commands:

- backend: `{{BACKEND_START}}` serves it on port 3000; `{{BACKEND_SMOKE}}` checks it without a key
- frontend: `cd frontend && npm install && npm run dev` serves it at http://localhost:5173; `npm run smoke` typechecks and lints it

The routes: every `/api/*` route answers 503 with a message when no key is configured; the single and batch dragon-cup routes create tasks, the pipeline routes run the API's pipelines (translate then union then fillet, cylinders mapped over positions, spheres over radii, a choice conditional, a STEP upload then fillet), one route fetches an existing task's result, and `/api/proxy-download` streams a result file through the backend because the browser's glTF loader cannot fetch it cross-origin from the result URL. The REST clients poll a task every two seconds for at most four minutes; the .NET client uploads a file in three steps (a presigned URL, the PUT, a confirmation). The frontend reads both answer shapes: `downloadUrl` from the REST backends and `downloads[]` from the SDK ones, and on load it picks up `?task=` or `?pipeline-task=` from the URL to show an existing result.

The backend's smoke compiles it and nothing more: it proves the code still matches the pinned CAD Cloud SDK and types after a change, without a key and without a network. Running the app for real needs the key below.

## What needs CAD Cloud and where to get it

Everything this app renders is computed on CAD Cloud, because this template is the hosted-compute case: a backend that cannot or does not host the CAD kernels (a Cloudflare Worker or a .NET server cannot; a small Node server may choose not to) and sends the work to `api.bitbybit.dev`. If the geometry could instead run in the users' browsers, or in a Node server with the memory to hold a kernel, the free packages are the whole answer and a Vite template from `npm init @bitbybit-dev/app` is the better start. Do not move a cloud call into the browser to save the key: the honest fix is to switch template.

- The calls that go to the cloud: every route in `backend/` that creates a task, runs a pipeline, uploads a file or fetches a result. They are metered on the key's plan exactly as the REST API documents.
- The plan needed: any [CAD Cloud plan](https://bitbybit.dev/cad-cloud). The key's scopes decide which routes work; this template needs `cad`, `files` and `tasks`.
- Where the key comes from: keys are created and managed in [Bitbybit Studio](https://studio.bitbybit.dev/keys/billing), which also shows the tasks this app ran and the usage they cost.
- Where the key goes: `backend/{{SECRET_FILE}}`, which `backend/.gitignore` already ignores. Never write it anywhere else, never paste it into a prompt, and never log it.
- Without a key: every `/api/*` route answers 503 with a message that says so, and the frontend shows the same explanation with the links above. That state is part of the app; keep it working, and keep the links current.
