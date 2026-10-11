---
sidebar_position: 1
title: Advanced - 3D Text and Patterns
sidebar_label: 3D Text and Patterns
description: The advanced algorithms of bitbybit.dev - solid 3D text in real fonts, text laid on faces, pyramid patterns over surfaces, dimensions and camera navigation - which ones need a plan, with an example in Rete, Blockly and TypeScript and a table of every function.
topic: code.advanced.intro
type: explanation
tags: [code, advanced]
---

import BitByBitRenderCanvas from '@site/src/components/BitByBitRenderCanvas';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Advanced: 3D text and patterns

`bitbybit.advanced` holds tools that do in one call what would take many steps of the open-source API:

- `text3d`: letters built from the outlines of real fonts, standing free or laid onto a face;
- `patterns`: pyramids raised over the cells of a face;
- `dimensions`: measurement annotations, and `navigation`: camera moves and points of interest, both on [their own page](dimensions-and-navigation).

These are **platform algorithms**: their source is closed, and they run in the editors on bitbybit.dev and in the [runners](/learn/runners/intro), not in the npm packages. Most of them work for everyone. The pyramid patterns compute only for members of the Silver and Gold plans; without a plan they stop the run with a message that says so ([Plans](/learn/plans#platform-algorithms)).

## 3D text

`text3d.create` builds a text from one of the shipped fonts: `fontType` is the family and `fontVariant` its weight or style, and not every family has every variant. The letters are drawn on the XZ plane and extruded along Y by `height` in model units; a `height` of 0 gives flat letter faces instead of solids. The text is then turned by `rotation` degrees about Y, its Y axis is turned to `direction`, and the point `originAlignment` picks lands on `origin`.

Here a word stands up and faces the viewer: `direction` points it along -Z and `rotation` turns the letters upright:

{/* example:name-in-3d-text:start - generated from the example's steps for each editor; edits between these markers are overwritten */}

<Tabs groupId="editor" queryString>
<TabItem value="rete" label="Rete">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"{\"id\":\"rete-v2-json\",\"nodes\":{\"facing\":{\"id\":\"facing\",\"name\":\"bitbybit.vector.vectorXYZ\",\"customName\":\"vector xyz\",\"async\":false,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":true,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"x\":0,\"y\":0,\"z\":-1},\"inputs\":{},\"position\":[40,40]},\"text\":{\"id\":\"text\",\"name\":\"bitbybit.advanced.text3d.create\",\"customName\":\"text 3d\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"text\":\"bitbybit\",\"fontType\":\"Roboto\",\"fontVariant\":\"Regular\",\"fontSize\":1.5,\"height\":0.4,\"rotation\":-90,\"origin\":[0,0,0],\"direction\":[0,1,0],\"originAlignment\":\"centerBottom\"},\"inputs\":{\"direction\":{\"connections\":[{\"node\":\"facing\",\"output\":\"result\",\"data\":{}}]}},\"position\":[460,40]}},\"modules\":{}}","type":"rete"}}
  title="A name in 3D text in Rete"
  description="A word built as solid letters of a real font, standing up and facing the viewer."
/>

</TabItem>
<TabItem value="blockly" label="Blockly">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"<xml xmlns=\"https://developers.google.com/blockly/xml\"><block type=\"bitbybit.draw.drawAnyAsyncNoReturn\" x=\"40\" y=\"40\"><value name=\"Entity\"><block type=\"bitbybit.advanced.text3d.create\"><value name=\"Text\"><block type=\"text\"><field name=\"TEXT\">bitbybit</field></block></value><value name=\"FontType\"><block type=\"bitbybit.advanced.text3d.fontsEnum\"><field name=\"bitbybit.advanced.text3d.fontsEnum\">'Roboto'</field></block></value><value name=\"FontVariant\"><block type=\"bitbybit.advanced.text3d.fontVariantsEnum\"><field name=\"bitbybit.advanced.text3d.fontVariantsEnum\">'Regular'</field></block></value><value name=\"FontSize\"><block type=\"math_number\"><field name=\"NUM\">1.5</field></block></value><value name=\"Height\"><block type=\"math_number\"><field name=\"NUM\">0.4</field></block></value><value name=\"Rotation\"><block type=\"math_number\"><field name=\"NUM\">-90</field></block></value><value name=\"Origin\"><block type=\"bitbybit.vector.vectorXYZ\"><value name=\"X\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Z\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value></block></value><value name=\"Direction\"><block type=\"bitbybit.vector.vectorXYZ\"><value name=\"X\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Z\"><block type=\"math_number\"><field name=\"NUM\">-1</field></block></value></block></value><value name=\"OriginAlignment\"><block type=\"bitbybit.advanced.text3d.recAlignmentEnum\"><field name=\"bitbybit.advanced.text3d.recAlignmentEnum\">'centerBottom'</field></block></value></block></value></block></xml>","type":"blockly"}}
  title="A name in 3D text in Blockly"
  description="A word built as solid letters of a real font, standing up and facing the viewer."
/>

</TabItem>
<TabItem value="typescript" label="TypeScript">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"const options = new Bit.Advanced.Text3D.Text3DDto();\noptions.text = \"bitbybit\";\noptions.rotation = -90;\noptions.height = 0.4;\noptions.direction = [0, 0, -1];\noptions.originAlignment = Bit.Advanced.Text3D.recAlignmentEnum.centerBottom;\n\nconst text = await bitbybit.advanced.text3d.create(options);\nawait bitbybit.draw.drawAnyAsync({ entity: text });","type":"typescript"}}
  title="A name in 3D text in TypeScript"
  description="A word built as solid letters of a real font, standing up and facing the viewer."
/>

</TabItem>
</Tabs>

{/* example:name-in-3d-text:end */}

The result is a text model, not one shape. `getCompoundShape` gives the whole text as one shape to fillet, cut, export or draw, `getCharacterShapes` one shape per character with an outline (spaces have none), and `getCharacterCenterCoordinates` their centers.

### Text on a face

`createTextOnFace` lays the text onto a face so that it follows the surface, curved faces included. It is placed in the face's own UV space: `fontSize` is measured in the face's U and V values, and `originParamU` and `originParamV` place the anchor as fractions of the face's range. `faceTextVar` chooses what comes back: the letters alone, raised letters sewn into the face, or the face with the letters cut out. `getFaceCutout` and its siblings then read the faces left after the cut, the islands inside letters such as the inside of an O among them.

`createTextsOnFace` puts several texts on one face in one result, each prepared with `definition3dTextOnFace`.

On bitbybit.dev with BabylonJS, the methods ending in `Url` do the same with a font file of your own, loaded from a URL: TTF, OTF or WOFF.

## Patterns on faces

`patterns.facePatterns.pyramidSimple.createPyramidSimple` splits each face evenly over its UV range into `uNumber` by `vNumber` cells and raises a four-sided pyramid on every cell, `height` model units along the surface normal; a negative height points the other way. `createPyramidSimpleAffectors` varies the heights with attractor points: a cell within an affector's radius rises more the closer it is.

The getters read the result: the compound of all pyramids, the pyramids of one face or one cell, the cells with their corner points and center points, and the polylines of the grid in U and V.

## Every function

### 3D text

{/* api:advanced.text3d:start - generated from the API index; edits between these markers are overwritten */}

| Function | What it does |
|---|---|
| [`create`](https://docs.bitbybit.dev/classes/Bit.Text3D#create) | Builds a text from one of the shipped fonts as flat letter faces or extruded letter solids. |
| [`createTextOnFace`](https://docs.bitbybit.dev/classes/Bit.Text3D#createTextOnFace) | Lays a text from one of the shipped fonts onto a face so that it follows the surface. |
| [`createTextOnFaceUrl`](https://docs.bitbybit.dev/classes/Bit.Text3D#createTextOnFaceUrl) | Lays a text from a font file loaded from a URL onto a face so that it follows the surface. |
| [`createTextsOnFace`](https://docs.bitbybit.dev/classes/Bit.Text3D#createTextsOnFace) | Lays several texts onto one face in a single result, each with its own font, size, placement and style. |
| [`createTextsOnFaceUrl`](https://docs.bitbybit.dev/classes/Bit.Text3D#createTextsOnFaceUrl) | Lays several texts, each with a font file loaded from its own URL, onto one face in a single result. |
| [`createWithUrl`](https://docs.bitbybit.dev/classes/Bit.Text3D#createWithUrl) | Builds a text from a font file loaded from a URL, as flat letter faces or extruded letter solids. |
| [`definition3dTextOnFace`](https://docs.bitbybit.dev/classes/Bit.Text3D#definition3dTextOnFace) | Packs the settings of one text into a definition for `createTextsOnFace`. |
| [`definition3dTextOnFaceUrl`](https://docs.bitbybit.dev/classes/Bit.Text3D#definition3dTextOnFaceUrl) | Packs the settings of one text with a font URL into a definition for `createTextsOnFaceUrl`. |
| [`drawModel`](https://docs.bitbybit.dev/classes/Bit.Text3D#drawModel) | Draws a text model in the scene with white faces and brown edges. |
| [`getAdvanceWidth`](https://docs.bitbybit.dev/classes/Bit.Text3D#getAdvanceWidth) | Returns how far the text advances along its line, as the font's spacing sets it at the chosen size. |
| [`getAllFacesOfCutout`](https://docs.bitbybit.dev/classes/Bit.Text3D#getAllFacesOfCutout) | Returns every face left after cutting the letters out of the face, including the pieces inside letters. |
| [`getCharacterCenterCoordinates`](https://docs.bitbybit.dev/classes/Bit.Text3D#getCharacterCenterCoordinates) | Returns the center of each character of a text model as a point. |
| [`getCharacterShape`](https://docs.bitbybit.dev/classes/Bit.Text3D#getCharacterShape) | Returns the shape of one character of a text model. |
| [`getCharacterShapes`](https://docs.bitbybit.dev/classes/Bit.Text3D#getCharacterShapes) | Returns the shape of every character of a text model that has an outline. |
| [`getCompoundShape`](https://docs.bitbybit.dev/classes/Bit.Text3D#getCompoundShape) | Returns the single shape that holds the whole result of a text model. |
| [`getCutoutsInsideCharacters`](https://docs.bitbybit.dev/classes/Bit.Text3D#getCutoutsInsideCharacters) | Returns the pieces of the face that stay enclosed inside characters after the letters are cut out. |
| [`getFaceCutout`](https://docs.bitbybit.dev/classes/Bit.Text3D#getFaceCutout) | Returns the main face left after cutting the letters out of the face a text was placed on. |

{/* api:advanced.text3d:end */}

### Patterns

{/* api:advanced.patterns:start - generated from the API index; edits between these markers are overwritten */}

| Function | What it does |
|---|---|
| [`facePatterns.pyramidSimple.createPyramidSimple`](https://docs.bitbybit.dev/classes/Bit.PyramidSimple#createPyramidSimple) | Raises a pyramid of the same height on every cell of a U by V grid over each face. |
| [`facePatterns.pyramidSimple.createPyramidSimpleAffectors`](https://docs.bitbybit.dev/classes/Bit.PyramidSimple#createPyramidSimpleAffectors) | Raises a pyramid on every cell of a U by V grid over each face, with heights shaped by attractor points. |
| [`facePatterns.pyramidSimple.drawModel`](https://docs.bitbybit.dev/classes/Bit.PyramidSimple#drawModel) | Draws a pyramid model in the scene with white faces and brown edges. |
| [`facePatterns.pyramidSimple.getAllPyramidCells`](https://docs.bitbybit.dev/classes/Bit.PyramidSimple#getAllPyramidCells) | Returns the cells of every face of a pyramid model as one flat list, face after face. |
| [`facePatterns.pyramidSimple.getAllPyramidCellsOnFace`](https://docs.bitbybit.dev/classes/Bit.PyramidSimple#getAllPyramidCellsOnFace) | Returns the cells of one face of a pyramid model. |
| [`facePatterns.pyramidSimple.getAllPyramidUCellsOnFace`](https://docs.bitbybit.dev/classes/Bit.PyramidSimple#getAllPyramidUCellsOnFace) | Returns the cells of one face of a pyramid model, the same list `getAllPyramidCellsOnFace` returns. |
| [`facePatterns.pyramidSimple.getAllPyramidUCellsOnFaceAtU`](https://docs.bitbybit.dev/classes/Bit.PyramidSimple#getAllPyramidUCellsOnFaceAtU) | Returns the cells of one face that share a U index, a row of cells running along V. |
| [`facePatterns.pyramidSimple.getAllPyramidUCellsOnFaceAtV`](https://docs.bitbybit.dev/classes/Bit.PyramidSimple#getAllPyramidUCellsOnFaceAtV) | Returns the cells of one face that share a V index, a row of cells running along U. |
| [`facePatterns.pyramidSimple.getCellOnIndex`](https://docs.bitbybit.dev/classes/Bit.PyramidSimple#getCellOnIndex) | Returns the cell at one U and V index on one face of a pyramid model. |
| [`facePatterns.pyramidSimple.getCenterPointsOfCells`](https://docs.bitbybit.dev/classes/Bit.PyramidSimple#getCenterPointsOfCells) | Returns the center of each given cell, the average of its four corner points. |
| [`facePatterns.pyramidSimple.getCompoundShape`](https://docs.bitbybit.dev/classes/Bit.PyramidSimple#getCompoundShape) | Returns the single compound that holds every pyramid on every face of a pyramid model. |
| [`facePatterns.pyramidSimple.getCompoundShapeCellOnFace`](https://docs.bitbybit.dev/classes/Bit.PyramidSimple#getCompoundShapeCellOnFace) | Returns the pyramid of one cell on one face as a compound of its triangular sides. |
| [`facePatterns.pyramidSimple.getCompoundShapeOnFace`](https://docs.bitbybit.dev/classes/Bit.PyramidSimple#getCompoundShapeOnFace) | Returns the compound of the pyramids on one face of a pyramid model. |
| [`facePatterns.pyramidSimple.getCompoundShapesOfCells`](https://docs.bitbybit.dev/classes/Bit.PyramidSimple#getCompoundShapesOfCells) | Returns the pyramid of each given cell as a compound of its triangular sides. |
| [`facePatterns.pyramidSimple.getCornerNormalOfCells`](https://docs.bitbybit.dev/classes/Bit.PyramidSimple#getCornerNormalOfCells) | Returns the surface normal stored at one chosen corner of each given cell. |
| [`facePatterns.pyramidSimple.getCornerNormalsOfCells`](https://docs.bitbybit.dev/classes/Bit.PyramidSimple#getCornerNormalsOfCells) | Returns the surface normals stored at the corners of each given cell. |
| [`facePatterns.pyramidSimple.getCornerPointOfCells`](https://docs.bitbybit.dev/classes/Bit.PyramidSimple#getCornerPointOfCells) | Returns one chosen corner point of each given cell. |
| [`facePatterns.pyramidSimple.getCornerPointsOfCells`](https://docs.bitbybit.dev/classes/Bit.PyramidSimple#getCornerPointsOfCells) | Returns the four corner points of each given cell. |
| [`facePatterns.pyramidSimple.getEndPolylineWireU`](https://docs.bitbybit.dev/classes/Bit.PyramidSimple#getEndPolylineWireU) | Returns the grid polyline at the end of a face's U range, running along V. |
| [`facePatterns.pyramidSimple.getEndPolylineWireV`](https://docs.bitbybit.dev/classes/Bit.PyramidSimple#getEndPolylineWireV) | Returns the grid polyline at the end of a face's V range, running along U. |
| [`facePatterns.pyramidSimple.getFaceShapesOfCells`](https://docs.bitbybit.dev/classes/Bit.PyramidSimple#getFaceShapesOfCells) | Returns one triangular side of each given cell's pyramid. |
| [`facePatterns.pyramidSimple.getPolylineWiresUCompound`](https://docs.bitbybit.dev/classes/Bit.PyramidSimple#getPolylineWiresUCompound) | Returns every grid polyline of constant U on a face, each running along V, as one compound. |
| [`facePatterns.pyramidSimple.getPolylineWiresVCompound`](https://docs.bitbybit.dev/classes/Bit.PyramidSimple#getPolylineWiresVCompound) | Returns every grid polyline of constant V on a face, each running along U, as one compound. |
| [`facePatterns.pyramidSimple.getStartPolylineWireU`](https://docs.bitbybit.dev/classes/Bit.PyramidSimple#getStartPolylineWireU) | Returns the grid polyline at the start of a face's U range, running along V. |
| [`facePatterns.pyramidSimple.getStartPolylineWireV`](https://docs.bitbybit.dev/classes/Bit.PyramidSimple#getStartPolylineWireV) | Returns the grid polyline at the start of a face's V range, running along U. |
| [`facePatterns.pyramidSimple.getTopPointsOfCells`](https://docs.bitbybit.dev/classes/Bit.PyramidSimple#getTopPointsOfCells) | Returns the apex point of each given cell. |
| [`facePatterns.pyramidSimple.getWireShapesOfCells`](https://docs.bitbybit.dev/classes/Bit.PyramidSimple#getWireShapesOfCells) | Returns the closed triangular outline of one side of each given cell's pyramid. |

{/* api:advanced.patterns:end */}
