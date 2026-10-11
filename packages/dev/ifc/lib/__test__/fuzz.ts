import type { IfcValue } from "../step/step-types";
import { isBinary, isDerived, isEnumeration, isReference, isTyped } from "../step/values";
import type { Random } from "./fixture-types";

export function seeded(seed: number): Random {
    let state = seed >>> 0;
    return () => {
        state = (state + 0x6d2b79f5) >>> 0;
        let t = state;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

export function pick<T>(random: Random, items: readonly T[]): T {
    return items[Math.floor(random() * items.length)]!;
}

export function whole(random: Random, below: number): number {
    return Math.floor(random() * below);
}

const PRINTABLE = " !\"#$%&()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_`abcdefghijklmnopqrstuvwxyz{|}~";
const AWKWARD = ["'", "\\", "\n", "\t", "\u0000", "\u007f", "é", "ß", "Ω", "ж", "中", "😀", "\u{10ffff}", "﻿", " "];

export function randomText(random: Random): string {
    const length = whole(random, 24);
    let text = "";
    for (let i = 0; i < length; i++) {
        text += random() < 0.7 ? pick(random, [...PRINTABLE]) : pick(random, AWKWARD);
    }
    return text;
}

export function randomReal(random: Random): number {
    const kind = whole(random, 5);
    if (kind === 0) {
        return whole(random, 2000) - 1000;
    }
    if (kind === 1) {
        return (random() - 0.5) * 10 ** (whole(random, 40) - 20);
    }
    if (kind === 2) {
        return Number.MIN_VALUE * (1 + whole(random, 1000));
    }
    if (kind === 3) {
        return (random() < 0.5 ? -1 : 1) * Number.MAX_VALUE * random();
    }
    return random() * 1e-300;
}

function name(random: Random): string {
    return pick(random, ["IFCLABEL", "IFCREAL", "IFCLENGTHMEASURE", "IFCBOOLEAN", "IFCTEXT"]);
}

export function randomValue(random: Random, depth = 0): IfcValue {
    const kind = whole(random, depth > 3 ? 9 : 11);
    switch (kind) {
        case 0:
            return null;
        case 1:
            return randomReal(random);
        case 2:
            return randomText(random);
        case 3:
            return { enum: pick(random, ["U", "AREA", "NOTDEFINED", "ATSTART", "SINGLE_SWING_LEFT"]) };
        case 4:
            return { ref: 1 + whole(random, 100000) };
        case 5:
            return { type: name(random), value: random() < 0.5 ? randomText(random) : randomReal(random) };
        case 6:
            return { binary: pick(random, ["0", "1F", "2A3", "3FFFF"]) };
        case 7:
            return random() < 0.5;
        case 8:
            return { derived: true };
        case 9:
            return Array.from({ length: whole(random, 5) }, () => randomValue(random, depth + 1));
        default:
            return { type: name(random), value: Array.from({ length: 1 + whole(random, 3) }, () => randomReal(random)) };
    }
}

const SPACING = ["", "", "", " ", "  ", "\n", "\r\n", "\t", "/* note */", " /* a, (b) 'c' */ "];
const SIGNIFICANT = ["(", ")", "'", "#", ",", ";", "$", "*", ".", "\\", "\"", "=", "E", "9", "/*"].map((text) => new TextEncoder().encode(text));
const BROKEN_UTF8: readonly number[][] = [[0xc3], [0xff], [0xe2, 0x82], [0xf0, 0x9f, 0x98], [0xed, 0xa0, 0x80]];
const PRINTABLE_FIRST = 0x20;
const PRINTABLE_LAST = 0x7e;
const LATIN1_LAST = 0xff;
const UPPER_HALF = 0x80;
const SHIFTED_FIRST = 0xa0;
const HEX = 16;
const WIDE_RUN = "\\X2\\";
const RUN_END = "\\X0\\";
const LATIN1_DIRECTIVE = "\\PA\\";
const HASH = 0x23;
const DIGIT_ZERO = 0x30;
const DIGIT_NINE = 0x39;
const LARGEST_RETARGET = 260;

function space(random: Random): string {
    return pick(random, SPACING);
}

function lettered(random: Random, word: string): string {
    return pick(random, [word.toUpperCase(), word.toLowerCase(), `${word.slice(0, 1).toUpperCase()}${word.slice(1).toLowerCase()}`]);
}

function hex(value: number, digits: number): string {
    return value.toString(HEX).toUpperCase().padStart(digits, "0");
}

function wide(units: string): string {
    return `${WIDE_RUN}${units}${RUN_END}`;
}

function shifted(point: number): string | undefined {
    if (point < SHIFTED_FIRST || point >= LATIN1_LAST) {
        return undefined;
    }
    const character = String.fromCharCode(point - UPPER_HALF);
    return `\\S\\${character === "'" ? "''" : character}`;
}

function characterSpelling(random: Random, character: string): string {
    const point = character.codePointAt(0)!;
    if (character === "'") {
        return "''";
    }
    if (character === "\\") {
        return "\\\\";
    }
    if (point >= PRINTABLE_FIRST && point <= PRINTABLE_LAST) {
        return character;
    }
    if (point <= LATIN1_LAST) {
        return pick(random, [`\\X\\${hex(point, 2)}`, wide(hex(point, 4)), shifted(point) ?? wide(hex(point, 4))]);
    }
    const units = Array.from({ length: character.length }, (_, index) => hex(character.charCodeAt(index), 4)).join("");
    return pick(random, [wide(units), `\\X4\\${hex(point, 8)}${RUN_END}`]);
}

export function spelledText(random: Random, text: string): string {
    let out = "";
    let wideBefore = false;
    for (const character of text) {
        const spelling = characterSpelling(random, character);
        const isWide = spelling.startsWith(WIDE_RUN);
        out = isWide && wideBefore && random() < 0.5 ? `${out.slice(0, -RUN_END.length)}${spelling.slice(WIDE_RUN.length)}` : `${out}${random() < 0.05 ? LATIN1_DIRECTIVE : ""}${spelling}`;
        wideBefore = isWide;
    }
    return `'${out}'`;
}

export function spelledReal(random: Random, value: number): string {
    if (Number.isSafeInteger(value) && random() < 0.5) {
        return pick(random, [`${value}`, `${value}.`, `${value}.0`, value >= 0 ? `+${value}.` : `${value}.`]);
    }
    const [mantissa, exponent] = value.toExponential().split("e") as [string, string];
    const digits = `${mantissa.includes(".") ? mantissa : `${mantissa}.`}${"0".repeat(whole(random, 3))}`;
    const power = exponent.replace("+", "");
    return `${digits}${pick(random, ["E", "e"])}${power.startsWith("-") ? "" : pick(random, ["", "+"])}${power}`;
}

export function spelled(random: Random, value: IfcValue): string {
    if (value === null) {
        return "$";
    }
    if (typeof value === "boolean") {
        return `.${lettered(random, value ? "T" : "F")}.`;
    }
    if (typeof value === "number") {
        return spelledReal(random, value);
    }
    if (typeof value === "string") {
        return spelledText(random, value);
    }
    if (isReference(value)) {
        return `#${value.ref}`;
    }
    if (isEnumeration(value)) {
        return `.${lettered(random, value.enum)}.`;
    }
    if (isBinary(value)) {
        return `"${value.binary}"`;
    }
    if (isDerived(value)) {
        return "*";
    }
    if (isTyped(value)) {
        return `${lettered(random, value.type)}${space(random)}(${space(random)}${spelled(random, value.value)}${space(random)})`;
    }
    return `(${space(random)}${spelledList(random, value)}${space(random)})`;
}

export function spelledList(random: Random, values: readonly IfcValue[]): string {
    return values.map((value) => spelled(random, value)).join(`${space(random)},${space(random)}`);
}

function joined(...parts: readonly ArrayLike<number>[]): Uint8Array {
    return Uint8Array.from(parts.flatMap((part) => Array.from(part)));
}

function retargeted(random: Random, bytes: Uint8Array, at: number): Uint8Array {
    const hash = bytes.indexOf(HASH, at);
    let end = hash + 1;
    while (hash >= 0 && end < bytes.length && bytes[end]! >= DIGIT_ZERO && bytes[end]! <= DIGIT_NINE) {
        end++;
    }
    if (hash < 0 || end === hash + 1) {
        return bytes.slice();
    }
    return joined(bytes.subarray(0, hash + 1), new TextEncoder().encode(String(1 + whole(random, LARGEST_RETARGET))), bytes.subarray(end));
}

export function mutated(random: Random, bytes: Uint8Array): Uint8Array {
    const at = whole(random, bytes.length);
    switch (whole(random, 8)) {
        case 0:
            return joined(bytes.subarray(0, at), bytes.subarray(at + 1 + whole(random, 8)));
        case 1:
            return joined(bytes.subarray(0, at), pick(random, SIGNIFICANT), bytes.subarray(at));
        case 2:
            return bytes.slice(0, at);
        case 3: {
            const from = whole(random, bytes.length);
            return joined(bytes.subarray(0, at), bytes.subarray(from, from + whole(random, 40)), bytes.subarray(at));
        }
        case 4:
            return joined(bytes.subarray(0, at), pick(random, BROKEN_UTF8), bytes.subarray(at));
        case 5:
        case 6:
            return retargeted(random, bytes, at);
        default: {
            const copy = bytes.slice();
            copy[at] = whole(random, LATIN1_LAST + 1);
            return copy;
        }
    }
}
