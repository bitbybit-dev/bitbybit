---
sidebar_position: 4
title: Changing the Scene Every Frame
sidebar_label: Every Frame
description: How a Bitbybit script runs code on every frame the 3D view draws, for spinning parts and other animation - bitbybit.time in TypeScript, the render component in Rete and the render loop block in Blockly - and how to keep the work per frame small.
topic: code.draw.frame-loop
type: explanation
tags: [code, draw]
---

# Changing the scene every frame

A script usually runs once: it builds the model, draws it and stops. To make something move, a propeller that spins or a part that slides open, the script has to run a little code again on every frame the 3D view draws. `bitbybit.time` is that hook.

## In TypeScript

`bitbybit.time.registerRenderFunction` takes a function and calls it on every frame, with the milliseconds since the frame before. Scale every movement by that time, so the motion has the same speed on a fast screen and a slow one:

```typescript
const blade = await bitbybit.occt.shapes.solid.createBox({ width: 6, length: 0.6, height: 0.2, center: [0, 0, 0] });
const mesh = await bitbybit.draw.drawAnyAsync({ entity: blade });
const turnsPerSecond = 0.5;
bitbybit.time.registerRenderFunction((timePassedMs) => {
    mesh.rotation.y += 2 * Math.PI * turnsPerSecond * timePassedMs / 1000;
});
```

What the function changes is the drawn mesh, a BabylonJS object, not the shape the kernel built. Moving a mesh costs nothing; rebuilding a shape every frame would be far too slow. [Meshes and nodes](../babylon/meshes-and-nodes) lists the ways to move them.

The function stays registered until the next run: <Ui>Run The Code</Ui> clears what the run before registered, so a script never piles up old animations ([How a script runs](/learn/getting-started/typescript/script-runtime)).

## In Rete

The flow components' <Ui>render</Ui> component fires on every frame, with the milliseconds since the last one, and its action wire runs the components connected to it. [Flow and interactivity](/learn/getting-started/rete/flow) shows it with the other flow components.

## In Blockly

The time category's **register render loop listener** block runs the blocks inside it on every frame, and sets a variable to the milliseconds since the last one.

## Keep each frame small

A frame has about 16 milliseconds at 60 frames per second, and the view draws the scene in the same time. Work out what does not change before the loop, and inside it only move, turn, scale or recolour what is already drawn.

## Every function

{/* api:time:start - generated from the API index; edits between these markers are overwritten */}

| Function | What it does |
|---|---|
| [`registerRenderFunction`](https://docs.bitbybit.dev/classes/Bit.Time#registerRenderFunction) | Registers a function to run on every rendered frame, for animation; it receives the milliseconds elapsed since the previous frame, so movement can be scaled by it. |

{/* api:time:end */}
