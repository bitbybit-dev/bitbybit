import { Base } from "../../inputs";

/**
 * The base shape every boundary-representation query returns: whether it succeeded, and the error
 * if it did not. Check ok before reading the rest - a failed query still returns an object rather
 * than throwing, so that a batch of queries can report per-item failures.
 */
export interface BRepGraphResult {
    ok: boolean;
    error?: string;
}

/**
 * A census of a shape's topology: how many solids, shells, faces, wires, edges, coedges and
 * vertices it contains, how many distinct surfaces and curves back them, and how many assembly
 * products and occurrences are present. The quickest way to see what an imported STEP file
 * actually contains, and to spot the difference between one solid and a compound that merely looks
 * like one.
 */
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

/**
 * One face and the indices of the faces sharing an edge with it. The building block of
 * face-adjacency traversal - growing a selection outward from a seed face, or finding the faces
 * that form a pocket.
 */
export interface BRepGraphFaceAdjacency {
    index: number;
    adjacent: number[];
    edges: number[];
    nbWires: number;
    outerWire: number;
}

/**
 * The face adjacency map for a whole shape: for each face, which faces touch it.
 */
export interface BRepGraphFaceAdjacencyResult extends BRepGraphResult {
    faces: BRepGraphFaceAdjacency[];
}

/**
 * One edge together with the faces on either side of it. An edge with two faces is interior, one
 * with a single face is on an open boundary, and one with more than two indicates non-manifold
 * geometry - which is the usual reason a shape refuses to become a solid.
 */
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

/**
 * The edge-to-face map for a whole shape. Use it to find open boundaries and non-manifold edges
 * before attempting to sew a shell into a solid.
 */
export interface BRepGraphEdgeFaceMapResult extends BRepGraphResult {
    edges: BRepGraphEdgeFace[];
}

/**
 * One vertex: its index, its position, and the edges meeting at it.
 */
export interface BRepGraphVertex {
    index: number;
    point: Base.Point3;
    tolerance: number;
    edges: number[];
}

/**
 * The vertex-to-edge map for a whole shape, giving each vertex's position and the edges that meet
 * there. The valence - how many edges meet - is what distinguishes an ordinary corner from a
 * singular point.
 */
export interface BRepGraphVertexEdgeMapResult extends BRepGraphResult {
    vertices: BRepGraphVertex[];
}

/**
 * What kind of surface backs a face - plane, cylinder, cone, sphere, torus, Bezier, B-spline, and
 * the rest. Worth checking before an operation that only makes sense on one kind, and useful for
 * recognising features: a set of cylindrical faces of equal radius is usually a hole pattern.
 */
export type BRepGraphSurfaceType =
    "Plane" | "Cylinder" | "Cone" | "Sphere" | "Torus" |
    "BezierSurface" | "BSplineSurface" | "SurfaceOfRevolution" |
    "SurfaceOfExtrusion" | "OffsetSurface" | "OtherSurface" | "None";

/**
 * What a face is made of: its surface type, area, orientation, and the parameters of the
 * underlying surface where they are meaningful - a cylinder's radius and axis, a plane's normal.
 */
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

/**
 * Per-face geometry for a whole shape.
 */
export interface BRepGraphFaceInfoResult extends BRepGraphResult {
    faces: BRepGraphFaceGeometry[];
}

/**
 * What kind of curve backs an edge - line, circle, ellipse, hyperbola, parabola, Bezier, B-spline
 * and the rest.
 */
export type BRepGraphCurveType =
    "Line" | "Circle" | "Ellipse" | "Hyperbola" | "Parabola" |
    "BezierCurve" | "BSplineCurve" | "OffsetCurve" | "OtherCurve" | "None";

/**
 * How smoothly two pieces of geometry meet, in the standard notation. C0 means they touch, G1
 * means tangent directions align, C1 means tangent vectors match, and the G2/C2 and higher grades
 * add curvature continuity. This is what decides whether a fillet reads as smooth or shows a
 * visible crease under reflection.
 */
export type BRepGraphContinuity = "C0" | "G1" | "C1" | "G2" | "C2" | "C3" | "CN";

/**
 * What an edge is made of: its curve type, length, the vertices at its ends, and the parameters of
 * the underlying curve where they are meaningful - a circle's radius and centre, a line's
 * direction.
 */
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

/**
 * Per-edge geometry for a whole shape.
 */
export interface BRepGraphEdgeInfoResult extends BRepGraphResult {
    edges: BRepGraphEdgeGeometry[];
}

/**
 * Whether one shape lies inside another, and where the test placed each point that was checked.
 */
export interface BRepGraphContainmentResult extends BRepGraphResult {
    shellsOfFace: number[][];
    solidsOfShell: number[][];
    solidsOfFace: number[][];
}

/**
 * One wire: its edges, whether it is closed, and its length. A face's outer wire is its boundary;
 * any others are its holes.
 */
export interface BRepGraphWire {
    index: number;
    closed: boolean;
    outer: boolean;
    nbCoEdges: number;
    nbDistinctEdges: number;
    face: number;
}

/**
 * Per-wire information for a whole shape - which wires are closed, and which face each bounds.
 */
export interface BRepGraphWireInfoResult extends BRepGraphResult {
    wires: BRepGraphWire[];
}

/**
 * A reference to a node in the graph: its kind and its index. Used wherever one part of a result
 * points at another without repeating it.
 */
export interface BRepGraphNodeRef {
    kind: string;
    index: number;
}

/**
 * One product in an assembly - a part definition, named and shaped, that may be placed more than
 * once. The distinction between a product and an occurrence is what makes assemblies compact: ten
 * identical screws are one product with ten occurrences.
 */
export interface BRepGraphProduct {
    index: number;
    isAssembly: boolean;
    isPart: boolean;
    shapeRoot: BRepGraphNodeRef | null;
    components: number[];
}

/**
 * One placement of a product within an assembly: which product, at which transform, under which
 * parent.
 */
export interface BRepGraphOccurrence {
    index: number;
    product: number;
    parentProduct: number;
    matrix: number[];
}

/**
 * The assembly structure of a shape: its products, their occurrences, and which products sit at
 * the root. This is what STEP assembly import produces, and what you walk to build a tree view.
 */
export interface BRepGraphAssemblyResult extends BRepGraphResult {
    rootProducts: number[];
    products: BRepGraphProduct[];
    occurrences: BRepGraphOccurrence[];
}

/**
 * One problem found while validating a shape, with its kind, severity and the node it concerns.
 */
export interface BRepGraphIssue {
    severity: "error" | "warning";
    node: BRepGraphNodeRef;
    description: string;
}

/**
 * The result of validating a shape: whether it is sound, and every issue found. Run it before
 * exporting for manufacture - self-intersections, open shells and non-manifold edges are all much
 * cheaper to find here than in a slicer or a CAM package.
 */
export interface BRepGraphValidationResult extends BRepGraphResult {
    valid: boolean;
    errors: number;
    warnings: number;
    issues: BRepGraphIssue[];
}

/**
 * A solid as it appears in a full structural dump: its index and the shells it contains.
 */
export interface BRepGraphDumpSolid {
    index: number;
    uid: number;
}

/**
 * A shell as it appears in a full structural dump: its index, its faces, and whether it is closed.
 */
export interface BRepGraphDumpShell {
    index: number;
    uid: number;
    nbFaces: number;
    closed: boolean;
    solids: number[];
}

/**
 * A face as it appears in a full structural dump: its index, its wires, its surface, and its
 * orientation.
 */
export interface BRepGraphDumpFace {
    index: number;
    uid: number;
    surfaceType: BRepGraphSurfaceType;
    shells: number[];
    edges: number[];
}

/**
 * An edge as it appears in a full structural dump: its index, its vertices, its curve, and its
 * length.
 */
export interface BRepGraphDumpEdge {
    index: number;
    uid: number;
    startVertex: number;
    endVertex: number;
    degenerated: boolean;
    faces: number[];
}

/**
 * A vertex as it appears in a full structural dump: its index and its position.
 */
export interface BRepGraphDumpVertex {
    index: number;
    uid: number;
    point: Base.Point3;
    edges: number[];
}

/**
 * A complete structural dump of a shape - every solid, shell, face, edge and vertex with the
 * relationships between them. The heaviest of the graph queries and the one to reach for when you
 * need to reason about the whole topology at once rather than answer a single question.
 */
export interface BRepGraphDumpResult extends BRepGraphResult {
    solids: BRepGraphDumpSolid[];
    shells: BRepGraphDumpShell[];
    faces: BRepGraphDumpFace[];
    edges: BRepGraphDumpEdge[];
    vertices: BRepGraphDumpVertex[];
}

/**
 * An index from node kind and number back to the node itself, so a result that refers to nodes by
 * index can be resolved without searching.
 */
export interface BRepGraphNodeLookup {
    valid: boolean;
    kind?: string;
    index?: number;
    uid?: number;
}
