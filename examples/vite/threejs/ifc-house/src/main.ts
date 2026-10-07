import "./style.css";
import { BitByBitBase, Inputs, initBitByBit, initThreeJS } from "@bitbybit-dev/threejs";

const CORNERS: Inputs.Base.Point2[] = [[0, 0], [10, 0], [10, 8], [0, 8]];
const STOREY_HEIGHT = 3;
const GABLE_WALL_HEIGHT = 6.5;
const TYPE_COLOURS: Record<string, string> = { IfcDoor: "#8a5a35", IfcWindow: "#9fd3ff" };
const DOWNLOAD_URL_LIFETIME_MS = 10000;

start();

async function start() {
    const sceneOptions = new Inputs.ThreeJSScene.InitThreeJSDto();
    sceneOptions.canvasId = "three-canvas";
    sceneOptions.sceneSize = 20;
    const { scene, startAnimationLoop } = initThreeJS(sceneOptions);
    startAnimationLoop();

    const bitbybit = new BitByBitBase();
    await initBitByBit(scene, bitbybit, {
        enableManifold: true,
        enableIFC: true,
        workers: {
            manifoldWorker: new Worker(new URL("./workers/manifold.worker.ts", import.meta.url), { name: "MANIFOLD_WORKER", type: "module" }),
            ifcWorker: new Worker(new URL("./workers/ifc.worker.ts", import.meta.url), { name: "IFC_WORKER", type: "module" }),
        },
    });

    const model = await buildHouse(bitbybit);
    await drawModel(bitbybit, model);
    offerDownload(bitbybit, model);
}

async function buildHouse(bitbybit: BitByBitBase): Promise<Inputs.IFC.IfcModelPointer> {
    const ifc = bitbybit.ifc;
    let model = await ifc.model.create({ name: "House", lengthUnit: Inputs.IFC.lengthUnitEnum.metre, seed: "ifc-house-example" });
    model = await ifc.spatial.addStorey({ model, id: "ground", name: "Ground floor", elevation: 0 });
    model = await ifc.spatial.addStorey({ model, id: "first", name: "First floor", elevation: STOREY_HEIGHT });

    model = await ifc.materials.add({ model, name: "Brick", category: "brick", color: "#b5651d" });
    model = await ifc.materials.add({ model, name: "Plaster", category: "plaster", color: "#f2efe6" });
    model = await ifc.materials.add({ model, name: "Concrete", category: "concrete", color: "#9a9a9a" });
    model = await ifc.materials.add({ model, name: "Tiles", category: "tile", color: "#7a2e1d" });
    model = await ifc.materials.addLayerSet({ model, name: "Exterior wall", layers: [{ material: "Brick", thickness: 0.235 }, { material: "Plaster", thickness: 0.015 }] });
    model = await ifc.materials.addLayerSet({ model, name: "Floor", layers: [{ material: "Concrete", thickness: 0.2 }] });
    model = await ifc.materials.addLayerSet({ model, name: "Roof", layers: [{ material: "Tiles", thickness: 0.22 }] });
    model = await ifc.doors.addType({ model, id: "door", name: "Door 900", width: 0.9, height: 2.1 });
    model = await ifc.windows.addType({ model, id: "window", name: "Window 1200", width: 1.2, height: 1.4 });

    for (const storey of ["ground", "first"]) {
        for (let i = 0; i < CORNERS.length; i++) {
            const gable = storey === "first" && i % 2 === 1;
            model = await ifc.walls.add({
                model, storey, id: `${storey}-wall-${i}`, name: `Wall ${i + 1}`,
                start: CORNERS[i], end: CORNERS[(i + 1) % CORNERS.length],
                height: gable ? GABLE_WALL_HEIGHT : STOREY_HEIGHT, layerSet: "Exterior wall", alignment: Inputs.IFC.wallAlignmentEnum.left,
            });
        }
        for (let i = 0; i < CORNERS.length; i++) {
            model = await ifc.walls.connect({ model, wall: `${storey}-wall-${i}`, other: `${storey}-wall-${(i + 1) % CORNERS.length}` });
        }
        model = await ifc.slabs.add({ model, storey, id: `${storey}-floor`, name: "Floor", outline: CORNERS, layerSet: "Floor" });
        for (const [wall, offset] of [[0, 2], [0, 6.8], [2, 3], [1, 3.4]] as const) {
            model = await ifc.windows.add({ model, wall: `${storey}-wall-${wall}`, windowType: "window", offset });
        }
    }
    model = await ifc.doors.add({ model, wall: "ground-wall-0", doorType: "door", id: "front-door", name: "Front door", offset: 4.5 });
    model = await ifc.roofs.add({ model, storey: "first", id: "roof", name: "Roof", outline: CORNERS, kind: Inputs.IFC.roofKindEnum.gable, pitch: 35, baseOffset: STOREY_HEIGHT, overhang: 0.4, layerSet: "Roof" });
    for (let i = 0; i < CORNERS.length; i++) {
        model = await ifc.walls.clipByRoof({ model, wall: `first-wall-${i}`, roof: "roof" });
    }
    return ifc.quantities.compute({ model });
}

function hexOf(rgba: number[]): string {
    return `#${rgba.slice(0, 3).map((channel) => Math.round(channel * 255).toString(16).padStart(2, "0")).join("")}`;
}

async function drawModel(bitbybit: BitByBitBase, model: Inputs.IFC.IfcModelPointer) {
    const recipe = await bitbybit.ifc.geometry.recipe({ model });
    const solids = await bitbybit.manifold.recipes.build({ recipe, adjustZtoY: true });
    for (let i = 0; i < solids.length; i++) {
        const tag = recipe.roots[i].tag;
        const rgba = Array.isArray(tag.rgba) ? tag.rgba : undefined;
        const options = new Inputs.Draw.DrawManifoldOrCrossSectionOptions();
        options.faceColour = rgba ? hexOf(rgba) : TYPE_COLOURS[String(tag.type)] ?? "#cccccc";
        options.faceOpacity = tag.type === "IfcWindow" ? 0.5 : 1;
        await bitbybit.draw.drawAnyAsync({ entity: solids[i], options });
    }
}

function offerDownload(bitbybit: BitByBitBase, model: Inputs.IFC.IfcModelPointer) {
    const button = document.getElementById("download-ifc") as HTMLButtonElement;
    button.disabled = false;
    button.addEventListener("click", async () => {
        const text = await bitbybit.ifc.model.write({ model, fileName: "house.ifc" });
        const url = URL.createObjectURL(new Blob([text], { type: "application/x-step" }));
        const link = document.createElement("a");
        link.href = url;
        link.download = "house.ifc";
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), DOWNLOAD_URL_LIFETIME_MS);
    });
}
