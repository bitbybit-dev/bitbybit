import { describe, it, expect, beforeAll } from "vitest";
import type * as Modeling from "@jscad/modeling";
import { expectRegion, expectSolid, getJscad } from "../__test__/kernel";
import type { Jscad } from "../jscad-service";
import * as Inputs from "../inputs";

const CENTRE: Inputs.Base.Point2 = [0, 0];
const SQUARE_SIZE = 4;
const SQUARE_AREA = 16;
const DELTA = 1;
const SEGMENTS = 32;
const EXPANDED_AREA = SQUARE_AREA + 4 * SQUARE_SIZE * DELTA + Math.PI * DELTA ** 2;
const CUBE_SIZE = 2;
const CUBE_DELTA = 0.5;
const SHARP_CUBE_VOLUME = (CUBE_SIZE + 2 * CUBE_DELTA) ** 3;

describe("JSCADExpansions", () => {
    let jscad: Jscad;
    let kernel: typeof Modeling;
    let square: Inputs.JSCAD.JSCADEntity;

    beforeAll(async () => {
        ({ jscad, kernel } = await getJscad());
        square = jscad.polygon.square(new Inputs.JSCAD.SquareDto(CENTRE, SQUARE_SIZE));
    });

    describe("expand", () => {
        it("should grow a square by a rounded border of the given width", () => {
            // Arrange
            const inputs = new Inputs.JSCAD.ExpandDto(square, DELTA, Inputs.JSCAD.solidCornerTypeEnum.round, SEGMENTS);

            // Act
            const expanded = jscad.expansions.expand(inputs);

            // Assert
            expect(kernel.measurements.measureArea(expanded)).toBeCloseTo(EXPANDED_AREA, 1);
            const [min, max] = kernel.measurements.measureBoundingBox(expanded);
            expect(max[0] - min[0]).toBeCloseTo(SQUARE_SIZE + 2 * DELTA, 6);
        });

        it("should shrink the shape when the width is negative", () => {
            // Arrange
            const inputs = new Inputs.JSCAD.ExpandDto(square, -DELTA, Inputs.JSCAD.solidCornerTypeEnum.round, SEGMENTS);

            // Act
            const shrunk = jscad.expansions.expand(inputs);

            // Assert
            expect(kernel.measurements.measureArea(shrunk)).toBeLessThan(SQUARE_AREA);
            const [min, max] = kernel.measurements.measureBoundingBox(shrunk);
            expect(max[0] - min[0]).toBeCloseTo(SQUARE_SIZE - 2 * DELTA, 6);
        });
    });

    describe("offset", () => {
        it("should return the outline at the offset distance rather than a filled shape", () => {
            // Arrange
            const inputs = new Inputs.JSCAD.ExpansionDto(square, DELTA, Inputs.JSCAD.solidCornerTypeEnum.round, SEGMENTS);

            // Act
            const offset = expectRegion(jscad.expansions.offset(inputs));

            // Assert
            const [min, max] = kernel.measurements.measureBoundingBox(offset);
            expect(max[0] - min[0]).toBeCloseTo(SQUARE_SIZE + 2 * DELTA, 6);
            expect(offset.sides.length).toBeGreaterThan(4);
        });
    });

    describe("when no corner style was asked for", () => {
        it("should expand a solid with rounded corners rather than refuse it", () => {
            // Arrange
            const cube = jscad.shapes.cube(new Inputs.JSCAD.CubeDto([0, 0, 0], CUBE_SIZE));

            // Act
            const expanded = expectSolid(jscad.expansions.expand({ geometry: cube, delta: CUBE_DELTA, segments: 8 }));

            // Assert
            const [min, max] = kernel.measurements.measureBoundingBox(expanded);
            expect(max[0] - min[0]).toBeCloseTo(CUBE_SIZE + 2 * CUBE_DELTA, 6);
            expect(kernel.measurements.measureVolume(expanded)).toBeLessThan(SHARP_CUBE_VOLUME - 1);
        });

        it("should expand a 2D shape with rounded corners", () => {
            // Act
            const expanded = expectRegion(jscad.expansions.expand({ geometry: square, delta: DELTA, segments: SEGMENTS }));

            // Assert
            expect(expanded.sides.length).toBeGreaterThan(4);
            expect(kernel.measurements.measureArea(expanded)).toBeCloseTo(EXPANDED_AREA, 1);
        });

        it("should offset with sharp corners", () => {
            // Act
            const offset = expectRegion(jscad.expansions.offset({ geometry: square, delta: DELTA, segments: SEGMENTS }));

            // Assert
            expect(offset.sides).toHaveLength(4);
            expect(kernel.measurements.measureArea(offset)).toBeCloseTo((SQUARE_SIZE + 2 * DELTA) ** 2, 6);
        });

        it("should not write the chosen corner style back into the caller's options", () => {
            // Arrange
            const square = jscad.polygon.square(new Inputs.JSCAD.SquareDto([0, 0], 4));
            const expandOptions = { geometry: square, delta: 1, segments: 16 } as Inputs.JSCAD.ExpandDto;
            const offsetOptions = { geometry: square, delta: 1, segments: 16 } as Inputs.JSCAD.ExpansionDto;

            // Act
            jscad.expansions.expand(expandOptions);
            jscad.expansions.offset(offsetOptions);

            // Assert
            expect(Object.keys(expandOptions)).toEqual(["geometry", "delta", "segments"]);
            expect(Object.keys(offsetOptions)).toEqual(["geometry", "delta", "segments"]);
        });
    });
});
