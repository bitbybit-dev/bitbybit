---
sidebar_position: 1.5
title: Drawing Options and Materials
sidebar_label: Options and Materials
description: Every drawing option in Bitbybit, generated from the API - precision, colors, edges, vertices, index labels, two-sided faces, surface analysis, materials and textures - which entity each set of options is for and which renderers have it, with an example in Rete, Blockly and TypeScript.
topic: code.draw.options
type: reference
tags: [code, draw]
---

import BitByBitRenderCanvas from '@site/src/components/BitByBitRenderCanvas';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Drawing options and materials

`bitbybit.draw.drawAnyAsync` draws whatever it is given with sensible defaults. To change how something looks, pass it **options**: one object whose properties set the precision of the mesh, the colors of faces and edges, what is shown and what is not. The options never change the geometry, only its drawing ([Geometry is not a drawing](/learn/how-it-works#geometry-is-not-a-drawing)).

Each kind of entity has its own set of options, and a function that builds them with defaults for what you leave out:

| Entity | Options from | Renderers |
|---|---|---|
| OpenCascade shapes | `optionsOcctShape` (every option), `optionsOcctShapeSimple` (the common ones), `optionsOcctShapeMaterial` (with an engine material) | all three for the full set; the other two in BabylonJS |
| Manifold solids and cross sections | `optionsManifoldShapeMaterial` | BabylonJS |
| Points, lines, polylines, curves, surfaces, JSCAD meshes | `optionsSimple` | all three |
| Frames | `optionsFrame` | all three |
| The meshes of a recipe | `optionsRecipeMeshes` | all three |
| Transform nodes | `optionsBabylonNode` | BabylonJS |

**In Rete**, the options are a component of the draw category: connect its output to the `options` input of a draw component that takes the entity. **In Blockly**, plug the options block into the draw block's `Options` input. **In TypeScript**, create the options class, `new Bit.Inputs.Draw.DrawOcctShapeOptions()`, set what you need and pass it with the entity.

Here a box is drawn with see-through faces, dark edges and the index of every face and edge beside it. These are the indexes that functions picking faces and edges by number take ([Picking faces and edges](../concepts/picking-faces-and-edges)):

{/* example:numbered-faces:start - generated from the example's steps for each editor; edits between these markers are overwritten */}

<Tabs groupId="editor" queryString>
<TabItem value="rete" label="Rete">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"{\"id\":\"rete-v2-json\",\"nodes\":{\"box\":{\"id\":\"box\",\"name\":\"bitbybit.occt.shapes.solid.createBox\",\"customName\":\"box\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":true,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"width\":4,\"length\":3,\"height\":2,\"center\":[0,0,0],\"originOnCenter\":true},\"inputs\":{},\"position\":[40,40]},\"options\":{\"id\":\"options\",\"name\":\"bitbybit.draw.optionsOcctShape\",\"customName\":\"options occt shape\",\"async\":false,\"drawable\":false,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"faceOpacity\":0.35,\"edgeOpacity\":1,\"edgeColour\":\"#1a1c1f\",\"faceColour\":\"#ff0000\",\"vertexColour\":\"#ff00ff\",\"edgeWidth\":2,\"vertexSize\":0.03,\"drawEdges\":true,\"drawFaces\":true,\"drawVertices\":false,\"precision\":0.01,\"angularDeflection\":0.5,\"relativeDeflection\":false,\"drawEdgeIndexes\":true,\"edgeIndexHeight\":0.2,\"edgeIndexColour\":\"#ff00ff\",\"drawFaceIndexes\":true,\"faceIndexHeight\":0.3,\"faceIndexColour\":\"#0000ff\",\"drawTwoSided\":false,\"backFaceColour\":\"#0000ff\",\"backFaceOpacity\":1,\"edgeArrowSize\":0,\"edgeArrowAngle\":15,\"keepMeshData\":false,\"allowQualityDecrease\":true,\"forceFaceDeflection\":false,\"drawIsoCurves\":false,\"isoCurvesU\":5,\"isoCurvesV\":5,\"isoCurvesColour\":\"#808080\",\"surfaceAnalysis\":\"none\",\"draftDirection\":[0,1,0]},\"inputs\":{},\"position\":[40,380]},\"draw\":{\"id\":\"draw\",\"name\":\"bitbybit.draw.drawAnyAsync\",\"customName\":\"draw any async\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false}},\"inputs\":{\"entity\":{\"connections\":[{\"node\":\"box\",\"output\":\"result\",\"data\":{}}]},\"options\":{\"connections\":[{\"node\":\"options\",\"output\":\"result\",\"data\":{}}]}},\"position\":[460,40]}},\"modules\":{}}","type":"rete"}}
  title="A shape with its faces and edges numbered in Rete"
  description="A box drawn with see-through faces, no back faces, dark edges and the index of every face and edge written beside it, the numbers selection functions take."
/>

</TabItem>
<TabItem value="blockly" label="Blockly">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"<xml xmlns=\"https://developers.google.com/blockly/xml\"><block type=\"bitbybit.draw.drawAnyAsyncNoReturn\" x=\"40\" y=\"40\"><value name=\"Entity\"><block type=\"bitbybit.occt.shapes.solid.createBox\"><value name=\"Width\"><block type=\"math_number\"><field name=\"NUM\">4</field></block></value><value name=\"Length\"><block type=\"math_number\"><field name=\"NUM\">3</field></block></value><value name=\"Height\"><block type=\"math_number\"><field name=\"NUM\">2</field></block></value><value name=\"Center\"><block type=\"bitbybit.point.pointXYZ\"><value name=\"X\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Z\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value></block></value><value name=\"OriginOnCenter\"><block type=\"logic_boolean\"><field name=\"BOOL\">TRUE</field></block></value></block></value><value name=\"Options\"><block type=\"bitbybit.draw.optionsOcctShape\"><value name=\"FaceOpacity\"><block type=\"math_number\"><field name=\"NUM\">0.35</field></block></value><value name=\"EdgeOpacity\"><block type=\"math_number\"><field name=\"NUM\">1</field></block></value><value name=\"EdgeColour\"><block type=\"colour_picker\"><field name=\"COLOUR\">#1a1c1f</field></block></value><value name=\"FaceColour\"><block type=\"colour_picker\"><field name=\"COLOUR\">#ff0000</field></block></value><value name=\"VertexColour\"><block type=\"colour_picker\"><field name=\"COLOUR\">#ff00ff</field></block></value><value name=\"EdgeWidth\"><block type=\"math_number\"><field name=\"NUM\">2</field></block></value><value name=\"VertexSize\"><block type=\"math_number\"><field name=\"NUM\">0.03</field></block></value><value name=\"DrawEdges\"><block type=\"logic_boolean\"><field name=\"BOOL\">TRUE</field></block></value><value name=\"DrawFaces\"><block type=\"logic_boolean\"><field name=\"BOOL\">TRUE</field></block></value><value name=\"DrawVertices\"><block type=\"logic_boolean\"><field name=\"BOOL\">FALSE</field></block></value><value name=\"Precision\"><block type=\"math_number\"><field name=\"NUM\">0.01</field></block></value><value name=\"AngularDeflection\"><block type=\"math_number\"><field name=\"NUM\">0.5</field></block></value><value name=\"RelativeDeflection\"><block type=\"logic_boolean\"><field name=\"BOOL\">FALSE</field></block></value><value name=\"DrawEdgeIndexes\"><block type=\"logic_boolean\"><field name=\"BOOL\">TRUE</field></block></value><value name=\"EdgeIndexHeight\"><block type=\"math_number\"><field name=\"NUM\">0.2</field></block></value><value name=\"EdgeIndexColour\"><block type=\"colour_picker\"><field name=\"COLOUR\">#ff00ff</field></block></value><value name=\"DrawFaceIndexes\"><block type=\"logic_boolean\"><field name=\"BOOL\">TRUE</field></block></value><value name=\"FaceIndexHeight\"><block type=\"math_number\"><field name=\"NUM\">0.3</field></block></value><value name=\"FaceIndexColour\"><block type=\"colour_picker\"><field name=\"COLOUR\">#0000ff</field></block></value><value name=\"DrawTwoSided\"><block type=\"logic_boolean\"><field name=\"BOOL\">FALSE</field></block></value><value name=\"BackFaceColour\"><block type=\"colour_picker\"><field name=\"COLOUR\">#0000ff</field></block></value><value name=\"BackFaceOpacity\"><block type=\"math_number\"><field name=\"NUM\">1</field></block></value><value name=\"EdgeArrowSize\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"EdgeArrowAngle\"><block type=\"math_number\"><field name=\"NUM\">15</field></block></value><value name=\"KeepMeshData\"><block type=\"logic_boolean\"><field name=\"BOOL\">FALSE</field></block></value><value name=\"AllowQualityDecrease\"><block type=\"logic_boolean\"><field name=\"BOOL\">TRUE</field></block></value><value name=\"ForceFaceDeflection\"><block type=\"logic_boolean\"><field name=\"BOOL\">FALSE</field></block></value><value name=\"DrawIsoCurves\"><block type=\"logic_boolean\"><field name=\"BOOL\">FALSE</field></block></value><value name=\"IsoCurvesU\"><block type=\"math_number\"><field name=\"NUM\">5</field></block></value><value name=\"IsoCurvesV\"><block type=\"math_number\"><field name=\"NUM\">5</field></block></value><value name=\"IsoCurvesColour\"><block type=\"colour_picker\"><field name=\"COLOUR\">#808080</field></block></value><value name=\"SurfaceAnalysis\"><block type=\"bitbybit.occt.enums.surfaceAnalysisEnum\"><field name=\"bitbybit.occt.enums.surfaceAnalysisEnum\">'none'</field></block></value><value name=\"DraftDirection\"><block type=\"bitbybit.vector.vectorXYZ\"><value name=\"X\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\"><field name=\"NUM\">1</field></block></value><value name=\"Z\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value></block></value></block></value></block></xml>","type":"blockly"}}
  title="A shape with its faces and edges numbered in Blockly"
  description="A box drawn with see-through faces, no back faces, dark edges and the index of every face and edge written beside it, the numbers selection functions take."
/>

</TabItem>
<TabItem value="typescript" label="TypeScript">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"const box = await bitbybit.occt.shapes.solid.createBox({ width: 4, length: 3, height: 2, center: [0, 0, 0] });\n\nconst options = new Bit.Inputs.Draw.DrawOcctShapeOptions();\noptions.faceOpacity = 0.35;\noptions.drawTwoSided = false;\noptions.edgeColour = \"#1a1c1f\";\noptions.drawFaceIndexes = true;\noptions.faceIndexHeight = 0.3;\noptions.drawEdgeIndexes = true;\noptions.edgeIndexHeight = 0.2;\nawait bitbybit.draw.drawAnyAsync({ entity: box, options });","type":"typescript"}}
  title="A shape with its faces and edges numbered in TypeScript"
  description="A box drawn with see-through faces, no back faces, dark edges and the index of every face and edge written beside it, the numbers selection functions take."
/>

</TabItem>
</Tabs>

{/* example:numbered-faces:end */}

## OpenCascade shapes

A shape is meshed into triangles before it is drawn. `precision` is how far the mesh may stray from the true surface, in model units: smaller follows curves more closely and costs more triangles. [Units and precision](../concepts/units-and-precision) shows the difference.

{/* options:draw.optionsOcctShape:start - generated from the API index; edits between these markers are overwritten */}

In BabylonJS, ThreeJS and PlayCanvas.

| Option | Default | What it does |
|---|---|---|
| `faceOpacity` | `1` | How opaque the faces are, from 0 for invisible to 1 for opaque, multiplied into each look's own opacity. A `faceMaterial` replaces it. |
| `edgeOpacity` | `1` | How opaque the edge and iso curve lines are, from 0 for invisible to 1 for opaque. |
| `edgeColour` | `"#ffffff"` | The color of the edges, as a hex string, unless `edgeContrast` derives it from the faces; the edge colors of an appearance win over both. |
| `edgeContrast` | - | Edges take their faces' color moved toward black, or toward white on dark faces, by this amount from 0 to 1, instead of `edgeColour`. Appearance edge colors still win. |
| `faceColour` | `"#ff0000"` | The color of the faces, as a hex string. A `faceMaterial` or a `surfaceAnalysis` takes its place, and the colors of an appearance win over it. |
| `vertexColour` | `"#ff00ff"` | The color of the vertex markers, as a hex string; used with `drawVertices`. |
| `faceMaterial` | - | An engine material for the faces, such as `draw.createPBRMaterial` makes; it replaces `faceColour` and `faceOpacity`, and a `surfaceAnalysis` replaces it in turn. |
| `edgeWidth` | `2` | The width of the edge and iso curve lines, a hundredth of it in model units. |
| `vertexSize` | `0.03` | The diameter of the vertex markers, in model units; used with `drawVertices`. |
| `drawEdges` | `true` | When false, the edges are not drawn. Drawn edges or iso curves push the faces back slightly in depth so the lines show on top. |
| `drawFaces` | `true` | When false, the faces and their backs are not drawn and no `surfaceAnalysis` is computed; the face index labels still are. |
| `drawVertices` | `false` | When true, each vertex of the shape is drawn as a small sphere in `vertexColour`, `vertexSize` across. |
| `precision` | `0.01` | The largest distance, in model units, the triangles and edge lines may stray from the curved shape; smaller is finer and heavier. |
| `angularDeflection` | `0.5` | The largest angle, in radians, a curved face may turn between neighboring triangles; smaller follows curvature more closely with more triangles. |
| `relativeDeflection` | `false` | When true, `precision` is a fraction of each edge's and face's size instead of model units, so small and large parts get triangles in proportion to their size. |
| `drawEdgeIndexes` | `false` | When true, each edge's index is written beside the middle of the edge, handy for picking edges to fillet. |
| `edgeIndexHeight` | `0.06` | The height of the edge index labels, in model units; they are drawn as lines in a plane parallel to XY. |
| `edgeIndexColour` | `"#ff00ff"` | The color of the edge index labels, as a hex string. |
| `drawFaceIndexes` | `false` | When true, each face's index is written near the middle of the face, handy for picking faces. |
| `faceIndexHeight` | `0.06` | The height of the face index labels, in model units; they are drawn as lines in a plane parallel to XY. |
| `faceIndexColour` | `"#0000ff"` | The color of the face index labels, as a hex string. |
| `drawTwoSided` | `true` | When true, the back of each face is drawn in `backFaceColour`, which shows which way faces point. A design build draws no backs. |
| `backFaceColour` | `"#0000ff"` | The color of the back of the faces, as a hex string; used with `drawTwoSided`. |
| `backFaceOpacity` | `1` | How opaque the back of the faces is, from 0 for invisible to 1 for opaque; used with `drawTwoSided`. |
| `edgeArrowSize` | `0` | The length of an arrow head at the end of each edge, showing its direction, in model units; 0 draws none. |
| `edgeArrowAngle` | `15` | The angle, in degrees, between each line of an arrow head and its edge; larger spreads the head wider. |
| `keepMeshData` | `false` | When true, the triangulation stays cached on each shape after drawing; when false it is cleared so memory does not grow across draws. |
| `allowQualityDecrease` | `true` | When true, a shape already meshed more finely may be remeshed at the coarser precision asked for. |
| `forceFaceDeflection` | `false` | When true, every face is remeshed at the requested precision even when a triangulation is cached. |
| `drawIsoCurves` | `false` | When true, each face's iso curves are drawn with the shape, as its edges are: at `edgeWidth` and `edgeOpacity`, in `isoCurvesColour`. |
| `isoCurvesU` | `5` | How many iso curves of constant u each face gets with `drawIsoCurves`, at values spread evenly inside its u range and trimmed to the face. |
| `isoCurvesV` | `5` | How many iso curves of constant v each face gets with `drawIsoCurves`, at values spread evenly inside its v range and trimmed to the face. |
| `isoCurvesColour` | `"#808080"` | The color of the iso curves as a hex string. |
| `surfaceAnalysis` | `"none"` | The surface analysis coloring the faces instead of `faceColour` and `faceMaterial`, from blue at `analysisMin` through green to red at `analysisMax`; vertices without a value keep `faceColour`. |
| `draftDirection` | `[0, 1, 0]` | The pull direction the draft angles, in degrees, are measured against; read only when `surfaceAnalysis` is `draftAngle`. |
| `analysisMin` | - | The analysis value drawn blue, and anything below it; left out, the lowest finite value found. |
| `analysisMax` | - | The analysis value drawn red, and anything above it; left out, the highest finite value found. |

{/* options:draw.optionsOcctShape:end */}

### The common options only

{/* options:draw.optionsOcctShapeSimple:start - generated from the API index; edits between these markers are overwritten */}

In BabylonJS.

| Option | Default | What it does |
|---|---|---|
| `precision` | `0.01` | The largest distance, in model units, the triangles and edge lines may stray from the curved shape; smaller is finer and heavier. |
| `drawFaces` | `true` | When false, the faces and their backs are not drawn. |
| `faceColour` | `"#ff0000"` | The color of the faces, as a hex string. |
| `drawEdges` | `true` | When false, the edges are not drawn. |
| `edgeColour` | `"#ffffff"` | The color of the edges, as a hex string. |
| `edgeWidth` | `2` | The width of the edge and iso curve lines, a hundredth of it in model units. |
| `drawTwoSided` | `true` | When true, the back of each face is drawn in `backFaceColour`, which shows which way faces point. |
| `backFaceColour` | `"#0000ff"` | The color of the back of the faces, as a hex string; used with `drawTwoSided`. |
| `backFaceOpacity` | `1` | How opaque the back of the faces is, from 0 for invisible to 1 for opaque; used with `drawTwoSided`. |

{/* options:draw.optionsOcctShapeSimple:end */}

### With an engine material

{/* options:draw.optionsOcctShapeMaterial:start - generated from the API index; edits between these markers are overwritten */}

In BabylonJS.

| Option | Default | What it does |
|---|---|---|
| `precision` | `0.01` | The largest distance, in model units, the triangles and edge lines may stray from the curved shape; smaller is finer and heavier. |
| `faceMaterial` | - | The engine material the faces are drawn with, such as `draw.createPBRMaterial` makes; it sets their color and opacity. |
| `drawEdges` | `true` | When false, the edges are not drawn. |
| `edgeColour` | `"#ffffff"` | The color of the edges, as a hex string. |
| `edgeWidth` | `2` | The width of the edge and iso curve lines, a hundredth of it in model units. |

{/* options:draw.optionsOcctShapeMaterial:end */}

## Manifold solids and cross sections

{/* options:draw.optionsManifoldShapeMaterial:start - generated from the API index; edits between these markers are overwritten */}

In BabylonJS.

| Option | Default | What it does |
|---|---|---|
| `faceOpacity` | `1` | How opaque the faces are, from 0 for invisible to 1 for opaque; a `faceMaterial` replaces it. |
| `faceColour` | `"#ff0000"` | The color of the faces of solids and meshes, as a hex string; a `faceMaterial` replaces it. |
| `faceMaterial` | - | An engine material for the faces, such as `draw.createPBRMaterial` makes; given, it replaces `faceColour` and `faceOpacity`. |
| `crossSectionColour` | `"#ff00ff"` | The color of the outline of a cross-section, as a hex string. |
| `crossSectionWidth` | `2` | The width of the outline of a cross-section, a hundredth of it in model units. |
| `crossSectionOpacity` | `1` | How opaque the outline of a cross-section is, from 0 for invisible to 1 for opaque. |
| `computeNormals` | `true` | When true, the mesh shades smoothly across edges flatter than `minSharpAngle` and keeps sharper ones crisp; when false, every face is shaded flat. |
| `minSharpAngle` | `40` | The angle between two faces, in degrees, above which their shared edge is drawn sharp when `computeNormals` is true. |
| `drawTwoSided` | `true` | When true, the back of the faces of solids and meshes is drawn in `backFaceColour`, which shows which way they face. |
| `backFaceColour` | `"#0000ff"` | The color of the back of the faces, as a hex string; used with `drawTwoSided`. |
| `backFaceOpacity` | `1` | How opaque the back of the faces is, from 0 for invisible to 1 for opaque; used with `drawTwoSided`. |

{/* options:draw.optionsManifoldShapeMaterial:end */}

## Points, lines, curves and meshes

{/* options:draw.optionsSimple:start - generated from the API index; edits between these markers are overwritten */}

In BabylonJS, ThreeJS and PlayCanvas.

| Option | Default | What it does |
|---|---|---|
| `colours` | `"#ff0000"` | One hex color for everything drawn, or a list with one per point, line, polyline, surface or JSCAD mesh; a polyline or JSCAD mesh with its own color keeps it. |
| `colorMapStrategy` | `"lastColorRemainder"` | How a `colours` list shorter than what is drawn is spread: first color for all, last for the rest, repeating, or back and forth. JSCAD meshes and curves ignore it. |
| `size` | `0.1` | The diameter of each point in model units and the width of lines, a hundredth of it in model units. Lines drawn without options get 2. |
| `opacity` | `1` | The opacity of points, lines, surfaces and JSCAD meshes, from 0 for invisible to 1 for opaque. |
| `updatable` | `false` | When true, handing the drawn object back as `babylonMesh` changes it in place instead of drawing a new one. |
| `hidden` | `false` | When true, surfaces and JSCAD meshes are drawn but not shown until made visible; points and lines ignore it. |
| `drawTwoSided` | `true` | When true, the back of each surface and JSCAD mesh is drawn in `backFaceColour`, which shows which way it faces. |
| `backFaceColour` | `"#0000ff"` | The color of the back of surfaces and JSCAD meshes, as a hex string; used with `drawTwoSided`. |
| `backFaceOpacity` | `1` | How opaque the back of surfaces and JSCAD meshes is, from 0 for invisible to 1 for opaque; used with `drawTwoSided`. |
| `arrowSize` | `0` | The length of the arrow head at the end of each line and polyline, showing its direction, in model units; 0 draws none. |
| `arrowAngle` | `15` | The angle, in degrees, between each line of an arrow head and the line it ends; larger spreads the head wider. |

{/* options:draw.optionsSimple:end */}

## Frames

{/* options:draw.optionsFrame:start - generated from the API index; edits between these markers are overwritten */}

In BabylonJS, ThreeJS and PlayCanvas.

| Option | Default | What it does |
|---|---|---|
| `size` | `1` | Length of each axis, in model units; the grid in the plane is as wide, centered on the origin. |
| `colorX` | `"#ff0000"` | Color of the X axis, which runs along the frame's direction. |
| `colorY` | `"#00ff00"` | Color of the Y axis. |
| `colorZ` | `"#0000ff"` | Color of the Z axis, which runs along the frame's normal. |
| `drawPlane` | `true` | Whether to draw the small grid in the frame's plane around its origin. |
| `colorPlane` | `"#808080"` | Color of the grid in the frame's plane. |
| `lineWidth` | `2` | The width of the axis and grid lines, a hundredth of it in model units. |
| `updatable` | `false` | When true, handing the drawn frame back as `babylonMesh` changes it in place instead of drawing a new one. |

{/* options:draw.optionsFrame:end */}

## The meshes of a recipe

{/* options:draw.optionsRecipeMeshes:start - generated from the API index; edits between these markers are overwritten */}

In BabylonJS, ThreeJS and PlayCanvas.

| Option | Default | What it does |
|---|---|---|
| `elementKey` | `"globalId"` | The tag whose value names an element, so the roots sharing it show, hide, color and pick as one. |
| `instancing` | `true` | When true, a mesh placed often enough by matrices that only turn and move is drawn as instances, one draw call for all of them. |
| `minInstances` | `2` | How many such placements of one mesh make it instances. |
| `maxBatchVertices` | `1000000` | The most vertices one merged batch holds; more start another batch. |
| `defaultColour` | `"#cccccc"` | The color of a root whose tag has no `rgba`. |
| `defaultOpacity` | `1` | The opacity of such a root, from 0 to 1. |
| `metallic` | `0` | How metallic every surface is, from 0 to 1. |
| `roughness` | `0.8` | How rough every surface is, from 0 to 1. |

{/* options:draw.optionsRecipeMeshes:end */}

## Transform nodes

{/* options:draw.optionsBabylonNode:start - generated from the API index; edits between these markers are overwritten */}

In BabylonJS.

| Option | Default | What it does |
|---|---|---|
| `colorX` | `"#ff0000"` | The color of the line along the node's X axis, as a hex string. |
| `colorY` | `"#00ff00"` | The color of the line along the node's Y axis, as a hex string. |
| `colorZ` | `"#0000ff"` | The color of the line along the node's Z axis, as a hex string. |
| `size` | `2` | The length of each axis line in the node's own space, so a scaled node scales its axes too. |

{/* options:draw.optionsBabylonNode:end */}

## Materials and textures

A color is enough for most drawings. For metal, glass, a glowing part or an image on a surface, make a **material** with `createPBRMaterial` and put it in the `faceMaterial` of the options. Its settings mean the same in all three renderers. `createTexture` loads an image from a URL for the material's texture slots. [Materials, colour and the look](../concepts/materials-and-looks) shows a metal sphere built this way.

{/* options:draw.createPBRMaterial:start - generated from the API index; edits between these markers are overwritten */}

In BabylonJS, ThreeJS and PlayCanvas.

| Option | Default | What it does |
|---|---|---|
| `name` | `"PBRMaterial"` | The name the engine gives the material. |
| `baseColor` | `"#0000ff"` | The base color of the surface, as a hex string. |
| `metallic` | `0.5` | How metallic the surface is, from 0 for plastic-like to 1 for metal. |
| `roughness` | `0.5` | How rough the surface is, from 0 for a mirror-like shine to 1 for a matte finish. |
| `alpha` | `1` | How opaque the material is, from 0 for invisible to 1 for opaque; the default `opaque` mode of `alphaMode` ignores it and `blend` shows it. |
| `emissiveColor` | `"#000000"` | The color the surface glows with whatever the scene's lights, as a hex string; black, the default, adds no glow. |
| `emissiveIntensity` | `1` | How strongly the surface glows: the emissive color is multiplied by it. |
| `zOffset` | `0` | Not read by this renderer; its materials keep no depth offset. |
| `zOffsetUnits` | `0` | Not read by this renderer; its materials keep no depth offset. |
| `baseColorTexture` | - | An image from `draw.createTexture` for the base color of the surface. |
| `metallicRoughnessTexture` | - | An image holding metallic in its blue channel and roughness in its green channel, as glTF lays them out. |
| `normalTexture` | - | A normal map, which adds surface detail by bending the lighting without changing the geometry. |
| `emissiveTexture` | - | An image giving where and in which color the surface glows. |
| `occlusionTexture` | - | An ambient occlusion map, which darkens the creases and corners light reaches less. |
| `alphaMode` | `"opaque"` | How opacity is applied: `opaque` ignores it, `mask` cuts away pixels below `alphaCutoff`, and `blend` draws the faces see-through. |
| `alphaCutoff` | `0.5` | The opacity below which a pixel is cut away; used with `alphaMode` set to `mask`. |
| `doubleSided` | `false` | When true, both sides of each face are drawn; when false, the back is culled. |
| `wireframe` | `false` | Not read by this renderer; the faces are drawn filled whatever the value. |
| `unlit` | `false` | When true, the scene's lights are ignored and the surface shows its colors flat. |

{/* options:draw.createPBRMaterial:end */}

### Textures

{/* options:draw.createTexture:start - generated from the API index; edits between these markers are overwritten */}

In BabylonJS, ThreeJS and PlayCanvas.

| Option | Default | What it does |
|---|---|---|
| `url` | - | Where the image is loaded from, as a path relative to the page or a full web address. |
| `name` | `"Texture"` | The name the engine gives the texture. |
| `uScale` | `1` | How many times the image repeats along U, the first texture direction of the surface; 0 counts as 1. |
| `vScale` | `1` | How many times the image repeats along V, the second texture direction of the surface; 0 counts as 1. |
| `uOffset` | `0` | How far the image is shifted along U, in image widths. |
| `vOffset` | `0` | How far the image is shifted along V, in image heights. |
| `wAng` | `0` | How far the image is turned on the surface, in radians. |
| `invertY` | `false` | When true, the image is flipped vertically as it loads; false, the default, keeps its rows in file order. |
| `invertZ` | `false` | Not read by this renderer; the image keeps its orientation whatever the value. |
| `samplingMode` | `"nearest"` | How the image is sampled when shown larger or smaller than its pixels: `nearest` keeps hard pixels, `bilinear` blends neighbors, and `trilinear` also blends between mipmap levels. |

{/* options:draw.createTexture:end */}

## Every function

{/* api:draw:start - generated from the API index; edits between these markers are overwritten */}

| Function | What it does |
|---|---|
| [`createPBRMaterial`](https://docs.bitbybit.dev/classes/Bit.Draw#createPBRMaterial) | Creates a physically based material from settings that mean the same in every renderer: base color, metallic and roughness, opacity, emissive glow, the texture slots and the alpha and side options; put it in the `faceMaterial` of the drawing options. |
| [`createTexture`](https://docs.bitbybit.dev/classes/Bit.Draw#createTexture) | Creates an image texture from a URL for the texture slots of `createPBRMaterial`, with tiling, offset, rotation and filtering that mean the same in every renderer. |
| [`detectNode`](https://docs.bitbybit.dev/classes/Bit.Draw#detectNode) | Whether the entity is a node this renderer can draw an axis triad for. |
| [`detectNodes`](https://docs.bitbybit.dev/classes/Bit.Draw#detectNodes) |  |
| [`drawAny`](https://docs.bitbybit.dev/classes/Bit.Draw#drawAny) | Draws an entity that needs no kernel work into the scene right away and gives back the drawn object: points, lines, polylines, frames, tags and nodes. |
| [`drawAnyAsync`](https://docs.bitbybit.dev/classes/Bit.Draw#drawAnyAsync) | Draws any entity the library produces into the scene and gives back the drawn object: kernel shapes, alone or with their appearance, design builds, points, lines, polylines, frames, curves, meshes, tags and nodes. |
| [`drawAnyAsyncNoReturn`](https://docs.bitbybit.dev/classes/Bit.Draw#drawAnyAsyncNoReturn) | Draws any entity into the scene, as `drawAnyAsync` does, without giving the drawn object back; for the last step of a script that only needs the result to appear. |
| [`drawAnyNoReturn`](https://docs.bitbybit.dev/classes/Bit.Draw#drawAnyNoReturn) | Draws an entity that needs no kernel work, as `drawAny` does, without giving the drawn object back; points, lines, polylines, frames and tags qualify, kernel shapes do not. |
| [`drawGridMesh`](https://docs.bitbybit.dev/classes/Bit.Draw#drawGridMesh) | Draws a grid on the ground plane, the XZ plane through the origin, to give a sense of scale and orientation; every tenth line is drawn thicker by default. |
| [`drawGridMeshNoReturn`](https://docs.bitbybit.dev/classes/Bit.Draw#drawGridMeshNoReturn) | Draws a grid on the ground plane, as `drawGridMesh` does, without giving the mesh back. |
| [`node.createNodeFromRotation`](https://docs.bitbybit.dev/classes/Bit.BabylonNode#createNodeFromRotation) | Creates a node at `origin` turned by the three `rotation` angles in degrees around X, Y and Z, inside the coordinate system of `parent` when one is given. |
| [`node.createWorldNode`](https://docs.bitbybit.dev/classes/Bit.BabylonNode#createWorldNode) | Creates a node parented to the root node of the scene, a fresh starting point for building a hierarchy at the world origin. |
| [`node.drawNode`](https://docs.bitbybit.dev/classes/Bit.BabylonNode#drawNode) | Draws the three axes of a node as colored lines of the given length, parented to it, so its position and orientation can be seen; the default colors are red for X, green for Y and blue for Z. |
| [`node.drawNodes`](https://docs.bitbybit.dev/classes/Bit.BabylonNode#drawNodes) | Draws the three axes of several nodes as colored lines of the given length, each set parented to its node, as `drawNode` does for one. |
| [`node.getAbsoluteForwardVector`](https://docs.bitbybit.dev/classes/Bit.BabylonNode#getAbsoluteForwardVector) | Reads the direction a node's local Z axis points in world space, with every parent's rotation applied. |
| [`node.getAbsolutePosition`](https://docs.bitbybit.dev/classes/Bit.BabylonNode#getAbsolutePosition) | Reads where a node's origin is in world space, with every parent's transform applied. |
| [`node.getAbsoluteRightVector`](https://docs.bitbybit.dev/classes/Bit.BabylonNode#getAbsoluteRightVector) | Reads the direction a node's local X axis points in world space, with every parent's rotation applied. |
| [`node.getAbsoluteRotationTransformation`](https://docs.bitbybit.dev/classes/Bit.BabylonNode#getAbsoluteRotationTransformation) | Reads the rotation of a node in world space, with every parent's rotation applied, as a 4x4 matrix of 16 numbers. |
| [`node.getAbsoluteUpVector`](https://docs.bitbybit.dev/classes/Bit.BabylonNode#getAbsoluteUpVector) | Reads the direction a node's local Y axis points in world space, with every parent's rotation applied. |
| [`node.getChildren`](https://docs.bitbybit.dev/classes/Bit.BabylonNode#getChildren) | Lists the nodes and meshes parented directly under a node, the ones that move with it. |
| [`node.getParent`](https://docs.bitbybit.dev/classes/Bit.BabylonNode#getParent) | Reads the node a node is parented to, the one it moves with; a top-level node has none. |
| [`node.getPositionExpressedInLocalSpace`](https://docs.bitbybit.dev/classes/Bit.BabylonNode#getPositionExpressedInLocalSpace) | Reads a node's position measured in its own local axes rather than its parent's, which differs once the node is rotated. |
| [`node.getRootNode`](https://docs.bitbybit.dev/classes/Bit.BabylonNode#getRootNode) | Gives the root node of the scene, the top of the hierarchy that `createWorldNode` parents to. |
| [`node.getRotation`](https://docs.bitbybit.dev/classes/Bit.BabylonNode#getRotation) | Reads a node's rotation relative to its parent as three angles in degrees around X, Y and Z. |
| [`node.getRotationTransformation`](https://docs.bitbybit.dev/classes/Bit.BabylonNode#getRotationTransformation) | Reads the rotation of a node relative to its parent as a 4x4 matrix of 16 numbers; the node must carry a rotation quaternion, which `rotate` and `setDirection` give it. |
| [`node.rotate`](https://docs.bitbybit.dev/classes/Bit.BabylonNode#rotate) | Turns a node by `angle` degrees around an axis through its own origin, on top of its current rotation; its children follow. |
| [`node.rotateAroundAxisWithPosition`](https://docs.bitbybit.dev/classes/Bit.BabylonNode#rotateAroundAxisWithPosition) | Turns a node by `angle` degrees around an axis that passes through `position`, so the node orbits that point rather than spinning in place; its children follow. |
| [`node.setAbsolutePosition`](https://docs.bitbybit.dev/classes/Bit.BabylonNode#setAbsolutePosition) | Moves a node to a point in world space, whatever its parents are; its children follow. |
| [`node.setDirection`](https://docs.bitbybit.dev/classes/Bit.BabylonNode#setDirection) | Turns a node so its local Z axis points along `direction`; its children follow. |
| [`node.setParent`](https://docs.bitbybit.dev/classes/Bit.BabylonNode#setParent) | Parents a node to another so it moves with it from then on, keeping its current place in the world; a null parent detaches it. |
| [`node.translate`](https://docs.bitbybit.dev/classes/Bit.BabylonNode#translate) | Moves a node by `distance` scene units along `direction`, given in the node's own local axes; its children follow. |
| [`optionsBabylonNode`](https://docs.bitbybit.dev/classes/Bit.Draw#optionsBabylonNode) | Builds drawing options for transform nodes, which are drawn as a triad of colored axis lines of a given length. |
| [`optionsFrame`](https://docs.bitbybit.dev/classes/Bit.Draw#optionsFrame) | Builds drawing options for frames: how long the axes are and their colors, whether the small grid in the frame's plane is drawn and in which color, the line width and whether the frame can be redrawn in place, with defaults for what is left out. |
| [`optionsManifoldShapeMaterial`](https://docs.bitbybit.dev/classes/Bit.Draw#optionsManifoldShapeMaterial) | Builds drawing options for Manifold solids and cross-sections: face color or a full engine material, the line style of cross-sections, normals and the two-sided rendering. |
| [`optionsOcctShape`](https://docs.bitbybit.dev/classes/Bit.Draw#optionsOcctShape) | Builds the full drawing options for OCCT shapes: meshing precision, face, edge and vertex colors and sizes, index labels, arrows on edges, two-sided rendering, iso curves, a surface analysis coloring the faces and the triangulation cache, with defaults for what is left out. |
| [`optionsOcctShapeMaterial`](https://docs.bitbybit.dev/classes/Bit.Draw#optionsOcctShapeMaterial) | Builds drawing options for OCCT shapes whose faces use a full engine material, as `createPBRMaterial` makes one, plus the precision and edge style. |
| [`optionsOcctShapeSimple`](https://docs.bitbybit.dev/classes/Bit.Draw#optionsOcctShapeSimple) | Builds the most used drawing options for OCCT shapes, precision, face and edge colors and two-sided rendering, with defaults for what is left out. |
| [`optionsRecipeMeshes`](https://docs.bitbybit.dev/classes/Bit.Draw#optionsRecipeMeshes) | Builds drawing options for the meshes of a recipe, as `manifold.recipes.meshes` gives them: the tag naming an element, when repeated meshes become instances, the batch size, and the color and surface of roots without a color. |
| [`optionsSimple`](https://docs.bitbybit.dev/classes/Bit.Draw#optionsSimple) | Builds drawing options for points, lines, polylines, curves, surfaces and JSCAD meshes: colors, size, opacity, two-sided rendering and arrow heads on lines, with defaults for what is left out. |
| [`recipeElementOfPick`](https://docs.bitbybit.dev/classes/Bit.Draw#recipeElementOfPick) | Gives the element a pick hit in a recipe drawn from its meshes, as the value of its element tag, from the mesh and the face or thin instance the scene's pick reports. |
| [`setRecipeElementsColour`](https://docs.bitbybit.dev/classes/Bit.Draw#setRecipeElementsColour) | Shows elements of a recipe drawn from its meshes in one color, such as the ones selected, or with no color gives each its own back, by the values of their element tag. |
| [`setRecipeElementsVisible`](https://docs.bitbybit.dev/classes/Bit.Draw#setRecipeElementsVisible) | Shows or hides elements of a recipe drawn from its meshes, such as one storey's walls, by the values of their element tag, changing only their own triangles and instances. |
| [`tag.create`](https://docs.bitbybit.dev/classes/Bit.Tag#create) | Builds a tag description from its text, position, color, size and depth behavior, without drawing it; `drawTag` or `drawTags` put it on screen. |
| [`tag.drawTag`](https://docs.bitbybit.dev/classes/Bit.Tag#drawTag) | Puts one tag on screen as a text element pinned to its 3D position, and keeps it following that position. |
| [`tag.drawTags`](https://docs.bitbybit.dev/classes/Bit.Tag#drawTags) | Puts several tags on screen, each a text element pinned to its 3D position. |

{/* api:draw:end */}
