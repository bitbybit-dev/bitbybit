import * as BABYLON from "@babylonjs/core";
import { stlOfTriangles, stlWithAxes } from "@bitbybit-dev/base/lib/api/services/helpers/files/stl";
import { stlAxesInFile } from "@bitbybit-dev/base/lib/api/services/helpers/files/stl-axes";
import type { Inputs } from "@bitbybit-dev/base";

const CORNERS = 3;
const COORDINATES = 3;
const AS_GIVEN = [0, 1, 2] as const;
const TURNED_ROUND = [0, 2, 1] as const;

function frontsTurnCounterClockwise(mesh: BABYLON.Mesh, rightHandedScene: boolean): boolean {
    const facing = mesh.material?.sideOrientation ?? mesh.sideOrientation;
    return (facing === BABYLON.Material.CounterClockWiseSideOrientation) === rightHandedScene;
}

function cornersInTheScene(mesh: BABYLON.AbstractMesh, rightHandedScene: boolean): Float32Array {
    const source = mesh instanceof BABYLON.InstancedMesh ? mesh.sourceMesh : mesh;
    const positions = source.getVerticesData(BABYLON.VertexBuffer.PositionKind);
    const indices = source.getIndices();
    if (!(source instanceof BABYLON.Mesh) || !positions || !indices) {
        return new Float32Array(0);
    }
    const world = mesh.computeWorldMatrix(true);
    const order = frontsTurnCounterClockwise(source, rightHandedScene) === world.determinant() > 0 ? AS_GIVEN : TURNED_ROUND;
    const corners = new Float32Array(Math.floor(indices.length / CORNERS) * CORNERS * COORDINATES);
    const point = BABYLON.Vector3.Zero();
    for (let at = 0; at + CORNERS <= indices.length; at += CORNERS) {
        order.forEach((corner, slot) => {
            const from = indices[at + corner]! * COORDINATES;
            BABYLON.Vector3.TransformCoordinatesFromFloatsToRef(positions[from]!, positions[from + 1]!, positions[from + 2]!, world, point);
            point.toArray(corners, (at + slot) * COORDINATES);
        });
    }
    return corners;
}

export function stlFileOf(meshes: readonly BABYLON.AbstractMesh[], rightHandedScene: boolean, coordinateSystem: Inputs.Base.coordinateSystemEnum): Uint8Array<ArrayBuffer> {
    const inTheScene = stlOfTriangles(meshes.map(mesh => cornersInTheScene(mesh, rightHandedScene)));
    return stlWithAxes(inTheScene, stlAxesInFile(coordinateSystem, true));
}

export function stlMeshInSceneAxes(mesh: BABYLON.AbstractMesh): void {
    if (mesh instanceof BABYLON.Mesh) {
        mesh.bakeTransformIntoVertices(BABYLON.Matrix.Scaling(1, 1, -1));
    }
}
