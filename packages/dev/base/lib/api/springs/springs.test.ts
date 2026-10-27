import { describe, expect, it } from "vitest";
import { compressionSpringPath } from "./springs";

describe("springs", () => {
    describe("compression springs", () => {
        const spec = { wireDiameter: 2, diameter: 20, activeCoils: 6, length: 40 };

        it("should coil from 0 to the length at the mean radius, running on past both ends, its active coils sharing what the closed ends leave", () => {
            // Act
            const path = compressionSpringPath(spec);

            // Assert
            const heights = path.points.map(point => point[2]);
            expect(path.points).toContainEqual([9, 0, 0]);
            expect(Math.min(...heights)).toBeCloseTo(-0.75 * 2.1, 9);
            expect(Math.max(...heights)).toBeCloseTo(40 + 0.75 * 2.1, 9);
            expect(path.points.every(point => Math.abs(Math.hypot(point[0], point[1]) - 9) < 1e-9)).toBe(true);
            expect(path.pitch).toBeCloseTo((40 - 4.2) / 6, 12);
            expect(path.solidLength).toBeCloseTo(16.8, 12);
        });

        it("should close its end coils: the first coil rises by about the wire's diameter, an active one by the pitch", () => {
            // Act
            const path = compressionSpringPath(spec);

            // Assert
            const start = path.points.findIndex(point => point[2] === 0);
            const perCoil = 24;
            expect(path.points[start + perCoil]![2]).toBeLessThan(2.1 + 0.5);
            expect(path.points[start + 4 * perCoil]![2] - path.points[start + 3 * perCoil]![2]).toBeCloseTo((40 - 4.2) / 6, 6);
        });

        it("should refuse a spring shorter than solid, a wire too thick for its coils and no active coils", () => {
            // Act & Assert
            expect(() => compressionSpringPath({ ...spec, length: 16.5 })).toThrow("`length`");
            expect(() => compressionSpringPath({ ...spec, diameter: 6 })).toThrow("`diameter`");
            expect(() => compressionSpringPath({ ...spec, activeCoils: 0 })).toThrow("`activeCoils`");
            expect(() => compressionSpringPath({ ...spec, wireDiameter: 0 })).toThrow("`wireDiameter`");
            expect(() => compressionSpringPath({ ...spec, activeCoils: Infinity })).toThrow("`activeCoils` is Infinity; a spring is made of finite numbers.");
            expect(() => compressionSpringPath({ ...spec, length: Number.NaN })).toThrow("`length` is NaN; a spring is made of finite numbers.");
        });

        it("should say the wire check compares the outside diameter with three times the wire's", () => {
            // Act & Assert
            expect(() => compressionSpringPath({ ...spec, diameter: 6 })).toThrow("`diameter`, the outside diameter of the coils, is not more than three times `wireDiameter`.");
        });

        it("should refuse more active coils than a path is drawn for, and draw the most it takes", () => {
            // Act
            const longest = compressionSpringPath({ ...spec, activeCoils: 1000, length: 10000 });
            const tooMany = (): unknown => compressionSpringPath({ ...spec, activeCoils: 1e9, length: 1e10 });

            // Assert
            expect(longest.points).toHaveLength(24 * 1002 + 1 + 2 * 18);
            expect(tooMany).toThrow("`activeCoils` is more than 1000, the most a spring path is drawn for.");
        });
    });
    describe("a spring at its solid length", () => {
        it("should take the solid length as the tables print it, and name it so when a shorter one is refused", () => {
            // Act
            const solid = compressionSpringPath({ wireDiameter: 0.2, diameter: 2, activeCoils: 6, length: 1.68 });

            // Assert
            expect(solid.points.length).toBeGreaterThan(2);
            expect(() => compressionSpringPath({ wireDiameter: 0.2, diameter: 2, activeCoils: 6, length: 1.6 })).toThrow("solid length, 1.68,");
        });
    });
});
