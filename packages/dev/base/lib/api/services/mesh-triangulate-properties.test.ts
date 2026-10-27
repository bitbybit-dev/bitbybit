import { describe, expect, it } from "vitest";
import fc from "fast-check";
import type * as Inputs from "../inputs";
import { BaseBitByBit } from "./base-bitbybit";

type Vec = Inputs.Base.Point3;
type Flat = Inputs.Base.Point2;

interface Face {
    outline: Flat[];
    holes: Flat[][];
    size: number;
}

interface Plane {
    origin: Vec;
    u: Vec;
    v: Vec;
}

const base = new BaseBitByBit();
const SEED = 20261018;
const RUNS = 150;
const FULL_TURN = 2 * Math.PI;

const plus = (a: Vec, b: Vec): Vec => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const minus = (a: Vec, b: Vec): Vec => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const times = (a: Vec, k: number): Vec => [a[0] * k, a[1] * k, a[2] * k];
const dotOf = (a: Vec, b: Vec): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const crossOf = (a: Vec, b: Vec): Vec => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const lengthOf = (a: Vec): number => Math.hypot(a[0], a[1], a[2]);
const unit = (a: Vec): Vec => times(a, 1 / lengthOf(a));
const cross2 = (a: Flat, b: Flat): number => a[0] * b[1] - a[1] * b[0];
const minus2 = (a: Flat, b: Flat): Flat => [a[0] - b[0], a[1] - b[1]];

const fanArea = (points: readonly Flat[]): number => {
    const origin = points[0]!;
    let twice = 0;
    for (let index = 1; index + 1 < points.length; index++) {
        twice += cross2(minus2(points[index]!, origin), minus2(points[index + 1]!, origin));
    }
    return twice / 2;
};

const windingNumber = (point: Flat, loop: readonly Flat[]): number => {
    let total = 0;
    loop.forEach((corner, index) => {
        const a = minus2(corner, point);
        const b = minus2(loop[(index + 1) % loop.length]!, point);
        total += Math.atan2(cross2(a, b), a[0] * b[0] + a[1] * b[1]);
    });
    return Math.round(total / FULL_TURN);
};

const star = (corners: readonly (readonly [number, number])[], size: number, centre: Flat, start: number): Flat[] => {
    const total = corners.reduce((sum, [gap]) => sum + gap, 0);
    let angle = start;
    return corners.map(([gap, reach]) => {
        const point: Flat = [centre[0] + reach * size * Math.cos(angle), centre[1] + reach * size * Math.sin(angle)];
        angle += gap / total * FULL_TURN;
        return point;
    });
};

const starCorners = (most: number, nearest: number, widestShare: number): fc.Arbitrary<[number, number][]> =>
    fc.array(fc.tuple(fc.double({ min: 0.2, max: 1, noNaN: true }), fc.double({ min: nearest, max: 1, noNaN: true })), { minLength: 3, maxLength: most })
        .filter(corners => Math.max(...corners.map(([gap]) => gap)) < corners.reduce((sum, [gap]) => sum + gap, 0) * widestShare);

const HOLE_CLEARING_SHARE = 0.3;

const faceArbitrary: fc.Arbitrary<Face> = fc.record({
    outer: starCorners(24, 0.6, 1 / 2),
    hole: fc.option(fc.tuple(starCorners(8, 0.5, 1 / 2), fc.boolean()), { nil: undefined }),
    start: fc.double({ min: 0, max: FULL_TURN, noNaN: true }),
    size: fc.integer({ min: -3, max: 3 }).map(exponent => 10 ** exponent),
}).filter(({ outer, hole }) => hole === undefined || Math.max(...outer.map(([gap]) => gap)) < outer.reduce((sum, [gap]) => sum + gap, 0) * HOLE_CLEARING_SHARE).map(({ outer, hole, start, size }) => {
    const holes = hole === undefined ? [] : [star(hole[0], size * 0.25, [0, 0], start)].map(loop => (hole[1] ? [...loop].reverse() : loop));
    return { outline: star(outer, size, [0, 0], start), holes, size };
});

const direction = fc.tuple(fc.double({ min: -1, max: 1, noNaN: true }), fc.double({ min: -1, max: 1, noNaN: true }), fc.double({ min: -1, max: 1, noNaN: true }))
    .filter(vector => lengthOf(vector) > 0.1);

const planeArbitrary = (exponents: readonly number[]): fc.Arbitrary<Plane> => fc.record({
    normal: direction,
    across: direction,
    toward: direction,
    exponent: fc.constantFrom(...exponents),
}).filter(({ normal, across }) => lengthOf(crossOf(unit(normal), unit(across))) > 0.1).map(({ normal, across, toward, exponent }) => {
    const n = unit(normal);
    const u = unit(minus(across, times(n, dotOf(across, n))));
    return { origin: times(unit(toward), exponent === 0 ? 0 : 10 ** exponent), u, v: crossOf(n, u) };
});

const lifted = (plane: Plane, [x, y]: Flat): Vec => plus(plane.origin, plus(times(plane.u, x), times(plane.v, y)));

const flattened = (plane: Plane, point: Vec): Flat => {
    const offset = minus(point, plane.origin);
    return [dotOf(offset, plane.u), dotOf(offset, plane.v)];
};

const insideFace = (point: Flat, face: Face): boolean => windingNumber(point, face.outline) !== 0 && face.holes.every(hole => windingNumber(point, hole) === 0);

const triangulated = (face: Face, plane: Plane): Inputs.Base.Mesh3 =>
    base.mesh.triangulatePolygon({ points: face.outline.map(point => lifted(plane, point)), holes: face.holes.map(hole => hole.map(point => lifted(plane, point))) });

const ellOfArea3: Flat[] = [[0, 0], [2, 0], [2, 1], [1, 1], [1, 2], [0, 2]];

describe("triangulatePolygon against independent oracles", () => {
    it("should cover a face with holes once with triangles facing its own way, its area exactly, near the origin", () => {
        // Act & Assert
        fc.assert(fc.property(faceArbitrary, planeArbitrary([0]), (face, plane) => {
            const mesh = triangulated(face, plane);
            const normal = crossOf(plane.u, plane.v);
            const area = mesh.reduce((sum, [a, b, c]) => sum + dotOf(crossOf(minus(b, a), minus(c, a)), normal) / 2, 0);
            const expected = fanArea(face.outline) - face.holes.reduce((sum, hole) => sum + Math.abs(fanArea(hole)), 0);
            expect(Math.abs(area - expected)).toBeLessThanOrEqual(1e-9 * face.size * face.size);
            mesh.forEach(([a, b, c]) => expect(dotOf(crossOf(minus(b, a), minus(c, a)), normal)).toBeGreaterThanOrEqual(-1e-12 * face.size * face.size));
        }), { seed: SEED, numRuns: RUNS, interruptAfterTimeLimit: 8000 });
    });

    it("should keep every corner of the outline and of its holes", () => {
        // Act & Assert
        fc.assert(fc.property(faceArbitrary, planeArbitrary([0]), (face, plane) => {
            const used = new Set(triangulated(face, plane).flat().map(corner => corner.join(",")));
            [face.outline, ...face.holes].flat().forEach(point => expect(used.has(lifted(plane, point).join(","))).toBe(true));
        }), { seed: SEED, numRuns: RUNS, interruptAfterTimeLimit: 8000 });
    });

    it("should put every triangle inside the outline and outside its holes", () => {
        // Act & Assert
        fc.assert(fc.property(faceArbitrary, planeArbitrary([0]), (face, plane) => {
            triangulated(face, plane).forEach(([a, b, c]) => {
                const centre = flattened(plane, times(plus(plus(a, b), c), 1 / 3));
                const twice = Math.abs(cross2(minus2(flattened(plane, b), flattened(plane, a)), minus2(flattened(plane, c), flattened(plane, a))));
                if (twice > 1e-9 * face.size * face.size) {
                    expect(insideFace(centre, face)).toBe(true);
                }
            });
        }), { seed: SEED, numRuns: RUNS, interruptAfterTimeLimit: 8000 });
    });

    it("should cover a face the same way wherever its plane lies, a thousand to a billion units from the origin as survey coordinates put it", () => {
        // Act & Assert
        fc.assert(fc.property(faceArbitrary, planeArbitrary([3, 6, 7, 8, 9]), (face, plane) => {
            fc.pre(face.size >= 1);
            const mesh = triangulated(face, plane);
            const normal = crossOf(plane.u, plane.v);
            const area = mesh.reduce((sum, [a, b, c]) => sum + dotOf(crossOf(minus(b, a), minus(c, a)), normal) / 2, 0);
            const expected = fanArea(face.outline) - face.holes.reduce((sum, hole) => sum + Math.abs(fanArea(hole)), 0);
            const precision = Number.EPSILON * lengthOf(plane.origin) * face.size * face.outline.length;
            expect(Math.abs(area - expected)).toBeLessThanOrEqual(1e-6 * face.size * face.size + precision);
            mesh.forEach(([a, b, c]) => expect(dotOf(crossOf(minus(b, a), minus(c, a)), normal)).toBeGreaterThanOrEqual(-precision));
        }), { seed: SEED, numRuns: RUNS, interruptAfterTimeLimit: 8000 });
    });

    it("should face every triangle of an L a billion units out along the plane's normal, as it does at the origin", () => {
        // Arrange
        const farOut = ellOfArea3.map(([x, y]): Vec => [x + 1e9 + 0.25, y + 1e9 + 0.25, 0]);

        // Act
        const mesh = base.mesh.triangulatePolygon({ points: farOut });

        // Assert
        expect(mesh.map(([a, b, c]) => Math.sign(crossOf(minus(b, a), minus(c, a))[2]))).toEqual([1, 1, 1, 1]);
    });

    it("should cover an L of area 3 a billion units out with triangles of area 3 in all", () => {
        // Arrange
        const farOut = ellOfArea3.map(([x, y]): Vec => [x + 1e9 + 0.25, y + 1e9 + 0.25, 0]);

        // Act
        const mesh = base.mesh.triangulatePolygon({ points: farOut });

        // Assert
        expect(mesh.reduce((sum, [a, b, c]) => sum + Math.abs(crossOf(minus(b, a), minus(c, a))[2]) / 2, 0)).toBeCloseTo(3, 9);
    });
});
