---
sidebar_position: 2
title: "Connectors"
sidebar_label: Connectors
description: Mark where a Designer part attaches with connectors - on a flat face, on a hole's or a cylinder's axis, or at a circular edge's centre - and give a hole of several positions one connector per hole.
topic: designer.assemblies.connectors
type: how-to
verified: 2026-10-09
tags: [designer]
---

# Connectors

A connector marks a place on a part where an assembly can attach it: a point with a direction, such as the middle of a mounting face pointing out of it, or the axis of a hole. [Joints](./joints.md) join one part's connector to another's, and [Replicate](./replicate.md) places a part on every connector of a set.

Connectors belong to the part, in its part document, so every assembly that places the part can use them.

## Add a connector

{/* shot: designer.assemblies.connectors/add */}

In the part document, pick where the connector goes, then choose <Ui>Add connector</Ui> in the <Ui>Selection</Ui> panel or <Ui>Insert</Ui> > <Ui>Add connector</Ui>:

- **a flat face**: the connector sits at the face's middle, pointing out of it;
- **a hole's wall or a cylinder**: it sits where the axis crosses the face the hole starts from, along the axis;
- **a circular edge**: it sits at the circle's centre.

The status bar names the connector it added. Like every reference, a connector names its face by the feature that made it, so it stays in place when the part changes size.

## A connector per hole

{/* shot: designer.assemblies.connectors/part */}

On the wall of a hole drilled at several positions, <Ui>Add connector</Ui> makes a set: one connector per hole, named after the connector and the position. <Ui>Properties</Ui> lists the part's connectors with the feature each sits on, and a set's choice of <Ui>Every hole</Ui> or a single position. The picture shows the desk arm's base, whose `bolts` set has a connector in each of its four mounting holes; the assembly places a screw in every one with one [Replicate](./replicate.md).

<Ui>Remove</Ui> beside a connector takes it off the part. A joint that used it then says it is missing, in the assembly's <Ui>Problems</Ui> tab.
