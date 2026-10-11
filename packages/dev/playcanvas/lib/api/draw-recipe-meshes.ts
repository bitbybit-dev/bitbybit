import * as pc from "playcanvas";
import { recipeDrawElementAt, recipeDrawPlanOf, recipeDrawRangeColors, recipeDrawRangeIndices } from "@bitbybit-dev/core";
import type { RecipeDrawBatch, RecipeDrawPart } from "@bitbybit-dev/core";
import type * as Inputs from "./inputs";
import type * as Resolved from "./resolved-inputs";
import type { RecipeBatchDrawn, RecipeBatchEntity, RecipeDrawerHost, RecipeDrawState } from "./draw-recipe-meshes-types";

const RGBA_SIZE = 4;
const TRIANGLE_CORNERS = 3;
const HEX_DIGITS = 16;
const CHANNEL_MAX = 255;

function colourOf(hex: string, opacity: number): Inputs.Base.ColorRGBA {
    const digits = hex.replace("#", "");
    const channel = (at: number): number => Number.parseInt(digits.slice(at * 2, at * 2 + 2), HEX_DIGITS) / CHANNEL_MAX;
    return { r: channel(0), g: channel(1), b: channel(2), a: opacity };
}

export class RecipeMeshesDrawer {
    private readonly states = new WeakMap<pc.Entity, RecipeDrawState>();

    constructor(private readonly host: RecipeDrawerHost) {
    }

    draw(entity: Inputs.Manifold.RecipeMeshesDto, options: Resolved.Draw.DrawRecipeMeshesOptions): pc.Entity {
        const plan = recipeDrawPlanOf(entity, {
            elementKey: options.elementKey,
            instancing: false,
            maxBatchVertices: options.maxBatchVertices,
            defaultColor: colourOf(options.defaultColour, options.defaultOpacity),
        });
        const root = new pc.Entity(this.host.entityId("recipeMeshes"));
        const batches = plan.batches.map((batch, index) => this.batchEntity(root, batch, index, this.host.material(batch.transparent, options.metallic, options.roughness)));
        this.states.set(root, { plan, batches, elementOf: new Map(plan.elements.map((element, index) => [element.key, index])) });
        this.host.scene().addChild(root);
        return root;
    }

    setVisible(drawn: pc.Entity, keys: readonly string[], visible: boolean): void {
        const state = this.stateOf(drawn);
        const touched = new Set<number>();
        this.partsOf(state, keys).forEach((part) => {
            const batch = state.plan.batches[part.batch!]!;
            const range = batch.ranges[part.range!]!;
            state.batches[part.batch!]!.indices.set(recipeDrawRangeIndices(batch, range, visible), range.firstTriangle * TRIANGLE_CORNERS);
            touched.add(part.batch!);
        });
        touched.forEach((index) => {
            const drawnBatch = state.batches[index]!;
            drawnBatch.mesh.setIndices(drawnBatch.indices);
            drawnBatch.mesh.update(pc.PRIMITIVE_TRIANGLES, false);
        });
    }

    setColour(drawn: pc.Entity, keys: readonly string[], colour: string | undefined, opacity: number): void {
        const state = this.stateOf(drawn);
        const shown = colour === undefined ? undefined : colourOf(colour, opacity);
        const touched = new Set<number>();
        this.partsOf(state, keys).forEach((part) => {
            const batch = state.plan.batches[part.batch!]!;
            const range = batch.ranges[part.range!]!;
            const start = range.firstVertex * RGBA_SIZE;
            state.batches[part.batch!]!.colors.set(shown ? recipeDrawRangeColors(range, shown) : batch.colors.subarray(start, start + range.vertices * RGBA_SIZE), start);
            touched.add(part.batch!);
        });
        touched.forEach((index) => {
            const drawnBatch = state.batches[index]!;
            drawnBatch.mesh.setColors(drawnBatch.colors, RGBA_SIZE);
            drawnBatch.mesh.update(pc.PRIMITIVE_TRIANGLES, false);
        });
    }

    elementOfPick(drawn: pc.Entity, meshInstance: pc.MeshInstance, triangle: number | undefined): string | undefined {
        const state = this.stateOf(drawn);
        const batch = state.batches.findIndex((drawnBatch) => drawnBatch.meshInstance === meshInstance);
        const element = batch < 0 || triangle === undefined ? undefined : recipeDrawElementAt(state.plan.batches[batch]!, triangle);
        return element === undefined ? undefined : state.plan.elements[element]!.key;
    }

    private stateOf(drawn: pc.Entity): RecipeDrawState {
        const state = this.states.get(drawn);
        if (state === undefined) {
            throw new Error("The entity was not drawn from recipe meshes by this renderer, so it holds no elements");
        }
        return state;
    }

    private partsOf(state: RecipeDrawState, keys: readonly string[]): RecipeDrawPart[] {
        return keys.flatMap((key) => {
            const element = state.elementOf.get(key);
            return element === undefined ? [] : state.plan.elements[element]!.parts;
        });
    }

    private batchEntity(root: pc.Entity, batch: RecipeDrawBatch, index: number, material: pc.StandardMaterial): RecipeBatchDrawn {
        const mesh = new pc.Mesh(this.host.device());
        const indices = batch.indices.slice();
        const colors = batch.colors.slice();
        mesh.setPositions(batch.positions);
        mesh.setNormals(batch.normals);
        mesh.setColors(colors, RGBA_SIZE);
        mesh.setIndices(indices);
        mesh.update(pc.PRIMITIVE_TRIANGLES);
        const meshInstance = new pc.MeshInstance(mesh, material);
        const child: RecipeBatchEntity = new pc.Entity(this.host.entityId("recipeBatch"));
        child.addComponent("render", { meshInstances: [meshInstance] });
        child.setLocalPosition(...batch.origin);
        child.recipeBatch = index;
        root.addChild(child);
        return { mesh, meshInstance, indices, colors };
    }
}
