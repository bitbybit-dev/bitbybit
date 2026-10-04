import { KernelOperationError, fillFailureMessage } from "@bitbybit-dev/base";

/**
 * Every failure an OCCT operation names, by its stable code, with the values its message names: a
 * code whose type is undefined names none. `{ edges: [3, 7] }` fills the `{edges}` of the code's
 * template in `OCCT_FAILURES`.
 */
export type OcctFailureDetails = {
    "occt.boolean.failed": undefined;
    "occt.boolean.mixedDimensions": undefined;
    "occt.fillet.failed": undefined;
    "occt.fillet.failedOnEdges": { readonly edges: readonly number[] };
    "occt.fillet.failedAtCorners": { readonly corners: readonly number[] };
    "occt.chamfer.failed": undefined;
    "occt.offset.failed": undefined;
    "occt.thickSolid.failed": undefined;
    "occt.loft.failed": undefined;
    "occt.revolve.failed": undefined;
    "occt.pipe.failed": undefined;
    "occt.pipe.notValid": { readonly trihedron: string };
};

/** The code of a failure an OCCT operation names, such as `occt.fillet.failedOnEdges`. */
export type OcctFailureCode = keyof OcctFailureDetails;

/**
 * Every failure an OCCT operation names, by its stable code, with the English template of its
 * message: a `{name}` in it is filled with the failure's detail of that name. A code never changes
 * meaning between releases, so a host can translate the templates by their codes and fill its own
 * with `fillFailureMessage`; the English wording may improve.
 */
export const OCCT_FAILURES: Readonly<Record<OcctFailureCode, string>> = {
    "occt.boolean.failed": "The boolean operation could not be computed. One of the shapes may be broken, open or passing through itself.",
    "occt.boolean.mixedDimensions": "The boolean operation cannot combine shapes of different dimensions, such as a solid and an edge. Give it shapes of one kind; to divide a solid by a wire or an edge, split it instead.",
    "occt.fillet.failed": "The fillet could not be built. A radius may be too large for the faces beside an edge, or the edges may meet at a corner the fillet cannot round.",
    "occt.fillet.failedOnEdges": "The fillet could not be built at these edges of the shape, counted from 0: {edges}. A radius may be too large for the faces beside them, or the edges may meet at a corner the fillet cannot round.",
    "occt.fillet.failedAtCorners": "The fillet could not round these corners, counted from 1: {corners}. The radius may be too large for the edges that meet there.",
    "occt.chamfer.failed": "The chamfer could not be built. A distance may be too large for the faces beside an edge, or the edges may meet at a corner the chamfer cannot cut.",
    "occt.offset.failed": "The offset could not be built. An inward offset may be larger than the shape allows, or a corner may be too sharp for the join type.",
    "occt.thickSolid.failed": "The thick solid could not be built. The thickness may be larger than the shape allows, or a corner may be too sharp for the join type.",
    "occt.loft.failed": "The loft could not be built. The sections may not fit together, such as open and closed wires mixed, or may lie so that the surface through them crosses itself.",
    "occt.revolve.failed": "The revolve could not be built. The profile may cross or touch the axis, which makes the swept shape pass through itself; keep the whole profile on one side of the axis.",
    "occt.pipe.failed": "The pipe could not be built. The profile may be too large for the bends of the path, or the path may turn a corner the profile cannot follow.",
    "occt.pipe.notValid": "The pipe came out as a shape that is not valid, part of its side missing. With the {trihedron} trihedron OCCT can do that on a path that is straight or nearly so; the discrete trihedron (isDiscreteTrihedron) builds such paths.",
};

/**
 * The error an OCCT operation throws when the kernel could not complete it: a `KernelOperationError`
 * with the code, its details, and its English template filled with them.
 * @param code - The failure's code
 * @param details - The values its message names, for a code that names any
 * @returns The error to throw
 */
export function occtFailure<C extends OcctFailureCode>(code: C, ...details: OcctFailureDetails[C] extends undefined ? [] : [OcctFailureDetails[C]]): KernelOperationError {
    const [values] = details;
    return new KernelOperationError(code, fillFailureMessage(OCCT_FAILURES[code], values), values);
}
