import type { Base, OCCT } from "../../inputs";

/**
 * What one face of a shape is like, read in one pass with every other face: the kind of surface it
 * lies on, its area, its centre of area, the unit normal at the middle of its parameter range pointing
 * out of the material ([0, 0, 0] where it has none), and a box holding it, which may be loose on a
 * curved face. `index` is its index as `shapes.face.getFaces` and the selectors number it.
 */
export interface FaceSignature {
    index: number;
    type: OCCT.surfaceTypeEnum;
    area: number;
    centre: Base.Point3;
    normal: Base.Vector3;
    box: { min: Base.Point3; max: Base.Point3 };
}

/**
 * What one edge of a shape is like: the kind of curve it runs along, its length, the point half way
 * along it and the unit tangent there, following the edge's orientation. A degenerate edge, such as
 * the pole of a sphere, or an edge with no curve to measure has `isDegenerate` true, type `other`,
 * length 0, no tangent ([0, 0, 0]) and its vertex as midpoint. `index` is its index as
 * `shapes.edge.getEdges` and the selectors number it.
 */
export interface EdgeSignature {
    index: number;
    type: OCCT.curveTypeEnum;
    isDegenerate: boolean;
    length: number;
    midpoint: Base.Point3;
    tangent: Base.Vector3;
}

/**
 * A fingerprint of every face and every edge of a shape, in the selectors' numbering, so faces and
 * edges can be told apart, compared or found again after a rebuild without asking about each one.
 */
export interface ShapeSignatures {
    faces: FaceSignature[];
    edges: EdgeSignature[];
}
