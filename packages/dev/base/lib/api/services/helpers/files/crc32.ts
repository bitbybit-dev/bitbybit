import { BYTE_BITS, BYTE_MASK, BYTE_VALUES, CRC32_ALL_ONES, CRC32_POLYNOMIAL } from "./zip.constants";

let table: Uint32Array | undefined;

function crcTable(): Uint32Array {
    const values = new Uint32Array(BYTE_VALUES);
    for (let byte = 0; byte < BYTE_VALUES; byte++) {
        let value = byte;
        for (let bit = 0; bit < BYTE_BITS; bit++) {
            value = value & 1 ? CRC32_POLYNOMIAL ^ (value >>> 1) : value >>> 1;
        }
        values[byte] = value >>> 0;
    }
    return values;
}

export function crc32(data: Uint8Array): number {
    const values = (table ??= crcTable());
    let crc = CRC32_ALL_ONES;
    for (let at = 0; at < data.length; at++) {
        crc = values[(crc ^ data[at]!) & BYTE_MASK]! ^ (crc >>> BYTE_BITS);
    }
    return (crc ^ CRC32_ALL_ONES) >>> 0;
}
