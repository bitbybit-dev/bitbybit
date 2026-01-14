---
sidebar_position: 2
title: Wire Shape Primitives
sidebar_label: Wire Shape Primitives
description: Learn how to create shape wire primitives composed out of multiple edges
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

# Introduction to OCCT Wire Shape Primitives

Wire shape primitives are specialized geometric entities that create more complex and decorative wire patterns beyond basic geometric shapes. While basic wire primitives like circles and rectangles are useful for fundamental geometry, wire shape primitives offer creative and practical solutions for specialized design needs.

In this tutorial, we'll explore four fascinating wire shape primitives that demonstrate the versatility and power of OCCT's wire creation capabilities:

## What You'll Learn

- **Star Wire**: Perfect for creating decorative elements, logos, or technical drawings requiring star patterns
- **Christmas Tree Wire**: Ideal for seasonal designs, architectural elements, or creating tree-like structures
- **Heart Wire**: Great for decorative applications, artistic designs, or romantic themed projects
- **L-Polygon Wire**: Essential for architectural drawings, floor plans, or any L-shaped structural elements

Each primitive comes with customizable parameters that allow you to fine-tune the shape according to your specific requirements. Whether you're working on architectural drawings, decorative patterns, or technical illustrations, these wire shapes provide the building blocks for more complex designs.

## Understanding Wire Shape Parameters

Before diving into the examples, it's helpful to understand some common parameters you'll encounter:

- **Center/Origin**: The position where the shape will be placed in 3D space
- **Direction**: Controls the orientation plane of the wire (typically [0,1,0] for XZ plane)
- **Rotation**: Allows you to rotate the shape around its center point
- **Size Parameters**: Various dimensions that control the overall scale and proportions

Now let's explore each wire shape primitive with interactive examples in three different programming approaches.

## Star Wire

The star wire creates beautiful star-shaped patterns with customizable rays, radii, and proportions. It's particularly useful for decorative elements, logos, or technical drawings requiring star patterns.

<Tabs groupId="creating-basic-wire-primitive-star">
<TabItem value="rete" label="Rete">
    <BitByBitRenderCanvas
    requireManualStart={true}
    script={{"script":"{\"id\":\"rete-v2-json\",\"nodes\":{\"71846e8e38925893\":{\"id\":\"71846e8e38925893\",\"name\":\"bitbybit.occt.shapes.wire.createStarWire\",\"customName\":\"star wire\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"center\":[0,0,0],\"direction\":[0,1,0],\"numRays\":7,\"outerRadius\":2,\"innerRadius\":1,\"offsetOuterEdges\":0,\"half\":false},\"inputs\":{\"outerRadius\":{\"connections\":[{\"node\":\"628ba46a0d5e9465\",\"output\":\"result\",\"data\":{}}]},\"numRays\":{\"connections\":[{\"node\":\"192508f899900074\",\"output\":\"result\",\"data\":{}}]},\"innerRadius\":{\"connections\":[{\"node\":\"4acf459aea74e8ab\",\"output\":\"result\",\"data\":{}}]},\"offsetOuterEdges\":{\"connections\":[{\"node\":\"17021b462c8ed355\",\"output\":\"result\",\"data\":{}}]}},\"position\":[792.20474867041,402.71109608823497]},\"628ba46a0d5e9465\":{\"id\":\"628ba46a0d5e9465\",\"name\":\"bitbybit.math.numberSlider\",\"customName\":\"number slider\",\"data\":{\"options\":{\"min\":6,\"max\":10,\"step\":0.1,\"width\":350,\"updateOnDrag\":false},\"number\":7.8},\"inputs\":{},\"position\":[-76.40423018516849,519.9747461190168]},\"192508f899900074\":{\"id\":\"192508f899900074\",\"name\":\"bitbybit.math.numberSlider\",\"customName\":\"number slider\",\"data\":{\"options\":{\"min\":2,\"max\":10,\"step\":1,\"width\":350,\"updateOnDrag\":false},\"number\":10},\"inputs\":{},\"position\":[-80.25629062222836,352.8820155706951]},\"4acf459aea74e8ab\":{\"id\":\"4acf459aea74e8ab\",\"name\":\"bitbybit.math.numberSlider\",\"customName\":\"number slider\",\"data\":{\"options\":{\"min\":2,\"max\":5,\"step\":0.1,\"width\":350,\"updateOnDrag\":false},\"number\":3.7},\"inputs\":{},\"position\":[-75.93438578553521,690.5567908444164]},\"17021b462c8ed355\":{\"id\":\"17021b462c8ed355\",\"name\":\"bitbybit.math.numberSlider\",\"customName\":\"number slider\",\"data\":{\"options\":{\"min\":0,\"max\":5,\"step\":0.1,\"width\":350,\"updateOnDrag\":false},\"number\":0},\"inputs\":{},\"position\":[-72.96558565595751,864.4192589752912]}}}","type":"rete"}}
    title="Creating basic wire star primitive"
    />
</TabItem>
<TabItem value="blockly" label="Blockly">
  <BitByBitRenderCanvas
    requireManualStart={true}
    script={{"script":"<xml xmlns=\"https://developers.google.com/blockly/xml\"><variables><variable id=\"starWire\">starWire</variable></variables><block type=\"variables_set\" id=\"create_star_wire\" x=\"50\" y=\"50\"><field name=\"VAR\" id=\"starWire\">starWire</field><value name=\"VALUE\"><block type=\"bitbybit.occt.shapes.wire.createStarWire\" id=\"star_wire\"><value name=\"Center\"><block type=\"bitbybit.point.pointXYZ\" id=\"star_center\"><value name=\"X\"><block type=\"math_number\" id=\"star_center_x\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\" id=\"star_center_y\"><field name=\"NUM\">0</field></block></value><value name=\"Z\"><block type=\"math_number\" id=\"star_center_z\"><field name=\"NUM\">0</field></block></value></block></value><value name=\"Direction\"><block type=\"bitbybit.vector.vectorXYZ\" id=\"star_direction\"><value name=\"X\"><block type=\"math_number\" id=\"star_dir_x\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\" id=\"star_dir_y\"><field name=\"NUM\">1</field></block></value><value name=\"Z\"><block type=\"math_number\" id=\"star_dir_z\"><field name=\"NUM\">0</field></block></value></block></value><value name=\"NumRays\"><block type=\"math_number\" id=\"star_num_rays\"><field name=\"NUM\">10</field></block></value><value name=\"OuterRadius\"><block type=\"math_number\" id=\"star_outer_radius\"><field name=\"NUM\">7.8</field></block></value><value name=\"InnerRadius\"><block type=\"math_number\" id=\"star_inner_radius\"><field name=\"NUM\">3.7</field></block></value><value name=\"OffsetOuterEdges\"><block type=\"math_number\" id=\"star_offset_outer_edges\"><field name=\"NUM\">0</field></block></value><value name=\"Half\"><block type=\"logic_boolean\" id=\"star_half\"><field name=\"BOOL\">FALSE</field></block></value></block></value><next><block type=\"bitbybit.draw.drawAnyAsyncNoReturn\" id=\"draw_star_wire\" x=\"50\" y=\"150\"><value name=\"Entity\"><block type=\"variables_get\" id=\"get_star_wire\"><field name=\"VAR\" id=\"starWire\">starWire</field></block></value></block></next></block></xml>","type":"blockly"}}
    title="Creating basic wire star primitive"
    />
</TabItem>
<TabItem value="typescript" label="TypeScript">
<BitByBitRenderCanvas
    requireManualStart={true}
    script={{"script":"// Import required DTOs and types for star wire creation\nconst { StarDto } = Bit.Inputs.OCCT;\ntype Point3 = Bit.Inputs.Base.Point3;\ntype Vector3 = Bit.Inputs.Base.Vector3;\n\n// Get access to OCCT wire creation functions\nconst { wire } = bitbybit.occt.shapes;\n\n// Define the main function to create a star wire\nconst start = async () => {\n    // Create a star wire with customizable parameters\n    const starOptions = new StarDto();\n    starOptions.center = [0, 0, 0] as Point3;\n    starOptions.direction = [0, 1, 0] as Vector3;\n    starOptions.numRays = 10;\n    starOptions.outerRadius = 7.8;\n    starOptions.innerRadius = 3.7;\n    starOptions.offsetOuterEdges = 0;\n    starOptions.half = false;\n\n    const starWire = await wire.createStarWire(starOptions);\n\n    // Draw the created star wire\n    bitbybit.draw.drawAnyAsync({ entity: starWire });\n}\n\n// Execute the function\nstart();","type":"typescript"}}
    title="Creating basic wire star primitive"
    />
</TabItem>
</Tabs>

The star wire example above demonstrates several key concepts:
- **NumRays**: Controls how many points the star has (10 in our example)
- **OuterRadius**: Sets the distance from center to the star's points (7.8 units)
- **InnerRadius**: Sets the distance from center to the star's inner vertices (3.7 units)
- **OffsetOuterEdges**: Allows fine-tuning of the star's outer edge positioning (0 = no offset)

The interactive Rete example includes sliders that let you experiment with these parameters in real-time, while the Blockly and TypeScript versions show you how to implement the same functionality programmatically.

## Christmas Tree Wire

The Christmas tree wire creates detailed tree-like structures perfect for seasonal designs, architectural elements, or any application requiring organic tree shapes.

<Tabs groupId="creating-basic-wire-primitive-christmas-tree">
<TabItem value="rete" label="Rete">
    <BitByBitRenderCanvas
    requireManualStart={true}
    script={{"script":"{\"id\":\"rete-v2-json\",\"nodes\":{\"192508f899900074\":{\"id\":\"192508f899900074\",\"name\":\"bitbybit.math.numberSlider\",\"customName\":\"number slider\",\"data\":{\"options\":{\"min\":2,\"max\":10,\"step\":1,\"width\":350,\"updateOnDrag\":false},\"number\":6},\"inputs\":{},\"position\":[-80.25629062222836,352.8820155706951]},\"83cc04dce7869251\":{\"id\":\"83cc04dce7869251\",\"name\":\"bitbybit.occt.shapes.wire.createChristmasTreeWire\",\"customName\":\"christmas tree wire\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"height\":6,\"innerDist\":1.5,\"outerDist\":3,\"nrSkirts\":5,\"trunkHeight\":1,\"trunkWidth\":1,\"half\":false,\"rotation\":0,\"origin\":[0,0,0],\"direction\":[0,1,0]},\"inputs\":{\"height\":{\"connections\":[{\"node\":\"192508f899900074\",\"output\":\"result\",\"data\":{}}]}},\"position\":[428.2270680467593,310.2091216520016]}}}","type":"rete"}}
    title="Creating basic wire primitive of christmass tree"
    />
</TabItem>
<TabItem value="blockly" label="Blockly">
  <BitByBitRenderCanvas
    requireManualStart={true}
    script={{"script":"<xml xmlns=\"https://developers.google.com/blockly/xml\"><variables><variable id=\"christmasTreeWire\">christmasTreeWire</variable></variables><block type=\"variables_set\" id=\"create_christmas_tree_wire\" x=\"50\" y=\"50\"><field name=\"VAR\" id=\"christmasTreeWire\">christmasTreeWire</field><value name=\"VALUE\"><block type=\"bitbybit.occt.shapes.wire.createChristmasTreeWire\" id=\"christmas_tree_wire\"><value name=\"Height\"><block type=\"math_number\" id=\"tree_height\"><field name=\"NUM\">6</field></block></value><value name=\"InnerDist\"><block type=\"math_number\" id=\"tree_inner_dist\"><field name=\"NUM\">1.5</field></block></value><value name=\"OuterDist\"><block type=\"math_number\" id=\"tree_outer_dist\"><field name=\"NUM\">3</field></block></value><value name=\"NrSkirts\"><block type=\"math_number\" id=\"tree_nr_skirts\"><field name=\"NUM\">5</field></block></value><value name=\"TrunkHeight\"><block type=\"math_number\" id=\"tree_trunk_height\"><field name=\"NUM\">1</field></block></value><value name=\"TrunkWidth\"><block type=\"math_number\" id=\"tree_trunk_width\"><field name=\"NUM\">1</field></block></value><value name=\"Half\"><block type=\"logic_boolean\" id=\"tree_half\"><field name=\"BOOL\">FALSE</field></block></value><value name=\"Rotation\"><block type=\"math_number\" id=\"tree_rotation\"><field name=\"NUM\">0</field></block></value><value name=\"Origin\"><block type=\"bitbybit.point.pointXYZ\" id=\"tree_origin\"><value name=\"X\"><block type=\"math_number\" id=\"tree_origin_x\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\" id=\"tree_origin_y\"><field name=\"NUM\">0</field></block></value><value name=\"Z\"><block type=\"math_number\" id=\"tree_origin_z\"><field name=\"NUM\">0</field></block></value></block></value><value name=\"Direction\"><block type=\"bitbybit.vector.vectorXYZ\" id=\"tree_direction\"><value name=\"X\"><block type=\"math_number\" id=\"tree_dir_x\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\" id=\"tree_dir_y\"><field name=\"NUM\">1</field></block></value><value name=\"Z\"><block type=\"math_number\" id=\"tree_dir_z\"><field name=\"NUM\">0</field></block></value></block></value></block></value><next><block type=\"bitbybit.draw.drawAnyAsyncNoReturn\" id=\"draw_christmas_tree_wire\" x=\"50\" y=\"150\"><value name=\"Entity\"><block type=\"variables_get\" id=\"get_christmas_tree_wire\"><field name=\"VAR\" id=\"christmasTreeWire\">christmasTreeWire</field></block></value></block></next></block></xml>","type":"blockly"}}
    title="Creating basic wire primitive of christmass tree"
    />
</TabItem>
<TabItem value="typescript" label="TypeScript">
<BitByBitRenderCanvas
    requireManualStart={true}
    script={{"script":"// Import required DTOs and types for Christmas tree wire creation\nconst { ChristmasTreeDto } = Bit.Inputs.OCCT;\ntype Point3 = Bit.Inputs.Base.Point3;\ntype Vector3 = Bit.Inputs.Base.Vector3;\n\n// Get access to OCCT wire creation functions\nconst { wire } = bitbybit.occt.shapes;\n\n// Define the main function to create a Christmas tree wire\nconst start = async () => {\n    // Create a Christmas tree wire with customizable parameters\n    const treeOptions = new ChristmasTreeDto();\n    treeOptions.height = 6;\n    treeOptions.innerDist = 1.5;\n    treeOptions.outerDist = 3;\n    treeOptions.nrSkirts = 5;\n    treeOptions.trunkHeight = 1;\n    treeOptions.trunkWidth = 1;\n    treeOptions.half = false;\n    treeOptions.rotation = 0;\n    treeOptions.origin = [0, 0, 0] as Point3;\n    treeOptions.direction = [0, 1, 0] as Vector3;\n\n    const christmasTreeWire = await wire.createChristmasTreeWire(treeOptions);\n\n    // Draw the created Christmas tree wire\n    bitbybit.draw.drawAnyAsync({ entity: christmasTreeWire });\n}\n\n// Execute the function\nstart();","type":"typescript"}}
    title="Creating basic wire primitive of christmass tree"
    />
</TabItem>
</Tabs>

The Christmas tree wire showcases more complex geometric construction:
- **Height**: Controls the overall tree height (6 units in our example)
- **InnerDist & OuterDist**: Define the inner and outer distances of each tree layer (1.5 and 3 units)
- **NrSkirts**: Determines how many layered sections the tree has (5 layers)
- **TrunkHeight & TrunkWidth**: Control the tree's base trunk dimensions (1x1 units)

This primitive demonstrates how OCCT can create complex, organic-looking shapes that would be difficult to construct manually using basic geometric operations.

## Heart Wire

The heart wire creates elegant heart-shaped curves, perfect for decorative applications, artistic designs, or romantic-themed projects.

<Tabs groupId="creating-basic-wire-primitive-heart">
<TabItem value="rete" label="Rete">
    <BitByBitRenderCanvas
    requireManualStart={true}
    script={{"script":"{\"id\":\"rete-v2-json\",\"nodes\":{\"192508f899900074\":{\"id\":\"192508f899900074\",\"name\":\"bitbybit.math.numberSlider\",\"customName\":\"number slider\",\"data\":{\"options\":{\"min\":2,\"max\":10,\"step\":1,\"width\":350,\"updateOnDrag\":false},\"number\":8},\"inputs\":{},\"position\":[-80.25629062222836,352.8820155706951]},\"9f69c5b78eaadbf7\":{\"id\":\"9f69c5b78eaadbf7\",\"name\":\"bitbybit.occt.shapes.wire.createHeartWire\",\"customName\":\"heart wire\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"center\":[0,0,0],\"direction\":[0,1,0],\"rotation\":0,\"sizeApprox\":2},\"inputs\":{\"sizeApprox\":{\"connections\":[{\"node\":\"192508f899900074\",\"output\":\"result\",\"data\":{}}]}},\"position\":[423.63737129471093,192.68558548802676]}}}","type":"rete"}}
    title="Creating basic wire primitive of heart"
    />
</TabItem>
<TabItem value="blockly" label="Blockly">
  <BitByBitRenderCanvas
    requireManualStart={true}
    script={{"script":"<xml xmlns=\"https://developers.google.com/blockly/xml\"><variables><variable id=\"heartWire\">heartWire</variable></variables><block type=\"variables_set\" id=\"create_heart_wire\" x=\"50\" y=\"50\"><field name=\"VAR\" id=\"heartWire\">heartWire</field><value name=\"VALUE\"><block type=\"bitbybit.occt.shapes.wire.createHeartWire\" id=\"heart_wire\"><value name=\"Center\"><block type=\"bitbybit.point.pointXYZ\" id=\"heart_center\"><value name=\"X\"><block type=\"math_number\" id=\"heart_center_x\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\" id=\"heart_center_y\"><field name=\"NUM\">0</field></block></value><value name=\"Z\"><block type=\"math_number\" id=\"heart_center_z\"><field name=\"NUM\">0</field></block></value></block></value><value name=\"Direction\"><block type=\"bitbybit.vector.vectorXYZ\" id=\"heart_direction\"><value name=\"X\"><block type=\"math_number\" id=\"heart_dir_x\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\" id=\"heart_dir_y\"><field name=\"NUM\">1</field></block></value><value name=\"Z\"><block type=\"math_number\" id=\"heart_dir_z\"><field name=\"NUM\">0</field></block></value></block></value><value name=\"Rotation\"><block type=\"math_number\" id=\"heart_rotation\"><field name=\"NUM\">0</field></block></value><value name=\"SizeApprox\"><block type=\"math_number\" id=\"heart_size_approx\"><field name=\"NUM\">8</field></block></value></block></value><next><block type=\"bitbybit.draw.drawAnyAsyncNoReturn\" id=\"draw_heart_wire\" x=\"50\" y=\"150\"><value name=\"Entity\"><block type=\"variables_get\" id=\"get_heart_wire\"><field name=\"VAR\" id=\"heartWire\">heartWire</field></block></value></block></next></block></xml>","type":"blockly"}}
    title="Creating basic wire primitive of heart"
    />
</TabItem>
<TabItem value="typescript" label="TypeScript">
<BitByBitRenderCanvas
    requireManualStart={true}
    script={{"script":"// Import required DTOs and types for heart wire creation\nconst { Heart2DDto } = Bit.Inputs.OCCT;\ntype Point3 = Bit.Inputs.Base.Point3;\ntype Vector3 = Bit.Inputs.Base.Vector3;\n\n// Get access to OCCT wire creation functions\nconst { wire } = bitbybit.occt.shapes;\n\n// Define the main function to create a heart wire\nconst start = async () => {\n    // Create a heart wire with customizable parameters\n    const heartOptions = new Heart2DDto();\n    heartOptions.center = [0, 0, 0] as Point3;\n    heartOptions.direction = [0, 1, 0] as Vector3;\n    heartOptions.rotation = 0;\n    heartOptions.sizeApprox = 8;\n\n    const heartWire = await wire.createHeartWire(heartOptions);\n\n    // Draw the created heart wire\n    bitbybit.draw.drawAnyAsync({ entity: heartWire });\n}\n\n// Execute the function\nstart();","type":"typescript"}}
    title="Creating basic wire primitive of heart"
    />
</TabItem>
</Tabs>

The heart wire is elegantly simple yet mathematically sophisticated:
- **SizeApprox**: Controls the approximate overall size of the heart shape (8 units)
- **Rotation**: Allows you to rotate the heart around its center (0 = upright position)

Despite its simplicity in parameters, the heart wire uses complex mathematical curves to create the characteristic heart shape with smooth transitions and proper proportions.

## L-Polygon Wire

The L-polygon wire creates precise L-shaped structures essential for architectural drawings, floor plans, or any application requiring L-shaped structural elements.

<Tabs groupId="creating-basic-wire-primitive-of-L-polygon">
<TabItem value="rete" label="Rete">
    <BitByBitRenderCanvas
    requireManualStart={true}
    script={{"script":"{\"id\":\"rete-v2-json\",\"nodes\":{\"192508f899900074\":{\"id\":\"192508f899900074\",\"name\":\"bitbybit.math.numberSlider\",\"customName\":\"number slider\",\"data\":{\"options\":{\"min\":2,\"max\":10,\"step\":1,\"width\":350,\"updateOnDrag\":false},\"number\":3},\"inputs\":{},\"position\":[-58.62727358624325,383.0022559657982]},\"1a01d49b6d3cc689\":{\"id\":\"1a01d49b6d3cc689\",\"name\":\"bitbybit.occt.shapes.wire.createLPolygonWire\",\"customName\":\"L polygon wire\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"widthFirst\":1,\"lengthFirst\":2,\"widthSecond\":0.5,\"lengthSecond\":2,\"align\":\"outside\",\"rotation\":0,\"center\":[0,0,0],\"direction\":[0,1,0]},\"inputs\":{\"widthFirst\":{\"connections\":[{\"node\":\"192508f899900074\",\"output\":\"result\",\"data\":{}}]},\"lengthFirst\":{\"connections\":[{\"node\":\"3026d7d0438f254b\",\"output\":\"result\",\"data\":{}}]},\"widthSecond\":{\"connections\":[{\"node\":\"e7f2685798b9cda9\",\"output\":\"result\",\"data\":{}}]},\"lengthSecond\":{\"connections\":[{\"node\":\"a2143dba4ba4dc8b\",\"output\":\"result\",\"data\":{}}]}},\"position\":[606.5768827276579,505.1489554478012]},\"3026d7d0438f254b\":{\"id\":\"3026d7d0438f254b\",\"name\":\"bitbybit.math.numberSlider\",\"customName\":\"number slider\",\"data\":{\"number\":5},\"inputs\":{},\"position\":[-57.56991142077169,535.7696833252093]},\"e7f2685798b9cda9\":{\"id\":\"e7f2685798b9cda9\",\"name\":\"bitbybit.math.numberSlider\",\"customName\":\"number slider\",\"data\":{\"number\":3},\"inputs\":{},\"position\":[-55.255157296752216,689.9084210873098]},\"a2143dba4ba4dc8b\":{\"id\":\"a2143dba4ba4dc8b\",\"name\":\"bitbybit.math.numberSlider\",\"customName\":\"number slider\",\"data\":{\"number\":7},\"inputs\":{},\"position\":[-53.8048813713838,847.5960693491355]}}}","type":"rete"}}
    title="Creating basic wire primitive of L polygon"
    />
</TabItem>
<TabItem value="blockly" label="Blockly">
  <BitByBitRenderCanvas
    requireManualStart={true}
    script={{"script":"<xml xmlns=\"https://developers.google.com/blockly/xml\"><variables><variable id=\"lPolygonWire\">lPolygonWire</variable></variables><block type=\"variables_set\" id=\"create_l_polygon_wire\" x=\"50\" y=\"50\"><field name=\"VAR\" id=\"lPolygonWire\">lPolygonWire</field><value name=\"VALUE\"><block type=\"bitbybit.occt.shapes.wire.createLPolygonWire\" id=\"l_polygon_wire\"><value name=\"WidthFirst\"><block type=\"math_number\" id=\"l_width_first\"><field name=\"NUM\">3</field></block></value><value name=\"LengthFirst\"><block type=\"math_number\" id=\"l_length_first\"><field name=\"NUM\">5</field></block></value><value name=\"WidthSecond\"><block type=\"math_number\" id=\"l_width_second\"><field name=\"NUM\">3</field></block></value><value name=\"LengthSecond\"><block type=\"math_number\" id=\"l_length_second\"><field name=\"NUM\">7</field></block></value><value name=\"Align\"><block type=\"bitbybit.occt.enums.directionEnum\" id=\"DFKuBt%RcUf}}NEC9jo}\"><field name=\"bitbybit.occt.enums.directionEnum\">'outside'</field></block></value><value name=\"Rotation\"><block type=\"math_number\" id=\"l_rotation\"><field name=\"NUM\">0</field></block></value><value name=\"Center\"><block type=\"bitbybit.point.pointXYZ\" id=\"l_center\"><value name=\"X\"><block type=\"math_number\" id=\"l_center_x\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\" id=\"l_center_y\"><field name=\"NUM\">0</field></block></value><value name=\"Z\"><block type=\"math_number\" id=\"l_center_z\"><field name=\"NUM\">0</field></block></value></block></value><value name=\"Direction\"><block type=\"bitbybit.vector.vectorXYZ\" id=\"l_direction\"><value name=\"X\"><block type=\"math_number\" id=\"l_dir_x\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\" id=\"l_dir_y\"><field name=\"NUM\">1</field></block></value><value name=\"Z\"><block type=\"math_number\" id=\"l_dir_z\"><field name=\"NUM\">0</field></block></value></block></value></block></value><next><block type=\"bitbybit.draw.drawAnyAsyncNoReturn\" id=\"draw_l_polygon_wire\"><value name=\"Entity\"><block type=\"variables_get\" id=\"get_l_polygon_wire\"><field name=\"VAR\" id=\"lPolygonWire\">lPolygonWire</field></block></value></block></next></block></xml>","type":"blockly"}}
    title="Creating basic wire primitive of L polygon"
    />
</TabItem>
<TabItem value="typescript" label="TypeScript">
<BitByBitRenderCanvas
    requireManualStart={true}
    script={{"script":"// Import required DTOs and types for L polygon wire creation\nconst { LPolygonDto, directionEnum } = Bit.Inputs.OCCT;\ntype Point3 = Bit.Inputs.Base.Point3;\ntype Vector3 = Bit.Inputs.Base.Vector3;\n\n// Get access to OCCT wire creation functions\nconst { wire } = bitbybit.occt.shapes;\n\n// Define the main function to create an L polygon wire\nconst start = async () => {\n    // Create an L polygon wire with customizable parameters\n    const lPolygonOptions = new LPolygonDto();\n    lPolygonOptions.widthFirst = 3;\n    lPolygonOptions.lengthFirst = 5;\n    lPolygonOptions.widthSecond = 3;\n    lPolygonOptions.lengthSecond = 7;\n    lPolygonOptions.align = directionEnum.outside;\n    lPolygonOptions.rotation = 0;\n    lPolygonOptions.center = [0, 0, 0] as Point3;\n    lPolygonOptions.direction = [0, 1, 0] as Vector3;\n\n    const lPolygonWire = await wire.createLPolygonWire(lPolygonOptions);\n\n    // Draw the created L polygon wire\n    bitbybit.draw.drawAnyAsync({ entity: lPolygonWire });\n}\n\n// Execute the function\nstart();","type":"typescript"}}
    title="Creating basic wire primitive of L polygon"
    />
</TabItem>
</Tabs>

The L-polygon wire demonstrates precision in architectural and technical applications:
- **WidthFirst & LengthFirst**: Define the dimensions of the first segment (3x5 units)
- **WidthSecond & LengthSecond**: Define the dimensions of the second segment (3x7 units)
- **Align**: Controls how the two segments connect ("outside" alignment in our example)

This primitive is particularly valuable for creating floor plans, structural drawings, or any design requiring precise L-shaped elements.

## Key Takeaways

Wire shape primitives offer several advantages over constructing complex shapes manually:

### 1. **Consistency and Precision**
Each primitive uses mathematical formulas to ensure perfect proportions and smooth curves every time. This eliminates human error and ensures professional results.

### 2. **Parametric Control**
All primitives accept parameters that allow you to customize the shape without rebuilding the geometry from scratch. This makes them perfect for creating families of related shapes or iterating on designs.

### 3. **Performance Benefits**
These primitives are optimized at the OCCT level, making them much faster than constructing equivalent shapes using multiple basic operations.

### 4. **Professional Applications**
- **Architecture**: L-polygons for floor plans, stars for decorative elements
- **Manufacturing**: Precise shapes for technical drawings and CAD applications
- **Art & Design**: Hearts and stars for decorative and artistic projects
- **Seasonal Design**: Christmas trees for themed applications

## Next Steps

Now that you understand wire shape primitives, you can:

1. **Experiment** with different parameter values to see how they affect the shapes
2. **Combine** multiple primitives to create more complex designs
3. **Transform** these wires using translation, rotation, and scaling operations
4. **Convert** wires to faces or solids for 3D modeling applications
5. **Use** these shapes as profiles for extrusion or sweeping operations

Remember that these wire primitives serve as building blocks for more advanced geometric operations.

The beauty of OCCT wire shape primitives lies in their simplicity of use combined with mathematical precision—they provide professional-grade geometric capabilities while remaining accessible to users at any skill level.
