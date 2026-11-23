import type { Handle_TDocStd_Document, TopoDS_Shape } from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import type * as Inputs from "../api/inputs";

export type PmiBlockFace = "bottom" | "top" | "left" | "right" | "front" | "back" | "bore" | "counterbore" | "floor";

export interface PmiBlock {
    readonly document: Handle_TDocStd_Document;
    readonly part: string;
    readonly shape: TopoDS_Shape;
    readonly faces: Readonly<Record<PmiBlockFace, number>>;
    readonly topFrontEdge: number;
    readonly cornerVertices: readonly number[];
}

export interface PmiBlockPmi {
    readonly dimensions: Inputs.OCCT.PmiDimensionDto[];
    readonly datums: Inputs.OCCT.PmiDatumDto[];
    readonly tolerances: Inputs.OCCT.PmiToleranceDto[];
}
