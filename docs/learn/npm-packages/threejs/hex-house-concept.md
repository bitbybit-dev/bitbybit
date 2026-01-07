---
sidebar_position: 3
title: "Parametric Hex House Concept with ThreeJS & Bitbybit"
sidebar_label: "Hex House (ThreeJS)"
description: "Explore how to construct a parametric 'Hex House' architectural concept using Bitbybit with ThreeJS, OCCT, and a dynamic GUI for customization."
tags: [npm-packages, threejs]
---

import BitByBitRenderCanvas from '@site/src/components/BitByBitRenderCanvas'; // Assuming this component exists
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';
import Admonition from '@theme/Admonition';

# Parametric Hex House Concept with ThreeJS & Bitbybit

This tutorial guides you through creating a "Hex House," an architectural concept featuring a distinctive hexagonal shell structure. We'll use Bitbybit's ThreeJS integration, leveraging the OpenCascade (OCCT) kernel for advanced CAD operations, and `lil-gui` for a user interface that allows real-time parameter adjustments.


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

*   Set up a ThreeJS environment for 3D rendering.
*   Initialize Bitbybit with the OCCT geometry kernel within this ThreeJS context.
*   Construct complex parametric geometry using Bitbybit's OCCT API, focusing on techniques like lofting, surface subdivision into hexagonal patterns, and creating compound shapes.
*   Create a GUI with `lil-gui` to control the Hex House's parameters.
*   Dynamically update the 3D model in the ThreeJS scene based on these GUI inputs.
*   Manage and export the generated 3D model.

<Admonition type="info" title="Prerequisites & Further Details">
  <p>This tutorial focuses on the core application logic for generating the Hex House with ThreeJS. For a detailed explanation of:</p>
  <ul>
    <li>Setting up Web Worker files (e.g., <code>occt.worker.ts</code>), please refer to our <a href="./start-with-three-js">ThreeJS Integration Starter Tutorial</a>.</li>
    <li>The general project structure (models, downloads, other helpers like <code>init-threejs.ts</code>, <code>init-kernels.ts</code>, etc.), you can refer to the <a href="./advanced-parametric-3d-model">previous Advanced Parametric Model (ThreeJS) tutorial</a> which shares a similar foundational setup.</li>
  </ul>
  <p>Here, we'll concentrate on the essential files and logic that bring the Hex House concept to life: <code>main.ts</code>, <code>create-gui.ts</code>, and particularly <code>create-shape.ts</code>.</p>
</Admonition>

We are providing a higher level explanations of the codebase below, but for working reference always check this live example on StackBlitz, which, as platform evolves could change slightly.

<BitByBitRenderCanvas
  requireManualStart={true}
  iframeUrl="https://stackblitz.com/edit/hex-house-concept-demo-threejs-for-docs?embed=1&file=src%2Fmain.ts&theme=dark"
  title="StackBlitz - Hex House Concept 3D"
/>

### Find the source code on [Bitbybit GitHub Examples](https://github.com/bitbybit-dev/bitbybit/tree/master/examples/vite/threejs/hex-house-concept)


## 1. HTML Foundation (`index.html`)

The `index.html` file is the standard entry point, providing a canvas for ThreeJS.

<CodeBlock language="html" title="index.html">
{`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Bitbybit & ThreeJS Hex House Concept Demo</title>
  </head>
  <body>
    <a class="logo" href="https://bitbybit.dev" target="_blank" rel="noopener noreferrer">
      <img alt="Logo of Bit by bit developers company" src="https://bitbybit.dev/assets/logo-gold-small.png" />
      <div>bitbybit.dev</div><br />
      <div>support the mission - subscribe</div>
    </a>
    <canvas id="three-canvas"></canvas> {/* Canvas for ThreeJS rendering */}
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>`}
</CodeBlock>

*   Key element: `<canvas id="three-canvas"></canvas>` for ThreeJS rendering.

## 2. Main Application Orchestration (`src/main.ts`)

This file coordinates the setup and dynamic updates of our Hex House within the ThreeJS environment.

<CodeBlock language="typescript" title="src/main.ts">
{`import './style.css';
import { BitByBitBase, Inputs } from '@bitbybit-dev/threejs'; // ThreeJS integration
import { model, type KernelOptions, current } from './models';
import {
    initKernels, initThreeJS, createGui, createShape,
    createDirLightsAndGround, disableGUI, enableGUI, hideSpinner, showSpinner,
    downloadGLB, downloadSTL, downloadStep,
} from './helpers';

// Configure which geometry kernels to enable
const kernelOptions: KernelOptions = {
    enableOCCT: true, // This example relies heavily on OCCT for its CAD operations
    enableJSCAD: false,
    enableManifold: false,
};

// Application entry point
start();

async function start() {
    // 1. Initialize the ThreeJS scene, camera, and renderer
    const { scene } = initThreeJS(); // From helpers/init-threejs.ts
    // Add default lighting and a ground plane
    createDirLightsAndGround(scene, current); // From helpers/init-threejs.ts

    // 2. Initialize Bitbybit, linking it to the ThreeJS scene and selected kernels
    const bitbybit = new BitByBitBase();
    await initKernels(scene, bitbybit, kernelOptions); // From helpers/init-kernels.ts

    // Variables to hold the OCCT shape representation and shapes to clean up
    let finalShape: Inputs.OCCT.TopoDSShapePointer | undefined;
    let shapesToClean: Inputs.OCCT.TopoDSShapePointer[] = []; // For OCCT memory management

    // 3. Connect download functions to the model object (used by GUI)
    model.downloadStep = () => downloadStep(bitbybit, finalShape);
    model.downloadGLB = () => downloadGLB(scene); // GLB export from ThreeJS scene
    model.downloadSTL = () => downloadSTL(scene); // STL export from ThreeJS scene (can also be from OCCT)

    // 4. Create the GUI panel and link it to model parameters and the updateShape function
    createGui(current, model, updateShape); // From helpers/create-gui.ts

    // 5. Basic animation setup for rotating the model groups
    const rotationSpeed = 0.0005;
    const rotateGroup = () => {
        if (model.rotationEnabled && current.groups && current.groups.length > 0) {
        current.groups.forEach((g) => {
            if (g) g.rotation.y -= rotationSpeed; // Rotate each ThreeJS Group
        });
        }
    };

    // Hook into ThreeJS render loop (via onBeforeRender) for animation
    scene.onBeforeRender = () => {
        rotateGroup();
    };

    // 6. Initial shape creation
    finalShape = await createShape( // From helpers/create-shape.ts
        bitbybit,
        scene,
        model,      // Current model parameters from models/model.ts
        shapesToClean, // Array to track OCCT shapes for cleanup
        current       // Object to store references to current ThreeJS Groups
    );

    // 7. Function to update the shape when GUI parameters change
    async function updateShape() {
        disableGUI(); // Prevent further interaction during update
        showSpinner();  // Indicate processing

        // Remove previous ThreeJS groups from the scene
        current.groups?.forEach((g) => {
        g.traverse((obj) => { // Traverse to remove all children
            scene?.remove(obj);
            // Note: Proper disposal of geometries and materials might be needed here
            // if not handled by a higher-level dispose of the group's children.
            // For simplicity, this example focuses on removing from scene.
        });
        scene?.remove(g); // Remove the group itself
        });
        current.groups = []; // Reset the groups array

        // Re-create the shape with new parameters
        // The createShape function handles OCCT cleanup via shapesToClean
        finalShape = await createShape(
        bitbybit, scene, model, shapesToClean, current
        );

        hideSpinner();
        enableGUI(); // Re-enable GUI
    }
}`}
</CodeBlock>

**Core Logic in `main.ts`:**
1.  Initializes the ThreeJS scene using `initThreeJS()` and adds lighting/ground via `createDirLightsAndGround()`.
2.  Initializes `BitByBitBase` for ThreeJS and then the OCCT kernel using `initKernels()`.
3.  Sets up download functions and the `lil-gui` interface through `createGui()`. Changes in the GUI trigger `updateShape`.
4.  A simple `rotateGroup` animation is tied to ThreeJS's `scene.onBeforeRender`.
5.  The `updateShape` function is central to interactivity:
    *   It disposes of previous ThreeJS `Group` objects by traversing and removing them from the scene to clear old geometry.
    *   It then calls `createShape` again with the potentially modified `model` parameters. The `createShape` function itself is responsible for managing the cleanup of intermediate OCCT shapes using the `shapesToClean` array.

## 3. Essential Helper Functions (`src/helpers/`)

We'll focus on the provided `create-gui.ts` and `create-shape.ts`. For `init-threejs.ts` and `init-kernels.ts`, their roles are analogous to those described in the "Advanced Parametric Model (ThreeJS)" tutorial (setting up the ThreeJS environment and initializing Bitbybit kernels, respectively).

### Creating the GUI (`create-gui.ts`)

This file uses `lil-gui` to build the user interface for controlling the Hex House parameters.

<CodeBlock language="typescript" title="src/helpers/create-gui.ts">
{`import GUI from 'lil-gui';
import type { Current, Model } from '../models';
import type { Mesh, MeshPhongMaterial } from 'three'; // ThreeJS types

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
        if (current.groups && current.groups.length > 0) {
            // The first group contains the primary colored meshes of faces
            const mainGroupContents = current.groups[0]?.children[0]?.children as Mesh[];
            if (mainGroupContents) {
            mainGroupContents.forEach(childMesh => {
                if (childMesh.material && (childMesh.material as MeshPhongMaterial).color) {
                (childMesh.material as MeshPhongMaterial).color.setHex(parseInt(hexColor.replace('#', '0x')));
                }
            });
            }
            // If ground color should also change, handle it separately:
            // if (current.ground && (current.ground.material as MeshPhongMaterial).color) {
            //   (current.ground.material as MeshPhongMaterial).color.setHex(parseInt(hexColor.replace('#', '0x')));
            // }
        }
    });

    // Download buttons
    gui.add(model, 'downloadSTL').name('Download STL');
    gui.add(model, 'downloadStep').name('Download STEP');
    gui.add(model, 'downloadGLB').name('Download GLTF');
};`}
</CodeBlock>

**`create-gui.ts` functionality:**
*   Initializes a `lil-gui` panel.
*   Adds controls (sliders for `uHex`, `vHex`; checkboxes for `drawEdges`, `drawFaces`; a color picker for `color`).
*   Each control's `onFinishChange` (for sliders/checkboxes) or `onChange` (for the color picker) callback:
    1.  Updates the corresponding property in the `model` object.
    2.  Calls the `updateShape` function (passed from `main.ts`) to trigger a regeneration of the geometry.
*   For color changes, it iterates through the meshes assumed to be part of the main shell (in `current.groups[0]`) and updates their `MeshPhongMaterial` color using ThreeJS's `material.color.setHex()`.
*   Adds buttons to trigger download functions (defined in `main.ts` and `helpers/downloads.ts`).

### Generating the Hex House Geometry (`create-shape.ts`)

This is the heart of the parametric model, where complex CAD operations using Bitbybit's OCCT API define the "Hex House" structure.

<CodeBlock language="typescript" title="src/helpers/create-shape.ts (with comments)">
{`import type { BitByBitBase } from '@bitbybit-dev/threejs';
import { Inputs } from '@bitbybit-dev/threejs';
import { Color, MeshPhongMaterial, Scene, Group } from 'three';
import type { Current, Model } from '../models';

// Main function to create the entire Hex House shape
export const createShape = async (
    bitbybit: BitByBitBase | undefined,
    scene: Scene | undefined,
    model: Model, // Contains parameters from the GUI (uHex, vHex, color, etc.)
    shapesToClean: Inputs.OCCT.TopoDSShapePointer[], // Array to manage OCCT memory
    current: Current // Stores references to current ThreeJS objects (groups)
) => {
    if (scene && bitbybit) {
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
        // Lofting creates a surface by skinning through a series of profile curves.
        const loftOptions = new Inputs.OCCT.LoftAdvancedDto<Inputs.OCCT.TopoDSWirePointer>();
        loftOptions.shapes = [ // Order of wires is important for lofting
        midCrv, secondCrv, firstCrv, groundCrv, groundMid,
        groundCrvMir, firstCrvMir, secondCrvMir, midCrv, // Close the loop
        ];
        loftOptions.straight = true; // Use straight sections between profiles
        const loft = await operations.loftAdvanced(loftOptions);
        shapesToClean.push(loft);

        // 4. Extract Specific Faces from the Lofted Surface
        // The loft operation results in a shell made of multiple faces.
        // We extract the "roof" and "wall" faces for further processing.
        const faceRoof = await face.getFace({ shape: loft, index: 0 }); // Index might vary
        const faceWall = await face.getFace({ shape: loft, index: 1 }); // Index might vary
        shapesToClean.push(faceRoof, faceWall);

        // 5. Generate Hexagonal Patterns on Roof and Walls using helper functions
        // These functions encapsulate the complex logic of subdividing faces and creating hex structures.
        const roofHexCompounds = await createHexagonsRoof(faceRoof, model.uHex, model.vHex, bitbybit);
        shapesToClean.push(...roofHexCompounds); // Add all returned OCCT shapes

        const wallHexShape = await createHexagonsWalls(faceWall, model.uHex, Math.ceil(model.vHex / 2), bitbybit);
        shapesToClean.push(wallHexShape);

        // Extrude the wall pattern to give it thickness
        const wallExtrude = await operations.extrude({ shape: wallHexShape, direction: [0, 0, -0.2] });
        shapesToClean.push(wallExtrude);

        // 6. Mirror Roof and Wall Components for Symmetry
        const mirroredRoofPromises = roofHexCompounds.map((r) => {
        mirrorOptions.shape = r; // Reuse mirrorOptions, just update the shape
        return transforms.mirrorAlongNormal(mirrorOptions);
        });
        const mirroredRoofCompounds = await Promise.all(mirroredRoofPromises);
        shapesToClean.push(...mirroredRoofCompounds);

        mirrorOptions.shape = wallExtrude;
        const mirroredWall = await transforms.mirrorAlongNormal(mirrorOptions);
        shapesToClean.push(mirroredWall);

        // 7. Combine All OCCT Parts into a Final Compound Shape (for STEP export primarily)
        const allPartsForFinalCompound = [
        ...roofHexCompounds, ...mirroredRoofCompounds,
        wallExtrude, mirroredWall,
        ];
        const finalOcctShape = await shapes.compound.makeCompound({ shapes: allPartsForFinalCompound });
        shapesToClean.push(finalOcctShape);

        // Create sub-compounds for applying different materials/grouping in ThreeJS
        // This helps in applying different colors or managing parts of the model.
        const compRoof1 = await shapes.compound.makeCompound({ shapes: [roofHexCompounds[0], mirroredRoofCompounds[0], wallExtrude, mirroredWall] });
        const compRoof2 = await shapes.compound.makeCompound({ shapes: [roofHexCompounds[1], mirroredRoofCompounds[1]] });
        const compRoof3 = await shapes.compound.makeCompound({ shapes: [roofHexCompounds[2], mirroredRoofCompounds[2]] });
        shapesToClean.push(compRoof1, compRoof2, compRoof3); // Also track these for cleanup

        // 8. Drawing the OCCT Shapes into ThreeJS Scene
        const drawOptions = new Inputs.Draw.DrawOcctShapeOptions();
        drawOptions.precision = 0.19; // Tessellation precision for converting OCCT to mesh
        drawOptions.drawEdges = model.drawEdges;
        drawOptions.drawFaces = model.drawFaces;
        drawOptions.edgeColour = '#000000';

        // Material for the first group of roof/wall elements
        const mat1 = new MeshPhongMaterial({ color: new Color(model.color) });
        if(model.drawEdges) { // Offset to prevent z-fighting between faces and edges
            mat1.polygonOffset = true;
            mat1.polygonOffsetFactor = 1;
        }
        mat1.side = 2; // THREE.DoubleSide, render both sides of faces
        drawOptions.faceMaterial = mat1;
        const groupMesh1 = await bitbybit.draw.drawAnyAsync({ entity: compRoof1, options: drawOptions });

        // Material for the second group (can be different)
        const mat2 = new MeshPhongMaterial({ color: new Color(0x0000ff) }); // Example: Blue
        if(model.drawEdges) { mat2.polygonOffset = true; mat2.polygonOffsetFactor = 1; }
        mat2.side = 2;
        drawOptions.faceMaterial = mat2;
        const groupMesh2 = await bitbybit.draw.drawAnyAsync({ entity: compRoof2, options: drawOptions });

        // Material for the third group
        const mat3 = new MeshPhongMaterial({ color: new Color(0x3300ff) }); // Example: Darker Blue
        if(model.drawEdges) { mat3.polygonOffset = true; mat3.polygonOffsetFactor = 1; }
        mat3.side = 2;
        drawOptions.faceMaterial = mat3;
        const groupMesh3 = await bitbybit.draw.drawAnyAsync({ entity: compRoof3, options: drawOptions });

        // Store references to the ThreeJS groups for rotation and disposal
        current.groups = [groupMesh1, groupMesh2, groupMesh3];

        // Apply shadow casting/receiving to all children meshes within the groups
        current.groups.forEach((group) => {
        group.children[0].children.forEach((child) => { // Assuming structure from drawAnyAsync
            child.castShadow = true;
            child.receiveShadow = true;
        });
        });

        return finalOcctShape; // Return the main OCCT compound
    }
    return undefined; // Fallback
};

// Helper function to create hexagonal patterns for the walls
async function createHexagonsWalls(
    faceToSubdivide: Inputs.OCCT.TopoDSFacePointer,
    nrHexagonsU: number,
    nrHexagonsV: number,
    bitbybit: BitByBitBase
): Promise<Inputs.OCCT.TopoDSShapePointer> { // Return type for clarity
    const { shapes } = bitbybit.occt;
    const { face } = shapes;

    const hexSubdivisionOptions = new Inputs.OCCT.FaceSubdivideToHexagonHolesDto<Inputs.OCCT.TopoDSFacePointer>();
    hexSubdivisionOptions.shape = faceToSubdivide;
    hexSubdivisionOptions.nrHexagonsU = nrHexagonsU;
    hexSubdivisionOptions.nrHexagonsV = nrHexagonsV;
    // Patterns define how hexagons scale along U and V directions of the face
    hexSubdivisionOptions.scalePatternU = [0.8, 0.5, 0.5, 0.3];
    hexSubdivisionOptions.scalePatternV = [0.8, 0.5, 0.5, 0.3];
    hexSubdivisionOptions.offsetFromBorderV = 0.1; // Keep hexagons away from V borders
    hexSubdivisionOptions.flatU = false;
    hexSubdivisionOptions.inclusionPattern = [true, true, true, false]; // Which hexagons in a repeating pattern to keep
    
    // This directly creates a face with hexagonal holes
    const subdividedFaces = await face.subdivideToHexagonHoles(hexSubdivisionOptions);
    return subdividedFaces[0]; // Assuming it returns an array of faces, take the first
}

// Helper function to create hexagonal panels for the roof
async function createHexagonsRoof(
    faceToSubdivide: Inputs.OCCT.TopoDSFacePointer,
    nrHexagonsU: number,
    nrHexagonsV: number,
    bitbybit: BitByBitBase
): Promise<Inputs.OCCT.TopoDSShapePointer[]> { // Returns array of OCCT compounds
    const { shapes, operations } = bitbybit.occt;
    const { face, wire } = shapes;

    // First, create outer hexagonal wires on the face
    const hexWiresOptionsOuter = new Inputs.OCCT.FaceSubdivideToHexagonWiresDto<Inputs.OCCT.TopoDSFacePointer>();
    hexWiresOptionsOuter.shape = faceToSubdivide;
    hexWiresOptionsOuter.nrHexagonsU = nrHexagonsU;
    hexWiresOptionsOuter.nrHexagonsV = nrHexagonsV;
    hexWiresOptionsOuter.scalePatternU = [0.8, 0.5, 0.1, 0.1, 0.1]; // Varying scales
    hexWiresOptionsOuter.scalePatternV = [0.8, 0.5, 0.1, 0.1, 0.1];
    hexWiresOptionsOuter.flatU = false;
    hexWiresOptionsOuter.inclusionPattern = [true, true, true, false];
    const outerHexWires = await face.subdivideToHexagonWires(hexWiresOptionsOuter);

    // Second, create inner hexagonal wires (for scaled versions)
    const hexWiresOptionsInner = new Inputs.OCCT.FaceSubdivideToHexagonWiresDto<Inputs.OCCT.TopoDSFacePointer>();
    hexWiresOptionsInner.shape = faceToSubdivide;
    hexWiresOptionsInner.flatU = false;
    hexWiresOptionsInner.nrHexagonsU = nrHexagonsU;
    hexWiresOptionsInner.nrHexagonsV = nrHexagonsV;
    hexWiresOptionsInner.inclusionPattern = [true, true, true, false]; // Same inclusion

    const innerHexWiresRaw = await face.subdivideToHexagonWires(hexWiresOptionsInner); // This might be sub2 in original
    const innerHexWiresReversed = await Promise.all(outerHexWires.map((s) => wire.reversedWire({ shape: s }))); // This might be revSub in original

    // Create faces between pairs of inner and outer wires to form panels
    const panelFacePromises = innerHexWiresReversed.map((reversedInnerWire, index) => {
        const outerWire = innerHexWiresRaw[index]; // Assuming innerHexWiresRaw is sub2
        return face.createFaceFromWires({ shapes: [outerWire, reversedInnerWire], planar: false });
    });
    const panelFaces = await Promise.all(panelFacePromises);

    // Give thickness to these panel faces based on a height pattern
    const heightPattern = [0.11, 0.1, 0.1];
    let heightPatternIndex = 0;

    const groupPromises: [
        Promise<Inputs.OCCT.TopoDSShapePointer>[],
        Promise<Inputs.OCCT.TopoDSShapePointer>[],
        Promise<Inputs.OCCT.TopoDSShapePointer>[]
    ] = [[], [], []];


    panelFaces.forEach((panelFace) => {
        const currentHeight = heightPattern[heightPatternIndex];
        // Cycle through the height pattern
        heightPatternIndex = (heightPatternIndex + 1) % heightPattern.length;
        
        const thickSolidPromise = operations.makeThickSolidSimple({
        shape: panelFace,
        offset: currentHeight, // Apply thickness
        });

        // Distribute into groups based on height pattern index for different materials/compounds
        if (heightPatternIndex === 0) groupPromises[0].push(thickSolidPromise);
        else if (heightPatternIndex === 1) groupPromises[1].push(thickSolidPromise);
        else groupPromises[2].push(thickSolidPromise);
    });

    const [thickSolidsGroup1, thickSolidsGroup2, thickSolidsGroup3] = await Promise.all([
        Promise.all(groupPromises[0]),
        Promise.all(groupPromises[1]),
        Promise.all(groupPromises[2]),
    ]);

    // Combine solids in each group into a single compound for easier management/drawing
    const compound1 = await shapes.compound.makeCompound({ shapes: thickSolidsGroup1 });
    const compound2 = await shapes.compound.makeCompound({ shapes: thickSolidsGroup2 });
    const compound3 = await shapes.compound.makeCompound({ shapes: thickSolidsGroup3 });

    return [compound1, compound2, compound3]; // Return array of compounds
}`}
</CodeBlock>

**Dissecting `create-shape.ts`:**

*   **OCCT Memory Management:** Starts by calling `bitbybit.occt.deleteShapes()` to clear geometry from previous updates, using the `shapesToClean` array. This array is then reset. This step is vital for preventing memory leaks with OCCT.
*   **Defining Base Curves (`sd`):** Several arrays of 3D points (`sd.groundCrv`, `sd.firstCrv`, etc.) are defined. These points act as control points for generating smooth NURBS curves.
*   **Creating Guide Wires:** Bitbybit's `shapes.wire.interpolatePoints()` is used to create OCCT wire shapes (curves) from these point arrays. Some wires are mirrored using `transforms.mirrorAlongNormal()` to achieve symmetry in the design. All created OCCT wires are added to `shapesToClean`.
*   **Lofting the Main Shell:** The core form of the Hex House is created by "lofting" a surface through the series of guide wires using `operations.loftAdvanced()`. This operation skins a surface between the profile curves. The resulting lofted shell is added to `shapesToClean`.
*   **Extracting Faces:** Specific faces, like those for the roof and walls, are extracted from the lofted shell using `face.getFace()`. These individual faces become the base for applying the hexagonal patterns and are also tracked for cleanup.
*   **Generating Hexagonal Patterns:**
    *   **`createHexagonsWalls(face, uHex, vHex, bitbybit)`:** This asynchronous helper function takes an OCCT face and subdivides it into a pattern of hexagonal *holes* using `face.subdivideToHexagonHoles()`. This OCCT function is powerful for creating perforated surfaces directly. The resulting perforated face is then given thickness by `operations.extrude()`.
    *   **`createHexagonsRoof(face, uHex, vHex, bitbybit)`:** This helper is more complex. It subdivides the roof face into hexagonal *wires* using `face.subdivideToHexagonWires()`. It generates two sets of these wires (likely an inner and outer boundary for each hexagonal cell). Then, for each pair of wires, it creates an OCCT face using `face.createFaceFromWires()`. Finally, these individual hexagonal faces are extruded into thin solids using `operations.makeThickSolidSimple()`, with varying heights based on a `heightPattern` to create an undulating roof texture. These solids are then grouped into three separate OCCT compounds.
*   **Mirroring and Compounding:** The generated roof compounds and the extruded wall shape are mirrored. All these components are then combined into a single `finalOcctShape` using `shapes.compound.makeCompound()`. This `finalOcctShape` is primarily useful for CAD-native exports like STEP. For rendering with different materials, sub-compounds (`compRoof1`, `compRoof2`, `compRoof3`) are also created from specific parts. All these compounds are added to `shapesToClean`.
*   **Drawing to ThreeJS Scene:**
    *   `Inputs.Draw.DrawOcctShapeOptions` are configured to control how OCCT shapes are tessellated into meshes (e.g., `precision`) and how they appear (e.g., `drawEdges`, `edgeColour`).
    *   ThreeJS `MeshPhongMaterial` instances are created, with their `color` set from `model.color` (or other predefined colors). Properties like `polygonOffset` are used if edges are drawn to prevent z-fighting. `side = 2` (THREE.DoubleSide) ensures faces are visible from both sides.
    *   `bitbybit.draw.drawAnyAsync()` is called for each OCCT sub-compound (e.g., `compRoof1`). This function, specific to the `@bitbybit-dev/threejs` integration, handles the conversion of OCCT geometry into ThreeJS `BufferGeometry` and creates `THREE.Mesh` objects with the specified material.
    *   The resulting ThreeJS `Group` objects (which `drawAnyAsync` returns) are stored in `current.groups`. This array is used in `main.ts` for rotation and for disposing of the ThreeJS objects when the model updates.
    *   Shadow properties (`castShadow`, `receiveShadow`) are enabled on the child meshes within these groups.
*   **Return Value:** The function returns the `finalOcctShape` (the main OCCT compound).

## 4. Styles (`style.css`)

The CSS (`style.css`) provides basic page styling, positions the logo, and includes styles for the loading spinner animation.

<CodeBlock language="css" title="style.css">
{`body {
    margin: 0px;
    overflow: hidden;
}
#three-canvas { /* Targets the canvas ID */
    /* Styles to make canvas fill screen or desired area */
}
a.logo { /* Styles for the logo link */ }
.lds-ellipsis { /* Styles for spinner */ }
/* ... other spinner keyframes ... */
`}
</CodeBlock>

## Conclusion

This Hex House tutorial demonstrates how to combine the parametric power of Bitbybit's OCCT integration with the rendering capabilities of ThreeJS to create complex and interactive 3D architectural concepts. Key takeaways include:

*   **Modular Design:** Structuring the application into `main.ts` for orchestration and helper files for specific tasks (ThreeJS setup, GUI, shape creation, downloads).
*   **Parametric CAD with OCCT:** Utilizing advanced OCCT operations like interpolation, lofting, face subdivision (to holes or wires), extrusion, and compounding through Bitbybit's API.
*   **OCCT Memory Management:** The critical importance of tracking intermediate OCCT shapes in `shapesToClean` and using `bitbybit.occt.deleteShapes()` to prevent memory leaks.
*   **Dynamic Updates:** Efficiently updating the ThreeJS scene by disposing of old ThreeJS groups and redrawing new ones based on GUI-driven parameter changes.
*   **ThreeJS Integration:** Using `bitbybit.draw.drawAnyAsync()` to convert OCCT geometry into ThreeJS meshes and applying ThreeJS materials.

This example serves as a blueprint for developing sophisticated web-based 3D applications where detailed geometric control and user interactivity are paramount.