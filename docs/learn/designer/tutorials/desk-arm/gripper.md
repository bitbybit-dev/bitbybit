---
sidebar_position: 5
slug: /designer/tutorials/desk-arm/gripper
title: "Model a desk robot arm: the gripper"
sidebar_label: 5. The gripper
description: The fifth chapter of the desk arm - the gripper's palm with two pocketed jaw rails, four holes for M3 cover screws, and a neck blended into the palm, with connectors for the wrist, both jaws and the screws.
topic: designer.tutorials.desk-arm.gripper
type: tutorial
verified: 2026-10-19
tags: [designer]
---

# Model a desk robot arm: the gripper

The gripper's palm carries the jaws in two rails. Pockets cut the rails, and a fillet blends the neck into the palm so the two read as one cast piece.

Each step shows the Designer as you make it: a feature's dialog filled in with the step's values, with the tutorial card ringing <Ui>OK</Ui>, or what the step made. The first time a command appears, a picture shows where it is. The step numbers match the card's in <Ui>Help</Ui> > <Ui>Tutorials</Ui>.

{/* steps:start - generated from the tutorial the Designer plays; edits between these markers are overwritten */}

70. **[New part](../../reference/commands.md#designer-file-new-part)**, from <Ui>File</Ui> > <Ui>New part</Ui>: name Gripper.

    The gripper housing carries two jaw rails, four cover screws and a neck that is blended into the palm.

    <Shot id="designer.tutorials.desk-arm/step-70" />

71. **[Sketch](../../reference/commands.md#designer-part-sketch)**, from <Ui>Insert</Ui> > <Ui>Sketch</Ui>: id outline, on the XZ plane, start -29, -16.

    Sketch the palm's outline on the ground plane: a rounded rectangle, 70 by 32 mm.

    <Shot id="designer.tutorials.desk-arm/step-71" />

72. **[Extrude](../../reference/commands.md#designer-part-extrude)**, from <Ui>Insert</Ui> > <Ui>Extrude</Ui>: id palm, profile outline, distance 16.

    Extrude the outline 16 mm.

    <Shot id="designer.tutorials.desk-arm/step-72" />

73. **[Fillet](../../reference/commands.md#designer-part-fillet)**, from <Ui>Insert</Ui> > <Ui>Fillet</Ui>: id frontRim, body palm, radius 2.

    Round the top face's rim by 2 mm.

    <Shot id="designer.tutorials.desk-arm/step-73" />

74. **[Fillet](../../reference/commands.md#designer-part-fillet)**, from <Ui>Insert</Ui> > <Ui>Fillet</Ui>: id backRim, body palm, radius 2.

    Round the bottom face's rim the same way.

    <Shot id="designer.tutorials.desk-arm/step-74" />

75. **[Sketch](../../reference/commands.md#designer-part-sketch)**, from <Ui>Insert</Ui> > <Ui>Sketch</Ui>: id guideA, on the end face of palm, start -31, -4.

    On the top face, sketch the first jaw's rail: a slot 25 by 8 mm in from the left end.

    <Shot id="designer.tutorials.desk-arm/step-75" />

76. **[Pocket](../../reference/commands.md#designer-part-pocket)**, from <Ui>Insert</Ui> > <Ui>Pocket</Ui>: id railA, profile guideA, body palm, distance 5.

    Pocket the rail 5 mm deep.

    <Shot id="designer.tutorials.desk-arm/step-76" />

77. **[Sketch](../../reference/commands.md#designer-part-sketch)**, from <Ui>Insert</Ui> > <Ui>Sketch</Ui>: id guideB, on the end face of palm, start 6, -4.

    Sketch the second jaw's rail, in from the right end.

    <Shot id="designer.tutorials.desk-arm/step-77" />

78. **[Pocket](../../reference/commands.md#designer-part-pocket)**, from <Ui>Insert</Ui> > <Ui>Pocket</Ui>: id railB, profile guideB, body palm, distance 5.

    Pocket it 5 mm deep too.

    <Shot id="designer.tutorials.desk-arm/step-78" />

79. **[Hole](../../reference/commands.md#designer-part-hole)**, from <Ui>Insert</Ui> > <Ui>Hole</Ui>: id screws, body palm, on the end face of palm.

    Drill four holes for the cover screws, one near each corner, sized for M3 socket head cap screws with their counterbores.

    <Shot id="designer.tutorials.desk-arm/step-79" />

80. **[Sketch](../../reference/commands.md#designer-part-sketch)**, from <Ui>Insert</Ui> > <Ui>Sketch</Ui>: id mount, on the start face of palm.

    On the bottom face, sketch the neck: a circle 24 mm across.

    <Shot id="designer.tutorials.desk-arm/step-80" />

81. **[Boss](../../reference/commands.md#designer-part-boss)**, from <Ui>Insert</Ui> > <Ui>Boss</Ui>: id neck, profile mount, body palm, distance 6.

    Raise the neck 6 mm as a boss.

    <Shot id="designer.tutorials.desk-arm/step-81" />

82. **[Fillet](../../reference/commands.md#designer-part-fillet)**, from <Ui>Insert</Ui> > <Ui>Fillet</Ui>: id neckBlend, body palm, radius 3.

    Round the edge where the neck meets the palm by 3 mm, so the two blend into one.

    <Shot id="designer.tutorials.desk-arm/step-82" />

83. **[Part properties](../../reference/commands.md#designer-product-set-part)**, from the <Ui>Properties</Ui> panel: id palm, name Gripper, material abs, color #eceef1, metallic 0, roughness 0.4.

    Name the part Gripper: white ABS, like the shoulder.

    <Shot id="designer.tutorials.desk-arm/step-83" />

84. **[Add connector](../../reference/commands.md#designer-product-add-connector)**, from <Ui>Insert</Ui> > <Ui>Add connector</Ui>: part palm, id mount, on the end face of neck.

    Add a connector on the neck's end. The gripper is fastened to the wrist's flange there.

    <Shot id="designer.tutorials.desk-arm/step-84" />

85. **[Add connector](../../reference/commands.md#designer-product-add-connector)**, from <Ui>Insert</Ui> > <Ui>Add connector</Ui>: part palm, id jawA, on the side face of railA, origin -6, 13.5, 0.

    Add a connector at the end of the first rail, where the first jaw's carriage slides.

    <Shot id="designer.tutorials.desk-arm/step-85" />

86. **[Add connector](../../reference/commands.md#designer-product-add-connector)**, from <Ui>Insert</Ui> > <Ui>Add connector</Ui>: part palm, id jawB, on the side face of railB, origin 6, 13.5, 0.

    Add a connector in the second rail for the second jaw, facing the other way.

    <Shot id="designer.tutorials.desk-arm/step-86" />

87. **[Add connector](../../reference/commands.md#designer-product-add-connector)**, from <Ui>Insert</Ui> > <Ui>Add connector</Ui>: part palm, id screws, on the end face of palm, axis the wall face of screws.

    Add a connector on the top face, its axis along the screw holes, for the cover screws.

    <Shot id="designer.tutorials.desk-arm/step-87" />

<Shot id="designer.tutorials.desk-arm/gripper" />

{/* steps:end */}
