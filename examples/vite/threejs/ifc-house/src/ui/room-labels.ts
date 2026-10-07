import * as THREE from "three";
import { FIRST_FLOOR_ELEVATION } from "../house/house-plan";
import type { RoomSpec, StoreyKey } from "../house/house-types";
import type { Stage } from "../scene/scene-types";

const LABEL_HEIGHT = 0.15;

interface Label {
    room: RoomSpec;
    anchor: THREE.Vector3;
    element: HTMLDivElement;
}

function centreOf(room: RoomSpec): THREE.Vector3 {
    const xs = room.outline.map(([x]) => x);
    const ys = room.outline.map(([, y]) => y);
    const x = (Math.min(...xs) + Math.max(...xs)) / 2;
    const y = (Math.min(...ys) + Math.max(...ys)) / 2;
    const base = room.storey === "first" ? FIRST_FLOOR_ELEVATION : 0;
    return new THREE.Vector3(x, base + LABEL_HEIGHT, -y);
}

export class RoomLabels {
    private readonly labels: Label[];
    private storey: StoreyKey | undefined;
    private readonly projected = new THREE.Vector3();
    private readonly stage: Stage;

    constructor(stage: Stage, rooms: RoomSpec[], areas: Map<string, number>, host: HTMLElement) {
        this.stage = stage;
        this.labels = rooms.map((room) => {
            const element = document.createElement("div");
            element.className = "room-label";
            const area = areas.get(room.number);
            element.innerHTML = `<span class="room-number">${room.number}</span><span class="room-name"></span><span class="room-area"></span>`;
            element.querySelector(".room-name")!.textContent = room.name;
            element.querySelector(".room-area")!.textContent = area === undefined ? "" : `${area.toFixed(1)} m²`;
            host.appendChild(element);
            return { room, anchor: centreOf(room), element };
        });
        const follow = (): void => {
            this.place();
            requestAnimationFrame(follow);
        };
        requestAnimationFrame(follow);
    }

    show(storey: StoreyKey | undefined): void {
        this.storey = storey;
    }

    private place(): void {
        const { camera, renderer } = this.stage;
        const width = renderer.domElement.clientWidth;
        const height = renderer.domElement.clientHeight;
        for (const label of this.labels) {
            const visible = label.room.storey === this.storey;
            this.projected.copy(label.anchor).project(camera);
            const inFront = this.projected.z < 1;
            label.element.style.display = visible && inFront ? "flex" : "none";
            if (visible && inFront) {
                label.element.style.transform = `translate(-50%, -50%) translate(${(this.projected.x + 1) / 2 * width}px, ${(1 - this.projected.y) / 2 * height}px)`;
            }
        }
    }
}
