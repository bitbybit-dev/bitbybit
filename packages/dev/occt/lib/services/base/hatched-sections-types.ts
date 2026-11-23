import type { TopoDS_Compound, TopoDS_Face } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import type { IO } from "@bitbybit-dev/base/lib/api/inputs/io-inputs";
import type * as Inputs from "../../api/inputs";

export interface HatchSettings {
    readonly pattern: IO.hatchPatternEnum;
    readonly angle: number;
    readonly spacing: number;
    readonly neighbourAngles: boolean;
    readonly curveTolerance: number;
    readonly tolerance: number;
}

export interface CutShape {
    readonly caps: TopoDS_Compound;
    readonly faces: TopoDS_Face[];
    readonly boundaries: IO.DrawingPathDto[][];
    readonly box: CapsBox | undefined;
}

export interface CapsBox {
    readonly min: Inputs.Base.Point3;
    readonly max: Inputs.Base.Point3;
}
