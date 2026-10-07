import {
    BOM, CHAR_EQUALS, CHAR_HASH, CHAR_LOWER_A, CHAR_LOWER_Z, CHAR_MINUS, CHAR_OPEN, CHAR_SEMICOLON, CHAR_ZERO, DECIMAL_RADIX, INITIAL_ROWS, MAX_EXPRESS_ID,
    MAX_FILE_BYTES, MAX_TYPE_CODES, TYPE_HASH_PRIME, UPPER_CASE_OFFSET,
} from "./constants";
import { StepSyntaxError } from "./errors";
import { decodeArguments } from "./reader";
import { closingParenthesis, isDigit, isNameCharacter, skipSpace, textOf } from "./scanner";
import type { RowSpans, StepHeaderEntity, StepIndex, StepRows } from "./step-types";

function grown<T extends Int32Array | Uint32Array | Uint16Array>(array: T, make: (size: number) => T): T {
    const next = make(array.length * 2);
    next.set(array);
    return next;
}

function upperCased(code: number): number {
    return code >= CHAR_LOWER_A && code <= CHAR_LOWER_Z ? code - UPPER_CASE_OFFSET : code;
}

function spells(name: string, bytes: Uint8Array, start: number, end: number): boolean {
    if (name.length !== end - start) {
        return false;
    }
    for (let at = start; at < end; at++) {
        if (name.charCodeAt(at - start) !== upperCased(bytes[at]!)) {
            return false;
        }
    }
    return true;
}

function typeCodeOf(rows: StepRows, bytes: Uint8Array, start: number, end: number): number {
    let hash = end - start;
    for (let at = start; at < end; at++) {
        hash = Math.imul(hash ^ upperCased(bytes[at]!), TYPE_HASH_PRIME);
    }
    const candidates = rows.codesOfHash.get(hash);
    for (const code of candidates ?? []) {
        if (spells(rows.typeTable[code]!, bytes, start, end)) {
            return code;
        }
    }
    if (rows.typeTable.length === MAX_TYPE_CODES) {
        throw new StepSyntaxError(`The file names more than ${MAX_TYPE_CODES} entity types`, start);
    }
    let name = "";
    for (let at = start; at < end; at++) {
        name += String.fromCharCode(upperCased(bytes[at]!));
    }
    const code = rows.typeTable.push(name) - 1;
    if (candidates) {
        candidates.push(code);
    } else {
        rows.codesOfHash.set(hash, [code]);
    }
    return code;
}

function addRow(rows: StepRows, id: number, typeCode: number, spans: RowSpans): void {
    if (rows.count === rows.ids.length) {
        rows.ids = grown(rows.ids, (n) => new Int32Array(n));
        rows.typeCodes = grown(rows.typeCodes, (n) => new Uint16Array(n));
        rows.argStart = grown(rows.argStart, (n) => new Uint32Array(n));
        rows.argEnd = grown(rows.argEnd, (n) => new Uint32Array(n));
        rows.rowStart = grown(rows.rowStart, (n) => new Uint32Array(n));
        rows.rowEnd = grown(rows.rowEnd, (n) => new Uint32Array(n));
    }
    rows.ids[rows.count] = id;
    rows.typeCodes[rows.count] = typeCode;
    rows.rowStart[rows.count] = spans.rowStart;
    rows.argStart[rows.count] = spans.argStart;
    rows.argEnd[rows.count] = spans.argEnd;
    rows.rowEnd[rows.count] = spans.rowEnd;
    rows.count++;
}

function readKeyword(bytes: Uint8Array, at: number): [string, number] {
    let end = at;
    while (end < bytes.length && (isNameCharacter(bytes[end]!) || bytes[end] === CHAR_MINUS)) {
        end++;
    }
    return [textOf(bytes, at, end).toUpperCase(), end];
}

function expectSemicolon(bytes: Uint8Array, at: number, after: string): number {
    const position = skipSpace(bytes, at, bytes.length);
    if (bytes[position] !== CHAR_SEMICOLON) {
        throw new StepSyntaxError(`Expected ';' after ${after}`, position);
    }
    return position + 1;
}

function expectKeyword(bytes: Uint8Array, at: number, keyword: string): number {
    const position = skipSpace(bytes, at, bytes.length);
    const [found, end] = readKeyword(bytes, position);
    if (found !== keyword) {
        throw new StepSyntaxError(`Expected ${keyword}`, position);
    }
    return end;
}

function readHeader(bytes: Uint8Array, from: number): [StepHeaderEntity[], number, number] {
    const header: StepHeaderEntity[] = [];
    let at = expectSemicolon(bytes, expectKeyword(bytes, from, "HEADER"), "HEADER");
    for (;;) {
        at = skipSpace(bytes, at, bytes.length);
        const [name, nameEnd] = readKeyword(bytes, at);
        if (name === "ENDSEC") {
            return [header, expectSemicolon(bytes, nameEnd, "ENDSEC"), at];
        }
        if (!name) {
            throw new StepSyntaxError("Expected a header entity or ENDSEC", at);
        }
        const open = skipSpace(bytes, nameEnd, bytes.length);
        if (bytes[open] !== CHAR_OPEN) {
            throw new StepSyntaxError(`The header entity ${name} has no attribute list`, open);
        }
        const close = closingParenthesis(bytes, open, bytes.length);
        const end = expectSemicolon(bytes, close + 1, name);
        header.push({ type: name, args: decodeArguments(bytes, open + 1, close), text: textOf(bytes, at, end), offset: at });
        at = end;
    }
}

function readRow(bytes: Uint8Array, at: number, rows: StepRows): number {
    let idEnd = at + 1;
    let id = 0;
    while (idEnd < bytes.length && isDigit(bytes[idEnd]!)) {
        id = id * DECIMAL_RADIX + bytes[idEnd]! - CHAR_ZERO;
        idEnd++;
    }
    if (idEnd === at + 1) {
        throw new StepSyntaxError("An entity without an id", at);
    }
    if (id > MAX_EXPRESS_ID) {
        throw new StepSyntaxError(`Entity #${textOf(bytes, at + 1, idEnd)} has an id above ${MAX_EXPRESS_ID}, which this library does not read`, at);
    }
    const equals = skipSpace(bytes, idEnd, bytes.length);
    if (bytes[equals] !== CHAR_EQUALS) {
        throw new StepSyntaxError(`Entity #${id} has no '='`, equals);
    }
    const nameStart = skipSpace(bytes, equals + 1, bytes.length);
    let nameEnd = nameStart;
    while (nameEnd < bytes.length && isNameCharacter(bytes[nameEnd]!)) {
        nameEnd++;
    }
    const open = skipSpace(bytes, nameEnd, bytes.length);
    if (bytes[open] !== CHAR_OPEN) {
        throw new StepSyntaxError(`Entity #${id} has no attribute list`, open);
    }
    const close = closingParenthesis(bytes, open, bytes.length);
    const semicolon = skipSpace(bytes, close + 1, bytes.length);
    if (bytes[semicolon] !== CHAR_SEMICOLON) {
        throw new StepSyntaxError(`Entity #${id} does not end with ';'`, semicolon);
    }
    const rowEnd = semicolon + 1;
    addRow(rows, id, typeCodeOf(rows, bytes, nameStart, nameEnd), { rowStart: at, argStart: open + 1, argEnd: close, rowEnd });
    return rowEnd;
}

function readDataSection(bytes: Uint8Array, from: number, rows: StepRows): number {
    let at = skipSpace(bytes, from, bytes.length);
    if (bytes[at] === CHAR_OPEN) {
        at = closingParenthesis(bytes, at, bytes.length) + 1;
    }
    at = expectSemicolon(bytes, at, "DATA");
    for (;;) {
        at = skipSpace(bytes, at, bytes.length);
        if (at >= bytes.length) {
            throw new StepSyntaxError("The DATA section never ends", at);
        }
        if (bytes[at] !== CHAR_HASH) {
            const [keyword, keywordEnd] = readKeyword(bytes, at);
            if (keyword !== "ENDSEC") {
                throw new StepSyntaxError("Expected an entity or ENDSEC", at);
            }
            return expectSemicolon(bytes, keywordEnd, "ENDSEC");
        }
        at = readRow(bytes, at, rows);
    }
}

function startOf(bytes: Uint8Array): number {
    return BOM.every((byte, index) => bytes[index] === byte) ? BOM.length : 0;
}

export function indexStep(bytes: Uint8Array): StepIndex {
    if (bytes.length > MAX_FILE_BYTES) {
        throw new StepSyntaxError(`The file holds ${bytes.length} bytes; files of 4 GiB or more are not read`, 0);
    }
    const [header, afterHeader, headerEnd] = readHeader(bytes, expectSemicolon(bytes, expectKeyword(bytes, startOf(bytes), "ISO-10303-21"), "ISO-10303-21"));
    const rows: StepRows = {
        count: 0,
        ids: new Int32Array(INITIAL_ROWS),
        typeCodes: new Uint16Array(INITIAL_ROWS),
        typeTable: [],
        codesOfHash: new Map(),
        argStart: new Uint32Array(INITIAL_ROWS),
        argEnd: new Uint32Array(INITIAL_ROWS),
        rowStart: new Uint32Array(INITIAL_ROWS),
        rowEnd: new Uint32Array(INITIAL_ROWS),
    };
    const sectionStarts: number[] = [];
    let at = readDataSection(bytes, expectKeyword(bytes, afterHeader, "DATA"), rows);
    for (;;) {
        at = skipSpace(bytes, at, bytes.length);
        const [keyword, keywordEnd] = readKeyword(bytes, at);
        if (keyword === "DATA") {
            sectionStarts.push(rows.count);
            at = readDataSection(bytes, keywordEnd, rows);
            continue;
        }
        if (keyword !== "END-ISO-10303-21") {
            throw new StepSyntaxError("Expected DATA or END-ISO-10303-21", at);
        }
        const end = skipSpace(bytes, expectSemicolon(bytes, keywordEnd, "END-ISO-10303-21"), bytes.length);
        if (end < bytes.length) {
            throw new StepSyntaxError("The file goes on after END-ISO-10303-21;", end);
        }
        break;
    }
    return {
        bytes,
        count: rows.count,
        ids: rows.ids.subarray(0, rows.count),
        typeCodes: rows.typeCodes.subarray(0, rows.count),
        typeTable: rows.typeTable,
        argStart: rows.argStart.subarray(0, rows.count),
        argEnd: rows.argEnd.subarray(0, rows.count),
        rowStart: rows.rowStart.subarray(0, rows.count),
        rowEnd: rows.rowEnd.subarray(0, rows.count),
        header,
        headerEnd,
        sectionStarts,
    };
}
