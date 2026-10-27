import type { Base } from "@bitbybit-dev/base";
import type { DesignBuiltAppearance } from "./build";

/**
 * A part of a build `design.section` cuts: its `id`, its `shape`, the `shapeHash` the build gave it,
 * which the section's own hashes are made from, and its appearance.
 */
export interface DesignSectionSourcePart<T> {
    id: string;
    shape: T;
    shapeHash: string;
    appearance?: DesignBuiltAppearance | undefined;
}

/**
 * A placement of a build `design.section` cuts: its `path`, the `part` it places and its column-major
 * 4 x 4 `world` matrix. One that places no part, such as a sub-assembly, is passed over.
 */
export interface DesignSectionSourceComponent {
    path: string;
    part?: string | undefined;
    world: Base.TransformMatrix;
}

/**
 * The build `design.section` cuts: its `parts` and, for an assembly, the `components` that place
 * them. What `design.build` returns is one.
 */
export interface DesignSectionSource<T> {
    parts: DesignSectionSourcePart<T>[];
    components?: DesignSectionSourceComponent[] | undefined;
}

/**
 * What a part of a section is: the `cap`, the faces where the plane passes through a part, the
 * `piece` of a part the plane cuts that lies behind it, or a `whole` part that lies behind the plane.
 */
export type DesignSectionKind = "cap" | "piece" | "whole";

/**
 * A part of a section, in the coordinates of the part it was cut `from`: its `id`, its `kind`, its
 * `shape` and its `shapeHash`, the same for the same part and the same plane through it in every
 * section, so a drawer keeps one mesh for it. It keeps the cut part's colour and finish, without
 * the colours of single faces and edges. A cap gives its `area`, a piece or a whole part its `volume`
 * when it is solid.
 */
export interface DesignSectionPart<T> {
    id: string;
    kind: DesignSectionKind;
    from: string;
    shape: T;
    shapeHash: string;
    appearance?: DesignBuiltAppearance;
    area?: number;
    volume?: number;
}

/**
 * Where a part of a section is placed: the `path` of the component of the build it cuts, the section
 * `part` and the same `world` matrix. A component the plane cuts places its cap and its piece.
 */
export interface DesignSectionComponent {
    path: string;
    part: string;
    world: Base.TransformMatrix;
}

/**
 * A design build cut by the plane of a `frame`: its `parts`, placed by `components` when the build had
 * them, as a build places its parts, so it draws as a build does. What lies on the side the frame's
 * normal points to is taken away, which is the side `operations.hiddenLines` looks from with the same
 * frame.
 */
export interface DesignSection<T> {
    frame: Base.Frame;
    parts: DesignSectionPart<T>[];
    components?: DesignSectionComponent[];
}
