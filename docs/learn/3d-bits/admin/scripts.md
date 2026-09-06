---
sidebar_position: 2
title: "Scripts"
sidebar_label: Scripts
description: Parametric programs that calculate geometry, how they connect to your configurators, and why one cannot be deleted while a project uses it.
tags: [shopify, 3d-bits, scripts, scripting]
---

# Scripts

:::info Standard and Pro plans
Scripts need the Standard or Pro plan. Everything else about building configurators works on Base. On Base the Scripts item does not appear in the app's navigation at all.
:::

Most configurators work by swapping between parts you prepared in advance. That is fast, reliable, and enough for the majority of products.

A script is for when it is not. When a shopper types a width and the shelf has to be built to that width, no set of prepared models can cover every possibility, so the geometry has to be calculated instead. That is what scripts do.

## Three ways to write one

**Rete** is a visual node editor. You drag nodes onto a canvas and wire them together, and each node does one thing such as making a box, cutting one shape out of another, or reading a value the shopper entered. It suits people who think visually and do not want to write code.

**Blockly** snaps blocks together like puzzle pieces. It is the gentlest introduction and good for straightforward calculations.

**TypeScript** is a code editor with full autocomplete over our geometry library. It is the most direct route if you or your developer already write code.

All three produce the same thing, and you can pick per script.

## How a script reaches a shopper

A script is not published to a product on its own. It has no options panel and no prices, so on its own there would be nothing for a shopper to interact with. Publishing a script puts the compiled program on a public URL and stops there.

Instead you publish the script, then open a project and link the script in Composer's **Scripting** section. The project supplies the panel your shopper uses, the pricing, and the connection to your products, and passes their choices into the script. The script returns geometry, and the project displays it.

That means the answer to "should I build a project or a script" is usually both. The project is the product. The script is the part of it that does the maths.

## Keeping the two in step

Publishing a script does not update the projects using it. Those projects are still running the version of the script they were published with, which is deliberate, because a change to a script should not silently alter a live product.

Each side of that relationship tells you about the other. A script's own page has a **Used by Composer projects** card listing every project that links to it, so you can see who depends on it before you change anything, and publishing the script tells you again how many published projects now need a look. From the other direction, a project whose script has moved on shows a **Linked scripts were updated** banner with a **Republish** button on it.

:::info A script in use cannot be deleted
If any Composer project still links to a script, deleting it is refused, and the message names the projects that are holding it. Unlink it in each of those projects first. This is deliberate - deleting a script out from under a published configurator would leave a product page with nothing to draw.
:::

## Geometry engines

Scripts can use CAD engines for precise solid modelling and boolean operations, and each one you switch on adds to what your shopper's browser downloads, so turn on only what a script actually uses.

There are two places to set this, and they do different jobs. A script's own page in the app carries **OCCT**, **JSCAD** and **Manifold** checkboxes for the kernels that script needs on its own. Composer's Scripting section carries the same three for the project, which is what governs the product page your shopper loads.

## Learning to build them

The editors are the same ones used across the [bitbybit.dev](https://bitbybit.dev) platform, and the wider [platform documentation](/learn/getting-started/overview) covers them in far more depth than would fit here, including the full library of geometry operations.
