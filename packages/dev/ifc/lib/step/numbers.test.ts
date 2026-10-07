import { describe, expect, it } from "vitest";
import { exactDecimal, formatInteger, formatReal } from "./numbers";

describe("formatReal", () => {
    it("should write a whole number with a trailing decimal point", () => {
        // Act
        const text = formatReal(100);

        // Assert
        expect(text).toBe("100.");
    });

    it("should write a fraction as JavaScript does", () => {
        // Act
        const text = formatReal(-0.25);

        // Assert
        expect(text).toBe("-0.25");
    });

    it("should write an exponent with an upper case E and a decimal point in the mantissa", () => {
        // Act
        const texts = [1e-7, 1.5e21, -2e-9].map(formatReal);

        // Assert
        expect(texts).toEqual(["1.E-7", "1.5E21", "-2.E-9"]);
    });

    it("should write negative zero as zero", () => {
        // Act
        const text = formatReal(-0);

        // Assert
        expect(text).toBe("0.");
    });

    it("should read back exactly what it writes", () => {
        // Arrange
        const values = [Math.PI, 1 / 3, 123456789.12345679, 5e-324, 1.7976931348623157e308];

        // Act
        const back = values.map((value) => Number(formatReal(value)));

        // Assert
        expect(back).toEqual(values);
    });

    it("should refuse a value that is not finite", () => {
        // Act & Assert
        expect(() => formatReal(Number.NaN)).toThrow(RangeError);
        expect(() => formatReal(Infinity)).toThrow(RangeError);
    });
});

describe("formatInteger", () => {
    it("should write a whole number without a decimal point", () => {
        // Act
        const text = formatInteger(-42);

        // Assert
        expect(text).toBe("-42");
    });

    it("should refuse a fraction and a number beyond the safe range", () => {
        // Act & Assert
        expect(() => formatInteger(1.5)).toThrow(RangeError);
        expect(() => formatInteger(2 ** 60)).toThrow(RangeError);
    });
});

function bytesOf(text: string): Uint8Array {
    return new TextEncoder().encode(text);
}

function seeded(seed: number): () => number {
    let state = seed;
    return () => {
        state = (state * 1664525 + 1013904223) % 4294967296;
        return state / 4294967296;
    };
}

describe("exactDecimal", () => {
    it("should read the numbers files write as Number reads them, negative zero included", () => {
        // Arrange
        const texts = ["0.", "1.", "-1.", "+2.5", "12", "0.1", "0.3", "2438.4", "-0.", "1.E5", "1.5E-3", "4.5217856E-15", "0.707106781186548", "123456789012345", "1e22", "1E-22", ".5", "5.e+2"];

        // Act
        const values = texts.map((text) => exactDecimal(bytesOf(text), 0, text.length));

        // Assert
        values.forEach((value, at) => expect(Object.is(value, Number(texts[at]))).toBe(true));
    });

    it("should leave to Number what it cannot read exactly or that is malformed", () => {
        // Arrange
        const texts = ["1234567890123456", "0.70710678118654757", "4.52178564381239E-15", "1E23", "1E-23", "1E99999", "-", ".", "1.2.3", "1E", "1E+", "+.E5", ""];

        // Act
        const values = texts.map((text) => exactDecimal(bytesOf(text), 0, text.length));

        // Assert
        expect(values).toEqual(texts.map(() => undefined));
    });

    it("should agree with Number on every one of many random decimals it reads", () => {
        // Arrange
        const random = seeded(11);
        const texts = Array.from({ length: 20000 }, () => {
            const whole = String(Math.floor(random() * 10 ** Math.floor(random() * 9)));
            const fraction = String(Math.floor(random() * 10 ** Math.floor(random() * 9))).padStart(Math.floor(random() * 9), "0");
            const exponent = random() < 0.3 ? `E${random() < 0.5 ? "-" : ""}${Math.floor(random() * 25)}` : "";
            return `${random() < 0.5 ? "-" : ""}${whole}.${fraction}${exponent}`;
        });

        // Act
        const mismatches = texts.filter((text) => {
            const value = exactDecimal(bytesOf(text), 0, text.length);
            return value !== undefined && !Object.is(value, Number(text));
        });

        // Assert
        expect(mismatches).toEqual([]);
    });

    it("should read only the span it is given", () => {
        // Arrange
        const bytes = bytesOf("(12.5,3.)");

        // Act
        const value = exactDecimal(bytes, 1, 5);

        // Assert
        expect(value).toBe(12.5);
    });
});
