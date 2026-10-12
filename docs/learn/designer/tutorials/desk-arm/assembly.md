---
sidebar_position: 9
slug: /designer/tutorials/desk-arm/assembly
title: "Model a desk robot arm: the assembly"
sidebar_label: 9. The assembly
description: The last chapter of the desk arm - an assembly with a parameter per joint, the parts inserted (both links from one document), revolute and slider joints with limits, and the screws and nuts replicated onto their holes.
topic: designer.tutorials.desk-arm.arm
type: tutorial
verified: 2026-10-12
tags: [designer]
---

# Model a desk robot arm: the assembly

The assembly puts the eight parts together. Its parameters drive the joints, so posing the arm is changing a number, and the fasteners are replicated onto connectors, so each lands on every hole it belongs in.

Each step shows the Designer as you make it: a feature's dialog filled in with the step's values, with the tutorial card ringing <Ui>OK</Ui>, or what the step made. The first time a command appears, a picture shows where it is. The step numbers match the card's in <Ui>Help</Ui> > <Ui>Tutorials</Ui>.

{/* steps:start - generated from the tutorial the Designer plays; edits between these markers are overwritten */}

122. **[New assembly](../../reference/commands.md#designer-file-new-assembly)**, from <Ui>File</Ui> > <Ui>New assembly</Ui>: name Desk arm.

     The assembly brings it together: parameters for each joint, the parts inserted (both links from one document at their own sizes), the joints with their limits, and the screws and nuts replicated onto their holes.

     {/* shot: designer.tutorials.desk-arm/where-file-new-assembly */}

     {/* shot: designer.tutorials.desk-arm/step-122 */}

123. **[Parameter](../../reference/commands.md#designer-parameter-add)**, from <Ui>Insert</Ui> > <Ui>Parameter</Ui>: name yaw, value -35, unit deg.

     Add the parameter yaw, -35 degrees: how far the shoulder turns on the base.

     {/* shot: designer.tutorials.desk-arm/step-123 */}

124. **[Change parameter](../../reference/commands.md#designer-parameter-set)**, from the <Ui>Properties</Ui> panel: name yaw, min -170, max 170.

     Give yaw its range, -170 to 170 degrees: the values the design is drawn for.

     {/* shot: designer.tutorials.desk-arm/step-124 */}

125. **[Parameter](../../reference/commands.md#designer-parameter-add)**, from <Ui>Insert</Ui> > <Ui>Parameter</Ui>: name shoulder, value 60, unit deg.

     Add the parameter shoulder, 60 degrees: the upper link's angle at the shoulder.

     {/* shot: designer.tutorials.desk-arm/step-125 */}

126. **[Change parameter](../../reference/commands.md#designer-parameter-set)**, from the <Ui>Properties</Ui> panel: name shoulder, min -10, max 120.

     Give shoulder its range, -10 to 120 degrees: the values the design is drawn for.

     {/* shot: designer.tutorials.desk-arm/step-126 */}

127. **[Parameter](../../reference/commands.md#designer-parameter-add)**, from <Ui>Insert</Ui> > <Ui>Parameter</Ui>: name elbow, value -80, unit deg.

     Add the parameter elbow, -80 degrees: the forearm's angle at the elbow.

     {/* shot: designer.tutorials.desk-arm/step-127 */}

128. **[Change parameter](../../reference/commands.md#designer-parameter-set)**, from the <Ui>Properties</Ui> panel: name elbow, min -150, max 150.

     Give elbow its range, -150 to 150 degrees: the values the design is drawn for.

     {/* shot: designer.tutorials.desk-arm/step-128 */}

129. **[Parameter](../../reference/commands.md#designer-parameter-add)**, from <Ui>Insert</Ui> > <Ui>Parameter</Ui>: name wrist, value -40, unit deg.

     Add the parameter wrist, -40 degrees: the wrist's angle.

     {/* shot: designer.tutorials.desk-arm/step-129 */}

130. **[Change parameter](../../reference/commands.md#designer-parameter-set)**, from the <Ui>Properties</Ui> panel: name wrist, min -90, max 90.

     Give wrist its range, -90 to 90 degrees: the values the design is drawn for.

     {/* shot: designer.tutorials.desk-arm/step-130 */}

131. **[Parameter](../../reference/commands.md#designer-parameter-add)**, from <Ui>Insert</Ui> > <Ui>Parameter</Ui>: name grip, value 4, unit mm.

     Add the parameter grip, 4 mm: how far each jaw slides open.

     {/* shot: designer.tutorials.desk-arm/step-131 */}

132. **[Change parameter](../../reference/commands.md#designer-parameter-set)**, from the <Ui>Properties</Ui> panel: name grip, min 0, max 11.

     Give grip its range, 0 to 11 mm: the values the design is drawn for.

     {/* shot: designer.tutorials.desk-arm/step-132 */}

133. **[Insert component](../../reference/commands.md#designer-assembly-insert)**, from <Ui>Insert</Ui> > <Ui>Insert component</Ui>: id base, part base.

     Insert the base at the assembly's origin. It is the one component no joint moves.

     {/* shot: designer.tutorials.desk-arm/where-assembly-insert */}

     {/* shot: designer.tutorials.desk-arm/step-133 */}

134. **[Insert component](../../reference/commands.md#designer-assembly-insert)**, from <Ui>Insert</Ui> > <Ui>Insert component</Ui>: id turntable, part turntable.

     Insert the shoulder. Where it lands does not matter: the joint in the next step places it.

     {/* shot: designer.tutorials.desk-arm/step-134 */}

135. **[Joint](../../reference/commands.md#designer-assembly-joint)**, from <Ui>Insert</Ui> > <Ui>Joint</Ui>: id yaw, component turntable, connector bottom, angle yaw.

     Put the shoulder on the base with a revolute joint, from its bottom connector to the base's top one. The yaw parameter is its angle, kept between -170 and 170 degrees.

     {/* shot: designer.tutorials.desk-arm/where-assembly-joint */}

     {/* shot: designer.tutorials.desk-arm/step-135 */}

136. **[Insert component](../../reference/commands.md#designer-assembly-insert)**, from <Ui>Insert</Ui> > <Ui>Insert component</Ui>: id upper, part link.

     Insert the link as the upper arm, 160 mm between its pivots.

     {/* shot: designer.tutorials.desk-arm/step-136 */}

137. **[Joint](../../reference/commands.md#designer-assembly-joint)**, from <Ui>Insert</Ui> > <Ui>Joint</Ui>: id shoulder, component upper, connector proximal, angle shoulder.

     Join the upper link's near end to the shoulder's pivot with a revolute joint, turned by shoulder.

     {/* shot: designer.tutorials.desk-arm/step-137 */}

138. **[Insert component](../../reference/commands.md#designer-assembly-insert)**, from <Ui>Insert</Ui> > <Ui>Insert component</Ui>: id fore, part link.

     Insert the same link document again as the forearm, slimmer and shorter: length 130, width 14, gap 10, hub 13, tip 11. One document, two parts.

     {/* shot: designer.tutorials.desk-arm/step-138 */}

139. **[Joint](../../reference/commands.md#designer-assembly-joint)**, from <Ui>Insert</Ui> > <Ui>Joint</Ui>: id elbow, component fore, connector proximal, angle elbow.

     Join the forearm's near end to the upper link's far end, turned by elbow.

     {/* shot: designer.tutorials.desk-arm/step-139 */}

140. **[Insert component](../../reference/commands.md#designer-assembly-insert)**, from <Ui>Insert</Ui> > <Ui>Insert component</Ui>: id wrist, part wrist.

     Insert the wrist.

     {/* shot: designer.tutorials.desk-arm/step-140 */}

141. **[Joint](../../reference/commands.md#designer-assembly-joint)**, from <Ui>Insert</Ui> > <Ui>Joint</Ui>: id wristJoint, component wrist, connector pin, angle wrist.

     Join the wrist into the forearm's fork, turned by wrist.

     {/* shot: designer.tutorials.desk-arm/step-141 */}

142. **[Insert component](../../reference/commands.md#designer-assembly-insert)**, from <Ui>Insert</Ui> > <Ui>Insert component</Ui>: id gripper, part palm.

     Insert the gripper.

     {/* shot: designer.tutorials.desk-arm/step-142 */}

143. **[Joint](../../reference/commands.md#designer-assembly-joint)**, from <Ui>Insert</Ui> > <Ui>Joint</Ui>: id mount, component gripper, connector mount.

     Fasten the gripper to the wrist's flange. A fastened joint holds it still.

     {/* shot: designer.tutorials.desk-arm/step-143 */}

144. **[Insert component](../../reference/commands.md#designer-assembly-insert)**, from <Ui>Insert</Ui> > <Ui>Insert component</Ui>: id jawA, part jaw.

     Insert a jaw.

     {/* shot: designer.tutorials.desk-arm/step-144 */}

145. **[Joint](../../reference/commands.md#designer-assembly-joint)**, from <Ui>Insert</Ui> > <Ui>Joint</Ui>: id gripA, component jawA, connector slide, offset grip.

     Put the first jaw in its rail with a slider joint. Its offset is the grip parameter, 0 to 11 mm.

     {/* shot: designer.tutorials.desk-arm/step-145 */}

146. **[Insert component](../../reference/commands.md#designer-assembly-insert)**, from <Ui>Insert</Ui> > <Ui>Insert component</Ui>: id jawB, part jaw.

     Insert a second jaw from the same document.

     {/* shot: designer.tutorials.desk-arm/step-146 */}

147. **[Joint](../../reference/commands.md#designer-assembly-joint)**, from <Ui>Insert</Ui> > <Ui>Joint</Ui>: id gripB, component jawB, connector slide, offset grip.

     Put the second jaw in the other rail, driven by the same grip, so both jaws open and close together.

     {/* shot: designer.tutorials.desk-arm/step-147 */}

148. **[Insert component](../../reference/commands.md#designer-assembly-insert)**, from <Ui>Insert</Ui> > <Ui>Insert component</Ui>: id shoulderBolt, part screw.

     Insert the screw document as the shoulder bolt, 8 mm across and 55 mm long.

     {/* shot: designer.tutorials.desk-arm/step-148 */}

149. **[Replicate](../../reference/commands.md#designer-assembly-replicate)**, from <Ui>Insert</Ui> > <Ui>Replicate</Ui>: id shoulderBolt, connector seat.

     Replicate the bolt onto the shoulder's boltFace connector. It goes through both hubs and the upper link between them.

     {/* shot: designer.tutorials.desk-arm/where-assembly-replicate */}

     {/* shot: designer.tutorials.desk-arm/step-149 */}

150. **[Insert component](../../reference/commands.md#designer-assembly-insert)**, from <Ui>Insert</Ui> > <Ui>Insert component</Ui>: id shoulderNut, part nut.

     Insert the nut document for the shoulder bolt.

     {/* shot: designer.tutorials.desk-arm/step-150 */}

151. **[Replicate](../../reference/commands.md#designer-assembly-replicate)**, from <Ui>Insert</Ui> > <Ui>Replicate</Ui>: id shoulderNut, connector seat.

     Replicate the nut onto the shoulder's nutFace connector, on the other side.

     {/* shot: designer.tutorials.desk-arm/step-151 */}

152. **[Insert component](../../reference/commands.md#designer-assembly-insert)**, from <Ui>Insert</Ui> > <Ui>Insert component</Ui>: id elbowBolt, part screw.

     Insert a screw as the elbow bolt, 8 by 34 mm.

     {/* shot: designer.tutorials.desk-arm/step-152 */}

153. **[Replicate](../../reference/commands.md#designer-assembly-replicate)**, from <Ui>Insert</Ui> > <Ui>Replicate</Ui>: id elbowBolt, connector seat.

     Replicate it onto the upper link's boltFace connector.

     {/* shot: designer.tutorials.desk-arm/step-153 */}

154. **[Insert component](../../reference/commands.md#designer-assembly-insert)**, from <Ui>Insert</Ui> > <Ui>Insert component</Ui>: id elbowNut, part nut.

     Insert a nut for the elbow.

     {/* shot: designer.tutorials.desk-arm/step-154 */}

155. **[Replicate](../../reference/commands.md#designer-assembly-replicate)**, from <Ui>Insert</Ui> > <Ui>Replicate</Ui>: id elbowNut, connector seat.

     Replicate it onto the upper link's nutFace connector.

     {/* shot: designer.tutorials.desk-arm/step-155 */}

156. **[Insert component](../../reference/commands.md#designer-assembly-insert)**, from <Ui>Insert</Ui> > <Ui>Insert component</Ui>: id wristBolt, part screw.

     Insert a screw as the wrist bolt, 8 by 30 mm.

     {/* shot: designer.tutorials.desk-arm/step-156 */}

157. **[Replicate](../../reference/commands.md#designer-assembly-replicate)**, from <Ui>Insert</Ui> > <Ui>Replicate</Ui>: id wristBolt, connector seat.

     Replicate it onto the forearm's boltFace connector.

     {/* shot: designer.tutorials.desk-arm/step-157 */}

158. **[Insert component](../../reference/commands.md#designer-assembly-insert)**, from <Ui>Insert</Ui> > <Ui>Insert component</Ui>: id wristNut, part nut.

     Insert a nut for the wrist.

     {/* shot: designer.tutorials.desk-arm/step-158 */}

159. **[Replicate](../../reference/commands.md#designer-assembly-replicate)**, from <Ui>Insert</Ui> > <Ui>Replicate</Ui>: id wristNut, connector seat.

     Replicate it onto the forearm's nutFace connector.

     {/* shot: designer.tutorials.desk-arm/step-159 */}

160. **[Insert component](../../reference/commands.md#designer-assembly-insert)**, from <Ui>Insert</Ui> > <Ui>Insert component</Ui>: id baseScrews, part screw.

     Insert a screw for the base, 5 by 9 mm.

     {/* shot: designer.tutorials.desk-arm/step-160 */}

161. **[Replicate](../../reference/commands.md#designer-assembly-replicate)**, from <Ui>Insert</Ui> > <Ui>Replicate</Ui>: id baseScrews, connector seat, offset -2.

     Replicate it onto the base's bolts connector, 2 mm down into the counterbores. One copy lands in each of the four holes.

     {/* shot: designer.tutorials.desk-arm/step-161 */}

162. **[Insert component](../../reference/commands.md#designer-assembly-insert)**, from <Ui>Insert</Ui> > <Ui>Insert component</Ui>: id palmScrews, part screw.

     Insert a screw for the gripper's cover, 3 by 8 mm.

     {/* shot: designer.tutorials.desk-arm/step-162 */}

163. **[Replicate](../../reference/commands.md#designer-assembly-replicate)**, from <Ui>Insert</Ui> > <Ui>Replicate</Ui>: id palmScrews, connector seat, offset -1.5.

     Replicate it onto the gripper's screws connector, 1.5 mm down, one in each corner.

     {/* shot: designer.tutorials.desk-arm/step-163 */}

164. **[Insert component](../../reference/commands.md#designer-assembly-insert)**, from <Ui>Insert</Ui> > <Ui>Insert component</Ui>: id jawScrewsA, part screw.

     Insert a screw for the first jaw, 3 by 10 mm.

     {/* shot: designer.tutorials.desk-arm/step-164 */}

165. **[Replicate](../../reference/commands.md#designer-assembly-replicate)**, from <Ui>Insert</Ui> > <Ui>Replicate</Ui>: id jawScrewsA, connector seat, offset -1.5.

     Replicate it onto the first jaw's screws connector.

     {/* shot: designer.tutorials.desk-arm/step-165 */}

166. **[Insert component](../../reference/commands.md#designer-assembly-insert)**, from <Ui>Insert</Ui> > <Ui>Insert component</Ui>: id jawScrewsB, part screw.

     Insert a screw for the second jaw.

     {/* shot: designer.tutorials.desk-arm/step-166 */}

167. **[Replicate](../../reference/commands.md#designer-assembly-replicate)**, from <Ui>Insert</Ui> > <Ui>Replicate</Ui>: id jawScrewsB, connector seat, offset -1.5.

     Replicate it onto the second jaw's screws connector.

     {/* shot: designer.tutorials.desk-arm/step-167 */}

{/* shot: designer.tutorials.desk-arm/arm */}

{/* steps:end */}

## Move the arm

The joints read five parameters of the assembly: `yaw`, `shoulder`, `elbow` and `wrist` in degrees, and `grip` in millimetres. Each has a range, so select one in the <Ui>Features</Ui> panel and drag its slider in <Ui>Properties</Ui>: the arm moves while you drag.

Select a link component to give it other values for its document's parameters, such as a longer `length`. Both links come from one document, and each keeps its own values.

## What you made

- **Parts that reuse documents.** The screws are one document inserted many times, each at its own diameter and length, and both arm segments are one link document at two sizes.
- **Connectors.** Every place a part attaches is a connector on a face or a hole. Joints and replicates name connectors, not coordinates, so they follow the parts when sizes change.
- **Joints with limits.** The turntable, the shoulder, the elbow and the wrist turn about their axes and the jaws slide, each within the range its joint allows, while the gripper is fastened to the wrist.

[How the Designer works](../../concepts.md) explains documents, connectors and joints in more depth.
