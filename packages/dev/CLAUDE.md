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
npm run api:update  # every package but occt-worker: rewrite etc/<pkg>.api.md after a deliberate public-surface change
npm run typecheck:strict       # the strict typecheck (tsconfig.strict.json, generated with the build's references); must stay at zero
npm test            # vitest, single run
npm run test:coverage          # the same with coverage; writes test-results/vitest.json and coverage/coverage-summary.json for the root test:report
npm run test:watch  # vitest in watch mode
npm run lint
```

`build-p` is what produces a publishable `dist/`. Plain `build` only compiles.

## Things that catch people out

- **Test configuration is a `vitest.config.ts` beside the package**, and it says only what differs
  from `packages/dev/vitest.shared.ts`: the coverage globs, and where needed a jsdom environment, a
  process per file, or a module to stand in for another. Standing one module in for another goes
  through the shared `alias` option, not `resolve.alias`: Vite never shows an alias a relative
  import, and the emscripten glue is reached as a relative path from inside the package that ships it.
- **The shape of a DTO property is load-bearing for the declarations.** A property the service always
  reads is required, `line!: LinePointsDto;` - the constructors assign conditionally, so that is a
  definite-assignment assertion, not an initializer. A property a caller may omit is optional, spelled
  with an explicit type that admits undefined, `tolerance?: number | undefined = 1e-7;`: the
  constructors and the services treat an explicit undefined as "use the default", and under
  exactOptionalPropertyTypes only that spelling lets a caller pass an optional value straight through
  (`{ tolerance: inputs.tolerance }`). Write the type out - an inferred one prints differently in the
  declarations depending on the compiler flags, and the declarations the visual editors are generated from must
  not move with a flag. The service applies the default itself where it reads the property
  (`inputs.tolerance ?? 1e-7`), because only `new Dto()` runs the initializer; an object literal from a
  script does not. Index reads inside a bounds-checked loop, after a length check, or of a regex group
  the pattern guarantees carry a non-null assertion; everything else narrows.
- **The worker API classes are generated from the kernel; do not edit them.** Every file under
  `occt-worker/lib/api/occt`, `manifold-worker/lib/api/{manifold,cross-section,mesh}` and the class
  files of `jscad-worker/lib/api` carries a GENERATED header. Change the kernel method (its doc, its
  signature, its position in the class) and run `npm run gen:worker-api` at the repository root;
  `check:worker-api` in `npm test` fails on a stale file. A new kernel API method appears in the
  worker on the next generation - and in the parity snapshot, which then needs `--update`, because a
  new dotted path is a public API addition. Hand-written members (downloads, File/Blob preparation,
  re-hydration, reserved commands) go into `lib/api-hand/<same path>.ts` with a marker line each; a
  `// replaces <path>` member without a JSDoc receives the kernel's. Every public kernel API method
  needs an explicit return type - the generator refuses an inferred one.
- **The four assembled inputs namespaces are generated; do not edit them.** `occt/.../occ-inputs.ts`,
  `jscad/.../jscad-inputs.ts`, `manifold/.../manifold-inputs.ts` and `core/.../verb-inputs.ts` are each
  written from the fragments in the sibling directory beside them. Add or change a DTO in the fragment
  whose name fits (they are slices of the namespace in a fixed order, so a new DTO lands where its
  fragment sits), import a sibling fragment's DTO when a property refers to it, and run
  `npm run gen:inputs` at the repository root; `check:inputs` in `npm test` fails on a stale file. A new
  fragment is added to its namespace's `order` in `scripts/inputs.config.mjs` - the generator fails on a
  fragment nothing names rather than dropping it. The fragments are excluded from the build - the
  assembled namespace is what compiles - and they are what lint sees, the assembled file being ignored.
- **Method and class JSDoc is authored on the kernel and describes the API as users reach it** - the
  asynchronous, worker-backed one (`await` in examples, File/Blob accepted where the worker converts
  them, `deleteDocument()` for document lifetime) - with the generator tags (`@group`, `@shortname`,
  `@drawable`) that the visual editors are built from. The worker's copy is generated; `check:worker-parity`
  still compares the two and fails on any difference. A kernel method the worker splits into several
  public methods is allow-listed in `scripts/worker-parity.allow.json` under `docs`, with the reason.
- Kernel suites need the raised heap the scripts already set, and the process per file their
  config asks for. Dropping either makes them fail in ways that look like test bugs.
- `occt` ships prebuilt wasm alongside the JavaScript (`bitbybit-dev-occt`, plus 64-bit and
  64-bit-mt variants), copied into `dist/` by `copy-occt`. The wasm is not tracked: `kernels.json`
  names each kernel with its SHA-256 and url, and `build-p` starts by fetching what is missing and
  verifying what is present (`npm run kernels:fetch` at the root does the same). A build that skips
  it produces a package that resolves but cannot run. The tarball also carries `NOTICE` and the
  OCCT and Draco license texts.
- `cad-cloud-sdk` and `create-app` compile as **NodeNext at ES2022** where their siblings target a
  browser bundle - the only compiler settings either states on top of the shared base. Part of the
  SDK's `src/types/` is **generated** from the CAD Cloud API's schemas; do not edit those by hand.
- `create-app` is the `npx @bitbybit-dev/create-app` scaffolder, not a library.
- **The `repository` field is load-bearing.** npm's provenance check compares the published manifest's
  `repository.url` with the repository the publish workflow runs in, so every package declares
  `git+https://github.com/bitbybit-dev/bitbybit.git` with its `directory`; `copy-package` refuses a
  manifest that says anything else, before the tarball exists.
- **`exports` is for this workspace, not for npm.** Each dist-published manifest carries the map
  `npm run gen:exports` derives from its tree, with the `@bitbybit-dev/source` condition first; the
  shared test configuration declares it and so resolves sibling sources. Added a directory index under `lib/`? Regenerate.
  `copy-package` drops the map (and `devDependencies`, `scripts`) from `dist/package.json`,
  and `npm run check:exports` holds both sides to the shape `scripts/dist-manifest.mjs` expects.
- `threejs` and `playcanvas` take their engine as an ordinary **dependency**; `babylonjs` takes
  its engine as a **peer dependency**. The runner tooling reads `peerDependencies` to decide
  which engine version to install, so the distinction is not cosmetic. Both also run a
  `delete-mocks` step during packaging.

Four packages carry their own `CLAUDE.md` because they genuinely differ: `occt` (ships wasm),
`babylonjs` (peer-dependency engine), `cad-cloud-sdk` (generated types) and
`create-app` (a CLI). The rest follow this file.
