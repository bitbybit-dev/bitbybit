---
sidebar_position: 6
slug: /designer/tutorials/desk-arm/jaw
title: "Model a desk robot arm: the jaw"
sidebar_label: 6. The jaw
description: The sixth chapter of the desk arm - a serrated finger drawn as one profile, a carriage that rides in the gripper's rail, two screw holes and the connector it slides on.
topic: designer.tutorials.desk-arm.jaw
type: tutorial
verified: 2026-10-19
tags: [designer]
---

# Model a desk robot arm: the jaw

One jaw document makes both jaws. Its teeth are part of its outline, so they come from a single sketch rather than a pattern.

Each step shows the Designer as you make it: a feature's dialog filled in with the step's values, with the tutorial card ringing <Ui>OK</Ui>, or what the step made. The first time a command appears, a picture shows where it is. The step numbers match the card's in <Ui>Help</Ui> > <Ui>Tutorials</Ui>.

{/* steps:start - generated from the tutorial the Designer plays; edits between these markers are overwritten */}

88. **[New part](../../reference/commands.md#designer-file-new-part)**, from <Ui>File</Ui> > <Ui>New part</Ui>: name Jaw.

    Each jaw is a serrated finger on a carriage that rides in the gripper's rail, held by two screws.

    <Shot id="designer.tutorials.desk-arm/step-88" />

89. **[Sketch](../../reference/commands.md#designer-part-sketch)**, from <Ui>Insert</Ui> > <Ui>Sketch</Ui>: id profile, on the XY plane, start 0, 0.

    Sketch the jaw's side: a block at the bottom, a finger tapering up from it, and eight teeth down its gripping face.

    <Shot id="designer.tutorials.desk-arm/step-89" />

90. **[Extrude](../../reference/commands.md#designer-part-extrude)**, from <Ui>Insert</Ui> > <Ui>Extrude</Ui>: id jaw, profile profile, distance 14.

    Extrude the side 14 mm.

    <Shot id="designer.tutorials.desk-arm/step-90" />

91. **[Sketch](../../reference/commands.md#designer-part-sketch)**, from <Ui>Insert</Ui> > <Ui>Sketch</Ui>: id carriage, on the XY plane, start 0.5, -5.

    Sketch the carriage under the jaw, the part that rides in the gripper's rail: a rectangle 13.5 by 7 mm.

    <Shot id="designer.tutorials.desk-arm/step-91" />

92. **[Extrude](../../reference/commands.md#designer-part-extrude)**, from <Ui>Insert</Ui> > <Ui>Extrude</Ui>: id foot, profile carriage, distance 8, body jaw.

    Extrude the carriage 8 mm and join it to the jaw.

    <Shot id="designer.tutorials.desk-arm/step-92" />

93. **[Hole](../../reference/commands.md#designer-part-hole)**, from <Ui>Insert</Ui> > <Ui>Hole</Ui>: id screws, body jaw, on the end face of jaw.

    Drill two holes through the jaw for M3 socket head cap screws.

    <Shot id="designer.tutorials.desk-arm/step-93" />

94. **[Part properties](../../reference/commands.md#designer-product-set-part)**, from the <Ui>Properties</Ui> panel: id jaw, name Jaw, material aluminium-6061, color #2a2d31, metallic 0.6, roughness 0.3.

    Name the part Jaw: dark anodised aluminium.

    <Shot id="designer.tutorials.desk-arm/step-94" />

95. **[Add connector](../../reference/commands.md#designer-product-add-connector)**, from <Ui>Insert</Ui> > <Ui>Add connector</Ui>: part jaw, id slide, on the side face of foot, origin 0.5, -2.5, 0.

    Add a connector in the middle of the carriage's end, below the jaw. The jaw slides along the gripper's rail on it, the carriage down in the rail and the jaw on the gripper's top.

    <Shot id="designer.tutorials.desk-arm/step-95" />

96. **[Add connector](../../reference/commands.md#designer-product-add-connector)**, from <Ui>Insert</Ui> > <Ui>Add connector</Ui>: part jaw, id screws, on the end face of jaw, axis the wall face of screws.

    Add a connector on the jaw's face, its axis along the screw holes.

    <Shot id="designer.tutorials.desk-arm/step-96" />

<Shot id="designer.tutorials.desk-arm/jaw" />

{/* steps:end */}
