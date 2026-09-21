import "./style.css";
import type * as THREE from "three";
import { ACESFilmicToneMapping, Color, MeshPhysicalMaterial, PMREMGenerator, Vector3 } from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { BitByBitBase, Inputs, initBitByBit, initThreeJS, type InitBitByBitOptions } from "@bitbybit-dev/threejs";
import { downloadBlob, layoutSvg } from "./exports";
import { buildModel, defaultParams, type BoxModel, type BoxParams } from "./model";
import { mountPoint, mountUi, type ExportFormat, type View } from "./ui";

const PANEL_COLOURS: Record<string, string> = {
    bottom: "#d4b07c", lid: "#e0bf8c", front: "#c9a36e", back: "#c9a36e", left: "#bd9762", right: "#bd9762",
};
const CUT_EDGE = "#3b2a17";

void start();

function isMesh(object: THREE.Object3D): object is THREE.Mesh {
    return "isMesh" in object && object.isMesh === true;
}

function cameraOptions(sceneSize: number): Inputs.ThreeJSCamera.OrbitCameraDto {
    const camera = new Inputs.ThreeJSCamera.OrbitCameraDto();
    camera.distance = sceneSize * Math.SQRT2;
    camera.distanceMin = sceneSize * 0.02;
    camera.distanceMax = sceneSize * 10;
    return camera;
}

async function start(): Promise<void> {
    const sceneOptions = new Inputs.ThreeJSScene.InitThreeJSDto();
    sceneOptions.canvasId = "three-canvas";
    sceneOptions.sceneSize = 600;
    sceneOptions.enableGround = true;
    sceneOptions.groundColor = "#2a2d31";
    sceneOptions.enableShadows = true;
    sceneOptions.orbitCameraOptions = cameraOptions(sceneOptions.sceneSize);
    const { scene, renderer, orbitCamera, startAnimationLoop } = initThreeJS(sceneOptions);
    startAnimationLoop();

    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    scene.environment = new PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = 0.4;
    const plywood = new Map<string, MeshPhysicalMaterial>();

    const bitbybit = new BitByBitBase();
    const options: InitBitByBitOptions = {
        enableOCCT: true,
        enableJSCAD: false,
        enableManifold: false,
    };
    await initBitByBit(scene, bitbybit, options);

    let params: BoxParams = { ...defaultParams };
    let view: View = "assembled";
    let current: { model: BoxModel; drawn: THREE.Group[] } | undefined;
    let generation = 0;
    let timer: number | undefined;
    let framedFor = "";

    const ui = mountUi(mountPoint("panel"), params, {
        onChange: (next) => {
            params = next;
            window.clearTimeout(timer);
            timer = window.setTimeout(() => void rebuild(), 150);
        },
        onView: (next) => {
            view = next;
            framedFor = "";
            void redraw();
        },
        onExport: (format) => void exportModel(format),
    });

    async function rebuild(): Promise<void> {
        const mine = ++generation;
        ui.setStatus("Building...");
        try {
            const model = await buildModel(bitbybit.occt, params);
            if (mine !== generation) return;
            if (current) current.drawn.forEach(dispose);
            current = { model, drawn: [] };
            await redraw();
            ui.setFacts(model.layout, model.params);
            ui.setStatus(`${model.parts.length} parts, ${model.parts[0]?.fingers ?? 0} fingers on the longest edge.`);
        } catch (error) {
            ui.setStatus(`Could not build this box: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    async function redraw(): Promise<void> {
        if (!current) return;
        current.drawn.forEach(dispose);
        current.drawn = [];
        for (const part of current.model.parts) {
            const drawOptions = new Inputs.Draw.DrawOcctShapeOptions();
            drawOptions.faceMaterial = plywoodFor(part.id);
            drawOptions.edgeColour = CUT_EDGE;
            drawOptions.edgeWidth = 1;
            drawOptions.drawEdges = true;
            drawOptions.drawTwoSided = false;
            const entity = view === "assembled" ? part.assembled : part.flatSolid;
            current.drawn.push(await bitbybit.draw.drawAnyAsync({ entity, options: drawOptions }));
        }
        if (view === "flat") {
            const sheetOptions = new Inputs.Draw.DrawOcctShapeOptions();
            sheetOptions.edgeColour = "#f0cebb";
            sheetOptions.edgeWidth = 1;
            sheetOptions.drawEdges = true;
            sheetOptions.drawFaces = false;
            current.drawn.push(await bitbybit.draw.drawAnyAsync({ entity: current.model.sheetOutline, options: sheetOptions }));
        }
        frame();
    }

    function plywoodFor(id: string): MeshPhysicalMaterial {
        let material = plywood.get(id);
        if (!material) {
            material = new MeshPhysicalMaterial({ color: new Color(PANEL_COLOURS[id] ?? "#d4b07c"), roughness: 0.62, metalness: 0, clearcoat: 0.25, clearcoatRoughness: 0.35 });
            plywood.set(id, material);
        }
        return material;
    }

    function frame(): void {
        if (!orbitCamera || !current) return;
        const p = current.model.params;
        const key = `${view}:${view === "assembled" ? Math.max(p.length, p.width, p.height) : Math.max(p.sheetWidth, p.sheetHeight)}`;
        if (key === framedFor) return;
        framedFor = key;
        if (view === "assembled") {
            const distance = Math.max(p.length, p.width, p.height) * 2.2;
            const target = new Vector3(0, p.height / 2, 0);
            orbitCamera.orbitCamera.resetAndLookAtPoint(new Vector3(distance * 0.6, target.y + distance * 0.5, distance * 0.6), target);
        } else {
            const distance = Math.max(p.sheetWidth, p.sheetHeight) * 1.3;
            orbitCamera.orbitCamera.resetAndLookAtPoint(new Vector3(0, distance, 0.001), new Vector3(0, 0, 0));
        }
    }

    async function exportModel(format: ExportFormat): Promise<void> {
        if (!current) return;
        const { model } = current;
        const p = model.params;
        const name = `box-${p.length}x${p.width}x${p.height}`;
        ui.setStatus(`Exporting ${format.toUpperCase()}...`);
        if (format === "svg") {
            downloadBlob(new Blob([layoutSvg(model.layout, p.sheetWidth, p.sheetHeight)], { type: "image/svg+xml" }), `${name}-layout.svg`);
        } else if (format === "dxf") {
            const pathsParts = [];
            for (const part of model.parts) {
                const paths = await bitbybit.occt.io.shapeToDxfPaths({ shape: part.flat, angularDeflection: 0.1, curvatureDeflection: 0.1, minimumOfPoints: 2, uTolerance: 1e-9, minimumLength: 1e-7 });
                pathsParts.push(await bitbybit.occt.io.dxfPathsWithLayer({ paths, layer: "cut", color: "#000000" }));
            }
            await bitbybit.occt.io.dxfCreate({ pathsParts, colorFormat: Inputs.OCCT.dxfColorFormatEnum.aci, acadVersion: Inputs.OCCT.dxfAcadVersionEnum.AC1009, fileName: `${name}-layout.dxf`, tryDownload: true });
        } else {
            const compound = await bitbybit.occt.shapes.compound.makeCompound({ shapes: model.parts.map((part) => part.assembled) });
            await bitbybit.occt.io.saveShapeSTEP({ shape: compound, fileName: `${name}.step`, adjustYtoZ: true, tryDownload: true });
        }
        ui.setStatus(`${format.toUpperCase()} downloaded.`);
    }

    function dispose(group: THREE.Group): void {
        scene.remove(group);
        const shared = new Set<THREE.Material>(plywood.values());
        group.traverse((object) => {
            if (!isMesh(object)) return;
            object.geometry.dispose();
            for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
                if (!shared.has(material)) material.dispose();
            }
        });
    }

    await rebuild();
}
