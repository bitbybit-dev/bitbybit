import type { AnsiKnurlRow } from "./knurl-types";

export const ANSI_KNURLS: Readonly<Record<number, AnsiKnurlRow>> = {
    64: { depth: 0.024, leastTeeth: 24 },
    96: { depth: 0.016, leastTeeth: 24 },
    128: { depth: 0.012, leastTeeth: 18 },
    160: { depth: 0.009, leastTeeth: 15 },
};
export const ANSI_KNURL_PITCHES: readonly number[] = Object.keys(ANSI_KNURLS).map(Number);
export const ANSI_KNURL_HELIX_ANGLE = 30;
