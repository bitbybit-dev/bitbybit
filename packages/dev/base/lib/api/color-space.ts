import { linearToSrgb as encodedOf, srgbToLinear as linearOf } from "./services/helpers/color/color-space";

/**
 * Turns one sRGB-encoded color channel, from 0 to 1, into linear light, as glTF, XCAF and the
 * renderers' lighting expect it.
 * @param channel - The encoded channel, from 0 to 1
 * @returns The linear channel, from 0 to 1
 * @deprecated Use `color.srgbToLinear`, which takes `{ channel }`; this function leaves the package's index in the next major version.
 */
export function srgbToLinear(channel: number): number {
    return linearOf(channel);
}

/**
 * Turns one linear-light color channel, from 0 to 1, back into its sRGB encoding, the inverse of
 * `srgbToLinear`.
 * @param channel - The linear channel, from 0 to 1
 * @returns The encoded channel, from 0 to 1
 * @deprecated Use `color.linearToSrgb`, which takes `{ channel }`; this function leaves the package's index in the next major version.
 */
export function linearToSrgb(channel: number): number {
    return encodedOf(channel);
}
