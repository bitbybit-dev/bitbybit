import type * as Inputs from "../../api/inputs";
import type { TreeBox, TriangleTree } from "@bitbybit-dev/base/lib/api/services/helpers/helper-types";

export interface ClashMesh {
    readonly tree: TriangleTree;
    readonly error: number;
    readonly finer?: () => ClashMesh | undefined;
}

export interface ClashPartMesh {
    readonly positions: Float64Array;
    readonly indices: Uint32Array;
}

export interface ClashItem {
    readonly box: () => TreeBox | undefined;
    readonly meshable: () => boolean;
    readonly mesh: () => ClashMesh;
    readonly states: (points: readonly Inputs.Base.Point3[]) => readonly number[];
}

export const PAIR_VERDICT = {
    APART: "apart",
    NEAR: "near",
    CROSSING: "crossing",
    CLOSE: "close",
    NESTED: "nested",
} as const;

export type PairVerdict = typeof PAIR_VERDICT[keyof typeof PAIR_VERDICT];

export interface ClashReading {
    readonly verdict: PairVerdict;
    readonly error: number;
    readonly first: ClashMesh;
    readonly second: ClashMesh;
}
