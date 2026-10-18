import { describe, expect, it } from "vitest";
import type * as Inputs from "../inputs";
import { InputError } from "../kernel-calls/errors";
import type { GearMove, GearOutline, SpurGearSpec } from "./gear-types";
import { spurGearOutline, spurGearSizes } from "./gears";

type Point2 = Inputs.Base.Point2;

const DEGREE = Math.PI / 180;
const SAMPLES = 10;

const standard = (changes: Partial<SpurGearSpec> = {}): SpurGearSpec => ({
    module: 2,
    teeth: 20,
    pressureAngle: 20,
    profileShift: 0,
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

const sampled = (outline: GearOutline): Point2[] => {
    const points: Point2[] = [outline.start];
    let from = outline.start;
    for (const move of outline.moves) {
        if (move.kind === "cubic") {
            points.push(...cubicPoints(from, move));
        } else if (move.kind === "arc") {
            points.push(move.through, move.to);
        } else {
            points.push(move.to);
        }
        from = move.to;
    }
    return points;
};

const radius = (point: Point2): number => Math.hypot(point[0], point[1]);

const circleRadius = (a: Point2, b: Point2, c: Point2): number => {
    const sideA = Math.hypot(b[0] - c[0], b[1] - c[1]);
    const sideB = Math.hypot(a[0] - c[0], a[1] - c[1]);
    const sideC = Math.hypot(a[0] - b[0], a[1] - b[1]);
    const twiceArea = Math.abs((b[0] - a[0]) * (c[1] - a[1]) - (c[0] - a[0]) * (b[1] - a[1]));
    return sideA * sideB * sideC / (2 * twiceArea);
};

const involuteOf = (angle: number): number => Math.tan(angle) - angle;

describe("gears", () => {
    describe("spurGearSizes", () => {
        it("should size a standard gear from its module and teeth: pitch, base, tip and root circles", () => {
            // Act
            const sizes = spurGearSizes(standard());

            // Assert
            expect(sizes.pitchRadius).toBeCloseTo(20, 12);
            expect(sizes.baseRadius).toBeCloseTo(20 * Math.cos(20 * DEGREE), 12);
            expect(sizes.tipRadius).toBeCloseTo(22, 12);
            expect(sizes.rootRadius).toBeCloseTo(17.5, 12);
            expect(sizes.halfToothAngle).toBeCloseTo(Math.PI / 40, 12);
        });

        it("should move the tip and root circles out by the profile shift times the module", () => {
            // Act
            const sizes = spurGearSizes(standard({ profileShift: 0.5 }));

            // Assert
            expect(sizes.tipRadius).toBeCloseTo(23, 12);
            expect(sizes.rootRadius).toBeCloseTo(18.5, 12);
        });

        it("should thin each tooth at the pitch circle by the backlash", () => {
            // Act
            const plain = spurGearSizes(standard());
            const loose = spurGearSizes(standard({ backlash: 0.2 }));

            // Assert
            expect((plain.halfToothAngle - loose.halfToothAngle) * 2 * plain.pitchRadius).toBeCloseTo(0.2, 12);
        });
    });

    describe("spurGearOutline", () => {
        it("should close back at its start", () => {
            // Act
            const outline = spurGearOutline(standard());

            // Assert
            expect(outline.moves[outline.moves.length - 1]!.to).toEqual(outline.start);
        });

        it("should give each tooth one tip arc and stay between the root and the tip circles", () => {
            // Arrange
            const spec = standard();
            const sizes = spurGearSizes(spec);

            // Act
            const outline = spurGearOutline(spec);
            const radii = sampled(outline).map(radius);

            // Assert
            expect(outline.moves.filter(move => move.part === "tip").length).toBe(20);
            expect(Math.min(...radii)).toBeGreaterThan(sizes.rootRadius - 1e-9);
            expect(Math.max(...radii)).toBeLessThan(sizes.tipRadius + 1e-9);
        });

        it("should draw the flanks on the involute of the base circle, within a ten-thousandth of the module", () => {
            // Arrange
            const spec = standard();
            const sizes = spurGearSizes(spec);
            const baseAngle = sizes.halfToothAngle + involuteOf(20 * DEGREE);

            // Act
            const outline = spurGearOutline(spec);
            const tipIndex = outline.moves.findIndex(move => move.part === "tip");
            const firstTooth = outline.moves.slice(tipIndex + 1, outline.moves.findIndex((move, index) => index > tipIndex && move.part === "root"));
            let from = outline.moves[tipIndex]!.to;
            const misses: number[] = [];
            for (const move of firstTooth) {
                if (move.kind === "cubic") {
                    for (const point of cubicPoints(from, move)) {
                        const expected = baseAngle - involuteOf(Math.acos(Math.min(1, sizes.baseRadius / radius(point))));
                        misses.push(Math.abs(Math.atan2(point[1], point[0]) - expected) * radius(point));
                    }
                }
                from = move.to;
            }

            // Assert
            expect(misses.length).toBeGreaterThan(0);
            expect(Math.max(...misses)).toBeLessThan(2e-4);
        });

        it("should round the root with arcs of rootFillet times the module when the gap has room for them", () => {
            // Act
            const outline = spurGearOutline(standard());
            const firstFillet = outline.moves[0]!;

            // Assert
            expect(firstFillet.kind).toBe("arc");
            expect(firstFillet.part).toBe("root");
            if (firstFillet.kind === "arc") {
                expect(circleRadius(outline.start, firstFillet.through, firstFillet.to)).toBeCloseTo(0.76, 9);
            }
        });

        it("should run a straight flank from the root up to the base circle when the base circle lies above the root, and none when it lies below", () => {
            // Act
            const small = spurGearOutline(standard({ teeth: 12 }));
            const large = spurGearOutline(standard({ teeth: 60 }));

            // Assert
            expect(small.moves.filter(move => move.kind === "line").length).toBe(24);
            expect(large.moves.filter(move => move.kind === "line").length).toBe(0);
        });

        it("should draw the same outline turned and moved when given a rotation and a centre", () => {
            // Arrange
            const turn = 9;
            const centre: Point2 = [10, -5];

            // Act
            const plain = spurGearOutline(standard());
            const placed = spurGearOutline(standard(), centre, turn);

            // Assert
            const expected = [plain.start[0] * Math.cos(turn * DEGREE) - plain.start[1] * Math.sin(turn * DEGREE) + centre[0], plain.start[0] * Math.sin(turn * DEGREE) + plain.start[1] * Math.cos(turn * DEGREE) + centre[1]];
            expect(placed.start[0]).toBeCloseTo(expected[0]!, 12);
            expect(placed.start[1]).toBeCloseTo(expected[1]!, 12);
            expect(placed.moves.length).toBe(plain.moves.length);
        });

        it("should shrink a root fillet too large for the gap until the two fillets of a gap meet short of its middle", () => {
            // Act
            const outline = spurGearOutline(standard({ rootFillet: 3 }));
            const firstFillet = outline.moves[0]!;

            // Assert
            expect(firstFillet.kind).toBe("arc");
            if (firstFillet.kind === "arc") {
                const radiusOfFillet = circleRadius(outline.start, firstFillet.through, firstFillet.to);
                expect(radiusOfFillet).toBeLessThan(6);
                expect(radiusOfFillet).toBeGreaterThan(0.76);
            }
            expect(Math.atan2(outline.start[1], outline.start[0])).toBeGreaterThan(-Math.PI / 20);
        });

        it("should leave the root corners sharp with a rootFillet of 0, the flank running straight up from the root on a small gear and on the involute on a large one", () => {
            // Act
            const small = spurGearOutline(standard({ teeth: 12, rootFillet: 0 }));
            const large = spurGearOutline(standard({ teeth: 60, rootFillet: 0 }));

            // Assert
            expect(small.moves[0]!.kind).toBe("line");
            expect(radius(small.start)).toBeCloseTo(spurGearSizes(standard({ teeth: 12 })).rootRadius, 12);
            expect(large.moves[0]!.kind).toBe("cubic");
            expect(radius(large.start)).toBeCloseTo(spurGearSizes(standard({ teeth: 60 })).rootRadius, 12);
        });

        it("should leave a gap at the tip with backlash, narrowing every tooth", () => {
            // Act
            const plain = spurGearOutline(standard());
            const loose = spurGearOutline(standard({ backlash: 0.3 }));

            // Assert
            const tipWidth = (outline: GearOutline): number => {
                const index = outline.moves.findIndex(move => move.part === "tip");
                const end = outline.moves[index]!.to;
                return Math.atan2(end[1], end[0]);
            };
            expect(tipWidth(loose)).toBeLessThan(tipWidth(plain));
        });
    });

    describe("refusals", () => {
        it("should refuse fewer than three teeth, a module of 0, a pressure angle out of range and a negative backlash", () => {
            // Act & Assert
            expect(() => spurGearOutline(standard({ teeth: 2 }))).toThrow(InputError);
            expect(() => spurGearOutline(standard({ teeth: 10.5 }))).toThrow("`teeth`");
            expect(() => spurGearOutline(standard({ module: 0 }))).toThrow("`module`");
            expect(() => spurGearOutline(standard({ pressureAngle: 50 }))).toThrow("`pressureAngle`");
            expect(() => spurGearOutline(standard({ backlash: -0.1 }))).toThrow("`backlash`");
        });

        it("should refuse an addendum or a dedendum of 0, a negative rootFillet and a profileShift that is not a number", () => {
            // Act & Assert
            expect(() => spurGearOutline(standard({ addendum: 0 }))).toThrow("`addendum`");
            expect(() => spurGearOutline(standard({ dedendum: 0 }))).toThrow("`dedendum`");
            expect(() => spurGearOutline(standard({ rootFillet: -1 }))).toThrow("`rootFillet`");
            expect(() => spurGearOutline(standard({ profileShift: Number.NaN }))).toThrow("`profileShift`");
        });

        it("should refuse teeth so thick at the root that they leave no gap", () => {
            // Act & Assert
            expect(() => spurGearOutline(standard({ pressureAngle: 40, dedendum: 3, addendum: 0.5 }))).toThrow("too thick to leave a gap");
        });

        it("should refuse a root fillet that would reach above the tips of the teeth", () => {
            // Act & Assert
            expect(() => spurGearOutline(standard({ teeth: 3, pressureAngle: 10, rootFillet: 0.5, dedendum: 0.8, addendum: 0.3, profileShift: -0.5 }))).toThrow("reaches above the tip");
        });

        it("should refuse teeth that come to a point below the tip circle", () => {
            // Act & Assert
            expect(() => spurGearOutline(standard({ profileShift: 1.5 }))).toThrow("come to a point");
        });

        it("should refuse a backlash that takes the whole tooth away", () => {
            // Act & Assert
            expect(() => spurGearOutline(standard({ backlash: 4 }))).toThrow("takes the whole tooth away");
        });

        it("should refuse in its sizes the backlash its outline refuses, and a module or a root fillet that is not finite", () => {
            // Act & Assert
            expect(() => spurGearSizes(standard({ backlash: 4 }))).toThrow("`backlash` takes the whole tooth away.");
            expect(() => spurGearSizes(standard({ profileShift: -2.5 }))).toThrow("`profileShift` thins the teeth to nothing at the pitch circle: make it larger.");
            expect(() => spurGearSizes(standard({ module: Infinity }))).toThrow("`module` is not a finite number.");
            expect(() => spurGearSizes(standard({ rootFillet: Infinity }))).toThrow("`rootFillet` is not a finite number.");
            expect(() => spurGearSizes(standard({ backlash: Infinity }))).toThrow("`backlash` is not a finite number.");
            expect(() => spurGearSizes(standard({ dedendum: Infinity }))).toThrow("`dedendum` is not a finite number.");
        });

        it("should refuse a gear whose root circle has no size", () => {
            // Act & Assert
            expect(() => spurGearOutline(standard({ teeth: 3, dedendum: 2 }))).toThrow("root circle has no size");
        });
    });
});
