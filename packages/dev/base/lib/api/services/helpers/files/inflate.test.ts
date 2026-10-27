import { constants, deflateRawSync } from "node:zlib";
import { describe, expect, it } from "vitest";
import { huffmanTable, inflateRaw } from "./inflate";

const TEXT = new TextEncoder().encode("#12=IFCWALL('2O2Fr$t4X7Zf8NOew3FLOH',#5,'Wall-001',$,$,#40,#88,$,.STANDARD.);\n".repeat(200));

function noise(length: number, seed: number): Uint8Array {
    const bytes = new Uint8Array(length);
    let state = seed;
    for (let at = 0; at < length; at++) {
        state = (state * 1103515245 + 12345) >>> 0;
        bytes[at] = state >>> 24;
    }
    return bytes;
}

class BitWriter {
    private readonly bytes: number[] = [];
    private bits = 0;
    private count = 0;

    write(value: number, count: number): this {
        for (let bit = 0; bit < count; bit++) {
            this.bits |= ((value >>> bit) & 1) << this.count++;
            if (this.count === 8) {
                this.bytes.push(this.bits);
                this.bits = 0;
                this.count = 0;
            }
        }
        return this;
    }

    code(code: number, length: number): this {
        for (let bit = length - 1; bit >= 0; bit--) {
            this.write((code >>> bit) & 1, 1);
        }
        return this;
    }

    done(): Uint8Array {
        return Uint8Array.from(this.count ? [...this.bytes, this.bits] : this.bytes);
    }
}

describe("inflateRaw", () => {
    it("should give back what zlib deflated, in stored, fixed and dynamic blocks", () => {
        // Arrange
        const data = Uint8Array.from([...TEXT, ...noise(5000, 7)]);
        const streams = [
            deflateRawSync(data, { level: 0 }),
            deflateRawSync(data, { strategy: constants.Z_FIXED }),
            deflateRawSync(data, { level: 9 }),
            deflateRawSync(data, { level: 1, strategy: constants.Z_HUFFMAN_ONLY }),
        ];

        // Act
        const inflated = streams.map((stream) => inflateRaw(stream, data.length));

        // Assert
        inflated.forEach((bytes) => expect(Buffer.from(bytes).equals(Buffer.from(data))).toBe(true));
    });

    it("should grow its output when the size is not given, across many blocks, and read an empty stream", () => {
        // Arrange
        const data = Uint8Array.from([...noise(300000, 3), ...TEXT, ...TEXT]);

        // Act
        const inflated = inflateRaw(deflateRawSync(data, { level: 6 }));
        const empty = inflateRaw(deflateRawSync(new Uint8Array(0)));

        // Assert
        expect(Buffer.from(inflated).equals(Buffer.from(data))).toBe(true);
        expect(empty.length).toBe(0);
    });

    it("should refuse a stream that holds another size than the one expected", () => {
        // Arrange
        const stream = deflateRawSync(TEXT);

        // Act & Assert
        expect(() => inflateRaw(stream, TEXT.length + 1)).toThrow(`The deflate stream holds ${TEXT.length} bytes, not the ${TEXT.length + 1} expected`);
        expect(() => inflateRaw(stream, TEXT.length - 1)).toThrow(`The deflate stream holds more than the ${TEXT.length - 1} bytes expected`);
    });

    it("should refuse a truncated stream, the reserved block type, a stored block failing its check and a distance before the start", () => {
        // Arrange
        const truncated = deflateRawSync(TEXT).subarray(0, 20);
        const reserved = new BitWriter().write(1, 1).write(3, 2).done();
        const badStored = Uint8Array.of(1, 5, 0, 0, 0);
        const distance = new BitWriter().write(1, 1).write(1, 2).code(1, 7).code(0, 5).done();

        // Act & Assert
        expect(() => inflateRaw(truncated)).toThrow("The deflate stream ends in the middle of a block");
        expect(() => inflateRaw(reserved)).toThrow("The deflate stream is corrupt: a block has the reserved type 3");
        expect(() => inflateRaw(badStored)).toThrow("The deflate stream is corrupt: a stored block's length fails its check");
        expect(() => inflateRaw(distance)).toThrow("The deflate stream is corrupt: a distance reaches before the start");
    });
});

describe("inflateRaw and streams cut short", () => {
    it("should refuse a stream that ends inside a block's header, a stored block's lengths or its data", () => {
        // Arrange
        const inHeader = Uint8Array.of(5);
        const inStoredLengths = Uint8Array.of(1, 5);
        const inStoredData = Uint8Array.of(1, 5, 0, 0xfa, 0xff, 65);

        // Act & Assert
        [inHeader, inStoredLengths, inStoredData].forEach((stream) => expect(() => inflateRaw(stream)).toThrow("The deflate stream ends in the middle of a block"));
    });
});

describe("inflateRaw and corrupt Huffman blocks", () => {
    const dynamicHeader = (codeLengthBits: [number, number, number, number]): BitWriter => {
        const writer = new BitWriter().write(1, 1).write(2, 2).write(0, 5).write(0, 5).write(0, 4);
        codeLengthBits.forEach((length) => writer.write(length, 3));
        return writer;
    };

    it("should refuse a code its table does not hold, a repeat before the first length, lengths past their count and a block without its end code", () => {
        // Arrange
        const unknownCode = dynamicHeader([0, 0, 1, 0]).write(1, 1).write(255, 8).done();
        const earlyRepeat = dynamicHeader([1, 0, 0, 0]).write(0, 1).write(255, 8).done();
        const pastCount = dynamicHeader([0, 0, 1, 0]).write(0, 1).write(127, 7).write(0, 1).write(127, 7).write(255, 8).done();
        const noEnd = dynamicHeader([0, 0, 1, 0]).write(0, 1).write(127, 7).write(0, 1).write(109, 7).write(255, 8).done();

        // Act & Assert
        expect(() => inflateRaw(unknownCode)).toThrow("The deflate stream is corrupt: a code names no symbol");
        expect(() => inflateRaw(earlyRepeat)).toThrow("The deflate stream is corrupt: a code length repeats before the first");
        expect(() => inflateRaw(pastCount)).toThrow("The deflate stream is corrupt: code lengths run past their count");
        expect(() => inflateRaw(noEnd)).toThrow("The deflate stream is corrupt: a block has no end-of-block code");
    });

    it("should refuse the length and distance codes the fixed code reserves", () => {
        // Arrange
        const length = new BitWriter().write(1, 1).write(1, 2).code(0b11000110, 8).write(255, 8).done();
        const distance = new BitWriter().write(1, 1).write(1, 2).code(0b00110001, 8).code(1, 7).code(30, 5).write(255, 8).done();

        // Act & Assert
        expect(() => inflateRaw(length)).toThrow("The deflate stream is corrupt: a length code is out of range");
        expect(() => inflateRaw(distance)).toThrow("The deflate stream is corrupt: a distance code is out of range");
    });
});

describe("huffmanTable", () => {
    it("should give each symbol its canonical code, looked up by the code's bits as the stream sends them", () => {
        // Act
        const table = huffmanTable([2, 1, 3, 3]);

        // Assert
        expect(table.bits).toBe(3);
        expect(Array.from(table.entries).map((entry) => [entry >> 4, entry & 15])).toEqual([[1, 1], [0, 2], [1, 1], [2, 3], [1, 1], [0, 2], [1, 1], [3, 3]]);
    });

    it("should refuse code lengths that over-subscribe the code", () => {
        // Act & Assert
        expect(() => huffmanTable([1, 1, 1])).toThrow("The deflate stream is corrupt: a Huffman code is over-subscribed");
    });

    it("should set aside no more than the data can inflate to, and still grow to the size expected", () => {
        // Arrange
        const zeros = new Uint8Array(3_000_000);
        const packed = new Uint8Array(deflateRawSync(zeros, { level: constants.Z_BEST_COMPRESSION }));

        // Act
        const inflated = inflateRaw(packed, zeros.length);
        const refused = (): Uint8Array => inflateRaw(packed, 4_000_000_000);

        // Assert
        expect(inflated.length).toBe(zeros.length);
        expect(inflated.some((byte) => byte !== 0)).toBe(false);
        expect(refused).toThrow("The deflate stream holds 3000000 bytes, not the 4000000000 expected");
    });
});
