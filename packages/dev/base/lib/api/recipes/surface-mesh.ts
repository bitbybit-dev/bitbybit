import type { Base } from "../inputs/base-inputs";
import { InputError } from "../kernel-calls/errors";
import { followedBy, linearDeterminant, movedCoordinate } from "../services/helpers/geometry/matrices";
import { POINT3_SIZE, TRIANGLE_CORNERS } from "./limits.constants";
import type { RecipeSurfaceMesh, SurfacePiece } from "./recipe-types";
import { toRecipe } from "./validate";
import { isIndexBelow } from "./checks";

const Z_TO_Y: Base.TransformMatrix = [1, 0, 0, 0, 0, 0, -1, 0, 0, 1, 0, 0, 0, 0, 0, 1];
const X = 0;
const Y = 1;
const Z = 2;

function collectPieces(nodes: readonly Base.RecipeNode[], index: number, matrix: Base.TransformMatrix, pieces: SurfacePiece[]): boolean {
    const node = nodes[index]!;
    switch (node.op) {
        case "triangles":
            pieces.push({ node, matrix });
            return true;
        case "transform":
            return collectPieces(nodes, node.of, followedBy(node.matrix, matrix), pieces);
        case "compound":
        case "union":
            return node.of.every((child) => collectPieces(nodes, child, matrix, pieces));
        case "voids":
            return collectPieces(nodes, node.host, matrix, pieces);
        case "brep":
            return node.fallback !== undefined && collectPieces(nodes, node.fallback, matrix, pieces);
        default:
            return false;
    }
}

function meshOfPieces(buffers: Base.RecipeBuffers, pieces: readonly SurfacePiece[]): RecipeSurfaceMesh {
    const vertexCount = pieces.reduce((count, piece) => count + piece.node.positions[1] / POINT3_SIZE, 0);
    const indexCount = pieces.reduce((count, piece) => count + piece.node.indices[1], 0);
    const positions = new Float32Array(vertexCount * POINT3_SIZE);
    const indices = new Uint32Array(indexCount);
    let vertexAt = 0;
    let indexAt = 0;
    for (const { node, matrix } of pieces) {
        const m: readonly number[] = matrix;
        const [start, length] = node.positions;
        for (let at = start; at < start + length; at += POINT3_SIZE) {
            const x = buffers.f64[at + X]!;
            const y = buffers.f64[at + Y]!;
            const z = buffers.f64[at + Z]!;
            positions[vertexAt * POINT3_SIZE + X] = movedCoordinate(m, x, y, z, X);
            positions[vertexAt * POINT3_SIZE + Y] = movedCoordinate(m, x, y, z, Y);
            positions[vertexAt * POINT3_SIZE + Z] = movedCoordinate(m, x, y, z, Z);
            vertexAt++;
        }
        const first = vertexAt - length / POINT3_SIZE;
        const mirrored = linearDeterminant(matrix) < 0;
        const [indexStart, indexLength] = node.indices;
        for (let at = indexStart; at < indexStart + indexLength; at += TRIANGLE_CORNERS) {
            indices[indexAt] = first + buffers.i32[at]!;
            indices[indexAt + 1] = first + buffers.i32[at + (mirrored ? 2 : 1)]!;
            indices[indexAt + 2] = first + buffers.i32[at + (mirrored ? 1 : 2)]!;
            indexAt += TRIANGLE_CORNERS;
        }
    }
    return { positions, indices };
}

export function recipeSurfaceMeshes(value: unknown, roots?: readonly number[], adjustZtoY = false): (RecipeSurfaceMesh | undefined)[] {
    const recipe = toRecipe(value);
    const asked = roots ?? recipe.roots.map((_, index) => index);
    const bad = asked.find((index): boolean => !isIndexBelow(index, recipe.roots.length));
    if (bad !== undefined) {
        throw new InputError(`Root ${bad} is not one of the recipe's ${recipe.roots.length} roots`, "roots");
    }
    return asked.map((index) => {
        const root = recipe.roots[index]!;
        const pieces: SurfacePiece[] = [];
        const placement = adjustZtoY ? followedBy(root.matrix, Z_TO_Y) : root.matrix;
        return collectPieces(recipe.nodes, root.node, placement, pieces) ? meshOfPieces(recipe.buffers, pieces) : undefined;
    });
}
