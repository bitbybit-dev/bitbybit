---
sidebar_position: 3
title: "Advanced Parametric 3D Model with BabylonJS & Bitbybit"
sidebar_label: "Parametric Model (BabylonJS)"
description: "Learn how to build an advanced, interactive parametric 3D model using Bitbybit with BabylonJS, OCCT, and a GUI for real-time control."
tags: [npm-packages, babylonjs]
---

import BitByBitRenderCanvas from '@site/src/components/BitByBitRenderCanvas';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';
import Admonition from '@theme/Admonition';

# Advanced Parametric 3D Model with BabylonJS & Bitbybit

This tutorial explores building a sophisticated, interactive parametric 3D model utilizing Bitbybit's robust integration with the BabylonJS rendering engine. We will construct a configurable "Hex Shell" 3D shape, where its geometry is dynamically controlled by parameters from a `lil-gui` interface. The underlying complex CAD operations will be handled by the OpenCascade (OCCT) kernel, accessed via Bitbybit.

You can see what the results of this app look like (rendered in Unreal Engine):
<div class="responsive-video-container">
  <iframe 
    width="560" 
    height="315" 
    src="https://www.youtube.com/embed/MbiELkXKCcY" 
    title="From Web to Unreal Engine - Parametric Pavilion Design with Bitbybit running in THREEJS & BABYLONJS" 
    frameborder="0" 
    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen" 
    allowfullscreen>
  </iframe>
</div>

Through this example, you will learn to:

*   Set up a BabylonJS scene and rendering engine.
*   Initialize Bitbybit with specific geometry kernels (OCCT in this case) for a BabylonJS environment.
*   Create intricate parametric geometry using Bitbybit's OCCT API.
*   Employ `lil-gui` to generate a user interface for real-time control over model parameters.
*   Dynamically update the 3D model in the BabylonJS scene as UI parameters change.
*   Implement a Level of Detail (LOD) strategy for efficient shape generation during interaction and finalization.
*   Integrate functionality to export the 3D model in common formats like STEP, STL, and GLB.

We are providing a higher level explanations of the codebase below, but for working reference always check this live example on StackBlitz, which, as platform evolves could change slightly.

<BitByBitRenderCanvas
  requireManualStart={true}
  iframeUrl="https://stackblitz.com/edit/hex-shell-babylonjs-bitbybit-for-docs?embed=1&file=src%2Fmain.ts&theme=dark"
  title="StackBlitz - Advanced Parametric 3D Model"
/>

### Find the source code on [Bitbybit GitHub Examples](https://github.com/bitbybit-dev/bitbybit/tree/master/examples/vite/babylonjs/hex-shell)

## Project Structure Overview

A well-organized project structure is key for managing more complex applications. This example typically involves:

*   `index.html`: The entry point for the browser, hosting the canvas and loading our scripts.
*   `style.css`: Contains basic CSS for page layout, canvas presentation, and UI elements such as a loading spinner.
*   `src/main.ts`: The primary TypeScript file that orchestrates the entire application, from scene setup and Bitbybit initialization to GUI interactions and geometry updates.
*   `src/models/`: A directory to define the data structures (TypeScript interfaces/types and initial values) for:
    *   `model.ts`: Parameters controlling the 3D shape's geometry.
    *   `current.ts`: References to current scene objects (meshes, lights, GUI instance).
*   `src/helpers/`: This directory houses utility functions, each with a distinct responsibility:
    *   `init-babylonjs.ts`: Responsible for setting up the BabylonJS `Engine`, `Scene`, `Camera`, default lighting, and a ground plane.
    *   `create-shape.ts`: The core of the geometric logic, containing the functions that use Bitbybit's OCCT API to generate the parametric "Hex Shell" model.
    *   `create-gui.ts`: Configures the `lil-gui` panel, linking its controls to the parameters in `model.ts` and connecting them to the geometry update functions.
    *   `downloads.ts`: Implements the logic for exporting the generated 3D model to STEP, STL, and GLB file formats.
    *   `gui-helper.ts`: Provides simple utility functions for managing the GUI's visual state (e.g., showing/hiding a loading spinner, enabling/disabling GUI controls).

<Admonition type="info" title="Simplified Kernel Initialization">
  Since version 0.21.1, Bitbybit provides a simplified `initBitByBit()` helper function that handles all worker creation and kernel initialization automatically by loading kernels from CDN. This eliminates the need for manual worker file setup. For details, see our [**BabylonJS Integration Starter Tutorial**](./start-with-babylon-js). If you need to host assets on your own infrastructure, see [Self-Hosting Assets](/learn/hosting-and-cdn).
</Admonition>

## 1. HTML Setup (`index.html`)

The `index.html` file provides the basic webpage structure.

<CodeBlock language="html" title="index.html">
{`<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <link rel="icon" type="image/svg+xml" href="/vite.svg" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Bitbybit & BabylonJS Hex Shell Example</title>
    </head>
    <body>
        <a
        class="logo"
        href="https://bitbybit.dev"
        target="_blank"
        rel="noopener noreferrer"
        >
        <img
            alt="Logo of Bit by bit developers company"
            src="https://bitbybit.dev/assets/logo-gold-small.png"
        />
        <div>bitbybit.dev</div>
        <br />
        <div>support the mission - subscribe</div>
        </a>
        <canvas id="babylon-canvas"></canvas>
        <script type="module" src="/src/main.ts"></script>
    </body>
</html>`}
</CodeBlock>

**Key elements:**
*   A `<canvas id="babylon-canvas">` element: This is where BabylonJS will render the 3D scene.
*   A `<script>` tag: Loads the main application logic from `src/main.ts`.

## 2. Main Application Logic (`src/main.ts`)

This file is the central coordinator for our application, bringing together the BabylonJS scene, Bitbybit's functionalities, the GUI, and the dynamic update logic.

<CodeBlock language="typescript" title="src/main.ts">
{`import './style.css';
import {
    BitByBitBase,
    Inputs,
    initBitByBit,
    type InitBitByBitOptions,
} from '@bitbybit-dev/babylonjs';
import { model, current } from './models';
import {
    initBabylonJS,
    createGui,
    createShapeLod1,
    createShapeLod2,
    createDirLightsAndGround,
    disableGUI,
    enableGUI,
    hideSpinner,
    showSpinner,
    downloadGLB,
    downloadSTL,
    downloadStep,
} from './helpers';

// Configuration for enabling Bitbybit geometry kernels
const options: InitBitByBitOptions = {
    enableOCCT: true, // This example primarily uses OCCT for its CAD operations
    enableJSCAD: false,
    enableManifold: false,
};

// Application entry point
start();

async function start() {
    // 1. Initialize the BabylonJS Engine and Scene
    const { scene, engine } = initBabylonJS();

    // 2. Initialize BitByBitBase for BabylonJS
    const bitbybit = new BitByBitBase();

    // Add default lighting and a ground plane to the scene
    createDirLightsAndGround(bitbybit, current);

    // Initialize Bitbybit with the selected geometry kernels using the helper function.
    // This automatically creates workers and loads kernels from CDN.
    await initBitByBit(scene, bitbybit, options);

    // Variables to store the final OCCT shape and intermediate shapes for cleanup
    let finalShape: Inputs.OCCT.TopoDSShapePointer | undefined;
    let shapesToClean: Inputs.OCCT.TopoDSShapePointer[] = []; // Crucial for OCCT memory management

    // 3. Connect download functions to the model object (for GUI buttons)
    model.downloadStep = () => downloadStep(bitbybit, finalShape);
    model.downloadGLB = () => downloadGLB(bitbybit);
    model.downloadSTL = () => downloadSTL(bitbybit, finalShape);

    // 4. Create the GUI panel and link its controls
    createGui(current, model, updateShape);

    // 5. Setup a simple rotation animation for the generated groups
    const rotationSpeed = 0.0005;
    const rotateGroup = () => {
        if (
        model.rotationEnabled &&
        current.group1 && // 'current' holds references to BabylonJS Meshes/TransformNodes
        current.group2 &&
        current.dimensions
        ) {
        current.group1.rotation.y -= rotationSpeed;
        current.group2.rotation.y -= rotationSpeed;
        current.dimensions.rotation.y -= rotationSpeed;
        }
    };

    // Register the rotation function with BabylonJS's before render observable
    scene.onBeforeRenderObservable.add(() => rotateGroup());

    // Start BabylonJS's main render loop
    engine.runRenderLoop(() => {
        scene.render(true, false); // Render the scene on each frame
    });

    // 6. Generate and draw the initial 3D model (using Level of Detail 1 for faster preview)
    finalShape = await createShapeLod1(
        bitbybit,
        scene,
        model,      // Contains current parameters from the GUI/defaults
        shapesToClean, // Array for OCCT shapes that need explicit cleanup
        current       // Stores references to created BabylonJS meshes/groups
    );

    // 7. Define the function to update the shape when GUI parameters change
    async function updateShape(finish: boolean) {
        disableGUI(); // Temporarily disable GUI during processing
        showSpinner();  // Show a loading indicator

        // Dispose of previously created BabylonJS Meshes to clear the scene
        // The second parameter 'true' ensures child meshes are also disposed.
        current.group1?.dispose(false, true);
        current.group2?.dispose(false, true);
        current.dimensions?.dispose(false, true);
        // Note: OCCT shapes are managed and cleaned up within the createShapeLod1/2 functions
        // using the 'shapesToClean' array.

        if (finish) { // 'finish' is true if the "Finalize" GUI button is pressed
        // Generate the shape with higher detail (LOD2)
        finalShape = await createShapeLod2(
            bitbybit, scene, model, shapesToClean, current
        );
        } else { // Default update (e.g., when a slider is dragged)
        // Generate the shape with lower detail for faster interactive feedback (LOD1)
        finalShape = await createShapeLod1(
            bitbybit, scene, model, shapesToClean, current
        );
        }

        hideSpinner(); // Hide loading indicator
        enableGUI();   // Re-enable GUI
    }
}
`}
</CodeBlock>

**Explanation of `main.ts`:**

1.  **Imports:** Includes `BitByBitBase`, `Inputs`, `initBitByBit`, and `InitBitByBitOptions` from `@bitbybit-dev/babylonjs`, along with local models and helper functions.
2.  **`options`:** Specifies that only the OCCT kernel should be enabled and initialized for this particular application, as it's the one used for the Hex Shell's CAD operations.
3.  **`start()` function (Main Application Flow):**
    *   **BabylonJS Setup:** `initBabylonJS()` initializes the BabylonJS `Engine` and `Scene`.
    *   **Bitbybit Initialization:** An instance of `BitByBitBase` is created. The `initBitByBit()` helper function is then called to initialize the Bitbybit instance with the scene and the kernel options. This helper automatically creates web workers, loads kernel WASM files from CDN, and waits for the selected kernels to be ready.
    *   **Scene Elements:** `createDirLightsAndGround()` adds basic lighting and a ground plane using Bitbybit's BabylonJS helpers.
    *   **Shape Management:** `finalShape` will store the primary OCCT geometry. `shapesToClean` is an array used to track intermediate OCCT shapes created during geometry generation; these need to be explicitly deleted using `bitbybit.occt.deleteShapes()` to manage memory effectively, especially with complex CAD operations.
    *   **Download Functions:** The `downloadStep`, `downloadGLB`, and `downloadSTL` functions (from `helpers/downloads.ts`) are attached to the `model` object so they can be easily triggered by GUI buttons.
    *   **GUI Creation:** `createGui()` sets up the `lil-gui` panel, linking its controls to the parameters defined in `model.ts`. Changes in the GUI will trigger the `updateShape` function.
    *   **Animation:** A simple `rotateGroup` function is defined and added to BabylonJS's `scene.onBeforeRenderObservable` to animate parts of the model if `model.rotationEnabled` is true.
    *   **Render Loop:** `engine.runRenderLoop()` starts BabylonJS's continuous rendering process.
    *   **Initial Shape:** `createShapeLod1()` is called to generate and display the initial version of the Hex Shell model using a lower level of detail for quicker startup.
    *   **`updateShape(finish: boolean)` function:** This is the core of the dynamic updates.
        *   It's triggered by GUI interactions.
        *   It disables the GUI and shows a spinner.
        *   It disposes of previous BabylonJS meshes using `mesh.dispose(false, true)` to clear the old geometry from the scene.
        *   It then calls either `createShapeLod1` (for faster, interactive previews) or `createShapeLod2` (for a more detailed, finalized version) based on the `finish` flag.
        *   After regeneration, it hides the spinner and re-enables the GUI.

## 3. Helper Functions (`src/helpers/`)

Helper functions promote modularity and code organization.

### `init-babylonjs.ts`

*   **`initBabylonJS()`:** This module is responsible for all the initial BabylonJS setup. It:
    *   Gets the `<canvas>` element.
    *   Creates the BabylonJS `Engine`.
    *   Creates the `Scene` and sets basic properties like clear color.
    *   Sets up an `ArcRotateCamera` for user navigation.
    *   Adds a `HemisphericLight` for ambient illumination.
    *   Initializes the render loop via `engine.runRenderLoop()`.
    *   Handles window resize events to keep the rendering correct.
*   **`createDirLightsAndGround()`:** This helper specifically adds directional lights (important for casting shadows and defining highlights) and a ground mesh (e.g., a cylinder or plane) to the BabylonJS scene. It might use Bitbybit's BabylonJS API helpers for convenience.

### `create-shape.ts` (Core OCCT Geometry Logic)

This file is where the detailed CAD work for the "Hex Shell" happens, using Bitbybit's OCCT API. Its structure typically involves:

*   **LOD Functions:** `createShapeLod1` for a faster, simplified version and `createShapeLod2` for the full-detail version.
*   **OCCT Memory Management:** A crucial aspect. Before generating new OCCT geometry, it calls `await bitbybit.occt.deleteShapes({ shapes: shapesToClean })` to free memory from shapes created in the previous update. Any new intermediate OCCT shapes created during the current generation are added to the `shapesToClean` array.
*   **Parametric Geometry Creation:**
    *   Uses `model` parameters (e.g., `model.uHex`, `model.height`) to drive the dimensions and features.
    *   Employs a sequence of OCCT operations via `bitbybit.occt.*` (e.g., `shapes.wire.createEllipseWire`, `transforms.rotate`, `operations.loft`, `operations.offset`, `shapes.face.subdivideToHexagonWires`, `shapes.compound.makeCompound`).
    *   The example creates a base lofted surface, then subdivides it into hexagonal wire patterns on several offset surfaces, and finally creates solids by lofting between these patterns.
*   **Dimensioning (Optional but present in example):** The code also includes logic to create OCCT 3D dimension entities (lines, angles, labels) using `bitbybit.occt.dimensions.*` functions, which are then compounded with the main shape.
*   **Drawing with BabylonJS Integration:**
    *   After OCCT shapes are generated, `bitbybit.draw.drawAnyAsync({ entity: occtShape, options: drawOptions })` is called. The `@bitbybit-dev/babylonjs` version of this function converts the OCCT shape data into BabylonJS `Mesh` objects.
    *   It creates and applies BabylonJS materials (e.g., `PBRMetallicRoughnessMaterial` from `@babylonjs/core`) to these meshes.
    *   The resulting meshes are often parented to BabylonJS `Mesh` objects (acting as groups, stored in `current.group1`, `current.group2`) for organization and collective transformations (like rotation).

<Admonition type="info" title="OCCT Operations Deep Dive">
  The specific sequence of OCCT operations in `create-shape.ts` (lofting, offsetting, subdividing, compounding) is tailored to generate the intricate "Hex Shell" design. To understand each step in detail, you would refer to the Bitbybit API documentation for the corresponding OCCT functions.
</Admonition>

### `create-gui.ts` (BabylonJS Context)

This sets up the `lil-gui` panel. Its operation is very similar across different rendering engines, but material updates are engine-specific.

<CodeBlock language="typescript" title="src/helpers/create-gui.ts (Key BabylonJS Material Update)">
{`// ... (other GUI setup) ...
gui
  .addColor(model, 'color1')
  .name('Color 1')
  .onChange((value: string) => {
    // Iterate through meshes in the group and update their material
    current.group1?.getChildren().forEach((node) => { // A group node
      node.getChildMeshes().forEach(mesh => { // Get actual meshes
        if (mesh.material && mesh.material instanceof PBRMetallicRoughnessMaterial) {
          const mat = mesh.material as PBRMetallicRoughnessMaterial;
          mat.baseColor = Color3.FromHexString(value); // BabylonJS Color3
        }
      });
    });
  });
// Similar logic for 'color2' and current.group2
`}
</CodeBlock>

*   When a color control in the GUI changes, the callback iterates through the child meshes of the relevant group (`current.group1` or `current.group2`).
*   It accesses the mesh's `material` property.
*   It updates the material's `baseColor` (assuming `PBRMetallicRoughnessMaterial`) using BabylonJS's `Color3.FromHexString()`.

### `downloads.ts` (BabylonJS Context)

This module handles file exports:

*   **`downloadStep()`:** Uses `bitbybit.occt.io.saveShapeSTEP()` to save the `finalShape` (the OCCT compound object) as a STEP file. This is an OCCT-level operation.
*   **`downloadSTL()`:** Your example uses `bitbybit.occt.io.saveShapeStl()` to export the `finalShape` from OCCT directly as an STL. This is efficient for CAD-derived STL.
*   **`downloadGLB()`:** This uses `bitbybit.babylon.io.exportGLB()`. This function is specific to the `@bitbybit-dev/babylonjs` package and exports the current state of the BabylonJS scene (or selected parts of it) to a GLB file.

### `gui-helper.ts`

These DOM manipulation utilities (disable/enable GUI, show/hide spinner) are generic.

## 4. Data Models (`src/models/`)

*   **`model.ts`:** Defines the `Model` type for geometric parameters and an initial `model` object (same structure as before).
*   **`current.ts`:** This is where BabylonJS types become apparent. The `Current` type now holds references to BabylonJS objects:

<CodeBlock language="typescript" title="src/models/current.ts (BabylonJS types)">
{`import { DirectionalLight, Mesh } from '@babylonjs/core'; // BabylonJS specific imports
import { GUI } from 'lil-gui';

export type Current = {
    group1: Mesh | undefined; // BabylonJS Mesh (can act as a group/parent)
    group2: Mesh | undefined; // BabylonJS Mesh
    dimensions: Mesh | undefined; // BabylonJS Mesh for dimensions
    light1: DirectionalLight | undefined; // BabylonJS Light
    ground: Mesh | undefined; // BabylonJS Mesh for the ground
    gui: GUI | undefined;
};

export const current: Current = { /* ... initial undefined values ... */ };
`}
</CodeBlock>

## 5. Styles (`style.css`)

The CSS primarily styles the page layout, logo, and the loading spinner. A key selector is for the canvas:

<CodeBlock language="css" title="style.css (Canvas Style)">
{`/* ... other styles ... */
#babylon-canvas { /* Targets the canvas ID used in index.html */
    width: 100%;
    height: 100%;
    overflow: hidden;
    position: absolute; /* Often used for full-viewport canvas */
    outline: none;
}
/* ... spinner styles ... */
`}
</CodeBlock>

## Conclusion

This advanced tutorial has demonstrated how to construct a complex, parametric 3D model using Bitbybit's OCCT capabilities and render it interactively with BabylonJS. You've seen how to:

*   Structure a project with separate modules for different functionalities.
*   Initialize and use Bitbybit within a BabylonJS engine and scene context.
*   Implement parametric geometry generation that responds to GUI controls.
*   Manage different Levels of Detail (LOD) for performance.
*   Handle OCCT memory by cleaning up intermediate shapes.
*   Dispose of BabylonJS meshes before redrawing to update the scene.
*   Integrate export functionalities for common 3D file formats.

This robust approach allows for the creation of highly interactive and detailed 3D web applications, leveraging the strengths of both Bitbybit's CAD engine and BabylonJS's rendering power.