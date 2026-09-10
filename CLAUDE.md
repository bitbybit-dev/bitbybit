# CLAUDE.md - the bitbybit open-source monorepo

MIT-licensed, and the source of truth for the CAD algorithms and the published `@bitbybit-dev/*` npm
packages. It is consumed as a git submodule elsewhere, but it stands alone: everything here builds and
tests without it. Start with `README.md` for the overview, `CONTRIBUTING.md` before opening a PR.

## Layout

| Directory | What it is |
|---|---|
| `packages/dev/*` | the 13 published npm packages - see `packages/dev/CLAUDE.md` |
| `docs/` | the Docusaurus site for learn.bitbybit.dev, including the generated API reference |
| `examples/` | runnable examples per framework (angular, nextjs, nuxt, node, vite, react); `examples/scripts/examples.mjs` installs, builds and audits each one weekly from the registry, in examples.yml, and `examples/scripts/local.mjs` runs them against this repository's own packages instead |
| `languages/` | i18n source JSON for the platform |

## Building the packages

The packages form a dependency DAG, and the order has one source: each package's `package.json`
dependencies. `scripts/gen-ts-references.mjs` turns them into TypeScript project references -
every `tsconfig.bitbybit.json` is a composite project that references the siblings its manifest
declares, and `tsconfig.build.json` at the root references all eleven - so `tsc -b` orders the
compiles itself and rebuilds only what changed. `npm run build-packages` is `pnpm -r run build-p`: pnpm orders the eleven stagings by the same
manifests, each `build-p` compiles with `tsc -b` and stages dist/ for publishing.
`npm run rebuild-all-packages` empties every dist first; `tsc -b tsconfig.build.json --verbose`
prints the order it derives and what it considered up to date.

All three of a package's TypeScript configs are generated: the build config, the strict view, and the
`tsconfig.json` an editor and a lint run pick up - the build config's base and sibling paths without
its emit settings or exclusions, so the tests and mocks are in the project there. After changing a
dependency between packages, run `npm run gen:references` and commit the result; `check:references`,
the first step of `npm test`, fails when any of the three is out of date.
Three things are placed on purpose: the build info sits in each dist/, because `tsc -b` trusts it
over the outputs and it has to vanish with the dist it describes (`copy-package`'s `.npmignore` keeps
it out of the tarball); every build config excludes `dist` and `coverage`, which TypeScript would
otherwise read as inputs; and every config states its `outDir`, which is how TypeScript keeps that
directory out of the project - a stale one reads the built `dist` back in as source, silently.

## The workspace

The thirteen packages under `packages/dev/` are one pnpm workspace (`pnpm-workspace.yaml`): one
`pnpm install` at the root - `npm run ci-packages` is exactly that, frozen to the lockfile - installs
all of them, and a sibling dependency whose exact pin matches the sibling's version becomes a symlink
instead of a registry copy (`linkWorkspacePackages`). One `pnpm-lock.yaml` replaces the per-package
npm locks; `npm run refresh-lockfile` rewrites it without touching node_modules. The manifests keep
exact registry pins on purpose and never the `workspace:` protocol: `dist/` is what npm publishes, and
`copy-package` derives its manifest through `scripts/dist-manifest.mjs`, which refuses a `workspace:`,
`link:` or `file:` specifier. A dependency's install script runs only when `allowBuilds` lists it, so
a new native dependency shows up as a decision, not a silent skip. Node comes from `.tool-versions`
and pnpm from `packageManager`, which pnpm switches to on its own.

Every dist-published manifest also carries an `exports` map derived from its tree by `npm run
gen:exports` (the root, every directory index under `lib/`, every kernel module, then patterns), with
the `@bitbybit-dev/source` condition first in each entry: a consumer that declares the condition
resolves the TypeScript sources - the shared test configuration does, through `resolve.conditions`,
so a suite sees a sibling's edit without a rebuild - and one that does not resolves `dist/`. The map
never reaches npm: `dist-manifest.mjs` drops it with `devDependencies` and `scripts`, and a published
package resolves through `main` and `types` as every version has, because an exports map in a tarball
would refuse the extensionless deep imports the examples make. `npm run check:exports` holds every
manifest to that shape and every built `dist/package.json` to the derivation.

pnpm's layout is strict: a package resolves only what its own manifest declares, where npm's flat
hoisting let it reach anything a sibling had installed. Every import in `lib/` must therefore be a
dependency of that package - the engine packages import `@bitbybit-dev/base`, the three workers,
`jsonpath-plus` and `verb-nurbs-web` directly, and declare them. Verify a build from a clone outside
your home directory: a stray `~/node_modules` above the checkout satisfies an undeclared import on
your machine and nowhere else, which is how one reached CI.

## Lint and the strictness ratchet

`npm run lint` is ESLint 10 from one self-contained `eslint.config.mjs`: the recommended sets, the
type-aware set (it reads the type graph, so it sees an unawaited promise), the house style, and two
local rules in `eslint-rules/`, neither with a fixer - `no-double-assertion` (`x as unknown as T`
widens until nothing is checked; use a type predicate) and `no-loose-comments` (JSDoc and directives
stay, free-form comments do not; what the code cannot say belongs in JSDoc or a `CLAUDE.md`, and in a
test in the name of the `it` - a `*.test.ts` may carry `// Arrange`, `// Act` and `// Assert`, each on
its own, and no other comment at all). Findings that predate a rule sit in `eslint-suppressions.json`;
a new one fails, as does a stale suppression, so the count only falls. Never load
`eslint-plugin-no-comments`: its fixer would delete that JSDoc corpus.

Every package builds and typechecks under the whole strict set, and the flags live in one place:
`tsconfig.base.cad.json`, which every package's `tsconfig.json` (the editor and test view) and
`tsconfig.bitbybit.json` (the build) extends - the SDK and the scaffolder included, which state only
their NodeNext settings on top. `tsconfig.strict.json` is the typecheck-only view: the build config
with nothing emitted, and with the build's references, because references are not inherited through
`extends` and a view without them once followed a sibling's declarations into another package's
source. `npm run typecheck:strict` runs it and must print nothing; `npm run typecheck:tests` does
the same over `tsconfig.json`, which keeps the tests and mocks - nothing else compiles those, the
build configs excluding them and a runner not typechecking what it executes.
`npm run check:strict-baselines`, which CI runs, holds the line: no package has a
`.tsc-baseline.json` any more, so any strict error anywhere fails it, and any tsconfig move is proved
flag-neutral with `tsc --showConfig` before and after. Test support under `__mocks__` is excluded
from the build configs: the runner compiles it itself, so dist ships no mocks.
`packages/dev/CLAUDE.md` records the shape each kind of DTO property takes.

## Continuous integration

**Before you commit, run all four** - `npm test` alone is what leaves CI red after a green local run:

```bash
npm run lint                     # includes the AAA-only comment rule over every *.test.ts
npm run typecheck:tests          # nothing else typechecks a test file
npm test                         # the check:* gates and all eleven suites, with coverage
npm run check:coverage-baseline  # reads what the npm test above it just measured
```

Only `typecheck:tests` compiles a `*.test.ts`, and every column of `coverage-baseline.json` is a floor: code that dilutes one brings its own tests, never a re-recorded floor.

`.github/workflows/verify.yml` proves the repository builds and tests from a bare clone with nothing
above it, on every push to `develop` and every pull request into `develop` or `master`: the four above
plus `check:references`, `check:exports`, `rebuild-all-packages`, `check:strict-baselines`, the SDK's
and the scaffolder's own builds and tests, `check:openapi`, `api:check`, `check:tarballs`, and last -
on a red run too - `test:report`, which puts every suite's results on the summary page. It needs no
secrets and must never gain any. `nightly.yml` runs the build and tests on every Node line the
packages should keep working on. Neither publishes.

`publish.yml` does, by hand-dispatch only, through npm trusted publishing: the job's OIDC token is
exchanged for a short-lived publish token per package, so no npm token is stored anywhere and every
version carries a provenance attestation naming this repository - which is why every manifest's
`repository` field is exactly `git+https://github.com/bitbybit-dev/bitbybit.git` with the package's
`directory` (`scripts/dist-manifest.mjs` refuses anything else). `scripts/publish-packages.mjs`
(`npm run publish:packages`) derives the tiers from the manifests, skips versions the registry has (a
failed run is re-run, never repaired by hand) and waits for a tier to resolve before its dependents
publish. The default dispatch publishes under `next` as a rehearsal; a second with `latest` releases.

The OCCT kernels the `occt` package ships are not tracked: `packages/dev/occt/kernels.json` names the
three content-hashed wasm files with their SHA-256 and the url each is published at, and
`npm run kernels:fetch` (run by both workflows after the install, and by the package's `build-p`)
downloads what is missing and verifies what is present. A kernel on disk that disagrees with the
manifest is an error, never overwritten.

Two of those checks carry committed state. `api:check` runs api-extractor in every package that can
carry a report - all but `occt-worker`, whose `BitbybitOcctModule` comes from emscripten glue it
cannot follow, and which `check:worker-api` and `check:worker-parity` pin harder instead - against its
built `dist/index.d.ts`, and fails when the public surface differs from the report in that package's
`etc/`: the dotted API is persisted in users' saved scripts, so a change lands only with a deliberate
`npm run api:update` and the report diff in the same commit. `check:tarballs` packs all thirteen,
installs the library ones into an empty project and probes each as a consumer would, then reads what
every tarball carries: a credential, an absolute build path, a source map naming excluded sources.

## The generated worker layer

The API classes of the three worker packages (`occt-worker/lib/api/occt/**`, `jscad-worker/lib/api/*.ts`
except the barrel and the init class, `manifold-worker/lib/api/**` likewise) are generated from the
kernel by `scripts/gen-worker-api.mjs`: the class tree, the member order, the docs and the signatures
come from the kernel classes, kernel object types become the worker's pointer types, and every body
is one call that sends the method's dotted path to the worker thread. `npm run gen:worker-api`
rewrites them; `npm run check:worker-api`, the second step of `npm test`, fails when what the kernel
generates differs from what is committed. Never edit a generated file - change the kernel, or the
hand-written part: what cannot be generated (browser downloads, File/Blob preparation, a result the
main thread re-hydrates, the worker's own reserved commands) lives in `lib/api-hand/<same path>.ts`
as a class of the same name whose members carry a marker line saying where they land; the generator
merges them in. Where the worker
deliberately declares a type other than the mechanical mapping, `scripts/worker-api.overrides.json`
holds the type and the reason; kernel methods the worker does not expose are the `kernelOnly` entries
of `scripts/worker-parity.allow.json`, one list for the generator and the parity check.

The four inputs namespaces - `occ-inputs.ts` (some 300 DTOs), `jscad-inputs.ts`,
`manifold-inputs.ts`, `verb-inputs.ts` - are assembled the same way. Each has to stay one compilation
unit, because TypeScript does not merge a namespace across modules and the declarations the visual
editors are generated from read each as a whole, so `scripts/gen-inputs.mjs` writes it from the
fragments beside it, each a slice of the namespace body written as an ordinary module.
`scripts/inputs.config.mjs` names the four and their fragment order - the order of the emitted
declarations - and fails on a fragment nothing names. Edit a fragment and run `npm run gen:inputs`;
`check:inputs` fails on a stale assembled file, which being generated is not linted.

`npm test` at the root runs every package suite, after `check:inputs`, `check:worker-api` and
`check:worker-parity`: each worker package mirrors its kernel by dotted path, and
`scripts/worker-parity.mjs` fails when a worker sends a path the kernel lacks, when a kernel method
has no mirror outside the allow-list, when signatures disagree, when the JSDoc on a mirrored method
or class reads differently on the two sides, or when the worker's path set differs from the committed
snapshot (those paths are persisted in users' saved scripts). A deliberate surface change is accepted
with `--update`; a doc change is made on the kernel and regenerated into the worker.

Every runner writes its results as JSON into `test-results/` next to the code it tested
(`test:coverage` in every package), and coverage leaves `coverage/coverage-summary.json` beside it.
`npm run test:report` (`scripts/test-report.mjs`) collects them into one report - totals, a row per
package, what each moved against the recorded floor, failures, skipped tests, the slowest files -
printed to the terminal and, on Actions, written to the run's summary. That summary is the public
coverage report the docs link to, so write it for someone who did not run it. A package with a
`test` script that left no results is listed and fails the step, so a suite that silently stopped
running is noticed.

## Docs

The Docusaurus site regenerates its API pages from an OpenAPI document, and `llms.txt` is generated
from `docs/static/llms.template.txt` by `docs/scripts/generate-llms.js` on every docs `start` and
`build`. Edit the template, never the output.

## Conventions

- **Vitest** for every package. Each has a `vitest.config.ts` that calls the shared factory in
  `packages/dev/vitest.shared.ts` and states only what differs from it.
- `UNIT_TESTING_GUIDE.md` at the root is the testing standard for this repository.
- Kernel-heavy suites need a raised heap; the package scripts already set
  `NODE_OPTIONS=--max-old-space-size=8192`. Keep that when adding one. They also run a process per file
  (`pool: "forks"`): the kernel holds global state and two suites sharing one corrupt each other.
- Every package's tsconfigs extend `tsconfig.base.cad.json` and keep only what differs: outDir, paths
  into sibling dists, exclusions, and the SDK's and the scaffolder's NodeNext settings. Change a flag
  for every package in the base, for one package in its leaf, and say so there: a base cannot be
  un-set by omission.
