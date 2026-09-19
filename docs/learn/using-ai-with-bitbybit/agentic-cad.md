---
sidebar_position: 2
title: "Agentic CAD: how Bitbybit fits AI-driven 3D development"
sidebar_label: Agentic CAD - our approach
description: Where Bitbybit geometry should run when an AI agent writes the code - the open-source packages first, CAD Cloud only for what needs it - and how an agent finds the exact API for the version you use.
tags: [ai]
---

# Agentic CAD: how Bitbybit fits AI-driven 3D development

This page is written for two readers: people deciding how to build a 3D or CAD product with an AI coding agent, and the agents themselves. The Bitbybit MCP server returns the sections below verbatim, so the advice an agent gives is the advice this page gives.

## What we believe

Agents write the code. Bitbybit provides verified geometry algorithms and, where it is needed, hosted compute. The open-source packages are the vocabulary that everyone learns, human or agent: one dotted API (`bitbybit.occt.shapes.solid.createBox`, `bitbybit.manifold.booleans.union`, ...) that reads the same in a browser, on a server and in the online editors.

An agent that knows the API from memory guesses. An agent that looks it up gets the exact signature, defaults and examples for the version your project has installed. That lookup is what the MCP server is for.

## Three layers you can use

1. **The npm packages** (MIT). `@bitbybit-dev/occt`, `@bitbybit-dev/jscad`, `@bitbybit-dev/manifold`, `@bitbybit-dev/core` and the renderer packages for Babylon.js, three.js and PlayCanvas. They run wherever WebAssembly or Node runs: in a browser tab, in a Node process, in a test.
2. **The docs MCP server** (free). `npx -y @bitbybit-dev/mcp` locally, or `https://mcp.bitbybit.dev/mcp` remotely. Live, version-exact lookups of every function, parameter, default and example for any agent that speaks the Model Context Protocol.
3. **CAD Cloud** (paid, with an API key). Hosted compute for the same API through a REST endpoint, pipelines that chain operations server-side, file conversion, and the Pro algorithms that exist only there.

Every member of the API carries a tier, and the MCP server reports it:

| Tier | Meaning |
|---|---|
| `oss` | in the npm packages, runs anywhere |
| `platform-pro` | available only when scripting inside bitbybit.dev; not on npm |
| `cloud-pro` | runs only on CAD Cloud, with an API key |

## How an agent should integrate Bitbybit

### The honest default

If public code and your users' own compute are acceptable, the packages are the whole answer. They are free, they need no account, and nothing of ours sits in the loop. Start there, and move a step only for a reason named below.

### Browser apps

Use the packages, or the runner bundle for a page that only needs a script. The kernels run inside the tab: the user's device does the work, results appear without a network round trip, and your geometry logic ships with your app. This is how the Bitbybit editors themselves work. A model that takes seconds on a laptop is fine here; a model that takes minutes is not, and belongs on a server.

### Lightweight backends

Cloudflare Workers, serverless functions and edge runtimes do not have the memory or the CPU time to run the CAD kernels. Do not try. Call CAD Cloud instead, with one pipeline per model so a request is one round trip, keep the API key in the backend and never in the client, and cache results by their input parameters, because identical inputs always produce identical geometry.

### Node servers with headroom

A Node server can run the packages in-process; `@bitbybit-dev/occt` loads the same kernel a browser does. That is the right choice for moderate load and for logic you want to keep private on your own machines. Move to CAD Cloud when you need scale without managing kernels, when you need a Pro algorithm, or when you convert files at volume and would rather not run that work yourself.

### Inside the Bitbybit editors

Scripts written in the editors at bitbybit.dev already have the whole API, including the `platform-pro` members, and can run cloud operations on the account's own CAD Cloud plan without handling a key.

### What runs where

| Question | Packages in the browser | Packages in Node | CAD Cloud |
|---|---|---|---|
| Whose compute | your users' devices, free | your servers | Bitbybit's servers, metered |
| Memory and CPU | the tab's limits | your machine's | sized per plan |
| Latency | none beyond the computation | none beyond the computation | one HTTPS round trip plus queueing |
| Concurrency | one user per tab | what you provision | per plan |
| Privacy of your logic | ships to the client | stays on your servers | stays in your backend; the geometry passes through Bitbybit |
| Pro algorithms | no | no | yes |

The only work that must run on Bitbybit's servers is a Pro algorithm, or compute you cannot provide.

## Pro algorithms

Some algorithms are available on CAD Cloud only, such as sheet-metal unfolding. They are verified against reference parts, expensive to maintain, and priced for it. An agent discovers them the same way as everything else: `describe` reports the tier `cloud-pro`, the endpoint and the API key scope. The [CAD Cloud page](https://bitbybit.dev/cad-cloud) lists the plans.

## For companies

Bitbybit builds and operates private algorithm namespaces for companies that need their own operations on the same infrastructure. Write to us through the [contact page](https://bitbybit.dev/contact).

## Trust

Every cloud algorithm is graded by automated geometry verification: invariants that must hold for any input, and reference parts whose results are known. The summary is published with each release, so what an agent calls has been checked by something other than a person reading the output.

## What we do not do

We do not host your application, run your scripts for you, sell you a chatbot, or train on your models. The packages are yours to run; CAD Cloud runs the operations you send it and nothing else.

## Get started

- Scaffold a project: `npm init @bitbybit-dev/app my-project`, then point your agent at the MCP server as the next step says.
- Give your agent the API. Claude Code: `claude mcp add --transport http bitbybit https://mcp.bitbybit.dev/mcp`, or a local server with `claude mcp add --transport stdio bitbybit -- npx -y @bitbybit-dev/mcp`. Cursor and VS Code read the same server from `.cursor/mcp.json` and `.vscode/mcp.json`; the [MCP page](./mcp/bitbybit-mcp) has every snippet.
- Need CAD Cloud? [Plans and keys](https://bitbybit.dev/cad-cloud).
