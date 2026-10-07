import {
    CHAR_APOSTROPHE, CHAR_CLOSE, CHAR_COMMA, CHAR_DOLLAR, CHAR_DOT, CHAR_HASH, CHAR_LOWER_E, CHAR_MINUS, CHAR_OPEN, CHAR_PLUS, CHAR_QUOTE,
    CHAR_STAR, CHAR_UPPER_E, CHAR_ZERO, DECIMAL_RADIX, MAX_NESTING,
} from "./constants";
import { StepSyntaxError } from "./errors";
import { exactDecimal } from "./numbers";
import { asciiText, endOfBinary, endOfString, isDigit, isNameCharacter, skipSpace, textOf } from "./scanner";
import type { IfcValue, ParseFrame, TypeSpelling } from "./step-types";
import { decodeString } from "./strings";
import { DERIVED } from "./values";

function readNumber(bytes: Uint8Array, at: number, end: number): [number, number] {
    let position = at;
    if (bytes[position] === CHAR_MINUS || bytes[position] === CHAR_PLUS) {
        position++;
    }
    while (position < end) {
        const code = bytes[position]!;
        const signOfExponent = (code === CHAR_MINUS || code === CHAR_PLUS) && (bytes[position - 1] === CHAR_UPPER_E || bytes[position - 1] === CHAR_LOWER_E);
        if (!isDigit(code) && code !== CHAR_DOT && code !== CHAR_UPPER_E && code !== CHAR_LOWER_E && !signOfExponent) {
            break;
        }
        position++;
    }
    const value = exactDecimal(bytes, at, position) ?? Number(asciiText(bytes, at, position));
    if (Number.isNaN(value)) {
        throw new StepSyntaxError("A malformed number", at);
    }
    if (!Number.isFinite(value)) {
        throw new StepSyntaxError("A number too large to be finite", at);
    }
    return [value, position];
}

function readName(bytes: Uint8Array, at: number, end: number): number {
    let position = at;
    while (position < end && isNameCharacter(bytes[position]!)) {
        position++;
    }
    return position;
}

function readReference(bytes: Uint8Array, at: number, end: number): [IfcValue, number] {
    let close = at + 1;
    let id = 0;
    while (close < end && isDigit(bytes[close]!)) {
        id = id * DECIMAL_RADIX + (bytes[close]! - CHAR_ZERO);
        close++;
    }
    if (close === at + 1 || !Number.isSafeInteger(id) || isNameCharacter(bytes[close] ?? 0)) {
        throw new StepSyntaxError("A reference that is not '#' followed by digits", at);
    }
    return [{ ref: id }, close];
}

function readEnumeration(bytes: Uint8Array, at: number, end: number): [IfcValue, number] {
    const close = readName(bytes, at + 1, end);
    if (bytes[close] !== CHAR_DOT) {
        throw new StepSyntaxError("An enumeration value is never closed", at);
    }
    const name = asciiText(bytes, at + 1, close).toUpperCase();
    const value: IfcValue = name === "T" ? true : name === "F" ? false : { enum: name };
    return [value, close + 1];
}

function readScalar(bytes: Uint8Array, at: number, end: number): [IfcValue, number] {
    const code = bytes[at]!;
    if (code === CHAR_DOLLAR) {
        return [null, at + 1];
    }
    if (code === CHAR_STAR) {
        return [DERIVED, at + 1];
    }
    if (code === CHAR_HASH) {
        return readReference(bytes, at, end);
    }
    if (code === CHAR_APOSTROPHE) {
        const close = endOfString(bytes, at, end);
        return [decodeString(textOf(bytes, at + 1, close), at), close + 1];
    }
    if (code === CHAR_QUOTE) {
        const close = endOfBinary(bytes, at, end);
        return [{ binary: textOf(bytes, at + 1, close) }, close + 1];
    }
    if (code === CHAR_DOT) {
        return readEnumeration(bytes, at, end);
    }
    if (isDigit(code) || code === CHAR_MINUS || code === CHAR_PLUS) {
        return readNumber(bytes, at, end);
    }
    throw new StepSyntaxError(`An unexpected character '${String.fromCharCode(code)}'`, at);
}

function closeFrame(stack: ParseFrame[], at: number, spell: TypeSpelling | undefined): IfcValue {
    const frame = stack.pop()!;
    if (frame.typeName === undefined) {
        return frame.items;
    }
    if (frame.items.length !== 1) {
        throw new StepSyntaxError(`The typed value ${frame.typeName} holds ${frame.items.length} values instead of one`, at);
    }
    return { type: spell ? spell(frame.typeName) : frame.typeName, value: frame.items[0]! };
}

function openFrame(bytes: Uint8Array, at: number, end: number, stack: ParseFrame[]): number {
    let typeName: string | undefined;
    let open = at;
    if (bytes[at] !== CHAR_OPEN) {
        const nameEnd = readName(bytes, at, end);
        typeName = asciiText(bytes, at, nameEnd);
        open = skipSpace(bytes, nameEnd, end);
        if (bytes[open] !== CHAR_OPEN) {
            throw new StepSyntaxError(`The typed value ${typeName} has no parentheses`, at);
        }
    }
    if (stack.length > MAX_NESTING) {
        throw new StepSyntaxError(`Values nested more than ${MAX_NESTING} deep`, at);
    }
    stack.push({ items: [], typeName });
    return skipSpace(bytes, open + 1, end);
}

export function decodeArguments(bytes: Uint8Array, start: number, end: number, spell?: TypeSpelling): IfcValue[] {
    const root: ParseFrame = { items: [], typeName: undefined };
    const stack: ParseFrame[] = [root];
    let at = skipSpace(bytes, start, end);
    let expectValue = true;
    while (at < end) {
        const code = bytes[at]!;
        if (code === CHAR_COMMA) {
            if (expectValue) {
                throw new StepSyntaxError("A value is missing before a comma", at);
            }
            expectValue = true;
            at = skipSpace(bytes, at + 1, end);
            continue;
        }
        if (code === CHAR_CLOSE) {
            if (stack.length === 1) {
                throw new StepSyntaxError("A closing parenthesis without an opening one", at);
            }
            if (expectValue && stack[stack.length - 1]!.items.length > 0) {
                throw new StepSyntaxError("A value is missing before a closing parenthesis", at);
            }
            const value = closeFrame(stack, at, spell);
            stack[stack.length - 1]!.items.push(value);
            expectValue = false;
            at = skipSpace(bytes, at + 1, end);
            continue;
        }
        if (!expectValue) {
            throw new StepSyntaxError("Two values without a comma between them", at);
        }
        if (code === CHAR_OPEN || (isNameCharacter(code) && !isDigit(code))) {
            at = openFrame(bytes, at, end, stack);
            continue;
        }
        const [value, next] = readScalar(bytes, at, end);
        stack[stack.length - 1]!.items.push(value);
        expectValue = false;
        at = skipSpace(bytes, next, end);
    }
    if (stack.length !== 1) {
        throw new StepSyntaxError("A parenthesis is never closed", end);
    }
    if (expectValue && root.items.length > 0) {
        throw new StepSyntaxError("A value is missing at the end", end);
    }
    return root.items;
}
