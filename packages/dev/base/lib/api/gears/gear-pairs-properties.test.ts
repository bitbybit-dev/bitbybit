import { describe, expect, it } from "vitest";
import fc from "fast-check";
import type * as Inputs from "../inputs";
import { InputError } from "../kernel-calls/errors";
import type { GearOutline, GearPairSizes, GearPairSpec } from "./gear-types";
import { gearOutlinePoints, ringGearOutline, spurGearOutline } from "./gears";
import { gearPair, internalGearPair, planetarySet } from "./gear-pairs";

type Point2 = Inputs.Base.Point2;

interface AngularOutline {
    points: Point2[];
    angles: number[];
    pitch: number;
}

const SEED = 20261018;
const DEGREE = Math.PI / 180;
const FULL_TURN = 2 * Math.PI;
const SIMULATED_STEPS = 150;
const INTERFERING = 5e-4;
const CLEAN = 1e-4;

const involute = (angle: number): number => Math.tan(angle) - angle;
const turnedBy = (point: Point2, angle: number): Point2 => [point[0] * Math.cos(angle) - point[1] * Math.sin(angle), point[0] * Math.sin(angle) + point[1] * Math.cos(angle)];
const minus = (a: Point2, b: Point2): Point2 => [a[0] - b[0], a[1] - b[1]];
const cross = (a: Point2, b: Point2): number => a[0] * b[1] - a[1] * b[0];
const dotOf = (a: Point2, b: Point2): number => a[0] * b[0] + a[1] * b[1];
const radiusOf = (point: Point2): number => Math.hypot(point[0], point[1]);
const angleOf = (point: Point2): number => Math.atan2(point[1], point[0]);
const wrapped = (angle: number): number => angle - FULL_TURN * Math.round(angle / FULL_TURN);

const attempt = <T>(make: () => T): T | InputError => {
    try {
        return make();
    } catch (error) {
        if (error instanceof InputError) {
            return error;
        }
        throw error;
    }
};

const pointsOf = (outline: GearOutline, segments: number): Point2[] => gearOutlinePoints(outline, segments).map(([x, y]): Point2 => [x, y]);

const tipCorners = (outline: GearOutline): Point2[] => {
    const corners: Point2[] = [];
    let from = outline.start;
    outline.moves.forEach(move => {
        if (move.kind === "arc" && move.part === "tip") {
            corners.push(from, move.to);
        }
        from = move.to;
    });
    return corners;
};

const angularOf = (points: readonly Point2[], teeth: number): AngularOutline => {
    const angles: number[] = [];
    points.forEach((point, index) => {
        angles.push(index === 0 ? angleOf(point) : angles[index - 1]! + wrapped(angleOf(point) - angleOf(points[index - 1]!)));
    });
    return { points: [...points], angles, pitch: FULL_TURN / teeth };
};

const chainAround = ({ points, angles, pitch }: AngularOutline, around: number): Point2[] => {
    const half = Math.min(1.5 * pitch, 0.45 * FULL_TURN);
    const low = around - half - FULL_TURN * Math.floor((around - half - angles[0]!) / FULL_TURN);
    let first = 0;
    let last = angles.length;
    while (first < last) {
        const middle = (first + last) >> 1;
        if (angles[middle]! < low) {
            first = middle + 1;
        } else {
            last = middle;
        }
    }
    const chain: Point2[] = [];
    for (let step = 0; step <= points.length; step++) {
        const index = first + step;
        const angle = angles[index % points.length]! + FULL_TURN * Math.floor(index / points.length);
        if (angle > low + 2 * half) {
            break;
        }
        chain.push(points[index % points.length]!);
    }
    return chain;
};

const segmentDistance = (point: Point2, a: Point2, b: Point2): number => {
    const along = minus(b, a);
    const squared = dotOf(along, along);
    const share = squared === 0 ? 0 : Math.min(1, Math.max(0, dotOf(minus(point, a), along) / squared));
    return radiusOf(minus(point, [a[0] + along[0] * share, a[1] + along[1] * share]));
};

const depthInGear = (point: Point2, outline: AngularOutline): number => {
    const chain = chainAround(outline, angleOf(point));
    const loop: Point2[] = [[0, 0], ...chain];
    let total = 0;
    loop.forEach((corner, index) => {
        const a = minus(corner, point);
        const b = minus(loop[(index + 1) % loop.length]!, point);
        total += Math.atan2(cross(a, b), dotOf(a, b));
    });
    const distance = chain.slice(1).reduce((nearest, corner, index) => Math.min(nearest, segmentDistance(point, chain[index]!, corner)), Infinity);
    return (Math.round(total / FULL_TURN) !== 0 ? 1 : -1) * distance;
};

const externalPenetration = (spec: GearPairSpec, sizes: GearPairSizes): number => {
    const toothOf = (teeth: number, shift: number, rotation: number): GearOutline => spurGearOutline({ module: spec.module, teeth, pressureAngle: spec.pressureAngle, profileShift: shift, backlash: 0, addendum: spec.addendum, dedendum: spec.dedendum, rootFillet: 0 }, [0, 0], rotation);
    const outlineA = toothOf(spec.teethA, spec.profileShiftA, 0);
    const outlineB = toothOf(spec.teethB, spec.profileShiftB, spec.teethB % 2 === 0 ? 180 / spec.teethB : 0);
    const gearA = angularOf(pointsOf(outlineA, 8), spec.teethA);
    const gearB = angularOf(pointsOf(outlineB, 8), spec.teethB);
    const tipA = spec.module * (spec.teethA / 2 + spec.addendum + spec.profileShiftA);
    const tipB = spec.module * (spec.teethB / 2 + spec.addendum + spec.profileShiftB);
    const a = sizes.centreDistance;
    let worst = -Infinity;
    for (let step = 0; step < SIMULATED_STEPS; step++) {
        const theta = FULL_TURN / spec.teethA * step / SIMULATED_STEPS;
        const phi = theta * spec.teethA / spec.teethB;
        tipCorners(outlineA).forEach(corner => {
            const world = turnedBy(corner, theta);
            const local = turnedBy([world[0] - a, world[1]], phi);
            if (radiusOf(local) < tipB) {
                worst = Math.max(worst, depthInGear(local, gearB));
            }
        });
        tipCorners(outlineB).forEach(corner => {
            const moved = turnedBy(corner, -phi);
            const local = turnedBy([moved[0] + a, moved[1]], -theta);
            if (radiusOf(local) < tipA) {
                worst = Math.max(worst, depthInGear(local, gearA));
            }
        });
    }
    return worst;
};

const internalPenetration = (module: number, pinionTeeth: number, ringTeeth: number, pressureAngle: number, addendum: number): number => {
    const a = module * (ringTeeth - pinionTeeth) / 2;
    const pinion = spurGearOutline({ module, teeth: pinionTeeth, pressureAngle, profileShift: 0, backlash: 0, addendum, dedendum: addendum + 0.25, rootFillet: 0 }, [0, 0], 0);
    const ring = ringGearOutline({ module, teeth: ringTeeth, pressureAngle, backlash: 0, addendum, dedendum: addendum + 0.25, rootFillet: 0 }, [0, 0], 180 / ringTeeth);
    const pinionGear = angularOf(pointsOf(pinion, 8), pinionTeeth);
    const ringGear = angularOf(pointsOf(ring, 12), ringTeeth);
    const pinionTip = module * (pinionTeeth / 2 + addendum);
    const ringTip = module * (ringTeeth / 2 - addendum);
    let worst = -Infinity;
    for (let step = 0; step < SIMULATED_STEPS; step++) {
        const theta = FULL_TURN / pinionTeeth * step / SIMULATED_STEPS;
        const phi = theta * pinionTeeth / ringTeeth;
        tipCorners(pinion).forEach(corner => {
            const moved = turnedBy(corner, theta);
            const local = turnedBy([moved[0] + a, moved[1]], -phi);
            if (radiusOf(local) > ringTip) {
                worst = Math.max(worst, -depthInGear(local, ringGear));
            }
        });
        tipCorners(ring).forEach(corner => {
            const moved = turnedBy(corner, phi);
            const local = turnedBy([moved[0] - a, moved[1]], -theta);
            if (radiusOf(local) < pinionTip) {
                worst = Math.max(worst, depthInGear(local, pinionGear));
            }
        });
    }
    return worst;
};

const pairArbitrary: fc.Arbitrary<GearPairSpec> = fc.record({
    module: fc.oneof(fc.constant(1), fc.integer({ min: -3, max: 3 }).map(exponent => 10 ** exponent)),
    teethA: fc.integer({ min: 3, max: 200 }),
    teethB: fc.integer({ min: 3, max: 200 }),
    pressureAngle: fc.oneof(fc.constantFrom(14.5, 20, 25), fc.double({ min: 5, max: 40, noNaN: true })),
    profileShiftA: fc.oneof(fc.constant(0), fc.double({ min: -1.5, max: 3, noNaN: true })),
    profileShiftB: fc.oneof(fc.constant(0), fc.double({ min: -1.5, max: 3, noNaN: true })),
    addendum: fc.oneof(fc.constant(1), fc.double({ min: 0.5, max: 1.5, noNaN: true })),
    dedendum: fc.oneof(fc.constant(1.25), fc.double({ min: 0.5, max: 2, noNaN: true })),
});

const rollsOf = (spec: GearPairSpec, sizes: GearPairSizes): { rollA: number, rollB: number, line: number } => {
    const alpha = spec.pressureAngle * DEGREE;
    const roll = (teeth: number, shift: number): number => Math.sqrt((spec.module * (teeth / 2 + spec.addendum + shift)) ** 2 - (spec.module * teeth / 2 * Math.cos(alpha)) ** 2);
    return { rollA: roll(spec.teethA, spec.profileShiftA), rollB: roll(spec.teethB, spec.profileShiftB), line: sizes.centreDistance * Math.sin(sizes.workingPressureAngle * DEGREE) };
};

describe("gear pairs against independent oracles", () => {
    describe("gearPair", () => {
        it("should refuse a pair only as an InputError, and otherwise give finite sizes working below 45 degrees", () => {
            // Act & Assert
            fc.assert(fc.property(pairArbitrary, (spec) => {
                const sizes = attempt(() => gearPair(spec));
                if (sizes instanceof InputError) {
                    return;
                }
                expect(Object.values(sizes).filter(value => typeof value === "number").every(Number.isFinite)).toBe(true);
                expect(sizes.workingPressureAngle).toBeGreaterThan(0);
                expect(sizes.workingPressureAngle).toBeLessThanOrEqual(45);
            }), { seed: SEED, numRuns: 500 });
        });

        it("should work at the pressure angle whose involute the shifts call for, to the last digits, and at the centre distance that angle gives", () => {
            // Act & Assert
            fc.assert(fc.property(pairArbitrary, (spec) => {
                const sizes = attempt(() => gearPair(spec));
                fc.pre(!(sizes instanceof InputError));
                const pair = sizes;
                const alpha = spec.pressureAngle * DEGREE;
                const working = pair.workingPressureAngle * DEGREE;
                const wanted = 2 * Math.tan(alpha) * (spec.profileShiftA + spec.profileShiftB) / (spec.teethA + spec.teethB) + involute(alpha);
                expect(Math.abs(involute(working) - wanted)).toBeLessThanOrEqual(1e-12 * Math.max(1, wanted));
                expect(pair.centreDistance).toBeCloseTo(spec.module * (spec.teethA + spec.teethB) / 2 * Math.cos(alpha) / Math.cos(working), 9);
            }), { seed: SEED, numRuns: 500 });
        });

        it("should never count more contact than the unclipped line of action gives, and exactly that when the tips stay on the involutes", () => {
            // Act & Assert
            fc.assert(fc.property(pairArbitrary, (spec) => {
                const sizes = attempt(() => gearPair(spec));
                fc.pre(!(sizes instanceof InputError));
                const pair = sizes;
                const { rollA, rollB, line } = rollsOf(spec, pair);
                const unclipped = Math.max(0, rollA + rollB - line) / (Math.PI * spec.module * Math.cos(spec.pressureAngle * DEGREE));
                expect(pair.contactRatio).toBeLessThanOrEqual(unclipped + 1e-12);
                expect(pair.contactRatio).toBeGreaterThanOrEqual(0);
                expect(pair.interferes).toBe(rollA > line || rollB > line);
                if (!pair.interferes) {
                    expect(pair.contactRatio).toBeCloseTo(unclipped, 12);
                }
            }), { seed: SEED, numRuns: 500 });
        });

        it("should move shifted gears apart by less than the shifts add up to, and shorten the tips by exactly what keeps the unshifted clearance", () => {
            // Act & Assert
            fc.assert(fc.property(pairArbitrary, (spec) => {
                const sizes = attempt(() => gearPair(spec));
                fc.pre(!(sizes instanceof InputError));
                const pair = sizes;
                const moved = (pair.centreDistance - spec.module * (spec.teethA + spec.teethB) / 2) / spec.module;
                const shifts = spec.profileShiftA + spec.profileShiftB;
                const unshifted = spec.module * (spec.dedendum - spec.addendum);
                expect(moved).toBeLessThanOrEqual(shifts + 1e-12);
                expect(pair.tipShortening).toBeCloseTo(spec.module * (shifts - moved), 9);
                expect(pair.clearance + pair.tipShortening).toBeCloseTo(unshifted, 9);
            }), { seed: SEED, numRuns: 500 });
        });

        it("should flag a pair exactly when a tip corner cuts into the other gear while the two turn in mesh", () => {
            // Act & Assert
            fc.assert(fc.property(fc.integer({ min: 6, max: 40 }), fc.integer({ min: 6, max: 60 }), fc.constantFrom(14.5, 20, 25), fc.double({ min: -0.4, max: 0.6, noNaN: true }), (teethA, teethB, pressureAngle, shiftA) => {
                const spec: GearPairSpec = { module: 1, teethA, teethB, pressureAngle, profileShiftA: shiftA, profileShiftB: -shiftA, addendum: 1, dedendum: 1.25 };
                const sizes = attempt(() => gearPair(spec));
                fc.pre(!(sizes instanceof InputError));
                const pair = sizes;
                const { rollA, rollB, line } = rollsOf(spec, pair);
                fc.pre(pair.clearance > 0.1 && Math.abs(rollA - line) > 0.3 && Math.abs(rollB - line) > 0.3);
                const penetration = attempt(() => externalPenetration(spec, pair));
                fc.pre(!(penetration instanceof InputError));
                expect(pair.interferes ? penetration > INTERFERING : penetration < CLEAN).toBe(true);
            }), { seed: SEED, numRuns: 30 });
        });
    });

    describe("internalGearPair", () => {
        it("should refuse a pair only as an InputError, and otherwise give a finite contact ratio no larger than its unclipped value", () => {
            // Act & Assert
            fc.assert(fc.property(fc.integer({ min: 3, max: 200 }), fc.integer({ min: 1, max: 200 }), fc.oneof(fc.constantFrom(14.5, 20, 25), fc.double({ min: 5, max: 40, noNaN: true })), fc.double({ min: 0.5, max: 1.5, noNaN: true }), (pinionTeeth, extra, pressureAngle, addendum) => {
                const ringTeeth = pinionTeeth + extra;
                const sizes = attempt(() => internalGearPair({ module: 1, pinionTeeth, ringTeeth, pressureAngle, addendum }));
                if (sizes instanceof InputError) {
                    return;
                }
                const alpha = pressureAngle * DEGREE;
                const line = (ringTeeth - pinionTeeth) / 2 * Math.sin(alpha);
                const pinionRoll = Math.sqrt((pinionTeeth / 2 + addendum) ** 2 - (pinionTeeth / 2 * Math.cos(alpha)) ** 2);
                const ringRoll = Math.sqrt((ringTeeth / 2 - addendum) ** 2 - (ringTeeth / 2 * Math.cos(alpha)) ** 2);
                const unclipped = Math.max(0, pinionRoll - ringRoll + line) / (Math.PI * Math.cos(alpha));
                expect(Number.isFinite(sizes.contactRatio)).toBe(true);
                expect(sizes.contactRatio).toBeLessThanOrEqual(unclipped + 1e-12);
                expect(sizes.centreDistance).toBe((ringTeeth - pinionTeeth) / 2);
            }), { seed: SEED, numRuns: 500 });
        });

        it("should flag a gear in a ring exactly when a tip corner of one cuts into the other while they turn in mesh", () => {
            // Act & Assert
            fc.assert(fc.property(fc.integer({ min: 12, max: 50 }), fc.integer({ min: 2, max: 40 }), fc.constantFrom(20, 25), (pinionTeeth, extra, pressureAngle) => {
                const ringTeeth = pinionTeeth + extra;
                const sizes = attempt(() => internalGearPair({ module: 1, pinionTeeth, ringTeeth, pressureAngle, addendum: 1 }));
                fc.pre(!(sizes instanceof InputError));
                const alpha = pressureAngle * DEGREE;
                const line = (ringTeeth - pinionTeeth) / 2 * Math.sin(alpha);
                const ringRoll = Math.sqrt((ringTeeth / 2 - 1) ** 2 - (ringTeeth / 2 * Math.cos(alpha)) ** 2);
                fc.pre(Math.abs(ringRoll - line) > 0.3);
                const penetration = attempt(() => internalPenetration(1, pinionTeeth, ringTeeth, pressureAngle, 1));
                fc.pre(!(penetration instanceof InputError) && (penetration > INTERFERING || penetration < CLEAN));
                expect(sizes.interferes).toBe(penetration > INTERFERING);
            }), { seed: SEED, numRuns: 20 });
        });

        it("should flag 31 teeth in a 34 tooth ring, whose tips the simulation shows cutting deep into the ring's on the way out of mesh, and pass 30 in 39", () => {
            // Act
            const close = internalGearPair({ module: 1, pinionTeeth: 31, ringTeeth: 34, pressureAngle: 20, addendum: 1 });
            const roomy = internalGearPair({ module: 1, pinionTeeth: 30, ringTeeth: 39, pressureAngle: 20, addendum: 1 });

            // Assert
            expect([close.interferes, internalPenetration(1, 31, 34, 20, 1) > 0.1]).toEqual([true, true]);
            expect([roomy.interferes, internalPenetration(1, 30, 39, 20, 1) < CLEAN]).toEqual([false, true]);
        });
    });

    describe("planetarySet", () => {
        it("should call evenly spaced planets assemblable exactly when the sun's and the ring's teeth together divide by the planets", () => {
            // Act & Assert
            fc.assert(fc.property(fc.integer({ min: 6, max: 120 }), fc.integer({ min: 6, max: 120 }), fc.integer({ min: 1, max: 12 }), (sunTeeth, planetTeeth, planets) => {
                const set = attempt(() => planetarySet({ module: 1, sunTeeth, planetTeeth, planets, pressureAngle: 20, addendum: 1 }));
                fc.pre(!(set instanceof InputError));
                const ringTeeth = sunTeeth + 2 * planetTeeth;
                expect(set.assemblable).toBe((sunTeeth + ringTeeth) % planets === 0);
            }), { seed: SEED, numRuns: 500 });
        });

        it("should call planets clear exactly when no two of their tip circles overlap, measured between the centres it gives", () => {
            // Act & Assert
            fc.assert(fc.property(fc.integer({ min: 6, max: 120 }), fc.integer({ min: 6, max: 120 }), fc.integer({ min: 1, max: 12 }), fc.double({ min: 0.5, max: 1.5, noNaN: true }), (sunTeeth, planetTeeth, planets, addendum) => {
                const set = attempt(() => planetarySet({ module: 1, sunTeeth, planetTeeth, planets, pressureAngle: 20, addendum }));
                fc.pre(!(set instanceof InputError));
                const { planetCentres, planetsClear, centreDistance } = set;
                const tip = planetTeeth / 2 + addendum;
                const nearest = planetCentres.reduce((closest, centre, index) => planetCentres.slice(index + 1).reduce((least, other) => Math.min(least, Math.hypot(centre[0] - other[0], centre[1] - other[1])), closest), Infinity);
                fc.pre(Math.abs(nearest - 2 * tip) > 1e-9);
                expect(planetsClear).toBe(nearest > 2 * tip);
                planetCentres.forEach(centre => expect(Math.hypot(centre[0], centre[1])).toBeCloseTo(centreDistance, 9));
            }), { seed: SEED, numRuns: 500 });
        });

        it("should turn the ring and every planet so their teeth mesh without cutting into each other when the set is assemblable", () => {
            // Act & Assert
            fc.assert(fc.property(fc.integer({ min: 12, max: 40 }), fc.integer({ min: 12, max: 40 }), fc.integer({ min: 2, max: 6 }), (sunTeeth, planetTeeth, planets) => {
                const set = attempt(() => planetarySet({ module: 1, sunTeeth, planetTeeth, planets, pressureAngle: 20, addendum: 1 }));
                fc.pre(!(set instanceof InputError));
                const { assemblable, planetsClear, interferes, planetCentres, planetRotations, ringRotation, ringTeeth } = set;
                fc.pre(planetsClear && !interferes);
                const shared = { module: 1, pressureAngle: 20, backlash: 0.02, addendum: 1, dedendum: 1.25, rootFillet: 0 };
                const sun = spurGearOutline({ ...shared, teeth: sunTeeth, profileShift: 0 });
                const ring = ringGearOutline({ ...shared, teeth: ringTeeth }, [0, 0], ringRotation);
                const sunGear = angularOf(pointsOf(sun, 4), sunTeeth);
                const ringGear = angularOf(pointsOf(ring, 8), ringTeeth);
                const depths = planetCentres.flatMap((centre, index) => {
                    const planet = spurGearOutline({ ...shared, teeth: planetTeeth, profileShift: 0 }, [centre[0], centre[1]], planetRotations[index]);
                    const planetGear = angularOf(pointsOf(planet, 4).map(([x, y]): Point2 => [x - centre[0], y - centre[1]]), planetTeeth);
                    const corners = tipCorners(planet);
                    const intoSun = corners.filter(point => radiusOf(point) < sunTeeth / 2 + 1).map(point => depthInGear(point, sunGear));
                    const intoRing = corners.filter(point => radiusOf(point) > ringTeeth / 2 - 1).map(point => -depthInGear(point, ringGear));
                    const sunIntoPlanet = tipCorners(sun).map(([x, y]): Point2 => [x - centre[0], y - centre[1]]).filter(point => radiusOf(point) < planetTeeth / 2 + 1).map(point => depthInGear(point, planetGear));
                    const ringIntoPlanet = tipCorners(ring).map(([x, y]): Point2 => [x - centre[0], y - centre[1]]).filter(point => radiusOf(point) < planetTeeth / 2 + 1).map(point => depthInGear(point, planetGear));
                    return [...intoSun, ...intoRing, ...sunIntoPlanet, ...ringIntoPlanet];
                });
                const worst = Math.max(...depths);
                expect(assemblable ? worst < CLEAN : worst > 0.05).toBe(true);
            }), { seed: SEED, numRuns: 30 });
        });
    });
});
