---
sidebar_position: 2
title: Vector Span and Ease Examples
sidebar_label: Span and Ease Examples
description: Learn how to use vector span and easing functions to create interesting point distributions for drawing in Bitbybit, with examples in Rete, Blockly, and TypeScript.
tags: [code, vector, rete, blockly, typescript]
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import BitByBitRenderCanvas from '@site/src/components/BitByBitRenderCanvas';

# Vector Span and Easing for Point Generation

<img 
  class="category-icon-small" 
  src="https://s.bitbybit.dev/assets/icons/white/vector-icon.svg" 
  alt="Vector category icon" 
  title="Vector category icon" /> 
  
This tutorial demonstrates how to use the `vector.span()` and `vector.spanEaseItems()` methods in Bitbybit to generate sequences of numbers. We'll then combine these sequences to create 3D vectors (points) and visualize them in the 3D canvas. This is a common technique for creating controlled distributions of objects or defining paths.

We will explore how to achieve this using three different programming environments available in Bitbybit: Rete (a visual node-based editor), Blockly (a visual block-based editor), and TypeScript (a text-based programming language).

**The Goal:**

Our goal is to generate a series of points where:
*   The **X-coordinates** are linearly spaced.
*   The **Y-coordinates** are spaced according to an "Ease In Sine" easing function.
*   The **Z-coordinates** are all zero.

This will result in a curve that starts moving slowly in the Y direction and then accelerates.

## Core Concepts Used

Before diving into the examples, let's briefly review the key Bitbybit vector functions we'll be using:

1.  **`vector.span()`**:
    *   Creates an array of numbers linearly spaced between a `min` and `max` value, with a defined `step`.
    *   We'll use this to generate our X-coordinates.

2.  **`vector.spanEaseItems()`**:
    *   Creates an array of numbers between a `min` and `max` value, but the spacing is determined by an `ease` function (e.g., "easeInSine", "easeOutQuad", etc.) and a specified `nrItems` (number of items).
    *   We'll use this to generate our Y-coordinates. The number of items will be matched to the length of the array produced by `vpan()`.

3.  **`vector.vectorXYZ()`** (or direct array creation in TypeScript/Blockly):
    *   Takes X, Y, and Z numbers and combines them into a 3D vector `[x, y, z]`.

4.  **`draw.drawAnyAsync()`** (or equivalent draw blocks):
    *   Takes an entity or an array of entities (like our generated vectors/points) and draws them in the 3D scene.

5.  **`draw.drawGridMesh()`**:
    *   Draws a helper grid in the scene for better visualization.

## Live Examples

Click through the tabs below to see the implementation in Rete, Blockly, and TypeScript. Each example will produce the same visual output: a series of points forming a curve.

<Tabs groupId="vectors-live-examples">
<TabItem value="rete" label="Rete">
    <BitByBitRenderCanvas
    requireManualStart={true}
    script={{"script":"{\"id\":\"rete-v2-json\",\"nodes\":{\"5cf30d5c6639e560\":{\"id\":\"5cf30d5c6639e560\",\"name\":\"bitbybit.draw.drawGridMesh\",\"customName\":\"draw grid mesh\",\"async\":false,\"drawable\":false,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"width\":400,\"height\":400,\"subdivisions\":10,\"majorUnitFrequency\":10,\"minorUnitVisibility\":0.45,\"gridRatio\":0.5,\"opacity\":0.5,\"backFaceCulling\":false,\"mainColor\":\"#ffffff\",\"secondaryColor\":\"#ffffff\"},\"inputs\":{},\"position\":[89.89453125,489.30859375]},\"eff3bc8c20fd6b9a\":{\"id\":\"eff3bc8c20fd6b9a\",\"name\":\"bitbybit.vector.spanEaseItems\",\"customName\":\"span ease items\",\"async\":false,\"drawable\":false,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"nrItems\":100,\"min\":0,\"max\":5,\"ease\":\"easeInSine\",\"intervals\":false},\"inputs\":{\"nrItems\":{\"connections\":[{\"node\":\"f2ba08af3b1f45f1\",\"output\":\"result\",\"data\":{}}]}},\"position\":[1533.593984254042,709.12875163347]},\"27acc4680c49de73\":{\"id\":\"27acc4680c49de73\",\"name\":\"bitbybit.vector.span\",\"customName\":\"span\",\"async\":false,\"drawable\":false,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"step\":0.2,\"min\":0,\"max\":5},\"inputs\":{},\"position\":[778.3558295885927,715.2367833946255]},\"f2ba08af3b1f45f1\":{\"id\":\"f2ba08af3b1f45f1\",\"name\":\"bitbybit.lists.listLength\",\"customName\":\"list length\",\"async\":false,\"drawable\":false,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"clone\":true},\"inputs\":{\"list\":{\"connections\":[{\"node\":\"27acc4680c49de73\",\"output\":\"result\",\"data\":{}}]}},\"position\":[1153.7941860253327,711.8268257314983]},\"6cc8c45bc1986c14\":{\"id\":\"6cc8c45bc1986c14\",\"name\":\"bitbybit.vector.vectorXYZ\",\"customName\":\"vector xyz\",\"async\":false,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":true,\"flatten\":0,\"forceExecution\":false},\"x\":0,\"y\":0,\"z\":0},\"inputs\":{\"x\":{\"connections\":[{\"node\":\"5a7a5529ef111031\",\"output\":\"result\",\"data\":{}}]},\"y\":{\"connections\":[{\"node\":\"02c82e567f3db188\",\"output\":\"result\",\"data\":{}}]}},\"position\":[2394.3717567099125,396.3733706201353]},\"5a7a5529ef111031\":{\"id\":\"5a7a5529ef111031\",\"name\":\"bitbybit.lists.flatten\",\"customName\":\"flatten\",\"data\":{\"nrLevels\":1},\"inputs\":{\"list\":{\"connections\":[{\"node\":\"27acc4680c49de73\",\"output\":\"result\",\"data\":{}}]}},\"position\":[1171.6411654089534,431.16608922053126]},\"02c82e567f3db188\":{\"id\":\"02c82e567f3db188\",\"name\":\"bitbybit.lists.flatten\",\"customName\":\"flatten\",\"data\":{\"nrLevels\":1},\"inputs\":{\"list\":{\"connections\":[{\"node\":\"eff3bc8c20fd6b9a\",\"output\":\"result\",\"data\":{}}]}},\"position\":[1940.93943737965,735.4822641570163]}}}","version":"0.20.12","type":"rete"}}
    title="Vector Span & Ease In Combination"
    />
</TabItem>
<TabItem value="blockly" label="Blockly">
  <BitByBitRenderCanvas
    requireManualStart={true}
    script={{"script":"<xml xmlns=\"https://developers.google.com/blockly/xml\"><variables><variable id=\"D_kb2W{4`QJqZ6W;C2c4\">spanItems</variable><variable id=\"~e2n=Nm?;sk;l+:+Nn}[\">spanEaseItems</variable><variable id=\"XmMCzB3*MGAm}.(c:?rY\">vectors</variable><variable id=\"}G,xkoV`rh=+#}4B+[[z\">j</variable></variables><block type=\"bitbybit.draw.drawGridMeshNoReturn\" id=\"@H`6p(SQI:gJbPbcL5Z?\" x=\"-232\" y=\"-708\"><value name=\"Width\"><block type=\"math_number\" id=\"N9zN%ARCF]f|0uBSn5TF\"><field name=\"NUM\">400</field></block></value><value name=\"Height\"><block type=\"math_number\" id=\"i50t|G*DY=_P0Mr5L_]K\"><field name=\"NUM\">400</field></block></value><value name=\"Subdivisions\"><block type=\"math_number\" id=\"Z-@7[n|,#L_bQI._VL$x\"><field name=\"NUM\">10</field></block></value><value name=\"MajorUnitFrequency\"><block type=\"math_number\" id=\"V`nR`~m5MK3(|kzm:AP1\"><field name=\"NUM\">10</field></block></value><value name=\"MinorUnitVisibility\"><block type=\"math_number\" id=\"@,8Ha`p],L0**(C3jAWk\"><field name=\"NUM\">0.45</field></block></value><value name=\"GridRatio\"><block type=\"math_number\" id=\"V)3e6e!BG2]m=gFn-T!h\"><field name=\"NUM\">0.5</field></block></value><value name=\"Opacity\"><block type=\"math_number\" id=\"E+F*87S0uTqzr_^k4kop\"><field name=\"NUM\">0.5</field></block></value><value name=\"BackFaceCulling\"><block type=\"logic_boolean\" id=\"q||W6+?-jS{Y1s`N8Wre\"><field name=\"BOOL\">FALSE</field></block></value><value name=\"MainColor\"><block type=\"colour_picker\" id=\"S2NU5H{,Wk3%$S}!WdIX\"><field name=\"COLOUR\">#ffffff</field></block></value><value name=\"SecondaryColor\"><block type=\"colour_picker\" id=\"-20$rAv31,S)X#5,9ywY\"><field name=\"COLOUR\">#ffffff</field></block></value><next><block type=\"variables_set\" id=\"owpp%0,57g2C~i#=W7a8\"><field name=\"VAR\" id=\"D_kb2W{4`QJqZ6W;C2c4\">spanItems</field><value name=\"VALUE\"><block type=\"bitbybit.vector.span\" id=\";I)NN9q3e}{7BvIoL5y9\"><value name=\"Step\"><block type=\"math_number\" id=\"t`]uPc^(~fFVWA0_Y-vm\"><field name=\"NUM\">0.2</field></block></value><value name=\"Min\"><block type=\"math_number\" id=\"q8mdZ-m7h{l_vx/YXg!N\"><field name=\"NUM\">0</field></block></value><value name=\"Max\"><block type=\"math_number\" id=\"0L|E,acRBOZY-wgg+[|1\"><field name=\"NUM\">5</field></block></value></block></value><next><block type=\"variables_set\" id=\"d%if#oJ9~KQrM)YfTI/I\"><field name=\"VAR\" id=\"~e2n=Nm?;sk;l+:+Nn}[\">spanEaseItems</field><value name=\"VALUE\"><block type=\"bitbybit.vector.spanEaseItems\" id=\"].0sqUXXUQ8UN7.?mGw.\"><value name=\"NrItems\"><block type=\"lists_length\" id=\"+J,hx0#muPyR(k!#:OUl\"><value name=\"VALUE\"><block type=\"variables_get\" id=\"g|xWKeu~Sc8*UnMlq66;\"><field name=\"VAR\" id=\"D_kb2W{4`QJqZ6W;C2c4\">spanItems</field></block></value></block></value><value name=\"Min\"><block type=\"math_number\" id=\"yG}-sU#Vz-AV{0K1ID|[\"><field name=\"NUM\">0</field></block></value><value name=\"Max\"><block type=\"math_number\" id=\"0jP2=?O)FWCTC`X9)S%S\"><field name=\"NUM\">5</field></block></value><value name=\"Ease\"><block type=\"bitbybit.math.enums.easeEnum\" id=\":qT0,:;d1`v{+!qWVjRl\"><field name=\"bitbybit.math.enums.easeEnum\">'easeInSine'</field></block></value><value name=\"Intervals\"><block type=\"logic_boolean\" id=\"RZ|IJ-b~}oJoP+If|F[y\"><field name=\"BOOL\">FALSE</field></block></value></block></value><next><block type=\"variables_set\" id=\"C)_b;-%I72?7$J#3~C:K\"><field name=\"VAR\" id=\"XmMCzB3*MGAm}.(c:?rY\">vectors</field><value name=\"VALUE\"><block type=\"lists_create_with\" id=\"J-D]5l9Pt7+[.;w5F3|i\"><mutation items=\"0\"></mutation></block></value><next><block type=\"controls_for\" id=\"P!Ok[H%-:w_^tKLg;94k\"><field name=\"VAR\" id=\"}G,xkoV`rh=+#}4B+[[z\">j</field><value name=\"FROM\"><block type=\"math_number\" id=\"q.(^GTYK9(:7I=$C-3*D\"><field name=\"NUM\">1</field></block></value><value name=\"TO\"><block type=\"lists_length\" id=\"[wgv;B+PZvqSmnIEbmcJ\"><value name=\"VALUE\"><block type=\"variables_get\" id=\"S4{(A_d22;#6:J1.^.jx\"><field name=\"VAR\" id=\"D_kb2W{4`QJqZ6W;C2c4\">spanItems</field></block></value></block></value><value name=\"BY\"><block type=\"math_number\" id=\"UIw_L~j+V2Imut__`Qbp\"><field name=\"NUM\">1</field></block></value><statement name=\"DO\"><block type=\"lists_setIndex\" id=\"?ZPTB/$JSZWr+=zJ6-R_\"><mutation at=\"false\"></mutation><field name=\"MODE\">INSERT</field><field name=\"WHERE\">LAST</field><value name=\"LIST\"><block type=\"variables_get\" id=\"ov3(`Cw*hnCq)M.9T4H#\"><field name=\"VAR\" id=\"XmMCzB3*MGAm}.(c:?rY\">vectors</field></block></value><value name=\"TO\"><block type=\"bitbybit.vector.vectorXYZ\" id=\"9AybOavF)~#zXYi%=b:x\"><value name=\"X\"><block type=\"lists_getIndex\" id=\"FRK/ye#/xR3(D?=EN9$z\"><mutation statement=\"false\" at=\"true\"></mutation><field name=\"MODE\">GET</field><field name=\"WHERE\">FROM_START</field><value name=\"VALUE\"><block type=\"variables_get\" id=\"%s9B)kY(ABF]Y4i#|uz:\"><field name=\"VAR\" id=\"D_kb2W{4`QJqZ6W;C2c4\">spanItems</field></block></value><value name=\"AT\"><block type=\"variables_get\" id=\"h`@wE_y{Y]:XY%1{ROv~\"><field name=\"VAR\" id=\"}G,xkoV`rh=+#}4B+[[z\">j</field></block></value></block></value><value name=\"Y\"><block type=\"lists_getIndex\" id=\"ue=efw!f~~jVMZf%)|%K\"><mutation statement=\"false\" at=\"true\"></mutation><field name=\"MODE\">GET</field><field name=\"WHERE\">FROM_START</field><value name=\"VALUE\"><block type=\"variables_get\" id=\"DRM3[bVsjUDBrgS$nIMG\"><field name=\"VAR\" id=\"~e2n=Nm?;sk;l+:+Nn}[\">spanEaseItems</field></block></value><value name=\"AT\"><block type=\"variables_get\" id=\"rKiCRW}lw;sx}il?HG6K\"><field name=\"VAR\" id=\"}G,xkoV`rh=+#}4B+[[z\">j</field></block></value></block></value><value name=\"Z\"><block type=\"math_number\" id=\"eQk_;G%rR6h[(^fLREtw\"><field name=\"NUM\">0</field></block></value></block></value></block></statement><next><block type=\"bitbybit.draw.drawAnyAsyncNoReturn\" id=\"l(2;E|=ci2Lgt[V!A393\"><value name=\"Entity\"><block type=\"variables_get\" id=\"$*u6IXc{f%ATy:ms$FBb\"><field name=\"VAR\" id=\"XmMCzB3*MGAm}.(c:?rY\">vectors</field></block></value><next><block type=\"base_io_console_log\" id=\"v$M3TW`~#xq?}XGN0oOA\"><value name=\"Text\"><block type=\"variables_get\" id=\"W/=uu^85+!|Z8Ba9S@hO\"><field name=\"VAR\" id=\"XmMCzB3*MGAm}.(c:?rY\">vectors</field></block></value></block></next></block></next></block></next></block></next></block></next></block></next></block></xml>","version":"0.20.12","type":"blockly"}}
    title="Vector Span & Ease In Combination"
    />
</TabItem>
<TabItem value="typescript" label="TypeScript">
<BitByBitRenderCanvas
    requireManualStart={true}
    script={{"script":"const start = () => {\n\n    const spanOptions = new Bit.Inputs.Vector.SpanDto();\n    spanOptions.step = 0.2;\n    spanOptions.min = 0;\n    spanOptions.max = 5;\n    const spanItems = bitbybit.vector.span(spanOptions);\n\n    const spanEaseOptions = new Bit.Inputs.Vector.SpanEaseItemsDto();\n    spanEaseOptions.ease = Bit.Inputs.Math.easeEnum.easeInSine;\n    spanEaseOptions.min = 0;\n    spanEaseOptions.max = 5;\n    spanEaseOptions.nrItems = spanItems.length;\n    const spanEaseItems = bitbybit.vector.spanEaseItems(spanEaseOptions);\n\n    const vectors = spanItems.map((s, index) => [s, spanEaseItems[index], 0]) as Bit.Inputs.Base.Vector3[];\n\n    bitbybit.draw.drawGridMesh(new Bit.Inputs.Draw.SceneDrawGridMeshDto());\n    bitbybit.draw.drawAnyAsync({ entity: vectors });\n\n}\n\nstart();","version":"0.20.12","type":"typescript"}}
    title="Vector Span & Ease In Combination"
    />
</TabItem>

</Tabs>

## Conclusion

As you can see, all three approaches achieve the same visual result.
*   **Rete** provides a visual, flow-based way to connect data and operations. It's great for understanding data flow at a glance.
*   **Blockly** offers a more structured, yet still visual, way to program, resembling traditional code structures like loops and variables.
*   **TypeScript** provides the most flexibility and power through text-based coding, allowing for complex logic and direct use of JavaScript features like `.map()`.

Understanding how to generate and manipulate lists of vectors using functions like `span` and `spanEaseItems` is a fundamental skill for creating procedural geometry, animations, and simulations in Bitbybit. Experiment with different easing functions and parameters to see how they affect the distribution of points!