import type { BitbybitOcctModule, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import type * as Inputs from "../../api/inputs";
import type * as Models from "../../api/models";
import type { OCCTService } from "../../occ-service";
import type { DesignCache } from "./cache";

export type Vec3 = [number, number, number];
export type Kind = Models.OCCT.DesignSectionKind;
export type SourcePart = Models.OCCT.DesignSectionSourcePart<TopoDS_Shape>;

export interface LocalPlane {
    readonly normal: Vec3;
    readonly offset: number;
    readonly key: string;
}

export interface Placement {
    readonly path: string;
    readonly world: Inputs.Base.TransformMatrix;
}

export interface Crossing {
    readonly plane: LocalPlane;
    readonly placements: Placement[];
}

export interface PartCut {
    readonly part: SourcePart;
    readonly crossings: Crossing[];
    readonly behind: Placement[];
}

export interface Made {
    readonly part: Models.OCCT.DesignSectionPart<TopoDS_Shape>;
    readonly placements: readonly Placement[];
}

export interface SectionContext {
    readonly occt: OCCTService;
    readonly occ: BitbybitOcctModule;
    readonly cache: DesignCache;
    readonly boxes: Map<string, readonly number[]>;
}

export interface SectionOptions {
    readonly cut: boolean;
    readonly tolerance: number;
}
