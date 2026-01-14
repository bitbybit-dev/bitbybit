---
sidebar_position: 1
title: AI-Powered 3D Development
sidebar_label: Introduction
description: Supercharge your Bitbybit workflow with AI coding assistants like Claude, ChatGPT, and GitHub Copilot.
tags: [ai]
---

# AI-Powered 3D Development

Bitbybit has 1300+ API functions across three CAD kernels. That's a lot to remember. AI coding assistants can help you write Bitbybit code faster and more accurately - if you give them the right context.

## The Challenge

AI models like Claude, ChatGPT, and GitHub Copilot are trained on public code, but Bitbybit's specialized 3D/CAD APIs aren't as widely documented as mainstream libraries. This means AI assistants often:

- Hallucinate function names that don't exist
- Use incorrect parameter types
- Miss important patterns specific to CAD workflows

## The Solution

We provide two ways to give AI assistants deep knowledge of our APIs:

1. **[Context Files](./prompt-contexts)** - Download a markdown file containing our complete API reference. Attach it to your AI conversation and get accurate code generation.

2. **[Context7 MCP](./mcp/context-7)** - Use the Model Context Protocol to give AI agents like Claude live access to our documentation.

## What You Can Do

With proper context, AI assistants can:

- Generate complete parametric models from natural language descriptions
- Scaffold new projects with correct initialization patterns
- Debug and optimize existing Bitbybit code
- Explain unfamiliar API functions
- Convert between different geometry representations

## Getting Started

**Beginners:** Download the [Full Context File](./prompt-contexts) for your engine and attach it to ChatGPT, Claude, or your preferred AI assistant.

**Developers:** Combine a [Lite Context](./prompt-contexts) with [Context7 MCP](./mcp/context-7) for the best balance of token efficiency and comprehensive documentation access.

:::tip Vibe Coding
Describe what you want in plain English - "Create a rounded box with four legs" - and let the AI figure out which Bitbybit functions to use. The context files include decision trees that help AI choose the right approach.
:::
