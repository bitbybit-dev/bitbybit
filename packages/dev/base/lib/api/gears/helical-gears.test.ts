import { describe, expect, it } from "vitest";
import type { HelicalGearSpec } from "./gear-types";
import { spurGearOutline, spurGearSizes } from "./gears";
import { helicalGearOutline, helicalGearSizes } from "./helical-gears";

const DEGREE = Math.PI / 180;

const helical = (changes: Partial<HelicalGearSpec> = {}): HelicalGearSpec => ({
    module: 2,
    teeth: 20,
    helixAngle: 30,
    pressureAngle: 20,
    profileShift: 0,
    backlash: 0,
    addendum: 1,
    dedendum: 1.25,
    rootFillet: 0.38,
    ...changes,
});

describe("helical gears", () => {
    it("should size the section square to the axis by the transverse module, the heights by the normal module", () => {
        // Act
        const sizes = helicalGearSizes(helical());

        // Assert
        expect(sizes.transverseModule).toBeCloseTo(2 / Math.cos(30 * DEGREE), 9);
        expect(sizes.pitchRadius).toBeCloseTo(20 / Math.cos(30 * DEGREE), 9);
        expect(sizes.transversePressureAngle).toBeCloseTo(Math.atan(Math.tan(20 * DEGREE) / Math.cos(30 * DEGREE)) / DEGREE, 9);
        expect(sizes.tipRadius - sizes.pitchRadius).toBeCloseTo(2, 9);
        expect(sizes.pitchRadius - sizes.rootRadius).toBeCloseTo(2.5, 9);
        expect(sizes.twist).toBeCloseTo(Math.tan(30 * DEGREE) / sizes.pitchRadius / DEGREE, 9);
    });

    it("should be the spur gear when the teeth do not lean, and twist the other way for a left hand", () => {
        // Act
        const straight = helicalGearSizes(helical({ helixAngle: 0 }));
        const left = helicalGearSizes(helical({ helixAngle: -30 }));

        // Assert
        expect(straight).toMatchObject({ ...spurGearSizes(helical()), twist: 0, transverseModule: 2 });
        expect(helicalGearOutline(helical({ helixAngle: 0 }), [0, 0], 5)).toEqual(spurGearOutline(helical(), [0, 0], 5));
        expect(left.twist).toBeCloseTo(-helicalGearSizes(helical()).twist, 12);
    });

    it("should refuse a helix angle of 45 degrees or more and a module the spur gear would refuse", () => {
        // Act & Assert
        expect(() => helicalGearSizes(helical({ helixAngle: 45 }))).toThrow("`helixAngle`");
        expect(() => helicalGearOutline(helical({ helixAngle: -50 }))).toThrow("`helixAngle`");
        expect(() => helicalGearSizes(helical({ module: 0 }))).toThrow("`module`");
    });

    it("should refuse a normal pressure angle and a helix angle that each pass but together lean the transverse section past 45 degrees, naming both", () => {
        // Act
        const refused = (): unknown => helicalGearSizes(helical({ pressureAngle: 40, helixAngle: 40 }));

        // Assert
        expect(refused).toThrow("`pressureAngle` 40 with `helixAngle` 40 gives a transverse pressure angle of 47.6 degrees, above 45: lower one of them.");
    });
});
