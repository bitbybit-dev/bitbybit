import type * as pc from "playcanvas";
import type { RecipeDrawPlan } from "@bitbybit-dev/core";

export type RecipeBatchEntity = pc.Entity & { recipeBatch?: number };

export interface RecipeBatchDrawn {
    mesh: pc.Mesh;
    meshInstance: pc.MeshInstance;
    indices: Uint32Array;
    colors: Float32Array;
}

export interface RecipeDrawState {
    plan: RecipeDrawPlan;
    batches: RecipeBatchDrawn[];
    elementOf: Map<string, number>;
}

export interface RecipeDrawerHost {
    scene(): pc.Entity;
    device(): pc.GraphicsDevice;
    entityId(type: string): string;
    material(transparent: boolean, metallic: number, roughness: number): pc.StandardMaterial;
}
