import { describe, expect, it } from "vitest";
import { degreesOf, fractionOf, interpolated, niceStep, radiansOf, roundedTo, roundedToMillionths, shortestAngle, smoothstep } from "./scalars";

describe("scalar helpers", () => {
    it("should ease from 0 to 1 with no slope at either end, held outside them", () => {
        // Act
        const values = [-1, 0, 0.25, 0.5, 0.75, 1, 2].map(smoothstep);

        // Assert
        expect(values).toEqual([0, 0, 0.15625, 0.5, 0.84375, 1, 1]);
    });

    it("should round to the nearest millionth", () => {
        // Act
        const rounded = [roundedToMillionths(4.1340000004), roundedToMillionths(0.0000015), roundedToMillionths(-2.3456785)];

        // Assert
        expect(rounded).toEqual([4.134, 0.000002, -2.345678]);
    });

    it("should turn degrees into radians and back, a half turn being pi", () => {
        // Act
        const radians = [0, 90, 180, -360].map(radiansOf);
        const degrees = [Math.PI, -Math.PI / 2].map(degreesOf);

        // Assert
        expect(radians).toEqual([0, Math.PI / 2, Math.PI, -2 * Math.PI]);
        expect(degrees).toEqual([180, -90]);
    });

    it("should find the number a share of the way from a start to an end, past either end for shares outside 0 to 1", () => {
        // Act
        const values = [0, 0.25, 1, 1.5].map(share => interpolated(10, 20, share));

        // Assert
        expect(values).toEqual([10, 12.5, 20, 25]);
    });

    it("should round to a given number of places, and give the part of a number above its floor, below zero too", () => {
        // Act
        const rounded = [roundedTo(1.32156, 3), roundedTo(-2.5, 0), roundedTo(1234.5, -2)];
        const fractions = [fractionOf(3.25), fractionOf(-2.25), fractionOf(4)];

        // Assert
        expect(rounded).toEqual([1.322, -2, 1200]);
        expect(fractions).toEqual([0.25, 0.75, 0]);
    });

    it("should round a small negative number to zero, never to minus zero", () => {
        // Act
        const rounded = [roundedTo(-0.0001, 2), roundedTo(-0.4, 0), roundedToMillionths(-0.0000001)];

        // Assert
        rounded.forEach(value => expect(Object.is(value, 0)).toBe(true));
    });

    it("should give the angle nearest the start that names the same direction as the end", () => {
        // Act
        const degrees = [shortestAngle(10, 350, 360), shortestAngle(350, 10, 360), shortestAngle(0, 725, 360), shortestAngle(0, 180, 360), shortestAngle(0, -180, 360), shortestAngle(-720, 90, 360)];
        const radians = shortestAngle(0.1, 2 * Math.PI - 0.1, 2 * Math.PI);

        // Assert
        expect(degrees).toEqual([-10, 370, 5, 180, -180, -630]);
        expect(radians).toBeCloseTo(-0.1, 12);
    });

    it("should round up to the smallest step on the 1, 2, 5 scale at or above a number, ignoring rounding noise", () => {
        // Act
        const steps = [0.37, 3, 5, 5.0000000001, 7, 999, 1000, 0.0003, 0.00011].map(value => niceStep(value, "up"));

        // Assert
        expect(steps).toEqual([0.5, 5, 5, 5, 10, 1000, 1000, 0.0005, 0.0002]);
    });

    it("should round down to the largest step at or below a number, ignoring rounding noise", () => {
        // Act
        const steps = [0.37, 9.99, 1, 0.0049999999999, 25, 0.07].map(value => niceStep(value, "down"));

        // Assert
        expect(steps).toEqual([0.2, 5, 1, 0.005, 20, 0.05]);
    });

    it("should round to the nearest step by ratio, so 3.3 goes to 5 and 3 to 2", () => {
        // Act
        const steps = [1.3, 1.5, 3, 3.3, 8, 0.0007, 140].map(value => niceStep(value, "nearest"));

        // Assert
        expect(steps).toEqual([1, 2, 2, 5, 10, 0.0005, 100]);
    });
});
