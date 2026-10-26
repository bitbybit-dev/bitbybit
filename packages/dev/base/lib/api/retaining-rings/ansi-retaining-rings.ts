import { InputError } from "../kernel-calls/errors";
import { lengthsConverted, snappedLength, tableLength } from "../services/helpers/geometry/lengths";
import type { Base } from "../inputs/base-inputs";
import type { RetainingRingKind, RetainingRingSizes } from "./retaining-ring-types";
import { ANSI_BORE_RINGS, ANSI_RING_MATCH, ANSI_SHAFT_RINGS } from "./ansi-retaining-rings.constants";
import { RING_LENGTHS } from "./din-retaining-rings.constants";
import { checkedRingKind } from "./retaining-rings";

const ringsOf = (kind: RetainingRingKind): readonly RetainingRingSizes[] => checkedRingKind(kind) === "shaft" ? ANSI_SHAFT_RINGS : ANSI_BORE_RINGS;

export function ansiRetainingRingDiameters(kind: RetainingRingKind, unit: `${Base.unitOfLengthEnum}`): number[] {
    return ringsOf(kind).map(row => snappedLength(row.nominal, "in", unit));
}

export function ansiRetainingRingSizes(kind: RetainingRingKind, diameter: number, unit: `${Base.unitOfLengthEnum}`): RetainingRingSizes {
    const rows = ringsOf(kind);
    const nominal = tableLength(diameter, unit, "in");
    const row = rows.find(candidate => Math.abs(candidate.nominal - nominal) <= ANSI_RING_MATCH);
    if (row === undefined) {
        const series = kind === "shaft" ? "external" : "internal";
        const nearest = rows.reduce((best, candidate) => Math.abs(candidate.nominal - nominal) < Math.abs(best.nominal - nominal) ? candidate : best);
        throw new InputError(`\`diameter\` is ${String(diameter)}, a size the inch ${series} rings list no ring for; the nearest is ${String(snappedLength(nearest.nominal, "in", unit))}.`, "diameter");
    }
    return lengthsConverted({ ...row }, RING_LENGTHS, "in", unit);
}
