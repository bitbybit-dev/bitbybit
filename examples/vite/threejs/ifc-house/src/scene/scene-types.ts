import type * as THREE from "three";
import type { initThreeJS } from "@bitbybit-dev/threejs";
import type { Layer } from "../house/house-types";

export type OrbitCamera = NonNullable<ReturnType<typeof initThreeJS>["orbitCamera"]>;

export interface Stage {
    scene: THREE.Scene;
    renderer: THREE.WebGLRenderer;
    camera: THREE.PerspectiveCamera;
    orbit: OrbitCamera;
}

export interface ElementInfo {
    globalId: string;
    type: string;
    name: string;
    layer: Layer;
}

export interface DrawnElement {
    info: ElementInfo;
    object: THREE.Object3D;
}

export interface Look {
    roughness: number;
    metalness: number;
    faceted?: boolean;
}
