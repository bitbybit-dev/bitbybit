import "./style.css"; // Basic styling
import { BitByBitBase, Inputs } from "@bitbybit-dev/babylonjs";
import { OccStateEnum } from "@bitbybit-dev/occt-worker";
import { JscadStateEnum } from "@bitbybit-dev/jscad-worker";
import { ManifoldStateEnum } from "@bitbybit-dev/manifold-worker";

import {
  Engine,
  Scene,
  ArcRotateCamera,
  Vector3,
  HemisphericLight,
  Color4,
} from "@babylonjs/core";
import { first, firstValueFrom, tap } from "rxjs";

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
    await createOCCTGeometry(bitbybit, "#ff0000"); // Red
  }
  if (kernelOptions.enableManifold) {
    await createManifoldGeometry(bitbybit, "#00ff00"); // Green
  }
  if (kernelOptions.enableJSCAD) {
    await createJSCADGeometry(bitbybit, "#0000ff"); // Blue
  }

  // Start the Babylon.js render loop
  engine.runRenderLoop(() => {
    if (scene.activeCamera) {
      // Ensure camera is ready
      scene.render();
    }
  });
}

// --- 4. Babylon.js Scene Initialization ---
function initBabylonJS() {
  const canvas = document.getElementById("babylon-canvas") as HTMLCanvasElement;
  const engine = new Engine(canvas, true, {
    preserveDrawingBuffer: true,
    stencil: true,
  });
  const scene = new Scene(engine);
  scene.metadata = { shadowGenerators: [] }; // Important for Bitbybit till we have better implementation...
  scene.clearColor = new Color4(0.1, 0.11, 0.12, 1); // Set background color

  const camera = new ArcRotateCamera(
    "camera",
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

  const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
  light.intensity = 0.7;

  const onWindowResize = () => {
    engine.resize();
  };
  window.addEventListener("resize", onWindowResize, false);

  return { scene, engine, camera };
}

// --- 5. Bitbybit Kernel Initialization Logic ---
async function initWithKernels(
  scene: Scene,
  bitbybit: BitByBitBase,
  options: KernelOptions
): Promise<{ message: string }> {
  let occtWorkerInstance: Worker | undefined;
  let jscadWorkerInstance: Worker | undefined;
  let manifoldWorkerInstance: Worker | undefined;

  // 1. Conditionally create worker instances
  if (options.enableOCCT) {
    occtWorkerInstance = new Worker(
      new URL("./workers/occt.worker.ts", import.meta.url),
      { name: "OCC_WORKER", type: "module" }
    );
  }
  if (options.enableJSCAD) {
    jscadWorkerInstance = new Worker(
      new URL("./workers/jscad.worker.ts", import.meta.url),
      { name: "JSCAD_WORKER", type: "module" }
    );
  }
  if (options.enableManifold) {
    manifoldWorkerInstance = new Worker(
      new URL("./workers/manifold.worker.ts", import.meta.url),
      { name: "MANIFOLD_WORKER", type: "module" }
    );
  }

  // 2. Initialize Bitbybit
  await bitbybit.init(
    scene,
    occtWorkerInstance,
    jscadWorkerInstance,
    manifoldWorkerInstance
  );

  // 3. Collect promises for kernel initializations
  const initializationPromises: Promise<void>[] = [];
  let anyKernelSelectedForInit = false;

  if (options.enableOCCT) {
    anyKernelSelectedForInit = true;
    if (bitbybit.occtWorkerManager) {
      initializationPromises.push(
        firstValueFrom(
          bitbybit.occtWorkerManager.occWorkerState$.pipe(
            first((s) => s.state === OccStateEnum.initialised),
            tap(() => console.log("OCCT Initialized"))
          )
        ).then(() => {}) // Ensure the promise resolves to void for Promise.all
      );
    } else {
      console.warn(
        "OCCT enabled in options, but occtWorkerManager not found after init."
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
            tap(() => console.log("JSCAD Initialized"))
          )
        ).then(() => {})
      );
    } else {
      console.warn(
        "JSCAD enabled in options, but jscadWorkerManager not found after init."
      );
    }
  }

  if (options.enableManifold) {
    anyKernelSelectedForInit = true;
    if (bitbybit.manifoldWorkerManager) {
      initializationPromises.push(
        firstValueFrom(
          bitbybit.manifoldWorkerManager.manifoldWorkerState$.pipe(
            first((s) => s.state === ManifoldStateEnum.initialised),
            tap(() => console.log("Manifold Initialized"))
          )
        ).then(() => {})
      );
    } else {
      console.warn(
        "Manifold enabled in options, but manifoldWorkerManager not found after init."
      );
    }
  }

  // 4. Wait for selected & available kernels or handle no selection/availability
  if (!anyKernelSelectedForInit) {
    console.log("No kernels selected for initialization.");
    return { message: "No kernels selected for initialization." };
  }

  if (initializationPromises.length === 0) {
    // Kernels were selected, but none were awaitable (e.g., managers missing for all selected)
    console.log(
      "Kernels were selected, but none had managers available for awaiting initialization."
    );
    return {
      message: "Selected kernels were not awaitable for initialization state.",
    };
  }

  await Promise.all(initializationPromises);
  console.log("Selected and awaitable kernels initialized:", options);
  return {
    message: "Selected and awaitable kernels initialized successfully.",
  };
}

// --- 6. Geometry Creation Functions (Examples) ---
// These functions are largely the same as the Three.js version,
// as Bitbybit's core geometry API is engine-agnostic.
// The drawing options might differ slightly if very specific engine features are used,
// but for basic drawing, drawAnyAsync handles it.

async function createOCCTGeometry(bitbybit: BitByBitBase, color: string) {
  console.log("Creating OCCT geometry...");
  const cubeOptions = new Inputs.OCCT.CubeDto();
  cubeOptions.size = 25;
  cubeOptions.center = [0, 0, 0];

  const cube = await bitbybit.occt.shapes.solid.createCube(cubeOptions);

  const filletOptions =
    new Inputs.OCCT.FilletDto<Inputs.OCCT.TopoDSShapePointer>();
  filletOptions.shape = cube;
  filletOptions.radius = 4;
  const roundedCube = await bitbybit.occt.fillets.filletEdges(filletOptions);

  const drawOptions = new Inputs.Draw.DrawOcctShapeOptions();
  drawOptions.faceColour = color; // Bitbybit handles color conversion
  drawOptions.edgeWidth = 10;
  await bitbybit.draw.drawAnyAsync({
    entity: roundedCube,
    options: drawOptions,
  });
  console.log("OCCT geometry created and drawn.");
}

async function createManifoldGeometry(bitbybit: BitByBitBase, color: string) {
  console.log("Creating Manifold geometry...");
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

  const translationOptions =
    new Inputs.Manifold.TranslateDto<Inputs.Manifold.ManifoldPointer>();
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
  console.log("Manifold geometry created and drawn.");
}

async function createJSCADGeometry(bitbybit: BitByBitBase, color: string) {
  console.log("Creating JSCAD geometry...");
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
  console.log("JSCAD geometry created and drawn.");
}
