import type { Base } from "../../inputs";

/**
 * A part a generator made, with the parts its faces play and the frames it is placed by: each role
 * lists the faces that play it, as `shapes.face.getFaces` numbers them, such as a gear's `tip` or
 * `bore`, and every face plays one role.
 */
export interface ShapeWithRoles<T> {
    /**
     * The part.
     */
    shape: T;
    /**
     * For each role, the indexes of the faces that play it.
     */
    roles: Record<string, number[]>;
    /**
     * Named frames on the part, such as a gear's `axis`: its origin at the centre of the first face,
     * its normal along the axis and its direction toward the first tooth.
     */
    frames: Record<string, Base.Frame>;
}
