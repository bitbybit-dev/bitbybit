---
sidebar_position: 3
title: Rectangle Holes On Face
sidebar_label: Rectangle Holes On Face
description: Bitbybit has many helper functions that could streamline some of the modeling tasks, such as subdividing given rectangle faces into multiple holes or wires.
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

Creating regular patterns of holes manually can be time-consuming and error-prone. The `subdivideToRectangleHoles` function automates this process by intelligently subdividing rectangular faces into grids with customizable hole patterns. This powerful helper function is essential for creating perforated panels, ventilation grilles, and decorative screens with precise, parametric control.

<Tabs groupId="simple-holes-live-examples">
<TabItem value="rete" label="Rete">
    <BitByBitRenderCanvas
    requireManualStart={true}
    script={{"script":"{\"id\":\"rete-v2-json\",\"nodes\":{\"5426441c41e8f5cf\":{\"id\":\"5426441c41e8f5cf\",\"name\":\"bitbybit.occt.shapes.face.createRectangleFace\",\"customName\":\"rectangle face\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":true,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"width\":20,\"length\":14,\"center\":[0,0,0],\"direction\":[0,1,0]},\"inputs\":{},\"position\":[345.2983055114746,314.52503173302796]},\"f22217faf02b0785\":{\"id\":\"f22217faf02b0785\",\"name\":\"bitbybit.occt.shapes.face.subdivideToRectangleHoles\",\"customName\":\"subdivide to rectangle holes\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"nrRectanglesU\":10,\"nrRectanglesV\":10,\"holesToFaces\":false,\"offsetFromBorderU\":0.05,\"offsetFromBorderV\":0.05},\"inputs\":{\"shape\":{\"connections\":[{\"node\":\"5426441c41e8f5cf\",\"output\":\"result\",\"data\":{}}]},\"scalePatternU\":{\"connections\":[{\"node\":\"550f3b6b8b2aa505\",\"output\":\"result\",\"data\":{}}]},\"scalePatternV\":{\"connections\":[{\"node\":\"99dd6ff34f6653e7\",\"output\":\"result\",\"data\":{}}]}},\"position\":[786.5151933544087,313.81030977782325]},\"6cabc11ad209ab15\":{\"id\":\"6cabc11ad209ab15\",\"name\":\"bitbybit.occt.operations.extrude\",\"customName\":\"extrude\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"direction\":[0,1,0]},\"inputs\":{\"shape\":{\"connections\":[{\"node\":\"1371efdcc602ecab\",\"output\":\"result\",\"data\":{}}]}},\"position\":[1617.2367813648507,314.2527322269106]},\"1371efdcc602ecab\":{\"id\":\"1371efdcc602ecab\",\"name\":\"bitbybit.lists.getItem\",\"customName\":\"get item\",\"async\":false,\"drawable\":false,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"index\":0,\"clone\":true},\"inputs\":{\"list\":{\"connections\":[{\"node\":\"f22217faf02b0785\",\"output\":\"result\",\"data\":{}}]}},\"position\":[1224.9600069760618,315.2106752901691]},\"550f3b6b8b2aa505\":{\"id\":\"550f3b6b8b2aa505\",\"name\":\"bitbybit.json.parse\",\"customName\":\"parse\",\"async\":false,\"drawable\":false,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"text\":\"[0.8,0.5,0.5]\"},\"inputs\":{},\"position\":[350.8630642517603,710.2281472271986]},\"99dd6ff34f6653e7\":{\"id\":\"99dd6ff34f6653e7\",\"name\":\"bitbybit.json.parse\",\"customName\":\"parse\",\"async\":false,\"drawable\":false,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"text\":\"[0.8,0.5,0.5]\"},\"inputs\":{},\"position\":[349.19129322805645,984.5341384541671]}}}","version":"0.20.7","type":"rete"}}
    title="Rectangle holes on face"
    />
</TabItem>
<TabItem value="blockly" label="Blockly">
  <BitByBitRenderCanvas
    requireManualStart={true}
    script={{"script":"<xml xmlns=\"https://developers.google.com/blockly/xml\"><variables><variable id=\"Ldvr:Za]@6t%YtYC(fZb\">recFace</variable><variable id=\"[RsUo.DvUrH~{%iBh25D\">faces</variable></variables><block type=\"variables_set\" id=\"#1~0gby0xZk8BO,0au)F\" x=\"-166\" y=\"-194\"><field name=\"VAR\" id=\"Ldvr:Za]@6t%YtYC(fZb\">recFace</field><value name=\"VALUE\"><block type=\"bitbybit.occt.shapes.face.createRectangleFace\" id=\"!CO=J-c2+^0!Ox{z}V;5\"><value name=\"Width\"><block type=\"math_number\" id=\"Vqs!Pi/zzVA5e1*lI[[9\"><field name=\"NUM\">20</field></block></value><value name=\"Length\"><block type=\"math_number\" id=\"6knDm(2V*qrR|Mo^60Bc\"><field name=\"NUM\">14</field></block></value><value name=\"Center\"><block type=\"bitbybit.point.pointXYZ\" id=\"FyX3}}prU6rpGBLQ=WPy\"><value name=\"X\"><block type=\"math_number\" id=\"~H@ceir4M7[DA~MvLDBP\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\" id=\"B!MlWD2h$pO%{@^:Mh(?\"><field name=\"NUM\">0</field></block></value><value name=\"Z\"><block type=\"math_number\" id=\"G@JSlI}e{wV1c}56A5m}\"><field name=\"NUM\">0</field></block></value></block></value><value name=\"Direction\"><block type=\"bitbybit.vector.vectorXYZ\" id=\"W;x/E^G1dC2[lb}o|^#P\"><value name=\"X\"><block type=\"math_number\" id=\"of+NQsRv__X;NS.4BMsA\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\" id=\"Rp5E9W2-LsY8~hI$4T%h\"><field name=\"NUM\">1</field></block></value><value name=\"Z\"><block type=\"math_number\" id=\"jmOx3r:l+B-^4RE[[py!\"><field name=\"NUM\">0</field></block></value></block></value></block></value><next><block type=\"variables_set\" id=\"7*Dk6WG}@Y{?+KX#Wxn^\"><field name=\"VAR\" id=\"[RsUo.DvUrH~{%iBh25D\">faces</field><value name=\"VALUE\"><block type=\"base_time_await_return\" id=\"vjom`14/B5SYKuy|@cw_\"><value name=\"Promise\"><block type=\"bitbybit.occt.shapes.face.subdivideToRectangleHoles\" id=\"dr/T6dz~Lzt~Qd_0E=km\"><value name=\"Shape\"><block type=\"variables_get\" id=\"pq-VMi[cY0$}OceV^cQq\"><field name=\"VAR\" id=\"Ldvr:Za]@6t%YtYC(fZb\">recFace</field></block></value><value name=\"NrRectanglesU\"><block type=\"math_number\" id=\"Gxk:(zAF=jKWG5Fm:Lq/\"><field name=\"NUM\">10</field></block></value><value name=\"NrRectanglesV\"><block type=\"math_number\" id=\"@~RkT9BVYLu~6^PDXP@g\"><field name=\"NUM\">10</field></block></value><value name=\"ScalePatternU\"><block type=\"bitbybit.json.parse\" id=\"{_5^AzQFL$^Ok7/3Nz6T\"><value name=\"Text\"><block type=\"text\" id=\"OVM=1TcL(/mmP,j2mSI^\"><field name=\"TEXT\">[0.8,0.5,0.5]</field></block></value></block></value><value name=\"ScalePatternV\"><block type=\"bitbybit.json.parse\" id=\"_Se=aS*hq5Jd.LqTrrj7\"><value name=\"Text\"><block type=\"text\" id=\"S.vHkTz=$=-l`=ce+w%z\"><field name=\"TEXT\">[0.8,0.5,0.5]</field></block></value></block></value><value name=\"HolesToFaces\"><block type=\"logic_boolean\" id=\"vWy]^U.7YhT$lswl9%l;\"><field name=\"BOOL\">FALSE</field></block></value><value name=\"OffsetFromBorderU\"><block type=\"math_number\" id=\"}qpPiTh8M3GwUtRI6wA}\"><field name=\"NUM\">0</field></block></value><value name=\"OffsetFromBorderV\"><block type=\"math_number\" id=\"M]`=VH%S{PH4[lXspvLb\"><field name=\"NUM\">0</field></block></value></block></value></block></value><next><block type=\"bitbybit.draw.drawAnyAsyncNoReturn\" id=\"!!?5^fe7i-g^xtw{ATr8\"><value name=\"Entity\"><block type=\"bitbybit.occt.operations.extrude\" id=\"fty*6;3RO/+nM[xu3NNC\"><value name=\"Shape\"><block type=\"lists_getIndex\" id=\"[lg1DA5UnpQV@@d$yLRf\"><mutation statement=\"false\" at=\"false\"></mutation><field name=\"MODE\">GET</field><field name=\"WHERE\">FIRST</field><value name=\"VALUE\"><block type=\"variables_get\" id=\"HVzV,F)c[d%.wXLB8a~Q\"><field name=\"VAR\" id=\"[RsUo.DvUrH~{%iBh25D\">faces</field></block></value></block></value><value name=\"Direction\"><block type=\"bitbybit.vector.vectorXYZ\" id=\"HP=F/oRd$JU.}YM/ia-]\"><value name=\"X\"><block type=\"math_number\" id=\"26/,~=7uu9b.%x=b)~#c\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\" id=\"Q;w%YnF2d#eXe:G,t0Zo\"><field name=\"NUM\">1</field></block></value><value name=\"Z\"><block type=\"math_number\" id=\"o.cgs^H|o4an=xAKqO19\"><field name=\"NUM\">0</field></block></value></block></value></block></value></block></next></block></next></block></xml>","version":"0.20.7","type":"blockly"}}
    title="Rectangle holes on face"
    />
</TabItem>
<TabItem value="typescript" label="TypeScript">
<BitByBitRenderCanvas
    requireManualStart={true}
    script={{"script":"// Import required DTOs for face creation, subdivision, and extrusion\nconst { RectangleDto, FaceSubdivideToRectangleHolesDto, ExtrudeDto } = Bit.Inputs.OCCT;\n// Import type definitions for type safety\ntype TopoDSFacePointer = Bit.Inputs.OCCT.TopoDSFacePointer;\ntype TopoDSWirePointer = Bit.Inputs.OCCT.TopoDSWirePointer;\n\n// Get access to OCCT modules for face operations\nconst { face } = bitbybit.occt.shapes;\nconst { operations } = bitbybit.occt;\nconst { lists } = bitbybit;\n\n// Define the main function to create rectangle holes on a face\nconst start = async () => {\n    // Create a rectangular face as the base shape\n    const faceOptions = new RectangleDto();\n    faceOptions.width = 20;\n    faceOptions.length = 14;\n    faceOptions.center = [0, 0, 0];\n    faceOptions.direction = [0, 1, 0];\n    const rectangleFace = await face.createRectangleFace(faceOptions);\n\n    // Define scale patterns for U and V directions\n    // These arrays control the size of holes in each row and column\n    const scalePatternU = [0.8, 0.5, 0.5]; // Varying hole sizes in U direction\n    const scalePatternV = [0.8, 0.5, 0.5]; // Varying hole sizes in V direction\n\n    // Subdivide the face into rectangular holes\n    const subdivideOptions = new FaceSubdivideToRectangleHolesDto<TopoDSFacePointer>();\n    subdivideOptions.shape = rectangleFace;\n    subdivideOptions.nrRectanglesU = 10;        // Number of divisions in U direction\n    subdivideOptions.nrRectanglesV = 10;        // Number of divisions in V direction\n    subdivideOptions.holesToFaces = false;      // Return wires instead of faces\n    subdivideOptions.offsetFromBorderU = 0.05;  // Border offset in U direction\n    subdivideOptions.offsetFromBorderV = 0.05;  // Border offset in V direction\n    subdivideOptions.scalePatternU = scalePatternU;\n    subdivideOptions.scalePatternV = scalePatternV;\n\n    const holes = await face.subdivideToRectangleHoles(subdivideOptions);\n\n    // Get the first hole (the outer boundary with holes)\n    const firstHole = lists.getItem({ list: holes, index: 0, clone: true });\n\n    // Extrude the face with holes to create a 3D solid\n    const extrudeOptions = new ExtrudeDto<TopoDSWirePointer>();\n    extrudeOptions.shape = firstHole;\n    extrudeOptions.direction = [0, 1, 0];\n    const extrudedSolid = await operations.extrude(extrudeOptions);\n\n    // Draw the resulting 3D solid with rectangular holes\n    bitbybit.draw.drawAnyAsync({\n        entity: extrudedSolid\n    });\n}\n\n// Execute the function\nstart();","version":"0.20.7","type":"typescript"}}
    title="Rectangle holes on face"
    />
</TabItem>
</Tabs>

## Understanding Rectangle Hole Subdivision

The `subdivideToRectangleHoles` function is a powerful helper that automates the creation of regular grid patterns with holes. Instead of manually creating and positioning individual holes, this function intelligently subdivides a rectangular face into a grid and creates holes or wires at each grid position.

This approach is particularly valuable for applications requiring precise, regular patterns such as:
- Perforated metal sheets
- Ventilation grilles
- Acoustic panels
- Decorative architectural screens
- Industrial filtration elements

## Key Parameters and Their Effects

### Grid Division Controls

**nrRectanglesU** and **nrRectanglesV**: These parameters control how many divisions are created in each direction. Higher values create more, smaller holes, while lower values create fewer, larger holes.

**offsetFromBorderU** and **offsetFromBorderV**: These control the spacing between the holes and the edge of the face. Values between 0.05 and 0.2 typically provide good results, with smaller values creating holes closer to the edge.

### Scale Pattern Arrays

The scale pattern arrays are where this function becomes truly powerful. These arrays allow you to create non-uniform hole sizes across the grid:

- **Single value**: `[1.0]` creates uniform holes across the entire grid
- **Multiple values**: `[0.8, 0.5, 0.5]` creates varying hole sizes that repeat in a pattern
- **Gradient effect**: `[1.0, 0.8, 0.6, 0.4, 0.2]` creates a gradual size transition

The pattern repeats across the grid, so if you have 10 divisions and a 3-element pattern, the pattern will cycle: 1st uses pattern[0], 2nd uses pattern[1], 3rd uses pattern[2], 4th uses pattern[0] again, and so on.

### Output Type Control

**holesToFaces**: This boolean parameter determines the output format:
- `false`: Returns wire boundaries (useful for creating faces with holes)
- `true`: Returns individual face elements (useful for separate processing of each hole)

## Pattern Creation and Applications

You can create sophisticated visual effects using carefully designed scale patterns. Try fade effects with `[0.2, 0.4, 0.6, 0.8, 1.0, 0.8, 0.6, 0.4, 0.2]`, alternating patterns like `[1.0, 0.3, 1.0, 0.3]`, or exponential growth with `[0.1, 0.2, 0.4, 0.8, 1.0]`. The patterns repeat across the grid, so a 3-element pattern on 10 divisions will cycle through the values continuously.

This function excels in architectural applications for facade panels and decorative screens, manufacturing contexts like sheet metal fabrication, and engineering applications including filtration systems and acoustic panels. The `holesToFaces` parameter controls whether you get wire boundaries for creating faces with holes or individual face elements for separate processing.

Start with simple uniform patterns before experimenting with complex scale arrays. The parametric nature transforms hundreds of individual operations into a single call, making it invaluable for creating sophisticated perforated designs that remain flexible and easily adjustable for different requirements.
