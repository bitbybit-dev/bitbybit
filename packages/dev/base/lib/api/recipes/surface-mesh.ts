import type { Base } from "../inputs/base-inputs";
import { InputError } from "../kernel-calls/errors";
import { followedBy, linearDeterminant } from "../services/helpers/matrices";
import { POINT3_SIZE, TRIANGLE_CORNERS } from "./limits.constants";
import type { RecipeSurfaceMesh, SurfacePiece } from "./recipe-types";
import { assertRecipe } from "./validate";

const Z_TO_Y: Base.TransformMatrix = [1, 0, 0, 0, 0, 0, -1, 0, 0, 1, 0, 0, 0, 0, 0, 1];
const X = 0;
const Y = 1;
const Z = 2;
const COLUMN = 4;
const TRANSLATION = 12;

function collectPieces(nodes: readonly Base.RecipeNode[], index: number, matrix: Base.TransformMatrix, pieces: SurfacePiece[]): boolean {
    const node = nodes[index]!;
    switch (node.op) {
        case "triangles":
            pieces.push({ node, matrix });
            return true;
        case "transform":
            return collectPieces(nodes, node.of, followedBy(node.matrix, matrix), pieces);
        case "compound":
            return node.of.every((child) => collectPieces(nodes, child, matrix, pieces));
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
            positions[vertexAt * POINT3_SIZE + X] = m[X]! * x + m[COLUMN + X]! * y + m[2 * COLUMN + X]! * z + m[TRANSLATION + X]!;
            positions[vertexAt * POINT3_SIZE + Y] = m[Y]! * x + m[COLUMN + Y]! * y + m[2 * COLUMN + Y]! * z + m[TRANSLATION + Y]!;
            positions[vertexAt * POINT3_SIZE + Z] = m[Z]! * x + m[COLUMN + Z]! * y + m[2 * COLUMN + Z]! * z + m[TRANSLATION + Z]!;
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

/**
 * The triangle meshes a recipe's roots describe, for the roots built from triangle nodes alone
 * (through transforms and compounds), placed by their matrices; no kernel is needed. A root that
 * holds any other step, such as an extrusion or a cut, gives undefined. This is how an open mesh
 * no solid kernel accepts, such as a building model's furniture surfaces, can still be drawn.
 *
 * Experimental: the recipe format may still change before it is declared stable.
 * @param recipe - The recipe, checked as `assertRecipe` checks it
 * @param roots - The positions of the roots to read, all of them when left out
 * @param adjustZtoY - Whether `(x, y, z)` becomes `(x, z, -y)`, as a recipe build does with the same option
 * @returns One mesh per asked root, in the order asked, or undefined where the root is not made of triangles alone
 * @beta
 */
export function recipeSurfaceMeshes(recipe: unknown, roots?: readonly number[], adjustZtoY = false): (RecipeSurfaceMesh | undefined)[] {
    assertRecipe(recipe);
    const asked = roots ?? recipe.roots.map((_, index) => index);
    const bad = asked.find((index) => !Number.isSafeInteger(index) || index < 0 || index >= recipe.roots.length);
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
