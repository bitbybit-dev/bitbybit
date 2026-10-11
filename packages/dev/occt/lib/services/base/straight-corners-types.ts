import type * as Inputs from "../../api/inputs";

export interface EdgeEnds {
    readonly end: Inputs.Base.Point3;
    readonly endDirection: Inputs.Base.Vector3;
    readonly startDirection: Inputs.Base.Vector3;
}

export interface StraightCorner {
    readonly index: number;
    readonly point: Inputs.Base.Point3;
}

export interface EdgeSample {
    readonly point: Inputs.Base.Point3;
    readonly direction: Inputs.Base.Vector3;
}
