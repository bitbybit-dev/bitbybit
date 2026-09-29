/**
 * What an operation made of the faces, edges and vertices of one shape it was given, as lists of
 * indexes: faces as `shapes.face.getFaces` lists them, edges as `shapes.edge.getEdges` does and
 * vertices as `shapes.vertex.getVertices` does, of the input and the result alike. `faces[i]` holds
 * the result faces input face `i` became: itself where it is unchanged, its pieces where it was cut,
 * none where it is gone. `facesFromEdges[i]` holds the result faces made from input edge `i`, such as
 * the round a fillet puts along it; `firstFaces` and `lastFaces` are a sweep's ends.
 */
export interface ShapeHistory {
    faces: number[][];
    edges: number[][];
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
