import { describe, it, expect, beforeAll } from "vitest";
import type * as Modeling from "@jscad/modeling";
import { getJscad } from "../__test__/kernel";
import type { Jscad } from "../jscad-service";
import * as Inputs from "../inputs";

const ORIGIN: Inputs.Base.Point3 = [0, 0, 0];
const BIG_SIDE = 4;
const BIG_VOLUME = 64;
const SMALL_SIDE = 2;
const SMALL_VOLUME = 8;
const OVERLAP_CORNER: Inputs.Base.Point3 = [2, 2, 2];
const OVERLAP_VOLUME = 1;
const FAR_AWAY: Inputs.Base.Point3 = [100, 0, 0];

describe("JSCADBooleans", () => {
    let jscad: Jscad;
    let kernel: typeof Modeling;
    let big: Inputs.JSCAD.JSCADEntity;
    let corner: Inputs.JSCAD.JSCADEntity;
    let distant: Inputs.JSCAD.JSCADEntity;

    beforeAll(async () => {
        ({ jscad, kernel } = await getJscad());
        big = jscad.shapes.cube(new Inputs.JSCAD.CubeDto(ORIGIN, BIG_SIDE));
        corner = jscad.shapes.cube(new Inputs.JSCAD.CubeDto(OVERLAP_CORNER, SMALL_SIDE));
        distant = jscad.shapes.cube(new Inputs.JSCAD.CubeDto(FAR_AWAY, SMALL_SIDE));
    });

    describe("union", () => {
        it("should add the volumes of two solids that do not touch", () => {
            // Arrange
            const inputs = new Inputs.JSCAD.BooleanObjectsDto([big, distant]);

            // Act
            const result = jscad.booleans.union(inputs);

            // Assert
            expect(kernel.measurements.measureVolume(result)).toBeCloseTo(BIG_VOLUME + SMALL_VOLUME, 6);
        });

        it("should count the shared region once when two solids overlap", () => {
            // Arrange
            const inputs = new Inputs.JSCAD.BooleanObjectsDto([big, corner]);

            // Act
            const result = jscad.booleans.union(inputs);

            // Assert
            expect(kernel.measurements.measureVolume(result)).toBeCloseTo(BIG_VOLUME + SMALL_VOLUME - OVERLAP_VOLUME, 6);
        });
    });

    describe("subtract", () => {
        it("should remove only the overlapping region", () => {
            // Arrange
            const inputs = new Inputs.JSCAD.BooleanObjectsDto([big, corner]);

            // Act
            const result = jscad.booleans.subtract(inputs);

            // Assert
            expect(kernel.measurements.measureVolume(result)).toBeCloseTo(BIG_VOLUME - OVERLAP_VOLUME, 6);
        });

        it("should leave a solid unchanged when the subtrahend is elsewhere", () => {
            // Arrange
            const inputs = new Inputs.JSCAD.BooleanObjectsDto([big, distant]);

            // Act
            const result = jscad.booleans.subtract(inputs);

            // Assert
            expect(kernel.measurements.measureVolume(result)).toBeCloseTo(BIG_VOLUME, 6);
        });
    });

    describe("intersect", () => {
        it("should keep only the shared region", () => {
            // Arrange
            const inputs = new Inputs.JSCAD.BooleanObjectsDto([big, corner]);

            // Act
            const result = jscad.booleans.intersect(inputs);

            // Assert
            expect(kernel.measurements.measureVolume(result)).toBeCloseTo(OVERLAP_VOLUME, 6);
        });

        it("should produce nothing from two solids that do not touch", () => {
            // Arrange
            const inputs = new Inputs.JSCAD.BooleanObjectsDto([big, distant]);

            // Act
            const result = jscad.booleans.intersect(inputs);

            // Assert
            expect(kernel.measurements.measureVolume(result)).toBe(0);
        });
    });

    describe("the two-object forms", () => {
        it("should agree with the list forms", () => {
            // Arrange
            const two = new Inputs.JSCAD.BooleanTwoObjectsDto(big, corner);
            const list = new Inputs.JSCAD.BooleanObjectsDto([big, corner]);

            // Act
            const subtractedTwo = jscad.booleans.subtractTwo(two);
            const unionTwo = jscad.booleans.unionTwo(two);
            const intersectTwo = jscad.booleans.intersectTwo(two);

            // Assert
            expect(kernel.measurements.measureVolume(subtractedTwo))
                .toBeCloseTo(kernel.measurements.measureVolume(jscad.booleans.subtract(list)), 6);
            expect(kernel.measurements.measureVolume(unionTwo))
                .toBeCloseTo(kernel.measurements.measureVolume(jscad.booleans.union(list)), 6);
            expect(kernel.measurements.measureVolume(intersectTwo))
                .toBeCloseTo(kernel.measurements.measureVolume(jscad.booleans.intersect(list)), 6);
        });
    });

    describe("subtractFrom", () => {
        it("should remove every listed solid from the first one", () => {
            // Arrange
            const opposite = jscad.shapes.cube(new Inputs.JSCAD.CubeDto([-2, -2, -2], SMALL_SIDE));
            const inputs = new Inputs.JSCAD.BooleanObjectsFromDto(big, [corner, opposite]);

            // Act
            const result = jscad.booleans.subtractFrom(inputs);

            // Assert
            expect(kernel.measurements.measureVolume(result)).toBeCloseTo(BIG_VOLUME - 2 * OVERLAP_VOLUME, 6);
        });
    });
});
