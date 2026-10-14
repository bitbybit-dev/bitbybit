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

## Measure

Pick a face or an edge and the selection panel measures it: an edge's length, a face's area, and the radius and diameter of a circle, a cylinder or a sphere, with a circle's centre. <kbd>Shift</kbd>+click a second one and it measures the shortest distance between them, drawn as a line in the view when they do not touch, with its parts along X, Y and Z, and the angle between two flat faces or two straight edges. In an assembly, picks on different parts are measured where the assembly places them.

<Ui>Measure</Ui>, in <Ui>Inspect</Ui> or on the toolbar, puts the same values in the status bar, and agents run it as `view.measure`. It works in part documents too, and visitors who open a shared design can measure it.

## Section view

<Ui>Section view</Ui>, in <Ui>Inspect</Ui>, on the toolbar or on <kbd>X</kbd>, cuts the view with a plane so you can look inside. It starts square to the axis you look along, through the middle of the model, and hides the half nearer to you.

The section bar at the bottom of the view sets it: X, Y or Z stands the plane square to that axis, the slider or a typed offset in the document's length unit moves it, <Ui>Flip</Ui> hides the other side, and <Ui>Close</Ui> turns it off. Where the plane cuts a part, the cut is filled in a darker shade of the part's colour; it is the kernel's own cut, so it shows holes and walls exactly, and it follows the plane once the plane stops moving.

Clicks, hovers and measurements reach only what is shown: a click lands on what you see through the cut, and a filled cut takes no pick. A section changes the view, never the document, and goes off when another document opens. Agents run it as `view.section` with `axis`, `offset`, `flip` or `off`, and visitors who open a shared design can use it too.
