import { BMP_LIMIT, BYTE_DIGITS, CHARACTERS_PER_CHUNK, HEX_RADIX, LATIN1_PART, MAX_CODE_POINT, PRINTABLE_FIRST, PRINTABLE_LAST, UCS2_DIGITS, UCS4_DIGITS, UPPER_HALF_OFFSET } from "./constants";
import { StepSyntaxError } from "./errors";

const APOSTROPHE = "'";
const BACKSLASH = "\\";
const END_OF_RUN = "\\X0\\";
const HEX_DIGITS = /^[0-9A-Fa-f]+$/;
const ALPHABET_DIRECTIVE = /^\\P([A-I])\\/;
const ALPHABET_LETTERS = "ABCDEFGHI";
const DIRECTIVE_LENGTH = "\\PA\\".length;

const partDecoders = new Map<number, TextDecoder>();

function isPrintable(code: number): boolean {
    return code >= PRINTABLE_FIRST && code <= PRINTABLE_LAST;
}

function hexOf(value: number, digits: number): string {
    return value.toString(HEX_RADIX).toUpperCase().padStart(digits, "0");
}

function escapeRun(run: string): string {
    const codePoints = Array.from(run, (character) => character.codePointAt(0)!);
    if (codePoints.some((point) => point > BMP_LIMIT)) {
        return `\\X4\\${codePoints.map((point) => hexOf(point, UCS4_DIGITS)).join("")}${END_OF_RUN}`;
    }
    let units = "";
    for (let index = 0; index < run.length; index++) {
        units += hexOf(run.charCodeAt(index), UCS2_DIGITS);
    }
    return `\\X2\\${units}${END_OF_RUN}`;
}

export function encodeString(text: string): string {
    let out = APOSTROPHE;
    let run = "";
    for (const character of text) {
        if (isPrintable(character.codePointAt(0)!)) {
            if (run) {
                out += escapeRun(run);
                run = "";
            }
            out += character === APOSTROPHE ? "''" : character === BACKSLASH ? "\\\\" : character;
        } else {
            run += character;
        }
    }
    if (run) {
        out += escapeRun(run);
    }
    return `${out}${APOSTROPHE}`;
}

function charactersOf(units: readonly number[]): string {
    let out = "";
    for (let at = 0; at < units.length; at += CHARACTERS_PER_CHUNK) {
        out += String.fromCharCode(...units.slice(at, at + CHARACTERS_PER_CHUNK));
    }
    return out;
}

function codePointsOf(points: readonly number[], offset: number): string {
    let out = "";
    for (const point of points) {
        if (point > MAX_CODE_POINT) {
            throw new StepSyntaxError(`The code point ${hexOf(point, UCS4_DIGITS)} lies beyond Unicode`, offset);
        }
        out += String.fromCodePoint(point);
    }
    return out;
}

function hexRun(raw: string, from: number, digits: number, offset: number): [number[], number] {
    const end = raw.indexOf(END_OF_RUN, from);
    if (end < 0) {
        throw new StepSyntaxError("A \\X2\\ or \\X4\\ run is never closed with \\X0\\", offset);
    }
    const hex = raw.slice(from, end);
    if (hex.length % digits !== 0 || (hex.length > 0 && !HEX_DIGITS.test(hex))) {
        throw new StepSyntaxError(`A run of hexadecimal characters holds something other than groups of ${digits} digits`, offset);
    }
    const values: number[] = [];
    for (let at = 0; at < hex.length; at += digits) {
        values.push(Number.parseInt(hex.slice(at, at + digits), HEX_RADIX));
    }
    return [values, end + END_OF_RUN.length];
}

function isByteEscape(raw: string, at: number): boolean {
    const start = at + "\\X\\".length;
    return raw.startsWith("\\X\\", at) && start + BYTE_DIGITS <= raw.length && HEX_DIGITS.test(raw.slice(start, start + BYTE_DIGITS));
}

function upperHalf(code: number, part: number): string {
    const byte = code + UPPER_HALF_OFFSET;
    if (part === LATIN1_PART) {
        return String.fromCharCode(byte);
    }
    let decoder = partDecoders.get(part);
    if (!decoder) {
        decoder = new TextDecoder(`iso-8859-${part}`);
        partDecoders.set(part, decoder);
    }
    return decoder.decode(Uint8Array.of(byte));
}

export function decodeString(raw: string, offset = 0): string {
    let out = "";
    let at = 0;
    let part = LATIN1_PART;
    while (at < raw.length) {
        const character = raw[at]!;
        if (character === APOSTROPHE && raw[at + 1] === APOSTROPHE) {
            out += APOSTROPHE;
            at += 2;
            continue;
        }
        if (character !== BACKSLASH) {
            out += character;
            at++;
            continue;
        }
        if (raw.startsWith("\\\\", at)) {
            out += BACKSLASH;
            at += 2;
        } else if (raw.startsWith("\\X2\\", at)) {
            const [units, next] = hexRun(raw, at + "\\X2\\".length, UCS2_DIGITS, offset);
            out += charactersOf(units);
            at = next;
        } else if (raw.startsWith("\\X4\\", at)) {
            const [points, next] = hexRun(raw, at + "\\X4\\".length, UCS4_DIGITS, offset);
            out += codePointsOf(points, offset);
            at = next;
        } else if (isByteEscape(raw, at)) {
            const start = at + "\\X\\".length;
            out += String.fromCharCode(Number.parseInt(raw.slice(start, start + BYTE_DIGITS), HEX_RADIX));
            at = start + BYTE_DIGITS;
        } else if (raw.startsWith("\\S\\", at) && at + "\\S\\".length < raw.length) {
            const next = at + "\\S\\".length;
            const escapedApostrophe = raw[next] === APOSTROPHE && raw[next + 1] === APOSTROPHE;
            out += upperHalf(raw.charCodeAt(next), part);
            at = next + (escapedApostrophe ? 2 : 1);
        } else {
            const directive = ALPHABET_DIRECTIVE.exec(raw.slice(at, at + DIRECTIVE_LENGTH));
            if (directive) {
                part = ALPHABET_LETTERS.indexOf(directive[1]!) + 1;
                at += DIRECTIVE_LENGTH;
            } else {
                out += character;
                at++;
            }
        }
    }
    return out;
}
