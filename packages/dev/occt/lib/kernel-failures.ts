import { KernelOperationError } from "@bitbybit-dev/base";

/** The code of a failure an OCCT operation names, such as `occt.fillet.failed`. */
export type OcctFailureCode =
    | "occt.boolean.failed"
    | "occt.fillet.failed"
    | "occt.chamfer.failed"
    | "occt.offset.failed"
    | "occt.thickSolid.failed"
    | "occt.loft.failed"
    | "occt.revolve.failed"
    | "occt.pipe.failed";

/**
 * Every failure an OCCT operation names, by its stable code, with the English message it reads. A
 * code never changes meaning between releases, so a host can translate the failures by their codes;
 * the English wording may improve.
 */
export const OCCT_FAILURES: Readonly<Record<OcctFailureCode, string>> = {
    "occt.boolean.failed": "The boolean operation could not be computed. The shapes may be of kinds it cannot combine, such as a solid and an edge, or one of them may be invalid, such as open or self-intersecting.",
    "occt.fillet.failed": "The fillet could not be built. A radius may be too large for the faces beside an edge, or the edges may meet at a corner the fillet cannot round.",
    "occt.chamfer.failed": "The chamfer could not be built. A distance may be too large for the faces beside an edge, or the edges may meet at a corner the chamfer cannot cut.",
    "occt.offset.failed": "The offset could not be built. An inward offset may be larger than the shape allows, or a corner may be too sharp for the join type.",
    "occt.thickSolid.failed": "The thick solid could not be built. The thickness may be larger than the shape allows, or a corner may be too sharp for the join type.",
    "occt.loft.failed": "The loft could not be built. The sections may not fit together, such as open and closed wires mixed, or may lie so that the surface through them crosses itself.",
    "occt.revolve.failed": "The revolve could not be built. The profile may cross or touch the axis, which makes the swept shape pass through itself; keep the whole profile on one side of the axis.",
    "occt.pipe.failed": "The pipe could not be built. The profile may be too large for the bends of the path, or the path may turn a corner the profile cannot follow.",
};

/**
 * The error an OCCT operation throws when the kernel could not complete it: a `KernelOperationError`
 * with the code and the message `OCCT_FAILURES` gives it.
 * @param code - The failure's code
 * @returns The error to throw
 */
export function occtFailure(code: OcctFailureCode): KernelOperationError {
    return new KernelOperationError(code, OCCT_FAILURES[code]);
}
