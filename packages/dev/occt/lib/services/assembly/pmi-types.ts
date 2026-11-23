import type { TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import type * as Inputs from "../../api/inputs";

export interface KernelPmiPlace {
    part: string;
    face?: number;
    edge?: number;
    vertex?: number;
}

export interface KernelPmiPresentation {
    label?: string;
    plane?: Inputs.Base.Frame;
    textPoint?: Inputs.Base.Point3;
    lines?: number[][];
    fills?: number[][];
}

export interface KernelPmiDimension {
    type: string;
    value: number;
    upperTolerance?: number;
    lowerTolerance?: number;
    shapes: KernelPmiPlace[];
    otherShapes?: KernelPmiPlace[];
    presentation?: KernelPmiPresentation;
}

export interface KernelPmiDatum {
    letter: string;
    shapes: KernelPmiPlace[];
    presentation?: KernelPmiPresentation;
}

export interface KernelPmiTolerance {
    type: string;
    value: number;
    shapes: KernelPmiPlace[];
    datums?: string[];
    zone?: "diameter";
    material?: Inputs.OCCT.pmiMaterialConditionEnum;
    presentation?: KernelPmiPresentation;
}

export interface KernelPmiInput {
    dimensions: KernelPmiDimension[];
    datums: KernelPmiDatum[];
    tolerances: KernelPmiTolerance[];
}

export interface HeldDatum {
    readonly entry: string;
    readonly letter: string;
    readonly places: readonly KernelPmiPlace[];
    readonly where: string;
}

export interface PartSubShapes {
    readonly explored: readonly TopoDS_Shape[];
    readonly distinct: readonly TopoDS_Shape[];
}

export interface PmiPicturePlane {
    readonly frame: Inputs.Base.Frame;
    readonly start: Inputs.Base.Point2;
    readonly end: Inputs.Base.Point2;
}

export interface KernelReadDimension {
    entry: string;
    type: string;
    name: string;
    value: number | null;
    upperTolerance?: number | null;
    lowerTolerance?: number | null;
    lowerBound?: number | null;
    upperBound?: number | null;
    shapes: string[];
    otherShapes: string[];
}

export interface KernelReadTolerance {
    entry: string;
    type: string;
    name: string;
    value: number | null;
    shapes: string[];
    datums: string[];
    zone?: "diameter";
    material?: "maximum" | "least";
}

export interface KernelReadDatum {
    entry: string;
    name: string;
    shapes: string[];
}

export interface KernelReadPmi {
    dimensions: KernelReadDimension[];
    tolerances: KernelReadTolerance[];
    datums: KernelReadDatum[];
}

export interface SubShapeLookup {
    readonly shapes: readonly TopoDS_Shape[];
    readonly byHash: ReadonlyMap<number, readonly number[]>;
}
