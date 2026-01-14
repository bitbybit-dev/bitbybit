---
sidebar_position: 2
title: Using Bitbybit with PlayCanvas
sidebar_label: PlayCanvas Starter Template
description: Learn how to set up and use the @bitbybit-dev/playcanvas package with Vite to create 3D CAD applications, and control which geometry kernels (OCCT, JSCAD, Manifold) are initialized.
tags: [npm-packages, playcanvas, occt, manifold, jscad]
---

import BitByBitRenderCanvas from '@site/src/components/BitByBitRenderCanvas';
import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';

# Using Bitbybit with PlayCanvas

This guide will walk you through setting up and using the `@bitbybit-dev/playcanvas` package to integrate Bitbybit's 3D CAD functionalities into your PlayCanvas applications. We'll use Vite as our build tool, which simplifies the setup process.

The `@bitbybit-dev/playcanvas` package conveniently includes `playcanvas` as a dependency, so you don't need to install it separately.

## Prerequisites

*   Node.js and npm (or yarn) installed.
*   A basic understanding of TypeScript and PlayCanvas.

## [Example on Bitbybit Github Repo](https://github.com/bitbybit-dev/bitbybit/tree/master/examples/vite/playcanvas/starter-template)

## 1. Project Setup with Vite

First, create a new Vite project with a TypeScript template:

<CodeBlock language="bash">
{`npm create vite@latest my-bitbybit-playcanvas-app -- --template vanilla-ts
# or: yarn create vite my-bitbybit-playcanvas-app --template vanilla-ts

cd my-bitbybit-playcanvas-app`}
</CodeBlock>

Next, install the Bitbybit PlayCanvas package and its necessary worker dependencies:

<CodeBlock language="bash">
{`npm install @bitbybit-dev/playcanvas
# or: yarn add @bitbybit-dev/playcanvas`}
</CodeBlock>

<Admonition type="info" title="Why these packages?">
  <ul>
    <li><code>@bitbybit-dev/playcanvas</code>: The main library for integrating Bitbybit with PlayCanvas. It also installs these main packages listed below.</li>
    <li><code>playcanvas</code>: Provides main game engine to be used with this demo.</li>
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

Modify your `index.html` file in the project root to include a `<canvas>` element where the PlayCanvas application will be rendered:

<CodeBlock language="html" title="index.html">
{`<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <link rel="icon" type="image/svg+xml" href="/vite.svg" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Bitbybit & PlayCanvas Example</title>
    </head>
    <body>
        <canvas id="playcanvas-canvas"></canvas>
        <script type="module" src="/src/main.ts"></script>
    </body>
</html>`}
</CodeBlock>

This is a standard HTML setup. The key parts are:
-   `<canvas id="playcanvas-canvas"></canvas>`: This is where our 3D scene will be drawn.
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
            return 'https://cdn.jsdelivr.net/gh/bitbybit-dev/bitbybit-assets@0.21.1/wasm/manifold-3-3-2.wasm';
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
import { BitByBitBase, Inputs } from '@bitbybit-dev/playcanvas';
import { OccStateEnum } from '@bitbybit-dev/occt-worker';
import { JscadStateEnum } from '@bitbybit-dev/jscad-worker';
import { ManifoldStateEnum } from '@bitbybit-dev/manifold-worker';

import { first, firstValueFrom, map } from 'rxjs';
import {
    Application,
    Color,
    Entity,
    FILLMODE_FILL_WINDOW,
    Mouse,
    RESOLUTION_AUTO,
    TouchDevice,
} from 'playcanvas';

// Define an interface for kernel options
interface KernelOptions {
    enableOCCT: boolean;
    enableJSCAD: boolean;
    enableManifold: boolean;
}

// --- 1. Main Application Entry Point ---
start();

async function start() {
    // Initialize basic PlayCanvas scene
    const { app, scene, camera } = initPlayCanvas();

    // Create an instance of BitByBitBase for PlayCanvas
    const bitbybit = new BitByBitBase();

    // --- 2. Configure and Initialize Kernels ---
    // Users can control which kernels are loaded
    const kernelOptions: KernelOptions = {
        enableOCCT: true,
        enableJSCAD: true,
        enableManifold: true,
    };
    // Initialize Bitbybit with the selected kernels
    await initWithKernels(app, scene, bitbybit, kernelOptions);

    // Setup orbit camera controls using bitbybit library
    const cameraOptions = new Inputs.PlayCanvasCamera.OrbitCameraDto();
    cameraOptions.distance = 125;
    cameraOptions.pitch = -24;
    cameraOptions.yaw = 27;
    cameraOptions.frameOnStart = false;
    cameraOptions.inertiaFactor = 0.2;
    cameraOptions.distanceSensitivity = 0.3;
    cameraOptions.focusEntity = camera;
    bitbybit.playcanvas.camera.orbitCamera.create(cameraOptions);

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

// --- 4. PlayCanvas Scene Initialization ---
function initPlayCanvas() {
    const canvas = document.getElementById('playcanvas-canvas') as HTMLCanvasElement;

    // Create a PlayCanvas application
    const app = new Application(canvas, {
        graphicsDeviceOptions: {
            antialias: true,
            alpha: false,
        },
        mouse: new Mouse(canvas),
        touch: new TouchDevice(canvas),
    });

    // Fill the window and automatically change resolution to be the same as the canvas size
    app.setCanvasFillMode(FILLMODE_FILL_WINDOW);
    app.setCanvasResolution(RESOLUTION_AUTO);

    // Ensure canvas is resized when window changes size
    window.addEventListener('resize', () => app.resizeCanvas());

    // Create root scene entity
    const scene = new Entity('scene');
    app.root.addChild(scene);

    // Create camera entity
    const camera = new Entity('camera');
    camera.addComponent('camera', {
        clearColor: new Color(0x1a / 255, 0x1c / 255, 0x1f / 255, 1),
        fov: 70,
        nearClip: 0.1,
        farClip: 1000,
    });
    scene.addChild(camera);

    // Create directional light
    const light = new Entity('directionalLight');
    light.addComponent('light', {
        type: 'directional',
        color: new Color(1, 1, 1),
        intensity: 1,
    });
    light.setEulerAngles(45, 30, 0);
    scene.addChild(light);

    // Create ambient/hemisphere-like lighting
    app.scene.ambientLight = new Color(0.4, 0.4, 0.4);

    // Start the application update loop
    app.start();

    return { app, scene, camera };
}

// --- 5. Bitbybit Kernel Initialization Logic ---
async function initWithKernels(
    app: pc.AppBase,
    scene: pc.Entity,
    bitbybit: BitByBitBase,
    options: KernelOptions
): Promise<{ message: string; initializedKernels: string[] }> {
    let occtWorkerInstance: Worker | undefined;
    let jscadWorkerInstance: Worker | undefined;
    let manifoldWorkerInstance: Worker | undefined;

    // 1. Conditionally create worker instances
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

    // 2. Initialize Bitbybit with PlayCanvas app and scene
    bitbybit.init(
        app,
        scene,
        occtWorkerInstance,
        jscadWorkerInstance,
        manifoldWorkerInstance
    );

    // 3. Collect promises for kernel initializations
    const initializationPromises: Promise<string>[] = [];
    let anyKernelSelectedForInit = false;

    if (options.enableOCCT) {
        anyKernelSelectedForInit = true;
        if (bitbybit.occtWorkerManager) {
            initializationPromises.push(
                firstValueFrom(
                    bitbybit.occtWorkerManager.occWorkerState$.pipe(
                        first((s) => s.state === OccStateEnum.initialised),
                        map(() => 'OCCT')
                    )
                )
            );
        } else {
            console.warn(
                'OCCT enabled in options, but occtWorkerManager not found after init.'
            );
        }
    }

    if (options.enableJSCAD) {
        anyKernelSelectedForInit = true;
        if (bitbybit.jscadWorkerManager) {
            initializationPromises.push(
                firstValueFrom(
                    bitbybit.jscadWorkerManager.jscadWorkerState$.pipe(
                        first((s) => s.state === JscadStateEnum.initialised),
                        map(() => 'JSCAD')
                    )
                )
            );
        } else {
            console.warn(
                'JSCAD enabled in options, but jscadWorkerManager not found after init.'
            );
        }
    }

    if (options.enableManifold) {
        anyKernelSelectedForInit = true;
        if (bitbybit.manifoldWorkerManager && bitbybit.manifoldWorkerManager.manifoldWorkerState$) {
            initializationPromises.push(
                firstValueFrom(
                    bitbybit.manifoldWorkerManager.manifoldWorkerState$.pipe(
                        first((s) => s.state === ManifoldStateEnum.initialised),
                        map(() => 'Manifold')
                    )
                )
            );
        } else {
            console.warn(
                'Manifold enabled in options, but manifoldWorkerManager not found after init.'
            );
        }
    }

    // 4. Wait for selected & available kernels or handle no selection/availability
    if (!anyKernelSelectedForInit) {
        console.log('No kernels selected for initialization.');
        return { message: 'No kernels selected for initialization.', initializedKernels: [] };
    }

    if (initializationPromises.length === 0) {
        console.log(
            'Kernels were selected, but none had managers available for awaiting initialization.'
        );
        return {
            message: 'Selected kernels were not awaitable for initialization state.',
            initializedKernels: [],
        };
    }

    const initializedKernels = await Promise.all(initializationPromises);
    console.log('Kernels initialized:', initializedKernels.join(', '));
    console.log('Kernels initialized:', initializedKernels.join(', '));
    return {
        message: \`Successfully initialized: \${initializedKernels.join(', ')}\`,
        initializedKernels,
    };
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
    drawOptions.edgeWidth = 5;
    drawOptions.faceColour = color;
    drawOptions.drawVertices = true;
    drawOptions.vertexSize = 0.5;
    drawOptions.vertexColour = '#ffffff';
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
    *   `BitByBitBase` and `Inputs`: Core components from `@bitbybit-dev/playcanvas`. `Inputs` provides DTOs (Data Transfer Objects) for specifying parameters for geometry operations.
    *   `...StateEnum`: Enums used to check the initialization state of each kernel worker.
    *   PlayCanvas modules (`Application`, `Color`, `Entity`, etc.) for scene setup.
    *   `first`, `firstValueFrom`, `map` from `rxjs`: Used to subscribe to and transform the kernel state observables.

2.  **`KernelOptions` Interface:** Defines the structure for selecting which kernels to initialize.

3.  **`start()` function (Main Entry Point):**
    *   Calls `initPlayCanvas()` to set up the basic PlayCanvas application, scene entity, camera, and lights.
    *   Creates an instance of `BitByBitBase`.
    *   **`kernelOptions`**: This object is key. By setting `enableOCCT`, `enableJSCAD`, and `enableManifold` to `true` or `false`, you control which kernels Bitbybit attempts to initialize. This allows for optimizing load times and resource usage if not all kernels are needed.
    *   Calls `initWithKernels()` to initialize Bitbybit with the selected kernels.
    *   Sets up orbit camera controls using bitbybit's built-in camera helper.
    *   Conditionally calls geometry creation functions based on which kernels were enabled.

4.  **`initPlayCanvas()` function:**
    *   Creates a PlayCanvas `Application` instance with the canvas element.
    *   Sets up proper canvas fill mode and resolution handling.
    *   Creates a root `scene` entity and adds it to the app root.
    *   Creates a `camera` entity with configured clear color, FOV, and clipping planes.
    *   Adds directional and ambient lighting.
    *   Starts the application and returns the `app`, `scene`, and `camera`.

5.  **`initWithKernels()` function:**
    *   This is the core of Bitbybit's initialization.
    *   Conditionally creates `Worker` instances for OCCT, JSCAD, and Manifold based on the `options` passed in.
    *   Calls `bitbybit.init(app, scene, occtWorkerInstance, jscadWorkerInstance, manifoldWorkerInstance)`. Both the PlayCanvas `app` and `scene` entity are passed.
    *   Uses RxJS `pipe(first(...), map(...))` to subscribe to the state observables of each enabled kernel and transform the result to a string identifying the kernel.
    *   The `Promise` resolves only after all selected kernels have emitted an `initialised` state.
    *   Returns an object with a message and an array of initialized kernel names.

6.  **Geometry Creation Functions:**
    *   These demonstrate how to use the APIs for each kernel.
    *   **`Inputs` DTOs**: Typed objects to pass parameters to Bitbybit's geometry functions.
    *   **API Structure**: Operations are namespaced under `bitbybit.occt.*`, `bitbybit.manifold.*`, and `bitbybit.jscad.*`.
    *   **Drawing**: `bitbybit.draw.drawAnyAsync()` renders entities into the PlayCanvas scene. The OCCT draw options now support additional properties like `edgeWidth`, `drawVertices`, `vertexSize`, and `vertexColour`.

## 5. Basic Styling (Optional)

Create an `src/style.css` file:

<CodeBlock language="css" title="src/style.css">
{`body {
    margin: 0;
    overflow: hidden; /* Prevent scrollbars from canvas */
    background-color: #1a1c1f;
}

#playcanvas-canvas {
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

Vite will start a development server, and you should see a browser window open with your PlayCanvas application. If all kernels were enabled, you'll see three distinct shapes:
*   A red, filleted cube (OCCT) at the origin.
*   A green, subtracted shape (Manifold) positioned below the OCCT shape.
*   A blue, unioned sphere shape (JSCAD) positioned above the OCCT shape.

Check your browser's developer console for logs indicating the initialization status of each kernel and any errors.

## Live Demo (StackBlitz)

You can explore and interact with a live example of this setup on StackBlitz:
<BitByBitRenderCanvas
  requireManualStart={true}
  iframeUrl="https://stackblitz.com/edit/playcanvas-bitbybit-setup-with-all-kernels?embed=1&file=src%2Fmain.ts&theme=dark"
  title="StackBlitz - Bitbybit & PlayCanvas - All Kernels Setup"
/>

## Key Takeaways

*   **Vite Simplifies Setup:** Vite handles worker bundling and module resolution effectively.
*   **`KernelOptions` for Control:** You have fine-grained control over which geometry kernels are loaded, allowing you to tailor the application to specific needs and optimize performance.
*   **Asynchronous Operations:** Most Bitbybit operations are `async` because they communicate with Web Workers.
*   **`Inputs` DTOs:** Use these typed objects to configure geometry operations.
*   **Separate Worker Files:** Each kernel runs in its own dedicated worker.
*   **Modular Design:** The `@bitbybit-dev/playcanvas` package neatly integrates these complex components for use with PlayCanvas.
*   **Entity-Based Rendering:** PlayCanvas uses an entity-component system, and Bitbybit creates entities that are added to the app root.

This setup provides a robust foundation for building sophisticated 3D CAD applications in the browser with Bitbybit and PlayCanvas.
