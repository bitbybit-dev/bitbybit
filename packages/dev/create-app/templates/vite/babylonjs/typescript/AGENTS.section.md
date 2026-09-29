## This template: Vite + Babylon.js

- `src/model.ts` is the geometry. `buildModel(occt, params)` builds the OCCT shape from `ModelParams` and returns it. It knows nothing about rendering, and every kernel call is awaited, so the same function runs in the browser (through the OCCT worker, whose calls return promises) and in Node (in-process, whose calls return values). Put new geometry here, and new parameters in `ModelParams` with a default in `defaultParams`.
- `src/main.ts` is the wiring: it starts the Babylon.js scene, initialises Bitbybit, calls `buildModel` and draws the result. The Manifold and JSCAD demonstrations live here as well. Keep geometry out of this file.
- `scripts/smoke.ts` loads the OCCT kernel in Node, runs `buildModel` with `defaultParams` and prints one JSON line with the field names `template`, `params`, `valid`, `faces`, `edges`, `volume`, `area` and `bbox`. It exits 1 when the shape is not a valid solid or has no volume. Add an assertion here when a change to the model has a fact worth pinning, such as a face count or a bounding box.

Commands:

- `npm run dev` serves the app at http://localhost:5173
- `npm run build` typechecks and bundles for production; `npm run typecheck` and `npm run lint` run alone as well
- `npm run smoke` typechecks, lints, then builds the model headlessly and prints the summary line; the kernel loads from `node_modules`, so nothing is downloaded: it is the same WebAssembly the browser runs inside a worker, loaded in-process, its content-hashed `.wasm` found beside the loader. The smoke script types the in-process kernel as the same `Occt` the browser code sees, through one `inProcess` cast, and awaits every call, so `buildModel` runs exactly as it does in the browser and `scripts/` is typechecked with the rest.

The OCCT kernel runs in a web worker in the browser, so the objects `buildModel` handles there are pointers to shapes held by the worker, not the shapes themselves. That is why geometry is built entirely inside `buildModel` and only the result is drawn.
