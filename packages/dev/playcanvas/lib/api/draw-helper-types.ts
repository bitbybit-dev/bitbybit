import type * as pc from "playcanvas";

export type InstancedPointsEntity = pc.Entity & { instanceBuffer?: pc.VertexBuffer; pointIndices?: number[] };

export type PointsLook = { colours: string[]; opacity: number; size: number };
