---
sidebar_position: 3
title: Point Hex Grid Examples
sidebar_label: Point Hex Grid Examples
description: Learn how to generate a hexagonal grid of points and hexagon outlines using Bitbybit's Point class, with examples in Rete, Blockly, and TypeScript.
tags: [code, point, rete, blockly, typescript]
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import BitByBitRenderCanvas from '@site/src/components/BitByBitRenderCanvas';
import Admonition from '@theme/Admonition';

# Creating a Hexagonal Grid of Points and Outlines

<img 
  class="category-icon-small" 
  src="https://s.bitbybit.dev/assets/icons/white/point-icon.svg" 
  alt="Point category icon" 
  title="Point category icon" /> 

Hexagonal grids are a common and visually appealing pattern found in nature and design. The `Point` class in Bitbybit provides a powerful method, `hexGridScaledToFit()`, to generate such grids. This tutorial demonstrates how to:

1.  **Generate a hexagonal grid:** Using `point.hexGridScaledToFit()`, specifying dimensions and counts.
2.  **Extract data from the result:** The method returns an object containing both the `centers` of the hexagons and the `hexagons` themselves (as lists of corner points).
3.  **Visualize the grid:** Draw the center points and create polylines for the hexagon outlines.

We'll explore this using Rete (visual nodes), Blockly (visual blocks), and TypeScript (code). All examples will generate a hexagonal grid, draw its center points, and draw the outlines of each hexagon.

For detailed information on the hex grid functions, please refer to the [Point API Documentation](https://docs.bitbybit.dev/classes/Bit.Point.html).

## The Core Idea: Scaled Hexagonal Grids

The `point.hexGridScaledToFit()` method is designed to create a grid of hexagons that precisely fits within a specified `width` and `height`, given a desired number of hexagons in width (`nrHexagonsInWidth`) and height (`nrHexagonsInHeight`).

Key aspects of this method:
*   **Output Structure:** It returns an object (a JSON-like structure) containing:
    *   `centers`: A list of 3D points representing the center of each hexagon in the grid.
    *   `hexagons`: A list, where each item is another list of 6 points representing the vertices (corners) of a single hexagon.
    *   It also includes `shortestDistEdge`, `longestDistEdge`, and `maxFilletRadius` for the generated hexagons.
*   **Parameters:** You can control various aspects like whether the hexagons are `flatTop`, if the grid should be `centerGrid` (centered at the origin `[0,0,0]`), and if the points should be projected onto the ground plane (`pointsOnGround`, i.e., Z=0 for centers and Y=0 for vertices if originally on XY).
*   **Visualization:** To see the grid, we'll:
    1.  Extract the `centers` and draw them directly.
    2.  Iterate through the `hexagons` list. For each list of 6 corner points, create a closed `Polyline` and then draw these polylines.

<Admonition type="info" title="JSON Handling">
    Since `hexGridScaledToFit()` returns an object, we'll use JSON utility functions (like `JSON Get Value on Prop`) to extract the `centers` and `hexagons` arrays from the result in the Rete and Blockly examples.
</Admonition>

## Live Examples

Click through the tabs below to see the implementation. Each example will generate and display a hexagonal grid.
  
<Tabs groupId="vectors-live-examples">
<TabItem value="rete" label="Rete">
    <BitByBitRenderCanvas
    requireManualStart={true}
    script={{"script":"{\"id\":\"rete-v2-json\",\"nodes\":{\"7729fd4f544e72fc\":{\"id\":\"7729fd4f544e72fc\",\"name\":\"bitbybit.point.hexGridScaledToFit\",\"customName\":\"hex grid scaled to fit\",\"async\":false,\"drawable\":false,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"width\":20,\"height\":10,\"nrHexagonsInWidth\":10,\"nrHexagonsInHeight\":10,\"flatTop\":false,\"extendTop\":false,\"extendBottom\":false,\"extendLeft\":false,\"extendRight\":false,\"centerGrid\":true,\"pointsOnGround\":false},\"inputs\":{},\"position\":[608.7164842348694,1018.0652542973968]},\"4fca946a7b216f6c\":{\"id\":\"4fca946a7b216f6c\",\"name\":\"bitbybit.json.getValueOnProp\",\"customName\":\"get value on prop\",\"async\":false,\"drawable\":false,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"property\":\"centers\"},\"inputs\":{\"json\":{\"connections\":[{\"node\":\"7729fd4f544e72fc\",\"output\":\"result\",\"data\":{}}]}},\"position\":[1081.1659092469044,810.2335976865959]},\"4026d981aa5027a5\":{\"id\":\"4026d981aa5027a5\",\"name\":\"bitbybit.json.getValueOnProp\",\"customName\":\"get value on prop\",\"async\":false,\"drawable\":false,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"property\":\"hexagons\"},\"inputs\":{\"json\":{\"connections\":[{\"node\":\"7729fd4f544e72fc\",\"output\":\"result\",\"data\":{}}]}},\"position\":[1088.8870485676737,1234.010004531764]},\"a510eab4a87374e4\":{\"id\":\"a510eab4a87374e4\",\"name\":\"bitbybit.draw.drawAnyAsync\",\"customName\":\"draw any async\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false}},\"inputs\":{\"entity\":{\"connections\":[{\"node\":\"4fca946a7b216f6c\",\"output\":\"result\",\"data\":{}}]}},\"position\":[1451.9911428758057,804.930108808127]},\"16c7925dd6061a88\":{\"id\":\"16c7925dd6061a88\",\"name\":\"bitbybit.polyline.create\",\"customName\":\"polyline\",\"async\":false,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"isClosed\":true},\"inputs\":{\"points\":{\"connections\":[{\"node\":\"2a4323a3364861cb\",\"output\":\"result\",\"data\":{}}]}},\"position\":[1838.5998037327245,1232.8246930600817]},\"2a4323a3364861cb\":{\"id\":\"2a4323a3364861cb\",\"name\":\"bitbybit.lists.flatten\",\"customName\":\"flatten\",\"data\":{\"nrLevels\":1},\"inputs\":{\"list\":{\"connections\":[{\"node\":\"4026d981aa5027a5\",\"output\":\"result\",\"data\":{}}]}},\"position\":[1469.4576764247172,1271.430759087884]}}}","type":"rete"}}
    title="Point Hex Grid Example"
    />
</TabItem>
<TabItem value="blockly" label="Blockly">
  <BitByBitRenderCanvas
    requireManualStart={true}
    script={{"script":"<xml xmlns=\"https://developers.google.com/blockly/xml\"><variables><variable id=\"snfo^`s7qhTaFo`_+]fK\">hexagons</variable><variable id=\"4#}{gv*Z0ysf[dRdL43/\">points</variable><variable id=\"oKDKa=L7$j{A`yX[6zD8\">hexCorners</variable><variable id=\"MPW,mXxtq)Wb!BKH/P?3\">hexPolylines</variable><variable id=\"rYT?1[@5G$SC#J#,5MnI\">i</variable></variables><block type=\"variables_set\" id=\"aun`u/C8J1kDwFXugSxB\" x=\"-336\" y=\"-263\"><field name=\"VAR\" id=\"snfo^`s7qhTaFo`_+]fK\">hexagons</field><value name=\"VALUE\"><block type=\"bitbybit.point.hexGridScaledToFit\" id=\"-w4sVF;TmJl#Mngwrvfv\"><value name=\"Width\"><block type=\"math_number\" id=\"2BgM:hOwqGIeirDN~hHn\"><field name=\"NUM\">20</field></block></value><value name=\"Height\"><block type=\"math_number\" id=\"]1w[7(Z.0Fxs};A,`L{5\"><field name=\"NUM\">10</field></block></value><value name=\"NrHexagonsInWidth\"><block type=\"math_number\" id=\"`9j%3`81C)}fDLCevZ,S\"><field name=\"NUM\">10</field></block></value><value name=\"NrHexagonsInHeight\"><block type=\"math_number\" id=\"aP0y8E2TV4E/5;4AA;]=\"><field name=\"NUM\">10</field></block></value><value name=\"FlatTop\"><block type=\"logic_boolean\" id=\"s~n##Mc,g0yq2|;@=$Nf\"><field name=\"BOOL\">FALSE</field></block></value><value name=\"ExtendTop\"><block type=\"logic_boolean\" id=\"63Cf|CcHg7fy!6f4yi{5\"><field name=\"BOOL\">FALSE</field></block></value><value name=\"ExtendBottom\"><block type=\"logic_boolean\" id=\":DK*VdC556w5bcJ/817I\"><field name=\"BOOL\">FALSE</field></block></value><value name=\"ExtendLeft\"><block type=\"logic_boolean\" id=\"m1?MGN6ADj*!YeG/1PP~\"><field name=\"BOOL\">FALSE</field></block></value><value name=\"ExtendRight\"><block type=\"logic_boolean\" id=\"2$^rAcqmAQO4:oGGx{/1\"><field name=\"BOOL\">FALSE</field></block></value><value name=\"CenterGrid\"><block type=\"logic_boolean\" id=\"9@lQ4t^?jvLC;pG(c}Q3\"><field name=\"BOOL\">TRUE</field></block></value><value name=\"PointsOnGround\"><block type=\"logic_boolean\" id=\"L=F]cgq$d:#wNVS-8RRL\"><field name=\"BOOL\">FALSE</field></block></value></block></value><next><block type=\"variables_set\" id=\"dqax4Iak3[X:vWXI^PUd\"><field name=\"VAR\" id=\"4#}{gv*Z0ysf[dRdL43/\">points</field><value name=\"VALUE\"><block type=\"bitbybit.json.getValueOnProp\" id=\"lT:-lQlP-};fh9)H%oOh\"><value name=\"Json\"><block type=\"variables_get\" id=\"s{X=sBMe4ObumM02RITj\"><field name=\"VAR\" id=\"snfo^`s7qhTaFo`_+]fK\">hexagons</field></block></value><value name=\"Property\"><block type=\"text\" id=\"V^qVvhu4-v-#j7qN~/FU\"><field name=\"TEXT\">centers</field></block></value></block></value><next><block type=\"variables_set\" id=\"Pvl+t-(B%S(j5rH]pi]k\"><field name=\"VAR\" id=\"oKDKa=L7$j{A`yX[6zD8\">hexCorners</field><value name=\"VALUE\"><block type=\"bitbybit.json.getValueOnProp\" id=\"Fv]n/7udmr.S8+`/Me}@\"><value name=\"Json\"><block type=\"variables_get\" id=\"h_fx{kQbtB]#CV82{]={\"><field name=\"VAR\" id=\"snfo^`s7qhTaFo`_+]fK\">hexagons</field></block></value><value name=\"Property\"><block type=\"text\" id=\":K4PKshG8AGvx}dMp|MZ\"><field name=\"TEXT\">hexagons</field></block></value></block></value><next><block type=\"variables_set\" id=\"=aonGMd}+?x][vB!i.X.\"><field name=\"VAR\" id=\"MPW,mXxtq)Wb!BKH/P?3\">hexPolylines</field><value name=\"VALUE\"><block type=\"lists_create_with\" id=\"c:0|}rLdV.~yhihDkr;+\"><mutation items=\"0\"></mutation></block></value><next><block type=\"controls_forEach\" id=\"bP_2s,_,yAt(MvHTLM_S\"><field name=\"VAR\" id=\"rYT?1[@5G$SC#J#,5MnI\">i</field><value name=\"LIST\"><block type=\"variables_get\" id=\"%[/X{;jP?.BE9bI#t=Rj\"><field name=\"VAR\" id=\"oKDKa=L7$j{A`yX[6zD8\">hexCorners</field></block></value><statement name=\"DO\"><block type=\"lists_setIndex\" id=\"$k_`[1:k(~,VcWk`_dO?\"><mutation at=\"false\"></mutation><field name=\"MODE\">INSERT</field><field name=\"WHERE\">LAST</field><value name=\"LIST\"><block type=\"variables_get\" id=\"+O;6tF`7orW(VGPpn)Y1\"><field name=\"VAR\" id=\"MPW,mXxtq)Wb!BKH/P?3\">hexPolylines</field></block></value><value name=\"TO\"><block type=\"bitbybit.polyline.create\" id=\"h3fr]v(.~FFlQ+a%C^Pc\"><value name=\"Points\"><block type=\"variables_get\" id=\"o#r~|*kO+;IzL!NsL:kG\"><field name=\"VAR\" id=\"rYT?1[@5G$SC#J#,5MnI\">i</field></block></value><value name=\"IsClosed\"><block type=\"logic_boolean\" id=\"H.E]e^`JBNsj$EE;`ZeJ\"><field name=\"BOOL\">TRUE</field></block></value></block></value></block></statement><next><block type=\"bitbybit.draw.drawAnyAsyncNoReturn\" id=\"7c$$])((|)SH|2i0kuPl\"><value name=\"Entity\"><block type=\"variables_get\" id=\"%6~Wwy^^p8:$l.F*W6nK\"><field name=\"VAR\" id=\"4#}{gv*Z0ysf[dRdL43/\">points</field></block></value><next><block type=\"bitbybit.draw.drawAnyAsyncNoReturn\" id=\"GXc.m@](t-)7bV^W_q(?\"><value name=\"Entity\"><block type=\"variables_get\" id=\"i%MbFlna)JYFdbWMf;A-\"><field name=\"VAR\" id=\"MPW,mXxtq)Wb!BKH/P?3\">hexPolylines</field></block></value></block></next></block></next></block></next></block></next></block></next></block></next></block></xml>","type":"blockly"}}
    title="Point Hex Grid Example"
    />
</TabItem>
<TabItem value="typescript" label="TypeScript">
<BitByBitRenderCanvas
    requireManualStart={true}
    script={{"script":"const start = () => {\n\n    // 1. Configure the hexagonal grid options\n    const hexOptions = new Bit.Inputs.Point.HexGridScaledToFitDto();\n    // Set options different from defaults. \n    // TypeScript IntelliSense (e.g., typing \"hexOptions.\") will show all available parameters.\n    hexOptions.width = 20;\n    hexOptions.height = 10;\n    hexOptions.nrHexagonsInWidth = 10;\n    hexOptions.nrHexagonsInHeight = 10;\n    hexOptions.centerGrid = true; // Center the entire grid at the world origin [0,0,0]\n    // Example: hexOptions.flatTop = true; // To get flat-topped hexagons\n    // Example: hexOptions.pointsOnGround = true; // To project to XZ plane if original is XY\n\n    // 2. Generate the hex grid data\n    // This function returns an object like: \n    // { centers: Point3[], hexagons: Point3[][], shortestDistEdge, longestDistEdge, maxFilletRadius }\n    const hexResult = bitbybit.point.hexGridScaledToFit(hexOptions);\n\n    // 3. Create polylines for each hexagon's outline\n    // hexResult.hexagons is a list of lists (e.g., [[v1,v2..v6 for hex1], [v1,v2..v6 for hex2], ...])\n    // We .map() over this list to create a Polyline object for each hexagon.\n    const polylines = hexResult.hexagons.map(singleHexagonCornerPoints => {\n        const polylineOptions = new Bit.Inputs.Polyline.PolylineCreateDto();\n        polylineOptions.points = singleHexagonCornerPoints; // The 6 corner points\n        polylineOptions.isClosed = true;                  // Ensure the polyline forms a closed loop\n        return bitbybit.polyline.create(polylineOptions);\n    }) as Bit.Inputs.Base.Polyline3[]; // Type assertion: the result is an array of Polyline3 objects\n\n    // 4. Draw the center points of the hexagons\n    // hexResult.centers is a list of 3D points: [[cx1,cy1,cz1], [cx2,cy2,cz2], ...]\n    bitbybit.draw.drawAnyAsync({ entity: hexResult.centers });\n\n    // 5. Draw the polylines representing the hexagon outlines\n    bitbybit.draw.drawAnyAsync({ entity: polylines });\n\n}\n\nstart();","type":"typescript"}}
    title="Point Hex Grid Example"
    />
</TabItem>

</Tabs>

## Conclusion

The `point.hexGridScaledToFit()` method provides a flexible way to generate complex hexagonal grid patterns. By extracting the `centers` and `hexagons` data from its result, you can easily visualize the grid or use these points and outlines for further geometric operations, such as creating 3D hexagonal prisms or tiling surfaces.

Experiment with the various parameters of `hexGridScaledToFit()` like `flatTop`, `extend` options, and `pointsOnGround` to create different grid configurations!