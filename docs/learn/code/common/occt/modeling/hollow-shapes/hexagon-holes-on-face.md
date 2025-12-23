---
sidebar_position: 4
title: Hexagon Holes On Face
sidebar_label: Hexagon Holes On Face
description: Create stunning honeycomb patterns and hexagonal perforations using BitByBit's subdivideToHexagonHoles function for architectural panels, biomimetic designs, and structural applications.
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

Hexagonal patterns are found throughout nature - from honeycomb structures to crystal formations. The `subdivideToHexagonHoles` function brings this efficiency to your designs, creating optimal packing patterns with superior strength-to-weight ratios. This function is ideal for biomimetic designs, structural panels, and advanced filtration systems where hexagonal geometry provides maximum efficiency.

<Tabs groupId="hexagon-holes-live-examples">
<TabItem value="rete" label="Rete">
    <BitByBitRenderCanvas
    requireManualStart={true}
    script={{"script":"{\"id\":\"rete-v2-json\",\"nodes\":{\"5426441c41e8f5cf\":{\"id\":\"5426441c41e8f5cf\",\"name\":\"bitbybit.occt.shapes.face.createRectangleFace\",\"customName\":\"rectangle face\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":true,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"width\":20,\"length\":14,\"center\":[0,0,0],\"direction\":[0,1,0]},\"inputs\":{},\"position\":[345.2983055114746,314.52503173302796]},\"6cabc11ad209ab15\":{\"id\":\"6cabc11ad209ab15\",\"name\":\"bitbybit.occt.operations.extrude\",\"customName\":\"extrude\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"direction\":[0,1,0]},\"inputs\":{\"shape\":{\"connections\":[{\"node\":\"1371efdcc602ecab\",\"output\":\"result\",\"data\":{}}]}},\"position\":[1526.870162325427,316.83038734970324]},\"1371efdcc602ecab\":{\"id\":\"1371efdcc602ecab\",\"name\":\"bitbybit.lists.getItem\",\"customName\":\"get item\",\"async\":false,\"drawable\":false,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"index\":0,\"clone\":true},\"inputs\":{\"list\":{\"connections\":[{\"node\":\"81861028eefcb119\",\"output\":\"result\",\"data\":{}}]}},\"position\":[1158.6260102344884,318.1207836219716]},\"550f3b6b8b2aa505\":{\"id\":\"550f3b6b8b2aa505\",\"name\":\"bitbybit.json.parse\",\"customName\":\"parse\",\"async\":false,\"drawable\":false,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"text\":\"[0.9]\"},\"inputs\":{},\"position\":[350.8630642517603,710.2281472271986]},\"81861028eefcb119\":{\"id\":\"81861028eefcb119\",\"name\":\"bitbybit.occt.shapes.face.subdivideToHexagonHoles\",\"customName\":\"subdivide to hexagon holes\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"nrHexagonsU\":10,\"nrHexagonsV\":10,\"flatU\":false,\"holesToFaces\":false,\"offsetFromBorderU\":0.01,\"offsetFromBorderV\":0.01},\"inputs\":{\"shape\":{\"connections\":[{\"node\":\"5426441c41e8f5cf\",\"output\":\"result\",\"data\":{}}]},\"scalePatternU\":{\"connections\":[{\"node\":\"550f3b6b8b2aa505\",\"output\":\"result\",\"data\":{}}]},\"scalePatternV\":{\"connections\":[{\"node\":\"550f3b6b8b2aa505\",\"output\":\"result\",\"data\":{}}]}},\"position\":[781.6836832631826,317.85078716306583]}}}","version":"0.20.14","type":"rete"}}
    title="Hexagon holes on face"
    />
</TabItem>
<TabItem value="blockly" label="Blockly">
  <BitByBitRenderCanvas
    requireManualStart={true}
    script={{"script":"<xml xmlns=\"https://developers.google.com/blockly/xml\"><variables><variable id=\"Ldvr:Za]@6t%YtYC(fZb\">recFace</variable><variable id=\"[RsUo.DvUrH~{%iBh25D]\">faces</variable></variables><block type=\"variables_set\" id=\"#1~0gby0xZk8BO,0au)F\" x=\"-166\" y=\"-194\"><field name=\"VAR\" id=\"Ldvr:Za]@6t%YtYC(fZb\">recFace</field><value name=\"VALUE\"><block type=\"bitbybit.occt.shapes.face.createRectangleFace\" id=\"!CO=J-c2+^0!Ox{z}V;5\"><value name=\"Width\"><block type=\"math_number\" id=\"Vqs!Pi/zzVA5e1*lI[[9\"><field name=\"NUM\">20</field></block></value><value name=\"Length\"><block type=\"math_number\" id=\"6knDm(2V*qrR|Mo^60Bc\"><field name=\"NUM\">14</field></block></value><value name=\"Center\"><block type=\"bitbybit.point.pointXYZ\" id=\"FyX3}}prU6rpGBLQ=WPy\"><value name=\"X\"><block type=\"math_number\" id=\"~H@ceir4M7[DA~MvLDBP\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\" id=\"B!MlWD2h$pO%{@^:Mh(?\"><field name=\"NUM\">0</field></block></value><value name=\"Z\"><block type=\"math_number\" id=\"G@JSlI}e{wV1c}56A5m}\"><field name=\"NUM\">0</field></block></value></block></value><value name=\"Direction\"><block type=\"bitbybit.vector.vectorXYZ\" id=\"W;x/E^G1dC2[lb}o|^#P\"><value name=\"X\"><block type=\"math_number\" id=\"of+NQsRv__X;NS.4BMsA\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\" id=\"Rp5E9W2-LsY8~hI$4T%h\"><field name=\"NUM\">1</field></block></value><value name=\"Z\"><block type=\"math_number\" id=\"jmOx3r:l+B-^4RE[[py!\"><field name=\"NUM\">0</field></block></value></block></value></block></value><next><block type=\"variables_set\" id=\"7*Dk6WG}@Y{?+KX#Wxn^\"><field name=\"VAR\" id=\"[RsUo.DvUrH~{%iBh25D]\">faces</field><value name=\"VALUE\"><block type=\"base_time_await_return\" id=\"vjom`14/B5SYKuy|@cw_\"><value name=\"Promise\"><block type=\"bitbybit.occt.shapes.face.subdivideToHexagonHoles\" id=\"dr/T6dz~Lzt~Qd_0E=km\"><value name=\"Shape\"><block type=\"variables_get\" id=\"pq-VMi[cY0$}OceV^cQq\"><field name=\"VAR\" id=\"Ldvr:Za]@6t%YtYC(fZb\">recFace</field></block></value><value name=\"NrHexagonsU\"><block type=\"math_number\" id=\"Gxk:(zAF=jKWG5Fm:Lq/\"><field name=\"NUM\">10</field></block></value><value name=\"NrHexagonsV\"><block type=\"math_number\" id=\"@~RkT9BVYLu~6^PDXP@g\"><field name=\"NUM\">10</field></block></value><value name=\"ScalePatternU\"><block type=\"bitbybit.json.parse\" id=\"{_5^AzQFL$^Ok7/3Nz6T\"><value name=\"Text\"><block type=\"text\" id=\"OVM=1TcL(/mmP,j2mSI^\"><field name=\"TEXT\">[0.9]</field></block></value></block></value><value name=\"ScalePatternV\"><block type=\"bitbybit.json.parse\" id=\"_Se=aS*hq5Jd.LqTrrj7\"><value name=\"Text\"><block type=\"text\" id=\"S.vHkTz=$=-l`=ce+w%z\"><field name=\"TEXT\">[0.9]</field></block></value></block></value><value name=\"FlatU\"><block type=\"logic_boolean\" id=\"flatUBoolean\"><field name=\"BOOL\">FALSE</field></block></value><value name=\"HolesToFaces\"><block type=\"logic_boolean\" id=\"vWy]^U.7YhT$lswl9%l;\"><field name=\"BOOL\">FALSE</field></block></value><value name=\"OffsetFromBorderU\"><block type=\"math_number\" id=\"}qpPiTh8M3GwUtRI6wA}\"><field name=\"NUM\">0.01</field></block></value><value name=\"OffsetFromBorderV\"><block type=\"math_number\" id=\"M]`=VH%S{PH4[lXspvLb\"><field name=\"NUM\">0.01</field></block></value></block></value></block></value><next><block type=\"bitbybit.draw.drawAnyAsyncNoReturn\" id=\"!!?5^fe7i-g^xtw{ATr8\"><value name=\"Entity\"><block type=\"bitbybit.occt.operations.extrude\" id=\"fty*6;3RO/+nM[xu3NNC\"><value name=\"Shape\"><block type=\"lists_getIndex\" id=\"[lg1DA5UnpQV@@d$yLRf\"><mutation statement=\"false\" at=\"false\"></mutation><field name=\"MODE\">GET</field><field name=\"WHERE\">FIRST</field><value name=\"VALUE\"><block type=\"variables_get\" id=\"HVzV,F)c[d%.wXLB8a~Q\"><field name=\"VAR\" id=\"[RsUo.DvUrH~{%iBh25D]\">faces</field></block></value></block></value><value name=\"Direction\"><block type=\"bitbybit.vector.vectorXYZ\" id=\"HP=F/oRd$JU.}YM/ia-]\"><value name=\"X\"><block type=\"math_number\" id=\"26/,~=7uu9b.%x=b)~#c\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\" id=\"Q;w%YnF2d#eXe:G,t0Zo\"><field name=\"NUM\">1</field></block></value><value name=\"Z\"><block type=\"math_number\" id=\"o.cgs^H|o4an=xAKqO19\"><field name=\"NUM\">0</field></block></value></block></value></block></value></block></next></block></next></block></xml>","version":"0.20.14","type":"blockly"}}
    title="Hexagon holes on face"
    />
</TabItem>
<TabItem value="typescript" label="TypeScript">
<BitByBitRenderCanvas
    requireManualStart={true}
    script={{"script":"// Import required DTOs for face creation, subdivision, and extrusion\nconst { RectangleDto, FaceSubdivideToHexagonHolesDto, ExtrudeDto } = Bit.Inputs.OCCT;\n// Import type definitions for type safety\ntype TopoDSFacePointer = Bit.Inputs.OCCT.TopoDSFacePointer;\ntype TopoDSWirePointer = Bit.Inputs.OCCT.TopoDSWirePointer;\n\n// Get access to OCCT modules for face operations\nconst { face } = bitbybit.occt.shapes;\nconst { operations } = bitbybit.occt;\nconst { lists } = bitbybit;\n\n// Define the main function to create hexagon holes on a face\nconst start = async () => {\n    // Create a rectangular face as the base shape\n    const faceOptions = new RectangleDto();\n    faceOptions.width = 20;\n    faceOptions.length = 14;\n    faceOptions.center = [0, 0, 0];\n    faceOptions.direction = [0, 1, 0];\n    const rectangleFace = await face.createRectangleFace(faceOptions);\n\n    // Define scale patterns for U and V directions\n    // For hexagons, uniform scaling often works best due to natural packing\n    const scalePatternU = [0.9]; // Uniform hexagon size in U direction\n    const scalePatternV = [0.9]; // Uniform hexagon size in V direction\n\n    // Subdivide the face into hexagonal holes\n    const subdivideOptions = new FaceSubdivideToHexagonHolesDto<TopoDSFacePointer>();\n    subdivideOptions.shape = rectangleFace;\n    subdivideOptions.nrHexagonsU = 10;          // Number of hexagon divisions in U direction\n    subdivideOptions.nrHexagonsV = 10;          // Number of hexagon divisions in V direction\n    subdivideOptions.flatU = false;             // Pointy-top orientation (false) vs flat-top (true)\n    subdivideOptions.holesToFaces = false;      // Return wires instead of faces\n    subdivideOptions.offsetFromBorderU = 0.01;  // Small border offset in U direction\n    subdivideOptions.offsetFromBorderV = 0.01;  // Small border offset in V direction\n    subdivideOptions.scalePatternU = scalePatternU;\n    subdivideOptions.scalePatternV = scalePatternV;\n\n    const holes = await face.subdivideToHexagonHoles(subdivideOptions);\n\n    // Get the first hole (the outer boundary with hexagonal holes)\n    const firstHole = lists.getItem({ list: holes, index: 0, clone: true });\n\n    // Extrude the face with holes to create a 3D honeycomb structure\n    const extrudeOptions = new ExtrudeDto<TopoDSWirePointer>();\n    extrudeOptions.shape = firstHole;\n    extrudeOptions.direction = [0, 1, 0];\n    const extrudedSolid = await operations.extrude(extrudeOptions);\n\n    // Draw the resulting 3D solid with hexagonal holes\n    bitbybit.draw.drawAnyAsync({\n        entity: extrudedSolid\n    });\n}\n\n// Execute the function\nstart();","version":"0.20.14","type":"typescript"}}
    title="Hexagon holes on face"
    />
</TabItem>
</Tabs>

## Understanding Hexagonal Hole Subdivision

The `subdivideToHexagonHoles` function creates honeycomb-like patterns by intelligently arranging hexagonal holes in an optimal packing configuration. Unlike rectangular grids, hexagonal patterns provide the most efficient use of space while maintaining structural integrity - a principle observed throughout nature from beehives to crystal structures.

This approach is particularly valuable for applications requiring:
- Maximum strength-to-weight ratio
- Optimal material efficiency
- Natural aesthetic appeal
- Superior structural properties
- Biomimetic design principles

## Key Parameters and Hexagonal Properties

### Grid Division Controls

**nrHexagonsU** and **nrHexagonsV**: These parameters control the number of hexagonal divisions in each direction. The function automatically handles the complex geometry of hexagonal packing, including the offset pattern that creates the characteristic honeycomb structure.

**offsetFromBorderU** and **offsetFromBorderV**: Due to the efficient packing of hexagons, smaller offset values (0.01-0.05) typically work well, as hexagons naturally create more uniform edge spacing than rectangular patterns.

### Hexagonal Orientation Control

**flatU**: This unique parameter controls hexagon orientation:
- `false`: Creates "pointy-top" hexagons (⬢) - optimal for structural applications
- `true`: Creates "flat-top" hexagons (⬣) - often preferred for visual applications

The orientation affects both aesthetics and structural properties, with pointy-top configurations typically providing better load distribution.

### Scale Pattern Optimization

For hexagonal patterns, scale patterns work differently than rectangular grids:

- **Uniform scaling**: `[1.0]` or `[0.9]` often produces the most visually pleasing results
- **Gentle variations**: `[0.9, 0.95, 0.9]` create subtle size variations without disrupting the natural flow
- **Gradient effects**: `[1.0, 0.8, 0.6, 0.8, 1.0]` can create interesting radial or linear transitions

## Design Considerations and Applications

Hexagonal patterns offer unique advantages through their natural efficiency. You can create organic flow patterns using gentle scale variations like `[0.95, 0.9, 0.85, 0.9, 0.95]` or breathing effects with `[0.7, 0.85, 1.0, 0.85, 0.7]`. The six-sided geometry naturally distributes loads more evenly than rectangular patterns while providing maximum area coverage with minimum material usage.

These patterns excel in aerospace applications for lightweight structural panels, architectural facades that combine aesthetics with efficiency, and biomedical devices that mimic natural cellular structures. The `flatU` parameter controls orientation - use `false` for pointy-top hexagons in structural applications or `true` for flat-top configurations when visual appeal is the priority.

Start with uniform scaling patterns to understand the basic behavior, then experiment with gentle variations. The mathematical perfection of hexagonal geometry means even simple patterns often produce sophisticated results that balance natural beauty with superior functional performance.
