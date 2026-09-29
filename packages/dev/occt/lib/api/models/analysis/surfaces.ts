import type { Base } from "../../inputs";

/**
 * The point of a face nearest a given point: its `u` and `v` as fractions of the face's UV bounds,
 * as `shapes.face.pointOnUV` takes them, its distance from the given point, the face's unit normal
 * there, and whether it lies on the face's boundary, where a point beyond the face's edges comes to.
 */
export interface FaceClosestPoint {
    point: Base.Point3;
    u: number;
    v: number;
    distance: number;
    normal: Base.Vector3;
    isOnBoundary: boolean;
}

/**
 * How a face bends at one place: the point, the unit normal the way the face looks, the largest and
 * smallest curvatures (1 over a radius, positive where the face bulges out along its normal, as the
 * outside of a ball does), their mean and product (the Gaussian curvature), and the unit directions
 * along which the face bends most and least. `isUmbilic` is true where it bends the same way in every
 * direction, as a plane or a ball does; where no curvature can be read, `isDefined` is false and the
 * curvatures and directions are 0.
 */
export interface FaceCurvature {
    point: Base.Point3;
    normal: Base.Vector3;
    maxCurvature: number;
    minCurvature: number;
    meanCurvature: number;
    gaussianCurvature: number;
    maxDirection: Base.Vector3;
    minDirection: Base.Vector3;
    isUmbilic: boolean;
    isDefined: boolean;
}
