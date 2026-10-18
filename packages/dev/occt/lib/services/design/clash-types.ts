import type { BitbybitOcctModule, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import type * as Inputs from "../../api/inputs";
import type { BaseBitByBit } from "@bitbybit-dev/base";
import type { OCCTService } from "../../occ-service";
import type { ClashStore } from "./clash-store";

export interface ClashContext {
    readonly occt: OCCTService;
    readonly occ: BitbybitOcctModule;
    readonly base: BaseBitByBit;
    readonly boxes: Map<string, readonly number[]>;
    readonly store: ClashStore;
}

export interface PlacedPart {
    readonly path: string;
    readonly hash: string;
    readonly shape: TopoDS_Shape;
    readonly world: Inputs.Base.TransformMatrix | undefined;
    readonly threads: readonly number[];
    readonly ends: readonly number[];
}

export interface ThreadSide {
    readonly shape: TopoDS_Shape;
    readonly own: TopoDS_Shape;
    readonly faces: ReadonlySet<number>;
    readonly ends: ReadonlySet<number>;
}
