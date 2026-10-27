import type * as Inputs from "../inputs";

/**
 * A deep groove ball bearing's ISO designation, from the 60 and 62 series and the small 62x and 60x
 * sizes: the bore in millimetres is in its last digits, five times them from 04 up.
 */
export type IsoBallBearingDesignation = `${Inputs.Engineering.isoBallBearingEnum}`;

/**
 * The boundary sizes of a deep groove ball bearing, from `bearings.iso.ballBearingSizes` or
 * `bearings.ansi.ballBearingSizes`, in the unit asked for.
 */
export interface BallBearingSizes {
    /** The diameter of the bore, the shaft it sits on. */
    readonly bore: number;
    /** The outside diameter, the housing it sits in. */
    readonly outside: number;
    /** The width along the axis. */
    readonly width: number;
}

/**
 * An inch deep groove ball bearing's R-series designation, such as R8 or R188.
 */
export type AnsiBallBearingDesignation = `${Inputs.Engineering.ansiBallBearingEnum}`;

export interface AnsiBallBearingRow extends BallBearingSizes {
    readonly shieldedWidth: number;
}
