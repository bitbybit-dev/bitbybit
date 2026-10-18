import { describe, it, expect } from "vitest";
import fc from "fast-check";
import type { HullPart } from "./hull";
import { hullOf } from "./hull";
import type { ArcPiece, Piece, Vec2 } from "./outline";
import { signedArea } from "./outline";

const point = (x: number, y: number): HullPart => ({ kind: "point", at: [x, y] });
const disc = (x: number, y: number, radius: number): HullPart => ({ kind: "disc", center: [x, y], radius });


const RIM_SAMPLES = 180;
const SEED = 20261018;

const rimPoints = (center: Vec2, radius: number, from: number, span: number, samples: number): Vec2[] => Array.from({ length: samples + 1 }, (_, step): Vec2 => {
    const angle = from + span * step / samples;
    return [center[0] + radius * Math.cos(angle), center[1] + radius * Math.sin(angle)];
});

const SNAP = 1e9;

const sampledHullArea = (points: readonly Vec2[]): number => {
    const snapped = points.map(([x, y]): Vec2 => [Math.round(x * SNAP) / SNAP, Math.round(y * SNAP) / SNAP]);
    const sorted = snapped.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const turn = (o: Vec2, a: Vec2, b: Vec2): number => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const chain = (ordered: readonly Vec2[]): Vec2[] => {
        const kept: Vec2[] = [];
        for (const point of ordered) {
            while (kept.length >= 2 && turn(kept[kept.length - 2]!, kept[kept.length - 1]!, point) <= 0) {
                kept.pop();
            }
            kept.push(point);
        }
        return kept;
    };
    const lower = chain(sorted);
    const upper = chain([...sorted].reverse());
    const ring = [...lower.slice(0, -1), ...upper.slice(0, -1)];
    return Math.abs(ring.reduce((sum, point, index) => {
        const next = ring[(index + 1) % ring.length]!;
        return sum + point[0] * next[1] - next[0] * point[1];
    }, 0)) / 2;
};

const sampledOf = (parts: readonly HullPart[], stretch: number): Vec2[] => parts.flatMap(part => {
    if (part.kind === "point") {
        return [part.at];
    }
    const range = part.range ?? { from: 0, span: 2 * Math.PI };
    return rimPoints(part.center, part.radius * stretch, range.from, range.span, RIM_SAMPLES);
});

const endsOf = (part: HullPart): HullPart[] => part.kind === "disc" && part.range !== undefined
    ? rimPoints(part.center, part.radius, part.range.from, part.range.span, 1).map(at => point(at[0], at[1]))
    : [];

const gridPart = fc.oneof(
    fc.tuple(fc.integer({ min: -4, max: 4 }), fc.integer({ min: -4, max: 4 })).map(([x, y]) => point(x, y)),
    fc.tuple(fc.integer({ min: -4, max: 4 }), fc.integer({ min: -4, max: 4 }), fc.integer({ min: 1, max: 3 })).map(([x, y, radius]) => disc(x, y, radius)),
    fc.tuple(fc.integer({ min: -4, max: 4 }), fc.integer({ min: -4, max: 4 }), fc.integer({ min: 1, max: 3 }), fc.integer({ min: -2, max: 1 }), fc.integer({ min: 1, max: 3 }))
        .map(([x, y, radius, from, quarters]): HullPart => ({ kind: "disc", center: [x, y], radius, range: { from: from * Math.PI / 2, span: quarters * Math.PI / 2 } })),
);

const HUNDREDTHS = 100;
const coordinate = fc.integer({ min: -5000, max: 5000 }).map(value => value / HUNDREDTHS);
const radius = fc.integer({ min: 1, max: 2000 }).map(value => value / HUNDREDTHS);
const angle = fc.integer({ min: -314, max: 314 }).map(value => value / HUNDREDTHS);
const span = fc.integer({ min: 5, max: 623 }).map(value => value / HUNDREDTHS);

const freePart = fc.oneof(
    fc.tuple(coordinate, coordinate).map(([x, y]) => point(x, y)),
    fc.tuple(coordinate, coordinate, radius).map(([x, y, size]) => disc(x, y, size)),
    fc.tuple(coordinate, coordinate, radius, angle, span).map(([x, y, size, from, width]): HullPart => ({ kind: "disc", center: [x, y], radius: size, range: { from, span: width } })),
);

const chainGap = (pieces: readonly Piece[]): number => Math.max(0, ...pieces.map((piece, index) => {
    const next = pieces[(index + 1) % pieces.length]!;
    return Math.hypot(piece.to[0] - next.from[0], piece.to[1] - next.from[1]);
}));

const sizeOf = (parts: readonly HullPart[]): number => Math.max(1, ...parts.map(part => part.kind === "point" ? Math.hypot(...part.at) : Math.hypot(...part.center) + part.radius));

describe("sketch hull", () => {
    it("should wrap points in straight pieces running counterclockwise, leaving out what lies inside", () => {
        // Arrange
        const parts = [point(0, 0), point(10, 0), point(10, 10), point(0, 10), point(4, 6)];

        // Act
        const hull = hullOf(parts);

        // Assert
        expect(hull).toBeDefined();
        expect(hull!.closed).toBe(true);
        expect(hull!.pieces).toHaveLength(4);
        expect(hull!.pieces.every(piece => piece.kind === "line")).toBe(true);
        expect(signedArea(hull!.pieces)).toBeCloseTo(100, 10);
    });

    it("should run straight past points that lie on a side", () => {
        // Arrange
        const parts = [point(0, 0), point(5, 0), point(10, 0), point(10, 10), point(0, 10), point(0, 5)];

        // Act
        const hull = hullOf(parts);

        // Assert
        expect(hull!.pieces).toHaveLength(4);
        expect(signedArea(hull!.pieces)).toBeCloseTo(100, 10);
    });

    it("should wrap a lone circle in one full arc", () => {
        // Arrange
        const parts = [disc(3, 4, 2)];

        // Act
        const hull = hullOf(parts);

        // Assert
        expect(hull!.pieces).toHaveLength(1);
        const arc = hull!.pieces[0] as ArcPiece;
        expect(arc.kind).toBe("arc");
        expect(arc.sweep).toBeCloseTo(2 * Math.PI, 10);
        expect(signedArea(hull!.pieces)).toBeCloseTo(4 * Math.PI, 10);
    });

    it("should wrap a circle and a point outside it in two tangents and the arc between them", () => {
        // Arrange
        const parts = [disc(0, 0, 5), point(13, 0)];

        // Act
        const hull = hullOf(parts);

        // Assert
        const tangent = Math.sqrt(169 - 25);
        const half = Math.acos(5 / 13);
        const expected = tangent * 5 + (2 * Math.PI - 2 * half) * 25 / 2;
        expect(hull!.pieces.map(piece => piece.kind).sort()).toEqual(["arc", "line", "line"]);
        expect(signedArea(hull!.pieces)).toBeCloseTo(expected, 10);
    });

    it("should leave a circle inside another out of the hull", () => {
        // Arrange
        const parts = [disc(0, 0, 5), disc(1, 1, 1)];

        // Act
        const hull = hullOf(parts);

        // Assert
        expect(signedArea(hull!.pieces)).toBeCloseTo(25 * Math.PI, 10);
    });

    it("should follow an arc only over the directions it covers, either way it was drawn", () => {
        // Arrange
        const upper: HullPart = { kind: "disc", center: [0, 0], radius: 5, range: { from: 0, span: Math.PI } };
        const lower: HullPart = { kind: "disc", center: [0, 0], radius: 5, range: { from: Math.PI, span: Math.PI / 2 } };
        const withUpper = [upper, point(5, 0), point(-5, 0), point(0, -5)];
        const withLower = [lower, point(-5, 0), point(0, -5), point(5, 0)];

        // Act
        const upperHull = hullOf(withUpper);
        const lowerHull = hullOf(withLower);

        // Assert
        expect(signedArea(upperHull!.pieces)).toBeCloseTo(25 * Math.PI / 2 + 25, 10);
        expect(signedArea(lowerHull!.pieces)).toBeCloseTo(25 * Math.PI / 4 + 12.5, 10);
    });

    it("should give nothing when there is nothing to wrap", () => {
        // Arrange
        const parts: HullPart[] = [];
        const uncovered: HullPart[] = [{ kind: "disc", center: [0, 0], radius: 1, range: { from: 2, span: 1 } }];

        // Act
        const results = [hullOf(parts), hullOf(uncovered)];

        // Assert
        expect(results).toEqual([undefined, undefined]);
    });
    describe("parts that touch where the hull reaches them", () => {
        const twoDiscHullArea = (distance: number, larger: number, smaller: number): number => {
            const tilt = Math.asin((larger - smaller) / distance);
            return distance * (larger + smaller) * Math.cos(tilt) + (Math.PI + 2 * tilt) * larger * larger / 2 + (Math.PI - 2 * tilt) * smaller * smaller / 2;
        };
        const discAndPointHullArea = (distance: number, size: number): number => Math.sqrt(distance * distance - size * size) * size + (2 * Math.PI - 2 * Math.acos(size / distance)) * size * size / 2;

        it("should wrap a circle whose top a point on its rim marks, whichever comes first in the list", () => {
            // Arrange
            const rimFirst = [point(-2, 4), disc(-2, 1, 3), point(1, 4), point(0, 0)];
            const rimLast = [point(1, 4), point(0, 0), disc(-2, 1, 3), point(-2, 4)];
            const expected = discAndPointHullArea(Math.hypot(3, 3), 3);

            // Act
            const areas = [rimFirst, rimLast].map(parts => signedArea(hullOf(parts)!.pieces));

            // Assert
            expect(areas).toEqual([expect.closeTo(expected, 9), expect.closeTo(expected, 9)]);
        });

        it("should wrap a circle that another touches from inside, and the small circle standing out of both", () => {
            // Arrange
            const parts = [disc(1, 3, 3), disc(1, 2, 2), disc(0, 1, 1)];
            const expected = twoDiscHullArea(Math.sqrt(5), 3, 1);

            // Act
            const hull = hullOf(parts);

            // Assert
            expect(signedArea(hull!.pieces)).toBeCloseTo(expected, 9);
        });
        it("should leave out the rest of a circle past the end of an arc a tangent reaches only at that end", () => {
            // Arrange
            const quarter: HullPart = { kind: "disc", center: [-4, -1], radius: 1, range: { from: Math.PI / 2, span: Math.PI / 2 } };
            const parts = [disc(-4, 0, 1), quarter, ...endsOf(quarter)];

            // Act
            const hull = hullOf(parts);

            // Assert
            expect(signedArea(hull!.pieces)).toBeCloseTo(discAndPointHullArea(Math.SQRT2, 1), 9);
        });
    });

    describe("against the hull of the parts sampled densely", () => {
        const holdsBetweenSampledHulls = (parts: HullPart[]): void => {
            const wrapped = [...parts, ...parts.flatMap(endsOf)];
            const hull = hullOf(wrapped);
            const inner = sampledHullArea(sampledOf(wrapped, 1));
            const outer = sampledHullArea(sampledOf(wrapped, 1 / Math.cos(Math.PI / RIM_SAMPLES)));
            const slack = 1e-8 * sizeOf(wrapped) ** 2;
            expect(hull).toBeDefined();
            const area = signedArea(hull!.pieces);
            expect(area).toBeGreaterThanOrEqual(inner - slack);
            expect(area).toBeLessThanOrEqual(outer + slack);
            expect(chainGap(hull!.pieces)).toBeLessThan(1e-7 * sizeOf(wrapped));
        };

        it("should enclose exactly the area of the convex hull of points and circles placed anywhere, arcs with their ends included", () => {
            // Act & Assert
            fc.assert(fc.property(fc.array(freePart, { minLength: 1, maxLength: 7 }), holdsBetweenSampledHulls), { seed: SEED, numRuns: 400 });
        });

        it("should enclose the convex hull's area when points coincide or lie on a side, and circles and quarter arcs touch, nest and repeat on a grid", () => {
            // Act & Assert
            fc.assert(fc.property(fc.array(gridPart, { minLength: 1, maxLength: 8 }), holdsBetweenSampledHulls), { seed: SEED, numRuns: 400 });
        });

        it("should give the same area for the same parts listed in any order, arcs with their ends included", () => {
            // Act & Assert
            fc.assert(fc.property(fc.array(gridPart, { minLength: 2, maxLength: 6 }).chain(parts => fc.tuple(fc.constant(parts), fc.shuffledSubarray(parts, { minLength: parts.length, maxLength: parts.length }))), ([parts, shuffled]) => {
                const first = signedArea(hullOf([...parts, ...parts.flatMap(endsOf)])!.pieces);
                const second = signedArea(hullOf([...shuffled, ...shuffled.flatMap(endsOf)])!.pieces);
                expect(Math.abs(first - second)).toBeLessThan(1e-9 * sizeOf(parts) ** 2);
            }), { seed: SEED, numRuns: 300 });
        });
    });
});
