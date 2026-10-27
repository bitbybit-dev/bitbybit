import { describe, expect, it } from "vitest";
import type * as Inputs from "../inputs";
import type { BevelGearSpec, GearMove } from "./gear-types";
import { bevelGearOutline, bevelGearSizes } from "./bevel-gears";

type Point2 = Inputs.Base.Point2;

const DEGREE = Math.PI / 180;
const SAMPLES = 400;

const bevel = (changes: Partial<BevelGearSpec> = {}): BevelGearSpec => ({
    module: 2,
    teeth: 20,
    mateTeeth: 40,
    shaftAngle: 90,
    pressureAngle: 20,
    backlash: 0,
    addendum: 1,
    dedendum: 1.25,
    rootFillet: 0.38,
    ...changes,
});

const onCubic = (from: Point2, move: Extract<GearMove, { kind: "cubic" }>, t: number): Point2 => {
    const u = 1 - t;
    const weights = [u * u * u, 3 * u * u * t, 3 * u * t * t, t * t * t];
    const corners = [from, move.control1, move.control2, move.to];
    return [0, 1].map(axis => corners.reduce((sum, corner, index) => sum + weights[index]! * corner[axis]!, 0)) as Point2;
};

const firstFlankPoints = (changes: Partial<BevelGearSpec> = {}): Point2[] => {
    const outline = bevelGearOutline(bevel(changes));
    const points: Point2[] = [];
    let from = outline.start;
    for (const move of outline.moves) {
        if (move.part === "tip") {
            break;
        }
        if (move.kind === "cubic") {
            for (let step = 0; step <= SAMPLES; step++) {
                points.push(onCubic(from, move, step / SAMPLES));
            }
        }
        from = move.to;
    }
    return points;
};

const angleAtRadius = (points: Point2[], radius: number): number => {
    const radii = points.map(point => Math.hypot(point[0], point[1]));
    const index = radii.findIndex((value, at) => at > 0 && radii[at - 1]! <= radius && value >= radius);
    const share = (radius - radii[index - 1]!) / (radii[index]! - radii[index - 1]!);
    const before = points[index - 1]!;
    const after = points[index]!;
    return Math.atan2(before[1] + (after[1] - before[1]) * share, before[0] + (after[0] - before[0]) * share);
};

describe("bevel gears", () => {
    it("should size a 20 tooth bevel gear meshing a 40 at right angles on its 26.57 degree pitch cone", () => {
        // Act
        const sizes = bevelGearSizes(bevel());
        const mate = bevelGearSizes(bevel({ teeth: 40, mateTeeth: 20 }));

        // Assert
        const cone = Math.atan(0.5);
        expect(sizes.pitchConeAngle).toBeCloseTo(cone / DEGREE, 9);
        expect(sizes.pitchConeAngle + mate.pitchConeAngle).toBeCloseTo(90, 9);
        expect(sizes.coneDistance).toBeCloseTo(mate.coneDistance, 9);
        expect(sizes.apexDistance).toBeCloseTo(mate.pitchRadius, 9);
        expect(mate.apexDistance).toBeCloseTo(sizes.pitchRadius, 9);
        expect(sizes.tipRadius).toBeCloseTo(20 + 2 * Math.cos(cone), 9);
        expect(sizes.rootRadius).toBeCloseTo(20 - 2.5 * Math.cos(cone), 9);
        expect(sizes.tipConeAngle - sizes.pitchConeAngle).toBeCloseTo(Math.atan(2 / sizes.coneDistance) / DEGREE, 9);
        expect(sizes.virtualTeeth).toBeCloseTo(20 / Math.cos(cone), 9);
    });

    it("should cross the pitch circle half a tooth's pitch wide and reach the tips seen from the apex", () => {
        // Arrange
        const sizes = bevelGearSizes(bevel());
        const cone = sizes.pitchConeAngle * DEGREE;
        const tipSeen = sizes.tipRadius * sizes.apexDistance / (sizes.apexDistance - 2 * Math.sin(cone));

        // Act
        const points = firstFlankPoints();
        const outline = bevelGearOutline(bevel());

        // Assert
        expect(Math.abs(angleAtRadius(points, sizes.pitchRadius))).toBeCloseTo(Math.PI / 40, 5);
        expect(Math.hypot(...points[points.length - 1]!)).toBeCloseTo(tipSeen, 6);
        expect(outline.moves.filter(move => move.part === "tip")).toHaveLength(20);
    });

    it("should thin the teeth by the backlash at the pitch circle", () => {
        // Act
        const tight = angleAtRadius(firstFlankPoints(), 20);
        const loose = angleAtRadius(firstFlankPoints({ backlash: 0.1 }), 20);

        // Assert
        expect((Math.abs(tight) - Math.abs(loose)) * 2 * 20).toBeCloseTo(0.1, 4);
    });

    it("should refuse a crown gear, a shaft angle out of range and a mate that is not a whole number", () => {
        // Act & Assert
        expect(() => bevelGearSizes(bevel({ teeth: 40, mateTeeth: 20, shaftAngle: 130 }))).toThrow("crown");
        expect(() => bevelGearSizes(bevel({ shaftAngle: 180 }))).toThrow("`shaftAngle`");
        expect(() => bevelGearSizes(bevel({ mateTeeth: 12.5 }))).toThrow("`mateTeeth`");
        expect(() => bevelGearOutline(bevel({ teeth: 2 }))).toThrow("`teeth`");
    });
});
