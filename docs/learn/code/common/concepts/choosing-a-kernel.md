---
sidebar_position: 2
title: Choosing a Kernel
sidebar_label: Choosing a Kernel
description: When to model with OpenCascade, when with Manifold and when with JSCAD, what each is good and bad at, how a shape moves from one kernel to another, and which way each one builds up.
topic: code.concepts.choosing-a-kernel
type: explanation
tags: [code, occt, manifold, jscad]
---

import BitByBitRenderCanvas from '@site/src/components/BitByBitRenderCanvas';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Choosing a kernel

A **kernel** is the library that computes geometry. Bitbybit gives you three for modelling, side by side under one API, and each is best at something different.

| | OpenCascade (`occt`) | Manifold (`manifold`) | JSCAD (`jscad`) |
|---|---|---|---|
| Geometry | exact: true curves and surfaces | a mesh of triangles | a mesh of polygons |
| Good at | parts: fillets, chamfers, lofts, sweeps, measurements, assemblies | many booleans, lattices, imported and scanned meshes | quick solids, text, simple extrusions |
| Not for | thousands of booleans: each takes milliseconds to seconds | fillets or anything exactly round | precise CAD |
| Files | STEP, IGES, BREP, STL, DXF, SVG | meshes, STL through drawing | meshes |
| Builds along | Y, like the scene | Z | Z |

Choose **OpenCascade** for anything you would model in a CAD program, and for anything you will hand to another one as STEP. Choose **Manifold** when the count of cuts runs into hundreds, or when the input is already a mesh. Choose **JSCAD** for quick shapes and 3D text where exactness does not matter.

## The same cylinder in two kernels

An OpenCascade cylinder has one round face: drawn, it is divided into triangles, but the shape itself stays exactly round. A Manifold cylinder is a prism, with as many sides as `circularSegments` says. Note also how each stands: OpenCascade builds along Y, which is up in the scene, while Manifold builds along Z, so its cylinder lies on its side.

{/* example:kernels-side-by-side:start - generated from the example's steps for each editor; edits between these markers are overwritten */}

<Tabs groupId="editor" queryString>
<TabItem value="rete" label="Rete">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"{\"id\":\"rete-v2-json\",\"nodes\":{\"occt\":{\"id\":\"occt\",\"name\":\"bitbybit.occt.shapes.solid.createCylinder\",\"customName\":\"cylinder\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"radius\":2,\"height\":4,\"center\":[-5,0,0],\"direction\":[0,1,0],\"angle\":360,\"originOnCenter\":false},\"inputs\":{},\"position\":[40,40]},\"manifold\":{\"id\":\"manifold\",\"name\":\"bitbybit.manifold.manifold.shapes.cylinder\",\"customName\":\"cylinder\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"height\":4,\"radiusLow\":2,\"radiusHigh\":2,\"circularSegments\":12,\"center\":true},\"inputs\":{},\"position\":[40,420]}},\"modules\":{}}","type":"rete"}}
  title="One cylinder, two kernels in Rete"
  description="An OpenCascade cylinder stands up along Y with a true round face; a Manifold cylinder of twelve sides lies along Z."
/>

</TabItem>
<TabItem value="blockly" label="Blockly">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"<xml xmlns=\"https://developers.google.com/blockly/xml\"><block type=\"bitbybit.draw.drawAnyAsyncNoReturn\" x=\"40\" y=\"40\"><value name=\"Entity\"><block type=\"bitbybit.occt.shapes.solid.createCylinder\"><value name=\"Radius\"><block type=\"math_number\"><field name=\"NUM\">2</field></block></value><value name=\"Height\"><block type=\"math_number\"><field name=\"NUM\">4</field></block></value><value name=\"Center\"><block type=\"bitbybit.point.pointXYZ\"><value name=\"X\"><block type=\"math_number\"><field name=\"NUM\">-5</field></block></value><value name=\"Y\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Z\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value></block></value><value name=\"Direction\"><block type=\"bitbybit.vector.vectorXYZ\"><value name=\"X\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\"><field name=\"NUM\">1</field></block></value><value name=\"Z\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value></block></value><value name=\"Angle\"><block type=\"math_number\"><field name=\"NUM\">360</field></block></value><value name=\"OriginOnCenter\"><block type=\"logic_boolean\"><field name=\"BOOL\">FALSE</field></block></value></block></value><next><block type=\"bitbybit.draw.drawAnyAsyncNoReturn\"><value name=\"Entity\"><block type=\"bitbybit.manifold.manifold.shapes.cylinder\"><value name=\"Height\"><block type=\"math_number\"><field name=\"NUM\">4</field></block></value><value name=\"RadiusLow\"><block type=\"math_number\"><field name=\"NUM\">2</field></block></value><value name=\"RadiusHigh\"><block type=\"math_number\"><field name=\"NUM\">2</field></block></value><value name=\"CircularSegments\"><block type=\"math_number\"><field name=\"NUM\">12</field></block></value><value name=\"Center\"><block type=\"logic_boolean\"><field name=\"BOOL\">TRUE</field></block></value></block></value></block></next></block></xml>","type":"blockly"}}
  title="One cylinder, two kernels in Blockly"
  description="An OpenCascade cylinder stands up along Y with a true round face; a Manifold cylinder of twelve sides lies along Z."
/>

</TabItem>
<TabItem value="typescript" label="TypeScript">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"const exact = await bitbybit.occt.shapes.solid.createCylinder({ radius: 2, height: 4, center: [-5, 0, 0] });\nconst mesh = await bitbybit.manifold.manifold.shapes.cylinder({ height: 4, radiusLow: 2, radiusHigh: 2, circularSegments: 12 });\n\nawait bitbybit.draw.drawAnyAsync({ entity: exact });\nawait bitbybit.draw.drawAnyAsync({ entity: mesh });","type":"typescript"}}
  title="One cylinder, two kernels in TypeScript"
  description="An OpenCascade cylinder stands up along Y with a true round face; a Manifold cylinder of twelve sides lies along Z."
/>

</TabItem>
</Tabs>

{/* example:kernels-side-by-side:end */}

To stand a Manifold or JSCAD shape up beside an OpenCascade one, turn it a quarter turn about X.

## Moving between kernels

A shape can travel one way without loss:

- `bitbybit.occt.shapeToManifoldMesh` meshes an OpenCascade shape into the form Manifold takes, and `bitbybit.manifold.manifold.shapes.manifoldFromMesh` makes a Manifold solid of it. Model a part exactly, then cut it a thousand times in Manifold.
- The other way, a mesh reaches OpenCascade only as flat triangles, never as true curves again. Keep the exact shape if you need it later.

Shapes from different kernels never mix in one call: an OpenCascade boolean takes OpenCascade shapes. Drawing takes them all.

## Beyond the three

The **IFC** library reads and writes building models; [IFC](/learn/npm-packages/ifc) explains it. The [Designer](/learn/designer/intro) and design documents build their parts with OpenCascade.
