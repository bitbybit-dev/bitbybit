---
title: Lines in Bitbybit
sidebar_label: Lines in Bitbybit
description: How bitbybit.line builds straight lines between two points, measures and reverses them, places points along them, transforms them, converts to the segment form and finds where two lines cross.
topic: code.base.line
type: explanation
tags: [code, line]
---

import BitByBitRenderCanvas from '@site/src/components/BitByBitRenderCanvas';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<img 
  class="category-icon-small" 
  src="https://s.bitbybit.dev/assets/icons/white/line-icon.svg" 
  alt="Line category icon" 
  title="Line category icon" /> 

[View Full Source & Details on GitHub](https://github.com/bitbybit-dev/bitbybit/blob/master/packages/dev/base/lib/api/services/line.ts)

`bitbybit.line` works with straight lines between two points in 3D. Lengths are in model units.

## Two forms of the same line

- A **line** is an object `{ start: [x, y, z], end: [x, y, z] }`. Its direction runs from `start` to `end`.
- A **segment** is the same thing as a pair of points: `[[x1, y1, z1], [x2, y2, z2]]`.

`lineToSegment` and `linesToSegments` turn line objects into segments; `segmentToLine` and `segmentsToLines` go the other way.

## Building lines

- `create` builds a line object from a start and an end point, and `createSegment` builds the segment form.
- `linesBetweenPoints` joins each point of a list to the next, so `n` points give a chain of `n - 1` lines. The chain is not closed back to the first point.
- `linesBetweenStartAndEndPoints` pairs each start point with the end point at the same position in a second list. A pair whose two points coincide makes no line and is left out, so the result can be shorter than the lists.

Here the points of a spiral are lifted and turned, and `linesBetweenStartAndEndPoints` joins each point to its partner. The lines weave a twisted surface:

{/* example:lines-between-spirals:start - generated from the example's steps for each editor; edits between these markers are overwritten */}

<Tabs groupId="editor" queryString>
<TabItem value="rete" label="Rete">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"{\"id\":\"rete-v2-json\",\"nodes\":{\"spiral\":{\"id\":\"spiral\",\"name\":\"bitbybit.point.spiral\",\"customName\":\"spiral\",\"async\":false,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":true,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"phi\":0.9,\"numberPoints\":60,\"widening\":3,\"radius\":6,\"factor\":1},\"inputs\":{},\"position\":[40,40]},\"lifted\":{\"id\":\"lifted\",\"name\":\"bitbybit.point.translatePoints\",\"customName\":\"translate points\",\"async\":false,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":true,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false}},\"inputs\":{\"points\":{\"connections\":[{\"node\":\"spiral\",\"output\":\"result\",\"data\":{}}]},\"translation\":{\"connections\":[{\"node\":\"up\",\"output\":\"result\",\"data\":{}}]}},\"position\":[460,40]},\"up\":{\"id\":\"up\",\"name\":\"bitbybit.vector.vectorXYZ\",\"customName\":\"vector xyz\",\"async\":false,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":true,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"x\":0,\"y\":5,\"z\":0},\"inputs\":{},\"position\":[40,460]},\"turned\":{\"id\":\"turned\",\"name\":\"bitbybit.point.rotatePointsCenterAxis\",\"customName\":\"rotate points center axis\",\"async\":false,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":true,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"angle\":120,\"axis\":[0,1,0],\"center\":[0,0,0]},\"inputs\":{\"points\":{\"connections\":[{\"node\":\"lifted\",\"output\":\"result\",\"data\":{}}]}},\"position\":[880,40]},\"lines\":{\"id\":\"lines\",\"name\":\"bitbybit.line.linesBetweenStartAndEndPoints\",\"customName\":\"lines between start and end points\",\"async\":false,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false}},\"inputs\":{\"startPoints\":{\"connections\":[{\"node\":\"spiral\",\"output\":\"result\",\"data\":{}}]},\"endPoints\":{\"connections\":[{\"node\":\"turned\",\"output\":\"result\",\"data\":{}}]}},\"position\":[1300,40]}},\"modules\":{}}","type":"rete"}}
  title="Lines between two spirals in Rete"
  description="Points on a spiral, the same points lifted and turned, and a line from each point to its partner, which together weave a twisted surface."
/>

</TabItem>
<TabItem value="blockly" label="Blockly">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"<xml xmlns=\"https://developers.google.com/blockly/xml\"><variables><variable id=\"points\">points</variable></variables><block type=\"bitbybit.vector.vectorXYZ\" x=\"0\" y=\"0\"></block><block type=\"variables_set\" x=\"40\" y=\"40\"><field name=\"VAR\" id=\"points\">points</field><value name=\"VALUE\"><block type=\"bitbybit.point.spiral\"><value name=\"Phi\"><block type=\"math_number\"><field name=\"NUM\">0.9</field></block></value><value name=\"NumberPoints\"><block type=\"math_number\"><field name=\"NUM\">60</field></block></value><value name=\"Widening\"><block type=\"math_number\"><field name=\"NUM\">3</field></block></value><value name=\"Radius\"><block type=\"math_number\"><field name=\"NUM\">6</field></block></value><value name=\"Factor\"><block type=\"math_number\"><field name=\"NUM\">1</field></block></value></block></value><next><block type=\"bitbybit.draw.drawAnyAsyncNoReturn\"><value name=\"Entity\"><block type=\"bitbybit.line.linesBetweenStartAndEndPoints\"><value name=\"StartPoints\"><block type=\"variables_get\"><field name=\"VAR\" id=\"points\">points</field></block></value><value name=\"EndPoints\"><block type=\"bitbybit.point.rotatePointsCenterAxis\"><value name=\"Points\"><block type=\"bitbybit.point.translatePoints\"><value name=\"Points\"><block type=\"variables_get\"><field name=\"VAR\" id=\"points\">points</field></block></value><value name=\"Translation\"><block type=\"bitbybit.vector.vectorXYZ\"><value name=\"X\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\"><field name=\"NUM\">5</field></block></value><value name=\"Z\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value></block></value></block></value><value name=\"Angle\"><block type=\"math_number\"><field name=\"NUM\">120</field></block></value><value name=\"Axis\"><block type=\"bitbybit.vector.vectorXYZ\"><value name=\"X\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\"><field name=\"NUM\">1</field></block></value><value name=\"Z\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value></block></value><value name=\"Center\"><block type=\"bitbybit.point.pointXYZ\"><value name=\"X\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Z\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value></block></value></block></value></block></value></block></next></block></xml>","type":"blockly"}}
  title="Lines between two spirals in Blockly"
  description="Points on a spiral, the same points lifted and turned, and a line from each point to its partner, which together weave a twisted surface."
/>

</TabItem>
<TabItem value="typescript" label="TypeScript">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"const points = bitbybit.point.spiral({ numberPoints: 60, radius: 6, phi: 0.9, widening: 3, factor: 1 });\nconst lifted = bitbybit.point.translatePoints({ points, translation: [0, 5, 0] });\nconst turned = bitbybit.point.rotatePointsCenterAxis({ points: lifted, angle: 120, axis: [0, 1, 0], center: [0, 0, 0] });\nconst lines = bitbybit.line.linesBetweenStartAndEndPoints({ startPoints: points, endPoints: turned });\n\nawait bitbybit.draw.drawAnyAsync({ entity: lines });","type":"typescript"}}
  title="Lines between two spirals in TypeScript"
  description="Points on a spiral, the same points lifted and turned, and a line from each point to its partner, which together weave a twisted surface."
/>

</TabItem>
</Tabs>

{/* example:lines-between-spirals:end */}

## Reading and measuring

- `getStartPoint` and `getEndPoint` read the ends.
- `length` measures the straight distance from start to end.
- `getPointOnLine` gives the point a fraction `param` of the way along: 0 is the start, 1 the end and 0.5 (the default) the middle. A value outside 0 to 1 continues past the ends.

## Reversing and transforming

These give new lines and leave their input as it was.

- `reverse` swaps the start and end, so the line runs the other way.
- `transformLine` applies a transformation matrix, or a list of them in order, to both ends of a line. Matrices come from transform functions such as those in `bitbybit.babylon.transforms`.
- `transformsForLines` applies a different transformation to each line: the first to the first line, and so on.

## Where two lines cross

`lineLineIntersection` gives the point where two lines cross, or `undefined` when they do not.

- With `checkSegmentsOnly` on (the default), the crossing must lie within both lines between their ends. Off, both lines extend without end.
- Parallel lines, lines that pass each other without meeting and lines shorter than the tolerance give `undefined`.
- `tolerance` (default `0.01`, in model units) sets how close the lines must come to count as meeting.

## Every function

{/* api:line:start - generated from the API index; edits between these markers are overwritten */}

| Function | What it does |
|---|---|
| [`create`](https://docs.bitbybit.dev/classes/Bit.Line#create) | Builds a line object from a start and an end point. |
| [`createSegment`](https://docs.bitbybit.dev/classes/Bit.Line#createSegment) | Builds a segment, the pair-of-points form of a line, from a start and an end point. |
| [`getEndPoint`](https://docs.bitbybit.dev/classes/Bit.Line#getEndPoint) | Reads the end point of a line. |
| [`getPointOnLine`](https://docs.bitbybit.dev/classes/Bit.Line#getPointOnLine) | Finds the point a fraction of the way along a line: 0 gives the start, 1 the end, 0.5 the middle. |
| [`getStartPoint`](https://docs.bitbybit.dev/classes/Bit.Line#getStartPoint) | Reads the start point of a line. |
| [`length`](https://docs.bitbybit.dev/classes/Bit.Line#length) | Measures the straight distance from the start of a line to its end. |
| [`lineLineIntersection`](https://docs.bitbybit.dev/classes/Bit.Line#lineLineIntersection) | Finds the point where two lines cross. |
| [`linesBetweenPoints`](https://docs.bitbybit.dev/classes/Bit.Line#linesBetweenPoints) | Joins each point to the next with a line, so a list of points becomes a chain of lines. |
| [`linesBetweenStartAndEndPoints`](https://docs.bitbybit.dev/classes/Bit.Line#linesBetweenStartAndEndPoints) | Pairs each start point with the end point at the same position and joins them with a line. |
| [`linesToSegments`](https://docs.bitbybit.dev/classes/Bit.Line#linesToSegments) | Turns each line object into its segment form, the pair `[start, end]`. |
| [`lineToSegment`](https://docs.bitbybit.dev/classes/Bit.Line#lineToSegment) | Turns a line object into its segment form, the pair `[start, end]`. |
| [`reverse`](https://docs.bitbybit.dev/classes/Bit.Line#reverse) | Swaps the start and end of a line, so it runs the other way. |
| [`segmentsToLines`](https://docs.bitbybit.dev/classes/Bit.Line#segmentsToLines) | Turns each segment, a pair `[start, end]`, into a line object. |
| [`segmentToLine`](https://docs.bitbybit.dev/classes/Bit.Line#segmentToLine) | Turns a segment, the pair `[start, end]`, into a line object. |
| [`transformLine`](https://docs.bitbybit.dev/classes/Bit.Line#transformLine) | Applies a transformation matrix, or a list of them in order, to both ends of a line. |
| [`transformsForLines`](https://docs.bitbybit.dev/classes/Bit.Line#transformsForLines) | Applies a different transformation to each line: the first transformation to the first line, and so on. |

{/* api:line:end */}
