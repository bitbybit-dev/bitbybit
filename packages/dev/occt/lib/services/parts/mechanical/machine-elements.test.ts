import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import type { TopoDS_Shape } from "../../../../bitbybit-dev-occt/bitbybit-dev-occt";
import createBitbybitOcct from "../../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OCCTService } from "../../../occ-service";
import type * as Inputs from "../../../api/inputs";
import { Inputs as BaseInputs } from "@bitbybit-dev/base";
import type * as Models from "../../../api/models";
import { CAGE_POCKET_SHARE, CAGE_THICKNESS_SHARE } from "../parts.constants";

const B = BaseInputs.Engineering.isoBallBearingEnum;

describe("OCCT parts: springs, bearings and keys", () => {
    let occt: OCCTService;

    beforeAll(async () => {
        const kernel = await createBitbybitOcct();
        occt = new OCCTService(kernel);
    }, 120_000);

    const extent = (shape: TopoDS_Shape): Inputs.Base.Point3 => {
        const box = occt.analysis.measure.tightBoundingBox({ shape });
        return [box.max[0] - box.min[0], box.max[2] - box.min[2], box.max[1] - box.min[1]];
    };

    const namesEveryFaceOnce = (made: Models.OCCT.ShapeWithRoles<TopoDS_Shape>): boolean => {
        const faces = occt.shapes.face.getFaces({ shape: made.shape }).length;
        const named = Object.values(made.roles).flat().sort((a, b) => a - b);
        return JSON.stringify(named) === JSON.stringify(Array.from({ length: faces }, (_, index) => index));
    };

    const sharedVolume = (first: TopoDS_Shape, second: TopoDS_Shape): number => {
        const common = occt.booleans.intersection({ shapes: [first, second], keepEdges: false });
        return occt.shapes.solid.getSolids({ shape: common }).reduce((sum, solid) => sum + occt.shapes.solid.getSolidVolume({ shape: solid }), 0);
    };

    describe("compression springs", () => {
        it("should make a valid spring as long as asked, its ends ground flat and its coils the diameter asked", () => {
            // Act
            const made = occt.parts.mechanical.springs.compressionSpringWithRoles({ wireDiameter: 0.2, diameter: 2, activeCoils: 6, length: 4 });

            // Assert
            const [width, depth, height] = extent(made.shape);
            expect(occt.shapeFix.isValid({ shape: made.shape })).toBe(true);
            expect(height).toBeCloseTo(4, 4);
            expect(width).toBeCloseTo(2, 2);
            expect(depth).toBeCloseTo(2, 2);
            expect(namesEveryFaceOnce(made)).toBe(true);
            expect([made.roles["bottom"]?.length, made.roles["top"]?.length]).toEqual([1, 1]);
        });

        it("should compress to a shorter length with the same wire, its top frame following", () => {
            // Act
            const made = occt.parts.mechanical.springs.compressionSpringWithRoles({ length: 2.5, frame: { origin: [0, 1, 0], normal: [0, 1, 0], direction: [1, 0, 0] } });

            // Assert
            expect(extent(made.shape)[2]).toBeCloseTo(2.5, 4);
            expect(made.frames["top"]?.origin).toEqual([0, 3.5, 0]);
            expect(() => occt.parts.mechanical.springs.compressionSpring({ length: 1.5 })).toThrow("`length`");
        });

        it("should give the wire's centre line on its frame, the coils' diameter less the wire and past both ground ends", () => {
            // Act
            const path = occt.parts.mechanical.springs.compressionSpringPath({ length: 3, frame: { origin: [0, 1, 0], normal: [0, 1, 0], direction: [1, 0, 0] } });

            // Assert
            const box = occt.analysis.measure.tightBoundingBox({ shape: path });
            expect(occt.shapes.wire.getWires({ shape: path })).toHaveLength(1);
            expect(box.max[0] - box.min[0]).toBeCloseTo(1.8, 2);
            expect(box.min[1]).toBeLessThan(1);
            expect(box.max[1]).toBeGreaterThan(4);
            expect(() => occt.parts.mechanical.springs.compressionSpringPath({ length: 1.5 })).toThrow("`length`");
        });
    });

    describe("ball bearings", () => {
        it("should make a 608 22 across and 7 wide of two rings, seven balls and a cage that do not overlap", () => {
            // Act
            const made = occt.parts.mechanical.bearings.iso.ballBearingWithRoles({ designation: B.b608 });

            // Assert
            const solids = occt.shapes.solid.getSolids({ shape: made.shape });
            const [width, , height] = extent(made.shape);
            expect(width).toBeCloseTo(22, 3);
            expect(height).toBeCloseTo(7, 4);
            expect(solids).toHaveLength(10);
            expect(solids.every(solid => occt.shapeFix.isValid({ shape: solid }))).toBe(true);
            expect(namesEveryFaceOnce(made)).toBe(true);
            expect(made.roles["ball"]).toHaveLength(7);
            expect(made.roles["shield"]).toBeUndefined();
            const [inner, outer, ...rest] = solids;
            const balls = rest.slice(0, 7);
            const cage = rest[7]!;
            const overlaps = balls.flatMap(ball => [sharedVolume(ball, inner!), sharedVolume(ball, outer!), sharedVolume(ball, cage)]);
            expect(Math.max(...overlaps)).toBeLessThan(1e-9);
            const centres = balls.map(ball => occt.shapes.solid.getSolidCenterOfMass({ shape: ball }));
            const ball = extent(balls[0]!)[0];
            const pitch = Math.hypot(centres[0]![0], centres[0]![2]);
            const half = CAGE_THICKNESS_SHARE * ball;
            const box = occt.operations.boundingBoxOfShape({ shape: cage });
            const band = occt.shapes.solid.createCylinder({ radius: pitch + half, height: box.max[1] - box.min[1], center: [0, box.min[1], 0], direction: [0, 1, 0] });
            const bore = occt.shapes.solid.createCylinder({ radius: pitch - half, height: box.max[1] - box.min[1], center: [0, box.min[1], 0], direction: [0, 1, 0] });
            const pockets = centres.map(center => occt.shapes.solid.createSphere({ radius: CAGE_POCKET_SHARE * ball, center }));
            const cut = occt.booleans.difference({ shape: band, shapes: [bore, ...pockets], keepEdges: false });
            expect(occt.shapes.face.getFaces({ shape: cage })).toHaveLength(4 + 7);
            const reference = occt.shapes.solid.getSolidVolume({ shape: cut });
            expect(Math.abs(occt.shapes.solid.getSolidVolume({ shape: cage }) - reference) / reference).toBeLessThan(1e-5);
        }, 60_000);

        it("should make the same solids without roles as with them", () => {
            // Act
            const plain = occt.parts.mechanical.bearings.iso.ballBearing({ designation: B.b6204, shields: true });
            const named = occt.parts.mechanical.bearings.iso.ballBearingWithRoles({ designation: B.b6204, shields: true });

            // Assert
            const volumes = (shape: TopoDS_Shape): number[] => occt.shapes.solid.getSolids({ shape }).map(solid => occt.shapes.solid.getSolidVolume({ shape: solid }));
            expect(volumes(plain)).toEqual(volumes(named.shape).map(each => expect.closeTo(each, 9)));
        }, 60_000);

        it("should seat a 6204 on its bore and in its outside, with eight balls and shields on both sides when asked", () => {
            // Act
            const made = occt.parts.mechanical.bearings.iso.ballBearingWithRoles({ designation: B.b6204, shields: true });

            // Assert
            const area = (role: string): number => (made.roles[role] ?? []).reduce((sum, index) => sum + occt.shapes.face.getFaceArea({ shape: occt.shapes.face.getFace({ shape: made.shape, index }) }), 0);
            expect(made.roles["ball"]).toHaveLength(8);
            expect(occt.shapes.solid.getSolids({ shape: made.shape })).toHaveLength(13);
            const chamfer = 0.02 * (47 - 20);
            expect(area("bore")).toBeCloseTo(Math.PI * 20 * (14 - 2 * chamfer), 3);
            expect(area("outside")).toBeCloseTo(Math.PI * 47 * (14 - 2 * chamfer), 3);
            expect(made.roles["shield"]?.length).toBeGreaterThan(0);
            expect([made.roles["innerStart"]?.length, made.roles["innerEnd"]?.length, made.roles["outerStart"]?.length, made.roles["outerEnd"]?.length]).toEqual([1, 1, 1, 1]);
            expect(area("innerStart")).toBeCloseTo(Math.PI * ((20 + 47) / 4 - 0.32 * 0.3 * 27) ** 2 - Math.PI * (10 + chamfer) ** 2, 3);
        }, 60_000);
    });

    describe("ball bearings with shields", () => {
        it.each([B.b625, B.b626, B.b609, B.b6200, B.b6207, B.b6208, B.b608, B.b6204])("should keep the cage and the balls of a %s clear of its shields", designation => {
            // Act
            const made = occt.parts.mechanical.bearings.iso.ballBearingWithRoles({ designation, shields: true });

            // Assert
            const solids = occt.shapes.solid.getSolids({ shape: made.shape });
            const shields = solids.slice(-2);
            const insides = solids.slice(2, -2);
            const overlaps = insides.flatMap(inside => shields.map(shield => sharedVolume(inside, shield)));
            expect(Math.max(...overlaps)).toBeLessThan(1e-9);
        }, 60_000);
    });

    describe("parallel keys", () => {
        it("should make the 8 by 7 key DIN 6885 gives a 25 shaft, with round ends and every face named", () => {
            // Act
            const made = occt.parts.mechanical.keys.din.parallelKeyWithRoles({ shaftDiameter: 25, length: 28 });

            // Assert
            expect(extent(made.shape)).toEqual([expect.closeTo(28, 4), expect.closeTo(8, 4), expect.closeTo(7, 4)]);
            expect(occt.shapes.solid.getSolidVolume({ shape: made.shape })).toBeCloseTo(20 * 8 * 7 + Math.PI * 16 * 7, 4);
            expect(namesEveryFaceOnce(made)).toBe(true);
            expect(Object.fromEntries(Object.entries(made.roles).map(([role, faces]) => [role, faces.length]))).toEqual({ bottom: 1, top: 1, side: 2, end: 2 });
        });

        it("should refuse a key no longer than it is wide and a shaft outside the standard", () => {
            // Act & Assert
            expect(() => occt.parts.mechanical.keys.din.parallelKey({ shaftDiameter: 25, length: 8 })).toThrow("`length`");
            expect(() => occt.parts.mechanical.keys.din.parallelKey({ shaftDiameter: 70, length: 30 })).toThrow("`shaftDiameter`");
        });
    });

    describe("retaining rings", () => {
        const R = BaseInputs.Engineering.retainingRingKindEnum;

        it("should make a DIN 471 ring for a 20 mm shaft that sits in the shaft's groove touching its bottom, sharing no volume", () => {
            // Arrange
            const shaft = occt.shapes.solid.createCylinder({ radius: 10, height: 10, center: [0, -5, 0], direction: [0, 1, 0] });
            const groove = occt.booleans.difference({ shape: occt.shapes.solid.createCylinder({ radius: 11, height: 1.3, center: [0, -0.05, 0], direction: [0, 1, 0] }), shapes: [occt.shapes.solid.createCylinder({ radius: 9.5, height: 1.3, center: [0, -0.05, 0], direction: [0, 1, 0] })], keepEdges: false });
            const grooved = occt.booleans.difference({ shape: shaft, shapes: [groove], keepEdges: false });

            // Act
            const made = occt.parts.mechanical.retainingRings.din.retainingRingWithRoles({ kind: R.shaft, diameter: 20 });
            const clashes = occt.analysis.clashes.betweenShapes({ shapes: [grooved, made.shape] });

            // Assert
            expect(occt.shapeFix.isValid({ shape: made.shape })).toBe(true);
            expect(Object.keys(made.roles).sort()).toEqual(["end", "gap", "lug", "rim", "seat", "start"]);
            expect(made.roles["lug"]).toHaveLength(2);
            expect(clashes).toHaveLength(1);
            expect(clashes[0]!.volume).toBeLessThan(1e-6);
        });

        it("should point a ring's lugs along its frame's direction", () => {
            // Act
            const made = occt.parts.mechanical.retainingRings.din.retainingRingWithRoles({ kind: R.shaft, diameter: 20, frame: { origin: [0, 0, 0], normal: [0, 0, 1], direction: [1, 0, 0] } });

            // Assert
            const lugs = (made.roles["lug"] ?? []).map(index => {
                const box = occt.analysis.measure.tightBoundingBox({ shape: occt.shapes.face.getFace({ shape: made.shape, index }) });
                return [(box.min[0] + box.max[0]) / 2, (box.min[1] + box.max[1]) / 2];
            });
            expect(lugs).toHaveLength(2);
            expect(lugs.every(([x]) => x! > 10)).toBe(true);
            expect(lugs.map(([, y]) => Math.sign(y!)).sort()).toEqual([-1, 1]);
        });

        it("should make a DIN 472 ring for a 47 mm bore that sits in the bore's groove touching its bottom, sharing no volume", () => {
            // Arrange
            const housing = occt.booleans.difference({ shape: occt.shapes.solid.createCylinder({ radius: 35, height: 10, center: [0, -5, 0], direction: [0, 1, 0] }), shapes: [occt.shapes.solid.createCylinder({ radius: 23.5, height: 12, center: [0, -6, 0], direction: [0, 1, 0] }), occt.shapes.solid.createCylinder({ radius: 24.75, height: 1.85, center: [0, -0.05, 0], direction: [0, 1, 0] })], keepEdges: false });

            // Act
            const ring = occt.parts.mechanical.retainingRings.din.retainingRing({ kind: R.bore, diameter: 47 });
            const clashes = occt.analysis.clashes.betweenShapes({ shapes: [housing, ring] });

            // Assert
            expect(occt.shapeFix.isValid({ shape: ring })).toBe(true);
            expect(clashes).toHaveLength(1);
            expect(clashes[0]!.volume).toBeLessThan(1e-6);
        });

        it.each([[R.shaft, 3], [R.shaft, 100], [R.bore, 8], [R.bore, 100]])("should make a valid %s ring at the end of its range, %i", (kind, diameter) => {
            // Act
            const ring = occt.parts.mechanical.retainingRings.din.retainingRing({ kind, diameter });

            // Assert
            expect(occt.shapeFix.isValid({ shape: ring })).toBe(true);
        });

        it("should refuse a diameter the standard lists no ring for", () => {
            // Act & Assert
            expect(() => occt.parts.mechanical.retainingRings.din.retainingRing({ kind: R.shaft, diameter: 21.5 })).toThrow("the nearest is 21");
        });
    });

    describe("kernel objects left after a failure", () => {
        afterEach(() => {
            vi.restoreAllMocks();
        });

        it("should release the meridian of a cage pocket's sphere when it cannot be turned", () => {
            // Arrange
            const arcs: TopoDS_Shape[] = [];
            const arcThroughThreePoints = occt.shapes.edge.arcThroughThreePoints.bind(occt.shapes.edge);
            vi.spyOn(occt.shapes.edge, "arcThroughThreePoints").mockImplementation(inputs => {
                const made = arcThroughThreePoints(inputs);
                arcs.push(made);
                return made;
            });
            const revolve = occt.operations.revolve.bind(occt.operations);
            vi.spyOn(occt.operations, "revolve").mockImplementation(inputs => {
                if (arcs.includes(inputs.shape)) {
                    throw new Error("no sphere this time");
                }
                return revolve(inputs);
            });

            // Act
            const failed = (): unknown => occt.parts.mechanical.bearings.iso.ballBearing({ designation: B.b608, shields: false });

            // Assert
            expect(failed).toThrow("no sphere this time");
            expect(arcs).toHaveLength(1);
            expect(arcs.filter(shape => !shape.isDeleted())).toEqual([]);
        });

        it("should release a spring's coiled wire when the cylinder that grinds its ends cannot be made", () => {
            // Arrange
            const coils: TopoDS_Shape[] = [];
            const pipeWireCylindrical = occt.operations.pipeWireCylindrical.bind(occt.operations);
            vi.spyOn(occt.operations, "pipeWireCylindrical").mockImplementation(inputs => {
                const made = pipeWireCylindrical(inputs);
                coils.push(made);
                return made;
            });
            vi.spyOn(occt.shapes.solid, "createCylinder").mockImplementationOnce(() => {
                throw new Error("no grinder this time");
            });

            // Act
            const failed = (): unknown => occt.parts.mechanical.springs.compressionSpring({ wireDiameter: 1, diameter: 10, activeCoils: 2, length: 12 });

            // Assert
            expect(failed).toThrow("no grinder this time");
            expect(coils).toHaveLength(1);
            expect(coils.filter(shape => !shape.isDeleted())).toEqual([]);
        });
    });

    describe("units", () => {
        const inch = BaseInputs.Base.unitOfLengthEnum.inch;

        it("should make a bearing, a key and a ring in inches as their millimetre twins scaled down by 25.4", () => {
            // Arrange
            const pairs: [TopoDS_Shape, TopoDS_Shape][] = [
                [occt.parts.mechanical.bearings.iso.ballBearing({ designation: B.b608 }), occt.parts.mechanical.bearings.iso.ballBearing({ designation: B.b608, unit: inch })],
                [occt.parts.mechanical.keys.din.parallelKey({ shaftDiameter: 25, length: 28 }), occt.parts.mechanical.keys.din.parallelKey({ shaftDiameter: 25 / 25.4, length: 28 / 25.4, unit: inch })],
                [occt.parts.mechanical.retainingRings.din.retainingRing({ diameter: 20 }), occt.parts.mechanical.retainingRings.din.retainingRing({ diameter: 20 / 25.4, unit: inch })],
            ];

            // Act
            const ratios = pairs.map(([millimetres, inches]) => extent(inches).map((side, axis) => side * 25.4 / extent(millimetres)[axis]!));

            // Assert
            ratios.flat().forEach(ratio => expect(ratio).toBeCloseTo(1, 6));
            pairs.flat().forEach(shape => shape.delete());
        });
    });
});
