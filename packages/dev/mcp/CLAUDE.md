# CLAUDE.md - `@bitbybit-dev/mcp`

The MCP server that documents the API for coding agents. Like `cad-cloud-sdk`, it is a Node
package outside the browser bundle conventions of `packages/dev/CLAUDE.md`:

- Vitest (`npm test`, `npm run test:coverage`), NodeNext at ES2022, published from its own root
  through the `files` allowlist, with a `prepublishOnly` build
- a `bin` (`bitbybit-mcp`, `dist/stdio.js`) beside the library exports (`.`, `./server`,
  `./index-loader`, `./installed-version`, `./package.json`)
- it depends on none of the other `@bitbybit-dev` packages; its runtime dependencies are exactly
  `@modelcontextprotocol/server` and `zod`, and `src/dependencies.test.ts` holds it there

## Shape

- `src/registry.ts` describes a tool once, independent of any transport (`ToolDefinition`,
  `Registry`, `toHttp`). `src/server.ts` binds a registry to the MCP SDK; `src/stdio.ts` is the
  executable. Nothing else imports the SDK, and the dependency test asserts it.
- The seven tools live in `src/tools/`; every title and description is in `src/descriptions.ts`,
  because a description is what a model reads to choose a tool, so a change there changes
  behaviour and is made deliberately.
- Answers come from the API index (`src/index-types.ts` is its shape; `src/index-url.ts` addresses
  one version of it; `src/index-loader.ts` fetches and caches it on a file system). The package
  root (`src/index.ts`) imports no Node built-in, so a bundler can take it into an edge runtime;
  only `index-loader.ts`, `installed-version.ts` and `stdio.ts` may, and the dependency test holds
  that line. `src/index-reader.ts` is the lookup, search and
  nearest-path logic; `src/render.ts` turns a record into the markdown a model reads.
- `src/guides.generated.ts` is generated from `docs/learn/using-ai-with-bitbybit/agentic-cad.md`
  by `npm run sync:guides`; `npm run check:guides` and `src/guides.test.ts` fail when the page and
  the file disagree. Edit the page, then regenerate.

## Tests

Unit tests run against `src/__fixtures__/index.sample.json`, a small index at version `9.9.9`, so
they need no network. `src/network.test.ts` fetches the real index for this package's version and
runs only when `BITBYBIT_MCP_NETWORK=1` (the nightly workflow sets it); it skips itself while the
version's index is not yet published.
