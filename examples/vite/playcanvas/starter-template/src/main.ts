import "./style.css"; // Basic styling
import { BitByBitBase, Inputs } from "@bitbybit-dev/playcanvas";
import { OccStateEnum } from "@bitbybit-dev/occt-worker";
import { JscadStateEnum } from "@bitbybit-dev/jscad-worker";
import { ManifoldStateEnum } from "@bitbybit-dev/manifold-worker";

import { first, firstValueFrom, tap } from "rxjs";
import { Application, Color, Entity, FILLMODE_FILL_WINDOW, Mouse, RESOLUTION_AUTO, TouchDevice } from "playcanvas";

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
    cameraOptions.distanceSensitivity = 2;
    cameraOptions.focusEntity = camera;
    bitbybit.playcanvas.camera.orbitCamera.create(cameraOptions);

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

// --- 4. PlayCanvas Scene Initialization ---
function initPlayCanvas() {
    const canvas = document.getElementById("playcanvas-canvas") as HTMLCanvasElement;

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
    window.addEventListener("resize", () => app.resizeCanvas());

    // Create root scene entity
    const scene = new Entity("scene");
    app.root.addChild(scene);

    // Create camera entity
    const camera = new Entity("camera");
    camera.addComponent("camera", {
        clearColor: new Color(0x1a / 255, 0x1c / 255, 0x1f / 255, 1),
        fov: 70,
        nearClip: 0.1,
        farClip: 1000,
    });
    scene.addChild(camera);

    // Create directional light
    const light = new Entity("directionalLight");
    light.addComponent("light", {
        type: "directional",
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

    // 2. Initialize Bitbybit with PlayCanvas app and scene
    bitbybit.init(
        app,
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
                ).then(() => undefined)
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
                ).then(() => undefined)
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
                ).then(() => undefined)
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
    drawOptions.edgeWidth = 5;
    drawOptions.faceColour = color;
    drawOptions.drawVertices = true;
    drawOptions.vertexSize = 0.5;
    drawOptions.vertexColour = "#ffffff";
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
