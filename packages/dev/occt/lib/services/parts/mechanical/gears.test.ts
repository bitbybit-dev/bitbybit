import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import type { TopoDS_Shape } from "../../../../bitbybit-dev-occt/bitbybit-dev-occt";
import createBitbybitOcct from "../../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { Engineering, InputError } from "@bitbybit-dev/base";
import { ringGearOutline, spurGearOutline } from "@bitbybit-dev/base/lib/api/gears/gears";
import type { SpurGearSpec } from "@bitbybit-dev/base";
import type { GearOutline, RingGearSpec } from "@bitbybit-dev/base/lib/api/gears/gear-types";
import { OCCTService } from "../../../occ-service";
import type * as Inputs from "../../../api/inputs";

type Point2 = Inputs.Base.Point2;

const SAMPLES = 24;
const engineering = new Engineering().mechanical.gears;
const XY_FRAME: Inputs.Base.Frame = { origin: [5, 5, 5], normal: [0, 0, 1], direction: [1, 0, 0] };

const specOf = (teeth: number, backlash = 0): SpurGearSpec => ({ module: 2, teeth, pressureAngle: 20, profileShift: 0, backlash, addendum: 1, dedendum: 1.25, rootFillet: 0.38 });

const RING_SPEC: RingGearSpec = { module: 2, teeth: 60, pressureAngle: 20, backlash: 0, addendum: 1, dedendum: 1.25, rootFillet: 0.38 };

const between = (from: Point2, to: Point2, share: number): Point2 => [from[0] + (to[0] - from[0]) * share, from[1] + (to[1] - from[1]) * share];

const arcPoints = (from: Point2, through: Point2, to: Point2): Point2[] => {
    const ax = from[0];
    const ay = from[1];
    const bx = through[0];
    const by = through[1];
    const cx = to[0];
    const cy = to[1];
    const d = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by));
    const ux = ((ax * ax + ay * ay) * (by - cy) + (bx * bx + by * by) * (cy - ay) + (cx * cx + cy * cy) * (ay - by)) / d;
    const uy = ((ax * ax + ay * ay) * (cx - bx) + (bx * bx + by * by) * (ax - cx) + (cx * cx + cy * cy) * (bx - ax)) / d;
    const radius = Math.hypot(ax - ux, ay - uy);
    const start = Math.atan2(ay - uy, ax - ux);
    const turnTo = (point: Point2): number => {
        const turn = Math.atan2(point[1] - uy, point[0] - ux) - start;
        return d > 0 ? (turn + 2 * Math.PI) % (2 * Math.PI) : -((-turn + 2 * Math.PI) % (2 * Math.PI));
    };
    const sweep = turnTo(to);
    return Array.from({ length: SAMPLES }, (_, step) => {
        const angle = start + sweep * (step + 1) / SAMPLES;
        return [ux + radius * Math.cos(angle), uy + radius * Math.sin(angle)];
    });
};

const enclosedArea = (outline: GearOutline): number => {
    const points: Point2[] = [outline.start];
    let from = outline.start;
    for (const move of outline.moves) {
        if (move.kind === "cubic") {
            for (let step = 1; step <= SAMPLES; step++) {
                const share = step / SAMPLES;
                const a = between(from, move.control1, share);
                const b = between(move.control1, move.control2, share);
                const c = between(move.control2, move.to, share);
                points.push(between(between(a, b, share), between(b, c, share), share));
            }
        } else if (move.kind === "arc") {
            points.push(...arcPoints(from, move.through, move.to));
        } else {
            points.push(move.to);
        }
        from = move.to;
    }
    return Math.abs(points.reduce((sum, point, index) => {
        const next = points[(index + 1) % points.length]!;
        return sum + point[0] * next[1] - next[0] * point[1];
    }, 0)) / 2;
};

describe("OCCT parts: spur gears", () => {
    let occt: OCCTService;

    beforeAll(async () => {
        const kernel = await createBitbybitOcct();
        occt = new OCCTService(kernel);
    }, 120_000);

    const overlapOf = (first: TopoDS_Shape, second: TopoDS_Shape): number => {
        const common = occt.booleans.intersection({ shapes: [first, second], keepEdges: false });
        const solids = occt.shapes.solid.getSolids({ shape: common });
        const volume = solids.reduce((sum, solid) => sum + occt.shapes.solid.getSolidVolume({ shape: solid }), 0);
        solids.forEach(solid => solid.delete());
        common.delete();
        return volume;
    };

    const gearAt = (teeth: number, centre: number, rotation: number): TopoDS_Shape => occt.parts.mechanical.gears.spurGear({
        module: 2,
        teeth,
        backlash: 0.1,
        width: 5,
        rotation,
        frame: { origin: [centre, 0, 0], normal: [0, 0, 1], direction: [1, 0, 0] },
    });

    const worstInsideRingThroughAPitch = (centreDistance: number): number => {
        const pitchOfPinion = 360 / 20;
        const ring = occt.parts.mechanical.gears.ringGear({ module: 2, teeth: 60, backlash: 0.1, width: 5, frame: { origin: [0, 0, 0], normal: [0, 0, 1], direction: [1, 0, 0] } });
        const overlaps = [0, 0.25, 0.5, 0.75, 1].map(share => {
            const turn = share * pitchOfPinion;
            const turnedRing = occt.transforms.rotate({ shape: ring, axis: [0, 0, 1], angle: turn * 20 / 60 });
            const pinion = gearAt(20, centreDistance, pitchOfPinion / 2 + turn);
            const overlap = overlapOf(turnedRing, pinion);
            turnedRing.delete();
            pinion.delete();
            return overlap;
        });
        ring.delete();
        return Math.max(...overlaps);
    };

    const worstOverlapThroughAPitch = (centreDistance: number): number => {
        const pitchOfFirst = 360 / 20;
        const facingGap = 180 - 180 / 30;
        const overlaps = [0, 0.25, 0.5, 0.75, 1].map(share => {
            const turn = share * pitchOfFirst;
            const first = gearAt(20, 0, turn);
            const second = gearAt(30, centreDistance, facingGap - turn * 20 / 30);
            const overlap = overlapOf(first, second);
            first.delete();
            second.delete();
            return overlap;
        });
        return Math.max(...overlaps);
    };

    describe("spurGearProfile", () => {
        it("should draw a closed wire of one edge per move of the outline", () => {
            // Act
            const wire = occt.parts.mechanical.gears.spurGearProfile({ module: 2, teeth: 20, makeFace: false });

            // Assert
            expect(occt.shapes.wire.isWireClosed({ shape: wire })).toBe(true);
            expect(occt.shapes.edge.getEdges({ shape: wire }).length).toBe(spurGearOutline(specOf(20)).moves.length);
        });

        it("should make a face with the area the outline encloses", () => {
            // Act
            const face = occt.parts.mechanical.gears.spurGearProfile({ module: 2, teeth: 20 });

            // Assert
            const sampledArea = enclosedArea(spurGearOutline(specOf(20)));
            expect(Math.abs(occt.shapes.face.getFaceArea({ shape: face }) - sampledArea) / sampledArea).toBeLessThan(1e-4);
        });

        it("should lie in the frame's plane around its origin with a tooth along its direction, until turned by half a pitch", () => {
            // Arrange
            const tipRadius = engineering.spurGearSizes(specOf(20)).tipRadius;

            // Act
            const straight = occt.analysis.measure.tightBoundingBox({ shape: occt.parts.mechanical.gears.spurGearProfile({ module: 2, teeth: 20, frame: XY_FRAME }) });
            const turned = occt.analysis.measure.tightBoundingBox({ shape: occt.parts.mechanical.gears.spurGearProfile({ module: 2, teeth: 20, frame: XY_FRAME, rotation: 9 }) });

            // Assert
            expect(straight.min[2]).toBeCloseTo(5, 6);
            expect(straight.max[2]).toBeCloseTo(5, 6);
            expect(straight.max[0]).toBeCloseTo(5 + tipRadius, 3);
            expect(turned.max[0]).toBeLessThan(5 + tipRadius - 0.1);
        });
    });

    describe("spurGear", () => {
        it("should make a valid solid whose volume is the profile's area times the width less the bore", () => {
            // Arrange
            const area = occt.shapes.face.getFaceArea({ shape: occt.parts.mechanical.gears.spurGearProfile({ module: 2, teeth: 24 }) });

            // Act
            const gear = occt.parts.mechanical.gears.spurGear({ module: 2, teeth: 24, width: 8, bore: 10 });

            // Assert
            expect(occt.shapeFix.isValid({ shape: gear })).toBe(true);
            expect(occt.shapes.solid.getSolidVolume({ shape: gear })).toBeCloseTo(area * 8 - Math.PI * 25 * 8, 2);
        });

        it("should mesh with a gear of other teeth half the module times their teeth together apart, without overlapping through a pitch", () => {
            // Act
            const worst = worstOverlapThroughAPitch(50);

            // Assert
            expect(worst).toBeLessThan(1e-6);
        }, 120_000);

        it("should overlap the other gear when its centre is a millimetre closer than that", () => {
            // Act
            const worst = worstOverlapThroughAPitch(49);

            // Assert
            expect(worst).toBeGreaterThan(1);
        }, 120_000);
    });

    describe("spurGearWithRoles", () => {
        it("should name every face once: a tip per tooth, the flanks, the roots, the bore and the two sides", () => {
            // Arrange
            const outline = spurGearOutline(specOf(20));

            // Act
            const made = occt.parts.mechanical.gears.spurGearWithRoles({ module: 2, teeth: 20, width: 6, bore: 8 });

            // Assert
            const faceCount = occt.shapes.face.getFaces({ shape: made.shape }).length;
            const named = Object.values(made.roles).flat().sort((a, b) => a - b);
            expect(named).toEqual(Array.from({ length: faceCount }, (_, index) => index));
            expect(made.roles["tip"]?.length).toBe(20);
            expect(made.roles["flank"]?.length).toBe(outline.moves.filter(move => move.part === "flank").length);
            expect(made.roles["root"]?.length).toBe(outline.moves.filter(move => move.part === "root").length);
            expect(made.roles["start"]?.length).toBe(1);
            expect(made.roles["end"]?.length).toBe(1);
            const boreArea = (made.roles["bore"] ?? []).reduce((sum, index) => sum + occt.shapes.face.getFaceArea({ shape: occt.shapes.face.getFace({ shape: made.shape, index }) }), 0);
            expect(boreArea).toBeCloseTo(Math.PI * 8 * 6, 3);
        });

        it("should give no bore role to a gear without a bore", () => {
            // Act
            const made = occt.parts.mechanical.gears.spurGearWithRoles({ module: 2, teeth: 12, width: 4 });

            // Assert
            expect(Object.keys(made.roles).sort()).toEqual(["end", "flank", "root", "start", "tip"]);
        });
    });

    describe("ringGearProfile", () => {
        it("should make the ring between its outer circle and its teeth as a face facing the frame's normal", () => {
            // Arrange
            const outer = engineering.ringGearSizes(RING_SPEC).rootRadius + 6;
            const holeArea = enclosedArea(ringGearOutline(RING_SPEC));

            // Act
            const face = occt.parts.mechanical.gears.ringGearProfile({ module: 2, teeth: 60, rim: 6, frame: XY_FRAME });

            // Assert
            const area = occt.shapes.face.getFaceArea({ shape: face });
            expect(Math.abs(area - (Math.PI * outer * outer - holeArea)) / area).toBeLessThan(1e-4);
            expect(occt.shapeFix.isValid({ shape: face })).toBe(true);
            expect(occt.analysis.signatures({ shape: face }).faces[0]!.normal[2]).toBeCloseTo(1, 6);
        });

        it("should draw only the outline of the teeth as a closed wire without a face", () => {
            // Act
            const wire = occt.parts.mechanical.gears.ringGearProfile({ module: 2, teeth: 60, makeFace: false });

            // Assert
            expect(occt.shapes.wire.isWireClosed({ shape: wire })).toBe(true);
            expect(occt.shapes.edge.getEdges({ shape: wire }).length).toBe(ringGearOutline(RING_SPEC).moves.length);
        });
    });

    describe("ringGear", () => {
        it("should make a valid solid whose volume is the ring's area times the width", () => {
            // Arrange
            const area = occt.shapes.face.getFaceArea({ shape: occt.parts.mechanical.gears.ringGearProfile({ module: 2, teeth: 60 }) });

            // Act
            const ring = occt.parts.mechanical.gears.ringGear({ module: 2, teeth: 60, width: 8 });

            // Assert
            expect(occt.shapeFix.isValid({ shape: ring })).toBe(true);
            expect(occt.shapes.solid.getSolidVolume({ shape: ring })).toBeCloseTo(area * 8, 2);
        });

        it("should hold a gear of other teeth inside, half the module times their difference from its centre, without overlapping through a pitch", () => {
            // Act
            const worst = worstInsideRingThroughAPitch(40);

            // Assert
            expect(worst).toBeLessThan(1e-6);
        }, 120_000);

        it("should overlap the gear inside when its centre is a millimetre further out than that", () => {
            // Act
            const worst = worstInsideRingThroughAPitch(41);

            // Assert
            expect(worst).toBeGreaterThan(1);
        }, 120_000);
    });

    describe("ringGearWithRoles", () => {
        it("should name every face once: a tip per tooth, the flanks, the roots, the rim and the two sides", () => {
            // Arrange
            const outline = ringGearOutline(RING_SPEC);

            // Act
            const made = occt.parts.mechanical.gears.ringGearWithRoles({ module: 2, teeth: 60, width: 6 });

            // Assert
            const faceCount = occt.shapes.face.getFaces({ shape: made.shape }).length;
            const named = Object.values(made.roles).flat().sort((a, b) => a - b);
            expect(named).toEqual(Array.from({ length: faceCount }, (_, index) => index));
            expect(made.roles["tip"]?.length).toBe(60);
            expect(made.roles["flank"]?.length).toBe(outline.moves.filter(move => move.part === "flank").length);
            expect(made.roles["root"]?.length).toBe(outline.moves.filter(move => move.part === "root").length);
            expect([made.roles["rim"]?.length, made.roles["start"]?.length, made.roles["end"]?.length]).toEqual([1, 1, 1]);
        });
    });

    describe("frames", () => {
        it("should place the axis at the frame's origin along its normal, pointing toward the first tooth however the gear is turned", () => {
            // Act
            const spur = occt.parts.mechanical.gears.spurGearWithRoles({ module: 2, teeth: 20, rotation: 90, frame: { origin: [1, 2, 3], normal: [0, 0, 2], direction: [1, 0, 0] } });
            const ring = occt.parts.mechanical.gears.ringGearWithRoles({ module: 2, teeth: 60 });

            // Assert
            const axis = spur.frames["axis"]!;
            expect(axis.origin).toEqual([1, 2, 3]);
            expect(axis.normal).toEqual([0, 0, 1]);
            expect(axis.direction[0]).toBeCloseTo(0, 12);
            expect(axis.direction[1]).toBeCloseTo(1, 12);
            expect(ring.frames["axis"]?.normal).toEqual([0, 1, 0]);
        });
    });

    describe("defaults", () => {
        it("should make gears at the scale of the other solids: a 20-tooth gear 4.4 across and 1 thick that turns inside a 40-tooth ring 9.5 across", () => {
            // Act
            const spur = occt.analysis.measure.tightBoundingBox({ shape: occt.parts.mechanical.gears.spurGear({}) });
            const ring = occt.analysis.measure.tightBoundingBox({ shape: occt.parts.mechanical.gears.ringGear({}) });

            // Assert
            expect(spur.max[0] - spur.min[0]).toBeCloseTo(4.4, 3);
            expect(spur.max[1] - spur.min[1]).toBeCloseTo(1, 6);
            expect(ring.max[0] - ring.min[0]).toBeCloseTo(9.5, 3);
        });
    });

    describe("refusals", () => {
        it("should refuse a bore that reaches the root circle, a width of 0 and fewer than three teeth", () => {
            // Act & Assert
            expect(() => occt.parts.mechanical.gears.spurGear({ module: 2, teeth: 20, bore: 36 })).toThrow("`bore`");
            expect(() => occt.parts.mechanical.gears.spurGear({ module: 2, teeth: 20, width: 0 })).toThrow("`width`");
            expect(() => occt.parts.mechanical.gears.spurGearProfile({ module: 2, teeth: 2 })).toThrow(InputError);
        });

        it("should refuse more teeth than a gear is drawn with, and a helical gear twisted through more than it is lofted through, naming the property at fault", () => {
            // Arrange
        const thrownBy = (action: () => unknown): InputError => {
            try {
                action();
            } catch (error) {
                expect(error).toBeInstanceOf(InputError);
                return error as InputError;
            }
            throw new Error("expected an InputError, but nothing was thrown");
        };

            // Act
            const spur = thrownBy(() => occt.parts.mechanical.gears.spurGearProfile({ module: 1, teeth: 1001 }));
            const ring = thrownBy(() => occt.parts.mechanical.gears.ringGear({ module: 1, teeth: 1001 }));
            const rack = thrownBy(() => occt.parts.mechanical.gears.rack({ module: 1, teeth: 1001, height: 5 }));
            const bevel = thrownBy(() => occt.parts.mechanical.gears.bevelGear({ module: 1, teeth: 1001 }));
            const helical = thrownBy(() => occt.parts.mechanical.gears.helicalGear({ module: 1, teeth: 20, helixAngle: 30, width: 360 }));

            // Assert
            expect([spur.property, spur.message]).toEqual(["teeth", "`teeth` is 1001, and a gear is drawn with at most 1000 teeth."]);
            expect([ring.property, rack.property, bevel.property]).toEqual(["teeth", "teeth", "teeth"]);
            expect(helical.property).toBe("width");
            expect(helical.message).toMatch(/^`width` twists the teeth through 10\d\d degrees, more than the 1000 a helical gear is lofted through: make it narrower or its `helixAngle` smaller\.$/);
        });
    });

    describe("racks", () => {
        const worstAlongTheRack = (centreHeight: number): number => {
            const rack = occt.parts.mechanical.gears.rack({ module: 2, teeth: 8, backlash: 0.1, height: 6, width: 5, frame: { origin: [0, 0, 0], normal: [0, 0, 1], direction: [1, 0, 0] } });
            const pitchRadius = 20;
            const overlaps = [0, 0.25, 0.5, 0.75, 1].map(share => {
                const turn = share * 18;
                const travel = pitchRadius * turn * Math.PI / 180;
                const gear = occt.parts.mechanical.gears.spurGear({ module: 2, teeth: 20, backlash: 0.1, width: 5, rotation: -90 + 9 - turn, frame: { origin: [3 * 2 * Math.PI + travel, centreHeight, 0], normal: [0, 0, 1], direction: [1, 0, 0] } });
                const overlap = overlapOf(rack, gear);
                gear.delete();
                return overlap;
            });
            rack.delete();
            return Math.max(...overlaps);
        };

        it("should make a valid rack, naming its tips, flanks, roots, back and ends", () => {
            // Act
            const made = occt.parts.mechanical.gears.rackWithRoles({ module: 1, teeth: 6, height: 3, width: 2 });

            // Assert
            expect(occt.shapeFix.isValid({ shape: made.shape })).toBe(true);
            expect(Object.keys(made.roles).sort()).toEqual(["back", "end", "flank", "root", "side", "start", "tip"]);
            expect(made.roles["tip"]).toHaveLength(6);
            expect(made.roles["side"]).toHaveLength(2);
            expect(made.frames["pitch"]?.origin).toEqual([0, 0, 0]);
        });

        it("should mesh a 20 tooth gear with a rack through a pitch at its pitch radius, and overlap it a millimetre closer", () => {
            // Act
            const meshing = worstAlongTheRack(20);
            const closer = worstAlongTheRack(19);

            // Assert
            expect(meshing).toBeLessThan(1e-6);
            expect(closer).toBeGreaterThan(0.1);
        });
    });

    describe("hubs and keyways", () => {
        it("should stand a hub out of the gear's end, drill the bore through both and cut a DIN 6885 keyway along it", () => {
            // Act
            const plain = occt.parts.mechanical.gears.spurGear({ module: 2, teeth: 30, width: 8, bore: 20 });
            const made = occt.parts.mechanical.gears.spurGearWithRoles({ module: 2, teeth: 30, width: 8, bore: 20, hub: 36, hubLength: 6, keyway: true });

            // Assert
            expect(occt.shapeFix.isValid({ shape: made.shape })).toBe(true);
            expect(Object.keys(made.roles).sort()).toEqual(["bore", "end", "flank", "hub", "keyway", "root", "start", "tip"]);
            const extent = occt.analysis.measure.tightBoundingBox({ shape: made.shape });
            expect(extent.max[1] - extent.min[1]).toBeCloseTo(14, 3);
            const hubVolume = Math.PI * (18 * 18 - 10 * 10) * 6;
            const boreSegment = 3 * Math.sqrt(100 - 9) + 100 * Math.asin(3 / 10);
            const keyway = (6 * 12.8 - boreSegment) * 14;
            expect(occt.shapes.solid.getSolidVolume({ shape: made.shape })).toBeCloseTo(occt.shapes.solid.getSolidVolume({ shape: plain }) + hubVolume - keyway, 0);
        });

        it("should refuse a keyway without a bore, a hub larger than the root circle and a hub with no length", () => {
            // Act & Assert
            expect(() => occt.parts.mechanical.gears.spurGear({ module: 2, teeth: 30, width: 8, keyway: true })).toThrow("give the gear a `bore` first");
            expect(() => occt.parts.mechanical.gears.spurGear({ module: 2, teeth: 30, width: 8, bore: 10, hub: 80, hubLength: 5 })).toThrow("A hub's diameter lies between");
            expect(() => occt.parts.mechanical.gears.spurGear({ module: 2, teeth: 30, width: 8, bore: 10, hub: 20 })).toThrow("A hub's diameter lies between");
        });
    });

    describe("a planetary set laid out by planetarySet", () => {
        const placed = (sunTeeth: number, planetTeeth: number, planets: number, nudge: number): number => {
            const set = engineering.planetarySet({ module: 1, sunTeeth, planetTeeth, planets });
            const ground = (origin: Inputs.Base.Point3): Inputs.Base.Frame => ({ origin, normal: [0, 0, 1], direction: [1, 0, 0] });
            const sun = occt.parts.mechanical.gears.spurGear({ module: 1, teeth: sunTeeth, backlash: 0.05, width: 2, frame: ground([0, 0, 0]) });
            const ring = occt.parts.mechanical.gears.ringGear({ module: 1, teeth: set.ringTeeth, backlash: 0.05, width: 2, rotation: set.ringRotation, frame: ground([0, 0, 0]) });
            const gears = set.planetCentres.map((centre, index) => occt.parts.mechanical.gears.spurGear({ module: 1, teeth: planetTeeth, backlash: 0.05, width: 2, rotation: set.planetRotations[index]! + (index === planets - 1 ? nudge : 0), frame: ground(centre) }));
            const worst = Math.max(...gears.flatMap(planet => [overlapOf(sun, planet), overlapOf(ring, planet)]));
            [sun, ring, ...gears].forEach(shape => shape.delete());
            return worst;
        };

        it.each([[18, 12, 3], [17, 13, 3]])("should mesh a %i tooth sun, %i tooth planets times %i and the ring with no overlap", (sunTeeth, planetTeeth, planets) => {
            // Act
            const worst = placed(sunTeeth, planetTeeth, planets, 0);

            // Assert
            expect(worst).toBeLessThan(1e-6);
        });

        it("should overlap once the last planet is turned half a tooth from where it meshes", () => {
            // Act
            const worst = placed(18, 12, 3, 360 / 12 / 2);

            // Assert
            expect(worst).toBeGreaterThan(0.01);
        });
    });

    describe("fillets too large for the gap", () => {
        it.each([
            ["a fine spur gear", { module: 0.2, teeth: 20, rootFillet: 2 }],
            ["a 12-tooth spur gear", { module: 2, teeth: 12, rootFillet: 1.5 }],
        ])("should shrink the root fillet of %s to fit, leaving a valid gear", (_, spec) => {
            // Act
            const gear = occt.parts.mechanical.gears.spurGear(spec);

            // Assert
            expect(occt.shapeFix.isValid({ shape: gear })).toBe(true);
        });

        it.each([
            ["a 60-tooth ring", { module: 1, teeth: 60, rootFillet: 1 }],
            ["a 40-tooth ring", { module: 1, teeth: 40, rootFillet: 0.6 }],
        ])("should shrink the rounded corners of %s to fit, leaving a valid ring", (_, spec) => {
            // Act
            const ring = occt.parts.mechanical.gears.ringGear(spec);

            // Assert
            expect(occt.shapeFix.isValid({ shape: ring })).toBe(true);
        });
    });

    describe("kernel objects left after a failure", () => {
        afterEach(() => {
            vi.restoreAllMocks();
        });

        it("should release a bored spur gear's first outline when its second cannot be drawn", () => {
            // Arrange
            const outlines: TopoDS_Shape[] = [];
            const penWithSegments = occt.sketch.penWithSegments.bind(occt.sketch);
            vi.spyOn(occt.sketch, "penWithSegments")
                .mockImplementationOnce(inputs => {
                    const made = penWithSegments(inputs);
                    outlines.push(made.shape);
                    return made;
                })
                .mockImplementationOnce(() => {
                    throw new Error("no second outline this time");
                });

            // Act
            const failed = (): unknown => occt.parts.mechanical.gears.spurGear({ module: 2, teeth: 20, bore: 8 });

            // Assert
            expect(failed).toThrow("no second outline this time");
            expect(outlines).toHaveLength(1);
            expect(outlines.filter(shape => !shape.isDeleted())).toEqual([]);
        });

        it("should release every section and the first half of a herringbone gear when its second half cannot be lofted", () => {
            // Arrange
            const made: TopoDS_Shape[] = [];
            const penWithSegments = occt.sketch.penWithSegments.bind(occt.sketch);
            vi.spyOn(occt.sketch, "penWithSegments").mockImplementation(inputs => {
                const drawn = penWithSegments(inputs);
                made.push(drawn.shape);
                return drawn;
            });
            const loftWithHistory = occt.operations.loftWithHistory.bind(occt.operations);
            vi.spyOn(occt.operations, "loftWithHistory")
                .mockImplementationOnce(inputs => {
                    const lofted = loftWithHistory(inputs);
                    made.push(lofted.shape);
                    return lofted;
                })
                .mockImplementationOnce(() => {
                    throw new Error("no second half this time");
                });

            // Act
            const failed = (): unknown => occt.parts.mechanical.gears.helicalGear({ module: 1, teeth: 20, helixAngle: 30, width: 4, herringbone: true, bore: 4 });

            // Assert
            expect(failed).toThrow("no second half this time");
            expect(made.length).toBeGreaterThan(4);
            expect(made.filter(shape => !shape.isDeleted())).toEqual([]);
        });

        it("should release a bevel gear's back outline when its front cannot be scaled from it", () => {
            // Arrange
            const backs: TopoDS_Shape[] = [];
            const combineEdgesAndWiresIntoAWire = occt.shapes.wire.combineEdgesAndWiresIntoAWire.bind(occt.shapes.wire);
            vi.spyOn(occt.shapes.wire, "combineEdgesAndWiresIntoAWire").mockImplementation(inputs => {
                const made = combineEdgesAndWiresIntoAWire(inputs);
                backs.push(made);
                return made;
            });
            vi.spyOn(occt.transforms, "scale").mockImplementationOnce(() => {
                throw new Error("no front this time");
            });

            // Act
            const failed = (): unknown => occt.parts.mechanical.gears.bevelGear({});

            // Assert
            expect(failed).toThrow("no front this time");
            expect(backs).toHaveLength(1);
            expect(backs.filter(shape => !shape.isDeleted())).toEqual([]);
        });
    });
});
