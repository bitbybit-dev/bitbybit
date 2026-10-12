---
sidebar_position: 4
slug: /designer/tutorials/desk-arm/wrist
title: "Model a desk robot arm: the wrist"
sidebar_label: 4. The wrist
description: The fourth chapter of the desk arm - a knuckle that turns in the forearm's fork, with a tool flange raised on its face, rounded rims, the pin hole and two connectors.
topic: designer.tutorials.desk-arm.wrist
type: tutorial
verified: 2026-10-12
tags: [designer]
---

# Model a desk robot arm: the wrist

The wrist is small and quick: an extruded knuckle, a flange raised on one of its faces, and the pin it turns on.

Each step shows the Designer as you make it: a feature's dialog filled in with the step's values, with the tutorial card ringing <Ui>OK</Ui>, or what the step made. The first time a command appears, a picture shows where it is. The step numbers match the card's in <Ui>Help</Ui> > <Ui>Tutorials</Ui>.

{/* steps:start - generated from the tutorial the Designer plays; edits between these markers are overwritten */}

58. **[New part](../../reference/commands.md#designer-file-new-part)**, from <Ui>File</Ui> > <Ui>New part</Ui>: name Wrist.

    The wrist is a knuckle with a flange: extrude its outline, add a round boss on its face, round the rims and drill the pin hole.

    <Shot id="designer.tutorials.desk-arm/step-58" />

59. **[Sketch](../../reference/commands.md#designer-part-sketch)**, from <Ui>Insert</Ui> > <Ui>Sketch</Ui>: id knuckle, on the XY plane, start 0, -11.

    Sketch the knuckle on a plane 5 mm in front of the centre: a round heel around the pin, tapering to a flat face for the flange.

    <Shot id="designer.tutorials.desk-arm/step-59" />

60. **[Extrude](../../reference/commands.md#designer-part-extrude)**, from <Ui>Insert</Ui> > <Ui>Extrude</Ui>: id wrist, profile knuckle, distance 10.

    Extrude the knuckle 10 mm, the width of the forearm's fork.

    <Shot id="designer.tutorials.desk-arm/step-60" />

61. **[Sketch](../../reference/commands.md#designer-part-sketch)**, from <Ui>Insert</Ui> > <Ui>Sketch</Ui>: id plate, on the side face of wrist.

    On the flat face, sketch a circle: the tool flange.

    <Shot id="designer.tutorials.desk-arm/step-61" />

62. **[Boss](../../reference/commands.md#designer-part-boss)**, from <Ui>Insert</Ui> > <Ui>Boss</Ui>: id flange, profile plate, body wrist, distance 6.

    Raise it 6 mm as a boss.

    <Shot id="designer.tutorials.desk-arm/step-62" />

63. **[Fillet](../../reference/commands.md#designer-part-fillet)**, from <Ui>Insert</Ui> > <Ui>Fillet</Ui>: id frontRim, body wrist, radius 1.5.

    Round the front face's rim.

    <Shot id="designer.tutorials.desk-arm/step-63" />

64. **[Fillet](../../reference/commands.md#designer-part-fillet)**, from <Ui>Insert</Ui> > <Ui>Fillet</Ui>: id backRim, body wrist, radius 1.5.

    Round the back face's rim.

    <Shot id="designer.tutorials.desk-arm/step-64" />

65. **[Fillet](../../reference/commands.md#designer-part-fillet)**, from <Ui>Insert</Ui> > <Ui>Fillet</Ui>: id flangeRim, body wrist, radius 1.5.

    Round the flange's rim.

    <Shot id="designer.tutorials.desk-arm/step-65" />

66. **[Hole](../../reference/commands.md#designer-part-hole)**, from <Ui>Insert</Ui> > <Ui>Hole</Ui>: id pin, body wrist, on the end face of wrist, diameter 8.

    Drill the 8 mm pin hole through the heel.

    <Shot id="designer.tutorials.desk-arm/step-66" />

67. **[Part properties](../../reference/commands.md#designer-product-set-part)**, from the <Ui>Properties</Ui> panel: id wrist, name Wrist, material aluminium-6061, color #2a2d31, metallic 0.6, roughness 0.3.

    Name the part Wrist: dark anodised aluminium, like the base.

    <Shot id="designer.tutorials.desk-arm/step-67" />

68. **[Add connector](../../reference/commands.md#designer-product-add-connector)**, from <Ui>Insert</Ui> > <Ui>Add connector</Ui>: part wrist, id pin, on the start face of wrist, axis the wall face of pin.

    Add a connector on the back face, its axis through the pin hole. The wrist turns about it in the forearm's fork.

    <Shot id="designer.tutorials.desk-arm/step-68" />

69. **[Add connector](../../reference/commands.md#designer-product-add-connector)**, from <Ui>Insert</Ui> > <Ui>Add connector</Ui>: part wrist, id tool, on the end face of flange.

    Add a connector on the flange's face. Whatever the arm carries is fastened there.

    <Shot id="designer.tutorials.desk-arm/step-69" />

<Shot id="designer.tutorials.desk-arm/wrist" />

{/* steps:end */}
