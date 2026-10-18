import type { Inputs } from "@bitbybit-dev/occt";

/**
 * The buffers a decoded mesh's faces are views into, each once, for the worker to hand to the thread
 * it answers without copying them. A buffer shared between threads is left out: it is never copied.
 */
export function meshBuffersOf(meshes: readonly Inputs.OCCT.DecomposedMeshBuffersDto[]): ArrayBuffer[] {
    const buffers = new Set<ArrayBuffer>();
    for (const mesh of meshes) {
        for (const face of mesh.faceList) {
            for (const view of [face.vertexCoord, face.normalCoord, face.uvs, face.triIndexes, face.analysisValues]) {
                if (view !== undefined && view.buffer instanceof ArrayBuffer) {
                    buffers.add(view.buffer);
                }
            }
        }
    }
    return [...buffers];
}
