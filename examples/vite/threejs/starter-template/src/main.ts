import "./style.css"; // Basic styling
import { BitByBitBase, Inputs, initBitbybit, type InitBitbybitOptions, type OrbitCameraController } from "@bitbybit-dev/threejs";
import {
    Color,
    HemisphereLight,
    Scene,
    WebGLRenderer,
} from "three";

// Store the orbit camera controller globally so bitbybit can access it
let orbitCameraController: OrbitCameraController | null = null;

// --- 1. Main Application Entry Point ---
start();

async function start() {
    // Initialize basic Three.js scene
    const { scene, renderer } = initThreeJS();

    // Create an instance of BitByBitBase for Three.js
    const bitbybit = new BitByBitBase();

    // --- 2. Configure and Initialize BitByBit ---
    // Single options object for both workers and kernels
    const options: InitBitbybitOptions = {
        enableOCCT: true,
        enableJSCAD: true,
        enableManifold: true,
        // loadFonts: ["roboto"], // Optional: specify fonts to load, or omit to skip font loading
    };

    // Initialize BitByBit in a single call - workers are created from CDN automatically!
    await initBitbybit(scene, bitbybit, options);

    // --- 2.5. Setup BitByBit Orbit Camera ---
    // Setup orbit camera controls using bitbybit library
    const cameraOptions = new Inputs.ThreeJSCamera.OrbitCameraDto();
    cameraOptions.distance = 120;
    cameraOptions.pitch = 25;
    cameraOptions.yaw = 45;
    cameraOptions.frameOnStart = false;
    cameraOptions.inertiaFactor = 0.1;
    cameraOptions.distanceSensitivity = 0.15;
    cameraOptions.domElement = renderer.domElement;
    orbitCameraController = bitbybit.three.camera.orbitCamera.create(cameraOptions);

    // Update the render loop to use the new camera
    const animate = () => {
        if (orbitCameraController) {
            orbitCameraController.update(0.016); // ~60fps delta time
            renderer.render(scene, orbitCameraController.camera);
        }
    };
    renderer.setAnimationLoop(animate);

    // --- 3. Create Geometry with Active Kernels ---
    if (options.enableOCCT) {
        await createOCCTGeometry(bitbybit, "#ff0000"); // Red
    }
    if (options.enableManifold) {
        await createManifoldGeometry(bitbybit, "#00ff00"); // Green
    }
    if (options.enableJSCAD) {
        await createJSCADGeometry(bitbybit, "#0000ff"); // Blue
    }

    // --- 4. Create Drawing Examples (Lines, Points, Curves, etc.) ---
    await createDrawingExamples(bitbybit);

    // --- 5. Create Textured OCCT Cube Example ---
    if (options.enableOCCT) {
        await createTexturedOCCTCube(bitbybit);
    }
}

// --- 4. Three.js Scene Initialization ---
function initThreeJS() {
    const domNode = document.getElementById("three-canvas") as HTMLCanvasElement;

    const scene = new Scene();
    scene.background = new Color(0x1a1c1f); // Set background color

    const light = new HemisphereLight(0xffffff, 0x444444, 2); // Adjusted intensity
    scene.add(light);

    const renderer = new WebGLRenderer({ antialias: true, canvas: domNode });
    renderer.setSize(window.innerWidth, window.innerHeight);
    // Set pixel ratio for sharper rendering (similar to BabylonJS hardware scaling level)
    // Higher values = sharper but more GPU intensive. Use 1 for performance, devicePixelRatio for quality.
    renderer.setPixelRatio(window.devicePixelRatio);

    const onWindowResize = () => {
        if (orbitCameraController) {
            orbitCameraController.camera.aspect = window.innerWidth / window.innerHeight;
            orbitCameraController.camera.updateProjectionMatrix();
        }
        renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onWindowResize, false);

    return { scene, renderer }; // Return renderer for camera setup
}

// // --- 5. Bitbybit Kernel Initialization Logic ---
// async function initWithKernels(
//     scene: Scene,
//     bitbybit: BitByBitBase,
//     options: KernelOptions
// ): Promise<{ message: string; initializedKernels: string[] }> {
//     let occtWorkerInstance: Worker | undefined;
//     let jscadWorkerInstance: Worker | undefined;
//     let manifoldWorkerInstance: Worker | undefined;

//     // 1. Conditionally create worker instances
//     if (options.enableOCCT) {
//         occtWorkerInstance = new Worker(
//             new URL("./workers/occt.worker.ts", import.meta.url),
//             { name: "OCC_WORKER", type: "module" }
//         );
//     }
//     if (options.enableJSCAD) {
//         jscadWorkerInstance = new Worker(
//             new URL("./workers/jscad.worker.ts", import.meta.url),
//             { name: "JSCAD_WORKER", type: "module" }
//         );
//     }
//     if (options.enableManifold) {
//         manifoldWorkerInstance = new Worker(
//             new URL("./workers/manifold.worker.ts", import.meta.url),
//             { name: "MANIFOLD_WORKER", type: "module" }
//         );
//     }

//     // 2. Initialize Bitbybit
//     await bitbybit.init(
//         scene,
//         occtWorkerInstance,
//         jscadWorkerInstance,
//         manifoldWorkerInstance
//     );

//     // 3. Collect promises for kernel initializations
//     const initializationPromises: Promise<string>[] = [];
//     let anyKernelSelectedForInit = false;

//     if (options.enableOCCT) {
//         anyKernelSelectedForInit = true;
//         if (bitbybit.occtWorkerManager) {
//             initializationPromises.push(
//                 firstValueFrom(
//                     bitbybit.occtWorkerManager.occWorkerState$.pipe(
//                         first((s) => s.state === OccStateEnum.initialised),
//                         map(() => "OCCT")
//                     )
//                 )
//             );
//         } else {
//             console.warn(
//                 "OCCT enabled in options, but occtWorkerManager not found after init."
//             );
//         }
//     }

//     if (options.enableJSCAD) {
//         anyKernelSelectedForInit = true;
//         if (bitbybit.jscadWorkerManager) {
//             initializationPromises.push(
//                 firstValueFrom(
//                     bitbybit.jscadWorkerManager.jscadWorkerState$.pipe(
//                         first((s) => s.state === JscadStateEnum.initialised),
//                         map(() => "JSCAD")
//                     )
//                 )
//             );
//         } else {
//             console.warn(
//                 "JSCAD enabled in options, but jscadWorkerManager not found after init."
//             );
//         }
//     }

//     if (options.enableManifold) {
//         anyKernelSelectedForInit = true;
//         if (bitbybit.manifoldWorkerManager && bitbybit.manifoldWorkerManager.manifoldWorkerState$) {
//             initializationPromises.push(
//                 firstValueFrom(
//                     bitbybit.manifoldWorkerManager.manifoldWorkerState$.pipe(
//                         first((s) => s.state === ManifoldStateEnum.initialised),
//                         map(() => "Manifold")
//                     )
//                 )
//             );
//         } else {
//             console.warn(
//                 "Manifold enabled in options, but manifoldWorkerManager not found after init."
//             );
//         }
//     }

//     // 4. Wait for selected & available kernels or handle no selection/availability
//     if (!anyKernelSelectedForInit) {
//         console.log("No kernels selected for initialization.");
//         return { message: "No kernels selected for initialization.", initializedKernels: [] };
//     }

//     if (initializationPromises.length === 0) {
//         // Kernels were selected, but none were awaitable (e.g., managers missing for all selected)
//         console.log(
//             "Kernels were selected, but none had managers available for awaiting initialization."
//         );
//         return {
//             message: "Selected kernels were not awaitable for initialization state.",
//             initializedKernels: [],
//         };
//     }

//     const initializedKernels = await Promise.all(initializationPromises);
//     console.log("Kernels initialized:", initializedKernels.join(", "));
//     return {
//         message: `Successfully initialized: ${initializedKernels.join(", ")}`,
//         initializedKernels,
//     };
// }

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

async function createTexturedOCCTCube(bitbybit: BitByBitBase) {
    console.log("Creating textured OCCT cube...");

    // Create texture from URL
    const textureOptions = new Inputs.Draw.GenericTextureDto();
    textureOptions.url = "https://cdn.polyhaven.com/asset_img/primary/worn_asphalt.png?height=760&quality=95";
    textureOptions.uScale = 0.05;
    textureOptions.vScale = 0.05;
    const texture = await bitbybit.draw.createTexture(textureOptions);

    // Create material with texture
    const materialOptions = new Inputs.Draw.GenericPBRMaterialDto();
    materialOptions.baseColorTexture = texture;
    materialOptions.baseColor = "#ffffff"; // White to show texture colors accurately
    const material = await bitbybit.draw.createPBRMaterial(materialOptions);

    // Create OCCT cube
    const cubeOptions = new Inputs.OCCT.CubeDto();
    cubeOptions.size = 20;
    cubeOptions.center = [-50, 0, -50];
    const cube = await bitbybit.occt.shapes.solid.createCube(cubeOptions);

    // Draw cube with material
    const drawOptions = new Inputs.Draw.DrawOcctShapeOptions();
    drawOptions.faceMaterial = material;
    drawOptions.backFaceOpacity = 1;
    await bitbybit.draw.drawAnyAsync({
        entity: cube,
        options: drawOptions,
    });

    console.log("Textured OCCT cube created and drawn.");
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
        [60, 25, 0],
        [60, 30, 0],
        [60, 35, 0],
    ] as Inputs.Base.Point3[];
    const pointsDrawOptions = new Inputs.Draw.DrawBasicGeometryOptions();
    pointsDrawOptions.colours = ["#ff00ff", "#ff0000", "#00ff00", "#0000ff"]; // Magenta
    pointsDrawOptions.size = 1.5;
    pointsDrawOptions.colorMapStrategy = Inputs.Base.colorMapStrategyEnum.repeatColors;
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
    polylineDrawOptions.colours = ["#00ffff"]; // Cyan
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

    const segments = [
        [
            [60, -20, 0],
            [70, -20, 0],
        ],
        [
            [65, -25, 0],
            [65, -15, 0],
        ],
        [
            [60, -20, -5],
            [70, -20, 5],
        ],
    ] as Inputs.Base.Segment3[];
    const segmentsDrawOptions = new Inputs.Draw.DrawBasicGeometryOptions();
    segmentsDrawOptions.colours = ["#ffff00", "#ff00ff", "#00ffff"]; // Yellow, Magenta, Cyan
    segmentsDrawOptions.size = 2.5;
    await bitbybit.draw.drawAnyAsync({
        entity: segments,
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

    // Example 8: Draw a 30x30x30 grid of points with alternating blue and white colors
    // This tests GPU instancing performance with 27,000 points
    console.log("Creating 30x30x30 point grid (27,000 points)...");
    const gridSize = 30;
    const spacing = 1.5;
    const gridOffset = [-150, 0, 0]; // Move grid away from other geometry

    const gridPoints: Inputs.Base.Point3[] = [];
    const gridColors: string[] = [];

    for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
            for (let z = 0; z < gridSize; z++) {
                gridPoints.push([
                    gridOffset[0] + x * spacing,
                    gridOffset[1] + y * spacing,
                    gridOffset[2] + z * spacing
                ]);
                // Alternating blue and white based on checkerboard pattern
                const isBlue = (x + y + z) % 2 === 0;
                gridColors.push(isBlue ? "#0066ff" : "#ffffff");
            }
        }
    }

    const gridDrawOptions = new Inputs.Draw.DrawBasicGeometryOptions();
    gridDrawOptions.colours = gridColors;
    gridDrawOptions.size = 0.4;
    gridDrawOptions.colorMapStrategy = Inputs.Base.colorMapStrategyEnum.lastColorRemainder;

    console.time("Draw 27,000 points");
    await bitbybit.draw.drawAnyAsync({
        entity: gridPoints,
        options: gridDrawOptions,
    });
    console.timeEnd("Draw 27,000 points");
    console.log("30x30x30 point grid drawn with GPU instancing.");

    // Example 9: Draw a 30x30x30 grid of polylines with alternating colors
    // Creates lines along X, Y, and Z axes forming a 3D grid
    console.log("Creating 30x30x30 polyline grid...");
    const polylineGridSize = 30;
    const polylineSpacing = 1.5;
    const polylineGridOffset = [-150, -60, 0]; // Position below the point grid

    const gridPolylines: Inputs.Base.Polyline3[] = [];
    const polylineColors: string[] = [];

    // Create lines along X axis (for each Y,Z position)
    for (let y = 0; y < polylineGridSize; y++) {
        for (let z = 0; z < polylineGridSize; z++) {
            const startX = polylineGridOffset[0];
            const endX = polylineGridOffset[0] + (polylineGridSize - 1) * polylineSpacing;
            const posY = polylineGridOffset[1] + y * polylineSpacing;
            const posZ = polylineGridOffset[2] + z * polylineSpacing;

            gridPolylines.push({
                points: [
                    [startX, posY, posZ],
                    [endX, posY, posZ]
                ]
            });
            // Alternating colors based on position
            const isOrange = (y + z) % 2 === 0;
            polylineColors.push(isOrange ? "#ff6600" : "#00ffcc");
        }
    }

    // Create lines along Y axis (for each X,Z position)
    for (let x = 0; x < polylineGridSize; x++) {
        for (let z = 0; z < polylineGridSize; z++) {
            const posX = polylineGridOffset[0] + x * polylineSpacing;
            const startY = polylineGridOffset[1];
            const endY = polylineGridOffset[1] + (polylineGridSize - 1) * polylineSpacing;
            const posZ = polylineGridOffset[2] + z * polylineSpacing;

            gridPolylines.push({
                points: [
                    [posX, startY, posZ],
                    [posX, endY, posZ]
                ]
            });
            const isPurple = (x + z) % 2 === 0;
            polylineColors.push(isPurple ? "#9933ff" : "#ffff00");
        }
    }

    // Create lines along Z axis (for each X,Y position)
    for (let x = 0; x < polylineGridSize; x++) {
        for (let y = 0; y < polylineGridSize; y++) {
            const posX = polylineGridOffset[0] + x * polylineSpacing;
            const posY = polylineGridOffset[1] + y * polylineSpacing;
            const startZ = polylineGridOffset[2];
            const endZ = polylineGridOffset[2] + (polylineGridSize - 1) * polylineSpacing;

            gridPolylines.push({
                points: [
                    [posX, posY, startZ],
                    [posX, posY, endZ]
                ]
            });
            const isPink = (x + y) % 2 === 0;
            polylineColors.push(isPink ? "#ff0099" : "#00ff66");
        }
    }

    const polylineGridDrawOptions = new Inputs.Draw.DrawBasicGeometryOptions();
    polylineGridDrawOptions.colours = polylineColors;
    polylineGridDrawOptions.size = 1;
    polylineGridDrawOptions.colorMapStrategy = Inputs.Base.colorMapStrategyEnum.lastColorRemainder;

    console.log(`Drawing ${gridPolylines.length} polylines...`);
    console.time("Draw polyline grid");
    await bitbybit.draw.drawAnyAsync({
        entity: gridPolylines,
        options: polylineGridDrawOptions,
    });
    console.timeEnd("Draw polyline grid");
    console.log("30x30x30 polyline grid drawn with per-polyline colors.");

    // --- Arrow Examples ---
    // Example: Draw a single polyline with an arrow at the end
    const arrowPolyline = {
        points: [
            [-80, 0, 0],
            [-80, 10, 5],
            [-70, 15, 10],
            [-60, 10, 5],
        ],
    } as Inputs.Base.Polyline3;
    const arrowPolylineOptions = new Inputs.Draw.DrawBasicGeometryOptions();
    arrowPolylineOptions.colours = "#00ff88"; // Green
    arrowPolylineOptions.size = 3;
    arrowPolylineOptions.arrowSize = 3; // Arrow size
    arrowPolylineOptions.arrowAngle = 25; // Arrow angle in degrees
    await bitbybit.draw.drawAnyAsync({
        entity: arrowPolyline,
        options: arrowPolylineOptions,
    });
    console.log("Polyline with arrow drawn.");

    // Example: Draw multiple polylines with arrows (different sizes)
    const arrowPolylines = [
        {
            points: [
                [-80, -30, 0],
                [-70, -25, 0],
                [-60, -30, 0],
            ],
        },
        {
            points: [
                [-80, -35, 0],
                [-70, -30, 0],
                [-60, -35, 0],
            ],
        },
        {
            points: [
                [-80, -40, 0],
                [-70, -35, 0],
                [-60, -40, 0],
            ],
        },
    ] as Inputs.Base.Polyline3[];
    const arrowPolylinesOptions = new Inputs.Draw.DrawBasicGeometryOptions();
    arrowPolylinesOptions.colours = ["#ff0000", "#00ff00", "#0000ff"]; // RGB
    arrowPolylinesOptions.size = 2;
    arrowPolylinesOptions.arrowSize = 2.5;
    arrowPolylinesOptions.arrowAngle = 30;
    await bitbybit.draw.drawAnyAsync({
        entity: arrowPolylines,
        options: arrowPolylinesOptions,
    });
    console.log("Multiple polylines with arrows drawn.");

    // Example: Draw OCCT wire with edge arrows to show orientation
    const wirePoints = [
        [-80, -60, 0],
        [-70, -55, 5],
        [-60, -60, 0],
        [-50, -65, -5],
    ] as Inputs.Base.Point3[];
    const wire = await bitbybit.occt.shapes.wire.createPolylineWire({
        points: wirePoints,
    });
    const wireDrawOptions = new Inputs.Draw.DrawOcctShapeOptions();
    wireDrawOptions.edgeColour = "#ff8800"; // Orange edges
    wireDrawOptions.edgeWidth = 3;
    wireDrawOptions.drawEdges = true;
    wireDrawOptions.drawFaces = false;
    wireDrawOptions.edgeArrowSize = 3; // Arrow size on edges
    wireDrawOptions.edgeArrowAngle = 25; // Arrow angle
    await bitbybit.draw.drawAnyAsync({
        entity: wire,
        options: wireDrawOptions,
    });
    console.log("OCCT wire with edge orientation arrows drawn.");

    console.log("All drawing examples completed.");
}
