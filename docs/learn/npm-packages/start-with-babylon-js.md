---
sidebar_position: 2
title: Using Bitbybit with Babylon.js
sidebar_label: Babylon.js Integration
description: Learn how to set up and use the @bitbybit-dev/babylonjs package with Vite to create 3D CAD applications, and control which geometry kernels (OCCT, JSCAD, Manifold) are initialized.
tags: [npm-packages, babylonjs, occt, manifold, jscad]
---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';

# Using Bitbybit with Babylon.js

This guide will walk you through setting up and using the `@bitbybit-dev/babylonjs` package to integrate Bitbybit's 3D CAD functionalities into your Babylon.js applications. We'll use Vite as our build tool, which simplifies the setup process.

The `@bitbybit-dev/babylonjs` package conveniently includes `@babylonjs/core` as a dependency, so you don't need to install it separately.

## Prerequisites

*   Node.js and npm (or yarn) installed.
*   A basic understanding of TypeScript and Babylon.js.

## 1. Project Setup with Vite

First, create a new Vite project with a TypeScript template:

<CodeBlock language="bash">
{`npm create vite@latest my-bitbybit-babylonjs-app -- --template vanilla-ts
# or: yarn create vite my-bitbybit-babylonjs-app --template vanilla-ts

cd my-bitbybit-babylonjs-app`}
</CodeBlock>

Next, install the Bitbybit Babylon.js package and its necessary worker dependencies:

<CodeBlock language="bash">
{`npm install @bitbybit-dev/babylonjs @babylonjs/core
# or: yarn add @bitbybit-dev/babylonjs @babylonjs/core`}
</CodeBlock>

<Admonition type="info" title="Why these packages?">
  <ul>
    <li><code>@bitbybit-dev/babylonjs</code>: The main library for integrating Bitbybit with Babylon.js. It also installs these main packages listed below.</li>
    <li><code>@babylonjs/core</code>: Provides the main 3D engine to be used with this demo.</li>
    <li><code>@bitbybit-dev/core</code>: Collects all kernel web worker libraries into a coherent Bitbybit base. It also includes some higher-level functionality.</li>
    <li><code>@bitbybit-dev/occt-worker</code>: Provides the OpenCascade (OCCT) geometry kernel running in a Web Worker.</li>
    <li><code>@bitbybit-dev/jscad-worker</code>: Provides the JSCAD geometry kernel running in a Web Worker.</li>
    <li><code>@bitbybit-dev/manifold-worker</code>: Provides the Manifold geometry kernel running in a Web Worker.</li>
    <li><code>@bitbybit-dev/occt</code>: Communicates with the OCCT worker and contains the main logic of the OCCT geometry kernel. It can also be used in non-web-worker environments.</li>
    <li><code>@bitbybit-dev/jscad</code>: Communicates with the JSCAD worker and contains the main logic of the JSCAD geometry kernel. It can also be used in non-web-worker environments.</li>
    <li><code>@bitbybit-dev/manifold</code>: Communicates with the Manifold worker and contains the main logic of the Manifold geometry kernel. It can also be used in non-web-worker environments.</li>
    <li><code>@bitbybit-dev/base</code>: Contains base geometry types and functions, such as vector operations, matrix transformations, math, and list helpers, usable across all kernels.</li>
  </ul>
</Admonition>

## 2. HTML Structure

Modify your `index.html` file in the project root to include a `<canvas>` element where the Babylon.js scene will be rendered:

<CodeBlock language="html" title="index.html">
{`<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <link rel="icon" type="image/svg+xml" href="/vite.svg" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Bitbybit & BabylonJS Example</title>
    </head>
    <body>
        <canvas id="babylon-canvas"></canvas>
        <script type="module" src="/src/main.ts"></script>
    </body>
</html>`}
</CodeBlock>

This is a standard HTML setup. The key parts are:
-   `<canvas id="babylon-canvas"></canvas>`: This is where our 3D scene will be drawn.
-   `<script type="module" src="/src/main.ts"></script>`: This loads our main TypeScript application logic.

## 3. Setting up Web Workers

Bitbybit utilizes Web Workers to run computationally intensive geometry kernels (OCCT, JSCAD, Manifold) off the main browser thread, preventing UI freezes. You need to create simple worker files that initialize these kernels.

Create a `workers` directory inside your `src` folder (`src/workers/`).

<Tabs groupId="worker-setup">
<TabItem value="occt" label="occt.worker.ts">

<CodeBlock language="typescript" title="src/workers/occt.worker.ts">
{`import initOpenCascade from '@bitbybit-dev/occt/bitbybit-dev-occt/cdn';
import type { OpenCascadeInstance } from '@bitbybit-dev/occt/bitbybit-dev-occt/bitbybit-dev-occt.js';
import {
  initializationComplete,
  onMessageInput,
} from '@bitbybit-dev/occt-worker';

// Initialize OpenCascade (OCCT)
initOpenCascade().then((occ: OpenCascadeInstance) => {
    // Notify the main thread that OCCT is ready
    initializationComplete(occ, undefined);
});

// Listen for messages from the main thread
addEventListener('message', ({ data }) => {
    // Process messages using the occt-worker helper
    onMessageInput(data, postMessage);
});`}
</CodeBlock>
**Explanation:**
-   Imports `initOpenCascade` to load the OCCT WebAssembly module.
-   Calls `initializationComplete` once OCCT is loaded, signaling to the main Bitbybit instance that this kernel is ready.
-   `onMessageInput` handles communication between the main thread and the OCCT worker.

</TabItem>
<TabItem value="jscad" label="jscad.worker.ts">

<CodeBlock language="typescript" title="src/workers/jscad.worker.ts">
{`import {
  initializationComplete,
  onMessageInput,
} from '@bitbybit-dev/jscad-worker';

// Dynamically import and initialize JSCAD
import('@bitbybit-dev/jscad/jscad-generated').then((s) => {
    // Notify the main thread that JSCAD is ready
    initializationComplete(s.default());
});

// Listen for messages from the main thread
addEventListener('message', ({ data }) => {
    // Process messages using the jscad-worker helper
    onMessageInput(data, postMessage);
});`}
</CodeBlock>
**Explanation:**
-   Dynamically imports the JSCAD module.
-   Calls `initializationComplete` once JSCAD is loaded.
-   `onMessageInput` handles communication.

</TabItem>
<TabItem value="manifold" label="manifold.worker.ts">

<CodeBlock language="typescript" title="src/workers/manifold.worker.ts">
{`import {
  initializationComplete,
  onMessageInput,
} from '@bitbybit-dev/manifold-worker';
import Module from 'manifold-3d'; // Imports the Manifold JS bindings

const init = async () => {
    // Initialize the Manifold WASM module
    const wasm = await Module({
        // Manifold requires its WASM file to be loaded.
        // This CDN link provides a hosted version.
        // For production, you might want to host this yourself.
        locateFile: () => {
        return 'https://cdn.jsdelivr.net/gh/bitbybit-dev/bitbybit-assets@0.20.4/wasm/manifold.cc2ddd38.wasm';
        },
    });
    wasm.setup(); // Additional setup step for Manifold
    // Notify the main thread that Manifold is ready
    initializationComplete(wasm);
};

init();

// Listen for messages from the main thread
addEventListener('message', ({ data }) => {
    // Process messages using the manifold-worker helper
    onMessageInput(data, postMessage);
});`}
</CodeBlock>
**Explanation:**
-   Imports the `manifold-3d` JavaScript bindings.
-   The `Module` function initializes the Manifold WASM. The `locateFile` function is crucial for pointing to the Manifold WASM file.
-   Calls `initializationComplete` after setup.
-   `onMessageInput` handles communication.

</TabItem>
</Tabs>

<Admonition type="important" title="Worker File Location">
  Vite handles these worker files automatically when you instantiate them using `new Worker(new URL('./path/to/worker.ts', import.meta.url), ...)`. Ensure the paths in `main.ts` correctly point to these files within your `src/workers/` directory.
</Admonition>

## 4. Main Application Logic (`main.ts`)

Replace the content of `src/main.ts` with the following:

<CodeBlock language="typescript" title="src/main.ts">
{`import './style.css'; // Basic styling
import { BitByBitBase, Inputs } from '@bitbybit-dev/babylonjs';
import { OccStateEnum } from '@bitbybit-dev/occt-worker';
import { JscadStateEnum } from '@bitbybit-dev/jscad-worker';
import { ManifoldStateEnum } from '@bitbybit-dev/manifold-worker';

import {
    Engine,
    Scene,
    ArcRotateCamera,
    Vector3,
    HemisphericLight,
    Color4, // Using Color4 for scene clearColor for alpha
} from '@babylonjs/core';
import { first } from 'rxjs';

// Define an interface for kernel options
interface KernelOptions {
    enableOCCT: boolean;
    enableJSCAD: boolean;
    enableManifold: boolean;
}

// --- 1. Main Application Entry Point ---
start();

async function start() {
    // Initialize basic Babylon.js scene
    const { scene, engine } = initBabylonJS();

    // Create an instance of BitByBitBase for Babylon.js
    const bitbybit = new BitByBitBase();

    // --- 2. Configure and Initialize Kernels ---
    // Users can control which kernels are loaded
    const kernelOptions: KernelOptions = {
        enableOCCT: true,
        enableJSCAD: true,
        enableManifold: true,
    };
    // Initialize Bitbybit with the selected kernels
    await initWithKernels(scene, bitbybit, kernelOptions);

    // --- 3. Create Geometry with Active Kernels ---
    if (kernelOptions.enableOCCT) {
        await createOCCTGeometry(bitbybit, '#ff0000'); // Red
    }
    if (kernelOptions.enableManifold) {
        await createManifoldGeometry(bitbybit, '#00ff00'); // Green
    }
    if (kernelOptions.enableJSCAD) {
        await createJSCADGeometry(bitbybit, '#0000ff'); // Blue
    }

    // Start the Babylon.js render loop
    engine.runRenderLoop(() => {
        if (scene.activeCamera) { // Ensure camera is ready
            scene.render();
        }
    });
}

// --- 4. Babylon.js Scene Initialization ---
function initBabylonJS() {
    const canvas = document.getElementById('babylon-canvas') as HTMLCanvasElement;
    const engine = new Engine(canvas, true, {
        preserveDrawingBuffer: true,
        stencil: true,
    });
    const scene = new Scene(engine);
    scene.clearColor = new Color4(0.1, 0.11, 0.12, 1); // Set background color

    const camera = new ArcRotateCamera(
        'camera',
        -Math.PI / 2,
        Math.PI / 2.5,
        150, // Adjusted radius for typical scenes
        new Vector3(0, 0, 0),
        scene
    );
    camera.attachControl(canvas, true);
    camera.wheelPrecision = 50; // Control zoom speed
    camera.lowerRadiusLimit = 10;
    camera.upperRadiusLimit = 500;


    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    const onWindowResize = () => {
        engine.resize();
    };
    window.addEventListener('resize', onWindowResize, false);

    return { scene, engine, camera };
}

// --- 5. Bitbybit Kernel Initialization Logic ---
async function initWithKernels(
  scene: Scene, // Babylon.js Scene
  bitbybit: BitByBitBase,
  options: KernelOptions
): Promise<{ message: string }> {
  return new Promise(async (resolve) => {
    let occtWorkerInstance: Worker | undefined;
    let jscadWorkerInstance: Worker | undefined;
    let manifoldWorkerInstance: Worker | undefined;

    // Conditionally create worker instances based on options
    if (options.enableOCCT) {
      occtWorkerInstance = new Worker(
        new URL('./workers/occt.worker.ts', import.meta.url),
        { name: 'OCC_WORKER', type: 'module' }
      );
    }
    if (options.enableJSCAD) {
      jscadWorkerInstance = new Worker(
        new URL('./workers/jscad.worker.ts', import.meta.url),
        { name: 'JSCAD_WORKER', type: 'module' }
      );
    }
    if (options.enableManifold) {
      manifoldWorkerInstance = new Worker(
        new URL('./workers/manifold.worker.ts', import.meta.url),
        { name: 'MANIFOLD_WORKER', type: 'module' }
      );
    }

    // Initialize Bitbybit with the (potentially undefined) worker instances.
    // This passes the Babylon.js 'scene' to Bitbybit for integration.
    scene.metadata = { shadowGenerators: [] };
    await bitbybit.init(
      scene,
      occtWorkerInstance,
      jscadWorkerInstance,
      manifoldWorkerInstance
    );

    // Logic to wait for selected kernels to be initialized
    let nrResolved = 0;
    let resolutionsNeeded = 0;

    const checkIfAllInitialized = () => {
      if (nrResolved === resolutionsNeeded) {
        console.log('Selected kernels initialized:', options);
        resolve({ message: 'Selected kernels initialized successfully.' });
      }
    };

    if (options.enableOCCT && bitbybit.occtWorkerManager) {
      resolutionsNeeded++;
      bitbybit.occtWorkerManager.occWorkerState$
        .pipe(first((s) => s.state === OccStateEnum.initialised))
        .subscribe(() => {
          console.log('OCCT Initialized');
          nrResolved++;
          checkIfAllInitialized();
        });
    }
    if (options.enableJSCAD && bitbybit.jscadWorkerManager) {
      resolutionsNeeded++;
      bitbybit.jscadWorkerManager.jscadWorkerState$
        .pipe(first((s) => s.state === JscadStateEnum.initialised))
        .subscribe(() => {
          console.log('JSCAD Initialized');
          nrResolved++;
          checkIfAllInitialized();
        });
    }
    if (options.enableManifold && bitbybit.manifoldWorkerManager) {
      resolutionsNeeded++;
      bitbybit.manifoldWorkerManager.manifoldWorkerState$
        .pipe(first((s) => s.state === ManifoldStateEnum.initialised))
        .subscribe(() => {
          console.log('Manifold Initialized');
          nrResolved++;
          checkIfAllInitialized();
        });
    }

    // If no kernels were selected to be enabled
    if (resolutionsNeeded === 0) {
      console.log('No kernels selected for initialization.');
      resolve({ message: 'No kernels selected for initialization.' });
    }
  });
}

// --- 6. Geometry Creation Functions (Examples) ---
// These functions demonstrate using Bitbybit's core geometry API.
// You use Inputs DTOs to define geometry parameters.
// bitbybit.draw.drawAnyAsync() from @bitbybit-dev/babylonjs handles rendering into the Babylon.js scene.

async function createOCCTGeometry(bitbybit: BitByBitBase, color: string) {
    console.log('Creating OCCT geometry...');
    const cubeOptions = new Inputs.OCCT.CubeDto();
    cubeOptions.size = 25;
    cubeOptions.center = [0, 0, 0];

    const cube = await bitbybit.occt.shapes.solid.createCube(cubeOptions);

    const filletOptions = new Inputs.OCCT.FilletDto<Inputs.OCCT.TopoDSShapePointer>();
    filletOptions.shape = cube;
    filletOptions.radius = 4;
    const roundedCube = await bitbybit.occt.fillets.filletEdges(filletOptions);

    const drawOptions = new Inputs.Draw.DrawOcctShapeOptions();
    drawOptions.faceColour = color; // Bitbybit handles color conversion
    await bitbybit.draw.drawAnyAsync({
        entity: roundedCube,
        options: drawOptions,
    });
    console.log('OCCT geometry created and drawn.');
}

async function createManifoldGeometry(bitbybit: BitByBitBase, color: string) {
    console.log('Creating Manifold geometry...');
    const sphereOptions = new Inputs.Manifold.SphereDto();
    sphereOptions.radius = 15;
    const sphere = await bitbybit.manifold.manifold.shapes.sphere(sphereOptions);

    const cubeOptions = new Inputs.Manifold.CubeDto();
    cubeOptions.size = 25;
    const cube = await bitbybit.manifold.manifold.shapes.cube(cubeOptions);

    const diffedShape = await bitbybit.manifold.manifold.booleans.differenceTwo({
        manifold1: cube,
        manifold2: sphere,
    });

    const translationOptions = new Inputs.Manifold.TranslateDto<Inputs.Manifold.ManifoldPointer>();
    translationOptions.manifold = diffedShape;
    translationOptions.vector = [0, -40, 0]; // Position below OCCT
    const movedShape = await bitbybit.manifold.manifold.transforms.translate(
        translationOptions
    );

    const drawOptions = new Inputs.Draw.DrawManifoldOrCrossSectionOptions();
    drawOptions.faceColour = color;
    await bitbybit.draw.drawAnyAsync({
        entity: movedShape,
        options: drawOptions,
    });
    console.log('Manifold geometry created and drawn.');
}

async function createJSCADGeometry(bitbybit: BitByBitBase, color: string) {
    console.log('Creating JSCAD geometry...');
    const geodesicSphereOptions = new Inputs.JSCAD.GeodesicSphereDto();
    geodesicSphereOptions.radius = 15;
    geodesicSphereOptions.center = [0, 40, 0]; // Position above OCCT
    const geodesicSphere = await bitbybit.jscad.shapes.geodesicSphere(
        geodesicSphereOptions
    );

    const sphereOptions = new Inputs.JSCAD.SphereDto();
    sphereOptions.radius = 10;
    sphereOptions.center = [5, 45, 0];
    const simpleSphere = await bitbybit.jscad.shapes.sphere(sphereOptions);

    const unionOptions = new Inputs.JSCAD.BooleanTwoObjectsDto();
    unionOptions.first = geodesicSphere;
    unionOptions.second = simpleSphere;
    const unionShape = await bitbybit.jscad.booleans.unionTwo(unionOptions);

    const drawOptions = new Inputs.Draw.DrawBasicGeometryOptions();
    drawOptions.colours = color; // Note: 'colours' for JSCAD draw options
    await bitbybit.draw.drawAnyAsync({
        entity: unionShape,
        options: drawOptions,
    });
    console.log('JSCAD geometry created and drawn.');
}`}
</CodeBlock>

### Explanation of `main.ts`:

1.  **Imports:**
    *   `BitByBitBase` and `Inputs`: Core components from `@bitbybit-dev/babylonjs`. `Inputs` provides DTOs (Data Transfer Objects) for specifying parameters for geometry operations.
    *   `...StateEnum`: Enums used to check the initialization state of each kernel worker.
    *   Standard Babylon.js modules for scene setup: `Engine`, `Scene`, `ArcRotateCamera`, `Vector3`, `HemisphericLight`, `Color4`.
    *   `first` from `rxjs`: Used to easily subscribe to the first emission of a kernel's state.

2.  **`KernelOptions` Interface:** Defines the structure for selecting which kernels to initialize.

3.  **`start()` function (Main Entry Point):**
    *   Calls `initBabylonJS()` to set up the basic Babylon.js `Engine`, `Scene`, `Camera`, and `Light`.
    *   Creates an instance of `BitByBitBase` from the `@bitbybit-dev/babylonjs` package.
    *   **`kernelOptions`**: This object is key. By setting `enableOCCT`, `enableJSCAD`, and `enableManifold` to `true` or `false`, you control which kernels Bitbybit attempts to initialize. This allows for optimizing load times and resource usage if not all kernels are needed.
    *   Calls `initWithKernels()` to initialize Bitbybit with the selected kernels, passing the Babylon.js `scene`.
    *   Conditionally calls geometry creation functions (`createOCCTGeometry`, `createManifoldGeometry`, `createJSCADGeometry`) based on which kernels were enabled and successfully initialized.
    *   Starts the Babylon.js render loop using `engine.runRenderLoop(...)`.

4.  **`initBabylonJS()` function:**
    *   Standard Babylon.js boilerplate: sets up the `Engine` attached to the canvas.
    *   Creates a `Scene` and sets its clear color (background).
    *   Creates an `ArcRotateCamera` for user interaction and attaches its controls to the canvas.
    *   Adds a `HemisphericLight` to illuminate the scene.
    *   Includes a window resize listener to ensure the `engine` adapts to viewport changes.

5.  **`initWithKernels()` function:**
    *   This is the core of Bitbybit's initialization.
    *   It conditionally creates `Worker` instances for OCCT, JSCAD, and Manifold based on the `options` passed in. The `new URL('./workers/worker-name.worker.ts', import.meta.url)` syntax is Vite's way of correctly bundling and referencing web worker files.
    *   Calls `await bitbybit.init(scene, occtWorkerInstance, jscadWorkerInstance, manifoldWorkerInstance)`. The `@bitbybit-dev/babylonjs` package's `BitByBitBase` is designed to work with a Babylon.js `Scene` object and can handle `undefined` for worker instances it shouldn't initialize.
    *   It then uses RxJS `pipe(first(...))` to subscribe to the state observables of each enabled kernel (`occWorkerState$`, `jscadWorkerState$`, `manifoldWorkerState$`).
    *   The `Promise` resolves only after all *selected and enabled* kernels have emitted an `initialised` state. This ensures that you don't try to use a kernel before it's ready.

6.  **Geometry Creation Functions (`createOCCTGeometry`, `createManifoldGeometry`, `createJSCADGeometry`):**
    *   These are example functions illustrating how to use Bitbybit's core geometry API (e.g., `bitbybit.occt.*`, `bitbybit.manifold.*`, `bitbybit.jscad.*`).
    *   **`Inputs` DTOs**: You'll notice the use of `Inputs.OCCT.CubeDto()`, `Inputs.Manifold.SphereDto()`, etc. These objects are used to pass parameters to Bitbybit's geometry creation and modification functions. They provide type safety and often mirror the inputs you'd find in a visual programming environment. Intellisense (auto-completion in your IDE) will be very helpful here.
    *   **Drawing**: After creating a geometric entity, `bitbybit.draw.drawAnyAsync()` (from `@bitbybit-dev/babylonjs`) is used to render it into the Babylon.js scene. Different kernels might have slightly different drawing option DTOs (e.g., `DrawOcctShapeOptions`, `DrawManifoldOrCrossSectionOptions`, `DrawBasicGeometryOptions`), but `drawAnyAsync` handles many common cases.

## 5. Basic Styling (Optional)

Create an `src/style.css` file if you haven't already:

<CodeBlock language="css" title="src/style.css">
{`body {
    margin: 0;
    overflow: hidden; /* Prevent scrollbars from canvas */
    background-color: #1a1c1f; /* Match canvas background for seamless look */
}

#babylon-canvas {
    display: block;
    width: 100vw;
    height: 100vh;
    touch-action: none; /* Recommended for Babylon.js pointer events */
}`}
</CodeBlock>

## 6. Running the Application

<CodeBlock language="bash">
{`npm run dev
# or: yarn dev`}
</CodeBlock>

Vite will start a development server. You should see a browser window open with your Babylon.js scene. If all kernels were enabled, you'll see three distinct shapes:
*   A red, filleted cube (OCCT) at the origin.
*   A green, subtracted shape (Manifold) positioned below the OCCT shape.
*   A blue, unioned sphere shape (JSCAD) positioned above the OCCT shape.

Check your browser's developer console for logs indicating the initialization status of each kernel and any errors.


## Live Demo (StackBlitz)

You can explore and interact with a live example of this setup on StackBlitz.

<div className="stackblitz-embed-container">
  <iframe
    src="https://stackblitz.com/edit/babylonjs-bitbybit-setup-with-all-kernels?ctl=1&embed=1&file=src%2Fmain.ts&theme=dark"
    style={{
      width: '100%',
      height: '700px',
      border: '0',
      borderRadius: '4px',
      overflow: 'hidden',
    }}
    title="Bitbybit & Babylon.js - All Kernels Setup"
    allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
    sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
  ></iframe>
</div>


## Key Takeaways

*   **Vite Simplifies Setup:** Vite handles worker bundling and module resolution effectively for a smooth development experience.
*   **`KernelOptions` for Control:** You have fine-grained control over which geometry kernels are loaded, allowing you to tailor the application to specific needs and optimize performance.
*   **Asynchronous Operations:** Most Bitbybit operations are `async` because they communicate with Web Workers, ensuring the main thread remains responsive.
*   **`Inputs` DTOs:** Use these typed objects to configure geometry operations, promoting code clarity and type safety.
*   **Separate Worker Files:** Each geometry kernel runs in its own dedicated worker, maximizing performance for computationally intensive tasks.
*   **Modular Design:** The `@bitbybit-dev/babylonjs` package seamlessly integrates Bitbybit's powerful geometry kernels and functionalities with your Babylon.js applications.

This setup provides a robust foundation for building sophisticated 3D CAD applications in the browser with Bitbybit and Babylon.js.