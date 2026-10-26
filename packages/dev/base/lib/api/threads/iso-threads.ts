import { InputError } from "../kernel-calls/errors";
import { roundedToMillionths } from "../services/helpers/geometry/scalars";
import type { IsoThreadSize, IsoThreadSizes } from "./thread-types";
import { COARSE_THREADS, ISO_DRILL_STEP, ISO_EXTERNAL_ROOT_FACTOR, ISO_THREAD_SIZES } from "./iso-threads.constants";
import { INTERNAL_DEPTH_FACTOR, PITCH_DEPTH_FACTOR } from "./thread-profile.constants";

export function checkedIsoSize(size: IsoThreadSize): IsoThreadSize {
    if (!ISO_THREAD_SIZES.includes(size)) {
        throw new InputError(`\`size\` is not one of ${ISO_THREAD_SIZES.join(", ")}.`, "size");
    }
    return size;
}

export function isoThreadSizes(): IsoThreadSize[] {
    return [...ISO_THREAD_SIZES];
}

export function isoThread(size: IsoThreadSize, pitch?: number): IsoThreadSizes {
    const row = COARSE_THREADS[checkedIsoSize(size)];
    const given = pitch ?? row.pitch;
    if (!(given > 0 && given <= row.pitch)) {
        throw new InputError(`\`pitch\` is not more than 0 and at most the coarse pitch of ${size}, ${String(row.pitch)}.`, "pitch");
    }
    const coarse = given === row.pitch;
    const tapDrill = coarse ? row.tapDrill : Math.round((row.diameter - given) / ISO_DRILL_STEP) * ISO_DRILL_STEP;
    return {
        size,
        designation: coarse ? size : `${size}x${String(given)}`,
        diameter: row.diameter,
        pitch: given,
        pitchDiameter: roundedToMillionths(row.diameter - PITCH_DEPTH_FACTOR * given),
        minorDiameter: roundedToMillionths(row.diameter - ISO_EXTERNAL_ROOT_FACTOR * given),
        internalMinorDiameter: roundedToMillionths(row.diameter - INTERNAL_DEPTH_FACTOR * given),
        tapDrill: roundedToMillionths(tapDrill),
    };
}
