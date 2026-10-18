import type { HuffmanTable } from "../helper-types";
import {
    BLOCK_TYPE_BITS,
    BYTE_BITS,
    CODE_LENGTH_BITS,
    CODE_LENGTH_ORDER,
    CODE_LENGTH_SYMBOLS,
    DISTANCE_BASE,
    DISTANCE_EXTRA,
    DISTANCE_SYMBOLS,
    DYNAMIC_BLOCK,
    END_OF_BLOCK,
    FIRST_LENGTH_SYMBOL,
    FIXED_BLOCK,
    FIXED_DISTANCE_BITS,
    FIXED_LITERAL_BITS,
    FIXED_LITERAL_ENDS,
    HCLEN_BASE,
    HCLEN_BITS,
    HDIST_BASE,
    HDIST_BITS,
    HLIT_BASE,
    HLIT_BITS,
    INITIAL_OUTPUT,
    LENGTH_BASE,
    LENGTH_EXTRA,
    LENGTH_MASK,
    LITERAL_LENGTH_SYMBOLS,
    MAX_CODE_BITS,
    REFILL_BELOW,
    REPEAT_PREVIOUS,
    REPEAT_PREVIOUS_BASE,
    REPEAT_PREVIOUS_BITS,
    REPEAT_ZERO_LONG_BASE,
    REPEAT_ZERO_LONG_BITS,
    REPEAT_ZERO_SHORT,
    REPEAT_ZERO_SHORT_BASE,
    REPEAT_ZERO_SHORT_BITS,
    STORED_BLOCK,
    STORED_HEADER_BYTES,
    STORED_LENGTH_BYTES,
    SYMBOL_SHIFT,
    UINT16_MASK,
} from "./inflate.constants";

function reversed(code: number, bits: number): number {
    let result = 0;
    for (let bit = 0; bit < bits; bit++) {
        result = (result << 1) | ((code >>> bit) & 1);
    }
    return result;
}

export function huffmanTable(lengths: ArrayLike<number>): HuffmanTable {
    const counts = new Uint16Array(MAX_CODE_BITS + 1);
    let longest = 0;
    for (let symbol = 0; symbol < lengths.length; symbol++) {
        const length = lengths[symbol]!;
        counts[length]!++;
        longest = Math.max(longest, length);
    }
    counts[0] = 0;
    const next = new Uint16Array(MAX_CODE_BITS + 1);
    let code = 0;
    for (let bits = 1; bits <= MAX_CODE_BITS; bits++) {
        code = (code + counts[bits - 1]!) << 1;
        next[bits] = code;
        if (code + counts[bits]! > 1 << bits) {
            throw new Error("The deflate stream is corrupt: a Huffman code is over-subscribed");
        }
    }
    const entries = new Int32Array(1 << longest);
    for (let symbol = 0; symbol < lengths.length; symbol++) {
        const length = lengths[symbol]!;
        if (length) {
            for (let slot = reversed(next[length]!++, length); slot < entries.length; slot += 1 << length) {
                entries[slot] = (symbol << SYMBOL_SHIFT) | length;
            }
        }
    }
    return { entries, bits: longest };
}

function fixedLiteralLengths(): Uint8Array {
    const lengths = new Uint8Array(LITERAL_LENGTH_SYMBOLS);
    let start = 0;
    FIXED_LITERAL_ENDS.forEach((end, range) => {
        lengths.fill(FIXED_LITERAL_BITS[range]!, start, end);
        start = end;
    });
    return lengths;
}

let fixedTables: readonly [HuffmanTable, HuffmanTable] | undefined;

function fixed(): readonly [HuffmanTable, HuffmanTable] {
    fixedTables ??= [huffmanTable(fixedLiteralLengths()), huffmanTable(new Uint8Array(DISTANCE_SYMBOLS).fill(FIXED_DISTANCE_BITS))];
    return fixedTables;
}

class Inflater {
    private at = 0;
    private bitBuffer = 0;
    private bitCount = 0;
    private output: Uint8Array;
    private size = 0;

    constructor(private readonly data: Uint8Array, private readonly expected: number | undefined) {
        this.output = new Uint8Array(expected ?? Math.max(INITIAL_OUTPUT, data.length * 2));
    }

    run(): Uint8Array {
        let last = 0;
        while (!last) {
            last = this.bits(1);
            const type = this.bits(BLOCK_TYPE_BITS);
            if (type === STORED_BLOCK) {
                this.stored();
            } else if (type === FIXED_BLOCK) {
                const [literals, distances] = fixed();
                this.compressed(literals, distances);
            } else if (type === DYNAMIC_BLOCK) {
                const [literals, distances] = this.dynamicTables();
                this.compressed(literals, distances);
            } else {
                throw new Error("The deflate stream is corrupt: a block has the reserved type 3");
            }
        }
        if (this.expected !== undefined && this.size !== this.expected) {
            throw new Error(`The deflate stream holds ${this.size} bytes, not the ${this.expected} expected`);
        }
        return this.size === this.output.length ? this.output : this.output.slice(0, this.size);
    }

    private fill(count: number): void {
        while (this.bitCount < count) {
            if (this.at >= this.data.length) {
                throw new Error("The deflate stream ends in the middle of a block");
            }
            this.bitBuffer |= this.data[this.at++]! << this.bitCount;
            this.bitCount += BYTE_BITS;
        }
    }

    private bits(count: number): number {
        if (count === 0) {
            return 0;
        }
        this.fill(count);
        const value = this.bitBuffer & ((1 << count) - 1);
        this.bitBuffer >>>= count;
        this.bitCount -= count;
        return value;
    }

    private symbol(table: HuffmanTable): number {
        while (this.bitCount < table.bits && this.at < this.data.length && this.bitCount <= REFILL_BELOW) {
            this.bitBuffer |= this.data[this.at++]! << this.bitCount;
            this.bitCount += BYTE_BITS;
        }
        const entry = table.entries[this.bitBuffer & ((1 << table.bits) - 1)]!;
        const length = entry & LENGTH_MASK;
        if (entry === 0 || length > this.bitCount) {
            throw new Error(this.bitCount < table.bits && this.at >= this.data.length ? "The deflate stream ends in the middle of a block" : "The deflate stream is corrupt: a code names no symbol");
        }
        this.bitBuffer >>>= length;
        this.bitCount -= length;
        return entry >> SYMBOL_SHIFT;
    }

    private room(count: number): void {
        if (this.size + count <= this.output.length) {
            return;
        }
        if (this.expected !== undefined) {
            throw new Error(`The deflate stream holds more than the ${this.expected} bytes expected`);
        }
        const grown = new Uint8Array(Math.max(this.output.length * 2, this.size + count));
        grown.set(this.output.subarray(0, this.size));
        this.output = grown;
    }

    private stored(): void {
        this.bitBuffer >>>= this.bitCount % BYTE_BITS;
        this.bitCount -= this.bitCount % BYTE_BITS;
        this.at -= this.bitCount / BYTE_BITS;
        this.bitBuffer = 0;
        this.bitCount = 0;
        if (this.at + STORED_HEADER_BYTES > this.data.length) {
            throw new Error("The deflate stream ends in the middle of a block");
        }
        const length = this.uint16(this.at);
        const complement = this.uint16(this.at + STORED_LENGTH_BYTES);
        if ((length ^ UINT16_MASK) !== complement) {
            throw new Error("The deflate stream is corrupt: a stored block's length fails its check");
        }
        this.at += STORED_HEADER_BYTES;
        if (this.at + length > this.data.length) {
            throw new Error("The deflate stream ends in the middle of a block");
        }
        this.room(length);
        this.output.set(this.data.subarray(this.at, this.at + length), this.size);
        this.size += length;
        this.at += length;
    }

    private uint16(at: number): number {
        return this.data[at]! | (this.data[at + 1]! << BYTE_BITS);
    }

    private dynamicTables(): readonly [HuffmanTable, HuffmanTable] {
        const literalCount = this.bits(HLIT_BITS) + HLIT_BASE;
        const distanceCount = this.bits(HDIST_BITS) + HDIST_BASE;
        const codeLengthCount = this.bits(HCLEN_BITS) + HCLEN_BASE;
        const codeLengthLengths = new Uint8Array(CODE_LENGTH_SYMBOLS);
        for (let at = 0; at < codeLengthCount; at++) {
            codeLengthLengths[CODE_LENGTH_ORDER[at]!] = this.bits(CODE_LENGTH_BITS);
        }
        const codeLengths = huffmanTable(codeLengthLengths);
        const lengths = new Uint8Array(literalCount + distanceCount);
        for (let at = 0; at < lengths.length;) {
            const symbol = this.symbol(codeLengths);
            if (symbol < REPEAT_PREVIOUS) {
                lengths[at++] = symbol;
                continue;
            }
            if (symbol === REPEAT_PREVIOUS && at === 0) {
                throw new Error("The deflate stream is corrupt: a code length repeats before the first");
            }
            const value = symbol === REPEAT_PREVIOUS ? lengths[at - 1]! : 0;
            const repeat = symbol === REPEAT_PREVIOUS ? this.bits(REPEAT_PREVIOUS_BITS) + REPEAT_PREVIOUS_BASE
                : symbol === REPEAT_ZERO_SHORT ? this.bits(REPEAT_ZERO_SHORT_BITS) + REPEAT_ZERO_SHORT_BASE
                    : this.bits(REPEAT_ZERO_LONG_BITS) + REPEAT_ZERO_LONG_BASE;
            if (at + repeat > lengths.length) {
                throw new Error("The deflate stream is corrupt: code lengths run past their count");
            }
            lengths.fill(value, at, at + repeat);
            at += repeat;
        }
        if (lengths[END_OF_BLOCK] === 0) {
            throw new Error("The deflate stream is corrupt: a block has no end-of-block code");
        }
        return [huffmanTable(lengths.subarray(0, literalCount)), huffmanTable(lengths.subarray(literalCount))];
    }

    private compressed(literals: HuffmanTable, distances: HuffmanTable): void {
        for (;;) {
            const symbol = this.symbol(literals);
            if (symbol < END_OF_BLOCK) {
                this.room(1);
                this.output[this.size++] = symbol;
                continue;
            }
            if (symbol === END_OF_BLOCK) {
                return;
            }
            const lengthCode = symbol - FIRST_LENGTH_SYMBOL;
            if (lengthCode >= LENGTH_BASE.length) {
                throw new Error("The deflate stream is corrupt: a length code is out of range");
            }
            const length = LENGTH_BASE[lengthCode]! + this.bits(LENGTH_EXTRA[lengthCode]!);
            const distanceCode = this.symbol(distances);
            if (distanceCode >= DISTANCE_BASE.length) {
                throw new Error("The deflate stream is corrupt: a distance code is out of range");
            }
            const distance = DISTANCE_BASE[distanceCode]! + this.bits(DISTANCE_EXTRA[distanceCode]!);
            if (distance > this.size) {
                throw new Error("The deflate stream is corrupt: a distance reaches before the start");
            }
            this.room(length);
            const output = this.output;
            let from = this.size - distance;
            const end = this.size + length;
            for (let to = this.size; to < end; to++) {
                output[to] = output[from++]!;
            }
            this.size = end;
        }
    }
}

export function inflateRaw(data: Uint8Array, expectedSize?: number): Uint8Array {
    return new Inflater(data, expectedSize).run();
}
