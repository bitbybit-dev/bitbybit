---
sidebar_position: 2
title: "Model a desk robot arm"
sidebar_label: Model a desk robot arm
description: A longer Designer tutorial - nine parametric parts, from a revolved base to a serrated gripper jaw, brought together in an assembly with joints, limits and fasteners replicated onto every hole.
topic: designer.tutorials.desk-arm
type: tutorial
verified: 2026-10-08
tags: [designer]
---

# Model a desk robot arm

This tutorial builds a small desk robot arm: a base, a turntable, two arm links, a wrist, a gripper with two jaws, and the screws and nuts that hold it together. Then an assembly puts the parts on joints that turn within limits. It is long, so take it a part at a time, or let the Designer make the steps for you and watch how each part is built.

![The finished desk arm: base, turntable, two links, wrist and gripper](/img/generated/designer/desk-arm/arm.webp)

Along the way you will:

- revolve a profile into a round part, and mirror a feature to make its twin;
- drill counterbored holes and mark them with connectors, the places parts attach;
- make one link document whose parameters let it serve as both arm segments;
- put parts on joints that turn within limits;
- replicate a screw onto every hole of a set in one step.

It helps to have done [Make your first part](./first-part.md) first.

## Play it in the Designer

Open <Ui>Help</Ui> > <Ui>Tutorials</Ui> and press <Ui>Start</Ui> beside <Ui>Model a desk robot arm</Ui>. The card rings each control, moves on when you make the step, and <Ui>Do it</Ui> makes a step for you. Making the first steps of a part by hand and the rest with <Ui>Do it</Ui> is a quick way to see how a whole part comes together.

## The steps

Each part starts a new document. Its steps are folded under a line on how it is built, and its picture shows what they make. The step numbers match the card's, and a command's name links to everything it takes.

{/* steps:start - generated from the tutorial the Designer plays; edits between these markers are overwritten */}

### Base

1. **[New part](../reference/commands.md#designer-file-new-part)**, from <Ui>File</Ui> > <Ui>New part</Ui>: name Base.

   The base is a revolved pedestal: draw half its profile on the XY plane, then revolve it a full turn about its axis. Four counterbored holes go in its ledge, and two connectors mark where the turntable sits and where its screws go.

2. **[Sketch](../reference/commands.md#designer-part-sketch)**, from <Ui>Insert</Ui> > <Ui>Sketch</Ui>: id profile, on the XY plane, start 0, 0.

3. **[Revolve](../reference/commands.md#designer-part-revolve)**, from <Ui>Insert</Ui> > <Ui>Revolve</Ui>: id base, profile profile, angle 360.

4. **[Hole](../reference/commands.md#designer-part-hole)**, from <Ui>Insert</Ui> > <Ui>Hole</Ui>: id mounts, body base, on the side face of base, diameter 5.

5. **[Part properties](../reference/commands.md#designer-product-set-part)**, from the <Ui>Properties</Ui> panel: id base, name Base, material aluminium-6061, color #2a2d31, metallic 0.6, roughness 0.3.

6. **[Add connector](../reference/commands.md#designer-product-add-connector)**, from <Ui>Insert</Ui> > <Ui>Add connector</Ui>: part base, id top, on the side face of base.

7. **[Add connector](../reference/commands.md#designer-product-add-connector)**, from <Ui>Insert</Ui> > <Ui>Add connector</Ui>: part base, id bolts, on the side face of base, axis the wall face of mounts.

![Base, after step 7](/img/generated/designer/desk-arm/base.webp)

### Shoulder

The shoulder is a drum with a clevis: one lug is extruded, given a hub and rounded, then mirrored, and the drum is revolved and joined to it. A hole runs through the hubs for the shoulder bolt.

<details>
<summary>Steps 8 to 25</summary>

8. **[New part](../reference/commands.md#designer-file-new-part)**, from <Ui>File</Ui> > <Ui>New part</Ui>: name Shoulder.

9. **[Sketch](../reference/commands.md#designer-part-sketch)**, from <Ui>Insert</Ui> > <Ui>Sketch</Ui>: id lug, on the XY plane, start -32, 2.

10. **[Extrude](../reference/commands.md#designer-part-extrude)**, from <Ui>Insert</Ui> > <Ui>Extrude</Ui>: id lugA, profile lug, distance 9.

11. **[Sketch](../reference/commands.md#designer-part-sketch)**, from <Ui>Insert</Ui> > <Ui>Sketch</Ui>: id hub, on the start face of lugA.

12. **[Boss](../reference/commands.md#designer-part-boss)**, from <Ui>Insert</Ui> > <Ui>Boss</Ui>: id hubA, profile hub, body lugA, distance 3.

13. **[Fillet](../reference/commands.md#designer-part-fillet)**, from <Ui>Insert</Ui> > <Ui>Fillet</Ui>: id lugOuter, body lugA, radius 2.

14. **[Fillet](../reference/commands.md#designer-part-fillet)**, from <Ui>Insert</Ui> > <Ui>Fillet</Ui>: id lugInner, body lugA, radius 2.

15. **[Fillet](../reference/commands.md#designer-part-fillet)**, from <Ui>Insert</Ui> > <Ui>Fillet</Ui>: id hubRound, body lugA, radius 1.

16. **[Mirror](../reference/commands.md#designer-part-mirror)**, from <Ui>Insert</Ui> > <Ui>Mirror</Ui>: id fork, body lugA.

17. **[Sketch](../reference/commands.md#designer-part-sketch)**, from <Ui>Insert</Ui> > <Ui>Sketch</Ui>: id drum, on the XY plane, start 0, 0.

18. **[Revolve](../reference/commands.md#designer-part-revolve)**, from <Ui>Insert</Ui> > <Ui>Revolve</Ui>: id turntable, profile drum, angle 360.

19. **[Boolean](../reference/commands.md#designer-part-boolean)**, from <Ui>Insert</Ui> > <Ui>Boolean</Ui>: id seat, body turntable, operation union, tools lugA.

20. **[Hole](../reference/commands.md#designer-part-hole)**, from <Ui>Insert</Ui> > <Ui>Hole</Ui>: id pivot, body turntable, on the end face of hubA, diameter 8.

21. **[Part properties](../reference/commands.md#designer-product-set-part)**, from the <Ui>Properties</Ui> panel: id turntable, name Shoulder, material abs, color #eceef1, metallic 0, roughness 0.4.

22. **[Add connector](../reference/commands.md#designer-product-add-connector)**, from <Ui>Insert</Ui> > <Ui>Add connector</Ui>: part turntable, id bottom, on the side face of turntable.

23. **[Add connector](../reference/commands.md#designer-product-add-connector)**, from <Ui>Insert</Ui> > <Ui>Add connector</Ui>: part turntable, id pivot, on the end face of lugA, axis the wall face of pivot.

24. **[Add connector](../reference/commands.md#designer-product-add-connector)**, from <Ui>Insert</Ui> > <Ui>Add connector</Ui>: part turntable, id boltFace, on the end face of hubA, axis the wall face of pivot.

25. **[Add connector](../reference/commands.md#designer-product-add-connector)**, from <Ui>Insert</Ui> > <Ui>Add connector</Ui>: part turntable, id nutFace, on the end face of hubA, axis the wall face of pivot.

</details>

![Shoulder, after step 25](/img/generated/designer/desk-arm/turntable.webp)

### Link

One link document serves both arm segments. Five parameters (length, width, gap, hub and tip) drive a waisted side profile, a forked hub at the far end, a lightening window and the two pivot holes.

<details>
<summary>Steps 26 to 57</summary>

26. **[New part](../reference/commands.md#designer-file-new-part)**, from <Ui>File</Ui> > <Ui>New part</Ui>: name Link.

27. **[Parameter](../reference/commands.md#designer-parameter-add)**, from <Ui>Insert</Ui> > <Ui>Parameter</Ui>: name length, value 160, unit mm.

28. **[Change parameter](../reference/commands.md#designer-parameter-set)**, from the <Ui>Properties</Ui> panel: name length, min 80, max 300.

29. **[Parameter](../reference/commands.md#designer-parameter-add)**, from <Ui>Insert</Ui> > <Ui>Parameter</Ui>: name width, value 22, unit mm.

30. **[Change parameter](../reference/commands.md#designer-parameter-set)**, from the <Ui>Properties</Ui> panel: name width, min 10, max 40.

31. **[Parameter](../reference/commands.md#designer-parameter-add)**, from <Ui>Insert</Ui> > <Ui>Parameter</Ui>: name gap, value 14, unit mm.

32. **[Change parameter](../reference/commands.md#designer-parameter-set)**, from the <Ui>Properties</Ui> panel: name gap, min 6, max 30.

33. **[Parameter](../reference/commands.md#designer-parameter-add)**, from <Ui>Insert</Ui> > <Ui>Parameter</Ui>: name hub, value 16, unit mm.

34. **[Change parameter](../reference/commands.md#designer-parameter-set)**, from the <Ui>Properties</Ui> panel: name hub, min 8, max 30.

35. **[Parameter](../reference/commands.md#designer-parameter-add)**, from <Ui>Insert</Ui> > <Ui>Parameter</Ui>: name tip, value 13, unit mm.

36. **[Change parameter](../reference/commands.md#designer-parameter-set)**, from the <Ui>Properties</Ui> panel: name tip, min 8, max 30.

37. **[Sketch](../reference/commands.md#designer-part-sketch)**, from <Ui>Insert</Ui> > <Ui>Sketch</Ui>: id side, on the XY plane, start 0, -hub.

38. **[Extrude](../reference/commands.md#designer-part-extrude)**, from <Ui>Insert</Ui> > <Ui>Extrude</Ui>: id link, profile side, distance width.

39. **[Fillet](../reference/commands.md#designer-part-fillet)**, from <Ui>Insert</Ui> > <Ui>Fillet</Ui>: id frontRim, body link, radius 2.

40. **[Fillet](../reference/commands.md#designer-part-fillet)**, from <Ui>Insert</Ui> > <Ui>Fillet</Ui>: id backRim, body link, radius 2.

41. **[Sketch](../reference/commands.md#designer-part-sketch)**, from <Ui>Insert</Ui> > <Ui>Sketch</Ui>: id boss, on the XY plane.

42. **[Extrude](../reference/commands.md#designer-part-extrude)**, from <Ui>Insert</Ui> > <Ui>Extrude</Ui>: id hubs, profile boss, distance gap + 10, body link.

43. **[Fillet](../reference/commands.md#designer-part-fillet)**, from <Ui>Insert</Ui> > <Ui>Fillet</Ui>: id hubFront, body link, radius 1.5.

44. **[Fillet](../reference/commands.md#designer-part-fillet)**, from <Ui>Insert</Ui> > <Ui>Fillet</Ui>: id hubBack, body link, radius 1.5.

45. **[Sketch](../reference/commands.md#designer-part-sketch)**, from <Ui>Insert</Ui> > <Ui>Sketch</Ui>: id slot, on the XY plane, start length, -(tip + 1).

46. **[Extrude](../reference/commands.md#designer-part-extrude)**, from <Ui>Insert</Ui> > <Ui>Extrude</Ui>: id fork, profile slot, distance gap, body link, join cut.

47. **[Sketch](../reference/commands.md#designer-part-sketch)**, from <Ui>Insert</Ui> > <Ui>Sketch</Ui>: id window, on the end face of link, start hub + 12, 1 - tip / 2.

48. **[Pocket](../reference/commands.md#designer-part-pocket)**, from <Ui>Insert</Ui> > <Ui>Pocket</Ui>: id lighten, profile window, body link, through true.

49. **[Fillet](../reference/commands.md#designer-part-fillet)**, from <Ui>Insert</Ui> > <Ui>Fillet</Ui>: id windowFront, body link, radius 1.5.

50. **[Fillet](../reference/commands.md#designer-part-fillet)**, from <Ui>Insert</Ui> > <Ui>Fillet</Ui>: id windowBack, body link, radius 1.5.

51. **[Hole](../reference/commands.md#designer-part-hole)**, from <Ui>Insert</Ui> > <Ui>Hole</Ui>: id root, body link, on the end face of link, diameter 8.

52. **[Hole](../reference/commands.md#designer-part-hole)**, from <Ui>Insert</Ui> > <Ui>Hole</Ui>: id end, body link, on the end face of hubs, diameter 8.

53. **[Part properties](../reference/commands.md#designer-product-set-part)**, from the <Ui>Properties</Ui> panel: id link, name Link, material aluminium-6061, color #eceef1, metallic 0, roughness 0.4.

54. **[Add connector](../reference/commands.md#designer-product-add-connector)**, from <Ui>Insert</Ui> > <Ui>Add connector</Ui>: part link, id proximal, on the start face of link, axis the wall face of root.

55. **[Add connector](../reference/commands.md#designer-product-add-connector)**, from <Ui>Insert</Ui> > <Ui>Add connector</Ui>: part link, id distal, on the start face of fork, axis the wall face of end.

56. **[Add connector](../reference/commands.md#designer-product-add-connector)**, from <Ui>Insert</Ui> > <Ui>Add connector</Ui>: part link, id boltFace, on the end face of hubs, axis the wall face of end.

57. **[Add connector](../reference/commands.md#designer-product-add-connector)**, from <Ui>Insert</Ui> > <Ui>Add connector</Ui>: part link, id nutFace, on the start face of hubs, axis the wall face of end.

</details>

![Link, after step 57](/img/generated/designer/desk-arm/link.webp)

### Wrist

The wrist is a knuckle with a flange: extrude its outline, add a round boss on its face, round the rims and drill the pin hole.

<details>
<summary>Steps 58 to 69</summary>

58. **[New part](../reference/commands.md#designer-file-new-part)**, from <Ui>File</Ui> > <Ui>New part</Ui>: name Wrist.

59. **[Sketch](../reference/commands.md#designer-part-sketch)**, from <Ui>Insert</Ui> > <Ui>Sketch</Ui>: id knuckle, on the XY plane, start 0, -11.

60. **[Extrude](../reference/commands.md#designer-part-extrude)**, from <Ui>Insert</Ui> > <Ui>Extrude</Ui>: id wrist, profile knuckle, distance 10.

61. **[Sketch](../reference/commands.md#designer-part-sketch)**, from <Ui>Insert</Ui> > <Ui>Sketch</Ui>: id plate, on the side face of wrist.

62. **[Boss](../reference/commands.md#designer-part-boss)**, from <Ui>Insert</Ui> > <Ui>Boss</Ui>: id flange, profile plate, body wrist, distance 6.

63. **[Fillet](../reference/commands.md#designer-part-fillet)**, from <Ui>Insert</Ui> > <Ui>Fillet</Ui>: id frontRim, body wrist, radius 1.5.

64. **[Fillet](../reference/commands.md#designer-part-fillet)**, from <Ui>Insert</Ui> > <Ui>Fillet</Ui>: id backRim, body wrist, radius 1.5.

65. **[Fillet](../reference/commands.md#designer-part-fillet)**, from <Ui>Insert</Ui> > <Ui>Fillet</Ui>: id flangeRim, body wrist, radius 1.5.

66. **[Hole](../reference/commands.md#designer-part-hole)**, from <Ui>Insert</Ui> > <Ui>Hole</Ui>: id pin, body wrist, on the end face of wrist, diameter 8.

67. **[Part properties](../reference/commands.md#designer-product-set-part)**, from the <Ui>Properties</Ui> panel: id wrist, name Wrist, material aluminium-6061, color #2a2d31, metallic 0.6, roughness 0.3.

68. **[Add connector](../reference/commands.md#designer-product-add-connector)**, from <Ui>Insert</Ui> > <Ui>Add connector</Ui>: part wrist, id pin, on the start face of wrist, axis the wall face of pin.

69. **[Add connector](../reference/commands.md#designer-product-add-connector)**, from <Ui>Insert</Ui> > <Ui>Add connector</Ui>: part wrist, id tool, on the end face of flange.

</details>

![Wrist, after step 69](/img/generated/designer/desk-arm/wrist.webp)

### Gripper

The gripper housing carries two jaw rails, four cover screws and a neck that is blended into the palm.

<details>
<summary>Steps 70 to 87</summary>

70. **[New part](../reference/commands.md#designer-file-new-part)**, from <Ui>File</Ui> > <Ui>New part</Ui>: name Gripper.

71. **[Sketch](../reference/commands.md#designer-part-sketch)**, from <Ui>Insert</Ui> > <Ui>Sketch</Ui>: id outline, on the XZ plane, start -29, -16.

72. **[Extrude](../reference/commands.md#designer-part-extrude)**, from <Ui>Insert</Ui> > <Ui>Extrude</Ui>: id palm, profile outline, distance 16.

73. **[Fillet](../reference/commands.md#designer-part-fillet)**, from <Ui>Insert</Ui> > <Ui>Fillet</Ui>: id frontRim, body palm, radius 2.

74. **[Fillet](../reference/commands.md#designer-part-fillet)**, from <Ui>Insert</Ui> > <Ui>Fillet</Ui>: id backRim, body palm, radius 2.

75. **[Sketch](../reference/commands.md#designer-part-sketch)**, from <Ui>Insert</Ui> > <Ui>Sketch</Ui>: id guideA, on the end face of palm, start -31, -4.

76. **[Pocket](../reference/commands.md#designer-part-pocket)**, from <Ui>Insert</Ui> > <Ui>Pocket</Ui>: id railA, profile guideA, body palm, distance 5.

77. **[Sketch](../reference/commands.md#designer-part-sketch)**, from <Ui>Insert</Ui> > <Ui>Sketch</Ui>: id guideB, on the end face of palm, start 6, -4.

78. **[Pocket](../reference/commands.md#designer-part-pocket)**, from <Ui>Insert</Ui> > <Ui>Pocket</Ui>: id railB, profile guideB, body palm, distance 5.

79. **[Hole](../reference/commands.md#designer-part-hole)**, from <Ui>Insert</Ui> > <Ui>Hole</Ui>: id screws, body palm, on the end face of palm, diameter 3.

80. **[Sketch](../reference/commands.md#designer-part-sketch)**, from <Ui>Insert</Ui> > <Ui>Sketch</Ui>: id mount, on the start face of palm.

81. **[Boss](../reference/commands.md#designer-part-boss)**, from <Ui>Insert</Ui> > <Ui>Boss</Ui>: id neck, profile mount, body palm, distance 6.

82. **[Fillet](../reference/commands.md#designer-part-fillet)**, from <Ui>Insert</Ui> > <Ui>Fillet</Ui>: id neckBlend, body palm, radius 3.

83. **[Part properties](../reference/commands.md#designer-product-set-part)**, from the <Ui>Properties</Ui> panel: id palm, name Gripper, material abs, color #eceef1, metallic 0, roughness 0.4.

84. **[Add connector](../reference/commands.md#designer-product-add-connector)**, from <Ui>Insert</Ui> > <Ui>Add connector</Ui>: part palm, id mount, on the end face of neck.

85. **[Add connector](../reference/commands.md#designer-product-add-connector)**, from <Ui>Insert</Ui> > <Ui>Add connector</Ui>: part palm, id jawA, on the side face of railA, origin -6, 13.5, 0.

86. **[Add connector](../reference/commands.md#designer-product-add-connector)**, from <Ui>Insert</Ui> > <Ui>Add connector</Ui>: part palm, id jawB, on the side face of railB, origin 6, 13.5, 0.

87. **[Add connector](../reference/commands.md#designer-product-add-connector)**, from <Ui>Insert</Ui> > <Ui>Add connector</Ui>: part palm, id screws, on the end face of palm, axis the wall face of screws.

</details>

![Gripper, after step 87](/img/generated/designer/desk-arm/gripper.webp)

### Jaw

Each jaw is a serrated finger on a carriage that rides in the gripper's rail, held by two screws.

<details>
<summary>Steps 88 to 96</summary>

88. **[New part](../reference/commands.md#designer-file-new-part)**, from <Ui>File</Ui> > <Ui>New part</Ui>: name Jaw.

89. **[Sketch](../reference/commands.md#designer-part-sketch)**, from <Ui>Insert</Ui> > <Ui>Sketch</Ui>: id profile, on the XY plane, start 0, 0.

90. **[Extrude](../reference/commands.md#designer-part-extrude)**, from <Ui>Insert</Ui> > <Ui>Extrude</Ui>: id jaw, profile profile, distance 14.

91. **[Sketch](../reference/commands.md#designer-part-sketch)**, from <Ui>Insert</Ui> > <Ui>Sketch</Ui>: id carriage, on the XY plane, start 0.5, -5.

92. **[Extrude](../reference/commands.md#designer-part-extrude)**, from <Ui>Insert</Ui> > <Ui>Extrude</Ui>: id foot, profile carriage, distance 8, body jaw.

93. **[Hole](../reference/commands.md#designer-part-hole)**, from <Ui>Insert</Ui> > <Ui>Hole</Ui>: id screws, body jaw, on the end face of jaw, diameter 3.

94. **[Part properties](../reference/commands.md#designer-product-set-part)**, from the <Ui>Properties</Ui> panel: id jaw, name Jaw, material aluminium-6061, color #2a2d31, metallic 0.6, roughness 0.3.

95. **[Add connector](../reference/commands.md#designer-product-add-connector)**, from <Ui>Insert</Ui> > <Ui>Add connector</Ui>: part jaw, id slide, on the side face of foot.

96. **[Add connector](../reference/commands.md#designer-product-add-connector)**, from <Ui>Insert</Ui> > <Ui>Add connector</Ui>: part jaw, id screws, on the end face of jaw, axis the wall face of screws.

</details>

![Jaw, after step 96](/img/generated/designer/desk-arm/jaw.webp)

### Screw

A socket-head screw, parametric in its diameter and length, so every bolt in the arm is this one document.

<details>
<summary>Steps 97 to 111</summary>

97. **[New part](../reference/commands.md#designer-file-new-part)**, from <Ui>File</Ui> > <Ui>New part</Ui>: name Screw.

98. **[Parameter](../reference/commands.md#designer-parameter-add)**, from <Ui>Insert</Ui> > <Ui>Parameter</Ui>: name d, value 8, unit mm.

99. **[Change parameter](../reference/commands.md#designer-parameter-set)**, from the <Ui>Properties</Ui> panel: name d, min 2, max 20.

100. **[Parameter](../reference/commands.md#designer-parameter-add)**, from <Ui>Insert</Ui> > <Ui>Parameter</Ui>: name length, value 40, unit mm.

101. **[Change parameter](../reference/commands.md#designer-parameter-set)**, from the <Ui>Properties</Ui> panel: name length, min 4, max 120.

102. **[Sketch](../reference/commands.md#designer-part-sketch)**, from <Ui>Insert</Ui> > <Ui>Sketch</Ui>: id shank, on the XZ plane.

103. **[Extrude](../reference/commands.md#designer-part-extrude)**, from <Ui>Insert</Ui> > <Ui>Extrude</Ui>: id screw, profile shank, distance length.

104. **[Sketch](../reference/commands.md#designer-part-sketch)**, from <Ui>Insert</Ui> > <Ui>Sketch</Ui>: id crown, on the XZ plane.

105. **[Extrude](../reference/commands.md#designer-part-extrude)**, from <Ui>Insert</Ui> > <Ui>Extrude</Ui>: id head, profile crown, distance 0.7 \* d, body screw.

106. **[Sketch](../reference/commands.md#designer-part-sketch)**, from <Ui>Insert</Ui> > <Ui>Sketch</Ui>: id hex, on the end face of head, start 0.3 \* d, 0.

107. **[Pocket](../reference/commands.md#designer-part-pocket)**, from <Ui>Insert</Ui> > <Ui>Pocket</Ui>: id drive, profile hex, body screw, distance 0.4 \* d.

108. **[Fillet](../reference/commands.md#designer-part-fillet)**, from <Ui>Insert</Ui> > <Ui>Fillet</Ui>: id round, body screw, radius 0.08 \* d.

109. **[Chamfer](../reference/commands.md#designer-part-chamfer)**, from <Ui>Insert</Ui> > <Ui>Chamfer</Ui>: id lead, body screw, distance 0.1 \* d.

110. **[Part properties](../reference/commands.md#designer-product-set-part)**, from the <Ui>Properties</Ui> panel: id screw, name Screw, material steel, color #1d1f22, metallic 0.85, roughness 0.35.

111. **[Add connector](../reference/commands.md#designer-product-add-connector)**, from <Ui>Insert</Ui> > <Ui>Add connector</Ui>: part screw, id seat, on the start face of head, axis the side face of screw.

</details>

![Screw, after step 111](/img/generated/designer/desk-arm/screw.webp)

### Nut

A hex nut, parametric in its diameter, for the bolts through the arm's pivots.

<details>
<summary>Steps 112 to 121</summary>

112. **[New part](../reference/commands.md#designer-file-new-part)**, from <Ui>File</Ui> > <Ui>New part</Ui>: name Nut.

113. **[Parameter](../reference/commands.md#designer-parameter-add)**, from <Ui>Insert</Ui> > <Ui>Parameter</Ui>: name d, value 8, unit mm.

114. **[Change parameter](../reference/commands.md#designer-parameter-set)**, from the <Ui>Properties</Ui> panel: name d, min 2, max 20.

115. **[Sketch](../reference/commands.md#designer-part-sketch)**, from <Ui>Insert</Ui> > <Ui>Sketch</Ui>: id hex, on the XZ plane, start 0.92 \* d, 0.

116. **[Extrude](../reference/commands.md#designer-part-extrude)**, from <Ui>Insert</Ui> > <Ui>Extrude</Ui>: id nut, profile hex, distance 0.8 \* d.

117. **[Chamfer](../reference/commands.md#designer-part-chamfer)**, from <Ui>Insert</Ui> > <Ui>Chamfer</Ui>: id topBevel, body nut, distance 0.08 \* d.

118. **[Chamfer](../reference/commands.md#designer-part-chamfer)**, from <Ui>Insert</Ui> > <Ui>Chamfer</Ui>: id underBevel, body nut, distance 0.08 \* d.

119. **[Hole](../reference/commands.md#designer-part-hole)**, from <Ui>Insert</Ui> > <Ui>Hole</Ui>: id bore, body nut, on the end face of nut, diameter d.

120. **[Part properties](../reference/commands.md#designer-product-set-part)**, from the <Ui>Properties</Ui> panel: id nut, name Nut, material steel, color #1d1f22, metallic 0.85, roughness 0.35.

121. **[Add connector](../reference/commands.md#designer-product-add-connector)**, from <Ui>Insert</Ui> > <Ui>Add connector</Ui>: part nut, id seat, on the start face of nut, axis the wall face of bore.

</details>

![Nut, after step 121](/img/generated/designer/desk-arm/nut.webp)

### Desk arm

The assembly brings it together: parameters for each joint, the parts inserted (both links from one document at their own sizes), the joints with their limits, and the screws and nuts replicated onto their holes.

<details>
<summary>Steps 122 to 167</summary>

122. **[New assembly](../reference/commands.md#designer-file-new-assembly)**, from <Ui>File</Ui> > <Ui>New assembly</Ui>: name Desk arm.

123. **[Parameter](../reference/commands.md#designer-parameter-add)**, from <Ui>Insert</Ui> > <Ui>Parameter</Ui>: name yaw, value -35, unit deg.

124. **[Change parameter](../reference/commands.md#designer-parameter-set)**, from the <Ui>Properties</Ui> panel: name yaw, min -170, max 170.

125. **[Parameter](../reference/commands.md#designer-parameter-add)**, from <Ui>Insert</Ui> > <Ui>Parameter</Ui>: name shoulder, value 60, unit deg.

126. **[Change parameter](../reference/commands.md#designer-parameter-set)**, from the <Ui>Properties</Ui> panel: name shoulder, min -10, max 120.

127. **[Parameter](../reference/commands.md#designer-parameter-add)**, from <Ui>Insert</Ui> > <Ui>Parameter</Ui>: name elbow, value -80, unit deg.

128. **[Change parameter](../reference/commands.md#designer-parameter-set)**, from the <Ui>Properties</Ui> panel: name elbow, min -150, max 150.

129. **[Parameter](../reference/commands.md#designer-parameter-add)**, from <Ui>Insert</Ui> > <Ui>Parameter</Ui>: name wrist, value -40, unit deg.

130. **[Change parameter](../reference/commands.md#designer-parameter-set)**, from the <Ui>Properties</Ui> panel: name wrist, min -90, max 90.

131. **[Parameter](../reference/commands.md#designer-parameter-add)**, from <Ui>Insert</Ui> > <Ui>Parameter</Ui>: name grip, value 4, unit mm.

132. **[Change parameter](../reference/commands.md#designer-parameter-set)**, from the <Ui>Properties</Ui> panel: name grip, min 0, max 11.

133. **[Insert component](../reference/commands.md#designer-assembly-insert)**, from <Ui>Insert</Ui> > <Ui>Insert component</Ui>: id base, part base.

134. **[Insert component](../reference/commands.md#designer-assembly-insert)**, from <Ui>Insert</Ui> > <Ui>Insert component</Ui>: id turntable, part turntable.

135. **[Insert component](../reference/commands.md#designer-assembly-insert)**, from <Ui>Insert</Ui> > <Ui>Insert component</Ui>: id upper, part link.

136. **[Insert component](../reference/commands.md#designer-assembly-insert)**, from <Ui>Insert</Ui> > <Ui>Insert component</Ui>: id fore, part link.

137. **[Insert component](../reference/commands.md#designer-assembly-insert)**, from <Ui>Insert</Ui> > <Ui>Insert component</Ui>: id wrist, part wrist.

138. **[Insert component](../reference/commands.md#designer-assembly-insert)**, from <Ui>Insert</Ui> > <Ui>Insert component</Ui>: id gripper, part palm.

139. **[Insert component](../reference/commands.md#designer-assembly-insert)**, from <Ui>Insert</Ui> > <Ui>Insert component</Ui>: id jawA, part jaw.

140. **[Insert component](../reference/commands.md#designer-assembly-insert)**, from <Ui>Insert</Ui> > <Ui>Insert component</Ui>: id jawB, part jaw.

141. **[Joint](../reference/commands.md#designer-assembly-joint)**, from <Ui>Insert</Ui> > <Ui>Joint</Ui>: id yaw, component turntable, connector bottom, angle yaw.

142. **[Joint](../reference/commands.md#designer-assembly-joint)**, from <Ui>Insert</Ui> > <Ui>Joint</Ui>: id shoulder, component upper, connector proximal, angle shoulder.

143. **[Joint](../reference/commands.md#designer-assembly-joint)**, from <Ui>Insert</Ui> > <Ui>Joint</Ui>: id elbow, component fore, connector proximal, angle elbow.

144. **[Joint](../reference/commands.md#designer-assembly-joint)**, from <Ui>Insert</Ui> > <Ui>Joint</Ui>: id wristJoint, component wrist, connector pin, angle wrist.

145. **[Joint](../reference/commands.md#designer-assembly-joint)**, from <Ui>Insert</Ui> > <Ui>Joint</Ui>: id mount, component gripper, connector mount.

146. **[Joint](../reference/commands.md#designer-assembly-joint)**, from <Ui>Insert</Ui> > <Ui>Joint</Ui>: id gripA, component jawA, connector slide, offset grip.

147. **[Joint](../reference/commands.md#designer-assembly-joint)**, from <Ui>Insert</Ui> > <Ui>Joint</Ui>: id gripB, component jawB, connector slide, offset grip.

148. **[Insert component](../reference/commands.md#designer-assembly-insert)**, from <Ui>Insert</Ui> > <Ui>Insert component</Ui>: id shoulderBolt, part screw.

149. **[Replicate](../reference/commands.md#designer-assembly-replicate)**, from <Ui>Insert</Ui> > <Ui>Replicate</Ui>: id shoulderBolt, connector seat.

150. **[Insert component](../reference/commands.md#designer-assembly-insert)**, from <Ui>Insert</Ui> > <Ui>Insert component</Ui>: id shoulderNut, part nut.

151. **[Replicate](../reference/commands.md#designer-assembly-replicate)**, from <Ui>Insert</Ui> > <Ui>Replicate</Ui>: id shoulderNut, connector seat.

152. **[Insert component](../reference/commands.md#designer-assembly-insert)**, from <Ui>Insert</Ui> > <Ui>Insert component</Ui>: id elbowBolt, part screw.

153. **[Replicate](../reference/commands.md#designer-assembly-replicate)**, from <Ui>Insert</Ui> > <Ui>Replicate</Ui>: id elbowBolt, connector seat.

154. **[Insert component](../reference/commands.md#designer-assembly-insert)**, from <Ui>Insert</Ui> > <Ui>Insert component</Ui>: id elbowNut, part nut.

155. **[Replicate](../reference/commands.md#designer-assembly-replicate)**, from <Ui>Insert</Ui> > <Ui>Replicate</Ui>: id elbowNut, connector seat.

156. **[Insert component](../reference/commands.md#designer-assembly-insert)**, from <Ui>Insert</Ui> > <Ui>Insert component</Ui>: id wristBolt, part screw.

157. **[Replicate](../reference/commands.md#designer-assembly-replicate)**, from <Ui>Insert</Ui> > <Ui>Replicate</Ui>: id wristBolt, connector seat.

158. **[Insert component](../reference/commands.md#designer-assembly-insert)**, from <Ui>Insert</Ui> > <Ui>Insert component</Ui>: id wristNut, part nut.

159. **[Replicate](../reference/commands.md#designer-assembly-replicate)**, from <Ui>Insert</Ui> > <Ui>Replicate</Ui>: id wristNut, connector seat.

160. **[Insert component](../reference/commands.md#designer-assembly-insert)**, from <Ui>Insert</Ui> > <Ui>Insert component</Ui>: id baseScrews, part screw.

161. **[Replicate](../reference/commands.md#designer-assembly-replicate)**, from <Ui>Insert</Ui> > <Ui>Replicate</Ui>: id baseScrews, connector seat, offset -2.

162. **[Insert component](../reference/commands.md#designer-assembly-insert)**, from <Ui>Insert</Ui> > <Ui>Insert component</Ui>: id palmScrews, part screw.

163. **[Replicate](../reference/commands.md#designer-assembly-replicate)**, from <Ui>Insert</Ui> > <Ui>Replicate</Ui>: id palmScrews, connector seat, offset -1.5.

164. **[Insert component](../reference/commands.md#designer-assembly-insert)**, from <Ui>Insert</Ui> > <Ui>Insert component</Ui>: id jawScrewsA, part screw.

165. **[Replicate](../reference/commands.md#designer-assembly-replicate)**, from <Ui>Insert</Ui> > <Ui>Replicate</Ui>: id jawScrewsA, connector seat, offset -1.5.

166. **[Insert component](../reference/commands.md#designer-assembly-insert)**, from <Ui>Insert</Ui> > <Ui>Insert component</Ui>: id jawScrewsB, part screw.

167. **[Replicate](../reference/commands.md#designer-assembly-replicate)**, from <Ui>Insert</Ui> > <Ui>Replicate</Ui>: id jawScrewsB, connector seat, offset -1.5.

</details>

![Desk arm, after step 167](/img/generated/designer/desk-arm/arm.webp)

{/* steps:end */}

## Move the arm

The joints read five parameters of the assembly: `yaw`, `shoulder`, `elbow` and `wrist` in degrees, and `grip` in millimetres. Each has a range, so select one in the <Ui>Features</Ui> panel and drag its slider in <Ui>Properties</Ui>: the arm moves while you drag.

Select a link component to give it other values for its document's parameters, such as a longer `length`. Both links come from one document, and each keeps its own values.

## What you made

- **Parts that reuse documents.** The screws are one document inserted many times, each at its own diameter and length, and both arm segments are one link document at two sizes.
- **Connectors.** Every place a part attaches is a connector on a face or a hole. Joints and replicates name connectors, not coordinates, so they follow the parts when sizes change.
- **Joints with limits.** The turntable, the shoulder, the elbow and the wrist turn about their axes and the jaws slide, each within the range its joint allows, while the gripper is fastened to the wrist.

[How the Designer works](../concepts.md) explains documents, connectors and joints in more depth.
