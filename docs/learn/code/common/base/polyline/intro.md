---
title: Polylines in Bitbybit
sidebar_label: Polylines in Bitbybit
description: How bitbybit.polyline builds open and closed polylines, measures their length, area and normal, splits them into segments, finds where they cross, joins loose segments into chains, works with flat outlines, follows a path with tangents and sweep frames, and sizes and rounds the fillets at their corners.
topic: code.base.polyline
type: explanation
tags: [code, polyline]
---

import BitByBitRenderCanvas from '@site/src/components/BitByBitRenderCanvas';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<img 
  class="category-icon-small" 
  src="https://s.bitbybit.dev/assets/icons/white/polyline-icon.svg" 
  alt="Polyline category icon" 
  title="Polyline category icon" /> 

[View Full Source & Details on GitHub](https://github.com/bitbybit-dev/bitbybit/blob/master/packages/dev/base/lib/api/services/polyline.ts)

`bitbybit.polyline` works with polylines: chains of straight segments through a list of points. Lengths are in model units.

## What a polyline is

A polyline is an object `{ points: [[x1,y1,z1], [x2,y2,z2], ...], isClosed }`. When `isClosed` is true, a last segment joins the last point back to the first, so the polyline outlines a polygon. The first point need not be repeated at the end.

`create` builds one from a list of points and `isClosed` (default false).

## Reading and measuring

- `getPoints` gives the list of points and `countPoints` counts them.
- `length` adds up the distances between neighbouring points. The closing segment of a closed polyline is not counted, so to measure the full loop of a polygon, repeat its first point at the end.
- `polygonArea` measures the area the polyline encloses, read as a closed outline whether `isClosed` is set or not. The result is never negative.
- `polygonNormal` gives the unit normal of that outline, pointing the way the outline turns by the right-hand rule: a square traced counter-clockwise in the XY plane gives `[0, 0, 1]`. It holds for outlines that are not convex or not quite flat, and an outline with no area gives `undefined`.

## Reversing and transforming

- `reverse` reverses the order of the points, so the polyline runs the other way. It reverses the point list of the polyline you pass in, and the polyline it gives has no `isClosed`; set it again with `create` when it matters.
- `transformPolyline` applies a transformation matrix, or a list of them in order, such as `bitbybit.babylon.transforms` builds, to every point. The result is a new polyline, also without `isClosed`.

## Splitting into segments

- `polylineToSegments` gives one segment `[start, end]` per pair of neighbouring points, and `polylineToLines` gives the same as line objects `{ start, end }`.
- For a closed polyline both add the segment from the last point back to the first, unless the two points already coincide.

## Where polylines cross

- `polylineSelfIntersection` finds the points where a polyline crosses itself. Neighbouring segments, which always share a point, are not tested against each other.
- `twoPolylineIntersection` finds the points where two polylines cross, testing every segment of one against every segment of the other.

Both use `tolerance` (default `1e-5`): crossings closer together than it are reported once.

## Joining loose segments

`sortSegmentsIntoPolylines` takes segments in any order and joins those whose ends meet within `tolerance` into polylines. A chain that comes back to where it started becomes a closed polyline, without its first point repeated at the end. A segment that touches nothing becomes a polyline of its own. `bitbybit.mesh` uses it to turn the segments where two meshes cut each other into curves.

## Flat outlines

These work on an outline in the plane, given as a list of 2D points `[[x, y], ...]`: its corners in order, the last joining back to the first without being repeated.

- `signedArea2d` measures the area, positive when the outline runs counter-clockwise and negative when it runs clockwise, so its sign says which way the outline turns: the square `[[0,0], [4,0], [4,4], [0,4]]` gives 16, and the same corners reversed give -16.
- `orient2d` makes the outline run counter-clockwise, or clockwise with `counterClockwise` set to false. An outline already running that way comes back as it was; any other has its corners reversed. Profiles and holes often need a known winding, and this is the way to give it.
- `perimeter2d` measures the length around the outline, its closing side included, so `[[0,0], [3,0], [3,4]]` gives 12. `length` leaves that side out.
- `isPointInside2d` tells whether a point lies inside the outline by counting the sides a ray from the point crosses, so it holds for outlines that are not convex; a point exactly on a side may fall either way.
- `roundCorners2d` rounds every corner with an arc of `radius`, or with its own entry of `radiusList`, drawn as short straight pieces, `segments` of them to a quarter turn (8 by default). A radius of 0 leaves a corner sharp, and one too large for the sides beside its corner is refused.

## Following a path

These take an open polyline, a path, and refuse a closed one.

- `tangents` gives the direction the path heads in at each of its points, every one of length 1. At an inner point it bisects the segments either side; at the ends it follows the end segments, unless `startTangent` or `endTangent` gives the direction there. `[[0,0,0], [1,0,0], [1,1,0]]` gives `[1,0,0]`, `[0.707,0.707,0]` and `[0,1,0]`.
- `sweepFrames` places a frame at each point, its normal along the path, and turns the frame's direction, the X axis of a profile drawn on it, by the smallest angle from one point to the next, so a profile carried along the path does not spin about it. `firstDirection` says roughly where that X axis points at the start, and is turned square to the path.
- `sweepPlacements` gives a matrix per point that puts a flat profile drawn in the XY plane on that point's frame, with Z along the path, and stretches it across a bend so the pieces either side meet. Applying each matrix to a copy of the profile lays out the sections of a sweep.

## Fillets at corners

- `maxFilletsHalfLine` gives the largest fillet radius for every corner, each limited to the nearer half of its two segments so the fillets never overlap. A closed polyline also gets the corners at its first and last points.
- `safestFilletRadius` gives the smallest of those: one radius that fits every corner. A polyline with fewer than three points, or any corner that allows no fillet, gives 0.
- `roundCorners` rounds the corners of an open path in space itself, with arcs drawn as short straight pieces, `segments` of them to a quarter turn (8 by default). Where the segments beside a corner are too short for `radius`, that corner gets the largest arc that fits half of each, and the two ends stay where they are: `[[0,0,0], [10,0,0], [10,10,0]]` with `radius` 2 gives one quarter arc at the corner. A closed polyline is refused; for a flat closed outline, use `roundCorners2d`.

The same calculations for loose points are in `bitbybit.point`.

Here the corners of an OpenCascade star are read into a closed polyline. `safestFilletRadius` finds the largest radius every corner allows, and the star is rounded with it:

{/* example:rounded-polygon:start - generated from the example's steps for each editor; edits between these markers are overwritten */}

<Tabs groupId="editor" queryString>
<TabItem value="rete" label="Rete">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"{\"id\":\"rete-v2-json\",\"nodes\":{\"star\":{\"id\":\"star\",\"name\":\"bitbybit.occt.shapes.wire.createStarWire\",\"customName\":\"star wire\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":true,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"center\":[0,0,0],\"direction\":[0,1,0],\"numRays\":7,\"outerRadius\":6,\"innerRadius\":3,\"offsetOuterEdges\":0,\"half\":false},\"inputs\":{},\"position\":[40,40]},\"corners\":{\"id\":\"corners\",\"name\":\"bitbybit.occt.shapes.wire.divideWireByEqualDistanceToPoints\",\"customName\":\"divide wire by equal distance to points\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":true,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"nrOfDivisions\":14,\"removeStartPoint\":false,\"removeEndPoint\":true},\"inputs\":{\"shape\":{\"connections\":[{\"node\":\"star\",\"output\":\"result\",\"data\":{}}]}},\"position\":[460,40]},\"outline\":{\"id\":\"outline\",\"name\":\"bitbybit.polyline.create\",\"customName\":\"polyline\",\"async\":false,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"isClosed\":true},\"inputs\":{\"points\":{\"connections\":[{\"node\":\"corners\",\"output\":\"result\",\"data\":{}}]}},\"position\":[880,40]},\"radius\":{\"id\":\"radius\",\"name\":\"bitbybit.polyline.safestFilletRadius\",\"customName\":\"safest fillet radius\",\"async\":false,\"drawable\":false,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"tolerance\":0.00001},\"inputs\":{\"polyline\":{\"connections\":[{\"node\":\"outline\",\"output\":\"result\",\"data\":{}}]}},\"position\":[1300,40]},\"rounded\":{\"id\":\"rounded\",\"name\":\"bitbybit.occt.fillets.fillet2d\",\"customName\":\"fillet 2d\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"radius\":0.1},\"inputs\":{\"shape\":{\"connections\":[{\"node\":\"star\",\"output\":\"result\",\"data\":{}}]},\"radius\":{\"connections\":[{\"node\":\"radius\",\"output\":\"result\",\"data\":{}}]}},\"position\":[1720,40]}},\"modules\":{}}","type":"rete"}}
  title="The largest fillet a star allows in Rete"
  description="The corners of a star read into a closed polyline, the largest fillet radius that fits all of them, and the star rounded with that radius."
/>

</TabItem>
<TabItem value="blockly" label="Blockly">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"<xml xmlns=\"https://developers.google.com/blockly/xml\"><variables><variable id=\"star\">star</variable><variable id=\"outline\">outline</variable></variables><block type=\"variables_set\" x=\"40\" y=\"40\"><field name=\"VAR\" id=\"star\">star</field><value name=\"VALUE\"><block type=\"bitbybit.occt.shapes.wire.createStarWire\"><value name=\"Center\"><block type=\"bitbybit.point.pointXYZ\"><value name=\"X\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Z\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value></block></value><value name=\"Direction\"><block type=\"bitbybit.vector.vectorXYZ\"><value name=\"X\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\"><field name=\"NUM\">1</field></block></value><value name=\"Z\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value></block></value><value name=\"NumRays\"><block type=\"math_number\"><field name=\"NUM\">7</field></block></value><value name=\"OuterRadius\"><block type=\"math_number\"><field name=\"NUM\">6</field></block></value><value name=\"InnerRadius\"><block type=\"math_number\"><field name=\"NUM\">3</field></block></value><value name=\"OffsetOuterEdges\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Half\"><block type=\"logic_boolean\"><field name=\"BOOL\">FALSE</field></block></value></block></value><next><block type=\"variables_set\"><field name=\"VAR\" id=\"outline\">outline</field><value name=\"VALUE\"><block type=\"bitbybit.polyline.create\"><value name=\"Points\"><block type=\"base_time_await_return\"><value name=\"Promise\"><block type=\"bitbybit.occt.shapes.wire.divideWireByEqualDistanceToPoints\"><value name=\"Shape\"><block type=\"variables_get\"><field name=\"VAR\" id=\"star\">star</field></block></value><value name=\"NrOfDivisions\"><block type=\"math_number\"><field name=\"NUM\">14</field></block></value><value name=\"RemoveStartPoint\"><block type=\"logic_boolean\"><field name=\"BOOL\">FALSE</field></block></value><value name=\"RemoveEndPoint\"><block type=\"logic_boolean\"><field name=\"BOOL\">TRUE</field></block></value></block></value></block></value><value name=\"IsClosed\"><block type=\"logic_boolean\"><field name=\"BOOL\">TRUE</field></block></value></block></value><next><block type=\"bitbybit.draw.drawAnyAsyncNoReturn\"><value name=\"Entity\"><block type=\"variables_get\"><field name=\"VAR\" id=\"outline\">outline</field></block></value><next><block type=\"bitbybit.draw.drawAnyAsyncNoReturn\"><value name=\"Entity\"><block type=\"bitbybit.occt.fillets.fillet2d\"><value name=\"Shape\"><block type=\"variables_get\"><field name=\"VAR\" id=\"star\">star</field></block></value><value name=\"Radius\"><block type=\"bitbybit.polyline.safestFilletRadius\"><value name=\"Polyline\"><block type=\"variables_get\"><field name=\"VAR\" id=\"outline\">outline</field></block></value><value name=\"Tolerance\"><block type=\"math_number\"><field name=\"NUM\">0.00001</field></block></value></block></value></block></value></block></next></block></next></block></next></block></xml>","type":"blockly"}}
  title="The largest fillet a star allows in Blockly"
  description="The corners of a star read into a closed polyline, the largest fillet radius that fits all of them, and the star rounded with that radius."
/>

</TabItem>
<TabItem value="typescript" label="TypeScript">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"const star = await bitbybit.occt.shapes.wire.createStarWire({ center: [0, 0, 0], direction: [0, 1, 0], numRays: 7, outerRadius: 6, innerRadius: 3, offsetOuterEdges: 0, half: false });\nconst corners = await bitbybit.occt.shapes.wire.divideWireByEqualDistanceToPoints({ shape: star, nrOfDivisions: 14, removeStartPoint: false, removeEndPoint: true });\nconst outline = bitbybit.polyline.create({ points: corners, isClosed: true });\nconst radius = bitbybit.polyline.safestFilletRadius({ polyline: outline, tolerance: 1e-5 });\nconst rounded = await bitbybit.occt.fillets.fillet2d({ shape: star, radius });\n\nawait bitbybit.draw.drawAnyAsync({ entity: outline });\nawait bitbybit.draw.drawAnyAsync({ entity: rounded });","type":"typescript"}}
  title="The largest fillet a star allows in TypeScript"
  description="The corners of a star read into a closed polyline, the largest fillet radius that fits all of them, and the star rounded with that radius."
/>

</TabItem>
</Tabs>

{/* example:rounded-polygon:end */}

## Every function

{/* api:polyline:start - generated from the API index; edits between these markers are overwritten */}

| Function | What it does |
|---|---|
| [`countPoints`](https://docs.bitbybit.dev/classes/Bit.Polyline#countPoints) | Counts the points of the polyline. |
| [`create`](https://docs.bitbybit.dev/classes/Bit.Polyline#create) | Builds a polyline object from points, open or closed. |
| [`getPoints`](https://docs.bitbybit.dev/classes/Bit.Polyline#getPoints) | Reads the list of points out of the polyline. |
| [`isPointInside2d`](https://docs.bitbybit.dev/classes/Bit.Polyline#isPointInside2d) | Tells whether a point lies inside a flat outline. |
| [`length`](https://docs.bitbybit.dev/classes/Bit.Polyline#length) | Measures the polyline by adding up the straight distances between neighboring points. |
| [`maxFilletsHalfLine`](https://docs.bitbybit.dev/classes/Bit.Polyline#maxFilletsHalfLine) | Finds the largest fillet for every corner of the polyline, each limited to the nearer half of its segments so the fillets never overlap. |
| [`orient2d`](https://docs.bitbybit.dev/classes/Bit.Polyline#orient2d) | Makes a flat outline run counter-clockwise, or clockwise. |
| [`perimeter2d`](https://docs.bitbybit.dev/classes/Bit.Polyline#perimeter2d) | Measures the length around a flat outline, its closing side included. |
| [`polygonArea`](https://docs.bitbybit.dev/classes/Bit.Polyline#polygonArea) | Measures the area a polyline encloses, read as a closed outline in its own plane. |
| [`polygonNormal`](https://docs.bitbybit.dev/classes/Bit.Polyline#polygonNormal) | Finds the unit normal of the plane a polyline encloses, read as a closed outline. |
| [`polylineSelfIntersection`](https://docs.bitbybit.dev/classes/Bit.Polyline#polylineSelfIntersection) | Finds the points where the polyline crosses itself. |
| [`polylineToLines`](https://docs.bitbybit.dev/classes/Bit.Polyline#polylineToLines) | Splits the polyline into line objects, one per segment, each with a start and an end point. |
| [`polylineToSegments`](https://docs.bitbybit.dev/classes/Bit.Polyline#polylineToSegments) | Splits the polyline into segments, each a pair of points. |
| [`reverse`](https://docs.bitbybit.dev/classes/Bit.Polyline#reverse) | Reverses the order of the points, so the polyline runs the other way. |
| [`roundCorners`](https://docs.bitbybit.dev/classes/Bit.Polyline#roundCorners) | Rounds the corners of a path in space with arcs, drawn as short straight pieces. |
| [`roundCorners2d`](https://docs.bitbybit.dev/classes/Bit.Polyline#roundCorners2d) | Rounds the corners of a flat outline with arcs, drawn as short straight pieces. |
| [`safestFilletRadius`](https://docs.bitbybit.dev/classes/Bit.Polyline#safestFilletRadius) | Finds one fillet radius that fits every corner of the polyline: the smallest of the per-corner maximums under the half-segment rule. |
| [`signedArea2d`](https://docs.bitbybit.dev/classes/Bit.Polyline#signedArea2d) | Measures the area of a flat outline, signed by the way it runs. |
| [`sortSegmentsIntoPolylines`](https://docs.bitbybit.dev/classes/Bit.Polyline#sortSegmentsIntoPolylines) | Joins loose segments into polylines by matching up ends that meet within the tolerance. |
| [`sweepFrames`](https://docs.bitbybit.dev/classes/Bit.Polyline#sweepFrames) | Places a frame at each point of a path, facing along it without twisting. |
| [`sweepPlacements`](https://docs.bitbybit.dev/classes/Bit.Polyline#sweepPlacements) | Builds a matrix per point of a path that places a flat profile there, for sweeping it. |
| [`tangents`](https://docs.bitbybit.dev/classes/Bit.Polyline#tangents) | Finds the direction a path heads in at each of its points. |
| [`transformPolyline`](https://docs.bitbybit.dev/classes/Bit.Polyline#transformPolyline) | Applies a transformation matrix, or a list of them in order, to every point of the polyline. |
| [`twoPolylineIntersection`](https://docs.bitbybit.dev/classes/Bit.Polyline#twoPolylineIntersection) | Finds the points where two polylines cross each other, testing every segment of one against every segment of the other. |

{/* api:polyline:end */}
