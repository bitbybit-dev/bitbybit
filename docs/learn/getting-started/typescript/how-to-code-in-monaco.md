---
sidebar_position: 2
title: How To Code In Monaco?
sidebar_label: How To Code In Monaco?
description: Learn about our use of Monaco editor for TypeScript, understand the global context and how you should code in it.
tags: [getting-started, typescript]
---

import BitByBitRenderCanvas from '@site/src/components/BitByBitRenderCanvas'; 

## [The Monaco Editor: Your Interactive Coding Canvas](https://bitbybit.dev/app?editor=typescript)

The Monaco Editor, developed by Microsoft, is the powerful open-source code editor that powers VS Code. In the context of `bitbybit`, it provides a rich, browser-based environment for you to write TypeScript code and interact directly with the `bitbybit` API. This allows for rapid prototyping, learning, and development of 3D models and geometric algorithms.

**Key Features Leveraged by `bitbybit`:**

*   **IntelliSense and Autocompletion:** As you type, Monaco offers smart suggestions for `bitbybit` functions, modules, and the `Bit` type definitions. This significantly speeds up development and reduces the likelihood of typos or incorrect API usage.
*   **Error Checking:** Real-time syntax highlighting and type checking (thanks to TypeScript integration) help you catch mistakes early in the development process, directly in the editor.
*   **Familiar Interface:** If you've used VS Code or other modern code editors, Monaco's interface will feel intuitive and user-friendly.
*   **Direct Execution:** Code written in the Monaco editor within the `bitbybit` platform can be executed immediately, allowing you to see the results of your geometric operations or visualizations, fostering an interactive and iterative workflow.

Within this Monaco environment, `bitbybit` exposes two crucial global elements that are fundamental to its usage: the `bitbybit` constant and the `Bit` type namespace. Understanding these is key to effectively using the platform.

## The `bitbybit` Global Constant: Your Gateway to CAD/CAM Algorithms

The `bitbybit` global constant is the heart of the platform. It's a comprehensive JavaScript object that provides access to **all** `bitbybit` functionalities, which are neatly organized into modules and submodules. Think of it as your extensive toolkit for computational design, 3D modeling, and Computer-Aided Manufacturing (CAM) preparations.

**Structure and Usage:**

All functionalities within `bitbybit` are exposed as functions. Each function is designed to perform a specific operation—such as creating a 3D shape, performing a boolean operation between shapes, applying a fillet, or exporting a model. Crucially, each function typically expects a single JavaScript object as its argument. This object, often referred to as an `input` or a `DTO` (Data Transfer Object), contains all the parameters and data required for the function to perform its task.

The `bitbybit` constant is structured hierarchically, making it easy to navigate and find the functions you need. For example:

*   `bitbybit.occt.*`: This namespace groups functions related to OpenCASCADE Technology (OCCT), a powerful open-source CAD kernel.
    *   `bitbybit.occt.shapes.solid.*`: Functions for creating solid 3D shapes like cubes, spheres, cylinders, etc.
    *   `bitbybit.occt.booleans.*`: Functions for performing boolean operations (union, difference, intersection) on shapes.
    *   `bitbybit.occt.fillets.*`: Functions for creating fillets (rounded edges) and chamfers on shapes.
    *   `bitbybit.occt.io.*`: Functions for importing and exporting CAD file formats like STEP and STL.
*   `bitbybit.babylon.*`: This namespace groups functions related to BabylonJS, a real-time 3D engine used by `bitbybit` for visualization.
    *   `bitbybit.babylon.scene.*`: Functions for managing elements of the 3D scene, such as lights, cameras, and background settings.
*   `bitbybit.draw.*`: This namespace contains versatile functions for drawing various entities (OCCT shapes, lines, points, etc.) as BabylonJS meshes in the 3D viewer.

**Example: Accessing `bitbybit` functionalities**

You can call functions directly:
`bitbybit.occt.shapes.solid.createCube(cubeInputDto);`

For cleaner and more concise code, especially when using multiple functions from the same module, you can use destructuring assignment:

```typescript title="destructuring"
// Destructure specific modules or functions for easier access
const { solid } = bitbybit.occt.shapes; // Now you can use: solid.createCube()
const { booleans, fillets, io } = bitbybit.occt; // Access: booleans.difference(), fillets.filletEdges(), io.saveShapeSTEP()
const { draw } = bitbybit; // Access: draw.drawAnyAsync()
const { scene } = bitbybit.babylon; // Access: scene.drawDirectionalLight()
```

## The `Bit` Global Type Namespace: Ensuring Type Safety and Clarity

Alongside the `bitbybit` constant, the Monaco environment provides a global `Bit` namespace. This namespace is indispensable for TypeScript users because it contains all the type definitions for the input objects (`DTOs`) that `bitbybit` functions expect, as well as for the shapes and other entities manipulated by the API.

**Purpose of `Bit`:**

*   **Type Safety:** By using types from the `Bit.Inputs` namespace (e.g., `Bit.Inputs.OCCT.CubeDto`), you instruct the TypeScript compiler (and thus Monaco's IntelliSense) on the expected structure and data types of your input objects. This helps prevent runtime errors by catching type mismatches during development.
*   **Enhanced Autocompletion:** The Monaco editor leverages these type definitions to provide highly accurate autocompletion for the properties of your input objects. As you type `yourInputObject.`, Monaco will suggest available properties (e.g., `size`, `radius`, `center`), making it easier to discover and use the correct parameters.
*   **Code Clarity and Maintainability:** Explicitly typing your inputs and variables makes your code more readable, understandable, and easier to maintain or refactor in the future.

**Structure and Usage:**

The most frequently used part of the `Bit` namespace is `Bit.Inputs`. This sub-namespace generally mirrors the structure of the `bitbybit` constant, providing type definitions (often as classes that you can instantiate) for each function's input `DTO`.

*   `Bit.Inputs.OCCT.<ShapeName>Dto`: Types for OCCT shape creation and operation inputs (e.g., `Bit.Inputs.OCCT.CubeDto`, `Bit.Inputs.OCCT.SphereDto`, `Bit.Inputs.OCCT.DifferenceDto`).
*   `Bit.Inputs.OCCT.TopoDSShapePointer`: A common type alias representing an OCCT shape. Many OCCT functions will return or expect shapes of this type.
*   `Bit.Inputs.Draw.<DrawingOptionName>`: Types for configuring drawing options (e.g., `Bit.Inputs.Draw.DrawOcctShapeOptions`).
*   `Bit.Inputs.BabylonScene.<SceneElementName>Dto`: Types for BabylonJS scene elements (e.g., `Bit.Inputs.BabylonScene.DirectionalLightDto`).

### Example: Using `Bit` types

```typescript
// Optionally, define type aliases for frequently used complex types like OCCT shapes
type TopoDSShapePointer = Bit.Inputs.OCCT.TopoDSShapePointer;

// Import DTO classes for creating input objects.
// These are typically classes that you instantiate using 'new'.
const { CubeDto, SphereDto, FilletDto, DifferenceDto, SaveStepDto, SaveStlDto } = Bit.Inputs.OCCT;

// Some specific DTOs or options classes might be directly accessible from their module path within Bit.Inputs
const DrawOcctShapeOptions = Bit.Inputs.Draw.DrawOcctShapeOptions; // Assuming DrawOcctShapeOptions is a class
const DirectionalLightDto = Bit.Inputs.BabylonScene.DirectionalLightDto; // Assuming DirectionalLightDto is a class

// How to use them:
const myCubeOptions = new CubeDto();
myCubeOptions.size = 10;
// myCubeOptions. // IntelliSense will now suggest 'size', 'center', etc.

const drawingSettings = new DrawOcctShapeOptions();
drawingSettings.faceColour = "#FF0000"; // Red
// drawingSettings. // IntelliSense will suggest 'faceColour', 'edgeColour', 'edgeWidth', etc.
```

## BabylonJS Context

Inside the Monaco editor for TypeScript that you can use on our website, we already have an initialized BabylonJS context with the scene, engine, arc rotate camera and single hemispheric light. This context is optimized for scripting and does not require you to set all of those initialization functions. You can start coding right away.

If you need to access this context, `bitbybit.babylon` will be your friend - you can use `bitbybit.babylon.scene.getScene()` to access the BabylonJS Scene object for example.

## Coding with `bitbybit`: A Practical Example

In the `bitbybit` Monaco editor, your script will typically be wrapped in an `async` function, often named `start`. This is because many `bitbybit` operations (especially complex geometric calculations, file I/O, or operations that might take some time) are asynchronous. Using the `async`/`await` syntax allows you to write asynchronous code that looks and behaves a bit more like synchronous code, making it easier to read and manage.

Let's walk through a comprehensive example demonstrating common `bitbybit` operations:

```typescript
// Step 1: (Optional but Recommended) Destructure for convenience
// This makes your code less verbose and easier to read.
const { solid } = bitbybit.occt.shapes;
const { booleans, fillets, io } = bitbybit.occt; // Added 'io' for export functions
const { draw } = bitbybit;
const { scene } = bitbybit.babylon;

// Step 2: Import type definitions for input objects and shapes
// This enables type checking and autocompletion.
type TopoDSShapePointer = Bit.Inputs.OCCT.TopoDSShapePointer; // Represents an OCCT shape

const { CubeDto, SphereDto, FilletDto, DifferenceDto, SaveStepDto, SaveStlDto } = Bit.Inputs.OCCT;
const DrawOcctShapeOptions = Bit.Inputs.Draw.DrawOcctShapeOptions;
const DirectionalLightDto = Bit.Inputs.BabylonScene.DirectionalLightDto;

// Step 3: Define your main logic within an async function
const start = async () => {
    // Step 3a: Create input objects (DTOs) and set their properties for a cube
    const cubeOptions = new CubeDto(); // Instantiate the DTO
    cubeOptions.size = 6;              // Set the cube's size
    // Call the bitbybit function to create the cube, awaiting its promise
    const cube: TopoDSShapePointer = await solid.createCube(cubeOptions);

    // Step 3b: Create input objects (DTOs) for a sphere
    const sphereOptions = new SphereDto();
    sphereOptions.radius = 3;
    sphereOptions.center = [3, 3, -3]; // Define center as [x, y, z] coordinates
    const sphere: TopoDSShapePointer = await solid.createSphere(sphereOptions);

    // Step 4: Perform geometric operations
    // Example: Boolean difference (subtract sphere from cube)
    const diffOptions = new DifferenceDto<TopoDSShapePointer>(); // Generic type for the shapes involved
    diffOptions.shape = cube;        // The base shape
    diffOptions.shapes = [sphere];   // An array of shapes to subtract
    const diff: TopoDSShapePointer = await booleans.difference(diffOptions);

    // Example: Apply fillets (round edges) to the result of the difference
    const roundingOptions = new FilletDto<TopoDSShapePointer>();
    roundingOptions.shape = diff;    // The shape to fillet
    roundingOptions.radius = 1;      // The radius of the fillet
    // Note: Some operations might have specific methods like 'filletEdges' for common tasks
    const solidRoundedCorners: TopoDSShapePointer = await fillets.filletEdges(roundingOptions);

    // Step 5: Visualize the result in the 3D viewer
    // Prepare drawing options to customize appearance
    const occtDrawOptions = new DrawOcctShapeOptions();
    occtDrawOptions.faceColour = "#0000ff"; // Blue faces
    occtDrawOptions.edgeColour = "#ff00ff"; // Magenta edges
    occtDrawOptions.edgeWidth = 5;          // Width of the edges
    occtDrawOptions.precision = 0.001;     // Rendering precision for complex shapes (lower is finer)
    // Draw the final shape. 'drawAnyAsync' is a versatile function for drawing various entity types.
    draw.drawAnyAsync({ entity: solidRoundedCorners, options: occtDrawOptions });

    // Step 6: (Optional) Adjust scene elements like lighting for better visualization
    const dirLight = new DirectionalLightDto();
    dirLight.shadowGeneratorMapSize = 2000; // Higher values for better shadow quality
    dirLight.intensity = 3;                 // Light intensity
    scene.drawDirectionalLight(dirLight);   // Adds or updates a directional light in the scene

    // Step 7: (Optional) Export your model to common CAD file formats
    // Export as STEP file (a common format for solid models)
    const stepExportOptions = new SaveStepDto<TopoDSShapePointer>();
    stepExportOptions.shape = solidRoundedCorners;
    stepExportOptions.adjustYtoZ = true; // Optional: Adjusts coordinate system (Y-up to Z-up) if needed
    stepExportOptions.fileName = "cube_with_sphere_cutout.step";
    stepExportOptions.tryDownload = true; // Attempts to trigger a browser download of the file
    await io.saveShapeSTEP(stepExportOptions); // Use the destructured 'io'

    // Export as STL file (a common format for 3D printing)
    const stlExportOptions = new SaveStlDto<TopoDSShapePointer>();
    stlExportOptions.shape = solidRoundedCorners;
    stlExportOptions.adjustYtoZ = true;
    stlExportOptions.fileName = "cube_with_sphere_cutout.stl";
    stlExportOptions.precision = 0.001;   // Affects STL mesh quality (smaller values for finer mesh)
    stlExportOptions.tryDownload = true;
    await io.saveShapeStl(stlExportOptions); // Use the destructured 'io'
};

// Step 8: Call the start function to execute your script
start();
```

## Experience Live Example in Monaco Editor Here

<BitByBitRenderCanvas
  requireManualStart={true}
  script={{"script":"// Step 1: (Optional but Recommended) Destructure for convenience\n// This makes your code less verbose and easier to read.\nconst { solid } = bitbybit.occt.shapes;\nconst { booleans, fillets, io } = bitbybit.occt; // Added 'io' for export functions\nconst { draw } = bitbybit;\nconst { scene } = bitbybit.babylon;\n\n// Step 2: Import type definitions for input objects and shapes\n// This enables type checking and autocompletion.\ntype TopoDSShapePointer = Bit.Inputs.OCCT.TopoDSShapePointer; // Represents an OCCT shape\n\nconst { CubeDto, SphereDto, FilletDto, DifferenceDto, SaveStepDto, SaveStlDto } = Bit.Inputs.OCCT;\nconst DrawOcctShapeOptions = Bit.Inputs.Draw.DrawOcctShapeOptions;\nconst DirectionalLightDto = Bit.Inputs.BabylonScene.DirectionalLightDto;\n\n// Step 3: Define your main logic within an async function\nconst start = async () => {\n    // Step 3a: Create input objects (DTOs) and set their properties for a cube\n    const cubeOptions = new CubeDto(); // Instantiate the DTO\n    cubeOptions.size = 6;              // Set the cube's size\n    // Call the bitbybit function to create the cube, awaiting its promise\n    const cube: TopoDSShapePointer = await solid.createCube(cubeOptions);\n\n    // Step 3b: Create input objects (DTOs) for a sphere\n    const sphereOptions = new SphereDto();\n    sphereOptions.radius = 3;\n    sphereOptions.center = [3, 3, -3]; // Define center as [x, y, z] coordinates\n    const sphere: TopoDSShapePointer = await solid.createSphere(sphereOptions);\n\n    // Step 4: Perform geometric operations\n    // Example: Boolean difference (subtract sphere from cube)\n    const diffOptions = new DifferenceDto<TopoDSShapePointer>(); // Generic type for the shapes involved\n    diffOptions.shape = cube;        // The base shape\n    diffOptions.shapes = [sphere];   // An array of shapes to subtract\n    const diff: TopoDSShapePointer = await booleans.difference(diffOptions);\n\n    // Example: Apply fillets (round edges) to the result of the difference\n    const roundingOptions = new FilletDto<TopoDSShapePointer>();\n    roundingOptions.shape = diff;    // The shape to fillet\n    roundingOptions.radius = 1;      // The radius of the fillet\n    // Note: Some operations might have specific methods like 'filletEdges' for common tasks\n    const solidRoundedCorners: TopoDSShapePointer = await fillets.filletEdges(roundingOptions);\n\n    // Step 5: Visualize the result in the 3D viewer\n    // Prepare drawing options to customize appearance\n    const occtDrawOptions = new DrawOcctShapeOptions();\n    occtDrawOptions.faceColour = \"#0000ff\"; // Blue faces\n    occtDrawOptions.edgeColour = \"#ff00ff\"; // Magenta edges\n    occtDrawOptions.edgeWidth = 5;          // Width of the edges\n    occtDrawOptions.precision = 0.001;     // Rendering precision for complex shapes (lower is finer)\n    // Draw the final shape. 'drawAnyAsync' is a versatile function for drawing various entity types.\n    draw.drawAnyAsync({ entity: solidRoundedCorners, options: occtDrawOptions });\n\n    // Step 6: (Optional) Adjust scene elements like lighting for better visualization\n    const dirLight = new DirectionalLightDto();\n    dirLight.shadowGeneratorMapSize = 2000; // Higher values for better shadow quality\n    dirLight.intensity = 3;                 // Light intensity\n    scene.drawDirectionalLight(dirLight);   // Adds or updates a directional light in the scene\n\n    // Step 7: (Optional) Export your model to common CAD file formats\n    // Export as STEP file (a common format for solid models)\n    const stepExportOptions = new SaveStepDto<TopoDSShapePointer>();\n    stepExportOptions.shape = solidRoundedCorners;\n    stepExportOptions.adjustYtoZ = true; // Optional: Adjusts coordinate system (Y-up to Z-up) if needed\n    stepExportOptions.fileName = \"cube_with_sphere_cutout.step\";\n    stepExportOptions.tryDownload = true; // Attempts to trigger a browser download of the file\n    await io.saveShapeSTEP(stepExportOptions); // Use the destructured 'io'\n\n    // Export as STL file (a common format for 3D printing)\n    const stlExportOptions = new SaveStlDto<TopoDSShapePointer>();\n    stlExportOptions.shape = solidRoundedCorners;\n    stlExportOptions.adjustYtoZ = true;\n    stlExportOptions.fileName = \"cube_with_sphere_cutout.stl\";\n    stlExportOptions.precision = 0.001;   // Affects STL mesh quality (smaller values for finer mesh)\n    stlExportOptions.tryDownload = true;\n    await io.saveShapeStl(stlExportOptions); // Use the destructured 'io'\n};\n\n// Step 8: Call the start function to execute your script\nstart();","version":"0.20.7","type":"typescript"}}
  title="Create And Download STEP & STL 3D Models"
  description="Contains example code that can be executed directly inside the editor by clicking Run button."
/>

## Key Points from the Example:

*   **Asynchronous Operations:** Notice the widespread use of `await`. Most `bitbybit` functions that perform significant computations or I/O return `Promises`. `await` pauses the execution of the `start` function until the `Promise` resolves, making asynchronous operations easier to manage.
*   **DTOs for Inputs:** Each `bitbybit` function takes a single `DTO` object as its argument. You first create an instance of the appropriate `DTO` class (e.g., `new CubeDto()`) and then set its properties to configure the operation.
*   **Type Annotations:** Using TypeScript types like `TopoDSShapePointer` for variables holding shapes, and relying on type inference for `DTOs` (e.g., `const cubeOptions = new CubeDto();`), enhances code robustness and leverages Monaco's IntelliSense.
*   **Modularity and Clarity:** The `bitbybit` API is organized into logical modules (e.g., `solid` for shape creation, `booleans` for set operations, `fillets` for edge modifications, `draw` for visualization, `io` for export). Destructuring these modules makes the code cleaner.
*   **Chaining Operations:** The output of one operation (e.g., `diff` from `booleans.difference`) can be used as input for subsequent operations (e.g., `fillets.filletEdges(roundingOptions)` where `roundingOptions.shape` is `diff`).

## Conclusion

The Monaco editor, when combined with the globally available `bitbybit` constant and the `Bit` type definitions, creates a potent and highly accessible environment for scripting 3D models and automating CAD/CAM workflows directly within your browser. By grasping these core components—Monaco as the interactive editor, `bitbybit` as the functional toolkit, and `Bit` as the type-safe guide—you are well-equipped to explore and harness the full capabilities of the `bitbybit` platform. Happy coding!