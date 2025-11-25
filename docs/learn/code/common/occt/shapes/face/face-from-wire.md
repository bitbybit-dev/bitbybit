---
sidebar_position: 4
title: Face From Wire
sidebar_label: Face From Wire
description: Learn how to create face from single closed wire
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

# Creating Face From Wire

Creating a face from a wire is one of the most fundamental operations in 3D modeling. Any closed wire can be converted into a face that fills the area bounded by that wire. This process transforms a 1D boundary into a 2D surface, which can then be used for visualization, analysis, or further 3D operations like extrusion.

## Understanding Wire Orientation and Face Normal

The orientation of a wire determines the direction of the face's normal vector, which affects how the face appears and behaves in 3D operations. When you create a face from a wire, the face's "up" direction depends on whether the wire follows a clockwise or counter-clockwise path.

Wire reversal is often necessary to ensure faces have the correct orientation for:
- Proper lighting and material rendering
- Consistent normal directions in complex models  
- Correct behavior in boolean operations
- Proper face orientation for manufacturing applications

This example demonstrates creating a star-shaped face from a reversed wire to control the face orientation.

<Tabs groupId="creating-face-from-wire">
<TabItem value="rete" label="Rete">
    <BitByBitRenderCanvas
    requireManualStart={true}
    script={{"script":"{\"id\":\"rete-v2-json\",\"nodes\":{\"2698ec9c8609bd3e\":{\"id\":\"2698ec9c8609bd3e\",\"name\":\"bitbybit.occt.shapes.face.createFaceFromWire\",\"customName\":\"face from wire\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"planar\":true},\"inputs\":{\"shape\":{\"connections\":[{\"node\":\"26f0d7f44f84203e\",\"output\":\"result\",\"data\":{}}]}},\"position\":[1028.8892372087307,300.06237146267887]},\"b609f7662c9a1971\":{\"id\":\"b609f7662c9a1971\",\"name\":\"bitbybit.occt.shapes.wire.createStarWire\",\"customName\":\"star wire\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"center\":[0,0,0],\"direction\":[0,1,0],\"numRays\":7,\"outerRadius\":7,\"innerRadius\":3,\"offsetOuterEdges\":0,\"half\":false},\"inputs\":{},\"position\":[291.0980954041938,302.64895734996213]},\"26f0d7f44f84203e\":{\"id\":\"26f0d7f44f84203e\",\"name\":\"bitbybit.occt.shapes.wire.reversedWire\",\"customName\":\"reversed wire\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false}},\"inputs\":{\"shape\":{\"connections\":[{\"node\":\"b609f7662c9a1971\",\"output\":\"result\",\"data\":{}}]}},\"position\":[660.3086304587323,301.04867120852754]}}}","version":"0.20.12","type":"rete"}}
    title="Creating face from wire"
    />
</TabItem>
<TabItem value="blockly" label="Blockly">
  <BitByBitRenderCanvas
    requireManualStart={true}
    script={{"script":"<xml xmlns=\"https://developers.google.com/blockly/xml\"><variables><variable id=\"starWire\">starWire</variable><variable id=\"reversedWire\">reversedWire</variable><variable id=\"faceFromWire\">faceFromWire</variable></variables><block type=\"variables_set\" id=\"create_star_wire\" x=\"50\" y=\"50\"><field name=\"VAR\" id=\"starWire\">starWire</field><value name=\"VALUE\"><block type=\"bitbybit.occt.shapes.wire.createStarWire\" id=\"star_wire\"><value name=\"Center\"><block type=\"bitbybit.point.pointXYZ\" id=\"star_center\"><value name=\"X\"><block type=\"math_number\" id=\"star_center_x\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\" id=\"star_center_y\"><field name=\"NUM\">0</field></block></value><value name=\"Z\"><block type=\"math_number\" id=\"star_center_z\"><field name=\"NUM\">0</field></block></value></block></value><value name=\"Direction\"><block type=\"bitbybit.vector.vectorXYZ\" id=\"star_direction\"><value name=\"X\"><block type=\"math_number\" id=\"star_dir_x\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\" id=\"star_dir_y\"><field name=\"NUM\">1</field></block></value><value name=\"Z\"><block type=\"math_number\" id=\"star_dir_z\"><field name=\"NUM\">0</field></block></value></block></value><value name=\"NumRays\"><block type=\"math_number\" id=\"star_num_rays\"><field name=\"NUM\">7</field></block></value><value name=\"OuterRadius\"><block type=\"math_number\" id=\"star_outer_radius\"><field name=\"NUM\">7</field></block></value><value name=\"InnerRadius\"><block type=\"math_number\" id=\"star_inner_radius\"><field name=\"NUM\">3</field></block></value><value name=\"OffsetOuterEdges\"><block type=\"math_number\" id=\"star_offset_outer_edges\"><field name=\"NUM\">0</field></block></value><value name=\"Half\"><block type=\"logic_boolean\" id=\"star_half\"><field name=\"BOOL\">FALSE</field></block></value></block></value><next><block type=\"variables_set\" id=\"reverse_wire\" x=\"50\" y=\"150\"><field name=\"VAR\" id=\"reversedWire\">reversedWire</field><value name=\"VALUE\"><block type=\"bitbybit.occt.shapes.wire.reversedWire\" id=\"reversed_wire\"><value name=\"Shape\"><block type=\"variables_get\" id=\"get_star_wire\"><field name=\"VAR\" id=\"starWire\">starWire</field></block></value></block></value><next><block type=\"variables_set\" id=\"create_face_from_wire\" x=\"50\" y=\"250\"><field name=\"VAR\" id=\"faceFromWire\">faceFromWire</field><value name=\"VALUE\"><block type=\"bitbybit.occt.shapes.face.createFaceFromWire\" id=\"face_from_wire\"><value name=\"Shape\"><block type=\"variables_get\" id=\"get_reversed_wire\"><field name=\"VAR\" id=\"reversedWire\">reversedWire</field></block></value><value name=\"Planar\"><block type=\"logic_boolean\" id=\"face_planar\"><field name=\"BOOL\">TRUE</field></block></value></block></value><next><block type=\"bitbybit.draw.drawAnyAsyncNoReturn\" id=\"draw_face_from_wire\" x=\"50\" y=\"350\"><value name=\"Entity\"><block type=\"variables_get\" id=\"get_face_from_wire\"><field name=\"VAR\" id=\"faceFromWire\">faceFromWire</field></block></value></block></next></block></next></block></next></block></xml>","version":"0.20.12","type":"blockly"}}
    title="Creating face from wire"
    />
</TabItem>
<TabItem value="typescript" label="TypeScript">
<BitByBitRenderCanvas
    requireManualStart={true}
    script={{"script":"// Import required DTOs and types for wire and face creation\nconst { StarDto, FaceFromWireDto } = Bit.Inputs.OCCT;\ntype Point3 = Bit.Inputs.Base.Point3;\ntype Vector3 = Bit.Inputs.Base.Vector3;\ntype TopoDSWirePointer = Bit.Inputs.OCCT.TopoDSWirePointer;\n\n// Get access to OCCT wire and face creation functions\nconst { wire, face } = bitbybit.occt.shapes;\n\n// Define the main function to create a face from a wire\nconst start = async () => {\n    // Create a star wire\n    const starOptions = new StarDto();\n    starOptions.center = [0, 0, 0] as Point3;\n    starOptions.direction = [0, 1, 0] as Vector3;\n    starOptions.numRays = 7;\n    starOptions.outerRadius = 7;\n    starOptions.innerRadius = 3;\n    starOptions.offsetOuterEdges = 0;\n    starOptions.half = false;\n\n    const starWire = await wire.createStarWire(starOptions);\n\n    // Reverse the wire orientation\n    const reversedWire = await wire.reversedWire({ shape: starWire });\n\n    // Create a face from the reversed wire\n    const faceOptions = new FaceFromWireDto<TopoDSWirePointer>();\n    faceOptions.shape = reversedWire;\n    faceOptions.planar = true;\n\n    const faceFromWire = await face.createFaceFromWire(faceOptions);\n\n    // Draw the created face\n    bitbybit.draw.drawAnyAsync({ entity: faceFromWire });\n}\n\n// Execute the function\nstart();","version":"0.20.12","type":"typescript"}}
    title="Creating face from wire"
    />
</TabItem>
</Tabs>

## Key Concepts

**Wire Reversal**: The `reversedWire` operation changes the direction of the wire's traversal. This is crucial because the face's normal vector (which direction is "up") depends on the wire's orientation. A clockwise wire produces a face with the normal pointing in one direction, while a counter-clockwise wire produces the opposite.

**Planar Faces**: Setting `planar: true` ensures that the face lies entirely in a single plane. This is essential for most 2D shapes and guarantees predictable behavior in subsequent 3D operations.

**Face Orientation**: The orientation of the created face affects lighting, material rendering, and boolean operations. Wire reversal gives you control over which side of the face is considered the "front" or "outside" surface.
