---
sidebar_position: 3
title: Face From Points
sidebar_label: Face From Points
description: Learn how to create face from the list of points
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

# Creating Face From The List Of Points

Creating a face from a list of points is essential for building custom polygonal shapes in 3D modeling. This method allows you to define a face by specifying its boundary vertices in order, which is particularly useful for creating irregular shapes, architectural elements, or custom geometric forms that can't be easily generated with standard primitives.

The polygon face operation automatically connects your points in sequence and creates a planar face that fills the enclosed area. Point ordering is crucial - the sequence determines both the shape and the orientation of the resulting face.

This example demonstrates creating a quadrilateral face from four strategically placed points to form an asymmetric shape.

<Tabs groupId="creating-face-from-points">
<TabItem value="rete" label="Rete">
    <BitByBitRenderCanvas
    requireManualStart={true}
    script={{"script":"{\"id\":\"rete-v2-json\",\"nodes\":{\"2324f1563fb96797\":{\"id\":\"2324f1563fb96797\",\"name\":\"bitbybit.occt.shapes.face.createPolygonFace\",\"customName\":\"polygon face\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false}},\"inputs\":{\"points\":{\"connections\":[{\"node\":\"53c2c8fef1996ec7\",\"output\":\"list\",\"data\":{}}]}},\"position\":[1213.45703125,380.53125]},\"53c2c8fef1996ec7\":{\"id\":\"53c2c8fef1996ec7\",\"name\":\"bitbybit.lists.createList\",\"customName\":\"create list\",\"data\":{},\"inputs\":{\"listElements\":{\"connections\":[{\"node\":\"2cff472f687b1641\",\"output\":\"result\",\"data\":{}},{\"node\":\"337e05b1f0ba35d2\",\"output\":\"result\",\"data\":{}},{\"node\":\"56b84947cb212c4d\",\"output\":\"result\",\"data\":{}},{\"node\":\"46d2c5d9d53267af\",\"output\":\"result\",\"data\":{}}]}},\"position\":[844.49609375,420.390625]},\"46d2c5d9d53267af\":{\"id\":\"46d2c5d9d53267af\",\"name\":\"bitbybit.point.pointXYZ\",\"customName\":\"point xyz\",\"async\":false,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"x\":5,\"y\":0,\"z\":0},\"inputs\":{},\"position\":[214.67582165780863,869.8646496886554]},\"56b84947cb212c4d\":{\"id\":\"56b84947cb212c4d\",\"name\":\"bitbybit.point.pointXYZ\",\"customName\":\"point xyz\",\"async\":false,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"x\":3,\"y\":0,\"z\":3},\"inputs\":{},\"position\":[222.77674190486215,520.51464211483]},\"337e05b1f0ba35d2\":{\"id\":\"337e05b1f0ba35d2\",\"name\":\"bitbybit.point.pointXYZ\",\"customName\":\"point xyz\",\"async\":false,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"x\":-3,\"y\":0,\"z\":3},\"inputs\":{},\"position\":[220.38414421490873,162.614275263899]},\"2cff472f687b1641\":{\"id\":\"2cff472f687b1641\",\"name\":\"bitbybit.point.pointXYZ\",\"customName\":\"point xyz\",\"async\":false,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"x\":-3,\"y\":0,\"z\":-8},\"inputs\":{},\"position\":[220.9303297165426,-200.30758143378307]}}}","version":"0.20.8","type":"rete"}}
    title="Creating face from points"
    />
</TabItem>
<TabItem value="blockly" label="Blockly">
  <BitByBitRenderCanvas
    requireManualStart={true}
    script={{"script":"<xml xmlns=\"https://developers.google.com/blockly/xml\"><variables><variable id=\"point1\">point1</variable><variable id=\"point2\">point2</variable><variable id=\"point3\">point3</variable><variable id=\"point4\">point4</variable><variable id=\"pointsList\">pointsList</variable><variable id=\"polygonFace\">polygonFace</variable></variables><block type=\"variables_set\" id=\"create_point1\" x=\"50\" y=\"50\"><field name=\"VAR\" id=\"point1\">point1</field><value name=\"VALUE\"><block type=\"bitbybit.point.pointXYZ\" id=\"point1_xyz\"><value name=\"X\"><block type=\"math_number\" id=\"point1_x\"><field name=\"NUM\">-3</field></block></value><value name=\"Y\"><block type=\"math_number\" id=\"point1_y\"><field name=\"NUM\">0</field></block></value><value name=\"Z\"><block type=\"math_number\" id=\"point1_z\"><field name=\"NUM\">-8</field></block></value></block></value><next><block type=\"variables_set\" id=\"create_point2\"><field name=\"VAR\" id=\"point2\">point2</field><value name=\"VALUE\"><block type=\"bitbybit.point.pointXYZ\" id=\"point2_xyz\"><value name=\"X\"><block type=\"math_number\" id=\"point2_x\"><field name=\"NUM\">-3</field></block></value><value name=\"Y\"><block type=\"math_number\" id=\"point2_y\"><field name=\"NUM\">0</field></block></value><value name=\"Z\"><block type=\"math_number\" id=\"point2_z\"><field name=\"NUM\">3</field></block></value></block></value><next><block type=\"variables_set\" id=\"create_point3\"><field name=\"VAR\" id=\"point3\">point3</field><value name=\"VALUE\"><block type=\"bitbybit.point.pointXYZ\" id=\"point3_xyz\"><value name=\"X\"><block type=\"math_number\" id=\"point3_x\"><field name=\"NUM\">3</field></block></value><value name=\"Y\"><block type=\"math_number\" id=\"point3_y\"><field name=\"NUM\">0</field></block></value><value name=\"Z\"><block type=\"math_number\" id=\"point3_z\"><field name=\"NUM\">3</field></block></value></block></value><next><block type=\"variables_set\" id=\"create_point4\"><field name=\"VAR\" id=\"point4\">point4</field><value name=\"VALUE\"><block type=\"bitbybit.point.pointXYZ\" id=\"point4_xyz\"><value name=\"X\"><block type=\"math_number\" id=\"point4_x\"><field name=\"NUM\">5</field></block></value><value name=\"Y\"><block type=\"math_number\" id=\"point4_y\"><field name=\"NUM\">0</field></block></value><value name=\"Z\"><block type=\"math_number\" id=\"point4_z\"><field name=\"NUM\">0</field></block></value></block></value><next><block type=\"variables_set\" id=\"create_points_list\"><field name=\"VAR\" id=\"pointsList\">pointsList</field><value name=\"VALUE\"><block type=\"lists_create_with\" id=\"create_list_with_points\"><mutation items=\"4\"></mutation><value name=\"ADD0\"><block type=\"variables_get\" id=\"get_point1_for_list\"><field name=\"VAR\" id=\"point1\">point1</field></block></value><value name=\"ADD1\"><block type=\"variables_get\" id=\"get_point2_for_list\"><field name=\"VAR\" id=\"point2\">point2</field></block></value><value name=\"ADD2\"><block type=\"variables_get\" id=\"get_point3_for_list\"><field name=\"VAR\" id=\"point3\">point3</field></block></value><value name=\"ADD3\"><block type=\"variables_get\" id=\"get_point4_for_list\"><field name=\"VAR\" id=\"point4\">point4</field></block></value></block></value><next><block type=\"variables_set\" id=\"create_polygon_face\"><field name=\"VAR\" id=\"polygonFace\">polygonFace</field><value name=\"VALUE\"><block type=\"bitbybit.occt.shapes.face.createPolygonFace\" id=\"polygon_face\"><value name=\"Points\"><block type=\"variables_get\" id=\"get_points_list\"><field name=\"VAR\" id=\"pointsList\">pointsList</field></block></value></block></value><next><block type=\"bitbybit.draw.drawAnyAsyncNoReturn\" id=\"draw_polygon_face\"><value name=\"Entity\"><block type=\"variables_get\" id=\"get_polygon_face\"><field name=\"VAR\" id=\"polygonFace\">polygonFace</field></block></value><next><block type=\"bitbybit.draw.drawAnyAsyncNoReturn\" id=\"ThoN1rHcKOj/~f,$:r2U\"><value name=\"Entity\"><block type=\"variables_get\" id=\"p%pJSO]K6]vV~Z;:FIE5\"><field name=\"VAR\" id=\"pointsList\">pointsList</field></block></value></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></xml>","version":"0.20.8","type":"blockly"}}
    title="Creating face from points"
    />
</TabItem>
<TabItem value="typescript" label="TypeScript">
<BitByBitRenderCanvas
    requireManualStart={true}
    script={{"script":"// Import required DTOs and types for polygon face creation\nconst { PolygonDto } = Bit.Inputs.OCCT;\ntype Point3 = Bit.Inputs.Base.Point3;\n\n// Get access to OCCT face creation functions\nconst { face } = bitbybit.occt.shapes;\n\n// Define the main function to create a polygon face from points\nconst start = async () => {\n    // Define the four points that will form the polygon face\n    const point1: Point3 = [-3, 0, -8];\n    const point2: Point3 = [-3, 0, 3];\n    const point3: Point3 = [3, 0, 3];\n    const point4: Point3 = [5, 0, 0];\n\n    // Create a list of points in the correct order\n    const points: Point3[] = [point1, point2, point3, point4];\n\n    // Create the polygon face options\n    const polygonOptions = new PolygonDto();\n    polygonOptions.points = points;\n\n    // Create the polygon face from the points\n    const polygonFace = await face.createPolygonFace(polygonOptions);\n\n    // Draw the polygon face\n    bitbybit.draw.drawAnyAsync({ entity: polygonFace });\n\n    // Optionally, draw the points to visualize the vertices\n    bitbybit.draw.drawAnyAsync({ entity: points });\n}\n\n// Execute the function\nstart();","version":"0.20.8","type":"typescript"}}
    title="Creating face from points"
    />
</TabItem>
</Tabs>

## Key Concepts

**Point Ordering**: The sequence of points determines both the shape and orientation of the polygon face. Points should be ordered consistently (either clockwise or counter-clockwise) to ensure predictable face normals and proper rendering.

**Polygon Face Creation**: The `createPolygonFace` function automatically connects the points in sequence and fills the enclosed area with a planar face. This is ideal for creating custom shapes that can't be generated with standard geometric primitives.

**Coplanar Points**: For best results, all points should lie in the same plane. While OCCT can handle slightly non-coplanar points by fitting a best-fit plane, significant deviations may produce unexpected results.

**Practical Applications**: Polygon faces from points are commonly used for architectural elements (floor plans, wall sections), custom mechanical parts, artistic designs, and any situation where you need precise control over shape boundaries.
