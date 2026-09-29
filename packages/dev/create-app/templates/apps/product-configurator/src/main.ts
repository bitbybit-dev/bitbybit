import "./style.css";
import type * as THREE from "three";
import { ACESFilmicToneMapping, Color, MeshPhysicalMaterial, PMREMGenerator, Vector3 } from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { BitByBitBase, Inputs, initBitByBit, initThreeJS, type InitBitByBitOptions } from "@bitbybit-dev/threejs";
import { MATERIALS, quoteFor } from "./catalog";
import { downloadGlb } from "./exports";
import { buildModel, defaultParams, type MaterialId, type PlanterModel, type PlanterParams } from "./model";
import { mountPoint, mountUi, type ExportFormat } from "./ui";

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
    sceneOptions.sceneSize = 120;
    sceneOptions.enableGround = true;
    sceneOptions.groundColor = "#2a2d31";
    sceneOptions.enableShadows = true;
    sceneOptions.orbitCameraOptions = cameraOptions(sceneOptions.sceneSize);
    const { scene, renderer, orbitCamera, startAnimationLoop } = initThreeJS(sceneOptions);
    startAnimationLoop();

    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    scene.environment = new PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = 0.45;
    const materials = new Map<MaterialId, MeshPhysicalMaterial>();

    const bitbybit = new BitByBitBase();
    const options: InitBitByBitOptions = {
        enableOCCT: true,
        enableJSCAD: false,
        enableManifold: false,
    };
    await initBitByBit(scene, bitbybit, options);

    let params: PlanterParams = { ...defaultParams };
    let current: { model: PlanterModel; drawn: THREE.Group } | undefined;
    let generation = 0;
    let timer: number | undefined;
    let framedFor = 0;

    const ui = mountUi(mountPoint("panel"), params, {
        onChange: (next) => {
            params = next;
            window.clearTimeout(timer);
            timer = window.setTimeout(() => void rebuild(), 120);
        },
        onExport: (format) => void exportModel(format),
    });

    async function rebuild(): Promise<void> {
        const mine = ++generation;
        ui.setStatus("Building...");
        try {
            const model = await buildModel(bitbybit.occt, params);
            if (mine !== generation) return;
            const drawOptions = new Inputs.Draw.DrawOcctShapeOptions();
            drawOptions.faceMaterial = materialFor(params.material);
            drawOptions.drawEdges = false;
            drawOptions.drawTwoSided = false;
            drawOptions.precision = 0.02;
            const drawn = await bitbybit.draw.drawAnyAsync({ entity: model.shape, options: drawOptions });
            if (mine !== generation) { dispose(drawn); return; }
            if (current) dispose(current.drawn);
            current = { model, drawn };
            frame();
            ui.setQuote(quoteFor(params, model));
            ui.setStatus(`${model.volume.toFixed(0)} cm³ of ${MATERIALS[params.material].label.toLowerCase()}, ${(model.surfaceArea / 10000).toFixed(2)} m² of surface`);
        } catch (error) {
            ui.setStatus(`Could not build this planter: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    async function exportModel(format: ExportFormat): Promise<void> {
        if (!current) return;
        const name = `planter-${params.width}x${params.depth}x${params.height}`;
        ui.setStatus(`Exporting ${format.toUpperCase()}...`);
        if (format === "step") {
            await bitbybit.occt.io.saveShapeSTEP({ shape: current.model.shape, fileName: `${name}.step`, adjustYtoZ: true, tryDownload: true });
        } else if (format === "stl") {
            await bitbybit.occt.io.saveShapeStl({ shape: current.model.shape, fileName: `${name}.stl`, precision: 0.01, adjustYtoZ: true, tryDownload: true, binary: true });
        } else {
            await downloadGlb(current.drawn, `${name}.glb`);
        }
        ui.setStatus(`${format.toUpperCase()} downloaded.`);
    }

    function materialFor(id: MaterialId): MeshPhysicalMaterial {
        let material = materials.get(id);
        if (!material) {
            const spec = MATERIALS[id];
            material = new MeshPhysicalMaterial({ color: new Color(spec.colour), roughness: spec.roughness, metalness: 0, clearcoat: spec.clearcoat, clearcoatRoughness: 0.2 });
            materials.set(id, material);
        }
        return material;
    }

    function frame(): void {
        const extent = Math.max(params.width, params.depth, params.height);
        if (!orbitCamera || (framedFor > 0 && Math.abs(extent - framedFor) / framedFor < 0.4)) return;
        framedFor = extent;
        const distance = extent * 2.4;
        const target = new Vector3(0, params.height / 2, 0);
        orbitCamera.orbitCamera.resetAndLookAtPoint(new Vector3(distance * 0.6, target.y + distance * 0.45, distance * 0.6), target);
    }

    function dispose(group: THREE.Group): void {
        scene.remove(group);
        const shared = new Set<THREE.Material>(materials.values());
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
