import type { KeptDesignMesh } from "./draw-appearance";
import type { DrawableShapeMesh } from "./draw-helper-types";

const POSITION_SIZE = 3;

type DrawableFace = DrawableShapeMesh["faceList"][number];

function isNumberList(values: unknown): values is ArrayLike<number> {
    return Array.isArray(values) || (ArrayBuffer.isView(values) && !(values instanceof DataView));
}

function inThrees(values: ArrayLike<number>): boolean {
    return values.length % POSITION_SIZE === 0;
}

function faceNameOf(faceIndex: unknown, at: number): string {
    return typeof faceIndex === "number" ? `Face ${faceIndex}` : `The face at ${at}`;
}

function strayIndexOf(indexes: ArrayLike<number>, vertexCount: number): number | undefined {
    for (let at = 0; at < indexes.length; at++) {
        const index = indexes[at]!;
        if (!(Number.isInteger(index) && index >= 0 && index < vertexCount)) {
            return index;
        }
    }
    return undefined;
}

/**
 * Refuses a mesh with a face that cannot be drawn: one whose positions or triangle indexes are not a
 * list of numbers, do not come in threes, or point at a vertex the face does not have, as indexes
 * counted from 1 do. A drawer checks a mesh before it adds anything to the
 * scene, so a refused mesh leaves nothing behind, and the error names the face by its `faceIndex`,
 * the number `shapes.face.getFaces` gives it, so a mesh built by hand points at the face to fix.
 * Normals are not checked: a face whose normals do not match its positions gets smooth ones worked
 * out from its triangles.
 * @param mesh - The mesh as a caller or the worker hands it to a drawer
 * @throws Error naming the first face that cannot be drawn
 */
export function checkDrawableMesh(mesh: DrawableShapeMesh): void {
    const faces: readonly DrawableFace[] = Array.isArray(mesh?.faceList) ? mesh.faceList : [];
    faces.forEach((face, at) => {
        const positions: unknown = face?.vertexCoord;
        const indexes: unknown = face?.triIndexes;
        if (!isNumberList(positions) || !isNumberList(indexes)) {
            throw new Error(`${faceNameOf(face?.faceIndex, at)} cannot be drawn: its positions and its triangle indexes must each be a list of numbers.`);
        }
        if (!inThrees(positions) || !inThrees(indexes)) {
            throw new Error(`${faceNameOf(face.faceIndex, at)} cannot be drawn: it holds ${positions.length} position values and ${indexes.length} indexes; both must be whole points and triangles, three values each.`);
        }
        const vertexCount = positions.length / POSITION_SIZE;
        const stray = strayIndexOf(indexes, vertexCount);
        if (stray !== undefined) {
            throw new Error(`${faceNameOf(face.faceIndex, at)} cannot be drawn: a triangle points at vertex ${stray} of its ${vertexCount} vertices; indexes count the face's own vertices from 0.`);
        }
    });
}

/**
 * Refuses a mesh a caller hands back to `keepDesignMeshes` that can no longer be drawn. The meshes
 * `keptDesignMeshes` hands out are views into buffers that crossed from the worker, and they survive
 * a structured clone, but not every way of storing them: stored as JSON a typed array comes back as a
 * plain record, and posted to another thread with its buffers in the transfer list every view is left
 * empty. Either would draw nothing, or fail far from its cause, so the error says which happened.
 * @param kept - The mesh with its part's shape hash
 * @throws Error naming the shape hash and the first face that cannot be drawn
 */
export function checkKeptDesignMesh(kept: KeptDesignMesh<DrawableShapeMesh>): void {
    const cannotDraw = `The mesh kept for ${kept.shapeHash} cannot be drawn`;
    kept.mesh.faceList.forEach(face => {
        const positions: unknown = face.vertexCoord;
        const normals: unknown = face.normalCoord;
        const indexes: unknown = face.triIndexes;
        if (!isNumberList(positions) || !isNumberList(normals) || !isNumberList(indexes)) {
            throw new Error(`${cannotDraw}: face ${face.faceIndex} holds its positions, normals or indexes as something other than a list of numbers, as typed arrays stored as JSON come back. Keep the meshes in a store that keeps typed arrays, such as IndexedDB.`);
        }
        if (face.numberOfTriangles > 0 && indexes.length === 0) {
            throw new Error(`${cannotDraw}: face ${face.faceIndex} counts ${face.numberOfTriangles} triangles but holds no indexes, as a mesh does once its buffers were handed away to another thread. Post the meshes keptDesignMeshes hands out without transferring their buffers.`);
        }
        if (!inThrees(positions) || !inThrees(normals) || !inThrees(indexes)) {
            throw new Error(`${cannotDraw}: face ${face.faceIndex} holds ${positions.length} position values, ${normals.length} normal values and ${indexes.length} indexes; each must come in threes.`);
        }
    });
}
