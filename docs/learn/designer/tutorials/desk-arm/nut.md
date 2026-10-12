---
sidebar_position: 8
slug: /designer/tutorials/desk-arm/nut
title: "Model a desk robot arm: the nut"
sidebar_label: 8. The nut
description: The eighth chapter of the desk arm - a hex nut parametric in its diameter, chamfered on both sides, for the bolts through the arm's three pivots.
topic: designer.tutorials.desk-arm.nut
type: tutorial
verified: 2026-10-12
tags: [designer]
---

# Model a desk robot arm: the nut

The nut is the last part, and parametric in its diameter like the screw, so it fits whatever bolt it is inserted for.

Each step shows the Designer as you make it: a feature's dialog filled in with the step's values, with the tutorial card ringing <Ui>OK</Ui>, or what the step made. The first time a command appears, a picture shows where it is. The step numbers match the card's in <Ui>Help</Ui> > <Ui>Tutorials</Ui>.

{/* steps:start - generated from the tutorial the Designer plays; edits between these markers are overwritten */}

112. **[New part](../../reference/commands.md#designer-file-new-part)**, from <Ui>File</Ui> > <Ui>New part</Ui>: name Nut.

     A hex nut, parametric in its diameter, for the bolts through the arm's pivots.

     <Shot id="designer.tutorials.desk-arm/step-112" />

113. **[Parameter](../../reference/commands.md#designer-parameter-add)**, from <Ui>Insert</Ui> > <Ui>Parameter</Ui>: name d, value 8, unit mm.

     Add the parameter d, 8 mm: the diameter of the bolt the nut fits.

     <Shot id="designer.tutorials.desk-arm/step-113" />

114. **[Change parameter](../../reference/commands.md#designer-parameter-set)**, from the <Ui>Properties</Ui> panel: name d, min 2, max 20.

     Give d its range, 2 to 20 mm: the values the design is drawn for.

     <Shot id="designer.tutorials.desk-arm/step-114" />

115. **[Sketch](../../reference/commands.md#designer-part-sketch)**, from <Ui>Insert</Ui> > <Ui>Sketch</Ui>: id hex, on the XZ plane, start 0.92 \* d, 0.

     Sketch the nut's hexagon on the ground plane.

     <Shot id="designer.tutorials.desk-arm/step-115" />

116. **[Extrude](../../reference/commands.md#designer-part-extrude)**, from <Ui>Insert</Ui> > <Ui>Extrude</Ui>: id nut, profile hex, distance 0.8 \* d.

     Extrude it 0.8 d.

     <Shot id="designer.tutorials.desk-arm/step-116" />

117. **[Chamfer](../../reference/commands.md#designer-part-chamfer)**, from <Ui>Insert</Ui> > <Ui>Chamfer</Ui>: id topBevel, body nut, distance 0.08 \* d.

     Chamfer the six top edges.

     <Shot id="designer.tutorials.desk-arm/step-117" />

118. **[Chamfer](../../reference/commands.md#designer-part-chamfer)**, from <Ui>Insert</Ui> > <Ui>Chamfer</Ui>: id underBevel, body nut, distance 0.08 \* d.

     Chamfer the six bottom edges.

     <Shot id="designer.tutorials.desk-arm/step-118" />

119. **[Hole](../../reference/commands.md#designer-part-hole)**, from <Ui>Insert</Ui> > <Ui>Hole</Ui>: id bore, body nut, on the end face of nut, diameter d.

     Drill the bore through the middle, d across.

     <Shot id="designer.tutorials.desk-arm/step-119" />

120. **[Part properties](../../reference/commands.md#designer-product-set-part)**, from the <Ui>Properties</Ui> panel: id nut, name Nut, material steel, color #1d1f22, metallic 0.85, roughness 0.35.

     Name the part Nut: black steel.

     <Shot id="designer.tutorials.desk-arm/step-120" />

121. **[Add connector](../../reference/commands.md#designer-product-add-connector)**, from <Ui>Insert</Ui> > <Ui>Add connector</Ui>: part nut, id seat, on the start face of nut, axis the wall face of bore.

     Add a connector on the underside, its axis along the bore.

     <Shot id="designer.tutorials.desk-arm/step-121" />

<Shot id="designer.tutorials.desk-arm/nut" />

{/* steps:end */}
