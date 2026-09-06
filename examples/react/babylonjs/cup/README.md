# Cup Configurator - BabylonJS + React

Configure a custom cup - proportions, handle, wall thickness - and download it for 3D printing.
Live at https://app-store.bitbybit.dev/cup. Built on [@bitbybit-dev/babylonjs](https://www.npmjs.com/package/@bitbybit-dev/babylonjs).

## Running it

```
npm install
npm run dev        # http://localhost:3001
npm run build      # production bundle in dist/
npm run preview    # serve the production bundle
```

The app is a [Vite](https://vite.dev) + React project. The OCCT and JSCAD kernels run in web
workers (`src/*.worker.ts`), started with `new Worker(new URL("./occ.worker", import.meta.url), { type: "module" })`.
