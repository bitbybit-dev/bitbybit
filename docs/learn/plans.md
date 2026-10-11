---
sidebar_position: 4
title: Plans and What They Unlock
sidebar_label: Plans
description: What the Free, Silver and Gold plans of bitbybit.dev include - cloud projects and storage, backups, the Designer, the platform algorithms, communities, the converter and the 3D inspector - and how CAD Cloud and 3D Bits are priced apart.
topic: platform.start.plans
type: reference
verified: 2026-10-11
tags: [getting-started, pricing, products]
---

# Plans and what they unlock

Most of Bitbybit costs nothing: the open-source npm packages, the runners, the three coding editors, and the Bitbybit CAD MCP for AI agents. The plans of bitbybit.dev add cloud space and a few tools on top. CAD Cloud and 3D Bits for Shopify are priced on their own, below.

Choose or change a plan at [bitbybit.dev/auth/pick-plan](https://bitbybit.dev/auth/pick-plan).

## Free, Silver and Gold

| | Free | Silver | Gold |
|---|---|---|---|
| The Rete, Blockly and TypeScript editors | yes | yes | yes |
| Keeping projects in this browser, without an account | yes | yes | yes |
| [The Designer](/learn/designer/intro) | view what is shared with you | view what is shared with you | create and edit |
| [Platform algorithms](#platform-algorithms) that need a plan | | yes | yes |
| [Community projects](/learn/getting-started/basics/projects/intro) | public ones | public and Silver | public, Silver and Gold |
| 3D models from the catalogue | free ones | free and Silver | free, Silver and Gold |
| [STEP to glTF converter](https://bitbybit.dev/converter) | | yes | yes |
| [3D inspector](https://bitbybit.dev/3d-inspector) for glTF, GLB and STL | | yes | yes |
| Priority support | | | yes |

### Cloud space

{/* limits:start */}
| | Free | Silver | Gold |
|---|---|---|---|
| Cloud projects | 100 | Unlimited* | Unlimited* |
| Of them private | 10 | Unlimited* | Unlimited* |
| Scripts in a project | 10 | 200 | Unlimited* |
| Files in a project | 10 | 100 | 500 |
| Size of one file | 25 MB | 100 MB | 250 MB |
| Size of one script | 5 MB | 25 MB | 100 MB |
| Cloud storage | 1 GB | 25 GB | 100 GB |
| Backups of each script | 5 | 20 | 50 |
{/* limits:end */}

\* "Unlimited" means limits high enough that most people never reach them; [write to us](mailto:info@bitbybit.dev) if you need more. The limits count cloud projects only: projects kept in this browser are not counted. [Projects](/learn/getting-started/basics/projects/intro) explains where each kind lives.

## Platform algorithms

The `bitbybit.advanced` and `bitbybit.things` namespaces hold algorithms whose source is closed: 3D text with fonts, patterns on faces, dimensions and navigation helpers, and ready-made parametric models of furniture, vases, cups, boxes and buildings. They run in the editors on bitbybit.dev and in the runners.

Some of them, most of the `things` models among them, compute only for members of the Silver and Gold plans. Without a plan they stop the run with:

```text
Could not compute, to use the <algorithm> algorithm you must be subscribed to our silver or gold plan.
```

A project that uses them is best shared with the matching community rather than as public, so that the people who open it can run it.

## The Designer

The [Designer](/learn/designer/intro) is part of Gold: Gold members create Designer scripts, edit them, and can change a copy of one shared with them. Everyone else who can open a Designer project, through a link, a community or a public project, opens it in the Designer to view: turn it, read its tree, parts list and masses, switch its configurations, try the values its author lets visitors change, and download what its author allows. [Open a project](/learn/designer/get-started/open) shows what view mode keeps.

## CAD Cloud

[CAD Cloud](/api/cloud-api) runs geometry on Bitbybit's servers through a REST API, the TypeScript SDK and the [CAD Cloud MCP](/learn/using-ai-with-bitbybit/mcp/cad-cloud-mcp). Its plans are sold as API keys with a monthly allowance of compute minutes and a largest file size, and are managed in [Bitbybit Studio](https://studio.bitbybit.dev). They are separate from Silver and Gold; [bitbybit.dev/auth/pick-plan](https://bitbybit.dev/auth/pick-plan) lists them.

## 3D Bits for Shopify

[3D Bits](/learn/3d-bits/intro) is billed through Shopify, in its own Base, Standard and Pro tiers, and does not need a bitbybit.dev plan.

## Enterprise

For custom algorithms, configurators that generate STEP and glTF, batch jobs and dedicated servers, [write to us](mailto:info@bitbybit.dev); [the enterprise path](/learn/paths/enterprise) describes what we build.
