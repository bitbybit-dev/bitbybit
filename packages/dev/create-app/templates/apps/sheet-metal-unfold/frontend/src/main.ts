import "./style.css";
import type * as THREE from "three";
import { ACESFilmicToneMapping, Color, MeshPhysicalMaterial, PMREMGenerator, Vector3 } from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { BitByBitBase, Inputs, initBitByBit, initThreeJS, type InitBitByBitOptions } from "@bitbybit-dev/threejs";
import { accessFromResponse, renderAccess } from "./cloud-access";
import { downloadBlob } from "./exports";
import { bendLines, summarize, toScene, type UnfoldResult } from "./flat";
import { buildModel, defaultParams, type PartModel, type PartParams } from "./model";
import { mountPoint, mountUi, type ExportFormat, type View } from "./ui";

type Drawn = THREE.Group;
type Shape = PartModel["shape"];

const LAYOUT_LIFT = 1;

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
    sceneOptions.sceneSize = 400;
    sceneOptions.enableGround = true;
    sceneOptions.groundColor = "#2a2d31";
    sceneOptions.enableShadows = true;
    sceneOptions.orbitCameraOptions = cameraOptions(sceneOptions.sceneSize);
    const { scene, renderer, orbitCamera, startAnimationLoop } = initThreeJS(sceneOptions);
    startAnimationLoop();

    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    scene.environment = new PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = 0.6;
    const steel = new MeshPhysicalMaterial({ color: new Color("#b8bcc2"), metalness: 1, roughness: 0.38 });

    const bitbybit = new BitByBitBase();
    const options: InitBitByBitOptions = {
        enableOCCT: true,
        enableJSCAD: false,
        enableManifold: false,
    };
    await initBitByBit(scene, bitbybit, options);

    let params: PartParams = { ...defaultParams };
    let view: View = "part";
    let part: { model: PartModel; drawn: Drawn[] } | undefined;
    let flat: { result: UnfoldResult; shape: Shape; drawn: Drawn[] } | undefined;
    let generation = 0;
    let timer: number | undefined;

    const ui = mountUi(mountPoint("panel"), params, {
        onChange: (next) => {
            params = next;
            window.clearTimeout(timer);
            timer = window.setTimeout(() => void rebuild(), 150);
        },
        onView: (next) => { view = next; void redraw(); },
        onUnfold: () => void unfold(),
        onExport: (format) => void exportModel(format),
    });

    async function rebuild(): Promise<void> {
        const mine = ++generation;
        ui.setStatus("Building the part...");
        try {
            const model = await buildModel(bitbybit.occt, params);
            if (mine !== generation) return;
            if (part) part.drawn.forEach(dispose);
            part = { model, drawn: [] };
            if (flat) { flat.drawn.forEach(dispose); flat = undefined; ui.setFlat(null); }
            view = "part";
            await redraw();
            ui.setEstimate(model.estimate, model.volume);
            ui.setStatus(`Part built in the browser: ${model.estimate.bends} bends, ${(model.volume / 1000).toFixed(1)} cm³ of sheet.`);
        } catch (error) {
            ui.setStatus(`Could not build this part: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    async function redraw(): Promise<void> {
        if (part) { part.drawn.forEach(dispose); part.drawn = []; }
        if (flat) { flat.drawn.forEach(dispose); flat.drawn = []; }
        const drawOptions = new Inputs.Draw.DrawOcctShapeOptions();
        drawOptions.faceMaterial = steel;
        drawOptions.edgeColour = "#26292d";
        drawOptions.edgeWidth = 1;
        drawOptions.drawEdges = true;
        drawOptions.drawTwoSided = false;
        drawOptions.precision = 0.02;
        if (view === "part" && part) {
            part.drawn.push(await bitbybit.draw.drawAnyAsync({ entity: part.model.shape, options: drawOptions }));
            frame(Math.max(part.model.params.baseWidth, part.model.params.flangeHeight, part.model.params.depth), part.model.params.flangeHeight / 2);
        } else if (view === "flat" && flat) {
            flat.drawn.push(await bitbybit.draw.drawAnyAsync({ entity: flat.shape, options: drawOptions }));
            const lineOptions = new Inputs.Draw.DrawBasicGeometryOptions();
            lineOptions.colours = "#f0cebb";
            lineOptions.size = 2;
            for (const [start, end] of bendLines(flat.result.report)) {
                const lifted = (point: ReturnType<typeof toScene>): ReturnType<typeof toScene> => [point[0], point[1] + LAYOUT_LIFT + 0.1, point[2]];
                flat.drawn.push(await bitbybit.draw.drawAnyAsync({ entity: { points: [lifted(toScene(start)), lifted(toScene(end))] }, options: lineOptions }));
            }
            const summary = summarize(flat.result.report);
            frame(Math.max(summary.flatWidth ?? 100, summary.flatHeight ?? 100), 0);
        }
    }

    function frame(extent: number, targetHeight: number): void {
        if (!orbitCamera) return;
        const distance = extent * 2.2;
        const target = new Vector3(0, targetHeight, 0);
        orbitCamera.orbitCamera.resetAndLookAtPoint(new Vector3(distance * 0.6, targetHeight + distance * 0.55, distance * 0.6), target);
    }

    async function unfold(): Promise<void> {
        if (!part) return;
        ui.setBusy(true);
        ui.setStatus("Exporting the part as STEP and sending it to CAD Cloud through the backend...");
        try {
            const stepText = await bitbybit.occt.io.saveShapeSTEPAndReturn({ shape: part.model.shape, fileName: "channel.step", adjustYtoZ: true, tryDownload: false });
            const response = await fetch("/api/unfold", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ stepText, fileName: "channel.step", kFactor: part.model.params.kFactor }),
            }).catch(() => null);
            const status = response?.status ?? 0;
            const body: unknown = response ? await response.json().catch(() => null) : null;
            const access = accessFromResponse(status, body);
            renderAccess(ui.accessRoot, access);
            if (access.state !== "ready") {
                ui.setStatus(access.state === "locked" ? "The part still works without a key; only the unfold needs one." : access.message);
                return;
            }
            const result = body as UnfoldResult;
            const loaded = await bitbybit.occt.io.loadSTEPorIGESFromText({ text: result.flatStep, fileType: Inputs.OCCT.fileTypeEnum.step, adjustZtoY: true });
            const shape = await bitbybit.occt.transforms.translate({ shape: loaded, translation: [0, LAYOUT_LIFT, 0] });
            if (flat) flat.drawn.forEach(dispose);
            flat = { result, shape, drawn: [] };
            const summary = summarize(result.report);
            ui.setFlat(summary);
            view = summary.unfolded > 0 ? "flat" : "part";
            for (const button of document.querySelectorAll<HTMLButtonElement>(".views button")) button.classList.toggle("active", button.dataset["view"] === view);
            await redraw();
            ui.setStatus(summary.unfolded > 0
                ? `Unfolded on CAD Cloud as task ${result.taskId}: ${summary.bends} bends, ${(summary.developedLength ?? 0).toFixed(2)} mm developed against the ${part.model.estimate.total.toFixed(2)} mm estimate.`
                : `CAD Cloud could not unfold this part: ${summary.problems.join("; ")}`);
        } catch (error) {
            ui.setStatus(`Unfold failed: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            ui.setBusy(false);
        }
    }

    async function exportModel(format: ExportFormat): Promise<void> {
        const p = params;
        const name = `channel-${p.baseWidth}x${p.flangeHeight}x${p.depth}`;
        if (format === "part-step" && part) {
            await bitbybit.occt.io.saveShapeSTEP({ shape: part.model.shape, fileName: `${name}.step`, adjustYtoZ: true, tryDownload: true });
        } else if (format === "flat-step" && flat) {
            downloadBlob(new Blob([flat.result.flatStep], { type: "application/step" }), `${name}-flat.step`);
        } else if (format === "flat-dxf" && flat) {
            const paths = await bitbybit.occt.io.shapeToDxfPaths({ shape: flat.shape, angularDeflection: 0.1, curvatureDeflection: 0.1, minimumOfPoints: 2, uTolerance: 1e-9, minimumLength: 1e-7 });
            const cut = await bitbybit.occt.io.dxfPathsWithLayer({ paths, layer: "cut", color: "#000000" });
            const bends = bendLines(flat.result.report).map(([start, end]) => ({ segments: [{ points: [[start[0], start[1]], [end[0], end[1]]] as [number, number][], closed: false }] }));
            const bendLayer = await bitbybit.occt.io.dxfPathsWithLayer({ paths: bends, layer: "bend", color: "#ff0000" });
            await bitbybit.occt.io.dxfCreate({ pathsParts: [cut, bendLayer], colorFormat: Inputs.OCCT.dxfColorFormatEnum.aci, acadVersion: Inputs.OCCT.dxfAcadVersionEnum.AC1009, fileName: `${name}-flat.dxf`, tryDownload: true });
        }
    }

    function dispose(group: Drawn): void {
        scene.remove(group);
        group.traverse((object) => {
            if (!isMesh(object)) return;
            object.geometry.dispose();
            for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
                if (material !== steel) material.dispose();
            }
        });
    }

    await rebuild();
}
