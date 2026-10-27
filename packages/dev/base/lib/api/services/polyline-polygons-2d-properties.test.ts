import { describe, expect, it } from "vitest";
import fc from "fast-check";
import type * as Inputs from "../inputs";
import { InputError } from "../kernel-calls";
import { BaseBitByBit } from "./base-bitbybit";

type Point2 = Inputs.Base.Point2;

interface Outline {
    points: Point2[];
    size: number;
}

interface RoundedCase {
    outline: Outline;
    radii: number[];
    segments: number;
}

interface CornerGeometry {
    corner: Point2;
    toPrevious: Point2;
    toNext: Point2;
    turn: number;
    convex: boolean;
    straight: boolean;
}

const base = new BaseBitByBit();
const SEED = 20261018;
const RUNS = 150;
const FULL_TURN = 2 * Math.PI;
const STRAIGHT_SLACK = 1e-9;
const BELOW_THE_FIT = fc.double({ min: 1e-3, max: 0.999, noNaN: true });

const minus = (a: Point2, b: Point2): Point2 => [a[0] - b[0], a[1] - b[1]];
const cross = (a: Point2, b: Point2): number => a[0] * b[1] - a[1] * b[0];
const dotOf = (a: Point2, b: Point2): number => a[0] * b[0] + a[1] * b[1];
const lengthOf = (a: Point2): number => Math.hypot(a[0], a[1]);
const unit = (a: Point2): Point2 => [a[0] / lengthOf(a), a[1] / lengthOf(a)];
const at = <T>(list: readonly T[], index: number): T => list[((index % list.length) + list.length) % list.length]!;

const fanArea = (points: readonly Point2[]): number => {
    const origin = points[0]!;
    let twice = 0;
    for (let index = 1; index + 1 < points.length; index++) {
        twice += cross(minus(points[index]!, origin), minus(points[index + 1]!, origin));
    }
    return twice / 2;
};

const windingNumber = (point: Point2, outline: readonly Point2[]): number => {
    let total = 0;
    outline.forEach((corner, index) => {
        const a = minus(corner, point);
        const b = minus(at(outline, index + 1), point);
        total += Math.atan2(cross(a, b), dotOf(a, b));
    });
    return Math.round(total / FULL_TURN);
};

const segmentDistance = (point: Point2, a: Point2, b: Point2): number => {
    const along = minus(b, a);
    const share = Math.min(1, Math.max(0, dotOf(minus(point, a), along) / dotOf(along, along)));
    return lengthOf(minus(point, [a[0] + along[0] * share, a[1] + along[1] * share]));
};

const boundaryDistance = (point: Point2, outline: readonly Point2[]): number =>
    outline.reduce((nearest, corner, index) => Math.min(nearest, segmentDistance(point, corner, at(outline, index + 1))), Infinity);

const placed = (angles: readonly number[], radii: readonly number[], size: number, centre: Point2, turn: number, squash: number): Point2[] =>
    angles.map((angle, index) => {
        const x = radii[index]! * size * Math.cos(angle);
        const y = radii[index]! * size * squash * Math.sin(angle);
        return [centre[0] + x * Math.cos(turn) - y * Math.sin(turn), centre[1] + x * Math.sin(turn) + y * Math.cos(turn)];
    });

const anglesFrom = (gaps: readonly number[], start: number): number[] => {
    const total = gaps.reduce((sum, gap) => sum + gap, 0);
    let running = start;
    return gaps.map((gap) => {
        const angle = running;
        running += gap / total * FULL_TURN;
        return angle;
    });
};

const scaleArbitrary = fc.integer({ min: -6, max: 6 }).map(exponent => 10 ** exponent);

const convexOutline = (most: number): fc.Arbitrary<Outline> => fc.record({
    gaps: fc.array(fc.double({ min: 0.05, max: 1, noNaN: true }), { minLength: 3, maxLength: most }),
    start: fc.double({ min: 0, max: FULL_TURN, noNaN: true }),
    size: scaleArbitrary,
    turn: fc.double({ min: 0, max: FULL_TURN, noNaN: true }),
    squash: fc.double({ min: 0.3, max: 1, noNaN: true }),
    centre: fc.tuple(fc.double({ min: -3, max: 3, noNaN: true }), fc.double({ min: -3, max: 3, noNaN: true })),
}).map(({ gaps, start, size, turn, squash, centre }) => ({
    points: placed(anglesFrom(gaps, start), gaps.map(() => 1), size, [centre[0] * size, centre[1] * size], turn, squash),
    size,
}));

const starOutline = (most: number): fc.Arbitrary<Outline> => fc.record({
    corners: fc.array(fc.tuple(fc.double({ min: 0.1, max: 1, noNaN: true }), fc.double({ min: 0.35, max: 1, noNaN: true })), { minLength: 3, maxLength: most }),
    start: fc.double({ min: 0, max: FULL_TURN, noNaN: true }),
    size: scaleArbitrary,
    turn: fc.double({ min: 0, max: FULL_TURN, noNaN: true }),
}).filter(({ corners }) => Math.max(...corners.map(([gap]) => gap)) < corners.reduce((sum, [gap]) => sum + gap, 0) / 2).map(({ corners, start, size, turn }) => ({
    points: placed(anglesFrom(corners.map(([gap]) => gap), start), corners.map(([, reach]) => reach), size, [0, 0], turn, 1),
    size,
}));

const withNearlyStraightCorners = (outlines: fc.Arbitrary<Outline>): fc.Arbitrary<Outline> => outlines.chain(outline => fc.array(
    fc.tuple(fc.boolean(), fc.double({ min: 0.2, max: 0.8, noNaN: true }), fc.constantFrom(0, 1e-12, 1e-9, -1e-9, 1e-6, -1e-6, 1e-3, -1e-3)),
    { minLength: outline.points.length, maxLength: outline.points.length },
).map(splits => ({
    size: outline.size,
    points: outline.points.flatMap((point, index): Point2[] => {
        const [split, share, lean] = splits[index]!;
        if (!split) {
            return [point];
        }
        const next = at(outline.points, index + 1);
        const side = minus(next, point);
        return [point, [point[0] + side[0] * share - side[1] * lean, point[1] + side[1] * share + side[0] * lean]];
    }),
})));

const crossingPieces = (points: readonly Point2[]): number[][] => {
    const crossings: number[][] = [];
    const count = points.length;
    for (let first = 0; first < count; first++) {
        for (let second = first + 2; second < count; second++) {
            if (first === 0 && second === count - 1) {
                continue;
            }
            const a = points[first]!;
            const b = at(points, first + 1);
            const c = points[second]!;
            const d = at(points, second + 1);
            const sides = [cross(minus(b, a), minus(c, a)), cross(minus(b, a), minus(d, a)), cross(minus(d, c), minus(a, c)), cross(minus(d, c), minus(b, c))];
            if (sides[0]! * sides[1]! < 0 && sides[2]! * sides[3]! < 0) {
                crossings.push([first, second]);
            }
        }
    }
    return crossings;
};

const SERIES_BELOW = 1e-3;

const tangentLessAngle = (angle: number): number => (angle < SERIES_BELOW ? angle ** 3 / 3 + 2 * angle ** 5 / 15 + 17 * angle ** 7 / 315 : Math.tan(angle) - angle);

const angleLessSine = (angle: number): number => (angle < SERIES_BELOW ? angle ** 3 / 6 - angle ** 5 / 120 + angle ** 7 / 5040 : angle - Math.sin(angle));

const geometryOf = (points: readonly Point2[]): CornerGeometry[] => points.map((corner, index) => {
    const incoming = unit(minus(corner, at(points, index - 1)));
    const outgoing = unit(minus(at(points, index + 1), corner));
    const turn = Math.atan2(Math.abs(cross(incoming, outgoing)), dotOf(incoming, outgoing));
    return {
        corner,
        toPrevious: [-incoming[0], -incoming[1]],
        toNext: outgoing,
        turn,
        convex: cross(incoming, outgoing) > 0,
        straight: turn < 2 * STRAIGHT_SLACK || turn > Math.PI - 2 * STRAIGHT_SLACK,
    };
});

const reachOf = (corner: CornerGeometry, radius: number): number => radius * Math.tan(corner.turn / 2);

const largestScale = (points: readonly Point2[], weights: readonly number[]): number => {
    const corners = geometryOf(points);
    const reachPerWeight = corners.map((corner) => (corner.straight ? 0 : reachOf(corner, 1)));
    return points.reduce((smallest, point, index) => {
        const need = weights[index]! * reachPerWeight[index]! + at(weights, index + 1) * at(reachPerWeight, index + 1);
        return need > 0 ? Math.min(smallest, lengthOf(minus(at(points, index + 1), point)) / need) : smallest;
    }, Infinity);
};

const roundedCase = (outlines: fc.Arbitrary<Outline>, shares = fc.oneof(fc.constant(1), fc.double({ min: 1e-3, max: 1, noNaN: true }))): fc.Arbitrary<RoundedCase> => outlines.chain(outline => fc.record({
    weights: fc.array(fc.oneof(fc.constant(0), fc.double({ min: 0.05, max: 1, noNaN: true })), { minLength: outline.points.length, maxLength: outline.points.length }),
    share: shares,
    segments: fc.integer({ min: 1, max: 24 }),
}).map(({ weights, share, segments }) => {
    const scale = largestScale(outline.points, weights);
    return { outline, radii: weights.map(weight => (Number.isFinite(scale) ? weight * scale * share : 0)), segments };
}));

const centreOf = (corner: CornerGeometry, radius: number): Point2 => {
    const reach = reachOf(corner, radius);
    const inward = (corner.convex ? 1 : -1) * radius;
    return [corner.corner[0] + corner.toPrevious[0] * reach + corner.toPrevious[1] * inward, corner.corner[1] + corner.toPrevious[1] * reach - corner.toPrevious[0] * inward];
};

const tangentPoints = (corner: CornerGeometry, radius: number): [Point2, Point2] => {
    const reach = reachOf(corner, radius);
    return [
        [corner.corner[0] + corner.toPrevious[0] * reach, corner.corner[1] + corner.toPrevious[1] * reach],
        [corner.corner[0] + corner.toNext[0] * reach, corner.corner[1] + corner.toNext[1] * reach],
    ];
};

const slackFor = (size: number, radius: number): number => 1e-9 * size + 3e-8 * radius;

const isRounded = (corner: CornerGeometry, radius: number): boolean => radius > 0 && !corner.straight;

const consecutiveRepeats = (points: readonly Point2[]): number[] =>
    points.flatMap((point, index) => (lengthOf(minus(at(points, index + 1), point)) === 0 ? [index] : []));

const turningAngles = (points: readonly Point2[]): number[] => points.map((point, index) => {
    const incoming = minus(point, at(points, index - 1));
    const outgoing = minus(at(points, index + 1), point);
    return Math.atan2(cross(incoming, outgoing), dotOf(incoming, outgoing));
});

const onArc = (point: Point2, centre: Point2, radius: number, tolerance: number): boolean => Math.abs(lengthOf(minus(point, centre)) - radius) <= tolerance;

const withinSector = (point: Point2, centre: Point2, ends: readonly [Point2, Point2], slack: number): boolean => {
    const first = minus(ends[0], centre);
    const last = minus(ends[1], centre);
    const towards = minus(point, centre);
    const sense = Math.sign(cross(first, last));
    return sense * cross(first, towards) / lengthOf(first) >= -slack && sense * cross(towards, last) / lengthOf(last) >= -slack;
};

interface Arc {
    corner: CornerGeometry;
    radius: number;
    centre: Point2;
    ends: [Point2, Point2];
    slack: number;
}

const arcsOf = ({ outline, radii }: RoundedCase): Arc[] => geometryOf(outline.points).flatMap((corner, index) => {
    const radius = radii[index]!;
    return isRounded(corner, radius) ? [{ corner, radius, centre: centreOf(corner, radius), ends: tangentPoints(corner, radius), slack: slackFor(outline.size, radius) }] : [];
});

const onItsArc = (point: Point2, arc: Arc, size: number): boolean => onArc(point, arc.centre, arc.radius, 1e-9 * size + 16 * Number.EPSILON * arc.radius) && withinSector(point, arc.centre, arc.ends, arc.slack);

const runsAlong = (point: Point2, next: Point2, arc: Arc): boolean =>
    Math.sign(cross(minus(point, arc.centre), minus(next, arc.centre))) === Math.sign(cross(minus(arc.ends[0], arc.centre), minus(arc.ends[1], arc.centre)));

const expectedRoundedArea = (rounded: readonly Point2[], rounding: RoundedCase): number => {
    const size = rounding.outline.size;
    const arcs = arcsOf(rounding);
    const cornerCut = arcs.reduce((sum, { corner, radius }) => sum + (corner.convex ? -1 : 1) * radius * radius * tangentLessAngle(corner.turn / 2), 0);
    const chordCut = rounded.reduce((sum, point, index) => {
        const next = at(rounded, index + 1);
        const arc = arcs.find(candidate => onItsArc(point, candidate, size) && onItsArc(next, candidate, size) && runsAlong(point, next, candidate));
        if (arc === undefined) {
            return sum;
        }
        const angle = 2 * Math.asin(Math.min(1, lengthOf(minus(next, point)) / (2 * arc.radius)));
        return sum + (arc.corner.convex ? -1 : 1) * arc.radius * arc.radius * angleLessSine(angle) / 2;
    }, 0);
    return fanArea(rounding.outline.points) + cornerCut + chordCut;
};

const areaTolerance = ({ outline, radii }: RoundedCase): number =>
    1e-9 * outline.size * outline.size * outline.points.length + radii.reduce((sum, radius) => sum + 1e-15 * radius * radius, 0);

const strayPoints = (rounded: readonly Point2[], rounding: RoundedCase): Point2[] => {
    const { outline, radii } = rounding;
    const arcs = arcsOf(rounding);
    const sharp = geometryOf(outline.points).filter((corner, index) => !isRounded(corner, radii[index]!));
    return rounded.filter(point => !arcs.some(arc => onItsArc(point, arc, outline.size))
        && !sharp.some(corner => lengthOf(minus(point, corner.corner)) <= 1e-9 * outline.size));
};

const missingTangentPoints = (rounding: RoundedCase, rounded: readonly Point2[]): Point2[] =>
    arcsOf(rounding).flatMap(arc => arc.ends.filter(tangent => !rounded.some(point => lengthOf(minus(point, tangent)) <= arc.slack)));

const roundedOf = ({ outline, radii, segments }: RoundedCase): Point2[] => base.polyline.roundCorners2d({ points: outline.points, radiusList: radii, segments });

const ellOfArea3 = (offset: number): Point2[] => [[0, 0], [2, 0], [2, 1], [1, 1], [1, 2], [0, 2]].map(([x, y]): Point2 => [x! + offset, y! + offset]);

describe("polyline flat outlines against independent oracles", () => {
    describe("signedArea2d", () => {
        it("should equal a triangle fan about the first corner and change sign when the outline is reversed", () => {
            // Act & Assert
            fc.assert(fc.property(starOutline(40), ({ points, size }) => {
                const area = base.polyline.signedArea2d({ points });
                const reversed = base.polyline.signedArea2d({ points: [...points].reverse() });
                expect(Math.abs(area - fanArea(points))).toBeLessThanOrEqual(1e-12 * size * size * points.length);
                expect(Math.abs(area + reversed)).toBeLessThanOrEqual(1e-12 * size * size * points.length);
                expect(area).toBeGreaterThan(0);
            }), { seed: SEED, numRuns: RUNS });
        });

        it("should measure the same area wherever an outline lies, its size from a thousandth to a thousand placed up to ten million from the origin", () => {
            // Act & Assert
            fc.assert(fc.property(starOutline(12), fc.integer({ min: 3, max: 7 }), fc.double({ min: -1, max: 1, noNaN: true }), ({ points, size }, exponent, direction) => {
                fc.pre(size >= 1e-3 && size <= 1e3);
                const offset = direction * 10 ** exponent;
                const moved = points.map(([x, y]): Point2 => [x + offset, y - offset / 2]);
                expect(Math.abs(base.polyline.signedArea2d({ points: moved }) - fanArea(moved))).toBeLessThanOrEqual(1e-9 * size * size);
            }), { seed: SEED, numRuns: RUNS });
        });

        it("should give an L of area 3 placed five million from the origin, as survey coordinates in metres put it, the area its corners' differences give", () => {
            // Arrange
            const farOut = ellOfArea3(5e6 + 0.3);

            // Act
            const area = base.polyline.signedArea2d({ points: farOut });

            // Assert
            expect(fanArea(farOut)).toBeCloseTo(3, 7);
            expect(Math.abs(area - fanArea(farOut))).toBeLessThanOrEqual(1e-9);
        });
    });

    describe("orient2d", () => {
        it("should wind an outline the way asked, as the same list or its reverse, and change nothing on a second call", () => {
            // Act & Assert
            fc.assert(fc.property(starOutline(30), fc.boolean(), fc.boolean(), ({ points }, reverse, counterClockwise) => {
                const given = reverse ? [...points].reverse() : points;
                const snapshot = JSON.stringify(given);
                const oriented = base.polyline.orient2d({ points: given, counterClockwise });
                const again = base.polyline.orient2d({ points: oriented, counterClockwise });
                expect(Math.sign(fanArea(oriented))).toBe(counterClockwise ? 1 : -1);
                expect([given, [...given].reverse()]).toContainEqual(oriented);
                expect(again).toEqual(oriented);
                expect(JSON.stringify(given)).toBe(snapshot);
            }), { seed: SEED, numRuns: RUNS });
        });

        it("should keep a counter-clockwise millimetre square placed five million from the origin as it is when asked for counter-clockwise", () => {
            // Arrange
            const square: Point2[] = [[0, 0], [1e-3, 0], [1e-3, 1e-3], [0, 1e-3]].map(([x, y]): Point2 => [x! + 5e6 + 0.3, y! + 5e6 + 0.3]);

            // Act
            const oriented = base.polyline.orient2d({ points: square, counterClockwise: true });

            // Assert
            expect(oriented).toEqual(square);
        });
    });

    describe("perimeter2d", () => {
        it("should add up every side, the closing one included, at any size", () => {
            // Act & Assert
            fc.assert(fc.property(starOutline(40), ({ points, size }) => {
                const sides = points.reduce((sum, point, index) => sum + lengthOf(minus(at(points, index + 1), point)), 0);
                expect(Math.abs(base.polyline.perimeter2d({ points }) - sides)).toBeLessThanOrEqual(1e-13 * size * points.length);
            }), { seed: SEED, numRuns: RUNS });
        });
    });

    describe("isPointInside2d", () => {
        it("should agree with the winding number for points that do not lie on the outline, whichever way it runs", () => {
            // Act & Assert
            fc.assert(fc.property(starOutline(24), fc.array(fc.tuple(fc.double({ min: -1.2, max: 1.2, noNaN: true }), fc.double({ min: -1.2, max: 1.2, noNaN: true })), { minLength: 1, maxLength: 30 }), fc.boolean(), ({ points, size }, shares, reverse) => {
                const outline = reverse ? [...points].reverse() : points;
                shares.map(([x, y]): Point2 => [x * size, y * size])
                    .filter(point => boundaryDistance(point, outline) > 1e-9 * size)
                    .forEach(point => expect(base.polyline.isPointInside2d({ points: outline, point })).toBe(windingNumber(point, outline) !== 0));
            }), { seed: SEED, numRuns: RUNS });
        });

        it("should agree with the winding number for points level with a corner, where a crossing test counts a corner twice or not at all", () => {
            // Act & Assert
            fc.assert(fc.property(starOutline(24), fc.nat(), fc.double({ min: -1.2, max: 1.2, noNaN: true }), ({ points, size }, pick, share) => {
                const level = at(points, pick)[1];
                const point: Point2 = [share * size, level];
                fc.pre(boundaryDistance(point, points) > 1e-9 * size);
                expect(base.polyline.isPointInside2d({ points, point })).toBe(windingNumber(point, points) !== 0);
            }), { seed: SEED, numRuns: RUNS });
        });
    });

    describe("roundCorners2d on convex outlines", () => {
        it("should give no point twice in a row, the last and the first included, for radii up to the largest that fit", () => {
            // Act & Assert
            fc.assert(fc.property(roundedCase(convexOutline(16)), (rounding) => {
                expect(consecutiveRepeats(roundedOf(rounding))).toEqual([]);
            }), { seed: SEED, numRuns: RUNS });
        });

        it("should keep a convex outline convex: every point turns the same way and the turns add up to one whole turn", () => {
            // Act & Assert
            fc.assert(fc.property(roundedCase(convexOutline(16)), (rounding) => {
                const turns = turningAngles(roundedOf(rounding));
                expect(Math.min(...turns)).toBeGreaterThanOrEqual(-1e-9);
                expect(turns.reduce((sum, turn) => sum + turn, 0)).toBeCloseTo(FULL_TURN, 9);
            }), { seed: SEED, numRuns: RUNS });
        });

        it("should put every point on an arc of its corner's radius between the points where the arc touches the sides, or on a sharp corner", () => {
            // Act & Assert
            fc.assert(fc.property(roundedCase(convexOutline(16)), (rounding) => {
                const rounded = roundedOf(rounding);
                expect(strayPoints(rounded, rounding)).toEqual([]);
                expect(missingTangentPoints(rounding, rounded)).toEqual([]);
            }), { seed: SEED, numRuns: RUNS });
        });

        it("should take away exactly the corners' area, the circular segments the straight pieces cut included", () => {
            // Act & Assert
            fc.assert(fc.property(roundedCase(convexOutline(16)), (rounding) => {
                const rounded = roundedOf(rounding);
                expect(Math.abs(fanArea(rounded) - expectedRoundedArea(rounded, rounding))).toBeLessThanOrEqual(areaTolerance(rounding));
            }), { seed: SEED, numRuns: RUNS });
        });

        it("should give a clockwise outline the same rounding wound the other way", () => {
            // Act & Assert
            fc.assert(fc.property(roundedCase(convexOutline(12)), (rounding) => {
                const forward = roundedOf(rounding);
                const backward = base.polyline.roundCorners2d({ points: [...rounding.outline.points].reverse(), radiusList: [...rounding.radii].reverse(), segments: rounding.segments });
                const tolerance = 1e-9 * rounding.outline.size * rounding.outline.size;
                expect(backward).toHaveLength(forward.length);
                expect(Math.abs(fanArea(backward) + fanArea(forward))).toBeLessThanOrEqual(tolerance);
            }), { seed: SEED, numRuns: RUNS });
        });

        it("should round the same outline scaled by a million or a millionth into the same points scaled", () => {
            // Act & Assert
            fc.assert(fc.property(roundedCase(convexOutline(12)), fc.constantFrom(1e-6, 1e6), (rounding, factor) => {
                const forward = roundedOf(rounding);
                const scaled = base.polyline.roundCorners2d({ points: rounding.outline.points.map(([x, y]): Point2 => [x * factor, y * factor]), radiusList: rounding.radii.map(radius => radius * factor), segments: rounding.segments });
                expect(scaled).toHaveLength(forward.length);
                scaled.forEach((point, index) => expect(lengthOf(minus(point, [forward[index]![0] * factor, forward[index]![1] * factor]))).toBeLessThanOrEqual(1e-9 * rounding.outline.size * factor));
            }), { seed: SEED, numRuns: RUNS });
        });

        it("should give an outline every flat-outline method takes again, rounding it once more included", () => {
            // Act & Assert
            fc.assert(fc.property(roundedCase(convexOutline(12)), (rounding) => {
                const rounded = roundedOf(rounding);
                const smallest = Math.min(...rounding.radii.filter(radius => radius > 0), rounding.outline.size);
                const inside: Point2 = [rounded.reduce((sum, [x]) => sum + x, 0) / rounded.length, rounded.reduce((sum, [, y]) => sum + y, 0) / rounded.length];
                expect(base.polyline.signedArea2d({ points: rounded })).toBeGreaterThan(0);
                expect(base.polyline.perimeter2d({ points: rounded })).toBeGreaterThan(0);
                expect(base.polyline.isPointInside2d({ points: rounded, point: inside })).toBe(true);
                expect(base.polyline.orient2d({ points: rounded, counterClockwise: true })).toEqual(rounded);
                expect(base.polyline.roundCorners2d({ points: rounded, radius: 0 })).toEqual(rounded);
                expect(consecutiveRepeats(base.polyline.roundCorners2d({ points: rounded, radius: smallest * 1e-3, segments: 2 }))).toEqual([]);
            }), { seed: SEED, numRuns: RUNS });
        });

        it("should take radii a billionth over the largest that fit and refuse radii a millionth over, as an InputError", () => {
            // Act & Assert
            fc.assert(fc.property(roundedCase(convexOutline(12)), ({ outline, radii, segments }) => {
                const largest = largestScale(outline.points, radii.map(radius => (radius > 0 ? radius : 0)));
                fc.pre(Number.isFinite(largest) && radii.some(radius => radius > 0));
                const over = (factor: number): Point2[] => base.polyline.roundCorners2d({ points: outline.points, radiusList: radii.map(radius => radius * largest * factor), segments });
                expect(consecutiveRepeats(over(1 + 1e-10))).toEqual([]);
                expect(() => over(1 + 1e-6)).toThrow(InputError);
            }), { seed: SEED, numRuns: RUNS });
        });
    });

    describe("roundCorners2d on outlines with inner corners", () => {
        it("should give no point twice in a row and put every point on its corner's arc or a sharp corner", () => {
            // Act & Assert
            fc.assert(fc.property(roundedCase(starOutline(16)), (rounding) => {
                const rounded = roundedOf(rounding);
                expect(consecutiveRepeats(rounded)).toEqual([]);
                expect(strayPoints(rounded, rounding)).toEqual([]);
                expect(missingTangentPoints(rounding, rounded)).toEqual([]);
            }), { seed: SEED, numRuns: RUNS });
        });

        it("should take the corner's area from an outer corner and add it at an inner one, the straight pieces' segments included", () => {
            // Act & Assert
            fc.assert(fc.property(roundedCase(starOutline(16)), (rounding) => {
                const rounded = roundedOf(rounding);
                expect(Math.abs(fanArea(rounded) - expectedRoundedArea(rounded, rounding))).toBeLessThanOrEqual(areaTolerance(rounding));
            }), { seed: SEED, numRuns: RUNS });
        });

        it("should give an outline every flat-outline method takes again", () => {
            // Act & Assert
            fc.assert(fc.property(roundedCase(starOutline(12)), (rounding) => {
                const rounded = roundedOf(rounding);
                expect(Math.sign(base.polyline.signedArea2d({ points: rounded }))).toBe(1);
                expect(base.polyline.roundCorners2d({ points: rounded, radius: 0 })).toEqual(rounded);
                expect(base.polyline.orient2d({ points: rounded, counterClockwise: true })).toEqual(rounded);
            }), { seed: SEED, numRuns: RUNS });
        });
    });

    describe("roundCorners2d with points on or near a straight side", () => {
        it("should give no point twice in a row, keep convex outlines convex and put every point on its arc or a sharp corner", () => {
            // Act & Assert
            fc.assert(fc.property(roundedCase(withNearlyStraightCorners(convexOutline(10)), BELOW_THE_FIT), (rounding) => {
                const rounded = roundedOf(rounding);
                expect(consecutiveRepeats(rounded)).toEqual([]);
                expect(strayPoints(rounded, rounding)).toEqual([]);
                expect(missingTangentPoints(rounding, rounded)).toEqual([]);
                expect(base.polyline.roundCorners2d({ points: rounded, radius: 0 })).toEqual(rounded);
            }), { seed: SEED, numRuns: RUNS });
        });

        it("should take the corners' area away, an almost straight corner taking almost nothing", () => {
            // Act & Assert
            fc.assert(fc.property(roundedCase(withNearlyStraightCorners(starOutline(10)), BELOW_THE_FIT), (rounding) => {
                const rounded = roundedOf(rounding);
                expect(Math.abs(fanArea(rounded) - expectedRoundedArea(rounded, rounding))).toBeLessThanOrEqual(areaTolerance(rounding));
            }), { seed: SEED, numRuns: RUNS });
        });
    });

    describe("roundCorners2d on a point that lies on a side", () => {
        it("should keep a point halfway along a right triangle's slanted side as it is, though its two directions cancel to nothing", () => {
            // Arrange
            const halfwayAlongTheSlant: Point2[] = [[0, 0], [4, 0], [2, 2], [0, 4]];

            // Act
            const rounded = (): Point2[] => base.polyline.roundCorners2d({ points: halfwayAlongTheSlant, radius: 0.5, segments: 2 });

            // Assert
            expect(rounded).not.toThrow();
            expect(rounded()).toContainEqual([2, 2]);
            expect(consecutiveRepeats(rounded())).toEqual([]);
        });

        it("should keep a point a tenth of the way along a side that rises at 45 degrees as it is", () => {
            // Arrange
            const onTheDiagonal: Point2[] = [[0, 0], [0.03, 0.03], [0.1, 0.1], [-4.9, 5.1], [-5, 5]];

            // Act
            const rounded = (): Point2[] => base.polyline.roundCorners2d({ points: onTheDiagonal, radius: 0.01, segments: 2 });

            // Assert
            expect(rounded).not.toThrow();
            expect(rounded()).toContainEqual([0.03, 0.03]);
        });
    });

    describe("roundCorners2d on outlines that stay simple", () => {
        it("should round a star-shaped outline with radii that fit into an outline that does not cross itself", () => {
            // Act & Assert
            fc.assert(fc.property(roundedCase(starOutline(9)).filter(({ segments }) => segments <= 4), (rounding) => {
                expect(crossingPieces(roundedOf(rounding))).toEqual([]);
            }), { seed: SEED, numRuns: RUNS });
        });
    });

    describe("roundCorners2d at the fit", () => {
        it("should round a regular polygon by its inradius into points that all lie on the inscribed circle, each given once", () => {
            // Act & Assert
            fc.assert(fc.property(fc.integer({ min: 3, max: 12 }), fc.integer({ min: 1, max: 16 }), scaleArbitrary, (sides, segments, size) => {
                const polygon = Array.from({ length: sides }, (_, index): Point2 => [size * Math.cos(FULL_TURN * index / sides), size * Math.sin(FULL_TURN * index / sides)]);
                const inradius = size * Math.cos(Math.PI / sides);
                const rounded = base.polyline.roundCorners2d({ points: polygon, radius: inradius, segments });
                expect(consecutiveRepeats(rounded)).toEqual([]);
                rounded.forEach(point => expect(Math.abs(lengthOf(point) - inradius)).toBeLessThanOrEqual(1e-12 * size));
                expect(Math.min(...turningAngles(rounded))).toBeGreaterThan(0);
            }), { seed: SEED, numRuns: RUNS });
        });

        it("should keep a point on a straight side as it is while the arc beside it runs right up to it", () => {
            // Arrange
            const withMiddles: Point2[] = [[0, 0], [2, 0], [4, 0], [4, 2], [4, 4], [2, 4], [0, 4], [0, 2]];

            // Act
            const rounded = base.polyline.roundCorners2d({ points: withMiddles, radius: 2, segments: 4 });

            // Assert
            expect(consecutiveRepeats(rounded)).toEqual([]);
            expect(rounded).toHaveLength(16);
            expect(rounded).toContainEqual([2, 0]);
            expect(rounded).toContainEqual([0, 2]);
        });

        it("should round a triangle by its inradius into one closed loop on its incircle", () => {
            // Arrange
            const triangle: Point2[] = [[0, 0], [3, 0], [0, 4]];

            // Act
            const rounded = base.polyline.roundCorners2d({ points: triangle, radius: 1, segments: 8 });

            // Assert
            expect(consecutiveRepeats(rounded)).toEqual([]);
            rounded.forEach(point => expect(lengthOf(minus(point, [1, 1]))).toBeCloseTo(1, 12));
        });
    });
});
