import { crc32 } from "./crc32";
import type { ZipEntry } from "./helper-types";
import { inflateRaw } from "./inflate";
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
    return entries;
}

export function zipEntryData(bytes: Uint8Array, entry: ZipEntry): Uint8Array {
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
        data = inflateRaw(stored, entry.size);
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
