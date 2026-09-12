// A fragment of the Manifold inputs namespace: scripts/gen-inputs.mjs assembles every file in this
// directory, in the order set by scripts/inputs.config.mjs, into ../manifold-inputs.ts. Edit here, then regenerate.

/**
 * A handle to a solid living inside the Manifold kernel, not the geometry itself. The kernel runs
 * as WebAssembly with its own memory, so what crosses back into JavaScript is this small
 * reference. Pass it into the next operation to keep building, and dispose it when finished to
 * release the kernel memory behind it.
 */
export type ManifoldPointer = { hash: number, type: "manifold-shape" };
/**
 * A handle to a 2D cross section inside the Manifold kernel. Cross sections are built, offset and
 * booleaned in the plane, then extruded or revolved into solids - often the cheapest route to a
 * profile-driven part.
 */
export type CrossSectionPointer = { hash: number, type: "manifold-shape" };
/**
 * A handle to raw mesh data inside the Manifold kernel, used when importing an existing mesh into
 * the kernel or reading one back out.
 */
export type MeshPointer = { hash: number, type: "manifold-shape" };

/**
 * How overlapping and self-intersecting outlines decide what is inside. evenOdd alternates with
 * each crossing, so a shape inside a shape becomes a hole; nonZero counts winding direction, so
 * overlaps stay filled; positive and negative keep only regions with winding of that sign. If an
 * imported outline fills wrongly, this is the setting to change first.
 */
export enum fillRuleEnum {
    evenOdd = "EvenOdd",
    nonZero = "NonZero",
    positive = "Positive",
    negative = "Negative"
}
/**
 * How an offset fills the outside of a corner: square cuts it off flat, round arcs around it,
 * miter extends both sides to a sharp point, bevel cuts a chamfer. Miter can produce very long
 * spikes at tight angles, which is why square or round is the safer default.
 */
export enum manifoldJoinTypeEnum {
    square = "Square",
    round = "Round",
    miter = "Miter",
    bevel = "Bevel"
}
/**
 * A Manifold solid taken apart into plain arrays - vertex properties, triangle indices and the
 * run structure that groups them. The form the kernel hands back when geometry has to cross out of
 * WebAssembly for rendering or export.
 */
export class DecomposedManifoldMeshDto {
    /**
     * How many numbers each vertex carries in `vertProperties`; the position takes the first three.
     */
    numProp!: number;
    /**
     * All vertex properties in one flat list, `numProp` numbers per vertex, position first.
     */
    vertProperties!: Float32Array;
    /**
     * The triangles as a flat list of vertex indexes, three per triangle.
     */
    triVerts!: Uint32Array;
    /**
     * For each merged vertex, the index of the property vertex that is merged away; pairs with
     * `mergeToVert`.
     */
    mergeFromVert?: Uint32Array | undefined;
    /**
     * For each merged vertex, the index of the property vertex it is merged into; pairs with
     * `mergeFromVert`.
     */
    mergeToVert?: Uint32Array | undefined;
    /**
     * Where each triangle run starts in `triVerts`, one entry per run plus a final end marker.
     */
    runIndex?: Uint32Array | undefined;
    /**
     * The id of the original shape each run of triangles came from, one per run.
     */
    runOriginalID?: Uint32Array | undefined;
    /**
     * The placement of each run as 12 numbers of a column-major 3x4 matrix, one per run.
     */
    runTransform?: Float32Array | undefined;
    /**
     * For each triangle, the id of the flat face it belongs to, so coplanar triangles can be
     * grouped.
     */
    faceID?: Uint32Array | undefined;
    /**
     * The smoothing tangent of each half-edge as four numbers, direction and weight, when the solid
     * was smoothed.
     */
    halfedgeTangent?: Float32Array | undefined;
}
