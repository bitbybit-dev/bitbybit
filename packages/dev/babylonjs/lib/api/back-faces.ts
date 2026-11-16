import * as BABYLON from "@babylonjs/core";

const BACK_FACE = "backFace";

export function markAsBackFace(mesh: BABYLON.Mesh): void {
    mesh.metadata = { ...mesh.metadata, [BACK_FACE]: true };
}

export function isBackFace(node: BABYLON.Node): boolean {
    const source = node instanceof BABYLON.InstancedMesh ? node.sourceMesh : node;
    return source.metadata?.[BACK_FACE] === true;
}
