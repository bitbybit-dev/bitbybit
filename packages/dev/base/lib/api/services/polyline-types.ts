import type * as Inputs from "../inputs";

export interface SweepPath {
    readonly points: Inputs.Base.Point3[];
    readonly tangents: Inputs.Base.Vector3[];
    readonly axes: Inputs.Base.Vector3[];
}
