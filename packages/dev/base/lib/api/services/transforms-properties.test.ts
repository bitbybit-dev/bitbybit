import { describe, expect, it } from "vitest";
import fc from "fast-check";
import type * as Inputs from "../inputs";
import { InputError } from "../kernel-calls";
import { BaseBitByBit } from "./base-bitbybit";

type Vec = Inputs.Base.Vector3;
type Matrix = Inputs.Base.TransformMatrix;

interface Step {
    matrices: Matrix[];
    rigid: boolean;
    determinant: number;
}

const base = new BaseBitByBit();
const SEED = 20261018;
const RUNS = 200;
const IDENTITY: Matrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

const product = (first: readonly number[], second: readonly number[]): Matrix => Array.from({ length: 16 }, (_, index) => {
    const column = Math.floor(index / 4);
    const row = index % 4;
    let sum = 0;
    for (let k = 0; k < 4; k++) {
        sum += second[k * 4 + row]! * first[column * 4 + k]!;
    }
    return sum;
}) as Matrix;

const applied = (matrix: readonly number[], point: Vec): Vec => [0, 1, 2].map(row =>
    matrix[row]! * point[0] + matrix[4 + row]! * point[1] + matrix[8 + row]! * point[2] + matrix[12 + row]!) as Vec;

const determinant3 = (m: readonly number[]): number =>
    m[0]! * (m[5]! * m[10]! - m[6]! * m[9]!) - m[4]! * (m[1]! * m[10]! - m[2]! * m[9]!) + m[8]! * (m[1]! * m[6]! - m[2]! * m[5]!);

const largestDifference = (a: readonly number[], b: readonly number[]): number => a.reduce((largest, value, index) => Math.max(largest, Math.abs(value - b[index]!)), 0);

const reachOf = (matrices: readonly (readonly number[])[]): number => matrices.reduce((largest, matrix) => Math.max(largest, ...matrix.map(Math.abs)), 1);

const coordinate = fc.double({ min: -1e3, max: 1e3, noNaN: true });
const point = fc.tuple(coordinate, coordinate, coordinate);
const axis = fc.tuple(fc.double({ min: -1, max: 1, noNaN: true }), fc.double({ min: -1, max: 1, noNaN: true }), fc.double({ min: -1, max: 1, noNaN: true }))
    .filter(vector => Math.hypot(...vector) > 0.1);
const angle = fc.oneof(fc.double({ min: -720, max: 720, noNaN: true }), fc.constantFrom(0, 90, 180, -90, 270, 360, 1e-9));
const factor = fc.oneof(fc.double({ min: 0.1, max: 10, noNaN: true }), fc.constantFrom(1e-6, 1e6, 1));

const rigidStep: fc.Arbitrary<Step> = fc.oneof(
    fc.record({ center: point, axis, angle }).map(({ center, axis: around, angle: degrees }) => ({ matrices: base.transforms.rotationCenterAxis({ center, axis: around, angle: degrees }), rigid: true, determinant: 1 })),
    fc.record({ center: point, angle }).map(({ center, angle: degrees }) => ({ matrices: base.transforms.rotationCenterX({ center, angle: degrees }), rigid: true, determinant: 1 })),
    fc.record({ center: point, yaw: angle, pitch: angle, roll: angle }).map(({ center, yaw, pitch, roll }) => ({ matrices: base.transforms.rotationCenterYawPitchRoll({ center, yaw, pitch, roll }), rigid: true, determinant: 1 })),
    point.map(translation => ({ matrices: base.transforms.translationXYZ({ translation }), rigid: true, determinant: 1 })),
);

const anyStep: fc.Arbitrary<Step> = fc.oneof(
    rigidStep,
    fc.tuple(factor, factor, factor, fc.constantFrom(1, -1)).map(([x, y, z, mirror]) => ({ matrices: base.transforms.scaleXYZ({ scaleXyz: [x * mirror, y, z] }), rigid: false, determinant: x * mirror * y * z })),
    fc.record({ center: point, scale: factor }).map(({ center, scale }) => ({ matrices: base.transforms.uniformScaleFromCenter({ center, scale }), rigid: scale === 1, determinant: scale ** 3 })),
    fc.record({ center: point, direction: axis, scale: factor }).map(({ center, direction, scale }) => ({ matrices: base.transforms.stretchDirFromCenter({ center, direction, scale }), rigid: scale === 1, determinant: scale })),
);

const listOf = (steps: fc.Arbitrary<Step>): fc.Arbitrary<Step[]> => fc.array(steps, { minLength: 1, maxLength: 6 });
const flat = (steps: readonly Step[]): Matrix[] => steps.flatMap(step => step.matrices);

describe("transforms against independent oracles", () => {
    describe("combine", () => {
        it("should move a point as the matrices do one after the other, first to last", () => {
            // Act & Assert
            fc.assert(fc.property(listOf(anyStep), point, (steps, start) => {
                const matrices = flat(steps);
                const [combined] = base.transforms.combine({ transformation: matrices });
                const oneByOne = matrices.reduce<Vec>((moved, matrix) => applied(matrix, moved), start);
                const scale = matrices.reduce((size, matrix) => size * Math.max(1, ...matrix.map(Math.abs)), Math.max(1, ...start.map(Math.abs)));
                expect(largestDifference(applied(combined!, start), oneByOne)).toBeLessThanOrEqual(1e-12 * scale);
                expect(largestDifference(base.point.transformPoint({ point: start, transformation: [combined!] }), base.point.transformPoints({ points: [start], transformation: matrices })[0]!)).toBeLessThanOrEqual(1e-12 * scale);
            }), { seed: SEED, numRuns: RUNS });
        });

        it("should combine combined parts into what the whole list combines into, and take the list nested", () => {
            // Act & Assert
            fc.assert(fc.property(listOf(anyStep), listOf(anyStep), (first, second) => {
                const [whole] = base.transforms.combine({ transformation: [...flat(first), ...flat(second)] });
                const [parts] = base.transforms.combine({ transformation: [...base.transforms.combine({ transformation: flat(first) }), ...base.transforms.combine({ transformation: flat(second) })] });
                const nestedValue: unknown = [flat(first), flat(second)];
                const [nested] = base.transforms.combine({ transformation: nestedValue as Inputs.Base.TransformMatrixes });
                const scale = reachOf([...flat(first), ...flat(second)]) ** 4;
                expect(largestDifference(parts!, whole!)).toBeLessThanOrEqual(1e-12 * scale);
                expect(nested).toEqual(whole);
            }), { seed: SEED, numRuns: RUNS });
        });

        it("should multiply the matrices in the order the oracle does", () => {
            // Act & Assert
            fc.assert(fc.property(listOf(anyStep), (steps) => {
                const matrices = flat(steps);
                const [combined] = base.transforms.combine({ transformation: matrices });
                const expected = matrices.reduce<Matrix>((total, matrix) => product(total, matrix), [...IDENTITY]);
                expect(largestDifference(combined!, expected)).toBeLessThanOrEqual(1e-12 * reachOf(matrices) ** matrices.length);
            }), { seed: SEED, numRuns: RUNS });
        });
    });

    describe("determinant", () => {
        it("should give the product of the steps' volume factors: scales multiplied, a mirror -1 and a turn or a move 1", () => {
            // Act & Assert
            fc.assert(fc.property(listOf(anyStep), (steps) => {
                const expected = steps.reduce((total, step) => total * step.determinant, 1);
                const given = base.transforms.determinant({ transformation: flat(steps) });
                expect(Math.abs(given - expected)).toBeLessThanOrEqual(1e-10 * Math.max(1, Math.abs(expected)));
                expect(Math.abs(given - determinant3(base.transforms.combine({ transformation: flat(steps) })[0]!))).toBeLessThanOrEqual(1e-12 * Math.max(1, Math.abs(expected)));
            }), { seed: SEED, numRuns: RUNS });
        });
    });

    describe("rigidInverse and isRigid", () => {
        it("should call any chain of turns and moves rigid and undo it, the inverse after it leaving every point where it was", () => {
            // Act & Assert
            fc.assert(fc.property(listOf(rigidStep), point, (steps, start) => {
                const matrices = flat(steps);
                const [inverse] = base.transforms.rigidInverse({ transformation: matrices });
                const [roundTrip] = base.transforms.combine({ transformation: [...matrices, inverse!] });
                const reach = reachOf(matrices) * steps.length;
                expect(base.transforms.isRigid({ transformation: matrices })).toBe(true);
                expect(largestDifference(roundTrip!.slice(0, 12), IDENTITY.slice(0, 12))).toBeLessThanOrEqual(1e-13 * steps.length * 4);
                expect(largestDifference(roundTrip!.slice(12), IDENTITY.slice(12))).toBeLessThanOrEqual(1e-13 * reach * 4);
                expect(largestDifference(applied(roundTrip!, start), start)).toBeLessThanOrEqual(1e-12 * (reach + Math.max(...start.map(Math.abs))));
            }), { seed: SEED, numRuns: RUNS });
        });

        it("should refuse to undo any chain that scales, stretches or mirrors, and never call one rigid", () => {
            // Act & Assert
            fc.assert(fc.property(listOf(anyStep), (steps) => {
                const determinant = steps.reduce((total, step) => total * step.determinant, 1);
                fc.pre(Math.abs(Math.abs(determinant) - 1) > 1e-3 || determinant < 0);
                expect(base.transforms.isRigid({ transformation: flat(steps) })).toBe(false);
                expect(() => base.transforms.rigidInverse({ transformation: flat(steps) })).toThrow(InputError);
            }), { seed: SEED, numRuns: RUNS });
        });

        it("should hold an axis longer or shorter by three quarters of the tolerance rigid, and one off by one and a half times the tolerance not", () => {
            // Act & Assert
            fc.assert(fc.property(listOf(rigidStep), fc.double({ min: -6, max: -2, noNaN: true }), fc.integer({ min: 0, max: 2 }), fc.constantFrom(1, -1), (steps, exponent, column, sign) => {
                const tolerance = 10 ** exponent;
                const [matrix] = base.transforms.combine({ transformation: flat(steps) });
                const stretched = (share: number): Matrix => matrix!.map((value, index) => (index >= column * 4 && index < column * 4 + 3 ? value * (1 + sign * share * tolerance) : value)) as Matrix;
                expect(base.transforms.isRigid({ transformation: [stretched(0.75)], tolerance })).toBe(true);
                expect(base.transforms.isRigid({ transformation: [stretched(1.5)], tolerance })).toBe(false);
            }), { seed: SEED, numRuns: RUNS });
        });

        it("should hold two axes leaning toward each other by three quarters of the tolerance rigid, and by one and a half times it not", () => {
            // Act & Assert
            fc.assert(fc.property(listOf(rigidStep), fc.double({ min: -6, max: -2, noNaN: true }), (steps, exponent) => {
                const tolerance = 10 ** exponent;
                const [matrix] = base.transforms.combine({ transformation: flat(steps) });
                const leaned = (share: number): Matrix => {
                    const lean = share * tolerance;
                    const x = matrix!.slice(0, 3);
                    const y = matrix!.slice(4, 7);
                    const tilted = y.map((value, index) => value * Math.sqrt(1 - lean * lean) + x[index]! * lean);
                    return [...x, 0, ...tilted, 0, ...matrix!.slice(8)] as Matrix;
                };
                expect(base.transforms.isRigid({ transformation: [leaned(0.75)], tolerance })).toBe(true);
                expect(base.transforms.isRigid({ transformation: [leaned(1.5)], tolerance })).toBe(false);
            }), { seed: SEED, numRuns: RUNS });
        });

        it("should never call a mirrored chain of turns rigid, however small the tolerance is loosened", () => {
            // Act & Assert
            fc.assert(fc.property(listOf(rigidStep), fc.integer({ min: 0, max: 2 }), (steps, mirrored) => {
                const mirror = base.transforms.scaleXYZ({ scaleXyz: [mirrored === 0 ? -1 : 1, mirrored === 1 ? -1 : 1, mirrored === 2 ? -1 : 1] });
                expect(base.transforms.isRigid({ transformation: [...flat(steps), ...mirror], tolerance: 0.5 })).toBe(false);
            }), { seed: SEED, numRuns: RUNS });
        });

        it("should undo a placement millions of units out to the same millionths of a unit", () => {
            // Act & Assert
            fc.assert(fc.property(listOf(rigidStep), fc.tuple(fc.double({ min: 1e6, max: 1e7, noNaN: true }), fc.double({ min: -1e7, max: -1e6, noNaN: true }), fc.double({ min: -100, max: 100, noNaN: true })), point, (steps, far, start) => {
                const placement = [...flat(steps), ...base.transforms.translationXYZ({ translation: far })];
                const moved = base.point.transformPoint({ point: start, transformation: placement });
                const back = base.point.transformPoint({ point: moved, transformation: base.transforms.rigidInverse({ transformation: placement }) });
                expect(largestDifference(back, start)).toBeLessThanOrEqual(1e-6);
            }), { seed: SEED, numRuns: RUNS });
        });
    });

    describe("rotations about a centre", () => {
        it("should turn about the X, Y and Z axes as rotationCenterAxis does about [1, 0, 0], [0, 1, 0] and [0, 0, 1]", () => {
            // Act & Assert
            fc.assert(fc.property(point, angle, point, (center, degrees, start) => {
                const pairs = [
                    [base.transforms.rotationCenterX({ center, angle: degrees }), base.transforms.rotationCenterAxis({ center, axis: [1, 0, 0], angle: degrees })],
                    [base.transforms.rotationCenterY({ center, angle: degrees }), base.transforms.rotationCenterAxis({ center, axis: [0, 1, 0], angle: degrees })],
                    [base.transforms.rotationCenterZ({ center, angle: degrees }), base.transforms.rotationCenterAxis({ center, axis: [0, 0, 1], angle: degrees })],
                ];
                pairs.forEach(([named, general]) => {
                    const scale = Math.max(1, ...center.map(Math.abs), ...start.map(Math.abs));
                    expect(largestDifference(base.point.transformPoint({ point: start, transformation: named! }), base.point.transformPoint({ point: start, transformation: general! }))).toBeLessThanOrEqual(1e-12 * scale);
                });
            }), { seed: SEED, numRuns: RUNS });
        });

        it("should turn counter-clockwise seen from the tip of the axis, by the right-hand rule", () => {
            // Act & Assert
            fc.assert(fc.property(axis, fc.double({ min: 1, max: 179, noNaN: true }), (around, degrees) => {
                const length = Math.hypot(...around);
                const k: Vec = [around[0] / length, around[1] / length, around[2] / length];
                const helper: Vec = Math.abs(k[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];
                const across: Vec = [k[1] * helper[2] - k[2] * helper[1], k[2] * helper[0] - k[0] * helper[2], k[0] * helper[1] - k[1] * helper[0]];
                const moved = base.point.transformPoint({ point: across, transformation: base.transforms.rotationCenterAxis({ center: [0, 0, 0], axis: around, angle: degrees }) });
                const turnedBy: Vec = [across[1] * moved[2] - across[2] * moved[1], across[2] * moved[0] - across[0] * moved[2], across[0] * moved[1] - across[1] * moved[0]];
                expect(turnedBy[0] * k[0] + turnedBy[1] * k[1] + turnedBy[2] * k[2]).toBeGreaterThan(0);
            }), { seed: SEED, numRuns: RUNS });
        });

        it("should leave the centre of every rotation, scale and stretch where it is", () => {
            // Act & Assert
            fc.assert(fc.property(point, axis, angle, factor, (center, around, degrees, scale) => {
                const all = [
                    base.transforms.rotationCenterAxis({ center, axis: around, angle: degrees }),
                    base.transforms.rotationCenterYawPitchRoll({ center, yaw: degrees, pitch: -degrees / 2, roll: degrees / 3 }),
                    base.transforms.scaleCenterXYZ({ center, scaleXyz: [scale, 1 / scale, 2] }),
                    base.transforms.uniformScaleFromCenter({ center, scale }),
                    base.transforms.stretchDirFromCenter({ center, direction: around, scale }),
                ];
                all.forEach(transformation => expect(largestDifference(base.point.transformPoint({ point: center, transformation }), center)).toBeLessThanOrEqual(1e-9 * Math.max(1, scale, 1 / scale) * Math.max(1, ...center.map(Math.abs))));
            }), { seed: SEED, numRuns: RUNS });
        });

        it("should stretch only along the direction: points in the plane through the centre stay, points along the direction move by the scale", () => {
            // Act & Assert
            fc.assert(fc.property(point, axis, factor, fc.double({ min: -10, max: 10, noNaN: true }), (center, direction, scale, along) => {
                const length = Math.hypot(...direction);
                const unit: Vec = [direction[0] / length, direction[1] / length, direction[2] / length];
                const helper: Vec = Math.abs(unit[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];
                const inPlane: Vec = [center[0] + unit[1] * helper[2] - unit[2] * helper[1], center[1] + unit[2] * helper[0] - unit[0] * helper[2], center[2] + unit[0] * helper[1] - unit[1] * helper[0]];
                const onLine: Vec = [center[0] + unit[0] * along, center[1] + unit[1] * along, center[2] + unit[2] * along];
                const stretch = base.transforms.stretchDirFromCenter({ center, direction, scale });
                const tolerance = 1e-9 * Math.max(1, scale) * Math.max(1, ...center.map(Math.abs));
                expect(largestDifference(base.point.transformPoint({ point: inPlane, transformation: stretch }), inPlane)).toBeLessThanOrEqual(tolerance);
                expect(largestDifference(base.point.transformPoint({ point: onLine, transformation: stretch }), [center[0] + unit[0] * along * scale, center[1] + unit[1] * along * scale, center[2] + unit[2] * along * scale])).toBeLessThanOrEqual(tolerance * Math.max(1, Math.abs(along)));
            }), { seed: SEED, numRuns: RUNS });
        });
    });
});
