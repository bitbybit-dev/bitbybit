import { describe, it, expect, beforeAll } from "vitest";
import type * as Modeling from "@jscad/modeling";
import { expectRegion, getJscad } from "../__test__/kernel";
import type { Jscad } from "../jscad-service";
import * as Inputs from "../inputs";

const CENTRE: Inputs.Base.Point2 = [0, 0];
const SQUARE_SIZE = 4;
const SQUARE_AREA = 16;
const DELTA = 1;
const SEGMENTS = 32;
const EXPANDED_AREA = SQUARE_AREA + 4 * SQUARE_SIZE * DELTA + Math.PI * DELTA ** 2;

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
            const inputs = new Inputs.JSCAD.ExpansionDto(square, DELTA, Inputs.JSCAD.solidCornerTypeEnum.round, SEGMENTS);

            // Act
            const expanded = jscad.expansions.expand(inputs);

            // Assert
            expect(kernel.measurements.measureArea(expanded)).toBeCloseTo(EXPANDED_AREA, 1);
            const [min, max] = kernel.measurements.measureBoundingBox(expanded);
            expect(max[0] - min[0]).toBeCloseTo(SQUARE_SIZE + 2 * DELTA, 6);
        });

        it("should shrink the shape when the width is negative", () => {
            // Arrange
            const inputs = new Inputs.JSCAD.ExpansionDto(square, -DELTA, Inputs.JSCAD.solidCornerTypeEnum.round, SEGMENTS);

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
        it("should expand with rounded corners", () => {
            // Arrange
            const square = jscad.polygon.square(new Inputs.JSCAD.SquareDto([0, 0], 4));

            // Act
            const expanded = jscad.expansions.expand({ geometry: square, delta: 1, segments: 16 } as Inputs.JSCAD.ExpansionDto);

            expect(kernel.measurements.measureArea(expanded)).toBeGreaterThan(16);
        });

        it("should offset with edged corners", () => {
            // Arrange
            const square = jscad.polygon.square(new Inputs.JSCAD.SquareDto([0, 0], 4));

            // Act
            const rounded = jscad.expansions.offset({ geometry: square, delta: 1, segments: 16, corners: Inputs.JSCAD.solidCornerTypeEnum.round });
            const edged = jscad.expansions.offset({ geometry: square, delta: 1, segments: 16 } as Inputs.JSCAD.ExpansionDto);

            expect(kernel.measurements.measureArea(edged)).toBeGreaterThan(kernel.measurements.measureArea(rounded));
        });
    });
});
