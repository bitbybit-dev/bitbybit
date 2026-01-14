---
slug: ai-prompt-contexts
title: AI Prompt Contexts - Teaching Your AI Assistant to Code with Bitbybit
authors: [ubarevicius]
tags: [ai, babylonjs, threejs, playcanvas]
image: https://ik.imagekit.io/bitbybit/app/assets/blog/ai-prompt-contexts/ai-prompt-contexts.webp
---

![AI Prompt Contexts for Bitbybit](https://ik.imagekit.io/bitbybit/app/assets/blog/ai-prompt-contexts/ai-prompt-contexts.webp "AI Prompt Contexts for Bitbybit")

Modern AI assistants like Claude, Gemini, Grok or ChatGPT or are remarkably capable at writing code. However, they can struggle with specialized libraries and APIs they weren't extensively trained on. That's where AI Prompt Contexts come in - specially crafted documentation files that give your AI assistant deep knowledge of the Bitbybit API.

<!-- truncate -->

## What Are AI Prompt Contexts?

An AI Prompt Context is a markdown file designed to be attached to conversations with AI coding assistants. When you provide this context file, the AI gains comprehensive knowledge about Bitbybit's API, coding patterns, best practices, and integration approaches. Think of it as giving your AI assistant a complete reference manual it can consult while helping you write code.

We've structured these context files specifically for AI consumption. They include clear role definitions that tell the AI how to behave, complete API references with all available functions and their parameters, code examples demonstrating correct usage patterns, and decision trees that help the AI recommend the right approach based on your experience level.

## Choosing the Right Context

We offer several context variants, and understanding their differences will help you pick the right one for your needs.

### Engine-Specific Contexts

Each context file is tailored to a specific 3D rendering engine. If you're building with Babylon.js, download the BabylonJS context. Building with Three.js? Grab the ThreeJS variant. Working with PlayCanvas? There's a context file for that too. The engine-specific details matter because initialization patterns, scene management, and rendering APIs differ between engines.

### Full vs Lite Versions

This is where the real choice comes in. For each engine, we provide two versions: Full and Lite.

**Full contexts** contain everything an AI needs to help you from scratch. They include extensive explanations of what Bitbybit is, how to set up projects, integration guides for both NPM packages and browser-based runners, best practices for performance, scene setup recommendations, and the complete API reference with detailed descriptions. If you're new to Bitbybit or want your AI to provide comprehensive guidance, the Full context is your friend.

**Lite contexts** strip away the explanations and focus purely on API definitions. They contain the same complete API reference but use a compressed notation to minimize token usage. This approach has a specific use case: when you already understand Bitbybit well and want to set up your own custom coding rules. You might have your own project setup preferences, your own coding style guide, or specific patterns you want the AI to follow. The Lite context gives you concise API definitions to include alongside your custom instructions.

### Monaco Editor Context

We also provide a special context for users of our online Monaco TypeScript editor at [bitbybit.dev](https://bitbybit.dev/app?editor=typescript). This context is simpler because it focuses only on what you need when coding in the browser-based editor. It explains the pre-initialized global variables available in that environment and the specific patterns required for that context. If you're just getting started with Bitbybit and want to experiment in our online editor, this beginner-friendly context is the perfect starting point.

## Understanding the Lite Context Format

The Lite contexts use an important technique to reduce file size: a translation dictionary. This is something your AI must understand to generate correct code.

At the beginning of the API section, you'll find a dictionary that maps abbreviated terms to their full names. For example, `OC` means `OCCT`, `sp` means `shape`, `sd` means `solid`, and `cr` means `create`. The API definitions throughout the document use these abbreviations to stay compact.

Here's the critical part: **the AI must translate these abbreviations back to full names when generating code**. We explicitly instruct the AI about this requirement in the context file. When the AI sees something like `bitbybit.oc.sh.sd.crBox(op: BoxD)` in the documentation, it should generate `bitbybit.occt.shapes.solid.createBox(boxOptions: BoxDto)` for you. The abbreviated forms are only for documentation - they would not compile if used directly in code.

This translation system allows us to provide complete API coverage while keeping token counts reasonable. The AI handles the translation transparently, so you receive clean, readable code. If your AI agent is not able to translate these values - code will not work. If that happens - you should probably look for a better AI.

## How to Use These Contexts

Using a prompt context is straightforward. Download the appropriate markdown file from our homepage at bitbybit.dev, then attach it to your conversation with your AI assistant. Most modern AI interfaces support file attachments - simply drag and drop the file or use the attachment button.

Once attached, you can start asking questions like "Create a parametric table with adjustable legs" or "Show me how to create a filleted box and export it as STEP." The AI should reference the context to generate accurate, working code that follows our recommended patterns.

For the best experience, we recommend combining a Lite context with our Context7 MCP Server. The MCP server provides live access to our full documentation and stays current with the latest changes. The Lite context ensures the AI knows the precise API signatures. Together, they create a powerful coding assistant that understands both the big picture and the fine details.

## Where to Download

You'll find all context files on our homepage at [bitbybit.dev](https://bitbybit.dev). Scroll to the "Code with AI" section where you'll see download buttons for each engine and version. The page displays token counts for each file so you can gauge context window usage.

Here are direct links to download each context file:

**For Beginners (Monaco Editor)**
- <VersionLink href="https://app.bitbybit.dev/assets/ai-prompt-context/v{version}/bitbybit-babylon-monaco-ai-context-v{version}.md">Monaco Editor Context</VersionLink> (~116k tokens)

**BabylonJS**
- <VersionLink href="https://app.bitbybit.dev/assets/ai-prompt-context/v{version}/bitbybit-babylon-ai-context-v{version}.md">Full Context</VersionLink> (~116k tokens)
- <VersionLink href="https://app.bitbybit.dev/assets/ai-prompt-context/v{version}/bitbybit-babylon-no-comment-min-ai-v{version}.md">Lite Context</VersionLink> (~114k tokens)

**ThreeJS**
- <VersionLink href="https://app.bitbybit.dev/assets/ai-prompt-context/v{version}/bitbybit-three-ai-context-v{version}.md">Full Context</VersionLink> (~95k tokens)
- <VersionLink href="https://app.bitbybit.dev/assets/ai-prompt-context/v{version}/bitbybit-three-no-comment-min-ai-v{version}.md">Lite Context</VersionLink> (~82k tokens)

**PlayCanvas**
- <VersionLink href="https://app.bitbybit.dev/assets/ai-prompt-context/v{version}/bitbybit-playcanvas-ai-context-v{version}.md">Full Context</VersionLink> (~94k tokens)
- <VersionLink href="https://app.bitbybit.dev/assets/ai-prompt-context/v{version}/bitbybit-playcanvas-no-comment-min-ai-v{version}.md">Lite Context</VersionLink> (~82k tokens)

## Getting the Most from AI-Assisted Coding

A few tips will help you work more effectively with AI and these contexts. First, be specific about what you want to build. Instead of asking for "a shape," describe "a rounded rectangular table top with four cylindrical legs." The more detail you provide, the more useful the generated code will be.

Second, mention your experience level. The contexts include decision trees that help the AI adapt its responses. If you're new to web development, the AI can scaffold complete applications for you. If you're an experienced developer, it can focus on just the API calls you need.

Third, iterate on the generated code. AI assistants are collaborative tools. If the first attempt isn't quite right, explain what you'd like changed. The AI can refine its suggestions based on your feedback while staying consistent with the Bitbybit API.

## The Future of AI-Assisted CAD

We believe AI assistants will become increasingly important tools for developers working with 3D and CAD applications. These prompt contexts represent our commitment to making Bitbybit as accessible as possible. Whether you're prototyping ideas quickly or building production applications, having an AI that truly understands our API makes the development process smoother and more enjoyable.

The contexts are updated with each Bitbybit release to match the latest API. When you see a new version available, download the updated context to ensure your AI has the most current information.

Happy building with AI at your side!
