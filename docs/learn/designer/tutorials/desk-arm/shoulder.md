---
sidebar_position: 2
slug: /designer/tutorials/desk-arm/shoulder
title: "Model a desk robot arm: the shoulder"
sidebar_label: 2. The shoulder
description: The second chapter of the desk arm - a clevis cheek extruded, given a hub and rounded, mirrored into a pair, and joined to a revolved drum, with the pivot hole and four connectors.
topic: designer.tutorials.desk-arm.turntable
type: tutorial
verified: 2026-10-12
tags: [designer]
---

# Model a desk robot arm: the shoulder

The shoulder turns on the base and carries the upper link between its two cheeks. Only one cheek is modelled: a mirror makes the other, hub and rounding included, so the two can never differ.

Each step shows the Designer as you make it: a feature's dialog filled in with the step's values, with the tutorial card ringing <Ui>OK</Ui>, or what the step made. The first time a command appears, a picture shows where it is. The step numbers match the card's in <Ui>Help</Ui> > <Ui>Tutorials</Ui>.

{/* steps:start - generated from the tutorial the Designer plays; edits between these markers are overwritten */}

8. **[New part](../../reference/commands.md#designer-file-new-part)**, from <Ui>File</Ui> > <Ui>New part</Ui>: name Shoulder.

   The shoulder is a drum with a clevis: one lug is extruded, given a hub and rounded, then mirrored, and the drum is revolved and joined to it. A hole runs through the hubs for the shoulder bolt.

   {/* shot: designer.tutorials.desk-arm/step-8 */}

9. **[Sketch](../../reference/commands.md#designer-part-sketch)**, from <Ui>Insert</Ui> > <Ui>Sketch</Ui>: id lug, on the XY plane, start -32, 2.

   Sketch one cheek of the clevis on a plane 20 mm in front of the centre: a wide foot, flared sides rising into a tall arm, and a rounded crown where the shoulder bolt will go.

   {/* shot: designer.tutorials.desk-arm/step-9 */}

10. **[Extrude](../../reference/commands.md#designer-part-extrude)**, from <Ui>Insert</Ui> > <Ui>Extrude</Ui>: id lugA, profile lug, distance 9.

    Extrude the cheek 9 mm.

    {/* shot: designer.tutorials.desk-arm/where-part-extrude */}

    {/* shot: designer.tutorials.desk-arm/step-10 */}

11. **[Sketch](../../reference/commands.md#designer-part-sketch)**, from <Ui>Insert</Ui> > <Ui>Sketch</Ui>: id hub, on the start face of lugA.

    On the cheek's outer face, sketch a circle around the pivot: the hub the bolt head will sit on.

    {/* shot: designer.tutorials.desk-arm/step-11 */}

12. **[Boss](../../reference/commands.md#designer-part-boss)**, from <Ui>Insert</Ui> > <Ui>Boss</Ui>: id hubA, profile hub, body lugA, distance 3.

    Raise the circle 3 mm out of the face as a boss, joined to the cheek.

    {/* shot: designer.tutorials.desk-arm/where-part-boss */}

    {/* shot: designer.tutorials.desk-arm/step-12 */}

13. **[Fillet](../../reference/commands.md#designer-part-fillet)**, from <Ui>Insert</Ui> > <Ui>Fillet</Ui>: id lugOuter, body lugA, radius 2.

    Round the outer face's rim by 2 mm: the eight edges where it meets the sides.

    {/* shot: designer.tutorials.desk-arm/where-part-fillet */}

    {/* shot: designer.tutorials.desk-arm/step-13 */}

14. **[Fillet](../../reference/commands.md#designer-part-fillet)**, from <Ui>Insert</Ui> > <Ui>Fillet</Ui>: id lugInner, body lugA, radius 2.

    Round the inner face's rim the same way.

    {/* shot: designer.tutorials.desk-arm/step-14 */}

15. **[Fillet](../../reference/commands.md#designer-part-fillet)**, from <Ui>Insert</Ui> > <Ui>Fillet</Ui>: id hubRound, body lugA, radius 1.

    Round the hub's rim by 1 mm.

    {/* shot: designer.tutorials.desk-arm/step-15 */}

16. **[Mirror](../../reference/commands.md#designer-part-mirror)**, from <Ui>Insert</Ui> > <Ui>Mirror</Ui>: id fork, body lugA.

    Mirror the cheek across the middle plane. Its twin is the clevis's other side, with the same hub and the same rounding.

    {/* shot: designer.tutorials.desk-arm/where-part-mirror */}

    {/* shot: designer.tutorials.desk-arm/step-16 */}

17. **[Sketch](../../reference/commands.md#designer-part-sketch)**, from <Ui>Insert</Ui> > <Ui>Sketch</Ui>: id drum, on the XY plane, start 0, 0.

    Sketch half the drum's section on the XY plane: its seat, its wall with a rounded top corner, and its deck.

    {/* shot: designer.tutorials.desk-arm/step-17 */}

18. **[Revolve](../../reference/commands.md#designer-part-revolve)**, from <Ui>Insert</Ui> > <Ui>Revolve</Ui>: id turntable, profile drum, angle 360.

    Revolve the section a full turn into the drum the cheeks stand on.

    {/* shot: designer.tutorials.desk-arm/step-18 */}

19. **[Boolean](../../reference/commands.md#designer-part-boolean)**, from <Ui>Insert</Ui> > <Ui>Boolean</Ui>: id seat, body turntable, operation union, tools lugA.

    Unite the cheeks with the drum, so the shoulder is one solid.

    {/* shot: designer.tutorials.desk-arm/where-part-boolean */}

    {/* shot: designer.tutorials.desk-arm/step-19 */}

20. **[Hole](../../reference/commands.md#designer-part-hole)**, from <Ui>Insert</Ui> > <Ui>Hole</Ui>: id pivot, body turntable, on the end face of hubA, diameter 8.

    Drill the 8 mm pivot hole through both hubs.

    {/* shot: designer.tutorials.desk-arm/step-20 */}

21. **[Part properties](../../reference/commands.md#designer-product-set-part)**, from the <Ui>Properties</Ui> panel: id turntable, name Shoulder, material abs, color #eceef1, metallic 0, roughness 0.4.

    Name the part Shoulder and give it white ABS, the arm's plastic.

    {/* shot: designer.tutorials.desk-arm/step-21 */}

22. **[Add connector](../../reference/commands.md#designer-product-add-connector)**, from <Ui>Insert</Ui> > <Ui>Add connector</Ui>: part turntable, id bottom, on the side face of turntable.

    Add a connector on the drum's seat, the face that sits on the base's top connector.

    {/* shot: designer.tutorials.desk-arm/step-22 */}

23. **[Add connector](../../reference/commands.md#designer-product-add-connector)**, from <Ui>Insert</Ui> > <Ui>Add connector</Ui>: part turntable, id pivot, on the end face of lugA, axis the wall face of pivot.

    Add a connector on the cheek's inner face, its axis through the pivot hole. The upper link turns about it.

    {/* shot: designer.tutorials.desk-arm/step-23 */}

24. **[Add connector](../../reference/commands.md#designer-product-add-connector)**, from <Ui>Insert</Ui> > <Ui>Add connector</Ui>: part turntable, id boltFace, on the end face of hubA, axis the wall face of pivot.

    Add a connector on the mirrored hub's face, where the shoulder bolt's head will sit.

    {/* shot: designer.tutorials.desk-arm/step-24 */}

25. **[Add connector](../../reference/commands.md#designer-product-add-connector)**, from <Ui>Insert</Ui> > <Ui>Add connector</Ui>: part turntable, id nutFace, on the end face of hubA, axis the wall face of pivot.

    Add a connector on the first hub's face, where the nut goes.

    {/* shot: designer.tutorials.desk-arm/step-25 */}

{/* shot: designer.tutorials.desk-arm/turntable */}

{/* steps:end */}
