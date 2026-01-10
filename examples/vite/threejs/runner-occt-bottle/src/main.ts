import "./style.css";
import * as THREEJS from "three";
import type {
    BitByBitRunner,
    RunOptionsInterface,
} from "./runner/runner-types";
import { initThreeJS } from "./helpers/init-threejs";
import * as lil from "lil-gui";
import { loadRunnerScript } from "./runner/load-runner-script";

loadRunnerScript().then(() => {
    start();
});

async function start() {
    const { scene, camera, renderer } = initThreeJS();

    const runnerOptions: RunOptionsInterface = {
        canvasZoneClass: "myCanvasZone",
        enableOCCT: true,
        enableJSCAD: false,
        enableManifold: false,
        cameraPosition: [10, 10, 10],
        cameraTarget: [0, 4, 0],
        externalThreeJSSettings: {
            scene,
            camera,
            renderer,
        },
        backgroundColor: "#1a1c1f",
        loadFonts: [],
    };

    const runner: BitByBitRunner = window.bitbybitRunner.getRunnerInstance();
    const { bitbybit, Bit } = await runner.run(
        runnerOptions
    );

    // type short names
    type Point3 = Bit.Inputs.Base.Point3;
    type Point2 = Bit.Inputs.Base.Point2;
    const dimensionEndTypeEnum = Bit.Inputs.OCCT.dimensionEndTypeEnum;

    // Model parameters
    const model = {
        width: 5,
        height: 8,
        thickness: 3,
        color: "#ff00ff",
    };

    // Store current shape for downloading
    let currentShape: Bit.Inputs.OCCT.TopoDSShapePointer | null = null;


    // Track current model group for cleanup
    let currentGroup: THREEJS.Group | null = null;
    let currentDimensionsGroup: THREEJS.Group | null = null;

    // Download STEP file
    async function downloadSTEP() {
        if (!currentShape) return;
        await bitbybit.occt.io.saveShapeSTEP({
            shape: currentShape,
            fileName: "bottle.step",
            adjustYtoZ: true,
            tryDownload: true,
        });
    }

    // Download STL file
    async function downloadSTL() {
        if (!currentShape) return;
        await bitbybit.occt.io.saveShapeStl({
            shape: currentShape,
            fileName: "bottle.stl",
            precision: 0.001,
            adjustYtoZ: true,
            tryDownload: true,
            binary: true,
        });
    }

    async function createBottle(
        width: number,
        height: number,
        thickness: number,
        color: string
    ) {
        // Clean up previous model
        if (currentGroup) {
            scene.remove(currentGroup);
            currentGroup = null;
        }
        if (currentDimensionsGroup) {
            scene.remove(currentDimensionsGroup);
            currentDimensionsGroup = null;
        }

        const aPnt1 = [-width / 2, 0, 0] as Point3;
        const aPnt2 = [-width / 2, 0, -thickness / 4] as Point3;
        const aPnt3 = [0, 0, -thickness / 2] as Point3;
        const aPnt4 = [width / 2, 0, -thickness / 4] as Point3;
        const aPnt5 = [width / 2, 0, 0] as Point3;

        const anArc = await bitbybit.occt.shapes.edge.arcThroughThreePoints({
            start: aPnt2,
            middle: aPnt3,
            end: aPnt4,
        });
        const edge1 = await bitbybit.occt.shapes.edge.line({
            start: aPnt1,
            end: aPnt2,
        });
        const edge2 = await bitbybit.occt.shapes.edge.line({
            start: aPnt4,
            end: aPnt5,
        });

        const firstHalfWire =
            await bitbybit.occt.shapes.wire.combineEdgesAndWiresIntoAWire({
                shapes: [edge1, anArc, edge2],
            });

        const direction = [1, 0, 0] as Point3;
        const origin = [0, 0, 0] as Point3;
        const secondHalfWire = await bitbybit.occt.transforms.mirror({
            direction,
            origin,
            shape: firstHalfWire,
        });

        const wire = await bitbybit.occt.shapes.wire.combineEdgesAndWiresIntoAWire({
            shapes: [firstHalfWire, secondHalfWire],
        });

        const aPrismVec = [0, height, 0] as Point3;
        const face = await bitbybit.occt.shapes.face.createFaceFromWire({
            shape: wire,
            planar: true,
        });
        const extruded = await bitbybit.occt.operations.extrude({
            shape: face,
            direction: aPrismVec,
        });
        const appliedFillets = await bitbybit.occt.fillets.filletEdges({
            shape: extruded,
            radius: thickness / 12,
        });

        const neckLocation = [0, height, 0] as Point3;
        const neckRadius = thickness / 4;
        const neckHeight = height / 10;
        const neckAxis = [0, 1, 0] as Point3;

        const neck = await bitbybit.occt.shapes.solid.createCylinder({
            radius: neckRadius,
            height: neckHeight,
            center: neckLocation,
            direction: neckAxis,
        });

        const unioned = await bitbybit.occt.booleans.union({
            shapes: [appliedFillets, neck],
            keepEdges: false,
        });

        const faceToRemove = await bitbybit.occt.shapes.face.getFace({
            shape: unioned,
            index: 27,
        });

        const thickOptions = new Bit.Inputs.OCCT.ThickSolidByJoinDto(
            unioned,
            [faceToRemove],
            -thickness / 50
        );
        const thick = await bitbybit.occt.operations.makeThickSolidByJoin(
            thickOptions
        );

        const geom = bitbybit.occt.geom;

        // Threading: Create Surfaces
        const aCyl1 = await geom.surfaces.cylindricalSurface({
            direction: neckAxis,
            radius: neckRadius * 0.99,
            center: neckLocation,
        });
        const aCyl2 = await geom.surfaces.cylindricalSurface({
            direction: neckAxis,
            radius: neckRadius * 1.05,
            center: neckLocation,
        });

        const aPnt = [2 * Math.PI, neckHeight / 2] as Point2;
        const aDir = [2 * Math.PI, neckHeight / 4] as Point2;
        const aMajor = 2 * Math.PI;
        const aMinor = neckHeight / 10;

        const anEllipse1 = await geom.curves.geom2dEllipse({
            center: aPnt,
            direction: aDir,
            radiusMinor: aMinor,
            radiusMajor: aMajor,
            sense: true,
        });
        const anEllipse2 = await geom.curves.geom2dEllipse({
            center: aPnt,
            direction: aDir,
            radiusMinor: aMinor / 4,
            radiusMajor: aMajor,
            sense: true,
        });

        const anArc1 = await geom.curves.geom2dTrimmedCurve({
            shape: anEllipse1,
            u1: 0,
            u2: Math.PI,
            sense: true,
            adjustPeriodic: true,
        });
        const anArc2 = await geom.curves.geom2dTrimmedCurve({
            shape: anEllipse2,
            u1: 0,
            u2: Math.PI,
            sense: true,
            adjustPeriodic: true,
        });

        const anEllipsePnt1 = await geom.curves.get2dPointFrom2dCurveOnParam({
            shape: anEllipse1,
            param: 0,
        });
        const anEllipsePnt2 = await geom.curves.get2dPointFrom2dCurveOnParam({
            shape: anEllipse1,
            param: Math.PI,
        });

        const aSegment = await geom.curves.geom2dSegment({
            start: anEllipsePnt1,
            end: anEllipsePnt2,
        });

        const anEdge1OnSurf1 =
            await bitbybit.occt.shapes.edge.makeEdgeFromGeom2dCurveAndSurface({
                curve: anArc1,
                surface: aCyl1,
            });
        const anEdge2OnSurf1 =
            await bitbybit.occt.shapes.edge.makeEdgeFromGeom2dCurveAndSurface({
                curve: aSegment,
                surface: aCyl1,
            });
        const anEdge1OnSurf2 =
            await bitbybit.occt.shapes.edge.makeEdgeFromGeom2dCurveAndSurface({
                curve: anArc2,
                surface: aCyl2,
            });
        const anEdge2OnSurf2 =
            await bitbybit.occt.shapes.edge.makeEdgeFromGeom2dCurveAndSurface({
                curve: aSegment,
                surface: aCyl2,
            });

        const threadingWire1 =
            await bitbybit.occt.shapes.wire.combineEdgesAndWiresIntoAWire({
                shapes: [anEdge1OnSurf1, anEdge2OnSurf1],
            });
        const threadingWire2 =
            await bitbybit.occt.shapes.wire.combineEdgesAndWiresIntoAWire({
                shapes: [anEdge1OnSurf2, anEdge2OnSurf2],
            });

        const loft = await bitbybit.occt.operations.loft({
            shapes: [threadingWire1, threadingWire2],
            makeSolid: true,
        });

        const union = await bitbybit.occt.booleans.union({
            shapes: [loft, thick],
            keepEdges: false,
        });

        // Store shape for downloading
        currentShape = union;

        // Create dimensions
        // Width dimension (bottom of bottle)
        const widthDimOpt = new Bit.Inputs.OCCT.SimpleLinearLengthDimensionDto();
        widthDimOpt.end = [-width / 2, 0, thickness / 2];
        widthDimOpt.start = [width / 2, 0, thickness / 2];
        widthDimOpt.direction = [0, 0, 1];
        widthDimOpt.offsetFromPoints = 0;
        widthDimOpt.labelSize = 0.3;
        widthDimOpt.labelSuffix = "cm";
        widthDimOpt.labelRotation = 180;
        widthDimOpt.endType = dimensionEndTypeEnum.arrow;
        widthDimOpt.arrowSize = 0.3;
        widthDimOpt.crossingSize = 0.2;
        widthDimOpt.decimalPlaces = 1;
        const widthDimension =
            await bitbybit.occt.dimensions.simpleLinearLengthDimension(widthDimOpt);

        // Height dimension (side of bottle)
        const totalHeight = height + neckHeight;
        const heightDimOpt = new Bit.Inputs.OCCT.SimpleLinearLengthDimensionDto();
        heightDimOpt.start = [-width / 2, 0, 0];
        heightDimOpt.end = [-width / 2, totalHeight, 0];
        heightDimOpt.direction = [-1, 0, 0];
        heightDimOpt.offsetFromPoints = 0;
        heightDimOpt.labelSize = 0.3;
        heightDimOpt.endType = dimensionEndTypeEnum.arrow;
        heightDimOpt.labelSuffix = "cm";
        heightDimOpt.labelRotation = 0;
        heightDimOpt.arrowSize = 0.3;
        heightDimOpt.crossingSize = 0.2;
        heightDimOpt.decimalPlaces = 1;
        const heightDimension =
            await bitbybit.occt.dimensions.simpleLinearLengthDimension(heightDimOpt);

        // Thickness dimension (depth of bottle)
        const thicknessDimOpt =
            new Bit.Inputs.OCCT.SimpleLinearLengthDimensionDto();
        thicknessDimOpt.start = [width / 2, 0, -thickness / 2];
        thicknessDimOpt.end = [width / 2, 0, thickness / 2];
        thicknessDimOpt.direction = [1, 0, 0];
        thicknessDimOpt.offsetFromPoints = 0;
        thicknessDimOpt.labelSize = 0.3;
        thicknessDimOpt.endType = dimensionEndTypeEnum.arrow;
        thicknessDimOpt.labelSuffix = "cm";
        thicknessDimOpt.arrowSize = 0.3;
        thicknessDimOpt.labelRotation = 180;
        thicknessDimOpt.crossingSize = 0.2;
        thicknessDimOpt.decimalPlaces = 1;
        const thicknessDimension =
            await bitbybit.occt.dimensions.simpleLinearLengthDimension(
                thicknessDimOpt
            );

        // Draw options for model with custom material
        const di = new Bit.Inputs.Draw.DrawOcctShapeOptions();
        di.edgeColour = "#000000";
        di.edgeOpacity = 0.5;
        di.precision = 0.001;
        di.faceOpacity = 1;
        di.edgeWidth = 1;

        // Create custom ThreeJS material
        const mat = new THREEJS.MeshPhongMaterial({
            color: new THREEJS.Color(color),
        });
        mat.polygonOffset = true;
        mat.polygonOffsetFactor = 1;
        di.faceMaterial = mat;

        currentGroup = await bitbybit.draw.drawAnyAsync({
            entity: union,
            options: di,
        });

        //Enable shadows on mesh children
        currentGroup?.children[0].children.forEach((child) => {
            child.castShadow = true;
            child.receiveShadow = true;
        });

        // Draw options for dimensions
        const dimOptions = new Bit.Inputs.Draw.DrawOcctShapeOptions();
        dimOptions.edgeColour = "#ffffff";
        dimOptions.edgeWidth = 2;
        dimOptions.drawEdges = true;
        dimOptions.drawFaces = false;

        currentDimensionsGroup = await bitbybit.draw.drawAnyAsync({
            entity: [widthDimension, heightDimension, thicknessDimension],
            options: dimOptions,
        });
    }

    // Initial render
    await createBottle(model.width, model.height, model.thickness, model.color);

    // Setup lil-gui
    const gui = new lil.GUI();
    gui.title("Bottle Parameters");

    gui
        .add(model, "width", 2, 10, 0.5)
        .name("Width")
        .onFinishChange(() => {
            createBottle(model.width, model.height, model.thickness, model.color);
        });

    gui
        .add(model, "height", 4, 15, 0.5)
        .name("Base Height")
        .onFinishChange(() => {
            createBottle(model.width, model.height, model.thickness, model.color);
        });

    gui
        .add(model, "thickness", 1, 6, 0.25)
        .name("Thickness")
        .onFinishChange(() => {
            createBottle(model.width, model.height, model.thickness, model.color);
        });

    gui
        .addColor(model, "color")
        .name("Color")
        .onFinishChange(() => {
            createBottle(model.width, model.height, model.thickness, model.color);
        });

    // Download folder
    const downloadFolder = gui.addFolder("Download");
    downloadFolder.add({ downloadSTEP }, "downloadSTEP").name("⬇ Download STEP");
    downloadFolder.add({ downloadSTL }, "downloadSTL").name("⬇ Download STL");
}
