const FIRST_SEED = 0xdeadbeef;
const SECOND_SEED = 0x41c6ce57;
const FIRST_PRIME = 2654435761;
const SECOND_PRIME = 1597334677;
const FIRST_MIX = 2246822507;
const SECOND_MIX = 3266489909;
const LOW_WORD = 4294967296;
const HIGH_BITS = 2097151;

function folded(first: number, second: number): number {
    let low = Math.imul(first ^ (first >>> 16), FIRST_MIX);
    low ^= Math.imul(second ^ (second >>> 13), SECOND_MIX);
    let high = Math.imul(second ^ (second >>> 16), FIRST_MIX);
    high ^= Math.imul(low ^ (low >>> 13), SECOND_MIX);
    return LOW_WORD * (HIGH_BITS & high) + (low >>> 0);
}

/**
 * Hashes a text to a whole number from 0 to 2^53 - 1 with cyrb53, over its UTF-16 code units. Both
 * lanes mix with `Math.imul`, so every JavaScript engine gives the same number.
 * @param text - The text to hash
 * @returns The hash, a safe integer
 */
export function hashOfText(text: string): number {
    let first = FIRST_SEED;
    let second = SECOND_SEED;
    for (let index = 0; index < text.length; index++) {
        const code = text.charCodeAt(index);
        first = Math.imul(first ^ code, FIRST_PRIME);
        second = Math.imul(second ^ code, SECOND_PRIME);
    }
    return folded(first, second);
}

/**
 * Hashes bytes the way `hashOfText` hashes code units, so ASCII text gives the same number as a
 * string or as its bytes.
 * @param bytes - The bytes to hash
 * @returns The hash, a safe integer
 */
export function hashOfBytes(bytes: Uint8Array): number {
    let first = FIRST_SEED;
    let second = SECOND_SEED;
    for (let index = 0; index < bytes.length; index++) {
        const code = bytes[index]!;
        first = Math.imul(first ^ code, FIRST_PRIME);
        second = Math.imul(second ^ code, SECOND_PRIME);
    }
    return folded(first, second);
}
