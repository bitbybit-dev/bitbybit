---
sidebar_position: 5
title: "Patterns of components"
sidebar_label: Patterns
description: Place copies of a Designer component around an axis or along a direction, such as a row of fan blades, with the count and spacing written as expressions and every copy counted in the bill of materials.
topic: designer.assemblies.patterns
type: how-to
verified: 2026-10-09
tags: [designer]
---

# Patterns of components

A fan has twenty-two blades, a bearing thirty-six balls. A pattern places copies of one component, turned about an axis or stepped along a direction, and keeps them as one row of the assembly. It is the assembly's counterpart of a part's [linear and polar patterns](../modelling/features.md#combining-bodies-and-patterns), with whole components instead of fused bodies.

## Pattern a component

1. Place the component once, where the first copy goes.
2. Select it, and choose <Ui>Pattern</Ui> in <Ui>Properties</Ui>, or <Ui>Insert</Ui> > <Ui>Pattern</Ui>. A polar pattern about the up axis starts, which you then change.
3. Under <Ui>Pattern</Ui>, choose its kind and fill in its fields:
   - **<Ui>Polar, about an axis</Ui>**: <Ui>Axis through</Ui> a point and <Ui>Axis direction</Ui>, the <Ui>Count</Ui> of copies, the <Ui>Angle</Ui> they spread over (a whole turn when empty) and the <Ui>Start</Ui> angle of the first;
   - **<Ui>Linear, along a direction</Ui>**: the <Ui>Direction</Ui>, the <Ui>Spacing</Ui> between copies and their <Ui>Count</Ui>.

{/* shot: designer.assemblies.patterns/fan */}

Every number can be an expression of the assembly's parameters, so a count can follow a size. The picture shows the jet engine's fan rotor: one fan blade component, patterned twenty-two times about the engine's axis, and selected so all twenty-two glow.

## In the tree and the bill of materials

The <Ui>Components</Ui> group shows a patterned component once, with its count, such as "×22"; its copies fold open under it. The [bill of materials](./inspect.md) counts every copy.

<Ui>Stop patterning</Ui> places the component once again.

## What a pattern cannot do

A pattern places copies; it does not join them. So a patterned component cannot be moved by a joint, nor can another component be joined to one of its copies. To make the copies move, pattern them inside an assembly and join that assembly, as the jet engine does: its blade rows are patterned inside the spools, and a revolute joint turns each spool. A component is placed by a pattern or by [replicate](./replicate.md), not both, and a count is a whole number from 1 to 1000.
