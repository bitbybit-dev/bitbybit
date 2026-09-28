import { Base } from "../../inputs";

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
 * The smallest box found around a shape, turned to fit it: a frame at its centre with the direction
 * along its longest side and the normal along its shortest, and half its size along the direction,
 * the frame's y axis and the normal.
 */
export interface OrientedBoundingBox {
    frame: Base.Frame;
    halfSizes: Base.Vector3;
}
