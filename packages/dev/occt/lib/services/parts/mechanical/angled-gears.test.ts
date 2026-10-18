import { beforeAll, describe, expect, it } from "vitest";
import type { TopoDS_Shape } from "../../../../bitbybit-dev-occt/bitbybit-dev-occt";
import createBitbybitOcct from "../../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { Engineering } from "@bitbybit-dev/base";
import { OCCTService } from "../../../occ-service";
import type * as Inputs from "../../../api/inputs";
import type * as Models from "../../../api/models";

const Z_FRAME: Inputs.Base.Frame = { origin: [0, 0, 0], normal: [0, 0, 1], direction: [1, 0, 0] };
const DEGREE = Math.PI / 180;
const gears = new Engineering().mechanical.gears;

describe("OCCT parts: helical and bevel gears", () => {
    let occt: OCCTService;

    beforeAll(async () => {
        const kernel = await createBitbybitOcct();
        occt = new OCCTService(kernel);
    }, 120_000);

    const overlapOf = (first: TopoDS_Shape, second: TopoDS_Shape): number => {
        const common = occt.booleans.intersection({ shapes: [first, second], keepEdges: false });
        return occt.shapes.solid.getSolids({ shape: common }).reduce((sum, solid) => sum + occt.shapes.solid.getSolidVolume({ shape: solid }), 0);
    };

    const namesEveryFaceOnce = (made: Models.OCCT.ShapeWithRoles<TopoDS_Shape>): boolean => {
        const faces = occt.shapes.face.getFaces({ shape: made.shape }).length;
        const named = Object.values(made.roles).flat().sort((a, b) => a - b);
        return JSON.stringify(named) === JSON.stringify(Array.from({ length: faces }, (_, index) => index));
    };

    const filledAt = (shape: TopoDS_Shape, point: Inputs.Base.Point3): boolean => occt.shapes.solid.filterSolidPoints({ shape, points: [point], keepIn: true, keepOn: false, keepOut: false }).length === 1;

    describe("helical gears", () => {
        const helical = (teeth: number, helixAngle: number, rotation: number, centre: number): TopoDS_Shape => occt.parts.mechanical.gears.helicalGear({
            module: 2,
            teeth,
            helixAngle,
            backlash: 0.1,
            width: 5,
            rotation,
            frame: { origin: [centre, 0, 0], normal: [0, 0, 1], direction: [1, 0, 0] },
        });

        it("should make a valid gear of its section's volume, naming every face once, a tip per tooth", () => {
            // Arrange
            const section = occt.shapes.face.getFaceArea({ shape: occt.parts.mechanical.gears.spurGearProfile({ module: 2 / Math.cos(20 * DEGREE), teeth: 20, pressureAngle: Math.atan(Math.tan(20 * DEGREE) / Math.cos(20 * DEGREE)) / DEGREE, addendum: Math.cos(20 * DEGREE), dedendum: 1.25 * Math.cos(20 * DEGREE), rootFillet: 0.38 * Math.cos(20 * DEGREE), frame: Z_FRAME }) });

            // Act
            const made = occt.parts.mechanical.gears.helicalGearWithRoles({ module: 2, teeth: 20, helixAngle: 20, width: 6, bore: 8, frame: Z_FRAME });

            // Assert
            expect(occt.shapeFix.isValid({ shape: made.shape })).toBe(true);
            expect(occt.shapes.solid.getSolidVolume({ shape: made.shape })).toBeCloseTo(section * 6 - Math.PI * 16 * 6, 0);
            expect(namesEveryFaceOnce(made)).toBe(true);
            expect(made.roles["tip"]).toHaveLength(20);
            expect([made.roles["start"]?.length, made.roles["end"]?.length, made.roles["bore"]?.length]).toEqual([1, 1, 1]);
        }, 120_000);

        it("should turn a right hand's teeth counterclockwise about the normal by the twist times the width, a left hand's the other way", () => {
            // Arrange
            const sizes = gears.helicalGearSizes({ module: 2, teeth: 20, helixAngle: 20 });
            const width = 18 / 4 / sizes.twist;
            const quarterPitch: Inputs.Base.Point3 = [sizes.pitchRadius * Math.cos(4.5 * DEGREE), sizes.pitchRadius * Math.sin(4.5 * DEGREE), width - 0.1];

            // Act
            const right = occt.parts.mechanical.gears.helicalGear({ module: 2, teeth: 20, helixAngle: 20, width, frame: Z_FRAME });
            const left = occt.parts.mechanical.gears.helicalGear({ module: 2, teeth: 20, helixAngle: -20, width, frame: Z_FRAME });

            // Assert
            expect(filledAt(right, quarterPitch)).toBe(true);
            expect(filledAt(left, quarterPitch)).toBe(false);
        }, 120_000);

        it("should mesh a right hand with a left hand of other teeth the sum of their pitch radii apart, and clash with another right hand", () => {
            // Arrange
            const centres = gears.helicalGearSizes({ module: 2, teeth: 20, helixAngle: 20 }).pitchRadius
                + gears.helicalGearSizes({ module: 2, teeth: 30, helixAngle: 20 }).pitchRadius;
            const facingGap = 180 - 180 / 30;

            // Act
            const overlaps = [0, 9].map(turn => overlapOf(helical(20, 20, turn, 0), helical(30, -20, facingGap - turn * 20 / 30, centres)));
            const sameHand = overlapOf(helical(20, 20, 0, 0), helical(30, 20, facingGap, centres));

            // Assert
            expect(Math.max(...overlaps)).toBeLessThan(1e-6);
            expect(sameHand).toBeGreaterThan(0.1);
        }, 240_000);

        it("should join a herringbone's two halves into one valid solid, the half at the frame leaning as asked", () => {
            // Act
            const made = occt.parts.mechanical.gears.helicalGearWithRoles({ module: 2, teeth: 20, helixAngle: 25, herringbone: true, width: 8, frame: Z_FRAME });
            const plain = occt.parts.mechanical.gears.helicalGear({ module: 2, teeth: 20, helixAngle: 25, width: 8, frame: Z_FRAME });

            // Assert
            expect(occt.shapeFix.isValid({ shape: made.shape })).toBe(true);
            expect(occt.shapes.solid.getSolids({ shape: made.shape })).toHaveLength(1);
            expect(namesEveryFaceOnce(made)).toBe(true);
            expect(made.roles["tip"]).toHaveLength(40);
            expect([made.roles["start"]?.length, made.roles["end"]?.length]).toEqual([1, 1]);
            expect(occt.shapes.solid.getSolidVolume({ shape: made.shape })).toBeCloseTo(occt.shapes.solid.getSolidVolume({ shape: plain }), 1);
        }, 120_000);
    });

    describe("bevel gears", () => {
        const bevel = (teeth: number, mateTeeth: number, rotation: number, frame: Inputs.Base.Frame): TopoDS_Shape => occt.parts.mechanical.gears.bevelGear({ module: 2, teeth, mateTeeth, backlash: 0.1, faceWidth: 8, rotation, frame });
        const WHEEL_FRAME: Inputs.Base.Frame = { origin: [0, 0, 0], normal: [1, 0, 0], direction: [0, 0, 1] };

        it("should make a valid gear between its back and front cones, naming every face once, a tip per tooth", () => {
            // Arrange
            const sizes = gears.bevelGearSizes({ module: 2, teeth: 20, mateTeeth: 30 });

            // Act
            const made = occt.parts.mechanical.gears.bevelGearWithRoles({ module: 2, teeth: 20, mateTeeth: 30, faceWidth: 8, bore: 6, frame: Z_FRAME });

            // Assert
            const box = occt.analysis.measure.tightBoundingBox({ shape: made.shape });
            expect(occt.shapeFix.isValid({ shape: made.shape })).toBe(true);
            expect(namesEveryFaceOnce(made)).toBe(true);
            expect(Object.keys(made.roles).sort()).toEqual(["back", "bore", "flank", "front", "root", "tip"]);
            expect(made.roles["tip"]).toHaveLength(20);
            expect(box.max[2]).toBeCloseTo(made.frames["back"]!.origin[2], 6);
            expect(box.max[0]).toBeCloseTo(sizes.tipRadius, 1);
            expect(box.min[2]).toBeGreaterThan(sizes.apexDistance - 8);
        }, 120_000);

        it("should mesh a 20 tooth gear with a 30 sharing its apex at right angles through half a pitch, and clash tooth on tooth", () => {
            // Act
            const overlaps = [0, 9].map(turn => overlapOf(bevel(20, 30, turn, Z_FRAME), bevel(30, 20, 6 - turn * 20 / 30, WHEEL_FRAME)));
            const toothOnTooth = overlapOf(bevel(20, 30, 0, Z_FRAME), bevel(30, 20, 0, WHEEL_FRAME));

            // Assert
            expect(Math.max(...overlaps)).toBeLessThan(1e-6);
            expect(toothOnTooth).toBeGreaterThan(0.1);
        }, 240_000);

        it("should place its apex frame on the input frame toward the first tooth and refuse a face width over a third of the cone", () => {
            // Act
            const made = occt.parts.mechanical.gears.bevelGearWithRoles({ module: 2, teeth: 20, mateTeeth: 30, faceWidth: 8, rotation: 90, frame: { origin: [1, 2, 3], normal: [0, 1, 0], direction: [1, 0, 0] } });

            // Assert
            expect(made.frames["apex"]!.origin).toEqual([1, 2, 3]);
            expect(made.frames["apex"]!.direction[2]).toBeCloseTo(-1, 9);
            expect(made.frames["back"]!.origin[1]).toBeGreaterThan(2);
            expect(() => occt.parts.mechanical.gears.bevelGear({ module: 2, teeth: 20, mateTeeth: 30, faceWidth: 13 })).toThrow("`faceWidth`");
            expect(() => occt.parts.mechanical.gears.bevelGear({ module: 2, teeth: 20, mateTeeth: 30, faceWidth: 8, bore: 40 })).toThrow("`bore`");
        }, 120_000);
    });
});
