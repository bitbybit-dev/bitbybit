---
sidebar_position: 1
slug: /getting-started/rete/add-components
title: Adding Components in Rete
sidebar_label: Adding Components
description: Find a Rete component by searching with a right-click on the canvas or by browsing the palette, the short names search knows, and what the Beta and Deprecated badges mean.
topic: rete.nodes.add
type: how-to
verified: 2026-10-10
tags: [getting-started, rete]
---

# Adding components

Rete holds more than 1,700 components, one for every function of the Bitbybit API plus a few of its own (sliders, lists, modules, code). There are two ways to put one on the canvas: search for it, or browse to it in the palette. Either way it lands in the middle of the view, ready to be dragged by its title to wherever you want it.

## Search with a right-click

<Shot id="rete.nodes.add/search" />

1. Right-click an empty spot on the canvas. The search opens in <Ui>Add components</Ui> mode, its field ready for typing.
2. Type part of the name, such as `cube`, or part of the path, such as `solid.create`. Every result shows its name, and below it the rest of its path.
3. Click a result, or press <kbd>Enter</kbd> to add the first one.

Search knows a few short names for the components you need most often:

| Type | To find |
|---|---|
| `v`, `vec` or `vector` | vector xyz |
| `p`, `pt` or `point` | point xyz |
| `n` | number slider |

The same search finds what is already on the canvas: switch it to <Ui>Find on canvas</Ui>, as [Organising a script](./organise.md#find-on-canvas) shows.

## Browse the palette

<Shot id="rete.nodes.add/palette" />

The palette along the top of the canvas follows the API. Its icons are the top categories (draw, occt, math, lists and the rest); hover one to read its name, click it to open it.

1. Click a category, then a subcategory in the row that opens below it, as deep as the path goes.
2. The components of the last level appear grouped under headings such as create, primitives or booleans.
3. Click a component to add it. Click the category's icon again to close the palette.

A component's path is printed on its node, for example `occt.shapes.solid.createCube`. It is where the component sits in the palette, the name to type into search, and the function you would call in the [TypeScript editor](../../typescript/intro.md). Click it to open the component's page in the API documentation.

## Beta and Deprecated

Some components carry a badge, in the palette, in search and on the node:

- **Beta:** the component is new, and what it takes or returns may still change.
- **Deprecated:** the component will be removed in a future version. Its description names what to use instead.

A script that uses either says so when it opens, so you know before something changes under you.

## Copy a node

The copy button in a node's title puts a duplicate beside your pointer, with the same values but no wires. The close button next to it deletes the node and its wires. [Nodes, wires and values](./nodes-and-wires.md) explains the rest of a node.
