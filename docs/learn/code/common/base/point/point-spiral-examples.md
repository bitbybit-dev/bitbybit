---
sidebar_position: 2
title: Point Spiral Examples
sidebar_label: Point Spiral Examples
description: Learn how to use the Point class to create and visualize a spiral pattern of points in Bitbybit with Rete, Blockly, and TypeScript.
tags: [code, point, rete, blockly, typescript]
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import BitByBitRenderCanvas from '@site/src/components/BitByBitRenderCanvas';
import Admonition from '@theme/Admonition';

# Creating a Spiral of Points

<img 
  class="category-icon-small" 
  src="https://s.bitbybit.dev/assets/icons/white/point-icon.svg" 
  alt="Point category icon" 
  title="Point category icon" /> 

Points are the fundamental building blocks for defining locations in 3D space. The `Point` class in Bitbybit provides various methods to create and manipulate points. This tutorial demonstrates how to use the `point.spiral()` method to generate a series of points arranged in a spiral pattern.

We'll explore this using Rete (visual nodes), Blockly (visual blocks), and TypeScript (code). All examples will generate a spiral of points and draw them in the 3D scene.

For detailed information on each point function, please refer to the [Point API Documentation](https://docs.bitbybit.dev/classes/Bit.Point.html).

## The Core Idea: Generating a Spiral

The `point.spiral()` method algorithmically calculates the X, Y, and Z coordinates for a sequence of points that form a spiral. You can control various parameters of this spiral, such as:

*   **`numberPoints`**: The total number of points to generate for the spiral.
*   **`radius`**: The overall radius or extent of the spiral.
*   **`widening`**: A factor that controls how quickly the spiral widens or tightens.
*   **`phi`**: A constant related to the golden angle, often used in phyllotaxis patterns (like sunflower seeds) to create natural-looking spirals.
*   **`factor`**: Another scaling factor for the spiral's generation.

Once the list of points is generated, we use `Draw.drawAnyAsync()` to render them in the 3D scene.

## Live Examples

Click through the tabs below to see the implementation. Each example will generate and display 300 points arranged in a spiral.
  
<Tabs groupId="vectors-live-examples">
<TabItem value="rete" label="Rete">
    <BitByBitRenderCanvas
    requireManualStart={true}
    script={{"script":"{\"id\":\"rete-v2-json\",\"nodes\":{\"15579b09dc5adca9\":{\"id\":\"15579b09dc5adca9\",\"name\":\"bitbybit.point.spiral\",\"customName\":\"spiral\",\"async\":false,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"phi\":0.9,\"numberPoints\":300,\"widening\":3,\"radius\":6,\"factor\":1},\"inputs\":{},\"position\":[141.90082846282178,326.4099338563376]}}}","version":"0.20.9","type":"rete"}}
    title="Point Spiral Example"
    />
</TabItem>
<TabItem value="blockly" label="Blockly">
  <BitByBitRenderCanvas
    requireManualStart={true}
    script={{"script":"<xml xmlns=\"https://developers.google.com/blockly/xml\"><block type=\"bitbybit.draw.drawAnyAsyncNoReturn\" id=\"E^IJ6.d.Lh`Vmr?.5Csz\" x=\"-93\" y=\"-169\"><value name=\"Entity\"><block type=\"bitbybit.point.spiral\" id=\"g(ckRUQwwj77@4=_-CU;\"><value name=\"Phi\"><block type=\"math_number\" id=\"Vh4=.WXZbb9dof*E5uTF\"><field name=\"NUM\">0.9</field></block></value><value name=\"NumberPoints\"><block type=\"math_number\" id=\"KENf7[x4y[p]{7II!GKw\"><field name=\"NUM\">300</field></block></value><value name=\"Widening\"><block type=\"math_number\" id=\"pl5v@!N~cHBfH1jn?w=c\"><field name=\"NUM\">3</field></block></value><value name=\"Radius\"><block type=\"math_number\" id=\"kN0Lx~XT[UxL1{{)VRWZ\"><field name=\"NUM\">6</field></block></value><value name=\"Factor\"><block type=\"math_number\" id=\"78u}u(CzqctJAu{gzQ.A\"><field name=\"NUM\">1</field></block></value></block></value></block></xml>","version":"0.20.9","type":"blockly"}}
    title="Point Spiral Example"
    />
</TabItem>
<TabItem value="typescript" label="TypeScript">
<BitByBitRenderCanvas
    requireManualStart={true}
    script={{"script":"const start = () => {\n\n    // 1. Configure the spiral parameters\n    const spiralOptions = new Bit.Inputs.Point.SpiralDto();\n    spiralOptions.numberPoints = 300;\n    spiralOptions.radius = 6;       // Overall extent of the spiral; default is 1\n    spiralOptions.widening = 3;     // Controls how tight the spiral is; default is 10\n    spiralOptions.phi = 0.9;        // Constant influencing the spiral pattern; default relates to Golden Angle\n    spiralOptions.factor = 1;       // General scaling factor; default is 1\n\n    // 2. Generate the list of points forming the spiral\n    // The bitbybit.point.spiral() function returns an array of 3D points.\n    const points = bitbybit.point.spiral(spiralOptions);\n\n    // 3. Draw the generated points in the scene\n    // The drawAnyAsync function can take an array of points and will render them.\n    bitbybit.draw.drawAnyAsync({ entity: points });\n\n}\n\nstart();","version":"0.20.9","type":"typescript"}}
    title="Point Spiral Example"
    />
</TabItem>

</Tabs>

## Conclusion

The `point.spiral()` method is a simple way to generate interesting and organic-looking point patterns. By adjusting its parameters, you can create a wide variety of spiral forms. These points can then be used as a basis for other geometric constructions, particle systems, or purely visual arrangements.

Explore the [Point Documentation](./intro) for other methods of creating and manipulating points in Bitbybit!