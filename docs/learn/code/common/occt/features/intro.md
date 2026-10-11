---
sidebar_position: 1
title: "Features: Holes, Bosses, Pockets and More"
sidebar_label: Features
description: The OCCT features that change a solid where you point - plain, counterbored and countersunk holes on frames, bosses and pockets from a profile, ribs and grooves, push-pull and removing faces - plus drafts and single corners, with an example in Rete, Blockly and TypeScript.
topic: code.occt.features
type: explanation
tags: [code, occt]
---

import BitByBitRenderCanvas from '@site/src/components/BitByBitRenderCanvas';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Features: holes, bosses, pockets and more

A **feature** changes a solid in one place, the way a machinist or a CAD program thinks about it: drill a hole here, raise a boss there, cut a pocket, push a face out. `bitbybit.occt.features` does each in one call, where booleans would need a tool shape built first.

## Holes on frames

`holes`, `counterboredHoles` and `countersunkHoles` drill one hole at each **frame** you give them. A frame's origin is where the hole enters, and its normal points out of the material, so the hole runs against it. Make the frames with the `bitbybit.frame` functions: `grid` and `polar` lay out a pattern on a face in one call.

- `depth` 0 drills through the whole shape; `tipAngle` 118 gives the point of a twist drill, 0 a flat bottom.
- A counterbore sinks a cap screw's head: wider than the hole and shallower than it.
- A countersink sinks a flat head: a cone at the mouth, at `countersinkAngle`.

Here six counterbored holes go through a plate, one at each frame of a two by three grid on its top face:

{/* example:counterbored-plate:start - generated from the example's steps for each editor; edits between these markers are overwritten */}

<Tabs groupId="editor" queryString>
<TabItem value="rete" label="Rete">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"{\"id\":\"rete-v2-json\",\"nodes\":{\"plate\":{\"id\":\"plate\",\"name\":\"bitbybit.occt.shapes.solid.createBox\",\"customName\":\"box\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":true,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"width\":10,\"length\":6,\"height\":1,\"center\":[0,0.5,0],\"originOnCenter\":true},\"inputs\":{},\"position\":[40,40]},\"top\":{\"id\":\"top\",\"name\":\"bitbybit.frame.zx\",\"customName\":\"zx\",\"async\":false,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":true,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"origin\":[0,1,0]},\"inputs\":{},\"position\":[40,520]},\"grid\":{\"id\":\"grid\",\"name\":\"bitbybit.frame.grid\",\"customName\":\"grid\",\"async\":false,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":true,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"countX\":2,\"countY\":3,\"spacingX\":3,\"spacingY\":3,\"centered\":true},\"inputs\":{\"frame\":{\"connections\":[{\"node\":\"top\",\"output\":\"result\",\"data\":{}}]}},\"position\":[460,520]},\"holes\":{\"id\":\"holes\",\"name\":\"bitbybit.occt.features.counterboredHoles\",\"customName\":\"counterbored holes\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"diameter\":0.6,\"depth\":0,\"tipAngle\":0,\"counterboreDiameter\":1.1,\"counterboreDepth\":0.4},\"inputs\":{\"shape\":{\"connections\":[{\"node\":\"plate\",\"output\":\"result\",\"data\":{}}]},\"frames\":{\"connections\":[{\"node\":\"grid\",\"output\":\"result\",\"data\":{}}]}},\"position\":[880,40]}},\"modules\":{}}","type":"rete"}}
  title="A plate with counterbored holes in Rete"
  description="Six counterbored holes drilled through a plate, one at each frame of a grid on its top face."
/>

</TabItem>
<TabItem value="blockly" label="Blockly">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"<xml xmlns=\"https://developers.google.com/blockly/xml\"><block type=\"bitbybit.draw.drawAnyAsyncNoReturn\" x=\"40\" y=\"40\"><value name=\"Entity\"><block type=\"bitbybit.occt.features.counterboredHoles\"><value name=\"Shape\"><block type=\"bitbybit.occt.shapes.solid.createBox\"><value name=\"Width\"><block type=\"math_number\"><field name=\"NUM\">10</field></block></value><value name=\"Length\"><block type=\"math_number\"><field name=\"NUM\">6</field></block></value><value name=\"Height\"><block type=\"math_number\"><field name=\"NUM\">1</field></block></value><value name=\"Center\"><block type=\"bitbybit.point.pointXYZ\"><value name=\"X\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\"><field name=\"NUM\">0.5</field></block></value><value name=\"Z\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value></block></value><value name=\"OriginOnCenter\"><block type=\"logic_boolean\"><field name=\"BOOL\">TRUE</field></block></value></block></value><value name=\"Frames\"><block type=\"bitbybit.frame.grid\"><value name=\"Frame\"><block type=\"bitbybit.frame.zx\"><value name=\"Origin\"><block type=\"bitbybit.point.pointXYZ\"><value name=\"X\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\"><field name=\"NUM\">1</field></block></value><value name=\"Z\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value></block></value></block></value><value name=\"CountX\"><block type=\"math_number\"><field name=\"NUM\">2</field></block></value><value name=\"CountY\"><block type=\"math_number\"><field name=\"NUM\">3</field></block></value><value name=\"SpacingX\"><block type=\"math_number\"><field name=\"NUM\">3</field></block></value><value name=\"SpacingY\"><block type=\"math_number\"><field name=\"NUM\">3</field></block></value><value name=\"Centered\"><block type=\"logic_boolean\"><field name=\"BOOL\">TRUE</field></block></value></block></value><value name=\"Diameter\"><block type=\"math_number\"><field name=\"NUM\">0.6</field></block></value><value name=\"Depth\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"TipAngle\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"CounterboreDiameter\"><block type=\"math_number\"><field name=\"NUM\">1.1</field></block></value><value name=\"CounterboreDepth\"><block type=\"math_number\"><field name=\"NUM\">0.4</field></block></value></block></value></block></xml>","type":"blockly"}}
  title="A plate with counterbored holes in Blockly"
  description="Six counterbored holes drilled through a plate, one at each frame of a grid on its top face."
/>

</TabItem>
<TabItem value="typescript" label="TypeScript">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"const plate = await bitbybit.occt.shapes.solid.createBox({ width: 10, length: 6, height: 1, center: [0, 0.5, 0] });\nconst top = bitbybit.frame.zx({ origin: [0, 1, 0] });\nconst grid = bitbybit.frame.grid({ frame: top, countX: 2, countY: 3, spacingX: 3, spacingY: 3, centered: true });\nconst drilled = await bitbybit.occt.features.counterboredHoles({\n    shape: plate,\n    frames: grid,\n    diameter: 0.6,\n    depth: 0,\n    counterboreDiameter: 1.1,\n    counterboreDepth: 0.4,\n});\n\nawait bitbybit.draw.drawAnyAsync({ entity: drilled });","type":"typescript"}}
  title="A plate with counterbored holes in TypeScript"
  description="Six counterbored holes drilled through a plate, one at each frame of a grid on its top face."
/>

</TabItem>
</Tabs>

{/* example:counterbored-plate:end */}

## Bosses and pockets from a profile

`boss` grows material out of a face, and `pocket` cuts into it, by sweeping a **profile**, a face that lies on one of the solid's faces (`sketchFaceIndex`). How far is set by `extent`: a length, through everything, or up to another face. `taperedBoss` and `taperedPocket` lean the sides by an angle, as a moulded part needs; `revolvedBoss` and `revolvedPocket` turn the profile about an axis, for a collar on a shaft or a groove for a circlip.

`rib` and `groove` add or cut a thin wall that follows a wire, such as a stiffening rib under a shelf.

## Changing faces directly

- `pushPullFaces` moves chosen faces along their normals and stretches the faces around them to follow: raise a top, thicken a wall, lengthen a block. A negative distance moves inward.
- `removeFaces` takes faces away and closes the gap by extending the faces around them: delete a hole, a fillet or a chamfer from an imported part.

Choose the faces by rule with [`bitbybit.occt.select`](../select/intro), so the feature keeps working when the part changes.

## Drafts and corners

`bitbybit.occt.draft.draftAngle` tilts faces so a moulded part can be pulled out of its mould. `bitbybit.occt.corners` rounds or bevels a single corner, chosen by a point near it rather than by edge indexes.

## History

Every feature has a `...WithHistory` twin that also reports what became of each face, so a later step can find the faces a feature made: the wall of a hole, the top of a boss.

## Every feature

{/* api:occt.features:start - generated from the API index; edits between these markers are overwritten */}

| Function | What it does |
|---|---|
| [`boss`](https://docs.bitbybit.dev/classes/Bit.OCCTFeatures#boss) | Grows a boss out of a base by sweeping a profile face that lies on one of its faces along `direction`. |
| [`bossWithHistory`](https://docs.bitbybit.dev/classes/Bit.OCCTFeatures#bossWithHistory) | Grows a boss as `boss` does, and reports two histories: the base's, then the profile's, whose `facesFromEdges` holds the side each profile edge swept and `lastFaces` the far end. |
| [`counterboredHoles`](https://docs.bitbybit.dev/classes/Bit.OCCTFeatures#counterboredHoles) | Drills holes as `holes` does, each with a wider, flat-bottomed counterbore at its mouth that sinks a screw head below the surface. |
| [`counterboredHolesWithHistory`](https://docs.bitbybit.dev/classes/Bit.OCCTFeatures#counterboredHolesWithHistory) | Drills holes as `counterboredHoles` does, and reports a history for the shape, then one per hole in the order of `frames`. |
| [`countersunkHoles`](https://docs.bitbybit.dev/classes/Bit.OCCTFeatures#countersunkHoles) | Drills holes as `holes` does, each with a cone-shaped countersink at its mouth that sinks a flat screw head flush with the surface. |
| [`countersunkHolesWithHistory`](https://docs.bitbybit.dev/classes/Bit.OCCTFeatures#countersunkHolesWithHistory) | Drills holes as `countersunkHoles` does, and reports a history for the shape, then one per hole in the order of `frames`. |
| [`groove`](https://docs.bitbybit.dev/classes/Bit.OCCTFeatures#groove) | Cuts a groove into a base: the part of the base's section on the left of a wire as it runs, seen from the side the frame's normal points to, removed across the plane. |
| [`holes`](https://docs.bitbybit.dev/classes/Bit.OCCTFeatures#holes) | Drills plain holes into a shape, one at each frame: its origin is where the hole enters and its normal points out of the material. |
| [`holesWithHistory`](https://docs.bitbybit.dev/classes/Bit.OCCTFeatures#holesWithHistory) | Drills holes as `holes` does, and reports a history for the shape, then one per hole in the order of `frames`. |
| [`pocket`](https://docs.bitbybit.dev/classes/Bit.OCCTFeatures#pocket) | Cuts a pocket into a base by sweeping a profile face that lies on one of its faces along `direction`, which points into the base. |
| [`pocketWithHistory`](https://docs.bitbybit.dev/classes/Bit.OCCTFeatures#pocketWithHistory) | Cuts a pocket as `pocket` does, and reports two histories: the base's, then the profile's, whose `facesFromEdges` holds the wall each profile edge swept and `lastFaces` the floor. |
| [`pushPullFaces`](https://docs.bitbybit.dev/classes/Bit.OCCTFeatures#pushPullFaces) | Moves faces of a shape along their outward normals and stretches the faces around them to follow, such as raising the top of a block. |
| [`pushPullFacesWithHistory`](https://docs.bitbybit.dev/classes/Bit.OCCTFeatures#pushPullFacesWithHistory) | Moves faces as `pushPullFaces` does, and reports one history, the shape's: each face, edge and vertex lists what it became, so a moved face is followed to where it went, curved ones too. |
| [`removeFaces`](https://docs.bitbybit.dev/classes/Bit.OCCTFeatures#removeFaces) | Removes faces from a solid and closes the gap by extending the faces around them, as when a hole or a rounded edge is deleted from a part. |
| [`removeFacesWithHistory`](https://docs.bitbybit.dev/classes/Bit.OCCTFeatures#removeFacesWithHistory) | Removes faces as `removeFaces` does, and reports one history, the shape's: a removed face's `faces` entry is empty, and each face that stays lists the face it became, grown over the gap. |
| [`revolvedBoss`](https://docs.bitbybit.dev/classes/Bit.OCCTFeatures#revolvedBoss) | Adds a ring to a base by turning a profile face about an axis, such as a collar round a shaft: the profile lies on a face of the base, in a plane through the axis. |
| [`revolvedPocket`](https://docs.bitbybit.dev/classes/Bit.OCCTFeatures#revolvedPocket) | Cuts a groove round a base by turning a profile face about an axis, such as the seat of a circlip on a shaft: the profile lies on a face of the base, in a plane through the axis. |
| [`rib`](https://docs.bitbybit.dev/classes/Bit.OCCTFeatures#rib) | Adds a rib to a base: the region between a wire and the base's faces, on the wire's left as it runs seen from the side the frame's normal points to, filled and thickened across the plane. |
| [`taperedBoss`](https://docs.bitbybit.dev/classes/Bit.OCCTFeatures#taperedBoss) | Grows a boss out of a base as `boss` does, straight out of the sketch face, with its sides leaning by `angle` degrees. |
| [`taperedPocket`](https://docs.bitbybit.dev/classes/Bit.OCCTFeatures#taperedPocket) | Cuts a pocket into a base as `pocket` does, straight in from the sketch face, with its sides leaning by `angle` degrees. |

{/* api:occt.features:end */}

{/* api:occt.draft:start - generated from the API index; edits between these markers are overwritten */}

| Function | What it does |
|---|---|
| [`draftAngle`](https://docs.bitbybit.dev/classes/Bit.OCCTDraft#draftAngle) | Tilts the selected faces of a shape by a draft angle so the part can be pulled out of a mold along `direction`. |
| [`makeDraft`](https://docs.bitbybit.dev/classes/Bit.OCCTDraft#makeDraft) | Grows a tapered skirt from a wire, or the edges of a shape, along a direction: each edge is swept along `direction`, leaning outward or inward by `angle` degrees, until the skirt is `lengthMax` long. |
| [`makeDraftToShape`](https://docs.bitbybit.dev/classes/Bit.OCCTDraft#makeDraftToShape) | Grows a tapered skirt from a wire, or the edges of a shape, along a direction like `makeDraft`, but stops it where it meets `stopShape` instead of at a fixed length. |

{/* api:occt.draft:end */}

{/* api:occt.corners:start - generated from the API index; edits between these markers are overwritten */}

| Function | What it does |
|---|---|
| [`chamferCornerByPoint`](https://docs.bitbybit.dev/classes/Bit.OCCTCorners#chamferCornerByPoint) | Bevels the corner nearest each given point on a shell or solid, touching only that corner. |
| [`classifyCornerByPoint`](https://docs.bitbybit.dev/classes/Bit.OCCTCorners#classifyCornerByPoint) | Looks up the corner nearest each given point and reports what kind it is, without changing the shape. |
| [`cornerByPointReport`](https://docs.bitbybit.dev/classes/Bit.OCCTCorners#cornerByPointReport) | Runs the same corner rounding as `filletCornerByPoint` and returns a report instead of the shape: for each point, which corner was found, how it was classified, what was done and whether it succeeded. |
| [`filletCornerByPoint`](https://docs.bitbybit.dev/classes/Bit.OCCTCorners#filletCornerByPoint) | Rounds the corner nearest each given point on a shell or solid, touching only that corner. |

{/* api:occt.corners:end */}
