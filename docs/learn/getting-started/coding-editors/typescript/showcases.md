---
sidebar_position: 3
slug: /getting-started/typescript/showcases
title: TypeScript Showcases
sidebar_label: Showcases
description: Larger TypeScript scripts - a detailed drone of many files, a hexagon hive, an advanced loft and a twisted polygon ornament - with what each one shows, the script file to download and open, and the page that explains it in every editor.
topic: typescript.start.showcases
type: landing
verified: 2026-10-10
tags: [getting-started, typescript, occt]
---

# Showcases

Scripts larger than a tutorial, each written in TypeScript and explained step by step on its own pages. Download a script and open it with <Ui>More</Ui> > <Ui>Import</Ui> in a [TypeScript editor](https://bitbybit.dev/app?editor=typescript), press <Ui>Run The Code</Ui>, then change its numbers and run again.

## Drone

<Shot id="typescript.start.showcases/drone" />

A quadcopter with every part a real one has: a carbon frame with hexagon vents, arms with cut-outs, motors with cooling slots, two-blade propellers that alternate their spin, bolts, lights, a canopy traced with a honeycomb and the bitbybit logo on its hatch, sprung landing legs, a GPS mast and a camera on its gimbal. Four numbers in `sizes.ts` size it; change the arms to six or eight and it rebuilds. The script is many files: each part is a function in a file of its own, a folder holds the arm's, and `main.ts` puts them together.

[How it is built](./tutorials/drone/frame.mdx), step by step over seven chapters.

<Download id="typescript.start.showcases/drone-script" />

## Hexagon hive

<Shot id="typescript.start.showcases/hive" />

A honeycomb of hollow hexagonal cells, each with outer walls and an inner cavity, each raised to its own height. A grid of hexagon wires gives the cells, OCCT makes faces from them and extrudes each one to a height of its own.

[How it is built](../../../code/common/occt/modeling/hollow-shapes/hexagon-hive.md), in Rete, Blockly and TypeScript.

<Download id="typescript.start.showcases/hive-script" />

## Advanced loft

<Shot id="typescript.start.showcases/loft" />

A vessel-like form lofted through several wires of different sizes, with the loft's advanced options choosing how the surface runs between them.

[How it is built](../../../code/common/occt/operations/advanced-loft.md), in Rete, Blockly and TypeScript.

<Download id="typescript.start.showcases/loft-script" />

## Twisted polygon ornament

<Shot id="typescript.start.showcases/ornament" />

Hexagonal wires scaled and turned a little more at each level, then lofted into a twisted solid ready for 3D printing.

[How it is built](../../../code/common/occt/modeling/festive-decor/twisted-polygon-ornament.md), in Rete, Blockly and TypeScript.

<Download id="typescript.start.showcases/ornament-script" />
