---
sidebar_position: 2
title: Color Usage Examples
sidebar_label: Color Usage Examples
description: Learn how to use colors and apply them to 3D geometry in Bitbybit with examples in Rete, Blockly, and TypeScript.
tags: [code, color, rete, blockly, typescript]
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import BitByBitRenderCanvas from '@site/src/components/BitByBitRenderCanvas';

# Applying Colors to 3D Geometry

<img 
  class="category-icon-small" 
  src="https://s.bitbybit.dev/assets/icons/white/color-icon.svg" 
  alt="Color category icon" 
  title="Color category icon" /> 

Colors are essential for visualizing and differentiating objects in your 3D scenes. This tutorial demonstrates how to:

1.  **Create colors:** Using different methods from the `Color` class.
2.  **Apply these colors:** To the faces and edges of a 3D shape (a cube in this case).

We'll explore this using Rete (visual nodes), Blockly (visual blocks), and TypeScript (code). All examples will draw a cube and allow you to dynamically change its face color while keeping its edge color fixed.

For detailed information on each color function, please refer to the [Color API Documentation](https://docs.bitbybit.dev/classes/Bit.Color.html).

## The Core Idea: Defining and Using Colors

Bitbybit primarily uses **hexadecimal (hex) color strings** (e.g., `#FF0000` for red) when applying colors to drawn objects. The `Color` class provides tools to:

*   **Directly define a hex color:** If you know the hex code.
*   **Convert RGB to Hex:** If you have Red, Green, and Blue (RGB) values, you can convert them into a hex string. This is useful for creating colors programmatically or dynamically.

In these examples, we'll:
*   Create a cube using OpenCascade Technology (OCCT) via `bitbybit.occt.shapes.solid.createCube`.
*   Use `bitbybit.color.rgbToHex` to dynamically create a hex color for the cube's faces.
*   Use `bitbybit.color.hexColor` to define a fixed hex color for the cube's edges.
*   Apply these colors when drawing the cube using `bitbybit.draw.drawAnyAsync` with appropriate drawing options.

## Live Examples

Click through the tabs below to see the implementation. You can interact with the "Number Slider" in the Rete example or change the `colorParam` in Blockly/TypeScript to see the cube's face color update.

<Tabs groupId="vectors-live-examples">
<TabItem value="rete" label="Rete">
    <BitByBitRenderCanvas
    requireManualStart={true}
    script={{"script":"{\"id\":\"rete-v2-json\",\"nodes\":{\"1edcd326bca71db9\":{\"id\":\"1edcd326bca71db9\",\"name\":\"bitbybit.math.numberSlider\",\"customName\":\"number slider\",\"data\":{\"options\":{\"min\":0,\"max\":255,\"step\":0.1,\"width\":350,\"updateOnDrag\":false},\"number\":71.1},\"inputs\":{},\"position\":[180.19574181641272,1338.7582581486993]},\"769e2845f3e8f14e\":{\"id\":\"769e2845f3e8f14e\",\"name\":\"bitbybit.color.rgbToHex\",\"customName\":\"rgb to hex\",\"async\":false,\"drawable\":false,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"r\":255,\"g\":0,\"b\":255,\"min\":0,\"max\":255},\"inputs\":{\"r\":{\"connections\":[{\"node\":\"1edcd326bca71db9\",\"output\":\"result\",\"data\":{}}]},\"b\":{\"connections\":[{\"node\":\"1edcd326bca71db9\",\"output\":\"result\",\"data\":{}}]}},\"position\":[699.3462246539564,1252.9838222454043]},\"bcdc3b70d3a8359a\":{\"id\":\"bcdc3b70d3a8359a\",\"name\":\"bitbybit.occt.shapes.solid.createCube\",\"customName\":\"cube\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":true,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"size\":6,\"center\":[0,0,0],\"originOnCenter\":true},\"inputs\":{},\"position\":[1125.2182618459733,824.1816189607747]},\"6ca6ab70637cce68\":{\"id\":\"6ca6ab70637cce68\",\"name\":\"bitbybit.draw.drawAnyAsync\",\"customName\":\"draw any async\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false}},\"inputs\":{\"options\":{\"connections\":[{\"node\":\"ea659597d36f4c4a\",\"output\":\"result\",\"data\":{}}]},\"entity\":{\"connections\":[{\"node\":\"bcdc3b70d3a8359a\",\"output\":\"result\",\"data\":{}}]}},\"position\":[1608.9491866799408,972.1859613807756]},\"ea659597d36f4c4a\":{\"id\":\"ea659597d36f4c4a\",\"name\":\"bitbybit.draw.optionsOcctShapeSimple\",\"customName\":\"options occt shape simple\",\"async\":false,\"drawable\":false,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"precision\":0.01,\"drawFaces\":true,\"faceColour\":\"#ff0000\",\"drawEdges\":true,\"edgeColour\":\"#ffffff\",\"edgeWidth\":10},\"inputs\":{\"faceColour\":{\"connections\":[{\"node\":\"769e2845f3e8f14e\",\"output\":\"result\",\"data\":{}}]},\"edgeColour\":{\"connections\":[{\"node\":\"005c5f3ae7cc62fd\",\"output\":\"result\",\"data\":{}}]}},\"position\":[1118.9540120112902,1174.0527117682532]},\"005c5f3ae7cc62fd\":{\"id\":\"005c5f3ae7cc62fd\",\"name\":\"bitbybit.color.hexColor\",\"customName\":\"hex color\",\"async\":false,\"drawable\":false,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"color\":\"#ffffff\"},\"inputs\":{},\"position\":[698.0846241884296,1673.970997209529]}}}","version":"0.20.5","type":"rete"}}
    title="Color Usage Example"
    />
</TabItem>
<TabItem value="blockly" label="Blockly">
  <BitByBitRenderCanvas
    requireManualStart={true}
    script={{"script":"<xml xmlns=\"https://developers.google.com/blockly/xml\"><variables><variable id=\"ou3V^EMJ9J08Qg;#)~1q\">colorParam</variable><variable id=\"M62PH(qQgTe~]sDDIuOP\">faceColor</variable><variable id=\"LRFU/eK]P~/NYo4*=j6?\">edgeColor</variable></variables><block type=\"variables_set\" id=\"38iZ[`_XIZhPf6Y(Pl;3\" x=\"-44\" y=\"-713\"><field name=\"VAR\" id=\"ou3V^EMJ9J08Qg;#)~1q\">colorParam</field><value name=\"VALUE\"><block type=\"math_number\" id=\"k9S%^!NS%^I:9S^@0WVm\"><field name=\"NUM\">0</field></block></value><next><block type=\"variables_set\" id=\"Rvimt/4oW~9_hD$SbQ[p\"><field name=\"VAR\" id=\"M62PH(qQgTe~]sDDIuOP\">faceColor</field><value name=\"VALUE\"><block type=\"bitbybit.color.rgbToHex\" id=\"rOVeF[Ic=b-sD#]1-~;:\"><value name=\"R\"><block type=\"variables_get\" id=\",@s$V~g[}qu1,w?VJojv\"><field name=\"VAR\" id=\"ou3V^EMJ9J08Qg;#)~1q\">colorParam</field></block></value><value name=\"G\"><block type=\"math_number\" id=\"wH1|Q1ht/tWhngAsrGFN\"><field name=\"NUM\">255</field></block></value><value name=\"B\"><block type=\"variables_get\" id=\",;9LOnS|V7*gyTNw:Y60\"><field name=\"VAR\" id=\"ou3V^EMJ9J08Qg;#)~1q\">colorParam</field></block></value><value name=\"Min\"><block type=\"math_number\" id=\":j{p0?[jb4:{T9Y)}s|3\"><field name=\"NUM\">0</field></block></value><value name=\"Max\"><block type=\"math_number\" id=\"amrfpG8;8m(|Y.dThgaP\"><field name=\"NUM\">255</field></block></value></block></value><next><block type=\"variables_set\" id=\"m{InLt}Pa?%2:0a?}:BV\"><field name=\"VAR\" id=\"LRFU/eK]P~/NYo4*=j6?\">edgeColor</field><value name=\"VALUE\"><block type=\"bitbybit.color.hexColor\" id=\"wkSZyf8CvM3?!{%ekD.*\"><value name=\"Color\"><block type=\"colour_picker\" id=\"W~#?iL)/so7+9d||BMx]\"><field name=\"COLOUR\">#0000ff</field></block></value></block></value><next><block type=\"bitbybit.draw.drawAnyAsyncNoReturn\" id=\"OW6M.~AOM{Wc8{@:QSnI\"><value name=\"Entity\"><block type=\"bitbybit.occt.shapes.solid.createCube\" id=\"W_g)j=?pu1UZX6m9ikvy\"><value name=\"Size\"><block type=\"math_number\" id=\"PK@4;(K|%eZk3FlO%,Og\"><field name=\"NUM\">6</field></block></value><value name=\"Center\"><block type=\"bitbybit.point.pointXYZ\" id=\"EDLTe3VDq,d]I=9Sd=pA\"><value name=\"X\"><block type=\"math_number\" id=\"j;`E]11QQ=LMwiIEQP%2\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\" id=\"8THcRcMfqjLEvoE-|mS4\"><field name=\"NUM\">0</field></block></value><value name=\"Z\"><block type=\"math_number\" id=\"-HdCtxnF=!gWm(n7~F`h\"><field name=\"NUM\">0</field></block></value></block></value><value name=\"OriginOnCenter\"><block type=\"logic_boolean\" id=\"EikmG(m^B@.wHf]mbr.t\"><field name=\"BOOL\">TRUE</field></block></value></block></value><value name=\"Options\"><block type=\"bitbybit.draw.optionsOcctShapeSimple\" id=\"Xer|SXX?3(;:_$]nJd~4\"><value name=\"Precision\"><block type=\"math_number\" id=\"XDC1n5`jM4M`~oidXawI\"><field name=\"NUM\">0.01</field></block></value><value name=\"DrawFaces\"><block type=\"logic_boolean\" id=\"JFm=4(8;;l!P=}3!17NU\"><field name=\"BOOL\">TRUE</field></block></value><value name=\"FaceColour\"><block type=\"variables_get\" id=\"qM@e$@,a],p7vg}V0)X,\"><field name=\"VAR\" id=\"M62PH(qQgTe~]sDDIuOP\">faceColor</field></block></value><value name=\"DrawEdges\"><block type=\"logic_boolean\" id=\"k;_gkrL6|CW_#6B=|VRY\"><field name=\"BOOL\">TRUE</field></block></value><value name=\"EdgeColour\"><block type=\"variables_get\" id=\"|vFZK~zc@kNEBZ((HEPt\"><field name=\"VAR\" id=\"LRFU/eK]P~/NYo4*=j6?\">edgeColor</field></block></value><value name=\"EdgeWidth\"><block type=\"math_number\" id=\"j4zOo{{[w0;x]Fsw6+7;\"><field name=\"NUM\">10</field></block></value></block></value></block></next></block></next></block></next></block></xml>","version":"0.20.5","type":"blockly"}}
    title="Color Usage Example"
    />
</TabItem>
<TabItem value="typescript" label="TypeScript">
<BitByBitRenderCanvas
    requireManualStart={true}
    script={{"script":"const start = async () => {\n\n    const colorParam = 55;\n    const rgbToHexOptions = new Bit.Inputs.Color.RGBMinMaxDto();\n    rgbToHexOptions.r = colorParam;\n    rgbToHexOptions.b = colorParam;\n    const faceColor = bitbybit.color.rgbToHex(rgbToHexOptions);\n\n    // This might look strange as you could just assign the string to edgeColor directly, \n    // but this identity function is nice to have in visual prgramming editors - check Rete & Blockly\n    // examples\n    \n    const edgeColor = bitbybit.color.hexColor({ color: \"#ff0000\" });\n\n    const cubeOptions = new Bit.Inputs.OCCT.CubeDto();\n    cubeOptions.size = 6;\n    const cube = await bitbybit.occt.shapes.solid.createCube(cubeOptions);\n\n    const drawOpt = new Bit.Inputs.Draw.DrawOcctShapeSimpleOptions();\n    drawOpt.faceColour = faceColor;\n    drawOpt.edgeColour = edgeColor;\n    drawOpt.edgeWidth = 10;\n    bitbybit.draw.drawAnyAsync({ entity: cube, options: drawOpt });\n}\n\nstart();","version":"0.20.5","type":"typescript"}}
    title="Color Usage Example"
    />
</TabItem>
</Tabs>

## Conclusion

These examples illustrate basic yet powerful ways to manage and apply colors in Bitbybit.
*   For static colors, defining them directly as hex strings (optionally via `color.hexColor`) is straightforward.
*   For dynamic or programmatically generated colors, converting from RGB values (using `color.rgbToHex`) provides great flexibility.

Experiment with different RGB values and hex codes to explore the color possibilities for your 3D creations!