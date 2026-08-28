# CLAUDE.md - `@bitbybit-dev/cad-cloud-sdk`

The typed client for the CAD Cloud API. **This package is the exception to almost every convention
in `packages/dev/CLAUDE.md`:**

- it uses **Vitest**, not Jest (`npm test`, `npm run test:watch`, `npm run coverage`)
- it has its own `typecheck` and `clean` scripts, and a `prepublishOnly`
- its `main` points at `./dist/index.js` rather than a top-level `index.js`
- it does not depend on any other `@bitbybit-dev` package - it is a DAG leaf
- its only runtime dependency is `@cfworker/json-schema`

**Part of `src/types/` is generated, not hand-written.** It is produced by the API-3D platform:
`npm run generate:sdk-types` in `projects/api-3d/shared` reads
`projects/api-3d/docs/static/openapi.json` and writes into this package. The Zod schemas in that
project are the source of truth. Editing the generated types here is always wrong; change the schema
and regenerate.

That generation crosses a repository boundary in the unusual direction - a closed-source project
writing into this open-source one - so the resulting diff is reviewed and committed here.
