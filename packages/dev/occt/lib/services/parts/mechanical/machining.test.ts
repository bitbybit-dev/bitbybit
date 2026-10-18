import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import type { BitbybitOcctModule, TopoDS_Shape } from "../../../../bitbybit-dev-occt/bitbybit-dev-occt";
import createBitbybitOcct from "../../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { InputError, Inputs as BaseInputs } from "@bitbybit-dev/base";
import { OccHelper } from "../../../occ-helper";
import { OCCTService } from "../../../occ-service";

describe("OCCT parts: machining", () => {
    let kernel: BitbybitOcctModule;
    let occt: OCCTService;

    beforeAll(async () => {
        kernel = await createBitbybitOcct();
        occt = new OCCTService(kernel);
    }, 120_000);

    const volume = (shape: TopoDS_Shape): number => occt.shapes.solid.getSolidVolume({ shape });
    const valid = (shape: TopoDS_Shape): boolean => occt.shapeFix.isValid({ shape });
    const rod = (radius: number, height: number): TopoDS_Shape => occt.shapes.solid.createCylinder({ radius, height, center: [0, 0, 0], direction: [0, 1, 0] });
    const sharedVolume = (first: TopoDS_Shape, second: TopoDS_Shape): number => {
        const clashes = occt.analysis.clashes.betweenShapes({ shapes: [first, second] });
        return clashes.reduce((sum, clash) => sum + clash.volume, 0);
    };

    describe("keyways", () => {
        it("should mill a round-ended pocket a DIN 6885 key sits in, touching it and sharing no volume", () => {
            // Arrange
            const shaft = rod(10, 40);
            const frame: BaseInputs.Base.Frame = { origin: [0, 5, 0], normal: [0, 1, 0], direction: [1, 0, 0] };

            // Act
            const keyed = occt.parts.mechanical.machining.keyway({ shape: shaft, diameter: 20, length: 25, frame });
            const key = occt.parts.mechanical.keys.parallelKey({ shaftDiameter: 20, length: 25, frame: { origin: [10 - 3.5, 0, 17.5], normal: [1, 0, 0], direction: [0, 1, 0] } });

            // Assert
            expect(valid(keyed)).toBe(true);
            const removed = volume(shaft) - volume(keyed);
            expect(removed).toBeGreaterThan(19 * 6 * 3);
            expect(removed).toBeLessThan(25 * 6 * 3.5);
            expect(sharedVolume(keyed, key)).toBeLessThan(1e-6);
        });

        it("should cut a straight keyway through a hub's bore as deep as DIN 6885 gives the hub", () => {
            // Arrange
            const hub = occt.booleans.difference({ shape: rod(20, 15), shapes: [occt.shapes.solid.createCylinder({ radius: 10, height: 17, center: [0, -1, 0], direction: [0, 1, 0] })], keepEdges: false });

            // Act
            const keyed = occt.parts.mechanical.machining.keyway({ shape: hub, diameter: 20, length: 15, inHub: true });

            // Assert
            expect(valid(keyed)).toBe(true);
            const boreSegment = 3 * Math.sqrt(100 - 9) + 100 * Math.asin(3 / 10);
            expect(volume(hub) - volume(keyed)).toBeCloseTo((6 * 12.8 - boreSegment) * 15, 3);
        });

        it("should refuse a pocket no longer than the key's width and a shaft outside DIN 6885's range", () => {
            // Act & Assert
            expect(() => occt.parts.mechanical.machining.keywayTool({ diameter: 20, length: 6 })).toThrow("`length` is not more than the keyway's width");
            expect(() => occt.parts.mechanical.machining.keywayTool({ diameter: 80, length: 30 })).toThrow();
        });
    });

    describe("flats and ring grooves", () => {
        it("should cut a flat removing the circular segment beyond its plane", () => {
            // Arrange
            const shaft = rod(4, 30);

            // Act
            const flatted = occt.parts.mechanical.machining.flat({ shape: shaft, diameter: 8, depth: 0.5, length: 12 });

            // Assert
            const segment = 16 * Math.acos(3.5 / 4) - 3.5 * Math.sqrt(16 - 12.25);
            expect(valid(flatted)).toBe(true);
            expect(volume(shaft) - volume(flatted)).toBeCloseTo(segment * 12, 4);
        });

        it("should cut a shaft's ring groove a DIN 471 ring sits in at the same frame, sharing no volume", () => {
            // Arrange
            const shaft = rod(10, 40);
            const frame: BaseInputs.Base.Frame = { origin: [0, 30, 0], normal: [0, 1, 0], direction: [1, 0, 0] };

            // Act
            const grooved = occt.parts.mechanical.machining.ringGroove({ shape: shaft, diameter: 20, frame });
            const ring = occt.parts.mechanical.retainingRings.retainingRing({ diameter: 20, frame });

            // Assert
            expect(valid(grooved)).toBe(true);
            expect(volume(shaft) - volume(grooved)).toBeCloseTo(Math.PI * (100 - 90.25) * 1.3, 4);
            expect(sharedVolume(grooved, ring)).toBeLessThan(1e-6);
        });

        it("should cut a bore's ring groove a DIN 472 ring sits in", () => {
            // Arrange
            const housing = occt.booleans.difference({ shape: rod(35, 20), shapes: [occt.shapes.solid.createCylinder({ radius: 23.5, height: 22, center: [0, -1, 0], direction: [0, 1, 0] })], keepEdges: false });
            const frame: BaseInputs.Base.Frame = { origin: [0, 5, 0], normal: [0, 1, 0], direction: [1, 0, 0] };

            // Act
            const grooved = occt.parts.mechanical.machining.ringGroove({ shape: housing, kind: BaseInputs.Engineering.retainingRingKindEnum.bore, diameter: 47, frame });
            const ring = occt.parts.mechanical.retainingRings.retainingRing({ kind: BaseInputs.Engineering.retainingRingKindEnum.bore, diameter: 47, frame });

            // Assert
            expect(valid(grooved)).toBe(true);
            expect(sharedVolume(grooved, ring)).toBeLessThan(1e-6);
        });
    });

    describe("knurls", () => {
        it("should knurl a small shaft straight, left, right and in a diamond, valid each time, the diamond taking most", () => {
            // Arrange
            const knob = rod(3, 8);
            const patterns = ["straight", "left", "right", "diamond"] as const;

            // Act
            const knurled = patterns.map(pattern => occt.parts.mechanical.machining.knurl({ shape: knob, diameter: 6, length: 5, pitch: 1, pattern: BaseInputs.Engineering.knurlPatternEnum[pattern] }));

            // Assert
            expect(knurled.map(valid)).toEqual([true, true, true, true]);
            const volumes = knurled.map(volume);
            expect(volumes.every(each => each < volume(knob))).toBe(true);
            expect(volumes[3]).toBeLessThan(volumes[2]!);
            expect(volumes[1]).toBeCloseTo(volumes[2]!, 3);
        }, 120_000);
    });

    describe("threads", () => {
        const M6 = BaseInputs.Engineering.metricSizeEnum.m6;
        const nutAt = (turn: number): TopoDS_Shape => {
            const blank = occt.booleans.difference({ shape: occt.shapes.solid.createCylinder({ radius: 6, height: 6, center: [0, -9, 0], direction: [0, 1, 0] }), shapes: [occt.shapes.solid.createCylinder({ radius: 4.917 / 2, height: 8, center: [0, -10, 0], direction: [0, 1, 0] })], keepEdges: false });
            const direction: BaseInputs.Base.Vector3 = [Math.cos(turn * Math.PI / 180), 0, Math.sin(turn * Math.PI / 180)];
            return occt.parts.mechanical.machining.thread({ shape: blank, size: M6, length: 6, internal: true, frame: { origin: [0, -3, 0], normal: [0, 1, 0], direction } });
        };

        it("should model an M6 thread on a rod and in a nut that mate a whole number of pitches apart, and clash half a pitch out", () => {
            // Arrange
            const rod = occt.shapes.solid.createCylinder({ radius: 3, height: 12, center: [0, -12, 0], direction: [0, 1, 0] });

            // Act
            const bolt = occt.parts.mechanical.machining.thread({ shape: rod, size: M6, length: 12 });
            const meshing = nutAt(0);
            const turned = nutAt(180);

            // Assert
            expect(valid(bolt)).toBe(true);
            expect(valid(meshing)).toBe(true);
            expect(volume(bolt)).toBeLessThan(volume(rod));
            expect(sharedVolume(bolt, meshing)).toBeLessThan(1e-6);
            expect(sharedVolume(bolt, turned)).toBeGreaterThan(0.1);
        }, 120_000);

        it("should refuse a thread of more turns than it is modelled with, and a helical knurl twisted through more than it is lofted through, naming the length", () => {
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
            const thread = thrownBy(() => occt.parts.mechanical.machining.threadTool({ size: BaseInputs.Engineering.metricSizeEnum.m3, length: 201 }));
            const right = thrownBy(() => occt.parts.mechanical.machining.knurlTool({ diameter: 10, length: 160, pattern: BaseInputs.Engineering.knurlPatternEnum.right }));
            const diamond = thrownBy(() => occt.parts.mechanical.machining.knurlTool({ diameter: 10, length: 160, pattern: BaseInputs.Engineering.knurlPatternEnum.diamond }));

            // Assert
            expect([thread.property, thread.message]).toEqual(["length", "`length` is 201, 402 turns of a 0.5 pitch, and a thread is modelled over at most 400 turns: make it shorter or its pitch coarser."]);
            expect([right.property, diamond.property]).toEqual(["length", "length"]);
            expect(right.message).toMatch(/^`length` twists the grooves through 10\d\d degrees, more than the 1000 a knurl is modelled with: make it shorter\.$/);
            expect(diamond.message).toBe(right.message);
        });

        it("should run an M3 thread down from the ground by default, stopping at its plane, so it threads a default bolt to the head and no further", () => {
            // Arrange
            const bolt = occt.parts.mechanical.fasteners.hexBolt({});
            const above = occt.shapes.solid.createBox({ width: 20, length: 20, height: 10, center: [0, 5, 0], originOnCenter: true });
            const headOf = (shape: TopoDS_Shape): number => volume(occt.booleans.intersection({ shapes: [shape, above], keepEdges: false }));

            // Act
            const tool = occt.parts.mechanical.machining.threadTool({});
            const threaded = occt.parts.mechanical.machining.thread({ shape: bolt });

            // Assert
            const box = occt.analysis.measure.tightBoundingBox({ shape: tool });
            expect(box.max[1]).toBeLessThan(1e-6);
            expect(box.min[1]).toBeLessThan(-10);
            expect(box.max[0] - box.min[0]).toBeLessThan(3.1);
            expect(valid(threaded)).toBe(true);
            expect(volume(threaded)).toBeLessThan(volume(bolt));
            expect(headOf(threaded)).toBeCloseTo(headOf(bolt), 6);
        }, 120_000);
    });

    describe("splines", () => {
        it("should make a W 25x1.25x18 shaft its tips 24.75 across, sliding into a hub cut by its tool without sharing volume", () => {
            // Arrange
            const blank = rod(25, 15);

            // Act
            const shaft = occt.parts.mechanical.machining.splinedShaft({ referenceDiameter: 25, module: 1.25, length: 30, frame: { origin: [0, -5, 0], normal: [0, 1, 0], direction: [1, 0, 0] } });
            const hub = occt.parts.mechanical.machining.splinedHub({ shape: blank, referenceDiameter: 25, module: 1.25, length: 15 });

            // Assert
            expect(valid(shaft)).toBe(true);
            expect(valid(hub)).toBe(true);
            const box = occt.analysis.measure.tightBoundingBox({ shape: shaft });
            expect(box.max[0] - box.min[0]).toBeLessThanOrEqual(24.75 + 1e-6);
            expect(box.max[0] - box.min[0]).toBeGreaterThan(24.5);
            expect(occt.shapes.face.getFaces({ shape: shaft }).length).toBeGreaterThan(18 * 3);
            expect(sharedVolume(hub, shaft)).toBeLessThan(1e-6);
        });
    });

    describe("tools", () => {
        const common = (first: TopoDS_Shape, second: TopoDS_Shape): number => volume(occt.booleans.intersection({ shapes: [first, second], keepEdges: false }));

        it("should make each tool the material its cut takes away", () => {
            // Arrange
            const shaft = rod(4, 30);
            const ringed = rod(10, 40);
            const knob = rod(3, 8);
            const blank = rod(25, 15);
            const threaded = occt.shapes.solid.createCylinder({ radius: 3, height: 12, center: [0, -12, 0], direction: [0, 1, 0] });
            const groove: BaseInputs.Base.Frame = { origin: [0, 30, 0], normal: [0, 1, 0], direction: [1, 0, 0] };
            const M6 = BaseInputs.Engineering.metricSizeEnum.m6;

            // Act
            const cuts = [
                [shaft, occt.parts.mechanical.machining.flat({ shape: shaft, diameter: 8, depth: 0.5, length: 12 }), occt.parts.mechanical.machining.flatTool({ diameter: 8, depth: 0.5, length: 12 })],
                [ringed, occt.parts.mechanical.machining.ringGroove({ shape: ringed, diameter: 20, frame: groove }), occt.parts.mechanical.machining.ringGrooveTool({ diameter: 20, frame: groove })],
                [knob, occt.parts.mechanical.machining.knurl({ shape: knob, diameter: 6, length: 5, pitch: 1 }), occt.parts.mechanical.machining.knurlTool({ diameter: 6, length: 5, pitch: 1 })],
                [blank, occt.parts.mechanical.machining.splinedHub({ shape: blank, referenceDiameter: 25, module: 1.25, length: 15 }), occt.parts.mechanical.machining.splinedHubTool({ referenceDiameter: 25, module: 1.25, length: 15 })],
                [threaded, occt.parts.mechanical.machining.thread({ shape: threaded, size: M6, length: 12 }), occt.parts.mechanical.machining.threadTool({ size: M6, length: 12 })],
            ] as const;

            // Assert
            cuts.forEach(([shape, cut, tool]) => {
                expect(valid(tool)).toBe(true);
                expect(volume(shape) - volume(cut)).toBeGreaterThan(0);
                expect(common(shape, tool)).toBeCloseTo(volume(shape) - volume(cut), 3);
            });
        }, 120_000);
    });

    describe("cuts that miss or swallow the shape", () => {
        it("should stand every cut on the ground by default, refuse one that leaves nothing, and leave a shape it misses as it was", () => {
            // Arrange
            const upright = rod(4, 30);
            const tiny = rod(1, 2);
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
            const flatted = occt.parts.mechanical.machining.flat({ shape: upright, diameter: 8, depth: 0.5, length: 12 });
            const swallowed = thrownBy(() => occt.parts.mechanical.machining.splinedHub({ shape: tiny }));
            const missed = occt.parts.mechanical.machining.flat({ shape: tiny });

            // Assert
            const segment = 16 * Math.acos(3.5 / 4) - 3.5 * Math.sqrt(16 - 12.25);
            expect(volume(upright) - volume(flatted)).toBeCloseTo(segment * 12, 4);
            expect(swallowed.property).toBe("shape");
            expect(swallowed.message).toBe("`shape` lies wholly inside the cut, so nothing of it is left: size the cut to the shape, or move it with `frame`.");
            expect(volume(missed)).toBeCloseTo(volume(tiny), 9);
        });
    });

    describe("kernel objects left after a failure", () => {
        afterEach(() => {
            vi.restoreAllMocks();
        });

        it("should release a thread's profile when its helix cannot be made, and the swept thread when the box that trims it cannot", () => {
            // Arrange
            const helper = new OccHelper(kernel);
            const service = new OCCTService(kernel, helper);
            const made: TopoDS_Shape[] = [];
            const createPolygonWire = service.shapes.wire.createPolygonWire.bind(service.shapes.wire);
            vi.spyOn(service.shapes.wire, "createPolygonWire").mockImplementation(inputs => {
                const profile = createPolygonWire(inputs);
                made.push(profile);
                return profile;
            });
            const pipeWithBinormal = helper.operationsService.pipeWithBinormal.bind(helper.operationsService);
            vi.spyOn(helper.operationsService, "pipeWithBinormal").mockImplementation((...args) => {
                const swept = pipeWithBinormal(...args);
                made.push(swept);
                return swept;
            });
            vi.spyOn(service.shapes.wire, "createHelixWire").mockImplementationOnce(() => {
                throw new Error("no helix this time");
            });
            vi.spyOn(service.shapes.solid, "createBox").mockImplementationOnce(() => {
                throw new Error("no box this time");
            });

            // Act
            const withoutHelix = (): unknown => service.parts.mechanical.machining.threadTool({});
            const withoutBox = (): unknown => service.parts.mechanical.machining.threadTool({});

            // Assert
            expect(withoutHelix).toThrow("no helix this time");
            expect(withoutBox).toThrow("no box this time");
            expect(made).toHaveLength(3);
            expect(made.filter(shape => !shape.isDeleted())).toEqual([]);
        });
    });
});
