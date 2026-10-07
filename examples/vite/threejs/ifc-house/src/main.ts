import "./style.css";
import * as THREE from "three";
import { BitByBitBase, Inputs, initBitByBit } from "@bitbybit-dev/threejs";
import { HouseAuthor } from "./house/build-house";
import type { Layer, StoreyKey } from "./house/house-types";
import { drawHouse } from "./scene/draw-house";
import type { DrawnElement, ElementInfo, Stage } from "./scene/scene-types";
import { createStage } from "./scene/stage";
import { HousePanel, showStatus } from "./ui/panel";
import { RoomLabels } from "./ui/room-labels";

const DOWNLOAD_URL_LIFETIME_MS = 10000;
const CLICK_TOLERANCE_PX = 4;
const HIGHLIGHT = new THREE.MeshStandardMaterial({ color: "#e9b44c", emissive: "#3d2700", roughness: 0.5 });

const status = document.getElementById("status") as HTMLElement;
start().catch((error: unknown) => showStatus(status, `The house could not be built: ${error instanceof Error ? error.message : String(error)}`));

async function start(): Promise<void> {
    const stage = createStage("three-canvas");
    const bitbybit = new BitByBitBase();
    showStatus(status, "Starting the IFC and Manifold workers");
    await initBitByBit(stage.scene, bitbybit, {
        enableManifold: true,
        enableIFC: true,
        workers: {
            manifoldWorker: new Worker(new URL("./workers/manifold.worker.ts", import.meta.url), { name: "MANIFOLD_WORKER", type: "module" }),
            ifcWorker: new Worker(new URL("./workers/ifc.worker.ts", import.meta.url), { name: "IFC_WORKER", type: "module" }),
        },
    });

    const started = performance.now();
    const house = await new HouseAuthor(bitbybit, (message) => showStatus(status, message)).build();
    showStatus(status, "Building the geometry with Manifold");
    const drawn = await drawHouse(bitbybit, house);
    const seconds = (performance.now() - started) / 1000;

    const spaces = await bitbybit.ifc.spaces.list({ model: house.model });
    const areas = new Map(spaces.map((space) => [space.name, space.area]));
    const summary = await bitbybit.ifc.model.summary({ model: house.model });
    const openings = (summary.elementCounts["IfcWindow"] ?? 0) + (summary.elementCounts["IfcDoor"] ?? 0);
    const netArea = spaces.reduce((sum, space) => sum + space.area, 0);

    const labels = new RoomLabels(stage, house.rooms, areas, document.getElementById("labels") as HTMLElement);
    const panel: HousePanel = new HousePanel(document.getElementById("ui") as HTMLElement, { netArea, rooms: spaces.length, openings, seconds }, house.rooms, areas, {
        onToggle: (key, on) => {
            if (key === "labels" && on) {
                panel.turn("roof", false);
            }
            if (key !== "labels") {
                drawn.filter((item) => item.info.layer === key).forEach((item) => {
                    item.object.visible = on;
                });
            }
            labels.show(labelledStorey(panel));
        },
        onDownload: () => download(bitbybit, house.model),
    });
    enablePicking(stage, drawn, (info) => panel.select(info));
    showStatus(status, undefined);
}

function labelledStorey(panel: HousePanel): StoreyKey | undefined {
    if (!panel.isOn("labels")) {
        return undefined;
    }
    const order: [Layer, StoreyKey][] = [["first", "first"], ["ground", "ground"]];
    return order.find(([layer]) => panel.isOn(layer))?.[1];
}

function enablePicking(stage: Stage, drawn: DrawnElement[], onPick: (info: ElementInfo | undefined) => void): void {
    const canvas = stage.renderer.domElement;
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const restore = new Map<THREE.Mesh, THREE.Material | THREE.Material[]>();
    let down: [number, number] = [0, 0];
    canvas.addEventListener("pointerdown", (event) => {
        down = [event.clientX, event.clientY];
    });
    canvas.addEventListener("pointerup", (event) => {
        if (Math.hypot(event.clientX - down[0], event.clientY - down[1]) > CLICK_TOLERANCE_PX) {
            return;
        }
        const bounds = canvas.getBoundingClientRect();
        pointer.set((event.clientX - bounds.left) / bounds.width * 2 - 1, -((event.clientY - bounds.top) / bounds.height) * 2 + 1);
        raycaster.setFromCamera(pointer, stage.camera);
        const visible = drawn.filter((item) => item.object.visible).map((item) => item.object);
        const hit = raycaster.intersectObjects(visible, true).find((candidate) => candidate.object.userData["element"]);
        restore.forEach((material, mesh) => {
            mesh.material = material;
        });
        restore.clear();
        const info = hit?.object.userData["element"] as ElementInfo | undefined;
        if (hit && info) {
            const owner = drawn.find((item) => item.info === info);
            owner?.object.traverse((part) => {
                if (part instanceof THREE.Mesh) {
                    restore.set(part, part.material);
                    part.material = HIGHLIGHT;
                }
            });
        }
        onPick(info);
    });
}

async function download(bitbybit: BitByBitBase, model: Inputs.IFC.IfcModelPointer): Promise<void> {
    const text = await bitbybit.ifc.model.write({ model, fileName: "house.ifc" });
    const url = URL.createObjectURL(new Blob([text], { type: "application/x-step" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "house.ifc";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), DOWNLOAD_URL_LIFETIME_MS);
}
