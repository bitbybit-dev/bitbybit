---
sidebar_position: 4
title: "Parametric Hex House Concept with PlayCanvas & Bitbybit"
sidebar_label: "Hex House (PlayCanvas)"
description: "Explore how to construct a parametric 'Hex House' architectural concept using Bitbybit with PlayCanvas, OCCT, and a dynamic GUI for customization."
tags: [npm-packages, playcanvas]
---

import BitByBitRenderCanvas from '@site/src/components/BitByBitRenderCanvas';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';
import Admonition from '@theme/Admonition';

# Parametric Hex House Concept with PlayCanvas & Bitbybit

This tutorial guides you through creating a "Hex House," an architectural concept featuring a distinctive hexagonal shell structure. We'll use Bitbybit's PlayCanvas integration, leveraging the OpenCascade (OCCT) kernel for advanced CAD operations, and `lil-gui` for a user interface that allows real-time parameter adjustments.

<Admonition type="note" title="Video shows ThreeJS implementation">
  The video tutorial below demonstrates the Hex House concept using ThreeJS, not PlayCanvas. The geometric operations, parametric design techniques, and OCCT kernel usage are the same across both engines. This PlayCanvas documentation adapts the same concepts for PlayCanvas's rendering architecture.
</Admonition>

In this related video tutorial you can see how the results of this app look like (rendered in Unreal Engine).
<div class="responsive-video-container">
  <iframe 
    width="560" 
    height="315" 
    src="https://www.youtube.com/embed/Bgf-rAqAtdc" 
    title="Unreal Engine 5 Using Assets From Bitbybit ThreeJS Configurator" 
    frameborder="0" 
    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen" 
    allowfullscreen>
  </iframe>
</div>

<Admonition type="info" title="Note on video tutorial">
  <p>
  While the original tutorial was based on a somewhat outdated app structure, we've provided a more modern and well-organized version here. You can also use this scaffold as a starting point for your own projects.
  </p>
</Admonition>

This example will demonstrate how to:

*   Set up a PlayCanvas environment for 3D rendering.
*   Initialize Bitbybit with the OCCT geometry kernel within this PlayCanvas context.
*   Construct complex parametric geometry using Bitbybit's OCCT API, focusing on techniques like lofting, surface subdivision into hexagonal patterns, and creating compound shapes.
*   Create a GUI with `lil-gui` to control the Hex House's parameters.
*   Dynamically update the 3D model in the PlayCanvas app based on these GUI inputs.
*   Manage and export the generated 3D model.

<Admonition type="info" title="Prerequisites & Further Details">
  <p>This tutorial focuses on the core application logic for generating the Hex House with PlayCanvas. For a detailed explanation of:</p>
  <ul>
    <li>The simplified kernel initialization approach (using <code>initBitByBit()</code>), please refer to our <a href="./start-with-playcanvas">PlayCanvas Integration Starter Tutorial</a>.</li>
    <li>The general project structure (models, downloads, other helpers like <code>init-playcanvas.ts</code>, etc.), you can refer to the <a href="./advanced-parametric-3d-model">previous Advanced Parametric Model (PlayCanvas) tutorial</a> which shares a similar foundational setup.</li>
  </ul>
  <p>Here, we'll concentrate on the essential files and logic that bring the Hex House concept to life: <code>main.ts</code>, <code>create-gui.ts</code>, and particularly <code>create-shape.ts</code>.</p>
</Admonition>

We are providing a higher level explanations of the codebase below, but for working reference always check this live example on StackBlitz, which, as platform evolves could change slightly.

<BitByBitRenderCanvas
  requireManualStart={true}
  iframeUrl="https://stackblitz.com/edit/hex-house-concept-demo-playcanvas-for-docs?embed=1&file=src%2Fmain.ts&theme=dark"
  title="StackBlitz - Hex House Concept 3D"
/>

### Find the source code on [Bitbybit GitHub Examples](https://github.com/bitbybit-dev/bitbybit/tree/master/examples/vite/playcanvas/hex-house-concept)


## 1. HTML Foundation (`index.html`)

The `index.html` file is the standard entry point, providing a canvas for PlayCanvas.

<CodeBlock language="html" title="index.html">
{`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Bitbybit & PlayCanvas Hex House Concept Demo</title>
  </head>
  <body>
    <a class="logo" href="https://bitbybit.dev" target="_blank" rel="noopener noreferrer">
      <img alt="Logo of Bit by bit developers company" src="https://bitbybit.dev/assets/logo-gold-small.png" />
      <div>bitbybit.dev</div><br />
      <div>support the mission - subscribe</div>
    </a>
    <canvas id="playcanvas"></canvas> {/* Canvas for PlayCanvas rendering */}
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>`}
</CodeBlock>

*   Key element: `<canvas id="playcanvas"></canvas>` for PlayCanvas rendering.

## 2. Main Application Orchestration (`src/main.ts`)

This file coordinates the setup and dynamic updates of our Hex House within the PlayCanvas environment.

<CodeBlock language="typescript" title="src/main.ts">
{`import './style.css';
import { BitByBitBase, Inputs } from '@bitbybit-dev/core'; // Core package
import { initBitByBit, type InitBitByBitOptions } from '@bitbybit-dev/playcanvas'; // PlayCanvas integration
import { model, current } from './models';
import {
    initPlayCanvas, createGui, createShape,
    createLightsAndGround, disableGUI, enableGUI, hideSpinner, showSpinner,
    downloadSTEP
} from './helpers';
import * as pc from 'playcanvas';

// Configure which geometry kernels to enable
const options: InitBitByBitOptions = {
    enableOCCT: true, // This example relies heavily on OCCT for its CAD operations
    enableJSCAD: false,
    enableManifold: false,
};

// Application entry point
start();

async function start() {
    // 1. Initialize the PlayCanvas application, camera, and lighting
    const { app } = initPlayCanvas(); // From helpers/init-playcanvas.ts
    // Add default lighting and a ground plane
    createLightsAndGround(app, current); // From helpers/init-playcanvas.ts

    // 2. Initialize Bitbybit, linking it to the PlayCanvas app and selected kernels
    const bitbybit = new BitByBitBase();
    await initBitByBit(app, bitbybit, options); // Automatically creates workers from CDN

    // Variables to hold the OCCT shape representation and shapes to clean up
    let finalShape: Inputs.OCCT.TopoDSShapePointer | undefined;
    let shapesToClean: Inputs.OCCT.TopoDSShapePointer[] = []; // For OCCT memory management

    // 3. Connect download functions to the model object (used by GUI)
    model.downloadStep = () => downloadSTEP(bitbybit, finalShape);

    // 4. Create the GUI panel and link it to model parameters and the updateShape function
    createGui(current, model, updateShape); // From helpers/create-gui.ts

    // 5. Basic animation setup for rotating the model entities
    const rotationSpeed = 0.0005;
    const rotateEntities = () => {
        if (model.rotationEnabled && current.entities && current.entities.length > 0) {
        current.entities.forEach((entity) => {
            if (entity) entity.rotate(0, rotationSpeed * 180 / Math.PI, 0); // Rotate each entity
        });
        }
    };

    // Hook into PlayCanvas update loop for animation
    app.on('update', () => {
        rotateEntities();
    });

    // 6. Initial shape creation
    finalShape = await createShape( // From helpers/create-shape.ts
        bitbybit,
        app,
        model,      // Current model parameters from models/model.ts
        shapesToClean, // Array to track OCCT shapes for cleanup
        current       // Object to store references to current PlayCanvas entities
    );

    // 7. Function to update the shape when GUI parameters change
    async function updateShape() {
        disableGUI(); // Prevent further interaction during update
        showSpinner();  // Indicate processing

        // Destroy previous PlayCanvas entities
        current.entities?.forEach((entity) => {
        entity.destroy(); // PlayCanvas method to remove entity and children
        });
        current.entities = []; // Reset the entities array

        // Re-create the shape with new parameters
        // The createShape function handles OCCT cleanup via shapesToClean
        finalShape = await createShape(
        bitbybit, app, model, shapesToClean, current
        );

        hideSpinner();
        enableGUI(); // Re-enable GUI
    }
}`}
</CodeBlock>

**Core Logic in `main.ts`:**
1.  Initializes the PlayCanvas application using `initPlayCanvas()` and adds lighting/ground via `createLightsAndGround()`.
2.  Initializes `BitByBitBase` for PlayCanvas and then the OCCT kernel using `initBitByBit()` from `@bitbybit-dev/playcanvas`, which automatically creates workers from CDN.
3.  Sets up download functions and the `lil-gui` interface through `createGui()`. Changes in the GUI trigger `updateShape`.
4.  A simple `rotateEntities` animation is tied to PlayCanvas's update loop.
5.  The `updateShape` function is central to interactivity:
    *   It destroys previous PlayCanvas entities using the `destroy()` method to clear old geometry.
    *   It then calls `createShape` again with the potentially modified `model` parameters. The `createShape` function itself is responsible for managing the cleanup of intermediate OCCT shapes using the `shapesToClean` array.

## 3. Essential Helper Functions (`src/helpers/`)

We'll focus on the provided `create-gui.ts` and `create-shape.ts`. For `init-playcanvas.ts`, its role is to set up the PlayCanvas environment as described in the "Advanced Parametric Model (PlayCanvas)" tutorial. Note that kernel initialization is now handled by the `initBitByBit()` helper from `@bitbybit-dev/playcanvas`.

### Creating the GUI (`create-gui.ts`)

This file uses `lil-gui` to build the user interface for controlling the Hex House parameters.

<CodeBlock language="typescript" title="src/helpers/create-gui.ts">
{`import GUI from 'lil-gui';
import type { Current, Model } from '../models';
import * as pc from 'playcanvas';

export const createGui = (
    current: Current,
    model: Model,
  updateShape: () => void 
) => {
    const gui = new GUI();
    current.gui = gui; // Store reference to the GUI instance
    gui.$title.innerHTML = 'Patterns'; // descriptive title

    // Add controls for uHex, vHex (number of hexagons)
    gui.add(model, 'uHex', 5, 81, 4).name('Hexagons U')
        .onFinishChange((value: number) => { model.uHex = value; updateShape(); });
    gui.add(model, 'vHex', 5, 12, 1).name('Hexagons V')
        .onFinishChange((value: number) => { model.vHex = value; updateShape(); });

    // Controls for drawing edges and faces
    gui.add(model, 'drawEdges').name('Draw Edges').onFinishChange(() => updateShape());
    gui.add(model, 'drawFaces').name('Draw Faces').onFinishChange(() => updateShape());

    // Color control for the main shell material
    gui.addColor(model, 'color').name('Shell Color')
        .onChange((hexColor: string) => {
        if (current.entities && current.entities.length > 0) {
            // Find and update materials in the first entity
            const firstEntity = current.entities[0];
            if (firstEntity) {
            firstEntity.findComponents('render').forEach(renderComponent => {
                if (renderComponent.material) {
                const color = new pc.Color().fromString(hexColor);
                renderComponent.material.diffuse.copy(color);
                renderComponent.material.update();
                }
            });
            }
        }
    });

    gui.add(model, 'downloadStep').name('Download STEP');
};`}
</CodeBlock>

**`create-gui.ts` functionality:**
*   Initializes a `lil-gui` panel.
*   Adds controls (sliders for `uHex`, `vHex`; checkboxes for `drawEdges`, `drawFaces`; a color picker for `color`).
*   Each control's `onFinishChange` (for sliders/checkboxes) or `onChange` (for the color picker) callback:
    1.  Updates the corresponding property in the `model` object.
    2.  Calls the `updateShape` function (passed from `main.ts`) to trigger a regeneration of the geometry.
*   For color changes, it iterates through render components in the entities and updates their material diffuse color using PlayCanvas's color system.
*   Adds buttons to trigger download functions (defined in `main.ts` and `helpers/downloads.ts`).

### Generating the Hex House Geometry (`create-shape.ts`)

This is the heart of the parametric model, where complex CAD operations using Bitbybit's OCCT API define the "Hex House" structure.

<CodeBlock language="typescript" title="src/helpers/create-shape.ts (with comments)">
{`import type { BitByBitBase } from '@bitbybit-dev/playcanvas';
import { Inputs } from '@bitbybit-dev/playcanvas';
import * as pc from 'playcanvas';
import type { Current, Model } from '../models';

// Main function to create the entire Hex House shape
export const createShape = async (
    bitbybit: BitByBitBase | undefined,
    app: pc.Application | undefined,
    model: Model, // Contains parameters from the GUI (uHex, vHex, color, etc.)
    shapesToClean: Inputs.OCCT.TopoDSShapePointer[], // Array to manage OCCT memory
    current: Current // Stores references to current PlayCanvas entities
) => {
    if (app && bitbybit) {
        // 1. OCCT Memory Management: Clean up shapes from the previous generation
        if (shapesToClean.length > 0) {
        await bitbybit.occt.deleteShapes({ shapes: shapesToClean });
        }
    
        shapesToClean = []; // Reset the array for the new generation

        type Point3 = Inputs.Base.Point3; // Alias for convenience

        // Define sets of points that will guide the creation of NURBS curves
        const sd = { // sd  stands for 'shape data'
        groundCrv: [ [-15, 0.1, -4.5], [0, 0.1, -3.5], [13, 0.1, -4.5], ] as Point3[],
        groundMid: [ [-16, 0.1, 0], [14, 0.1, 0], ] as Point3[],
        firstCrv:  [ [-12, 0, -5], [-7, 0, -2], [0, 0, -4], [2, 0, -3], [12, 0, -3], ] as Point3[],
        secondCrv: [ [-14, 2, -8], [-7, 1.3, -3], [0, 1.8, -5.8], [2, 2, -5], [14, 1.5, -4], ] as Point3[],
        midCrv:    [ [-18, 4, 0], [-7, 5, 0], [0, 3.7, 0], [2, 3.7, 0], [12, 8, 0], ] as Point3[],
        };

        // Destructure OCCT modules for easier access
        const { shapes, transforms, operations } = bitbybit.occt;
        const { face } = shapes; // Specifically the face module

        // 2. Create Base Curves using Interpolation
        const intOptions = new Inputs.OCCT.InterpolationDto(); // Options for interpolation

        intOptions.points = sd.groundCrv;
        const groundCrv = await shapes.wire.interpolatePoints(intOptions);
        shapesToClean.push(groundCrv); // Add to cleanup list

        // Mirror one of the ground curves to create symmetry
        const mirrorOptions = new Inputs.OCCT.MirrorAlongNormalDto<Inputs.OCCT.TopoDSShapePointer>();
        mirrorOptions.normal = [0, 0, 1]; // Mirror across the XY plane (normal is Z-axis)
        mirrorOptions.shape = groundCrv;
        const groundCrvMir = await transforms.mirrorAlongNormal(mirrorOptions);
        shapesToClean.push(groundCrvMir);

        // Create other guide curves similarly
        intOptions.points = sd.groundMid;
        const groundMid = await shapes.wire.interpolatePoints(intOptions);
        shapesToClean.push(groundMid);

        intOptions.points = sd.firstCrv;
        const firstCrv = await shapes.wire.interpolatePoints(intOptions);
        mirrorOptions.shape = firstCrv;
        const firstCrvMir = await transforms.mirrorAlongNormal(mirrorOptions);
        shapesToClean.push(firstCrv, firstCrvMir);

        intOptions.points = sd.secondCrv;
        const secondCrv = await shapes.wire.interpolatePoints(intOptions);
        mirrorOptions.shape = secondCrv;
        const secondCrvMir = await transforms.mirrorAlongNormal(mirrorOptions);
        shapesToClean.push(secondCrv, secondCrvMir);

        intOptions.points = sd.midCrv;
        const midCrv = await shapes.wire.interpolatePoints(intOptions);
        shapesToClean.push(midCrv);

        // 3. Create the Main Lofted Surface (Shell of the House)
        const loftOptions = new Inputs.OCCT.LoftAdvancedDto<Inputs.OCCT.TopoDSWirePointer>();
        loftOptions.shapes = [
        midCrv, secondCrv, firstCrv, groundCrv, groundMid,
        groundCrvMir, firstCrvMir, secondCrvMir, midCrv,
        ];
        loftOptions.straight = true;
        const loft = await operations.loftAdvanced(loftOptions);
        shapesToClean.push(loft);

        // 4. Extract Specific Faces from the Lofted Surface
        const faceRoof = await face.getFace({ shape: loft, index: 0 });
        const faceWall = await face.getFace({ shape: loft, index: 1 });
        shapesToClean.push(faceRoof, faceWall);

        // 5. Generate Hexagonal Patterns on Roof and Walls
        const roofHexCompounds = await createHexagonsRoof(faceRoof, model.uHex, model.vHex, bitbybit);
        shapesToClean.push(...roofHexCompounds);

        const wallHexShape = await createHexagonsWalls(faceWall, model.uHex, Math.ceil(model.vHex / 2), bitbybit);
        shapesToClean.push(wallHexShape);

        const wallExtrude = await operations.extrude({ shape: wallHexShape, direction: [0, 0, -0.2] });
        shapesToClean.push(wallExtrude);

        // 6. Mirror Roof and Wall Components
        const mirroredRoofPromises = roofHexCompounds.map((r) => {
        mirrorOptions.shape = r;
        return transforms.mirrorAlongNormal(mirrorOptions);
        });
        const mirroredRoofCompounds = await Promise.all(mirroredRoofPromises);
        shapesToClean.push(...mirroredRoofCompounds);

        mirrorOptions.shape = wallExtrude;
        const mirroredWall = await transforms.mirrorAlongNormal(mirrorOptions);
        shapesToClean.push(mirroredWall);

        // 7. Combine All OCCT Parts
        const allPartsForFinalCompound = [
        ...roofHexCompounds, ...mirroredRoofCompounds,
        wallExtrude, mirroredWall,
        ];
        const finalOcctShape = await shapes.compound.makeCompound({ shapes: allPartsForFinalCompound });
        shapesToClean.push(finalOcctShape);

        // Create sub-compounds for different materials/grouping
        const compRoof1 = await shapes.compound.makeCompound({ shapes: [roofHexCompounds[0], mirroredRoofCompounds[0], wallExtrude, mirroredWall] });
        const compRoof2 = await shapes.compound.makeCompound({ shapes: [roofHexCompounds[1], mirroredRoofCompounds[1]] });
        const compRoof3 = await shapes.compound.makeCompound({ shapes: [roofHexCompounds[2], mirroredRoofCompounds[2]] });
        shapesToClean.push(compRoof1, compRoof2, compRoof3);

        // 8. Drawing the OCCT Shapes into PlayCanvas Application
        const drawOptions = new Inputs.Draw.DrawOcctShapeOptions();
        drawOptions.precision = 0.19;
        drawOptions.drawEdges = model.drawEdges;
        drawOptions.drawFaces = model.drawFaces;
        drawOptions.edgeColour = '#000000';

        // Create PlayCanvas materials
        const color = new pc.Color().fromString(model.color);
        const mat1 = new pc.StandardMaterial();
        mat1.diffuse.copy(color);
        mat1.update();

        drawOptions.faceMaterial = mat1;
        const entity1 = await bitbybit.draw.drawAnyAsync({ entity: compRoof1, options: drawOptions });

        const mat2 = new pc.StandardMaterial();
        mat2.diffuse.set(0, 0, 1);
        mat2.update();
        drawOptions.faceMaterial = mat2;
        const entity2 = await bitbybit.draw.drawAnyAsync({ entity: compRoof2, options: drawOptions });

        const mat3 = new pc.StandardMaterial();
        mat3.diffuse.set(0.2, 0, 1);
        mat3.update();
        drawOptions.faceMaterial = mat3;
        const entity3 = await bitbybit.draw.drawAnyAsync({ entity: compRoof3, options: drawOptions });

        // Store references to the PlayCanvas entities
        current.entities = [entity1, entity2, entity3];

        // Enable shadows on all render components
        current.entities.forEach((entity) => {
        entity.findComponents('render').forEach(renderComp => {
            renderComp.castShadows = true;
            renderComp.receiveShadows = true;
        });
        });

        return finalOcctShape;
    }
    return undefined;
};

// Helper function to create hexagonal patterns for the walls
async function createHexagonsWalls(
    faceToSubdivide: Inputs.OCCT.TopoDSFacePointer,
    nrHexagonsU: number,
    nrHexagonsV: number,
    bitbybit: BitByBitBase
): Promise<Inputs.OCCT.TopoDSShapePointer> {
    const { shapes } = bitbybit.occt;
    const { face } = shapes;

    const hexSubdivisionOptions = new Inputs.OCCT.FaceSubdivideToHexagonHolesDto<Inputs.OCCT.TopoDSFacePointer>();
    hexSubdivisionOptions.shape = faceToSubdivide;
    hexSubdivisionOptions.nrHexagonsU = nrHexagonsU;
    hexSubdivisionOptions.nrHexagonsV = nrHexagonsV;
    hexSubdivisionOptions.scalePatternU = [0.8, 0.5, 0.5, 0.3];
    hexSubdivisionOptions.scalePatternV = [0.8, 0.5, 0.5, 0.3];
    hexSubdivisionOptions.offsetFromBorderV = 0.1;
    hexSubdivisionOptions.flatU = false;
    hexSubdivisionOptions.inclusionPattern = [true, true, true, false];
    
    const subdividedFaces = await face.subdivideToHexagonHoles(hexSubdivisionOptions);
    return subdividedFaces[0];
}

// Helper function to create hexagonal panels for the roof
async function createHexagonsRoof(
    faceToSubdivide: Inputs.OCCT.TopoDSFacePointer,
    nrHexagonsU: number,
    nrHexagonsV: number,
    bitbybit: BitByBitBase
): Promise<Inputs.OCCT.TopoDSShapePointer[]> {
    const { shapes, operations } = bitbybit.occt;
    const { face, wire } = shapes;

    // Create outer hexagonal wires
    const hexWiresOptionsOuter = new Inputs.OCCT.FaceSubdivideToHexagonWiresDto<Inputs.OCCT.TopoDSFacePointer>();
    hexWiresOptionsOuter.shape = faceToSubdivide;
    hexWiresOptionsOuter.nrHexagonsU = nrHexagonsU;
    hexWiresOptionsOuter.nrHexagonsV = nrHexagonsV;
    hexWiresOptionsOuter.scalePatternU = [0.8, 0.5, 0.1, 0.1, 0.1];
    hexWiresOptionsOuter.scalePatternV = [0.8, 0.5, 0.1, 0.1, 0.1];
    hexWiresOptionsOuter.flatU = false;
    hexWiresOptionsOuter.inclusionPattern = [true, true, true, false];
    const outerHexWires = await face.subdivideToHexagonWires(hexWiresOptionsOuter);

    // Create inner hexagonal wires
    const hexWiresOptionsInner = new Inputs.OCCT.FaceSubdivideToHexagonWiresDto<Inputs.OCCT.TopoDSFacePointer>();
    hexWiresOptionsInner.shape = faceToSubdivide;
    hexWiresOptionsInner.flatU = false;
    hexWiresOptionsInner.nrHexagonsU = nrHexagonsU;
    hexWiresOptionsInner.nrHexagonsV = nrHexagonsV;
    hexWiresOptionsInner.inclusionPattern = [true, true, true, false];

    const innerHexWiresRaw = await face.subdivideToHexagonWires(hexWiresOptionsInner);
    const innerHexWiresReversed = await Promise.all(outerHexWires.map((s) => wire.reversedWire({ shape: s })));

    // Create faces between pairs of wires
    const panelFacePromises = innerHexWiresReversed.map((reversedInnerWire, index) => {
        const outerWire = innerHexWiresRaw[index];
        return face.createFaceFromWires({ shapes: [outerWire, reversedInnerWire], planar: false });
    });
    const panelFaces = await Promise.all(panelFacePromises);

    // Apply thickness based on height pattern
    const heightPattern = [0.11, 0.1, 0.1];
    let heightPatternIndex = 0;

    const groupPromises: [
        Promise<Inputs.OCCT.TopoDSShapePointer>[],
        Promise<Inputs.OCCT.TopoDSShapePointer>[],
        Promise<Inputs.OCCT.TopoDSShapePointer>[]
    ] = [[], [], []];

    panelFaces.forEach((panelFace) => {
        const currentHeight = heightPattern[heightPatternIndex];
        heightPatternIndex = (heightPatternIndex + 1) % heightPattern.length;
        
        const thickSolidPromise = operations.makeThickSolidSimple({
        shape: panelFace,
        offset: currentHeight,
        });

        if (heightPatternIndex === 0) groupPromises[0].push(thickSolidPromise);
        else if (heightPatternIndex === 1) groupPromises[1].push(thickSolidPromise);
        else groupPromises[2].push(thickSolidPromise);
    });

    const [thickSolidsGroup1, thickSolidsGroup2, thickSolidsGroup3] = await Promise.all([
        Promise.all(groupPromises[0]),
        Promise.all(groupPromises[1]),
        Promise.all(groupPromises[2]),
    ]);

    const compound1 = await shapes.compound.makeCompound({ shapes: thickSolidsGroup1 });
    const compound2 = await shapes.compound.makeCompound({ shapes: thickSolidsGroup2 });
    const compound3 = await shapes.compound.makeCompound({ shapes: thickSolidsGroup3 });

    return [compound1, compound2, compound3];
}`}
</CodeBlock>

**Dissecting `create-shape.ts`:**

*   **OCCT Memory Management:** Starts by calling `bitbybit.occt.deleteShapes()` to clear geometry from previous updates.
*   **Defining Base Curves:** Arrays of 3D points act as control points for generating smooth NURBS curves.
*   **Creating Guide Wires:** Uses `shapes.wire.interpolatePoints()` to create OCCT wire shapes from point arrays, with mirroring for symmetry.
*   **Lofting the Main Shell:** Creates the Hex House form by lofting a surface through guide wires using `operations.loftAdvanced()`.
*   **Extracting Faces:** Extracts specific faces for the roof and walls using `face.getFace()`.
*   **Generating Hexagonal Patterns:**
    *   **`createHexagonsWalls()`:** Subdivides wall face into hexagonal holes using `face.subdivideToHexagonHoles()`.
    *   **`createHexagonsRoof()`:** Creates hexagonal panels with varying heights using `face.subdivideToHexagonWires()` and `operations.makeThickSolidSimple()`.
*   **Mirroring and Compounding:** Mirrors components and combines them into compounds.
*   **Drawing to PlayCanvas:**
    *   Creates PlayCanvas `StandardMaterial` instances with diffuse colors.
    *   Uses `bitbybit.draw.drawAnyAsync()` to convert OCCT geometry into PlayCanvas entities.
    *   Stores entity references in `current.entities` for rotation and disposal.
    *   Enables shadow casting and receiving on render components.

## 4. Styles (`style.css`)

The CSS provides basic page styling, positions the logo, and includes styles for the loading spinner animation.

## Conclusion

This Hex House tutorial demonstrates how to combine the parametric power of Bitbybit's OCCT integration with the rendering capabilities of PlayCanvas to create complex and interactive 3D architectural concepts. Key takeaways include:

*   **Modular Design:** Structuring the application into `main.ts` for orchestration and helper files for specific tasks.
*   **Parametric CAD with OCCT:** Utilizing advanced OCCT operations through Bitbybit's API.
*   **OCCT Memory Management:** Tracking intermediate OCCT shapes and using `bitbybit.occt.deleteShapes()` to prevent memory leaks.
*   **Dynamic Updates:** Efficiently updating the PlayCanvas app by destroying old entities and redrawing new ones based on GUI-driven parameter changes.
*   **PlayCanvas Integration:** Using `bitbybit.draw.drawAnyAsync()` to convert OCCT geometry into PlayCanvas entities with materials.
*   **Entity-Component System:** PlayCanvas uses entities with components, and Bitbybit creates and manages these entities for rendering.

This example serves as a blueprint for developing sophisticated web-based 3D applications where detailed geometric control and user interactivity are paramount.
