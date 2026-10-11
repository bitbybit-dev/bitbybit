---
sidebar_position: 3
slug: /getting-started/rete/showcases
title: Rete Showcases
sidebar_label: Showcases
description: Larger Rete scripts - a detailed drone, a hexagon hive, an advanced loft and a twisted polygon ornament - with what each one shows, the script file to download and open, and the page that explains it.
topic: rete.start.showcases
type: landing
verified: 2026-10-10
tags: [getting-started, rete, occt]
---

# Showcases

Scripts larger than a tutorial, each built in Rete and explained step by step on its own pages. Download a script and open it with <Ui>More</Ui> > <Ui>Import</Ui> in a [Rete editor](https://bitbybit.dev/app?editor=rete), press <Ui>Run The Code</Ui>, then change its sliders and watch the model follow.

## Drone

<Shot id="rete.start.showcases/drone" />

A quadcopter with every part a real one has: a carbon frame with hexagon vents, arms with cut-outs, motors with cooling slots, two-blade propellers that alternate their spin, bolts, lights, a canopy traced with a honeycomb and the bitbybit logo on its hatch, sprung landing legs, a GPS mast and a camera on its gimbal. Three sliders size it; the arms slider rebuilds it with four, six or eight arms. Two modules repeat its parts around it, code components make the detailed parts, and every part sits in a group with a comment that says what it is.

[How it is built](./tutorials/drone/frame.mdx), step by step over seven chapters.

<Download id="rete.start.showcases/drone-script" />

## Hexagon hive

<Shot id="rete.start.showcases/hive" />

A honeycomb of hollow hexagonal cells, each with outer walls and an inner cavity, each raised to its own height. A grid of hexagon wires gives the cells, OCCT makes faces from them and extrudes each one to a height of its own.

[How it is built](../../../code/common/occt/modeling/hollow-shapes/hexagon-hive.md), in Rete, Blockly and TypeScript.

<Download id="rete.start.showcases/hive-script" />

## Advanced loft

<Shot id="rete.start.showcases/loft" />

A vessel-like form lofted through several wires of different sizes, with the loft's advanced options choosing how the surface runs between them.

[How it is built](../../../code/common/occt/operations/advanced-loft.md), in Rete, Blockly and TypeScript.

<Download id="rete.start.showcases/loft-script" />

## Twisted polygon ornament

<Shot id="rete.start.showcases/ornament" />

Hexagonal wires scaled and turned a little more at each level, then lofted into a twisted solid ready for 3D printing.

[How it is built](../../../code/common/occt/modeling/festive-decor/twisted-polygon-ornament.md), in Rete, Blockly and TypeScript.

<Download id="rete.start.showcases/ornament-script" />
