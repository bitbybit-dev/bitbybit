import type * as Inputs from "../../api/inputs";

export interface FaceSpan {
    node: number;
    nodes: number;
    uvNode: number;
    hasUvs: boolean;
    triangle: number;
    triangles: number;
}

export interface FaceLayout<G extends object, A> {
    geometry(span: FaceSpan): G;
    analysis(span: FaceSpan): A;
}

export interface AnalysisOf<A> {
    analysisValues?: A;
}

export interface DecodedMeshOf<F> {
    faceList: F[];
    edgeList: Inputs.OCCT.DecomposedEdgeDto[];
    pointsList: Inputs.Base.Point3[];
    colorGroups?: Inputs.OCCT.FaceColorGroups;
}

export interface WithIsoCurves {
    isoCurveList?: Inputs.Base.Point3[][] | undefined;
}
