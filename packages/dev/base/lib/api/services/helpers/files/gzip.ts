import { crc32 } from "./crc32";
import { inflateRaw } from "./inflate";
import { BYTE_BITS, UINT16_BYTES, UINT32_BYTES } from "./zip.constants";
import {
    GZIP_COMMENT_FLAG,
    GZIP_DEFLATE_METHOD,
    GZIP_EXTRA_FLAG,
    GZIP_FLAGS_AT,
    GZIP_HEADER_CRC_FLAG,
    GZIP_HEADER_SIZE,
    GZIP_MAGIC_FIRST,
    GZIP_MAGIC_SECOND,
    GZIP_METHOD_AT,
    GZIP_NAME_FLAG,
    GZIP_TRAILER_SIZE,
} from "./gzip.constants";

function uint32(bytes: Uint8Array, at: number): number {
    return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(at, true);
}

function afterText(bytes: Uint8Array, from: number): number {
    const end = bytes.indexOf(0, from);
    if (end < 0) {
        throw new Error("The gzip header's name or comment never ends");
    }
    return end + 1;
}

export function isGzip(bytes: Uint8Array): boolean {
    return bytes.length >= 2 && bytes[0] === GZIP_MAGIC_FIRST && bytes[1] === GZIP_MAGIC_SECOND;
}

export function gunzipped(bytes: Uint8Array): Uint8Array {
    if (!isGzip(bytes) || bytes.length < GZIP_HEADER_SIZE + GZIP_TRAILER_SIZE) {
        throw new Error("The data is not gzip: it does not start with the gzip signature or is too short to hold its header");
    }
    if (bytes[GZIP_METHOD_AT] !== GZIP_DEFLATE_METHOD) {
        throw new Error(`The gzip data is compressed with method ${String(bytes[GZIP_METHOD_AT])}; only deflate is read`);
    }
    const flags = bytes[GZIP_FLAGS_AT]!;
    let start = GZIP_HEADER_SIZE;
    if (flags & GZIP_EXTRA_FLAG) {
        start += UINT16_BYTES + (bytes[start]! | (bytes[start + 1]! << BYTE_BITS));
    }
    if (flags & GZIP_NAME_FLAG) {
        start = afterText(bytes, start);
    }
    if (flags & GZIP_COMMENT_FLAG) {
        start = afterText(bytes, start);
    }
    if (flags & GZIP_HEADER_CRC_FLAG) {
        start += UINT16_BYTES;
    }
    const end = bytes.length - GZIP_TRAILER_SIZE;
    if (start > end) {
        throw new Error("The gzip header runs past the end of the data");
    }
    const size = uint32(bytes, end + UINT32_BYTES);
    const data = inflateRaw(bytes.subarray(start, end), size);
    if (data.length !== size) {
        throw new Error(`The gzip data holds ${data.length} bytes, not the ${size} its trailer records`);
    }
    if (crc32(data) !== uint32(bytes, end)) {
        throw new Error("The gzip data fails its CRC-32 check");
    }
    return data;
}
