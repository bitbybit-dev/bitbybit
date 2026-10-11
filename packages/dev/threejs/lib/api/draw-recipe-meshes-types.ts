import type * as THREEJS from "three";
import type { RecipeDrawPlan } from "@bitbybit-dev/core";

export interface RecipeDrawState {
    plan: RecipeDrawPlan;
    batches: THREEJS.Mesh[];
    instances: THREEJS.InstancedMesh[];
    elementOf: Map<string, number>;
}

export interface RecipeDrawerHost {
    scene(): THREEJS.Scene;
    entityId(type: string): string;
    material(transparent: boolean, opacity: number, vertexColors: boolean, metallic: number, roughness: number): THREEJS.MeshPhysicalMaterial;
}
