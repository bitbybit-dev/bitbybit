import "./style.css"; // Basic styling
import { BitByBitBase, Inputs } from "@bitbybit-dev/threejs";
import { OccStateEnum } from "@bitbybit-dev/occt-worker";
import { JscadStateEnum } from "@bitbybit-dev/jscad-worker";
import { ManifoldStateEnum } from "@bitbybit-dev/manifold-worker";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import {
  Color,
  HemisphereLight,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from "three";
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
    await createOCCTGeometry(bitbybit, "#ff0000"); // Red
  }
  if (kernelOptions.enableManifold) {
    await createManifoldGeometry(bitbybit, "#00ff00"); // Green
  }
  if (kernelOptions.enableJSCAD) {
    await createJSCADGeometry(bitbybit, "#0000ff"); // Blue
  }
}

// --- 4. Three.js Scene Initialization ---
function initThreeJS() {
  const domNode = document.getElementById("three-canvas") as HTMLCanvasElement;

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
  camera.lookAt(0, 0, 0);

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
  window.addEventListener("resize", onWindowResize, false);

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
  drawOptions.faceColour = color;
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
  console.log("JSCAD geometry created and drawn.");
}
