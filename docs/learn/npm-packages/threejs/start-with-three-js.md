---
sidebar_position: 2
title: Using Bitbybit with ThreeJS
sidebar_label: ThreeJS Starter Template
description: Learn how to set up and use the @bitbybit-dev/threejs package with Vite to create 3D CAD applications, and control which geometry kernels (OCCT, JSCAD, Manifold) are initialized.
tags: [npm-packages, threejs, occt, manifold, jscad]
---

import BitByBitRenderCanvas from '@site/src/components/BitByBitRenderCanvas';
import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';

# Using Bitbybit with ThreeJS

This guide will walk you through setting up and using the `@bitbybit-dev/threejs` package to integrate Bitbybit's 3D CAD functionalities into your ThreeJS applications. We'll use Vite as our build tool, which simplifies the setup process.

The `@bitbybit-dev/threejs` package conveniently includes `three` as a dependency, so you don't need to install it separately.

## Prerequisites

*   Node.js and npm (or yarn) installed.
*   A basic understanding of TypeScript and ThreeJS.

## [Example on Bitbybit Github Repo](https://github.com/bitbybit-dev/bitbybit/tree/master/examples/vite/threejs/starter-template)

## 1. Project Setup with Vite

First, create a new Vite project with a TypeScript template:

<CodeBlock language="bash">
{`npm create vite@latest my-bitbybit-threejs-app -- --template vanilla-ts
# or: yarn create vite my-bitbybit-threejs-app --template vanilla-ts

cd my-bitbybit-threejs-app`}
</CodeBlock>

Next, install the Bitbybit ThreeJS package and its necessary worker dependencies:

<CodeBlock language="bash">
{`npm install @bitbybit-dev/threejs
# or: yarn add @bitbybit-dev/threejs`}
</CodeBlock>

<Admonition type="info" title="Why these packages?">
  <ul>
    <li><code>@bitbybit-dev/threejs</code>: The main library for integrating Bitbybit with ThreeJS. It also installs these main packages listed below.</li>
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

Modify your `index.html` file in the project root to include a `<canvas>` element where the ThreeJS scene will be rendered:

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

## 3. Main Application Logic (`main.ts`)

Replace the content of `src/main.ts` with the following:

<CodeBlock language="typescript" title="src/main.ts">
{`import './style.css'; // Basic styling
import {
    BitByBitBase,
    Inputs,
    initBitByBit,
    initThreeJS,
    type InitBitByBitOptions,
} from '@bitbybit-dev/threejs';

// --- 1. Main Application Entry Point ---
start();

async function start() {
    // Initialize ThreeJS scene using Bitbybit's helper function
    const sceneOptions = new Inputs.ThreeJSScene.InitThreeJSDto();
    sceneOptions.canvasId = 'three-canvas';
    sceneOptions.sceneSize = 10;
    
    const { scene, startAnimationLoop } = initThreeJS(sceneOptions);
    startAnimationLoop();
    
    // Create an instance of BitByBitBase for ThreeJS
    const bitbybit = new BitByBitBase();

    // --- 2. Configure and Initialize Kernels ---
    // Users can control which kernels are loaded.
    // The initBitByBit helper function handles all worker setup automatically
    // by loading the kernels from CDN.
    const options: InitBitByBitOptions = {
        enableOCCT: true,
        enableJSCAD: true,
        enableManifold: true,
    };

    // Initialize Bitbybit with the selected kernels
    await initBitByBit(scene, bitbybit, options);

    // --- 3. Create Geometry with Active Kernels ---
    if (options.enableOCCT) {
        await createOCCTGeometry(bitbybit, '#ff0000'); // Red
    }
    if (options.enableManifold) {
        await createManifoldGeometry(bitbybit, '#00ff00'); // Green
    }
    if (options.enableJSCAD) {
        await createJSCADGeometry(bitbybit, '#0000ff'); // Blue
    }
}

// --- 4. Geometry Creation Functions (Examples) ---
async function createOCCTGeometry(bitbybit: BitByBitBase, color: string) {
    console.log('Creating OCCT geometry...');
    const cubeOptions = new Inputs.OCCT.CubeDto();
    cubeOptions.size = 2.5;
    cubeOptions.center = [0, 1.25, 0];

    const cube = await bitbybit.occt.shapes.solid.createCube(cubeOptions);

    const filletOptions = new Inputs.OCCT.FilletDto<Inputs.OCCT.TopoDSShapePointer>();
    filletOptions.shape = cube;
    filletOptions.radius = 0.4;
    const roundedCube = await bitbybit.occt.fillets.filletEdges(filletOptions);

    const drawOptions = new Inputs.Draw.DrawOcctShapeOptions();
    drawOptions.edgeWidth = 0.5;
    drawOptions.faceColour = color;
    drawOptions.drawVertices = true;
    drawOptions.vertexSize = 0.05;
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
    sphereOptions.radius = 1.5;
    sphereOptions.circularSegments = 32;
    const sphere = await bitbybit.manifold.manifold.shapes.sphere(sphereOptions);

    const cubeOptions = new Inputs.Manifold.CubeDto();
    cubeOptions.size = 2.5;
    const cube = await bitbybit.manifold.manifold.shapes.cube(cubeOptions);

    const diffedShape = await bitbybit.manifold.manifold.booleans.differenceTwo({
        manifold1: cube,
        manifold2: sphere,
    });

    const translationOptions = new Inputs.Manifold.TranslateDto<Inputs.Manifold.ManifoldPointer>();
    translationOptions.manifold = diffedShape;
    translationOptions.vector = [0, 1.25, -4]; // Position below OCCT
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
    geodesicSphereOptions.radius = 1.5;
    geodesicSphereOptions.center = [0, 1.5, 4]; // Position above OCCT
    const geodesicSphere = await bitbybit.jscad.shapes.geodesicSphere(
        geodesicSphereOptions
    );

    const sphereOptions = new Inputs.JSCAD.SphereDto();
    sphereOptions.radius = 1;
    sphereOptions.center = [0, 3, 4.5];
    const simpleSphere = await bitbybit.jscad.shapes.sphere(sphereOptions);

    const unionOptions = new Inputs.JSCAD.BooleanTwoObjectsDto();
    unionOptions.first = geodesicSphere;
    unionOptions.second = simpleSphere;
    const unionShape = await bitbybit.jscad.booleans.unionTwo(unionOptions);

    const drawOptions = new Inputs.Draw.DrawBasicGeometryOptions();
    drawOptions.colours = color;
    await bitbybit.draw.drawAnyAsync({
        entity: unionShape,
        options: drawOptions,
    });
    console.log('JSCAD geometry created and drawn.');
}`}
</CodeBlock>

### Explanation of `main.ts`:

1.  **Imports:**
    *   `BitByBitBase`, `Inputs`, `initBitByBit`, `initThreeJS`, and `InitBitByBitOptions`: Core components from `@bitbybit-dev/threejs`. `Inputs` provides DTOs (Data Transfer Objects) for specifying parameters for geometry operations and scene configuration. `initBitByBit` is the helper function that handles all kernel initialization automatically, `initThreeJS` sets up the ThreeJS scene, and `InitBitByBitOptions` is the type for kernel configuration options.

2.  **`start()` function (Main Entry Point):**
    *   Uses `Inputs.ThreeJSScene.InitThreeJSDto()` to configure scene options like canvas ID and scene size.
    *   Calls `initThreeJS(sceneOptions)` to set up the complete ThreeJS environment (scene, camera, renderer, lights, controls) with a single function call. The function returns a `startAnimationLoop` function that you call to begin the render loop.
    *   Creates an instance of `BitByBitBase`.
    *   **`options`**: This object is key. By setting `enableOCCT`, `enableJSCAD`, and `enableManifold` to `true` or `false`, you control which kernels Bitbybit attempts to initialize. This allows for optimizing load times and resource usage if not all kernels are needed.
    *   **`initBitByBit()`**: This helper function handles all the complexity of initializing Bitbybit with the selected kernels. It automatically creates web workers, loads kernel WASM files from CDN, and waits for all selected kernels to be ready. You simply pass the scene, the bitbybit instance, and your options.
    *   Conditionally calls geometry creation functions (`createOCCTGeometry`, `createManifoldGeometry`, `createJSCADGeometry`) based on which kernels were enabled.

3.  **Geometry Creation Functions (`createOCCTGeometry`, `createManifoldGeometry`, `createJSCADGeometry`):**
    *   These are example functions demonstrating how to use the APIs for each kernel.
    *   **`Inputs` DTOs**: You'll notice the use of `Inputs.OCCT.CubeDto()`, `Inputs.Manifold.SphereDto()`, etc. These objects are used to pass parameters to Bitbybit's geometry creation and modification functions. They provide type safety and often mirror the inputs you'd find in a visual programming environment. Intellisense (auto-completion in your IDE) will be very helpful here.
    *   **API Structure**: Operations are typically namespaced under `bitbybit.occt.*`, `bitbybit.manifold.*`, and `bitbybit.jscad.*`.
    *   **Drawing**: After creating a geometric entity, `bitbybit.draw.drawAnyAsync()` is used to render it into the ThreeJS scene. Different kernels might have slightly different drawing option DTOs (e.g., `DrawOcctShapeOptions`, `DrawManifoldOrCrossSectionOptions`, `DrawBasicGeometryOptions`). The OCCT draw options now support additional properties like `edgeWidth`, `drawVertices`, `vertexSize`, and `vertexColour`.

## 4. Basic Styling (Optional)

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

## 5. Running the Application

<CodeBlock language="bash">
{`npm run dev
# or: yarn dev`}
</CodeBlock>

Vite will start a development server, and you should see a browser window open with your ThreeJS scene. If all kernels were enabled, you'll see three distinct shapes:
*   A red, filleted cube (OCCT) at the origin.
*   A green, subtracted shape (Manifold) positioned below the OCCT shape.
*   A blue, unioned sphere shape (JSCAD) positioned above the OCCT shape.

Check your browser's developer console for logs indicating the initialization status of each kernel and any errors.


## Live Demo (StackBlitz)

You can explore and interact with a live example of this setup on StackBlitz:
<BitByBitRenderCanvas
  requireManualStart={true}
  iframeUrl="https://stackblitz.com/edit/threejs-bitbybit-setup-with-all-kernels?embed=1&file=src%2Fmain.ts&theme=dark"
  title="StackBlitz - Bitbybit & ThreeJS - All Kernels Setup"
/>

## Key Takeaways

*   **Vite Simplifies Setup:** Vite handles module resolution effectively for a smooth development experience.
*   **`initBitByBit()` for Easy Initialization:** The `initBitByBit()` helper function handles all the complexity of creating web workers and loading kernel WASM files from CDN. You simply configure which kernels to enable. If you need to host assets on your own infrastructure, see [Self-Hosting Assets](/learn/hosting-and-cdn).
*   **`InitBitByBitOptions` for Control:** You have fine-grained control over which geometry kernels are loaded, allowing you to tailor the application to specific needs and optimize performance.
*   **Asynchronous Operations:** Most Bitbybit operations are `async` because they communicate with Web Workers.
*   **`Inputs` DTOs:** Use these typed objects to configure geometry operations.
*   **Modular Design:** The `@bitbybit-dev/threejs` package neatly integrates these complex components for use with ThreeJS.

This setup provides a robust foundation for building sophisticated 3D CAD applications in the browser with Bitbybit and ThreeJS.