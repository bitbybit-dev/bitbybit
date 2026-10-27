import * as Inputs from "../inputs";
import { InputError } from "../kernel-calls/errors";
import type { RetainingRingKind } from "./retaining-ring-types";

const RING_KINDS: readonly RetainingRingKind[] = Object.values(Inputs.Engineering.retainingRingKindEnum);

export function checkedRingKind(kind: RetainingRingKind): RetainingRingKind {
    if (!RING_KINDS.includes(kind)) {
        throw new InputError(`\`kind\` is not one of ${RING_KINDS.join(", ")}.`, "kind");
    }
    return kind;
}
