import { READ_THROUGH_SCHEMAS, SUPPORTED_SCHEMAS, readingSchemaFor, schemaNamed } from "../schema/registry";
import { StepSyntaxError } from "../step/errors";
import { encoderFor } from "../step/encoder";
import { indexStep } from "../step/file-index";
import { encodeHeader, headerFromEntities, otherHeaderEntities } from "../step/header";
import { textOf } from "../step/scanner";
import type { IfcFileHeader } from "../step/step-types";
import { CARRIAGE_RETURN, LINE_BREAK, LINE_FEED, LONGEST_STRING, TEXT_PER_CHUNK, WINDOWS_LINE_BREAK } from "./constants";
import { IdMap } from "./id-map";
import type { FilePart } from "./model-types";
import { ModelSnapshot } from "./snapshot";
import { IfcSource } from "./source";

const encoder = new TextEncoder();
const FILE_SCHEMA = "FILE_SCHEMA";

function bytesOf(input: Uint8Array | ArrayBuffer | string): Uint8Array {
    if (typeof input === "string") {
        return encoder.encode(input);
    }
    return input instanceof Uint8Array ? input : new Uint8Array(input);
}

export function readModel(input: Uint8Array | ArrayBuffer | string): ModelSnapshot {
    const index = indexStep(bytesOf(input));
    const header = headerFromEntities(index.header);
    const schemaName = header.schemaIdentifiers[0];
    const named = index.header.find((entity) => entity.type === FILE_SCHEMA)?.offset ?? index.headerEnd;
    if (schemaName === undefined) {
        throw new StepSyntaxError("The file names no schema in FILE_SCHEMA", named);
    }
    const schema = readingSchemaFor(schemaName);
    if (schema === undefined) {
        throw new StepSyntaxError(`The file's schema ${schemaName} is not supported; supported: ${SUPPORTED_SCHEMAS.join(", ")}, and ${READ_THROUGH_SCHEMAS.join(", ")} read through ${SUPPORTED_SCHEMAS.join(", ")}`, named);
    }
    const source = new IfcSource(index, schema);
    return new ModelSnapshot({ schema, header, headerExtras: otherHeaderEntities(index.header), source, overlay: IdMap.empty(), nextId: source.maxId + 1, seededIds: false });
}

export function emptyModel(schemaName: string, header: IfcFileHeader): ModelSnapshot {
    return new ModelSnapshot({ schema: schemaNamed(schemaName), header, headerExtras: [], source: undefined, overlay: IdMap.empty(), nextId: 1, seededIds: true });
}

function lineBreakOf(bytes: Uint8Array): string {
    const feed = bytes.indexOf(LINE_FEED);
    return feed > 0 && bytes[feed - 1] === CARRIAGE_RETURN ? WINDOWS_LINE_BREAK : LINE_BREAK;
}

function rowsOf(model: ModelSnapshot): FilePart[] {
    const rows: FilePart[] = [];
    const encode = encoderFor(model.schema);
    const source = model.source;
    if (source) {
        const { bytes, ids, rowStart, rowEnd, count, sectionStarts } = source.index;
        const breaks = new Set(sectionStarts);
        let runStart = -1;
        const flush = (endRow: number): void => {
            if (runStart >= 0) {
                rows.push(bytes.subarray(rowStart[runStart], rowEnd[endRow - 1]));
                runStart = -1;
            }
        };
        for (let row = 0; row < count; row++) {
            const changed = model.overlay.get(ids[row]!);
            if (breaks.has(row)) {
                flush(row);
            }
            if (changed === undefined) {
                runStart = runStart < 0 ? row : runStart;
                continue;
            }
            flush(row);
            if (changed !== null) {
                rows.push(encode.encodeEntity(changed));
            }
        }
        flush(count);
    }
    model.overlay.forEach((entity, id) => {
        if (entity && !source?.has(id)) {
            rows.push(encode.encodeEntity(entity));
        }
    });
    return rows;
}

function partsOf(model: ModelSnapshot, header: IfcFileHeader): FilePart[] {
    const source = model.source;
    const index = source && source.index.count > 0 ? source.index : undefined;
    const lineBreak = source ? lineBreakOf(source.index.bytes) : LINE_BREAK;
    const rows = rowsOf(model);
    const sameHeader = source !== undefined && JSON.stringify(header) === JSON.stringify(headerFromEntities(source.index.header));
    const head: FilePart = index && sameHeader
        ? index.bytes.subarray(0, index.rowStart[0])
        : `${encodeHeader(header, model.headerExtras).split(LINE_BREAK).join(lineBreak)}${lineBreak}DATA;${lineBreak}`;
    const tail: FilePart = index ? index.bytes.subarray(index.rowEnd[index.count - 1]) : `${rows.length ? lineBreak : ""}ENDSEC;${lineBreak}END-ISO-10303-21;${lineBreak}`;
    return [head, ...rows.flatMap((row, at) => (at === 0 ? [row] : [lineBreak, row])), tail];
}

export function writeModel(model: ModelSnapshot, header: IfcFileHeader = model.header, longest: number = LONGEST_STRING): string {
    const parts = partsOf(model, header);
    const length = parts.reduce((sum, part) => sum + part.length, 0);
    if (length > longest) {
        throw new Error(`The file is about ${length} bytes, more than one JavaScript string holds; write it with model.writeBytes`);
    }
    return parts.map((part) => (typeof part === "string" ? part : textOf(part, 0, part.length))).join("");
}

export function writeModelBytes(model: ModelSnapshot, header: IfcFileHeader = model.header, textPerChunk: number = TEXT_PER_CHUNK): Uint8Array {
    const chunks: Uint8Array[] = [];
    let text = "";
    for (const part of partsOf(model, header)) {
        if (typeof part === "string") {
            text += part;
        }
        if (typeof part !== "string" || text.length > textPerChunk) {
            chunks.push(encoder.encode(text));
            text = "";
        }
        if (typeof part !== "string") {
            chunks.push(part);
        }
    }
    chunks.push(encoder.encode(text));
    const bytes = new Uint8Array(chunks.reduce((sum, chunk) => sum + chunk.length, 0));
    let at = 0;
    for (const chunk of chunks) {
        bytes.set(chunk, at);
        at += chunk.length;
    }
    return bytes;
}
