# CLAUDE.md - `@bitbybit-dev/mcp`

The MCP server that documents the API for coding agents. Like `cad-cloud-sdk`, it is a Node
package outside the browser bundle conventions of `packages/dev/CLAUDE.md`:

- Vitest (`npm test`, `npm run test:coverage`), NodeNext at ES2022, published from its own root
  through the `files` allowlist, with a `prepublishOnly` build
- a `bin` (`bitbybit-mcp`, `dist/stdio.js`) beside the library exports (`.`, `./server`,
  `./index-loader`, `./installed-version`, `./json-schema`, `./package.json`)
- it depends on none of the other `@bitbybit-dev` packages; its runtime dependencies are exactly
  `@modelcontextprotocol/server` and `zod`, and `src/dependencies.test.ts` holds it there

## Shape

- `src/registry.ts` describes a tool once, independent of any transport (`ToolDefinition`,
  `Registry`, `toHttp`). `src/server.ts` binds a registry to the MCP SDK: `createMcpServer` for
  a connection that lives (stdio), `createRequestHandler` for stateless HTTP, one handler built
  once whose `fetch(request, context)` serves each request with the context that request carries.
  `src/stdio.ts` is the executable. Nothing else imports the SDK, and the dependency test asserts it.
- `src/json-schema.ts` is the one inliner of local `$ref` pointers in the JSON schema zod renders,
  used for every advertised tool schema and exported for anyone who renders the same convention.
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

## What the code does not say

The source carries no comments, JSDoc included: `bitbybit/no-loose-comments` runs here with
`allowJsDoc: false`, because nothing reads a comment in this package. A name, an extracted function
or a line here is where an explanation goes.

- The index is addressed by exact version only, never by `latest`: `index-url.ts` refuses
  anything that is not a release version, and `IndexNotPublishedError` names the newest version
  known to have an index when the caller knows it. A published index is immutable, so a cached copy
  is never revalidated. The cache directory is `$XDG_CACHE_HOME/bitbybit-mcp` or
  `~/.cache/bitbybit-mcp` (an empty variable counts as unset); a failed cache write is ignored,
  because the cache is a convenience and a read-only home directory must not stop the server.
- `stdio.ts` picks the version to serve in this order: `--version`, `BITBYBIT_VERSION`, the
  `@bitbybit-dev/*` packages installed around the working directory (`installed-version.ts` lists
  them most authoritative first; disagreeing versions are reported and the first wins), then this
  package's own version. When the detected version has no published index, the package's own
  version is served with a note on stderr; an explicit flag or variable is never second-guessed.
- `registry.ts` caps a server at eight tools (`TOOL_CEILING`): past that, agents pick the wrong tool
  more often than the right one. Its `inputJsonSchema` inlines every local `$ref` of the schema zod
  renders (`json-schema.ts`), because the hosts that read a tool's arguments (the Claude API among
  them) want the object at every position; a cyclic reference stays in place with the table it
  needs. The schema is rendered for input, so a field with a default is optional. `toHttp` serves only tools with a
  handler, and arguments that fail the schema come back as an error result, never as a throw.
- `index-reader.ts` answers an unknown path with the members it most plausibly meant, in this
  order: a case difference, siblings under the same parent a few edits away, members sharing the
  last segment anywhere (closest whole path first), then a lexical match.
- `render.ts` writes a member as the facts first, the prose after, the examples last; the one-line
  form is what a list shows.
- `search` and `fetch` are the shapes ChatGPT's connectors require: results of id, title and url;
  one document with id, title, text, url and metadata.
- `guides-split.ts` splits the guide page into its `##` and `###` sections; a `##` body runs to
  the next `##` and so contains its subsections, the frontmatter and anything before the first
  heading are dropped, and a heading becomes its id as lower-case words joined by dashes.
  `get-guide.ts` maps the short names agents reach for onto those ids.

## Tests

Unit tests run against `src/__fixtures__/index.sample.json`, a small index at version `9.9.9`, so
they need no network. `src/network.test.ts` fetches the real index for this package's version and
runs only when `BITBYBIT_MCP_NETWORK=1` (the nightly workflow sets it); it skips itself while the
version's index is not yet published.
