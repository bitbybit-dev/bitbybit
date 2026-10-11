---
sidebar_position: 1
title: Frames in Bitbybit
sidebar_label: Frames
description: Frames place things in Bitbybit - a point with three axes that shapes land on, points convert through, and grids, rings and honeycombs lay out by the dozen - with an example in Rete, Blockly and TypeScript and a table of every function.
topic: code.base.frame
type: explanation
tags: [code, frame]
---

import BitByBitRenderCanvas from '@site/src/components/BitByBitRenderCanvas';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Frames

A **frame** is a point with three axes at right angles. It answers two questions at once: where something sits, and which way it faces. `bitbybit.frame` builds frames, moves and turns them, lays them out in patterns, and converts points and vectors between a frame and the world.

A frame is plain data, written as three values:

- `origin`: the point the axes start from;
- `normal`: where its Z axis points, the way the frame faces;
- `direction`: where its X axis points.

The Y axis follows from those two. Every function returns a new frame and never changes the one it was given, so a frame can be passed around freely.

## Where frames are used

Frames are how the rest of the API places things:

- `bitbybit.occt.transforms.placeOnFrames` puts a copy of a shape on every frame of a list, and `orient` moves a shape from one frame to another. See [Transforms](../../occt/transforms/intro).
- `bitbybit.occt.features.holes` and its counterbored and countersunk forms drill one hole at each frame: the origin is where the hole enters and the normal points out of the material. See [Features](../../occt/features/intro).
- `bitbybit.occt.operations.sliceByFrames` cuts a solid with the plane of each frame. See [Sections and slices](../../occt/operations/sections-and-slices).
- `bitbybit.occt.analysis.measure.boundingBoxInFrame` measures a shape in a frame of your own.

A shape placed on a frame is moved so that its own X, Y and Z axes lie along the frame's direction, Y axis and normal. A cylinder built along Z therefore stands along each frame's normal.

## Building a frame

- `create` takes all three values. The direction only has to be roughly right: it is turned square to the normal, and both are scaled to length 1.
- `fromPointAndNormal` takes a point and a normal and picks the X axis by a fixed rule, for when only the facing matters.
- `fromThreePoints` takes where the frame sits, a point its X axis runs toward and a point on the side its Y axis points to.
- `bestFit` fits a frame to points that lie on or near one plane.
- `world`, `xy`, `yz` and `zx` give the frames of the world planes. With Y up, `zx` is the ground.
- `fromMatrix` reads the frame a transformation puts the world frame on, and `toMatrix` goes the other way.

## Patterns of frames

`grid`, `hexGrid` and `polar` lay out frames in a frame's plane: a rectangular grid, a honeycomb with one frame at each hexagon's centre, and a ring around the frame's normal. The plane can be tilted any way, and the frames follow it.

Here a frame is tilted off the ground, a grid of frames is laid out in its plane, and one post is placed on every frame. The post is a cylinder built along Z, so each one stands along the tilted normal:

{/* example:posts-on-a-tilted-grid:start - generated from the example's steps for each editor; edits between these markers are overwritten */}

<Tabs groupId="editor" queryString>
<TabItem value="rete" label="Rete">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"{\"id\":\"rete-v2-json\",\"nodes\":{\"tilted\":{\"id\":\"tilted\",\"name\":\"bitbybit.frame.create\",\"customName\":\"frame\",\"async\":false,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":true,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"origin\":[0,0,0],\"normal\":[0,1,-0.6],\"direction\":[1,0,0]},\"inputs\":{},\"position\":[40,40]},\"grid\":{\"id\":\"grid\",\"name\":\"bitbybit.frame.grid\",\"customName\":\"grid\",\"async\":false,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":true,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"countX\":6,\"countY\":4,\"spacingX\":1.5,\"spacingY\":1.5,\"centered\":true},\"inputs\":{\"frame\":{\"connections\":[{\"node\":\"tilted\",\"output\":\"result\",\"data\":{}}]}},\"position\":[460,40]},\"post\":{\"id\":\"post\",\"name\":\"bitbybit.occt.shapes.solid.createCylinder\",\"customName\":\"cylinder\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":true,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"radius\":0.25,\"height\":1.5,\"center\":[0,0,0],\"direction\":[0,0,1],\"angle\":360,\"originOnCenter\":false},\"inputs\":{},\"position\":[460,520]},\"place\":{\"id\":\"place\",\"name\":\"bitbybit.occt.transforms.placeOnFrames\",\"customName\":\"place on frames\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false}},\"inputs\":{\"shape\":{\"connections\":[{\"node\":\"post\",\"output\":\"result\",\"data\":{}}]},\"frames\":{\"connections\":[{\"node\":\"grid\",\"output\":\"result\",\"data\":{}}]}},\"position\":[880,40]}},\"modules\":{}}","type":"rete"}}
  title="Posts on a grid of tilted frames in Rete"
  description="A frame tilted off the ground, a grid of frames laid out in its plane, and one post placed on every frame so that each stands along the tilted normal."
/>

</TabItem>
<TabItem value="blockly" label="Blockly">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"<xml xmlns=\"https://developers.google.com/blockly/xml\"><block type=\"bitbybit.draw.drawAnyAsyncNoReturn\" x=\"40\" y=\"40\"><value name=\"Entity\"><block type=\"bitbybit.occt.transforms.placeOnFrames\"><value name=\"Shape\"><block type=\"bitbybit.occt.shapes.solid.createCylinder\"><value name=\"Radius\"><block type=\"math_number\"><field name=\"NUM\">0.25</field></block></value><value name=\"Height\"><block type=\"math_number\"><field name=\"NUM\">1.5</field></block></value><value name=\"Center\"><block type=\"bitbybit.point.pointXYZ\"><value name=\"X\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Z\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value></block></value><value name=\"Direction\"><block type=\"bitbybit.vector.vectorXYZ\"><value name=\"X\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Z\"><block type=\"math_number\"><field name=\"NUM\">1</field></block></value></block></value><value name=\"Angle\"><block type=\"math_number\"><field name=\"NUM\">360</field></block></value><value name=\"OriginOnCenter\"><block type=\"logic_boolean\"><field name=\"BOOL\">FALSE</field></block></value></block></value><value name=\"Frames\"><block type=\"bitbybit.frame.grid\"><value name=\"Frame\"><block type=\"bitbybit.frame.create\"><value name=\"Origin\"><block type=\"bitbybit.point.pointXYZ\"><value name=\"X\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Z\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value></block></value><value name=\"Normal\"><block type=\"bitbybit.vector.vectorXYZ\"><value name=\"X\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\"><field name=\"NUM\">1</field></block></value><value name=\"Z\"><block type=\"math_number\"><field name=\"NUM\">-0.6</field></block></value></block></value><value name=\"Direction\"><block type=\"bitbybit.vector.vectorXYZ\"><value name=\"X\"><block type=\"math_number\"><field name=\"NUM\">1</field></block></value><value name=\"Y\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Z\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value></block></value></block></value><value name=\"CountX\"><block type=\"math_number\"><field name=\"NUM\">6</field></block></value><value name=\"CountY\"><block type=\"math_number\"><field name=\"NUM\">4</field></block></value><value name=\"SpacingX\"><block type=\"math_number\"><field name=\"NUM\">1.5</field></block></value><value name=\"SpacingY\"><block type=\"math_number\"><field name=\"NUM\">1.5</field></block></value><value name=\"Centered\"><block type=\"logic_boolean\"><field name=\"BOOL\">TRUE</field></block></value></block></value></block></value></block></xml>","type":"blockly"}}
  title="Posts on a grid of tilted frames in Blockly"
  description="A frame tilted off the ground, a grid of frames laid out in its plane, and one post placed on every frame so that each stands along the tilted normal."
/>

</TabItem>
<TabItem value="typescript" label="TypeScript">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"const tilted = bitbybit.frame.create({ origin: [0, 0, 0], normal: [0, 1, -0.6], direction: [1, 0, 0] });\nconst grid = bitbybit.frame.grid({ frame: tilted, countX: 6, countY: 4, spacingX: 1.5, spacingY: 1.5, centered: true });\nconst post = await bitbybit.occt.shapes.solid.createCylinder({ radius: 0.25, height: 1.5, center: [0, 0, 0], direction: [0, 0, 1] });\nconst posts = await bitbybit.occt.transforms.placeOnFrames({ shape: post, frames: grid });\n\nawait bitbybit.draw.drawAnyAsync({ entity: posts });","type":"typescript"}}
  title="Posts on a grid of tilted frames in TypeScript"
  description="A frame tilted off the ground, a grid of frames laid out in its plane, and one post placed on every frame so that each stands along the tilted normal."
/>

</TabItem>
</Tabs>

{/* example:posts-on-a-tilted-grid:end */}

## Frames within frames

A frame can be described in another frame's coordinates. `frameToWorld` places such a frame in the world, and `frameToLocal` describes a world frame in another frame's terms. The same pairs exist for points (`pointToWorld`, `pointToLocal`) and for vectors (`vectorToWorld`, `vectorToLocal`), each with a form for lists.

This is how a part is laid out once, around its own origin, and placed anywhere later: draw its holes or its outline in local coordinates, then convert them through the frame where the part goes. `matrixFromTo` gives the transformation that carries anything placed on one frame onto another.

## Moving and turning frames

`translate` moves a frame by a vector in world coordinates, and `offset` along its own normal. `rotate` turns it about one of its own axes, and `flip` turns it over so its normal points the other way. Each has a form for lists of frames (`translateFrames`, `offsetFrames`, `rotateFrames`, `flipFrames`).

`origin`, `normal`, `direction` and `yDirection` read a frame's parts back.

## Every function

{/* api:frame:start - generated from the API index; edits between these markers are overwritten */}

| Function | What it does |
|---|---|
| [`bestFit`](https://docs.bitbybit.dev/classes/Bit.Frame#bestFit) | Fits a frame to points that lie on or near one plane. |
| [`create`](https://docs.bitbybit.dev/classes/Bit.Frame#create) | Builds a frame from where it sits, where its Z axis points and roughly where its X axis points. |
| [`direction`](https://docs.bitbybit.dev/classes/Bit.Frame#direction) | Reads where a frame's X axis points, as a vector of length 1 square to the normal. |
| [`flip`](https://docs.bitbybit.dev/classes/Bit.Frame#flip) | Turns a frame over: its normal points the other way and its Y axis with it, its origin and X axis stay. |
| [`flipFrames`](https://docs.bitbybit.dev/classes/Bit.Frame#flipFrames) | Turns each frame over, as `flip` turns one: its normal and Y axis point the other way, its origin and X axis stay. |
| [`framesToLocal`](https://docs.bitbybit.dev/classes/Bit.Frame#framesToLocal) | Describes frames given in world coordinates in one parent frame's coordinates, the reverse of `framesToWorld`, as `frameToLocal` describes one. |
| [`framesToWorld`](https://docs.bitbybit.dev/classes/Bit.Frame#framesToWorld) | Places frames given in one parent frame's coordinates into the world, as `frameToWorld` places one: every child sits on `parent` as it would sit on the world. |
| [`frameToLocal`](https://docs.bitbybit.dev/classes/Bit.Frame#frameToLocal) | Describes a frame given in world coordinates in another frame's coordinates, the reverse of `frameToWorld`. |
| [`frameToWorld`](https://docs.bitbybit.dev/classes/Bit.Frame#frameToWorld) | Places a frame given in another frame's coordinates into the world: a frame within a frame. |
| [`fromMatrix`](https://docs.bitbybit.dev/classes/Bit.Frame#fromMatrix) | Reads the frame a transformation puts the world frame on: where it moves the world origin and where it turns the world X and Z axes. |
| [`fromPointAndNormal`](https://docs.bitbybit.dev/classes/Bit.Frame#fromPointAndNormal) | Builds a frame from a point and a normal, choosing its X axis by a fixed rule. |
| [`fromThreePoints`](https://docs.bitbybit.dev/classes/Bit.Frame#fromThreePoints) | Builds a frame from three points: where it sits, a point its X axis runs toward and a point on the side its Y axis points to. |
| [`grid`](https://docs.bitbybit.dev/classes/Bit.Frame#grid) | Lays out a rectangular grid of frames in a frame's plane, each turned the same way as that frame. |
| [`hexGrid`](https://docs.bitbybit.dev/classes/Bit.Frame#hexGrid) | Lays out a honeycomb of frames in a frame's plane, one at each hexagon's center, turned as that frame is. |
| [`matrixFromTo`](https://docs.bitbybit.dev/classes/Bit.Frame#matrixFromTo) | Gives the transformation that carries anything placed on one frame onto another, turning it the same way. |
| [`normal`](https://docs.bitbybit.dev/classes/Bit.Frame#normal) | Reads where a frame's Z axis points, as a vector of length 1. |
| [`offset`](https://docs.bitbybit.dev/classes/Bit.Frame#offset) | Moves a frame along its own normal, keeping the directions of its axes. |
| [`offsetFrames`](https://docs.bitbybit.dev/classes/Bit.Frame#offsetFrames) | Moves each frame along its own normal by the same distance, as `offset` moves one; their axes keep their directions. |
| [`origin`](https://docs.bitbybit.dev/classes/Bit.Frame#origin) | Reads where a frame sits: the point its three axes start from. |
| [`pointsToLocal`](https://docs.bitbybit.dev/classes/Bit.Frame#pointsToLocal) | Converts points given in world coordinates into a frame's coordinates, as `pointToLocal` does for one. |
| [`pointsToWorld`](https://docs.bitbybit.dev/classes/Bit.Frame#pointsToWorld) | Converts points given in a frame's coordinates into world coordinates, as `pointToWorld` does for one. |
| [`pointToLocal`](https://docs.bitbybit.dev/classes/Bit.Frame#pointToLocal) | Converts a point given in world coordinates into a frame's coordinates, the reverse of `pointToWorld`. |
| [`pointToWorld`](https://docs.bitbybit.dev/classes/Bit.Frame#pointToWorld) | Converts a point given in a frame's coordinates into world coordinates. |
| [`polar`](https://docs.bitbybit.dev/classes/Bit.Frame#polar) | Lays out a ring of frames around a frame's normal, in its plane. |
| [`rotate`](https://docs.bitbybit.dev/classes/Bit.Frame#rotate) | Turns a frame about one of its own axes, through its origin. |
| [`rotateFrames`](https://docs.bitbybit.dev/classes/Bit.Frame#rotateFrames) | Turns each frame about one of its own axes, through its own origin, as `rotate` turns one. |
| [`toMatrix`](https://docs.bitbybit.dev/classes/Bit.Frame#toMatrix) | Gives the transformation that moves anything from the world frame onto a frame. |
| [`translate`](https://docs.bitbybit.dev/classes/Bit.Frame#translate) | Moves a frame by a vector in world coordinates, keeping the directions of its axes. |
| [`translateFrames`](https://docs.bitbybit.dev/classes/Bit.Frame#translateFrames) | Moves frames by one vector in world coordinates, as `translate` moves one; their axes keep their directions. |
| [`vectorToLocal`](https://docs.bitbybit.dev/classes/Bit.Frame#vectorToLocal) | Turns a vector given along the world axes into one along a frame's axes, the reverse of `vectorToWorld`. |
| [`vectorToWorld`](https://docs.bitbybit.dev/classes/Bit.Frame#vectorToWorld) | Turns a vector given along a frame's axes into one along the world axes; the frame's origin plays no part. |
| [`world`](https://docs.bitbybit.dev/classes/Bit.Frame#world) | Gives the world frame: its origin at zero, its X, Y and Z axes along the world's. |
| [`xy`](https://docs.bitbybit.dev/classes/Bit.Frame#xy) | Builds a frame lying in the XY plane: its X axis along the world X, its Y axis along the world Y and its normal along the world Z. |
| [`yDirection`](https://docs.bitbybit.dev/classes/Bit.Frame#yDirection) | Reads where a frame's Y axis points: the normal crossed with the direction, as a vector of length 1. |
| [`yz`](https://docs.bitbybit.dev/classes/Bit.Frame#yz) | Builds a frame lying in the YZ plane: its X axis along the world Y, its Y axis along the world Z and its normal along the world X. |
| [`zx`](https://docs.bitbybit.dev/classes/Bit.Frame#zx) | Builds a frame lying in the ZX plane, the ground when Y points up: its X axis along the world Z, its Y axis along the world X and its normal along the world Y. |

{/* api:frame:end */}
