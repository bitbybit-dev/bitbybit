import type { RackPart } from "@bitbybit-dev/base";
import type { TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import type * as Models from "../../api/models";

export type LoopSegment = Pick<Models.OCCT.SketchSegment, "command" | "edges"> & { part?: RackPart };

export interface DrawnLoop {
    wire: TopoDS_Shape;
    segments: LoopSegment[];
}
