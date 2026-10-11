import type { Base } from "../inputs/base-inputs";
import { followedBy, isRigidMatrix } from "../services/helpers/matrices";
import type { RecipeSource } from "./recipe-types";

/**
 * The step a recipe node places, found by folding every transform step that only turns and moves
 * into the matrix that places it, so roots that place one step through different moves share it.
 *
 * A transform that mirrors, scales or stretches stays a step of its own.
 *
 * Experimental: the recipe format may still change before it is declared stable.
 * @param recipe - The recipe the node belongs to, already checked
 * @param node - The node to follow, such as a root's
 * @param matrix - What places the node, such as its root's matrix
 * @returns The step reached and the matrix placing it
 * @beta
 */
export function recipeSourceOf(recipe: Base.Recipe, node: number, matrix: Base.TransformMatrix): RecipeSource {
    let source = node;
    let placed = matrix;
    for (let step = recipe.nodes[source]; step?.op === "transform" && isRigidMatrix(step.matrix); step = recipe.nodes[source]) {
        placed = followedBy(step.matrix, placed);
        source = step.of;
    }
    return { node: source, matrix: placed };
}
