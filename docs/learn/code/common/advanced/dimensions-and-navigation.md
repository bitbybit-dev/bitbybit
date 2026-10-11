---
sidebar_position: 2
title: Dimensions and Camera Navigation
sidebar_label: Dimensions and Navigation
description: Measurement annotations drawn in the 3D scene - linear, angular, radial, diametral and ordinate dimensions with their style - and camera moves, points of interest and framing with bitbybit.advanced, with an example in Rete, Blockly and TypeScript and a table of every function.
topic: code.advanced.dimensions
type: explanation
tags: [code, advanced, dimensions, navigation]
---

import BitByBitRenderCanvas from '@site/src/components/BitByBitRenderCanvas';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Dimensions and camera navigation

These two parts of `bitbybit.advanced` work on the scene rather than on the model: dimensions annotate what is drawn, and navigation moves the camera. Both are platform algorithms that work for everyone ([Advanced](intro)), with BabylonJS on bitbybit.dev and in its runner.

## Dimensions

A dimension is a measurement drawn in the scene: thin lines, arrowheads and a label with the measured value. The five kinds are `linearDimension` (the distance between two points), `angularDimension` (the angle between two directions from a center), `radialDimension` and `diametralDimension` (a circle's radius or diameter) and `ordinateDimension` (one coordinate of a point measured from an origin).

Each of them describes the dimension and returns it; drawing it is a separate step, with `bitbybit.draw.drawAnyAsync` as for any other entity. Here a box gets its width:

{/* example:box-with-a-dimension:start - generated from the example's steps for each editor; edits between these markers are overwritten */}

<Tabs groupId="editor" queryString>
<TabItem value="rete" label="Rete">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"{\"id\":\"rete-v2-json\",\"nodes\":{\"box\":{\"id\":\"box\",\"name\":\"bitbybit.occt.shapes.solid.createBox\",\"customName\":\"box\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"width\":4,\"length\":2,\"height\":1.5,\"center\":[0,0,0],\"originOnCenter\":true},\"inputs\":{},\"position\":[40,40]},\"width\":{\"id\":\"width\",\"name\":\"bitbybit.advanced.dimensions.linearDimension\",\"customName\":\"linear dimension\",\"async\":false,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"startPoint\":[-2,0.75,1],\"endPoint\":[2,0.75,1],\"direction\":[0,0.6,0],\"labelOffset\":0.1,\"decimalPlaces\":2,\"labelSuffix\":\"mm\",\"labelOverwrite\":\"1*val\",\"removeTrailingZeros\":true},\"inputs\":{},\"position\":[460,40]}},\"modules\":{}}","type":"rete"}}
  title="A box with its width dimensioned in Rete"
  description="A box four units wide and a linear dimension along its top front edge, lifted off it, labelled with the measured width."
/>

</TabItem>
<TabItem value="blockly" label="Blockly">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"<xml xmlns=\"https://developers.google.com/blockly/xml\"><block type=\"bitbybit.draw.drawAnyAsyncNoReturn\" x=\"40\" y=\"40\"><value name=\"Entity\"><block type=\"bitbybit.occt.shapes.solid.createBox\"><value name=\"Width\"><block type=\"math_number\"><field name=\"NUM\">4</field></block></value><value name=\"Length\"><block type=\"math_number\"><field name=\"NUM\">2</field></block></value><value name=\"Height\"><block type=\"math_number\"><field name=\"NUM\">1.5</field></block></value><value name=\"Center\"><block type=\"bitbybit.point.pointXYZ\"><value name=\"X\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Z\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value></block></value><value name=\"OriginOnCenter\"><block type=\"logic_boolean\"><field name=\"BOOL\">TRUE</field></block></value></block></value><next><block type=\"bitbybit.draw.drawAnyAsyncNoReturn\"><value name=\"Entity\"><block type=\"bitbybit.advanced.dimensions.linearDimension\"><value name=\"StartPoint\"><block type=\"bitbybit.point.pointXYZ\"><value name=\"X\"><block type=\"math_number\"><field name=\"NUM\">-2</field></block></value><value name=\"Y\"><block type=\"math_number\"><field name=\"NUM\">0.75</field></block></value><value name=\"Z\"><block type=\"math_number\"><field name=\"NUM\">1</field></block></value></block></value><value name=\"EndPoint\"><block type=\"bitbybit.point.pointXYZ\"><value name=\"X\"><block type=\"math_number\"><field name=\"NUM\">2</field></block></value><value name=\"Y\"><block type=\"math_number\"><field name=\"NUM\">0.75</field></block></value><value name=\"Z\"><block type=\"math_number\"><field name=\"NUM\">1</field></block></value></block></value><value name=\"Direction\"><block type=\"bitbybit.vector.vectorXYZ\"><value name=\"X\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\"><field name=\"NUM\">0.6</field></block></value><value name=\"Z\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value></block></value><value name=\"LabelOffset\"><block type=\"math_number\"><field name=\"NUM\">0.1</field></block></value><value name=\"DecimalPlaces\"><block type=\"math_number\"><field name=\"NUM\">2</field></block></value><value name=\"LabelSuffix\"><block type=\"text\"><field name=\"TEXT\">mm</field></block></value><value name=\"LabelOverwrite\"><block type=\"text\"><field name=\"TEXT\">1*val</field></block></value><value name=\"RemoveTrailingZeros\"><block type=\"logic_boolean\"><field name=\"BOOL\">TRUE</field></block></value></block></value></block></next></block></xml>","type":"blockly"}}
  title="A box with its width dimensioned in Blockly"
  description="A box four units wide and a linear dimension along its top front edge, lifted off it, labelled with the measured width."
/>

</TabItem>
<TabItem value="typescript" label="TypeScript">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"const box = await bitbybit.occt.shapes.solid.createBox({ width: 4, length: 2, height: 1.5, center: [0, 0, 0] });\nconst width = new Bit.Advanced.Dimensions.LinearDimensionDto();\nwidth.startPoint = [-2, 0.75, 1];\nwidth.endPoint = [2, 0.75, 1];\nwidth.direction = [0, 0.6, 0];\nwidth.removeTrailingZeros = true;\n\nawait bitbybit.draw.drawAnyAsync({ entity: box });\nawait bitbybit.draw.drawAnyAsync({ entity: bitbybit.advanced.dimensions.linearDimension(width) });","type":"typescript"}}
  title="A box with its width dimensioned in TypeScript"
  description="A box four units wide and a linear dimension along its top front edge, lifted off it, labelled with the measured width."
/>

</TabItem>
</Tabs>

{/* example:box-with-a-dimension:end */}

`direction` lifts the dimension line off the measured points, and extension lines run from each point to it. The label reads the value with `decimalPlaces`, `labelSuffix` after it and `removeTrailingZeros` to drop zeros; `labelOverwrite` is an expression in `val`, so `val*10` shows ten times the value. The value is in model units, and an angular dimension's value is in radians: show degrees with `labelOverwrite` set to `val*57.29578`. `dimensionStyle` makes one style of colors, line thickness, arrow and text sizes for several dimensions.

## Camera navigation

The camera moves animate the active arc-rotate camera, the camera that orbits a target point, over `animationSpeed` seconds along an easing curve:

- `flyTo` flies to a camera position and target;
- `zoomOn` and `zoomOnAspect` frame a list of meshes, keeping the viewing angle;
- `focusFromAngle` looks at meshes from a direction you give.

`pointOfInterest` describes a clickable marker, a sphere in a pulsing ring with a label, that flies the camera to a saved view when clicked; draw it with `bitbybit.draw.drawAnyAsync`, and style it with `pointOfInterestStyle`. Markers placed around a model make a guided tour of it.

## Every function

### Dimensions

{/* api:advanced.dimensions:start - generated from the API index; edits between these markers are overwritten */}

| Function | What it does |
|---|---|
| [`angularDimension`](https://docs.bitbybit.dev/classes/Bit.Dimensions#angularDimension) | Describes a dimension showing the angle between two directions from a center point, ready to draw. |
| [`diametralDimension`](https://docs.bitbybit.dev/classes/Bit.Dimensions#diametralDimension) | Describes a dimension showing a circle's diameter as a line across its full width, ready to draw. |
| [`dimensionStyle`](https://docs.bitbybit.dev/classes/Bit.Dimensions#dimensionStyle) | Builds the look of a dimension: the colors and sizes of its lines, arrowheads and label. |
| [`drawAngularDimension`](https://docs.bitbybit.dev/classes/Bit.Dimensions#drawAngularDimension) | Adds an angular dimension to the scene as tube lines, cone arrowheads and a text label. |
| [`drawDiametralDimension`](https://docs.bitbybit.dev/classes/Bit.Dimensions#drawDiametralDimension) | Adds a diametral dimension to the scene as tube lines, cone arrowheads and a text label. |
| [`drawLinearDimension`](https://docs.bitbybit.dev/classes/Bit.Dimensions#drawLinearDimension) | Adds a linear dimension to the scene as tube lines, cone arrowheads and a text label. |
| [`drawOrdinateDimension`](https://docs.bitbybit.dev/classes/Bit.Dimensions#drawOrdinateDimension) | Adds an ordinate dimension to the scene as tube lines, cone arrowheads and a text label. |
| [`drawRadialDimension`](https://docs.bitbybit.dev/classes/Bit.Dimensions#drawRadialDimension) | Adds a radial dimension to the scene as tube lines, cone arrowheads and a text label. |
| [`linearDimension`](https://docs.bitbybit.dev/classes/Bit.Dimensions#linearDimension) | Describes a dimension that shows the straight-line distance between two points, ready to draw. |
| [`ordinateDimension`](https://docs.bitbybit.dev/classes/Bit.Dimensions#ordinateDimension) | Describes a dimension showing a point's distance from a reference point along one axis, ready to draw. |
| [`radialDimension`](https://docs.bitbybit.dev/classes/Bit.Dimensions#radialDimension) | Describes a dimension showing the radius of a circle or arc from its center, ready to draw. |

{/* api:advanced.dimensions:end */}

### Navigation

{/* api:advanced.navigation:start - generated from the API index; edits between these markers are overwritten */}

| Function | What it does |
|---|---|
| [`drawPointOfInterest`](https://docs.bitbybit.dev/classes/Bit.Navigation#drawPointOfInterest) | Adds a point of interest to the scene and makes it answer hover and click. |
| [`flyTo`](https://docs.bitbybit.dev/classes/Bit.Navigation#flyTo) | Flies the camera to a new position and target, the same motion a clicked point of interest uses. |
| [`focusFromAngle`](https://docs.bitbybit.dev/classes/Bit.Navigation#focusFromAngle) | Animates the camera to look at the given meshes from a chosen direction. |
| [`pointOfInterest`](https://docs.bitbybit.dev/classes/Bit.Navigation#pointOfInterest) | Describes a clickable marker that flies the camera to a saved view, ready to draw. |
| [`pointOfInterestStyle`](https://docs.bitbybit.dev/classes/Bit.Navigation#pointOfInterestStyle) | Builds the look of a point of interest: its sphere, pulsing ring and label, normal and under the pointer. |
| [`zoomOn`](https://docs.bitbybit.dev/classes/Bit.Navigation#zoomOn) | Animates the camera so the given meshes fill the view, keeping its viewing angle. |
| [`zoomOnAspect`](https://docs.bitbybit.dev/classes/Bit.Navigation#zoomOnAspect) | Animates the camera so the meshes fit the view's width and height, keeping its viewing angle. |

{/* api:advanced.navigation:end */}
