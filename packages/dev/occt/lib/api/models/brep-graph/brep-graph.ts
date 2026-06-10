import { Base } from "../../inputs";

export interface BRepGraphResult {
    ok: boolean;
    error?: string;
}

export interface BRepGraphAnalysis extends BRepGraphResult {
    solids: number;
    shells: number;
    faces: number;
    wires: number;
    edges: number;
    coedges: number;
    vertices: number;
    compounds: number;
    compSolids: number;
    surfaces: number;
    curves3d: number;
    curves2d: number;
    nodes: number;
    products: number;
    occurrences: number;
    rootProducts: number;
    generation: number;
}

export interface BRepGraphFaceAdjacency {
    index: number;
    adjacent: number[];
    edges: number[];
    nbWires: number;
    outerWire: number;
}

export interface BRepGraphFaceAdjacencyResult extends BRepGraphResult {
    faces: BRepGraphFaceAdjacency[];
}

export interface BRepGraphEdgeFace {
    index: number;
    faces: number[];
    nbFaces: number;
    boundary: boolean;
    manifold: boolean;
    degenerated: boolean;
    startVertex: number;
    endVertex: number;
    tolerance: number;
}

export interface BRepGraphEdgeFaceMapResult extends BRepGraphResult {
    edges: BRepGraphEdgeFace[];
}

export interface BRepGraphVertex {
    index: number;
    point: Base.Point3;
    tolerance: number;
    edges: number[];
}

export interface BRepGraphVertexEdgeMapResult extends BRepGraphResult {
    vertices: BRepGraphVertex[];
}

export type BRepGraphSurfaceType =
    "Plane" | "Cylinder" | "Cone" | "Sphere" | "Torus" |
    "BezierSurface" | "BSplineSurface" | "SurfaceOfRevolution" |
    "SurfaceOfExtrusion" | "OffsetSurface" | "OtherSurface" | "None";

export interface BRepGraphFaceGeometry {
    index: number;
    surfaceType: BRepGraphSurfaceType;
    tolerance: number;
    hasTriangulation: boolean;
    naturalRestriction: boolean;
    uvBounds: [number, number, number, number];
    nbWires: number;
    uid: number;
}

export interface BRepGraphFaceInfoResult extends BRepGraphResult {
    faces: BRepGraphFaceGeometry[];
}

export type BRepGraphCurveType =
    "Line" | "Circle" | "Ellipse" | "Hyperbola" | "Parabola" |
    "BezierCurve" | "BSplineCurve" | "OffsetCurve" | "OtherCurve" | "None";

export type BRepGraphContinuity = "C0" | "G1" | "C1" | "G2" | "C2" | "C3" | "CN";

export interface BRepGraphEdgeGeometry {
    index: number;
    curveType: BRepGraphCurveType;
    hasCurve: boolean;
    degenerated: boolean;
    sameParameter: boolean;
    maxContinuity: BRepGraphContinuity;
    range: [number, number] | null;
    uid: number;
}

export interface BRepGraphEdgeInfoResult extends BRepGraphResult {
    edges: BRepGraphEdgeGeometry[];
}

export interface BRepGraphContainmentResult extends BRepGraphResult {
    shellsOfFace: number[][];
    solidsOfShell: number[][];
    solidsOfFace: number[][];
}

export interface BRepGraphWire {
    index: number;
    closed: boolean;
    outer: boolean;
    nbCoEdges: number;
    nbDistinctEdges: number;
    face: number;
}

export interface BRepGraphWireInfoResult extends BRepGraphResult {
    wires: BRepGraphWire[];
}

export interface BRepGraphNodeRef {
    kind: string;
    index: number;
}

export interface BRepGraphProduct {
    index: number;
    isAssembly: boolean;
    isPart: boolean;
    shapeRoot: BRepGraphNodeRef | null;
    components: number[];
}

export interface BRepGraphOccurrence {
    index: number;
    product: number;
    parentProduct: number;
    matrix: number[];
}

export interface BRepGraphAssemblyResult extends BRepGraphResult {
    rootProducts: number[];
    products: BRepGraphProduct[];
    occurrences: BRepGraphOccurrence[];
}

export interface BRepGraphIssue {
    severity: "error" | "warning";
    node: BRepGraphNodeRef;
    description: string;
}

export interface BRepGraphValidationResult extends BRepGraphResult {
    valid: boolean;
    errors: number;
    warnings: number;
    issues: BRepGraphIssue[];
}

export interface BRepGraphDumpSolid {
    index: number;
    uid: number;
}

export interface BRepGraphDumpShell {
    index: number;
    uid: number;
    nbFaces: number;
    closed: boolean;
    solids: number[];
}

export interface BRepGraphDumpFace {
    index: number;
    uid: number;
    surfaceType: BRepGraphSurfaceType;
    shells: number[];
    edges: number[];
}

export interface BRepGraphDumpEdge {
    index: number;
    uid: number;
    startVertex: number;
    endVertex: number;
    degenerated: boolean;
    faces: number[];
}

export interface BRepGraphDumpVertex {
    index: number;
    uid: number;
    point: Base.Point3;
    edges: number[];
}

export interface BRepGraphDumpResult extends BRepGraphResult {
    solids: BRepGraphDumpSolid[];
    shells: BRepGraphDumpShell[];
    faces: BRepGraphDumpFace[];
    edges: BRepGraphDumpEdge[];
    vertices: BRepGraphDumpVertex[];
}

export interface BRepGraphNodeLookup {
    valid: boolean;
    kind?: string;
    index?: number;
    uid?: number;
}
