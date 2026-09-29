import type { OCCT } from "../../inputs";

/**
 * One sub-shape with something wrong: its kind, its index as the getter of that kind numbers it
 * (`shapes.face.getFaces` for a face, `shapes.edge.getEdges` for an edge, `shapes.vertex.getVertices`
 * for a vertex, and so on), and the names of the checks it fails, such as `NotClosed`,
 * `BadOrientationOfSubshape` or `InvalidCurveOnSurface`. When the check itself fails, one fault names
 * the whole shape at index 0 with a status that starts with `CheckFail`.
 */
export interface ValidityFault {
    type: OCCT.shapeTypeEnum;
    index: number;
    statuses: string[];
}

/**
 * What a check of a shape found: whether it is a sound shape, every sub-shape with something wrong,
 * vertices first, then edges, wires, faces, shells and solids, and the smallest, largest and average
 * tolerance over its vertices, edges and faces, in model units.
 */
export interface ValidityReport {
    isValid: boolean;
    faults: ValidityFault[];
    minTolerance: number;
    maxTolerance: number;
    averageTolerance: number;
}

/**
 * The free boundaries of a shape, its edges that bound only one face joined into wires: `closed`
 * holds the wires that close on themselves, such as the rim of an opening, and `open` the others,
 * each as a compound of wires.
 */
export interface FreeBoundaries<T> {
    closed: T;
    open: T;
}

/**
 * What sewing made: the sewn shape, a compound of the edges left bounding only one face and their
 * count, how many edges ended up shared by more than two faces, how many were sewn together, and how
 * many degenerate edges and pieces smaller than the tolerance were found, such as the poles of a sphere.
 */
export interface SewReport<T> {
    shape: T;
    freeEdges: T;
    freeEdgeCount: number;
    multipleEdgeCount: number;
    contiguousEdgeCount: number;
    degeneratedCount: number;
}
