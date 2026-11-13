import type { TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";

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
