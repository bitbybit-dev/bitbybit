---
sidebar_position: 7
title: SVG Import
sidebar_label: SVG Import
description: Import SVG drawings into OCCT geometry - which elements are supported, how faces and holes are worked out, and what to do about text and reused symbols.
topic: code.occt.io.svg-import
type: how-to
tags: [code, occt, rete, blockly, typescript]
---

import BitByBitRenderCanvas from '@site/src/components/BitByBitRenderCanvas';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<img
  class="category-icon-small"
  src="https://s.bitbybit.dev/assets/icons/white/occt-icon.svg"
  alt="OCCT category icon with a stylized logo representation"
  title="OCCT category icon" />

# Importing SVG Drawings

SVG is the easiest way to get a 2D outline out of a drawing tool and into a script. You draw in
Illustrator, Inkscape, Figma or a browser, save an SVG, and import it as OCCT wires or faces.

The importer does not support the whole SVG specification, and this page tells you where the edges
are, so you can prepare a file that imports cleanly the first time.

## A drawing into a plate

`bitbybit.occt.svg.loadSVG` takes the text of an SVG document and gives one compound of everything it draws, laid on the ground. `faceStrategy` decides what closed outlines become: `none` keeps them as wires, and the other strategies make faces, with the holes worked out as described under [Faces and holes](#faces-and-holes). A face extrudes into a solid.

Here a path draws a square and a circle inside it. With the `evenOdd` strategy the circle becomes a hole, and the face is extruded upward into a plate:

{/* example:plate-from-svg:start - generated from the example's steps for each editor; edits between these markers are overwritten */}

<Tabs groupId="editor" queryString>
<TabItem value="rete" label="Rete">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"{\"id\":\"rete-v2-json\",\"nodes\":{\"drawing\":{\"id\":\"drawing\",\"name\":\"bitbybit.occt.svg.loadSVG\",\"customName\":\"load SVG\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":true,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"svg\":\"<svg xmlns=\\\"http://www.w3.org/2000/svg\\\" viewBox=\\\"0 0 20 20\\\"><path d=\\\"M2,2 L18,2 L18,18 L2,18 Z M10,6 A4,4 0 1,0 10,14 A4,4 0 1,0 10,6 Z\\\"/></svg>\",\"faceStrategy\":\"evenOdd\",\"makeRibbons\":false,\"includeInvisible\":false,\"joinSegments\":true,\"tolerance\":1e-7,\"scale\":1,\"flipY\":true,\"alignment\":\"midMid\",\"direction\":[0,1,0],\"center\":[0,0,0]},\"inputs\":{},\"position\":[40,40]},\"plate\":{\"id\":\"plate\",\"name\":\"bitbybit.occt.operations.extrude\",\"customName\":\"extrude\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"direction\":[0,2,0]},\"inputs\":{\"shape\":{\"connections\":[{\"node\":\"drawing\",\"output\":\"result\",\"data\":{}}]}},\"position\":[460,40]}},\"modules\":{}}","type":"rete"}}
  title="A plate from an SVG drawing in Rete"
  description="An SVG path of a square with a round hole, imported as a face with its hole, laid on the ground and extruded into a plate."
/>

</TabItem>
<TabItem value="blockly" label="Blockly">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"<xml xmlns=\"https://developers.google.com/blockly/xml\"><block type=\"bitbybit.draw.drawAnyAsyncNoReturn\" x=\"40\" y=\"40\"><value name=\"Entity\"><block type=\"bitbybit.occt.operations.extrude\"><value name=\"Shape\"><block type=\"bitbybit.occt.svg.loadSVG\"><value name=\"Svg\"><block type=\"text\"><field name=\"TEXT\">&lt;svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 20 20\"&gt;&lt;path d=\"M2,2 L18,2 L18,18 L2,18 Z M10,6 A4,4 0 1,0 10,14 A4,4 0 1,0 10,6 Z\"/&gt;&lt;/svg&gt;</field></block></value><value name=\"FaceStrategy\"><block type=\"bitbybit.occt.enums.svgFaceStrategyEnum\"><field name=\"bitbybit.occt.enums.svgFaceStrategyEnum\">'evenOdd'</field></block></value><value name=\"MakeRibbons\"><block type=\"logic_boolean\"><field name=\"BOOL\">FALSE</field></block></value><value name=\"IncludeInvisible\"><block type=\"logic_boolean\"><field name=\"BOOL\">FALSE</field></block></value><value name=\"JoinSegments\"><block type=\"logic_boolean\"><field name=\"BOOL\">TRUE</field></block></value><value name=\"Tolerance\"><block type=\"math_number\"><field name=\"NUM\">1e-7</field></block></value><value name=\"Scale\"><block type=\"math_number\"><field name=\"NUM\">1</field></block></value><value name=\"FlipY\"><block type=\"logic_boolean\"><field name=\"BOOL\">TRUE</field></block></value><value name=\"Alignment\"><block type=\"bitbybit.base.enums.basicAlignmentEnum\"><field name=\"bitbybit.base.enums.basicAlignmentEnum\">'midMid'</field></block></value><value name=\"Direction\"><block type=\"bitbybit.vector.vectorXYZ\"><value name=\"X\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\"><field name=\"NUM\">1</field></block></value><value name=\"Z\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value></block></value><value name=\"Center\"><block type=\"bitbybit.point.pointXYZ\"><value name=\"X\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Z\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value></block></value></block></value><value name=\"Direction\"><block type=\"bitbybit.vector.vectorXYZ\"><value name=\"X\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\"><field name=\"NUM\">2</field></block></value><value name=\"Z\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value></block></value></block></value></block></xml>","type":"blockly"}}
  title="A plate from an SVG drawing in Blockly"
  description="An SVG path of a square with a round hole, imported as a face with its hole, laid on the ground and extruded into a plate."
/>

</TabItem>
<TabItem value="typescript" label="TypeScript">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"const svg = '<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 20 20\"><path d=\"M2,2 L18,2 L18,18 L2,18 Z M10,6 A4,4 0 1,0 10,14 A4,4 0 1,0 10,6 Z\"/></svg>';\nconst drawing = await bitbybit.occt.svg.loadSVG({ svg, faceStrategy: Bit.Inputs.OCCT.svgFaceStrategyEnum.evenOdd });\nconst plate = await bitbybit.occt.operations.extrude({ shape: drawing, direction: [0, 2, 0] });\n\nawait bitbybit.draw.drawAnyAsync({ entity: plate });","type":"typescript"}}
  title="A plate from an SVG drawing in TypeScript"
  description="An SVG path of a square with a round hole, imported as a face with its hole, laid on the ground and extruded into a plate."
/>

</TabItem>
</Tabs>

{/* example:plate-from-svg:end */}

`scale` maps the drawing's units to the model's, `flipY` turns SVG's downward Y axis up, and `alignment`, `direction` and `center` place the result. `loadSVGStructured` gives one shape per element instead, each with its fill and stroke, for colouring the parts or keeping only some.

In a project, keep the drawing as a file and read it with `bitbybit.asset.getTextFile` ([Assets](../../base/asset/intro)).

## What gets imported

Seven elements produce geometry:

`path`, `rect`, `circle`, `ellipse`, `line`, `polyline`, `polygon`

Nine more are recognised and deliberately skipped, because they hold definitions rather than drawings:

`defs`, `symbol`, `clipPath`, `mask`, `marker`, `pattern`, `metadata`, `title`, `desc`

Grouping elements such as `g`, `a` and `switch` are walked through, so geometry nested inside them
comes across normally along with any transform they apply.

## The import tells you what it could not use

The result carries a `warnings` array. Anything the importer met and could not turn into geometry is
reported there, once per kind of element.

**Read it.** An SVG that imports as an empty scene is almost always explained by a single line in that
array, and the alternative is guessing.

## Two limitations worth knowing before you export

### Reused symbols do not come across

The `use` element places a copy of something defined elsewhere in the document, usually inside `defs`.
Since `defs` is skipped, a `use` element has nothing to point at, and contributes nothing.

This matters more than it sounds, because it is how most drawing tools export anything repeated: they
define the shape once and place it twenty times. Such a file imports as an empty drawing.

**What to do:** in your drawing tool, expand, flatten or ungroup the repeated items before exporting,
so each copy is written out as its own path.

### Text is not geometry

`text` and `tspan` describe characters in a font, not outlines. Fonts are not available to the
importer, so text cannot be turned into shapes.

**What to do:** convert text to paths or outlines before exporting. Every major drawing tool has this
option, usually called "Convert to Outlines", "Object to Path" or "Create Outlines".

The same applies to `image`, which holds a raster picture, and `foreignObject`, which holds content
that is not SVG at all. Neither has geometry to import.

## Styling

Presentation attributes and inline `style="..."` are both read, and inherited down the tree the way you
would expect.

An embedded `<style>` block with CSS selectors is **not** applied. Matching CSS selectors is a much
larger job than reading attributes, and machine-generated SVG rarely uses them. If your file styles
through a stylesheet, the import warns about it, and the fix is to export with presentation attributes
instead - most tools have a setting for this.

## Faces and holes

If you ask for faces rather than wires, the importer decides which outlines are holes inside other
outlines, and which are separate shapes.

Two things decide it: whether one outline's centre lies inside another, and whether its area is
genuinely smaller. Both are needed. The area comparison is what separates two circles drawn around the
same centre, where the centre test alone cannot tell you which contains which.

Your drawing's own fill rule is respected, so a shape drawn with `evenodd` and one drawn with
`nonzero` produce the hole arrangement you see in the drawing tool.

## Arcs survive transforms

An arc inside a group that has been scaled, rotated or mirrored stays a true arc rather than being
approximated. Mirroring reverses the direction the arc sweeps, which is handled, so a mirrored drawing
does not come in with its curves bulging the wrong way.

## Paths without a file

The importer turns every element into the vocabulary of SVG paths, lines, quadratic and cubic curves and arcs, and builds it with `bitbybit.occt.path.shapeFromPath`. You can call it yourself with subpaths you compute: one wire per subpath, or faces when `makeFaces` is on and the outlines close. It is the shortest way to an outline made of arcs and curves without writing an SVG document.

## Every function

### SVG

{/* api:occt.svg:start - generated from the API index; edits between these markers are overwritten */}

| Function | What it does |
|---|---|
| [`loadSVG`](https://docs.bitbybit.dev/classes/Bit.OCCTSVG#loadSVG) | Parses an SVG document and builds every drawable element into one compound shape on the ground plane, ready to draw, extrude or transform as a whole. |
| [`loadSVGStructured`](https://docs.bitbybit.dev/classes/Bit.OCCTSVG#loadSVGStructured) | Parses an SVG document and builds one shape per drawable element, each bundled with its resolved fill, stroke and stroke width, plus the parse warnings and the SVG view box. |

{/* api:occt.svg:end */}

### Paths

{/* api:occt.path:start - generated from the API index; edits between these markers are overwritten */}

| Function | What it does |
|---|---|
| [`shapeFromPath`](https://docs.bitbybit.dev/classes/Bit.OCCTPath#shapeFromPath) | Builds a shape from path subpaths: one wire per subpath, packed into a compound when there are several, or a face when `makeFaces` is true and the outlines close. |

{/* api:occt.path:end */}
