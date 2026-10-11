---
sidebar_position: 6
title: "Inspect an assembly: parts list, clashes and mass"
sidebar_label: Inspect
description: Check a Designer assembly - the bill of materials that counts every part through every level, the clash check that finds parts that overlap or come too close, and the volume and mass of each part.
topic: designer.assemblies.inspect
type: how-to
verified: 2026-10-09
tags: [designer]
---

# Inspect an assembly: parts list, clashes and mass

## Bill of materials

<Shot id="designer.assemblies.inspect/bom" />

The dock's <Ui>Bill of materials</Ui> tab lists every part the assembly places, with its <Ui>Quantity</Ui>, counted through every sub-assembly, [replicate](./replicate.md) and [pattern](./patterns.md). It follows the assembly as you change it.

A part placed at different sizes is a different part to make, so it has a line for each: the desk arm's long upper arm and short forearm come from one link document, and are two lines. The same goes for the screws of different lengths.

## Check clashes

<Shot id="designer.assemblies.inspect/clashes" />

<Ui>Check clashes</Ui>, in <Ui>Inspect</Ui>, on the toolbar or in the dock's <Ui>Clashes</Ui> tab, builds the assembly as it stands and lists every pair of parts that:

- **overlap**, with the volume they share, which is almost always a mistake;
- **touch**, which can be right, such as a screw head on its seat;
- come closer than the <Ui>Clearance</Ui> you set, in the document's length unit. With 0, only overlaps and touches are listed.

A touch that a joint asks for, two parts meeting at their connectors, is left out. Click a clash to see the two parts in the view. Check again after a change: the list shows the assembly as it was when you checked, in the pose it was in, so try each [configuration](./joints.md#pose-the-assembly) that matters.

## Volume and mass

Select a part in its part document to see its volume, and its mass from its [material](../modelling/parts.md)'s density.
