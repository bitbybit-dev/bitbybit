# CLAUDE.md - `@bitbybit-dev/create-app`

The scaffolder behind `npm init @bitbybit-dev/app my-project`. **It is a CLI, not a library**, and
so departs from `packages/dev/CLAUDE.md` in several ways:

- it exposes `bin` entries (`create-bitbybit-app` and `@bitbybit-dev/create-app`)
- it depends on none of the other `@bitbybit-dev` packages - it writes templates that reference them
- its dependencies are CLI ergonomics: `commander`, `inquirer`, `chalk`, `ora`, `gradient-string`,
  `fs-extra`
- its tests (`npm test`, Vitest) run the built CLI as a child process and check the tree it writes;
  `src/scaffold.test.ts` unit-tests the helpers in `src/scaffold.ts` directly

`npm run dev` runs it locally; `prepublishOnly` builds before publish. `src/index.ts` is the CLI
(prompts, flags, the per-kind project writers); `src/scaffold.ts` is every step that is the same for
all of them.

Because it scaffolds projects that then install the published packages, its templates pin versions
that must exist on npm. Bumping the packages without updating the templates produces a scaffold that
fails on first install. `npm run smoke` (scripts/smoke.mjs) scaffolds every template into a
temporary directory, installs each from the registry and runs each project's own `npm run smoke`;
examples.yml runs it weekly and on every published version. `npm run smoke:local` (scripts/smoke-local.mjs)
does the same and then replaces every installed `@bitbybit-dev` package with a copy of the workspace's
built dist, so a breaking change in `packages/dev/*` fails before publish instead of on a user's
machine; a copy rather than a link, so nothing resolves through this repository's node_modules.
Both lanes take `--keep`, which scaffolds into `.local/` inside this package (ignored by git,
npm and the linter) and leaves every project installed there to be started by hand, and `--dir`
for any other place. `verify.yml` runs build and test only, with no installs.

## Three kinds of project

`templates/vite/<engine>/typescript` are the frontend starters, `templates/cloud/{frontend,backends/*}`
the CAD Cloud projects assembled from two halves, and `templates/apps/<id>` the complete app
templates, each self-contained: its own manifest, source, smoke runner, README and
`AGENTS.section.md`. The catalogue is the `APP_TEMPLATES` table in `src/index.ts` (name,
description, whether it needs CAD Cloud), and a test holds the table equal to the directories. An
app template that needs a secret ships `_dot-env.example` beside the code that reads it, and the
scaffold gets an `.env` copied from every `.env.example` it contains. A template that spans a
frontend and a backend is one npm workspace (`sheet-metal-unfold`), so `npm install` and
`npm run smoke` at its root cover both.

## Template contracts

**Every scaffold gets the agent layer.** `templates/_agent/` holds `AGENTS.md`, `CLAUDE.md` (one
line, `@AGENTS.md`) and the MCP configuration for Claude Code, Cursor and VS Code, all pointing at
the Bitbybit CAD MCP. `applyAgentLayer` copies it into the target after the template, appends the
template's own `AGENTS.section.md` to `AGENTS.md` and removes that file, restores the dotfiles, then
renders the placeholders. The cloud templates share one section (`templates/cloud/AGENTS.section.md`)
because a cloud project is assembled from a frontend and a backend template. `AGENTS.md` is written
for the agent, not the user: what the project is, the lookup-first rule, where geometry runs, the
smoke loop, and what never to do.

**Every project has a smoke, and the smoke is what an agent iterates against.** A Vite template keeps
its geometry in a model module (`templates/vite/threejs/typescript/src/model.ts` and its two twins:
`buildModel(occt, params)`, every kernel call awaited) and its smoke runner
(`templates/vite/threejs/typescript/scripts/smoke.ts`) runs it on the in-process `@bitbybit-dev/occt`
kernel through `tsx`, then prints
one JSON line and exits 1 on an invalid or empty solid. That is why every Vite template pins
`@bitbybit-dev/occt` as a dev dependency beside its engine package, and why both rows count two
version sites. A cloud template's smoke is `tsc --noEmit` in `frontend/` and `backend/`: the code
still matches the pinned SDK and types, without a key and without a network. `tsx` rather than plain
Node because the published packages' entry points import without file extensions.

**Template code carries no comments.** Every `.ts`, `.tsx` and `.cs` under `templates/` is comment-free
(the `/// <reference` directive in `vite-env.d.ts` is the one exception): what the code cannot say
goes in the template's `AGENTS.section.md`, which the agent reads, or its README, which the user
reads, and a constant whose value needs explaining is derived from named ones instead
(`POLL_TIMEOUT_MS / POLL_INTERVAL_MS`, not `120 // 4 minutes`). A comment in a template is a sign
that a name or an AGENTS sentence is missing.

**Every template is strict and linted, and the smoke runs both first.** Each TypeScript project ships a
self-contained `tsconfig.json` carrying the whole strict set the CAD packages and the host units share
(`strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitReturns`,
`noImplicitOverride`, `noPropertyAccessFromIndexSignature`, `noFallthroughCasesInSwitch`, unused locals
and parameters, `useUnknownInCatchVariables`, `isolatedModules`, `verbatimModuleSyntax`,
`erasableSyntaxOnly`, `noUncheckedSideEffectImports`; `scripts/` is in the program, so the smoke
runners are typechecked too, which is how a drone assertion reading a renamed constant was found) and
an `eslint.config.js` that is byte-identical across every template but the React one, which adds the
hooks and refresh rules: the type-aware strict and stylistic typescript-eslint sets, the house style,
explicit return types, no `any`, no non-null assertion, no double assertion (a `no-restricted-syntax`
selector, because this repository's local rule cannot ship in a scaffold), no comments
(`eslint-plugin-no-comments`), a 600-line cap, all at error, no suppression file, `--max-warnings 0`.
The one rule of those sets that is off is `non-nullable-type-assertion-style`: its only suggestion is
the `!` the config bans. `smoke` runs `typecheck` and `lint` before the geometry, so an agent iterating
on the smoke cannot leave a type error for `build` to find. `src/index.test.ts` holds every project to
the flags, the three scripts and the shared config text, and holds `typescript` in every template and in
this package equal to the pin in the repository's root `package.json`; the lint stack is pinned at the
root's versions the same way. A smoke types the in-process `OCCTService` as the worker-facing `Occt`
through one `inProcess(service: object): Occt` cast and awaits every call, so `buildModel` runs as the
browser runs it; the two loaders that exist only in-process are called on the service and cross back
through `asShape`. A Node project that emits keeps its emit settings in `tsconfig.build.json` and its
full view in `tsconfig.json`. The CLI template stays on `bundler` resolution: under `NodeNext` the occt
package's typings re-export without file extensions and resolve to nothing. The .NET backend builds
with warnings as errors, the `latest-recommended` analysis level and code style enforced in the build.

**Every scaffold is branded.** Each template that serves a page ships bitbybit.dev's `favicon.ico`
and `logo.png` in its `public/`, linked from `index.html` and shown in the panel header and the
credit link; the file-list tests expect both. They are the user's to replace.

**Dotfiles are staged as `_dot-<name>`.** npm drops `.gitignore` and `.npmrc` from every tarball and
promises nothing about other dotfiles, and this package's own `.gitignore` ignores `.vscode/`, so a
template carries every dotfile and dot-directory as `_dot-gitignore`, `_dot-env.example` or
`templates/_agent/_dot-vscode/mcp.json`, and `restoreTemplateDotfiles` renames them, recursively, after the copy. A
test walks `templates/` and fails on any real dotfile there. A cloud backend's restore runs right
after its copy, before the probes below look for `.env.example`.

**Placeholders are `{{UPPER_SNAKE}}` and none may survive.** `renderPlaceholders` replaces
`{{PROJECT_NAME}}`, `{{TEMPLATE_ID}}`, `{{CLI_VERSION}}` (and the cloud section's `{{BACKEND_NAME}}`,
`{{SECRET_FILE}}`, `{{BACKEND_START}}`, `{{BACKEND_SMOKE}}`) in every text file of the scaffold and
fails the scaffold when one is left, naming the file. Lower-case or spaced braces (a JSX style object)
are not placeholders. `CLI_VERSION` is a stamped constant in `src/index.ts`; the version registry
rewrites it on every release, so `AGENTS.md` carries the version without a registry row of its own.

**Backend patching is driven by file probes, not by the backend id.** After copying a template it
decides what to patch by testing for files: `package.json` exists only for the Node and Hono templates
(dotnet is a `.csproj` project), `wrangler.jsonc` only for the Cloudflare Workers templates,
`.env.example` only for the Node ones. Secrets land in each runtime's own convention - `.dev.vars` for
Hono, `.env` for Node, `appsettings.Development.json` for ASP.NET Core. A new template shipping one of
those files silently gains the corresponding step, and one omitting a file it needs silently misses it.

**Only the 64-bit multi-threaded OCCT build needs `SharedArrayBuffer`**, which browsers gate behind
cross-origin isolation, so that branch alone writes a `vite.config.ts` setting
`Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: credentialless` on the dev
and preview servers. The weaker COEP value is deliberate: `require-corp` would also block cross-origin
CDN resources.

**Patching the generated project is an assertion, not a best effort.** The chosen OCCT architecture is
written into `src/main.ts` by a regular-expression replace whose pattern assumes `enableManifold: true,`
is the last property of the options object. A replace that matches nothing returns its input unchanged
and reports no error, so the CLI would finish successfully having produced a project with a kernel the
user did not choose. It therefore fails when the replace changes nothing, or when the file it expects
is absent. A test additionally reads the pattern out of the CLI's own source and checks every shipped
template against it: the test covers the templates here, the runtime check covers any template.

The engine and backend accent colours are the upstream projects' brand colours, so a pass to tidy the
palette for contrast would break the association on purpose.
