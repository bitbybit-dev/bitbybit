import type * as Inputs from "../inputs";

/**
 * Where a retaining ring sits: on a shaft, sprung open over it into a groove, or in a bore, squeezed
 * into a groove inside it.
 */
export type RetainingRingKind = `${Inputs.Engineering.retainingRingKindEnum}`;

/**
 * A retaining ring and its groove, from `retainingRings.din.retainingRingSizes` or
 * `retainingRings.ansi.retainingRingSizes`, in the unit asked for.
 */
export interface RetainingRingSizes {
    /** The shaft's or the bore's diameter the ring is for. */
    readonly nominal: number;
    /** The ring's thickness. */
    readonly thickness: number;
    /** The ring's diameter before it is fitted: its inside on a shaft ring, its outside on a bore ring. */
    readonly freeDiameter: number;
    /** How far its lugs reach across the ring, at most. */
    readonly lugWidth: number;
    /** About how wide the ring is opposite its lugs. */
    readonly sectionWidth: number;
    /** The diameter of the hole in each lug for the pliers, at least. */
    readonly lugHoleDiameter: number;
    /** The diameter at the bottom of the groove the ring sits in. */
    readonly grooveDiameter: number;
    /** How wide the groove is. */
    readonly grooveWidth: number;
    /** How far the groove keeps, at least, from the end of the shaft or the bore. */
    readonly edgeDistance: number;
}
