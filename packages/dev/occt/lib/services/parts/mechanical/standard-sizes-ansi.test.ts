import { afterAll, beforeAll, describe, expect, it } from "vitest";
import fc from "fast-check";
import type { TopoDS_Shape } from "../../../../bitbybit-dev-occt/bitbybit-dev-occt";
import createBitbybitOcct from "../../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { BaseBitByBit, Inputs as BaseInputs } from "@bitbybit-dev/base";
import { OCCTService } from "../../../occ-service";
import type * as Models from "../../../api/models";

const base = new BaseBitByBit();
const fasteners = base.engineering.mechanical.fasteners;
const threads = base.engineering.mechanical.threads;
const E = BaseInputs.Engineering;
const millimetre = BaseInputs.Base.unitOfLengthEnum.millimetre;
const SIZES = Object.values(E.ansiThreadSizeEnum);
const POINTS = Object.values(E.ansiSetScrewPointEnum);
const WASHER_SERIES = Object.values(E.ansiWasherSeriesEnum);
const BEARINGS = Object.values(E.ansiBallBearingEnum);
const HEX_AREA_PER_FLAT_SQUARED = Math.sqrt(3) / 2;
const CHAMFER_START = 0.95;
const MM_PER_INCH = 25.4;

const SEED = 20261026;
const SAMPLED = 3;


const endsAndSample = <T>(all: readonly T[], sampled = SAMPLED): T[] => {
    const inner = all.slice(1, -1);
    const picked = fc.sample(fc.shuffledSubarray(inner, { minLength: Math.min(sampled, inner.length), maxLength: Math.min(sampled, inner.length) }), { seed: SEED, numRuns: 1 })[0]!;
    return [all[0]!, ...inner.filter(each => picked.includes(each)), all[all.length - 1]!];
};

const listedBy = (lookup: (size: BaseInputs.Engineering.ansiThreadSizeEnum) => unknown) => (size: BaseInputs.Engineering.ansiThreadSizeEnum): boolean => {
    try {
        lookup(size);
        return true;
    } catch {
        return false;
    }
};

const seriesOf = (size: BaseInputs.Engineering.ansiThreadSizeEnum): BaseInputs.Engineering.ansiThreadSeriesEnum => listedBy(each => threads.ansi.thread({ size: each }))(size) ? E.ansiThreadSeriesEnum.unc : E.ansiThreadSeriesEnum.unf;
const nominalOf = (size: BaseInputs.Engineering.ansiThreadSizeEnum): number => threads.ansi.thread({ size, series: seriesOf(size) }).diameter;

describe("OCCT parts: ANSI standard sizes", () => {
    let occt: OCCTService;
    const made: TopoDS_Shape[] = [];

    beforeAll(async () => {
        occt = new OCCTService(await createBitbybitOcct());
    }, 120_000);

    afterAll(() => {
        made.forEach(shape => shape.delete());
    });

    const kept = (shape: TopoDS_Shape): TopoDS_Shape => {
        made.push(shape);
        return shape;
    };
    const volumeOf = (shape: TopoDS_Shape): number => occt.shapes.solid.getSolidVolume({ shape });
    const extentOf = (shape: TopoDS_Shape): number[] => occt.analysis.measure.tightBoundingBox({ shape }).size;
    const namesEveryFaceOnce = (part: Models.OCCT.ShapeWithRoles<TopoDS_Shape>): boolean => {
        const faces = occt.shapes.face.getFaces({ shape: part.shape });
        const count = faces.length;
        faces.forEach(face => face.delete());
        const named = Object.values(part.roles).flat().sort((a, b) => a - b);
        return named.length === count && named.every((face, index) => face === index);
    };
    const checked = (part: Models.OCCT.ShapeWithRoles<TopoDS_Shape>, read: (shape: TopoDS_Shape) => number): { valid: boolean; named: boolean; value: number } => {
        try {
            return { valid: occt.shapeFix.isValid({ shape: part.shape }), named: namesEveryFaceOnce(part), value: read(part.shape) };
        } finally {
            part.shape.delete();
        }
    };
    const validSolid = (shape: TopoDS_Shape): boolean => occt.shapeFix.isValid({ shape: kept(shape) }) && volumeOf(shape) > 0;

    describe("fasteners, the smallest, the largest and a sample between", () => {
        it.each(SIZES.filter(listedBy(size => fasteners.ansi.washerSizes({ size }))).flatMap(size => WASHER_SERIES.map(series => [size, series] as const)))("should turn a %s %s ASME B18.22.1 washer into a valid ring of exactly the table's volume, every face named once", (size, series) => {
            // Arrange
            const sizes = fasteners.ansi.washerSizes({ size, series });
            const expected = Math.PI * ((sizes.outerDiameter / 2) ** 2 - (sizes.innerDiameter / 2) ** 2) * sizes.thickness;

            // Act
            const washer = checked(occt.parts.mechanical.fasteners.ansi.washerWithRoles({ size, series }), volumeOf);

            // Assert
            expect([washer.valid, washer.named]).toEqual([true, true]);
            expect(washer.value).toBeCloseTo(expected, 9);
        });

        it.each(endsAndSample(SIZES))("should make a %s ASME B18.2.2 nut valid, its volume between the cylinder its chamfers leave whole and the sharp hexagon, less its hole", size => {
            // Arrange
            const sizes = fasteners.ansi.hexNutSizes({ size });
            const hole = Math.PI * (nominalOf(size) / 2) ** 2 * sizes.height;
            const whole = Math.PI * (CHAMFER_START * sizes.acrossFlats / 2) ** 2 * sizes.height - hole;
            const sharp = HEX_AREA_PER_FLAT_SQUARED * sizes.acrossFlats ** 2 * sizes.height - hole;

            // Act
            const nut = checked(occt.parts.mechanical.fasteners.ansi.hexNutWithRoles({ size }), volumeOf);

            // Assert
            expect([nut.valid, nut.named]).toEqual([true, true]);
            expect(nut.value).toBeGreaterThan(whole);
            expect(nut.value).toBeLessThan(sharp);
        });

        it.each(endsAndSample(SIZES.filter(listedBy(size => fasteners.ansi.socketHeadCapScrewSizes({ size })))))("should make a %s ASME B18.3 cap screw twice its diameter long valid, as tall as its head and shank, and lighter than their two cylinders", size => {
            // Arrange
            const nominal = nominalOf(size);
            const length = 2 * nominal;
            const head = fasteners.ansi.socketHeadCapScrewSizes({ size });
            const cylinders = Math.PI * (head.headDiameter / 2) ** 2 * head.headHeight + Math.PI * (nominal / 2) ** 2 * length;

            // Act
            const screw = checked(occt.parts.mechanical.fasteners.ansi.socketHeadCapScrewWithRoles({ size, series: seriesOf(size), length }), shape => volumeOf(shape) / cylinders);
            const extent = extentOf(kept(occt.parts.mechanical.fasteners.ansi.socketHeadCapScrew({ size, series: seriesOf(size), length })));

            // Assert
            expect([screw.valid, screw.named]).toEqual([true, true]);
            expect(screw.value).toBeGreaterThan(0.75);
            expect(screw.value).toBeLessThan(1);
            expect(extent[1]).toBeCloseTo(head.headHeight + length, 6);
            expect(extent[0]).toBeCloseTo(head.headDiameter, 6);
        });

        it.each(endsAndSample(SIZES.filter(listedBy(size => fasteners.ansi.hexBoltSizes({ size, length: 1 })))))("should make a %s ASME B18.2.1 hex cap screw three diameters long valid and lighter than its sharp hexagon and shank", size => {
            // Arrange
            const nominal = nominalOf(size);
            const length = 3 * nominal;
            const sizes = fasteners.ansi.hexBoltSizes({ size, length });
            const sharp = HEX_AREA_PER_FLAT_SQUARED * sizes.acrossFlats ** 2 * sizes.headHeight + Math.PI * (nominal / 2) ** 2 * length;
            const minor = Math.PI * (threads.ansi.thread({ size, series: seriesOf(size) }).minorDiameter / 2) ** 2 * length;

            // Act
            const bolt = checked(occt.parts.mechanical.fasteners.ansi.hexBoltWithRoles({ size, length }), volumeOf);

            // Assert
            expect([bolt.valid, bolt.named]).toEqual([true, true]);
            expect(bolt.value).toBeLessThan(sharp);
            expect(bolt.value).toBeGreaterThan(minor + Math.PI * (CHAMFER_START * sizes.acrossFlats / 2) ** 2 * sizes.headHeight * 0.9);
        });

        it.each(endsAndSample(SIZES.filter(listedBy(size => fasteners.ansi.setScrewSizes({ size }))), 1).flatMap(size => POINTS.map(point => [size, point] as const)))("should make a %s set screw with a %s point three diameters long valid and that long, every face named once", (size, point) => {
            // Arrange
            const length = 3 * nominalOf(size);

            // Act
            const screw = checked(occt.parts.mechanical.fasteners.ansi.setScrewWithRoles({ size, series: seriesOf(size), point, length }), shape => extentOf(shape)[1] ?? Number.NaN);

            // Assert
            expect([screw.valid, screw.named]).toEqual([true, true]);
            expect(screw.value).toBeCloseTo(length, 6);
        });
    });

    describe("machine elements, the smallest, the largest and a sample between", () => {
        it.each(endsAndSample(BEARINGS, 2))("should make an %s of valid separate solids as wide and as large across as its table says, every face named once", designation => {
            // Arrange
            const sizes = base.engineering.mechanical.bearings.ansi.ballBearingSizes({ designation, shields: true });

            // Act
            const bearing = occt.parts.mechanical.bearings.ansi.ballBearingWithRoles({ designation, shields: true });
            const solids = occt.shapes.solid.getSolids({ shape: kept(bearing.shape) }).map(kept);
            const extent = extentOf(bearing.shape);

            // Assert
            expect(solids.every(solid => occt.shapeFix.isValid({ shape: solid }))).toBe(true);
            expect(namesEveryFaceOnce(bearing)).toBe(true);
            expect([extent[0], extent[1], extent[2]]).toEqual([expect.closeTo(sizes.outside, 6), expect.closeTo(sizes.width, 6), expect.closeTo(sizes.outside, 6)]);
        }, 60_000);

        it("should make every R-series bearing without shields, narrower for its section than any ISO one, of valid separate solids", () => {
            // Act
            const bearings = BEARINGS.map(designation => kept(occt.parts.mechanical.bearings.ansi.ballBearing({ designation })));
            const solids = bearings.flatMap(bearing => occt.shapes.solid.getSolids({ shape: bearing }).map(kept));

            // Assert
            expect(solids.length).toBeGreaterThan(bearings.length * 3);
            expect(solids.every(solid => occt.shapeFix.isValid({ shape: solid }))).toBe(true);
        }, 120_000);

        it.each([0.5, 1, 2.5, 6])("should make the ANSI B17.1 key of a %f inch shaft a valid bar as wide and high as its table says, every face named once", shaftDiameter => {
            // Arrange
            const sizes = base.engineering.mechanical.keys.ansi.parallelKeySizes({ shaftDiameter });
            const length = 3 * sizes.width;

            // Act
            const key = occt.parts.mechanical.keys.ansi.parallelKeyWithRoles({ shaftDiameter, length });
            const extent = extentOf(kept(key.shape));

            // Assert
            expect([occt.shapeFix.isValid({ shape: key.shape }), namesEveryFaceOnce(key)]).toEqual([true, true]);
            expect(extent).toEqual([expect.closeTo(length, 6), expect.closeTo(sizes.width, 6), expect.closeTo(sizes.height, 6)]);
        });

        it.each([E.retainingRingKindEnum.shaft, E.retainingRingKindEnum.bore])("should make every listed inch retaining ring for a %s valid, every face named once", kind => {
            // Arrange
            const diameters = endsAndSample(base.engineering.mechanical.retainingRings.ansi.diameters({ kind }), 1);

            // Act
            const rings = diameters.map(diameter => checked(occt.parts.mechanical.retainingRings.ansi.retainingRingWithRoles({ kind, diameter }), volumeOf));

            // Assert
            rings.forEach(ring => {
                expect([ring.valid, ring.named]).toEqual([true, true]);
                expect(ring.value).toBeGreaterThan(0);
            });
        });
    });

    describe("machining in inches", () => {
        it("should cut a 1/4-20 thread, a #10-32 internal thread and a 1/2-13 thread as valid single solids", () => {
            // Arrange
            const machining = occt.parts.mechanical.machining.ansi;

            // Act
            const tools = [
                machining.threadTool({ size: E.ansiThreadSizeEnum.in1_4, length: 0.5 }),
                machining.threadTool({ size: E.ansiThreadSizeEnum.n10, series: E.ansiThreadSeriesEnum.unf, length: 0.375, internal: true }),
                machining.threadTool({ size: E.ansiThreadSizeEnum.in1_2, length: 0.75 }),
            ];
            const solids = tools.map(tool => occt.shapes.solid.getSolids({ shape: kept(tool) }).map(kept).length);

            // Assert
            expect(solids).toEqual([1, 1, 1]);
            expect(tools.every(tool => occt.shapeFix.isValid({ shape: tool }))).toBe(true);
        }, 120_000);

        it("should make the keyseat, ring groove and hub spline tools as single valid solids", () => {
            // Arrange
            const machining = occt.parts.mechanical.machining.ansi;

            // Act
            const tools = [
                machining.keywayTool({ diameter: 1, length: 1.25, inHub: true }),
                machining.ringGrooveTool({ kind: E.retainingRingKindEnum.bore, diameter: 1 }),
                machining.splinedHubTool({ teeth: 24, pitch: E.ansiSplinePitchEnum.p16_32, length: 0.5 }),
            ].map(kept);

            // Assert
            expect(tools.every(tool => occt.shapeFix.isValid({ shape: tool }) && volumeOf(tool) > 0)).toBe(true);
            expect(tools.map(tool => occt.shapes.solid.getSolids({ shape: tool }).map(kept).length)).toEqual([1, 1, 1]);
        }, 120_000);

        it("should key, groove, knurl and spline inch shafts and hubs into valid solids lighter than their blanks", () => {
            // Arrange
            const machining = occt.parts.mechanical.machining.ansi;
            const along = { origin: [0, 0, 0] as BaseInputs.Base.Point3, normal: [0, 1, 0] as BaseInputs.Base.Vector3, direction: [1, 0, 0] as BaseInputs.Base.Vector3 };
            const shaft = kept(occt.shapes.solid.createCylinder({ radius: 0.5, height: 2, center: [0, 0, 0], direction: [0, 1, 0] }));
            const knob = kept(occt.shapes.solid.createCylinder({ radius: 0.25, height: 0.625, center: [0, 0, 0], direction: [0, 1, 0] }));
            const blank = kept(occt.shapes.solid.createCylinder({ radius: 1, height: 0.5, center: [0, 0, 0], direction: [0, 1, 0] }));

            // Act
            const cuts = [
                [shaft, machining.keyway({ shape: shaft, diameter: 1, length: 1.25, frame: { ...along, origin: [0, 0.25, 0] } })],
                [shaft, machining.ringGroove({ shape: shaft, diameter: 1, frame: { ...along, origin: [0, 1.5, 0] } })],
                [knob, machining.knurl({ shape: knob, diameter: 0.5, length: 0.5, diametralPitch: 96 })],
                [blank, machining.splinedHub({ shape: blank, teeth: 24, pitch: E.ansiSplinePitchEnum.p16_32, length: 0.5 })],
            ] as const;
            const spline = machining.splinedShaft({ teeth: 24, pitch: E.ansiSplinePitchEnum.p16_32, length: 1 });

            // Assert
            cuts.forEach(([before, after]) => {
                expect(validSolid(after)).toBe(true);
                expect(volumeOf(after)).toBeLessThan(volumeOf(before));
            });
            expect(validSolid(spline)).toBe(true);
            expect(extentOf(spline)[0]).toBeCloseTo(base.engineering.mechanical.splines.ansi.involuteSplineSizes({ teeth: 24, pitch: E.ansiSplinePitchEnum.p16_32 }).shaftTipDiameter, 3);
        }, 120_000);
    });

    describe("units", () => {
        it("should make each ANSI part in millimetres as its inch twin scaled up by 25.4, a modelled thread included", () => {
            // Arrange
            const parts = occt.parts.mechanical;
            const pairs: [TopoDS_Shape, TopoDS_Shape][] = [
                [parts.fasteners.ansi.socketHeadCapScrew({ size: E.ansiThreadSizeEnum.in1_4, length: 1 }), parts.fasteners.ansi.socketHeadCapScrew({ size: E.ansiThreadSizeEnum.in1_4, length: MM_PER_INCH, unit: millimetre })],
                [parts.fasteners.ansi.hexBolt({ size: E.ansiThreadSizeEnum.in5_16, length: 1, modelledThread: true }), parts.fasteners.ansi.hexBolt({ size: E.ansiThreadSizeEnum.in5_16, length: MM_PER_INCH, modelledThread: true, unit: millimetre })],
                [parts.fasteners.ansi.hexNut({ size: E.ansiThreadSizeEnum.in3_8 }), parts.fasteners.ansi.hexNut({ size: E.ansiThreadSizeEnum.in3_8, unit: millimetre })],
                [parts.fasteners.ansi.washer({ size: E.ansiThreadSizeEnum.in3_8, series: E.ansiWasherSeriesEnum.wide }), parts.fasteners.ansi.washer({ size: E.ansiThreadSizeEnum.in3_8, series: E.ansiWasherSeriesEnum.wide, unit: millimetre })],
                [parts.fasteners.ansi.setScrew({ size: E.ansiThreadSizeEnum.n10, length: 0.25, point: E.ansiSetScrewPointEnum.oval }), parts.fasteners.ansi.setScrew({ size: E.ansiThreadSizeEnum.n10, length: 0.25 * MM_PER_INCH, point: E.ansiSetScrewPointEnum.oval, unit: millimetre })],
                [parts.bearings.ansi.ballBearing({ designation: E.ansiBallBearingEnum.r8 }), parts.bearings.ansi.ballBearing({ designation: E.ansiBallBearingEnum.r8, unit: millimetre })],
                [parts.keys.ansi.parallelKey({ shaftDiameter: 1, length: 1.25 }), parts.keys.ansi.parallelKey({ shaftDiameter: MM_PER_INCH, length: 1.25 * MM_PER_INCH, unit: millimetre })],
                [parts.retainingRings.ansi.retainingRing({ diameter: 0.75 }), parts.retainingRings.ansi.retainingRing({ diameter: 0.75 * MM_PER_INCH, unit: millimetre })],
                [parts.machining.ansi.knurlTool({ diameter: 0.5, length: 0.25 }), parts.machining.ansi.knurlTool({ diameter: 0.5 * MM_PER_INCH, length: 0.25 * MM_PER_INCH, unit: millimetre })],
                [parts.machining.ansi.splinedShaft({ teeth: 12, length: 0.5 }), parts.machining.ansi.splinedShaft({ teeth: 12, length: 0.5 * MM_PER_INCH, unit: millimetre })],
            ];

            // Act
            const ratios = pairs.map(([inches, millimetres]) => {
                const inchBox = extentOf(kept(inches));
                const millimetreBox = extentOf(kept(millimetres));
                return [...inchBox.map((side, axis) => side * MM_PER_INCH / millimetreBox[axis]!), volumeOf(inches) * MM_PER_INCH ** 3 / volumeOf(millimetres)];
            });

            // Assert
            ratios.flat().forEach(ratio => expect(ratio).toBeCloseTo(1, 4));
        }, 120_000);

        it("should key a spur gear's bore by ANSI B17.1 when asked, the hub's keyseat its table gives in place of DIN 6885's", () => {
            // Arrange
            const gear = { module: 0.0625, teeth: 40, width: 0.5, bore: 0.5, keyway: true, unit: BaseInputs.Base.unitOfLengthEnum.inch };
            const din = base.engineering.mechanical.keys.din.parallelKeySizes({ shaftDiameter: 0.5, unit: BaseInputs.Base.unitOfLengthEnum.inch });
            const ansi = base.engineering.mechanical.keys.ansi.parallelKeySizes({ shaftDiameter: 0.5 });

            // Act
            const dinGear = kept(occt.parts.mechanical.gears.spurGear(gear));
            const ansiGear = kept(occt.parts.mechanical.gears.spurGear({ ...gear, keyStandard: E.keyStandardEnum.ansi }));

            // Assert
            expect([occt.shapeFix.isValid({ shape: dinGear }), occt.shapeFix.isValid({ shape: ansiGear })]).toEqual([true, true]);
            expect(ansi.width).not.toBeCloseTo(din.width, 3);
            expect((volumeOf(dinGear) - volumeOf(ansiGear)) / gear.width).toBeCloseTo(ansi.width * ansi.hubDepth - din.width * din.hubDepth, 2);
        }, 60_000);

        it("should refuse a key standard it does not know, naming the property", () => {
            // Arrange
            const gear = { module: 1, teeth: 30, width: 5, bore: 10, keyway: true, keyStandard: "jis" as BaseInputs.Engineering.keyStandardEnum };

            // Act
            const made = (): TopoDS_Shape => occt.parts.mechanical.gears.spurGear(gear);

            // Assert
            expect(made).toThrow(/`keyStandard` is jis/);
        });
    });
});
