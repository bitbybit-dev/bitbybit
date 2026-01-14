import "./style.css";
import { BitByBitBase, Inputs, initBitByBit, initBabylonJS, type InitBitByBitOptions } from "@bitbybit-dev/babylonjs";

start();

async function start() {
   const babylonOptions = new Inputs.BabylonJSScene.InitBabylonJSDto();
    babylonOptions.canvasId = "babylon-canvas";
    babylonOptions.sceneSize = 200;
    babylonOptions.enableShadows = true;
    babylonOptions.enableGround = true;
    babylonOptions.groundColor = "#333333";
    babylonOptions.groundCenter = [0, -75, 0];

    const { scene, engine } = initBabylonJS(babylonOptions);
    const bitbybit = new BitByBitBase();
    const options: InitBitByBitOptions = {
        enableOCCT: true,
        enableJSCAD: true,
        enableManifold: true,
    };

    await initBitByBit(scene, bitbybit, options);

    if (options.enableOCCT) {
        await createOCCTGeometry(bitbybit, "#ff0000"); // Red
    }
    if (options.enableManifold) {
        await createManifoldGeometry(bitbybit, "#00ff00"); // Green
    }
    if (options.enableJSCAD) {
        await createJSCADGeometry(bitbybit, "#0000ff"); // Blue
    }

    await createDrawingExamples(bitbybit);

    if (options.enableOCCT) {
        await createTexturedOCCTCube(bitbybit);
    }

    engine.runRenderLoop(() => {
        if (scene.activeCamera) {
            scene.render();
        }
    });
}

async function createOCCTGeometry(bitbybit: BitByBitBase, color: string) {
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
    drawOptions.drawVertices = true;
    drawOptions.vertexSize = 0.5;
    drawOptions.vertexColour = "#ffffff";
    await bitbybit.draw.drawAnyAsync({
        entity: roundedCube,
        options: drawOptions,
    });
}

async function createManifoldGeometry(bitbybit: BitByBitBase, color: string) {
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
}

async function createJSCADGeometry(bitbybit: BitByBitBase, color: string) {
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
}

async function createTexturedOCCTCube(bitbybit: BitByBitBase) {
    const textureOptions = new Inputs.Draw.GenericTextureDto();
    textureOptions.url = "https://cdn.polyhaven.com/asset_img/primary/worn_asphalt.png?height=760&quality=95";
    textureOptions.uScale = 0.05;
    textureOptions.vScale = 0.05;
    const texture = await bitbybit.draw.createTexture(textureOptions);
    
    const materialOptions = new Inputs.Draw.GenericPBRMaterialDto();
    materialOptions.baseColorTexture = texture;
    materialOptions.baseColor = "#ffffff"; // White to show texture colors accurately
    const material = await bitbybit.draw.createPBRMaterial(materialOptions);
    
    const cubeOptions = new Inputs.OCCT.CubeDto();
    cubeOptions.size = 20;
    cubeOptions.center = [-50, 0, -50];
    const cube = await bitbybit.occt.shapes.solid.createCube(cubeOptions);
    
    const drawOptions = new Inputs.Draw.DrawOcctShapeOptions();
    drawOptions.faceMaterial = material;
    drawOptions.backFaceOpacity = 1;
    drawOptions.edgeWidth = 10;
    await bitbybit.draw.drawAnyAsync({
        entity: cube,
        options: drawOptions,
    });
}

async function createDrawingExamples(bitbybit: BitByBitBase) {
    const point = [60, 0, 0] as Inputs.Base.Point3;
    const pointDrawOptions = new Inputs.Draw.DrawBasicGeometryOptions();
    pointDrawOptions.colours = "#ffff00"; // Yellow
    pointDrawOptions.size = 2;
    await bitbybit.draw.drawAnyAsync({
        entity: point,
        options: pointDrawOptions,
    });
    console.log("Single point drawn.");
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
    polylineDrawOptions.size = 10;
    await bitbybit.draw.drawAnyAsync({
        entity: polyline,
        options: polylineDrawOptions,
    });

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
    polylinesDrawOptions.size = 10;
    await bitbybit.draw.drawAnyAsync({
        entity: polylines as Inputs.Base.Polyline3[],
        options: polylinesDrawOptions,
    });

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
    segmentsDrawOptions.size = 10;
    await bitbybit.draw.drawAnyAsync({
        entity: segments as Inputs.Base.Polyline3[],
        options: segmentsDrawOptions,
    });

    const controlPoints = [
        [-60, -10, 0],
        [-50, 0, 5],
        [-40, -5, 10],
        [-30, 10, 5],
        [-20, 0, 0],
    ] as Inputs.Base.Point3[];

    const curve = bitbybit.verb.curve.createCurveByPoints({
        points: controlPoints,
        degree: 3,
    });

    const curveDrawOptions = new Inputs.Draw.DrawBasicGeometryOptions();
    curveDrawOptions.colours = "#ff8800"; // Orange
    curveDrawOptions.size = 10;
    await bitbybit.draw.drawAnyAsync({
        entity: curve,
        options: curveDrawOptions,
    });

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

    const gridSize = 30;
    const spacing = 1.5;
    const gridOffset = [-150, 0, 0];
    
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

    const polylineGridSize = 30;
    const polylineSpacing = 1.5;
    const polylineGridOffset = [-150, -60, 0];
    
    const gridPolylines: Inputs.Base.Polyline3[] = [];
    const polylineColors: string[] = [];
    
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
            const isOrange = (y + z) % 2 === 0;
            polylineColors.push(isOrange ? "#ff6600" : "#00ffcc");
        }
    }
    
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
    polylineGridDrawOptions.size = 3;
    polylineGridDrawOptions.colorMapStrategy = Inputs.Base.colorMapStrategyEnum.lastColorRemainder;
    
    await bitbybit.draw.drawAnyAsync({
        entity: gridPolylines,
        options: polylineGridDrawOptions,
    });

    const arrowPolyline = {
        points: [
            [-80, 0, 0],
            [-80, 10, 5],
            [-70, 15, 10],
            [-60, 10, 5],
        ],
    } as Inputs.Base.Polyline3;
    const arrowPolylineOptions = new Inputs.Draw.DrawBasicGeometryOptions();
    arrowPolylineOptions.colours = "#00ff88";
    arrowPolylineOptions.size = 10;
    arrowPolylineOptions.arrowSize = 3;
    arrowPolylineOptions.arrowAngle = 25;
    await bitbybit.draw.drawAnyAsync({
        entity: arrowPolyline,
        options: arrowPolylineOptions,
    });

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
    arrowPolylinesOptions.size = 8;
    arrowPolylinesOptions.arrowSize = 2.5;
    arrowPolylinesOptions.arrowAngle = 30;
    await bitbybit.draw.drawAnyAsync({
        entity: arrowPolylines,
        options: arrowPolylinesOptions,
    });
    console.log("Multiple polylines with arrows drawn.");

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
    wireDrawOptions.edgeColour = "#ff8800";
    wireDrawOptions.edgeWidth = 10;
    wireDrawOptions.drawEdges = true;
    wireDrawOptions.drawFaces = false;
    wireDrawOptions.edgeArrowSize = 3;
    wireDrawOptions.edgeArrowAngle = 25;
    await bitbybit.draw.drawAnyAsync({
        entity: wire,
        options: wireDrawOptions,
    });
}
