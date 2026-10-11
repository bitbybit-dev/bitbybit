---
sidebar_position: 3
slug: /getting-started/blockly/showcases
title: Blockly Showcases
sidebar_label: Showcases
description: Larger Blockly scripts - a detailed drone, a hexagon hive, an advanced loft and a twisted polygon ornament - with what each one shows, the script file to download and open, and the page that explains it in every editor.
topic: blockly.start.showcases
type: landing
verified: 2026-10-10
tags: [getting-started, blockly, occt]
---

# Showcases

Scripts larger than a tutorial, each built in Blockly and explained step by step on its own pages. Download a script and open it with <Ui>More</Ui> > <Ui>Import</Ui> in a [Blockly editor](https://bitbybit.dev/app?editor=blockly), press <Ui>Run The Code</Ui>, then change its values and run again.

## Drone

<Shot id="blockly.start.showcases/drone" />

A quadcopter with every part a real one has: a carbon frame with hexagon vents, arms with cut-outs, motors with cooling slots, two-blade propellers that alternate their spin, bolts, lights, a canopy traced with a honeycomb and the bitbybit logo on its hatch, sprung landing legs, a GPS mast and a camera on its gimbal. Four variables size it; change the arms to six or eight and it rebuilds. Every part is a function, loops repeat parts around it and cut their holes, and async functions await the geometry they measure; the functions are collapsed, so the stacks that call them read like a list of parts.

[How it is built](./tutorials/drone/frame.mdx), step by step over seven chapters.

<Download id="blockly.start.showcases/drone-script" />

## Hexagon hive

<Shot id="blockly.start.showcases/hive" />

A honeycomb of hollow hexagonal cells, each with outer walls and an inner cavity, each raised to its own height. A grid of hexagon wires gives the cells, OCCT makes faces from them and extrudes each one to a height of its own.

[How it is built](../../../code/common/occt/modeling/hollow-shapes/hexagon-hive.md), in Rete, Blockly and TypeScript.

<Download id="blockly.start.showcases/hive-script" />

## Advanced loft

<Shot id="blockly.start.showcases/loft" />

A vessel-like form lofted through several wires of different sizes, with the loft's advanced options choosing how the surface runs between them.

[How it is built](../../../code/common/occt/operations/advanced-loft.md), in Rete, Blockly and TypeScript.

<Download id="blockly.start.showcases/loft-script" />

## Twisted polygon ornament

<Shot id="blockly.start.showcases/ornament" />

Hexagonal wires scaled and turned a little more at each level, then lofted into a twisted solid ready for 3D printing.

[How it is built](../../../code/common/occt/modeling/festive-decor/twisted-polygon-ornament.md), in Rete, Blockly and TypeScript.

<Download id="blockly.start.showcases/ornament-script" />
