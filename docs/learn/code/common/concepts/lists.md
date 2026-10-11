---
sidebar_position: 4
title: Lists in Every Editor
sidebar_label: Lists
description: Points, shapes and numbers often come as lists. How a function takes a whole list as one value, how each editor repeats a function for every item, and where to read more in each editor.
topic: code.concepts.lists
type: explanation
tags: [code, lists, rete, blockly, typescript]
---

import BitByBitRenderCanvas from '@site/src/components/BitByBitRenderCanvas';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Lists in every editor

Much of what a script handles comes in lists: the points of a curve, the faces of a solid, the copies of a part. Two different things can happen to a list, and it helps to tell them apart.

## A list as one value

Some functions want a whole list. `bitbybit.occt.shapes.wire.interpolatePoints` takes a list of points and makes one curve through all of them; `bitbybit.occt.booleans.difference` takes one shape and a list of shapes to cut from it. The list travels as a single value, exactly like a number would.

Here `bitbybit.point.spiral` makes a list of two hundred points, and one curve is made through them:

{/* example:points-into-a-curve:start - generated from the example's steps for each editor; edits between these markers are overwritten */}

<Tabs groupId="editor" queryString>
<TabItem value="rete" label="Rete">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"{\"id\":\"rete-v2-json\",\"nodes\":{\"spiral\":{\"id\":\"spiral\",\"name\":\"bitbybit.point.spiral\",\"customName\":\"spiral\",\"async\":false,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"phi\":0.9,\"numberPoints\":200,\"widening\":3,\"radius\":6,\"factor\":1},\"inputs\":{},\"position\":[40,40]},\"curve\":{\"id\":\"curve\",\"name\":\"bitbybit.occt.shapes.wire.interpolatePoints\",\"customName\":\"interpolate points\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"periodic\":false,\"tolerance\":1e-7,\"parametrization\":\"chordLength\"},\"inputs\":{\"points\":{\"connections\":[{\"node\":\"spiral\",\"output\":\"result\",\"data\":{}}]}},\"position\":[460,40]}},\"modules\":{}}","type":"rete"}}
  title="A spiral of points, one curve through them in Rete"
  description="Two hundred points on a spiral, and the smooth curve that passes through all of them."
/>

</TabItem>
<TabItem value="blockly" label="Blockly">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"<xml xmlns=\"https://developers.google.com/blockly/xml\"><variables><variable id=\"points\">points</variable></variables><block type=\"variables_set\" x=\"40\" y=\"40\"><field name=\"VAR\" id=\"points\">points</field><value name=\"VALUE\"><block type=\"bitbybit.point.spiral\"><value name=\"Phi\"><block type=\"math_number\"><field name=\"NUM\">0.9</field></block></value><value name=\"NumberPoints\"><block type=\"math_number\"><field name=\"NUM\">200</field></block></value><value name=\"Widening\"><block type=\"math_number\"><field name=\"NUM\">3</field></block></value><value name=\"Radius\"><block type=\"math_number\"><field name=\"NUM\">6</field></block></value><value name=\"Factor\"><block type=\"math_number\"><field name=\"NUM\">1</field></block></value></block></value><next><block type=\"bitbybit.draw.drawAnyAsyncNoReturn\"><value name=\"Entity\"><block type=\"variables_get\"><field name=\"VAR\" id=\"points\">points</field></block></value><next><block type=\"bitbybit.draw.drawAnyAsyncNoReturn\"><value name=\"Entity\"><block type=\"bitbybit.occt.shapes.wire.interpolatePoints\"><value name=\"Points\"><block type=\"variables_get\"><field name=\"VAR\" id=\"points\">points</field></block></value><value name=\"Periodic\"><block type=\"logic_boolean\"><field name=\"BOOL\">FALSE</field></block></value><value name=\"Tolerance\"><block type=\"math_number\"><field name=\"NUM\">1e-7</field></block></value><value name=\"Parametrization\"><block type=\"bitbybit.occt.enums.bSplineParametrizationEnum\"><field name=\"bitbybit.occt.enums.bSplineParametrizationEnum\">'chordLength'</field></block></value></block></value></block></next></block></next></block></xml>","type":"blockly"}}
  title="A spiral of points, one curve through them in Blockly"
  description="Two hundred points on a spiral, and the smooth curve that passes through all of them."
/>

</TabItem>
<TabItem value="typescript" label="TypeScript">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"const points = bitbybit.point.spiral({ numberPoints: 200, radius: 6 });\nconst curve = await bitbybit.occt.shapes.wire.interpolatePoints({ points });\n\nawait bitbybit.draw.drawAnyAsync({ entity: points });\nawait bitbybit.draw.drawAnyAsync({ entity: curve });","type":"typescript"}}
  title="A spiral of points, one curve through them in TypeScript"
  description="Two hundred points on a spiral, and the smooth curve that passes through all of them."
/>

</TabItem>
</Tabs>

{/* example:points-into-a-curve:end */}

Drawing a list of points draws every point; drawing a list of shapes draws every shape.

## Once per item

Other times you want a function to run once for each item: a sphere at every point, a fillet on every part. Each editor says that in its own way:

- **TypeScript** uses the language: `points.map(...)` or a `for` loop, with `await Promise.all(...)` when the function is a kernel call.
- **Blockly** has loops: the repeat and for-each blocks of its loops category run the blocks inside them for every item.
- **Rete** repeats a component on its own: when several wires feed one input, the component runs once per value, every value against every value or paired 1:1. [Lists and node options](/learn/getting-started/rete/lists) shows how, and the badges that say what a component received.

## Reshaping lists

The `bitbybit.lists` functions read and reshape lists in every editor: take an item or a range, reverse, flatten nested lists, group, pair. [Lists](../base/lists/intro) introduces them.
