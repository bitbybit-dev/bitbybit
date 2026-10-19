---
sidebar_position: 3
slug: /designer/tutorials/desk-arm/link
title: "Model a desk robot arm: the link"
sidebar_label: 3. The link
description: The third chapter of the desk arm - one link document with five parameters, whose waisted side, forked hub, lightening window and pivot holes all follow them, so the arm uses it twice at two sizes.
topic: designer.tutorials.desk-arm.link
type: tutorial
verified: 2026-10-19
tags: [designer]
---

# Model a desk robot arm: the link

Both arm segments are this one document. Every size of the link reads one of its five parameters, so the assembly can insert it twice and give each copy its own values. The steps start with the parameters, then draw every feature in terms of them.

Each step shows the Designer as you make it: a feature's dialog filled in with the step's values, with the tutorial card ringing <Ui>OK</Ui>, or what the step made. The first time a command appears, a picture shows where it is. The step numbers match the card's in <Ui>Help</Ui> > <Ui>Tutorials</Ui>.

{/* steps:start - generated from the tutorial the Designer plays; edits between these markers are overwritten */}

26. **[New part](../../reference/commands.md#designer-file-new-part)**, from <Ui>File</Ui> > <Ui>New part</Ui>: name Link.

    One link document serves both arm segments. Five parameters (length, width, gap, hub and tip) drive a waisted side profile, a forked hub at the far end, a lightening window and the two pivot holes.

    <Shot id="designer.tutorials.desk-arm/step-26" />

27. **[Parameter](../../reference/commands.md#designer-parameter-add)**, from <Ui>Insert</Ui> > <Ui>Parameter</Ui>: name length, value 160, unit mm.

    Add the parameter length, 160 mm: the distance between the link's two pivots.

    <Shot id="designer.tutorials.desk-arm/where-parameter-add" />

    <Shot id="designer.tutorials.desk-arm/step-27" />

28. **[Change parameter](../../reference/commands.md#designer-parameter-set)**, from the <Ui>Properties</Ui> panel: name length, min 80, max 300.

    Give length its range, 80 to 300 mm: the values the design is drawn for.

    <Shot id="designer.tutorials.desk-arm/step-28" />

29. **[Parameter](../../reference/commands.md#designer-parameter-add)**, from <Ui>Insert</Ui> > <Ui>Parameter</Ui>: name width, value 22, unit mm.

    Add the parameter width, 22 mm: how thick the link is.

    <Shot id="designer.tutorials.desk-arm/step-29" />

30. **[Change parameter](../../reference/commands.md#designer-parameter-set)**, from the <Ui>Properties</Ui> panel: name width, min 10, max 40.

    Give width its range, 10 to 40 mm: the values the design is drawn for.

    <Shot id="designer.tutorials.desk-arm/step-30" />

31. **[Parameter](../../reference/commands.md#designer-parameter-add)**, from <Ui>Insert</Ui> > <Ui>Parameter</Ui>: name gap, value 14, unit mm.

    Add the parameter gap, 14 mm: the width of the fork at the far end, which the next part fits into.

    <Shot id="designer.tutorials.desk-arm/step-31" />

32. **[Change parameter](../../reference/commands.md#designer-parameter-set)**, from the <Ui>Properties</Ui> panel: name gap, min 6, max 30.

    Give gap its range, 6 to 30 mm: the values the design is drawn for.

    <Shot id="designer.tutorials.desk-arm/step-32" />

33. **[Parameter](../../reference/commands.md#designer-parameter-add)**, from <Ui>Insert</Ui> > <Ui>Parameter</Ui>: name hub, value 16, unit mm.

    Add the parameter hub, 16 mm: the radius of the rounded heel at the near pivot.

    <Shot id="designer.tutorials.desk-arm/step-33" />

34. **[Change parameter](../../reference/commands.md#designer-parameter-set)**, from the <Ui>Properties</Ui> panel: name hub, min 8, max 30.

    Give hub its range, 8 to 30 mm: the values the design is drawn for.

    <Shot id="designer.tutorials.desk-arm/step-34" />

35. **[Parameter](../../reference/commands.md#designer-parameter-add)**, from <Ui>Insert</Ui> > <Ui>Parameter</Ui>: name tip, value 13, unit mm.

    Add the parameter tip, 13 mm: the radius of the rounded nose at the far pivot.

    <Shot id="designer.tutorials.desk-arm/step-35" />

36. **[Change parameter](../../reference/commands.md#designer-parameter-set)**, from the <Ui>Properties</Ui> panel: name tip, min 8, max 30.

    Give tip its range, 8 to 30 mm: the values the design is drawn for.

    <Shot id="designer.tutorials.desk-arm/step-36" />

37. **[Sketch](../../reference/commands.md#designer-part-sketch)**, from <Ui>Insert</Ui> > <Ui>Sketch</Ui>: id side, on the XY plane, start 0, -hub.

    Sketch the link's side on a plane half its width in front of the centre: a waisted belly and spine between a round heel at the near pivot and a round nose at the far one. Every size is an expression of the parameters.

    <Shot id="designer.tutorials.desk-arm/step-37" />

38. **[Extrude](../../reference/commands.md#designer-part-extrude)**, from <Ui>Insert</Ui> > <Ui>Extrude</Ui>: id link, profile side, distance width.

    Extrude the side by width, so the link is as thick as its parameter.

    <Shot id="designer.tutorials.desk-arm/step-38" />

39. **[Fillet](../../reference/commands.md#designer-part-fillet)**, from <Ui>Insert</Ui> > <Ui>Fillet</Ui>: id frontRim, body link, radius 2.

    Round the front face's rim by 2 mm.

    <Shot id="designer.tutorials.desk-arm/step-39" />

40. **[Fillet](../../reference/commands.md#designer-part-fillet)**, from <Ui>Insert</Ui> > <Ui>Fillet</Ui>: id backRim, body link, radius 2.

    Round the back face's rim the same way.

    <Shot id="designer.tutorials.desk-arm/step-40" />

41. **[Sketch](../../reference/commands.md#designer-part-sketch)**, from <Ui>Insert</Ui> > <Ui>Sketch</Ui>: id boss, on the XY plane.

    Sketch a circle around the far pivot, on a plane that centres it across gap plus 10 mm: the outline of the forked hub.

    <Shot id="designer.tutorials.desk-arm/step-41" />

42. **[Extrude](../../reference/commands.md#designer-part-extrude)**, from <Ui>Insert</Ui> > <Ui>Extrude</Ui>: id hubs, profile boss, distance gap + 10, body link.

    Extrude the circle gap + 10 across and join it to the link. The far end is now wider than the link, room for the fork.

    <Shot id="designer.tutorials.desk-arm/step-42" />

43. **[Fillet](../../reference/commands.md#designer-part-fillet)**, from <Ui>Insert</Ui> > <Ui>Fillet</Ui>: id hubFront, body link, radius 1.5.

    Round the hub's front rim.

    <Shot id="designer.tutorials.desk-arm/step-43" />

44. **[Fillet](../../reference/commands.md#designer-part-fillet)**, from <Ui>Insert</Ui> > <Ui>Fillet</Ui>: id hubBack, body link, radius 1.5.

    Round the hub's back rim.

    <Shot id="designer.tutorials.desk-arm/step-44" />

45. **[Sketch](../../reference/commands.md#designer-part-sketch)**, from <Ui>Insert</Ui> > <Ui>Sketch</Ui>: id slot, on the XY plane, start length, -(tip + 6).

    Sketch the fork's slot on a plane half the gap in front of the centre: open at the far end, with a round seat around the pivot, 6 mm wider than the nose, so the next part can swing a hundred degrees either way without touching the link.

    <Shot id="designer.tutorials.desk-arm/step-45" />

46. **[Extrude](../../reference/commands.md#designer-part-extrude)**, from <Ui>Insert</Ui> > <Ui>Extrude</Ui>: id fork, profile slot, distance gap, body link, join cut.

    Extrude the slot gap deep as a cut. The far end is now a fork, gap wide, for the next part's near end.

    <Shot id="designer.tutorials.desk-arm/step-46" />

47. **[Sketch](../../reference/commands.md#designer-part-sketch)**, from <Ui>Insert</Ui> > <Ui>Sketch</Ui>: id window, on the end face of link, start hub + 12, 1 - tip / 2.

    On the link's front face, sketch a rounded window between the pivots, sized from the parameters so it grows with the link.

    <Shot id="designer.tutorials.desk-arm/step-47" />

48. **[Pocket](../../reference/commands.md#designer-part-pocket)**, from <Ui>Insert</Ui> > <Ui>Pocket</Ui>: id lighten, profile window, body link, through true.

    Pocket the window right through the link to make it lighter.

    <Shot id="designer.tutorials.desk-arm/where-part-pocket" />

    <Shot id="designer.tutorials.desk-arm/step-48" />

49. **[Fillet](../../reference/commands.md#designer-part-fillet)**, from <Ui>Insert</Ui> > <Ui>Fillet</Ui>: id windowFront, body link, radius 1.5.

    Round the window's front edges.

    <Shot id="designer.tutorials.desk-arm/step-49" />

50. **[Fillet](../../reference/commands.md#designer-part-fillet)**, from <Ui>Insert</Ui> > <Ui>Fillet</Ui>: id windowBack, body link, radius 1.5.

    Round the window's back edges.

    <Shot id="designer.tutorials.desk-arm/step-50" />

51. **[Hole](../../reference/commands.md#designer-part-hole)**, from <Ui>Insert</Ui> > <Ui>Hole</Ui>: id root, body link, on the end face of link.

    Drill the pivot hole at the near end, sized for an M8 bolt.

    <Shot id="designer.tutorials.desk-arm/step-51" />

52. **[Hole](../../reference/commands.md#designer-part-hole)**, from <Ui>Insert</Ui> > <Ui>Hole</Ui>: id end, body link, on the end face of hubs.

    Drill the pivot hole through the fork's hub at the far end, for an M8 bolt too.

    <Shot id="designer.tutorials.desk-arm/step-52" />

53. **[Part properties](../../reference/commands.md#designer-product-set-part)**, from the <Ui>Properties</Ui> panel: id link, name Link, material aluminium-6061, color #eceef1, metallic 0, roughness 0.4.

    Name the part Link: aluminium, painted white.

    <Shot id="designer.tutorials.desk-arm/step-53" />

54. **[Add connector](../../reference/commands.md#designer-product-add-connector)**, from <Ui>Insert</Ui> > <Ui>Add connector</Ui>: part link, id proximal, on the start face of link, axis the wall face of root.

    Add a connector at the near pivot, on the link's back face. The link turns about it on the part before.

    <Shot id="designer.tutorials.desk-arm/step-54" />

55. **[Add connector](../../reference/commands.md#designer-product-add-connector)**, from <Ui>Insert</Ui> > <Ui>Add connector</Ui>: part link, id distal, on the start face of fork, axis the wall face of end.

    Add a connector at the far pivot, inside the fork. The next part turns about it.

    <Shot id="designer.tutorials.desk-arm/step-55" />

56. **[Add connector](../../reference/commands.md#designer-product-add-connector)**, from <Ui>Insert</Ui> > <Ui>Add connector</Ui>: part link, id boltFace, on the end face of hubs, axis the wall face of end.

    Add a connector on the hub's front face, where the bolt's head sits.

    <Shot id="designer.tutorials.desk-arm/step-56" />

57. **[Add connector](../../reference/commands.md#designer-product-add-connector)**, from <Ui>Insert</Ui> > <Ui>Add connector</Ui>: part link, id nutFace, on the start face of hubs, axis the wall face of end.

    Add a connector on the hub's back face, where the nut goes.

    <Shot id="designer.tutorials.desk-arm/step-57" />

<Shot id="designer.tutorials.desk-arm/link" />

{/* steps:end */}
