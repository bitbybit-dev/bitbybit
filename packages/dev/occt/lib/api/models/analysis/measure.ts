import type { Base, OCCT } from "../../inputs";

/**
 * One nearest pair of points between two shapes: `pointA` on the first and `pointB` on the second,
 * the distance between them, and on each side what the point lies on (a vertex, an edge or a face),
 * that sub-shape's index as `shapes.vertex.getVertices`, `shapes.edge.getEdges` or
 * `shapes.face.getFaces` numbers it, and where on it: on a face `u` and `v` as fractions of its UV
 * bounds, as `shapes.face.pointOnUV` takes them; on an edge `u` as a fraction of the edge from its
 * start to its end as it runs, and `v` 0; on a vertex both 0. When one shape lies inside a solid of
 * the other, the one pair is at distance 0 on a vertex of the inner shape, and the index of the side
 * that contains the other is -1.
 */
export interface ShapeExtremum {
    pointA: Base.Point3;
    pointB: Base.Point3;
    distance: number;
    supportA: OCCT.shapeTypeEnum;
    supportB: OCCT.shapeTypeEnum;
    indexA: number;
    indexB: number;
    uA: number;
    vA: number;
    uB: number;
    vB: number;
}

/**
 * The angle between two faces or edges, in degrees from 0 to 180, read where they are nearest: at
 * `pointA` and `pointB`, between the directions there, which are a face's unit normal and an edge's
 * unit tangent along the edge's orientation.
 */
export interface AngleBetween {
    angle: number;
    pointA: Base.Point3;
    pointB: Base.Point3;
    directionA: Base.Vector3;
    directionB: Base.Vector3;
}

/**
 * The angle between the two faces that meet at an edge, measured through the material, in degrees:
 * 90 for the edge of a box, 180 where the faces meet smoothly, 270 for the inner edge of an L, with
 * `isConvex` true up to 180. `point` is where on the edge it was read, `normalA` and `normalB` are
 * the faces' unit normals there, and `faceIndexA` and `faceIndexB` the faces as
 * `shapes.face.getFaces` numbers them.
 */
export interface DihedralAngle {
    angle: number;
    isConvex: boolean;
    point: Base.Point3;
    normalA: Base.Vector3;
    normalB: Base.Vector3;
    faceIndexA: number;
    faceIndexB: number;
}

/**
 * The tightest bend found on a shape: its radius in model units, the point where it was found, and
 * the face or edge it lies on, with that face's index as `shapes.face.getFaces` numbers it or that
 * edge's as `shapes.edge.getEdges` does. Where nothing bends, `radius` is `Infinity`, `support` is
 * `unknown` and `index` is -1.
 */
export interface MinCurvatureRadius {
    radius: number;
    point: Base.Point3;
    support: OCCT.shapeTypeEnum;
    index: number;
}
