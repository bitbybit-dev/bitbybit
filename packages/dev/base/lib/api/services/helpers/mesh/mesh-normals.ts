import type { CreasedMesh, CreasedVertices } from "../helper-types";
import { radiansOf } from "../geometry/scalars";

const CORNERS = 3;
const COORDINATES = 3;
const Y = 1;
const Z = 2;
const ANGLE_SLACK = 1e-9;

const faceNormalsOf = (positions: ArrayLike<number>, indices: ArrayLike<number>): Float64Array => {
    const normals = new Float64Array(indices.length);
    for (let at = 0; at + CORNERS - 1 < indices.length; at += CORNERS) {
        const a = indices[at]! * COORDINATES;
        const b = indices[at + 1]! * COORDINATES;
        const c = indices[at + 2]! * COORDINATES;
        const ux = positions[b]! - positions[a]!;
        const uy = positions[b + Y]! - positions[a + Y]!;
        const uz = positions[b + Z]! - positions[a + Z]!;
        const vx = positions[c]! - positions[a]!;
        const vy = positions[c + Y]! - positions[a + Y]!;
        const vz = positions[c + Z]! - positions[a + Z]!;
        normals[at] = uy * vz - uz * vy;
        normals[at + Y] = uz * vx - ux * vz;
        normals[at + Z] = ux * vy - uy * vx;
    }
    return normals;
};

const facesAround = (indices: ArrayLike<number>, vertexCount: number): [Int32Array, Int32Array] => {
    const starts = new Int32Array(vertexCount + 1);
    for (let at = 0; at < indices.length; at++) {
        starts[indices[at]! + 1]!++;
    }
    for (let vertex = 0; vertex < vertexCount; vertex++) {
        starts[vertex + 1]! += starts[vertex]!;
    }
    const filled = starts.slice(0, vertexCount);
    const faces = new Int32Array(indices.length);
    for (let at = 0; at < indices.length; at++) {
        faces[filled[indices[at]!]!++] = Math.floor(at / CORNERS);
    }
    return [starts, faces];
};

/**
 * Smooth normals for a mesh that arrives without them: each point takes the sum of the normals of
 * the triangles around it, each as long as twice its triangle's area, scaled to length 1, so a large
 * triangle counts for more than a sliver and the mesh shades smoothly. A point that no triangle with
 * an area touches keeps a normal of zero.
 * @param positions - Flat array of vertex positions [x,y,z,x,y,z,...]
 * @param indices - Triangle indices
 * @returns Flat array of normals [nx,ny,nz,nx,ny,nz,...]
 */
export function computeVertexNormals(positions: ArrayLike<number>, indices: ArrayLike<number>): number[] {
    const faces = faceNormalsOf(positions, indices);
    const normals = new Float64Array(positions.length);
    for (let corner = 0; corner < faces.length; corner++) {
        const face = corner - corner % CORNERS;
        const at = indices[corner]! * COORDINATES;
        normals[at] = normals[at]! + faces[face]!;
        normals[at + Y] = normals[at + Y]! + faces[face + Y]!;
        normals[at + Z] = normals[at + Z]! + faces[face + Z]!;
    }
    for (let at = 0; at + Z < normals.length; at += COORDINATES) {
        const length = Math.hypot(normals[at]!, normals[at + Y]!, normals[at + Z]!);
        if (length > 0) {
            normals[at] = normals[at]! / length;
            normals[at + Y] = normals[at + Y]! / length;
            normals[at + Z] = normals[at + Z]! / length;
        }
    }
    return Array.from(normals);
}

/**
 * Normals that keep sharp edges sharp: around each point, a triangle's corner takes the
 * area-weighted sum of the normals of the triangles around that point that turn from it by less than
 * `minSharpAngle` degrees. Where corners of one point end up with different normals the point is
 * split, so a cube keeps hard edges while a cylinder's side stays smooth. Gives, for each point made,
 * the point it was made from, its normal, and the triangles over the points made; points no
 * triangle uses are left out.
 */
export const creasedVertices = (positions: ArrayLike<number>, indices: ArrayLike<number>, minSharpAngle: number): CreasedVertices => {
    const vertexCount = Math.floor(positions.length / COORDINATES);
    const triangleCount = Math.floor(indices.length / CORNERS);
    const weighted = faceNormalsOf(positions, indices);
    const lengths = new Float64Array(triangleCount);
    for (let face = 0; face < triangleCount; face++) {
        lengths[face] = Math.hypot(weighted[face * COORDINATES]!, weighted[face * COORDINATES + Y]!, weighted[face * COORDINATES + Z]!);
    }
    const [starts, faces] = facesAround(indices, vertexCount);
    const cosine = Math.cos(radiansOf(minSharpAngle)) - ANGLE_SLACK;
    const sources: number[] = [];
    const outNormals: number[] = [];
    const outIndices = new Uint32Array(triangleCount * CORNERS);
    const made: number[][] = Array.from({ length: vertexCount }, () => []);
    for (let corner = 0; corner < triangleCount * CORNERS; corner++) {
        const face = Math.floor(corner / CORNERS);
        const vertex = indices[corner]!;
        let nx = 0;
        let ny = 0;
        let nz = 0;
        for (let around = starts[vertex]!; around < starts[vertex + 1]!; around++) {
            const other = faces[around]!;
            const product = lengths[face]! > 0 && lengths[other]! > 0
                ? (weighted[face * COORDINATES]! * weighted[other * COORDINATES]! + weighted[face * COORDINATES + Y]! * weighted[other * COORDINATES + Y]! + weighted[face * COORDINATES + Z]! * weighted[other * COORDINATES + Z]!) / (lengths[face]! * lengths[other]!)
                : other === face ? 1 : 0;
            if (product >= cosine) {
                nx += weighted[other * COORDINATES]!;
                ny += weighted[other * COORDINATES + Y]!;
                nz += weighted[other * COORDINATES + Z]!;
            }
        }
        const length = Math.hypot(nx, ny, nz);
        if (length > 0) {
            nx /= length;
            ny /= length;
            nz /= length;
        }
        const reuse = made[vertex]!.find((index) => outNormals[index * COORDINATES] === nx && outNormals[index * COORDINATES + Y] === ny && outNormals[index * COORDINATES + Z] === nz);
        if (reuse === undefined) {
            const index = sources.length;
            sources.push(vertex);
            outNormals.push(nx, ny, nz);
            made[vertex]!.push(index);
            outIndices[corner] = index;
        } else {
            outIndices[corner] = reuse;
        }
    }
    return { sources: Uint32Array.from(sources), normals: Float64Array.from(outNormals), indices: outIndices };
};

export const creasedMesh = (positions: ArrayLike<number>, indices: ArrayLike<number>, minSharpAngle: number): CreasedMesh => {
    const creased = creasedVertices(positions, indices, minSharpAngle);
    const outPositions = new Float32Array(creased.sources.length * COORDINATES);
    creased.sources.forEach((vertex, at) => {
        outPositions[at * COORDINATES] = positions[vertex * COORDINATES]!;
        outPositions[at * COORDINATES + Y] = positions[vertex * COORDINATES + Y]!;
        outPositions[at * COORDINATES + Z] = positions[vertex * COORDINATES + Z]!;
    });
    return { positions: outPositions, normals: Float32Array.from(creased.normals), indices: creased.indices };
};
