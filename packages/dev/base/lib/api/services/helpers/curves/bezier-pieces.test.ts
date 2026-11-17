import { describe, expect, it } from "vitest";
import type * as Inputs from "../../../inputs";
import { bezierPiecesBounds, bezierPoint, bezierPointAndTangent, cubicsOfPiece, samplesOfPiece } from "./bezier-pieces";
import type { BezierPiece } from "./nurbs-forms";
import { WorkBudget } from "../files/work-budget";

type Point3 = Inputs.Base.Point3;

const quarter: BezierPiece = { points: [[10, 0, 0], [10, 10, 0], [0, 10, 0]], weights: [1, Math.SQRT1_2, 1] };
const cubic: BezierPiece = { points: [[0, 0, 0], [1, 3, 0], [4, 3, 0], [5, 0, 0]], weights: [1, 1, 1, 1] };

const cubicAt = (piece: readonly Point3[], t: number): Point3 => {
    const b = [(1 - t) ** 3, 3 * t * (1 - t) ** 2, 3 * t * t * (1 - t), t ** 3];
    return [0, 1, 2].map(axis => piece.reduce((sum, point, at) => sum + b[at]! * point[axis]!, 0)) as Point3;
};

const segmentDistance = (point: Point3, start: Point3, end: Point3): number => {
    const along = [end[0] - start[0], end[1] - start[1]];
    const reach = along[0]! ** 2 + along[1]! ** 2;
    const share = reach === 0 ? 0 : Math.min(1, Math.max(0, ((point[0] - start[0]) * along[0]! + (point[1] - start[1]) * along[1]!) / reach));
    return Math.hypot(point[0] - start[0] - share * along[0]!, point[1] - start[1] - share * along[1]!);
};

describe("Bezier pieces", () => {
    it("should evaluate a rational piece on its circle, with a tangent along it", () => {
        // Act
        const samples = [0, 0.2, 0.5, 0.9, 1].map(t => bezierPointAndTangent(quarter, t));

        // Assert
        for (const { point, tangent } of samples) {
            expect(Math.hypot(point[0], point[1])).toBeCloseTo(10, 12);
            expect(point[0] * tangent[0] + point[1] * tangent[1]).toBeCloseTo(0, 9);
        }
        expect(samples[0]!.tangent).toEqual([0, 20 * Math.SQRT1_2, 0]);
        const step = 1e-6;
        const ahead = bezierPoint(cubic, 0.3 + step);
        const behind = bezierPoint(cubic, 0.3 - step);
        bezierPointAndTangent(cubic, 0.3).tangent.forEach((value, axis) => expect(value).toBeCloseTo((ahead[axis]! - behind[axis]!) / (2 * step), 6));
    });

    it("should give a plain cubic back as itself, and fit a circle with cubics within the tolerance", () => {
        // Act
        const same = cubicsOfPiece(cubic, 1e-9);
        const coarse = cubicsOfPiece(quarter, 1e-2);
        const fine = cubicsOfPiece(quarter, 1e-6);

        // Assert
        expect(same).toEqual([{ start: [0, 0, 0], control1: [1, 3, 0], control2: [4, 3, 0], end: [5, 0, 0] }]);
        for (const pieces of [coarse, fine]) {
            for (const fit of pieces) {
                for (let step = 0; step <= 50; step++) {
                    const point = cubicAt([fit.start, fit.control1, fit.control2, fit.end], step / 50);
                    expect(Math.abs(Math.hypot(point[0], point[1]) - 10)).toBeLessThanOrEqual(pieces === coarse ? 1e-2 : 1e-6);
                }
            }
        }
        expect(fine.length).toBeGreaterThan(coarse.length);
        expect(fine[0]!.start).toEqual([10, 0, 0]);
        expect(fine[fine.length - 1]!.end[1]).toBeCloseTo(10, 12);
    });

    it("should sample a piece so that no point of it lies further from the polyline than the tolerance", () => {
        // Act
        const samples = samplesOfPiece(quarter, 0.01);

        // Assert
        expect(samples[0]).toEqual([10, 0, 0]);
        for (let step = 0; step <= 500; step++) {
            const point = bezierPoint(quarter, step / 500);
            const nearest = Math.min(...samples.slice(1).map((end, at) => segmentDistance(point, samples[at]!, end)));
            expect(nearest).toBeLessThanOrEqual(0.01 + 1e-12);
        }
        expect(samplesOfPiece({ points: [[0, 0, 0], [1, 1, 0]], weights: [1, 1] }, 0.01)).toHaveLength(3);
    });

    it("should fit and sample no finer than a billionth of the piece's size, however small the tolerance", () => {
        // Act
        const cubics = cubicsOfPiece(quarter, 1e-20);
        const samples = samplesOfPiece(quarter, 1e-20);

        // Assert
        expect(cubics).toEqual(cubicsOfPiece(quarter, 1e-8));
        expect(samples).toEqual(samplesOfPiece(quarter, 1e-8));
    });

    it("should fit and sample a piece a trillion times larger into as many parts as the piece at its own scale", () => {
        // Arrange
        const larger: BezierPiece = { points: quarter.points.map(point => point.map(value => value * 1e12) as Point3), weights: quarter.weights };

        // Act
        const cubics = cubicsOfPiece(larger, 0.01);
        const samples = samplesOfPiece(larger, 0.01);

        // Assert
        expect([cubics.length, samples.length]).toEqual([cubicsOfPiece(quarter, 1e-8).length, samplesOfPiece(quarter, 1e-8).length]);
    });
});

describe("Bezier pieces whose weights overflow, or whose work runs past a budget", () => {
    const overflowing: BezierPiece = { points: [[0, 0, 0], [1e10, 0, 0], [-1e10, 0, 0], [0, 0, 0]], weights: [1, 1e300, 1e300, 1] };

    it("should stop sampling and fitting cubics at the first point that is not a number, rather than halving to the deepest split", () => {
        // Act
        const samples = samplesOfPiece(overflowing, 1e-3);
        const cubics = cubicsOfPiece(overflowing, 1e-3);

        // Assert
        expect([samples.length, cubics.length]).toEqual([2, 1]);
    });

    it("should stop sampling, fitting and bounding once its budget is spent, saying so on the budget", () => {
        // Arrange
        const budgets = [new WorkBudget(100), new WorkBudget(100), new WorkBudget(3)];
        const arch: BezierPiece = { points: [[0, 0, 0], [5, 10, 0], [10, 0, 0]], weights: [1, 3, 1] };

        // Act
        const samples = samplesOfPiece(cubic, 1e-9, budgets[0]);
        const cubics = cubicsOfPiece(arch, 1e-9, budgets[1]);
        const bounds = bezierPiecesBounds([arch], 1e-9, budgets[2]);

        // Assert
        expect(budgets.map(budget => budget.exhausted)).toEqual([true, true, true]);
        expect([samples.length, cubics.length]).toEqual([1, 0]);
        expect(bounds.max[1]).toBeCloseTo(1e-8, 12);
    });
});

describe("Bezier piece bounds", () => {
    const arch: BezierPiece = { points: [[0, 0, 0], [3, 10, 0], [5, 8, 0], [10, 0, 0]], weights: [1, 1, 1, 1] };
    const highestOfOneRise = (piece: BezierPiece): number => {
        let [low, high] = [0, 1];
        for (let round = 0; round < 100; round++) {
            const [left, right] = [low + (high - low) / 3, high - (high - low) / 3];
            [low, high] = bezierPoint(piece, left)[1] < bezierPoint(piece, right)[1] ? [left, high] : [low, right];
        }
        return bezierPoint(piece, (low + high) / 2)[1];
    };

    it("should bound a piece by its curve within the tolerance, the control points that reach further left out", () => {
        // Arrange
        const highest = highestOfOneRise(arch);

        // Act
        const bounds = bezierPiecesBounds([arch], 0.5);

        // Assert
        expect([bounds.min, [bounds.max[0], bounds.max[2]]]).toEqual([[-0.5, -0.5, -0.5], [10.5, 0.5]]);
        expect(bounds.max[1]).toBeGreaterThanOrEqual(highest);
        expect(bounds.max[1]).toBeLessThanOrEqual(highest + 0.5);
    });

    it("should bound a rational piece by its weighted curve, a heavy weight drawing it near its control point", () => {
        // Arrange
        const heavy: BezierPiece = { points: [[0, 0, 0], [5, 10, 0], [10, 0, 0]], weights: [1, 50, 1] };
        const highest = highestOfOneRise(heavy);

        // Act
        const circle = bezierPiecesBounds([quarter], 1e-6);
        const pulled = bezierPiecesBounds([heavy], 1e-6);

        // Assert
        expect(circle).toEqual({ min: [-1e-6, -1e-6, -1e-6], max: [10 + 1e-6, 10 + 1e-6, 1e-6] });
        expect(highest).toBeCloseTo(250 / 25.5, 12);
        expect(pulled.max[1]).toBeGreaterThanOrEqual(highest);
        expect(pulled.max[1]).toBeLessThanOrEqual(highest + 1e-6 + 1e-12);
    });

    it("should bound pieces a trillion times larger within a billionth of their size, however small the tolerance", () => {
        // Arrange
        const larger: BezierPiece = { points: arch.points.map(point => point.map(value => value * 1e12) as Point3), weights: arch.weights };
        const highest = highestOfOneRise(larger);

        // Act
        const bounds = bezierPiecesBounds([larger, arch], 1e-20);

        // Assert
        expect(bounds.max[1]).toBeGreaterThanOrEqual(highest);
        expect(bounds.max[1]).toBeLessThanOrEqual(highest + 1e13 * 1e-9);
        expect(bounds.min[0]).toBe(-1e13 * 1e-9);
    });

    it("should stop halving at the first hull that overflows, the overflowing axis unbounded and the others bounded, when weights are so large they overflow", () => {
        // Arrange
        const overflowing: BezierPiece = { points: [[0, 0, 0], [1e10, 0, 0], [-1e10, 0, 0], [0, 0, 0]], weights: [1, 1e300, 1e300, 1] };
        const budget = new WorkBudget(Number.POSITIVE_INFINITY);

        // Act
        const bounds = bezierPiecesBounds([overflowing], 1e-3, budget);

        // Assert
        expect([bounds.min[0], bounds.max[0]]).toEqual([-Infinity, Infinity]);
        expect([bounds.min.slice(1), bounds.max.slice(1)]).toEqual([[-20, -20], [20, 20]]);
        expect(budget.spent).toBe(overflowing.points.length);
    });
});
