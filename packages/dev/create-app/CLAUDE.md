# CLAUDE.md - `@bitbybit-dev/create-app`

The scaffolder behind `npx @bitbybit-dev/create-app my-project`. **It is a CLI, not a library**, and
so departs from `packages/dev/CLAUDE.md` in several ways:

- it exposes `bin` entries (`create-bitbybit-app` and `@bitbybit-dev/create-app`)
- it has **no test script**
- it depends on none of the other `@bitbybit-dev` packages - it writes templates that reference them
- its dependencies are CLI ergonomics: `commander`, `inquirer`, `chalk`, `ora`, `gradient-string`,
  `fs-extra`

`npm run dev` runs it locally; `prepublishOnly` builds before publish.

Because it scaffolds projects that then install the published packages, its templates pin versions
that must exist on npm. Bumping the packages without updating the templates produces a scaffold that
fails on first install. `npm run smoke` (scripts/smoke.mjs) scaffolds every template into a
temporary directory and installs each from the registry; examples.yml runs it weekly and on every
published version.

## Template contracts

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

