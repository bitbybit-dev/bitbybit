import { InputError } from "../kernel-calls/errors";
import { roundedToMillionths } from "../services/helpers/geometry/scalars";
import { lengthsConverted, snappedLength, tableLength } from "../services/helpers/geometry/lengths";
import type { Base } from "../inputs/base-inputs";
import type { KnurlPattern, KnurlSizes } from "./knurl-types";
import { KNURL_HELIX_ANGLE, KNURL_LENGTHS, KNURL_PITCHES } from "./din-knurls.constants";
import { checkedKnurlPattern } from "./knurls";

export function dinKnurlSizes(diameter: number, pitch: number, pattern: KnurlPattern, unit: `${Base.unitOfLengthEnum}`): KnurlSizes {
    checkedKnurlPattern(pattern);
    if (!KNURL_PITCHES.includes(pitch)) {
        throw new InputError(`\`pitch\` is ${String(pitch)}, not one of DIN 82's: ${KNURL_PITCHES.join(", ")}.`, "pitch");
    }
    const millimetres = tableLength(diameter, unit, "mm");
    if (!(millimetres > 2 * pitch)) {
        throw new InputError(`\`diameter\` is too small for a knurl of pitch ${String(pitch)}: make it more than ${String(snappedLength(2 * pitch, "mm", unit))}.`, "diameter");
    }
    const grooves = Math.round(Math.PI * millimetres / pitch);
    const sizes: KnurlSizes = { grooves, diameter: roundedToMillionths(grooves * pitch / Math.PI), depth: pitch / 2, helixAngle: pattern === "straight" ? 0 : KNURL_HELIX_ANGLE };
    return lengthsConverted(sizes, KNURL_LENGTHS, "mm", unit);
}
