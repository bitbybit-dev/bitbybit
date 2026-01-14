---
sidebar_position: 3
title: "Advanced Parametric 3D Model with PlayCanvas & Bitbybit"
sidebar_label: "Parametric Model (PlayCanvas)"
description: "Learn how to build an advanced, interactive parametric 3D model using Bitbybit with PlayCanvas, OCCT, and a GUI for real-time control."
tags: [npm-packages, playcanvas]
---

import BitByBitRenderCanvas from '@site/src/components/BitByBitRenderCanvas';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';
import Admonition from '@theme/Admonition';

# Advanced Parametric 3D Model with PlayCanvas & Bitbybit

This tutorial explores a more advanced example of creating an interactive, parametric 3D model using Bitbybit's PlayCanvas integration. We'll build a configurable 3D shape whose geometry is driven by parameters controlled via a GUI (Graphical User Interface), leveraging the OpenCascade (OCCT) kernel for robust CAD operations.

<Admonition type="note" title="Video shows ThreeJS implementation">
  The video tutorial below demonstrates a similar parametric model using ThreeJS, not PlayCanvas. The core concepts, OCCT operations, and workflow are identical across both engines. This PlayCanvas tutorial follows the same architectural approach adapted for PlayCanvas's entity-component system.
</Admonition>

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

This example demonstrates:
*   Setting up a PlayCanvas application.
*   Initializing Bitbybit with specific geometry kernels (OCCT in this case).
*   Creating parametric geometry using Bitbybit's OCCT API.
*   Using `lil-gui` to create a simple UI for controlling model parameters.
*   Dynamically updating the 3D model in response to UI changes.
*   Implementing Level of Detail (LOD) for shape generation (a simpler version for quick updates, a more detailed one for finalization).
*   Handling 3D model exports (STEP).

We are providing a higher level explanations of the codebase below, but for working reference always check this live example on StackBlitz, which, as platform evolves could change slightly.

<BitByBitRenderCanvas
  requireManualStart={true}
  iframeUrl="https://stackblitz.com/edit/hex-shell-playcanvas-bitbybit-for-docs?embed=1&file=src%2Fmain.ts&theme=dark"
  title="StackBlitz - Advanced Parametric 3D Model with PlayCanvas & Bitbybit"
/>

### Find the source code on [Bitbybit GitHub Examples](https://github.com/bitbybit-dev/bitbybit/tree/master/examples/vite/playcanvas/hex-shell)


## Project Structure Overview

This project is typically structured with:
*   `index.html`: The main HTML file to host the canvas and load scripts.
*   `style.css`: For basic styling of the page and UI elements like a loading spinner.
*   `src/main.ts`: The main entry point of our application, orchestrating app setup, Bitbybit initialization, GUI, and geometry updates.
*   `src/models/`: A directory to define data structures for our model parameters (`model.ts`) and current scene state (`current.ts`).
*   `src/helpers/`: A directory for utility functions, broken down by responsibility:
    *   `init-playcanvas.ts`: Sets up the PlayCanvas application, camera, lighting, and ground.
    *   `create-shape.ts`: Contains the core logic for generating the parametric 3D geometry using OCCT. This is where the detailed CAD operations happen.
    *   `create-gui.ts`: Sets up the `lil-gui` panel and links its controls to the model parameters and update functions.
    *   `downloads.ts`: Implements functions for exporting the model to various file formats.
    *   `gui-helper.ts`: Provides utility functions for managing the GUI state (e.g., showing/hiding a spinner, disabling/enabling GUI).

<Admonition type="info" title="Simplified Kernel Initialization">
  Starting with version 0.21.1, Bitbybit provides a simplified initialization helper that handles worker creation automatically from CDN. For more details, see the [**PlayCanvas Integration Starter Tutorial**](./start-with-playcanvas). If you need to host assets on your own infrastructure, see [Self-Hosting Assets](/learn/hosting-and-cdn).
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
    <title>Bitbybit & PlayCanvas Hex Shell Example</title>
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
    <canvas id="playcanvas"></canvas>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>`}
</CodeBlock>

**Key elements:**
*   A `<canvas id="playcanvas">` element where the PlayCanvas application will be rendered.
*   A script tag to load our main application logic from `src/main.ts`.
*   A simple Bitbybit logo link.

## 2. Main Application Logic (`src/main.ts`)

This is the heart of our application, orchestrating all the major components.

<CodeBlock language="typescript" title="src/main.ts">
{`import './style.css';
import { BitByBitBase, Inputs } from '@bitbybit-dev/core';
import { initBitByBit, type InitBitByBitOptions } from '@bitbybit-dev/playcanvas';
import { model, current } from './models';
import {
  initPlayCanvas,
  createGui,
  createShapeLod1,
  createShapeLod2,
  createLightsAndGround,
  disableGUI,
  enableGUI,
  hideSpinner,
  showSpinner,
  downloadStep,
} from './helpers';

// Configure which geometry kernels to enable
const options: InitBitByBitOptions = {
  enableOCCT: true, // We'll use OCCT for this parametric model
  enableJSCAD: false,
  enableManifold: false,
};

// Start the application
start();

async function start() {
  // 1. Initialize the PlayCanvas application, camera, and basic lighting/ground
  const { app } = initPlayCanvas();
  createLightsAndGround(app, current); // 'current' stores references to app objects

  // 2. Initialize Bitbybit with the PlayCanvas app and selected kernels
  const bitbybit = new BitByBitBase();
  await initBitByBit(app, bitbybit, options);

  // Variables to hold the OCCT shape representation and shapes to clean up
  let finalShape: Inputs.OCCT.TopoDSShapePointer | undefined;
  let shapesToClean: Inputs.OCCT.TopoDSShapePointer[] = []; // Important for memory management

  // 3. Connect download functions to the model object (used by GUI)
  model.downloadStep = () => downloadStep(bitbybit, finalShape);

  // 4. Create the GUI panel and link it to model parameters and the updateShape function
  createGui(current, model, updateShape);

  // 5. Basic animation setup for rotating the model
  const rotationSpeed = 0.0005;
  const rotateEntities = () => {
    if (
      model.rotationEnabled &&
      current.entity1 && // Assumes entity1, entity2, dimensions are populated by createShape...
      current.entity2 &&
      current.dimensions
    ) {
      current.entity1.rotate(0, rotationSpeed * 180 / Math.PI, 0);
      current.entity2.rotate(0, rotationSpeed * 180 / Math.PI, 0);
      current.dimensions.rotate(0, rotationSpeed * 180 / Math.PI, 0);
    }
  };

  // Hook into PlayCanvas update loop for animation
  app.on('update', () => {
    rotateEntities();
  });

  // 6. Initial shape creation (Level of Detail 1 - faster preview)
  finalShape = await createShapeLod1(
    bitbybit,
    app,
    model,      // Current model parameters
    shapesToClean, // Array to track OCCT shapes for later cleanup
    current       // Object to store references to current PlayCanvas entities
  );

  // 7. Function to update the shape when GUI parameters change
  async function updateShape(finish: boolean) {
    disableGUI(); // Prevent further interaction during update
    showSpinner();  // Indicate processing

    // Remove previous PlayCanvas entities from the app
    current.entity1?.destroy();
    current.entity2?.destroy();
    current.dimensions?.destroy();
    // Note: OCCT shapes are cleaned up within createShapeLod1/2 via shapesToClean

    if (finish) { // 'finish' is true when "Finalize" button in GUI is clicked
      finalShape = await createShapeLod2( // Higher detail
        bitbybit, app, model, shapesToClean, current
      );
    } else { // Default update (e.g., from slider drag)
      finalShape = await createShapeLod1( // Lower detail for speed
        bitbybit, app, model, shapesToClean, current
      );
    }

    hideSpinner();
    enableGUI(); // Re-enable GUI
  }
}
`}
</CodeBlock>

**Explanation of `main.ts`:**

1.  **Imports:** Pulls in necessary Bitbybit modules, data models, and helper functions. The `initBitByBit` helper and `InitBitByBitOptions` type are imported from `@bitbybit-dev/playcanvas`.
2.  **`options`:** Configures which Bitbybit geometry kernels (OCCT, JSCAD, Manifold) will be initialized using the `InitBitByBitOptions` type. For this example, only OCCT is enabled as it's used for the parametric modeling.
3.  **`start()` function:** The main asynchronous function that orchestrates the application.
    *   **`initPlayCanvas()` & `createLightsAndGround()`:** Sets up the basic PlayCanvas environment.
    *   **`BitByBitBase` & `initBitByBit()`:** Initializes the Bitbybit library by calling the `initBitByBit(app, bitbybit, options)` helper function. This automatically creates workers from CDN and initializes the selected geometry kernels.
    *   **`finalShape` & `shapesToClean`:** `finalShape` will hold a reference to the main OCCT geometry. `shapesToClean` is crucial for managing memory in OCCT by keeping track of intermediate shapes that need to be explicitly deleted after they are no longer needed.
    *   **Download Functions:** Attaches download helper functions to the `model` object. These will be triggered by buttons in the GUI.
    *   **`createGui()`:** Initializes the `lil-gui` panel, connecting its controls to the properties defined in `model.ts` and providing the `updateShape` function as a callback when parameters change.
    *   **Rotation Logic:** Sets up a simple animation to rotate the generated 3D entities if `model.rotationEnabled` is true.
    *   **Initial Shape Creation:** Calls `createShapeLod1` to generate and draw the initial 3D model with a lower level of detail for faster startup.
    *   **`updateShape(finish: boolean)` function:**
        *   This function is called by the GUI when a parameter changes.
        *   It disables the GUI and shows a spinner to indicate processing.
        *   It removes (destroys) the previously rendered PlayCanvas entities (`current.entity1`, `current.entity2`, `current.dimensions`).
        *   Crucially, the `createShapeLod1` and `createShapeLod2` functions are responsible for cleaning up OCCT shapes using the `shapesToClean` array.
        *   It then calls either `createShapeLod1` (for quick updates, e.g., during slider dragging) or `createShapeLod2` (for a more detailed final version when a "Finalize" button is clicked).
        *   Finally, it hides the spinner and re-enables the GUI.

## 3. Helper Functions (`src/helpers/`)

The `helpers` directory modularizes different aspects of the application.

### `init-playcanvas.ts`

*   **`initPlayCanvas()`:** Contains PlayCanvas setup for the application, camera, lighting (directional and ambient), a ground plane, and camera controls. It also starts the application.
*   **`createLightsAndGround()`:** A helper to specifically add directional lights (for shadows) and a ground plane to the app.

<Admonition type="info" title="Kernel Initialization">
  Note that kernel initialization is now handled by the `initBitByBit()` helper function from `@bitbybit-dev/playcanvas`. This function automatically creates workers from CDN and initializes the selected geometry kernels based on the `InitBitByBitOptions` configuration. No separate `init-kernels.ts` file is needed.
</Admonition>

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
    *   It uses `bitbybit.draw.drawAnyAsync({ entity: occtShape, options: drawOptions })` to convert the final OCCT shapes into PlayCanvas entities and add them to the app.
    *   It often creates separate PlayCanvas entities for different parts of the model (e.g., `current.entity1`, `current.entity2`) for easier management and independent animation.
    *   Materials are created and applied to the entities.

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
  gui.add(model, 'downloadSTEP').name('Download STEP');
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

### `gui-helper.ts`

Simple utility functions to manage the UI during processing:
*   `disableGUI()` / `enableGUI()`: Make the `lil-gui` panel non-interactive and visually dimmed during updates.
*   `showSpinner()` / `hideSpinner()`: Display or hide a simple CSS-based loading spinner overlay.

## 4. Data Models (`src/models/`)

*   **`current.ts`:** Defines a `Current` type and an instance to hold references to currently active PlayCanvas entities (like entities for different model parts, lights, ground) and the `lil-gui` instance. This helps in easily accessing and manipulating these objects from different parts of the code.
*   **`model.ts`:** Defines the `Model` type and a default `model` object. This object holds all the parameters that control the geometry of the 3D shape (e.g., `uHex`, `vHex`, `height`, colors, precision). The `lil-gui` directly manipulates this object. It also includes optional function signatures for `update` and download methods, which are later assigned in `main.ts` and `create-gui.ts`.

<Admonition type="info" title="Kernel Options Type">
  Note that the `KernelOptions` type is no longer needed as a separate file. The `InitBitByBitOptions` type is now imported directly from `@bitbybit-dev/playcanvas` and used to configure which geometry kernels to initialize.
</Admonition>

## 5. Styles (`style.css`)

The `style.css` file provides basic styling:
*   Resets body margin and sets a background color.
*   Styles for the Bitbybit logo link.
*   CSS for the `lds-ellipsis` loading spinner animation.

## Conclusion

This advanced example showcases a more complete workflow for creating parametric and interactive 3D applications with Bitbybit and PlayCanvas. Key takeaways include:

*   **Modular Code Structure:** Separating concerns into helper functions and data models makes the project more manageable.
*   **Parametric Control:** Using a data model (`model.ts`) and a GUI (`lil-gui`) to drive geometry changes.
*   **Level of Detail (LOD):** Implementing different detail levels for shape generation (`createShapeLod1` vs. `createShapeLod2`) can significantly improve performance during interactive adjustments.
*   **OCCT Memory Management:** The practice of tracking and deleting intermediate OCCT shapes (`shapesToClean`) is crucial for preventing memory leaks in complex CAD operations.
*   **Kernel Initialization:** Selectively initializing only the necessary geometry kernels.
*   **Export Functionality:** Integrating common 3D file export options.
*   **Entity-Based System:** PlayCanvas uses entities with components, and Bitbybit creates and manages these entities for rendering.

By understanding these components and their interactions, you can build sophisticated and highly configurable 3D experiences on the web with PlayCanvas.
