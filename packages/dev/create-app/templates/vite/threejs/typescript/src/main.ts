import "./style.css";
import { BitByBitBase, Inputs, initBitByBit, initThreeJS, type InitBitByBitOptions } from "@bitbybit-dev/threejs";


start();

async function start() {
    const sceneOptions = new Inputs.ThreeJSScene.InitThreeJSDto();
    sceneOptions.canvasId = "three-canvas";
    sceneOptions.sceneSize = 10;
    const { scene, startAnimationLoop } = initThreeJS(sceneOptions);
    startAnimationLoop();
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

}

async function createOCCTGeometry(bitbybit: BitByBitBase, color: string) {
    const cubeOptions = new Inputs.OCCT.CubeDto();
    cubeOptions.size = 2.5;
    cubeOptions.center = [0, 1.25, 0];

    const cube = await bitbybit.occt.shapes.solid.createCube(cubeOptions);

    const filletOptions =
        new Inputs.OCCT.FilletDto<Inputs.OCCT.TopoDSShapePointer>();
    filletOptions.shape = cube;
    filletOptions.radius = 0.4;
    const roundedCube = await bitbybit.occt.fillets.filletEdges(filletOptions);

    const drawOptions = new Inputs.Draw.DrawOcctShapeOptions();
    drawOptions.edgeWidth = 0.5;
    drawOptions.faceColour = color;
    drawOptions.drawVertices = true;
    drawOptions.vertexSize = 0.05;
    drawOptions.vertexColour = "#ffffff";
    await bitbybit.draw.drawAnyAsync({
        entity: roundedCube,
        options: drawOptions,
    });
}

async function createManifoldGeometry(bitbybit: BitByBitBase, color: string) {
    const sphereOptions = new Inputs.Manifold.SphereDto();
    sphereOptions.radius = 1.5;
    sphereOptions.circularSegments = 32;
    const sphere = await bitbybit.manifold.manifold.shapes.sphere(sphereOptions);

    const cubeOptions = new Inputs.Manifold.CubeDto();
    cubeOptions.size = 2.5;
    const cube = await bitbybit.manifold.manifold.shapes.cube(cubeOptions);

    const diffedShape = await bitbybit.manifold.manifold.booleans.differenceTwo({
        manifold1: cube,
        manifold2: sphere,
    });

    const translationOptions =
        new Inputs.Manifold.TranslateDto<Inputs.Manifold.ManifoldPointer>();
    translationOptions.manifold = diffedShape;
    translationOptions.vector = [0, 1.25, -4]; // Position below OCCT
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
    geodesicSphereOptions.radius = 1.5;
    geodesicSphereOptions.center = [0, 1.5, 4];
    const geodesicSphere = await bitbybit.jscad.shapes.geodesicSphere(
        geodesicSphereOptions
    );

    const sphereOptions = new Inputs.JSCAD.SphereDto();
    sphereOptions.radius = 1;
    sphereOptions.center = [0, 3, 4.5];
    const simpleSphere = await bitbybit.jscad.shapes.sphere(sphereOptions);

    const unionOptions = new Inputs.JSCAD.BooleanTwoObjectsDto();
    unionOptions.first = geodesicSphere;
    unionOptions.second = simpleSphere;
    const unionShape = await bitbybit.jscad.booleans.unionTwo(unionOptions);

    const drawOptions = new Inputs.Draw.DrawBasicGeometryOptions();
    drawOptions.colours = color;
    await bitbybit.draw.drawAnyAsync({
        entity: unionShape,
        options: drawOptions,
    });
}
