import type * as THREE from "three";
import { GLTFExporter } from "three/addons/exporters/GLTFExporter.js";

export function downloadBlob(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => { URL.revokeObjectURL(url); }, 1000);
}

export async function downloadGlb(object: THREE.Object3D, fileName: string): Promise<void> {
    const exporter = new GLTFExporter();
    const glb = await exporter.parseAsync(object, { binary: true });
    downloadBlob(new Blob([glb as ArrayBuffer], { type: "model/gltf-binary" }), fileName);
}
