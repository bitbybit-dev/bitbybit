import type { Base } from "../inputs/base-inputs";
import { followedBy, isRigidMatrix, isTransformMatrix } from "../services/helpers/geometry/matrices";
import type { RecipeSource } from "./recipe-types";
import { isIndexBelow } from "./checks";

export function recipeSourceOf(recipe: Base.Recipe, node: number, matrix: Base.TransformMatrix): RecipeSource {
    let source = node;
    let placed = matrix;
    for (let step = recipe.nodes[source]; step?.op === "transform" && isTransformMatrix(step.matrix) && isRigidMatrix(step.matrix) && isIndexBelow(step.of, source); step = recipe.nodes[source]) {
        placed = followedBy(step.matrix, placed);
        source = step.of;
    }
    return { node: source, matrix: placed };
}
