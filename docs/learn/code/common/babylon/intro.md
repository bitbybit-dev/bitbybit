---
sidebar_position: 1
title: BabylonJS in Scripts
sidebar_label: Overview
description: The bitbybit.babylon functions that shape the scene a script draws into - background, lights and shadows, camera, materials, GUI, meshes, picking, gizmos, XR and files - how they relate to drawing, and a map of all of them, with an example in Rete, Blockly and TypeScript.
topic: code.babylon.intro
type: explanation
tags: [code, babylonjs]
---

import BitByBitRenderCanvas from '@site/src/components/BitByBitRenderCanvas';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# BabylonJS in scripts

The kernels make geometry; [drawing](../draw/intro) puts it in a scene. `bitbybit.babylon` works on that scene: what is behind the model, how it is lit, where the camera stands, what the materials are, what a person can click and drag, and what goes in and out as files. It is the largest namespace of the API, because a scene has many parts.

These functions belong to BabylonJS, the engine of the coding editors and of the `@bitbybit-dev/babylonjs` package. The ThreeJS and PlayCanvas packages have their own, smaller `bitbybit.three` and `bitbybit.playcanvas` namespaces, and the kernels and `draw` are the same under all three.

## Shaping the scene

A script usually sets the stage first and then draws: a background, a light that casts shadows, then the parts. Every shape drawn after a light with shadows casts and receives them:

{/* example:lit-scene:start - generated from the example's steps for each editor; edits between these markers are overwritten */}

<Tabs groupId="editor" queryString>
<TabItem value="rete" label="Rete">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"{\"id\":\"rete-v2-json\",\"nodes\":{\"background\":{\"id\":\"background\",\"name\":\"bitbybit.babylon.scene.twoColorLinearGradientBackground\",\"customName\":\"two color linear gradient background\",\"async\":false,\"drawable\":false,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"colorFrom\":\"#1a1c1f\",\"colorTo\":\"#5b6b82\",\"direction\":\"to bottom\",\"stopFrom\":0,\"stopTo\":100},\"inputs\":{},\"position\":[40,40]},\"sun\":{\"id\":\"sun\",\"name\":\"bitbybit.babylon.scene.drawDirectionalLight\",\"customName\":\"draw directional light\",\"async\":false,\"drawable\":false,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"direction\":[-1,-2,-1],\"intensity\":3,\"diffuse\":\"#ffffff\",\"specular\":\"#ffffff\",\"shadowGeneratorMapSize\":1024,\"enableShadows\":true,\"shadowDarkness\":0,\"shadowUsePercentageCloserFiltering\":true,\"transparencyShadow\":false,\"shadowContactHardeningLightSizeUVRatio\":0.2,\"shadowBias\":0.0001,\"shadowNormalBias\":0.002,\"shadowMaxZ\":1000,\"shadowMinZ\":0,\"shadowRefreshRate\":1},\"inputs\":{},\"position\":[40,460]},\"part\":{\"id\":\"part\",\"name\":\"bitbybit.occt.shapes.solid.createCylinder\",\"customName\":\"cylinder\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"radius\":1.5,\"height\":3,\"center\":[0,0,0],\"direction\":[0,1,0],\"angle\":360,\"originOnCenter\":false},\"inputs\":{},\"position\":[460,40]},\"ground\":{\"id\":\"ground\",\"name\":\"bitbybit.occt.shapes.solid.createBox\",\"customName\":\"box\",\"async\":true,\"drawable\":true,\"data\":{\"genericNodeData\":{\"hide\":false,\"oneOnOne\":false,\"flatten\":0,\"forceExecution\":false},\"width\":12,\"length\":12,\"height\":0.2,\"center\":[0,-0.1,0],\"originOnCenter\":true},\"inputs\":{},\"position\":[460,460]}},\"modules\":{}}","type":"rete"}}
  title="A part on a lit stage in Rete"
  description="A gradient behind the scene, a sun that casts shadows, and a cylinder standing on a ground slab."
/>

</TabItem>
<TabItem value="blockly" label="Blockly">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"<xml xmlns=\"https://developers.google.com/blockly/xml\"><variables><variable id=\"background\">background</variable></variables><block type=\"variables_set\" x=\"40\" y=\"40\"><field name=\"VAR\" id=\"background\">background</field><value name=\"VALUE\"><block type=\"bitbybit.babylon.scene.twoColorLinearGradientBackground\"><value name=\"ColorFrom\"><block type=\"colour_picker\"><field name=\"COLOUR\">#1a1c1f</field></block></value><value name=\"ColorTo\"><block type=\"colour_picker\"><field name=\"COLOUR\">#5b6b82</field></block></value><value name=\"Direction\"><block type=\"bitbybit.babylon.enums.gradientDirectionEnum\"><field name=\"bitbybit.babylon.enums.gradientDirectionEnum\">'to bottom'</field></block></value><value name=\"StopFrom\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"StopTo\"><block type=\"math_number\"><field name=\"NUM\">100</field></block></value></block></value><next><block type=\"bitbybit.babylon.scene.drawDirectionalLightNoReturn\"><value name=\"Direction\"><block type=\"bitbybit.vector.vectorXYZ\"><value name=\"X\"><block type=\"math_number\"><field name=\"NUM\">-1</field></block></value><value name=\"Y\"><block type=\"math_number\"><field name=\"NUM\">-2</field></block></value><value name=\"Z\"><block type=\"math_number\"><field name=\"NUM\">-1</field></block></value></block></value><value name=\"Intensity\"><block type=\"math_number\"><field name=\"NUM\">3</field></block></value><value name=\"Diffuse\"><block type=\"colour_picker\"><field name=\"COLOUR\">#ffffff</field></block></value><value name=\"Specular\"><block type=\"colour_picker\"><field name=\"COLOUR\">#ffffff</field></block></value><value name=\"ShadowGeneratorMapSize\"><block type=\"math_number\"><field name=\"NUM\">1024</field></block></value><value name=\"EnableShadows\"><block type=\"logic_boolean\"><field name=\"BOOL\">TRUE</field></block></value><value name=\"ShadowDarkness\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"ShadowUsePercentageCloserFiltering\"><block type=\"logic_boolean\"><field name=\"BOOL\">TRUE</field></block></value><value name=\"TransparencyShadow\"><block type=\"logic_boolean\"><field name=\"BOOL\">FALSE</field></block></value><value name=\"ShadowContactHardeningLightSizeUVRatio\"><block type=\"math_number\"><field name=\"NUM\">0.2</field></block></value><value name=\"ShadowBias\"><block type=\"math_number\"><field name=\"NUM\">0.0001</field></block></value><value name=\"ShadowNormalBias\"><block type=\"math_number\"><field name=\"NUM\">0.002</field></block></value><value name=\"ShadowMaxZ\"><block type=\"math_number\"><field name=\"NUM\">1000</field></block></value><value name=\"ShadowMinZ\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"ShadowRefreshRate\"><block type=\"math_number\"><field name=\"NUM\">1</field></block></value><next><block type=\"bitbybit.draw.drawAnyAsyncNoReturn\"><value name=\"Entity\"><block type=\"bitbybit.occt.shapes.solid.createCylinder\"><value name=\"Radius\"><block type=\"math_number\"><field name=\"NUM\">1.5</field></block></value><value name=\"Height\"><block type=\"math_number\"><field name=\"NUM\">3</field></block></value><value name=\"Center\"><block type=\"bitbybit.point.pointXYZ\"><value name=\"X\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Z\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value></block></value><value name=\"Direction\"><block type=\"bitbybit.vector.vectorXYZ\"><value name=\"X\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\"><field name=\"NUM\">1</field></block></value><value name=\"Z\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value></block></value><value name=\"Angle\"><block type=\"math_number\"><field name=\"NUM\">360</field></block></value><value name=\"OriginOnCenter\"><block type=\"logic_boolean\"><field name=\"BOOL\">FALSE</field></block></value></block></value><next><block type=\"bitbybit.draw.drawAnyAsyncNoReturn\"><value name=\"Entity\"><block type=\"bitbybit.occt.shapes.solid.createBox\"><value name=\"Width\"><block type=\"math_number\"><field name=\"NUM\">12</field></block></value><value name=\"Length\"><block type=\"math_number\"><field name=\"NUM\">12</field></block></value><value name=\"Height\"><block type=\"math_number\"><field name=\"NUM\">0.2</field></block></value><value name=\"Center\"><block type=\"bitbybit.point.pointXYZ\"><value name=\"X\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value><value name=\"Y\"><block type=\"math_number\"><field name=\"NUM\">-0.1</field></block></value><value name=\"Z\"><block type=\"math_number\"><field name=\"NUM\">0</field></block></value></block></value><value name=\"OriginOnCenter\"><block type=\"logic_boolean\"><field name=\"BOOL\">TRUE</field></block></value></block></value></block></next></block></next></block></next></block></xml>","type":"blockly"}}
  title="A part on a lit stage in Blockly"
  description="A gradient behind the scene, a sun that casts shadows, and a cylinder standing on a ground slab."
/>

</TabItem>
<TabItem value="typescript" label="TypeScript">

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"const scene = bitbybit.babylon.scene;\nscene.twoColorLinearGradientBackground({ colorFrom: \"#1a1c1f\", colorTo: \"#5b6b82\" });\nscene.drawDirectionalLight({ direction: [-1, -2, -1], intensity: 3, enableShadows: true });\n\nconst part = await bitbybit.occt.shapes.solid.createCylinder({ radius: 1.5, height: 3, center: [0, 0, 0] });\nconst ground = await bitbybit.occt.shapes.solid.createBox({ width: 12, length: 12, height: 0.2, center: [0, -0.1, 0] });\n\nawait bitbybit.draw.drawAnyAsync({ entity: part });\nawait bitbybit.draw.drawAnyAsync({ entity: ground });","type":"typescript"}}
  title="A part on a lit stage in TypeScript"
  description="A gradient behind the scene, a sun that casts shadows, and a cylinder standing on a ground slab."
/>

</TabItem>
</Tabs>

{/* example:lit-scene:end */}

Each run starts with a fresh scene, so the stage is set again every time the script runs.

## Beyond the functions

`bitbybit.babylon.scene.getScene` hands you the BabylonJS scene itself, and in the TypeScript editor `BABYLON` is the whole engine: anything the functions here do not cover, the [BabylonJS documentation](https://doc.babylonjs.com) does. [What a script runs in](/learn/getting-started/typescript/script-runtime) lists what a script can reach.

## The namespaces

{/* namespaces:babylon:start - generated from the API index; edits between these markers are overwritten */}

| Namespace | What it is for | Functions | Explained in |
|---|---|---|---|
| `gui` | The in-scene 2D interface: buttons, sliders, checkboxes, color pickers, text blocks, input fields, images and the containers that lay them out. | 107 | [read](/learn/code/common/babylon/gui) |
| `gizmo` | The on-screen manipulators that let a user move, rotate and scale an object by dragging it. | 74 | [read](/learn/code/common/babylon/interaction) |
| `mesh` | Working with meshes already in the BabylonJS scene, the objects draw.drawAnyAsync gives back. | 54 | [read](/learn/code/common/babylon/meshes-and-nodes) |
| `material` | Materials: physically-based surfaces with base color, metallic and roughness, emissive and ambient contributions, transparency, and the texture slots that drive each of them. | 40 | [read](/learn/code/common/babylon/materials-and-textures) |
| `scene` | The BabylonJS scene as a whole. | 27 | [read](/learn/code/common/babylon/the-scene) |
| `meshBuilder` | BabylonJS's own mesh primitives, built straight into the scene as ready-to-render meshes rather than through a CAD kernel. | 21 | [read](/learn/code/common/babylon/meshes-and-nodes) |
| `node` | Transform nodes: invisible points with a position and an orientation that meshes and other nodes can be parented to, so a whole group moves as one. | 21 | [read](/learn/code/common/babylon/meshes-and-nodes) |
| `camera` | Cameras of the BabylonJS scene. | 15 | [read](/learn/code/common/babylon/the-scene) |
| `gltf` | Advanced glTF/glb tooling on top of the basic import/export in io. | 12 | [read](/learn/code/common/babylon/files) |
| `io` | Loading models into the scene and exporting it. | 11 | [read](/learn/code/common/babylon/files) |
| `pick` | Finding what is under a ray or the pointer. | 11 | [read](/learn/code/common/babylon/interaction) |
| `transforms` | Builds transformation matrices for moving, rotating and scaling geometry, using the BabylonJS math. | 11 | [read](/learn/code/common/babylon/meshes-and-nodes) |
| `ray` | Rays: a start point and a direction, optionally with a length, used to pick what lies along a line of sight or to test intersections. | 6 | [read](/learn/code/common/babylon/interaction) |
| `decal` | Sticking images onto meshes, the way a label or a logo sits on a product. | 4 | [read](/learn/code/common/babylon/materials-and-textures) |
| `gaussianSplatting` | Gaussian splatting scenes, captured real-world environments stored as clouds of soft colored blobs in .ply files, loaded into the scene as meshes that can be moved, cloned and shadowed like any other. | 3 | [read](/learn/code/common/babylon/files) |
| `webXr` | WebXR: entering virtual or augmented reality from the browser, with controller input, teleportation and hit testing against the real world. | 3 | [read](/learn/code/common/babylon/interaction) |
| `engine` | The rendering engine itself: the render loop, canvas sizing and resolution, hardware scaling and the frame-level settings that decide how much work each frame does. | 2 | [read](/learn/code/common/babylon/the-scene) |
| `lights` | Scene lighting: point, directional, spot and hemispheric lights, their intensity, color and range, and the shadow settings that go with them. | 2 | [read](/learn/code/common/babylon/the-scene) |
| `texture` | Textures, the images a material spreads over a surface. | 2 | [read](/learn/code/common/babylon/materials-and-textures) |
| `tools` | Utilities around the rendered image. | 2 | [read](/learn/code/common/babylon/files) |

{/* namespaces:babylon:end */}
