import type { Base } from "../../inputs";

/**
 * The point of a curve nearest a given point: its parameter as a fraction of the curve, its length
 * from the start, its distance from the given point, and the index of the edge it lies on as
 * `shapes.edge.getEdgesAlongWire` numbers them.
 */
export interface CurveClosestPoint {
    point: Base.Point3;
    param: number;
    length: number;
    distance: number;
    edgeIndex: number;
}

/**
 * How a curve bends at one place: the point, the unit tangent, the principal normal pointing to the
 * center of curvature, the binormal (tangent x normal), the curvature (1 over the radius), the
 * radius, the center of the circle that fits the curve there, and the torsion, positive where the
 * curve winds as a right-handed helix does. Where the curve runs straight, `isStraight` is true, the
 * curvature and torsion are 0, the radius is `Infinity`, the normal and binormal are zero vectors
 * and the center is the point itself.
 */
export interface CurveCurvature {
    point: Base.Point3;
    tangent: Base.Vector3;
    normal: Base.Vector3;
    binormal: Base.Vector3;
    curvature: number;
    radius: number;
    center: Base.Point3;
    torsion: number;
    isStraight: boolean;
}

/**
 * A corner of a curve where its tangent turns: the point, the index of the edge that ends there as
 * `shapes.edge.getEdgesAlongWire` numbers them, and the angle the tangent turns by, in degrees, from
 * 0 for a smooth join to 180 for a turn back.
 */
export interface CurveKink {
    point: Base.Point3;
    edgeIndex: number;
    angle: number;
}

/**
 * A highest or lowest point of a curve along a direction: the point, its parameter as a fraction of
 * the curve, its length from the start, its height (how far it lies along the direction, measured
 * from the origin), whether it is a highest point rather than a lowest, and whether it is a global
 * one, with no point of the curve higher, or lower for a lowest point.
 */
export interface CurveExtreme {
    point: Base.Point3;
    param: number;
    length: number;
    height: number;
    isMaximum: boolean;
    isGlobal: boolean;
}

/**
 * A point where two curves meet: its parameter on each as a fraction of that curve, the index of the
 * edge it lies on in each as `shapes.edge.getEdgesAlongWire` numbers them, and whether it is an end
 * of a stretch where the curves run together rather than a crossing.
 */
export interface CurveIntersection {
    point: Base.Point3;
    paramA: number;
    paramB: number;
    edgeIndexA: number;
    edgeIndexB: number;
    isOverlap: boolean;
}

/**
 * A point where a curve meets a face: its parameter on the curve as a fraction, the index of the
 * edge it lies on as `shapes.edge.getEdgesAlongWire` numbers them, its `u` and `v` on the face as
 * fractions of the face's UV bounds, as `shapes.face.pointOnUV` takes them, and whether it is an end
 * of a stretch of the curve lying on the face.
 */
export interface CurveFaceIntersection {
    point: Base.Point3;
    param: number;
    edgeIndex: number;
    u: number;
    v: number;
    isOverlap: boolean;
}
