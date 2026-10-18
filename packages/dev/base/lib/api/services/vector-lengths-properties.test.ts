import { describe, expect, it } from "vitest";
import fc from "fast-check";
import type * as Inputs from "../inputs";
import { BaseBitByBit } from "./base-bitbybit";
import { unitOf } from "./helpers/geometry/frame-axes";
import { length2, length3, unit2Of } from "./helpers/geometry/vectors";

type Vec = Inputs.Base.Vector3;

const base = new BaseBitByBit();
const SEED = 20261018;
const RUNS = 500;

const component = fc.oneof(
    fc.double({ min: -1e3, max: 1e3, noNaN: true }),
    fc.integer({ min: -100, max: 100 }).chain(exponent => fc.double({ min: -1, max: 1, noNaN: true }).map(share => share * 10 ** exponent)),
    fc.constantFrom(0, -0, 1, -1, 3, 4, 1e-300, 1e100),
);
const vector: fc.Arbitrary<Vec> = fc.tuple(component, component, component);
const plan = fc.tuple(component, component);

const sumOfSquares = (v: readonly number[]): number => Math.sqrt(v.reduce((sum, value) => sum + value * value, 0));

const largestFirst = (v: Vec): Vec | undefined => {
    const largest = Math.max(Math.abs(v[0]), Math.abs(v[1]), Math.abs(v[2]));
    if (!(largest > 0 && largest < Infinity)) {
        return undefined;
    }
    const scaled: Vec = [v[0] / largest, v[1] / largest, v[2] / largest];
    const length = Math.hypot(scaled[0], scaled[1], scaled[2]);
    return [scaled[0] / length, scaled[1] / length, scaled[2] / length];
};

describe("lengths and directions to the same bits everywhere", () => {
    it("should measure one vector to the same bits through every service and helper that measures it, the square root of the sum of the squares", () => {
        // Act & Assert
        fc.assert(fc.property(vector, (v) => {
            const expected = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
            const zero: Vec = [0, 0, 0];
            expect(length3(v)).toBe(expected);
            expect(base.point.distance({ startPoint: zero, endPoint: v })).toBe(expected);
            expect(base.polyline.length({ polyline: { points: [zero, v] } })).toBe(expected);
            expect(base.vector.length({ vector: v })).toBe(expected);
            expect(base.vector.norm({ vector: v })).toBe(expected);
            expect(base.vector.dist({ first: zero, second: v })).toBe(expected);
        }), { seed: SEED, numRuns: RUNS });
    });

    it("should measure the distance between two points to the same bits whichever service measures it and whichever point comes first", () => {
        // Act & Assert
        fc.assert(fc.property(vector, vector, (a, b) => {
            const expected = sumOfSquares([b[0] - a[0], b[1] - a[1], b[2] - a[2]]);
            expect(base.point.distance({ startPoint: a, endPoint: b })).toBe(expected);
            expect(base.point.distance({ startPoint: b, endPoint: a })).toBe(expected);
            expect(base.vector.dist({ first: a, second: b })).toBe(expected);
            expect(base.polyline.length({ polyline: { points: [a, b] } })).toBe(expected);
        }), { seed: SEED, numRuns: RUNS });
    });

    it("should measure a plan vector as the square root of the sum of its squares", () => {
        // Act & Assert
        fc.assert(fc.property(plan, ([x, y]) => {
            expect(length2([x, y])).toBe(Math.sqrt(x * x + y * y));
        }), { seed: SEED, numRuns: RUNS });
    });

    it("should scale a vector to length 1 by its largest component first, to the bits that formula gives, however long or short it is", () => {
        // Act & Assert
        fc.assert(fc.property(vector, (v) => {
            const unit = unitOf(v);
            expect(unit).toEqual(largestFirst(v));
            if (unit !== undefined) {
                expect(Math.abs(Math.hypot(...unit) - 1)).toBeLessThanOrEqual(4 * Number.EPSILON);
            }
        }), { seed: SEED, numRuns: RUNS });
    });

    it("should give the same direction to the bit for a vector scaled by any power of two that stays finite", () => {
        // Act & Assert
        fc.assert(fc.property(vector, fc.integer({ min: -300, max: 300 }), (v, exponent) => {
            const scale = 2 ** exponent;
            const scaled: Vec = [v[0] * scale, v[1] * scale, v[2] * scale];
            fc.pre(scaled.every(Number.isFinite) && scaled.every((value, axis) => value / scale === v[axis]));
            expect(unitOf(scaled)).toEqual(unitOf(v));
        }), { seed: SEED, numRuns: RUNS });
    });

    it("should scale a plan direction to the same bits as the same direction lying in space", () => {
        // Act & Assert
        fc.assert(fc.property(plan, ([x, y]) => {
            const spatial = unitOf([x, y, 0]);
            expect(unit2Of([x, y])).toEqual(spatial === undefined ? undefined : [spatial[0], spatial[1]]);
        }), { seed: SEED, numRuns: RUNS });
    });

    it("should normalise a vector through the service to the helper's bits, and give nothing for one shorter than 1e-8", () => {
        // Act & Assert
        fc.assert(fc.property(vector, (v) => {
            const normalised = base.vector.normalized({ vector: v });
            const expected = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]) > 1e-8 ? unitOf(v) : undefined;
            expect(normalised).toEqual(expected);
        }), { seed: SEED, numRuns: RUNS });
    });
});
