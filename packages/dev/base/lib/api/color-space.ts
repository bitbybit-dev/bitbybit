const ENCODED_KNEE = 0.04045;
const LINEAR_KNEE = 0.0031308;
const LINEAR_SLOPE = 12.92;
const CURVE_OFFSET = 0.055;
const CURVE_SCALE = 1.055;
const CURVE_EXPONENT = 2.4;

/**
 * Turns one sRGB-encoded color channel, from 0 to 1, into linear light, as glTF, XCAF and the
 * renderers' lighting expect it.
 * @param channel - The encoded channel, from 0 to 1
 * @returns The linear channel, from 0 to 1
 */
export function srgbToLinear(channel: number): number {
    return channel <= ENCODED_KNEE ? channel / LINEAR_SLOPE : ((channel + CURVE_OFFSET) / CURVE_SCALE) ** CURVE_EXPONENT;
}

/**
 * Turns one linear-light color channel, from 0 to 1, back into its sRGB encoding, the inverse of
 * `srgbToLinear`.
 * @param channel - The linear channel, from 0 to 1
 * @returns The encoded channel, from 0 to 1
 */
export function linearToSrgb(channel: number): number {
    return channel <= LINEAR_KNEE ? channel * LINEAR_SLOPE : CURVE_SCALE * channel ** (1 / CURVE_EXPONENT) - CURVE_OFFSET;
}
