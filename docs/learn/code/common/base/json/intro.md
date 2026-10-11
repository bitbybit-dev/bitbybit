---
sidebar_position: 1
title: JSON in Bitbybit
sidebar_label: JSON
description: Reading and changing JSON data in a Bitbybit script - parsing text, reading properties, finding values with JSONPath, setting them on a copy and writing text back - with an example in Rete, Blockly and TypeScript and a table of every function.
topic: code.base.json
type: explanation
tags: [code, json]
---

import BitByBitRenderCanvas from '@site/src/components/BitByBitRenderCanvas';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# JSON

JSON is how data travels on the web: a configurator's choices, a file of part sizes, the answer of a web service. `bitbybit.json` turns JSON text into values a script can use, finds values inside it, changes them and writes the result back as text.

## Text in, text out

- `parse` turns JSON text into the value it describes. Text that is not valid JSON stops the script with an error.
- `stringify` turns a value back into JSON text, on one line.
- `createEmpty` gives a new object with no properties, to fill with `setValueOnProp`.

In TypeScript the same is `JSON.parse` and `JSON.stringify`. The functions exist so that Rete and Blockly can do it too.

## Reading values

`getValueOnProp` reads one property of an object, and a missing one gives `undefined`. `getJsonFromArrayByFirstPropMatch` finds the first object in a list whose property equals a value, for picking a record by its name or id.

Here a block takes its width, length and height from JSON, and the radius its edges are rounded by:

{/* example:part-from-json:start - generated from the example's steps for each editor; edits between these markers are overwritten */}

<Tabs groupId="editor" queryString>
<TabItem value="rete" label="Rete">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"{\"id\":\"rete-v2-json\",\"nodes\":{\"data\":{\"id\":\"data\",\"name\":\"bitbybit.json.parse\",\"customName\":\"parse\",\"async\":false,\"drawable\":false,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"text\":\"{\\\"width\\\": 4, \\\"length\\\": 2.5, \\\"height\\\": 1.2, \\\"fillet\\\": 0.3}\"},\"inputs\":{},\"position\":[40,40]},\"width\":{\"id\":\"width\",\"name\":\"bitbybit.json.getValueOnProp\",\"customName\":\"get value on prop\",\"async\":false,\"drawable\":false,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"property\":\"width\"},\"inputs\":{\"json\":{\"connections\":[{\"node\":\"data\",\"output\":\"result\",\"data\":{}}]}},\"position\":[460,40]},\"length\":{\"id\":\"length\",\"name\":\"bitbybit.json.getValueOnProp\",\"customName\":\"get value on prop\",\"async\":false,\"drawable\":false,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"property\":\"length\"},\"inputs\":{\"json\":{\"connections\":[{\"node\":\"data\",\"output\":\"result\",\"data\":{}}]}},\"position\":[460,340]},\"height\":{\"id\":\"height\",\"name\":\"bitbybit.json.getValueOnProp\",\"customName\":\"get value on prop\",\"async\":false,\"drawable\":false,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"property\":\"height\"},\"inputs\":{\"json\":{\"connections\":[{\"node\":\"data\",\"output\":\"result\",\"data\":{}}]}},\"position\":[460,640]},\"radius\":{\"id\":\"radius\",\"name\":\"bitbybit.json.getValueOnProp\",\"customName\":\"get value on prop\",\"async\":false,\"drawable\":false,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"property\":\"fillet\"},\"inputs\":{\"json\":{\"connections\":[{\"node\":\"data\",\"output\":\"result\",\"data\":{}}]}},\"position\":[460,940]},\"block\":{\"id\":\"block\",\"name\":\"bitbybit.occt.shapes.solid.createBox\",\"customName\":\"box\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":true,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"width\":1,\"length\":2,\"height\":3,\"center\":[0,0,0],\"originOnCenter\":true},\"inputs\":{\"width\":{\"connections\":[{\"node\":\"width\",\"output\":\"result\",\"data\":{}}]},\"length\":{\"connections\":[{\"node\":\"length\",\"output\":\"result\",\"data\":{}}]},\"height\":{\"connections\":[{\"node\":\"height\",\"output\":\"result\",\"data\":{}}]}},\"position\":[880,40]},\"rounded\":{\"id\":\"rounded\",\"name\":\"bitbybit.occt.fillets.filletEdges\",\"customName\":\"fillet edges\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"radius\":0.1},\"inputs\":{\"shape\":{\"connections\":[{\"node\":\"block\",\"output\":\"result\",\"data\":{}}]},\"radius\":{\"connections\":[{\"node\":\"radius\",\"output\":\"result\",\"data\":{}}]}},\"position\":[1300,40]}},\"modules\":{}}","type":"rete"}}
  title="A part sized by JSON data in Rete"
  description="JSON text parsed into an object whose properties give a block its width, length and height and the radius its edges are rounded by."
/>

</TabItem>
<TabItem value="blockly" label="Blockly">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"<xml xmlns=\"https://developers.google.com/blockly/xml\"><variables><variable id=\"data\">data</variable></variables><block type=\"variables_set\" x=\"40\" y=\"40\"><field name=\"VAR\" id=\"data\">data</field><value name=\"VALUE\"><block type=\"bitbybit.json.parse\"><value name=\"Text\"><block type=\"text\"><field name=\"TEXT\">{\"width\": 4, \"length\": 2.5, \"height\": 1.2, \"fillet\": 0.3}</field></block></value></block></value><next><block type=\"bitbybit.draw.drawAnyAsyncNoReturn\"><value name=\"Entity\"><block type=\"bitbybit.occt.fillets.filletEdges\"><value name=\"Shape\"><block type=\"bitbybit.occt.shapes.solid.createBox\"><value name=\"Width\"><block type=\"bitbybit.json.getValueOnProp\"><value name=\"Json\"><block type=\"variables_get\"><field name=\"VAR\" id=\"data\">data</field></block></value><value name=\"Property\"><block type=\"text\"><field name=\"TEXT\">width</field></block></value></block></value><value name=\"Length\"><block type=\"bitbybit.json.getValueOnProp\"><value name=\"Json\"><block type=\"variables_get\"><field name=\"VAR\" id=\"data\">data</field></block></value><value name=\"Property\"><block type=\"text\"><field name=\"TEXT\">length</field></block></value></block></value><value name=\"Height\"><block type=\"bitbybit.json.getValueOnProp\"><value name=\"Json\"><block type=\"variables_get\"><field name=\"VAR\" id=\"data\">data</field></block></value><value name=\"Property\"><block type=\"text\"><field name=\"TEXT\">height</field></block></value></block></value><value name=\"Center\"><block type=\"bitbybit.point.pointXYZ\"><value name=\"X\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Z\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value></block></value><value name=\"OriginOnCenter\"><block type=\"logic_boolean\"><field name=\"BOOL\">TRUE</field></block></value></block></value><value name=\"Radius\"><block type=\"bitbybit.json.getValueOnProp\"><value name=\"Json\"><block type=\"variables_get\"><field name=\"VAR\" id=\"data\">data</field></block></value><value name=\"Property\"><block type=\"text\"><field name=\"TEXT\">fillet</field></block></value></block></value></block></value></block></next></block></xml>","type":"blockly"}}
  title="A part sized by JSON data in Blockly"
  description="JSON text parsed into an object whose properties give a block its width, length and height and the radius its edges are rounded by."
/>

</TabItem>
<TabItem value="typescript" label="TypeScript">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"const data = bitbybit.json.parse({ text: '{\"width\": 4, \"length\": 2.5, \"height\": 1.2, \"fillet\": 0.3}' });\nconst value = (property: string) => bitbybit.json.getValueOnProp({ json: data, property });\n\nconst block = await bitbybit.occt.shapes.solid.createBox({ width: value(\"width\"), length: value(\"length\"), height: value(\"height\"), center: [0, 0, 0] });\nconst rounded = await bitbybit.occt.fillets.filletEdges({ shape: block, radius: value(\"fillet\") });\n\nawait bitbybit.draw.drawAnyAsync({ entity: rounded });","type":"typescript"}}
  title="A part sized by JSON data in TypeScript"
  description="JSON text parsed into an object whose properties give a block its width, length and height and the radius its edges are rounded by."
/>

</TabItem>
</Tabs>

{/* example:part-from-json:end */}

Change the numbers in the text, and the part follows. The text could as well come from a file in the project, loaded with `bitbybit.asset.getTextFile`, or from the web with `bitbybit.asset.fetchJSON` (see [Assets](../asset/intro)).

## Finding values anywhere: JSONPath

`query` finds every value a [JSONPath](https://goessner.net/articles/JsonPath/) expression matches, and always gives a list, even of one:

- `$.parts[*].name` lists the name of every part;
- `$..radius` lists every `radius`, at any depth;
- `$.parts[?(@.material == "steel")]` keeps the parts made of steel.

`paths` lists where the matches are, as full paths from the root. `setValue` sets a property on every object an expression reaches, and `setValuesOnPaths` applies several such changes in one call.

## Changes make copies

`setValue`, `setValueOnProp` and `setValuesOnPaths` give a changed copy and leave their input as it was, so the same data can feed several branches of a script without one changing what another reads.

## Showing and saving

`previewJson` hands the data to the editor to show it, and `previewAndSaveJson` also offers to save it as a file. What the preview looks like is up to the editor.

## Every function

{/* api:json:start - generated from the API index; edits between these markers are overwritten */}

| Function | What it does |
|---|---|
| [`createEmpty`](https://docs.bitbybit.dev/classes/Bit.JSONBitByBit#createEmpty) | Gives a new empty object with no properties, a starting point for `setValueOnProp` and `setValue`. |
| [`getJsonFromArrayByFirstPropMatch`](https://docs.bitbybit.dev/classes/Bit.JSONBitByBit#getJsonFromArrayByFirstPropMatch) | Finds the first object in a list whose property equals the given value, comparing with strict equality, and gives it back; nothing matching gives undefined. |
| [`getValueOnProp`](https://docs.bitbybit.dev/classes/Bit.JSONBitByBit#getValueOnProp) | Reads one top-level property of a JSON object; a missing property gives undefined. |
| [`parse`](https://docs.bitbybit.dev/classes/Bit.JSONBitByBit#parse) | Turns JSON text into the value it describes, as `JSON.parse` does; text that is not valid JSON throws an error. |
| [`paths`](https://docs.bitbybit.dev/classes/Bit.JSONBitByBit#paths) | Lists the paths of every value a JSONPath expression matches, each as a full path from the root such as `$['parts'][0]['name']`, instead of the values themselves. |
| [`previewAndSaveJson`](https://docs.bitbybit.dev/classes/Bit.JSONBitByBit#previewAndSaveJson) | Hands the JSON to the running application to show it and offer to save it as a file; the application decides how the preview looks, and nothing happens when the value is empty. |
| [`previewJson`](https://docs.bitbybit.dev/classes/Bit.JSONBitByBit#previewJson) | Hands the JSON to the running application to show it; the application decides how the preview looks, and nothing happens when the value is empty. |
| [`query`](https://docs.bitbybit.dev/classes/Bit.JSONBitByBit#query) | Finds every value in the JSON that a JSONPath expression matches and gives them as a list, even when there is only one. |
| [`setValue`](https://docs.bitbybit.dev/classes/Bit.JSONBitByBit#setValue) | Sets property `prop` to `value` on every object a JSONPath expression reaches, giving a changed copy of the JSON. |
| [`setValueOnProp`](https://docs.bitbybit.dev/classes/Bit.JSONBitByBit#setValueOnProp) | Sets one top-level property of a JSON object to a value, giving a changed copy; the input stays as it is and a property that did not exist is added. |
| [`setValuesOnPaths`](https://docs.bitbybit.dev/classes/Bit.JSONBitByBit#setValuesOnPaths) | Applies several `setValue` changes in one go: entry `i` of `paths`, `props` and `values` is one change, applied in order to a copy of the JSON. |
| [`stringify`](https://docs.bitbybit.dev/classes/Bit.JSONBitByBit#stringify) | Turns any JSON-compatible value into its JSON text, on one line without indentation, as `JSON.stringify` does. |

{/* api:json:end */}
