import { InputError } from "../kernel-calls/errors";
import { roundedTo, roundedToMillionths } from "../services/helpers/geometry/scalars";
import type { AnsiThreadSize, AnsiThreadSizes, UnifiedPitchRow } from "./thread-types";
import { ANSI_DRILL_STEP, ANSI_THREAD_SIZES, TAPPING_DEPTH_FACTOR, UNIFIED_THREADS, UNR_EXTERNAL_ROOT_FACTOR } from "./ansi-threads.constants";
import { INTERNAL_DEPTH_FACTOR, PITCH_DEPTH_FACTOR } from "./thread-profile.constants";

const DRILL_PLACES = 3;

export function checkedAnsiSize(size: AnsiThreadSize): AnsiThreadSize {
    if (!ANSI_THREAD_SIZES.includes(size)) {
        throw new InputError(`\`size\` is not one of ${ANSI_THREAD_SIZES.join(", ")}.`, "size");
    }
    return size;
}

export function ansiThreadSizes(): AnsiThreadSize[] {
    return [...ANSI_THREAD_SIZES];
}

export function ansiThread(size: AnsiThreadSize, series: "UNC" | "UNF", threadsPerInch?: number): AnsiThreadSizes {
    const row = UNIFIED_THREADS[checkedAnsiSize(size)];
    if (series !== "UNC" && series !== "UNF") {
        throw new InputError("`series` is not one of UNC, UNF.", "series");
    }
    const coarsest = (row.unc ?? row.unf).threadsPerInch;
    let pitchRow: UnifiedPitchRow | undefined;
    let named: "UNC" | "UNF" | "UN" = series;
    if (threadsPerInch === undefined) {
        pitchRow = series === "UNC" ? row.unc : row.unf;
        if (pitchRow === undefined) {
            throw new InputError(`\`series\` is UNC, and ${size} has no coarse thread; it is cut UNF.`, "series");
        }
    } else {
        if (!(threadsPerInch >= coarsest) || !Number.isFinite(threadsPerInch)) {
            throw new InputError(`\`threadsPerInch\` is not a finite number of at least ${String(coarsest)}, the coarsest ${size} thread.`, "threadsPerInch");
        }
        pitchRow = [row.unc, row.unf].find(candidate => candidate?.threadsPerInch === threadsPerInch);
        named = pitchRow === undefined ? "UN" : pitchRow === row.unc ? "UNC" : "UNF";
    }
    const perInch = pitchRow?.threadsPerInch ?? threadsPerInch!;
    const pitch = 1 / perInch;
    const tapDrill = pitchRow?.tapDrill ?? roundedTo(Math.round((row.diameter - TAPPING_DEPTH_FACTOR * pitch) / ANSI_DRILL_STEP) * ANSI_DRILL_STEP, DRILL_PLACES);
    return {
        size,
        series: named,
        threadsPerInch: perInch,
        designation: `${size}-${String(perInch)} ${named}`,
        diameter: row.diameter,
        pitch: roundedToMillionths(pitch),
        pitchDiameter: roundedToMillionths(row.diameter - PITCH_DEPTH_FACTOR * pitch),
        minorDiameter: roundedToMillionths(row.diameter - UNR_EXTERNAL_ROOT_FACTOR * pitch),
        internalMinorDiameter: roundedToMillionths(row.diameter - INTERNAL_DEPTH_FACTOR * pitch),
        tapDrill,
    };
}
