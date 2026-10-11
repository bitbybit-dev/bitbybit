import { hashOfText } from "@bitbybit-dev/base";
import { GLOBAL_ID_PATTERN } from "../schema/constants";
import {
    AUTOMATIC_DOMAIN, BYTES_PER_GROUP, BYTE_RANGE, FIRST_BYTE_DIGITS, GUID_ALPHABET, GUID_BYTES, HASH_BYTES_USED, KEY_DOMAIN, PROJECT_KEY,
    STRUCTURE_DOMAIN, THREE_BYTE_DIGITS, VARIANT_BITS, VARIANT_BYTE, VARIANT_MASK, VERSION_BITS, VERSION_BYTE, VERSION_MASK,
} from "./constants";

const RADIX = GUID_ALPHABET.length;

function digits(value: number, count: number): string {
    let out = "";
    let rest = value;
    for (let index = 0; index < count; index++) {
        out = GUID_ALPHABET[rest % RADIX]! + out;
        rest = Math.floor(rest / RADIX);
    }
    return out;
}

function stamped(bytes: Uint8Array): Uint8Array {
    const out = Uint8Array.from(bytes);
    out[VERSION_BYTE] = (out[VERSION_BYTE]! & VERSION_MASK) | VERSION_BITS;
    out[VARIANT_BYTE] = (out[VARIANT_BYTE]! & VARIANT_MASK) | VARIANT_BITS;
    return out;
}

function seeded(seed: string, key: string): string {
    const bytes = new Uint8Array(GUID_BYTES);
    for (let part = 0, at = 0; at < GUID_BYTES; part++) {
        let hash = hashOfText(`${seed}\u0000${key}\u0000${part}`);
        for (let index = 0; index < HASH_BYTES_USED && at < GUID_BYTES; index++, at++) {
            bytes[at] = hash % BYTE_RANGE;
            hash = Math.floor(hash / BYTE_RANGE);
        }
    }
    return compressBytes(stamped(bytes));
}

export function isGlobalId(text: string): boolean {
    return GLOBAL_ID_PATTERN.test(text);
}

export function compressBytes(bytes: Uint8Array): string {
    if (bytes.length !== GUID_BYTES) {
        throw new RangeError(`A GlobalId holds ${GUID_BYTES} bytes, got ${bytes.length}`);
    }
    let out = digits(bytes[0]!, FIRST_BYTE_DIGITS);
    for (let index = 1; index < GUID_BYTES; index += BYTES_PER_GROUP) {
        out += digits(bytes[index]! * BYTE_RANGE * BYTE_RANGE + bytes[index + 1]! * BYTE_RANGE + bytes[index + 2]!, THREE_BYTE_DIGITS);
    }
    return out;
}

export function randomGlobalId(): string {
    const bytes = new Uint8Array(GUID_BYTES);
    globalThis.crypto.getRandomValues(bytes);
    return compressBytes(stamped(bytes));
}

export function projectGlobalId(seed: string): string {
    return seeded(seed, PROJECT_KEY);
}

export function keyGlobalId(seed: string, key: string): string {
    return seeded(seed, `${KEY_DOMAIN}\u0000${key}`);
}

export function automaticGlobalId(seed: string, counter: string): string {
    return seeded(seed, `${AUTOMATIC_DOMAIN}\u0000${counter}`);
}

export function structureGlobalId(seed: string, name: string): string {
    return seeded(seed, `${STRUCTURE_DOMAIN}\u0000${name}`);
}
