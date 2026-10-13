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

export interface HuffmanTable {
    readonly entries: Int32Array;
    readonly bits: number;
}

export interface ZipEntry {
    readonly name: string;
    readonly method: number;
    readonly crc32: number;
    readonly compressedSize: number;
    readonly size: number;
    readonly localOffset: number;
    readonly encrypted: boolean;
}

export interface RefinedSurfaceMesh {
    readonly positions: Inputs.Base.Point3[];
    readonly triangles: number[];
}

export interface WindingComponents {
    readonly flips: Uint8Array;
    readonly component: Int32Array;
    readonly count: number;
}

export interface EdgeUses {
    readonly uses: Map<number, number[]>;
    readonly stride: number;
}
