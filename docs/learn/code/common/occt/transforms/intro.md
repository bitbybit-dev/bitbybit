---
sidebar_position: 1
title: Moving, Turning and Placing Shapes
sidebar_label: Transforms
description: The OCCT transforms - moving, rotating, scaling and mirroring shapes, aligning one frame onto another, and placing many copies on frames that share one shape's geometry - with an example in Rete, Blockly and TypeScript.
topic: code.occt.transforms
type: explanation
tags: [code, occt]
---

import BitByBitRenderCanvas from '@site/src/components/BitByBitRenderCanvas';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Moving, turning and placing shapes

`bitbybit.occt.transforms` moves shapes without changing their form. Like every operation, a transform returns a new shape and leaves the one you gave it where it was.

## The everyday moves

- **Move:** `translate` by a vector, in model units.
- **Turn:** `rotate` about an axis through the origin, or `rotateAroundCenter` about an axis through any point, by an angle in degrees with the right-hand rule.
- **Resize:** `scale` uniformly about the origin, `scaleFromCenter` about a point, or `scale3d` by a different factor along X, Y and Z.
- **Mirror:** `mirrorAlongNormal` across a plane, the usual mirror image a symmetric part needs; `mirror` across a line and `mirrorAboutPoint` through a point.
- **All at once:** `transform` scales, turns and moves in one call, in that order.

Most of them have a `...Shapes` twin that moves several shapes, each by its own amount.

## Frames: put this here, facing that way

A **frame** is a point with three axes: where something sits and which way it faces. The `bitbybit.frame` functions make them: one frame (`create`, `zx` for the ground), or many in a pattern (`grid`, `polar` for a ring, `hexGrid`).

Frames let you place a shape without working out angles:

- `orient` moves a shape from one frame onto another in a single rigid motion;
- `align` and `alignNormAndAxis` do the same from a point and directions on the shape;
- `placeOnFrames` puts a copy of the shape on every frame of a list.

`placeOnFrames` keeps one shape's geometry and only records where each copy sits, so a hundred bolts cost little more than one, and an export writes the bolt once. Here one block is placed on twelve frames of a ring on the ground:

{/* example:ring-of-blocks:start - generated from the example's steps for each editor; edits between these markers are overwritten */}

<Tabs groupId="editor" queryString>
<TabItem value="rete" label="Rete">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"{\"id\":\"rete-v2-json\",\"nodes\":{\"block\":{\"id\":\"block\",\"name\":\"bitbybit.occt.shapes.solid.createBox\",\"customName\":\"box\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":true,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"width\":1,\"length\":1,\"height\":2.5,\"center\":[0,0,0],\"originOnCenter\":true},\"inputs\":{},\"position\":[40,40]},\"ground\":{\"id\":\"ground\",\"name\":\"bitbybit.frame.zx\",\"customName\":\"zx\",\"async\":false,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":true,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"origin\":[0,0,0]},\"inputs\":{},\"position\":[40,460]},\"ring\":{\"id\":\"ring\",\"name\":\"bitbybit.frame.polar\",\"customName\":\"polar\",\"async\":false,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":true,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"count\":12,\"radius\":6,\"angle\":360,\"startAngle\":0,\"rotate\":true},\"inputs\":{\"frame\":{\"connections\":[{\"node\":\"ground\",\"output\":\"result\",\"data\":{}}]}},\"position\":[460,460]},\"place\":{\"id\":\"place\",\"name\":\"bitbybit.occt.transforms.placeOnFrames\",\"customName\":\"place on frames\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false}},\"inputs\":{\"shape\":{\"connections\":[{\"node\":\"block\",\"output\":\"result\",\"data\":{}}]},\"frames\":{\"connections\":[{\"node\":\"ring\",\"output\":\"result\",\"data\":{}}]}},\"position\":[880,40]}},\"modules\":{}}","type":"rete"}}
  title="A block placed on a ring of frames in Rete"
  description="One block, placed on twelve frames laid out in a ring on the ground, turning with the ring."
/>

</TabItem>
<TabItem value="blockly" label="Blockly">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"<xml xmlns=\"https://developers.google.com/blockly/xml\"><block type=\"bitbybit.draw.drawAnyAsyncNoReturn\" x=\"40\" y=\"40\"><value name=\"Entity\"><block type=\"bitbybit.occt.transforms.placeOnFrames\"><value name=\"Shape\"><block type=\"bitbybit.occt.shapes.solid.createBox\"><value name=\"Width\"><block type=\"math_number\"><field name=\"NUM\">1</field></block></value><value name=\"Length\"><block type=\"math_number\"><field name=\"NUM\">1</field></block></value><value name=\"Height\"><block type=\"math_number\"><field name=\"NUM\">2.5</field></block></value><value name=\"Center\"><block type=\"bitbybit.point.pointXYZ\"><value name=\"X\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Z\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value></block></value><value name=\"OriginOnCenter\"><block type=\"logic_boolean\"><field name=\"BOOL\">TRUE</field></block></value></block></value><value name=\"Frames\"><block type=\"bitbybit.frame.polar\"><value name=\"Frame\"><block type=\"bitbybit.frame.zx\"><value name=\"Origin\"><block type=\"bitbybit.point.pointXYZ\"><value name=\"X\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Z\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value></block></value></block></value><value name=\"Count\"><block type=\"math_number\"><field name=\"NUM\">12</field></block></value><value name=\"Radius\"><block type=\"math_number\"><field name=\"NUM\">6</field></block></value><value name=\"Angle\"><block type=\"math_number\"><field name=\"NUM\">360</field></block></value><value name=\"StartAngle\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Rotate\"><block type=\"logic_boolean\"><field name=\"BOOL\">TRUE</field></block></value></block></value></block></value></block></xml>","type":"blockly"}}
  title="A block placed on a ring of frames in Blockly"
  description="One block, placed on twelve frames laid out in a ring on the ground, turning with the ring."
/>

</TabItem>
<TabItem value="typescript" label="TypeScript">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"const block = await bitbybit.occt.shapes.solid.createBox({ width: 1, length: 1, height: 2.5, center: [0, 0, 0] });\nconst ground = bitbybit.frame.zx({ origin: [0, 0, 0] });\nconst ring = bitbybit.frame.polar({ frame: ground, count: 12, radius: 6 });\nconst placed = await bitbybit.occt.transforms.placeOnFrames({ shape: block, frames: ring });\n\nawait bitbybit.draw.drawAnyAsync({ entity: placed });","type":"typescript"}}
  title="A block placed on a ring of frames in TypeScript"
  description="One block, placed on twelve frames laid out in a ring on the ground, turning with the ring."
/>

</TabItem>
</Tabs>

{/* example:ring-of-blocks:end */}

The frames of a `polar` ring turn with the ring, so each copy faces outwards; set `rotate` off and every copy keeps the same heading.

## Matrices

For moves built up from many steps, the `...ToMatrix` functions turn each move into a 4x4 matrix, `multiplyTransforms` chains them into one, and `transformByMatrix` applies the result. `getShapeTransform` reads the placement a shape carries.

## Every transform

{/* api:occt.transforms:start - generated from the API index; edits between these markers are overwritten */}

| Function | What it does |
|---|---|
| [`align`](https://docs.bitbybit.dev/classes/Bit.OCCTTransforms#align) | Moves a shape so that one point and direction on it land on another point and direction: the frame `fromOrigin` with `fromDirection` is carried onto `toOrigin` with `toDirection`. |
| [`alignAndTranslate`](https://docs.bitbybit.dev/classes/Bit.OCCTTransforms#alignAndTranslate) | Turns a shape so that its Y axis points along `direction`, then moves it to `center`. |
| [`alignAndTranslateShapes`](https://docs.bitbybit.dev/classes/Bit.OCCTTransforms#alignAndTranslateShapes) | Applies `alignAndTranslate` to several shapes, each with its own direction and center. |
| [`alignNormAndAxis`](https://docs.bitbybit.dev/classes/Bit.OCCTTransforms#alignNormAndAxis) | Moves a shape so that a full frame on it lands on another frame: a point, its normal and one axis in the plane of that normal are carried onto their targets. |
| [`alignShapes`](https://docs.bitbybit.dev/classes/Bit.OCCTTransforms#alignShapes) | Applies `align` to several shapes, each with its own from and to frames. |
| [`composeTransform`](https://docs.bitbybit.dev/classes/Bit.OCCTTransforms#composeTransform) | Builds one matrix from a translation, three rotation angles in degrees about X, Y and Z, and a uniform scale. |
| [`getShapeTransform`](https://docs.bitbybit.dev/classes/Bit.OCCTTransforms#getShapeTransform) | Reads the placement a shape carries, the transform stored on it rather than baked into its geometry, as a matrix plus its translation, rotation quaternion and uniform scale. |
| [`identityTransform`](https://docs.bitbybit.dev/classes/Bit.OCCTTransforms#identityTransform) | Builds the identity matrix, the transform that changes nothing, as a starting point for composing others. |
| [`invertTransform`](https://docs.bitbybit.dev/classes/Bit.OCCTTransforms#invertTransform) | Inverts a matrix, giving the transform that undoes it: applying a matrix and then its inverse puts a shape back where it was. |
| [`mirror`](https://docs.bitbybit.dev/classes/Bit.OCCTTransforms#mirror) | Mirrors a shape across a line: the axis through `origin` along `direction`. |
| [`mirrorAboutPoint`](https://docs.bitbybit.dev/classes/Bit.OCCTTransforms#mirrorAboutPoint) | Mirrors a shape through a point: every point of the shape lands as far beyond the point as it was before it, on the opposite side. |
| [`mirrorAlongNormal`](https://docs.bitbybit.dev/classes/Bit.OCCTTransforms#mirrorAlongNormal) | Mirrors a shape across a plane given by a point on it and its normal. |
| [`mirrorAlongNormalShapes`](https://docs.bitbybit.dev/classes/Bit.OCCTTransforms#mirrorAlongNormalShapes) | Applies `mirrorAlongNormal` to several shapes, each across its own plane. |
| [`mirrorAxisToMatrix`](https://docs.bitbybit.dev/classes/Bit.OCCTTransforms#mirrorAxisToMatrix) | Builds the matrix of a mirror across a line, the transform `mirror` applies: the axis through `origin` along `direction`. |
| [`mirrorPlaneToMatrix`](https://docs.bitbybit.dev/classes/Bit.OCCTTransforms#mirrorPlaneToMatrix) | Builds the matrix of a mirror across a plane, the transform `mirrorAlongNormal` applies: the plane through `origin` with the given normal. |
| [`mirrorPointToMatrix`](https://docs.bitbybit.dev/classes/Bit.OCCTTransforms#mirrorPointToMatrix) | Builds the matrix of a mirror through a point, the transform `mirrorAboutPoint` applies. |
| [`mirrorShapes`](https://docs.bitbybit.dev/classes/Bit.OCCTTransforms#mirrorShapes) | Applies `mirror` to several shapes, each across its own axis. |
| [`multiplyTransforms`](https://docs.bitbybit.dev/classes/Bit.OCCTTransforms#multiplyTransforms) | Folds a list of matrices into one, applied first to last, so a chain of moves becomes a single matrix. |
| [`orient`](https://docs.bitbybit.dev/classes/Bit.OCCTTransforms#orient) | Moves a shape from one frame onto another in a single rigid motion: whatever sat on `from` sits the same way on `to`. |
| [`placeByMatrices`](https://docs.bitbybit.dev/classes/Bit.OCCTTransforms#placeByMatrices) | Places a copy of a shape by every placement, a matrix or a list of them, in one compound whose copies share the shape's geometry. |
| [`placeOnFrames`](https://docs.bitbybit.dev/classes/Bit.OCCTTransforms#placeOnFrames) | Places a copy of a shape on every frame, as `orient` would move it from `from`, all in one compound whose copies share the shape's geometry: an array of hundreds costs one shape's worth of geometry, and an export writes it once. |
| [`quaternionToMatrix`](https://docs.bitbybit.dev/classes/Bit.OCCTTransforms#quaternionToMatrix) | Builds the rotation matrix of a quaternion given as `[x, y, z, w]`. |
| [`rotate`](https://docs.bitbybit.dev/classes/Bit.OCCTTransforms#rotate) | Rotates a shape about an axis that passes through the origin, by an angle in degrees. |
| [`rotateAroundCenter`](https://docs.bitbybit.dev/classes/Bit.OCCTTransforms#rotateAroundCenter) | Rotates a shape about an axis that passes through a chosen point, by an angle in degrees. |
| [`rotateAroundCenterShapes`](https://docs.bitbybit.dev/classes/Bit.OCCTTransforms#rotateAroundCenterShapes) | Applies `rotateAroundCenter` to several shapes, each with its own angle in degrees, center and axis. |
| [`rotateByQuaternion`](https://docs.bitbybit.dev/classes/Bit.OCCTTransforms#rotateByQuaternion) | Rotates a shape about the origin by a quaternion given as `[x, y, z, w]`. |
| [`rotateShapes`](https://docs.bitbybit.dev/classes/Bit.OCCTTransforms#rotateShapes) | Applies `rotate` to several shapes, each about its own axis through the origin and by its own angle in degrees. |
| [`rotationAxisAngleToMatrix`](https://docs.bitbybit.dev/classes/Bit.OCCTTransforms#rotationAxisAngleToMatrix) | Builds the matrix of a rotation by an angle in degrees about an axis, through the origin or through an optional center point. |
| [`scale`](https://docs.bitbybit.dev/classes/Bit.OCCTTransforms#scale) | Scales a shape uniformly about the origin by a factor. |
| [`scale3d`](https://docs.bitbybit.dev/classes/Bit.OCCTTransforms#scale3d) | Scales a shape by a separate factor along X, Y and Z, about a chosen center point. |
| [`scale3dShapes`](https://docs.bitbybit.dev/classes/Bit.OCCTTransforms#scale3dShapes) | Applies `scale3d` to several shapes, each with its own three factors and center. |
| [`scaleFromCenter`](https://docs.bitbybit.dev/classes/Bit.OCCTTransforms#scaleFromCenter) | Scales a shape uniformly about a chosen point by a factor. |
| [`scaleShapes`](https://docs.bitbybit.dev/classes/Bit.OCCTTransforms#scaleShapes) | Applies `scale` to several shapes, each uniformly about the origin by its own factor. |
| [`scaleUniformToMatrix`](https://docs.bitbybit.dev/classes/Bit.OCCTTransforms#scaleUniformToMatrix) | Builds the matrix of a uniform scale by a factor about the origin or an optional center point. |
| [`transform`](https://docs.bitbybit.dev/classes/Bit.OCCTTransforms#transform) | Scales, rotates and moves a shape in one go: first the scale about the origin, then the rotation about an axis through the origin, then the translation. |
| [`transformByMatrix`](https://docs.bitbybit.dev/classes/Bit.OCCTTransforms#transformByMatrix) | Applies a 4x4 matrix, or a list of matrices applied first to last, to a shape. |
| [`transformShapes`](https://docs.bitbybit.dev/classes/Bit.OCCTTransforms#transformShapes) | Applies `transform` to several shapes, each with its own translation, rotation axis, angle and scale factor. |
| [`transformShapesByMatrix`](https://docs.bitbybit.dev/classes/Bit.OCCTTransforms#transformShapesByMatrix) | Applies the same 4x4 matrix, or list of matrices applied first to last, to several shapes, as `transformByMatrix` does for one. |
| [`translate`](https://docs.bitbybit.dev/classes/Bit.OCCTTransforms#translate) | Moves a shape by a vector, in model units. |
| [`translateShapes`](https://docs.bitbybit.dev/classes/Bit.OCCTTransforms#translateShapes) | Applies `translate` to several shapes, each by its own vector. |
| [`translationToMatrix`](https://docs.bitbybit.dev/classes/Bit.OCCTTransforms#translationToMatrix) | Builds the matrix of a move by a vector, in model units. |

{/* api:occt.transforms:end */}
