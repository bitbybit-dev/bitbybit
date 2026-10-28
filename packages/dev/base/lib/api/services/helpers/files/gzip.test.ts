import { gzipSync } from "node:zlib";
import { describe, expect, it } from "vitest";
import { gunzipped, isGzip } from "./gzip";

const encoder = new TextEncoder();
const STEP = encoder.encode("ISO-10303-21;\nHEADER;\nENDSEC;\nDATA;\n#1=(LENGTH_UNIT()NAMED_UNIT(*)SI_UNIT(.MILLI.,.METRE.));\nENDSEC;\nEND-ISO-10303-21;\n".repeat(40));

function withHeader(flags: number, fields: readonly number[]): Uint8Array {
    const plain = gzipSync(STEP);
    return new Uint8Array([...plain.subarray(0, 3), flags, ...plain.subarray(4, 10), ...fields, ...plain.subarray(10)]);
}

describe("gzip", () => {
    it("should read back what zlib compressed, byte for byte", () => {
        // Arrange
        const compressed = new Uint8Array(gzipSync(STEP));

        // Act
        const data = gunzipped(compressed);

        // Assert
        expect(isGzip(compressed)).toBe(true);
        expect(data).toEqual(STEP);
    });

    it("should skip the optional extra field, name, comment and header check a header can carry", () => {
        // Arrange
        const flags = 2 | 4 | 8 | 16;
        const fields = [3, 0, 1, 2, 3, ...encoder.encode("part.step"), 0, ...encoder.encode("from a CAD tool"), 0, 0xab, 0xcd];

        // Act
        const data = gunzipped(withHeader(flags, fields));

        // Assert
        expect(data).toEqual(STEP);
    });

    it("should tell plain text from gzip and refuse it", () => {
        // Act & Assert
        expect(isGzip(STEP)).toBe(false);
        expect(() => gunzipped(STEP)).toThrow("not gzip");
    });

    it("should refuse damaged data, another method and a name that never ends", () => {
        // Arrange
        const compressed = new Uint8Array(gzipSync(STEP));
        const damaged = compressed.slice();
        damaged[damaged.length - 8] = damaged[damaged.length - 8]! ^ 0xff;
        const stored = compressed.slice();
        stored[2] = 0;
        const endless = withHeader(8, []).slice(0, 12);

        // Act & Assert
        expect(() => gunzipped(damaged)).toThrow("CRC-32");
        expect(() => gunzipped(stored)).toThrow("method 0");
        expect(() => gunzipped(new Uint8Array([...endless, ...new Uint8Array(8).fill(1)]))).toThrow("never ends");
    });

    it("should refuse a trailer that claims more than the data can inflate to, without setting that much aside first", () => {
        // Arrange
        const lying = new Uint8Array(gzipSync(new TextEncoder().encode("abc")));
        lying.set([0xff, 0xff, 0xff, 0xff], lying.length - 4);

        // Act & Assert
        expect(() => gunzipped(lying, 2 ** 32)).toThrow("The deflate stream holds 3 bytes, not the 4294967295");
        expect(() => gunzipped(lying)).toThrow("The deflate stream is said to hold 4294967295 bytes, more than the 1073741824 this reader inflates");
    });

    it("should inflate no more than the limit it is given", () => {
        // Arrange
        const packed = new Uint8Array(gzipSync(new Uint8Array(100_000)));

        // Act & Assert
        expect(gunzipped(packed, 100_000).length).toBe(100_000);
        expect(() => gunzipped(packed, 99_999)).toThrow("more than the 99999 this reader inflates");
    });
});
