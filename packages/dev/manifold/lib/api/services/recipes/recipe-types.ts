import type * as Manifold3D from "manifold-3d";
import type { Base } from "@bitbybit-dev/base";

export type Built = Manifold3D.Manifold | Manifold3D.CrossSection | Base.RecipeHalfSpaceNode;

export type ProfileRings = readonly (readonly Manifold3D.Vec2[])[];

export interface FacePlane {
    readonly normal: Manifold3D.Vec3;
    readonly offset: number;
}

export interface OutlineFace extends FacePlane {
    readonly corners: readonly Manifold3D.Vec3[];
}

export interface TriangleIndex {
    readonly axis: number;
    readonly sorted: Uint32Array;
    readonly least: Float64Array;
    readonly widest: number;
    readonly big: Uint32Array;
}

export interface CutOutline {
    readonly solid: Manifold3D.Manifold | undefined;
    readonly box: Manifold3D.Box;
    readonly centre: Manifold3D.Vec3;
    readonly mesh: Manifold3D.Mesh | undefined;
    readonly boxes: Float64Array;
    readonly index: TriangleIndex;
}

export interface BoxReach {
    readonly below: readonly boolean[];
    readonly above: readonly boolean[];
}

export interface ToolRegion extends FacePlane {
    readonly triangles: readonly number[];
}

export interface CornerPlane {
    readonly normal: Manifold3D.Vec3;
    readonly pushed: boolean;
}

export interface ToolRegions {
    readonly regions: readonly ToolRegion[];
    readonly regionOf: Int32Array;
}

export interface ReachedFaces {
    readonly regions: readonly ToolRegion[];
    readonly planesAt: readonly (readonly number[])[];
    readonly pushed: readonly boolean[];
}
