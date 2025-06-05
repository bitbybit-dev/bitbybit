---
id: context-7
title: Using Context7 MCP with Bitbybit
sidebar_label: Context7 Integration
description: Learn how to connect your AI coding assistant to up-to-date Bitbybit documentation and examples using Context7 and the Model Context Protocol (MCP).
tags: [ai]
---

# Using Context7 MCP with Bitbybit

We are pleased to announce that Bitbybit documentation and example applications are now available via Context7 MCP servers.  
You can explore our [GitHub Monorepo](https://github.com/bitbybit-dev/bitbybit) or [find Bitbybit on Context7](https://context7.com/bitbybit-dev/bitbybit).

---

## What is Context7?

Modern AI coding assistants, such as large language models (LLMs), often rely on outdated or generic information about the libraries you use.  
Context7 addresses this by providing up-to-date, version-specific documentation and real code examples directly from the source.

With Context7, you can insert accurate and relevant documentation into tools like Cursor, Claude, GitHub Copilot or other LLMs. This leads to better answers, fewer inaccuracies, and an AI that actually understands your technology stack.

### Why Use Context7?

**Without Context7:**
- Documentation may be outdated due to old training data
- Code examples might not work as expected
- Answers are often generic and not tailored to your version
- Extra time is spent verifying AI-generated responses
- The process can be inefficient and frustrating

**With Context7:**
- Documentation is always current and matches your version
- Code examples are real and sourced directly from the project
- Information is concise and directly relevant to your needs
- Free access is available for personal use
- Easily integrates with your MCP server and development tools

---

## Important

MCP works only in agent mode.

## How to Set Up Context7 with MCP in VS Code

You can connect your AI coding assistant in VS Code to Context7 for the latest Bitbybit documentation and examples.

### 1. Add `mcp.json` to Your Project

Create a `.vscode` folder in your project root (if it doesn’t exist), and add a file named `mcp.json` with the following content:

```json title="connecting locally (seems to work better)"
{
    "servers": [
        {
            "command": "npx",
            "args": [
                "-y",
                "@upstash/context7-mcp@latest"
            ],
            "env": {
                "DEFAULT_MINIMUM_TOKENS": "10000"
            }
        }
    ]
}
```

```json title="connecting via http"
{
    "servers": {
        "context7": {
            "type": "http",
            "url": "https://mcp.context7.com/mcp"
        }
    }
}
```

### 2. Enable MCP in Your Coding Assistant

- Ensure your coding assistant (such as GitHub Copilot) is configured to use MCP.
- In VS Code, check your settings for an option like `chat.mcp.enabled` and make sure it is enabled.
- If you use an Enterprise edition, your organization may need to enable this feature.

### 3. Benefit from Improved AI Assistance

Once set up, your AI assistant will have access to the latest Bitbybit documentation and examples, resulting in more accurate and helpful suggestions.

---

## Caution

Our docs are not yet complete - thus there might be topics that Context7 may not know about. Making docs cover majority of use cases and features is our current priorty, thus results will only improve. At the end this isn't really about AI, it's about our users having access to better and more convenient information sources.

While Context7 is aware of Bitbybit and can provide helpful information, it is not guaranteed to always give you fully accurate answers even if it would have all the information. The quality of responses still depends on the underlying language model, which may sometimes generate incorrect or misleading information (a phenomenon known as "hallucination").

Also, Context7 primarily loads documentation entries that include code snippets. Since it is a third-party service, we cannot guarantee its performance in every situation or that the server will always be available.

Additionally, the Context7 repository scraping process tries to optimize for token limits, which means that some relevant information might be accidentally omitted. Please keep these limitations in mind when using Context7.

## Additional Notes

- For detailed instructions on setting up MCP with other editors or AI tools, refer to their official documentation.
- MCP is an open standard, so most modern editors and AI providers support it.

By integrating Context7 with MCP, you ensure your AI tools always have the most relevant and up-to-date information about Bitbybit, making your coding experience more efficient and productive.