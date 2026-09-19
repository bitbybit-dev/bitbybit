# @bitbybit-dev/mcp: the Bitbybit CAD MCP server

An [MCP](https://modelcontextprotocol.io) server that documents the [Bitbybit](https://bitbybit.dev) 3D CAD API for AI coding agents: every function, its parameters, defaults, return type and examples, for the exact version your project uses. Bitbybit has 1725 functions across three CAD kernels - more than any model holds in memory - so an agent working from memory invents plausible names that do not exist. An agent with this server looks each one up instead, and writes code that compiles the first time.

It answers from the API index Bitbybit publishes with every release (`https://git-cdn.bitbybit.dev/v<version>/ai-context/index.json`), never from memory, and never from a moving "latest".

<img src="https://learn.bitbybit.dev/img/bitbybit-dev-cad-platform.webp" alt="Diagram of the Bitbybit platform showing how a website reaches its geometry: script runners, iframe embeds, the NPM packages, the CAD Cloud REST API and AI agents over MCP">

The diagram shows what an agent is writing code *for*. The MIT-licensed [npm packages](https://learn.bitbybit.dev/learn/npm-packages/intro) run the CAD kernels in your users' browsers or in your own Node process; [script runners](https://learn.bitbybit.dev/learn/runners/intro) load the same engine from one file; the [CAD Cloud REST API](https://learn.bitbybit.dev/api/cloud-api) runs the work on managed servers. This server knows all of them, and every answer carries a tier - `oss`, `platform-pro` or `cloud-pro` - so an agent never sends you to a paid service for something the free packages already do.

## Connect it

The same server runs two ways. Hosted at `https://mcp.bitbybit.dev/mcp` over Streamable HTTP, which needs nothing installed and serves the newest release; or locally over stdio with `npx`, which needs Node 20 and serves the version your project has installed. Start with the remote.

**Claude Code**

```bash
claude mcp add --transport http bitbybit https://mcp.bitbybit.dev/mcp
```

or the local server:

```bash
claude mcp add --transport stdio bitbybit -- npx -y @bitbybit-dev/mcp
```

For a project, commit a `.mcp.json` at its root so every collaborator's Claude Code finds it:

```json
{ "mcpServers": { "bitbybit": { "type": "http", "url": "https://mcp.bitbybit.dev/mcp" } } }
```

**Cursor** (`.cursor/mcp.json`)

```json
{ "mcpServers": { "bitbybit": { "url": "https://mcp.bitbybit.dev/mcp" } } }
```

**VS Code** (`.vscode/mcp.json`) - the `type` is required, or VS Code tries to start the URL as a program:

```json
{ "servers": { "bitbybit": { "type": "http", "url": "https://mcp.bitbybit.dev/mcp" } } }
```

Either form takes the local server instead: `{ "command": "npx", "args": ["-y", "@bitbybit-dev/mcp"] }`, with `"type": "stdio"` in VS Code. claude.ai, ChatGPT and the Claude API connect to the remote as a custom connector - [every configuration is documented here](https://learn.bitbybit.dev/learn/using-ai-with-bitbybit/mcp/bitbybit-mcp).

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

## The companion server

This server answers questions; it never runs geometry. When you want the agent to *produce* geometry - measure a STEP file, run a pipeline, unfold a sheet-metal part, convert to glTF - connect the [Bitbybit CAD Cloud MCP](https://learn.bitbybit.dev/learn/using-ai-with-bitbybit/mcp/cad-cloud-mcp) alongside it, with a [CAD Cloud](https://bitbybit.dev/cad-cloud) API key:

```bash
claude mcp add --transport http bitbybit-cloud https://api.bitbybit.dev/mcp --header "X-API-Key: <your key>"
```

The two are designed to work together: the agent learns a member here and calls it there with the same dotted path and the same argument object.

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

`toHttp(registry, context)` renders the same tools for a plain HTTP endpoint, and `guarded(registry, report)` is the error boundary every server puts around a registry: a handler that throws answers a generic error result and the throw goes to `report`, so no internal message reaches a client. `Registry.map(wrap)` re-wraps every handler for such concerns of your own. The package root imports no Node built-in, so a bundler can take it into an edge runtime; the loader and the version detector, which read the file system, are the separate `index-loader` and `installed-version` entries, and the `$ref` inliner the tool schemas go through is the dependency-free `json-schema` entry.

## Privacy

The stdio server sends nothing anywhere except one request to the CDN for the index of the version it serves.

## Links

| Resource | URL |
|----------|-----|
| **Using AI with Bitbybit** | https://learn.bitbybit.dev/learn/using-ai-with-bitbybit/intro |
| **This server, documented** | https://learn.bitbybit.dev/learn/using-ai-with-bitbybit/mcp/bitbybit-mcp |
| **CAD Cloud MCP** | https://learn.bitbybit.dev/learn/using-ai-with-bitbybit/mcp/cad-cloud-mcp |
| **Agentic CAD - where geometry should run** | https://learn.bitbybit.dev/learn/using-ai-with-bitbybit/agentic-cad |
| **Context files, for hosts without MCP** | https://learn.bitbybit.dev/learn/using-ai-with-bitbybit/prompt-contexts |
| **GitHub** | https://github.com/bitbybit-dev/bitbybit/tree/master/packages/dev/mcp |
| **Monorepo** | https://github.com/bitbybit-dev/bitbybit |
| **TypeScript API Reference** | https://docs.bitbybit.dev |

## Bitbybit Platform

Beyond NPM packages, Bitbybit offers:

- **[Visual Programming Editors](https://bitbybit.dev)** - Rete & Blockly drag-and-drop 3D modeling, plus a Monaco TypeScript editor  
- **[CAD Cloud API](https://learn.bitbybit.dev/api/cloud-api)** - Build full [pipelines](https://learn.bitbybit.dev/api/sdk/typescript/pipelines) that compose all Bitbybit algorithms, where each step can reference outputs of previous steps. Supports parametric model generation, STEP-to-glTF conversion, and complex CAD workflows via HTTP  
- **[Bitbybit Studio](https://studio.bitbybit.dev)** - A growing visual dashboard where API Key users can generate models, convert files, build [pipelines with a GUI](https://learn.bitbybit.dev/api/studio/intro), inspect tasks, and preview 3D results  
- **[3D Bits for Shopify](https://apps.shopify.com/3d-bits-1)** - Interactive 3D product configurators for e-commerce  
- **[Script Runners](https://learn.bitbybit.dev/learn/runners/intro)** - Execute visual scripts directly on your website  
- **[Built for AI Coding Agents](https://learn.bitbybit.dev/learn/using-ai-with-bitbybit/intro)** - This server, the [CAD Cloud MCP](https://learn.bitbybit.dev/learn/using-ai-with-bitbybit/mcp/cad-cloud-mcp) for running geometry, and context files for assistants without MCP  
- **[Business & Enterprise](https://bitbybit.dev/b2b)** - We help businesses and enterprises develop custom applications and spin up optimized CAD tenant workflows on our managed servers  

## Support the Project

This package is part of the open-source Bitbybit ecosystem. Your subscription helps fund continued development.

⭐ **[Subscribe - Silver or Gold plan](https://bitbybit.dev/auth/pick-plan)** | **[Get API Key for CAD Cloud](https://bitbybit.dev/auth/pick-plan?api-keys=true)**

## Community

- [Discord](https://discord.gg/GSe3VMe)  
- [YouTube](https://www.youtube.com/@bitbybitdev?sub_confirmation=1)  
- [LinkedIn](https://www.linkedin.com/company/bitbybit-dev)  
- [X (Twitter)](https://x.com/bitbybit_dev)  
- [Blog](https://learn.bitbybit.dev/blog)  

## License

MIT © [Bit By Bit Developers](https://bitbybit.dev)
