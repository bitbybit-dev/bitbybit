import type { TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";

export interface CurveTracing {
    readonly angularDeflection: number;
    readonly curvatureDeflection: number;
    readonly minimumOfPoints: number;
    readonly uTolerance: number;
    readonly minimumLength: number;
    readonly exactCurves: boolean;
}

export interface ShapeTracing extends CurveTracing {
    readonly shape: TopoDS_Shape;
}
