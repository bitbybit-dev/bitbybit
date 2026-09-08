/**
 * Compute smooth vertex normals for a mesh that arrives without them.
 * Accumulates each triangle's cross product onto its three vertices, then normalizes, so a vertex
 * shared by several triangles ends up with their average and the mesh shades smoothly.
 * @param positions - Flat array of vertex positions [x,y,z,x,y,z,...]
 * @param indices - Triangle indices
 * @returns Flat array of normals [nx,ny,nz,nx,ny,nz,...]
 */
export function computeVertexNormals(positions: number[], indices: number[]): number[] {
    const numVertices = positions.length / 3;
    const normals = new Float32Array(positions.length);

    for (let i = 0; i < indices.length; i += 3) {
        const i0 = indices[i]!;
        const i1 = indices[i + 1]!;
        const i2 = indices[i + 2]!;

        const v0x = positions[i0 * 3]!;
        const v0y = positions[i0 * 3 + 1]!;
        const v0z = positions[i0 * 3 + 2]!;

        const v1x = positions[i1 * 3]!;
        const v1y = positions[i1 * 3 + 1]!;
        const v1z = positions[i1 * 3 + 2]!;

        const v2x = positions[i2 * 3]!;
        const v2y = positions[i2 * 3 + 1]!;
        const v2z = positions[i2 * 3 + 2]!;

        const e1x = v1x - v0x;
        const e1y = v1y - v0y;
        const e1z = v1z - v0z;

        const e2x = v2x - v0x;
        const e2y = v2y - v0y;
        const e2z = v2z - v0z;

        const nx = e1y * e2z - e1z * e2y;
        const ny = e1z * e2x - e1x * e2z;
        const nz = e1x * e2y - e1y * e2x;

        normals[i0 * 3]! += nx;
        normals[i0 * 3 + 1]! += ny;
        normals[i0 * 3 + 2]! += nz;

        normals[i1 * 3]! += nx;
        normals[i1 * 3 + 1]! += ny;
        normals[i1 * 3 + 2]! += nz;

        normals[i2 * 3]! += nx;
        normals[i2 * 3 + 1]! += ny;
        normals[i2 * 3 + 2]! += nz;
    }

    for (let i = 0; i < numVertices; i++) {
        const x = normals[i * 3]!;
        const y = normals[i * 3 + 1]!;
        const z = normals[i * 3 + 2]!;
        const len = Math.sqrt(x * x + y * y + z * z);
        if (len > 0) {
            normals[i * 3] = x / len;
            normals[i * 3 + 1] = y / len;
            normals[i * 3 + 2] = z / len;
        }
    }

    return Array.from(normals);
}
