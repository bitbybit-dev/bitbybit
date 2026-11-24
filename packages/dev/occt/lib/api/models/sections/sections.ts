import type { Base } from "@bitbybit-dev/base";
import type { IO } from "@bitbybit-dev/base/lib/api/inputs/io-inputs";

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

/**
 * The edges of a view of a shape sorted by kind, each a drawing on the XZ plane. `sharp` holds the
 * edges where two faces meet at an angle and the free edges, `outline` the silhouettes of curved
 * faces, which are no edge of the shape, and `smooth` the edges where faces meet without a crease.
 * Those three are the edges the eye sees; `hiddenSharp`, `hiddenOutline` and `hiddenSmooth` are the
 * same kinds where faces cover them.
 */
export interface HiddenLinesByKindResult<T> {
    sharp: T;
    outline: T;
    smooth: T;
    hiddenSharp: T;
    hiddenOutline: T;
    hiddenSmooth: T;
}

/**
 * Shapes cut by the plane of a frame with their cut faces hatched, as
 * `operations.hatchedSectionByFrame` gives them: the `frame`, squared, and for each shape in the
 * order given, its cut faces. The hatches stand in the frame's own coordinates, its direction along
 * X and the normal crossed with the direction along Y, so they write to DXF or SVG beside
 * `operations.hiddenLines` drawn with the same frame. What lies on the side the frame's normal
 * points to is the side taken away.
 * @beta
 */
export interface HatchedSection<T> {
    frame: Base.Frame;
    shapes: HatchedSectionShape<T>[];
}

/**
 * The cut faces of one shape of a hatched section, all hatched at its `angle`; a shape the plane
 * misses has no `caps`.
 * @beta
 */
export interface HatchedSectionShape<T> {
    angle: number;
    caps: HatchedSectionCap<T>[];
}

/**
 * One cut face of a hatched section: the `face` in 3D, its hatch lines as straight edges lying in
 * the face's plane, in one compound, and the `hatch` as drawing data - the face's outer and inner
 * boundaries in the frame's coordinates with the pattern, angle and spacing - which a drawing
 * part's `hatches` takes.
 * @beta
 */
export interface HatchedSectionCap<T> {
    face: T;
    lines: T;
    hatch: IO.DrawingHatchDto;
}
