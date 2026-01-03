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
    cameraOptions.distanceSensitivity = 0.3;
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

    // --- 4. Create Drawing Examples (Lines, Points, Curves, etc.) ---
    await createDrawingExamples(bitbybit);
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

// --- 7. Drawing Examples Function ---
async function createDrawingExamples(bitbybit: BitByBitBase) {
    console.log("Creating drawing examples...");

    // Example 1: Draw a single point
    const point = [60, 0, 0] as Inputs.Base.Point3;
    const pointDrawOptions = new Inputs.Draw.DrawBasicGeometryOptions();
    pointDrawOptions.colours = "#ffff00"; // Yellow
    pointDrawOptions.size = 2;
    await bitbybit.draw.drawAnyAsync({
        entity: point,
        options: pointDrawOptions,
    });
    console.log("Single point drawn.");

    // Example 2: Draw multiple points
    const points = [
        [60, 5, 0],
        [60, 10, 0],
        [60, 15, 0],
        [60, 20, 0],
    ] as Inputs.Base.Point3[];
    const pointsDrawOptions = new Inputs.Draw.DrawBasicGeometryOptions();
    pointsDrawOptions.colours = ["#ff00ff", "#ff00ff", "#ff00ff", "#ff00ff"]; // Magenta
    pointsDrawOptions.size = 1.5;
    await bitbybit.draw.drawAnyAsync({
        entity: points,
        options: pointsDrawOptions,
    });
    console.log("Multiple points drawn.");

    // Example 3: Draw a single polyline
    const polyline = {
        points: [
            [70, -10, 0],
            [70, 0, 10],
            [80, 0, 10],
            [80, -10, 0],
        ],
    } as Inputs.Base.Polyline3;
    const polylineDrawOptions = new Inputs.Draw.DrawBasicGeometryOptions();
    polylineDrawOptions.colours = "#00ffff"; // Cyan
    polylineDrawOptions.size = 3;
    await bitbybit.draw.drawAnyAsync({
        entity: polyline,
        options: polylineDrawOptions,
    });
    console.log("Polyline drawn.");

    // Example 4: Draw multiple polylines with different colors
    const polylines = [
        {
            points: [
                [90, -10, 0],
                [90, 0, 0],
                [100, 0, 0],
            ],
        },
        {
            points: [
                [90, -10, 5],
                [90, 0, 5],
                [100, 0, 5],
            ],
        },
        {
            points: [
                [90, -10, 10],
                [90, 0, 10],
                [100, 0, 10],
            ],
        },
    ];
    const polylinesDrawOptions = new Inputs.Draw.DrawBasicGeometryOptions();
    polylinesDrawOptions.colours = ["#ff0000", "#00ff00", "#0000ff"]; // RGB
    polylinesDrawOptions.size = 2;
    await bitbybit.draw.drawAnyAsync({
        entity: polylines as Inputs.Base.Polyline3[],
        options: polylinesDrawOptions,
    });
    console.log("Multiple polylines drawn.");

    // Example 5: Draw line segments (polylines with 2 points each)
    const segments = [
        {
            points: [
                [60, -20, 0],
                [70, -20, 0],
            ],
        },
        {
            points: [
                [65, -25, 0],
                [65, -15, 0],
            ],
        },
        {
            points: [
                [60, -20, -5],
                [70, -20, 5],
            ],
        },
    ];
    const segmentsDrawOptions = new Inputs.Draw.DrawBasicGeometryOptions();
    segmentsDrawOptions.colours = ["#ffff00", "#ff00ff", "#00ffff"]; // Yellow, Magenta, Cyan
    segmentsDrawOptions.size = 2.5;
    await bitbybit.draw.drawAnyAsync({
        entity: segments as Inputs.Base.Polyline3[],
        options: segmentsDrawOptions,
    });
    console.log("Line segments drawn.");

    // Example 6: Draw a Verb NURBS curve
    // Create a simple NURBS curve through control points
    const controlPoints = [
        [-60, -10, 0],
        [-50, 0, 5],
        [-40, -5, 10],
        [-30, 10, 5],
        [-20, 0, 0],
    ] as Inputs.Base.Point3[];
    
    // Create a NURBS curve (degree 3)
    const curve = bitbybit.verb.curve.createCurveByPoints({
        points: controlPoints,
        degree: 3,
    });
    
    const curveDrawOptions = new Inputs.Draw.DrawBasicGeometryOptions();
    curveDrawOptions.colours = "#ff8800"; // Orange
    curveDrawOptions.size = 3;
    await bitbybit.draw.drawAnyAsync({
        entity: curve,
        options: curveDrawOptions,
    });
    console.log("Verb curve drawn.");

    // Example 7: Draw a Verb NURBS surface by lofting curves
    // Create curves that will be lofted to form a surface
    const curve1Points = [
        [-60, 20, -5],
        [-50, 20, 0],
        [-40, 20, -5],
    ] as Inputs.Base.Point3[];
    
    const curve2Points = [
        [-60, 30, 0],
        [-50, 30, 5],
        [-40, 30, 0],
    ] as Inputs.Base.Point3[];
    
    const curve3Points = [
        [-60, 40, -5],
        [-50, 40, 0],
        [-40, 40, -5],
    ] as Inputs.Base.Point3[];
    
    // Create the curves
    const curve1 = bitbybit.verb.curve.createCurveByPoints({
        points: curve1Points,
        degree: 2,
    });
    
    const curve2 = bitbybit.verb.curve.createCurveByPoints({
        points: curve2Points,
        degree: 2,
    });
    
    const curve3 = bitbybit.verb.curve.createCurveByPoints({
        points: curve3Points,
        degree: 2,
    });
    
    // Loft the curves to create a surface
    const surface = bitbybit.verb.surface.createSurfaceByLoftingCurves({
        curves: [curve3, curve2, curve1],
        degreeV: 2,
    });
    
    const surfaceDrawOptions = new Inputs.Draw.DrawBasicGeometryOptions();
    surfaceDrawOptions.colours = "#8800ff"; // Purple
    surfaceDrawOptions.opacity = 0.8;
    await bitbybit.draw.drawAnyAsync({
        entity: surface,
        options: surfaceDrawOptions,
    });
    console.log("Verb surface drawn.");

    console.log("All drawing examples completed.");
}
