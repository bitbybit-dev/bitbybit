import { describe, expect, it } from "vitest";
import type * as Inputs from "../inputs";
import { InputError } from "../kernel-calls";
import { BaseBitByBit } from "./base-bitbybit";

const base = new BaseBitByBit();

const facesOutward = (mesh: Inputs.Base.Mesh3, center: Inputs.Base.Point3): boolean => mesh.every(([a, b, c]) => {
    const normal = base.vector.cross({ first: base.vector.sub({ first: b, second: a }), second: base.vector.sub({ first: c, second: a }) });
    const outward = base.vector.sub({ first: base.point.averagePoint({ points: [a, b, c] }), second: center });
    return base.vector.dot({ first: normal, second: outward }) > 0;
});

describe("mesh primitives", () => {
    it("should make an icosphere of 20 triangles at detail 0 and four times as many each level up", () => {
        // Act
        const counts = [0, 1, 2].map(detail => base.mesh.icosphere({ detail }).length);

        // Assert
        expect(counts).toEqual([20, 80, 320]);
    });

    it("should put every corner of the sphere at its radius from its center, every triangle facing out", () => {
        // Arrange
        const center: Inputs.Base.Point3 = [1, -2, 3];

        // Act
        const sphere = base.mesh.icosphere({ center, radius: 5, detail: 2 });

        // Assert
        expect(sphere.flat().every(corner => Math.abs(base.point.distance({ startPoint: corner, endPoint: center }) - 5) < 1e-9)).toBe(true);
        expect(facesOutward(sphere, center)).toBe(true);
    });

    it("should refuse a radius of no size and a detail beyond 6", () => {
        // Act
        const flat = (): unknown => base.mesh.icosphere({ radius: 0 });
        const fine = (): unknown => base.mesh.icosphere({ detail: 7 });

        // Assert
        expect(flat).toThrow(InputError);
        expect(flat).toThrow("`radius` is not a number above 0.");
        expect(fine).toThrow("`detail` is not a whole number from 0 to 6.");
    });

    it("should close a four-sided cylinder into a square prism of the right volume", () => {
        // Act
        const prism = base.mesh.frustum({ bottomRadius: 1, topRadius: 1, height: 2, sides: 4 });

        // Assert
        expect(prism).toHaveLength(16);
        expect(base.mesh.signedVolume({ mesh: prism })).toBeCloseTo(4, 12);
    });

    it("should make a pyramid when the top radius is 0, rising up Y from its center", () => {
        // Act
        const pyramid = base.mesh.frustum({ center: [1, 2, 3], bottomRadius: 1, topRadius: 0, height: 2, sides: 4 });

        // Assert
        const corners = pyramid.flat();
        expect(base.mesh.signedVolume({ mesh: pyramid })).toBeCloseTo(4 / 3, 12);
        expect(Math.min(...corners.map(corner => corner[1]))).toBeCloseTo(2, 12);
        expect(Math.max(...corners.map(corner => corner[1]))).toBeCloseTo(4, 12);
        expect(corners.some(corner => Math.abs(corner[1] - 4) < 1e-12 && Math.hypot(corner[0] - 1, corner[2] - 3) < 1e-12)).toBe(true);
    });

    it("should rise along the direction it is given, whatever its length, and keep facing outward", () => {
        // Act
        const tilted = base.mesh.frustum({ direction: [0, 0, -5], bottomRadius: 2, topRadius: 1, height: 3, sides: 64 });

        // Assert
        const corners = tilted.flat();
        expect(base.mesh.signedVolume({ mesh: tilted })).toBeGreaterThan(0);
        expect(Math.min(...corners.map(corner => corner[2]))).toBeCloseTo(-3, 12);
        expect(Math.max(...corners.map(corner => corner[2]))).toBeCloseTo(0, 12);
        expect(Math.max(...corners.map(corner => Math.abs(corner[1])))).toBeLessThanOrEqual(2 + 1e-12);
    });

    it("should refuse two radii of 0, fewer than three sides and a direction of no length", () => {
        // Act
        const nothing = (): unknown => base.mesh.frustum({ bottomRadius: 0, topRadius: 0 });
        const flat = (): unknown => base.mesh.frustum({ sides: 2 });
        const nowhere = (): unknown => base.mesh.frustum({ direction: [0, 0, 0] });

        // Assert
        expect(nothing).toThrow("`bottomRadius` and `topRadius` are not numbers of 0 or more with at least one above 0.");
        expect(flat).toThrow("`sides` is not a whole number of at least 3.");
        expect(nowhere).toThrow("`direction` is not a vector of three finite numbers with a length.");
    });
});
