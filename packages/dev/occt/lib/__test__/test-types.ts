import type { TopoDS_Edge, TopoDS_Wire } from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import type * as Models from "../api/models";

export type LoftSections = (TopoDS_Wire | TopoDS_Edge)[];

export interface Lofted {
    readonly faces: number;
    readonly histories: Models.OCCT.ShapeHistory[];
}
