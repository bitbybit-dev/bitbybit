const BINARY_HEADER_BYTES = 80;
const BINARY_COUNT_BYTES = 4;
const BINARY_TRIANGLE_BYTES = 50;
const BINARY_POINT_BYTES = 12;

const ASCII_FACET = new RegExp(
    "facet\\s+normal\\s+(\\S+)\\s+(\\S+)\\s+(\\S+)\\s+outer\\s+loop" +
    "\\s+vertex\\s+(\\S+)\\s+(\\S+)\\s+(\\S+)\\s+vertex\\s+(\\S+)\\s+(\\S+)\\s+(\\S+)\\s+vertex\\s+(\\S+)\\s+(\\S+)\\s+(\\S+)" +
    "\\s+endloop\\s+endfacet",
    "gi",
);

function isBinaryStl(bytes: Uint8Array): boolean {
    if (bytes.length < BINARY_HEADER_BYTES + BINARY_COUNT_BYTES) {
        return false;
    }
    const count = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(BINARY_HEADER_BYTES, true);
    return bytes.length === BINARY_HEADER_BYTES + BINARY_COUNT_BYTES + count * BINARY_TRIANGLE_BYTES;
}

function swappedBinary(bytes: Uint8Array): Uint8Array {
    const swapped = bytes.slice();
    const source = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const target = new DataView(swapped.buffer);
    const count = source.getUint32(BINARY_HEADER_BYTES, true);
    const copyPoint = (from: number, to: number): void => {
        target.setFloat32(to, source.getFloat32(from, true), true);
        target.setFloat32(to + 4, source.getFloat32(from + 8, true), true);
        target.setFloat32(to + 8, source.getFloat32(from + 4, true), true);
    };
    for (let triangle = 0; triangle < count; triangle++) {
        const at = BINARY_HEADER_BYTES + BINARY_COUNT_BYTES + triangle * BINARY_TRIANGLE_BYTES;
        copyPoint(at, at);
        copyPoint(at + BINARY_POINT_BYTES, at + BINARY_POINT_BYTES);
        copyPoint(at + 3 * BINARY_POINT_BYTES, at + 2 * BINARY_POINT_BYTES);
        copyPoint(at + 2 * BINARY_POINT_BYTES, at + 3 * BINARY_POINT_BYTES);
    }
    return swapped;
}

function swappedAscii(bytes: Uint8Array): Uint8Array {
    const text = new TextDecoder().decode(bytes);
    const swapped = text.replace(ASCII_FACET, (_facet: string, nx: string, ny: string, nz: string, ax: string, ay: string, az: string,
        bx: string, by: string, bz: string, cx: string, cy: string, cz: string): string =>
        `facet normal ${nx} ${nz} ${ny}\n  outer loop\n    vertex ${ax} ${az} ${ay}\n    vertex ${cx} ${cz} ${cy}\n    vertex ${bx} ${bz} ${by}\n  endloop\nendfacet`);
    return new TextEncoder().encode(swapped);
}

/**
 * The bytes of an STL file with y and z of every point and normal swapped, which turns Z-up into Y-up
 * as `io.loadSTEPorIGES` turns a shape, and Y-up back into Z-up. The swap mirrors the mesh, so every
 * triangle's winding is reversed too, which keeps its faces facing out. A binary file stays binary
 * and a text file text. A new array is returned; the one given is left as it was.
 */
export function stlWithYAndZSwapped(bytes: Uint8Array): Uint8Array {
    return isBinaryStl(bytes) ? swappedBinary(bytes) : swappedAscii(bytes);
}
