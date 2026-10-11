import type { Base } from "../../inputs";

/**
 * A shape's principal axes of inertia as a frame at its centre of mass: the direction is the axis
 * the shape turns about most easily, the normal the axis it resists most. The moments are about the
 * direction, the frame's y axis and the normal, in that order, for a density of 1.
 */
export interface PrincipalFrame {
    frame: Base.Frame;
    moments: Base.Vector3;
}

/**
 * A box around a shape as a frame at its centre and half its size along the frame's direction, y
 * axis and normal. `analysis.measure.orientedBoundingBox` turns the box to fit the shape, its
 * direction along the longest side and its normal along the shortest;
 * `analysis.measure.boundingBoxInFrame` keeps the axes of the frame it is given.
 */
export interface OrientedBoundingBox {
    frame: Base.Frame;
    halfSizes: Base.Vector3;
}
