import { crc32, deflateRawSync } from "node:zlib";

const encoder = new TextEncoder();

function uint16(value: number): number[] {
    return [value & 0xff, (value >>> 8) & 0xff];
}

function uint32(value: number): number[] {
    return [...uint16(value & 0xffff), ...uint16(value >>> 16)];
}

export function zipOf(files: Record<string, string>): Uint8Array {
    const local: number[] = [];
    const central: number[] = [];
    for (const [name, text] of Object.entries(files)) {
        const data = encoder.encode(text);
        const stored = Array.from(deflateRawSync(data));
        const nameBytes = Array.from(encoder.encode(name));
        const shared = [...uint16(20), ...uint16(0x800), ...uint16(8), ...uint16(0), ...uint16(0), ...uint32(crc32(data)), ...uint32(stored.length), ...uint32(data.length), ...uint16(nameBytes.length), ...uint16(0)];
        central.push(...uint32(0x02014b50), ...uint16(20), ...shared, ...uint16(0), ...uint16(0), ...uint16(0), ...uint32(0), ...uint32(local.length), ...nameBytes);
        local.push(...uint32(0x04034b50), ...shared, ...nameBytes, ...stored);
    }
    const count = Object.keys(files).length;
    const end = [...uint32(0x06054b50), ...uint16(0), ...uint16(0), ...uint16(count), ...uint16(count), ...uint32(central.length), ...uint32(local.length), ...uint16(0)];
    return Uint8Array.from([...local, ...central, ...end]);
}
