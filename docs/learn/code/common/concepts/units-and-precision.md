---
sidebar_position: 3
title: Units, Tolerance and Precision
sidebar_label: Units and Precision
description: What unit a Bitbybit number is in, why a kernel's tolerance and a drawing's precision are different things, and how precision makes a curve smooth or faceted on screen without changing the shape.
topic: code.concepts.units-and-precision
type: explanation
tags: [code, occt, draw]
---

import BitByBitRenderCanvas from '@site/src/components/BitByBitRenderCanvas';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Units, tolerance and precision

## Numbers have no unit

A length in Bitbybit is a plain number. The kernels do not know millimetres from metres: a box of width 4 is 4 of whatever unit you decide on. Pick one for a model and keep to it, and say which one when you export: a STEP file or a 3D printer will read the numbers in a unit of its own, often millimetres. Angles, wherever a function takes one, are in **degrees**.

The scene does not care either, but the editors' camera starts about 22 units from the origin, which suits a model a few units across. A model in millimetres, even a single bolt through a plate, is tens of units across and stands around the camera: move the camera out with `bitbybit.babylon.scene.adjustActiveArcRotateCamera`, as the [standard parts](../occt/parts/intro) examples do. A scene that large also needs its shadows told how large it is.

## Tolerance and precision are different things

Two numbers decide how close is close enough, and they are easy to confuse:

- **Tolerance** belongs to the kernel. It is how far apart two points may be and still count as the same point when OpenCascade joins edges, sews faces or checks a solid. The default suits most models; it matters when you import geometry from elsewhere or build at a very small or very large scale.
- **Precision** belongs to drawing. A curved surface is drawn as triangles, and precision is how far those triangles may stray from the true surface. A smaller number gives smoother curves and more triangles.

Precision never changes the shape. The disc below is the same exact cylinder twice; the left one is drawn with a coarse precision of 0.5 and without its edges, so its round rim becomes a polygon, the right one with the default:

{/* example:drawing-precision:start - generated from the example's steps for each editor; edits between these markers are overwritten */}

<Tabs groupId="editor" queryString>
<TabItem value="rete" label="Rete">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"{\"id\":\"rete-v2-json\",\"nodes\":{\"coarse\":{\"id\":\"coarse\",\"name\":\"bitbybit.occt.shapes.solid.createCylinder\",\"customName\":\"cylinder\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":true,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"radius\":2,\"height\":1,\"center\":[-3,0,0],\"direction\":[0,1,0],\"angle\":360,\"originOnCenter\":false},\"inputs\":{},\"position\":[40,40]},\"options\":{\"id\":\"options\",\"name\":\"bitbybit.draw.optionsOcctShape\",\"customName\":\"options occt shape\",\"async\":false,\"drawable\":false,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"faceOpacity\":1,\"edgeOpacity\":1,\"edgeColour\":\"#ffffff\",\"faceColour\":\"#ff0000\",\"vertexColour\":\"#ff00ff\",\"edgeWidth\":2,\"vertexSize\":0.03,\"drawEdges\":false,\"drawFaces\":true,\"drawVertices\":false,\"precision\":0.5,\"angularDeflection\":0.5,\"relativeDeflection\":false,\"drawEdgeIndexes\":false,\"edgeIndexHeight\":0.06,\"edgeIndexColour\":\"#ff00ff\",\"drawFaceIndexes\":false,\"faceIndexHeight\":0.06,\"faceIndexColour\":\"#0000ff\",\"drawTwoSided\":true,\"backFaceColour\":\"#0000ff\",\"backFaceOpacity\":1,\"edgeArrowSize\":0,\"edgeArrowAngle\":15,\"keepMeshData\":false,\"allowQualityDecrease\":true,\"forceFaceDeflection\":false,\"drawIsoCurves\":false,\"isoCurvesU\":5,\"isoCurvesV\":5,\"isoCurvesColour\":\"#808080\",\"surfaceAnalysis\":\"none\",\"draftDirection\":[0,1,0]},\"inputs\":{},\"position\":[40,380]},\"draw\":{\"id\":\"draw\",\"name\":\"bitbybit.draw.drawAnyAsync\",\"customName\":\"draw any async\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false}},\"inputs\":{\"entity\":{\"connections\":[{\"node\":\"coarse\",\"output\":\"result\",\"data\":{}}]},\"options\":{\"connections\":[{\"node\":\"options\",\"output\":\"result\",\"data\":{}}]}},\"position\":[460,40]},\"fine\":{\"id\":\"fine\",\"name\":\"bitbybit.occt.shapes.solid.createCylinder\",\"customName\":\"cylinder\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"radius\":2,\"height\":1,\"center\":[3,0,0],\"direction\":[0,1,0],\"angle\":360,\"originOnCenter\":false},\"inputs\":{},\"position\":[460,520]}},\"modules\":{}}","type":"rete"}}
  title="One disc, two precisions in Rete"
  description="Two discs of the same radius, drawn with a coarse precision and no edges on the left and the default on the right."
/>

</TabItem>
<TabItem value="blockly" label="Blockly">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"<xml xmlns=\"https://developers.google.com/blockly/xml\"><block type=\"bitbybit.draw.drawAnyAsyncNoReturn\" x=\"40\" y=\"40\"><value name=\"Entity\"><block type=\"bitbybit.occt.shapes.solid.createCylinder\"><value name=\"Radius\"><block type=\"math_number\"><field name=\"NUM\">2</field></block></value><value name=\"Height\"><block type=\"math_number\"><field name=\"NUM\">1</field></block></value><value name=\"Center\"><block type=\"bitbybit.point.pointXYZ\"><value name=\"X\"><block type=\"math_number\"><field name=\"NUM\">-3</field></block></value><value name=\"Y\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Z\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value></block></value><value name=\"Direction\"><block type=\"bitbybit.vector.vectorXYZ\"><value name=\"X\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\"><field name=\"NUM\">1</field></block></value><value name=\"Z\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value></block></value><value name=\"Angle\"><block type=\"math_number\"><field name=\"NUM\">360</field></block></value><value name=\"OriginOnCenter\"><block type=\"logic_boolean\"><field name=\"BOOL\">FALSE</field></block></value></block></value><value name=\"Options\"><block type=\"bitbybit.draw.optionsOcctShape\"><value name=\"FaceOpacity\"><block type=\"math_number\"><field name=\"NUM\">1</field></block></value><value name=\"EdgeOpacity\"><block type=\"math_number\"><field name=\"NUM\">1</field></block></value><value name=\"EdgeColour\"><block type=\"colour_picker\"><field name=\"COLOUR\">#ffffff</field></block></value><value name=\"FaceColour\"><block type=\"colour_picker\"><field name=\"COLOUR\">#ff0000</field></block></value><value name=\"VertexColour\"><block type=\"colour_picker\"><field name=\"COLOUR\">#ff00ff</field></block></value><value name=\"EdgeWidth\"><block type=\"math_number\"><field name=\"NUM\">2</field></block></value><value name=\"VertexSize\"><block type=\"math_number\"><field name=\"NUM\">0.03</field></block></value><value name=\"DrawEdges\"><block type=\"logic_boolean\"><field name=\"BOOL\">FALSE</field></block></value><value name=\"DrawFaces\"><block type=\"logic_boolean\"><field name=\"BOOL\">TRUE</field></block></value><value name=\"DrawVertices\"><block type=\"logic_boolean\"><field name=\"BOOL\">FALSE</field></block></value><value name=\"Precision\"><block type=\"math_number\"><field name=\"NUM\">0.5</field></block></value><value name=\"AngularDeflection\"><block type=\"math_number\"><field name=\"NUM\">0.5</field></block></value><value name=\"RelativeDeflection\"><block type=\"logic_boolean\"><field name=\"BOOL\">FALSE</field></block></value><value name=\"DrawEdgeIndexes\"><block type=\"logic_boolean\"><field name=\"BOOL\">FALSE</field></block></value><value name=\"EdgeIndexHeight\"><block type=\"math_number\"><field name=\"NUM\">0.06</field></block></value><value name=\"EdgeIndexColour\"><block type=\"colour_picker\"><field name=\"COLOUR\">#ff00ff</field></block></value><value name=\"DrawFaceIndexes\"><block type=\"logic_boolean\"><field name=\"BOOL\">FALSE</field></block></value><value name=\"FaceIndexHeight\"><block type=\"math_number\"><field name=\"NUM\">0.06</field></block></value><value name=\"FaceIndexColour\"><block type=\"colour_picker\"><field name=\"COLOUR\">#0000ff</field></block></value><value name=\"DrawTwoSided\"><block type=\"logic_boolean\"><field name=\"BOOL\">TRUE</field></block></value><value name=\"BackFaceColour\"><block type=\"colour_picker\"><field name=\"COLOUR\">#0000ff</field></block></value><value name=\"BackFaceOpacity\"><block type=\"math_number\"><field name=\"NUM\">1</field></block></value><value name=\"EdgeArrowSize\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"EdgeArrowAngle\"><block type=\"math_number\"><field name=\"NUM\">15</field></block></value><value name=\"KeepMeshData\"><block type=\"logic_boolean\"><field name=\"BOOL\">FALSE</field></block></value><value name=\"AllowQualityDecrease\"><block type=\"logic_boolean\"><field name=\"BOOL\">TRUE</field></block></value><value name=\"ForceFaceDeflection\"><block type=\"logic_boolean\"><field name=\"BOOL\">FALSE</field></block></value><value name=\"DrawIsoCurves\"><block type=\"logic_boolean\"><field name=\"BOOL\">FALSE</field></block></value><value name=\"IsoCurvesU\"><block type=\"math_number\"><field name=\"NUM\">5</field></block></value><value name=\"IsoCurvesV\"><block type=\"math_number\"><field name=\"NUM\">5</field></block></value><value name=\"IsoCurvesColour\"><block type=\"colour_picker\"><field name=\"COLOUR\">#808080</field></block></value><value name=\"SurfaceAnalysis\"><block type=\"bitbybit.occt.enums.surfaceAnalysisEnum\"><field name=\"bitbybit.occt.enums.surfaceAnalysisEnum\">'none'</field></block></value><value name=\"DraftDirection\"><block type=\"bitbybit.vector.vectorXYZ\"><value name=\"X\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\"><field name=\"NUM\">1</field></block></value><value name=\"Z\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value></block></value></block></value><next><block type=\"bitbybit.draw.drawAnyAsyncNoReturn\"><value name=\"Entity\"><block type=\"bitbybit.occt.shapes.solid.createCylinder\"><value name=\"Radius\"><block type=\"math_number\"><field name=\"NUM\">2</field></block></value><value name=\"Height\"><block type=\"math_number\"><field name=\"NUM\">1</field></block></value><value name=\"Center\"><block type=\"bitbybit.point.pointXYZ\"><value name=\"X\"><block type=\"math_number\"><field name=\"NUM\">3</field></block></value><value name=\"Y\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Z\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value></block></value><value name=\"Direction\"><block type=\"bitbybit.vector.vectorXYZ\"><value name=\"X\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\"><field name=\"NUM\">1</field></block></value><value name=\"Z\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value></block></value><value name=\"Angle\"><block type=\"math_number\"><field name=\"NUM\">360</field></block></value><value name=\"OriginOnCenter\"><block type=\"logic_boolean\"><field name=\"BOOL\">FALSE</field></block></value></block></value></block></next></block></xml>","type":"blockly"}}
  title="One disc, two precisions in Blockly"
  description="Two discs of the same radius, drawn with a coarse precision and no edges on the left and the default on the right."
/>

</TabItem>
<TabItem value="typescript" label="TypeScript">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"const coarse = await bitbybit.occt.shapes.solid.createCylinder({ radius: 2, height: 1, center: [-3, 0, 0] });\nconst fine = await bitbybit.occt.shapes.solid.createCylinder({ radius: 2, height: 1, center: [3, 0, 0] });\n\nconst coarseOptions = new Bit.Inputs.Draw.DrawOcctShapeOptions();\ncoarseOptions.precision = 0.5;\ncoarseOptions.drawEdges = false;\nawait bitbybit.draw.drawAnyAsync({ entity: coarse, options: coarseOptions });\nawait bitbybit.draw.drawAnyAsync({ entity: fine });","type":"typescript"}}
  title="One disc, two precisions in TypeScript"
  description="Two discs of the same radius, drawn with a coarse precision and no edges on the left and the default on the right."
/>

</TabItem>
</Tabs>

{/* example:drawing-precision:end */}

Measure the two and they give the same volume, and a STEP export of either is exactly round. Only the picture differs. Lower the precision when a model is large and curved and the drawing is slow; raise it for close-ups and renders.

## The rest of the conventions

Which way is up in each kernel, colours from 0 to 1, and the drawing defaults are on [Conventions](../conventions).
