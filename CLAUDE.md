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

The packages form a dependency DAG, and the order has one source: each package's `package.json`
dependencies. `scripts/gen-ts-references.mjs` turns them into TypeScript project references -
every `tsconfig.bitbybit.json` is a composite project that references the siblings its manifest
declares, and `tsconfig.build.json` at the root references all eleven - so `tsc -b` orders the
compiles itself and rebuilds only what changed. `npm run build-packages` is `pnpm -r run build-p`:
pnpm orders the eleven stagings by the same manifests, and each `build-p` compiles with `tsc -b`
(which builds the siblings it references first), then stages dist/ for publishing.
`npm run rebuild-all-packages` empties every dist first; `tsc -b tsconfig.build.json --verbose`
prints the order it derives and what it considered up to date.

After changing a dependency between packages, run `npm run gen:references` and commit the result.
`npm run check:references`, the first step of `npm test`, fails when the references and the
manifests disagree - nothing about the order is written by hand any more, and a second hand-written
list must not come back. Two things are placed on purpose: the build info sits in each dist/
(`tsc -b` trusts it over the outputs when it decides a project is up to date, so it has to vanish
with the dist it describes, and the `.npmignore` that `copy-package` writes keeps it out of the
tarball), and every build config excludes `dist` and `coverage`, whose files TypeScript would
otherwise read as inputs.

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

## Lint and the strictness ratchet

`npm run lint` is ESLint 10 over the whole repository from one self-contained `eslint.config.mjs`:
the two recommended sets plus the house style (double quotes, semicolons, underscore-tolerant unused
variables). Every finding that existed when the config landed is recorded in `eslint-suppressions.json`
(written by `eslint --suppress-all` from this directory); a new finding fails, and so does a suppression
that is no longer needed, so the count only goes down. Never load `eslint-plugin-no-comments` here: the
JSDoc on the public API is a functional input to the component generator behind the visual editors,
and that rule's auto-fix would delete it.

The packages build loose and typecheck strict. Each CAD package has a `tsconfig.strict.json` - its build
config plus the flags in `tsconfig.base.cad-strict.json`, the full strict set, with `noEmit` - and a
committed `.tsc-baseline.json` that records today's errors as a count
per file and error code (tsc-baseline, `--ignoreMessages`, because a message can embed an absolute path
into the pnpm store). `npm run typecheck:strict` in a package prints the errors that are NOT in its
baseline; `npm run check:strict-baselines` at the root, which CI runs, holds every baseline to the code
in both directions, so a fix lands together with `npm run typecheck:strict:save` in that package and the
baseline only shrinks. When a package's baseline is empty, its build config goes strict and the baseline
is deleted; when a flag reaches zero errors in every package, it moves from `tsconfig.base.cad-strict.json`
into `tsconfig.base.cad-loose.json` and the build enforces it - four have already (the three catch-variable,
function-type and switch-fallthrough flags, and `noUnusedParameters`); `noUnusedLocals` waits on one
decision, a tested private helper nothing calls. Test support under `__mocks__` is excluded from the
build configs: jest compiles it itself, so dist ships no mocks. Dominant error today: TS2564, property
initializers in the `*-inputs.ts` classes whose JSDoc `@default` already states the value.

## Continuous integration

`.github/workflows/verify.yml` proves the repository builds and tests from a bare clone with nothing
above it, on every push to `develop` and every pull request into `develop` or `master`: one frozen
install, `lint`, `check:references`, `rebuild-all-packages`,
`npm test`, `check:strict-baselines`, the SDK's typecheck, tests and build, the scaffolder's build,
`api:check` and `check:tarballs`. It needs no secrets and must never gain any. A nightly job runs the build and
tests on every Node line the packages should keep working on; Node comes from `.tool-versions` and
pnpm from the `packageManager` field. Publishing is not here and will not be added to this file.

Two of those checks carry committed state. `api:check` runs api-extractor in `base` and `core`
against their built `dist/index.d.ts` and fails when the public surface differs from the report in
each package's `etc/`: the dotted API is persisted in users' saved scripts, so a change to it lands
only with a deliberate `npm run api:update` and the report diff in the same commit. `check:tarballs`
packs every built dist and installs all the tarballs together into an empty project, then compiles a
probe that imports each package as a consumer would, so a sibling only the workspace could resolve, a
dependency a manifest forgot, or a shipped build info file fails there and not on a user's machine.

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
