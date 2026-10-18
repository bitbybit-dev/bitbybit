import { describe, expect, it } from "vitest";
import fc from "fast-check";
import type * as Inputs from "../inputs";
import { BaseBitByBit } from "./base-bitbybit";

type Vec = Inputs.Base.Point3;
type Triangle = Inputs.Base.Triangle3;

interface Turn {
    axis: Vec;
    angle: number;
}

interface Solid {
    pieces: Triangle[][];
    size: number;
}

const base = new BaseBitByBit();
const SEED = 20261018;
const RUNS = 100;

const plus = (a: Vec, b: Vec): Vec => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const minus = (a: Vec, b: Vec): Vec => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const times = (a: Vec, k: number): Vec => [a[0] * k, a[1] * k, a[2] * k];
const dotOf = (a: Vec, b: Vec): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const crossOf = (a: Vec, b: Vec): Vec => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const lengthOf = (a: Vec): number => Math.hypot(a[0], a[1], a[2]);
const unit = (a: Vec): Vec => times(a, 1 / lengthOf(a));
const clamped = (value: number): number => Math.min(1, Math.max(0, value));

const turned = ({ axis, angle }: Turn, vector: Vec): Vec => {
    const k = unit(axis);
    return plus(plus(times(vector, Math.cos(angle)), times(crossOf(k, vector), Math.sin(angle))), times(k, dotOf(k, vector) * (1 - Math.cos(angle))));
};

const solidAngle = (point: Vec, [a, b, c]: Triangle): number => {
    const ra = minus(a, point);
    const rb = minus(b, point);
    const rc = minus(c, point);
    const la = lengthOf(ra);
    const lb = lengthOf(rb);
    const lc = lengthOf(rc);
    return 2 * Math.atan2(dotOf(ra, crossOf(rb, rc)), la * lb * lc + dotOf(ra, rb) * lc + dotOf(ra, rc) * lb + dotOf(rb, rc) * la);
};

const windingOf = (point: Vec, piece: readonly Triangle[]): number => piece.reduce((sum, triangle) => sum + solidAngle(point, triangle), 0) / (4 * Math.PI);

const enclosingPieces = (point: Vec, solid: Solid): number => solid.pieces.filter(piece => Math.abs(windingOf(point, piece)) > 0.5).length;

const pointSegment = (point: Vec, from: Vec, to: Vec): number => {
    const along = minus(to, from);
    const squared = dotOf(along, along);
    const share = squared === 0 ? 0 : clamped(dotOf(minus(point, from), along) / squared);
    return lengthOf(minus(point, plus(from, times(along, share))));
};

const pointTriangle = (point: Vec, [a, b, c]: Triangle): number => {
    const normal = crossOf(minus(b, a), minus(c, a));
    const squared = dotOf(normal, normal);
    const edges = Math.min(pointSegment(point, a, b), pointSegment(point, b, c), pointSegment(point, c, a));
    if (squared === 0) {
        return edges;
    }
    const height = dotOf(minus(point, a), normal) / squared;
    const foot = minus(point, times(normal, height));
    const inside = [[a, b], [b, c], [c, a]].every(([from, to]) => dotOf(crossOf(minus(to!, from!), minus(foot, from!)), normal) >= 0);
    return inside ? Math.abs(height) * Math.sqrt(squared) : edges;
};

const segmentSegment = (p1: Vec, q1: Vec, p2: Vec, q2: Vec): number => {
    const d1 = minus(q1, p1);
    const d2 = minus(q2, p2);
    const r = minus(p1, p2);
    const a = dotOf(d1, d1);
    const e = dotOf(d2, d2);
    const b = dotOf(d1, d2);
    const c = dotOf(d1, r);
    const f = dotOf(d2, r);
    const ends = Math.min(pointSegment(p1, p2, q2), pointSegment(q1, p2, q2), pointSegment(p2, p1, q1), pointSegment(q2, p1, q1));
    const denominator = a * e - b * b;
    if (!(denominator > 1e-14 * a * e)) {
        return ends;
    }
    const s = (b * f - c * e) / denominator;
    const t = (a * f - b * c) / denominator;
    if (s < 0 || s > 1 || t < 0 || t > 1) {
        return ends;
    }
    return Math.min(ends, lengthOf(minus(plus(p1, times(d1, s)), plus(p2, times(d2, t)))));
};

const segmentPierces = (from: Vec, to: Vec, [a, b, c]: Triangle): boolean => {
    const normal = crossOf(minus(b, a), minus(c, a));
    if (dotOf(normal, normal) === 0) {
        return false;
    }
    const sFrom = dotOf(minus(from, a), normal);
    const sTo = dotOf(minus(to, a), normal);
    if (sFrom * sTo > 0 || sFrom === sTo) {
        return false;
    }
    const hit = plus(from, times(minus(to, from), sFrom / (sFrom - sTo)));
    return [[a, b], [b, c], [c, a]].every(([p, q]) => dotOf(crossOf(minus(q!, p!), minus(hit, p!)), normal) >= 0);
};

const triangleTriangle = (first: Triangle, second: Triangle): number => {
    const edgesOf = ([a, b, c]: Triangle): [Vec, Vec][] => [[a, b], [b, c], [c, a]];
    if (edgesOf(first).some(([p, q]) => segmentPierces(p, q, second)) || edgesOf(second).some(([p, q]) => segmentPierces(p, q, first))) {
        return 0;
    }
    const corners = Math.min(...first.map(point => pointTriangle(point, second)), ...second.map(point => pointTriangle(point, first)));
    return Math.min(corners, ...edgesOf(first).flatMap(([p1, q1]) => edgesOf(second).map(([p2, q2]) => segmentSegment(p1, q1, p2, q2))));
};

const meshGap = (first: readonly Triangle[], second: readonly Triangle[]): number =>
    first.reduce((nearest, a) => second.reduce((closest, b) => Math.min(closest, triangleTriangle(a, b)), nearest), Infinity);

const BOX_CORNERS: Vec[] = [[-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1], [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]];
const BOX_FACES = [[0, 2, 1], [0, 3, 2], [4, 5, 6], [4, 6, 7], [0, 1, 5], [0, 5, 4], [1, 2, 6], [1, 6, 5], [2, 3, 7], [2, 7, 6], [3, 0, 4], [3, 4, 7]];

const boxOf = (centre: Vec, size: Vec, turn: Turn, inward = false): Triangle[] => {
    const corners = BOX_CORNERS.map(corner => plus(centre, turned(turn, [corner[0] * size[0] / 2, corner[1] * size[1] / 2, corner[2] * size[2] / 2])));
    return BOX_FACES.map(([a, b, c]): Triangle => (inward ? [corners[a!]!, corners[c!]!, corners[b!]!] : [corners[a!]!, corners[b!]!, corners[c!]!]));
};

const direction = fc.tuple(fc.double({ min: -1, max: 1, noNaN: true }), fc.double({ min: -1, max: 1, noNaN: true }), fc.double({ min: -1, max: 1, noNaN: true }))
    .filter(vector => lengthOf(vector) > 0.1);
const turnArbitrary: fc.Arbitrary<Turn> = fc.record({ axis: direction, angle: fc.double({ min: -Math.PI, max: Math.PI, noNaN: true }) });
const place = fc.tuple(fc.double({ min: -4, max: 4, noNaN: true }), fc.double({ min: -4, max: 4, noNaN: true }), fc.double({ min: -4, max: 4, noNaN: true }));
const sizes = fc.tuple(fc.double({ min: 0.2, max: 3, noNaN: true }), fc.double({ min: 0.2, max: 3, noNaN: true }), fc.double({ min: 0.2, max: 3, noNaN: true }));

const surfacesArbitrary = (finest: number, most: number): fc.Arbitrary<Triangle[][]> => fc.oneof(
    fc.record({ centre: place, size: sizes, turn: turnArbitrary }).map(({ centre, size, turn }) => [boxOf(centre, size, turn)]),
    fc.record({ centre: place, radius: fc.double({ min: 0.2, max: 2, noNaN: true }), detail: fc.integer({ min: 0, max: finest }) }).map(({ centre, radius, detail }) => [base.mesh.icosphere({ center: centre, radius, detail })]),
    fc.record({ centre: place, sides: fc.integer({ min: 3, max: most }), bottomRadius: fc.double({ min: 0, max: 2, noNaN: true }), topRadius: fc.double({ min: 0.1, max: 2, noNaN: true }), height: fc.double({ min: 0.2, max: 3, noNaN: true }), direction })
        .map(({ centre, sides, bottomRadius, topRadius, height, direction: along }) => [base.mesh.frustum({ center: centre, sides, bottomRadius, topRadius, height, direction: along })]),
    fc.record({ centre: place, outer: sizes, share: fc.double({ min: 0.2, max: 0.8, noNaN: true }), turn: turnArbitrary })
        .map(({ centre, outer, share, turn }) => [boxOf(centre, outer, turn), boxOf(centre, times(outer, share), turn, true)]),
);

const pieceArbitrary: fc.Arbitrary<Triangle[]> = surfacesArbitrary(1, 12).map(surfaces => surfaces.flat());

const solidArbitrary: fc.Arbitrary<Solid> = fc.array(surfacesArbitrary(1, 12), { minLength: 1, maxLength: 3 }).map(parts => ({ pieces: parts.flat(), size: 4 }));

const pairArbitrary: fc.Arbitrary<Solid> = fc.array(surfacesArbitrary(0, 6), { minLength: 1, maxLength: 2 }).map(parts => ({ pieces: parts.flat(), size: 4 }));

const meshOf = (solid: Solid): Triangle[] => solid.pieces.flat();

const surfacePieces = (solid: Solid): Triangle[][] => solid.pieces;

const nestedIn = (inner: Solid, outer: Solid): boolean => inner.pieces.some(piece => enclosingPieces(piece[0]![0], outer) % 2 === 1);

const tetrahedron = (a: Vec, b: Vec, c: Vec, d: Vec): Triangle[] => [[a, c, b], [a, b, d], [b, c, d], [c, a, d]];

describe("mesh proximity against brute-force oracles", () => {
    describe("isPointInside", () => {
        it("should call a point inside exactly when an odd number of the closed pieces around it enclose it, by their solid angles", () => {
            // Act & Assert
            fc.assert(fc.property(solidArbitrary, fc.array(place, { minLength: 1, maxLength: 12 }), (solid, points) => {
                const mesh = meshOf(solid);
                points.forEach(point => {
                    const windings = surfacePieces(solid).map(piece => Math.abs(windingOf(point, piece)));
                    fc.pre(windings.every(winding => Math.abs(winding - Math.round(winding)) < 1e-6));
                    const expected = windings.filter(winding => winding > 0.5).length % 2 === 1;
                    expect(base.mesh.isPointInside({ mesh, point })).toBe(expected);
                });
            }), { seed: SEED, numRuns: RUNS });
        });

        it("should give the same answer for a solid turned and moved far out, the point with it", () => {
            // Act & Assert
            fc.assert(fc.property(pieceArbitrary, place, turnArbitrary, fc.constantFrom(1e3, 1e5, 1e6), (piece, point, turn, far) => {
                const moved = (corner: Vec): Vec => plus(turned(turn, corner), [far, -far, far / 2]);
                const winding = Math.abs(windingOf(point, piece)) % 2;
                fc.pre(Math.abs(winding - Math.round(winding)) < 1e-6 && piece.every(triangle => pointTriangle(point, triangle) > 1e-3));
                expect(base.mesh.isPointInside({ mesh: piece.map(triangle => triangle.map(moved) as Triangle), point: moved(point) })).toBe(base.mesh.isPointInside({ mesh: piece, point }));
            }), { seed: SEED, numRuns: RUNS });
        });

        it("should find a point inside a box whose corners lie on two of its three rays", () => {
            // Arrange
            const point: Vec = [0.1, 0.2, 0.3];
            const rays: Vec[] = [[0.5773, 0.5779, 0.5767], [-0.6123, 0.7071, 0.3536]];
            const [first, second] = rays.map(ray => plus(point, times(ray, 2)));
            const third = plus(point, [0, -2, 0]);
            const fourth = plus(point, [0, 0, -2]);
            const tetra = tetrahedron(first!, second!, third, fourth);
            const winding = windingOf(point, tetra);

            // Act
            const inside = base.mesh.isPointInside({ mesh: tetra, point });

            // Assert
            expect(Math.abs(winding)).toBeCloseTo(1, 9);
            expect(inside).toBe(true);
        });
    });

    describe("meshesWithin", () => {
        it("should agree with the nearest distance between any two triangles, and with a piece of one inside the other", () => {
            // Act & Assert
            fc.assert(fc.property(pairArbitrary, pairArbitrary, fc.double({ min: 0, max: 2, noNaN: true }), (first, second, distance) => {
                const gap = meshGap(meshOf(first), meshOf(second));
                fc.pre(Math.abs(gap - distance) > 1e-9);
                const nested = gap > distance && (nestedIn(first, second) || nestedIn(second, first));
                expect(base.mesh.meshesWithin({ mesh1: meshOf(first), mesh2: meshOf(second), distance })).toBe(gap <= distance || nested);
            }), { seed: SEED, numRuns: 60, interruptAfterTimeLimit: 8000 });
        });

        it("should give the same answer whichever mesh comes first", () => {
            // Act & Assert
            fc.assert(fc.property(solidArbitrary, solidArbitrary, fc.double({ min: 0, max: 2, noNaN: true }), (first, second, distance) => {
                expect(base.mesh.meshesWithin({ mesh1: meshOf(first), mesh2: meshOf(second), distance })).toBe(base.mesh.meshesWithin({ mesh1: meshOf(second), mesh2: meshOf(first), distance }));
            }), { seed: SEED, numRuns: 60 });
        });

        it("should tell boxes that touch by a face, an edge or a corner are within 0, and boxes a hair apart are not until the distance covers the hair", () => {
            // Act & Assert
            fc.assert(fc.property(sizes, fc.constantFrom<Vec>([1, 0, 0], [1, 1, 0], [1, 1, 1]), fc.constantFrom(0, 1e-9, 1e-6), fc.integer({ min: -3, max: 3 }), (size, touching, hair, exponent) => {
                const scale = 10 ** exponent;
                const scaled = times(size, scale);
                const first = boxOf([0, 0, 0], scaled, { axis: [0, 0, 1], angle: 0 });
                const offset: Vec = [touching[0] * scaled[0], touching[1] * scaled[1], touching[2] * scaled[2]];
                const second = boxOf(plus(offset, times(unit(touching), hair * scale)), scaled, { axis: [0, 0, 1], angle: 0 });
                expect(base.mesh.meshesWithin({ mesh1: first, mesh2: second, distance: 0 })).toBe(hair === 0);
                expect(base.mesh.meshesWithin({ mesh1: first, mesh2: second, distance: 2 * hair * scale })).toBe(true);
            }), { seed: SEED, numRuns: RUNS });
        });

        it("should tell two boxes that share one corner are within 0 of each other, whichever is given first", () => {
            // Arrange
            const size: Vec = [0.20000000000000004, 0.24162436558849126, 0.34177806759269724];
            const first = boxOf([0, 0, 0], size, { axis: [0, 0, 1], angle: 0 });
            const second = boxOf(size, size, { axis: [0, 0, 1], angle: 0 });

            // Act
            const forward = base.mesh.meshesWithin({ mesh1: first, mesh2: second, distance: 0 });
            const backward = base.mesh.meshesWithin({ mesh1: second, mesh2: first, distance: 0 });

            // Assert
            expect(first[2]![2]).toEqual(second[0]![0]);
            expect([forward, backward]).toEqual([true, true]);
        });

        it("should find a sliver a ten-millionth wide crossing a triangle, whichever lies across the other", () => {
            // Act & Assert
            fc.assert(fc.property(fc.constantFrom(1e-7, 1e-9, 1e-11), turnArbitrary, fc.double({ min: -0.4, max: 0.4, noNaN: true }), (width, turn, across) => {
                const sliver: Triangle = ([[-1, 0, 0], [1, 0, 0], [0, width, 0]] as Triangle).map(corner => turned(turn, corner)) as Triangle;
                const crossing: Triangle = ([[across, width / 2, -1], [across, width / 2, 1], [across + 0.5, width / 2 + 2, 0]] as Triangle).map(corner => turned(turn, corner)) as Triangle;
                expect(base.mesh.meshesWithin({ mesh1: [sliver], mesh2: [crossing], distance: 0 })).toBe(true);
                expect(base.mesh.meshesWithin({ mesh1: [crossing], mesh2: [sliver], distance: 0 })).toBe(true);
            }), { seed: SEED, numRuns: RUNS });
        });
    });
});
