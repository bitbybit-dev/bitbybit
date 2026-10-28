import { crc32 } from "./crc32";
import type { DosDateTime, ZipEntry, ZipFile, ZipHeaderWriter, ZipStoredRecord } from "../helper-types";
import { inflateRaw } from "./inflate";
import { MOST_INFLATED_BYTES } from "./inflate.constants";
import {
    BYTE_BITS,
    CENTRAL_COMMENT_LENGTH,
    CENTRAL_COMPRESSED_SIZE,
    CENTRAL_CRC32,
    CENTRAL_EXTRA_LENGTH,
    CENTRAL_FLAGS,
    CENTRAL_HEADER_SIGNATURE,
    CENTRAL_HEADER_SIZE,
    CENTRAL_LOCAL_OFFSET,
    CENTRAL_METHOD,
    CENTRAL_NAME_LENGTH,
    CENTRAL_SIZE,
    DEFLATED_METHOD,
    DOS_EPOCH_YEAR,
    DOS_HOUR_SHIFT,
    DOS_MINUTE_SHIFT,
    DOS_MONTH_SHIFT,
    DOS_SECONDS_PER_UNIT,
    DOS_YEAR_SHIFT,
    ENCRYPTED_FLAG,
    END_DIRECTORY_OFFSET,
    END_DIRECTORY_SIZE,
    END_ENTRY_COUNT,
    END_OF_CENTRAL_SIGNATURE,
    END_OF_CENTRAL_SIZE,
    LOCAL_EXTRA_LENGTH,
    LOCAL_HEADER_SIGNATURE,
    LOCAL_HEADER_SIZE,
    LOCAL_NAME_LENGTH,
    LONGEST_ARCHIVE_COMMENT,
    STORED_METHOD,
    UINT16_BYTES,
    UINT32_BYTES,
    UTF8_NAME_FLAG,
    ZIP64_COUNT,
    ZIP64_SIZE,
    ZIP_MIME_TYPE,
    ZIP_VERSION,
} from "./zip.constants";

const utf8 = new TextDecoder("utf-8");
const windows1252 = new TextDecoder("windows-1252");

function uint16(bytes: Uint8Array, at: number): number {
    if (at + UINT16_BYTES > bytes.length) {
        throw new Error("The zip archive ends in the middle of a header");
    }
    return bytes[at]! | (bytes[at + 1]! << BYTE_BITS);
}

function uint32(bytes: Uint8Array, at: number): number {
    if (at + UINT32_BYTES > bytes.length) {
        throw new Error("The zip archive ends in the middle of a header");
    }
    return (uint16(bytes, at) | (uint16(bytes, at + UINT16_BYTES) << (BYTE_BITS * UINT16_BYTES))) >>> 0;
}

export function isZip(bytes: Uint8Array): boolean {
    return bytes.length >= UINT32_BYTES && uint32(bytes, 0) === LOCAL_HEADER_SIGNATURE;
}

function endOfCentralDirectory(bytes: Uint8Array): number {
    const last = bytes.length - END_OF_CENTRAL_SIZE;
    for (let at = last; at >= Math.max(0, last - LONGEST_ARCHIVE_COMMENT); at--) {
        if (uint32(bytes, at) === END_OF_CENTRAL_SIGNATURE) {
            return at;
        }
    }
    throw new Error("The zip archive has no end of central directory record");
}

export function zipEntries(bytes: Uint8Array): ZipEntry[] {
    const end = endOfCentralDirectory(bytes);
    const count = uint16(bytes, end + END_ENTRY_COUNT);
    const directorySize = uint32(bytes, end + END_DIRECTORY_SIZE);
    const directory = uint32(bytes, end + END_DIRECTORY_OFFSET);
    if (count === ZIP64_COUNT || directorySize === ZIP64_SIZE || directory === ZIP64_SIZE) {
        throw new Error("The zip archive is a ZIP64 archive, which is not read");
    }
    const entries: ZipEntry[] = [];
    let at = directory;
    for (let index = 0; index < count; index++) {
        if (uint32(bytes, at) !== CENTRAL_HEADER_SIGNATURE) {
            throw new Error(`The zip archive's central directory is corrupt at entry ${index}`);
        }
        const flags = uint16(bytes, at + CENTRAL_FLAGS);
        const nameLength = uint16(bytes, at + CENTRAL_NAME_LENGTH);
        const nameBytes = bytes.subarray(at + CENTRAL_HEADER_SIZE, at + CENTRAL_HEADER_SIZE + nameLength);
        entries.push({
            name: (flags & UTF8_NAME_FLAG ? utf8 : windows1252).decode(nameBytes),
            method: uint16(bytes, at + CENTRAL_METHOD),
            crc32: uint32(bytes, at + CENTRAL_CRC32),
            compressedSize: uint32(bytes, at + CENTRAL_COMPRESSED_SIZE),
            size: uint32(bytes, at + CENTRAL_SIZE),
            localOffset: uint32(bytes, at + CENTRAL_LOCAL_OFFSET),
            encrypted: (flags & ENCRYPTED_FLAG) !== 0,
        });
        at += CENTRAL_HEADER_SIZE + nameLength + uint16(bytes, at + CENTRAL_EXTRA_LENGTH) + uint16(bytes, at + CENTRAL_COMMENT_LENGTH);
    }
    refuseOverlappingEntries(entries, directory);
    return entries;
}

function refuseOverlappingEntries(entries: readonly ZipEntry[], directory: number): void {
    const byOffset = [...entries].sort((first, second) => first.localOffset - second.localOffset);
    for (let index = 0; index < byOffset.length; index++) {
        const entry = byOffset[index]!;
        const end = entry.localOffset + LOCAL_HEADER_SIZE + entry.compressedSize;
        const next = byOffset[index + 1];
        if (next !== undefined && end > next.localOffset) {
            throw new Error(`The zip archive's entries ${entry.name} and ${next.name} share their data, which a zip bomb does and an archive never needs`);
        }
        if (end > directory) {
            throw new Error(`${entry.name} runs into the zip archive's central directory`);
        }
    }
}

export function zipEntryData(bytes: Uint8Array, entry: ZipEntry, limit: number = MOST_INFLATED_BYTES): Uint8Array {
    if (entry.encrypted) {
        throw new Error(`${entry.name} in the zip archive is encrypted`);
    }
    if (uint32(bytes, entry.localOffset) !== LOCAL_HEADER_SIGNATURE) {
        throw new Error(`The zip archive's local header of ${entry.name} is missing`);
    }
    const start = entry.localOffset + LOCAL_HEADER_SIZE + uint16(bytes, entry.localOffset + LOCAL_NAME_LENGTH) + uint16(bytes, entry.localOffset + LOCAL_EXTRA_LENGTH);
    if (start + entry.compressedSize > bytes.length) {
        throw new Error(`${entry.name} runs past the end of the zip archive`);
    }
    const stored = bytes.subarray(start, start + entry.compressedSize);
    let data: Uint8Array;
    if (entry.method === STORED_METHOD) {
        data = stored;
    } else if (entry.method === DEFLATED_METHOD) {
        data = inflateRaw(stored, entry.size, limit);
    } else {
        throw new Error(`${entry.name} is compressed with zip method ${entry.method}; only stored and deflated entries are read`);
    }
    if (data.length !== entry.size) {
        throw new Error(`${entry.name} holds ${data.length} bytes, not the ${entry.size} its zip archive records`);
    }
    if (crc32(data) !== entry.crc32) {
        throw new Error(`${entry.name} fails its CRC-32 check`);
    }
    return data;
}

export function dosDateTime(moment: Date): DosDateTime {
    const year = Math.max(DOS_EPOCH_YEAR, moment.getFullYear());
    return {
        time: (moment.getHours() << DOS_HOUR_SHIFT) | (moment.getMinutes() << DOS_MINUTE_SHIFT) | Math.floor(moment.getSeconds() / DOS_SECONDS_PER_UNIT),
        date: ((year - DOS_EPOCH_YEAR) << DOS_YEAR_SHIFT) | ((moment.getMonth() + 1) << DOS_MONTH_SHIFT) | moment.getDate(),
    };
}

function headerWriter(size: number): ZipHeaderWriter {
    const bytes = new Uint8Array(size);
    const view = new DataView(bytes.buffer);
    let at = 0;
    return {
        bytes,
        u16: (value) => {
            view.setUint16(at, value, true);
            at += UINT16_BYTES;
        },
        u32: (value) => {
            view.setUint32(at, value, true);
            at += UINT32_BYTES;
        },
        raw: (value) => {
            bytes.set(value, at);
            at += value.length;
        },
    };
}

function sharedFields(writer: ZipHeaderWriter, name: Uint8Array, record: ZipStoredRecord<unknown>, stamp: DosDateTime): void {
    writer.u16(UTF8_NAME_FLAG);
    writer.u16(STORED_METHOD);
    writer.u16(stamp.time);
    writer.u16(stamp.date);
    writer.u32(record.crc32);
    writer.u32(record.size);
    writer.u32(record.size);
    writer.u16(name.length);
    writer.u16(0);
}

function checkedEntryName(name: string): string {
    const segments = name.split("/");
    if (name === "" || name.startsWith("/") || name.includes("\\") || /^[A-Za-z]:/.test(name) || segments.includes("..") || /\p{Cc}/u.test(name)) {
        throw new Error(`"${name}" cannot be a zip entry name: it must be a relative path without "..", backslashes or control characters`);
    }
    return name;
}

export function zipStoredParts<T>(records: readonly ZipStoredRecord<T>[], modified: Date = new Date()): (Uint8Array<ArrayBuffer> | T)[] {
    if (records.length >= ZIP64_COUNT) {
        throw new Error(`A zip archive written here holds at most ${ZIP64_COUNT - 1} entries, not ${records.length}`);
    }
    const stamp = dosDateTime(modified);
    const encoder = new TextEncoder();
    const names = records.map((record) => encoder.encode(checkedEntryName(record.name)));
    names.forEach((name, index) => {
        if (name.length > LONGEST_ARCHIVE_COMMENT) {
            throw new Error(`Zip entry ${index} has a name longer than ${LONGEST_ARCHIVE_COMMENT} bytes`);
        }
    });
    let total = 0;
    for (const record of records) {
        total += record.size;
        if (record.size >= ZIP64_SIZE || total >= ZIP64_SIZE) {
            throw new Error("A zip archive written here holds less than 4 GB in all, because it does not write ZIP64");
        }
    }
    const parts: (Uint8Array<ArrayBuffer> | T)[] = [];
    const offsets: number[] = [];
    let at = 0;
    records.forEach((record, index) => {
        const name = names[index]!;
        const local = headerWriter(LOCAL_HEADER_SIZE + name.length);
        local.u32(LOCAL_HEADER_SIGNATURE);
        local.u16(ZIP_VERSION);
        sharedFields(local, name, record, stamp);
        local.raw(name);
        offsets.push(at);
        parts.push(local.bytes, record.data);
        at += local.bytes.length + record.size;
    });
    const directory = at;
    records.forEach((record, index) => {
        const name = names[index]!;
        const central = headerWriter(CENTRAL_HEADER_SIZE + name.length);
        central.u32(CENTRAL_HEADER_SIGNATURE);
        central.u16(ZIP_VERSION);
        central.u16(ZIP_VERSION);
        sharedFields(central, name, record, stamp);
        central.u16(0);
        central.u16(0);
        central.u16(0);
        central.u32(0);
        central.u32(offsets[index]!);
        central.raw(name);
        parts.push(central.bytes);
        at += central.bytes.length;
    });
    const end = headerWriter(END_OF_CENTRAL_SIZE);
    end.u32(END_OF_CENTRAL_SIGNATURE);
    end.u16(0);
    end.u16(0);
    end.u16(records.length);
    end.u16(records.length);
    end.u32(at - directory);
    end.u32(directory);
    end.u16(0);
    parts.push(end.bytes);
    return parts;
}

export function zipStored(files: readonly ZipFile[], modified: Date = new Date()): Uint8Array<ArrayBuffer> {
    const parts = zipStoredParts(files.map((file) => ({ name: file.name, size: file.data.length, crc32: crc32(file.data), data: file.data })), modified);
    const archive = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
    let at = 0;
    for (const part of parts) {
        archive.set(part, at);
        at += part.length;
    }
    return archive;
}

export function zipStoredBlob(files: readonly ZipFile[], modified: Date = new Date()): Blob {
    const records = files.map((file) => ({ name: file.name, size: file.data.length, crc32: crc32(file.data), data: file.data as Uint8Array<ArrayBuffer> }));
    return new Blob(zipStoredParts(records, modified), { type: ZIP_MIME_TYPE });
}
