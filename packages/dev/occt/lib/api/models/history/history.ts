/**
 * What an operation made of the faces, edges and vertices of one shape it was given, as lists of
 * indexes: faces as `shapes.face.getFaces` lists them, edges as `shapes.edge.getEdges` does and
 * vertices as `shapes.vertex.getVertices` does, of the input and the result alike. `faces[i]` holds
 * the result faces input face `i` became: itself where it is unchanged, its pieces where it was cut,
 * none where it is gone. `facesFromFaces[i]` holds the result faces made from input face `i`, such as
 * the inner wall a thick solid offsets from it, and `edgesFromFaces[i]` the result edges made from it,
 * such as where a boolean cut it. `facesFromEdges[i]` holds the result faces made from input edge `i`,
 * such as the round a fillet puts along it or the side a sweep makes of it; `firstFaces` and
 * `lastFaces` are where a sweep, a loft or a feature starts and ends.
 */
export interface ShapeHistory {
    faces: number[][];
    edges: number[][];
    facesFromFaces: number[][];
    edgesFromFaces: number[][];
    facesFromEdges: number[][];
    facesFromVertices: number[][];
    edgesFromVertices: number[][];
    firstFaces: number[];
    lastFaces: number[];
}

/**
 * A shape an operation made, with what it made of each face, edge and vertex of the shape it was
 * given.
 */
export interface ShapeWithHistory<T> {
    shape: T;
    history: ShapeHistory;
}

/**
 * A shape an operation made from several shapes, with the history of each shape it was given, in
 * the order they were given.
 */
export interface ShapeWithHistories<T> {
    shape: T;
    histories: ShapeHistory[];
}
