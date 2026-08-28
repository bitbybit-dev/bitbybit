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
base -> occt -> jscad -> manifold -> occt-worker -> jscad-worker -> manifold-worker -> core -> babylonjs
```

`ci-packages` and the per-package `ci-*` scripts do the same for CI. Note this ordering is
maintained by hand and is **not identical** to the publish order in `README.md`; when you change
one, check the other.

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
