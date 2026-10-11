---
sidebar_position: 7
slug: /getting-started/rete/flow
title: Flow and Interactivity in Rete
sidebar_label: Flow and Interactivity
description: Rete's flow components - start, triggers, keys and mouse buttons, intervals and delays, counters, gates, loops and the render loop - how their green action wires run a script step by step and over time, and why such scripts cannot be exported to a runner yet.
topic: rete.nodes.flow
type: explanation
verified: 2026-10-11
tags: [getting-started, rete]
---

# Flow and interactivity

Most Rete scripts are **data flow**: values travel along the wires, and a component runs when its inputs change. That is enough to build any model. Some scripts also need to happen **over time** or **on an event**: spin a part on every frame, count clicks, add a shape each second, react to a key. For that, Rete has flow components, under <Ui>flow</Ui> in the palette.

## Action wires

Flow components have action sockets beside their data sockets: small arrows instead of circles. The wires between them are drawn green, dashed and moving, so you can tell them from data wires at a glance. An action wire does not carry a value; it carries the moment: when the component on its left fires, the component on its right runs, reads the values on its data inputs at that moment, and fires its own action output in turn.

When a script has a <Ui>start</Ui> component, pressing <Ui>Run The Code</Ui> starts the flow from it, once. Without one, the script runs as data flow, as usual.

## The flow components

| Group | Component | What it does |
|---|---|---|
| actions | <Ui>start</Ui> | fires once, when the script runs |
| actions | <Ui>trigger</Ui> | fires each time you press its button |
| actions | <Ui>keyboard</Ui>, <Ui>mouse click</Ui> | fire when the chosen key or mouse button goes down or up |
| time | <Ui>interval</Ui> | fires at once and then every so many milliseconds, for ever or for a set number of times |
| time | <Ui>delay</Ui> | fires once, so many milliseconds after it is reached |
| counters | <Ui>counter</Ui>, <Ui>counter min max</Ui>, <Ui>counter steps</Ui> | count how often they are reached, by a step, between limits or through a list of values, and give the count as a number |
| logic | <Ui>flip flop</Ui> | fires its two outputs in turn |
| logic | <Ui>boolean gate</Ui>, <Ui>boolean gate silent</Ui>, <Ui>is undefined</Ui> | let the flow through one way or the other by a condition; the silent gate fires only when the condition changes |
| loops | <Ui>for loop</Ui>, <Ui>for each loop</Ui> | fire their body once for each number in a range or each item of a list, then fire when complete |
| babylon | <Ui>render</Ui> | fires on every frame the 3D view draws, with the milliseconds since the last one |
| babylon | <Ui>babylon observable listener</Ui>, <Ui>get event data</Ui> | fire when an object of the scene reports an event, such as a click on a GUI button, and read its data |
| babylon > gui | <Ui>button</Ui> | fires when a GUI button is clicked or pressed |
| babylon > scene | <Ui>pointer</Ui> | fires on pointer events in the 3D view: down, up, move, wheel, pick, tap and double tap |

A run starts a fresh scene, so intervals, render functions and key listeners from the run before are gone when you run again.

## Interactivity in the other editors

The same behaviours are plain code in TypeScript: `bitbybit.time.registerRenderFunction` runs a function on every frame, and BabylonJS observables report pointer and GUI events. Blockly's time category has blocks that run code later or at an interval, on keys and pointer events, and on BabylonJS observables.

## Export to runner

A [runner](/learn/runners/intro) cannot run a flow script yet. <Ui>Export to runner</Ui> refuses a script that uses flow components or action wires, and says so; remove them, keeping the data flow, to export. Scripts that change over time can still be run in the editor and shared as projects.
