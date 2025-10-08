---
sidebar_position: 3
title: "Edge Primitives"
sidebar_label: Edge Primitives
description: Master the fundamentals of edge creation in OCCT - from simple lines and circles to complex arcs and ellipses. Learn multiple methods to create precise geometric boundaries for your 3D models.
tags: [occt]
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import BitByBitRenderCanvas from '@site/src/components/BitByBitRenderCanvas';

# Edge Primitives

<img 
  src="https://s.bitbybit.dev/assets/icons/white/occt-icon.svg" 
  alt="OCCT category icon with a stylized logo representation"
  width="100"
  title="OCCT category icon" />


Edge primitives are the fundamental building blocks for creating geometric boundaries in 3D modeling. In OCCT (Open CASCADE Technology), edges define the boundaries between faces and form the skeleton of complex 3D shapes. This tutorial covers the essential edge types you'll use in most modeling scenarios.

## What You'll Learn

In this tutorial, you'll discover how to create:

- **Linear edges** - straight lines between two points
- **Circular arcs** - curved segments using various definition methods
- **Complete circles** - closed circular boundaries
- **Elliptical edges** - oval-shaped curves with dual radii

Each example is provided in three formats: **Rete** (visual node-based), **Blockly** (block-based), and **TypeScript** (code-based), so you can learn using your preferred approach.

## Why Edge Primitives Matter

Understanding edge primitives is crucial because:
- They form the boundaries of all 3D shapes
- They enable precise geometric control in your models
- They provide multiple creation methods for different design scenarios
- They serve as the foundation for more complex geometric operations

Let's start with the most basic edge primitive - the line edge.

---

<Tabs groupId="linear-edge">
<TabItem value="rete" label="Rete">
    <BitByBitRenderCanvas
    requireManualStart={true}
    script={{"script":"{\"id\":\"rete-v2-json\",\"nodes\":{\"95d786dcd4c56129\":{\"id\":\"95d786dcd4c56129\",\"name\":\"bitbybit.occt.shapes.edge.line\",\"customName\":\"line\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"start\":[0,0,0],\"end\":[0,1,0]},\"inputs\":{\"start\":{\"connections\":[{\"node\":\"7c324685a8416e59\",\"output\":\"result\",\"data\":{}}]},\"end\":{\"connections\":[{\"node\":\"ffc85d04b421e501\",\"output\":\"result\",\"data\":{}}]}},\"position\":[935.133850142149,303.38593169102637]},\"7c324685a8416e59\":{\"id\":\"7c324685a8416e59\",\"name\":\"bitbybit.vector.vectorXYZ\",\"customName\":\"vector xyz\",\"async\":false,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"x\":-5,\"y\":0,\"z\":0},\"inputs\":{},\"position\":[373.89453125,135.734375]},\"ffc85d04b421e501\":{\"id\":\"ffc85d04b421e501\",\"name\":\"bitbybit.vector.vectorXYZ\",\"customName\":\"vector xyz\",\"async\":false,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"x\":5,\"y\":0,\"z\":0},\"inputs\":{},\"position\":[376.609375,493.1484375]}}}","version":"0.20.7","type":"rete"}}
    title="Creating primitive solids"
    />
</TabItem>
<TabItem value="blockly" label="Blockly">
  <BitByBitRenderCanvas
    requireManualStart={true}
    script={{"script":"<xml xmlns=\"https://developers.google.com/blockly/xml\"><variables><variable id=\"4nll7g4=Z;gWnnyZ:HHz\">startPoint</variable><variable id=\"!I+0HTn-qeBXPaX{NKpl\">endPoint</variable></variables><block type=\"variables_set\" id=\"_j}n^/IkHW%x%IUSkRXm\" x=\"-92\" y=\"-110\"><field name=\"VAR\" id=\"4nll7g4=Z;gWnnyZ:HHz\">startPoint</field><value name=\"VALUE\"><block type=\"bitbybit.point.pointXYZ\" id=\"2^L#Z.tOl2wilqZ7.w:~\"><value name=\"X\"><block type=\"math_number\" id=\"YV@9PLbQtLU(:u7;L[~4\"><field name=\"NUM\">-5</field></block></value><value name=\"Y\"><block type=\"math_number\" id=\"=X}xz%6~U:aDMzS4d=#r\"><field name=\"NUM\">0</field></block></value><value name=\"Z\"><block type=\"math_number\" id=\"JnXwwmA^,mEl#VWe5,Hq\"><field name=\"NUM\">0</field></block></value></block></value><next><block type=\"variables_set\" id=\"*g_!#8`HUe]$6O?5xD;d\"><field name=\"VAR\" id=\"!I+0HTn-qeBXPaX{NKpl\">endPoint</field><value name=\"VALUE\"><block type=\"bitbybit.point.pointXYZ\" id=\"lExqjC~,-k!==7]^2Kwl\"><value name=\"X\"><block type=\"math_number\" id=\"XeuLamP3Ao8QIg{9`lJ/\"><field name=\"NUM\">5</field></block></value><value name=\"Y\"><block type=\"math_number\" id=\"?`hA?MfA,Ju]RB%vKO4*\"><field name=\"NUM\">0</field></block></value><value name=\"Z\"><block type=\"math_number\" id=\"KAp8{=zz{GnbPd+);BJP\"><field name=\"NUM\">0</field></block></value></block></value><next><block type=\"bitbybit.draw.drawAnyAsyncNoReturn\" id=\"euho28jOWwp2R!GOM$y_\"><value name=\"Entity\"><block type=\"bitbybit.occt.shapes.edge.line\" id=\"=N3d%S:?t^5.}ARPzu#Q\"><value name=\"Start\"><block type=\"variables_get\" id=\"Od4Vo*_H!jW*f6Zn]hf,\"><field name=\"VAR\" id=\"4nll7g4=Z;gWnnyZ:HHz\">startPoint</field></block></value><value name=\"End\"><block type=\"variables_get\" id=\"c^d^#RY~i@0DEn/+KlS#\"><field name=\"VAR\" id=\"!I+0HTn-qeBXPaX{NKpl\">endPoint</field></block></value></block></value><next><block type=\"bitbybit.draw.drawAnyAsyncNoReturn\" id=\";%q$%QXbRxup{vw9L`oN\"><value name=\"Entity\"><block type=\"variables_get\" id=\"nw#i=i/Su)cNm0tAB^M_\"><field name=\"VAR\" id=\"4nll7g4=Z;gWnnyZ:HHz\">startPoint</field></block></value><next><block type=\"bitbybit.draw.drawAnyAsyncNoReturn\" id=\"a)AotT@j~#jGuSk;Yj]T\"><value name=\"Entity\"><block type=\"variables_get\" id=\"F4r|+_Kg).!fK3?qhep|\"><field name=\"VAR\" id=\"!I+0HTn-qeBXPaX{NKpl\">endPoint</field></block></value></block></next></block></next></block></next></block></next></block></xml>","version":"0.20.7","type":"blockly"}}
    title="Creating primitive solids"
    />
</TabItem>
<TabItem value="typescript" label="TypeScript">
<BitByBitRenderCanvas
    requireManualStart={true}
    script={{"script":"const { LineDto } = Bit.Inputs.OCCT;\n// Import required types\ntype Point3 = Bit.Inputs.Base.Point3;\n\n// Define the main function\nconst start = async () => {\n    // Create start and end points\n    const startPoint: Point3 = [-5, 0, 0];\n    const endPoint: Point3 = [5, 0, 0];\n\n    // Create a line between the points\n    const lineOptions = new LineDto();\n    lineOptions.start = startPoint;\n    lineOptions.end = endPoint;\n\n    const line = await bitbybit.occt.shapes.edge.line(lineOptions);\n\n    // Draw the line and points\n    bitbybit.draw.drawAnyAsync({ entity: line });\n    bitbybit.draw.drawAnyAsync({ entity: startPoint });\n    bitbybit.draw.drawAnyAsync({ entity: endPoint });\n}\n\n// Execute the function\nstart();","version":"0.20.7","type":"typescript"}}
    title="Creating primitive solids"
    />
</TabItem>
</Tabs>

## Line Edge

This example demonstrates how to create a simple straight line edge in 3D space. A line edge is the most basic type of edge primitive, defined by two points: a start point and an end point.

**What's happening:**
- We define two points: `startPoint` at `[-5, 0, 0]` and `endPoint` at `[5, 0, 0]`
- These points create a horizontal line along the X-axis, 10 units long
- The `LineDto` object packages our start and end points for the OCCT line creation function
- The result is a straight edge that can be used in more complex geometries or displayed on its own

**Key concepts:**
- **Start and End Points**: Every line needs exactly two points to define its position and direction
- **3D Coordinates**: Points are specified as `[x, y, z]` coordinates in 3D space
- **Edge vs Line**: An edge is a geometric boundary that can be part of a face or solid, while a line is the mathematical definition


<Tabs groupId="arc-edge-three-points">
<TabItem value="rete" label="Rete">
    <BitByBitRenderCanvas
    requireManualStart={true}
    script={{"script":"{\"id\":\"rete-v2-json\",\"nodes\":{\"7c324685a8416e59\":{\"id\":\"7c324685a8416e59\",\"name\":\"bitbybit.vector.vectorXYZ\",\"customName\":\"vector xyz\",\"async\":false,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"x\":-5,\"y\":0,\"z\":0},\"inputs\":{},\"position\":[407.27152338242496,28.397666819319923]},\"ffc85d04b421e501\":{\"id\":\"ffc85d04b421e501\",\"name\":\"bitbybit.vector.vectorXYZ\",\"customName\":\"vector xyz\",\"async\":false,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"x\":5,\"y\":0,\"z\":0},\"inputs\":{},\"position\":[398.7292096351899,756.692501905938]},\"3d68f48c12708bfb\":{\"id\":\"3d68f48c12708bfb\",\"name\":\"bitbybit.occt.shapes.edge.arcThroughThreePoints\",\"customName\":\"arc through three points\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"start\":[0,0,0],\"middle\":[0,1,0],\"end\":[0,0,1]},\"inputs\":{\"start\":{\"connections\":[{\"node\":\"7c324685a8416e59\",\"output\":\"result\",\"data\":{}}]},\"end\":{\"connections\":[{\"node\":\"ffc85d04b421e501\",\"output\":\"result\",\"data\":{}}]},\"middle\":{\"connections\":[{\"node\":\"dbc242d287977e7c\",\"output\":\"result\",\"data\":{}}]}},\"position\":[1066.9435736855678,341.1003151875607]},\"dbc242d287977e7c\":{\"id\":\"dbc242d287977e7c\",\"name\":\"bitbybit.vector.vectorXYZ\",\"customName\":\"vector xyz\",\"async\":false,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"x\":0,\"y\":6,\"z\":0},\"inputs\":{},\"position\":[403.21247949687677,385.92908959314644]}}}","version":"0.20.7","type":"rete"}}
    title="Arc edge through 3 points"
    />
</TabItem>
<TabItem value="blockly" label="Blockly">
  <BitByBitRenderCanvas
    requireManualStart={true}
    script={{"script":"<xml xmlns=\"https://developers.google.com/blockly/xml\"><variables><variable id=\"4nll7g4=Z;gWnnyZ:HHz\">startPoint</variable><variable id=\":=AxCQB9YA{zEvX*iUM#\">midPoint</variable><variable id=\"!I+0HTn-qeBXPaX{NKpl\">endPoint</variable></variables><block type=\"variables_set\" id=\"_j}n^/IkHW%x%IUSkRXm\" x=\"-92\" y=\"-110\"><field name=\"VAR\" id=\"4nll7g4=Z;gWnnyZ:HHz\">startPoint</field><value name=\"VALUE\"><block type=\"bitbybit.point.pointXYZ\" id=\"2^L#Z.tOl2wilqZ7.w:~\"><value name=\"X\"><block type=\"math_number\" id=\"YV@9PLbQtLU(:u7;L[~4\"><field name=\"NUM\">-5</field></block></value><value name=\"Y\"><block type=\"math_number\" id=\"=X}xz%6~U:aDMzS4d=#r\"><field name=\"NUM\">0</field></block></value><value name=\"Z\"><block type=\"math_number\" id=\"JnXwwmA^,mEl#VWe5,Hq\"><field name=\"NUM\">0</field></block></value></block></value><next><block type=\"variables_set\" id=\"U~nshs{xv*uf-r]McOsy\"><field name=\"VAR\" id=\":=AxCQB9YA{zEvX*iUM#\">midPoint</field><value name=\"VALUE\"><block type=\"bitbybit.point.pointXYZ\" id=\"pq%oBz4yf5.8k#l3MC*C\"><value name=\"X\"><block type=\"math_number\" id=\"$G*vTa$m-Wn@B}(w=Wj-\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\" id=\"{^_J|-!8h6=W:II%-5ac\"><field name=\"NUM\">6</field></block></value><value name=\"Z\"><block type=\"math_number\" id=\"I$?|{sI0luL3wA{{|HhJ\"><field name=\"NUM\">0</field></block></value></block></value><next><block type=\"variables_set\" id=\"*g_!#8`HUe]$6O?5xD;d\"><field name=\"VAR\" id=\"!I+0HTn-qeBXPaX{NKpl\">endPoint</field><value name=\"VALUE\"><block type=\"bitbybit.point.pointXYZ\" id=\"lExqjC~,-k!==7]^2Kwl\"><value name=\"X\"><block type=\"math_number\" id=\"XeuLamP3Ao8QIg{9`lJ/\"><field name=\"NUM\">5</field></block></value><value name=\"Y\"><block type=\"math_number\" id=\"?`hA?MfA,Ju]RB%vKO4*\"><field name=\"NUM\">0</field></block></value><value name=\"Z\"><block type=\"math_number\" id=\"KAp8{=zz{GnbPd+);BJP\"><field name=\"NUM\">0</field></block></value></block></value><next><block type=\"bitbybit.draw.drawAnyAsyncNoReturn\" id=\"euho28jOWwp2R!GOM$y_\"><value name=\"Entity\"><block type=\"bitbybit.occt.shapes.edge.arcThroughThreePoints\" id=\"#mcO8}Ns),[ZT?8,[gaQ\"><value name=\"Start\"><block type=\"variables_get\" id=\"Od4Vo*_H!jW*f6Zn]hf,\"><field name=\"VAR\" id=\"4nll7g4=Z;gWnnyZ:HHz\">startPoint</field></block></value><value name=\"Middle\"><block type=\"variables_get\" id=\"#7pwLrh^)X5ZJi)PnSoa\"><field name=\"VAR\" id=\":=AxCQB9YA{zEvX*iUM#\">midPoint</field></block></value><value name=\"End\"><block type=\"variables_get\" id=\"c^d^#RY~i@0DEn/+KlS#\"><field name=\"VAR\" id=\"!I+0HTn-qeBXPaX{NKpl\">endPoint</field></block></value></block></value><next><block type=\"bitbybit.draw.drawAnyAsyncNoReturn\" id=\";%q$%QXbRxup{vw9L`oN\"><value name=\"Entity\"><block type=\"lists_create_with\" id=\"+:[Mz{B?Q5cK+ieG`ZdT\"><mutation items=\"3\"></mutation><value name=\"ADD0\"><block type=\"variables_get\" id=\"r**`U}?Yc9GJ26,2)Hx|\"><field name=\"VAR\" id=\"4nll7g4=Z;gWnnyZ:HHz\">startPoint</field></block></value><value name=\"ADD1\"><block type=\"variables_get\" id=\"NQ/J5TXO|_f,C4/Xwa}F\"><field name=\"VAR\" id=\":=AxCQB9YA{zEvX*iUM#\">midPoint</field></block></value><value name=\"ADD2\"><block type=\"variables_get\" id=\"nw#i=i/Su)cNm0tAB^M_\"><field name=\"VAR\" id=\"!I+0HTn-qeBXPaX{NKpl\">endPoint</field></block></value></block></value></block></next></block></next></block></next></block></next></block></xml>","version":"0.20.7","type":"blockly"}}
    title="Arc edge through 3 points"
    />
</TabItem>
<TabItem value="typescript" label="TypeScript">
<BitByBitRenderCanvas
    requireManualStart={true}
    script={{"script":"const { ArcEdgeThreePointsDto } = Bit.Inputs.OCCT;\n// Import required types\ntype Point3 = Bit.Inputs.Base.Point3;\n\n// Define the main function\nconst start = async () => {\n    // Create start and end points\n    const startPoint: Point3 = [-5, 0, 0];\n    const midPoint: Point3 = [0, 6, 0];\n    const endPoint: Point3 = [5, 0, 0];\n\n    // Create a arc between three points\n    const arcOptions = new ArcEdgeThreePointsDto();\n    arcOptions.start = startPoint;\n    arcOptions.middle = midPoint;\n    arcOptions.end = endPoint;\n\n    const arc = await bitbybit.occt.shapes.edge.arcThroughThreePoints(arcOptions);\n\n    // Draw the arc and points\n    bitbybit.draw.drawAnyAsync({ entity: arc });\n    bitbybit.draw.drawAnyAsync({ entity: [startPoint, midPoint, endPoint] });\n}\n\n// Execute the function\nstart();","version":"0.20.7","type":"typescript"}}
    title="Arc edge through 3 points"
    />
</TabItem>
</Tabs>

## Arc Through Three Points

This example shows how to create an arc edge that passes through three specific points. This is one of the most intuitive ways to define an arc since you can directly control three points that the arc must pass through.

**What's happening:**
- We define three points: `startPoint` at `[-5, 0, 0]`, `midPoint` at `[0, 6, 0]`, and `endPoint` at `[5, 0, 0]`
- The arc starts at the first point, curves through the middle point, and ends at the third point
- OCCT automatically calculates the circular arc that best fits these three points
- The middle point determines how much the arc curves - higher Y values create more pronounced curves

**Key concepts:**
- **Three-Point Definition**: The arc is uniquely defined by exactly three non-collinear points
- **Curve Direction**: The order of points matters - the arc flows from start to middle to end
- **Geometric Constraint**: The three points cannot be in a straight line (collinear) as this wouldn't define a unique arc


<Tabs groupId="arc-edge-two-points-tangent">
<TabItem value="rete" label="Rete">
    <BitByBitRenderCanvas
    requireManualStart={true}
    script={{"script":"{\"id\":\"rete-v2-json\",\"nodes\":{\"7c324685a8416e59\":{\"id\":\"7c324685a8416e59\",\"name\":\"bitbybit.vector.vectorXYZ\",\"customName\":\"vector xyz\",\"async\":false,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"x\":-5,\"y\":0,\"z\":0},\"inputs\":{},\"position\":[407.27152338242496,28.397666819319923]},\"ffc85d04b421e501\":{\"id\":\"ffc85d04b421e501\",\"name\":\"bitbybit.vector.vectorXYZ\",\"customName\":\"vector xyz\",\"async\":false,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"x\":5,\"y\":0,\"z\":0},\"inputs\":{},\"position\":[398.7292096351899,756.692501905938]},\"b8be5b2f57d0fdff\":{\"id\":\"b8be5b2f57d0fdff\",\"name\":\"bitbybit.occt.shapes.edge.arcThroughTwoPointsAndTangent\",\"customName\":\"arc through two points and tangent\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"start\":[0,0,0],\"tangentVec\":[0,1,0],\"end\":[0,0,1]},\"inputs\":{\"start\":{\"connections\":[{\"node\":\"7c324685a8416e59\",\"output\":\"result\",\"data\":{}}]},\"end\":{\"connections\":[{\"node\":\"ffc85d04b421e501\",\"output\":\"result\",\"data\":{}}]},\"tangentVec\":{\"connections\":[{\"node\":\"efafce24c1d0df6e\",\"output\":\"result\",\"data\":{}}]}},\"position\":[1830.1366458305074,296.5007789636968]},\"dca4efae87f6bfab\":{\"id\":\"dca4efae87f6bfab\",\"name\":\"bitbybit.point.pointXYZ\",\"customName\":\"point xyz\",\"async\":false,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"x\":-2,\"y\":3,\"z\":0},\"inputs\":{},\"position\":[405.11746168870525,383.2258817291941]},\"efafce24c1d0df6e\":{\"id\":\"efafce24c1d0df6e\",\"name\":\"bitbybit.vector.sub\",\"customName\":\"sub\",\"async\":false,\"drawable\":false,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false}},\"inputs\":{\"second\":{\"connections\":[{\"node\":\"dca4efae87f6bfab\",\"output\":\"result\",\"data\":{}}]},\"first\":{\"connections\":[{\"node\":\"7c324685a8416e59\",\"output\":\"result\",\"data\":{}}]}},\"position\":[946.71445993969,341.56236361525805]},\"b39948feb5637468\":{\"id\":\"b39948feb5637468\",\"name\":\"bitbybit.line.create\",\"customName\":\"line\",\"async\":false,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false}},\"inputs\":{\"end\":{\"connections\":[{\"node\":\"dca4efae87f6bfab\",\"output\":\"result\",\"data\":{}}]},\"start\":{\"connections\":[{\"node\":\"7c324685a8416e59\",\"output\":\"result\",\"data\":{}}]}},\"position\":[942.5678589949399,-159.11706305406148]}}}","version":"0.20.7","type":"rete"}}
    title="Arc edge from two points and tangent"
    />
</TabItem>
<TabItem value="blockly" label="Blockly">
  <BitByBitRenderCanvas
    requireManualStart={true}
    script={{"script":"<xml xmlns=\"https://developers.google.com/blockly/xml\"><variables><variable id=\"4nll7g4=Z;gWnnyZ:HHz\">startPoint</variable><variable id=\":=AxCQB9YA{zEvX*iUM#\">vecEndPt</variable><variable id=\"!I+0HTn-qeBXPaX{NKpl\">endPoint</variable><variable id=\"kxND2yNBL3ne04((]NR+\">vector</variable></variables><block type=\"variables_set\" id=\"_j}n^/IkHW%x%IUSkRXm\" x=\"-92\" y=\"-110\"><field name=\"VAR\" id=\"4nll7g4=Z;gWnnyZ:HHz\">startPoint</field><value name=\"VALUE\"><block type=\"bitbybit.point.pointXYZ\" id=\"2^L#Z.tOl2wilqZ7.w:~\"><value name=\"X\"><block type=\"math_number\" id=\"YV@9PLbQtLU(:u7;L[~4\"><field name=\"NUM\">-5</field></block></value><value name=\"Y\"><block type=\"math_number\" id=\"=X}xz%6~U:aDMzS4d=#r\"><field name=\"NUM\">0</field></block></value><value name=\"Z\"><block type=\"math_number\" id=\"JnXwwmA^,mEl#VWe5,Hq\"><field name=\"NUM\">0</field></block></value></block></value><next><block type=\"variables_set\" id=\"U~nshs{xv*uf-r]McOsy\"><field name=\"VAR\" id=\":=AxCQB9YA{zEvX*iUM#\">vecEndPt</field><value name=\"VALUE\"><block type=\"bitbybit.point.pointXYZ\" id=\"pq%oBz4yf5.8k#l3MC*C\"><value name=\"X\"><block type=\"math_number\" id=\"$G*vTa$m-Wn@B}(w=Wj-\"><field name=\"NUM\">-2</field></block></value><value name=\"Y\"><block type=\"math_number\" id=\"{^_J|-!8h6=W:II%-5ac\"><field name=\"NUM\">3</field></block></value><value name=\"Z\"><block type=\"math_number\" id=\"I$?|{sI0luL3wA{{|HhJ\"><field name=\"NUM\">0</field></block></value></block></value><next><block type=\"variables_set\" id=\"*g_!#8`HUe]$6O?5xD;d\"><field name=\"VAR\" id=\"!I+0HTn-qeBXPaX{NKpl\">endPoint</field><value name=\"VALUE\"><block type=\"bitbybit.point.pointXYZ\" id=\"lExqjC~,-k!==7]^2Kwl\"><value name=\"X\"><block type=\"math_number\" id=\"XeuLamP3Ao8QIg{9`lJ/\"><field name=\"NUM\">5</field></block></value><value name=\"Y\"><block type=\"math_number\" id=\"?`hA?MfA,Ju]RB%vKO4*\"><field name=\"NUM\">0</field></block></value><value name=\"Z\"><block type=\"math_number\" id=\"KAp8{=zz{GnbPd+);BJP\"><field name=\"NUM\">0</field></block></value></block></value><next><block type=\"variables_set\" id=\",Pq.Rj`/n-^G|0d(IS*/\"><field name=\"VAR\" id=\"kxND2yNBL3ne04((]NR+\">vector</field><value name=\"VALUE\"><block type=\"bitbybit.vector.sub\" id=\"k,kFl33cN[#-w3pVKBW/\"><value name=\"First\"><block type=\"variables_get\" id=\"Z-`*/)+nE!|YS3PU~zx~\"><field name=\"VAR\" id=\"4nll7g4=Z;gWnnyZ:HHz\">startPoint</field></block></value><value name=\"Second\"><block type=\"variables_get\" id=\"qT.*8C`!a:ryYdSL(bIL\"><field name=\"VAR\" id=\":=AxCQB9YA{zEvX*iUM#\">vecEndPt</field></block></value></block></value><next><block type=\"bitbybit.draw.drawAnyAsyncNoReturn\" id=\"euho28jOWwp2R!GOM$y_\"><value name=\"Entity\"><block type=\"bitbybit.occt.shapes.edge.arcThroughTwoPointsAndTangent\" id=\"DU?]Pq,`77}L*Afs-K92\"><value name=\"Start\"><block type=\"variables_get\" id=\"}p_%lxoxf{|znq4.{/^6\"><field name=\"VAR\" id=\"4nll7g4=Z;gWnnyZ:HHz\">startPoint</field></block></value><value name=\"TangentVec\"><block type=\"variables_get\" id=\"FSPqkcwb).sKNqm?,PTd\"><field name=\"VAR\" id=\"kxND2yNBL3ne04((]NR+\">vector</field></block></value><value name=\"End\"><block type=\"variables_get\" id=\"K`!p`FvKEZq[BbjDS#^6\"><field name=\"VAR\" id=\"!I+0HTn-qeBXPaX{NKpl\">endPoint</field></block></value></block></value><next><block type=\"bitbybit.draw.drawAnyAsyncNoReturn\" id=\";%q$%QXbRxup{vw9L`oN\"><value name=\"Entity\"><block type=\"lists_create_with\" id=\"+:[Mz{B?Q5cK+ieG`ZdT\"><mutation items=\"3\"></mutation><value name=\"ADD0\"><block type=\"variables_get\" id=\"r**`U}?Yc9GJ26,2)Hx|\"><field name=\"VAR\" id=\"4nll7g4=Z;gWnnyZ:HHz\">startPoint</field></block></value><value name=\"ADD1\"><block type=\"variables_get\" id=\"NQ/J5TXO|_f,C4/Xwa}F\"><field name=\"VAR\" id=\":=AxCQB9YA{zEvX*iUM#\">vecEndPt</field></block></value><value name=\"ADD2\"><block type=\"variables_get\" id=\"nw#i=i/Su)cNm0tAB^M_\"><field name=\"VAR\" id=\"!I+0HTn-qeBXPaX{NKpl\">endPoint</field></block></value></block></value><next><block type=\"bitbybit.draw.drawAnyAsyncNoReturn\" id=\"QZHhu}6xuxfxTi9:0i!T\"><value name=\"Entity\"><block type=\"lists_create_with\" id=\"fzUnEa`U?W_k89PO2K/s\"><mutation items=\"2\"></mutation><value name=\"ADD0\"><block type=\"variables_get\" id=\"os.zA?%RrPTc.#)A8?BL\"><field name=\"VAR\" id=\"4nll7g4=Z;gWnnyZ:HHz\">startPoint</field></block></value><value name=\"ADD1\"><block type=\"variables_get\" id=\"Unsz=|0$W$|9b*F5$?iO\"><field name=\"VAR\" id=\":=AxCQB9YA{zEvX*iUM#\">vecEndPt</field></block></value></block></value></block></next></block></next></block></next></block></next></block></next></block></next></block></xml>","version":"0.20.7","type":"blockly"}}
    title="Arc edge from two points and tangent"
    />
</TabItem>
<TabItem value="typescript" label="TypeScript">
<BitByBitRenderCanvas
    requireManualStart={true}
    script={{"script":"const { ArcEdgeTwoPointsTangentDto } = Bit.Inputs.OCCT;\nconst { TwoVectorsDto } = Bit.Inputs.Vector;\n\n// Import required types\ntype Point3 = Bit.Inputs.Base.Point3;\ntype Vector3 = Bit.Inputs.Base.Vector3;\n\n\n// Define the main function\nconst start = async () => {\n    // Create start and end points\n    const startPoint: Point3 = [-5, 0, 0];\n    const vecEndPt: Point3 = [-2, 3, 0];\n    const endPoint: Point3 = [5, 0, 0];\n\n    // Create tangent vector\n    const vecOpt = new TwoVectorsDto();\n    vecOpt.first = startPoint;\n    vecOpt.second = vecEndPt;\n    const vector = bitbybit.vector.sub(vecOpt) as Vector3;\n\n    // Create an arc\n    const arcOptions = new ArcEdgeTwoPointsTangentDto();\n    arcOptions.start = startPoint;\n    arcOptions.tangentVec = vector;\n    arcOptions.end = endPoint;\n\n    const arc = await bitbybit.occt.shapes.edge.arcThroughTwoPointsAndTangent(arcOptions);\n\n    // Draw the arc, points and tangent\n    bitbybit.draw.drawAnyAsync({ entity: arc });\n    bitbybit.draw.drawAnyAsync({ entity: [startPoint, vecEndPt, endPoint] });\n\n    // When two points are provided Bitbybit draws them as a line segment\n    bitbybit.draw.drawAnyAsync({ entity: [startPoint, vecEndPt] });\n}\n\n// Execute the function\nstart();","version":"0.20.7","type":"typescript"}}
    title="Arc edge from two points and tangent"
    />
</TabItem>
</Tabs>

## Arc From Two Points and Tangent

This example demonstrates creating an arc using two endpoints and a tangent vector that controls the arc's curvature at the start point. This method gives you precise control over both the arc's endpoints and its initial direction.

**What's happening:**
- We define two endpoints: `startPoint` at `[-5, 0, 0]` and `endPoint` at `[5, 0, 0]`
- We create a tangent vector by subtracting two points: from `startPoint` to `vecEndPt` at `[-2, 3, 0]`
- This tangent vector controls how the arc curves away from the start point
- The arc begins at the start point, follows the tangent direction initially, then curves to reach the end point

**Key concepts:**
- **Tangent Vector**: Defines the direction the arc travels when leaving the start point
- **Vector Calculation**: We calculate the tangent by finding the direction from one point to another
- **Curvature Control**: The tangent vector's direction and magnitude influence how sharply the arc curves
- **Helper Visualization**: The example draws additional lines to show the tangent direction and reference points


<Tabs groupId="arc-edge-circle-two-points">
<TabItem value="rete" label="Rete">
    <BitByBitRenderCanvas
    requireManualStart={true}
    script={{"script":"{\"id\":\"rete-v2-json\",\"nodes\":{\"e25a36dbd1221d72\":{\"id\":\"e25a36dbd1221d72\",\"name\":\"bitbybit.occt.shapes.edge.arcFromCircleAndTwoPoints\",\"customName\":\"arc from circle and two points\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"start\":[0,0,0],\"end\":[0,0,1],\"sense\":true},\"inputs\":{\"circle\":{\"connections\":[{\"node\":\"de7fe612b72208fd\",\"output\":\"result\",\"data\":{}}]},\"start\":{\"connections\":[{\"node\":\"cc2276449de22a3f\",\"output\":\"result\",\"data\":{}}]},\"end\":{\"connections\":[{\"node\":\"fb27e3b0bf9b5d7d\",\"output\":\"result\",\"data\":{}}]}},\"position\":[1481.4367281371424,452.12685842894257]},\"de7fe612b72208fd\":{\"id\":\"de7fe612b72208fd\",\"name\":\"bitbybit.occt.shapes.edge.createCircleEdge\",\"customName\":\"circle edge\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":true,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"radius\":5,\"center\":[0,0,0],\"direction\":[0,1,0]},\"inputs\":{},\"position\":[439.6473003398374,261.1804551322216]},\"cc2276449de22a3f\":{\"id\":\"cc2276449de22a3f\",\"name\":\"bitbybit.point.pointXYZ\",\"customName\":\"point xyz\",\"async\":false,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"x\":8,\"y\":0,\"z\":0},\"inputs\":{},\"position\":[440.1276198123209,621.0361775861882]},\"fb27e3b0bf9b5d7d\":{\"id\":\"fb27e3b0bf9b5d7d\",\"name\":\"bitbybit.point.pointXYZ\",\"customName\":\"point xyz\",\"async\":false,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"x\":8,\"y\":0,\"z\":8},\"inputs\":{},\"position\":[440.9645672422918,964.0048762806854]},\"fb4005d4348546cc\":{\"id\":\"fb4005d4348546cc\",\"name\":\"bitbybit.point.pointXYZ\",\"customName\":\"point xyz\",\"async\":false,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"x\":0,\"y\":0,\"z\":0},\"inputs\":{},\"position\":[439.58981688143535,1310.3979292282452]},\"3c732b6847855d91\":{\"id\":\"3c732b6847855d91\",\"name\":\"bitbybit.lists.createList\",\"customName\":\"create list\",\"data\":{},\"inputs\":{\"listElements\":{\"connections\":[{\"node\":\"fb4005d4348546cc\",\"output\":\"result\",\"data\":{}},{\"node\":\"cc2276449de22a3f\",\"output\":\"result\",\"data\":{}}]}},\"position\":[1050.9359151609785,975.9092246916315]},\"d9ef00038143f721\":{\"id\":\"d9ef00038143f721\",\"name\":\"bitbybit.lists.createList\",\"customName\":\"create list\",\"data\":{},\"inputs\":{\"listElements\":{\"connections\":[{\"node\":\"fb4005d4348546cc\",\"output\":\"result\",\"data\":{}},{\"node\":\"fb27e3b0bf9b5d7d\",\"output\":\"result\",\"data\":{}}]}},\"position\":[1073.3608326580068,1211.105160335817]},\"ed0819b2fb57be80\":{\"id\":\"ed0819b2fb57be80\",\"name\":\"bitbybit.draw.drawAnyAsync\",\"customName\":\"draw any async\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false}},\"inputs\":{\"entity\":{\"connections\":[{\"node\":\"3c732b6847855d91\",\"output\":\"list\",\"data\":{}},{\"node\":\"d9ef00038143f721\",\"output\":\"list\",\"data\":{}}]}},\"position\":[1497.2032698882226,1038.4762109266621]}}}","version":"0.20.7","type":"rete"}}
    title="Arc edge from circle and two points"
    />
</TabItem>
<TabItem value="blockly" label="Blockly">
  <BitByBitRenderCanvas
    requireManualStart={true}
    script={{"script":"<xml xmlns=\"https://developers.google.com/blockly/xml\"><variables><variable id=\"circle\">circle</variable><variable id=\"startPoint\">startPoint</variable><variable id=\"endPoint\">endPoint</variable><variable id=\"centerPoint\">centerPoint</variable><variable id=\"arc\">arc</variable></variables><block type=\"variables_set\" id=\"create_circle\" x=\"-604\" y=\"-349\"><field name=\"VAR\" id=\"circle\">circle</field><value name=\"VALUE\"><block type=\"bitbybit.occt.shapes.edge.createCircleEdge\" id=\"circle_edge\"><value name=\"Radius\"><block type=\"math_number\" id=\"radius_val\"><field name=\"NUM\">5</field></block></value><value name=\"Center\"><block type=\"bitbybit.point.pointXYZ\" id=\"circle_center\"><value name=\"X\"><block type=\"math_number\" id=\"center_x\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\" id=\"center_y\"><field name=\"NUM\">0</field></block></value><value name=\"Z\"><block type=\"math_number\" id=\"center_z\"><field name=\"NUM\">0</field></block></value></block></value><value name=\"Direction\"><block type=\"bitbybit.vector.vectorXYZ\" id=\"circle_direction\"><value name=\"X\"><block type=\"math_number\" id=\"dir_x\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\" id=\"dir_y\"><field name=\"NUM\">1</field></block></value><value name=\"Z\"><block type=\"math_number\" id=\"dir_z\"><field name=\"NUM\">0</field></block></value></block></value></block></value><next><block type=\"variables_set\" id=\"set_start_point\"><field name=\"VAR\" id=\"startPoint\">startPoint</field><value name=\"VALUE\"><block type=\"bitbybit.point.pointXYZ\" id=\"start_point_xyz\"><value name=\"X\"><block type=\"math_number\" id=\"start_x\"><field name=\"NUM\">8</field></block></value><value name=\"Y\"><block type=\"math_number\" id=\"start_y\"><field name=\"NUM\">0</field></block></value><value name=\"Z\"><block type=\"math_number\" id=\"start_z\"><field name=\"NUM\">0</field></block></value></block></value><next><block type=\"variables_set\" id=\"set_end_point\"><field name=\"VAR\" id=\"endPoint\">endPoint</field><value name=\"VALUE\"><block type=\"bitbybit.point.pointXYZ\" id=\"end_point_xyz\"><value name=\"X\"><block type=\"math_number\" id=\"end_x\"><field name=\"NUM\">8</field></block></value><value name=\"Y\"><block type=\"math_number\" id=\"end_y\"><field name=\"NUM\">0</field></block></value><value name=\"Z\"><block type=\"math_number\" id=\"end_z\"><field name=\"NUM\">8</field></block></value></block></value><next><block type=\"variables_set\" id=\"set_center_point\"><field name=\"VAR\" id=\"centerPoint\">centerPoint</field><value name=\"VALUE\"><block type=\"bitbybit.point.pointXYZ\" id=\"center_point_xyz\"><value name=\"X\"><block type=\"math_number\" id=\"center_pt_x\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\" id=\"center_pt_y\"><field name=\"NUM\">0</field></block></value><value name=\"Z\"><block type=\"math_number\" id=\"center_pt_z\"><field name=\"NUM\">0</field></block></value></block></value><next><block type=\"variables_set\" id=\"create_arc\"><field name=\"VAR\" id=\"arc\">arc</field><value name=\"VALUE\"><block type=\"base_time_await_return\" id=\"await_arc\"><value name=\"Promise\"><block type=\"bitbybit.occt.shapes.edge.arcFromCircleAndTwoPoints\" id=\"arc_from_circle\"><value name=\"Circle\"><block type=\"variables_get\" id=\"get_circle\"><field name=\"VAR\" id=\"circle\">circle</field></block></value><value name=\"Start\"><block type=\"variables_get\" id=\"get_start_point\"><field name=\"VAR\" id=\"startPoint\">startPoint</field></block></value><value name=\"End\"><block type=\"variables_get\" id=\"get_end_point\"><field name=\"VAR\" id=\"endPoint\">endPoint</field></block></value><value name=\"Sense\"><block type=\"logic_boolean\" id=\"sense_val\"><field name=\"BOOL\">TRUE</field></block></value></block></value></block></value><next><block type=\"bitbybit.draw.drawAnyAsyncNoReturn\" id=\"draw_arc\"><value name=\"Entity\"><block type=\"variables_get\" id=\"get_arc\"><field name=\"VAR\" id=\"arc\">arc</field></block></value><next><block type=\"bitbybit.draw.drawAnyAsyncNoReturn\" id=\"draw_points_1\"><value name=\"Entity\"><block type=\"lists_create_with\" id=\"points_list_1\"><mutation items=\"2\"></mutation><value name=\"ADD0\"><block type=\"lists_create_with\" id=\"fjwn/`W2y~QA8%Ep#)Eb\"><mutation items=\"2\"></mutation><value name=\"ADD0\"><block type=\"variables_get\" id=\"G0!^pr#(z5VAPmuuq~,l\"><field name=\"VAR\" id=\"centerPoint\">centerPoint</field></block></value><value name=\"ADD1\"><block type=\"variables_get\" id=\"FMLc4/QjG_{OBY0qD!LH\"><field name=\"VAR\" id=\"startPoint\">startPoint</field></block></value></block></value><value name=\"ADD1\"><block type=\"lists_create_with\" id=\"points_list_2\"><mutation items=\"2\"></mutation><value name=\"ADD0\"><block type=\"variables_get\" id=\"get_center_point_2\"><field name=\"VAR\" id=\"centerPoint\">centerPoint</field></block></value><value name=\"ADD1\"><block type=\"variables_get\" id=\"get_end_point_2\"><field name=\"VAR\" id=\"endPoint\">endPoint</field></block></value></block></value></block></value><next><block type=\"bitbybit.draw.drawAnyAsyncNoReturn\" id=\"draw_points_2\"><value name=\"Entity\"><block type=\"lists_create_with\" id=\"U!l}=F=^$}U|{e)Kk;Cm\"><mutation items=\"3\"></mutation><value name=\"ADD0\"><block type=\"variables_get\" id=\"]rqxM9{xpt[:R+yp0tnh\"><field name=\"VAR\" id=\"startPoint\">startPoint</field></block></value><value name=\"ADD1\"><block type=\"variables_get\" id=\"JWoh^p)R3wDYKBJK)nmF\"><field name=\"VAR\" id=\"centerPoint\">centerPoint</field></block></value><value name=\"ADD2\"><block type=\"variables_get\" id=\"tn7pC-r|$Ggc#][IiUzR\"><field name=\"VAR\" id=\"endPoint\">endPoint</field></block></value></block></value></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></xml>","version":"0.20.7","type":"blockly"}}
    title="Arc edge from circle and two points"
    />
</TabItem>
<TabItem value="typescript" label="TypeScript">
<BitByBitRenderCanvas
    requireManualStart={true}
    script={{"script":"const { CircleDto, ArcEdgeCircleTwoPointsDto } = Bit.Inputs.OCCT;\n// Import required types\ntype TopoDSEdgePointer = Bit.Inputs.OCCT.TopoDSEdgePointer;\ntype Point3 = Bit.Inputs.Base.Point3;\ntype Vector3 = Bit.Inputs.Base.Vector3;\n\n// Define the main function\nconst start = async () => {\n    // Create a circle edge\n    const circleOptions = new CircleDto();\n    circleOptions.radius = 5;\n    circleOptions.center = [0, 0, 0] as Point3;\n    circleOptions.direction = [0, 1, 0] as Vector3;\n\n    const circle = await bitbybit.occt.shapes.edge.createCircleEdge(circleOptions);\n\n    // Create start and end points for the arc\n    const startPoint: Point3 = [8, 0, 0];\n    const endPoint: Point3 = [8, 0, 8];\n    const centerPoint: Point3 = [0, 0, 0];\n\n    // Create arc from circle and two points\n    const arcOptions = new ArcEdgeCircleTwoPointsDto<TopoDSEdgePointer>();\n    arcOptions.circle = circle;\n    arcOptions.start = startPoint;\n    arcOptions.end = endPoint;\n    arcOptions.sense = true;\n\n    const arc = await bitbybit.occt.shapes.edge.arcFromCircleAndTwoPoints(arcOptions);\n    // Draw the arc and helper points\n    bitbybit.draw.drawAnyAsync({ entity: arc });\n    bitbybit.draw.drawAnyAsync({ entity: [endPoint, centerPoint, startPoint] });\n    bitbybit.draw.drawAnyAsync({ entity: [centerPoint, endPoint] });\n    bitbybit.draw.drawAnyAsync({ entity: [centerPoint, startPoint] });\n}\n\n// Execute the function\nstart();","version":"0.20.7","type":"typescript"}}
    title="Arc edge from circle and two points"
    />
</TabItem>
</Tabs>

## Arc From Circle and Two Points

This example shows how to create an arc by extracting a portion of an existing circle edge between two specified points. This method is useful when you want to create an arc that follows a specific circular path.

**What's happening:**
- First, we create a complete circle edge with radius 5, centered at the origin
- We define two points: `startPoint` at `[8, 0, 0]` and `endPoint` at `[8, 0, 8]`
- The system finds where these points would intersect the circle (projected onto the circle if needed)
- An arc is created along the circle's circumference between these two intersection points
- Helper lines are drawn to visualize the relationship between the center and the arc endpoints

**Key concepts:**
- **Base Circle**: The arc follows the exact curvature of the parent circle
- **Point Projection**: Points are projected onto the circle to find valid start/end positions
- **Arc Direction**: The `sense` parameter controls whether the arc goes clockwise or counterclockwise
- **Geometric Relationship**: The resulting arc maintains the same radius and center as the original circle


<Tabs groupId="arc-edge-circle-two-angles">
<TabItem value="rete" label="Rete">
    <BitByBitRenderCanvas
    requireManualStart={true}
    script={{"script":"{\"id\":\"rete-v2-json\",\"nodes\":{\"de7fe612b72208fd\":{\"id\":\"de7fe612b72208fd\",\"name\":\"bitbybit.occt.shapes.edge.createCircleEdge\",\"customName\":\"circle edge\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":true,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"radius\":5,\"center\":[0,0,0],\"direction\":[0,1,0]},\"inputs\":{},\"position\":[439.6473003398374,261.1804551322216]},\"3ebf6ed731a27ccd\":{\"id\":\"3ebf6ed731a27ccd\",\"name\":\"bitbybit.occt.shapes.edge.arcFromCircleAndTwoAngles\",\"customName\":\"arc from circle and two angles\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"alphaAngle1\":45,\"alphaAngle2\":270,\"sense\":true},\"inputs\":{\"circle\":{\"connections\":[{\"node\":\"de7fe612b72208fd\",\"output\":\"result\",\"data\":{}}]}},\"position\":[813.5579416874897,259.5200448916267]}}}","version":"0.20.7","type":"rete"}}
    title="Arc edge from circle and two angles"
    />
</TabItem>
<TabItem value="blockly" label="Blockly">
  <BitByBitRenderCanvas
    requireManualStart={true}
    script={{"script":"<xml xmlns=\"https://developers.google.com/blockly/xml\"><block type=\"bitbybit.draw.drawAnyAsyncNoReturn\" id=\"@;tcHX~:R8IWjX4:*%iS\" x=\"121\" y=\"-94\"><value name=\"Entity\"><block type=\"bitbybit.occt.shapes.edge.arcFromCircleAndTwoAngles\" id=\"rk[+B:9wHA`LZbmfs@cV\"><value name=\"Circle\"><block type=\"bitbybit.occt.shapes.edge.createCircleEdge\" id=\"Q~(7Fda)|r@mkW_@xBFj\"><value name=\"Radius\"><block type=\"math_number\" id=\"XtfgZSMxcMDe3oUQSF|:\"><field name=\"NUM\">5</field></block></value><value name=\"Center\"><block type=\"bitbybit.point.pointXYZ\" id=\"iCt+fN.?}q?(J08!e(EU\"><value name=\"X\"><block type=\"math_number\" id=\"|!fmq6/?Gt9MKsd8+0.V\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\" id=\"c^/[T`JCc{+FJ^n0%^Ez\"><field name=\"NUM\">0</field></block></value><value name=\"Z\"><block type=\"math_number\" id=\"aZE@0l?hw)Gb0*6sZ7rw\"><field name=\"NUM\">0</field></block></value></block></value><value name=\"Direction\"><block type=\"bitbybit.vector.vectorXYZ\" id=\"nI7{ZOrKqIZ2V$5lS#XB\"><value name=\"X\"><block type=\"math_number\" id=\"V(7HfXka3$REtMc@Kuk:\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\" id=\"GTrS6%.o5-63bLHW2)J^\"><field name=\"NUM\">1</field></block></value><value name=\"Z\"><block type=\"math_number\" id=\"/Dl3am7d$L[^^x0T^{aG\"><field name=\"NUM\">0</field></block></value></block></value></block></value><value name=\"AlphaAngle1\"><block type=\"math_number\" id=\"uY[e-qt*kc7N]GXbGJfE\"><field name=\"NUM\">45</field></block></value><value name=\"AlphaAngle2\"><block type=\"math_number\" id=\"qv9@uY_?6If|:!E=|}F9\"><field name=\"NUM\">270</field></block></value><value name=\"Sense\"><block type=\"logic_boolean\" id=\"~n^tNcW`rpzJ~A%g%BRw\"><field name=\"BOOL\">TRUE</field></block></value></block></value></block></xml>","version":"0.20.7","type":"blockly"}}
    title="Arc edge from circle and two points"
    />
</TabItem>
<TabItem value="typescript" label="TypeScript">
<BitByBitRenderCanvas
    requireManualStart={true}
    script={{"script":"const { CircleDto, ArcEdgeCircleTwoAnglesDto } = Bit.Inputs.OCCT;\n// Import required types\ntype Point3 = Bit.Inputs.Base.Point3;\ntype Vector3 = Bit.Inputs.Base.Vector3;\ntype TopoDSEdgePointer = Bit.Inputs.OCCT.TopoDSEdgePointer;\n\n\n// Define the main function\nconst start = async () => {\n    // Create a circle edge\n    const circleOptions = new CircleDto();\n    circleOptions.radius = 5;\n    circleOptions.center = [0, 0, 0] as Point3;\n    circleOptions.direction = [0, 1, 0] as Vector3;\n\n    const circle = await bitbybit.occt.shapes.edge.createCircleEdge(circleOptions);\n\n    // Create arc from circle and two angles\n    const arcOptions = new ArcEdgeCircleTwoAnglesDto<TopoDSEdgePointer>();\n    arcOptions.circle = circle;\n    arcOptions.alphaAngle1 = 45;\n    arcOptions.alphaAngle2 = 270;\n    arcOptions.sense = true;\n\n    const arc = await bitbybit.occt.shapes.edge.arcFromCircleAndTwoAngles(arcOptions);\n\n    // Draw the arc\n    bitbybit.draw.drawAnyAsync({ entity: arc });\n}\n\n// Execute the function\nstart();","version":"0.20.7","type":"typescript"}}
    title="Arc edge from circle and two angles"
    />
</TabItem>
</Tabs>

## Arc From Circle and Two Angles

This example demonstrates creating an arc by specifying a base circle and two angular positions. This method provides precise control over the arc's span using angle measurements.

**What's happening:**
- We start with a circle edge (radius 5, centered at origin)
- Two angles are specified: `alphaAngle1` at 45° and `alphaAngle2` at 270°
- The arc is created between these two angular positions on the circle
- The result is a portion of the circle spanning from 45° to 270° (a 225° arc)

**Key concepts:**
- **Angular Definition**: Angles are measured in degrees from a reference direction (typically the positive X-axis)
- **Arc Span**: The difference between the two angles determines how much of the circle becomes the arc
- **Direction Control**: The `sense` parameter determines if the arc goes from angle1 to angle2 or the other way
- **Precise Control**: This method is ideal when you know exactly what angular portion of a circle you need


<Tabs groupId="arc-edge-circle-point-angle">
<TabItem value="rete" label="Rete">
    <BitByBitRenderCanvas
    requireManualStart={true}
    script={{"script":"{\"id\":\"rete-v2-json\",\"nodes\":{\"de7fe612b72208fd\":{\"id\":\"de7fe612b72208fd\",\"name\":\"bitbybit.occt.shapes.edge.createCircleEdge\",\"customName\":\"circle edge\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":true,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"radius\":5,\"center\":[0,0,0],\"direction\":[0,1,0]},\"inputs\":{},\"position\":[440.37396475016214,611.5486579955054]},\"fb27e3b0bf9b5d7d\":{\"id\":\"fb27e3b0bf9b5d7d\",\"name\":\"bitbybit.point.pointXYZ\",\"customName\":\"point xyz\",\"async\":false,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"x\":8,\"y\":0,\"z\":8},\"inputs\":{},\"position\":[440.9645672422918,964.0048762806854]},\"fb4005d4348546cc\":{\"id\":\"fb4005d4348546cc\",\"name\":\"bitbybit.point.pointXYZ\",\"customName\":\"point xyz\",\"async\":false,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"x\":0,\"y\":0,\"z\":0},\"inputs\":{},\"position\":[439.58981688143535,1310.3979292282452]},\"ed0819b2fb57be80\":{\"id\":\"ed0819b2fb57be80\",\"name\":\"bitbybit.draw.drawAnyAsync\",\"customName\":\"draw any async\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false}},\"inputs\":{\"entity\":{\"connections\":[{\"node\":\"35eb27049898c3e0\",\"output\":\"list\",\"data\":{}}]}},\"position\":[1499.5146811508514,1169.414953289222]},\"35eb27049898c3e0\":{\"id\":\"35eb27049898c3e0\",\"name\":\"bitbybit.lists.createList\",\"customName\":\"create list\",\"data\":{},\"inputs\":{\"listElements\":{\"connections\":[{\"node\":\"fb4005d4348546cc\",\"output\":\"result\",\"data\":{}},{\"node\":\"fb27e3b0bf9b5d7d\",\"output\":\"result\",\"data\":{}}]}},\"position\":[1073.3608326580068,1211.105160335817]},\"d66c2f3c7a5ecf3e\":{\"id\":\"d66c2f3c7a5ecf3e\",\"name\":\"bitbybit.occt.shapes.edge.arcFromCirclePointAndAngle\",\"customName\":\"arc from circle point and angle\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"alphaAngle\":360,\"sense\":true},\"inputs\":{\"circle\":{\"connections\":[{\"node\":\"de7fe612b72208fd\",\"output\":\"result\",\"data\":{}}]},\"point\":{\"connections\":[{\"node\":\"fb27e3b0bf9b5d7d\",\"output\":\"result\",\"data\":{}}]}},\"position\":[1498.7026123535022,721.27863949326]}}}","version":"0.20.7","type":"rete"}}
    title="Arc edge from circle point and an angle"
    />
</TabItem>
<TabItem value="blockly" label="Blockly">
  <BitByBitRenderCanvas
    requireManualStart={true}
    script={{"script":"<xml xmlns=\"https://developers.google.com/blockly/xml\"><variables><variable id=\"circle\">circle</variable><variable id=\"point\">point</variable><variable id=\"centerPoint\">centerPoint</variable><variable id=\"arc\">arc</variable></variables><block type=\"variables_set\" id=\"create_circle\" x=\"-604\" y=\"-349\"><field name=\"VAR\" id=\"circle\">circle</field><value name=\"VALUE\"><block type=\"bitbybit.occt.shapes.edge.createCircleEdge\" id=\"circle_edge\"><value name=\"Radius\"><block type=\"math_number\" id=\"radius_val\"><field name=\"NUM\">5</field></block></value><value name=\"Center\"><block type=\"bitbybit.point.pointXYZ\" id=\"circle_center\"><value name=\"X\"><block type=\"math_number\" id=\"center_x\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\" id=\"center_y\"><field name=\"NUM\">0</field></block></value><value name=\"Z\"><block type=\"math_number\" id=\"center_z\"><field name=\"NUM\">0</field></block></value></block></value><value name=\"Direction\"><block type=\"bitbybit.vector.vectorXYZ\" id=\"circle_direction\"><value name=\"X\"><block type=\"math_number\" id=\"dir_x\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\" id=\"dir_y\"><field name=\"NUM\">1</field></block></value><value name=\"Z\"><block type=\"math_number\" id=\"dir_z\"><field name=\"NUM\">0</field></block></value></block></value></block></value><next><block type=\"variables_set\" id=\"set_point\"><field name=\"VAR\" id=\"point\">point</field><value name=\"VALUE\"><block type=\"bitbybit.point.pointXYZ\" id=\"point_xyz\"><value name=\"X\"><block type=\"math_number\" id=\"point_x\"><field name=\"NUM\">8</field></block></value><value name=\"Y\"><block type=\"math_number\" id=\"point_y\"><field name=\"NUM\">0</field></block></value><value name=\"Z\"><block type=\"math_number\" id=\"point_z\"><field name=\"NUM\">8</field></block></value></block></value><next><block type=\"variables_set\" id=\"set_center_point\"><field name=\"VAR\" id=\"centerPoint\">centerPoint</field><value name=\"VALUE\"><block type=\"bitbybit.point.pointXYZ\" id=\"center_point_xyz\"><value name=\"X\"><block type=\"math_number\" id=\"center_pt_x\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\" id=\"center_pt_y\"><field name=\"NUM\">0</field></block></value><value name=\"Z\"><block type=\"math_number\" id=\"center_pt_z\"><field name=\"NUM\">0</field></block></value></block></value><next><block type=\"variables_set\" id=\"create_arc\"><field name=\"VAR\" id=\"arc\">arc</field><value name=\"VALUE\"><block type=\"base_time_await_return\" id=\"await_arc\"><value name=\"Promise\"><block type=\"bitbybit.occt.shapes.edge.arcFromCirclePointAndAngle\" id=\"arc_from_circle_point_angle\"><value name=\"Circle\"><block type=\"variables_get\" id=\"get_circle\"><field name=\"VAR\" id=\"circle\">circle</field></block></value><value name=\"Point\"><block type=\"variables_get\" id=\"get_point\"><field name=\"VAR\" id=\"point\">point</field></block></value><value name=\"AlphaAngle\"><block type=\"math_number\" id=\"angle_val\"><field name=\"NUM\">360</field></block></value><value name=\"Sense\"><block type=\"logic_boolean\" id=\"sense_val\"><field name=\"BOOL\">TRUE</field></block></value></block></value></block></value><next><block type=\"bitbybit.draw.drawAnyAsyncNoReturn\" id=\"draw_arc\"><value name=\"Entity\"><block type=\"variables_get\" id=\"get_arc\"><field name=\"VAR\" id=\"arc\">arc</field></block></value><next><block type=\"bitbybit.draw.drawAnyAsyncNoReturn\" id=\"draw_helper_line\"><value name=\"Entity\"><block type=\"lists_create_with\" id=\"helper_line\"><mutation items=\"2\"></mutation><value name=\"ADD0\"><block type=\"variables_get\" id=\"get_center_point\"><field name=\"VAR\" id=\"centerPoint\">centerPoint</field></block></value><value name=\"ADD1\"><block type=\"variables_get\" id=\"get_point_2\"><field name=\"VAR\" id=\"point\">point</field></block></value></block></value><next><block type=\"bitbybit.draw.drawAnyAsyncNoReturn\" id=\"draw_points\"><value name=\"Entity\"><block type=\"variables_get\" id=\"get_center_point_2\"><field name=\"VAR\" id=\"centerPoint\">centerPoint</field></block></value><next><block type=\"bitbybit.draw.drawAnyAsyncNoReturn\" id=\"eo[9Q!`)?U{96(6E47@E\"><value name=\"Entity\"><block type=\"variables_get\" id=\"kHL[2PS5c;jNB32n?2XD\"><field name=\"VAR\" id=\"point\">point</field></block></value></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></xml>","version":"0.20.7","type":"blockly"}}
    title="Arc edge from circle point and an angle"
    />
</TabItem>
<TabItem value="typescript" label="TypeScript">
<BitByBitRenderCanvas
    requireManualStart={true}
    script={{"script":"const { CircleDto, ArcEdgeCirclePointAngleDto } = Bit.Inputs.OCCT;\n// Import required types\ntype Point3 = Bit.Inputs.Base.Point3;\ntype Vector3 = Bit.Inputs.Base.Vector3;\ntype TopoDSEdgePointer = Bit.Inputs.OCCT.TopoDSEdgePointer;\n\n// Define the main function\nconst start = async () => {\n    // Create a circle edge\n    const circleOptions = new CircleDto();\n    circleOptions.radius = 5;\n    circleOptions.center = [0, 0, 0] as Point3;\n    circleOptions.direction = [0, 1, 0] as Vector3;\n\n    const circle = await bitbybit.occt.shapes.edge.createCircleEdge(circleOptions);\n\n    // Create a point on the circle\n    const point: Point3 = [8, 0, 8];\n    const centerPoint: Point3 = [0, 0, 0];\n\n    // Create arc from circle, point and angle\n    const arcOptions = new ArcEdgeCirclePointAngleDto<TopoDSEdgePointer>();\n    arcOptions.circle = circle;\n    arcOptions.point = point;\n    arcOptions.alphaAngle = 360;\n    arcOptions.sense = true;\n\n    const arc = await bitbybit.occt.shapes.edge.arcFromCirclePointAndAngle(arcOptions);\n\n    // Draw the arc and helper elements\n    bitbybit.draw.drawAnyAsync({ entity: arc });\n    bitbybit.draw.drawAnyAsync({ entity: [centerPoint, point] });\n    bitbybit.draw.drawAnyAsync({ entity: [centerPoint] });\n    bitbybit.draw.drawAnyAsync({ entity: [point] });\n\n}\n\n// Execute the function\nstart();","version":"0.20.7","type":"typescript"}}
    title="Arc edge from circle point and an angle"
    />
</TabItem>
</Tabs>

## Arc From Circle, Point and Angle

This example shows how to create an arc starting from a specific point on a circle and extending through a specified angular distance. This method combines point-based positioning with angular measurement.

**What's happening:**
- We create a base circle (radius 5, centered at origin)
- A starting point is defined at `[8, 0, 8]` which gets projected onto the circle
- An angle of 360° is specified, creating a complete circular arc (full circle)
- The arc begins at the projected point location and sweeps through the specified angle
- Helper elements show the center point, the reference point, and connecting lines

**Key concepts:**
- **Point Projection**: The specified point is projected onto the circle to find the actual start position
- **Angular Sweep**: The angle determines how far around the circle the arc extends
- **Complete Circle**: A 360° angle creates a full circular arc, essentially recreating the original circle
- **Starting Position**: Unlike other methods, this gives you control over exactly where on the circle the arc begins


<Tabs groupId="edge-circle">
<TabItem value="rete" label="Rete">
    <BitByBitRenderCanvas
    requireManualStart={true}
    script={{"script":"{\"id\":\"rete-v2-json\",\"nodes\":{\"e754089939e32a7e\":{\"id\":\"e754089939e32a7e\",\"name\":\"bitbybit.occt.shapes.edge.createCircleEdge\",\"customName\":\"circle edge\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"radius\":5,\"center\":[0,0,0],\"direction\":[0,1,0]},\"inputs\":{},\"position\":[462.0703125,344.1484375]}}}","version":"0.20.7","type":"rete"}}
    title="Circle edge"
    />
</TabItem>
<TabItem value="blockly" label="Blockly">
  <BitByBitRenderCanvas
    requireManualStart={true}
    script={{"script":"<xml xmlns=\"https://developers.google.com/blockly/xml\"><block type=\"bitbybit.draw.drawAnyAsyncNoReturn\" id=\"@;tcHX~:R8IWjX4:*%iS\" x=\"14\" y=\"19\"><value name=\"Entity\"><block type=\"bitbybit.occt.shapes.edge.createCircleEdge\" id=\"Q~(7Fda)|r@mkW_@xBFj\"><value name=\"Radius\"><block type=\"math_number\" id=\"XtfgZSMxcMDe3oUQSF|:\"><field name=\"NUM\">5</field></block></value><value name=\"Center\"><block type=\"bitbybit.point.pointXYZ\" id=\"iCt+fN.?}q?(J08!e(EU\"><value name=\"X\"><block type=\"math_number\" id=\"|!fmq6/?Gt9MKsd8+0.V\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\" id=\"c^/[T`JCc{+FJ^n0%^Ez\"><field name=\"NUM\">0</field></block></value><value name=\"Z\"><block type=\"math_number\" id=\"aZE@0l?hw)Gb0*6sZ7rw\"><field name=\"NUM\">0</field></block></value></block></value><value name=\"Direction\"><block type=\"bitbybit.vector.vectorXYZ\" id=\"nI7{ZOrKqIZ2V$5lS#XB\"><value name=\"X\"><block type=\"math_number\" id=\"V(7HfXka3$REtMc@Kuk:\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\" id=\"GTrS6%.o5-63bLHW2)J^\"><field name=\"NUM\">1</field></block></value><value name=\"Z\"><block type=\"math_number\" id=\"/Dl3am7d$L[^^x0T^{aG\"><field name=\"NUM\">0</field></block></value></block></value></block></value></block></xml>","version":"0.20.7","type":"blockly"}}
    title="Circle edge"
    />
</TabItem>
<TabItem value="typescript" label="TypeScript">
<BitByBitRenderCanvas
    requireManualStart={true}
    script={{"script":"const { CircleDto } = Bit.Inputs.OCCT;\n// Import required types\ntype Point3 = Bit.Inputs.Base.Point3;\ntype Vector3 = Bit.Inputs.Base.Vector3;\n\n// Define the main function\nconst start = async () => {\n    // Create a circle edge\n    const circleOptions = new CircleDto();\n    circleOptions.radius = 5;\n    circleOptions.center = [0, 0, 0] as Point3;\n    circleOptions.direction = [0, 1, 0] as Vector3;\n\n    const circle = await bitbybit.occt.shapes.edge.createCircleEdge(circleOptions);\n\n    // Draw the circle\n    bitbybit.draw.drawAnyAsync({ entity: circle });\n}\n\n// Execute the function\nstart();","version":"0.20.7","type":"typescript"}}
    title="Circle edge"
    />
</TabItem>
</Tabs>

## Circle Edge

This example demonstrates creating a complete circular edge, which is one of the most fundamental curved primitives in 3D modeling. A circle edge represents a perfect circular boundary that can be used as a standalone geometry or as part of more complex shapes.

**What's happening:**
- We define a circle with radius 5 units, centered at the origin `[0, 0, 0]`
- The direction vector `[0, 1, 0]` specifies that the circle lies in a plane perpendicular to the Y-axis (horizontal plane)
- The `CircleDto` object packages all the circle parameters for the OCCT creation function
- The result is a complete circular edge that forms a closed loop

**Key concepts:**
- **Radius**: Determines the size of the circle (distance from center to edge)
- **Center Point**: The position in 3D space where the circle is located
- **Direction Vector**: Defines the orientation of the plane containing the circle
- **Closed Curve**: A circle is a closed curve, meaning it has no start or end points


<Tabs groupId="edge-ellipse">
<TabItem value="rete" label="Rete">
    <BitByBitRenderCanvas
    requireManualStart={true}
    script={{"script":"{\"id\":\"rete-v2-json\",\"nodes\":{\"8e0841446d50e41b\":{\"id\":\"8e0841446d50e41b\",\"name\":\"bitbybit.occt.shapes.edge.createEllipseEdge\",\"customName\":\"ellipse edge\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"center\":[0,0,0],\"direction\":[0,1,0],\"radiusMinor\":3,\"radiusMajor\":10},\"inputs\":{},\"position\":[360.29296875,401.90234375]}}}","version":"0.20.7","type":"rete"}}
    title="Ellipse edge"
    />
</TabItem>
<TabItem value="blockly" label="Blockly">
  <BitByBitRenderCanvas
    requireManualStart={true}
    script={{"script":"<xml xmlns=\"https://developers.google.com/blockly/xml\"><block type=\"bitbybit.draw.drawAnyAsyncNoReturn\" id=\"@;tcHX~:R8IWjX4:*%iS\" x=\"14\" y=\"19\"><value name=\"Entity\"><block type=\"bitbybit.occt.shapes.edge.createEllipseEdge\" id=\"w%VvY`K%!1EQ)YDjZS!l\"><value name=\"Center\"><block type=\"bitbybit.point.pointXYZ\" id=\"XV`fYB|N]lR%_Resje#k\"><value name=\"X\"><block type=\"math_number\" id=\"pEbL-a45{aOV[S`I2SVg\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\" id=\"d[O3pm;?*i^i(YdvxllE\"><field name=\"NUM\">0</field></block></value><value name=\"Z\"><block type=\"math_number\" id=\"!JhjO7ejz3,!xy7t:ncV\"><field name=\"NUM\">0</field></block></value></block></value><value name=\"Direction\"><block type=\"bitbybit.vector.vectorXYZ\" id=\".Q*Y8%8^3suh=/qLVUzY\"><value name=\"X\"><block type=\"math_number\" id=\"hRZ0r*H~j/PXdEgahLGe\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\" id=\"k(jv=MTV2@WU)`a/)Z:$\"><field name=\"NUM\">1</field></block></value><value name=\"Z\"><block type=\"math_number\" id=\"dpXdoM]lF@G.oh`@_MTr\"><field name=\"NUM\">0</field></block></value></block></value><value name=\"RadiusMinor\"><block type=\"math_number\" id=\"9SW?irL|UP];0YU4@QZF\"><field name=\"NUM\">3</field></block></value><value name=\"RadiusMajor\"><block type=\"math_number\" id=\"h.jW8l6x5_f[ll#LeI1b\"><field name=\"NUM\">10</field></block></value></block></value></block></xml>","version":"0.20.7","type":"blockly"}}
    title="Ellipse edge"
    />
</TabItem>
<TabItem value="typescript" label="TypeScript">
<BitByBitRenderCanvas
    requireManualStart={true}
    script={{"script":"const { EllipseDto } = Bit.Inputs.OCCT;\n// Import required types\ntype Point3 = Bit.Inputs.Base.Point3;\ntype Vector3 = Bit.Inputs.Base.Vector3;\n\n// Define the main function\nconst start = async () => {\n    // Create an ellipse edge\n    const ellipseOptions = new EllipseDto();\n    ellipseOptions.center = [0, 0, 0] as Point3;\n    ellipseOptions.direction = [0, 1, 0] as Vector3;\n    ellipseOptions.radiusMinor = 3;\n    ellipseOptions.radiusMajor = 10;\n\n    const ellipse = await bitbybit.occt.shapes.edge.createEllipseEdge(ellipseOptions);\n\n    // Draw the ellipse\n    bitbybit.draw.drawAnyAsync({ entity: ellipse });\n}\n\n// Execute the function\nstart();","version":"0.20.7","type":"typescript"}}
    title="Ellipse edge"
    />
</TabItem>
</Tabs>

## Ellipse Edge

This example demonstrates creating an elliptical edge, which is an oval-shaped curve that extends the concept of a circle to have two different radii. Ellipses are commonly used in technical drawings and 3D modeling for creating elongated circular shapes.

**What's happening:**
- We define an ellipse centered at the origin `[0, 0, 0]`
- The direction vector `[0, 1, 0]` specifies the orientation plane (horizontal, like the circle)
- Two radii are specified: `radiusMinor` = 3 (shorter radius) and `radiusMajor` = 10 (longer radius)
- The result is an oval shape that is 20 units wide and 6 units tall
- The `EllipseDto` object packages all parameters for the OCCT creation function

**Key concepts:**
- **Major Radius**: The longer radius that defines the ellipse's widest dimension
- **Minor Radius**: The shorter radius that defines the ellipse's narrower dimension
- **Aspect Ratio**: The relationship between major and minor radii determines how "stretched" the ellipse appears
- **Closed Curve**: Like a circle, an ellipse is a closed curve with no endpoints
- **Geometric Relationship**: When major and minor radii are equal, the ellipse becomes a perfect circle
