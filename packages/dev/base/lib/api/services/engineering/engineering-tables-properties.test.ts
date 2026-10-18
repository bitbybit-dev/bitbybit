import { describe, expect, it } from "vitest";
import fc from "fast-check";
import { InputError } from "../../kernel-calls/errors";
import type { MetricSize, SetScrewPoint } from "../../fasteners/fastener-types";
import { chamferedWasherSizes, clearanceHoleDiameter, hexBoltSizes, hexNutSizes, metricSizes, metricThread, setScrewSizes, socketHeadCapScrewSizes, washerSizes } from "../../fasteners/fasteners";
import { ballBearingDesignations, ballBearingSizes, compressionSpringPath, parallelKeySizes, retainingRingDiameters, retainingRingSizes } from "../../machine-elements/machine-elements";
import { involuteSplineSizes, knurlSizes } from "../../shafts/shafts";
import type { BallBearingDesignation } from "../../machine-elements/machine-element-types";

const SEED = 20261018;
const SIZES = metricSizes();
const POINTS: SetScrewPoint[] = ["flat", "cone", "dog", "cup"];
const SPLINE_MODULES = [0.5, 0.6, 0.75, 0.8, 1, 1.25, 1.5, 1.75, 2, 2.5, 3, 4, 5, 6, 8, 10];
const KNURL_PITCHES = [0.5, 0.6, 0.8, 1, 1.2, 1.6];

const nonDecreasing = (values: readonly number[]): boolean => values.every((value, index) => index === 0 || value >= values[index - 1]!);
const increasing = (values: readonly number[]): boolean => values.every((value, index) => index === 0 || value > values[index - 1]!);

const refusedWith = (make: () => unknown): unknown => {
    try {
        make();
        return undefined;
    } catch (error) {
        return error;
    }
};

const setScrewSizesOf = (size: MetricSize): boolean => refusedWith(() => setScrewSizes(size)) === undefined;

const boreOfDesignation = (designation: BallBearingDesignation): number => {
    const code = designation.slice(-2);
    const small: Record<string, number> = { "00": 10, "01": 12, "02": 15, "03": 17 };
    return designation.length === 3 ? Number(designation.slice(-1)) : small[code] ?? 5 * Number(code);
};

describe("engineering tables against the standards' own rules", () => {
    describe("metric threads and fasteners", () => {
        it("should grow every coarse thread, clearance hole, head, nut and washer with the size, as ISO lists them", () => {
            // Act
            const threads = SIZES.map(size => metricThread(size));
            const heads = SIZES.map(size => socketHeadCapScrewSizes(size));
            const nuts = SIZES.map(size => hexNutSizes(size));
            const washers = SIZES.map(size => washerSizes(size));

            // Assert
            expect(increasing(threads.map(thread => thread.diameter))).toBe(true);
            expect(nonDecreasing(threads.map(thread => thread.pitch))).toBe(true);
            expect(increasing(threads.map(thread => thread.tapDrill))).toBe(true);
            (["close", "normal", "loose"] as const).forEach(fit => expect(increasing(SIZES.map(size => clearanceHoleDiameter(size, fit)))).toBe(true));
            expect(increasing(heads.map(head => head.headDiameter))).toBe(true);
            expect(nonDecreasing(heads.map(head => head.socketSize))).toBe(true);
            expect(increasing(nuts.map(nut => nut.height))).toBe(true);
            expect(nonDecreasing(nuts.map(nut => nut.acrossFlats))).toBe(true);
            expect(increasing(washers.map(washer => washer.outerDiameter))).toBe(true);
        });

        it("should drill a coarse thread's tap hole at its diameter less its pitch, to a drill size, and give it a minor diameter under its pitch diameter", () => {
            // Act & Assert
            SIZES.forEach(size => {
                const thread = metricThread(size);
                expect(Math.abs(thread.tapDrill - (thread.diameter - thread.pitch))).toBeLessThanOrEqual(0.05 + 1e-12);
                expect(thread.minorDiameter).toBeLessThan(thread.internalMinorDiameter);
                expect(thread.internalMinorDiameter).toBeLessThan(thread.pitchDiameter);
                expect(thread.pitchDiameter).toBeLessThan(thread.diameter);
                expect(thread.tapDrill).toBeGreaterThan(thread.minorDiameter);
            });
        });

        it("should take any fine pitch up to the coarse one, its tap drill and diameters growing as the pitch shrinks, and refuse any other as an InputError", () => {
            // Act & Assert
            fc.assert(fc.property(fc.constantFrom(...SIZES), fc.double({ min: -1, max: 4, noNaN: false }), (size, pitch) => {
                const coarse = metricThread(size);
                const refusal = refusedWith(() => metricThread(size, pitch));
                if (!(pitch > 0 && pitch <= coarse.pitch)) {
                    expect(refusal).toBeInstanceOf(InputError);
                    return;
                }
                const fine = metricThread(size, pitch);
                expect(fine.tapDrill).toBeGreaterThanOrEqual(coarse.tapDrill - 0.05);
                expect(fine.minorDiameter).toBeGreaterThanOrEqual(coarse.minorDiameter);
                expect(fine.pitchDiameter).toBeGreaterThanOrEqual(coarse.pitchDiameter);
                expect(Object.values(fine).filter(value => typeof value === "number").every(Number.isFinite)).toBe(true);
            }), { seed: SEED, numRuns: 300 });
        });

        it("should make each clearance hole wider than the thread and the close one the washer's hole, the head as tall as the thread is wide and the counterbore wider than the head", () => {
            // Act & Assert
            SIZES.forEach(size => {
                const thread = metricThread(size);
                const head = socketHeadCapScrewSizes(size);
                expect(clearanceHoleDiameter(size, "close")).toBeGreaterThan(thread.diameter);
                expect(clearanceHoleDiameter(size, "close")).toBe(washerSizes(size).innerDiameter);
                expect(head.headHeight).toBe(thread.diameter);
                expect(head.counterboreDiameter).toBeGreaterThan(head.headDiameter);
                expect(hexNutSizes(size).acrossFlats).toBe(hexBoltSizes(size, 50).acrossFlats);
            });
        });

        it("should thread a longer bolt at least as far as a shorter one, never past its length's band, and refuse a length that is not more than 0", () => {
            // Act & Assert
            fc.assert(fc.property(fc.constantFrom(...SIZES), fc.double({ min: 1, max: 400, noNaN: true }), fc.double({ min: 1, max: 400, noNaN: true }), (size, first, second) => {
                const [shorter, longer] = first < second ? [first, second] : [second, first];
                expect(hexBoltSizes(size, longer).threadLength).toBeGreaterThanOrEqual(hexBoltSizes(size, shorter).threadLength);
                expect(refusedWith(() => hexBoltSizes(size, -shorter))).toBeInstanceOf(InputError);
                expect(refusedWith(() => hexBoltSizes(size, Number.NaN))).toBeInstanceOf(InputError);
            }), { seed: SEED, numRuns: 200 });
        });

        it("should give every set screw point a finite length of 0 or more and a diameter under the thread's minor diameter, a longer screw a deeper socket", () => {
            // Act & Assert
            fc.assert(fc.property(fc.constantFrom(...SIZES.filter(setScrewSizesOf)), fc.constantFrom(...POINTS), fc.double({ min: 1, max: 60, noNaN: true }), (size, point, length) => {
                const sizes = setScrewSizes(size, point, length);
                const long = setScrewSizes(size, point, Infinity);
                expect(Number.isFinite(sizes.pointLength)).toBe(true);
                expect(sizes.pointLength).toBeGreaterThanOrEqual(0);
                expect(sizes.pointDiameter).toBeLessThan(metricThread(size).minorDiameter);
                expect(long.socketDepth).toBeGreaterThanOrEqual(sizes.socketDepth);
            }), { seed: SEED, numRuns: 300 });
        });

        it("should chamfer every washer from M5 up by a quarter of its thickness and refuse every size below", () => {
            // Act & Assert
            SIZES.forEach(size => {
                const refusal = refusedWith(() => chamferedWasherSizes(size));
                if (metricThread(size).diameter < 5) {
                    expect(refusal).toBeInstanceOf(InputError);
                    return;
                }
                const washer = chamferedWasherSizes(size);
                expect(washer.chamferHeight).toBe(washer.thickness / 4);
                expect(washer.chamferWidth).toBeGreaterThan(0);
            });
        });
    });

    describe("ball bearings", () => {
        it("should give every designation the bore its last digits stand for, and the 62 series the larger rings of the 60 series", () => {
            // Act
            const designations = ballBearingDesignations();

            // Assert
            designations.forEach(designation => expect(ballBearingSizes(designation).bore).toBe(boreOfDesignation(designation)));
            designations.filter(designation => designation.startsWith("60") && designation.length === 4).forEach(designation => {
                const light = ballBearingSizes(designation);
                const heavier = ballBearingSizes(`62${designation.slice(2)}` as BallBearingDesignation);
                expect(heavier.outside).toBeGreaterThan(light.outside);
                expect(heavier.width).toBeGreaterThanOrEqual(light.width);
            });
            designations.forEach(designation => {
                const sizes = ballBearingSizes(designation);
                expect(sizes.outside).toBeGreaterThan(sizes.bore);
            });
        });

        it("should grow the outside and width of each series with its bore", () => {
            // Act
            const series = ["6", "60", "62"].map(prefix => ballBearingDesignations().filter(designation => (prefix === "6" ? designation.length === 3 : designation.length === 4 && designation.startsWith(prefix))).map(designation => ballBearingSizes(designation)).sort((a, b) => a.bore - b.bore));

            // Assert
            series.forEach(rows => {
                expect(increasing(rows.map(row => row.bore))).toBe(true);
                expect(increasing(rows.map(row => row.outside))).toBe(true);
                expect(nonDecreasing(rows.map(row => row.width))).toBe(true);
            });
        });
    });

    describe("parallel keys", () => {
        it("should never give a thicker shaft a smaller key, and give each key grooves that hold its whole height between them", () => {
            // Act & Assert
            fc.assert(fc.property(fc.double({ min: 6.000001, max: 65, noNaN: true }), fc.double({ min: 6.000001, max: 65, noNaN: true }), (first, second) => {
                const [thinner, thicker] = first < second ? [first, second] : [second, first];
                const small = parallelKeySizes(thinner);
                const large = parallelKeySizes(thicker);
                expect(large.width).toBeGreaterThanOrEqual(small.width);
                expect(large.height).toBeGreaterThanOrEqual(small.height);
                expect(small.shaftDepth + small.hubDepth).toBeGreaterThanOrEqual(small.height);
                expect(small.shaftDepth).toBeLessThan(small.height);
            }), { seed: SEED, numRuns: 300 });
        });

        it("should refuse shafts outside the table and any value that is not a number as an InputError", () => {
            // Act & Assert
            [6, 5, 65.0001, 100, -1, Number.NaN, Infinity].forEach(diameter => expect(refusedWith(() => parallelKeySizes(diameter))).toBeInstanceOf(InputError));
        });
    });

    describe("retaining rings", () => {
        it("should seat every shaft ring in a groove under the shaft and every bore ring in one beyond the bore, each ring sprung against its groove", () => {
            // Act & Assert
            retainingRingDiameters("shaft").forEach(diameter => {
                const ring = retainingRingSizes("shaft", diameter);
                expect(ring.grooveDiameter).toBeLessThan(diameter);
                expect(ring.freeDiameter).toBeLessThan(ring.grooveDiameter);
                expect(ring.grooveWidth).toBeGreaterThan(ring.thickness);
            });
            retainingRingDiameters("bore").forEach(diameter => {
                const ring = retainingRingSizes("bore", diameter);
                expect(ring.grooveDiameter).toBeGreaterThan(diameter);
                expect(ring.freeDiameter).toBeGreaterThan(ring.grooveDiameter);
                expect(ring.grooveWidth).toBeGreaterThan(ring.thickness);
            });
        });

        it("should list the sizes in order and never thin a ring as the diameter grows", () => {
            // Act & Assert
            (["shaft", "bore"] as const).forEach(kind => {
                const diameters = retainingRingDiameters(kind);
                expect(increasing(diameters)).toBe(true);
                expect(nonDecreasing(diameters.map(diameter => retainingRingSizes(kind, diameter).thickness))).toBe(true);
                expect(increasing(diameters.map(diameter => retainingRingSizes(kind, diameter).grooveDiameter))).toBe(true);
            });
        });
    });

    describe("compression springs", () => {
        const springArbitrary = fc.record({
            wireDiameter: fc.double({ min: 0.1, max: 5, noNaN: true }),
            index: fc.double({ min: 3.01, max: 20, noNaN: true }),
            activeCoils: fc.oneof(fc.integer({ min: 1, max: 30 }), fc.double({ min: 0.5, max: 40, noNaN: true }), fc.constant(1000)),
            stretch: fc.double({ min: 1.0001, max: 4, noNaN: true }),
        }).map(({ wireDiameter, index, activeCoils, stretch }) => ({ wireDiameter, diameter: wireDiameter * index, activeCoils, length: wireDiameter * 1.05 * (activeCoils + 2) * stretch }));

        it("should rise steadily from below one ground end to above the other, every point at the coils' mean radius", () => {
            // Act & Assert
            fc.assert(fc.property(springArbitrary, (spec) => {
                const { points } = compressionSpringPath(spec);
                const radius = (spec.diameter - spec.wireDiameter) / 2;
                expect(nonDecreasing(points.map(([, , z]) => z))).toBe(true);
                points.forEach(([x, y]) => expect(Math.hypot(x, y)).toBeCloseTo(radius, 9));
                expect(points[0]![2]).toBeLessThan(0);
                expect(points[points.length - 1]![2]).toBeGreaterThan(spec.length);
            }), { seed: SEED, numRuns: 40 });
        });

        it("should keep each coil at least a wire's thickness above the one below it, so the wire never runs through itself", () => {
            // Act & Assert
            fc.assert(fc.property(springArbitrary, (spec) => {
                const { points } = compressionSpringPath(spec);
                const perTurn = 24;
                const gaps = points.slice(perTurn).map((point, index) => point[2] - points[index]![2]);
                expect(Math.min(...gaps)).toBeGreaterThanOrEqual(spec.wireDiameter * (1 - 1e-9));
            }), { seed: SEED, numRuns: 40 });
        });

        it("should take a spring at the solid length its own wire, coils and closing rise multiply out to", () => {
            // Act & Assert
            fc.assert(fc.property(springArbitrary, ({ wireDiameter, diameter, activeCoils }) => {
                const solid = wireDiameter * 1.05 * (activeCoils + 2);
                expect(refusedWith(() => compressionSpringPath({ wireDiameter, diameter, activeCoils, length: solid }))).toBeUndefined();
            }), { seed: SEED, numRuns: 100 });
        });

        it("should take a spring of 0.35 wire with 9 active coils at the 4.0425 its wire, coils and closing rise multiply out to", () => {
            // Arrange
            const solid = 0.35 * 1.05 * 11;

            // Act
            const path = (): unknown => compressionSpringPath({ wireDiameter: 0.35, diameter: 3.5, activeCoils: 9, length: solid });

            // Assert
            expect(solid).toBeCloseTo(4.0425, 12);
            expect(path).not.toThrow();
        });

        it("should refuse a spring of any value that is not finite, as an InputError naming it, rather than loop", () => {
            // Act & Assert
            fc.assert(fc.property(springArbitrary, fc.constantFrom("wireDiameter", "diameter", "activeCoils", "length"), fc.constantFrom(Infinity, -Infinity, Number.NaN), (spec, property, value) => {
                const refusal = refusedWith(() => compressionSpringPath({ ...spec, [property]: value }));
                expect(refusal).toBeInstanceOf(InputError);
                expect((refusal as InputError).property).toBe(property);
            }), { seed: SEED, numRuns: 100 });
        });
    });

    describe("involute splines and knurls", () => {
        it("should give every spline it sizes a whole tooth count DIN 5480 allows and a shift that rebuilds its reference diameter", () => {
            // Act & Assert
            fc.assert(fc.property(fc.constantFrom(...SPLINE_MODULES), fc.double({ min: 4, max: 500, noNaN: true }), (module, referenceDiameter) => {
                const refusal = refusedWith(() => involuteSplineSizes(referenceDiameter, module));
                if (refusal !== undefined) {
                    expect(refusal).toBeInstanceOf(InputError);
                    return;
                }
                const spline = involuteSplineSizes(referenceDiameter, module);
                expect(Number.isInteger(spline.teeth)).toBe(true);
                expect(spline.teeth).toBeGreaterThanOrEqual(6);
                expect(spline.teeth).toBeLessThanOrEqual(82);
                expect(spline.profileShift).toBeGreaterThanOrEqual(-0.05 - 1e-6);
                expect(spline.profileShift).toBeLessThanOrEqual(0.45 + 1e-6);
                expect(Math.abs(module * spline.teeth + 2 * spline.profileShift * module + 1.1 * module - referenceDiameter)).toBeLessThanOrEqual(module * 1e-6 + 1e-9);
                expect(spline.shaftRootDiameter).toBeLessThan(spline.hubTipDiameter);
                expect(spline.hubTipDiameter).toBeLessThan(spline.shaftTipDiameter);
                expect(spline.shaftTipDiameter).toBeLessThan(spline.hubRootDiameter);
            }), { seed: SEED, numRuns: 400 });
        });

        it("should fit a whole number of knurl grooves round the diameter it nudges by less than half a pitch", () => {
            // Act & Assert
            fc.assert(fc.property(fc.constantFrom(...KNURL_PITCHES), fc.double({ min: 3.3, max: 300, noNaN: true }), fc.constantFrom("straight", "left", "right", "diamond"), (pitch, diameter, pattern) => {
                const knurl = knurlSizes(diameter, pitch, pattern);
                expect(Number.isInteger(knurl.grooves)).toBe(true);
                expect(knurl.grooves * pitch).toBeCloseTo(Math.PI * knurl.diameter, 5);
                expect(Math.abs(knurl.diameter - diameter)).toBeLessThanOrEqual(pitch / Math.PI / 2 + 1e-6);
            }), { seed: SEED, numRuns: 300 });
        });
    });
});
