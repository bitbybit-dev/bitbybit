# CLAUDE.md - `@bitbybit-dev/cad-cloud-sdk`

The typed client for the CAD Cloud API. **This package is the exception to almost every convention
in `packages/dev/CLAUDE.md`:**

- it uses **Vitest**, not Jest (`npm test`, `npm run test:watch`, `npm run coverage`)
- it has its own `typecheck` and `clean` scripts, and a `prepublishOnly`
- its `main` points at `./dist/index.js` rather than a top-level `index.js`
- it does not depend on any other `@bitbybit-dev` package - it is a DAG leaf
- its only runtime dependency is `@cfworker/json-schema`

**Part of `src/types/` is generated, not hand-written.** The CAD Cloud API's schema generator
derives it from the API's OpenAPI document and writes into this package; the schemas there are the
source of truth. Editing the generated types here is always wrong; change the schema and
regenerate.

That generation crosses a repository boundary in the unusual direction - a closed-source project
writing into this open-source one - so the resulting diff is reviewed and committed here.

## Validation

**Validators are built from a wrapping root schema.** A per-schema validator is not constructed from
the `$def` directly. A root of `{$schema, $ref: "#/$defs/<name>", $defs: <the whole bundle>}` is built,
so the target and every internal `$ref` resolve inside one document. Every validator therefore carries
the full `$defs` map - trimming it to "just the one needed" breaks any schema that references another -
and the validator is built with short-circuiting off, so it collects all errors rather than the first.

**Validation fails open on an unknown schema.** `validateRequestBody` returns without checking when no
schema matches a name, because the API can gain a model, and so a schema key, before this SDK is
regenerated and republished. The server validates regardless, so skipping locally is safe. Turning that
early return into a throw breaks every caller using a model newer than their installed SDK.

**Model submission uses a two-tier key.** `POST /api/v1/models/{slug}` maps to `models.submit.<slug>`
when the bundle has one and falls back to the generic `models.submit`; the batch endpoint always maps to
`models.batchSubmit`. Slugs match `/^[a-z][a-z0-9-]*$/`. The per-model keys are what give
model-specific parameter validation, so flattening the lookup silently stops validating those
parameters without failing any test that only exercises unknown models.

Only `src/types/custom.ts` is hand-written, holding what OpenAPI cannot express: generics, `extends`,
aliases and unions. If the spec can express it, it comes from the spec.

