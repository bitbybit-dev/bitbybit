/**
 * The two sides of a shape split by a plane: `front` on the side the plane's normal points to,
 * `back` on the other.
 */
export interface SplitByFrameResult<T> {
    front: T;
    back: T;
}

/**
 * The edges of a view of a shape, flattened into a drawing on the XZ plane: `visible` holds the
 * edges the eye sees, `hidden` the ones that faces cover.
 */
export interface HiddenLinesResult<T> {
    visible: T;
    hidden: T;
}
