import { computeVertexNormals } from "@bitbybit-dev/base/lib/api/services/helpers/mesh/mesh-normals";
import type { MergedMeshBuffers, MeshMerge, MeshPart } from "./draw-helper-types";

const POSITION_SIZE = 3;
const UV_SIZE = 2;
const DEFAULT_COLOR_SIZE = 4;

const normalsOf = (part: MeshPart): ArrayLike<number> =>
    part.normals !== undefined && part.normals.length === part.positions.length ? part.normals : computeVertexNormals(part.positions, part.indices);

/**
 * Joins pieces of a surface into one set of typed buffers, counting first and writing each array
 * once, so a piece of any size costs one pass and no intermediate lists. A piece without normals
 * gets smooth ones from its own triangles. A piece whose positions or indexes do not come in threes
 * is refused rather than drawn with triangles that point at vertex 0.
 */
export function mergedMeshBuffers(parts: readonly MeshPart[], merge: MeshMerge = {}): MergedMeshBuffers {
    const colorSize = merge.colorSize ?? DEFAULT_COLOR_SIZE;
    let vertexCount = 0;
    let indexCount = 0;
    parts.forEach((part, at) => {
        if (part.positions.length % POSITION_SIZE !== 0 || part.indices.length % POSITION_SIZE !== 0) {
            throw new Error(`Mesh part ${at} holds ${part.positions.length} position values and ${part.indices.length} indexes; both must be whole points and triangles, three values each.`);
        }
        vertexCount += part.positions.length / POSITION_SIZE;
        indexCount += part.indices.length;
    });
    const positions = new Float32Array(vertexCount * POSITION_SIZE);
    const normals = new Float32Array(vertexCount * POSITION_SIZE);
    const indices = new Uint32Array(indexCount);
    const uvs = parts.some(part => part.uvs !== undefined && part.uvs.length > 0) ? new Float32Array(vertexCount * UV_SIZE) : undefined;
    const colors = parts.length > 0 && parts.every(part => part.colors !== undefined && part.colors.length === part.positions.length / POSITION_SIZE * colorSize)
        ? new Float32Array(vertexCount * colorSize)
        : undefined;
    const sign = merge.flipNormals ? -1 : 1;
    const [second, third] = merge.reverseWinding ? [2, 1] : [1, 2];
    let vertex = 0;
    let index = 0;
    for (const part of parts) {
        const count = part.positions.length / POSITION_SIZE;
        positions.set(part.positions, vertex * POSITION_SIZE);
        const partNormals = normalsOf(part);
        for (let i = 0; i < partNormals.length; i++) {
            normals[vertex * POSITION_SIZE + i] = sign * partNormals[i]!;
        }
        if (uvs !== undefined && part.uvs !== undefined && part.uvs.length === count * UV_SIZE) {
            uvs.set(part.uvs, vertex * UV_SIZE);
        }
        if (colors !== undefined) {
            colors.set(part.colors!, vertex * colorSize);
        }
        for (let i = 0; i < part.indices.length; i += POSITION_SIZE) {
            indices[index + i] = part.indices[i]! + vertex;
            indices[index + i + 1] = part.indices[i + second]! + vertex;
            indices[index + i + 2] = part.indices[i + third]! + vertex;
        }
        vertex += count;
        index += part.indices.length;
    }
    return { positions, normals, indices, uvs, colors };
}
