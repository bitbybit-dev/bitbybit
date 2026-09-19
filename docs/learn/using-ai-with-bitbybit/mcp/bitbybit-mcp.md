---
id: bitbybit-mcp
sidebar_position: 1
title: The Bitbybit MCP server
sidebar_label: Bitbybit MCP server
description: Connect Claude Code, Cursor, VS Code, claude.ai or ChatGPT to the Bitbybit MCP server and let your agent look up the exact API for the version you use.
tags: [ai]
---

# The Bitbybit MCP server

The Bitbybit MCP server documents the whole API for AI coding agents: every function, its parameters, defaults, return type and examples, for the exact version your project has installed. An agent connected to it looks the API up instead of guessing it.

It comes in two forms that serve the same tools:

- **Local, over stdio**: `npx -y @bitbybit-dev/mcp`. Runs on your machine, needs Node 20 or newer, and sends nothing anywhere except one request for the index of the version it serves.
- **Remote, over Streamable HTTP**: `https://mcp.bitbybit.dev/mcp`. No account, no key. It counts tool calls and the paths it could not answer, and nothing else.

Both answer from the API index Bitbybit publishes with every release, never from a moving "latest", so an answer is exact for the version you name.

## Claude Code

```bash
claude mcp add --transport http bitbybit https://mcp.bitbybit.dev/mcp
```

or the local server:

```bash
claude mcp add --transport stdio bitbybit -- npx -y @bitbybit-dev/mcp
```

For a project, commit a `.mcp.json` at its root instead:

```json
{
    "mcpServers": {
        "bitbybit": { "type": "http", "url": "https://mcp.bitbybit.dev/mcp" }
    }
}
```

## Cursor

Create `.cursor/mcp.json` in the project (or `~/.cursor/mcp.json` for every project):

```json
{
    "mcpServers": {
        "bitbybit": { "url": "https://mcp.bitbybit.dev/mcp" }
    }
}
```

## VS Code

Create `.vscode/mcp.json`; the `type` is required, or VS Code tries to start the URL as a program:

```json
{
    "servers": {
        "bitbybit": { "type": "http", "url": "https://mcp.bitbybit.dev/mcp" }
    }
}
```

MCP works in agent mode; check that `chat.mcp.enabled` is on.

## claude.ai and Claude Desktop

Settings, Connectors, "Add custom connector": name `bitbybit`, URL `https://mcp.bitbybit.dev/mcp`, no sign-in.

## ChatGPT

Settings, Apps and Connectors, Advanced, enable Developer Mode, then add a connector with the URL `https://mcp.bitbybit.dev/mcp`. The server exposes the `search` and `fetch` tools ChatGPT's connectors require.

## Which version it serves

The local server picks the version in this order: `--version <version>` on the command line, `BITBYBIT_VERSION` in the environment, the `@bitbybit-dev` packages installed around the working directory, then its own version. The remote server serves the newest release by default; `search_api`, `describe`, `list_namespace` and `get_examples` take a `version` argument for another release. When the packages installed around the working directory predate the published index, the local server serves its own version instead and says so on stderr; pass `--version` to insist on one.

## The tools

| Tool | What it answers |
|---|---|
| `search_api` | members by keywords: path, summary, tier, engines |
| `describe` | the full contract of one member by dotted path; an unknown path comes back as not found with the nearest existing ones |
| `list_namespace` | the members one level below a namespace |
| `get_examples` | code examples for a member, a namespace or a topic |
| `get_guide` | sections of [Agentic CAD](../agentic-cad), the guide on where geometry should run |
| `search`, `fetch` | the same lookups in the shape ChatGPT's connectors require |

Every tool is read-only. The tiers in every answer: `oss` is in the npm packages under the MIT licence, `platform-pro` is available only when scripting inside bitbybit.dev, `cloud-pro` runs only on [CAD Cloud](https://bitbybit.dev/cad-cloud) with an API key.

## A first prompt

> Using the bitbybit MCP, describe `occt.shapes.solid.createBox` and write a script that makes a 10 by 20 by 5 box, fillets its edges by 1 and draws it with three.js.

The agent calls `describe`, sees the parameter object and its defaults, looks up `occt.fillets` the same way, and writes code that compiles the first time.
