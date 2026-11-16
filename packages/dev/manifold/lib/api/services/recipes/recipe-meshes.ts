import type * as Manifold3D from "manifold-3d";
import type { Base, Inputs as BaseInputs } from "@bitbybit-dev/base";
import { Recipes } from "@bitbybit-dev/base";
import type * as Inputs from "../../inputs";
import type * as Resolved from "../../resolved-inputs";
import { creasedMeshData, positionsOf } from "../mesh-data";
import { executeRecipeNodes } from "./recipe-executor";
import { mirrorIntoModel, placedAmongMirrored, turnedZtoY } from "./recipe-placing";

const IDENTITY: Base.TransformMatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
const NO_MESH = -1;
function placedBy(matrix: Base.TransformMatrix, adjustZtoY: boolean): Base.TransformMatrix {
    return adjustZtoY ? turnedZtoY(matrix) : [...matrix] as Base.TransformMatrix;
}

function meshOf(solid: Manifold3D.Manifold, minSharpAngle: number, mirror: Base.TransformMatrix | undefined): Inputs.Manifold.DecomposedManifoldMeshDto | undefined {
    if (solid.isEmpty()) {
        return undefined;
    }
    if (mirror === undefined) {
        const plain = solid.getMesh();
        return creasedMeshData(positionsOf(plain), plain.triVerts, minSharpAngle);
    }
    const mirrored = solid.transform(mirror);
    try {
        const plain = mirrored.getMesh();
        return creasedMeshData(positionsOf(plain), plain.triVerts, minSharpAngle);
    } finally {
        mirrored.delete();
    }
}

export function recipeMeshes(wasm: Manifold3D.ManifoldToplevel, recipes: Recipes, recipe: Base.Recipe, options: Omit<Resolved.Manifold.BuildRecipeMeshesDto, "recipe">, coordinateSystem?: BaseInputs.Base.coordinateSystemEnum): Inputs.Manifold.RecipeMeshesDto {
    const mirror = mirrorIntoModel(coordinateSystem, options.adjustZtoY);
    const sources = recipe.roots.map((root) => recipes.sourceOf({ recipe, node: root.node, matrix: root.matrix }));
    const solids = executeRecipeNodes(wasm, recipe, options.circularSegments, options.emptyWhenFailed, [...new Set(sources.map((source) => source.node))]);
    const meshes: Inputs.Manifold.DecomposedManifoldMeshDto[] = [];
    const meshOfNode = new Map<number, number>();
    try {
        solids.forEach((solid, node) => {
            const mesh = solid === undefined ? undefined : meshOf(solid, options.minSharpAngle, mirror);
            if (mesh !== undefined) {
                meshOfNode.set(node, meshes.push(mesh) - 1);
            }
        });
    } finally {
        solids.forEach((solid) => solid?.delete());
    }
    const placements = recipe.roots.map((root, index): Inputs.Manifold.RecipeMeshPlacementDto => ({
        mesh: meshOfNode.get(sources[index]!.node) ?? NO_MESH,
        matrix: mirror === undefined ? placedBy(sources[index]!.matrix, options.adjustZtoY) : placedAmongMirrored(sources[index]!.matrix, mirror),
        tag: root.tag,
        ...(root.group === undefined ? {} : { group: root.group }),
    }));
    const failed = sources.flatMap((source, index) => solids.get(source.node) === undefined ? [index] : []);
    const surfaces = new Recipes(() => (mirror === undefined || coordinateSystem === undefined ? {} : { coordinateSystem }));
    surfaces.surfaceMeshes({ recipe, roots: failed, adjustZtoY: mirror !== undefined && options.adjustZtoY }).forEach((surface, at) => {
        if (surface === undefined) {
            return;
        }
        const placement = placements[failed[at]!]!;
        placement.mesh = meshes.push(creasedMeshData(surface.positions, surface.indices, options.minSharpAngle)) - 1;
        placement.matrix = mirror === undefined ? placedBy(IDENTITY, options.adjustZtoY) : [...IDENTITY];
    });
    return { meshes, placements };
}
