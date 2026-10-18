---
sidebar_position: 1
title: "Components and sub-assemblies"
sidebar_label: Components
description: Place parts in a Designer assembly as components, give each its own sizes, place whole assemblies as sub-assemblies, move a component, and open the document a component comes from to change it.
topic: designer.assemblies.components
type: how-to
verified: 2026-10-15
tags: [designer]
---

# Components and sub-assemblies

An assembly document has no geometry of its own. It places parts from part documents as components, and other assemblies as sub-assemblies, then holds them together with [joints](./joints.md). Start one with <Ui>File</Ui> > <Ui>New assembly</Ui>.

## Insert a component

<Shot id="designer.assemblies.components/insert" />

Choose <Ui>Insert</Ui> > <Ui>Insert component</Ui>, or the toolbar button. <Ui>Insert a part</Ui> in <Ui>Properties</Ui> lists every part of the project's part documents, and every other assembly; click one to place it. It lands beside what is already there, ready to be joined.

One part document can be placed many times, and in many assemblies. The bill of materials counts each placement.

## Gears as parts

[<Ui>File</Ui> > <Ui>New gear part</Ui>](../reference/commands.md#designer-file-new-gear-part) adds a part document for a spur gear whose module, teeth, width, bore and backlash are its parameters, with an `axis` connector at the centre of the face it stands on. Run in an assembly, it places the gear there too. Each component then sets its own teeth in its sizes, so one document makes both gears of a pair. Join each gear by its `axis` to the part it turns on with a revolute joint, half the module times their teeth added together apart, and give the joints' angles from one parameter, such as `turn`: the first `turn`, the second the other way by the ratio of their teeth, with 180 divided by its own teeth added so the teeth fall into each other's gaps. For 20 and 30 teeth that is `turn` and `180 / 30 - turn * 20 / 30`.

## Standard parts

<Ui>File</Ui> also makes part documents for the parts a machine is bolted and turned with, each one feature that the kernel's standard parts build, sized by its parameters, with its connectors on the faces that part names:

| Command | Part | Parameters | Connectors |
|---|---|---|---|
| [<Ui>New screw part</Ui>](../reference/commands.md#designer-file-new-screw-part) | ISO 4762 socket head cap screw | `size` (M1.6 to M24), `length` | `seat`, under the head |
| [<Ui>New bolt part</Ui>](../reference/commands.md#designer-file-new-bolt-part) | ISO 4014 hex bolt | `size`, `length` | `seat` |
| [<Ui>New nut part</Ui>](../reference/commands.md#designer-file-new-nut-part) | ISO 4032 hex nut | `size` | `seat`, `top` |
| [<Ui>New washer part</Ui>](../reference/commands.md#designer-file-new-washer-part) | ISO 7089 plain washer | `size` | `seat`, `top` |
| [<Ui>New bearing part</Ui>](../reference/commands.md#designer-file-new-bearing-part) | deep groove ball bearing, rings, balls and cage | `designation` (623 to 6210) | `inner` and `outer`, on the rings' sides |
| [<Ui>New spring part</Ui>](../reference/commands.md#designer-file-new-spring-part) | compression spring, ends closed and ground | `wireDiameter`, `diameter`, `activeCoils`, `length` | `bottom`, `top` |
| [<Ui>New key part</Ui>](../reference/commands.md#designer-file-new-key-part) | DIN 6885 parallel key | `shaftDiameter`, `length` | `bottom` |

Run in an assembly, each places its part too. Threads are drawn at the screw's full diameter and named, not cut, so a screw in its tapped hole or nut touches it without overlapping; the clash check leaves out a thread resting on a thread, whether or not a joint holds the two. One document serves every size: each component sets its own `size` and `length` under its sizes, and the part number, such as `ISO 4762 M8x25`, follows them into the bill of materials. A spring's `length` set by an expression of the assembly's parameters compresses it as the parameter that drives its joints changes. [Fasten](./replicate.md#fasten-a-screw-in-every-hole-at-once) puts screws in a hole set in one step.

## A component's own sizes

<Shot id="designer.assemblies.components/component" />

The <Ui>Components</Ui> group nests each component under the one a joint holds it to, with the joint's type beside it, so the tree reads like the assembly's chain. Select a component there, or click it in the view, and <Ui>Properties</Ui> shows it:

- the part it places, and the joints that hold it;
- <Ui>Its parameters</Ui>: the part document's parameters, each left empty to take the document's value or given this component's own. The value can be an expression of the assembly's parameters, so one assembly parameter can size several parts.

The picture shows the desk arm's upper arm: a component of the link document with its own `length`, 160. The forearm places the same document shorter and slimmer, at a `length` of 130 and a `width` of 14.

## Move a component

A component that no joint places can be moved: the gizmo in the view moves and turns it, and <Ui>At</Ui> in <Ui>Properties</Ui> takes its position exactly. A component a joint places says so, and moves when the joint does; change the joint, or remove it, to move it by hand.

## Sub-assemblies

Place an assembly document the same way, and it becomes a sub-assembly: one component that carries its own components and joints, and moves as one. The jet engine is built this way: its two spools, the two halves of its casing and its stand are sub-assemblies of the top one. A sub-assembly's rows fold open in the <Ui>Components</Ui> group.

In the view, a click picks the top-level component; <Ui>Select one level deeper</Ui> goes down through each sub-assembly to the part.

## Change the part itself

<Ui>Open its document</Ui> opens the part document a component comes from, with that part selected, to change its features. Every component of that document follows when you come back.

<Ui>Remove</Ui> takes the component out of the assembly with the joints that hold it.
