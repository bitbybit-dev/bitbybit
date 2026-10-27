---
sidebar_position: 7
slug: /designer/tutorials/desk-arm/assembly
title: "Model a desk robot arm: the assembly"
sidebar_label: 7. The assembly
description: The last chapter of the desk arm - an assembly with a parameter per joint, the parts inserted (both links from one document), revolute and slider joints with limits, library bolts and nuts through the pivots and screws fastened into the holes.
topic: designer.tutorials.desk-arm.arm
type: tutorial
verified: 2026-10-19
tags: [designer]
---

# Model a desk robot arm: the assembly

The assembly puts the six parts together. Its parameters drive the joints, so posing the arm is changing a number. The fasteners come from the standard parts library: a hex bolt and a nut are inserted for each pivot and replicated onto its connectors, and [Fasten](../../reference/commands.md#designer-assembly-fasten) fills every hole set with socket head cap screws, reading their size from the holes and sinking their heads into the counterbores.

Each step shows the Designer as you make it: a feature's dialog filled in with the step's values, with the tutorial card ringing <Ui>OK</Ui>, or what the step made. The first time a command appears, a picture shows where it is. The step numbers match the card's in <Ui>Help</Ui> > <Ui>Tutorials</Ui>.

{/* steps:start - generated from the tutorial the Designer plays; edits between these markers are overwritten */}

97. **[New assembly](../../reference/commands.md#designer-file-new-assembly)**, from <Ui>File</Ui> > <Ui>New assembly</Ui>: name Desk arm.

    The assembly brings it together: parameters for each joint, the parts inserted (both links from one document at their own sizes), the joints with their limits, then the fasteners from the standard parts library: a hex bolt and a nut through each pivot, and Fasten filling every hole set with socket head cap screws.

    <Shot id="designer.tutorials.desk-arm/where-file-new-assembly" />

    <Shot id="designer.tutorials.desk-arm/step-97" />

98. **[Parameter](../../reference/commands.md#designer-parameter-add)**, from <Ui>Insert</Ui> > <Ui>Parameter</Ui>: name yaw, value -35, unit deg.

    Add the parameter yaw, -35 degrees: how far the shoulder turns on the base.

    <Shot id="designer.tutorials.desk-arm/step-98" />

99. **[Change parameter](../../reference/commands.md#designer-parameter-set)**, from the <Ui>Properties</Ui> panel: name yaw, min -170, max 170.

    Give yaw its range, -170 to 170 degrees: the values the design is drawn for.

    <Shot id="designer.tutorials.desk-arm/step-99" />

100. **[Parameter](../../reference/commands.md#designer-parameter-add)**, from <Ui>Insert</Ui> > <Ui>Parameter</Ui>: name shoulder, value 60, unit deg.

     Add the parameter shoulder, 60 degrees: the upper link's angle at the shoulder.

     <Shot id="designer.tutorials.desk-arm/step-100" />

101. **[Change parameter](../../reference/commands.md#designer-parameter-set)**, from the <Ui>Properties</Ui> panel: name shoulder, min -10, max 120.

     Give shoulder its range, -10 to 120 degrees: the values the design is drawn for.

     <Shot id="designer.tutorials.desk-arm/step-101" />

102. **[Parameter](../../reference/commands.md#designer-parameter-add)**, from <Ui>Insert</Ui> > <Ui>Parameter</Ui>: name elbow, value -80, unit deg.

     Add the parameter elbow, -80 degrees: the forearm's angle at the elbow.

     <Shot id="designer.tutorials.desk-arm/step-102" />

103. **[Change parameter](../../reference/commands.md#designer-parameter-set)**, from the <Ui>Properties</Ui> panel: name elbow, min -100, max 100.

     Give elbow its range, -100 to 100 degrees: the values the design is drawn for.

     <Shot id="designer.tutorials.desk-arm/step-103" />

104. **[Parameter](../../reference/commands.md#designer-parameter-add)**, from <Ui>Insert</Ui> > <Ui>Parameter</Ui>: name wrist, value -40, unit deg.

     Add the parameter wrist, -40 degrees: the wrist's angle.

     <Shot id="designer.tutorials.desk-arm/step-104" />

105. **[Change parameter](../../reference/commands.md#designer-parameter-set)**, from the <Ui>Properties</Ui> panel: name wrist, min -90, max 90.

     Give wrist its range, -90 to 90 degrees: the values the design is drawn for.

     <Shot id="designer.tutorials.desk-arm/step-105" />

106. **[Parameter](../../reference/commands.md#designer-parameter-add)**, from <Ui>Insert</Ui> > <Ui>Parameter</Ui>: name grip, value 4, unit mm.

     Add the parameter grip, 4 mm: how far each jaw slides open.

     <Shot id="designer.tutorials.desk-arm/step-106" />

107. **[Change parameter](../../reference/commands.md#designer-parameter-set)**, from the <Ui>Properties</Ui> panel: name grip, min 0, max 11.

     Give grip its range, 0 to 11 mm: the values the design is drawn for.

     <Shot id="designer.tutorials.desk-arm/step-107" />

108. **[Insert component](../../reference/commands.md#designer-assembly-insert)**, from <Ui>Insert</Ui> > <Ui>Insert component</Ui>: id base, part base.

     Insert the base at the assembly's origin. It is the one component no joint moves.

     <Shot id="designer.tutorials.desk-arm/where-assembly-insert" />

     <Shot id="designer.tutorials.desk-arm/step-108" />

109. **[Insert component](../../reference/commands.md#designer-assembly-insert)**, from <Ui>Insert</Ui> > <Ui>Insert component</Ui>: id turntable, part turntable.

     Insert the shoulder. Where it lands does not matter: the joint in the next step places it.

     <Shot id="designer.tutorials.desk-arm/step-109" />

110. **[Joint](../../reference/commands.md#designer-assembly-joint)**, from <Ui>Insert</Ui> > <Ui>Joint</Ui>: id yaw, component turntable, connector bottom, angle yaw.

     Put the shoulder on the base with a revolute joint, from its bottom connector to the base's top one. The yaw parameter is its angle, kept between -170 and 170 degrees.

     <Shot id="designer.tutorials.desk-arm/where-assembly-joint" />

     <Shot id="designer.tutorials.desk-arm/step-110" />

111. **[Insert component](../../reference/commands.md#designer-assembly-insert)**, from <Ui>Insert</Ui> > <Ui>Insert component</Ui>: id upper, part link.

     Insert the link as the upper arm, 160 mm between its pivots.

     <Shot id="designer.tutorials.desk-arm/step-111" />

112. **[Joint](../../reference/commands.md#designer-assembly-joint)**, from <Ui>Insert</Ui> > <Ui>Joint</Ui>: id shoulder, component upper, connector proximal, angle shoulder.

     Join the upper link's near end to the shoulder's pivot with a revolute joint, turned by shoulder.

     <Shot id="designer.tutorials.desk-arm/step-112" />

113. **[Insert component](../../reference/commands.md#designer-assembly-insert)**, from <Ui>Insert</Ui> > <Ui>Insert component</Ui>: id fore, part link.

     Insert the same link document again as the forearm, slimmer and shorter: length 130, width 14, gap 10, hub 13, tip 11. One document, two parts.

     <Shot id="designer.tutorials.desk-arm/step-113" />

114. **[Joint](../../reference/commands.md#designer-assembly-joint)**, from <Ui>Insert</Ui> > <Ui>Joint</Ui>: id elbow, component fore, connector proximal, angle elbow.

     Join the forearm's near end to the upper link's far end, turned by elbow, kept between -100 and 100 degrees, as far as the fork's seat lets it swing.

     <Shot id="designer.tutorials.desk-arm/step-114" />

115. **[Insert component](../../reference/commands.md#designer-assembly-insert)**, from <Ui>Insert</Ui> > <Ui>Insert component</Ui>: id wrist, part wrist.

     Insert the wrist.

     <Shot id="designer.tutorials.desk-arm/step-115" />

116. **[Joint](../../reference/commands.md#designer-assembly-joint)**, from <Ui>Insert</Ui> > <Ui>Joint</Ui>: id wristJoint, component wrist, connector pin, angle wrist.

     Join the wrist into the forearm's fork, turned by wrist.

     <Shot id="designer.tutorials.desk-arm/step-116" />

117. **[Insert component](../../reference/commands.md#designer-assembly-insert)**, from <Ui>Insert</Ui> > <Ui>Insert component</Ui>: id gripper, part palm.

     Insert the gripper.

     <Shot id="designer.tutorials.desk-arm/step-117" />

118. **[Joint](../../reference/commands.md#designer-assembly-joint)**, from <Ui>Insert</Ui> > <Ui>Joint</Ui>: id mount, component gripper, connector mount.

     Fasten the gripper to the wrist's flange. A fastened joint holds it still.

     <Shot id="designer.tutorials.desk-arm/step-118" />

119. **[Insert component](../../reference/commands.md#designer-assembly-insert)**, from <Ui>Insert</Ui> > <Ui>Insert component</Ui>: id jawA, part jaw.

     Insert a jaw.

     <Shot id="designer.tutorials.desk-arm/step-119" />

120. **[Joint](../../reference/commands.md#designer-assembly-joint)**, from <Ui>Insert</Ui> > <Ui>Joint</Ui>: id gripA, component jawA, connector slide, offset grip.

     Put the first jaw in its rail with a slider joint. Its offset is the grip parameter, 0 to 11 mm.

     <Shot id="designer.tutorials.desk-arm/step-120" />

121. **[Insert component](../../reference/commands.md#designer-assembly-insert)**, from <Ui>Insert</Ui> > <Ui>Insert component</Ui>: id jawB, part jaw.

     Insert a second jaw from the same document.

     <Shot id="designer.tutorials.desk-arm/step-121" />

122. **[Joint](../../reference/commands.md#designer-assembly-joint)**, from <Ui>Insert</Ui> > <Ui>Joint</Ui>: id gripB, component jawB, connector slide, offset grip.

     Put the second jaw in the other rail, driven by the same grip, so both jaws open and close together.

     <Shot id="designer.tutorials.desk-arm/step-122" />

123. **[Standard part](../../reference/commands.md#designer-file-standard-part)**, from <Ui>Insert</Ui> > <Ui>Standard part</Ui>: kind bolt, standard iso, id shoulderBolt.

     Insert a hex bolt from the standard parts library as the shoulder bolt, M8 and 55 mm long. The library adds a Hex bolt part document, which the other bolts reuse at their own lengths.

     {/* shot: designer.tutorials.desk-arm/where-file-standard-part */}

     <Shot id="designer.tutorials.desk-arm/step-123" />

124. **[Replicate](../../reference/commands.md#designer-assembly-replicate)**, from <Ui>Insert</Ui> > <Ui>Replicate</Ui>: id shoulderBolt, connector seat.

     Replicate the bolt onto the shoulder's boltFace connector. It goes through both hubs and the upper link between them.

     <Shot id="designer.tutorials.desk-arm/where-assembly-replicate" />

     <Shot id="designer.tutorials.desk-arm/step-124" />

125. **[Standard part](../../reference/commands.md#designer-file-standard-part)**, from <Ui>Insert</Ui> > <Ui>Standard part</Ui>: kind nut, standard iso, id shoulderNut.

     Insert an M8 hex nut from the library for the shoulder bolt.

     <Shot id="designer.tutorials.desk-arm/step-125" />

126. **[Replicate](../../reference/commands.md#designer-assembly-replicate)**, from <Ui>Insert</Ui> > <Ui>Replicate</Ui>: id shoulderNut, connector seat.

     Replicate the nut onto the shoulder's nutFace connector, on the other side.

     <Shot id="designer.tutorials.desk-arm/step-126" />

127. **[Standard part](../../reference/commands.md#designer-file-standard-part)**, from <Ui>Insert</Ui> > <Ui>Standard part</Ui>: kind bolt, standard iso, id elbowBolt.

     Insert an M8 hex bolt as the elbow bolt, 35 mm long.

     <Shot id="designer.tutorials.desk-arm/step-127" />

128. **[Replicate](../../reference/commands.md#designer-assembly-replicate)**, from <Ui>Insert</Ui> > <Ui>Replicate</Ui>: id elbowBolt, connector seat.

     Replicate it onto the upper link's boltFace connector.

     <Shot id="designer.tutorials.desk-arm/step-128" />

129. **[Standard part](../../reference/commands.md#designer-file-standard-part)**, from <Ui>Insert</Ui> > <Ui>Standard part</Ui>: kind nut, standard iso, id elbowNut.

     Insert an M8 nut for the elbow.

     <Shot id="designer.tutorials.desk-arm/step-129" />

130. **[Replicate](../../reference/commands.md#designer-assembly-replicate)**, from <Ui>Insert</Ui> > <Ui>Replicate</Ui>: id elbowNut, connector seat.

     Replicate it onto the upper link's nutFace connector.

     <Shot id="designer.tutorials.desk-arm/step-130" />

131. **[Standard part](../../reference/commands.md#designer-file-standard-part)**, from <Ui>Insert</Ui> > <Ui>Standard part</Ui>: kind bolt, standard iso, id wristBolt.

     Insert an M8 hex bolt as the wrist bolt, 30 mm long.

     <Shot id="designer.tutorials.desk-arm/step-131" />

132. **[Replicate](../../reference/commands.md#designer-assembly-replicate)**, from <Ui>Insert</Ui> > <Ui>Replicate</Ui>: id wristBolt, connector seat.

     Replicate it onto the forearm's boltFace connector.

     <Shot id="designer.tutorials.desk-arm/step-132" />

133. **[Standard part](../../reference/commands.md#designer-file-standard-part)**, from <Ui>Insert</Ui> > <Ui>Standard part</Ui>: kind nut, standard iso, id wristNut.

     Insert an M8 nut for the wrist.

     <Shot id="designer.tutorials.desk-arm/step-133" />

134. **[Replicate](../../reference/commands.md#designer-assembly-replicate)**, from <Ui>Insert</Ui> > <Ui>Replicate</Ui>: id wristNut, connector seat.

     Replicate it onto the forearm's nutFace connector.

     <Shot id="designer.tutorials.desk-arm/step-134" />

135. **[Fasten](../../reference/commands.md#designer-assembly-fasten)**, from <Ui>Insert</Ui> > <Ui>Fasten</Ui>: length 10, id baseScrews.

     Fasten the base to the desk: Fasten reads M5 from the holes on the base's bolts connector and puts a socket head cap screw, 10 mm long, in each of the four, its head down in the counterbore.

     {/* shot: designer.tutorials.desk-arm/where-assembly-fasten */}

     <Shot id="designer.tutorials.desk-arm/step-135" />

136. **[Fasten](../../reference/commands.md#designer-assembly-fasten)**, from <Ui>Insert</Ui> > <Ui>Fasten</Ui>: length 8, id palmScrews.

     Fasten the gripper's cover screws, M3 by 8 mm, one in each corner.

     <Shot id="designer.tutorials.desk-arm/step-136" />

137. **[Fasten](../../reference/commands.md#designer-assembly-fasten)**, from <Ui>Insert</Ui> > <Ui>Fasten</Ui>: length 10, id jawScrewsA.

     Fasten the first jaw's two screws, M3 by 10 mm.

     <Shot id="designer.tutorials.desk-arm/step-137" />

138. **[Fasten](../../reference/commands.md#designer-assembly-fasten)**, from <Ui>Insert</Ui> > <Ui>Fasten</Ui>: length 10, id jawScrewsB.

     Fasten the second jaw's screws the same way.

     <Shot id="designer.tutorials.desk-arm/step-138" />

<Shot id="designer.tutorials.desk-arm/arm" />

{/* steps:end */}

## Move the arm

The joints read five parameters of the assembly: `yaw`, `shoulder`, `elbow` and `wrist` in degrees, and `grip` in millimetres. Each has a range, so select one in the <Ui>Features</Ui> panel and drag its slider in <Ui>Properties</Ui>: the arm moves while you drag.

Select a link component to give it other values for its document's parameters, such as a longer `length`. Both links come from one document, and each keeps its own values.

## What you made

- **Parts that reuse documents.** The screws are one document inserted many times, each at its own diameter and length, and both arm segments are one link document at two sizes.
- **Connectors.** Every place a part attaches is a connector on a face or a hole. Joints and replicates name connectors, not coordinates, so they follow the parts when sizes change.
- **Joints with limits.** The turntable, the shoulder, the elbow and the wrist turn about their axes and the jaws slide, each within the range its joint allows, while the gripper is fastened to the wrist.

[How the Designer works](../../concepts.md) explains documents, connectors and joints in more depth.
