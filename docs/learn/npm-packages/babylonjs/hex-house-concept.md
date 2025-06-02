---
sidebar_position: 4
title: "Parametric Hex House Concept with BabylonJS & Bitbybit"
sidebar_label: "Hex House (BabylonJS)"
description: "Explore how to construct a parametric 'Hex House' architectural concept using Bitbybit with BabylonJS, OCCT, and a dynamic GUI for customization."
tags: [npm-packages, babylonjs]
---

import BitByBitRenderCanvas from '@site/src/components/BitByBitRenderCanvas';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';
import Admonition from '@theme/Admonition';

# Parametric Hex House Concept with BabylonJS & Bitbybit

This tutorial delves into creating a "Hex House," an architectural concept with a distinctive hexagonal shell structure, using Bitbybit's BabylonJS integration. We'll leverage the OpenCascade (OCCT) kernel for sophisticated CAD operations and `lil-gui` for a user interface that allows real-time parameter adjustments.

In this related video tutorial you can see how the results of this app look like (rendered in Unreal Engine).
<div class="responsive-video-container">
  <iframe 
    width="560" 
    height="315" 
    src="https://www.youtube.com/embed/Bgf-rAqAtdc" 
    title="Unreal Engine 5 Using Assets From Bitbybit ThreeJS Configurator" 
    frameborder="0" 
    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
    allowfullscreen>
  </iframe>
</div>

<Admonition type="info" title="Note on video tutorial">
  <p>This tutorial originally used the ThreeJS game engine, but rest assured—the geometry creation logic maps directly (1:1) to what we've built in BabylonJS. See the StackBlitz example below for reference.</p>
  <p>
  While the original tutorial was based on a somewhat outdated app structure, we've provided a more modern and well-organized version here. You can also use this scaffold as a starting point for your own projects.
  </p>
</Admonition>

This example will guide you through:
*   Setting up a BabylonJS environment for 3D rendering.
*   Initializing Bitbybit with the OCCT geometry kernel within this BabylonJS context.
*   Constructing complex parametric geometry using Bitbybit's OCCT API, focusing on techniques like lofting, surface subdivision, and boolean operations.
*   Creating a GUI with `lil-gui` to control the Hex House's parameters.
*   Dynamically updating the 3D model in the BabylonJS scene based on these GUI inputs.
*   Managing and exporting the generated 3D model.

<Admonition type="info" title="Prerequisites & Further Details">
  <p>This tutorial focuses on the core application logic for generating the Hex House. For a detailed explanation of:</p>
  <ul>
    <li>Setting up Web Worker files (e.g., <code>occt.worker.ts</code>), please refer to our <a href="./start-with-babylon-js">BabylonJS Integration Starter Tutorial</a>.</li>
    <li>The general project structure (models, downloads, other helpers), you can refer to the <a href="./advanced-parametric-3d-model">previous Advanced Parametric Model (BabylonJS) tutorial</a> which shares a similar foundational setup.</li>
  </ul>
  <p>Here, we'll concentrate on the essential files that bring the Hex House concept to life.</p>
</Admonition>

We are providing a higher level explanations of the codebase below, but for working reference always check this live example on StackBlitz, which, as platform evolves could change slightly.

<BitByBitRenderCanvas
  requireManualStart={true}
  iframeUrl="https://stackblitz.com/edit/hex-house-concept-demo-babylonjs-for-docs?embed=1&file=src%2Fmain.ts&theme=dark"
  title="StackBlitz - Hex House Concept 3D"
/>

### Find the source code on [Bitbybit GitHub Examples](https://github.com/bitbybit-dev/bitbybit/tree/master/examples/vite/babylonjs/hex-house-concept)

## 1. HTML Foundation (`index.html`)

The `index.html` file is the standard entry point, providing a canvas for BabylonJS.

<CodeBlock language="html" title="index.html">
{`<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <link rel="icon" type="image/svg+xml" href="/vite.svg" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Bitbybit & BabylonJS Hex House Concept Example</title>
    </head>
    <body>
        <a class="logo" href="https://bitbybit.dev" target="_blank" rel="noopener noreferrer">
        <img alt="Logo of Bit by bit developers company" src="https://bitbybit.dev/assets/logo-gold-small.png" />
        <div>bitbybit.dev</div><br />
        <div>support the mission - subscribe</div>
        </a>
        <canvas id="babylon-canvas"></canvas>
        <script type="module" src="/src/main.ts"></script>
    </body>
</html>`}
</CodeBlock>

*   Key element: `<canvas id="babylon-canvas"></canvas>` for BabylonJS rendering.

## 2. Main Application Orchestration (`src/main.ts`)

This file coordinates the setup and dynamic updates of our Hex House.

<CodeBlock language="typescript" title="src/main.ts">
{`import './style.css';
import { BitByBitBase, Inputs } from '@bitbybit-dev/babylonjs';
import { model, type KernelOptions, current } from './models';
import { /* Assuming these are correctly imported from your helpers index */
  initKernels, initBabylonJS, createGui, createShape,
  createDirLightsAndGround, disableGUI, enableGUI, hideSpinner, showSpinner,
  downloadGLTF, downloadSTL, downloadStep,
} from './helpers';

const kernelOptions: KernelOptions = {
  enableOCCT: true, enableJSCAD: false, enableManifold: false,
};

start();

async function start() {
  const { scene, engine } = initBabylonJS();

  const bitbybit = new BitByBitBase();
  bitbybit.context.scene = scene; // Link Bitbybit to BabylonJS scene
  bitbybit.context.engine = engine; // Link Bitbybit to BabylonJS engine
  createDirLightsAndGround(bitbybit, current);

  await initKernels(scene, bitbybit, kernelOptions); // Initialize OCCT

  let finalShape: Inputs.OCCT.TopoDSShapePointer | undefined;
  let shapesToClean: Inputs.OCCT.TopoDSShapePointer[] = [];

  model.downloadStep = () => downloadStep(bitbybit, finalShape);
  model.downloadGLTF = () => downloadGLTF(bitbybit);
  model.downloadSTL = () => downloadSTL(bitbybit, finalShape);

  createGui(current, model, updateShape); // Setup GUI controls

  // Rotation logic (simplified as it groups multiple meshes now)
  const rotationSpeed = 0.0005;
  const rotateGroup = () => {
    if (model.rotationEnabled && current.groups && current.groups.length > 0) {
      current.groups.forEach((g) => {
        if (g) g.rotation.y -= rotationSpeed;
      });
    }
  };
  scene.onBeforeRenderObservable.add(() => rotateGroup());
  engine.runRenderLoop(() => scene.render(true, false));

  // Initial shape creation
  finalShape = await createShape(bitbybit, scene, model, shapesToClean, current);

  // Function to update geometry when GUI parameters change
  async function updateShape() {
    disableGUI(); showSpinner();
    if (current.groups) { // Dispose of all previously created BabylonJS groups/meshes
      current.groups.forEach((g) => g?.dispose(false, true));
    }
    current.groups = []; // Reset the groups array

    // Re-create the shape with new parameters
    finalShape = await createShape(bitbybit, scene, model, shapesToClean, current);
    
    hideSpinner(); enableGUI();
  }
}`}
</CodeBlock>

**Core Logic in `main.ts`:**
1.  Initializes BabylonJS (`initBabylonJS`) and then Bitbybit, crucially setting `bitbybit.context.scene` and `bitbybit.context.engine`.
2.  Initializes the OCCT kernel via `initKernels`.
3.  Sets up download functions and the `lil-gui` interface using `createGui`. The GUI will call `updateShape` when parameters change.
4.  Implements a simple rotation for the generated model parts.
5.  The `updateShape` function is key:
    *   It disposes of all previously created BabylonJS meshes stored in `current.groups`. This is essential for clearing the old geometry before drawing the new one.
    *   It then calls `createShape` again with the (potentially modified) `model` parameters. The `createShape` function itself manages the cleanup of intermediate OCCT shapes via `shapesToClean`.

## 3. Essential Helper Functions (`src/helpers/`)

### Initializing BabylonJS (`init-babylonjs.ts`)

This module sets up the fundamental BabylonJS environment.

<CodeBlock language="typescript" title="src/helpers/init-babylonjs.ts">
{`import { /* BabylonJS Core imports: Scene, Engine, ArcRotateCamera, Vector3, HemisphericLight, etc. */ } from '@babylonjs/core';
import type { Current } from '../models';
import { Inputs, type BitByBitBase } from '@bitbybit-dev/babylonjs';

export function initBabylonJS() {
  const canvas = document.getElementById('babylon-canvas') as HTMLCanvasElement;
  canvas.addEventListener('wheel', (evt) => evt.preventDefault()); // Prevent page scroll on canvas wheel
  const engine = new Engine(canvas, true); // Create the BabylonJS engine
  engine.setHardwareScalingLevel(0.5); // Adjust for performance vs. quality
  const scene = new Scene(engine); // Create the main scene
  scene.clearColor = Color4.FromHexString('#222222'); // Set background color

  new TransformNode('root', scene); // root node which can be required for some bitbybit operations

  // Setup an ArcRotateCamera for user navigation
  const camera = new ArcRotateCamera(/* ...parameters... */);
  camera.setPosition(new Vector3(20, 5, 20));
  camera.setTarget(new Vector3(0, 5, 0));
  camera.attachControl(canvas, true);
  // ... other camera settings ...

  // Add a basic light
  const light = new HemisphericLight('HemiLight', new Vector3(0, 1, 0), scene);
  light.intensity = 2;
  scene.ambientColor = Color3.FromHexString('#ffffff');
  scene.metadata = { shadowGenerators: [] }; // For shadow management

  window.onresize = () => engine.resize(); // Handle window resizing
  return { scene, engine, camera };
}

export function createDirLightsAndGround(bitbybit: BitByBitBase, current: Current) {
  // Setup directional light for shadows and better illumination
  const dirLightOpt = new Inputs.BabylonScene.DirectionalLightDto();
  // ... configure dirLightOpt ...
  bitbybit.babylon.scene.drawDirectionalLight(dirLightOpt);

  // Add fog for atmospheric effect
  const fogOptions = new Inputs.BabylonScene.FogDto();
  // ... configure fogOptions ...
  bitbybit.babylon.scene.fog(fogOptions);

  // Create a ground plane/cylinder
  const matGround = new PBRMetallicRoughnessMaterial('ground', scene); // Use scene from bitbybit.context if needed
  matGround.baseColor = Color3.FromHexString('#080808');
  const ground = MeshBuilder.CreateCylinder('ground', { diameter: 85, height: 3, tessellation: 300 }, scene);
  // ... position and set material for ground ...
  current.ground = ground;
}`}
</CodeBlock>

**Key aspects of `init-babylonjs.ts`:**
*   Creates the BabylonJS `Engine` and `Scene` attached to the HTML canvas.
*   Sets up an `ArcRotateCamera` allowing users to pan, zoom, and orbit.
*   Adds basic lighting (`HemisphericLight`, `DirectionalLight`) and a ground mesh.
*   Includes fog for atmospheric depth.
*   Handles window resizing to keep the render output correct.

### Creating the GUI (`create-gui.ts`)

This file uses `lil-gui` to build the user interface for controlling the Hex House parameters.

<CodeBlock language="typescript" title="src/helpers/create-gui.ts">
{`import GUI from 'lil-gui';
import type { Current, Model } from '../models';
import { Color3, PBRMetallicRoughnessMaterial } from '@babylonjs/core';

export const createGui = (current: Current, model: Model, updateShape: () => void) => {
  model.update = () => updateShape(); // Not used if LOD system is removed, but kept for structure
  const gui = new GUI();
  current.gui = gui;
  gui.$title.innerHTML = 'Pattern'; // Descriptive title

  // Add controls for uHex, vHex, drawEdges, drawFaces
  gui.add(model, 'uHex', 5, 81, 4).name('Hexagons U (Width)').onFinishChange(() => { model.uHex = model.uHex; updateShape(); });
  gui.add(model, 'vHex', 5, 12, 1).name('Hexagons V (Segments)').onFinishChange(() => { model.vHex = model.vHex; updateShape(); });
  gui.add(model, 'drawEdges').name('Draw Edges').onFinishChange(() => updateShape());
  gui.add(model, 'drawFaces').name('Draw Faces').onFinishChange(() => updateShape());

  // Color control
  gui.addColor(model, 'color').name('Shell Color').onChange((hexColor: string) => {
    if (current.groups && current.groups.length > 0) {
      current.groups.forEach(group => {
        group.getChildMeshes().forEach(mesh => {
          if (mesh.material && mesh.material instanceof PBRMetallicRoughnessMaterial) {
            (mesh.material as PBRMetallicRoughnessMaterial).baseColor = Color3.FromHexString(hexColor);
          }
        });
      });
    }
  });

  // Download buttons
  gui.add(model, 'downloadSTL').name('Download STL');
  gui.add(model, 'downloadStep').name('Download STEP');
  gui.add(model, 'downloadGLTF').name('Download GLTF');
};`}
</CodeBlock>

**`create-gui.ts` functionality:**
*   Creates a `lil-gui` instance.
*   Adds controls (sliders, checkboxes, color pickers) linked to the properties in the `model` object (e.g., `model.uHex`, `model.color`).
*   When a GUI control's value changes (e.g., `onFinishChange` for sliders, `onChange` for colors), it updates the corresponding property in the `model` object and then calls the `updateShape` function (passed from `main.ts`) to trigger a geometry regeneration.
*   For color changes, it directly updates the `baseColor` of the `PBRMetallicRoughnessMaterial` applied to the relevant meshes.

### Generating the Hex House Geometry (`create-shape.ts`)

This is where the sophisticated CAD modeling for the "Hex House" takes place using Bitbybit's OCCT API.

<CodeBlock language="typescript" title="src/helpers/create-shape.ts (Conceptual Overview)">
{`import type { BitByBitBase } from '@bitbybit-dev/babylonjs';
import { Color3, PBRMetallicRoughnessMaterial, Scene, Mesh } from '@babylonjs/core'; // Assuming Mesh is used for groups
import { Inputs } from '@bitbybit-dev/babylonjs';
import type { Current } from '../models/current';
import type { Model } from '../models/model';

// Main function to create the shape
export const createShape = async ( /* ...parameters... */ ) => {
  if (scene && bitbybit) {
    // 1. Cleanup: Delete previous OCCT shapes
    if (shapesToClean.length > 0) {
      await bitbybit.occt.deleteShapes({ shapes: shapesToClean });
    }
    shapesToClean = []; // Reset the array for the new generation

    // 2. Define Base Curves:
    //    The script defines several sets of points (sd.groundCrv, sd.firstCrv, etc.)
    //    These points are interpolated to create guiding NURBS curves using
    //    bitbybit.occt.shapes.wire.interpolatePoints().
    //    These curves are mirrored to create a symmetrical base.
    //    All created OCCT wires are added to shapesToClean.
    // Example:
    // const groundCrv = await shapes.wire.interpolatePoints({ points: sd.groundCrv });
    // shapesToClean.push(groundCrv);
    // const groundCrvMir = await transforms.mirrorAlongNormal({ shape: groundCrv, normal: [0,0,1] });
    // shapesToClean.push(groundCrvMir);

    // 3. Create Lofted Surface:
    //    A main surface is created by lofting through these guide curves using
    //    bitbybit.occt.operations.loftAdvanced(). This forms the primary shell of the house.
    //    The resulting lofted shape is added to shapesToClean.
    // Example:
    // const loft = await operations.loftAdvanced({ shapes: [ /* ...all guide wires... */ ], straight: true });
    // shapesToClean.push(loft);

    // 4. Extract Faces:
    //    Specific faces (e.g., roof, wall) are extracted from the lofted surface using
    //    bitbybit.occt.shapes.face.getFace().
    //    These faces are added to shapesToClean.

    // 5. Generate Hexagonal Patterns (Roof and Walls):
    //    - createHexagonsRoof(): This helper function takes a roof face and subdivides it
    //      into hexagonal wires using bitbybit.occt.shapes.face.subdivideToHexagonWires().
    //      It then creates faces from these wires (inner and outer for thickness) and
    //      extrudes them (makeThickSolidSimple) to form 3D hexagonal panels.
    //      These panels are grouped into compounds.
    //    - createHexagonsWalls(): Similarly, this function takes a wall face and uses
    //      bitbybit.occt.shapes.face.subdivideToHexagonHoles() to create perforated wall panels.
    //      These are then extruded.
    //    All intermediate and final OCCT shapes from these functions are added to shapesToClean.

    // 6. Mirror and Compound:
    //    The generated roof and wall sections are mirrored to complete the symmetrical structure.
    //    All parts are combined into a final OCCT compound shape using
    //    bitbybit.occt.shapes.compound.makeCompound(). This final compound is also added to shapesToClean.
    //    The script also creates sub-compounds for different material groups (compRoof1, compRoof2, etc.).

    // 7. Drawing with BabylonJS:
    //    - Drawing options (Inputs.Draw.DrawOcctShapeOptions) are defined, controlling precision,
    //      whether to draw edges/faces, and edge color.
    //    - BabylonJS PBRMetallicRoughnessMaterials are created with colors from the model.
    //      model.drawEdges influences material properties like zOffset for edge visibility.
    //    - Each OCCT sub-compound (compRoof1, compRoof2, etc.) is drawn into a BabylonJS mesh
    //      using bitbybit.draw.drawAnyAsync(), applying the appropriate material.
    //    - These resulting BabylonJS meshes are stored in current.groups for later manipulation (rotation, disposal).

    // 8. Return Final OCCT Shape:
    //    The main OCCT compound shape is returned, which can be used for STEP export.
    return finalShape; // This would be the main OCCT compound
  }
  return undefined; // Fallback
};

// Helper: createHexagonsWalls - uses subdivideToHexagonHoles for perforated effect
async function createHexagonsWalls(f, nrHexagonsU, nrHexagonsV, bitbybit) { /* ... OCCT logic ... */ }

// Helper: createHexagonsRoof - uses subdivideToHexagonWires, creates faces, then thick solids
async function createHexagonsRoof(f, nrHexagonsU, nrHexagonsV, bitbybit) { /* ... OCCT logic ... */ }
`}
</CodeBlock>

**Dissecting `create-shape.ts`:**

*   **Cleanup First:** The function begins by deleting any OCCT shapes stored in `shapesToClean` from previous executions. This is paramount for managing memory with OCCT, as its objects are not automatically garbage collected by JavaScript. The `shapesToClean` array is then reset.
*   **Defining Base Curves:** The geometry starts with several arrays of 3D points (`sd.groundCrv`, `sd.firstCrv`, etc.). These points define the paths for guide curves. Bitbybit's `shapes.wire.interpolatePoints()` creates smooth NURBS curves through these points. These initial curves are then often mirrored using `transforms.mirrorAlongNormal()` to achieve symmetry.
*   **Creating the Main Lofted Surface:** A primary, complex surface is generated by "lofting" through the series of guide curves using `operations.loftAdvanced()`. This operation creates a smooth skin that transitions between the profiles of the input wires, forming the overall shell of the Hex House.
*   **Extracting Key Faces:** From this lofted shell, specific faces like the "roof" and "wall" sections are extracted using `face.getFace()`. These individual faces will be further processed.
*   **Generating Hexagonal Patterns:**
    *   **`createHexagonsWalls`:** This helper function takes a wall face and uses `face.subdivideToHexagonHoles()`. This powerful OCCT function directly creates a face with hexagonal perforations, based on parameters like the number of hexagons (`nrHexagonsU`, `nrHexagonsV`) and scaling patterns. The result is then extruded using `operations.extrude()` to give it thickness.
    *   **`createHexagonsRoof`:** This function is more intricate for the roof panels. It first subdivides the roof face into a grid of hexagonal *wires* using `face.subdivideToHexagonWires()`. It does this twice with slightly different scaling to get inner and outer boundaries for each hex cell. Then, for each pair of inner/outer hex wires, it creates a face using `face.createFaceFromWires()`. Finally, these individual hex faces are given thickness using `operations.makeThickSolidSimple()`. The panels are grouped based on a height pattern to create variation.
*   **Mirroring and Compounding:** The generated roof and wall sections are mirrored to complete the house's symmetry. All these individual OCCT solids are then combined into a single OCCT compound shape using `shapes.compound.makeCompound()`. This `finalShape` is what might be used for a STEP export. Sub-compounds are also created for applying different materials.
*   **Drawing to BabylonJS:**
    *   `Inputs.Draw.DrawOcctShapeOptions` are configured to control how the OCCT shapes are tessellated and drawn (e.g., `precision`, `drawEdges`, `edgeColour`).
    *   BabylonJS `PBRMetallicRoughnessMaterial` instances are created, with their `baseColor` set from `model.color` (and other colors for different parts).
    *   `bitbybit.draw.drawAnyAsync()` is called for each OCCT sub-compound. This function, part of the `@bitbybit-dev/babylonjs` integration, converts the OCCT geometry into BabylonJS `Mesh` objects and applies the specified material.
    *   The resulting BabylonJS meshes are stored in `current.groups` for easy access (e.g., for rotation or disposal in `main.ts`).
*   **Return Value:** The function returns the final OCCT compound shape, which is useful if you need to perform further CAD operations on it or for precise exports like STEP.

## Conclusion

This Hex House concept tutorial demonstrates a robust approach to building highly parametric and visually complex 3D models using Bitbybit with BabylonJS and the OCCT kernel. You've seen how to:

*   Structure a project with clear separation of concerns (BabylonJS setup, GUI, core geometry logic).
*   Initialize Bitbybit correctly within a BabylonJS context.
*   Leverage advanced OCCT operations like lofting, surface subdivision into patterns, and boolean operations (implicitly via hole creation or extrusions) through Bitbybit's API.
*   Manage OCCT memory by diligently tracking and deleting intermediate shapes.
*   Control the model dynamically using a `lil-gui` interface.
*   Convert OCCT geometry into renderable BabylonJS meshes with appropriate materials.
*   Organize drawn meshes in the BabylonJS scene for collective manipulation and proper disposal.

This example provides a solid foundation and illustrates powerful techniques for developing sophisticated web-based 3D configurators and design tools.