import {
    BINARY_COUNT_BYTES, BINARY_HEADER_BYTES, BINARY_NUMBER_BYTES, BINARY_POINT_BYTES, BINARY_TRIANGLE_BYTES,
    COMPONENTS_OF_A_POINT, CORNERS_OF_A_TRIANGLE, NUMBERS_OF_A_TRIANGLE, POINTS_OF_A_FACET, SECOND_VERTEX_SLOT, THIRD_VERTEX_SLOT,
} from "./stl.constants";
import { cross3, subtract3, unitVectorOf } from "../geometry/vectors";
import type { StlAxes } from "./stl-types";

const ASCII_FACET = new RegExp(
    "facet\\s+normal\\s+(\\S+)\\s+(\\S+)\\s+(\\S+)\\s+outer\\s+loop" +
    "\\s+vertex\\s+(\\S+)\\s+(\\S+)\\s+(\\S+)\\s+vertex\\s+(\\S+)\\s+(\\S+)\\s+(\\S+)\\s+vertex\\s+(\\S+)\\s+(\\S+)\\s+(\\S+)" +
    "\\s+endloop\\s+endfacet",
    "gi",
);

const TEXT_OPENING = /^(?:ï»¿)?\s*(?:solid|facet)/i;
const OPENING_BYTES = 80;
const CHARACTERS_AT_ONCE = 0x8000;
const FIRST_TRIANGLE_AT = BINARY_HEADER_BYTES + BINARY_COUNT_BYTES;

const negatedText = (value: string): string => (value.startsWith("-") ? value.slice(1) : `-${value.startsWith("+") ? value.slice(1) : value}`);

const leavesEveryAxis = (axes: StlAxes): boolean =>
    !axes.mirrors && [axes.x, axes.y, axes.z].every(([component, negated], at) => component === at && !negated);

function countedTriangles(bytes: Uint8Array): number {
    if (bytes.length < FIRST_TRIANGLE_AT) {
        return 0;
    }
    return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(BINARY_HEADER_BYTES, true);
}

function heldTriangles(bytes: Uint8Array): number {
    return Math.max(0, Math.floor((bytes.length - FIRST_TRIANGLE_AT) / BINARY_TRIANGLE_BYTES));
}

function charactersOf(bytes: Uint8Array): string {
    let characters = "";
    for (let at = 0; at < bytes.length; at += CHARACTERS_AT_ONCE) {
        characters += String.fromCharCode(...bytes.subarray(at, at + CHARACTERS_AT_ONCE));
    }
    return characters;
}

function bytesOf(characters: string): Uint8Array<ArrayBuffer> {
    const bytes = new Uint8Array(characters.length);
    for (let at = 0; at < characters.length; at++) {
        bytes[at] = characters.charCodeAt(at);
    }
    return bytes;
}

function isTextStl(bytes: Uint8Array): boolean {
    const holdsItsCount = bytes.length >= FIRST_TRIANGLE_AT && countedTriangles(bytes) <= heldTriangles(bytes);
    return !holdsItsCount && TEXT_OPENING.test(charactersOf(bytes.subarray(0, OPENING_BYTES)));
}

function mappedBinary(bytes: Uint8Array, axes: StlAxes): Uint8Array<ArrayBuffer> {
    const mapped = bytes.slice();
    const source = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const target = new DataView(mapped.buffer);
    const count = Math.min(countedTriangles(bytes), heldTriangles(bytes));
    const copyPoint = (from: number, to: number): void => {
        [axes.x, axes.y, axes.z].forEach(([component, negated], at) => {
            const value = source.getFloat32(from + component * BINARY_NUMBER_BYTES, true);
            target.setFloat32(to + at * BINARY_NUMBER_BYTES, negated ? -value : value, true);
        });
    };
    for (let triangle = 0; triangle < count; triangle++) {
        const at = FIRST_TRIANGLE_AT + triangle * BINARY_TRIANGLE_BYTES;
        copyPoint(at, at);
        copyPoint(at + BINARY_POINT_BYTES, at + BINARY_POINT_BYTES);
        copyPoint(at + SECOND_VERTEX_SLOT * BINARY_POINT_BYTES, at + (axes.mirrors ? THIRD_VERTEX_SLOT : SECOND_VERTEX_SLOT) * BINARY_POINT_BYTES);
        copyPoint(at + THIRD_VERTEX_SLOT * BINARY_POINT_BYTES, at + (axes.mirrors ? SECOND_VERTEX_SLOT : THIRD_VERTEX_SLOT) * BINARY_POINT_BYTES);
    }
    return mapped;
}

function mappedAscii(bytes: Uint8Array, axes: StlAxes): Uint8Array<ArrayBuffer> {
    const point = (values: string[]): string => [axes.x, axes.y, axes.z].map(([component, negated]) => (negated ? negatedText(values[component]!) : values[component]!)).join(" ");
    const mapped = charactersOf(bytes).replace(ASCII_FACET, (_facet: string, ...numbers: string[]): string => {
        const [normal, a, b, c] = Array.from({ length: POINTS_OF_A_FACET }, (_point, at) => point(numbers.slice(at * COMPONENTS_OF_A_POINT, (at + 1) * COMPONENTS_OF_A_POINT)));
        const [second, third] = axes.mirrors ? [c, b] : [b, c];
        return `facet normal ${normal}\n  outer loop\n    vertex ${a}\n    vertex ${second}\n    vertex ${third}\n  endloop\nendfacet`;
    });
    return bytesOf(mapped);
}

export function stlOfTriangles(parts: readonly ArrayLike<number>[]): Uint8Array<ArrayBuffer> {
    const count = parts.reduce((sum, corners) => sum + Math.floor(corners.length / NUMBERS_OF_A_TRIANGLE), 0);
    const bytes = new Uint8Array(BINARY_HEADER_BYTES + BINARY_COUNT_BYTES + count * BINARY_TRIANGLE_BYTES);
    const view = new DataView(bytes.buffer);
    view.setUint32(BINARY_HEADER_BYTES, count, true);
    let at = BINARY_HEADER_BYTES + BINARY_COUNT_BYTES;
    for (const corners of parts) {
        for (let from = 0; from + NUMBERS_OF_A_TRIANGLE <= corners.length; from += NUMBERS_OF_A_TRIANGLE) {
            const [a, b, c] = Array.from({ length: CORNERS_OF_A_TRIANGLE }, (_corner, corner): [number, number, number] => {
                const first = from + corner * COMPONENTS_OF_A_POINT;
                return [corners[first]!, corners[first + 1]!, corners[first + 2]!];
            }) as [[number, number, number], [number, number, number], [number, number, number]];
            const normal = unitVectorOf(cross3(subtract3(b, a), subtract3(c, a))) ?? [0, 0, 0];
            [...normal, ...a, ...b, ...c].forEach((value, slot) => view.setFloat32(at + slot * BINARY_NUMBER_BYTES, value, true));
            at += BINARY_TRIANGLE_BYTES;
        }
    }
    return bytes;
}

export function stlWithAxes(bytes: Uint8Array, axes: StlAxes): Uint8Array<ArrayBuffer> {
    if (leavesEveryAxis(axes)) {
        return bytes.slice();
    }
    return isTextStl(bytes) ? mappedAscii(bytes, axes) : mappedBinary(bytes, axes);
}
