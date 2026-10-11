---
sidebar_position: 4
title: "Replicate: a part on every hole"
sidebar_label: Replicate
description: Place a Designer component on every connector of a set in one step, such as a screw in every hole of a flange, so the copies follow when holes are added, moved or taken away.
topic: designer.assemblies.replicate
type: how-to
verified: 2026-10-09
tags: [designer]
---

# Replicate: a part on every hole

A flange with eight bolt holes needs eight bolts. Rather than eight components and eight joints, <Ui>Replicate</Ui> places one component on every connector of a [connector set](./connectors.md#a-connector-per-hole): its own connector is fastened to each member of the set.

## Replicate a component

1. Insert the component once, such as a screw.
2. Select it, and choose <Ui>Replicate</Ui> in <Ui>Properties</Ui>, or <Ui>Insert</Ui> > <Ui>Replicate</Ui>.
3. Choose its connector, the one that sits on each hole, such as the underside of a screw's head.
4. Choose the component and the connector set to place it on.

{/* shot: designer.assemblies.replicate/set */}

The component now stands on every hole. The <Ui>Components</Ui> group shows it once, with how many it places, such as "×4", and its occurrences fold open under it. The picture shows the desk arm's base screws: one screw component on the four holes of the base's `bolts` set, each set two millimetres down its hole by an <Ui>Offset</Ui> of -2.

## Adjust the copies

Under <Ui>Replicated</Ui>, <Ui>Properties</Ui> keeps what you chose, with <Ui>Angle</Ui>, <Ui>Offset</Ui> and <Ui>Flip</Ui> applied to every copy on its own hole's axis. The copies share the component's own parameters, so a longer screw is longer in every hole.

Because the copies follow the set, a hole added to the flange gets its screw, and a hole taken away loses it, without a change to the assembly.

## Stop replicating

<Ui>Stop replicating</Ui> places the component once again, where its part document has it, so you can join it by hand.

A component is placed by replicate or by a [pattern](./patterns.md), not both. A replicated component has no one place, so no joint can move it or be joined to it, and it is replicated onto a component placed once.
