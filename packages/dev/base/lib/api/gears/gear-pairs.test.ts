import { describe, expect, it } from "vitest";
import { InputError } from "../kernel-calls/errors";
import { gearPair, internalGearPair, planetarySet } from "./gear-pairs";
import type { GearPairSpec } from "./gear-types";

describe("gear pairs", () => {
    const shared = { pressureAngle: 20, addendum: 1 };
    const pairOf = (module: number, teethA: number, teethB: number, profileShiftA = 0, profileShiftB = 0, addendum = 1): GearPairSpec =>
        ({ module, teethA, teethB, profileShiftA, profileShiftB, pressureAngle: 20, addendum, dedendum: 1.25 });

    it("should place unshifted spur gears their pitch radii apart and work out their contact ratio", () => {
        // Act
        const pair = gearPair(pairOf(2, 20, 30));

        // Assert
        expect(pair.centreDistance).toBeCloseTo(50, 12);
        expect(pair.workingPressureAngle).toBeCloseTo(20, 10);
        expect(pair.contactRatio).toBeCloseTo(1.6052, 4);
        expect(pair.ratio).toBe(1.5);
        expect([pair.interferes, pair.tipShortening]).toEqual([false, 0]);
        expect(pair.clearance).toBeCloseTo(0.5, 12);
    });

    it("should count the contact of 10 teeth with 30 only up to the first gear's base circle, which the second's tips reach past", () => {
        // Act
        const pair = gearPair(pairOf(1, 10, 30));

        // Assert
        expect(pair.contactRatio).toBeCloseTo(1.26402, 5);
        expect(pair.interferes).toBe(true);
    });

    it("should give the tip shortening and clearance of the published worked example, and the contact once the tips are shortened", () => {
        // Act
        const asGiven = gearPair(pairOf(3, 12, 24, 0.6, 0.36));
        const shortened = gearPair(pairOf(3, 12, 24, 0.6, 0.36, 1 - asGiven.tipShortening / 3));

        // Assert
        expect(asGiven.tipShortening).toBeCloseTo(0.38013, 5);
        expect(asGiven.clearance).toBeCloseTo(0.36987, 5);
        expect(asGiven.contactRatio).toBeCloseTo(1.34780, 5);
        expect(shortened.clearance).toBeCloseTo(0.75, 9);
        expect(shortened.contactRatio).toBeCloseTo(1.20210, 5);
        expect(shortened.interferes).toBe(false);
    });

    it("should give 12 and 20 teeth shifted by 1 each a clearance below 0 and the shortening that restores a quarter of the module", () => {
        // Act
        const pair = gearPair(pairOf(1, 12, 20, 1, 1));

        // Assert
        expect(pair.clearance).toBeCloseTo(-0.19231, 5);
        expect(pair.tipShortening).toBeCloseTo(0.44231, 5);
        expect(pair.clearance + pair.tipShortening).toBeCloseTo(0.25, 12);
    });

    it("should refuse a gear shifted so far in that its tips reach only inside its own base circle", () => {
        // Act
        const refused = (): unknown => gearPair(pairOf(1, 20, 30, -2, 2));

        // Assert
        expect(refused).toThrow(InputError);
        expect(refused).toThrow("The tips of the first gear's teeth reach inside its base circle, where no involute runs: give it more `teethA` or a larger `profileShiftA`.");
    });

    it("should refuse profile shifts that would have the pair work at a pressure angle past 45 degrees", () => {
        // Act
        const refused = (): unknown => gearPair(pairOf(1, 3, 3, 6, 6));

        // Assert
        expect(refused).toThrow(InputError);
        expect(refused).toThrow("The profile shifts add up to 12, which would have the pair work at a pressure angle above 45 degrees: lower `profileShiftA` or `profileShiftB`.");
    });

    it("should solve a working pressure angle near the limit to the involute it stands for", () => {
        // Act
        const pair = gearPair(pairOf(1, 3, 3, 0.7, 0.7));
        const working = pair.workingPressureAngle * Math.PI / 180;

        // Assert
        expect(Math.tan(working) - working).toBeCloseTo(2 * Math.tan(20 * Math.PI / 180) * 1.4 / 6 + Math.tan(20 * Math.PI / 180) - 20 * Math.PI / 180, 14);
        expect(pair.centreDistance).toBeCloseTo(3 * Math.cos(20 * Math.PI / 180) / Math.cos(working), 12);
    });

    it("should refuse a module or an addendum that is not finite, and a dedendum of 0", () => {
        // Act & Assert
        expect(() => gearPair(pairOf(Infinity, 20, 30))).toThrow("`module` is not a finite number.");
        expect(() => gearPair(pairOf(1, 20, 30, 0, 0, Infinity))).toThrow("`addendum` is not a finite number.");
        expect(() => gearPair({ ...pairOf(1, 20, 30), dedendum: 0 })).toThrow("`dedendum` is not more than 0.");
    });

    it("should move shifted gears apart and raise their working pressure angle, as the published worked example does", () => {
        // Act
        const pair = gearPair(pairOf(3, 12, 24, 0.6, 0.36));

        // Assert
        expect(pair.centreDistance).toBeCloseTo(56.4999, 4);
        expect(pair.workingPressureAngle).toBeCloseTo(26.0886, 4);
    });

    it("should place a gear inside a ring half the module times the difference of their teeth from its centre", () => {
        // Act
        const pair = internalGearPair({ module: 2, pinionTeeth: 20, ringTeeth: 60, ...shared });

        // Assert
        expect(pair.centreDistance).toBe(40);
        expect(pair.contactRatio).toBeCloseTo(1.93697, 5);
        expect(pair.ratio).toBe(3);
        expect(pair.interferes).toBe(true);
    });

    it("should count 12 teeth in a 40 tooth ring only from where the ring's tips cross the gear's base circle tangent, and flag it", () => {
        // Act
        const pair = internalGearPair({ module: 1, pinionTeeth: 12, ringTeeth: 40, ...shared });

        // Assert
        expect(pair.contactRatio).toBeCloseTo(1.40530, 5);
        expect(pair.interferes).toBe(true);
    });

    it("should flag a gear whose tips catch the ring's on the way out of mesh, as 50 teeth in 52 and 30 in 38 do but 30 in 39 does not", () => {
        // Act
        const close = internalGearPair({ module: 1, pinionTeeth: 50, ringTeeth: 52, ...shared });
        const eightApart = internalGearPair({ module: 1, pinionTeeth: 30, ringTeeth: 38, ...shared });
        const nineApart = internalGearPair({ module: 1, pinionTeeth: 30, ringTeeth: 39, ...shared });

        // Assert
        expect(close.contactRatio).toBeCloseTo(2.09468, 5);
        expect([close.interferes, eightApart.interferes, nineApart.interferes]).toEqual([true, true, false]);
    });

    it("should refuse teeth, a module, a pressure angle and profile shifts that cannot mesh", () => {
        // Act
        const refusals = [
            (): unknown => gearPair(pairOf(0, 20, 30)),
            (): unknown => gearPair(pairOf(1, 2.5, 30)),
            (): unknown => gearPair(pairOf(1, 20, 30, Number.NaN)),
            (): unknown => gearPair({ ...pairOf(1, 20, 30), pressureAngle: 50 }),
            (): unknown => internalGearPair({ module: 1, pinionTeeth: 30, ringTeeth: 30, ...shared }),
            (): unknown => planetarySet({ module: 1, sunTeeth: 20, planetTeeth: 20, planets: 0, ...shared }),
            (): unknown => gearPair(pairOf(1, 10, 10, -0.5, -0.5)),
        ];

        // Assert
        expect(refusals[0]).toThrow("`module` is not more than 0.");
        expect(refusals[1]).toThrow("`teethA` is not a whole number of at least 3.");
        expect(refusals[2]).toThrow("A profile shift is not a number.");
        expect(refusals[3]).toThrow("`pressureAngle` is not between 0 and 45 degrees.");
        expect(refusals[4]).toThrow("`ringTeeth` is not more than `pinionTeeth`");
        expect(refusals[5]).toThrow("`planets` is not a whole number of at least 1.");
        expect(refusals[6]).toThrow(/^The profile shifts add up to -1, which leaves the pair no working pressure angle: their sum must be more than -0\.409/);
    });

    it("should refuse a ring whose tooth tips reach inside its base circle, given or made by a planetary set", () => {
        // Act
        const smallest = internalGearPair({ module: 2, pinionTeeth: 12, ringTeeth: 34, ...shared });
        const tooSmall = (): unknown => internalGearPair({ module: 2, pinionTeeth: 12, ringTeeth: 33, ...shared });
        const tooSmallSet = (): unknown => planetarySet({ module: 1, sunTeeth: 9, planetTeeth: 12, planets: 3, ...shared });

        // Assert
        expect(Number.isFinite(smallest.contactRatio)).toBe(true);
        expect(tooSmall).toThrow("The tips of the ring's 33 teeth reach inside its base circle, where no involute runs: give the ring more `ringTeeth` or a smaller `addendum`.");
        expect(tooSmallSet).toThrow("The tips of the ring's 33 teeth reach inside its base circle, where no involute runs: give the sun or the planets more teeth, or a smaller `addendum`.");
    });

    it.each([
        [20, 20, 4], [18, 12, 3], [24, 16, 4], [21, 15, 3], [20, 21, 3], [12, 30, 2], [17, 13, 3], [16, 17, 5],
    ])("should lay out a %i tooth sun with %i tooth planets times %i, assemblable exactly when the sun and ring teeth divide by the planets", (sunTeeth, planetTeeth, planets) => {
        // Act
        const set = planetarySet({ module: 1, sunTeeth, planetTeeth, planets, ...shared });

        // Assert
        expect(set.ringTeeth).toBe(sunTeeth + 2 * planetTeeth);
        expect(set.centreDistance).toBeCloseTo((sunTeeth + planetTeeth) / 2, 12);
        expect(set.ratio).toBeCloseTo(1 + set.ringTeeth / sunTeeth, 12);
        expect(set.assemblable).toBe((sunTeeth + set.ringTeeth) % planets === 0);
        expect(set.planetCentres).toHaveLength(planets);
        expect(set.planetRotations.every(rotation => rotation >= 0 && rotation < 360 / planetTeeth + 1e-9)).toBe(true);
    });

    it("should flag a set whose sun's tips reach past a small planet's base circle, and pass one whose meshes stay clear", () => {
        // Act
        const smallPlanets = planetarySet({ module: 1, sunTeeth: 12, planetTeeth: 20, planets: 2, ...shared });
        const clean = planetarySet({ module: 1, sunTeeth: 18, planetTeeth: 30, planets: 3, ...shared });

        // Assert
        expect([smallPlanets.interferes, clean.interferes]).toEqual([true, false]);
    });

    it("should flag a set whose large ring's tips reach below a small planet's base circle, though the sun meshes the planet cleanly", () => {
        // Act
        const set = planetarySet({ module: 1, sunTeeth: 60, planetTeeth: 18, planets: 3, ...shared });
        const sunAndPlanet = gearPair(pairOf(1, 60, 18));

        // Assert
        expect([set.interferes, sunAndPlanet.interferes]).toEqual([true, false]);
    });

    it("should tell planets that crowd each other from ones that keep clear", () => {
        // Act
        const crowded = planetarySet({ module: 1, sunTeeth: 12, planetTeeth: 30, planets: 4, ...shared });
        const roomy = planetarySet({ module: 1, sunTeeth: 30, planetTeeth: 12, planets: 3, ...shared });
        const single = planetarySet({ module: 1, sunTeeth: 12, planetTeeth: 30, planets: 1, ...shared });

        // Assert
        expect([crowded.planetsClear, roomy.planetsClear, single.planetsClear]).toEqual([false, true, true]);
    });
});
