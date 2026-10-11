import type { CreasedMesh } from "./helper-types";

const CORNERS = 3;
const COORDINATES = 3;
const X = 0;
const Y = 1;
const Z = 2;
const HALF_TURN_DEGREES = 180;
const DEGREES_TO_RADIANS = Math.PI / HALF_TURN_DEGREES;
const ANGLE_SLACK = 1e-9;

/**
 * Compute smooth vertex normals for a mesh that arrives without them.
 * Accumulates each triangle's cross product onto its three vertices, then normalizes, so a vertex
 * shared by several triangles ends up with their average and the mesh shades smoothly.
 * @param positions - Flat array of vertex positions [x,y,z,x,y,z,...]
 * @param indices - Triangle indices
 * @returns Flat array of normals [nx,ny,nz,nx,ny,nz,...]
 */
export function computeVertexNormals(positions: number[], indices: number[]): number[] {
    const numVertices = positions.length / COORDINATES;
    const normals = new Float32Array(positions.length);

    for (let i = 0; i < indices.length; i += CORNERS) {
        const i0 = indices[i]!;
        const i1 = indices[i + 1]!;
        const i2 = indices[i + 2]!;

        const v0x = positions[i0 * COORDINATES + X]!;
        const v0y = positions[i0 * COORDINATES + Y]!;
        const v0z = positions[i0 * COORDINATES + Z]!;

        const v1x = positions[i1 * COORDINATES + X]!;
        const v1y = positions[i1 * COORDINATES + Y]!;
        const v1z = positions[i1 * COORDINATES + Z]!;

        const v2x = positions[i2 * COORDINATES + X]!;
        const v2y = positions[i2 * COORDINATES + Y]!;
        const v2z = positions[i2 * COORDINATES + Z]!;

        const e1x = v1x - v0x;
        const e1y = v1y - v0y;
        const e1z = v1z - v0z;

        const e2x = v2x - v0x;
        const e2y = v2y - v0y;
        const e2z = v2z - v0z;

        const nx = e1y * e2z - e1z * e2y;
        const ny = e1z * e2x - e1x * e2z;
        const nz = e1x * e2y - e1y * e2x;

        normals[i0 * COORDINATES + X]! += nx;
        normals[i0 * COORDINATES + Y]! += ny;
        normals[i0 * COORDINATES + Z]! += nz;

        normals[i1 * COORDINATES + X]! += nx;
        normals[i1 * COORDINATES + Y]! += ny;
        normals[i1 * COORDINATES + Z]! += nz;

        normals[i2 * COORDINATES + X]! += nx;
        normals[i2 * COORDINATES + Y]! += ny;
        normals[i2 * COORDINATES + Z]! += nz;
    }

    for (let i = 0; i < numVertices; i++) {
        const x = normals[i * COORDINATES + X]!;
        const y = normals[i * COORDINATES + Y]!;
        const z = normals[i * COORDINATES + Z]!;
        const len = Math.sqrt(x * x + y * y + z * z);
        if (len > 0) {
            normals[i * COORDINATES + X] = x / len;
            normals[i * COORDINATES + Y] = y / len;
            normals[i * COORDINATES + Z] = z / len;
        }
    }

    return Array.from(normals);
}

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

export const creasedMesh = (positions: ArrayLike<number>, indices: ArrayLike<number>, minSharpAngle: number): CreasedMesh => {
    const vertexCount = Math.floor(positions.length / COORDINATES);
    const triangleCount = Math.floor(indices.length / CORNERS);
    const weighted = faceNormalsOf(positions, indices);
    const lengths = new Float64Array(triangleCount);
    for (let face = 0; face < triangleCount; face++) {
        lengths[face] = Math.hypot(weighted[face * COORDINATES]!, weighted[face * COORDINATES + Y]!, weighted[face * COORDINATES + Z]!);
    }
    const [starts, faces] = facesAround(indices, vertexCount);
    const cosine = Math.cos(minSharpAngle * DEGREES_TO_RADIANS) - ANGLE_SLACK;
    const outPositions: number[] = [];
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
            const index = outPositions.length / COORDINATES;
            outPositions.push(positions[vertex * COORDINATES]!, positions[vertex * COORDINATES + Y]!, positions[vertex * COORDINATES + Z]!);
            outNormals.push(nx, ny, nz);
            made[vertex]!.push(index);
            outIndices[corner] = index;
        } else {
            outIndices[corner] = reuse;
        }
    }
    return { positions: Float32Array.from(outPositions), normals: Float32Array.from(outNormals), indices: outIndices };
};
