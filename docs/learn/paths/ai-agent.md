---
sidebar_position: 6
title: AI Coding Agents
sidebar_label: AI Agent
description: How an AI coding agent, or the person driving one, gets the exact Bitbybit API and, with a key, hosted CAD compute.
tags: [ai, developer, integration]
---

# For AI Coding Agents, and the People Driving Them

You let Claude Code, Codex, Cursor, VS Code, claude.ai, ChatGPT or an agent of your own write the 3D code, or produce the geometry outright. Bitbybit treats that agent as a first-class user: the API is published in the form it can read at the moment it needs it.

## Give the agent the API

Connect the free [Bitbybit CAD MCP](../using-ai-with-bitbybit/mcp/bitbybit-mcp). In Claude Code that is one command:

```bash
claude mcp add --transport http bitbybit https://mcp.bitbybit.dev/mcp
```

From then on the agent describes every function it is about to call: the exact parameters, defaults and examples of the version your project has installed. Assistants that cannot speak MCP get the same knowledge from a [context file](../using-ai-with-bitbybit/prompt-contexts).

## Let the agent run geometry

When the agent has to produce a file or an answer rather than code, connect the [Bitbybit CAD Cloud MCP](../using-ai-with-bitbybit/mcp/cad-cloud-mcp) with an API key from a [CAD Cloud plan](https://bitbybit.dev/cad-cloud). It runs operations, pipelines, parametric models and STEP conversions on CAD Cloud and returns download links. "What is the volume of this STEP file?" becomes an upload and a two-step pipeline, with no backend of yours.

## Know where geometry should run

Read [Agentic CAD](../using-ai-with-bitbybit/agentic-cad) once. The open-source packages are the complete answer wherever public code and your users' compute are acceptable; CAD Cloud is for the Pro algorithms that exist only there and for compute you cannot provide. The agent reads the same page through the docs server, so its advice matches ours.

## Start a project the agent can iterate on

```bash
npm init @bitbybit-dev/app my-project
```

The scaffolder gives you a working app on the packages for three.js, Babylon.js or PlayCanvas; point the agent at the MCP server and ask for changes.

- [AI introduction](../using-ai-with-bitbybit/intro)
- [Bitbybit CAD MCP](../using-ai-with-bitbybit/mcp/bitbybit-mcp)
- [Bitbybit CAD Cloud MCP](../using-ai-with-bitbybit/mcp/cad-cloud-mcp)
- [CAD Cloud API reference](/api/cloud-api) for the backend you may write yourself
