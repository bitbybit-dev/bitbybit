import type * as Manifold3D from "manifold-3d";
import type { Base } from "@bitbybit-dev/base";
import { recipeSourceOf, recipeSurfaceMeshes } from "@bitbybit-dev/base";
import type * as Inputs from "../../inputs";
import type * as Resolved from "../../resolved-inputs";
import { creasedMeshData, positionsOf } from "../mesh-data";
import { executeRecipeNodes, turnedZtoY } from "./recipe-executor";

const IDENTITY: Base.TransformMatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
const NO_MESH = -1;

function placedBy(matrix: Base.TransformMatrix, adjustZtoY: boolean): Base.TransformMatrix {
    return adjustZtoY ? turnedZtoY(matrix) : [...matrix] as Base.TransformMatrix;
}

function meshOf(solid: Manifold3D.Manifold, minSharpAngle: number): Inputs.Manifold.DecomposedManifoldMeshDto | undefined {
    if (solid.isEmpty()) {
        return undefined;
    }
    const plain = solid.getMesh();
    return creasedMeshData(positionsOf(plain), plain.triVerts, minSharpAngle);
}

export function recipeMeshes(wasm: Manifold3D.ManifoldToplevel, recipe: Base.Recipe, options: Omit<Resolved.Manifold.BuildRecipeMeshesDto, "recipe">): Inputs.Manifold.RecipeMeshesDto {
    const sources = recipe.roots.map((root) => recipeSourceOf(recipe, root.node, root.matrix));
    const solids = executeRecipeNodes(wasm, recipe, options.circularSegments, options.emptyWhenFailed, [...new Set(sources.map((source) => source.node))]);
    const meshes: Inputs.Manifold.DecomposedManifoldMeshDto[] = [];
    const meshOfNode = new Map<number, number>();
    try {
        solids.forEach((solid, node) => {
            const mesh = solid === undefined ? undefined : meshOf(solid, options.minSharpAngle);
            if (mesh !== undefined) {
                meshOfNode.set(node, meshes.push(mesh) - 1);
            }
        });
    } finally {
        solids.forEach((solid) => solid?.delete());
    }
    const placements = recipe.roots.map((root, index): Inputs.Manifold.RecipeMeshPlacementDto => ({
        mesh: meshOfNode.get(sources[index]!.node) ?? NO_MESH,
        matrix: placedBy(sources[index]!.matrix, options.adjustZtoY),
        tag: root.tag,
        ...(root.group === undefined ? {} : { group: root.group }),
    }));
    const failed = sources.flatMap((source, index) => solids.get(source.node) === undefined ? [index] : []);
    recipeSurfaceMeshes(recipe, failed, false).forEach((surface, at) => {
        if (surface === undefined) {
            return;
        }
        const placement = placements[failed[at]!]!;
        placement.mesh = meshes.push(creasedMeshData(surface.positions, surface.indices, options.minSharpAngle)) - 1;
        placement.matrix = placedBy(IDENTITY, options.adjustZtoY);
    });
    return { meshes, placements };
}
