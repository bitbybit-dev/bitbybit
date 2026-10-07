import { CHAR_DOT, CHAR_LOWER_E, CHAR_MINUS, CHAR_PLUS, CHAR_UPPER_E, CHAR_ZERO, DECIMAL_RADIX } from "./constants";
import { isDigit } from "./scanner";

const MAX_EXACT_DIGITS = 15;
const MAX_EXACT_POWER = 22;
const MAX_EXPONENT_DIGITS = 4;
const EXACT_POWERS = Array.from({ length: MAX_EXACT_POWER + 1 }, (_, power) => Number(`1e${power}`));

export function formatReal(value: number): string {
    if (!Number.isFinite(value)) {
        throw new RangeError(`An IFC real must be finite, not ${value}`);
    }
    const text = Object.is(value, -0) ? "0" : String(value);
    const exponentAt = text.indexOf("e");
    const mantissa = exponentAt < 0 ? text : text.slice(0, exponentAt);
    const exponent = exponentAt < 0 ? "" : `E${text.slice(exponentAt + 1).replace("+", "")}`;
    return `${mantissa.includes(".") ? mantissa : `${mantissa}.`}${exponent}`;
}

export function formatInteger(value: number): string {
    if (!Number.isSafeInteger(value)) {
        throw new RangeError(`An IFC integer must be a whole number within the safe range, not ${value}`);
    }
    return String(value);
}

export function exactDecimal(bytes: Uint8Array, start: number, end: number): number | undefined {
    let at = start;
    const negative = bytes[at] === CHAR_MINUS;
    if (negative || bytes[at] === CHAR_PLUS) {
        at++;
    }
    let mantissa = 0;
    let digits = 0;
    let significant = 0;
    let scale = 0;
    let fraction = false;
    for (; at < end; at++) {
        const code = bytes[at]!;
        if (code === CHAR_DOT && !fraction) {
            fraction = true;
            continue;
        }
        if (!isDigit(code)) {
            break;
        }
        mantissa = mantissa * DECIMAL_RADIX + (code - CHAR_ZERO);
        digits++;
        significant += mantissa === 0 ? 0 : 1;
        scale += fraction ? 1 : 0;
    }
    if (digits === 0 || significant > MAX_EXACT_DIGITS) {
        return undefined;
    }
    let exponent = 0;
    if (at < end && (bytes[at] === CHAR_UPPER_E || bytes[at] === CHAR_LOWER_E)) {
        at++;
        const negativeExponent = bytes[at] === CHAR_MINUS;
        if (negativeExponent || bytes[at] === CHAR_PLUS) {
            at++;
        }
        const first = at;
        for (; at < end && at - first < MAX_EXPONENT_DIGITS && isDigit(bytes[at]!); at++) {
            exponent = exponent * DECIMAL_RADIX + (bytes[at]! - CHAR_ZERO);
        }
        if (at === first) {
            return undefined;
        }
        exponent = negativeExponent ? -exponent : exponent;
    }
    const power = exponent - scale;
    if (at !== end || power < -MAX_EXACT_POWER || power > MAX_EXACT_POWER) {
        return undefined;
    }
    const value = power < 0 ? mantissa / EXACT_POWERS[-power]! : mantissa * EXACT_POWERS[power]!;
    return negative ? -value : value;
}
