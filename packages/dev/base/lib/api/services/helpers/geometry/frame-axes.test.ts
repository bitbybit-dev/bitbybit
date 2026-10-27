import { describe, it, expect } from "vitest";
import { axesAlong, axesToMatrix, composeAxes, isFrameShaped, isTriple, PARALLEL_SINE, pointToLocal, pointToWorld, relativeAxes, squareFrame, unitOf, vectorToLocal, vectorToWorld, WORLD_AXES } from "./frame-axes";
import type { FrameAxes } from "./frame-axes";
import type * as Inputs from "../../../inputs";

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

        it("should divide by the largest component first and then by the length, to these exact bits", () => {
            // Act
            const units = [unitOf([-7, -5, 4]), unitOf([3, 4, 12]), unitOf([1e300, -1e300, 5e299]), unitOf([1e-300, 2e-300, 2e-300]), unitOf([Infinity, 0, 0]), unitOf([Number.NaN, 1, 0])];

            // Assert
            expect(units).toEqual([
                [-0.7378647873726218, -0.5270462766947299, 0.42163702135578385],
                [0.23076923076923078, 0.3076923076923077, 0.9230769230769231],
                [0.6666666666666666, -0.6666666666666666, 0.3333333333333333],
                [0.3333333333333333, 0.6666666666666666, 0.6666666666666666],
                undefined,
                undefined,
            ]);
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

    describe("axesAlong", () => {
        it.each<[string, Vec3]>([
            ["up Y", [0, 3, 0]],
            ["down Z", [0, 0, -1]],
            ["along X", [2, 0, 0]],
            ["leaning every way", [1, -2, 0.5]],
        ])("should give unit axes at right angles with Z along a normal %s", (_name, normal) => {
            // Act
            const axes = axesAlong([1, 2, 3], normal)!;

            // Assert
            const length = Math.hypot(...normal);
            expect(axes.origin).toEqual([1, 2, 3]);
            axes.z.forEach((value, at) => expect(value).toBeCloseTo(normal[at]! / length, 15));
            expect(Math.abs(dotOf(axes.x, axes.z))).toBeLessThan(1e-15);
            expect(Math.hypot(...axes.x)).toBeCloseTo(1, 15);
            crossOf(axes.z, axes.x).forEach((value, at) => expect(axes.y[at]).toBeCloseTo(value, 15));
        });

        it("should take X from the world axis least aligned with the normal", () => {
            // Act
            const up = axesAlong([0, 0, 0], [0, 1, 0])!;
            const mostlyX = axesAlong([0, 0, 0], [5, 1, 0.5])!;

            // Assert
            expect(up.x).toEqual([1, 0, 0]);
            expect(Math.abs(mostlyX.x[2])).toBeGreaterThan(0.99);
        });

        it("should give nothing for a normal of no length", () => {
            // Act
            const nothing = axesAlong([0, 0, 0], [0, 0, 0]);

            // Assert
            expect(nothing).toBeUndefined();
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

    describe("moving between a frame and the world", () => {
        const turned: FrameAxes = { origin: [1000, 2000, 300], x: [0, 1, 0], y: [-1, 0, 0], z: [0, 0, 1] };

        it("should place a local point in the world and read it back", () => {
            // Act
            const world = pointToWorld(turned, [100, 50, 10]);
            const local = pointToLocal(turned, world);

            // Assert
            expect(world).toEqual([950, 2100, 310]);
            expect(local).toEqual([100, 50, 10]);
        });

        it("should turn a vector without moving it", () => {
            // Act
            const world = vectorToWorld(turned, [1, 0, 0]);
            const local = vectorToLocal(turned, world);

            // Assert
            expect(world).toEqual([0, 1, 0]);
            expect(local).toEqual([1, 0, 0]);
        });

        it("should place a frame inside another and take it back out", () => {
            // Arrange
            const inner: FrameAxes = { origin: [10, 0, 0], x: [0, 1, 0], y: [-1, 0, 0], z: [0, 0, 1] };

            // Act
            const placed = composeAxes(turned, inner);
            const back = relativeAxes(turned, placed);

            // Assert
            expect(placed).toEqual({ origin: [1000, 2010, 300], x: [-1, 0, 0], y: [0, -1, 0], z: [0, 0, 1] });
            expect(back).toEqual(inner);
        });

        it("should leave a frame as it is when it is placed in the world frame", () => {
            // Act
            const placed = composeAxes(WORLD_AXES, turned);

            // Assert
            expect(placed).toEqual(turned);
        });

        it("should write a frame as a column-major matrix with the origin last", () => {
            // Act
            const matrix = axesToMatrix(turned);

            // Assert
            expect(matrix).toEqual([0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 1, 0, 1000, 2000, 300, 1]);
        });
    });
});
