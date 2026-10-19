import type { MetricThread } from "@bitbybit-dev/base";
import type { TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import type * as Inputs from "../../api/inputs";
import type * as Models from "../../api/models";
import type { DesignMachiningTrace } from "./state";

export type MachiningFeature = Models.OCCT.DesignKeywayFeature | Models.OCCT.DesignFlatFeature | Models.OCCT.DesignRingGrooveFeature
    | Models.OCCT.DesignKnurlFeature | Models.OCCT.DesignSplineFeature | Models.OCCT.DesignThreadFeature;

export interface MachiningCylinder {
    readonly start: Inputs.Base.Point3;
    readonly axis: Inputs.Base.Vector3;
    readonly length: number;
    readonly diameter: number;
    readonly bore: boolean;
}

export interface MachiningCut extends DesignMachiningTrace {
    readonly frame: Inputs.Base.Frame;
    readonly tool: () => TopoDS_Shape;
}

export interface FittingThread {
    readonly size: Inputs.Engineering.metricSizeEnum;
    readonly thread: MetricThread;
}
