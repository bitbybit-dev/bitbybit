---
sidebar_position: 4
title: "Replicate: a part on every hole"
sidebar_label: Replicate
description: Place a Designer component on every connector of a set in one step, such as a screw in every hole of a flange, so the copies follow when holes are added, moved or taken away.
topic: designer.assemblies.replicate
type: how-to
verified: 2026-10-19
tags: [designer]
---

# Replicate: a part on every hole

A flange with eight bolt holes needs eight bolts. Rather than eight components and eight joints, <Ui>Replicate</Ui> places one component on every connector of a [connector set](./connectors.md#a-connector-per-hole): its own connector is fastened to each member of the set.

## Replicate a component

1. Insert the component once, such as a screw.
2. Select it, and choose <Ui>Replicate</Ui> in <Ui>Properties</Ui>, or <Ui>Insert</Ui> > <Ui>Replicate</Ui>.
3. Choose its connector, the one that sits on each hole, such as the underside of a screw's head.
4. Choose the component and the connector set to place it on.

<Shot id="designer.assemblies.replicate/set" />

The component now stands on every hole. The <Ui>Components</Ui> group shows it once, with how many it places, such as "×4", and its occurrences fold open under it. The picture shows the desk arm's base screws: one screw component on the four holes of the base's `bolts` set, each set two millimetres down its hole by an <Ui>Offset</Ui> of -2.

## Fasten: a screw in every hole at once

{/* shot: designer.assemblies.components/fasten */}

[<Ui>Insert</Ui> > <Ui>Fasten</Ui>](../reference/commands.md#designer-assembly-fasten) does the steps above for a standard screw or bolt. Select the component whose holes take the screws, or name it and its connector set, and it places a [standard screw part](./components.md#standard-parts) replicated onto the set. The size comes from the holes: a hole made by its fastener, such as `M8` with a normal fit, gives the screw its `M8`, also when a parameter gives the size. The length is the screw part's own unless you name one, and a size you name wins over the holes'. Holes drilled for a socket head (the fastener's `head` set to `socket`) have the counterbore DIN 974-1 gives it, and Fasten sinks each screw into it, its head half a millimetre below the face, when the connector set is on the face the holes open from. A component with several hole sets needs the set named. One <Ui>Undo</Ui> takes the fastening back. The first fasten adds the screw's part document; every one after places the same document again with its own size and length, so the bill of materials counts each size apart. Agents run it as `assembly.fasten` with `to`, and `kind` `bolt` for a hex bolt.

## Adjust the copies

Under <Ui>Replicated</Ui>, <Ui>Properties</Ui> keeps what you chose, with <Ui>Angle</Ui>, <Ui>Offset</Ui> and <Ui>Flip</Ui> applied to every copy on its own hole's axis. The copies share the component's own parameters, so a longer screw is longer in every hole.

Because the copies follow the set, a hole added to the flange gets its screw, and a hole taken away loses it, without a change to the assembly.

## Stop replicating

<Ui>Stop replicating</Ui> places the component once again, where its part document has it, so you can join it by hand.

A component is placed by replicate or by a [pattern](./patterns.md), not both. A replicated component has no one place, so no joint can move it or be joined to it, and it is replicated onto a component placed once.
