import { beforeAll, describe, expect, it } from "vitest";
import fc from "fast-check";
import type { TopoDS_Shape } from "../../../../bitbybit-dev-occt/bitbybit-dev-occt";
import createBitbybitOcct from "../../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { BaseBitByBit, Inputs as BaseInputs } from "@bitbybit-dev/base";
import { OCCTService } from "../../../occ-service";
import type * as Models from "../../../api/models";

const base = new BaseBitByBit();
const fasteners = base.engineering.mechanical.fasteners;
const threads = base.engineering.mechanical.threads;
const SIZES = Object.values(BaseInputs.Engineering.metricSizeEnum);
const POINTS = Object.values(BaseInputs.Engineering.setScrewPointEnum);
const BEARINGS = Object.values(BaseInputs.Engineering.ballBearingEnum);
const HEX_AREA_PER_FLAT_SQUARED = Math.sqrt(3) / 2;
const CHAMFER_START = 0.95;
const DOWEL_CHAMFER_SHARE = 0.1;

const SEED = 20261018;
const SAMPLED = 3;

const diameterOf = (size: string): number => Number(size.slice(1));

const endsAndSample = <T>(all: readonly T[], sampled = SAMPLED): T[] => {
    const inner = all.slice(1, -1);
    const picked = fc.sample(fc.shuffledSubarray(inner, { minLength: Math.min(sampled, inner.length), maxLength: Math.min(sampled, inner.length) }), { seed: SEED, numRuns: 1 })[0]!;
    return [all[0]!, ...inner.filter(each => picked.includes(each)), all[all.length - 1]!];
};

const listsSetScrew = (size: BaseInputs.Engineering.metricSizeEnum): boolean => {
    try {
        fasteners.setScrewSizes({ size, point: BaseInputs.Engineering.setScrewPointEnum.flat, length: 3 * diameterOf(size) });
        return true;
    } catch {
        return false;
    }
};

describe("OCCT parts: standard sizes", () => {
    let occt: OCCTService;

    beforeAll(async () => {
        occt = new OCCTService(await createBitbybitOcct());
    }, 120_000);

    const volumeOf = (shape: TopoDS_Shape): number => occt.shapes.solid.getSolidVolume({ shape });
    const extentOf = (shape: TopoDS_Shape): number[] => occt.analysis.measure.tightBoundingBox({ shape }).size;
    const namesEveryFaceOnce = (made: Models.OCCT.ShapeWithRoles<TopoDS_Shape>): boolean => {
        const faces = occt.shapes.face.getFaces({ shape: made.shape });
        const count = faces.length;
        faces.forEach(face => face.delete());
        const named = Object.values(made.roles).flat().sort((a, b) => a - b);
        return named.length === count && named.every((face, index) => face === index);
    };
    const checked = (made: Models.OCCT.ShapeWithRoles<TopoDS_Shape>, read: (shape: TopoDS_Shape) => number): { valid: boolean; named: boolean; value: number } => {
        try {
            return { valid: occt.shapeFix.isValid({ shape: made.shape }), named: namesEveryFaceOnce(made), value: read(made.shape) };
        } finally {
            made.shape.delete();
        }
    };

    describe("washers and dowel pins of every size, nuts, screws and bolts from M1.6 to M24 and a sample between", () => {
        it.each(SIZES)("should turn an %s ISO 7089 washer into a valid ring of exactly the table's volume, every face named once", size => {
            // Arrange
            const sizes = fasteners.washerSizes({ size });
            const expected = Math.PI * ((sizes.outerDiameter / 2) ** 2 - (sizes.innerDiameter / 2) ** 2) * sizes.thickness;

            // Act
            const made = checked(occt.parts.mechanical.fasteners.washerWithRoles({ size }), volumeOf);

            // Assert
            expect([made.valid, made.named]).toEqual([true, true]);
            expect(made.value).toBeCloseTo(expected, 6);
        });

        it.each(endsAndSample(SIZES))("should make an %s ISO 4032 nut valid, its volume between the cylinder its chamfers leave whole and the sharp hexagon, less its hole", size => {
            // Arrange
            const sizes = fasteners.hexNutSizes({ size });
            const hole = Math.PI * (diameterOf(size) / 2) ** 2 * sizes.height;
            const whole = Math.PI * (CHAMFER_START * sizes.acrossFlats / 2) ** 2 * sizes.height - hole;
            const sharp = HEX_AREA_PER_FLAT_SQUARED * sizes.acrossFlats ** 2 * sizes.height - hole;

            // Act
            const made = checked(occt.parts.mechanical.fasteners.hexNutWithRoles({ size }), volumeOf);

            // Assert
            expect([made.valid, made.named]).toEqual([true, true]);
            expect(made.value).toBeGreaterThan(whole);
            expect(made.value).toBeLessThan(sharp);
        });

        it.each(endsAndSample(SIZES))("should make an %s ISO 4762 cap screw twice its diameter long valid, as tall as its head and shank, and lighter than their two cylinders", size => {
            // Arrange
            const nominal = diameterOf(size);
            const length = 2 * nominal;
            const head = fasteners.socketHeadCapScrewSizes({ size });
            const cylinders = Math.PI * (head.headDiameter / 2) ** 2 * head.headHeight + Math.PI * (nominal / 2) ** 2 * length;

            // Act
            const made = checked(occt.parts.mechanical.fasteners.socketHeadCapScrewWithRoles({ size, length }), shape => volumeOf(shape) / cylinders);
            const extent = extentOf(occt.parts.mechanical.fasteners.socketHeadCapScrew({ size, length }));

            // Assert
            expect([made.valid, made.named]).toEqual([true, true]);
            expect(made.value).toBeGreaterThan(0.75);
            expect(made.value).toBeLessThan(1);
            expect(extent[1]).toBeCloseTo(head.headHeight + length, 6);
            expect(extent[0]).toBeCloseTo(head.headDiameter, 6);
        });

        it.each(endsAndSample(SIZES))("should make an %s ISO 4017 bolt three diameters long valid, its head as wide as its corners and lighter than its sharp hexagon and shank", size => {
            // Arrange
            const nominal = diameterOf(size);
            const length = 3 * nominal;
            const sizes = fasteners.hexBoltSizes({ size, length });
            const sharp = HEX_AREA_PER_FLAT_SQUARED * sizes.acrossFlats ** 2 * sizes.headHeight + Math.PI * (nominal / 2) ** 2 * length;
            const minor = Math.PI * (threads.metricThread({ size }).minorDiameter / 2) ** 2 * length;

            // Act
            const made = checked(occt.parts.mechanical.fasteners.hexBoltWithRoles({ size, length }), volumeOf);

            // Assert
            expect([made.valid, made.named]).toEqual([true, true]);
            expect(made.value).toBeLessThan(sharp);
            expect(made.value).toBeGreaterThan(minor + Math.PI * (CHAMFER_START * sizes.acrossFlats / 2) ** 2 * sizes.headHeight * 0.9);
        });

        it.each(endsAndSample(SIZES.filter(listsSetScrew), 1).flatMap(size => POINTS.map(point => [size, point] as const)))("should make an %s set screw with a %s point three diameters long valid and that long, every face named once", (size, point) => {
            // Arrange
            const length = 3 * diameterOf(size);

            // Act
            const made = checked(occt.parts.mechanical.fasteners.setScrewWithRoles({ size, point, length }), shape => extentOf(shape)[1] ?? Number.NaN);

            // Assert
            expect([made.valid, made.named]).toEqual([true, true]);
            expect(made.value).toBeCloseTo(length, 6);
        });

        it.each([1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10, 12, 16, 20])("should make a dowel pin %f across of exactly the volume its chamfered ends leave", diameter => {
            // Arrange
            const length = 4 * diameter;
            const radius = diameter / 2;
            const chamfer = DOWEL_CHAMFER_SHARE * diameter;
            const expected = Math.PI * radius * radius * length - 2 * Math.PI * chamfer * chamfer * (radius - chamfer / 3);

            // Act
            const made = checked(occt.parts.mechanical.fasteners.dowelPinWithRoles({ diameter, length }), volumeOf);

            // Assert
            expect([made.valid, made.named]).toEqual([true, true]);
            expect(made.value).toBeCloseTo(expected, 6);
        });
    });

    describe("ball bearings, the smallest, the largest and a sample between", () => {
        it.each(endsAndSample(BEARINGS, 2))("should make a %s of valid separate solids as wide and as large across as its table says, every face named once", designation => {
            // Arrange
            const sizes = base.engineering.mechanical.bearings.ballBearingSizes({ designation });

            // Act
            const made = occt.parts.mechanical.bearings.ballBearingWithRoles({ designation, shields: true });
            const solids = occt.shapes.solid.getSolids({ shape: made.shape });
            const extent = extentOf(made.shape);

            // Assert
            expect(solids.every(solid => occt.shapeFix.isValid({ shape: solid }))).toBe(true);
            expect(namesEveryFaceOnce(made)).toBe(true);
            expect([extent[0], extent[1], extent[2]]).toEqual([expect.closeTo(sizes.outside, 4), expect.closeTo(sizes.width, 4), expect.closeTo(sizes.outside, 4)]);
            solids.forEach(solid => solid.delete());
            made.shape.delete();
        }, 60_000);
    });
    describe("parts at the most they are modelled with", () => {
        it("should draw a spur gear of exactly the most teeth as one face between its root and tip circles", () => {
            // Arrange
            const module = 0.1;
            const teeth = 1000;
            const pitchRadius = module * teeth / 2;

            // Act
            const profile = occt.parts.mechanical.gears.spurGearProfile({ module, teeth });
            const area = occt.shapes.face.getFaceArea({ shape: profile });
            const wires = occt.shapes.wire.getWires({ shape: profile });
            const edges = occt.shapes.edge.getEdges({ shape: profile });
            [...wires, ...edges, profile].forEach(shape => shape.delete());

            // Assert
            expect([wires.length, edges.length > 4 * teeth]).toEqual([1, true]);
            expect(area).toBeGreaterThan(Math.PI * (pitchRadius - 1.25 * module) ** 2);
            expect(area).toBeLessThan(Math.PI * (pitchRadius + module) ** 2);
        }, 60_000);

        it("should model a thread of exactly the most turns as one valid solid", () => {
            // Arrange
            const size = BaseInputs.Engineering.metricSizeEnum.m3;
            const pitch = threads.metricThread({ size }).pitch;

            // Act
            const tool = occt.parts.mechanical.machining.threadTool({ size, length: 400 * pitch });
            const solids = occt.shapes.solid.getSolids({ shape: tool });
            const valid = occt.shapeFix.isValid({ shape: tool });
            solids.forEach(solid => solid.delete());
            tool.delete();

            // Assert
            expect([solids.length, valid]).toEqual([1, true]);
        }, 120_000);
    });
});
