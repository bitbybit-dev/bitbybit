---
sidebar_position: 4
title: "Tangent Lines and Circles"
sidebar_label: Edge Constraints
description: Build OCCT edges that touch other curves - lines tangent to two circles or to a circle and a point, circles of a given radius tangent to two shapes, circles tangent to three, and lines tangent at an angle - in the plane of a frame, with an example in Rete, Blockly and TypeScript.
topic: code.occt.shapes.edge.constraints
type: how-to
tags: [code, occt]
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import BitByBitRenderCanvas from '@site/src/components/BitByBitRenderCanvas';

# Tangent lines and circles

Many outlines are built from pieces that touch: a belt around two pulleys, a slot rounded into a plate, an arc that joins two lines smoothly. OpenCascade can work out where such pieces go. You give it the curves to touch and the plane to work in, and it gives back every line or circle that fits.

## The constructions

| Function | Gives every |
|---|---|
| `linesTangentToTwo` | straight line that touches two curved edges, or touches one and passes through a point |
| `linesTangentAtAngle` | straight line that touches a curved edge at an angle to a straight reference edge |
| `circlesTangentToTwoWithRadius` | circle of a given radius that touches two edges, or passes through the points among them |
| `circlesTangentToTwoCenteredOn` | circle centred on one edge that touches two others |
| `circlesTangentToThree` | circle that touches three edges, or passes through the points among them |

All five live under `bitbybit.occt.shapes.edge`, and work the same way:

- **The shapes** are edges, or vertices for points (`bitbybit.occt.shapes.vertex.vertexFromPoint` makes one from `[x, y, z]`).
- **The frame** gives the plane they lie in: its origin is a point on the plane and its normal is square to it. `bitbybit.frame.zx` is the ground; `bitbybit.frame.xy` stands upright.
- **Every solution comes back**, as a list of edges. Two circles have up to four lines touching both, and you choose the ones you need from the list.
- Arcs count as whole circles, and straight edges as endless lines, unless `onArgumentsOnly` keeps only the solutions that touch within the edges' ends.

## A belt between two wheels

Two circles lie on the ground, and every straight line touching both is drawn: the two outer lines a belt would follow, and the two that cross between the wheels:

{/* example:belt-between-wheels:start - generated from the example's steps for each editor; edits between these markers are overwritten */}

<Tabs groupId="editor" queryString>
<TabItem value="rete" label="Rete">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"{\"id\":\"rete-v2-json\",\"nodes\":{\"big\":{\"id\":\"big\",\"name\":\"bitbybit.occt.shapes.edge.createCircleEdge\",\"customName\":\"circle edge\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"radius\":3,\"center\":[-4,0,0],\"direction\":[0,1,0]},\"inputs\":{},\"position\":[40,40]},\"small\":{\"id\":\"small\",\"name\":\"bitbybit.occt.shapes.edge.createCircleEdge\",\"customName\":\"circle edge\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"radius\":1.5,\"center\":[4,0,0],\"direction\":[0,1,0]},\"inputs\":{},\"position\":[40,420]},\"wheels\":{\"id\":\"wheels\",\"name\":\"bitbybit.lists.createList\",\"customName\":\"create list\",\"async\":false,\"drawable\":false,\"data\":{},\"inputs\":{\"listElements\":{\"connections\":[{\"node\":\"big\",\"output\":\"result\",\"data\":{}},{\"node\":\"small\",\"output\":\"result\",\"data\":{}}]}},\"position\":[460,240]},\"ground\":{\"id\":\"ground\",\"name\":\"bitbybit.frame.zx\",\"customName\":\"zx\",\"async\":false,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":true,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"origin\":[0,0,0]},\"inputs\":{},\"position\":[460,520]},\"belt\":{\"id\":\"belt\",\"name\":\"bitbybit.occt.shapes.edge.linesTangentToTwo\",\"customName\":\"lines tangent to two\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"angularTolerance\":0.000001,\"onArgumentsOnly\":false},\"inputs\":{\"shapes\":{\"connections\":[{\"node\":\"wheels\",\"output\":\"list\",\"data\":{}}]},\"frame\":{\"connections\":[{\"node\":\"ground\",\"output\":\"result\",\"data\":{}}]}},\"position\":[880,240]}},\"modules\":{}}","type":"rete"}}
  title="Lines tangent to two circles in Rete"
  description="Two circles on the ground and every straight line that touches both, like a belt between two wheels."
/>

</TabItem>
<TabItem value="blockly" label="Blockly">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"<xml xmlns=\"https://developers.google.com/blockly/xml\"><variables><variable id=\"wheels\">wheels</variable></variables><block type=\"variables_set\" x=\"40\" y=\"40\"><field name=\"VAR\" id=\"wheels\">wheels</field><value name=\"VALUE\"><block type=\"bitbybit.lists.addItem\"><value name=\"List\"><block type=\"bitbybit.lists.addItem\"><value name=\"List\"><block type=\"bitbybit.lists.createEmptyList\"></block></value><value name=\"Item\"><block type=\"bitbybit.occt.shapes.edge.createCircleEdge\"><value name=\"Radius\"><block type=\"math_number\"><field name=\"NUM\">3</field></block></value><value name=\"Center\"><block type=\"bitbybit.point.pointXYZ\"><value name=\"X\"><block type=\"math_number\"><field name=\"NUM\">-4</field></block></value><value name=\"Y\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Z\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value></block></value><value name=\"Direction\"><block type=\"bitbybit.vector.vectorXYZ\"><value name=\"X\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\"><field name=\"NUM\">1</field></block></value><value name=\"Z\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value></block></value></block></value><value name=\"Clone\"><block type=\"logic_boolean\"><field name=\"BOOL\">FALSE</field></block></value></block></value><value name=\"Item\"><block type=\"bitbybit.occt.shapes.edge.createCircleEdge\"><value name=\"Radius\"><block type=\"math_number\"><field name=\"NUM\">1.5</field></block></value><value name=\"Center\"><block type=\"bitbybit.point.pointXYZ\"><value name=\"X\"><block type=\"math_number\"><field name=\"NUM\">4</field></block></value><value name=\"Y\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Z\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value></block></value><value name=\"Direction\"><block type=\"bitbybit.vector.vectorXYZ\"><value name=\"X\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\"><field name=\"NUM\">1</field></block></value><value name=\"Z\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value></block></value></block></value><value name=\"Clone\"><block type=\"logic_boolean\"><field name=\"BOOL\">FALSE</field></block></value></block></value><next><block type=\"bitbybit.draw.drawAnyAsyncNoReturn\"><value name=\"Entity\"><block type=\"variables_get\"><field name=\"VAR\" id=\"wheels\">wheels</field></block></value><next><block type=\"bitbybit.draw.drawAnyAsyncNoReturn\"><value name=\"Entity\"><block type=\"bitbybit.occt.shapes.edge.linesTangentToTwo\"><value name=\"Shapes\"><block type=\"variables_get\"><field name=\"VAR\" id=\"wheels\">wheels</field></block></value><value name=\"Frame\"><block type=\"bitbybit.frame.zx\"><value name=\"Origin\"><block type=\"bitbybit.point.pointXYZ\"><value name=\"X\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Z\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value></block></value></block></value><value name=\"AngularTolerance\"><block type=\"math_number\"><field name=\"NUM\">0.000001</field></block></value><value name=\"OnArgumentsOnly\"><block type=\"logic_boolean\"><field name=\"BOOL\">FALSE</field></block></value></block></value></block></next></block></next></block></xml>","type":"blockly"}}
  title="Lines tangent to two circles in Blockly"
  description="Two circles on the ground and every straight line that touches both, like a belt between two wheels."
/>

</TabItem>
<TabItem value="typescript" label="TypeScript">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"const big = await bitbybit.occt.shapes.edge.createCircleEdge({ radius: 3, center: [-4, 0, 0], direction: [0, 1, 0] });\nconst small = await bitbybit.occt.shapes.edge.createCircleEdge({ radius: 1.5, center: [4, 0, 0], direction: [0, 1, 0] });\nconst ground = bitbybit.frame.zx({ origin: [0, 0, 0] });\nconst belt = await bitbybit.occt.shapes.edge.linesTangentToTwo({ shapes: [big, small], frame: ground });\n\nawait bitbybit.draw.drawAnyAsync({ entity: [big, small] });\nawait bitbybit.draw.drawAnyAsync({ entity: belt });","type":"typescript"}}
  title="Lines tangent to two circles in TypeScript"
  description="Two circles on the ground and every straight line that touches both, like a belt between two wheels."
/>

</TabItem>
</Tabs>

{/* example:belt-between-wheels:end */}

To build the belt itself, take the two outer lines from the list, trim the circles to the arcs between the touch points, and join the four edges into a wire with `bitbybit.occt.shapes.wire.combineEdgesAndWiresIntoAWire`.

## The older constraint functions

The `constraintTan...` functions of earlier versions, such as `constraintTanLinesOnTwoCircles`, still work, but are deprecated and will be removed in a future major version. Each has a counterpart above, which takes a frame instead of assuming the ground and gives every solution.
