import * as BABYLON from "@babylonjs/core";
import { srgbToLinear } from "@bitbybit-dev/base/lib/api/services/helpers/color/color-space";
import { recipeDrawElementAt, recipeDrawPlanOf, recipeDrawRangeColors, recipeDrawRangeIndices } from "@bitbybit-dev/core";
import type { RecipeDrawBatch, RecipeDrawInstances, RecipeDrawMesh, RecipeDrawPart } from "@bitbybit-dev/core";
import type * as Inputs from "./inputs";
import type * as Resolved from "./resolved-inputs";
import type { RecipeDrawerHost, RecipeDrawState } from "./draw-recipe-meshes-types";

const MATRIX_SIZE = 16;
const RGBA_SIZE = 4;
const TRIANGLE_CORNERS = 3;

function colourOf(hex: string, opacity: number): Inputs.Base.ColorRGBA {
    const colour = BABYLON.Color3.FromHexString(hex);
    return { r: colour.r, g: colour.g, b: colour.b, a: opacity };
}

export class RecipeMeshesDrawer {
    private readonly states = new WeakMap<BABYLON.Mesh, RecipeDrawState>();

    constructor(private readonly host: RecipeDrawerHost) {
    }

    draw(entity: Inputs.Manifold.RecipeMeshesDto, options: Resolved.Draw.DrawRecipeMeshesOptions): BABYLON.Mesh {
        const plan = recipeDrawPlanOf(entity, {
            elementKey: options.elementKey,
            instancing: options.instancing,
            minInstances: options.minInstances,
            maxBatchVertices: options.maxBatchVertices,
            defaultColor: colourOf(options.defaultColour, options.defaultOpacity),
            reverseWinding: true,
        });
        const root = new BABYLON.Mesh(this.host.entityId("recipeMeshes"), this.host.scene());
        root.isVisible = false;
        const materialOf = (transparent: boolean): BABYLON.PBRMetallicRoughnessMaterial => this.host.material(transparent, options.metallic, options.roughness);
        const batches = plan.batches.map((batch, index) => this.batchMesh(root, batch, index, materialOf(batch.transparent)));
        const instances = plan.instances.map((group, index) => this.instancesMesh(root, group, plan.meshes[group.mesh]!, index, materialOf(group.transparent)));
        this.states.set(root, {
            plan, batches, instances,
            indices: plan.batches.map((batch) => batch.indices.slice()),
            elementOf: new Map(plan.elements.map((element, index) => [element.key, index])),
        });
        return root;
    }

    setVisible(drawn: BABYLON.Mesh, keys: readonly string[], visible: boolean): void {
        const state = this.stateOf(drawn);
        const batches = new Set<number>();
        const groups = new Set<number>();
        this.partsOf(state, keys).forEach((part) => {
            if (part.batch !== undefined) {
                const batch = state.plan.batches[part.batch]!;
                const range = batch.ranges[part.range!]!;
                state.indices[part.batch]!.set(recipeDrawRangeIndices(batch, range, visible), range.firstTriangle * TRIANGLE_CORNERS);
                batches.add(part.batch);
            } else {
                const group = state.plan.instances[part.instances!]!;
                const matrix = BABYLON.Matrix.FromArray(group.matrices, part.instance! * MATRIX_SIZE);
                state.instances[part.instances!]!.thinInstanceSetMatrixAt(part.instance!, visible ? matrix : BABYLON.Matrix.Scaling(0, 0, 0).setTranslation(matrix.getTranslation()), false);
                groups.add(part.instances!);
            }
        });
        batches.forEach((batch) => state.batches[batch]!.updateIndices(state.indices[batch]!, 0, false));
        groups.forEach((group) => state.instances[group]!.thinInstanceBufferUpdated("matrix"));
    }

    setColour(drawn: BABYLON.Mesh, keys: readonly string[], colour: string | undefined, opacity: number): void {
        const state = this.stateOf(drawn);
        const shown = colour === undefined ? undefined : colourOf(colour, opacity);
        const groups = new Set<number>();
        this.partsOf(state, keys).forEach((part) => {
            if (part.batch !== undefined) {
                const batch = state.plan.batches[part.batch]!;
                const range = batch.ranges[part.range!]!;
                const colors = shown ? recipeDrawRangeColors(range, shown) : batch.colors.subarray(range.firstVertex * RGBA_SIZE, (range.firstVertex + range.vertices) * RGBA_SIZE);
                state.batches[part.batch]!.getVertexBuffer(BABYLON.VertexBuffer.ColorKind)!.updateDirectly(colors, range.firstVertex * RGBA_SIZE);
            } else {
                const group = state.plan.instances[part.instances!]!;
                const own = group.colors.subarray(part.instance! * RGBA_SIZE, (part.instance! + 1) * RGBA_SIZE);
                const value = shown ? [srgbToLinear(shown.r), srgbToLinear(shown.g), srgbToLinear(shown.b), shown.a] : Array.from(own);
                state.instances[part.instances!]!.thinInstanceSetAttributeAt("color", part.instance!, value, false);
                groups.add(part.instances!);
            }
        });
        groups.forEach((group) => state.instances[group]!.thinInstanceBufferUpdated("color"));
    }

    elementOfPick(drawn: BABYLON.Mesh, mesh: BABYLON.AbstractMesh, triangle: number | undefined, instance: number | undefined): string | undefined {
        const state = this.stateOf(drawn);
        const batch = state.batches.indexOf(mesh as BABYLON.Mesh);
        if (batch >= 0) {
            const element = triangle === undefined ? undefined : recipeDrawElementAt(state.plan.batches[batch]!, triangle);
            return element === undefined ? undefined : state.plan.elements[element]!.key;
        }
        const group = state.instances.indexOf(mesh as BABYLON.Mesh);
        const element = group < 0 || instance === undefined ? undefined : state.plan.instances[group]!.elements[instance];
        return element === undefined ? undefined : state.plan.elements[element]!.key;
    }

    private stateOf(drawn: BABYLON.Mesh): RecipeDrawState {
        const state = this.states.get(drawn);
        if (state === undefined) {
            throw new Error("The mesh was not drawn from recipe meshes by this renderer, so it holds no elements");
        }
        return state;
    }

    private partsOf(state: RecipeDrawState, keys: readonly string[]): RecipeDrawPart[] {
        return keys.flatMap((key) => {
            const element = state.elementOf.get(key);
            return element === undefined ? [] : state.plan.elements[element]!.parts;
        });
    }

    private batchMesh(root: BABYLON.Mesh, batch: RecipeDrawBatch, index: number, material: BABYLON.Material): BABYLON.Mesh {
        const mesh = new BABYLON.Mesh(this.host.entityId("recipeBatch"), this.host.scene());
        const vertexData = new BABYLON.VertexData();
        vertexData.positions = batch.positions;
        vertexData.normals = batch.normals;
        vertexData.indices = batch.indices.slice();
        vertexData.applyToMesh(mesh, false);
        mesh.setIndices(vertexData.indices, null, true);
        mesh.setVerticesData(BABYLON.VertexBuffer.ColorKind, batch.colors.slice(), true, RGBA_SIZE);
        mesh.hasVertexAlpha = batch.transparent;
        mesh.material = material;
        mesh.position = new BABYLON.Vector3(...batch.origin);
        mesh.parent = root;
        mesh.metadata = { recipeBatch: index };
        return mesh;
    }

    private instancesMesh(root: BABYLON.Mesh, group: RecipeDrawInstances, data: RecipeDrawMesh, index: number, material: BABYLON.Material): BABYLON.Mesh {
        const mesh = new BABYLON.Mesh(this.host.entityId("recipeInstances"), this.host.scene());
        const vertexData = new BABYLON.VertexData();
        vertexData.positions = data.positions;
        vertexData.normals = data.normals;
        vertexData.indices = data.indices;
        vertexData.applyToMesh(mesh, false);
        mesh.thinInstanceSetBuffer("matrix", group.matrices.slice(), MATRIX_SIZE, false);
        mesh.thinInstanceSetBuffer("color", group.colors.slice(), RGBA_SIZE, false);
        mesh.thinInstanceEnablePicking = true;
        mesh.thinInstanceRefreshBoundingInfo(false);
        mesh.hasVertexAlpha = group.transparent;
        mesh.material = material;
        mesh.position = new BABYLON.Vector3(...group.origin);
        mesh.parent = root;
        mesh.metadata = { recipeInstances: index };
        return mesh;
    }
}
