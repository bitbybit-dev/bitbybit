import type * as BABYLON from "@babylonjs/core";
import type { RecipeDrawPlan } from "@bitbybit-dev/core";

export interface RecipeDrawState {
    plan: RecipeDrawPlan;
    batches: BABYLON.Mesh[];
    indices: Uint32Array[];
    instances: BABYLON.Mesh[];
    elementOf: Map<string, number>;
}

export interface RecipeDrawerHost {
    scene(): BABYLON.Scene;
    entityId(type: string): string;
    material(transparent: boolean, metallic: number, roughness: number): BABYLON.PBRMetallicRoughnessMaterial;
}
