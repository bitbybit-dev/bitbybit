---
sidebar_position: 1
title: Shapes Live in a Worker
sidebar_label: Shapes Live in a Worker
description: Why every kernel call is asynchronous, why a shape in a script is a small handle, why operations never change their inputs, and how the worker's memory of shapes is kept and freed.
topic: code.concepts.shapes-live-in-a-worker
type: explanation
tags: [code, occt, manifold, jscad]
---

import BitByBitRenderCanvas from '@site/src/components/BitByBitRenderCanvas';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Shapes live in a worker

In a browser, Bitbybit's CAD kernels run in **web workers**: background threads beside the page. A long boolean or a fillet on a complex part computes there, and the page stays responsive while it does. Three things follow from it, and they hold in every editor.

## Every kernel call waits

A call to a kernel sends a message to its worker and waits for the answer. In TypeScript the call returns a promise, and you `await` it before you use the result:

```typescript
const box = await bitbybit.occt.shapes.solid.createBox({ width: 4, length: 4, height: 4, center: [0, 0, 0] });
```

Forget the `await` and the next call receives a promise instead of a shape, and fails. Rete components and Blockly blocks wait for you: a component runs when every value it needs has arrived, and a block that makes a shape finishes before the block under it starts.

## A shape is a handle

The worker keeps the geometry. What reaches your script is a small handle, `{ hash, type }`, that names the shape the worker holds:

- you pass the handle to the next call, which finds the shape by it;
- you cannot read the shape's faces or points from the handle; ask the kernel, with functions such as `bitbybit.occt.shapes.face.getFaces` or `bitbybit.occt.shapes.solid.getSolidVolume`;
- to show the shape, draw it: [drawing](../draw/intro) turns the shape into a mesh the 3D view shows.

## Operations never change their inputs

Every operation returns a **new** shape and leaves the shapes you gave it as they were. Rounding a box's edges gives a rounded box and keeps the sharp one; moving the rounded box gives a moved copy. A part is therefore a chain of calls, each starting from the result of the one before, and any shape on the way can still be used again.

Here a box is filleted and the result moved aside. The box itself is drawn as well, still sharp and still where it was:

{/* example:shapes-are-handles:start - generated from the example's steps for each editor; edits between these markers are overwritten */}

<Tabs groupId="editor" queryString>
<TabItem value="rete" label="Rete">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"{\"id\":\"rete-v2-json\",\"nodes\":{\"box\":{\"id\":\"box\",\"name\":\"bitbybit.occt.shapes.solid.createBox\",\"customName\":\"box\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"width\":4,\"length\":4,\"height\":4,\"center\":[0,0,0],\"originOnCenter\":true},\"inputs\":{},\"position\":[40,40]},\"fillet\":{\"id\":\"fillet\",\"name\":\"bitbybit.occt.fillets.filletEdges\",\"customName\":\"fillet edges\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":true,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"radius\":0.8},\"inputs\":{\"shape\":{\"connections\":[{\"node\":\"box\",\"output\":\"result\",\"data\":{}}]}},\"position\":[420,40]},\"move\":{\"id\":\"move\",\"name\":\"bitbybit.occt.transforms.translate\",\"customName\":\"translate\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"translation\":[6,0,0]},\"inputs\":{\"shape\":{\"connections\":[{\"node\":\"fillet\",\"output\":\"result\",\"data\":{}}]}},\"position\":[800,40]}},\"modules\":{}}","type":"rete"}}
  title="A box, rounded and moved in Rete"
  description="A box is filleted and the result moved aside; the box itself is drawn unchanged."
/>

</TabItem>
<TabItem value="blockly" label="Blockly">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"<xml xmlns=\"https://developers.google.com/blockly/xml\"><variables><variable id=\"box\">box</variable></variables><block type=\"variables_set\" x=\"40\" y=\"40\"><field name=\"VAR\" id=\"box\">box</field><value name=\"VALUE\"><block type=\"bitbybit.occt.shapes.solid.createBox\"><value name=\"Width\"><block type=\"math_number\"><field name=\"NUM\">4</field></block></value><value name=\"Length\"><block type=\"math_number\"><field name=\"NUM\">4</field></block></value><value name=\"Height\"><block type=\"math_number\"><field name=\"NUM\">4</field></block></value><value name=\"Center\"><block type=\"bitbybit.point.pointXYZ\"><value name=\"X\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Z\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value></block></value><value name=\"OriginOnCenter\"><block type=\"logic_boolean\"><field name=\"BOOL\">TRUE</field></block></value></block></value><next><block type=\"bitbybit.draw.drawAnyAsyncNoReturn\"><value name=\"Entity\"><block type=\"variables_get\"><field name=\"VAR\" id=\"box\">box</field></block></value><next><block type=\"bitbybit.draw.drawAnyAsyncNoReturn\"><value name=\"Entity\"><block type=\"bitbybit.occt.transforms.translate\"><value name=\"Shape\"><block type=\"bitbybit.occt.fillets.filletEdges\"><value name=\"Shape\"><block type=\"variables_get\"><field name=\"VAR\" id=\"box\">box</field></block></value><value name=\"Radius\"><block type=\"math_number\"><field name=\"NUM\">0.8</field></block></value></block></value><value name=\"Translation\"><block type=\"bitbybit.vector.vectorXYZ\"><value name=\"X\"><block type=\"math_number\"><field name=\"NUM\">6</field></block></value><value name=\"Y\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Z\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value></block></value></block></value></block></next></block></next></block></xml>","type":"blockly"}}
  title="A box, rounded and moved in Blockly"
  description="A box is filleted and the result moved aside; the box itself is drawn unchanged."
/>

</TabItem>
<TabItem value="typescript" label="TypeScript">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"const box = await bitbybit.occt.shapes.solid.createBox({ width: 4, length: 4, height: 4, center: [0, 0, 0] });\nconst rounded = await bitbybit.occt.fillets.filletEdges({ shape: box, radius: 0.8 });\nconst moved = await bitbybit.occt.transforms.translate({ shape: rounded, translation: [6, 0, 0] });\n\nawait bitbybit.draw.drawAnyAsync({ entity: box });\nawait bitbybit.draw.drawAnyAsync({ entity: moved });","type":"typescript"}}
  title="A box, rounded and moved in TypeScript"
  description="A box is filleted and the result moved aside; the box itself is drawn unchanged."
/>

</TabItem>
</Tabs>

{/* example:shapes-are-handles:end */}

In Rete the fillet's own result is hidden with its <Ui>Visible</Ui> switch, so only the box and the moved copy are drawn.

## The worker remembers

The worker keeps every shape it has made, and it remembers its answers: the same call with the same inputs returns the same handle without computing again. That is what makes a rebuild after a small change fast, and why Rete only reruns the components a change reaches.

What the worker keeps costs memory. It is freed in three ways:

| How | What it frees |
|---|---|
| `bitbybit.occt.deleteShape({ shape })` and `deleteShapes({ shapes })` | the shapes you name, once your script no longer needs them |
| `bitbybit.occt.cleanAllCache()` | every shape the kernel holds, including ones your variables still point to |
| <Ui>More</Ui> > <Ui>Clean Cache</Ui> in the editors | the same, and in Rete the results each component kept |

The editors also clean up as a run starts when the kernel holds a great many shapes, so in everyday scripts you rarely need any of these. Free shapes yourself in long loops that make thousands of intermediate shapes, or in an app that keeps building models for as long as it is open.

## On a server

On Node, the npm packages can run a kernel in your own process instead of a worker. There its calls return at once rather than as promises, and a shape is the kernel's own object, freed with its `.delete()`. Write geometry with `await` on every call and it runs both ways; [geometry with the kernels](../../../using-ai-with-bitbybit/cad-geometry) shows the two side by side.
