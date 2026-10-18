import { describe, expect, it } from "vitest";
import fc from "fast-check";
import type * as Inputs from "../inputs";
import { InputError } from "../kernel-calls/errors";
import type { BevelGearSpec, GearOutline, HelicalGearSpec, RackOutline, RackSpec, RingGearSpec, SpurGearSpec } from "./gear-types";
import { gearOutlinePoints, ringGearOutline, ringGearSizes, spurGearOutline, spurGearSizes } from "./gears";
import { helicalGearOutline, helicalGearSizes } from "./helical-gears";
import { bevelGearOutline, bevelGearSizes } from "./bevel-gears";
import { rackOutline, rackSizes } from "./racks";
import { BaseBitByBit } from "../services/base-bitbybit";

type Point2 = Inputs.Base.Point2;
type Point3 = Inputs.Base.Point3;

interface Accepted<T> {
    value: T | undefined;
    refusal: unknown;
}

const base = new BaseBitByBit();
const SEED = 20261018;
const FULL_TURN = 2 * Math.PI;

const attempt = <T>(make: () => T): Accepted<T> => {
    try {
        return { value: make(), refusal: undefined };
    } catch (error) {
        return { value: undefined, refusal: error };
    }
};

const radiusOf = (point: readonly number[]): number => Math.hypot(point[0]!, point[1]!);

const flat = (points: readonly Point3[]): Point2[] => points.map(([x, y]) => [x, y]);

const steps = (points: readonly Point2[]): number[] => points.map((point, index) => {
    const next = points[(index + 1) % points.length]!;
    const turn = Math.atan2(point[0] * next[1] - point[1] * next[0], point[0] * next[0] + point[1] * next[1]);
    return turn;
});

const repeats = (points: readonly Point2[]): number[] =>
    points.flatMap((point, index) => {
        const next = points[(index + 1) % points.length]!;
        return point[0] === next[0] && point[1] === next[1] ? [index] : [];
    });

const lastPointOf = (outline: GearOutline | RackOutline): Point2 => outline.moves[outline.moves.length - 1]!.to;

const tipArcs = (outline: GearOutline, part: string): number => outline.moves.filter(move => move.kind === "arc" && move.part === part).length;

const moduleArbitrary = fc.oneof(fc.constantFrom(1, 0.2, 2.5), fc.integer({ min: -3, max: 3 }).map(exponent => 10 ** exponent));

const teethArbitrary = fc.oneof({ weight: 4, arbitrary: fc.integer({ min: 3, max: 80 }) }, { weight: 1, arbitrary: fc.integer({ min: 81, max: 1000 }) });

const spurArbitrary: fc.Arbitrary<SpurGearSpec> = fc.record({
    module: moduleArbitrary,
    teeth: teethArbitrary,
    pressureAngle: fc.oneof(fc.constantFrom(14.5, 20, 25, 1e-3, 44.999), fc.double({ min: 5, max: 40, noNaN: true })),
    profileShift: fc.oneof(fc.constant(0), fc.double({ min: -1.5, max: 1.5, noNaN: true })),
    backlash: fc.oneof(fc.constant(0), fc.double({ min: 0, max: 0.3, noNaN: true })),
    addendum: fc.oneof(fc.constant(1), fc.double({ min: 0.3, max: 1.5, noNaN: true })),
    dedendum: fc.oneof(fc.constant(1.25), fc.double({ min: 0.3, max: 2, noNaN: true })),
    rootFillet: fc.oneof(fc.constantFrom(0, 0.38), fc.double({ min: 1e-9, max: 1, noNaN: true })),
}).map(spec => ({ ...spec, backlash: spec.backlash * spec.module }));

const tinyFillet = fc.oneof(fc.constantFrom(Number.MIN_VALUE, 1e-300, 1e-18, 1e-16, 1e-15), fc.double({ min: Number.MIN_VALUE, max: 1e-14, noNaN: true }));

const ringArbitrary: fc.Arbitrary<RingGearSpec> = spurArbitrary.map(({ module, teeth, pressureAngle, backlash, addendum, dedendum, rootFillet }) => ({ module, teeth: teeth + 20, pressureAngle, backlash, addendum, dedendum, rootFillet }));

const expectStarShaped = (points: readonly Point2[], centre: Point2): void => {
    const moved = points.map(([x, y]): Point2 => [x - centre[0], y - centre[1]]);
    const turns = steps(moved);
    expect(Math.min(...turns)).toBeGreaterThanOrEqual(-1e-12);
    expect(turns.reduce((sum, turn) => sum + turn, 0)).toBeCloseTo(FULL_TURN, 9);
};

describe("gear outlines against independent invariants", () => {
    describe("spur gears", () => {
        it("should refuse a spec only as an InputError, and otherwise give finite sizes ordered root, base and pitch, tip", () => {
            // Act & Assert
            fc.assert(fc.property(spurArbitrary, (spec) => {
                const { value: sizes, refusal } = attempt(() => spurGearSizes(spec));
                if (sizes === undefined) {
                    expect(refusal).toBeInstanceOf(InputError);
                    return;
                }
                expect(Object.values(sizes).every(Number.isFinite)).toBe(true);
                expect(sizes.rootRadius).toBeLessThan(sizes.tipRadius);
                expect(sizes.baseRadius).toBeLessThan(sizes.pitchRadius);
                expect(sizes.halfToothAngle).toBeGreaterThan(0);
            }), { seed: SEED, numRuns: 400 });
        });

        it("should draw any outline it accepts closed, one tip arc per tooth, between its root and tip circles, turning one way round its centre", () => {
            // Act & Assert
            fc.assert(fc.property(spurArbitrary, fc.double({ min: -360, max: 360, noNaN: true }), fc.integer({ min: 1, max: 3 }), (spec, rotation, segments) => {
                const { value: outline, refusal } = attempt(() => spurGearOutline(spec, [0, 0], rotation));
                if (outline === undefined) {
                    expect(refusal).toBeInstanceOf(InputError);
                    return;
                }
                const sizes = spurGearSizes(spec);
                const points = flat(gearOutlinePoints(outline, segments));
                const slack = 2e-4 * spec.module;
                expect(lastPointOf(outline)).toEqual(outline.start);
                expect(tipArcs(outline, "tip")).toBe(spec.teeth);
                expect(points.every(point => Number.isFinite(point[0]) && Number.isFinite(point[1]))).toBe(true);
                expect(Math.min(...points.map(radiusOf))).toBeGreaterThanOrEqual(sizes.rootRadius - slack);
                expect(Math.max(...points.map(radiusOf))).toBeLessThanOrEqual(sizes.tipRadius + slack);
                expectStarShaped(points, [0, 0]);
            }), { seed: SEED, numRuns: 150 });
        });

        it("should give points the flat-outline methods take: none twice in a row, the area between the root and tip circles' and the centre inside", () => {
            // Act & Assert
            fc.assert(fc.property(spurArbitrary, (spec) => {
                const { value: outline } = attempt(() => spurGearOutline(spec));
                fc.pre(outline !== undefined && spec.teeth <= 200);
                const sizes = spurGearSizes(spec);
                const points = flat(gearOutlinePoints(outline, 2));
                const area = base.polyline.signedArea2d({ points });
                expect(repeats(points)).toEqual([]);
                expect(area).toBeGreaterThan(Math.PI * sizes.rootRadius ** 2);
                expect(area).toBeLessThan(Math.PI * sizes.tipRadius ** 2);
                expect(base.polyline.isPointInside2d({ points, point: [0, 0] })).toBe(true);
            }), { seed: SEED, numRuns: 150 });
        });

        it("should draw through the service the same points the outline gives, turned by its rotation", () => {
            // Act & Assert
            fc.assert(fc.property(fc.integer({ min: 6, max: 60 }), fc.double({ min: 0.1, max: 5, noNaN: true }), fc.double({ min: -90, max: 90, noNaN: true }), (teeth, module, rotation) => {
                const fromService = base.engineering.mechanical.gears.spurGearOutline({ teeth, module, rotation, segments: 2 });
                const turnedBack = fromService.map(([x, y]): Point2 => {
                    const angle = -rotation * Math.PI / 180;
                    return [x * Math.cos(angle) - y * Math.sin(angle), x * Math.sin(angle) + y * Math.cos(angle)];
                });
                const unturned = flat(base.engineering.mechanical.gears.spurGearOutline({ teeth, module, segments: 2 }));
                expect(turnedBack).toHaveLength(unturned.length);
                turnedBack.forEach((point, index) => expect(Math.hypot(point[0] - unturned[index]![0], point[1] - unturned[index]![1])).toBeLessThanOrEqual(1e-9 * module * teeth));
            }), { seed: SEED, numRuns: 60 });
        });
    });

    describe("tips inside the base circle", () => {
        it("should never draw a spur gear's teeth past its tip circle, refusing one whose tips lie inside its base circle", () => {
            // Act & Assert
            fc.assert(fc.property(fc.integer({ min: 3, max: 12 }), fc.double({ min: 0.001, max: 30, noNaN: true }), fc.double({ min: -1.5, max: 0, noNaN: true }), fc.double({ min: 0.3, max: 1.2, noNaN: true }), (teeth, pressureAngle, profileShift, addendum) => {
                const spec: SpurGearSpec = { module: 1, teeth, pressureAngle, profileShift, backlash: 0, addendum, dedendum: 1.25, rootFillet: 0 };
                const { value: outline, refusal } = attempt(() => spurGearOutline(spec));
                if (outline === undefined) {
                    expect(refusal).toBeInstanceOf(InputError);
                    return;
                }
                const sizes = spurGearSizes(spec);
                expect(Math.max(...flat(gearOutlinePoints(outline, 2)).map(radiusOf))).toBeLessThanOrEqual(sizes.tipRadius + 2e-4);
            }), { seed: SEED, numRuns: 300 });
        });

        it("should refuse a 6 tooth gear at 20 degrees shifted in by 1.2, whose tips lie inside its base circle, rather than draw its teeth out to the base circle", () => {
            // Arrange
            const tipsInside: SpurGearSpec = { module: 1, teeth: 6, pressureAngle: 20, profileShift: -1.2, backlash: 0, addendum: 1, dedendum: 1.25, rootFillet: 0 };

            // Act
            const drawn = (): GearOutline => spurGearOutline(tipsInside);

            // Assert
            expect(spurGearSizes(tipsInside).tipRadius).toBeLessThan(spurGearSizes(tipsInside).baseRadius);
            expect(drawn).toThrow(InputError);
        });
    });

    describe("root fillets of almost nothing", () => {
        it("should draw a spur gear with a root fillet a hair above nothing as it draws one with none, never crashing and never repeating a point", () => {
            // Act & Assert
            fc.assert(fc.property(spurArbitrary, tinyFillet, (spur, rootFillet) => {
                const spec = { ...spur, rootFillet, teeth: Math.min(spur.teeth, 120) };
                const { value: outline, refusal } = attempt(() => spurGearOutline(spec));
                const { value: sharp } = attempt(() => spurGearOutline({ ...spec, rootFillet: 0 }));
                fc.pre(sharp !== undefined);
                expect(refusal).toBeUndefined();
                expect(repeats(flat(gearOutlinePoints(outline!, 2)))).toEqual([]);
            }), { seed: SEED, numRuns: 100 });
        });

        it("should draw a rack with a root fillet a hair above nothing without repeating a point", () => {
            // Act & Assert
            fc.assert(fc.property(fc.integer({ min: 1, max: 30 }), fc.double({ min: 10, max: 30, noNaN: true }), tinyFillet, (teeth, pressureAngle, rootFillet) => {
                const outline = rackOutline({ module: 1, teeth, pressureAngle, backlash: 0, addendum: 1, dedendum: 1.25, rootFillet, height: 3 });
                expect(repeats(flat(gearOutlinePoints(outline, 2)))).toEqual([]);
            }), { seed: SEED, numRuns: 100 });
        });

        it("should not crash on an 83 tooth gear at 25 degrees with a root fillet of a billionth of a billionth of the module", () => {
            // Arrange
            const almostSharp: SpurGearSpec = { module: 1, teeth: 83, pressureAngle: 25, profileShift: 0, backlash: 0, addendum: 1, dedendum: 1.25, rootFillet: 1e-18 };

            // Act
            const drawn = (): GearOutline => spurGearOutline(almostSharp);

            // Assert
            expect(drawn).not.toThrow();
        });

        it("should give no point twice in a row for a 40 tooth gear with a root fillet of a millionth of a billionth of the module", () => {
            // Arrange
            const almostSharp: SpurGearSpec = { module: 1, teeth: 40, pressureAngle: 20, profileShift: 0, backlash: 0, addendum: 1, dedendum: 1.25, rootFillet: 1e-15 };

            // Act
            const points = flat(gearOutlinePoints(spurGearOutline(almostSharp), 2));

            // Assert
            expect(repeats(points)).toEqual([]);
        });
    });

    describe("ring gears", () => {
        it("should refuse a ring only as an InputError, and otherwise draw it closed between its tip and root circles, turning one way round its centre", () => {
            // Act & Assert
            fc.assert(fc.property(ringArbitrary, fc.double({ min: -360, max: 360, noNaN: true }), (spec, rotation) => {
                const { value: outline, refusal } = attempt(() => ringGearOutline(spec, [3, -2], rotation));
                if (outline === undefined) {
                    expect(refusal).toBeInstanceOf(InputError);
                    return;
                }
                const sizes = ringGearSizes(spec);
                const points = flat(gearOutlinePoints(outline, 2));
                const slack = 2e-4 * spec.module;
                const radii = points.map(([x, y]) => Math.hypot(x - 3, y + 2));
                expect(lastPointOf(outline)).toEqual(outline.start);
                expect(tipArcs(outline, "tip")).toBe(spec.teeth);
                expect(Math.min(...radii)).toBeGreaterThanOrEqual(sizes.tipRadius - slack);
                expect(Math.max(...radii)).toBeLessThanOrEqual(sizes.rootRadius + slack);
                expectStarShaped(points, [3, -2]);
                expect(repeats(points)).toEqual([]);
            }), { seed: SEED, numRuns: 150 });
        });
    });

    describe("helical gears", () => {
        it("should draw the section square to the axis as the spur gear of the transverse module, closed and between its circles", () => {
            // Act & Assert
            fc.assert(fc.property(spurArbitrary, fc.double({ min: -44, max: 44, noNaN: true }), (spur, helixAngle) => {
                const spec: HelicalGearSpec = { ...spur, helixAngle };
                const { value: outline, refusal } = attempt(() => helicalGearOutline(spec));
                if (outline === undefined) {
                    expect(refusal).toBeInstanceOf(InputError);
                    return;
                }
                const sizes = helicalGearSizes(spec);
                const points = flat(gearOutlinePoints(outline, 1));
                const slack = 2e-4 * sizes.transverseModule;
                expect(Number.isFinite(sizes.twist)).toBe(true);
                expect(sizes.transverseModule).toBeGreaterThanOrEqual(spec.module);
                expect(Math.min(...points.map(radiusOf))).toBeGreaterThanOrEqual(sizes.rootRadius - slack);
                expect(Math.max(...points.map(radiusOf))).toBeLessThanOrEqual(sizes.tipRadius + slack);
                expectStarShaped(points, [0, 0]);
            }), { seed: SEED, numRuns: 150 });
        });
    });

    describe("bevel gears", () => {
        const bevelOf = (spur: SpurGearSpec, mateTeeth: number, shaftAngle: number): BevelGearSpec => ({
            module: spur.module, teeth: Math.min(spur.teeth, 120), mateTeeth, shaftAngle, pressureAngle: spur.pressureAngle, backlash: spur.backlash, addendum: spur.addendum, dedendum: spur.dedendum, rootFillet: spur.rootFillet,
        });

        it("should refuse a bevel gear only as an InputError, and otherwise give an outline of finite points", () => {
            // Act & Assert
            fc.assert(fc.property(spurArbitrary, fc.integer({ min: 3, max: 120 }), fc.double({ min: 1, max: 179, noNaN: true }), (spur, mateTeeth, shaftAngle) => {
                const { value: outline, refusal } = attempt(() => bevelGearOutline(bevelOf(spur, mateTeeth, shaftAngle)));
                if (outline === undefined) {
                    expect(refusal).toBeInstanceOf(InputError);
                    return;
                }
                expect(flat(gearOutlinePoints(outline, 1)).filter(point => !Number.isFinite(point[0]) || !Number.isFinite(point[1]))).toEqual([]);
            }), { seed: SEED, numRuns: 150 });
        });

        it("should give small gears on wide pitch cones, as obtuse shaft angles make them, an outline turning once round its centre or an InputError", () => {
            // Act & Assert
            fc.assert(fc.property(fc.integer({ min: 6, max: 24 }), fc.integer({ min: 6, max: 24 }), fc.double({ min: 90, max: 175, noNaN: true }), fc.double({ min: 14.5, max: 25, noNaN: true }), (teeth, mateTeeth, shaftAngle, pressureAngle) => {
                const spec: BevelGearSpec = { module: 1, teeth, mateTeeth, shaftAngle, pressureAngle, backlash: 0, addendum: 1, dedendum: 1.25, rootFillet: 0.3 };
                const { value: outline, refusal } = attempt(() => bevelGearOutline(spec));
                if (outline === undefined) {
                    expect(refusal).toBeInstanceOf(InputError);
                    return;
                }
                const points = flat(gearOutlinePoints(outline, 1));
                expect(points.filter(point => !Number.isFinite(point[0]) || !Number.isFinite(point[1]))).toEqual([]);
                expectStarShaped(points, [0, 0]);
            }), { seed: SEED, numRuns: 150 });
        });

        it("should refuse, or draw turning once round its centre, an 8 tooth bevel gear meshing an 8 at 160 degrees, whose tips face back past the plane square to its axis", () => {
            // Arrange
            const tipsFacingBack: BevelGearSpec = { module: 1, teeth: 8, mateTeeth: 8, shaftAngle: 160, pressureAngle: 20, backlash: 0, addendum: 1, dedendum: 1.25, rootFillet: 0.38 };

            // Act
            const { value: outline, refusal } = attempt(() => bevelGearOutline(tipsFacingBack));

            // Assert
            const cone = Math.atan2(Math.sin(160 * Math.PI / 180), 8 / 8 + Math.cos(160 * Math.PI / 180));
            const tipCone = cone + Math.atan(1 / (4 / Math.sin(cone)));
            expect(tipCone).toBeGreaterThan(Math.PI / 2);
            expect(outline === undefined ? refusal instanceof InputError : Math.abs(steps(flat(gearOutlinePoints(outline, 1))).reduce((sum, turn) => sum + turn, 0) - FULL_TURN) < 1e-9).toBe(true);
        });

        it("should draw a bevel gear on a pitch cone below 60 degrees closed, one tip arc per tooth, turning one way round its centre", () => {
            // Act & Assert
            fc.assert(fc.property(spurArbitrary, fc.integer({ min: 3, max: 120 }), fc.double({ min: 1, max: 179, noNaN: true }), (spur, mateTeeth, shaftAngle) => {
                const spec = bevelOf(spur, mateTeeth, shaftAngle);
                const { value: outline } = attempt(() => bevelGearOutline(spec));
                fc.pre(outline !== undefined && bevelGearSizes(spec).pitchConeAngle < 60);
                const points = flat(gearOutlinePoints(outline, 1));
                expect(lastPointOf(outline)).toEqual(outline.start);
                expect(tipArcs(outline, "tip")).toBe(spec.teeth);
                expectStarShaped(points, [0, 0]);
            }), { seed: SEED, numRuns: 150 });
        });

        it("should draw an 8 tooth bevel gear meshing an 8 at 152.7 degrees, on a 76 degree pitch cone, with finite points or refuse it", () => {
            // Arrange
            const wideCone: BevelGearSpec = { module: 1, teeth: 8, mateTeeth: 8, shaftAngle: 152.69083050804895, pressureAngle: 14.5, backlash: 0, addendum: 1, dedendum: 1.25, rootFillet: 0 };

            // Act
            const { value: outline, refusal } = attempt(() => bevelGearOutline(wideCone));

            // Assert
            expect(outline === undefined ? refusal instanceof InputError : flat(gearOutlinePoints(outline, 1)).every(point => Number.isFinite(point[0]) && Number.isFinite(point[1]))).toBe(true);
        });
    });

    describe("racks", () => {
        const rackArbitrary: fc.Arbitrary<RackSpec> = spurArbitrary.chain(spur => fc.double({ min: 0, max: 5, noNaN: true }).map(extra => ({
            module: spur.module,
            teeth: Math.min(spur.teeth, 60),
            pressureAngle: spur.pressureAngle,
            backlash: spur.backlash,
            addendum: spur.addendum,
            dedendum: spur.dedendum,
            rootFillet: spur.rootFillet,
            height: spur.module * (spur.dedendum + extra),
        })));

        it("should refuse a rack only as an InputError, and otherwise draw it closed, counter-clockwise, its teeth running one way from right to left", () => {
            // Act & Assert
            fc.assert(fc.property(rackArbitrary, (spec) => {
                const { value: outline, refusal } = attempt(() => rackOutline(spec));
                if (outline === undefined) {
                    expect(refusal).toBeInstanceOf(InputError);
                    return;
                }
                const sizes = rackSizes(spec);
                const points = flat(gearOutlinePoints(outline, 2));
                const teethPart = points.slice(2, -2);
                const slack = 1e-9 * spec.module;
                expect(lastPointOf(outline)).toEqual(outline.start);
                expect(base.polyline.signedArea2d({ points })).toBeGreaterThan(0);
                expect(repeats(points)).toEqual([]);
                teethPart.slice(1).forEach((point, index) => expect(point[0]).toBeLessThanOrEqual(teethPart[index]![0] + slack));
                expect(Math.max(...points.map(([, y]) => y))).toBeLessThanOrEqual(sizes.tipHeight + slack);
                expect(Math.min(...points.map(([, y]) => y))).toBeGreaterThanOrEqual(-spec.height - slack);
                expect(Math.max(...points.map(([x]) => x)) - Math.min(...points.map(([x]) => x))).toBeCloseTo(sizes.length, 9);
            }), { seed: SEED, numRuns: 200 });
        });
    });
});
