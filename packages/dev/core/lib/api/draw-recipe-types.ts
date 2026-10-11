import type { Base } from "@bitbybit-dev/base";

/**
 * How `recipeDrawPlanOf` groups a recipe's meshes for drawing.
 */
export interface RecipeDrawOptions {
    /** The tag that names an element, so the roots sharing its value draw, hide and pick as one. */
    elementKey: string;
    /** Whether a mesh placed often enough is drawn as instances rather than copied into a batch. */
    instancing: boolean;
    /** How many placements of one mesh, each only turned and moved, make it instances. */
    minInstances: number;
    /** The most vertices one merged batch holds; a placement larger than this gets a batch of its own. */
    maxBatchVertices: number;
    /** The color, red, green, blue and alpha from 0 to 1, of a root whose tag has no `rgba`. */
    defaultColor: Base.ColorRGBA;
    /** Whether every triangle is wound the other way, for a renderer that draws a mesh's triangles reversed. */
    reverseWinding: boolean;
}

/**
 * Where one element's triangles lie in a merged batch: a run of triangles and the run of vertices
 * they use, both contiguous.
 */
export interface RecipeDrawRange {
    /** The element, a position in the plan's elements. */
    element: number;
    /** The first triangle of the run. */
    firstTriangle: number;
    /** How many triangles the run holds. */
    triangles: number;
    /** The first vertex of the run. */
    firstVertex: number;
    /** How many vertices the run holds. */
    vertices: number;
}

/**
 * One merged batch: the placed meshes of many roots in one buffer, positions relative to `origin`
 * so that single precision keeps them exact far from zero.
 */
export interface RecipeDrawBatch {
    /** Whether any of its colors lets light through, so it is drawn with blending. */
    transparent: boolean;
    /** The point the positions are measured from, which the drawn batch is moved to. */
    origin: Base.Point3;
    /** Three numbers per vertex. */
    positions: Float32Array;
    /** Three numbers per vertex, of length 1. */
    normals: Float32Array;
    /** Four numbers per vertex: red, green and blue in linear light, and alpha, from 0 to 1. */
    colors: Float32Array;
    /** Three vertex indices per triangle. */
    indices: Uint32Array;
    /** Each placed root's run of triangles and vertices, in order of their first triangle. */
    ranges: RecipeDrawRange[];
}

/**
 * One mesh drawn many times, each instance placed by its own matrix relative to `origin`.
 */
export interface RecipeDrawInstances {
    /** The mesh, a position in the plan's meshes. */
    mesh: number;
    /** Whether the instances' colors let light through; every instance of a group has the same alpha. */
    transparent: boolean;
    /** The point the matrices place relative to, which the drawn instances are moved to. */
    origin: Base.Point3;
    /** Sixteen numbers per instance, a column-major 4 x 4 matrix. */
    matrices: Float32Array;
    /** Four numbers per instance: red, green and blue in linear light, and alpha, from 0 to 1. */
    colors: Float32Array;
    /** The element of each instance. */
    elements: Uint32Array;
}

/**
 * The vertex data of a mesh the plan draws as instances.
 */
export interface RecipeDrawMesh {
    /** Three numbers per vertex. */
    positions: Float32Array;
    /** Three numbers per vertex, of length 1. */
    normals: Float32Array;
    /** Three vertex indices per triangle. */
    indices: Uint32Array;
}

/**
 * Where one part of an element is drawn: a run of a merged batch, or one instance of a group.
 */
export interface RecipeDrawPart {
    /** The merged batch, a position in the plan's batches, when the part is in one. */
    batch?: number | undefined;
    /** The run in that batch's ranges. */
    range?: number | undefined;
    /** The instance group, a position in the plan's instances, when the part is an instance. */
    instances?: number | undefined;
    /** The instance in that group. */
    instance?: number | undefined;
}

/**
 * One element of a drawn recipe: the roots sharing its key, drawn, hidden and picked as one.
 */
export interface RecipeDrawElement {
    /** The value of the element tag, or `root:` and the position of its only root without one. */
    key: string;
    /** The tag of its first root. */
    tag: Record<string, Base.RecipeTagValue>;
    /** The recipe group of its first root, when it has one. */
    group?: number | undefined;
    /** Where each of its parts is drawn. */
    parts: RecipeDrawPart[];
}

/**
 * A recipe's meshes grouped for drawing with few draw calls: merged batches split by whether they
 * let light through, and instance groups for meshes placed many times, with the elements they draw.
 */
export interface RecipeDrawPlan {
    /** The elements, in the order their first roots come. */
    elements: RecipeDrawElement[];
    /** The merged batches. */
    batches: RecipeDrawBatch[];
    /** The meshes the instance groups draw. */
    meshes: RecipeDrawMesh[];
    /** The instance groups. */
    instances: RecipeDrawInstances[];
}
