import { describe, expect, it } from "vitest";
import * as Inputs from "../../inputs";
import { Engineering } from "./engineering";
import { metricSizes } from "../../fasteners/fasteners";
import { ballBearingDesignations } from "../../machine-elements/machine-elements";

describe("engineering", () => {
    const engineering = new Engineering();
    const radiusOf = (point: Inputs.Base.Point3): number => Math.hypot(point[0], point[1]);

    describe("gears", () => {
        it("should give a spur gear's circles and a ring gear's from their defaults and from given teeth", () => {
            // Act
            const spur = engineering.mechanical.gears.spurGearSizes({ module: 1, teeth: 20 });
            const ring = engineering.mechanical.gears.ringGearSizes({ module: 1, teeth: 40 });
            const defaults = engineering.mechanical.gears.spurGearSizes({});

            // Assert
            expect([spur.pitchRadius, spur.tipRadius, spur.rootRadius]).toEqual([10, 11, 8.75]);
            expect([ring.pitchRadius, ring.tipRadius, ring.rootRadius]).toEqual([20, 19, 21.25]);
            expect(defaults.pitchRadius).toBeCloseTo(0.2 * 20 / 2, 12);
        });

        it("should draw a spur gear's outline on the XY plane between its root and tip circles, a closed loop of points", () => {
            // Arrange
            const sizes = engineering.mechanical.gears.spurGearSizes({ module: 1, teeth: 12 });

            // Act
            const coarse = engineering.mechanical.gears.spurGearOutline({ module: 1, teeth: 12, segments: 2 });
            const fine = engineering.mechanical.gears.spurGearOutline({ module: 1, teeth: 12, segments: 8 });

            // Assert
            expect(fine.length).toBeGreaterThan(coarse.length);
            expect(fine.every(point => point[2] === 0)).toBe(true);
            expect(Math.min(...fine.map(radiusOf))).toBeCloseTo(sizes.rootRadius, 6);
            expect(Math.max(...fine.map(radiusOf))).toBeCloseTo(sizes.tipRadius, 6);
            expect(fine[0]).not.toEqual(fine[fine.length - 1]);
        });

        it("should size a helical gear's section square to its axis and draw it between its root and tip", () => {
            // Act
            const sizes = engineering.mechanical.gears.helicalGearSizes({ module: 1, teeth: 20, helixAngle: 20 });
            const outline = engineering.mechanical.gears.helicalGearOutline({ module: 1, teeth: 20, helixAngle: 20 });

            // Assert
            expect(sizes.pitchRadius).toBeCloseTo(10.642, 3);
            expect(sizes.twist).toBeCloseTo(1.9596, 4);
            expect(Math.min(...outline.map(radiusOf))).toBeCloseTo(sizes.rootRadius, 6);
            expect(Math.max(...outline.map(radiusOf))).toBeCloseTo(sizes.tipRadius, 6);
        });

        it("should move a shifted helical gear's tip and root circles out by the shift times the normal module, and thicken its teeth to match", () => {
            // Arrange
            const helix = 20 * Math.PI / 180;
            const pressure = 20 * Math.PI / 180;

            // Act
            const sizes = engineering.mechanical.gears.helicalGearSizes({ module: 1, teeth: 20, helixAngle: 20, profileShift: 0.5 });

            // Assert
            expect(sizes.tipRadius - sizes.pitchRadius).toBeCloseTo(1.5, 12);
            expect(sizes.pitchRadius - sizes.rootRadius).toBeCloseTo(0.75, 12);
            expect(2 * sizes.halfToothAngle * sizes.pitchRadius).toBeCloseTo((Math.PI / 2 + 2 * 0.5 * Math.tan(pressure)) / Math.cos(helix), 12);
        });

        it("should split a 60 degree shaft angle between a bevel pair's pitch cones, both rolling at one cone distance", () => {
            // Act
            const pinion = engineering.mechanical.gears.bevelGearSizes({ module: 2, teeth: 20, mateTeeth: 40, shaftAngle: 60 });
            const wheel = engineering.mechanical.gears.bevelGearSizes({ module: 2, teeth: 40, mateTeeth: 20, shaftAngle: 60 });

            // Assert
            expect(pinion.pitchConeAngle + wheel.pitchConeAngle).toBeCloseTo(60, 9);
            expect(pinion.pitchConeAngle).toBeCloseTo(Math.atan2(Math.sin(Math.PI / 3), 2.5) * 180 / Math.PI, 9);
            expect(pinion.coneDistance).toBeCloseTo(wheel.coneDistance, 9);
            expect(pinion.apexDistance).toBeCloseTo(pinion.coneDistance * Math.cos(pinion.pitchConeAngle * Math.PI / 180), 9);
        });

        it("should size a bevel pair at right angles and draw a bevel gear's teeth beyond its outer tip radius, seen from the apex", () => {
            // Act
            const pinion = engineering.mechanical.gears.bevelGearSizes({ module: 2, teeth: 20, mateTeeth: 40 });
            const wheel = engineering.mechanical.gears.bevelGearSizes({ module: 2, teeth: 40, mateTeeth: 20 });
            const outline = engineering.mechanical.gears.bevelGearOutline({ module: 2, teeth: 20, mateTeeth: 40, rotation: 9 });

            // Assert
            expect(pinion.pitchConeAngle + wheel.pitchConeAngle).toBeCloseTo(90, 9);
            expect(pinion.apexDistance).toBeCloseTo(40, 9);
            expect(Math.max(...outline.map(radiusOf))).toBeGreaterThan(pinion.tipRadius);
            expect(Math.min(...outline.map(radiusOf))).toBeGreaterThan(0);
            expect(() => engineering.mechanical.gears.bevelGearSizes({ teeth: 40, mateTeeth: 20, shaftAngle: 130 })).toThrow("`shaftAngle`");
        });

        it("should turn an outline by its rotation", () => {
            // Act
            const straight = engineering.mechanical.gears.spurGearOutline({ module: 1, teeth: 10 });
            const turned = engineering.mechanical.gears.spurGearOutline({ module: 1, teeth: 10, rotation: 90 });

            // Assert
            expect(turned).toHaveLength(straight.length);
            expect(turned[0]![0]).toBeCloseTo(-straight[0]![1], 9);
            expect(turned[0]![1]).toBeCloseTo(straight[0]![0], 9);
        });

        it("should draw a ring gear's teeth between its tip and root circles", () => {
            // Arrange
            const sizes = engineering.mechanical.gears.ringGearSizes({ module: 1, teeth: 40 });

            // Act
            const outline = engineering.mechanical.gears.ringGearOutline({ module: 1, teeth: 40 });

            // Assert
            expect(Math.min(...outline.map(radiusOf))).toBeCloseTo(sizes.tipRadius, 6);
            expect(Math.max(...outline.map(radiusOf))).toBeCloseTo(sizes.rootRadius, 6);
        });

        it("should refuse teeth it cannot draw, and segments that are not a whole number of at least 1", () => {
            // Act
            const fewTeeth = (): unknown => engineering.mechanical.gears.spurGearSizes({ teeth: 2 });
            const noSegments = (): unknown => engineering.mechanical.gears.spurGearOutline({ segments: 0 });
            const halfSegment = (): unknown => engineering.mechanical.gears.ringGearOutline({ segments: 1.5 });

            // Assert
            expect(fewTeeth).toThrow("`teeth` is not a whole number of at least 3.");
            expect(noSegments).toThrow("`segments` is not a whole number of at least 1.");
            expect(halfSegment).toThrow("`segments` is not a whole number of at least 1.");
        });
    });

    describe("racks", () => {
        it("should give a rack's lines and draw it as points from the pitch line down to its back", () => {
            // Act
            const sizes = engineering.mechanical.gears.rackSizes({ module: 2, teeth: 10, height: 6 });
            const outline = engineering.mechanical.gears.rackOutline({ module: 2, teeth: 10, height: 6 });

            // Assert
            expect(sizes.length).toBeCloseTo(20 * Math.PI, 12);
            expect(Math.max(...outline.map(point => point[1]))).toBeCloseTo(2, 12);
            expect(Math.min(...outline.map(point => point[1]))).toBeCloseTo(-6, 12);
            expect(engineering.mechanical.gears.rackSizes({}).pitch).toBeCloseTo(0.2 * Math.PI, 12);
        });
    });

    describe("gear pairs and planetary sets", () => {
        it("should place a pair, a gear in a ring and a planetary set from their defaults and from given teeth", () => {
            // Act
            const pair = engineering.mechanical.gears.gearPair({ module: 2, teethA: 20, teethB: 30 });
            const internal = engineering.mechanical.gears.internalGearPair({ module: 2, pinionTeeth: 20, ringTeeth: 60 });
            const set = engineering.mechanical.gears.planetarySet({ module: 1, sunTeeth: 18, planetTeeth: 12, planets: 3 });
            const defaults = [engineering.mechanical.gears.gearPair({}).centreDistance, engineering.mechanical.gears.internalGearPair({}).centreDistance, engineering.mechanical.gears.planetarySet({}).ringTeeth];

            // Assert
            expect([pair.centreDistance, pair.ratio]).toEqual([50, 1.5]);
            expect([internal.centreDistance, internal.ratio]).toEqual([40, 3]);
            expect([set.ringTeeth, set.assemblable, set.planetsClear, set.planetCentres.length]).toEqual([42, true, true, 3]);
            expect(defaults[0]).toBeCloseTo(0.2 * 50 / 2, 12);
            expect(defaults[1]).toBeCloseTo(0.2 * 36 / 2, 12);
            expect(defaults[2]).toBe(72);
            expect([engineering.mechanical.gears.internalGearPair({}).interferes, engineering.mechanical.gears.planetarySet({}).interferes]).toEqual([false, false]);
        });
    });

    describe("gear pair clearance", () => {
        it("should take the clearance of a pair from a dedendum of 1.25 when none is given, and from the one given", () => {
            // Act
            const standard = engineering.mechanical.gears.gearPair({ module: 1, teethA: 12, teethB: 20, profileShiftA: 1, profileShiftB: 1 });
            const deeper = engineering.mechanical.gears.gearPair({ module: 1, teethA: 12, teethB: 20, profileShiftA: 1, profileShiftB: 1, dedendum: 1.5 });

            // Assert
            expect(standard.clearance).toBeCloseTo(-0.19231, 5);
            expect(deeper.clearance).toBeCloseTo(0.05769, 5);
            expect(deeper.tipShortening).toBeCloseTo(standard.tipShortening, 12);
        });
    });

    describe("fasteners, bearings, keys and springs", () => {
        it("should give the ISO sizes the base tables hold, by default an M3", () => {
            // Act
            const thread = engineering.mechanical.threads.metricThread({ size: Inputs.Engineering.metricSizeEnum.m8 });
            const fine = engineering.mechanical.threads.metricThread({ size: Inputs.Engineering.metricSizeEnum.m8, pitch: 1 });
            const hole = engineering.mechanical.fasteners.clearanceHole({ size: Inputs.Engineering.metricSizeEnum.m6 });
            const loose = engineering.mechanical.fasteners.clearanceHole({ size: Inputs.Engineering.metricSizeEnum.m6, fit: Inputs.Engineering.clearanceFitEnum.loose });
            const head = engineering.mechanical.fasteners.socketHeadCapScrewSizes({ size: Inputs.Engineering.metricSizeEnum.m5 });
            const bolt = engineering.mechanical.fasteners.hexBoltSizes({ size: Inputs.Engineering.metricSizeEnum.m8, length: 40 });
            const nut = engineering.mechanical.fasteners.hexNutSizes({ size: Inputs.Engineering.metricSizeEnum.m8 });
            const washer = engineering.mechanical.fasteners.washerSizes({ size: Inputs.Engineering.metricSizeEnum.m8 });
            const socket = engineering.mechanical.fasteners.setScrewSizes({ size: Inputs.Engineering.metricSizeEnum.m5 });
            const byDefault = engineering.mechanical.threads.metricThread({});

            // Assert
            expect([thread.pitch, thread.tapDrill, fine.pitch]).toEqual([1.25, 6.8, 1]);
            expect([hole, loose]).toEqual([6.6, 7]);
            expect([head.headDiameter, head.headHeight, head.socketSize]).toEqual([8.5, 5, 4]);
            expect([bolt.acrossFlats, bolt.headHeight, bolt.threadLength]).toEqual([13, 5.3, 22]);
            expect([nut.acrossFlats, nut.height]).toEqual([13, 6.8]);
            expect([washer.innerDiameter, washer.outerDiameter, washer.thickness]).toEqual([8.4, 16, 1.6]);
            expect(socket.socketSize).toBe(2.5);
            expect(byDefault.size).toBe("M3");
        });

        it("should give a bearing by its designation, a key for its shaft and a spring's path", () => {
            // Act
            const bearing = engineering.mechanical.bearings.ballBearingSizes({ designation: Inputs.Engineering.ballBearingEnum.b6204 });
            const key = engineering.mechanical.keys.parallelKeySizes({ shaftDiameter: 20 });
            const spring = engineering.mechanical.springs.compressionSpringPath({ wireDiameter: 0.2, diameter: 2, activeCoils: 6, length: 4 });

            // Assert
            expect([bearing.bore, bearing.outside, bearing.width]).toEqual([20, 47, 14]);
            expect([key.width, key.height, key.shaftDepth, key.hubDepth]).toEqual([6, 6, 3.5, 2.8]);
            expect(spring.points[0]![2]).toBeLessThan(0);
            expect(spring.points[spring.points.length - 1]![2]).toBeGreaterThan(4);
            expect(spring.solidLength).toBeLessThan(4);
        });

        it("should give a set screw's point, a chamfered washer and a retaining ring with its groove", () => {
            // Act
            const dog = engineering.mechanical.fasteners.setScrewSizes({ size: Inputs.Engineering.metricSizeEnum.m5, point: Inputs.Engineering.setScrewPointEnum.dog, length: 10 });
            const flat = engineering.mechanical.fasteners.setScrewSizes({ size: Inputs.Engineering.metricSizeEnum.m5 });
            const washer = engineering.mechanical.fasteners.chamferedWasherSizes({ size: Inputs.Engineering.metricSizeEnum.m8 });
            const shaft = engineering.mechanical.retainingRings.retainingRingSizes({});
            const bore = engineering.mechanical.retainingRings.retainingRingSizes({ kind: Inputs.Engineering.retainingRingKindEnum.bore, diameter: 47 });

            // Assert
            expect([dog.socketSize, dog.pointDiameter, flat.pointDiameter, flat.socketDepth]).toEqual([2.5, 3.5, 3.5, 3]);
            expect([washer.thickness, washer.chamferHeight]).toEqual([1.6, 0.4]);
            expect([shaft.nominal, shaft.grooveDiameter]).toEqual([20, 19]);
            expect([bore.nominal, bore.grooveDiameter]).toEqual([47, 49.5]);
        });

        it("should size a spline and a knurl", () => {
            // Act
            const spline = engineering.mechanical.splines.involuteSplineSizes({});
            const knurl = engineering.mechanical.knurls.knurlSizes({ diameter: 19.6, pitch: 0.8, pattern: Inputs.Engineering.knurlPatternEnum.diamond });

            // Assert
            expect([spline.teeth, spline.shaftTipDiameter]).toEqual([18, 24.75]);
            expect([knurl.grooves, knurl.helixAngle]).toEqual([77, 30]);
        });

        it("should list in its enums exactly the sizes and bearings the tables hold", () => {
            // Assert
            expect(Object.values(Inputs.Engineering.metricSizeEnum)).toEqual(metricSizes());
            expect(Object.values(Inputs.Engineering.ballBearingEnum).sort()).toEqual([...ballBearingDesignations()].sort());
        });
    });
});
