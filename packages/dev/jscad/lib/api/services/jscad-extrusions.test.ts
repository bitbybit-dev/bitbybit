import { describe, it, expect, beforeAll } from "vitest";
import type * as Modeling from "@jscad/modeling";
import { getJscad } from "../__test__/kernel";
import type { Jscad } from "../jscad-service";
import * as Inputs from "../inputs";

const CENTRE: Inputs.Base.Point2 = [0, 0];
const SQUARE_SIZE = 4;
const SQUARE_AREA = 16;
const HEIGHT = 5;
const PRISM_VOLUME = 80;
const NO_TWIST = 0;
const TWIST_STEPS = 16;
const QUARTER_TURN = Math.PI / 2;
const WALL_SIZE = 0.25;
const SQUARE_PERIMETER = 16;
// The wall straddles the outline, so `size` is a half-thickness: it reaches that far to each side.
const WALL_VOLUME = SQUARE_PERIMETER * 2 * WALL_SIZE * HEIGHT;

describe("JSCADExtrusions", () => {
    let jscad: Jscad;
    let kernel: typeof Modeling;
    let square: Inputs.JSCAD.JSCADEntity;

    beforeAll(async () => {
        ({ jscad, kernel } = await getJscad());
        square = jscad.polygon.square(new Inputs.JSCAD.SquareDto(CENTRE, SQUARE_SIZE));
    });

    describe("extrudeLinear", () => {
        it("should give a prism the area of its profile times its height", () => {
            // Arrange
            const inputs = new Inputs.JSCAD.ExtrudeLinearDto(square, HEIGHT, NO_TWIST, TWIST_STEPS);

            // Act
            const prism = jscad.extrusions.extrudeLinear(inputs);

            // Assert
            expect(kernel.measurements.measureVolume(prism)).toBeCloseTo(PRISM_VOLUME, 6);
            const [min, max] = kernel.measurements.measureBoundingBox(prism);
            expect(max[2] - min[2]).toBeCloseTo(HEIGHT, 6);
        });

        it("should keep the volume but widen the footprint when twisted", () => {
            // Arrange
            const straight = new Inputs.JSCAD.ExtrudeLinearDto(square, HEIGHT, NO_TWIST, TWIST_STEPS);
            const twisted = new Inputs.JSCAD.ExtrudeLinearDto(square, HEIGHT, QUARTER_TURN, TWIST_STEPS);
            const footprintOf = (shape: Inputs.JSCAD.JSCADEntity): number => {
                const [min, max] = kernel.measurements.measureBoundingBox(shape);
                return (max[0] - min[0]) * (max[1] - min[1]);
            };

            // Act
            const straightPrism = jscad.extrusions.extrudeLinear(straight);
            const twistedPrism = jscad.extrusions.extrudeLinear(twisted);

            // Assert
            expect(kernel.measurements.measureVolume(twistedPrism))
                .toBeCloseTo(kernel.measurements.measureVolume(straightPrism), 1);
            expect(footprintOf(twistedPrism)).toBeGreaterThan(footprintOf(straightPrism));
        });
    });

    describe("extrudeRectangular", () => {
        it("should raise a wall along the outline rather than fill it", () => {
            // Arrange
            const inputs = new Inputs.JSCAD.ExtrudeRectangularDto(square, HEIGHT, WALL_SIZE);

            // Act
            const wall = jscad.extrusions.extrudeRectangular(inputs);

            // Assert
            const volume = kernel.measurements.measureVolume(wall);
            expect(volume).toBeCloseTo(WALL_VOLUME, 6);
            expect(volume).toBeLessThan(SQUARE_AREA * HEIGHT);
        });
    });
});
