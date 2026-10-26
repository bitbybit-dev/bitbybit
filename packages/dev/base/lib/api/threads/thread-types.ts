import type * as Inputs from "../inputs";

/**
 * An ISO metric thread size, from M1.6 to M24: the nominal diameter in millimetres after the M.
 */
export type IsoThreadSize = `${Inputs.Engineering.isoThreadSizeEnum}`;

/**
 * The sizes of a screw thread, from `threads.iso.thread` or `threads.ansi.thread`, in the unit asked
 * for.
 */
export interface ThreadSizes {
    /** How the standard names the thread, such as M8, M8x1 or 1/4-20 UNC. */
    readonly designation: string;
    /** The nominal, major diameter. */
    readonly diameter: number;
    /** The distance from one thread crest to the next. */
    readonly pitch: number;
    /** The diameter at which the thread's flanks are as wide as its grooves. */
    readonly pitchDiameter: number;
    /** The diameter at the roots of a bolt's thread. */
    readonly minorDiameter: number;
    /** The diameter at the crests of a nut's thread, the hole a tapped thread leaves. */
    readonly internalMinorDiameter: number;
    /** The drill to bore before tapping the thread. */
    readonly tapDrill: number;
}

/**
 * An ISO metric thread, from `threads.iso.thread`.
 */
export interface IsoThreadSizes extends ThreadSizes {
    /** The thread size, such as M8. */
    readonly size: IsoThreadSize;
}

export interface IsoThreadRow {
    readonly diameter: number;
    readonly pitch: number;
    readonly tapDrill: number;
}

/**
 * A Unified inch thread size, from #0 to 1 inch: a number for the small sizes, a fraction of an inch
 * for the larger ones.
 */
export type AnsiThreadSize = `${Inputs.Engineering.ansiThreadSizeEnum}`;

/**
 * The series of a Unified inch thread: coarse (UNC), fine (UNF), or a pitch of its own (UN).
 */
export type AnsiThreadSeries = "UNC" | "UNF" | "UN";

/**
 * A Unified inch thread, from `threads.ansi.thread`.
 */
export interface AnsiThreadSizes extends ThreadSizes {
    /** The thread size, such as 1/4 or #10. */
    readonly size: AnsiThreadSize;
    /** The series the pitch belongs to. */
    readonly series: AnsiThreadSeries;
    /** How many threads there are to an inch of length; the pitch is one inch over it. */
    readonly threadsPerInch: number;
}

export interface UnifiedPitchRow {
    readonly threadsPerInch: number;
    readonly tapDrill: number;
}

export interface AnsiThreadRow {
    readonly diameter: number;
    readonly unc: UnifiedPitchRow | undefined;
    readonly unf: UnifiedPitchRow;
}
