---
sidebar_position: 6
title: Hexagons Grid
sidebar_label: Hexagons Grid
description: Learn how to create wire based hexagon grids
tags: [code, occt, rete, blockly, typescript]
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import BitByBitRenderCanvas from '@site/src/components/BitByBitRenderCanvas';

# Wire Hexagons Grid

<img 
  class="category-icon-small" 
  src="https://s.bitbybit.dev/assets/icons/white/occt-icon.svg" 
  alt="OCCT category icon with a stylized logo representation" 
  title="OCCT category icon" />

Hexagonal grids are nature's elegant solution for efficient space filling, appearing in honeycombs, molecular structures, and architectural designs. The wire hexagon grid component creates an array of hexagonal wire boundaries that can be used as building blocks for complex geometric patterns and structures.

## Understanding Hexagon Grid Patterns

The `hexagonsInGrid` function generates a collection of hexagonal wire shapes arranged in a grid pattern. Unlike simple rectangular grids, hexagonal grids offer unique advantages: they provide optimal packing efficiency, create natural interlocking patterns, and distribute structural forces more evenly across the grid.

The component works by fitting a specified number of hexagons within defined width and height boundaries. Each hexagon is automatically sized to maintain proper proportions while filling the designated space. This smart scaling ensures that your hexagonal patterns always fit perfectly within their intended boundaries, whether you're designing architectural screens, decorative panels, or structural frameworks.

## Essential Parameters

The hexagon grid system offers several key controls that shape how your pattern develops:

**Dimensional Control** through `width` and `height` parameters defines the overall boundary of your grid area. The system automatically calculates hexagon sizes to fit precisely within these limits.

**Grid Density** is controlled by `nrHexagonsInWidth` and `nrHexagonsInHeight`, which specify exactly how many hexagons you want across each dimension. Higher numbers create finer, more detailed grids with smaller individual hexagons.

**Orientation Options** via the `flatTop` parameter fundamentally change how hexagons are oriented. When false (the default), hexagons have pointed tops creating a more dynamic appearance. When true, hexagons sit flat, creating horizontal emphasis that works well for certain architectural applications.

**Edge Extension** controls allow you to extend the grid beyond its natural boundaries. The `extendTop`, `extendBottom`, `extendLeft`, and `extendRight` parameters can shift the entire grid by half-hexagon increments, helping you align patterns with existing geometry or create specific edge conditions.

## Pattern Applications

Wire hexagon grids excel in numerous design scenarios. In architectural work, they create stunning façade patterns, interior screens, and decorative elements that balance visual interest with structural efficiency. The wire format makes them perfect for defining boundaries that can later be filled with solid faces or used as cutting patterns for more complex shapes.

For parametric design, these grids serve as excellent starting points for creating complex geometric relationships. Each hexagon maintains its proportional relationship to its neighbors, allowing for systematic modifications that preserve the overall pattern integrity while enabling local variations.

The component also includes advanced patterning capabilities through optional arrays: `scalePatternWidth` and `scalePatternHeight` allow selective sizing of individual hexagons, `filletPattern` can soften corners with varying radii, and `inclusionPattern` lets you selectively remove hexagons to create openings or decorative voids.

<Tabs groupId="creating-hexagon-grids">
<TabItem value="rete" label="Rete">
    <BitByBitRenderCanvas
    requireManualStart={true}
    script={{"script":"{\"id\":\"rete-v2-json\",\"nodes\":{\"b7a38d4c0d9f754c\":{\"id\":\"b7a38d4c0d9f754c\",\"name\":\"bitbybit.occt.shapes.wire.hexagonsInGrid\",\"customName\":\"hexagons in grid\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"width\":10,\"height\":10,\"nrHexagonsInWidth\":10,\"nrHexagonsInHeight\":10,\"flatTop\":true,\"extendTop\":false,\"extendBottom\":false,\"extendLeft\":false,\"extendRight\":false},\"inputs\":{\"width\":{\"connections\":[{\"node\":\"10cad6722901b797\",\"output\":\"result\",\"data\":{}}]},\"height\":{\"connections\":[{\"node\":\"94b6840ecc0d14f9\",\"output\":\"result\",\"data\":{}}]},\"nrHexagonsInWidth\":{\"connections\":[{\"node\":\"9e0f01292b02aa95\",\"output\":\"result\",\"data\":{}}]},\"nrHexagonsInHeight\":{\"connections\":[{\"node\":\"cc9937525eb5e9ca\",\"output\":\"result\",\"data\":{}}]}},\"position\":[1284.1811287089922,550.0164150191429]},\"10cad6722901b797\":{\"id\":\"10cad6722901b797\",\"name\":\"bitbybit.math.numberSlider\",\"customName\":\"width\",\"data\":{\"options\":{\"min\":5,\"max\":20,\"step\":0.1,\"width\":350,\"updateOnDrag\":false},\"number\":16.5},\"inputs\":{},\"position\":[453.7297187862087,422.94929075624503]},\"94b6840ecc0d14f9\":{\"id\":\"94b6840ecc0d14f9\",\"name\":\"bitbybit.math.numberSlider\",\"customName\":\"heigt\",\"data\":{\"number\":9},\"inputs\":{},\"position\":[456.05536369107705,581.7401796185444]},\"9e0f01292b02aa95\":{\"id\":\"9e0f01292b02aa95\",\"name\":\"bitbybit.math.numberSlider\",\"customName\":\"subdivisions w\",\"data\":{\"options\":{\"min\":5,\"max\":30,\"step\":1,\"width\":350,\"updateOnDrag\":false},\"number\":23},\"inputs\":{},\"position\":[457.2296289322852,741.1013000038674]},\"cc9937525eb5e9ca\":{\"id\":\"cc9937525eb5e9ca\",\"name\":\"bitbybit.math.numberSlider\",\"customName\":\"subdivisions h\",\"data\":{\"number\":18},\"inputs\":{},\"position\":[456.1027729121326,903.7244752443968]},\"21636f9079646906\":{\"id\":\"21636f9079646906\",\"name\":\"bitbybit.occt.shapes.wire.createRectangleWire\",\"customName\":\"rectangle wire\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"width\":1,\"length\":2,\"center\":[0,0,0],\"direction\":[0,1,0]},\"inputs\":{\"width\":{\"connections\":[{\"node\":\"10cad6722901b797\",\"output\":\"result\",\"data\":{}}]},\"length\":{\"connections\":[{\"node\":\"94b6840ecc0d14f9\",\"output\":\"result\",\"data\":{}}]}},\"position\":[1288.9401397832285,126.53828730459331]}}}","version":"0.20.13","type":"rete"}}
    title="Creating hexagon grids"
    />
</TabItem>
<TabItem value="blockly" label="Blockly">
  <BitByBitRenderCanvas
    requireManualStart={true}
    script={{"script":"<xml xmlns=\"https://developers.google.com/blockly/xml\"><variables><variable id=\"f8PoBNR-.1tv@(Gxyi-#\">width</variable><variable id=\"~xh.~H^Ri7Krz?l}#htu\">height</variable></variables><block type=\"variables_set\" id=\"k`[=31-i4kPX3Fg!d;$R\" x=\"-271\" y=\"-322\"><field name=\"VAR\" id=\"f8PoBNR-.1tv@(Gxyi-#\">width</field><value name=\"VALUE\"><block type=\"math_number\" id=\"DM%a+VWQ0l-4u`$eo2XF\"><field name=\"NUM\">16.5</field></block></value><next><block type=\"variables_set\" id=\"z!hj)3,v^D}*c?Qm,[dH\"><field name=\"VAR\" id=\"~xh.~H^Ri7Krz?l}#htu\">height</field><value name=\"VALUE\"><block type=\"math_number\" id=\"$;Q[uIR;P]GQt7UWl@Q/\"><field name=\"NUM\">9</field></block></value><next><block type=\"bitbybit.draw.drawAnyAsyncNoReturn\" id=\"05~!]nr}NNcNtO4!BS))\"><value name=\"Entity\"><block type=\"bitbybit.occt.shapes.wire.hexagonsInGrid\" id=\"nM%!Z^[BQ/eb39Bh^I@F\"><value name=\"Width\"><block type=\"variables_get\" id=\"u*~+,gWt)Cp7*+5QSa*w\"><field name=\"VAR\" id=\"f8PoBNR-.1tv@(Gxyi-#\">width</field></block></value><value name=\"Height\"><block type=\"variables_get\" id=\"EWtWaQ?`mJM7U_{fRe.R\"><field name=\"VAR\" id=\"~xh.~H^Ri7Krz?l}#htu\">height</field></block></value><value name=\"NrHexagonsInWidth\"><block type=\"math_number\" id=\"T8e)xWdo9X{X[JvgK;!1\"><field name=\"NUM\">23</field></block></value><value name=\"NrHexagonsInHeight\"><block type=\"math_number\" id=\"bk{2y3?}j,,$*s|I-+(W\"><field name=\"NUM\">18</field></block></value><value name=\"FlatTop\"><block type=\"logic_boolean\" id=\"/)tK{J04T`J7O76Tf?Rp\"><field name=\"BOOL\">FALSE</field></block></value><value name=\"ExtendTop\"><block type=\"logic_boolean\" id=\"}uw4D3Qg@RDV^$]{_.E!\"><field name=\"BOOL\">FALSE</field></block></value><value name=\"ExtendBottom\"><block type=\"logic_boolean\" id=\"7CzU!QM03op,PI1I2kcY\"><field name=\"BOOL\">FALSE</field></block></value><value name=\"ExtendLeft\"><block type=\"logic_boolean\" id=\"o:cSTHdhV2T*9BpwP/(Q\"><field name=\"BOOL\">FALSE</field></block></value><value name=\"ExtendRight\"><block type=\"logic_boolean\" id=\"S[E^!+z6{iB%=$M9ZsA,\"><field name=\"BOOL\">FALSE</field></block></value></block></value><next><block type=\"bitbybit.draw.drawAnyAsyncNoReturn\" id=\"1*R7-9G?ZFpUaEaZLJ{!\"><value name=\"Entity\"><block type=\"bitbybit.occt.shapes.wire.createRectangleWire\" id=\"Kc#iGUz(cE^,qr~Cq@^A\"><value name=\"Width\"><block type=\"variables_get\" id=\"E+9yUqFKVO9y`TFc00^G\"><field name=\"VAR\" id=\"f8PoBNR-.1tv@(Gxyi-#\">width</field></block></value><value name=\"Length\"><block type=\"variables_get\" id=\"B5O!LNy4fd/A71:oL:^}\"><field name=\"VAR\" id=\"~xh.~H^Ri7Krz?l}#htu\">height</field></block></value><value name=\"Center\"><block type=\"bitbybit.point.pointXYZ\" id=\"K9t#DtEU37-h1KnBtm2c\"><value name=\"X\"><block type=\"math_number\" id=\"ec_4.ARKAd9ZFeXgFFK(\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\" id=\"+aWWhTAr:2LH!95-`AKC\"><field name=\"NUM\">0</field></block></value><value name=\"Z\"><block type=\"math_number\" id=\"ZWwKg1^Ix3T{x~l)Cb_l\"><field name=\"NUM\">0</field></block></value></block></value><value name=\"Direction\"><block type=\"bitbybit.vector.vectorXYZ\" id=\"6I%OGKI@B*^ffm~Oh6G*\"><value name=\"X\"><block type=\"math_number\" id=\"G#CzRTU_O;@i(0)HTy[q\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\" id=\"yiKXk(cld$EJN|m-MM9u\"><field name=\"NUM\">1</field></block></value><value name=\"Z\"><block type=\"math_number\" id=\"s1dDq9nefu+4:p1#d92m\"><field name=\"NUM\">0</field></block></value></block></value></block></value></block></next></block></next></block></next></block></xml>","version":"0.20.13","type":"blockly"}}
    title="Creating hexagon grids"
    />
</TabItem>
<TabItem value="typescript" label="TypeScript">
<BitByBitRenderCanvas
    requireManualStart={true}
    script={{"script":"const { HexagonsInGridDto, RectangleDto } = Bit.Inputs.OCCT;\n// Import required types\ntype TopoDSWirePointer = Bit.Inputs.OCCT.TopoDSWirePointer;\ntype Point3 = Bit.Inputs.Base.Point3;\ntype Vector3 = Bit.Inputs.Base.Vector3;\n\n// Define the main function\nconst start = async () => {\n    // Define grid dimensions\n    const gridWidth = 16.5;\n    const gridHeight = 9;\n    const hexagonsInWidth = 23;\n    const hexagonsInHeight = 18;\n\n    // Create hexagonal grid parameters\n    const hexGridOptions = new HexagonsInGridDto();\n    hexGridOptions.width = gridWidth;\n    hexGridOptions.height = gridHeight;\n    hexGridOptions.nrHexagonsInWidth = hexagonsInWidth;\n    hexGridOptions.nrHexagonsInHeight = hexagonsInHeight;\n    hexGridOptions.flatTop = false; // Pointed-top hexagons\n    hexGridOptions.extendTop = false;\n    hexGridOptions.extendBottom = false;\n    hexGridOptions.extendLeft = false;\n    hexGridOptions.extendRight = false;\n\n    // Generate the hexagon grid\n    const hexagonWires = await bitbybit.occt.shapes.wire.hexagonsInGrid(hexGridOptions);\n\n    // Create a boundary rectangle for reference\n    const boundaryOptions = new RectangleDto();\n    boundaryOptions.width = gridWidth;\n    boundaryOptions.length = gridHeight;\n    boundaryOptions.center = [0, 0, 0] as Point3;\n    boundaryOptions.direction = [0, 1, 0] as Vector3;\n\n    const boundaryWire = await bitbybit.occt.shapes.wire.createRectangleWire(boundaryOptions);\n\n    // Draw the hexagon grid and boundary\n    bitbybit.draw.drawAnyAsync({ entity: hexagonWires });\n    bitbybit.draw.drawAnyAsync({ entity: boundaryWire });\n}\n\n// Execute the function\nstart();","version":"0.20.13","type":"typescript"}}
    title="Creating hexagon grids"
    />
</TabItem>
</Tabs>

## Creating Your First Hexagon Grid

This example demonstrates the fundamental approach to creating hexagonal wire grids. We start by defining the overall dimensions through `width` and `height` parameters, then specify how many hexagons we want to fit within those boundaries.

The pattern emerges from the intersection of geometric constraints and design intent. By setting `nrHexagonsInWidth` to 13 and `nrHexagonsInHeight` to 18, we create a fine-grained grid where each hexagon is automatically sized to maintain proper proportions while filling the available space.

The `flatTop` parameter controls orientation - when set to false, hexagons appear with pointed tops, creating the classic "honeycomb" appearance. The extension parameters remain false, keeping the grid neatly contained within its specified boundaries.

A boundary rectangle is included for visual reference, helping you understand how the hexagonal pattern relates to its defining dimensions. This rectangle represents the target area that the hexagons fill, demonstrating the precision with which the grid system fits patterns to specified constraints.
