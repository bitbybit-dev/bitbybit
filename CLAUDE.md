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

Every CAD package builds and typechecks under the whole strict set, and the flags live in one place:
`tsconfig.base.cad.json`, which every package's `tsconfig.json` (the editor and test view) and
`tsconfig.bitbybit.json` (the build) extends. Each package also has a generated `tsconfig.strict.json`,
the typecheck-only view: the build config with nothing emitted, and with the build's references, because
references are not inherited through `extends` and a view without them once followed a sibling's
declarations into another package's source; `npm run typecheck:strict` runs it and must print nothing.
`npm run check:strict-baselines` at the root, which CI runs, holds the line: no package has a
`.tsc-baseline.json` any more, so any strict error anywhere fails it. The ratchet that got here - a
typecheck-only overlay of the strict flags, per-package baselines recorded by tsc-baseline with
`--ignoreMessages` and shrunk with a save script, a flag moving into the shared base once it reached zero
everywhere - is finished; the last move put the whole set into the base with a zero-change proof
(`tsc --showConfig` compared before and after for every config). Test support under `__mocks__` is
excluded from the build configs: jest compiles it itself, so dist ships no mocks.
`packages/dev/CLAUDE.md` records the shape each kind of DTO property takes.

## Continuous integration

`.github/workflows/verify.yml` proves the repository builds and tests from a bare clone with nothing
above it, on every push to `develop` and every pull request into `develop` or `master`: one frozen
install, `lint`, `check:references`, `rebuild-all-packages`, `npm test`, `check:strict-baselines`,
the SDK's typecheck, tests with coverage and build, the scaffolder's build, `api:check`,
`check:tarballs`, and last - on a red run too - `test:report`, which puts every suite's results on
the run's summary page. It needs no secrets and must never gain any. `nightly.yml` runs the build
and tests on every Node line the packages should keep working on, on a schedule and by hand; Node
comes from `.tool-versions` and pnpm from the `packageManager` field. Neither publishes.

`publish.yml` does, by hand-dispatch only, through npm trusted publishing: the job's OIDC token is
exchanged for a short-lived publish token per package, so no npm token is stored anywhere and every
version carries a provenance attestation naming this repository - which is why every manifest's
`repository` field is exactly `git+https://github.com/bitbybit-dev/bitbybit.git` with the package's
`directory` (`scripts/dist-manifest.mjs` refuses anything else). `scripts/publish-packages.mjs`
(`npm run publish:packages`) derives the tiers from the manifests, skips versions the registry has
(a failed run is re-run, never repaired by hand) and waits for the registry to resolve a tier before
its dependents publish. The default dispatch publishes under the `next` dist-tag as a rehearsal; a
second dispatch with `latest` releases. Each package needs a trusted publisher configured on
npmjs.com for this repository and `publish.yml`.

The OCCT kernels the `occt` package ships are not tracked: `packages/dev/occt/kernels.json` names
the three content-hashed wasm files with their SHA-256 and the url each is published at, and
`npm run kernels:fetch` (run by both workflows after the install, and by the package's `build-p`)
downloads what is missing and verifies what is present. A kernel rebuild writes the manifest; a
kernel on disk that disagrees with it is an error, never overwritten.

Two of those checks carry committed state. `api:check` runs api-extractor in `base` and `core`
against their built `dist/index.d.ts` and fails when the public surface differs from the report in
each package's `etc/`: the dotted API is persisted in users' saved scripts, so a change to it lands
only with a deliberate `npm run api:update` and the report diff in the same commit. `check:tarballs`
packs every built dist and installs all the tarballs together into an empty project, then compiles a
probe that imports each package as a consumer would, so a sibling only the workspace could resolve, a
dependency a manifest forgot, or a shipped build info file fails there and not on a user's machine.

## The generated worker layer

The API classes of the three worker packages (`occt-worker/lib/api/occt/**`, `jscad-worker/lib/api/*.ts`
except the barrel and the init class, `manifold-worker/lib/api/**` likewise) are generated from the
kernel by `scripts/gen-worker-api.mjs`: the class tree, the member order, the docs and the signatures
come from the kernel classes, kernel object types become the worker's pointer types, and every body
is one call that sends the method's dotted path to the worker thread. `npm run gen:worker-api`
rewrites them; `npm run check:worker-api`, the second step of `npm test`, fails when what the kernel
generates differs from what is committed. Never edit a generated file - change the kernel, or the
hand-written part: what cannot be generated (browser downloads, File/Blob preparation, a result the
main thread re-hydrates, the worker's own reserved commands) lives in `lib/api-hand/<same path>.ts` as
a class of the same name whose members carry a marker line saying where they land (`// replaces
<path>`, `// after <path>`, `// first`, `// last`); the generator merges them in. Where the worker
deliberately declares a type other than the mechanical mapping, `scripts/worker-api.overrides.json`
holds the type and the reason; kernel methods the worker does not expose are the `kernelOnly` entries
of `scripts/worker-parity.allow.json`, one list for the generator and the parity check.

The OCCT inputs namespace is assembled the same way. `occt/lib/api/inputs/occ-inputs.ts` - one
`export namespace OCCT` of some 300 DTOs, which has to stay a single compilation unit because
TypeScript does not merge a namespace across modules and the declarations bundle and the component
generator both read it as one - is generated by `scripts/gen-occ-inputs.mjs` from the fragments in
`occ-inputs`'s sibling directory `occt/`: each fragment is a slice of the namespace body, an ordinary
module with imports, and they are written back in file-name order. Edit a fragment, run
`npm run gen:occ-inputs`; `check:occ-inputs` in `npm test` fails on a stale assembled file.

`npm test` at the root runs every package suite, after `check:occ-inputs`, `check:worker-api` and `npm run check:worker-parity`:
each worker package mirrors its kernel by dotted path, and `scripts/worker-parity.mjs` fails when a
worker sends a path the kernel lacks, when a kernel method has no mirror outside the allow-list, when
signatures disagree, when the JSDoc on a mirrored method or class reads differently on the two sides,
or when the worker's path set differs from the committed snapshot (those paths are persisted in users'
saved scripts). A deliberate surface change is accepted with `--update`; a doc change is made on the
kernel and regenerated into the worker (see `packages/dev/CLAUDE.md`).

Every runner writes its results as JSON into a `test-results/` folder next to the code it tested
(`test-c` in the jest packages, the SDK's vitest config), and coverage leaves
`coverage/coverage-summary.json` beside it. `npm run test:report` (`scripts/test-report.mjs`)
collects them into one markdown report - files, tests, failures with their messages, skipped tests,
the slowest files, coverage - printed to the terminal and, on GitHub Actions, written to the job
summary. Every package with a `test` or `test-c` script must have left results; one that did not
is listed and fails the step, so a suite that silently stopped running is noticed. Locally the report
shows whatever the last runs wrote.

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
- Every package's `tsconfig.json` and `tsconfig.bitbybit.json` extends `tsconfig.base.cad.json`
  at the repository root and keeps only what differs: outDir, paths into sibling dists, exclusions.
  Change a compiler flag for every package in the base; change it for one package in its leaf, and
  say so there, because a base cannot be un-set by omission.
