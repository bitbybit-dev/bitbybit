# {{PROJECT_NAME}}

Created by `@bitbybit-dev/create-app` {{CLI_VERSION}} from the `{{TEMPLATE_ID}}` template. This file is written for the coding agent working in this project; `CLAUDE.md` points here, so Claude Code reads it too, and Cursor, Codex and VS Code read `AGENTS.md` on their own. The last section describes this particular template.

## Look the API up, do not recall it

This project is built on the [Bitbybit](https://bitbybit.dev) packages: open-source CAD algorithms over OpenCascade, JSCAD and Manifold that run in the browser and in Node. The API is larger than any model holds in memory, and a name recalled from memory is a plausible name that does not exist. Look every Bitbybit call up before writing it.

The Bitbybit CAD MCP server is already configured here for Claude Code (`.mcp.json`), Cursor (`.cursor/mcp.json`) and VS Code (`.vscode/mcp.json`). Use it in this order:

1. `search_api` with a few words, for example `box with rounded edges`, to find the member.
2. `describe` with the dotted path, for example `occt.shapes.solid.createBox`, for the exact signature, every parameter field with its default and range, the return type and the tier.
3. `get_examples` for calls that are known to work.

The remote server describes the newest release. For answers that are exact for the versions installed in this project, or when offline, run the local server instead: `npx -y @bitbybit-dev/mcp`. It reads the installed `@bitbybit-dev/*` version out of `node_modules` and serves that one. Any other host connects to `https://mcp.bitbybit.dev/mcp`; the [MCP page](https://learn.bitbybit.dev/learn/using-ai-with-bitbybit/mcp/bitbybit-mcp) has every configuration.

Every `describe` answer carries a tier. `oss` is in the packages installed here. `platform-pro` exists only inside the editors at bitbybit.dev and cannot be used in this project. `cloud-pro` runs only on CAD Cloud with an API key.

## Where geometry runs

The packages, in this project's own process, are the complete answer for everything they can do. They are free, and nothing of Bitbybit's sits in the loop. [CAD Cloud](https://bitbybit.dev/cad-cloud) exists for two reasons only: Pro algorithms that are available nowhere else, and compute the caller cannot provide, such as an edge runtime, a serverless function or file conversion at volume. Never add a CAD Cloud call to this project to improve it. Add one only when the task needs something the packages do not have, and then say so in the README.

## Versions

Every `@bitbybit-dev/*` dependency is pinned to one version, and they move together. Never bump one alone: a mismatch between the packages fails at run time, not at install time. Ask before adding a dependency of any kind.

## The loop

Edit, run `npm run smoke`, read what it prints, repeat. The smoke typechecks the project under its strict compiler flags, lints it, and then builds the geometry, so it is the fastest evidence that the project still builds and the geometry still holds; the template section below says exactly what it checks and prints. Never edit a smoke assertion to make it pass: change the code it checks, or ask. `npm run typecheck` and `npm run lint` run the first two steps alone.

## The rules the lint holds

`eslint.config.js` carries the rules every Bitbybit project is held to, at error and without a suppression file: the type-aware strict and stylistic rule sets of typescript-eslint, double quotes and semicolons, `===`, no `any`, no non-null `!`, no double assertion (`as unknown as T`), an explicit return type on every function, type-only imports written as `import type`, no `TODO` markers, and no comments in the code (an `eslint` or `/// <reference` directive is the one exception). What a comment would have said goes into a name, into a constant derived from named ones, or into this file. Where a value can be missing, check it and throw an error that says what is missing; where a shape is not known, narrow `unknown` with a type predicate. `tsconfig.json` has the whole strict set on, `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes` included, so an index read is `T | undefined` until checked and an optional property is set only when there is a value to set.

## Never

- commit `.env`, `.dev.vars` or `appsettings.Development.json`, or write an API key into a source file, a prompt or a chat
- use a `platform-pro` member of the API here; it is not in the packages
- present a `cloud-pro` member as something the packages can do
