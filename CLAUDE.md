# CLAUDE.md - the bitbybit open-source monorepo

MIT-licensed. This repository is the source of truth for the CAD algorithms and the published
`@bitbybit-dev/*` npm packages. It is consumed as a git submodule by the closed-source platform,
but it stands alone: everything here builds and tests without it.

Start with `README.md` for the project overview and `CONTRIBUTING.md` before opening a PR.

## Layout

| Directory | What it is |
|---|---|
| `packages/dev/*` | the 13 published npm packages - see `packages/dev/CLAUDE.md` |
| `docs/` | the Docusaurus site for learn.bitbybit.dev, including the generated API reference |
| `examples/` | runnable examples per framework (angular, nextjs, nuxt, node, vite, react) |
| `languages/` | i18n source JSON for the platform |

## Building the packages

The packages form a dependency DAG and must be built in order. `npm run build-packages` walks it:

```
base -> occt -> jscad -> manifold -> occt-worker -> jscad-worker -> manifold-worker -> core -> babylonjs -> threejs -> playcanvas
```

Note this ordering is maintained by hand and is **not identical** to the publish order in
`README.md`; when you change one, check the other.

## The workspace

The thirteen packages under `packages/dev/` are one pnpm workspace (`pnpm-workspace.yaml`): one
`pnpm install` at the root - `npm run ci-packages` is exactly that, frozen to the lockfile - installs
all of them, and a sibling dependency whose exact pin matches the sibling's version becomes a
symlink instead of a registry copy (`linkWorkspacePackages`). One `pnpm-lock.yaml` replaces the
per-package npm locks; `npm run refresh-lockfile` rewrites it without touching node_modules. The
manifests keep exact registry pins on purpose and never the `workspace:` protocol: `dist/` is what
npm publishes, and `copy-package` writes its manifest through `scripts/dist-manifest.mjs`, which
refuses a `workspace:`, `link:` or `file:` specifier. A dependency's install script runs only when
`allowBuilds` lists it - pnpm refuses the install while one is unreviewed, so a new native
dependency shows up as a decision, not as a silent skip. Use pnpm 11 (`npm install -g pnpm@11`);
the `packageManager` field pins the exact version and pnpm switches to it on its own.

pnpm's layout is strict: a package resolves only what its own manifest declares, where npm's flat
hoisting let it reach anything a sibling had installed. Every import in `lib/` must therefore be a
dependency of that package - the engine packages import `@bitbybit-dev/base`, the three workers,
`jsonpath-plus` and `verb-nurbs-web` directly, and declare them. Verify a build from a clone that
sits outside your home directory: a stray `~/node_modules` above the checkout satisfies an
undeclared import on your machine and nowhere else, which is how one reached CI.

`npm test` at the root runs every package suite, after `npm run check:worker-parity`: each worker
package mirrors its kernel by dotted path, and `scripts/worker-parity.mjs` fails when a worker sends
a path the kernel lacks, when a kernel method has no mirror outside the allow-list, when signatures
disagree, or when the worker's path set differs from the committed snapshot (those paths are
persisted in users' saved scripts). A deliberate surface change is accepted with `--update`.

## Docs

The Docusaurus site regenerates its API pages from an OpenAPI document, and `llms.txt` is generated
from `docs/static/llms.template.txt` by `docs/scripts/generate-llms.js` on every docs `start` and
`build`. Edit the template, never the output.

## Conventions

- **Jest**, not Vitest, for the packages. Configuration lives in each package's `package.json`
  under a `jest` key, not in a separate config file.
- `UNIT_TESTING_GUIDE.md` at the root is the testing standard for this repository.
- Kernel-heavy suites need a raised heap; the package scripts already set
  `NODE_OPTIONS='--experimental-vm-modules --max-old-space-size=8192'`. Keep that when adding one.
- Every package's `tsconfig.json` and `tsconfig.bitbybit.json` extends `tsconfig.base.cad-loose.json`
  at the repository root and keeps only what differs: outDir, paths into sibling dists, exclusions.
  Change a compiler flag for every package in the base; change it for one package in its leaf, and
  say so there, because a base cannot be un-set by omission.
