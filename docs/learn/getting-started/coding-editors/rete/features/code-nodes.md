---
sidebar_position: 6
slug: /getting-started/rete/typescript-editor-component
title: Code Nodes in Rete
sidebar_label: Code Nodes
description: How to write TypeScript, JavaScript or JSON inside a Rete node - what the node receives in inputs, what it gives out, how to run and copy its code - and when a few lines of code are clearer than a graph.
topic: rete.nodes.code
type: how-to
verified: 2026-10-10
tags: [getting-started, rete, typescript]
---

# Code nodes

Some things are easier to say in a few lines of code than in a dozen nodes: a formula, a loop with a condition, reshaping data. Rete has three components that hold code: <Ui>typescript editor</Ui>, <Ui>javascript editor</Ui> and <Ui>json editor</Ui>. Search for them by name, or open the code category of the palette.

## Write the code

{/* shot: rete.nodes.code/editor */}

A typescript editor node holds one function, whose name ends with the node's own id, and its first line says not to remove it:

```typescript
// DO NOT REMOVE THIS FUNCTION
const start3f9a2c41d07b6e15 = async (inputs: any, index: number) => {
    // ADD YOUR CODE HERE
    return inputs;
}
```

- **`inputs`** is what arrives on the node's <code>inputs</code> socket: wire anything into it, several wires included.
- **What the function returns** leaves through the node's <code>result</code> socket, to be wired onwards like any output.
- **`index`** counts the runs when the node [runs once per item](./lists.md) of a list.
- **`bitbybit`** is there as in the [TypeScript editor](../../typescript/intro.md), with the same suggestions as you type, so the code can call any function of the API.

The node runs its code whenever its input changes, like any other node; ▶ runs it at once. The buttons under the code download it or copy it, and the corner of the editor resizes it.

The javascript editor works the same way without the types, and the json editor holds JSON data to pass along the graph.

## Graph or code?

Both, as suits the moment. A graph shows how data flows and lets anyone change a value and see what follows, which is why most of a script reads best as nodes. A code node earns its place where the logic is dense: a calculation with many terms, a loop that stops on a condition, a list reshaped in ways no single component does. When a whole script wants to be code, move to the [TypeScript editor](../../typescript/intro.md), which calls the same functions the nodes do.
