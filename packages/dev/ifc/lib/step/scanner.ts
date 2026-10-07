import {
    CHARACTERS_PER_CHUNK, DECIMAL_RADIX, CHAR_APOSTROPHE, CHAR_CLOSE, CHAR_COMMA, CHAR_HASH, CHAR_LOWER_A, CHAR_LOWER_Z, CHAR_NINE, CHAR_OPEN, CHAR_QUOTE, CHAR_SLASH,
    CHAR_BACKSLASH, CHAR_SPACE, CHAR_STAR, CHAR_TILDE, CHAR_UNDERSCORE, CHAR_UPPER_A, CHAR_UPPER_Z, CHAR_ZERO, MAX_EXPRESS_ID,
} from "./constants";
import { StepSyntaxError } from "./errors";

const strictUtf8 = new TextDecoder("utf-8", { fatal: true });

export function isDigit(code: number): boolean {
    return code >= CHAR_ZERO && code <= CHAR_NINE;
}

export function isNameCharacter(code: number): boolean {
    return (code >= CHAR_UPPER_A && code <= CHAR_UPPER_Z) || (code >= CHAR_LOWER_A && code <= CHAR_LOWER_Z) || isDigit(code) || code === CHAR_UNDERSCORE;
}

function latin1(bytes: Uint8Array): string {
    let out = "";
    for (let at = 0; at < bytes.length; at += CHARACTERS_PER_CHUNK) {
        out += String.fromCharCode(...bytes.subarray(at, at + CHARACTERS_PER_CHUNK));
    }
    return out;
}

export function plainText(bytes: Uint8Array, start: number, end: number): string | undefined {
    if (end - start > CHARACTERS_PER_CHUNK) {
        return undefined;
    }
    for (let at = start; at < end; at++) {
        const code = bytes[at]!;
        if (code < CHAR_SPACE || code > CHAR_TILDE || code === CHAR_BACKSLASH || code === CHAR_APOSTROPHE) {
            return undefined;
        }
    }
    return String.fromCharCode(...bytes.subarray(start, end));
}

export function asciiText(bytes: Uint8Array, start: number, end: number): string {
    return Reflect.apply(String.fromCharCode, null, bytes.subarray(start, end)) as string;
}

export function textOf(bytes: Uint8Array, start: number, end: number): string {
    const slice = bytes.subarray(start, end);
    try {
        return strictUtf8.decode(slice);
    } catch {
        return latin1(slice);
    }
}

function endOfComment(bytes: Uint8Array, open: number, end: number): number {
    for (let at = open + 2; at + 1 < end; at++) {
        if (bytes[at] === CHAR_STAR && bytes[at + 1] === CHAR_SLASH) {
            return at + 2;
        }
    }
    throw new StepSyntaxError("A comment is never closed", open);
}

export function endOfString(bytes: Uint8Array, open: number, end: number): number {
    let at = open + 1;
    while (at < end) {
        if (bytes[at] === CHAR_APOSTROPHE) {
            if (bytes[at + 1] === CHAR_APOSTROPHE) {
                at += 2;
                continue;
            }
            return at;
        }
        at++;
    }
    throw new StepSyntaxError("A string is never closed", open);
}

export function endOfBinary(bytes: Uint8Array, open: number, end: number): number {
    const close = bytes.indexOf(CHAR_QUOTE, open + 1);
    if (close < 0 || close >= end) {
        throw new StepSyntaxError("A binary value is never closed", open);
    }
    return close;
}

export function skipSpace(bytes: Uint8Array, at: number, end: number): number {
    let position = at;
    while (position < end) {
        const code = bytes[position]!;
        if (code <= CHAR_SPACE) {
            position++;
        } else if (code === CHAR_SLASH && bytes[position + 1] === CHAR_STAR) {
            position = endOfComment(bytes, position, end);
        } else {
            break;
        }
    }
    return position;
}

function afterQuoted(bytes: Uint8Array, at: number, end: number): number {
    const code = bytes[at];
    if (code === CHAR_APOSTROPHE) {
        return endOfString(bytes, at, end) + 1;
    }
    if (code === CHAR_QUOTE) {
        return endOfBinary(bytes, at, end) + 1;
    }
    if (code === CHAR_SLASH && bytes[at + 1] === CHAR_STAR) {
        return endOfComment(bytes, at, end);
    }
    return at;
}

function isQuoteOrSlash(code: number): boolean {
    return code === CHAR_APOSTROPHE || code === CHAR_QUOTE || code === CHAR_SLASH;
}

export function closingParenthesis(bytes: Uint8Array, open: number, end: number): number {
    let depth = 0;
    let at = open;
    while (at < end) {
        const code = bytes[at]!;
        if (code === CHAR_OPEN) {
            depth++;
        } else if (code === CHAR_CLOSE) {
            depth--;
            if (depth === 0) {
                return at;
            }
        } else if (isQuoteOrSlash(code)) {
            const skipped = afterQuoted(bytes, at, end);
            if (skipped !== at) {
                at = skipped;
                continue;
            }
        }
        at++;
    }
    throw new StepSyntaxError("A parenthesis is never closed", open);
}

export function referenceCapacity(start: number, end: number): number {
    return ((end - start) >> 1) + 1;
}

export function referencesInto(bytes: Uint8Array, start: number, end: number, into: Int32Array): number {
    let count = 0;
    let at = start;
    while (at < end) {
        const code = bytes[at]!;
        if (code === CHAR_HASH) {
            let digits = at + 1;
            let id = 0;
            while (digits < end && isDigit(bytes[digits]!)) {
                id = id * DECIMAL_RADIX + bytes[digits]! - CHAR_ZERO;
                digits++;
            }
            if (digits > at + 1 && id <= MAX_EXPRESS_ID) {
                into[count++] = id;
            }
            at = digits;
            continue;
        }
        if (isQuoteOrSlash(code)) {
            const skipped = afterQuoted(bytes, at, end);
            if (skipped !== at) {
                at = skipped;
                continue;
            }
        }
        at++;
    }
    return count;
}

export function referenceList(bytes: Uint8Array, start: number, end: number): number[] | undefined {
    let at = skipSpace(bytes, start, end);
    if (bytes[at] !== CHAR_OPEN) {
        return undefined;
    }
    at = skipSpace(bytes, at + 1, end);
    const references: number[] = [];
    while (at < end && bytes[at] !== CHAR_CLOSE) {
        if (bytes[at] !== CHAR_HASH) {
            return undefined;
        }
        let digits = at + 1;
        let id = 0;
        while (digits < end && isDigit(bytes[digits]!)) {
            id = id * DECIMAL_RADIX + bytes[digits]! - CHAR_ZERO;
            digits++;
        }
        if (digits === at + 1 || id > MAX_EXPRESS_ID) {
            return undefined;
        }
        references.push(id);
        at = skipSpace(bytes, digits, end);
        if (bytes[at] === CHAR_COMMA) {
            at = skipSpace(bytes, at + 1, end);
            if (bytes[at] === CHAR_CLOSE) {
                return undefined;
            }
        } else if (bytes[at] !== CHAR_CLOSE) {
            return undefined;
        }
    }
    return at < end && skipSpace(bytes, at + 1, end) === end ? references : undefined;
}

export function firstStringIn(bytes: Uint8Array, start: number, end: number): [number, number] | undefined {
    const open = skipSpace(bytes, start, end);
    if (bytes[open] !== CHAR_APOSTROPHE) {
        return undefined;
    }
    return [open + 1, endOfString(bytes, open, end)];
}
