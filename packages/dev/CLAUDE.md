# CLAUDE.md - the published `@bitbybit-dev/*` packages

Thirteen packages, all published to npm: `base`, `occt`, `occt-worker`, `jscad`, `jscad-worker`,
`manifold`, `manifold-worker`, `core`, `babylonjs`, `threejs`, `playcanvas`, `cad-cloud-sdk`,
`create-app`.

They form a DAG. `base` is the root and depends on nothing; `core` sits on `base` and the three
workers; `babylonjs`, `threejs` and `playcanvas` each sit on `core` and carry their engine as a peer
or hard dependency. The build order is derived from these manifests - see "Building the packages"
in the root CLAUDE.md; `npm run build-packages` at the repo root runs it.

## Per-package commands (run from the package directory)

```bash
npm run build       # tsc -b tsconfig.bitbybit.json - builds the siblings it references first
npm run build-p     # build, then stage dist/ for publishing (package.json, README, LICENSE, assets)
npm run api:update  # base and core only: rewrite etc/<pkg>.api.md after a deliberate public-surface change
npm run typecheck:strict       # strict typecheck (tsconfig.strict.json); prints only errors not in .tsc-baseline.json
npm run typecheck:strict:save  # after fixing strict errors: re-record the baseline (it may only shrink)
npm test            # jest, watch mode
npm run test-c      # jest with coverage, single run
npm run lint
```

`build-p` is what produces a publishable `dist/`. Plain `build` only compiles.

## Things that catch people out

- **Jest configuration lives in each `package.json` under a `jest` key.** There is no
  `jest.config.js` to look for.
- Kernel suites need the raised heap and ESM VM modules the scripts already set. Dropping
  `NODE_OPTIONS` makes them fail in ways that look like test bugs.
- `occt` ships prebuilt wasm alongside the JavaScript (`bitbybit-dev-occt`, plus 64-bit and
  64-bit-mt variants), copied into `dist/` by `copy-occt`. A build that skips it produces a package
  that resolves but cannot run.
- `cad-cloud-sdk` is different from its siblings: it uses **Vitest**, and part of its `src/types/`
  is **generated** by the API-3D platform rather than hand-written. Do not edit those by hand.
- `create-app` is the `npx @bitbybit-dev/create-app` scaffolder, not a library.
- `threejs` and `playcanvas` take their engine as an ordinary **dependency**; `babylonjs` takes
  its engine as a **peer dependency**. The runner tooling reads `peerDependencies` to decide
  which engine version to install, so the distinction is not cosmetic. Both also run a
  `delete-mocks` step during packaging.

Four packages carry their own `CLAUDE.md` because they genuinely differ: `occt` (ships wasm),
`babylonjs` (peer-dependency engine), `cad-cloud-sdk` (Vitest, generated types) and
`create-app` (a CLI). The rest follow this file.
