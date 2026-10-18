import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import type { TopoDS_Shape } from "../../../../bitbybit-dev-occt/bitbybit-dev-occt";
import createBitbybitOcct from "../../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OCCTService } from "../../../occ-service";
import type * as Inputs from "../../../api/inputs";
import { InputError, Inputs as BaseInputs } from "@bitbybit-dev/base";
import type * as Models from "../../../api/models";

const M = BaseInputs.Engineering.metricSizeEnum;

describe("OCCT parts: fasteners", () => {
    let occt: OCCTService;

    beforeAll(async () => {
        const kernel = await createBitbybitOcct();
        occt = new OCCTService(kernel);
    }, 120_000);

    const box = (shape: TopoDS_Shape): Inputs.Base.Point3 => {
        const measured = occt.analysis.measure.tightBoundingBox({ shape });
        return [measured.max[0] - measured.min[0], measured.max[2] - measured.min[2], measured.max[1] - measured.min[1]];
    };

    const namesEveryFaceOnce = (made: Models.OCCT.ShapeWithRoles<TopoDS_Shape>): boolean => {
        const faces = occt.shapes.face.getFaces({ shape: made.shape }).length;
        const named = Object.values(made.roles).flat().sort((a, b) => a - b);
        return JSON.stringify(named) === JSON.stringify(Array.from({ length: faces }, (_, index) => index));
    };

    const heightRangeOf = (made: Models.OCCT.ShapeWithRoles<TopoDS_Shape>, role: string): [number, number] => {
        const boxes = (made.roles[role] ?? []).map(index => occt.analysis.measure.tightBoundingBox({ shape: occt.shapes.face.getFace({ shape: made.shape, index }) }));
        return [Math.min(...boxes.map(each => each.min[1])), Math.max(...boxes.map(each => each.max[1]))];
    };

    describe("socket head cap screws", () => {
        it("should make an ISO 4762 M5 screw 40 long: an 8.5 head 5 high above its frame and the shank below", () => {
            // Act
            const screw = occt.parts.mechanical.fasteners.socketHeadCapScrew({ size: M.m5, length: 40 });

            // Assert
            const [width, depth, height] = box(screw);
            expect(occt.shapeFix.isValid({ shape: screw })).toBe(true);
            expect(width).toBeCloseTo(8.5, 3);
            expect(depth).toBeCloseTo(8.5, 3);
            expect(height).toBeCloseTo(45, 3);
        });

        it("should name every face once, threading the last 22 from the tip and leaving the shank above it plain", () => {
            // Act
            const made = occt.parts.mechanical.fasteners.socketHeadCapScrewWithRoles({ size: M.m5, length: 40 });

            // Assert
            expect(namesEveryFaceOnce(made)).toBe(true);
            expect(Object.keys(made.roles).sort()).toEqual(["end", "head", "recess", "seat", "shank", "thread"]);
            expect(made.roles["recess"]).toHaveLength(7);
            const [threadFrom, threadTo] = heightRangeOf(made, "thread");
            expect(threadTo - threadFrom).toBeCloseTo(22 - 0.4906, 2);
            expect(heightRangeOf(made, "shank")[1]).toBeCloseTo(0, 6);
        });

        it("should thread a short screw to its head, leaving no shank", () => {
            // Act
            const made = occt.parts.mechanical.fasteners.socketHeadCapScrewWithRoles({ size: M.m5, length: 16 });

            // Assert
            expect(made.roles["shank"]).toBeUndefined();
            expect(heightRangeOf(made, "thread")[1]).toBeCloseTo(0, 6);
        });

        it("should model a cap screw's thread when asked, keeping its head and its recess", () => {
            // Arrange
            const cosmetic = occt.parts.mechanical.fasteners.socketHeadCapScrewWithRoles({ size: M.m4, length: 12 });

            // Act
            const modelled = occt.parts.mechanical.fasteners.socketHeadCapScrewWithRoles({ size: M.m4, length: 12, modelledThread: true });

            // Assert
            expect(occt.shapeFix.isValid({ shape: modelled.shape })).toBe(true);
            expect(namesEveryFaceOnce(modelled)).toBe(true);
            expect(occt.shapes.solid.getSolidVolume({ shape: modelled.shape })).toBeLessThan(occt.shapes.solid.getSolidVolume({ shape: cosmetic.shape }));
            expect(modelled.roles["recess"]?.length).toBe(cosmetic.roles["recess"]?.length);
            expect(modelled.roles["seat"]?.length).toBe(1);
        }, 120_000);

        it("should sit on its frame, the head along the normal and its seat the frame itself", () => {
            // Arrange
            const frame: Inputs.Base.Frame = { origin: [1, 2, 3], normal: [0, 1, 0], direction: [1, 0, 0] };

            // Act
            const made = occt.parts.mechanical.fasteners.socketHeadCapScrewWithRoles({ size: M.m3, length: 10, frame });

            // Assert
            const measured = occt.analysis.measure.tightBoundingBox({ shape: made.shape });
            expect(measured.min[1]).toBeCloseTo(2 - 10, 3);
            expect(measured.max[1]).toBeCloseTo(2 + 3, 3);
            expect(made.frames["seat"]).toEqual(frame);
        });
    });

    describe("hexagon bolts, nuts and washers", () => {
        it("should make an M8 bolt's head 13 across its flats with a flat facing the frame's direction, threaded to the head unless asked otherwise", () => {
            // Act
            const full = occt.parts.mechanical.fasteners.hexBoltWithRoles({ size: M.m8, length: 40 });
            const part = occt.parts.mechanical.fasteners.hexBoltWithRoles({ size: M.m8, length: 40, fullyThreaded: false });

            // Assert
            const [width, depth, height] = box(full.shape);
            expect(width).toBeCloseTo(13, 3);
            expect(depth).toBeCloseTo(13 * 2 / Math.sqrt(3), 2);
            expect(height).toBeCloseTo(45.3, 3);
            expect(namesEveryFaceOnce(full) && namesEveryFaceOnce(part)).toBe(true);
            expect(full.roles["shank"]).toBeUndefined();
            expect(heightRangeOf(part, "shank")).toEqual([expect.closeTo(-18, 3), expect.closeTo(0, 6)]);
        });

        it("should model the thread when asked, cutting only the threaded length, so a bolt not threaded to its head shows its plain shank", () => {
            // Arrange
            const slab = (from: number, to: number): TopoDS_Shape => occt.shapes.solid.createBox({ width: 20, length: 20, height: to - from, center: [0, (from + to) / 2, 0], originOnCenter: true });
            const within = (shape: TopoDS_Shape, from: number, to: number): number => occt.shapes.solid.getSolidVolume({ shape: occt.booleans.intersection({ shapes: [shape, slab(from, to)], keepEdges: false }) });
            const cosmetic = occt.parts.mechanical.fasteners.hexBolt({ size: M.m5, length: 30, fullyThreaded: false });

            // Act
            const full = occt.parts.mechanical.fasteners.hexBoltWithRoles({ size: M.m5, length: 30, modelledThread: true });
            const part = occt.parts.mechanical.fasteners.hexBoltWithRoles({ size: M.m5, length: 30, fullyThreaded: false, modelledThread: true });

            // Assert
            expect(occt.shapeFix.isValid({ shape: full.shape }) && occt.shapeFix.isValid({ shape: part.shape })).toBe(true);
            expect(namesEveryFaceOnce(full) && namesEveryFaceOnce(part)).toBe(true);
            expect(full.roles["shank"]).toBeUndefined();
            const [shankFrom, shankTo] = heightRangeOf(part, "shank");
            expect(shankFrom).toBeLessThanOrEqual(-14 + 1e-6);
            expect(shankFrom).toBeGreaterThan(-14 - 0.8);
            expect(shankTo).toBeCloseTo(0, 6);
            expect(heightRangeOf(part, "thread")).toEqual([expect.closeTo(-30, 1), expect.closeTo(-14, 6)]);
            expect(heightRangeOf(part, "end")[1]).toBeLessThan(-29.5);
            expect((part.roles["thread"] ?? []).length).toBeGreaterThan(1);
            expect(within(part.shape, -13.9, -0.1)).toBeCloseTo(within(cosmetic, -13.9, -0.1), 6);
            expect(within(full.shape, -13.9, -0.1)).toBeLessThan(within(cosmetic, -13.9, -0.1));
            expect(within(full.shape, 0, 10)).toBeCloseTo(within(cosmetic, 0, 10), 6);
            expect(within(part.shape, -29, -15)).toBeLessThan(within(cosmetic, -29, -15));
        }, 120_000);

        it("should make an M8 nut 6.8 high with its hole at the nominal diameter, so the bolt of its size runs through it without a clash", () => {
            // Arrange
            const bolt = occt.parts.mechanical.fasteners.hexBolt({ size: M.m8, length: 40 });

            // Act
            const made = occt.parts.mechanical.fasteners.hexNutWithRoles({ size: M.m8, frame: { origin: [0, -30, 0], normal: [0, 1, 0], direction: [1, 0, 0] } });

            // Assert
            expect(namesEveryFaceOnce(made)).toBe(true);
            expect(Object.keys(made.roles).sort()).toEqual(["seat", "side", "thread", "top"]);
            expect(box(made.shape)[2]).toBeCloseTo(6.8, 3);
            const common = occt.booleans.intersection({ shapes: [bolt, made.shape], keepEdges: false });
            const shared = occt.shapes.solid.getSolids({ shape: common }).reduce((sum, solid) => sum + occt.shapes.solid.getSolidVolume({ shape: solid }), 0);
            expect(shared).toBeLessThan(1e-6);
        });

        it("should make an M8 washer of the size ISO 7089 gives it", () => {
            // Act
            const made = occt.parts.mechanical.fasteners.washerWithRoles({ size: M.m8 });

            // Assert
            expect(namesEveryFaceOnce(made)).toBe(true);
            expect(occt.shapes.solid.getSolidVolume({ shape: made.shape })).toBeCloseTo(Math.PI * (8 * 8 - 4.2 * 4.2) * 1.6, 3);
            expect(Object.fromEntries(Object.entries(made.roles).map(([role, faces]) => [role, faces.length]))).toEqual({ seat: 1, top: 1, bore: 1, rim: 1 });
        });
    });

    describe("set screws and dowel pins", () => {
        it("should make an M4 set screw threaded its whole length with a recess in its top end, and refuse one too short for them", () => {
            // Act
            const made = occt.parts.mechanical.fasteners.setScrewWithRoles({ size: M.m4, length: 6 });

            // Assert
            expect(namesEveryFaceOnce(made)).toBe(true);
            expect(Object.keys(made.roles).sort()).toEqual(["end", "recess", "thread", "top"]);
            expect(box(made.shape)[2]).toBeCloseTo(6, 3);
            expect(() => occt.parts.mechanical.fasteners.setScrew({ size: M.m4, length: 2 })).toThrow("`length`");
        });

        it.each(["flat", "cone", "dog", "cup"] as const)("should make an M5 set screw 10 long with a %s point, valid, its point the bottom of the screw", point => {
            // Act
            const made = occt.parts.mechanical.fasteners.setScrewWithRoles({ size: M.m5, length: 10, point: BaseInputs.Engineering.setScrewPointEnum[point] });

            // Assert
            expect(occt.shapeFix.isValid({ shape: made.shape })).toBe(true);
            expect(namesEveryFaceOnce(made)).toBe(true);
            expect(box(made.shape)[2]).toBeCloseTo(10, 3);
            expect(heightRangeOf(made, "end")[0]).toBeCloseTo(-10, 3);
        });

        it("should give a dog point its dog, a cup its recess and a cone its taper, each taking a different share of the screw", () => {
            // Act
            const volumes = (["flat", "cone", "dog", "cup"] as const).map(point => occt.shapes.solid.getSolidVolume({ shape: occt.parts.mechanical.fasteners.setScrew({ size: M.m5, length: 10, point: BaseInputs.Engineering.setScrewPointEnum[point] }) }));
            const dog = occt.parts.mechanical.fasteners.setScrewWithRoles({ size: M.m5, length: 10, point: BaseInputs.Engineering.setScrewPointEnum.dog });

            // Assert
            expect(new Set(volumes.map(volume => volume.toFixed(3))).size).toBe(4);
            expect(volumes[1]).toBeLessThan(volumes[0]!);
            expect(box(occt.shapes.face.getFace({ shape: dog.shape, index: dog.roles["end"]![0]! }))[0]).toBeLessThanOrEqual(3.5 + 1e-6);
        });

        it("should make the M8 ISO 7090 washer chamfered on the face away from its seat, and refuse a chamfered M4", () => {
            // Act
            const plain = occt.parts.mechanical.fasteners.washer({ size: M.m8 });
            const made = occt.parts.mechanical.fasteners.washerWithRoles({ size: M.m8, chamfered: true });
            const small = (): unknown => occt.parts.mechanical.fasteners.washer({ size: M.m4, chamfered: true });

            // Assert
            expect(occt.shapeFix.isValid({ shape: made.shape })).toBe(true);
            expect(namesEveryFaceOnce(made)).toBe(true);
            expect(occt.shapes.solid.getSolidVolume({ shape: made.shape })).toBeLessThan(occt.shapes.solid.getSolidVolume({ shape: plain }));
            expect(made.roles["rim"]).toHaveLength(2);
            expect(small).toThrow("ISO 7090 starts at M5");
        });

        it("should make a dowel pin with chamfered ends, its side one face", () => {
            // Act
            const made = occt.parts.mechanical.fasteners.dowelPinWithRoles({ diameter: 4, length: 16 });

            // Assert
            expect(namesEveryFaceOnce(made)).toBe(true);
            expect(made.roles["side"]).toHaveLength(1);
            expect(occt.shapes.solid.getSolidVolume({ shape: made.shape })).toBeLessThan(Math.PI * 4 * 16);
            expect(occt.shapes.solid.getSolidVolume({ shape: made.shape })).toBeGreaterThan(Math.PI * 4 * 15);
        });
    });

    describe("refusals", () => {
        it("should refuse a size it does not know and a length of 0", () => {
            // Act & Assert
            expect(() => occt.parts.mechanical.fasteners.hexNut({ size: "M7" as BaseInputs.Engineering.metricSizeEnum })).toThrow("`size`");
            expect(() => occt.parts.mechanical.fasteners.socketHeadCapScrew({ size: M.m3, length: 0 })).toThrow("`length`");
            expect(() => occt.parts.mechanical.fasteners.dowelPin({ diameter: 4, length: 0.5 })).toThrow("`length`");
        });
    });

    describe("kernel objects left after a refusal or a failure", () => {
        afterEach(() => {
            vi.restoreAllMocks();
        });

        it("should refuse a modelled thread that is not a flag before it builds the screw, leaving no solid behind", () => {
            // Arrange
            const solids: TopoDS_Shape[] = [];
            const fromFaces = occt.shapes.solid.fromFaces.bind(occt.shapes.solid);
            vi.spyOn(occt.shapes.solid, "fromFaces").mockImplementation(inputs => {
                const made = fromFaces(inputs);
                solids.push(made);
                return made;
            });
            const notAFlag: unknown = "yes";

            // Act
            const refused = (): unknown => occt.parts.mechanical.fasteners.socketHeadCapScrew({ size: M.m3, length: 10, modelledThread: notAFlag as boolean });

            // Assert
            expect(refused).toThrow(InputError);
            expect(refused).toThrow("modelledThread");
            expect(solids.filter(shape => !shape.isDeleted())).toEqual([]);
        });

        it("should release a nut's turned profile when its hexagon cannot be made", () => {
            // Arrange
            const turned: TopoDS_Shape[] = [];
            const revolve = occt.operations.revolve.bind(occt.operations);
            vi.spyOn(occt.operations, "revolve").mockImplementation(inputs => {
                const made = revolve(inputs);
                turned.push(made);
                return made;
            });
            vi.spyOn(occt.operations, "extrude").mockImplementationOnce(() => {
                throw new Error("no prism this time");
            });

            // Act
            const failed = (): unknown => occt.parts.mechanical.fasteners.hexNut({ size: M.m8 });

            // Assert
            expect(failed).toThrow("no prism this time");
            expect(turned).toHaveLength(1);
            expect(turned.filter(shape => !shape.isDeleted())).toEqual([]);
        });

        it("should release a socket screw's head rim when its socket cannot be drawn", () => {
            // Arrange
            const circles: TopoDS_Shape[] = [];
            const createCircleWire = occt.shapes.wire.createCircleWire.bind(occt.shapes.wire);
            vi.spyOn(occt.shapes.wire, "createCircleWire").mockImplementation(inputs => {
                const made = createCircleWire(inputs);
                circles.push(made);
                return made;
            });
            vi.spyOn(occt.shapes.wire, "createPolygonWire").mockImplementationOnce(() => {
                throw new Error("no hexagon this time");
            });

            // Act
            const failed = (): unknown => occt.parts.mechanical.fasteners.socketHeadCapScrew({ size: M.m3, length: 10 });

            // Assert
            expect(failed).toThrow("no hexagon this time");
            expect(circles).toHaveLength(1);
            expect(circles.filter(shape => !shape.isDeleted())).toEqual([]);
        });

        it("should release every face of a part it names when naming one of them fails", () => {
            // Arrange
            const listed: TopoDS_Shape[] = [];
            const getFaces = occt.shapes.face.getFaces.bind(occt.shapes.face);
            vi.spyOn(occt.shapes.face, "getFaces").mockImplementation(inputs => {
                const faces = getFaces(inputs);
                listed.push(...faces);
                return faces;
            });
            vi.spyOn(occt.analysis.surfaces, "surfaceType").mockImplementationOnce(() => {
                throw new Error("no surface this time");
            });

            // Act
            const failed = (): unknown => occt.parts.mechanical.fasteners.washer({ size: M.m8 });

            // Assert
            expect(failed).toThrow("no surface this time");
            expect(listed.length).toBeGreaterThan(1);
            expect(listed.filter(face => !face.isDeleted())).toEqual([]);
        });
    });
});
