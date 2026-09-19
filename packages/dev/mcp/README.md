# @bitbybit-dev/mcp: the Bitbybit CAD MCP server

An [MCP](https://modelcontextprotocol.io) server that documents the [Bitbybit](https://bitbybit.dev) 3D CAD API for AI coding agents: every function, its parameters, defaults, return type and examples, for the exact version your project uses. An agent with this server looks the API up instead of guessing it.

It answers from the API index Bitbybit publishes with every release (`https://git-cdn.bitbybit.dev/v<version>/ai-context/index.json`), never from memory, and never from a moving "latest".

## Connect it

**Claude Code**

```bash
claude mcp add --transport stdio bitbybit -- npx -y @bitbybit-dev/mcp
```

or, for a project, in `.mcp.json`:

```json
{ "mcpServers": { "bitbybit": { "command": "npx", "args": ["-y", "@bitbybit-dev/mcp"] } } }
```

**Cursor** (`.cursor/mcp.json`)

```json
{ "mcpServers": { "bitbybit": { "command": "npx", "args": ["-y", "@bitbybit-dev/mcp"] } } }
```

**VS Code** (`.vscode/mcp.json`)

```json
{ "servers": { "bitbybit": { "type": "stdio", "command": "npx", "args": ["-y", "@bitbybit-dev/mcp"] } } }
```

A hosted copy of the same server runs at `https://mcp.bitbybit.dev/mcp` (Streamable HTTP) for hosts that prefer a remote.

## Which version it serves

The server documents one exact version of the API. It picks it in this order:

1. `--version <version>` on the command line;
2. `BITBYBIT_VERSION=<version>` in the environment;
3. the version of the `@bitbybit-dev` packages installed around the working directory (`core`, then the renderer packages, then `occt`); packages that disagree are reported on stderr and the first wins;
4. its own version, which is the newest API version it was released with.

Indexes are cached in `$XDG_CACHE_HOME/bitbybit-mcp` (or `~/.cache/bitbybit-mcp`); `--no-cache` skips the cache. Everything the program prints goes to stderr; stdout is the protocol.

## Tools

| Tool | What it answers |
|---|---|
| `search_api` | members by keywords, with path, summary, tier and engines |
| `describe` | the full contract of one member by dotted path; an unknown path is reported with the nearest existing ones |
| `list_namespace` | the members one level below a namespace |
| `get_examples` | code examples for a member, a namespace or a topic |
| `get_guide` | sections of the public guide on where geometry should run |
| `search`, `fetch` | the same lookups in the shape ChatGPT connectors require |

Every tool is read-only. Tiers in the answers: `oss` (in the npm packages, MIT), `platform-pro` (only when scripting inside bitbybit.dev), `cloud-pro` (only on [CAD Cloud](https://bitbybit.dev/cad-cloud), with an API key).

## As a library

The package exports the tool registry and the index reader, so another server can serve the same tools:

```ts
import { createDocsRegistry, contextForIndex, GUIDES, GUIDE_PAGE_URL } from "@bitbybit-dev/mcp";
import { loadIndex } from "@bitbybit-dev/mcp/index-loader";
import { createMcpServer } from "@bitbybit-dev/mcp/server";

const version = "<a released version>";
const index = await loadIndex({ version });
const context = contextForIndex(index, GUIDES, GUIDE_PAGE_URL);
const server = createMcpServer(createDocsRegistry(), context, { name: "bitbybit", version });
```

`toHttp(registry, context)` renders the same tools for a plain HTTP endpoint. The package root imports no Node built-in, so a bundler can take it into an edge runtime; the loader and the version detector, which read the file system, are the separate `index-loader` and `installed-version` entries.

## Privacy

The stdio server sends nothing anywhere except one request to the CDN for the index of the version it serves.

## License

MIT
