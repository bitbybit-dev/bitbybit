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

export interface TriangleTree {
    readonly corners: Float64Array;
    readonly boxes: Float64Array;
    readonly starts: Uint32Array;
    readonly counts: Uint32Array;
    readonly lefts: Int32Array;
    readonly rights: Int32Array;
}

export interface TreeBox {
    readonly min: Inputs.Base.Point3;
    readonly max: Inputs.Base.Point3;
}

export interface VectorCellRange {
    readonly center: number[];
    readonly lowest: number[];
    readonly highest: number[];
}

export interface UniqueVectors {
    readonly kept: number[][];
    readonly indexes: number[];
}

export interface CreasedVertices {
    readonly sources: Uint32Array;
    readonly normals: Float64Array;
    readonly indices: Uint32Array;
}

export interface RoundedCorner {
    readonly corner: Inputs.Base.Point2;
    readonly radius: number;
    readonly toPrevious: Inputs.Base.Vector2;
    readonly toNext: Inputs.Base.Vector2;
    readonly half: number;
    readonly reach: number;
}

export interface GltfNode {
    readonly name?: string;
    readonly scale?: readonly number[];
    readonly children?: readonly number[];
}

export interface GltfScene {
    readonly nodes?: readonly number[];
}

export interface GltfJson {
    readonly scene?: number;
    readonly scenes?: readonly GltfScene[];
    readonly nodes?: readonly GltfNode[];
}

export type UnitOfLength = `${Inputs.Base.unitOfLengthEnum}`;
