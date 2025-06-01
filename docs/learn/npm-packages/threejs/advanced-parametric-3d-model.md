---
sidebar_position: 3
title: "Advanced Parametric 3D Model with ThreeJS & Bitbybit"
sidebar_label: "Parametric Model (ThreeJS)"
description: "Learn how to build an advanced, interactive parametric 3D model using Bitbybit with ThreeJS, OCCT, and a GUI for real-time control."
tags: [npm-packages, threejs]
---

import BitByBitRenderCanvas from '@site/src/components/BitByBitRenderCanvas';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';
import Admonition from '@theme/Admonition';

# Advanced Parametric 3D Model with ThreeJS & Bitbybit

This tutorial explores a more advanced example of creating an interactive, parametric 3D model using Bitbybit's ThreeJS integration. We'll build a configurable 3D shape whose geometry is driven by parameters controlled via a GUI (Graphical User Interface), leveraging the OpenCascade (OCCT) kernel for robust CAD operations.

You can see what the results of this app look like (rendered in Unreal Engine):
<div class="responsive-video-container">
  <iframe 
    width="560" 
    height="315" 
    src="https://www.youtube.com/embed/MbiELkXKCcY" 
    title="From Web to Unreal Engine - Parametric Pavilion Design with Bitbybit running in THREEJS & BABYLONJS" 
    frameborder="0" 
    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
    allowfullscreen>
  </iframe>
</div>

This example demonstrates:
*   Setting up a ThreeJS scene.
*   Initializing Bitbybit with specific geometry kernels (OCCT in this case).
*   Creating parametric geometry using Bitbybit's OCCT API.
*   Using `lil-gui` to create a simple UI for controlling model parameters.
*   Dynamically updating the 3D model in response to UI changes.
*   Implementing Level of Detail (LOD) for shape generation (a simpler version for quick updates, a more detailed one for finalization).
*   Handling 3D model exports (STEP, STL, GLB).

We are providing a higher level explanations of the codebase below, but for working reference always check this live example on StackBlitz, which, as platform evolves could change slightly.

<BitByBitRenderCanvas
  requireManualStart={true}
  iframeUrl="https://stackblitz.com/edit/hex-shell-threejs-bitbybit-for-docs?embed=1&file=src%2Fmain.ts&theme=dark"
  title="StackBlitz - Advanced Parametric 3D Model with ThreeJS & Bitbybit"
/>


### Find the source code on [Bitbybit GitHub Examples](https://github.com/bitbybit-dev/bitbybit/tree/master/examples/vite/threejs/hex-shell)

## Project Structure Overview

This project is typically structured with:
*   `index.html`: The main HTML file to host the canvas and load scripts.
*   `style.css`: For basic styling of the page and UI elements like a loading spinner.
*   `src/main.ts`: The main entry point of our application, orchestrating scene setup, Bitbybit initialization, GUI, and geometry updates.
*   `src/models/`: A directory to define data structures for our model parameters (`model.ts`), kernel initialization options (`kernel-options.ts`), and current scene state (`current.ts`).
*   `src/helpers/`: A directory for utility functions, broken down by responsibility:
    *   `init-threejs.ts`: Sets up the ThreeJS scene, camera, renderer, lights, and ground.
    *   `init-kernels.ts`: Handles the initialization of selected Bitbybit geometry kernels.
    *   `create-shape.ts`: Contains the core logic for generating the parametric 3D geometry using OCCT. This is where the detailed CAD operations happen.
    *   `create-gui.ts`: Sets up the `lil-gui` panel and links its controls to the model parameters and update functions.
    *   `downloads.ts`: Implements functions for exporting the model to various file formats.
    *   `gui-helper.ts`: Provides utility functions for managing the GUI state (e.g., showing/hiding a spinner, disabling/enabling GUI).
*   `src/workers/`: Directory containing the individual worker files for each geometry kernel (e.g., `occt.worker.ts`).

<Admonition type="info" title="Worker Setup">
  For a detailed explanation of how to set up the Web Worker files (`occt.worker.ts`, `jscad.worker.ts`, `manifold.worker.ts`), please refer to our [**ThreeJS Integration Starter Tutorial**](./start-with-three-js). This current tutorial focuses on the application logic built upon that foundation.
</Admonition>

## 1. HTML Setup (`index.html`)

The HTML file is straightforward, providing the basic structure for our 3D application.

<CodeBlock language="html" title="index.html">
{`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Bitbybit & ThreeJS Hex Shell Example</title>
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
    <canvas id="three-canvas"></canvas>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>`}
</CodeBlock>

**Key elements:**
*   A `<canvas id="three-canvas">` element where the ThreeJS scene will be rendered.
*   A script tag to load our main application logic from `src/main.ts`.
*   A simple Bitbybit logo link.

## 2. Main Application Logic (`src/main.ts`)

This is the heart of our application, orchestrating all the major components.

<CodeBlock language="typescript" title="src/main.ts">
{`import './style.css';
import { BitByBitBase, Inputs } from '@bitbybit-dev/threejs';
import { model, type KernelOptions, current } from './models';
import {
  initKernels,
  initThreeJS,
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

// Configure which geometry kernels to enable
const kernelOptions: KernelOptions = {
  enableOCCT: true, // We'll use OCCT for this parametric model
  enableJSCAD: false,
  enableManifold: false,
};

// Start the application
start();

async function start() {
  // 1. Initialize the ThreeJS scene, camera, renderer, and basic lights/ground
  const { scene } = initThreeJS();
  createDirLightsAndGround(scene, current); // 'current' stores references to scene objects

  // 2. Initialize Bitbybit with the ThreeJS scene and selected kernels
  const bitbybit = new BitByBitBase();
  await initKernels(scene, bitbybit, kernelOptions);

  // Variables to hold the OCCT shape representation and shapes to clean up
  let finalShape: Inputs.OCCT.TopoDSShapePointer | undefined;
  let shapesToClean: Inputs.OCCT.TopoDSShapePointer[] = []; // Important for memory management

  // 3. Connect download functions to the model object (used by GUI)
  model.downloadStep = () => downloadStep(bitbybit, finalShape);
  model.downloadGLB = () => downloadGLB(scene);
  model.downloadSTL = () => downloadSTL(scene);

  // 4. Create the GUI panel and link it to model parameters and the updateShape function
  createGui(current, model, updateShape);

  // 5. Basic animation setup for rotating the model
  const rotationSpeed = 0.0005;
  const rotateGroup = () => {
    if (
      model.rotationEnabled &&
      current.group1 && // Assumes group1, group2, dimensions are populated by createShape...
      current.group2 &&
      current.dimensions
    ) {
      current.group1.rotation.y -= rotationSpeed;
      current.group2.rotation.y -= rotationSpeed;
      current.dimensions.rotation.y -= rotationSpeed;
    }
  };

  // Hook into ThreeJS render loop for animation
  scene.onBeforeRender = () => {
    rotateGroup();
  };

  // 6. Initial shape creation (Level of Detail 1 - faster preview)
  finalShape = await createShapeLod1(
    bitbybit,
    scene,
    model,      // Current model parameters
    shapesToClean, // Array to track OCCT shapes for later cleanup
    current       // Object to store references to current ThreeJS groups
  );

  // 7. Function to update the shape when GUI parameters change
  async function updateShape(finish: boolean) {
    disableGUI(); // Prevent further interaction during update
    showSpinner();  // Indicate processing

    // Remove previous ThreeJS groups from the scene
    current.group1?.traverse((obj) => scene?.remove(obj));
    current.group2?.traverse((obj) => scene?.remove(obj));
    current.dimensions?.traverse((obj) => scene?.remove(obj));
    // Note: OCCT shapes are cleaned up within createShapeLod1/2 via shapesToClean

    if (finish) { // 'finish' is true when "Finalize" button in GUI is clicked
      finalShape = await createShapeLod2( // Higher detail
        bitbybit, scene, model, shapesToClean, current
      );
    } else { // Default update (e.g., from slider drag)
      finalShape = await createShapeLod1( // Lower detail for speed
        bitbybit, scene, model, shapesToClean, current
      );
    }

    hideSpinner();
    enableGUI(); // Re-enable GUI
  }
}
`}
</CodeBlock>

**Explanation of `main.ts`:**

1.  **Imports:** Pulls in necessary Bitbybit modules, data models, and helper functions.
2.  **`kernelOptions`:** Configures which Bitbybit geometry kernels (OCCT, JSCAD, Manifold) will be initialized. For this example, only OCCT is enabled as it's used for the parametric modeling.
3.  **`start()` function:** The main asynchronous function that orchestrates the application.
    *   **`initThreeJS()` & `createDirLightsAndGround()`:** Sets up the basic ThreeJS environment.
    *   **`BitByBitBase` & `initKernels()`:** Initializes the Bitbybit library, linking it to the ThreeJS scene and loading the configured OCCT kernel worker.
    *   **`finalShape` & `shapesToClean`:** `finalShape` will hold a reference to the main OCCT geometry. `shapesToClean` is crucial for managing memory in OCCT by keeping track of intermediate shapes that need to be explicitly deleted after they are no
        longer needed.
    *   **Download Functions:** Attaches download helper functions to the `model` object. These will be triggered by buttons in the GUI.
    *   **`createGui()`:** Initializes the `lil-gui` panel, connecting its controls to the properties defined in `model.ts` and providing the `updateShape` function as a callback when parameters change.
    *   **Rotation Logic:** Sets up a simple animation to rotate the generated 3D groups if `model.rotationEnabled` is true.
    *   **Initial Shape Creation:** Calls `createShapeLod1` to generate and draw the initial 3D model with a lower level of detail for faster startup.
    *   **`updateShape(finish: boolean)` function:**
        *   This function is called by the GUI when a parameter changes.
        *   It disables the GUI and shows a spinner to indicate processing.
        *   It removes the previously rendered ThreeJS `Group` objects (`current.group1`, `current.group2`, `current.dimensions`) from the scene.
        *   Crucially, the `createShapeLod1` and `createShapeLod2` functions are responsible for cleaning up OCCT shapes using the `shapesToClean` array.
        *   It then calls either `createShapeLod1` (for quick updates, e.g., during slider dragging) or `createShapeLod2` (for a more detailed final version when a "Finalize" button is clicked).
        *   Finally, it hides the spinner and re-enables the GUI.

## 3. Helper Functions (`src/helpers/`)

The `helpers` directory modularizes different aspects of the application.

### `init-threejs.ts` & `init-kernels.ts`

*   **`initThreeJS()`:** Contains standard ThreeJS setup for scene, camera, WebGL renderer, basic lighting (HemisphereLight, DirectionalLights), a ground plane, and OrbitControls for camera manipulation. It also sets up the animation loop.
*   **`createDirLightsAndGround()`:** A helper to specifically add directional lights (for shadows) and a ground plane to the scene.
*   **`initKernels()`:** This function is responsible for:
    1.  Conditionally creating Web Worker instances for each kernel specified in `kernelOptions`.
    2.  Calling `bitbybit.init(...)` to link Bitbybit with the ThreeJS scene and these worker instances.
    3.  Asynchronously waiting for each selected and available kernel to report that it has been fully initialized before resolving. This ensures kernels are ready before use.

<CodeBlock language="typescript" title="src/helpers/init-kernels.ts (Simplified Structure)">
{`// ... imports ...
export async function initKernels(
  scene: Scene,
  bitbybit: BitByBitBase,
  options: KernelOptions
): Promise<{ message: string }> {
  // 1. Conditionally create worker instances based on options
  //    (e.g., new Worker(new URL('../workers/occt.worker.ts', import.meta.url), ...))
  // 2. Initialize Bitbybit with scene and worker instances
  //    await bitbybit.init(scene, occtWorker, jscadWorker, manifoldWorker);
  // 3. Collect and await promises for kernel initializations
  //    (e.g., using firstValueFrom on bitbybit.occtWorkerManager.occWorkerState$)
  // 4. Resolve once selected kernels are ready
  return { message: "Kernels initialized" };
}`}
</CodeBlock>

### `create-shape.ts` (Core Geometry Logic)

This is the most complex file, containing the specific OCCT operations to generate the parametric shape. It typically includes:

*   Functions like `createShapeLod1` (Level of Detail 1 - faster, less detailed) and `createShapeLod2` (Level of Detail 2 - slower, more detailed).
*   **Memory Management:** Before creating new OCCT geometry, it calls `bitbybit.occt.deleteShapes({ shapes: shapesToClean })` to free memory used by previous intermediate OCCT shapes. New intermediate shapes created are added to `shapesToClean`.
*   **Geometric Operations:** Uses various functions from `bitbybit.occt.shapes`, `bitbybit.occt.operations`, `bitbybit.occt.transforms`, etc., to:
    *   Create primitive wires (e.g., ellipses using `wire.createEllipseWire`).
    *   Transform these wires (rotate, translate).
    *   Loft surfaces between wires (`operations.loft`).
    *   Offset faces (`operations.offset`).
    *   Subdivide faces into patterns (e.g., `face.subdivideToHexagonWires`).
    *   Create solids from these operations.
    *   Create compound shapes.
*   **Dimensioning (Optional):** The example includes logic to create OCCT dimension entities (`dimensions.simpleLinearLengthDimension`, `dimensions.simpleAngularDimension`) which are then also drawn.
*   **Drawing:**
    *   It uses `bitbybit.draw.drawAnyAsync({ entity: occtShape, options: drawOptions })` to convert the final OCCT shapes into ThreeJS meshes and add them to the scene.
    *   It often creates separate ThreeJS `Group` objects for different parts of the model (e.g., `current.group1`, `current.group2`) for easier management and independent animation.
    *   Materials (`MeshPhongMaterial`) are created and applied.

<Admonition type="info" title="OCCT Operations">
  The specific OCCT functions used (like `loft`, `offset`, `subdivideToHexagonWires`, `makeCompound`) are powerful CAD operations. Understanding their parameters and behavior is key to creating complex parametric models with OCCT. Refer to the Bitbybit API documentation for details on each.
</Admonition>

### `create-gui.ts`

This file uses the `lil-gui` library to create a user interface panel.

<CodeBlock language="typescript" title="src/helpers/create-gui.ts (Simplified Structure)">
{`import GUI from 'lil-gui';
// ... other imports ...
export const createGui = (
  current: Current,
  model: Model,
  updateShape: (finish: boolean) => void
) => {
  model.update = () => updateShape(true); // Link "Finalize" button to LOD2 update
  const gui = new GUI();
  current.gui = gui; // Store reference to GUI

  // Add controls for each parameter in the 'model' object
  gui.add(model, 'uHex', 1, 14, 1).name('Hexagons U').onFinishChange(() => updateShape(false));
  // ... more gui.add() calls for vHex, height, colors, etc. ...
  // .onFinishChange(() => updateShape(false)) calls LOD1 update for sliders
  // .onChange(...) for color pickers to update material colors directly

  gui.add(model, 'update').name('Finalize'); // Button to trigger LOD2 update
  gui.add(model, 'downloadSTL').name('Download STL');
  // ... download buttons ...
};`}
</CodeBlock>

*   It creates a new `GUI` instance.
*   For each parameter in the `model` object (defined in `models/model.ts`), it adds a corresponding control (slider, color picker, checkbox).
*   `onFinishChange` (for sliders) or `onChange` (for continuous updates like color pickers) callbacks are used to:
    *   Update the `model` object with the new parameter value.
    *   Call the `updateShape(false)` function (from `main.ts`) to regenerate the geometry with LOD1 (quick preview).
*   A "Finalize" button calls `updateShape(true)` to generate the high-detail LOD2 version.
*   Buttons are added to trigger the download functions.

### `downloads.ts`

Contains functions to export the generated 3D model:
*   `downloadStep()`: Uses `bitbybit.occt.io.saveShapeSTEP()` to save the `finalShape` (the OCCT compound) as a STEP file. It includes a mirroring transformation, which might be necessary due to coordinate system differences.
*   `downloadSTL()`: Uses `THREE.STLExporter` to export the entire ThreeJS scene as an STL file.
*   `downloadGLB()`: Uses `THREE.GLTFExporter` to export the ThreeJS scene as a GLB (binary GLTF) file.

### `gui-helper.ts`

Simple utility functions to manage the UI during processing:
*   `disableGUI()` / `enableGUI()`: Make the `lil-gui` panel non-interactive and visually dimmed during updates.
*   `showSpinner()` / `hideSpinner()`: Display or hide a simple CSS-based loading spinner overlay.

## 4. Data Models (`src/models/`)

*   **`current.ts`:** Defines a `Current` type and an instance to hold references to currently active ThreeJS objects (like `Group`s for different model parts, lights, ground) and the `lil-gui` instance. This helps in easily accessing and manipulating these objects from different parts of the code.
*   **`kernel-options.ts`:** Defines the `KernelOptions` interface used in `main.ts` to specify which geometry kernels (OCCT, JSCAD, Manifold) should be initialized by Bitbybit.
*   **`model.ts`:** Defines the `Model` type and a default `model` object. This object holds all the parameters that control the geometry of the 3D shape (e.g., `uHex`, `vHex`, `height`, colors, precision). The `lil-gui` directly manipulates this object. It also includes optional function signatures for `update` and download methods, which are later assigned in `main.ts` and `create-gui.ts`.

## 5. Styles (`style.css`)

The `style.css` file provides basic styling:
*   Resets body margin and sets a background color.
*   Styles for the Bitbybit logo link.
*   CSS for the `lds-ellipsis` loading spinner animation.

## Conclusion

This advanced example showcases a more complete workflow for creating parametric and interactive 3D applications with Bitbybit and ThreeJS. Key takeaways include:

*   **Modular Code Structure:** Separating concerns into helper functions and data models makes the project more manageable.
*   **Parametric Control:** Using a data model (`model.ts`) and a GUI (`lil-gui`) to drive geometry changes.
*   **Level of Detail (LOD):** Implementing different detail levels for shape generation (`createShapeLod1` vs. `createShapeLod2`) can significantly improve performance during interactive adjustments.
*   **OCCT Memory Management:** The practice of tracking and deleting intermediate OCCT shapes (`shapesToClean`) is crucial for preventing memory leaks in complex CAD operations.
*   **Kernel Initialization:** Selectively initializing only the necessary geometry kernels.
*   **Export Functionality:** Integrating common 3D file export options.

By understanding these components and their interactions, you can build sophisticated and highly configurable 3D experiences on the web.