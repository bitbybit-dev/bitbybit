import { describe, it, expect } from "vitest";
import { isFrameShaped, isTriple, PARALLEL_SINE, squareFrame, unitOf } from "./frame-axes";
import type * as Inputs from "../../inputs";

type Vec3 = Inputs.Base.Vector3;

const dotOf = (a: readonly number[], b: readonly number[]): number => a[0]! * b[0]! + a[1]! * b[1]! + a[2]! * b[2]!;
const crossOf = (a: readonly number[], b: readonly number[]): Vec3 => [a[1]! * b[2]! - a[2]! * b[1]!, a[2]! * b[0]! - a[0]! * b[2]!, a[0]! * b[1]! - a[1]! * b[0]!];

const leaningOff = (sine: number): Vec3 => [sine, 0, Math.sqrt(1 - sine * sine)];

describe("frame axes", () => {

    describe("unitOf", () => {
        it.each([1e-300, 1, 1e300])("should scale a vector of size %s to length 1", (size) => {
            // Act
            const unit = unitOf([3 * size, 4 * size, 0]);

            // Assert
            expect(unit![0]).toBeCloseTo(0.6, 15);
            expect(unit![1]).toBeCloseTo(0.8, 15);
            expect(unit![2]).toBe(0);
        });

        it("should give nothing for a vector of no length", () => {
            // Act
            const unit = unitOf([0, 0, 0]);

            // Assert
            expect(unit).toBeUndefined();
        });
    });

    describe("squareFrame", () => {
        it("should give unit axes at right angles, the Y axis the normal crossed with the direction", () => {
            // Act
            const axes = squareFrame([1, 2, 3], [0, 0, 7], [2, 2, 5]);

            // Assert
            expect(axes).not.toBeTypeOf("string");
            const { origin, x, y, z } = axes as Exclude<ReturnType<typeof squareFrame>, string>;
            expect(origin).toEqual([1, 2, 3]);
            expect(z).toEqual([0, 0, 1]);
            expect(x[0]).toBeCloseTo(Math.SQRT1_2, 15);
            expect(x[1]).toBeCloseTo(Math.SQRT1_2, 15);
            expect(x[2]).toBe(0);
            crossOf(z, x).forEach((value, i) => expect(y[i]).toBeCloseTo(value, 15));
        });

        it("should name the normal when it has no length", () => {
            // Act
            const fault = squareFrame([0, 0, 0], [0, 0, 0], [1, 0, 0]);

            // Assert
            expect(fault).toBe("normal");
        });

        it.each([
            { direction: [0, 0, 0] as Vec3, reason: "no length" },
            { direction: [0, 0, -3] as Vec3, reason: "the normal's line" },
            { direction: leaningOff(PARALLEL_SINE / 2), reason: "half the parallel limit off the normal" },
        ])("should name the direction when it has $reason", ({ direction }) => {
            // Act
            const fault = squareFrame([0, 0, 0], [0, 0, 1], direction);

            // Assert
            expect(fault).toBe("direction");
        });

        it("should square a direction twice the parallel limit off the normal to full precision", () => {
            // Act
            const axes = squareFrame([0, 0, 0], [0, 0, 1], leaningOff(2 * PARALLEL_SINE));

            // Assert
            expect(axes).not.toBeTypeOf("string");
            const { x, z } = axes as Exclude<ReturnType<typeof squareFrame>, string>;
            expect(Math.abs(dotOf(x, z))).toBeLessThan(1e-15);
            expect(x[0]).toBeCloseTo(1, 12);
        });
    });

    describe("isTriple and isFrameShaped", () => {
        it.each([
            { value: [1, 2, 3], expected: true },
            { value: [1, 2], expected: false },
            { value: [1, 2, Number.NaN], expected: false },
            { value: [1, 2, Number.POSITIVE_INFINITY], expected: false },
            { value: ["1", 2, 3], expected: false },
            { value: { 0: 1, 1: 2, 2: 3, length: 3 }, expected: false },
        ])("should say $expected for $value", ({ value, expected }) => {
            // Act
            const triple = isTriple(value);

            // Assert
            expect(triple).toBe(expected);
        });

        it("should accept an object with an origin, a normal and a direction, whatever else it carries", () => {
            // Act
            const shaped = isFrameShaped({ origin: [0, 0, 0], normal: [0, 0, 1], direction: [1, 0, 0], name: "top" });

            // Assert
            expect(shaped).toBe(true);
        });

        it.each([
            { value: null, reason: "null" },
            { value: "frame", reason: "text" },
            { value: [[0, 0, 0], [0, 0, 1], [1, 0, 0]], reason: "a list of three points" },
            { value: { origin: [0, 0, 0], normal: [0, 0, 1] }, reason: "no direction" },
            { value: { origin: [0, 0, 0], normal: [0, 0, 1], direction: [1, 0] }, reason: "a direction of two numbers" },
        ])("should refuse $reason", ({ value }) => {
            // Act
            const shaped = isFrameShaped(value);

            // Assert
            expect(shaped).toBe(false);
        });
    });
});
