import "./style.css";
import * as THREE from "three";
import { BitByBitBase, initBitByBit } from "@bitbybit-dev/threejs";
import { houseStep } from "./export/step-export";
import { HouseAuthor } from "./house/build-house";
import type { Layer, StoreyKey } from "./house/house-types";
import { drawHouse } from "./scene/draw-house";
import type { DrawnHouse, ElementInfo, Stage } from "./scene/scene-types";
import { createStage } from "./scene/stage";
import { HousePanel, showStatus } from "./ui/panel";
import { RoomLabels } from "./ui/room-labels";

const DOWNLOAD_URL_LIFETIME_MS = 10000;
const CLICK_TOLERANCE_PX = 4;
const HIGHLIGHT = "#e9b44c";

const status = document.getElementById("status") as HTMLElement;
start().catch((error: unknown) => {
    showStatus(status, `The house could not be built: ${error instanceof Error ? error.message : String(error)}`);
});

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
    const house = await new HouseAuthor(bitbybit.ifc, (message) => {
        showStatus(status, message);
    }).build();
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
                const keys = [...drawn.elements.values()].filter((info) => info.layer === key).map((info) => info.globalId);
                drawn.groups.forEach((group) => {
                    bitbybit.draw.setRecipeElementsVisible({ drawn: group, keys, visible: on });
                });
            }
            labels.show(labelledStorey(panel));
        },
        onDownload: async () => {
            saveFile(await bitbybit.ifc.model.write({ model: house.model, fileName: "house.ifc" }), "house.ifc", "application/x-step");
        },
        onDownloadStep: async () => {
            showStatus(status, "Starting OpenCascade and writing house.step");
            try {
                saveFile((await houseStep(bitbybit, house.model)).slice(), "house.step", "model/step");
                showStatus(status, undefined);
            } catch (error) {
                showStatus(status, `The STEP file could not be written: ${error instanceof Error ? error.message : String(error)}`);
            }
        },
    });
    enablePicking(stage, bitbybit, drawn, (info) => {
        panel.select(info);
    });
    showStatus(status, undefined);
}

function labelledStorey(panel: HousePanel): StoreyKey | undefined {
    if (!panel.isOn("labels")) {
        return undefined;
    }
    const order: [Layer, StoreyKey][] = [["first", "first"], ["ground", "ground"]];
    return order.find(([layer]) => panel.isOn(layer))?.[1];
}

function enablePicking(stage: Stage, bitbybit: BitByBitBase, drawn: DrawnHouse, onPick: (info: ElementInfo | undefined) => void): void {
    const canvas = stage.renderer.domElement;
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const paint = (key: string, colour?: string): void => {
        drawn.groups.forEach((group) => {
            bitbybit.draw.setRecipeElementsColour({ drawn: group, keys: [key], colour });
        });
    };
    let selected: string | undefined;
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
        const hit = raycaster.intersectObjects(drawn.groups, true)[0];
        const group = drawn.groups.find((candidate) => candidate === hit?.object.parent);
        const key = hit && group ? bitbybit.draw.recipeElementOfPick({ drawn: group, mesh: hit.object, triangle: hit.faceIndex ?? undefined, instance: hit.instanceId }) : undefined;
        if (selected !== undefined) {
            paint(selected);
        }
        selected = key;
        if (key !== undefined) {
            paint(key, HIGHLIGHT);
        }
        onPick(key === undefined ? undefined : drawn.elements.get(key));
    });
}

function saveFile(data: BlobPart, fileName: string, type: string): void {
    const url = URL.createObjectURL(new Blob([data], { type }));
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    setTimeout(() => {
        URL.revokeObjectURL(url);
    }, DOWNLOAD_URL_LIFETIME_MS);
}
