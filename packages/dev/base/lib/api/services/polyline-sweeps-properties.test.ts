import { describe, expect, it } from "vitest";
import fc from "fast-check";
import type * as Inputs from "../inputs";
import { BaseBitByBit } from "./base-bitbybit";
import { pathTangents, transportedAxes } from "./helpers/geometry/paths";

type Vec = Inputs.Base.Vector3;

interface Path {
    points: Vec[];
    size: number;
}

interface Turn {
    axis: Vec;
    angle: number;
}

const base = new BaseBitByBit();
const SEED = 20261018;
const RUNS = 150;
const MAX_MITRE = 8;

const plus = (a: Vec, b: Vec): Vec => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const minus = (a: Vec, b: Vec): Vec => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const times = (a: Vec, k: number): Vec => [a[0] * k, a[1] * k, a[2] * k];
const dotOf = (a: Vec, b: Vec): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const crossOf = (a: Vec, b: Vec): Vec => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const lengthOf = (a: Vec): number => Math.hypot(a[0], a[1], a[2]);
const unit = (a: Vec): Vec => times(a, 1 / lengthOf(a));
const angleBetween = (a: Vec, b: Vec): number => Math.atan2(lengthOf(crossOf(a, b)), dotOf(a, b));

const turned = ({ axis, angle }: Turn, vector: Vec): Vec => {
    const k = unit(axis);
    return plus(plus(times(vector, Math.cos(angle)), times(crossOf(k, vector), Math.sin(angle))), times(k, dotOf(k, vector) * (1 - Math.cos(angle))));
};

const direction = fc.tuple(fc.double({ min: -1, max: 1, noNaN: true }), fc.double({ min: -1, max: 1, noNaN: true }), fc.double({ min: -1, max: 1, noNaN: true }))
    .filter(vector => lengthOf(vector) > 0.1)
    .map(vector => unit(vector));

const turnArbitrary: fc.Arbitrary<Turn> = fc.record({ axis: direction, angle: fc.double({ min: -Math.PI, max: Math.PI, noNaN: true }) });

const stepKind = fc.oneof(
    { weight: 4, arbitrary: direction.map(vector => ({ kind: "free" as const, vector })) },
    { weight: 1, arbitrary: fc.constant({ kind: "straight" as const }) },
    { weight: 1, arbitrary: fc.constant({ kind: "back" as const }) },
    { weight: 1, arbitrary: fc.tuple(direction, fc.constantFrom(1e-12, 1e-9, 1e-6, 1e-3)).map(([vector, lean]) => ({ kind: "lean" as const, vector, lean })) },
);

const pathArbitrary = (most: number): fc.Arbitrary<Path> => fc.record({
    first: direction,
    steps: fc.array(fc.tuple(stepKind, fc.double({ min: 0.05, max: 1, noNaN: true })), { minLength: 1, maxLength: most - 1 }),
    size: fc.integer({ min: -6, max: 6 }).map(exponent => 10 ** exponent),
    start: fc.tuple(fc.double({ min: -5, max: 5, noNaN: true }), fc.double({ min: -5, max: 5, noNaN: true }), fc.double({ min: -5, max: 5, noNaN: true })),
}).map(({ first, steps, size, start }) => {
    const points: Vec[] = [times(start, size)];
    let heading = first;
    steps.forEach(([step, share]) => {
        if (step.kind === "free") {
            heading = step.vector;
        } else if (step.kind === "back") {
            heading = times(heading, -1);
        } else if (step.kind === "lean") {
            heading = unit(plus(heading, times(step.vector, step.lean)));
        }
        points.push(plus(points[points.length - 1]!, times(heading, share * size)));
    });
    return { points, size };
}).filter(({ points }) => points.every((point, index) => index === 0 || lengthOf(minus(point, points[index - 1]!)) > 0));

const turnsOf = (points: readonly Vec[]): number[] => points.slice(1, -1).map((corner, offset) => angleBetween(minus(corner, points[offset]!), minus(points[offset + 2]!, corner)));

const withoutHairpins = (most: number): fc.Arbitrary<Path> => pathArbitrary(most).filter(({ points }) => turnsOf(points).every(turn => turn < Math.PI - 1e-3));

const frameError = (frame: Inputs.Base.Frame): number => Math.max(
    Math.abs(lengthOf(frame.normal) - 1),
    Math.abs(lengthOf(frame.direction) - 1),
    Math.abs(dotOf(frame.normal, frame.direction)),
);

const columnsOf = (matrix: readonly number[]): [Vec, Vec, Vec, Vec] => [
    [matrix[0]!, matrix[1]!, matrix[2]!],
    [matrix[4]!, matrix[5]!, matrix[6]!],
    [matrix[8]!, matrix[9]!, matrix[10]!],
    [matrix[12]!, matrix[13]!, matrix[14]!],
];

const lineDistance = (point: Vec, from: Vec, along: Vec): number => lengthOf(crossOf(minus(point, from), unit(along)));

const repeatedPositions = (points: readonly Vec[]): number[] =>
    points.flatMap((point, index) => (index > 0 && lengthOf(minus(point, points[index - 1]!)) === 0 ? [index] : []));

const pathLength = (points: readonly Vec[]): number => points.reduce((sum, point, index) => (index === 0 ? sum : sum + lengthOf(minus(point, points[index - 1]!))), 0);

const helixPoints = (radius: number, rise: number, steps: number, turns: number): { points: Vec[], tangents: Vec[], parameters: number[] } => {
    const along = Math.hypot(radius, rise);
    const parameters = Array.from({ length: steps + 1 }, (_, index) => 2 * Math.PI * turns * index / steps);
    return {
        parameters,
        points: parameters.map((t): Vec => [radius * Math.cos(t), radius * Math.sin(t), rise * t]),
        tangents: parameters.map((t): Vec => [-radius * Math.sin(t) / along, radius * Math.cos(t) / along, rise / along]),
    };
};

const minimisingAxis = (radius: number, rise: number, t: number): Vec => {
    const along = Math.hypot(radius, rise);
    const twist = rise * t / along;
    const normal: Vec = [-Math.cos(t), -Math.sin(t), 0];
    const binormal: Vec = [rise * Math.sin(t) / along, -rise * Math.cos(t) / along, radius / along];
    return minus(times(normal, Math.cos(twist)), times(binormal, Math.sin(twist)));
};

const helixArbitrary = fc.record({
    radius: fc.double({ min: 0.5, max: 5, noNaN: true }),
    rise: fc.double({ min: 0.05, max: 2, noNaN: true }),
    steps: fc.integer({ min: 300, max: 900 }),
    turns: fc.double({ min: 0.25, max: 2, noNaN: true }),
});

describe("polyline paths against independent oracles", () => {
    describe("tangents", () => {
        it("should give one unit direction per point, halfway between the segments at a corner and along the next one where the path turns straight back", () => {
            // Act & Assert
            fc.assert(fc.property(pathArbitrary(16), ({ points }) => {
                const tangents = base.polyline.tangents({ polyline: { points } });
                const steps = points.slice(1).map((point, index) => unit(minus(point, points[index]!)));
                expect(tangents).toHaveLength(points.length);
                tangents.forEach((tangent, index) => {
                    expect(Math.abs(lengthOf(tangent) - 1)).toBeLessThanOrEqual(1e-14);
                    const bisector = index === 0 || index === points.length - 1 ? 1 : lengthOf(plus(steps[index - 1]!, steps[index]!));
                    if (bisector > 0.5e-9 && bisector < 2e-9) {
                        return;
                    }
                    const expected = index === 0 ? steps[0]! : index === points.length - 1 ? steps[index - 1]! : bisector > 1e-9 ? unit(plus(steps[index - 1]!, steps[index]!)) : steps[index]!;
                    expect(angleBetween(tangent, expected)).toBeLessThanOrEqual(1e-7);
                });
            }), { seed: SEED, numRuns: RUNS });
        });
    });

    describe("sweepFrames", () => {
        it("should give every point a frame of two unit axes at right angles, the normal along the path", () => {
            // Act & Assert
            fc.assert(fc.property(pathArbitrary(20), direction, ({ points }, firstDirection) => {
                const frames = base.polyline.sweepFrames({ polyline: { points }, firstDirection });
                const tangents = base.polyline.tangents({ polyline: { points } });
                expect(frames).toHaveLength(points.length);
                frames.forEach((frame, index) => {
                    expect(frameError(frame)).toBeLessThanOrEqual(1e-12);
                    expect(frame.origin).toEqual(points[index]);
                    expect(angleBetween(frame.normal, tangents[index]!)).toBeLessThanOrEqual(1e-12);
                });
            }), { seed: SEED, numRuns: RUNS });
        });

        it("should start from the first direction squared to the path", () => {
            // Act & Assert
            fc.assert(fc.property(pathArbitrary(8), direction, ({ points }, firstDirection) => {
                const [first] = base.polyline.sweepFrames({ polyline: { points }, firstDirection });
                const tangent = first!.normal;
                const across = minus(firstDirection, times(tangent, dotOf(firstDirection, tangent)));
                fc.pre(lengthOf(across) > 1e-6);
                expect(angleBetween(first!.direction, unit(across))).toBeLessThanOrEqual(1e-9);
            }), { seed: SEED, numRuns: RUNS });
        });

        it("should turn and move its frames with the path, whatever the turn, so no world axis decides them", () => {
            // Act & Assert
            fc.assert(fc.property(withoutHairpins(14), direction, turnArbitrary, ({ points, size }, firstDirection, turn) => {
                const moved = points.map(point => plus(turned(turn, point), [size, -2 * size, 3 * size]));
                const frames = base.polyline.sweepFrames({ polyline: { points }, firstDirection });
                const movedFrames = base.polyline.sweepFrames({ polyline: { points: moved }, firstDirection: turned(turn, firstDirection) });
                fc.pre(lengthOf(crossOf(firstDirection, frames[0]!.normal)) > 1e-6);
                movedFrames.forEach((frame, index) => {
                    expect(angleBetween(frame.direction, turned(turn, frames[index]!.direction))).toBeLessThanOrEqual(1e-8);
                    expect(angleBetween(frame.normal, turned(turn, frames[index]!.normal))).toBeLessThanOrEqual(1e-8);
                });
            }), { seed: SEED, numRuns: RUNS });
        });

        it("should frame a path scaled by a million or a millionth with the same axes", () => {
            // Act & Assert
            fc.assert(fc.property(withoutHairpins(14), direction, fc.constantFrom(1e-6, 1e6), ({ points }, firstDirection, factor) => {
                const frames = base.polyline.sweepFrames({ polyline: { points }, firstDirection });
                fc.pre(lengthOf(crossOf(firstDirection, frames[0]!.normal)) > 1e-6);
                const scaled = base.polyline.sweepFrames({ polyline: { points: points.map(point => times(point, factor)) }, firstDirection });
                scaled.forEach((frame, index) => expect(angleBetween(frame.direction, frames[index]!.direction)).toBeLessThanOrEqual(1e-9));
            }), { seed: SEED, numRuns: RUNS });
        });

        it("should not flip its axis along a run that is all but straight", () => {
            // Act & Assert
            fc.assert(fc.property(direction, fc.array(fc.tuple(direction, fc.constantFrom(0, 1e-12, 1e-9, 1e-6, 1e-4)), { minLength: 2, maxLength: 40 }), direction, (heading, wobbles, firstDirection) => {
                const points: Vec[] = [[0, 0, 0]];
                wobbles.forEach(([wobble, lean]) => points.push(plus(points[points.length - 1]!, unit(plus(heading, times(wobble, lean))))));
                fc.pre(lengthOf(crossOf(firstDirection, heading)) > 1e-3);
                const frames = base.polyline.sweepFrames({ polyline: { points }, firstDirection });
                frames.slice(1).forEach((frame, index) => expect(angleBetween(frame.direction, frames[index]!.direction)).toBeLessThanOrEqual(1e-3));
            }), { seed: SEED, numRuns: RUNS });
        });

        it("should carry the axis up a sampled helix without the twist its torsion would give, as the rotation-minimising frame does", () => {
            // Act & Assert
            fc.assert(fc.property(helixArbitrary, ({ radius, rise, steps, turns }) => {
                const { points, parameters } = helixPoints(radius, rise, steps, turns);
                const frames = base.polyline.sweepFrames({ polyline: { points }, firstDirection: [-1, 0, 0] });
                const twists = frames.map((frame, index) => {
                    const expected = minimisingAxis(radius, rise, parameters[index]!);
                    const squared = minus(expected, times(frame.normal, dotOf(expected, frame.normal)));
                    return angleBetween(frame.direction, squared);
                });
                expect(Math.max(...twists)).toBeLessThanOrEqual(5e-3);
            }), { seed: SEED, numRuns: 40 });
        });

        it("should match the rotation-minimising frame of a helix to seven digits when given the helix's own tangents", () => {
            // Act & Assert
            fc.assert(fc.property(helixArbitrary, ({ radius, rise, steps, turns }) => {
                const { points, tangents, parameters } = helixPoints(radius, rise, steps, turns);
                const axes = transportedAxes(points, tangents, [-1, 0, 0]);
                axes.forEach((axis, index) => expect(angleBetween(axis, minimisingAxis(radius, rise, parameters[index]!))).toBeLessThanOrEqual(1e-6));
            }), { seed: SEED, numRuns: 40 });
        });
    });

    describe("sweepPlacements", () => {
        it("should place each section square to the path at its ends and mitre it at a bend so the tube keeps its width on both segments", () => {
            // Act & Assert
            fc.assert(fc.property(pathArbitrary(12), direction, fc.tuple(fc.double({ min: -1, max: 1, noNaN: true }), fc.double({ min: -1, max: 1, noNaN: true })), ({ points, size }, firstDirection, [u, v]) => {
                const placements = base.polyline.sweepPlacements({ polyline: { points }, firstDirection });
                const tangents = pathTangents(points);
                placements.forEach((matrix, index) => {
                    const [x, y, z, origin] = columnsOf(matrix);
                    expect([matrix[3], matrix[7], matrix[11], matrix[15]]).toEqual([0, 0, 0, 1]);
                    expect(lengthOf(minus(origin, points[index]!))).toBe(0);
                    expect(angleBetween(z, tangents[index]!)).toBeLessThanOrEqual(1e-12);
                    expect(dotOf(crossOf(x, y), z)).toBeGreaterThan(0);
                    const profile = plus(origin, plus(times(x, u * size), times(y, v * size)));
                    expect(Math.abs(dotOf(minus(profile, origin), z))).toBeLessThanOrEqual(1e-9 * size);
                    if (index === 0 || index === points.length - 1) {
                        expect(Math.abs(lengthOf(minus(profile, origin)) - Math.hypot(u, v) * size)).toBeLessThanOrEqual(1e-9 * size);
                        return;
                    }
                    const incoming = minus(points[index]!, points[index - 1]!);
                    const outgoing = minus(points[index + 1]!, points[index]!);
                    const halfTurn = angleBetween(incoming, outgoing) / 2;
                    if (1 / Math.cos(halfTurn) < MAX_MITRE * 0.99) {
                        expect(Math.abs(lineDistance(profile, points[index]!, incoming) - Math.hypot(u, v) * size)).toBeLessThanOrEqual(1e-8 * size);
                        expect(Math.abs(lineDistance(profile, points[index]!, outgoing) - Math.hypot(u, v) * size)).toBeLessThanOrEqual(1e-8 * size);
                    }
                    expect(lengthOf(x)).toBeLessThanOrEqual(MAX_MITRE * (1 + 1e-12));
                    expect(lengthOf(y)).toBeLessThanOrEqual(MAX_MITRE * (1 + 1e-12));
                });
            }), { seed: SEED, numRuns: RUNS });
        });
    });

    describe("roundCorners", () => {
        it("should keep the ends, give no point twice in a row and never make the path longer", () => {
            // Act & Assert
            fc.assert(fc.property(pathArbitrary(16), fc.double({ min: 0, max: 2, noNaN: true }), fc.integer({ min: 1, max: 16 }), ({ points, size }, share, segments) => {
                const rounded = base.polyline.roundCorners({ polyline: { points }, radius: share * size, segments }).points;
                expect(rounded[0]).toEqual(points[0]);
                expect(rounded[rounded.length - 1]).toEqual(points[points.length - 1]);
                expect(repeatedPositions(rounded)).toEqual([]);
                expect(pathLength(rounded)).toBeLessThanOrEqual(pathLength(points) * (1 + 1e-12));
            }), { seed: SEED, numRuns: RUNS });
        });

        it("should put every point between two corners' arcs on the arc of its corner, at the radius from a centre on the inside of the bend", () => {
            // Act & Assert
            fc.assert(fc.property(withoutHairpins(12), fc.double({ min: 0.01, max: 2, noNaN: true }), fc.integer({ min: 1, max: 12 }), ({ points, size }, share, segments) => {
                const radius = share * size;
                const rounded = base.polyline.roundCorners({ polyline: { points }, radius, segments }).points;
                const arcs = points.slice(1, -1).flatMap((corner, offset) => {
                    const incoming = unit(minus(corner, points[offset]!));
                    const outgoing = unit(minus(points[offset + 2]!, corner));
                    const turn = angleBetween(incoming, outgoing);
                    if (turn < 1e-6 || turn > Math.PI - 1e-6) {
                        return [];
                    }
                    const reach = Math.min(radius * Math.tan(turn / 2), lengthOf(minus(corner, points[offset]!)) / 2, lengthOf(minus(points[offset + 2]!, corner)) / 2);
                    const fitted = reach / Math.tan(turn / 2);
                    const inward = unit(minus(outgoing, incoming));
                    return [{ centre: plus(corner, times(inward, fitted / Math.cos(turn / 2))), fitted, normal: unit(crossOf(incoming, outgoing)) }];
                });
                const stray = rounded.filter(point => !points.some(original => lengthOf(minus(original, point)) <= 1e-9 * size)
                    && !arcs.some(({ centre, fitted, normal }) => Math.abs(lengthOf(minus(point, centre)) - fitted) <= 1e-8 * size && Math.abs(dotOf(minus(point, centre), normal)) <= 1e-8 * size)
                    && !points.slice(1).some((point2, index) => lineDistance(point, points[index]!, minus(point2, points[index]!)) <= 1e-9 * size));
                expect(stray).toEqual([]);
            }), { seed: SEED, numRuns: RUNS });
        });

        it("should give a path the sweep methods and itself take again", () => {
            // Act & Assert
            fc.assert(fc.property(pathArbitrary(12), fc.double({ min: 0, max: 2, noNaN: true }), fc.integer({ min: 1, max: 8 }), direction, ({ points, size }, share, segments, firstDirection) => {
                const rounded = base.polyline.roundCorners({ polyline: { points }, radius: share * size, segments });
                expect(base.polyline.tangents({ polyline: rounded })).toHaveLength(rounded.points.length);
                expect(base.polyline.sweepFrames({ polyline: rounded, firstDirection }).every(frame => frameError(frame) <= 1e-12)).toBe(true);
                expect(base.polyline.sweepPlacements({ polyline: rounded, firstDirection })).toHaveLength(rounded.points.length);
                expect(repeatedPositions(base.polyline.roundCorners({ polyline: rounded, radius: share * size / 10, segments }).points)).toEqual([]);
            }), { seed: SEED, numRuns: RUNS });
        });

        it("should measure the rounded path as the straight pieces left plus the chords of each arc", () => {
            // Act & Assert
            fc.assert(fc.property(withoutHairpins(10), fc.double({ min: 0.01, max: 2, noNaN: true }), fc.integer({ min: 1, max: 12 }), ({ points, size }, share, segments) => {
                const radius = share * size;
                const rounded = base.polyline.roundCorners({ polyline: { points }, radius, segments }).points;
                const expected = points.slice(1, -1).reduce((length, corner, offset) => {
                    const toPrevious = minus(points[offset]!, corner);
                    const toNext = minus(points[offset + 2]!, corner);
                    const turn = angleBetween(times(toPrevious, -1), toNext);
                    if (turn < 1e-6 || turn > Math.PI - 1e-6) {
                        return length;
                    }
                    const reach = Math.min(radius * Math.tan(turn / 2), lengthOf(toPrevious) / 2, lengthOf(toNext) / 2);
                    const fitted = reach / Math.tan(turn / 2);
                    const pieces = Math.max(1, Math.ceil(segments * turn / (Math.PI / 2) - 1e-9));
                    return length - 2 * reach + pieces * 2 * fitted * Math.sin(turn / (2 * pieces));
                }, pathLength(points));
                expect(Math.abs(pathLength(rounded) - expected)).toBeLessThanOrEqual(1e-8 * size * points.length);
            }), { seed: SEED, numRuns: RUNS });
        });

        it("should give the point where two corners' arcs, both shrunk to half the segment between them, meet once", () => {
            // Act & Assert
            fc.assert(fc.property(withoutHairpins(10), fc.double({ min: 0.5, max: 50, noNaN: true }), fc.integer({ min: 1, max: 8 }), ({ points, size }, share, segments) => {
                const radius = share * size;
                const rounded = base.polyline.roundCorners({ polyline: { points }, radius, segments }).points;
                const reachOf = (at: number): number => {
                    const turn = angleBetween(minus(points[at]!, points[at - 1]!), minus(points[at + 1]!, points[at]!));
                    return turn < 1e-6 ? 0 : Math.min(radius * Math.tan(turn / 2), lengthOf(minus(points[at]!, points[at - 1]!)) / 2, lengthOf(minus(points[at + 1]!, points[at]!)) / 2);
                };
                points.slice(1, -2).forEach((corner, offset) => {
                    const next = points[offset + 2]!;
                    const half = lengthOf(minus(next, corner)) / 2;
                    if (reachOf(offset + 1) === half && reachOf(offset + 2) === half) {
                        const middle = times(plus(corner, next), 1 / 2);
                        expect(rounded.filter(point => lengthOf(minus(point, middle)) <= 1e-9 * size)).toHaveLength(1);
                    }
                });
            }), { seed: SEED, numRuns: RUNS });
        });

        it("should give once the point where two shrunk arcs meet on a side whose halves the two corners reach by rounding apart", () => {
            // Arrange
            const side = 5.0000000000000036;
            const threeSides: Vec[] = [[0, 0, 0], [0, 0, side], [0, side, side], [0, side, 0]];

            // Act
            const rounded = base.polyline.roundCorners({ polyline: { points: threeSides }, radius: 50, segments: 1 }).points;

            // Assert
            expect(rounded.filter(point => lengthOf(minus(point, [0, side / 2, side])) <= 1e-9)).toHaveLength(1);
        });

        it("should turn by the same angle in all as the path it rounds, each arc turning only as far as its corner does", () => {
            // Act & Assert
            fc.assert(fc.property(pathArbitrary(10), fc.double({ min: 0.01, max: 2, noNaN: true }), fc.integer({ min: 1, max: 8 }), ({ points, size }, share, segments) => {
                const rounded = base.polyline.roundCorners({ polyline: { points }, radius: share * size, segments }).points;
                const total = (path: readonly Vec[]): number => turnsOf(path).reduce((sum, turn) => sum + turn, 0);
                expect(total(rounded)).toBeLessThanOrEqual(total(points) + 1e-6);
            }), { seed: SEED, numRuns: RUNS });
        });

        it("should round a path that doubles back but for a millionth of a millionth into half a turn at most, not a loop", () => {
            // Arrange
            const almostStraightBack: Vec[] = [[0, 0, 0], [1.9, 0, 0], [1.7, 1e-12, 0]];

            // Act
            const rounded = base.polyline.roundCorners({ polyline: { points: almostStraightBack }, radius: 0.1, segments: 4 }).points;

            // Assert
            expect(turnsOf(rounded).reduce((sum, turn) => sum + turn, 0)).toBeLessThanOrEqual(Math.PI + 1e-6);
        });

        it("should keep a path that doubles back exactly as it is, since no arc touches both of its segments", () => {
            // Arrange
            const straightBack: Vec[] = [[0, 0, 0], [2, 0, 0], [1, 0, 0]];

            // Act
            const rounded = base.polyline.roundCorners({ polyline: { points: straightBack }, radius: 0.1, segments: 4 }).points;

            // Assert
            expect(rounded).toEqual(straightBack);
        });
    });

    describe("a path along a world axis", () => {
        const noiseArbitrary = fc.constantFrom(1e-12, 1e-15, 1e-20, 1e-100, 1e-300);

        it("should frame a path along X the same, by the default first direction, whether or not its points carry noise off the axis", () => {
            // Act & Assert
            fc.assert(fc.property(
                fc.array(fc.double({ min: 0.1, max: 2, noNaN: true }), { minLength: 1, maxLength: 6 }),
                fc.array(fc.tuple(direction, fc.double({ min: 0.1, max: 2, noNaN: true })), { minLength: 0, maxLength: 4 }),
                fc.array(fc.tuple(fc.integer({ min: -1, max: 1 }), fc.integer({ min: -1, max: 1 }), noiseArbitrary), { minLength: 11, maxLength: 11 }),
                (along, turns, noises) => {
                    const clean: Vec[] = [[0, 0, 0]];
                    along.forEach(step => clean.push(plus(clean[clean.length - 1]!, [step, 0, 0])));
                    turns.forEach(([heading, step]) => clean.push(plus(clean[clean.length - 1]!, times(heading, step))));
                    fc.pre(clean.every((point, index) => index === 0 || lengthOf(minus(point, clean[index - 1]!)) > 0) && turnsOf(clean).every(turn => turn < Math.PI - 0.1));
                    const noisy = clean.map(([x, y, z], index): Vec => {
                        const [ySign, zSign, size] = noises[index % noises.length]!;
                        return [x, y + ySign * size, z + zSign * size];
                    });
                    const exact = base.polyline.sweepFrames({ polyline: { points: clean } });
                    const disturbed = base.polyline.sweepFrames({ polyline: { points: noisy } });
                    disturbed.forEach((frame, index) => {
                        expect(lengthOf(minus(frame.direction, exact[index]!.direction))).toBeLessThanOrEqual(1e-9);
                        expect(lengthOf(minus(frame.normal, exact[index]!.normal))).toBeLessThanOrEqual(1e-9);
                    });
                },
            ), { seed: SEED, numRuns: RUNS });
        });

        it("should start a path along X with the same axis whether a millionth of a billionth of noise lies off it in Y, in Z or nowhere", () => {
            // Arrange
            const paths: Vec[][] = [[[0, 0, 0], [10, 0, 0], [10, 10, 0]], [[0, 0, 0], [10, 1e-15, 0], [10, 10, 0]], [[0, 0, 0], [10, 0, 1e-15], [10, 10, 0]]];

            // Act
            const [exact, offInY, offInZ] = paths.map(points => base.polyline.sweepFrames({ polyline: { points } })[0]!.direction);

            // Assert
            expect(lengthOf(minus(offInY!, exact!))).toBeLessThanOrEqual(1e-9);
            expect(lengthOf(minus(offInZ!, exact!))).toBeLessThanOrEqual(1e-9);
        });
    });

    describe("a first direction close to the path", () => {
        it("should square a first direction a millionth of a radian off the path to the path to the last digit", () => {
            // Arrange
            const leaningPath: Vec[] = [[0, 0, 0], [0.04999999999997859, 0, -4.627464379921186e-8], [0.04999999999997859, 0, -0.0500000462746438]];

            // Act
            const [first] = base.polyline.sweepFrames({ polyline: { points: leaningPath }, firstDirection: [1, 0, 0] });

            // Assert
            expect(Math.abs(dotOf(first!.direction, first!.normal))).toBeLessThanOrEqual(1e-15);
        });
    });
});
