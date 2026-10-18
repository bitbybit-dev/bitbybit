import { describe, expect, it } from "vitest";
import { degreesOf, fractionOf, interpolated, radiansOf, roundedTo, roundedToMillionths, smoothstep } from "./scalars";

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
});
