# The SDK and the scaffolder

Two packages that depend on none of the others and ship to different audiences.

## cad-cloud-sdk

A typed client for the CAD Cloud API. Most of its type surface is generated from that API's own
OpenAPI document and operation catalog, by generators that live in the API's repository and write
across the boundary into this one; see the generated-code table in `../ARCHITECTURE.md`.

**Validators are built from a wrapping root schema.** A per-schema validator is not constructed from
the `$def` directly: a root schema of only `{$schema, $ref: "#/$defs/<name>", $defs: <the whole bundle>}`
is built, so the target definition and every internal `$ref` it points at resolve inside one document.
The whole `$defs` map must therefore be carried on every validator - trimming it to "just the one
needed" breaks cross-referencing schemas - and the validator is constructed with short-circuiting off
so that all errors are collected rather than only the first.

**Validation fails open on an unknown schema.** `validateRequestBody` returns without validating when
no schema is found for a name, because the API can gain a new model, and therefore a new per-model
schema key, before this SDK's schemas are regenerated and republished. The server validates
regardless, so a silent client-side skip is safe. Turning that early return into a throw breaks every
caller using a model newer than their installed SDK.

**Model submission uses a two-tier schema key.** `POST /api/v1/models/{slug}` maps to a per-model key
`models.submit.<slug>` when the bundle has one and falls back to the generic `models.submit` when it
does not; the batch endpoint always maps to `models.batchSubmit`. Slugs are constrained to
`/^[a-z][a-z0-9-]*$/`. The per-model keys are the mechanism giving model-specific parameter
validation, so flattening the lookup to the generic key would silently stop validating those
parameters without failing any test that only exercises unknown models.

Only `src/types/custom.ts` is hand-written, and it holds exactly what OpenAPI cannot express:
generics, `extends`, aliases and unions (`ApiSuccess<T>`, `ApiError`, `ApiResponse<T>`,
`ModelSubmission<TParams>`, `BatchModelSubmission<TParams>`, `CompoundTaskDetail`). That is the rule
for where a new type goes: if the spec can express it, it comes from the spec.

## create-app

The scaffolder that generates a starter project.

**Backend patching is driven by file probes, not by the backend id.** After copying a cloud backend
template it decides what to patch by testing for files: `package.json` exists only for the Node and
Hono templates (the dotnet template is a `.csproj` project), `wrangler.jsonc` only for the
Hono/Cloudflare Workers templates, and `.env.example` only for the Node templates. Secrets land in each
runtime's own convention - `.dev.vars` for Hono, `.env` for Node,
`appsettings.Development.json` for ASP.NET Core. A new template that ships one of those files, or
omits one it needs, silently gains or misses the corresponding step, and nothing in the code names the
backend it was written for.

**Only the 64-bit multi-threaded OCCT build needs `SharedArrayBuffer`**, which browsers gate behind
cross-origin isolation, so that branch alone emits a `vite.config.ts` setting
`Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: credentialless` on both
the dev and preview servers. The weaker COEP value is deliberate: `require-corp` would look stricter
and would stop cross-origin CDN resources loading.

The engine and backend accent colours are the upstream projects' brand colours rather than arbitrary
picks, so a pass to tidy the palette for contrast would break the association on purpose.

**The engine templates and this package are coupled by a regex.** The chosen OCCT architecture is
patched into the generated project by rewriting `src/main.ts`, and the pattern assumes
`enableManifold: true,` is the last property of the options object literal. A template that reorders
that object, or renames the property, makes the replace find nothing and return the text unchanged -
so the CLI would report success while handing the user a 32-bit kernel they did not ask for. The
tests read that pattern out of the CLI's own source and assert every engine template still matches it,
which is what turns the coupling into a failing test rather than a wrong kernel.
