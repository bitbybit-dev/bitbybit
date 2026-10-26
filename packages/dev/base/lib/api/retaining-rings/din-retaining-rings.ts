import { InputError } from "../kernel-calls/errors";
import { lengthsConverted, snappedLength, tableLength } from "../services/helpers/geometry/lengths";
import type { Base } from "../inputs/base-inputs";
import type { RetainingRingKind, RetainingRingSizes } from "./retaining-ring-types";
import { BORE_RINGS, SHAFT_RINGS } from "./din-retaining-rings.constants";
import { checkedRingKind } from "./retaining-rings";
import { RING_LENGTHS } from "./retaining-rings.constants";

const ringsOf = (kind: RetainingRingKind): readonly RetainingRingSizes[] => checkedRingKind(kind) === "shaft" ? SHAFT_RINGS : BORE_RINGS;

export function dinRetainingRingDiameters(kind: RetainingRingKind, unit: `${Base.unitOfLengthEnum}`): number[] {
    return ringsOf(kind).map(row => snappedLength(row.nominal, "mm", unit));
}

export function dinRetainingRingSizes(kind: RetainingRingKind, diameter: number, unit: `${Base.unitOfLengthEnum}`): RetainingRingSizes {
    const rows = ringsOf(kind);
    const nominal = tableLength(diameter, unit, "mm");
    const row = rows.find(candidate => candidate.nominal === nominal);
    if (row === undefined) {
        const standard = kind === "shaft" ? "DIN 471" : "DIN 472";
        const nearest = rows.reduce((best, candidate) => Math.abs(candidate.nominal - nominal) < Math.abs(best.nominal - nominal) ? candidate : best);
        throw new InputError(`\`diameter\` is ${String(diameter)}, a size ${standard} lists no ring for; the nearest is ${String(snappedLength(nearest.nominal, "mm", unit))}.`, "diameter");
    }
    return lengthsConverted({ ...row }, RING_LENGTHS, "mm", unit);
}
