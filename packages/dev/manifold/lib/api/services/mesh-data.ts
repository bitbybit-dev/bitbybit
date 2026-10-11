import type * as Manifold3D from "manifold-3d";
import { creasedMesh } from "@bitbybit-dev/base/lib/api/services/helpers/mesh-normals";
import type * as Inputs from "../inputs";

const POSITION_SIZE = 3;
const WITH_NORMALS = 6;

export function positionsOf(mesh: Pick<Manifold3D.Mesh, "numProp" | "vertProperties">): Float32Array {
    if (mesh.numProp === POSITION_SIZE) {
        return mesh.vertProperties;
    }
    const count = mesh.vertProperties.length / mesh.numProp;
    const positions = new Float32Array(count * POSITION_SIZE);
    for (let vertex = 0; vertex < count; vertex++) {
        positions.set(mesh.vertProperties.subarray(vertex * mesh.numProp, vertex * mesh.numProp + POSITION_SIZE), vertex * POSITION_SIZE);
    }
    return positions;
}

export function creasedMeshData(positions: Float32Array, triVerts: Uint32Array, minSharpAngle: number): Pick<Inputs.Manifold.DecomposedManifoldMeshDto, "numProp" | "vertProperties" | "triVerts"> {
    const creased = creasedMesh(positions, triVerts, minSharpAngle);
    const vertProperties = new Float32Array(creased.positions.length / POSITION_SIZE * WITH_NORMALS);
    for (let vertex = 0; vertex * POSITION_SIZE < creased.positions.length; vertex++) {
        vertProperties.set(creased.positions.subarray(vertex * POSITION_SIZE, (vertex + 1) * POSITION_SIZE), vertex * WITH_NORMALS);
        vertProperties.set(creased.normals.subarray(vertex * POSITION_SIZE, (vertex + 1) * POSITION_SIZE), vertex * WITH_NORMALS + POSITION_SIZE);
    }
    return { numProp: WITH_NORMALS, vertProperties, triVerts: creased.indices };
}
