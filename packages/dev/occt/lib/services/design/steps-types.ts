import type { TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import type * as Inputs from "../../api/inputs";

export interface PlaneAxes {
    normal: Inputs.Base.Vector3;
    direction: Inputs.Base.Vector3;
}

export interface Outline {
    wire: TopoDS_Shape;
    owned: boolean;
}

export interface BodyValue {
    body: string;
}

export interface UncheckedExpression {
    expr: unknown;
}
