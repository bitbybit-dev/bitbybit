---
sidebar_position: 1
slug: /designer/tutorials/desk-arm/base
title: "Model a desk robot arm: the base"
sidebar_label: 1. The base
description: The first chapter of the desk arm - a pedestal revolved from half its section, four counterbored holes in its ledge, its material, and the two connectors where the shoulder sits and its screws go.
topic: designer.tutorials.desk-arm.base
type: tutorial
verified: 2026-10-12
tags: [designer]
---

# Model a desk robot arm: the base

The base is the part everything else stands on. It is round, so it is drawn as half its section and revolved, the quickest way to model anything that turns about an axis. It also gets the arm's first connectors, the named places an assembly attaches parts to.

Each step shows the Designer as you make it: a feature's dialog filled in with the step's values, with the tutorial card ringing <Ui>OK</Ui>, or what the step made. The first time a command appears, a picture shows where it is. The step numbers match the card's in <Ui>Help</Ui> > <Ui>Tutorials</Ui>.

{/* steps:start - generated from the tutorial the Designer plays; edits between these markers are overwritten */}

1. **[New part](../../reference/commands.md#designer-file-new-part)**, from <Ui>File</Ui> > <Ui>New part</Ui>: name Base.

   The base is a revolved pedestal: draw half its profile on the XY plane, then revolve it a full turn about its axis. Four counterbored holes go in its ledge, and two connectors mark where the turntable sits and where its screws go.

   <Shot id="designer.tutorials.desk-arm/where-file-new-part" />

   <Shot id="designer.tutorials.desk-arm/step-1" />

2. **[Sketch](../../reference/commands.md#designer-part-sketch)**, from <Ui>Insert</Ui> > <Ui>Sketch</Ui>: id profile, on the XY plane, start 0, 0.

   Draw half the base's section on the XY plane, outwards from the axis: the floor, a toe with a rounded corner, the ledge the screws go through, a gently curved flank, the collar and the top. The sketch closes back down the axis.

   <Shot id="designer.tutorials.desk-arm/where-part-sketch" />

   <Shot id="designer.tutorials.desk-arm/step-2" />

3. **[Revolve](../../reference/commands.md#designer-part-revolve)**, from <Ui>Insert</Ui> > <Ui>Revolve</Ui>: id base, profile profile, angle 360.

   Revolve the section a full turn about the vertical axis. The half section sweeps round into the solid pedestal.

   <Shot id="designer.tutorials.desk-arm/where-part-revolve" />

   <Shot id="designer.tutorials.desk-arm/step-3" />

4. **[Hole](../../reference/commands.md#designer-part-hole)**, from <Ui>Insert</Ui> > <Ui>Hole</Ui>: id mounts, body base, on the side face of base, diameter 5.

   Drill four counterbored holes through the ledge, one on each diagonal, so the screw heads sit below its surface.

   <Shot id="designer.tutorials.desk-arm/where-part-hole" />

   <Shot id="designer.tutorials.desk-arm/step-4" />

5. **[Part properties](../../reference/commands.md#designer-product-set-part)**, from the <Ui>Properties</Ui> panel: id base, name Base, material aluminium-6061, color #2a2d31, metallic 0.6, roughness 0.3.

   Name the part Base and give it its material and look: dark anodised aluminium.

   <Shot id="designer.tutorials.desk-arm/step-5" />

6. **[Add connector](../../reference/commands.md#designer-product-add-connector)**, from <Ui>Insert</Ui> > <Ui>Add connector</Ui>: part base, id top, on the side face of base.

   Add a connector on the top face. It marks where the shoulder sits, and the yaw joint will turn about it.

   <Shot id="designer.tutorials.desk-arm/where-product-add-connector" />

   <Shot id="designer.tutorials.desk-arm/step-6" />

7. **[Add connector](../../reference/commands.md#designer-product-add-connector)**, from <Ui>Insert</Ui> > <Ui>Add connector</Ui>: part base, id bolts, on the side face of base, axis the wall face of mounts.

   Add a connector on the ledge, its axis along the holes' walls. A screw replicated onto it lands in every hole.

   <Shot id="designer.tutorials.desk-arm/step-7" />

<Shot id="designer.tutorials.desk-arm/base" />

{/* steps:end */}
