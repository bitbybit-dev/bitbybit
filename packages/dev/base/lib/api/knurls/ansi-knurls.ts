import { InputError } from "../kernel-calls/errors";
import { roundedToMillionths } from "../services/helpers/geometry/scalars";
import { lengthsConverted, snappedLength, tableLength } from "../services/helpers/geometry/lengths";
import type { Base } from "../inputs/base-inputs";
import type { KnurlPattern, KnurlSizes } from "./knurl-types";
import { ANSI_KNURL_HELIX_ANGLE, ANSI_KNURL_PITCHES, ANSI_KNURLS } from "./ansi-knurls.constants";
import { checkedKnurlPattern } from "./knurls";
import { KNURL_LENGTHS } from "./knurls.constants";

export function ansiKnurlSizes(diameter: number, diametralPitch: number, pattern: KnurlPattern, unit: `${Base.unitOfLengthEnum}`): KnurlSizes {
    checkedKnurlPattern(pattern);
    if (!ANSI_KNURL_PITCHES.includes(diametralPitch)) {
        throw new InputError(`\`diametralPitch\` is ${String(diametralPitch)}, not one of ASME B94.6's: ${ANSI_KNURL_PITCHES.join(", ")}.`, "diametralPitch");
    }
    const row = ANSI_KNURLS[diametralPitch]!;
    const inches = tableLength(diameter, unit, "in");
    const grooves = Math.round(diametralPitch * inches);
    if (!(grooves >= row.leastTeeth)) {
        throw new InputError(`\`diameter\` is too small for a ${String(diametralPitch)} pitch knurl, which needs ${String(row.leastTeeth)} teeth round the work: make it at least ${String(snappedLength(row.leastTeeth / diametralPitch, "in", unit))}.`, "diameter");
    }
    const sizes: KnurlSizes = { grooves, diameter: roundedToMillionths(grooves / diametralPitch), depth: row.depth, helixAngle: pattern === "straight" ? 0 : ANSI_KNURL_HELIX_ANGLE };
    return lengthsConverted(sizes, KNURL_LENGTHS, "in", unit);
}
