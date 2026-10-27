import { srgbToLinear } from "@bitbybit-dev/base/lib/api/services/helpers/color/color-space";
import { isRigidMatrix, linearDeterminant, movedCoordinate } from "@bitbybit-dev/base/lib/api/services/helpers/geometry/matrices";
import { creasedMesh } from "@bitbybit-dev/base/lib/api/services/helpers/mesh/mesh-normals";
import type * as Inputs from "./inputs";
import type { Base } from "@bitbybit-dev/base";
import type { RecipeDrawBatch, RecipeDrawElement, RecipeDrawInstances, RecipeDrawMesh, RecipeDrawOptions, RecipeDrawPlan, RecipeDrawRange } from "./draw-recipe-types";
import { add3, length3, scale3 } from "@bitbybit-dev/base/lib/api/services/helpers/geometry/vectors";

const POSITION_SIZE = 3;
const NORMALS_AT = 3;
const WITH_NORMALS = 6;
const RGBA_SIZE = 4;
const MATRIX_SIZE = 16;
const TRIANGLE_CORNERS = 3;
const FALLBACK_SHARP_ANGLE = 40;
const CORNERS = 8;
const TRANSLATION_AT = 12;
const Z_CORNER_BIT = 4;

const DEFAULT_OPTIONS: RecipeDrawOptions = {
    elementKey: "globalId",
    instancing: true,
    minInstances: 2,
    maxBatchVertices: 1_000_000,
    defaultColor: { r: 0.8, g: 0.8, b: 0.8, a: 1 },
    reverseWinding: false,
};

interface PlacedRoot {
    root: number;
    mesh: number;
    matrix: Base.TransformMatrix;
    color: readonly number[];
    transparent: boolean;
    element: number;
}

interface MeshBox {
    min: Base.Point3;
    max: Base.Point3;
}

function colorOf(tag: Record<string, Base.RecipeTagValue>, fallback: Base.ColorRGBA): readonly number[] {
    const rgba = tag["rgba"];
    if (Array.isArray(rgba) && (rgba.length === RGBA_SIZE || rgba.length === POSITION_SIZE) && rgba.every((value) => Number.isFinite(value))) {
        return [srgbToLinear(rgba[0]!), srgbToLinear(rgba[1]!), srgbToLinear(rgba[2]!), rgba[POSITION_SIZE] ?? 1];
    }
    return [srgbToLinear(fallback.r), srgbToLinear(fallback.g), srgbToLinear(fallback.b), fallback.a];
}

function keyOf(tag: Record<string, Base.RecipeTagValue>, elementKey: string, root: number): string {
    const value = tag[elementKey];
    return typeof value === "string" && value !== "" || typeof value === "number" && Number.isFinite(value) ? `${value}` : `root:${root}`;
}

function reversed(indices: Uint32Array): Uint32Array {
    const turned = new Uint32Array(indices.length);
    for (let corner = 0; corner < indices.length; corner += TRIANGLE_CORNERS) {
        turned[corner] = indices[corner]!;
        turned[corner + 1] = indices[corner + 2]!;
        turned[corner + 2] = indices[corner + 1]!;
    }
    return turned;
}

function drawMeshOf(mesh: Inputs.Manifold.DecomposedManifoldMeshDto): RecipeDrawMesh {
    const count = mesh.vertProperties.length / mesh.numProp;
    const positions = new Float32Array(count * POSITION_SIZE);
    for (let vertex = 0; vertex < count; vertex++) {
        positions.set(mesh.vertProperties.subarray(vertex * mesh.numProp, vertex * mesh.numProp + POSITION_SIZE), vertex * POSITION_SIZE);
    }
    if (mesh.numProp < WITH_NORMALS) {
        const creased = creasedMesh(positions, mesh.triVerts, FALLBACK_SHARP_ANGLE);
        return { positions: creased.positions, normals: creased.normals, indices: creased.indices };
    }
    const normals = new Float32Array(count * POSITION_SIZE);
    for (let vertex = 0; vertex < count; vertex++) {
        normals.set(mesh.vertProperties.subarray(vertex * mesh.numProp + NORMALS_AT, vertex * mesh.numProp + NORMALS_AT + POSITION_SIZE), vertex * POSITION_SIZE);
    }
    return { positions, normals, indices: mesh.triVerts };
}

function boxOf(positions: Float32Array): MeshBox {
    const min: Base.Point3 = [Infinity, Infinity, Infinity];
    const max: Base.Point3 = [-Infinity, -Infinity, -Infinity];
    for (let at = 0; at < positions.length; at += POSITION_SIZE) {
        for (let axis = 0; axis < POSITION_SIZE; axis++) {
            min[axis] = Math.min(min[axis]!, positions[at + axis]!);
            max[axis] = Math.max(max[axis]!, positions[at + axis]!);
        }
    }
    return { min, max };
}

function centreOf(boxes: readonly MeshBox[]): Base.Point3 {
    const min = [Infinity, Infinity, Infinity];
    const max = [-Infinity, -Infinity, -Infinity];
    for (const box of boxes) {
        for (let axis = 0; axis < POSITION_SIZE; axis++) {
            min[axis] = Math.min(min[axis]!, box.min[axis]!);
            max[axis] = Math.max(max[axis]!, box.max[axis]!);
        }
    }
    return scale3(add3([min[0]!, min[1]!, min[2]!], [max[0]!, max[1]!, max[2]!]), 1 / 2);
}

function placedBox(box: MeshBox, matrix: readonly number[]): MeshBox {
    const min: Base.Point3 = [Infinity, Infinity, Infinity];
    const max: Base.Point3 = [-Infinity, -Infinity, -Infinity];
    for (let corner = 0; corner < CORNERS; corner++) {
        const x = corner & 1 ? box.max[0] : box.min[0];
        const y = corner & 2 ? box.max[1] : box.min[1];
        const z = corner & Z_CORNER_BIT ? box.max[2] : box.min[2];
        for (let axis = 0; axis < POSITION_SIZE; axis++) {
            const value = movedCoordinate(matrix, x, y, z, axis);
            min[axis] = Math.min(min[axis]!, value);
            max[axis] = Math.max(max[axis]!, value);
        }
    }
    return { min, max };
}

function normalMatrixOf(matrix: readonly number[]): number[] {
    const [a, b, c, , d, e, f, , g, h, i] = matrix as number[];
    const sign = Math.sign(linearDeterminant(matrix)) || 1;
    return [
        sign * (e! * i! - f! * h!), sign * (f! * g! - d! * i!), sign * (d! * h! - e! * g!),
        sign * (c! * h! - b! * i!), sign * (a! * i! - c! * g!), sign * (b! * g! - a! * h!),
        sign * (b! * f! - c! * e!), sign * (c! * d! - a! * f!), sign * (a! * e! - b! * d!),
    ];
}

function bake(batch: RecipeDrawBatch, placed: PlacedRoot, mesh: RecipeDrawMesh, vertex: number, triangle: number, reverseWinding: boolean): RecipeDrawRange {
    const { matrix, color } = placed;
    const normal = normalMatrixOf(matrix);
    const count = mesh.positions.length / POSITION_SIZE;
    for (let at = 0; at < count; at++) {
        const [x, y, z] = [mesh.positions[at * POSITION_SIZE]!, mesh.positions[at * POSITION_SIZE + 1]!, mesh.positions[at * POSITION_SIZE + 2]!];
        const [nx, ny, nz] = [mesh.normals[at * POSITION_SIZE]!, mesh.normals[at * POSITION_SIZE + 1]!, mesh.normals[at * POSITION_SIZE + 2]!];
        const turned = [normal[0]! * nx + normal[3]! * ny + normal[6]! * nz, normal[1]! * nx + normal[4]! * ny + normal[7]! * nz, normal[2]! * nx + normal[5]! * ny + normal[8]! * nz];
        const length = length3([turned[0]!, turned[1]!, turned[2]!]) || 1;
        for (let axis = 0; axis < POSITION_SIZE; axis++) {
            batch.positions[(vertex + at) * POSITION_SIZE + axis] = movedCoordinate(matrix, x, y, z, axis) - batch.origin[axis]!;
            batch.normals[(vertex + at) * POSITION_SIZE + axis] = turned[axis]! / length;
        }
        batch.colors.set(color, (vertex + at) * RGBA_SIZE);
    }
    const mirrors = linearDeterminant(matrix) < 0 !== reverseWinding;
    const triangles = mesh.indices.length / TRIANGLE_CORNERS;
    for (let at = 0; at < triangles; at++) {
        const corner = (triangle + at) * TRIANGLE_CORNERS;
        batch.indices[corner] = vertex + mesh.indices[at * TRIANGLE_CORNERS]!;
        batch.indices[corner + 1] = vertex + mesh.indices[at * TRIANGLE_CORNERS + (mirrors ? 2 : 1)]!;
        batch.indices[corner + 2] = vertex + mesh.indices[at * TRIANGLE_CORNERS + (mirrors ? 1 : 2)]!;
    }
    return { element: placed.element, firstTriangle: triangle, triangles, firstVertex: vertex, vertices: count };
}

/**
 * Groups the meshes a recipe draws, as `manifold.recipes.meshes` gives them, for drawing with few
 * draw calls: a mesh placed often enough by matrices that only turn and move becomes one instance
 * group, and every other placement is copied into a merged batch, its positions placed and its
 * color written per vertex.
 *
 * Batches are split by whether their colors let light through, and at `maxBatchVertices`. The
 * roots that share the value of the `elementKey` tag become one element, and every element lists
 * where its parts are drawn, so a renderer can hide, color and pick it by changing only its own runs.
 * @param meshes - The meshes and placements of a recipe
 * @param options - How to group them; each left out takes its default
 * @returns The plan: elements, merged batches, instanced meshes and instance groups
 */
export function recipeDrawPlanOf(meshes: Inputs.Manifold.RecipeMeshesDto, options: Partial<RecipeDrawOptions> = {}): RecipeDrawPlan {
    const settings: RecipeDrawOptions = { ...DEFAULT_OPTIONS, ...options };
    const elements: RecipeDrawElement[] = [];
    const elementOf = new Map<string, number>();
    const placed: PlacedRoot[] = [];
    meshes.placements.forEach((placement, root) => {
        if (placement.mesh < 0) {
            return;
        }
        const key = keyOf(placement.tag, settings.elementKey, root);
        let element = elementOf.get(key);
        if (element === undefined) {
            element = elements.push({ key, tag: placement.tag, ...(placement.group === undefined ? {} : { group: placement.group }), parts: [] }) - 1;
            elementOf.set(key, element);
        }
        const color = colorOf(placement.tag, settings.defaultColor);
        placed.push({ root, mesh: placement.mesh, matrix: placement.matrix, color, transparent: color[POSITION_SIZE]! < 1, element });
    });
    const drawMeshes = new Map<number, RecipeDrawMesh>();
    const drawMeshOfIndex = (mesh: number): RecipeDrawMesh => {
        let known = drawMeshes.get(mesh);
        if (known === undefined) {
            known = drawMeshOf(meshes.meshes[mesh]!);
            drawMeshes.set(mesh, known);
        }
        return known;
    };
    const instanced = new Map<string, PlacedRoot[]>();
    if (settings.instancing) {
        for (const root of placed) {
            if (isRigidMatrix(root.matrix)) {
                const key = `${root.mesh}:${root.color[POSITION_SIZE]}`;
                const roots = instanced.get(key);
                if (roots === undefined) {
                    instanced.set(key, [root]);
                } else {
                    roots.push(root);
                }
            }
        }
    }
    const groups = [...instanced.values()].filter((roots) => roots.length >= settings.minInstances);
    const inGroup = new Set(groups.flat());
    const plan: RecipeDrawPlan = { elements, batches: [], meshes: [], instances: [] };
    const meshOfPlan = new Map<number, number>();
    for (const roots of groups) {
        const mesh = roots[0]!.mesh;
        let planMesh = meshOfPlan.get(mesh);
        if (planMesh === undefined) {
            const drawn = drawMeshOfIndex(mesh);
            planMesh = plan.meshes.push(settings.reverseWinding ? { ...drawn, indices: reversed(drawn.indices) } : drawn) - 1;
            meshOfPlan.set(mesh, planMesh);
        }
        const origin = centreOf(roots.map(({ matrix }) => ({ min: [matrix[12], matrix[13], matrix[14]], max: [matrix[12], matrix[13], matrix[14]] })));
        const group: RecipeDrawInstances = {
            mesh: planMesh, transparent: roots[0]!.transparent, origin,
            matrices: new Float32Array(roots.length * MATRIX_SIZE), colors: new Float32Array(roots.length * RGBA_SIZE), elements: new Uint32Array(roots.length),
        };
        const index = plan.instances.push(group) - 1;
        roots.forEach((root, instance) => {
            group.matrices.set(root.matrix, instance * MATRIX_SIZE);
            for (let axis = 0; axis < POSITION_SIZE; axis++) {
                group.matrices[instance * MATRIX_SIZE + TRANSLATION_AT + axis] = root.matrix[TRANSLATION_AT + axis]! - origin[axis]!;
            }
            group.colors.set(root.color, instance * RGBA_SIZE);
            group.elements[instance] = root.element;
            elements[root.element]!.parts.push({ instances: index, instance });
        });
    }
    const boxes = new Map<number, MeshBox>();
    for (const transparent of [false, true]) {
        const loose = placed.filter((root) => root.transparent === transparent && !inGroup.has(root));
        let start = 0;
        while (start < loose.length) {
            let vertices = 0;
            let triangles = 0;
            let end = start;
            while (end < loose.length) {
                const mesh = drawMeshOfIndex(loose[end]!.mesh);
                const count = mesh.positions.length / POSITION_SIZE;
                if (end > start && vertices + count > settings.maxBatchVertices) {
                    break;
                }
                vertices += count;
                triangles += mesh.indices.length / TRIANGLE_CORNERS;
                end++;
            }
            const members = loose.slice(start, end);
            const origin = centreOf(members.map((root) => {
                let box = boxes.get(root.mesh);
                if (box === undefined) {
                    box = boxOf(drawMeshOfIndex(root.mesh).positions);
                    boxes.set(root.mesh, box);
                }
                return placedBox(box, root.matrix);
            }));
            const batch: RecipeDrawBatch = {
                transparent, origin,
                positions: new Float32Array(vertices * POSITION_SIZE), normals: new Float32Array(vertices * POSITION_SIZE),
                colors: new Float32Array(vertices * RGBA_SIZE), indices: new Uint32Array(triangles * TRIANGLE_CORNERS), ranges: [],
            };
            const index = plan.batches.push(batch) - 1;
            let vertex = 0;
            let triangle = 0;
            for (const root of members) {
                const range = bake(batch, root, drawMeshOfIndex(root.mesh), vertex, triangle, settings.reverseWinding);
                elements[root.element]!.parts.push({ batch: index, range: batch.ranges.push(range) - 1 });
                vertex += range.vertices;
                triangle += range.triangles;
            }
            start = end;
        }
    }
    return plan;
}

/**
 * The element a triangle of a merged batch belongs to, as a renderer's pick gives the triangle.
 * @param batch - The batch the triangle is in
 * @param triangle - The triangle's position in the batch
 * @returns The element, a position in the plan's elements, or undefined past the batch's end
 */
export function recipeDrawElementAt(batch: RecipeDrawBatch, triangle: number): number | undefined {
    let low = 0;
    let high = batch.ranges.length - 1;
    while (low <= high) {
        const middle = (low + high) >> 1;
        const range = batch.ranges[middle]!;
        if (triangle < range.firstTriangle) {
            high = middle - 1;
        } else if (triangle >= range.firstTriangle + range.triangles) {
            low = middle + 1;
        } else {
            return range.element;
        }
    }
    return undefined;
}

/**
 * The indices that draw a run of a merged batch as it was planned, or, hidden, as triangles of no
 * area at its first vertex, which draw nothing; a renderer writes them over the run's indices.
 * @param batch - The batch the run is in
 * @param range - The run
 * @param visible - Whether the run is to be drawn
 * @returns The run's indices, three per triangle
 */
export function recipeDrawRangeIndices(batch: RecipeDrawBatch, range: RecipeDrawRange, visible: boolean): Uint32Array {
    const corners = range.triangles * TRIANGLE_CORNERS;
    return visible
        ? batch.indices.slice(range.firstTriangle * TRIANGLE_CORNERS, range.firstTriangle * TRIANGLE_CORNERS + corners)
        : new Uint32Array(corners).fill(range.firstVertex);
}

/**
 * The vertex colors of a run of a merged batch in one color, in linear light as the batch keeps
 * them, which a renderer writes over the run's colors to show it, say, selected; the batch's own
 * colors give the run back its color.
 * @param range - The run
 * @param color - Red, green and blue as a hex color writes them, and alpha, from 0 to 1
 * @returns Four numbers per vertex of the run
 */
export function recipeDrawRangeColors(range: RecipeDrawRange, color: Base.ColorRGBA): Float32Array {
    const linear = [srgbToLinear(color.r), srgbToLinear(color.g), srgbToLinear(color.b), color.a];
    const colors = new Float32Array(range.vertices * RGBA_SIZE);
    for (let vertex = 0; vertex < range.vertices; vertex++) {
        colors.set(linear, vertex * RGBA_SIZE);
    }
    return colors;
}
