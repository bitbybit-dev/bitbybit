import { describe, expect, it } from "vitest";
import type * as Inputs from "../inputs";
import type { GearMove, GearOutline, RingGearSpec } from "./gear-types";
import { ringGearOutline, ringGearSizes } from "./gears";

type Point2 = Inputs.Base.Point2;

const DEGREE = Math.PI / 180;
const SAMPLES = 10;

const standard = (changes: Partial<RingGearSpec> = {}): RingGearSpec => ({
    module: 2,
    teeth: 60,
    pressureAngle: 20,
    backlash: 0,
    addendum: 1,
    dedendum: 1.25,
    rootFillet: 0.38,
    ...changes,
});

const between = (from: Point2, to: Point2, share: number): Point2 => [from[0] + (to[0] - from[0]) * share, from[1] + (to[1] - from[1]) * share];

const cubicPoints = (from: Point2, move: Extract<GearMove, { kind: "cubic" }>): Point2[] => Array.from({ length: SAMPLES + 1 }, (_, step) => {
    const share = step / SAMPLES;
    const a = between(from, move.control1, share);
    const b = between(move.control1, move.control2, share);
    const c = between(move.control2, move.to, share);
    return between(between(a, b, share), between(b, c, share), share);
});

const radius = (point: Point2): number => Math.hypot(point[0], point[1]);

const circleRadius = (a: Point2, b: Point2, c: Point2): number => {
    const sideA = Math.hypot(b[0] - c[0], b[1] - c[1]);
    const sideB = Math.hypot(a[0] - c[0], a[1] - c[1]);
    const sideC = Math.hypot(a[0] - b[0], a[1] - b[1]);
    const twiceArea = Math.abs((b[0] - a[0]) * (c[1] - a[1]) - (c[0] - a[0]) * (b[1] - a[1]));
    return sideA * sideB * sideC / (2 * twiceArea);
};

const involuteOf = (angle: number): number => Math.tan(angle) - angle;

const arcRadii = (outline: GearOutline, part: GearMove["part"]): number[] => {
    const radii: number[] = [];
    let from = outline.start;
    for (const move of outline.moves) {
        if (move.kind === "arc" && move.part === part) {
            radii.push(circleRadius(from, move.through, move.to));
        }
        from = move.to;
    }
    return radii;
};

describe("ring gears", () => {
    describe("ringGearSizes", () => {
        it("should size a ring from its module and teeth, its tips inside the pitch circle and its roots beyond it", () => {
            // Act
            const sizes = ringGearSizes(standard());

            // Assert
            expect(sizes.pitchRadius).toBeCloseTo(60, 12);
            expect(sizes.baseRadius).toBeCloseTo(60 * Math.cos(20 * DEGREE), 12);
            expect(sizes.tipRadius).toBeCloseTo(58, 12);
            expect(sizes.rootRadius).toBeCloseTo(62.5, 12);
            expect(sizes.halfToothAngle).toBeCloseTo(Math.PI / 120, 12);
        });

        it("should thin each tooth at the pitch circle by the backlash", () => {
            // Act
            const plain = ringGearSizes(standard());
            const loose = ringGearSizes(standard({ backlash: 0.2 }));

            // Assert
            expect((plain.halfToothAngle - loose.halfToothAngle) * 2 * plain.pitchRadius).toBeCloseTo(0.2, 12);
        });
    });

    describe("ringGearOutline", () => {
        it("should close back at its start and stay between the tip and the root circles", () => {
            // Arrange
            const sizes = ringGearSizes(standard());

            // Act
            const outline = ringGearOutline(standard());
            const radii = [outline.start, ...outline.moves.map(move => move.to)].map(radius);

            // Assert
            expect(outline.moves[outline.moves.length - 1]!.to).toEqual(outline.start);
            expect(Math.min(...radii)).toBeGreaterThan(sizes.tipRadius - 1e-9);
            expect(Math.max(...radii)).toBeLessThan(sizes.rootRadius + 1e-9);
        });

        it("should give each tooth one tip arc on the tip circle, with a tooth along +x", () => {
            // Act
            const outline = ringGearOutline(standard());
            const tips = outline.moves.filter(move => move.part === "tip");

            // Assert
            expect(tips.length).toBe(60);
            expect(arcRadii(outline, "tip").every(each => Math.abs(each - 58) < 1e-6)).toBe(true);
            expect(tips.some(move => move.kind === "arc" && Math.abs(move.through[0] - 58) < 1e-9 && Math.abs(move.through[1]) < 1e-9)).toBe(true);
        });

        it("should draw the flanks on the involute of the base circle, within a ten-thousandth of the module", () => {
            // Arrange
            const sizes = ringGearSizes(standard());
            const gapMiddle = Math.PI / 60;
            const baseAngle = gapMiddle - sizes.halfToothAngle + involuteOf(20 * DEGREE);

            // Act
            const outline = ringGearOutline(standard());
            const misses: number[] = [];
            let from = outline.start;
            for (const move of outline.moves.slice(0, outline.moves.findIndex(each => each.part === "tip"))) {
                if (move.kind === "cubic") {
                    for (const point of cubicPoints(from, move)) {
                        const halfWidth = baseAngle - involuteOf(Math.acos(sizes.baseRadius / radius(point)));
                        misses.push(Math.abs(Math.abs(Math.atan2(point[1], point[0]) - gapMiddle) - halfWidth) * radius(point));
                    }
                }
                from = move.to;
            }

            // Assert
            expect(misses.length).toBeGreaterThan(0);
            expect(Math.max(...misses)).toBeLessThan(2e-4);
        });

        it("should round the bottom of each gap with arcs of rootFillet times the module, shrinking ones too large for the gap", () => {
            // Act
            const plain = arcRadii(ringGearOutline(standard()), "root");
            const large = arcRadii(ringGearOutline(standard({ rootFillet: 3 })), "root");

            // Assert
            expect(plain.filter(each => Math.abs(each - 0.76) < 1e-9).length).toBe(120);
            expect(plain.filter(each => Math.abs(each - 62.5) < 1e-6).length).toBe(60);
            const shrunk = large.filter(each => each < 62);
            expect(shrunk.length).toBe(120);
            expect(Math.min(...shrunk)).toBeGreaterThan(0.76);
            expect(Math.max(...shrunk)).toBeLessThan(6);
        });

        it("should leave the bottom of each gap sharp with a rootFillet of 0", () => {
            // Act
            const roots = arcRadii(ringGearOutline(standard({ rootFillet: 0 })), "root");

            // Assert
            expect(roots.length).toBe(60);
            expect(roots.every(each => Math.abs(each - 62.5) < 1e-6)).toBe(true);
        });

        it("should widen every gap with backlash", () => {
            // Act
            const plain = ringGearOutline(standard());
            const loose = ringGearOutline(standard({ backlash: 0.3 }));

            // Assert
            expect(Math.atan2(loose.start[1], loose.start[0])).toBeLessThan(Math.atan2(plain.start[1], plain.start[0]));
        });

        it("should draw the same outline turned and moved when given a rotation and a centre", () => {
            // Arrange
            const turn = 3;
            const centre: Point2 = [10, -5];

            // Act
            const plain = ringGearOutline(standard());
            const placed = ringGearOutline(standard(), centre, turn);

            // Assert
            const expected = [plain.start[0] * Math.cos(turn * DEGREE) - plain.start[1] * Math.sin(turn * DEGREE) + centre[0], plain.start[0] * Math.sin(turn * DEGREE) + plain.start[1] * Math.cos(turn * DEGREE) + centre[1]];
            expect(placed.start[0]).toBeCloseTo(expected[0]!, 12);
            expect(placed.start[1]).toBeCloseTo(expected[1]!, 12);
            expect(placed.moves.length).toBe(plain.moves.length);
        });
    });

    describe("refusals", () => {
        it("should refuse a ring whose tips reach inside the base circle, so a 33-tooth ring at 20 degrees but not a 34-tooth one", () => {
            // Act & Assert
            expect(() => ringGearOutline(standard({ teeth: 33 }))).toThrow("`teeth`");
            expect(() => ringGearOutline(standard({ teeth: 34 }))).not.toThrow();
        });

        it("should refuse gaps that come to a point, teeth that come to a point and a backlash that takes the whole tooth away", () => {
            // Act & Assert
            expect(() => ringGearOutline(standard({ pressureAngle: 40 }))).toThrow("`dedendum`");
            expect(() => ringGearOutline(standard({ pressureAngle: 40, dedendum: 0.5 }))).toThrow("`addendum`");
            expect(() => ringGearOutline(standard({ backlash: 4 }))).toThrow("takes the whole tooth away");
        });

        it("should refuse what it refuses on a spur gear: too few teeth, no module and a negative backlash", () => {
            // Act & Assert
            expect(() => ringGearOutline(standard({ teeth: 2 }))).toThrow("`teeth`");
            expect(() => ringGearOutline(standard({ module: 0 }))).toThrow("`module`");
            expect(() => ringGearOutline(standard({ backlash: -1 }))).toThrow("`backlash`");
        });

        it("should refuse in its sizes the backlash its outline refuses", () => {
            // Act & Assert
            expect(() => ringGearSizes(standard({ backlash: 4 }))).toThrow("`backlash` takes the whole tooth away.");
        });
    });
});
