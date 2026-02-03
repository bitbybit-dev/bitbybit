---
sidebar_position: 4
title: Wire Helix Spirals
sidebar_label: Wire Helix Spirals
description: Learn how to create helix occt wires with spirals
tags: [code, occt, rete, blockly, typescript]
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import BitByBitRenderCanvas from '@site/src/components/BitByBitRenderCanvas';

<img 
  class="category-icon-small" 
  src="https://s.bitbybit.dev/assets/icons/white/occt-icon.svg" 
  alt="OCCT category icon with a stylized logo representation" 
  title="OCCT category icon" />

# Creating Helix Wires

This tutorial demonstrates how to create three types of helical and spiral wire shapes using OpenCASCADE (OCCT). These curves are fundamental building blocks for modeling springs, threads, coils, and other spiral-based geometries.

## Types of Helix and Spiral Wires

### 1. Regular Helix Wire
A **helix** is a 3D curve that winds around an axis while rising at a constant rate. Think of a spring or a corkscrew. Key parameters include:
- **Radius**: The distance from the central axis to the helix curve
- **Pitch**: The vertical distance covered in one complete revolution (360°)
- **Height**: The total vertical extent of the helix
- **Direction**: The axis around which the helix winds (typically Y-up: `[0, 1, 0]`)
- **Clockwise**: Determines the winding direction when viewed from above

### 2. Flat Spiral Wire (Archimedean Spiral)
A **flat spiral** lies entirely in a plane and expands outward from a center point. This is useful for creating decorative patterns, clock springs, or spiral ramps. Key parameters include:
- **Start Radius**: The inner radius where the spiral begins
- **End Radius**: The outer radius where the spiral ends
- **Number of Turns**: How many complete rotations the spiral makes
- **Direction**: The normal vector of the plane containing the spiral

### 3. Tapered Helix Wire (Conical Helix)
A **tapered helix** combines the rising motion of a regular helix with a changing radius, creating a cone-shaped spiral. This is commonly used for conical springs or decorative elements. Key parameters include:
- **Start Radius**: The radius at the base of the cone
- **End Radius**: The radius at the top of the cone
- **Pitch** and **Height**: Same as a regular helix

## Example Overview

The interactive examples below create all three wire types positioned side by side:
- **Left (x = -8)**: A regular helix with radius 1, pitch 1, and height 5
- **Center (x = 0)**: A flat spiral expanding from radius 0.5 to 5 with 5 turns
- **Right (x = 8)**: A tapered helix narrowing from radius 2 to 0.5

<Tabs groupId="regular-helix-tapered-helix-and-flat-spiral-examples">
<TabItem value="rete" label="Rete">
    <BitByBitRenderCanvas
    requireManualStart={true}
    script={{"script":"{\"id\":\"rete-v2-json\",\"nodes\":{\"2abca66d21efd2a2\":{\"id\":\"2abca66d21efd2a2\",\"name\":\"bitbybit.occt.shapes.wire.createHelixWire\",\"customName\":\"create helix wire\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"radius\":1,\"pitch\":1,\"height\":5,\"center\":[0,0,0],\"direction\":[0,1,0],\"clockwise\":false,\"tolerance\":0.0001},\"inputs\":{\"center\":{\"connections\":[{\"node\":\"26d17aed24ceb170\",\"output\":\"result\",\"data\":{}}]}},\"position\":[706.0512890586609,285.8208999785649]},\"26d17aed24ceb170\":{\"id\":\"26d17aed24ceb170\",\"name\":\"bitbybit.vector.vectorXYZ\",\"customName\":\"vector xyz\",\"async\":false,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":true,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"x\":-8,\"y\":0,\"z\":0},\"inputs\":{},\"position\":[308.13724588203286,400.4410333929026]},\"389d488161c3075a\":{\"id\":\"389d488161c3075a\",\"name\":\"bitbybit.occt.shapes.wire.createTaperedHelixWire\",\"customName\":\"create tapered helix wire\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"startRadius\":2,\"endRadius\":0.5,\"pitch\":1,\"height\":5,\"center\":[0,0,0],\"direction\":[0,1,0],\"clockwise\":false,\"tolerance\":0.0001},\"inputs\":{\"center\":{\"connections\":[{\"node\":\"307bea8c538bbc14\",\"output\":\"result\",\"data\":{}}]}},\"position\":[1983.3245178411435,306.0315773435569]},\"5963964013669860\":{\"id\":\"5963964013669860\",\"name\":\"bitbybit.occt.shapes.wire.createFlatSpiralWire\",\"customName\":\"create flat spiral wire\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"startRadius\":0.5,\"endRadius\":5,\"numTurns\":5,\"center\":[0,0,0],\"direction\":[0,1,0],\"clockwise\":false,\"tolerance\":0.0001},\"inputs\":{},\"position\":[1143.7762077506823,290.70325704546104]},\"307bea8c538bbc14\":{\"id\":\"307bea8c538bbc14\",\"name\":\"bitbybit.vector.vectorXYZ\",\"customName\":\"vector xyz\",\"async\":false,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":true,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"x\":8,\"y\":0,\"z\":0},\"inputs\":{},\"position\":[1587.768691450028,458.8546759665349]}}}","type":"rete"}}
    title="Regular helix, tapered helix and flat spiral examples"
    />
</TabItem>
<TabItem value="blockly" label="Blockly">
  <BitByBitRenderCanvas
    requireManualStart={true}
    script={{"script":"<xml xmlns=\"https://developers.google.com/blockly/xml\"><block type=\"bitbybit.draw.drawAnyAsyncNoReturn\" id=\"draw1\" x=\"10\" y=\"10\"><value name=\"Entity\"><block type=\"bitbybit.occt.shapes.wire.createHelixWire\" id=\"helix1\"><value name=\"Radius\"><block type=\"math_number\" id=\"r1\"><field name=\"NUM\">1</field></block></value><value name=\"Pitch\"><block type=\"math_number\" id=\"p1\"><field name=\"NUM\">1</field></block></value><value name=\"Height\"><block type=\"math_number\" id=\"h1\"><field name=\"NUM\">5</field></block></value><value name=\"Center\"><block type=\"bitbybit.vector.vectorXYZ\" id=\"c1\"><value name=\"X\"><block type=\"math_number\" id=\"cx1\"><field name=\"NUM\">-8</field></block></value><value name=\"Y\"><block type=\"math_number\" id=\"cy1\"><field name=\"NUM\">0</field></block></value><value name=\"Z\"><block type=\"math_number\" id=\"cz1\"><field name=\"NUM\">0</field></block></value></block></value><value name=\"Direction\"><block type=\"bitbybit.vector.vectorXYZ\" id=\"d1\"><value name=\"X\"><block type=\"math_number\" id=\"dx1\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\" id=\"dy1\"><field name=\"NUM\">1</field></block></value><value name=\"Z\"><block type=\"math_number\" id=\"dz1\"><field name=\"NUM\">0</field></block></value></block></value><value name=\"Clockwise\"><block type=\"logic_boolean\" id=\"cw1\"><field name=\"BOOL\">FALSE</field></block></value><value name=\"Tolerance\"><block type=\"math_number\" id=\"t1\"><field name=\"NUM\">0.0001</field></block></value></block></value><value name=\"Options\"><block type=\"bitbybit.draw.optionsOcctShapeSimple\" id=\"opt1\"><value name=\"Precision\"><block type=\"math_number\" id=\"prec1\"><field name=\"NUM\">0.01</field></block></value><value name=\"DrawFaces\"><block type=\"logic_boolean\" id=\"df1\"><field name=\"BOOL\">TRUE</field></block></value><value name=\"FaceColour\"><block type=\"colour_picker\" id=\"fc1\"><field name=\"COLOUR\">#ff0000</field></block></value><value name=\"DrawEdges\"><block type=\"logic_boolean\" id=\"de1\"><field name=\"BOOL\">TRUE</field></block></value><value name=\"EdgeColour\"><block type=\"colour_picker\" id=\"ec1\"><field name=\"COLOUR\">#ffffff</field></block></value><value name=\"EdgeWidth\"><block type=\"math_number\" id=\"ew1\"><field name=\"NUM\">2</field></block></value></block></value><next><block type=\"bitbybit.draw.drawAnyAsyncNoReturn\" id=\"draw2\"><value name=\"Entity\"><block type=\"bitbybit.occt.shapes.wire.createFlatSpiralWire\" id=\"spiral1\"><value name=\"StartRadius\"><block type=\"math_number\" id=\"sr1\"><field name=\"NUM\">0.5</field></block></value><value name=\"EndRadius\"><block type=\"math_number\" id=\"er1\"><field name=\"NUM\">5</field></block></value><value name=\"NumTurns\"><block type=\"math_number\" id=\"nt1\"><field name=\"NUM\">5</field></block></value><value name=\"Center\"><block type=\"bitbybit.vector.vectorXYZ\" id=\"c2\"><value name=\"X\"><block type=\"math_number\" id=\"cx2\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\" id=\"cy2\"><field name=\"NUM\">0</field></block></value><value name=\"Z\"><block type=\"math_number\" id=\"cz2\"><field name=\"NUM\">0</field></block></value></block></value><value name=\"Direction\"><block type=\"bitbybit.vector.vectorXYZ\" id=\"d2\"><value name=\"X\"><block type=\"math_number\" id=\"dx2\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\" id=\"dy2\"><field name=\"NUM\">1</field></block></value><value name=\"Z\"><block type=\"math_number\" id=\"dz2\"><field name=\"NUM\">0</field></block></value></block></value><value name=\"Clockwise\"><block type=\"logic_boolean\" id=\"cw2\"><field name=\"BOOL\">FALSE</field></block></value><value name=\"Tolerance\"><block type=\"math_number\" id=\"t2\"><field name=\"NUM\">0.0001</field></block></value></block></value><value name=\"Options\"><block type=\"bitbybit.draw.optionsOcctShapeSimple\" id=\"opt2\"><value name=\"Precision\"><block type=\"math_number\" id=\"prec2\"><field name=\"NUM\">0.01</field></block></value><value name=\"DrawFaces\"><block type=\"logic_boolean\" id=\"df2\"><field name=\"BOOL\">TRUE</field></block></value><value name=\"FaceColour\"><block type=\"colour_picker\" id=\"fc2\"><field name=\"COLOUR\">#00ff00</field></block></value><value name=\"DrawEdges\"><block type=\"logic_boolean\" id=\"de2\"><field name=\"BOOL\">TRUE</field></block></value><value name=\"EdgeColour\"><block type=\"colour_picker\" id=\"ec2\"><field name=\"COLOUR\">#ffffff</field></block></value><value name=\"EdgeWidth\"><block type=\"math_number\" id=\"ew2\"><field name=\"NUM\">2</field></block></value></block></value><next><block type=\"bitbybit.draw.drawAnyAsyncNoReturn\" id=\"draw3\"><value name=\"Entity\"><block type=\"bitbybit.occt.shapes.wire.createTaperedHelixWire\" id=\"tapered1\"><value name=\"StartRadius\"><block type=\"math_number\" id=\"tsr1\"><field name=\"NUM\">2</field></block></value><value name=\"EndRadius\"><block type=\"math_number\" id=\"ter1\"><field name=\"NUM\">0.5</field></block></value><value name=\"Pitch\"><block type=\"math_number\" id=\"tp1\"><field name=\"NUM\">1</field></block></value><value name=\"Height\"><block type=\"math_number\" id=\"th1\"><field name=\"NUM\">5</field></block></value><value name=\"Center\"><block type=\"bitbybit.vector.vectorXYZ\" id=\"c3\"><value name=\"X\"><block type=\"math_number\" id=\"cx3\"><field name=\"NUM\">8</field></block></value><value name=\"Y\"><block type=\"math_number\" id=\"cy3\"><field name=\"NUM\">0</field></block></value><value name=\"Z\"><block type=\"math_number\" id=\"cz3\"><field name=\"NUM\">0</field></block></value></block></value><value name=\"Direction\"><block type=\"bitbybit.vector.vectorXYZ\" id=\"d3\"><value name=\"X\"><block type=\"math_number\" id=\"dx3\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\" id=\"dy3\"><field name=\"NUM\">1</field></block></value><value name=\"Z\"><block type=\"math_number\" id=\"dz3\"><field name=\"NUM\">0</field></block></value></block></value><value name=\"Clockwise\"><block type=\"logic_boolean\" id=\"cw3\"><field name=\"BOOL\">FALSE</field></block></value><value name=\"Tolerance\"><block type=\"math_number\" id=\"t3\"><field name=\"NUM\">0.0001</field></block></value></block></value><value name=\"Options\"><block type=\"bitbybit.draw.optionsOcctShapeSimple\" id=\"opt3\"><value name=\"Precision\"><block type=\"math_number\" id=\"prec3\"><field name=\"NUM\">0.01</field></block></value><value name=\"DrawFaces\"><block type=\"logic_boolean\" id=\"df3\"><field name=\"BOOL\">TRUE</field></block></value><value name=\"FaceColour\"><block type=\"colour_picker\" id=\"fc3\"><field name=\"COLOUR\">#0000ff</field></block></value><value name=\"DrawEdges\"><block type=\"logic_boolean\" id=\"de3\"><field name=\"BOOL\">TRUE</field></block></value><value name=\"EdgeColour\"><block type=\"colour_picker\" id=\"ec3\"><field name=\"COLOUR\">#ffffff</field></block></value><value name=\"EdgeWidth\"><block type=\"math_number\" id=\"ew3\"><field name=\"NUM\">2</field></block></value></block></value></block></next></block></next></block></xml>","type":"blockly"}}
    title="Regular helix, tapered helix and flat spiral examples"
    />
</TabItem>
<TabItem value="typescript" label="TypeScript">
<BitByBitRenderCanvas
    requireManualStart={true}
    script={{"script":"\n// Import DTOs for configuring helix and spiral wire operations\nconst { HelixWireDto, TaperedHelixWireDto, FlatSpiralWireDto } = Bit.Inputs.OCCT;\n// Import DTO for specifying drawing options\nconst { DrawOcctShapeSimpleOptions } = Bit.Inputs.Draw;\n\n// Destructure the bitbybit API to access OCCT wire creation module\nconst { wire } = bitbybit.occt.shapes;\n\n// Define an asynchronous function to execute the main logic\nconst start = async () => {\n\n    // --- 1. Create Regular Helix Wire ---\n    // A helix is a 3D spiral that rises along an axis\n    const helixOptions = new HelixWireDto();\n    helixOptions.radius = 1;           // Radius of the helix\n    helixOptions.pitch = 1;            // Height per complete turn\n    helixOptions.height = 5;           // Total height of the helix\n    helixOptions.center = [-8, 0, 0];  // Position it to the left\n    helixOptions.direction = [0, 1, 0]; // Helix axis points up (Y direction)\n    helixOptions.clockwise = false;    // Counter-clockwise winding\n    helixOptions.tolerance = 0.0001;   // Approximation tolerance\n    \n    // Create the helix wire asynchronously\n    const helixWire = await wire.createHelixWire(helixOptions);\n\n    // --- 2. Create Flat Spiral Wire ---\n    // A flat spiral lies in a plane and expands outward\n    const flatSpiralOptions = new FlatSpiralWireDto();\n    flatSpiralOptions.startRadius = 0.5;  // Inner starting radius\n    flatSpiralOptions.endRadius = 5;      // Outer ending radius\n    flatSpiralOptions.numTurns = 5;       // Number of complete rotations\n    flatSpiralOptions.center = [0, 0, 0]; // Centered at origin\n    flatSpiralOptions.direction = [0, 1, 0]; // Normal to the spiral plane\n    flatSpiralOptions.clockwise = false;\n    flatSpiralOptions.tolerance = 0.0001;\n    \n    // Create the flat spiral wire\n    const flatSpiralWire = await wire.createFlatSpiralWire(flatSpiralOptions);\n\n    // --- 3. Create Tapered Helix Wire ---\n    // A tapered helix has a varying radius (conical helix)\n    const taperedHelixOptions = new TaperedHelixWireDto();\n    taperedHelixOptions.startRadius = 2;   // Larger radius at the bottom\n    taperedHelixOptions.endRadius = 0.5;   // Smaller radius at the top\n    taperedHelixOptions.pitch = 1;         // Height per complete turn\n    taperedHelixOptions.height = 5;        // Total height\n    taperedHelixOptions.center = [8, 0, 0]; // Position it to the right\n    taperedHelixOptions.direction = [0, 1, 0];\n    taperedHelixOptions.clockwise = false;\n    taperedHelixOptions.tolerance = 0.0001;\n    \n    // Create the tapered helix wire\n    const taperedHelixWire = await wire.createTaperedHelixWire(taperedHelixOptions);\n\n    // --- 4. Draw all three wires with different colors ---\n    \n    // Draw the regular helix in red\n    const helixDrawOptions = new DrawOcctShapeSimpleOptions();\n    helixDrawOptions.edgeColour = \"#ff0000\";\n    helixDrawOptions.edgeWidth = 2;\n    bitbybit.draw.drawAnyAsync({ entity: helixWire, options: helixDrawOptions });\n\n    // Draw the flat spiral in green\n    const spiralDrawOptions = new DrawOcctShapeSimpleOptions();\n    spiralDrawOptions.edgeColour = \"#00ff00\";\n    spiralDrawOptions.edgeWidth = 2;\n    bitbybit.draw.drawAnyAsync({ entity: flatSpiralWire, options: spiralDrawOptions });\n\n    // Draw the tapered helix in blue\n    const taperedDrawOptions = new DrawOcctShapeSimpleOptions();\n    taperedDrawOptions.edgeColour = \"#0000ff\";\n    taperedDrawOptions.edgeWidth = 2;\n    bitbybit.draw.drawAnyAsync({ entity: taperedHelixWire, options: taperedDrawOptions });\n\n}\n\n// Execute the main function\nstart();","type":"typescript"}}
    title="Regular helix, tapered helix and flat spiral examples"
    />
</TabItem>
</Tabs>

## Practical Applications

These helix and spiral wires serve as the foundation for many real-world modeling scenarios:

- **Springs and Coils**: Use regular or tapered helixes as sweep paths to create compression springs, extension springs, or coil shapes
- **Threads and Screws**: Helixes can define the path for thread profiles when creating bolts, screws, or nuts
- **Spiral Staircases**: Flat spirals or helixes can guide the placement of steps in architectural designs
- **Decorative Elements**: Spirals add visual interest to jewelry, furniture, and artistic designs
- **Pipes and Tubing**: Sweep a circular profile along a helix to create coiled pipes or tubes

## Tips for Working with Helix Wires

1. **Tolerance Parameter**: Lower tolerance values create smoother curves but require more computation. The default `0.0001` provides a good balance for most use cases.

2. **Direction Vector**: The direction defines the axis of rotation. Use `[0, 1, 0]` for vertical helixes, `[1, 0, 0]` for horizontal ones along X, or any normalized vector for custom orientations.

3. **Combining with Other Operations**: These wires can be used with operations like `pipe`, `sweep`, or `loft` to create solid 3D shapes from the wire paths.
