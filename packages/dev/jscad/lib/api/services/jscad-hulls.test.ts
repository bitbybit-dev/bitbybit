import { describe, it, expect, beforeAll } from "vitest";
import type * as Modeling from "@jscad/modeling";
import { getJscad } from "../__test__/kernel";
import type { Jscad } from "../jscad-service";
import * as Inputs from "../inputs";

const CUBE_SIDE = 2;
const CUBE_VOLUME = 8;
const LEFT: Inputs.Base.Point3 = [0, 0, 0];
const RIGHT: Inputs.Base.Point3 = [6, 0, 0];
const HULL_SPAN = 8;

describe("JSCADHulls", () => {
    let jscad: Jscad;
    let kernel: typeof Modeling;
    let left: Inputs.JSCAD.JSCADEntity;
    let right: Inputs.JSCAD.JSCADEntity;

    beforeAll(async () => {
        ({ jscad, kernel } = await getJscad());
        left = jscad.shapes.cube(new Inputs.JSCAD.CubeDto(LEFT, CUBE_SIDE));
        right = jscad.shapes.cube(new Inputs.JSCAD.CubeDto(RIGHT, CUBE_SIDE));
    });

    describe("hull", () => {
        it("should wrap the inputs in one solid that spans them and encloses more than they do", () => {
            // Arrange
            const inputs = new Inputs.JSCAD.HullDto([left, right]);

            // Act
            const hull = jscad.hulls.hull(inputs);

            // Assert
            const [min, max] = kernel.measurements.measureBoundingBox(hull);
            expect(max[0] - min[0]).toBeCloseTo(HULL_SPAN, 6);
            expect(kernel.measurements.measureVolume(hull)).toBeGreaterThan(2 * CUBE_VOLUME);
        });
    });

    describe("hullChain", () => {
        it("should wrap consecutive pairs, so a bend encloses less than one hull over everything", () => {
            // Arrange
            const bend = jscad.shapes.cube(new Inputs.JSCAD.CubeDto([3, 6, 0], CUBE_SIDE));
            const chainInputs = new Inputs.JSCAD.HullDto([left, bend, right]);
            const wholeInputs = new Inputs.JSCAD.HullDto([left, bend, right]);

            // Act
            const chain = jscad.hulls.hullChain(chainInputs);
            const whole = jscad.hulls.hull(wholeInputs);

            // Assert
            expect(kernel.measurements.measureVolume(chain))
                .toBeLessThan(kernel.measurements.measureVolume(whole));
            expect(kernel.measurements.measureVolume(chain)).toBeGreaterThan(3 * CUBE_VOLUME);
        });
    });
});
