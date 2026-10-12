---
sidebar_position: 7
slug: /designer/tutorials/desk-arm/screw
title: "Model a desk robot arm: the screw"
sidebar_label: 7. The screw
description: The seventh chapter of the desk arm - a socket-head screw parametric in its diameter and length, so every bolt and screw in the arm is this one document at its own size.
topic: designer.tutorials.desk-arm.screw
type: tutorial
verified: 2026-10-12
tags: [designer]
---

# Model a desk robot arm: the screw

Every bolt and screw in the arm is this document. Its sizes are expressions of d and length, so the assembly can insert it at any diameter and length it needs.

Each step shows the Designer as you make it: a feature's dialog filled in with the step's values, with the tutorial card ringing <Ui>OK</Ui>, or what the step made. The first time a command appears, a picture shows where it is. The step numbers match the card's in <Ui>Help</Ui> > <Ui>Tutorials</Ui>.

{/* steps:start - generated from the tutorial the Designer plays; edits between these markers are overwritten */}

97. **[New part](../../reference/commands.md#designer-file-new-part)**, from <Ui>File</Ui> > <Ui>New part</Ui>: name Screw.

    A socket-head screw, parametric in its diameter and length, so every bolt in the arm is this one document.

    {/* shot: designer.tutorials.desk-arm/step-97 */}

98. **[Parameter](../../reference/commands.md#designer-parameter-add)**, from <Ui>Insert</Ui> > <Ui>Parameter</Ui>: name d, value 8, unit mm.

    Add the parameter d, 8 mm: the screw's diameter.

    {/* shot: designer.tutorials.desk-arm/step-98 */}

99. **[Change parameter](../../reference/commands.md#designer-parameter-set)**, from the <Ui>Properties</Ui> panel: name d, min 2, max 20.

    Give d its range, 2 to 20 mm: the values the design is drawn for.

    {/* shot: designer.tutorials.desk-arm/step-99 */}

100. **[Parameter](../../reference/commands.md#designer-parameter-add)**, from <Ui>Insert</Ui> > <Ui>Parameter</Ui>: name length, value 40, unit mm.

     Add the parameter length, 40 mm: how long its shank is.

     {/* shot: designer.tutorials.desk-arm/step-100 */}

101. **[Change parameter](../../reference/commands.md#designer-parameter-set)**, from the <Ui>Properties</Ui> panel: name length, min 4, max 120.

     Give length its range, 4 to 120 mm: the values the design is drawn for.

     {/* shot: designer.tutorials.desk-arm/step-101 */}

102. **[Sketch](../../reference/commands.md#designer-part-sketch)**, from <Ui>Insert</Ui> > <Ui>Sketch</Ui>: id shank, on the XZ plane.

     Sketch the shank on the ground plane: a circle d across.

     {/* shot: designer.tutorials.desk-arm/step-102 */}

103. **[Extrude](../../reference/commands.md#designer-part-extrude)**, from <Ui>Insert</Ui> > <Ui>Extrude</Ui>: id screw, profile shank, distance length.

     Extrude the shank length tall.

     {/* shot: designer.tutorials.desk-arm/step-103 */}

104. **[Sketch](../../reference/commands.md#designer-part-sketch)**, from <Ui>Insert</Ui> > <Ui>Sketch</Ui>: id crown, on the XZ plane.

     Sketch the head on a plane at the shank's top: a circle 1.6 d across.

     {/* shot: designer.tutorials.desk-arm/step-104 */}

105. **[Extrude](../../reference/commands.md#designer-part-extrude)**, from <Ui>Insert</Ui> > <Ui>Extrude</Ui>: id head, profile crown, distance 0.7 \* d, body screw.

     Extrude the head 0.7 d and join it to the shank.

     {/* shot: designer.tutorials.desk-arm/step-105 */}

106. **[Sketch](../../reference/commands.md#designer-part-sketch)**, from <Ui>Insert</Ui> > <Ui>Sketch</Ui>: id hex, on the end face of head, start 0.3 \* d, 0.

     On top of the head, sketch the hexagon of the key socket.

     {/* shot: designer.tutorials.desk-arm/step-106 */}

107. **[Pocket](../../reference/commands.md#designer-part-pocket)**, from <Ui>Insert</Ui> > <Ui>Pocket</Ui>: id drive, profile hex, body screw, distance 0.4 \* d.

     Pocket the socket 0.4 d deep.

     {/* shot: designer.tutorials.desk-arm/step-107 */}

108. **[Fillet](../../reference/commands.md#designer-part-fillet)**, from <Ui>Insert</Ui> > <Ui>Fillet</Ui>: id round, body screw, radius 0.08 \* d.

     Round the head's top rim.

     {/* shot: designer.tutorials.desk-arm/step-108 */}

109. **[Chamfer](../../reference/commands.md#designer-part-chamfer)**, from <Ui>Insert</Ui> > <Ui>Chamfer</Ui>: id lead, body screw, distance 0.1 \* d.

     Chamfer the tip of the shank, so the screw finds its hole.

     {/* shot: designer.tutorials.desk-arm/where-part-chamfer */}

     {/* shot: designer.tutorials.desk-arm/step-109 */}

110. **[Part properties](../../reference/commands.md#designer-product-set-part)**, from the <Ui>Properties</Ui> panel: id screw, name Screw, material steel, color #1d1f22, metallic 0.85, roughness 0.35.

     Name the part Screw: black steel.

     {/* shot: designer.tutorials.desk-arm/step-110 */}

111. **[Add connector](../../reference/commands.md#designer-product-add-connector)**, from <Ui>Insert</Ui> > <Ui>Add connector</Ui>: part screw, id seat, on the start face of head, axis the side face of screw.

     Add a connector under the head, its axis along the shank: where the head sits on what it holds. Replicating the screw onto a connector on a set of holes puts one copy in each.

     {/* shot: designer.tutorials.desk-arm/step-111 */}

{/* shot: designer.tutorials.desk-arm/screw */}

{/* steps:end */}
