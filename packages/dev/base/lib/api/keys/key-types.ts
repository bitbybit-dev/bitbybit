/**
 * The sizes of a parallel key and the keyways for it, from `keys.din.parallelKeySizes` or
 * `keys.ansi.parallelKeySizes`, in the unit asked for.
 */
export interface ParallelKeySizes {
    /** The width of the key. */
    readonly width: number;
    /** The height of the key. */
    readonly height: number;
    /** How deep the keyway goes into the shaft, from the top of the shaft's round over the keyway's middle. */
    readonly shaftDepth: number;
    /** How deep the keyway goes into the hub, from the top of the bore's round over the keyway's middle. */
    readonly hubDepth: number;
}

export interface KeyRow extends ParallelKeySizes {
    readonly upTo: number;
}
