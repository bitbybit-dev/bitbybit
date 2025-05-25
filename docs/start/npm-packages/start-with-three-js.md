---
sidebar_position: 2
title: Using Bitbybit with Three.js
sidebar_label: Three.js Integration
description: Learn how to set up and use the @bitbybit-dev/threejs package with Vite to create 3D CAD applications, and control which geometry kernels (OCCT, JSCAD, Manifold) are initialized.
tags: [npm-packages, threejs, occt, manifold, jscad]
---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';

# Using Bitbybit with Three.js

This guide will walk you through setting up and using the `@bitbybit-dev/threejs` package to integrate Bitbybit's 3D CAD functionalities into your Three.js applications. We'll use Vite as our build tool, which simplifies the setup process.

The `@bitbybit-dev/threejs` package conveniently includes `three` as a dependency, so you don't need to install it separately.

## Prerequisites

*   Node.js and npm (or yarn) installed.
*   A basic understanding of TypeScript and Three.js.

## 1. Project Setup with Vite

First, create a new Vite project with a TypeScript template:

<CodeBlock language="bash">
{`npm create vite@latest my-bitbybit-threejs-app -- --template vanilla-ts
# or: yarn create vite my-bitbybit-threejs-app --template vanilla-ts

cd my-bitbybit-threejs-app`}
</CodeBlock>

Next, install the Bitbybit Three.js package and its necessary worker dependencies:

<CodeBlock language="bash">
{`npm install @bitbybit-dev/threejs
# or: yarn add @bitbybit-dev/threejs`}
</CodeBlock>

<Admonition type="info" title="Why these packages?">
  <ul>
    <li><code>@bitbybit-dev/threejs</code>: The main library for integrating Bitbybit with Three.js. It also installs these main packages listed below.</li>
    <li><code>three</code>: Provides main game engine to be used with this demo.</li>
    <li><code>@bitbybit-dev/core</code>: Collects all kernel web worker libraries into coherent bitbybit base. It also includes some higher level functionality.</li>
    <li><code>@bitbybit-dev/occt-worker</code>: Provides the OpenCascade (OCCT) geometry kernel running in a Web Worker.</li>
    <li><code>@bitbybit-dev/jscad-worker</code>: Provides the JSCAD geometry kernel running in a Web Worker.</li>
    <li><code>@bitbybit-dev/manifold-worker</code>: Provides the Manifold geometry kernel running in a Web Worker.</li>
    <li><code>@bitbybit-dev/occt</code>: Communicates with worker and contains main logic of OCCT geometry kernel - can be used in non web-worker environments.</li>
    <li><code>@bitbybit-dev/jscad</code>: Communicates with worker and contains main logic of JSCAD geometry kernel - can be used in non web-worker environments.</li>
    <li><code>@bitbybit-dev/manifold</code>: Communicates with worker and contains main logic of Manifold geometry kernel - can be used in non web-worker environments.</li>
    <li><code>@bitbybit-dev/base</code>: Contains base geometry types and functions, such as vector operations, matrix transformations, math and list helpers - they can be used in all kernels.</li>
  </ul>
</Admonition>

## 2. HTML Structure

Modify your `index.html` file in the project root to include a `<canvas>` element where the Three.js scene will be rendered:

<CodeBlock language="html" title="index.html">
{`<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <link rel="icon" type="image/svg+xml" href="/vite.svg" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Bitbybit & ThreeJS Example</title>
    </head>
    <body>
        <canvas id="three-canvas"></canvas>
        <script type="module" src="/src/main.ts"></script>
    </body>
</html>`}
</CodeBlock>

This is a standard HTML setup. The key parts are:
-   `<canvas id="three-canvas"></canvas>`: This is where our 3D scene will be drawn.
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
        return 'https://cdn.jsdelivr.net/gh/bitbybit-dev/bitbybit-assets@0.20.3/wasm/manifold.cc2ddd38.wasm';
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
import { BitByBitBase, Inputs } from '@bitbybit-dev/threejs';
import { OccStateEnum } from '@bitbybit-dev/occt-worker';
import { JscadStateEnum } from '@bitbybit-dev/jscad-worker';
import { ManifoldStateEnum } from '@bitbybit-dev/manifold-worker';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import {
    Color,
    Group,
    HemisphereLight,
    PerspectiveCamera,
    Scene,
    Vector3,
    WebGLRenderer,
} from 'three';
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
    // Initialize basic Three.js scene
    const { scene } = initThreeJS();

    // Create an instance of BitByBitBase for Three.js
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
}

// --- 4. Three.js Scene Initialization ---
function initThreeJS() {
    const domNode = document.getElementById('three-canvas') as HTMLCanvasElement;

    const camera = new PerspectiveCamera(
        70,
        window.innerWidth / window.innerHeight,
        0.1, // Adjusted near plane for typical scenes
        1000
    );
    const scene = new Scene();
    scene.background = new Color(0x1a1c1f); // Set background color

    const light = new HemisphereLight(0xffffff, 0x444444, 2); // Adjusted intensity
    scene.add(light);

    const renderer = new WebGLRenderer({ antialias: true, canvas: domNode });
    renderer.setSize(window.innerWidth, window.innerHeight);
    // renderer.setPixelRatio(window.devicePixelRatio); // Consider devicePixelRatio for sharpness

    camera.position.set(50, 50, 100); // Adjusted camera position
    camera.lookAt(0,0,0);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05; // Smoother damping
    controls.target.set(0, 0, 0); // Ensure controls target the origin
    controls.update(); // Initial update

    const onWindowResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onWindowResize, false);

    const animate = () => {
        controls.update(); // Important for damping
        renderer.render(scene, camera);
    };
    renderer.setAnimationLoop(animate);

    return { scene, camera, renderer }; // Return renderer and camera if needed elsewhere
}

// --- 5. Bitbybit Kernel Initialization Logic ---
async function initWithKernels(
  scene: Scene,
  bitbybit: BitByBitBase,
  options: KernelOptions
): Promise<{ message: string }> { // Added explicit return type for clarity
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

    // Initialize Bitbybit with the (potentially undefined) worker instances
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
    drawOptions.faceColour = color;
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

    // Example: Create another simple sphere for a boolean operation
    const sphereOptions = new Inputs.JSCAD.SphereDto();
    sphereOptions.radius = 10; // Smaller sphere
    sphereOptions.center = [5, 45, 0]; // Slightly offset
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
    *   `BitByBitBase` and `Inputs`: Core components from `@bitbybit-dev/threejs`. `Inputs` provides DTOs (Data Transfer Objects) for specifying parameters for geometry operations.
    *   `...StateEnum`: Enums used to check the initialization state of each kernel worker.
    *   Standard Three.js modules for scene setup.
    *   `first` from `rxjs`: Used to easily subscribe to the first emission of a kernel's state.

2.  **`KernelOptions` Interface:** Defines the structure for selecting which kernels to initialize.

3.  **`start()` function (Main Entry Point):**
    *   Calls `initThreeJS()` to set up the basic Three.js scene, camera, renderer, and controls.
    *   Creates an instance of `BitByBitBase`.
    *   **`kernelOptions`**: This object is key. By setting `enableOCCT`, `enableJSCAD`, and `enableManifold` to `true` or `false`, you control which kernels Bitbybit attempts to initialize. This allows for optimizing load times and resource usage if not all kernels are needed.
    *   Calls `initWithKernels()` to initialize Bitbybit with the selected kernels.
    *   Conditionally calls geometry creation functions (`createOCCTGeometry`, `createManifoldGeometry`, `createJSCADGeometry`) based on which kernels were enabled and successfully initialized.

4.  **`initThreeJS()` function:**
    *   Standard Three.js boilerplate: sets up the `Scene`, `PerspectiveCamera`, `WebGLRenderer`, `HemisphereLight`, and `OrbitControls`.
    *   Includes a window resize listener and an animation loop.

5.  **`initWithKernels()` function:**
    *   This is the core of Bitbybit's initialization.
    *   It conditionally creates `Worker` instances for OCCT, JSCAD, and Manifold based on the `options` passed in. The `new URL('./workers/worker-name.worker.ts', import.meta.url)` syntax is Vite's way of correctly bundling and referencing web worker files.
    *   Calls `await bitbybit.init(scene, occtWorkerInstance, jscadWorkerInstance, manifoldWorkerInstance)`. `BitByBitBase` can handle `undefined` for worker instances it shouldn't initialize.
    *   It then uses RxJS `pipe(first(...))` to subscribe to the state observables of each enabled kernel (`occWorkerState$`, `jscadWorkerState$`, `manifoldWorkerState$`).
    *   The `Promise` resolves only after all *selected and enabled* kernels have emitted an `initialised` state. This ensures that you don't try to use a kernel before it's ready.

6.  **Geometry Creation Functions (`createOCCTGeometry`, `createManifoldGeometry`, `createJSCADGeometry`):**
    *   These are example functions demonstrating how to use the APIs for each kernel.
    *   **`Inputs` DTOs**: You'll notice the use of `Inputs.OCCT.CubeDto()`, `Inputs.Manifold.SphereDto()`, etc. These objects are used to pass parameters to Bitbybit's geometry creation and modification functions. They provide type safety and often mirror the inputs you'd find in a visual programming environment. Intellisense (auto-completion in your IDE) will be very helpful here.
    *   **API Structure**: Operations are typically namespaced under `bitbybit.occt.*`, `bitbybit.manifold.*`, and `bitbybit.jscad.*`.
    *   **Drawing**: After creating a geometric entity, `bitbybit.draw.drawAnyAsync()` is used to render it into the Three.js scene. Different kernels might have slightly different drawing option DTOs (e.g., `DrawOcctShapeOptions`, `DrawManifoldOrCrossSectionOptions`, `DrawBasicGeometryOptions`).

## 5. Basic Styling (Optional)

Create an `src/style.css` file if you haven't already:

<CodeBlock language="css" title="src/style.css">
{`body {
    margin: 0;
    overflow: hidden; /* Prevent scrollbars from canvas */
    background-color: #1a1c1f;
}

#three-canvas {
    display: block;
    width: 100vw;
    height: 100vh;
}`}
</CodeBlock>

## 6. Running the Application

<CodeBlock language="bash">
{`npm run dev
# or: yarn dev`}
</CodeBlock>

Vite will start a development server, and you should see a browser window open with your Three.js scene. If all kernels were enabled, you'll see three distinct shapes:
*   A red, filleted cube (OCCT) at the origin.
*   A green, subtracted shape (Manifold) positioned below the OCCT shape.
*   A blue, unioned sphere shape (JSCAD) positioned above the OCCT shape.

Check your browser's developer console for logs indicating the initialization status of each kernel and any errors.


## Live Demo (StackBlitz)

You can explore and interact with a live example of this setup on StackBlitz:

<div className="stackblitz-embed-container">
  <iframe
    src="https://stackblitz.com/edit/threejs-bitbybit-setup-with-all-kernels?ctl=1&embed=1&file=src%2Fmain.ts&theme=dark"
    style={{
      width: '100%',
      height: '700px', // Adjust height as needed
      border: '0',
      borderRadius: '4px',
      overflow: 'hidden',
    }}
    title="Bitbybit & Three.js - All Kernels Setup"
    allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
    sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
  ></iframe>
</div>


## Key Takeaways

*   **Vite Simplifies Setup:** Vite handles worker bundling and module resolution effectively.
*   **`KernelOptions` for Control:** You have fine-grained control over which geometry kernels are loaded, allowing you to tailor the application to specific needs and optimize performance.
*   **Asynchronous Operations:** Most Bitbybit operations are `async` because they communicate with Web Workers.
*   **`Inputs` DTOs:** Use these typed objects to configure geometry operations.
*   **Separate Worker Files:** Each kernel runs in its own dedicated worker.
*   **Modular Design:** The `@bitbybit-dev/threejs` package neatly integrates these complex components for use with Three.js.

This setup provides a robust foundation for building sophisticated 3D CAD applications in the browser with Bitbybit and Three.js.