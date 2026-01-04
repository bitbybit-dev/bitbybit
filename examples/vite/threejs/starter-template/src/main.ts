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

    // --- 4. Create Drawing Examples (Lines, Points, Curves, etc.) ---
    await createDrawingExamples(bitbybit);
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
    // Set pixel ratio for sharper rendering (similar to BabylonJS hardware scaling level)
    // Higher values = sharper but more GPU intensive. Use 1 for performance, devicePixelRatio for quality.
    renderer.setPixelRatio(window.devicePixelRatio);

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
                ).then(() => { }) // Ensure the promise resolves to void for Promise.all
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
                ).then(() => { })
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
                ).then(() => { })
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
