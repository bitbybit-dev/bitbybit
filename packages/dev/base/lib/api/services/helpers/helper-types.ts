import type * as Inputs from "../../inputs";

export interface ThreePointArc {
    readonly center: Inputs.Base.Point3;
    readonly x: Inputs.Base.Vector3;
    readonly y: Inputs.Base.Vector3;
    readonly radius: number;
    readonly sweep: number;
}

export interface CreasedMesh {
    readonly positions: Float32Array;
    readonly normals: Float32Array;
    readonly indices: Uint32Array;
}

export interface MeshArrays {
    readonly positions: number[];
    readonly indices: number[];
}
