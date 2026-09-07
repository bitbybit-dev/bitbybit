import { describe, it, expect, beforeAll } from "vitest";
import type * as Modeling from "@jscad/modeling";
import { getJscad } from "../__test__/kernel";
import type { Jscad } from "../jscad-service";
import * as Inputs from "../inputs";

const CUBE_SIDE = 2;
const CUBE_VOLUME = 8;
const ORIGIN: Inputs.Base.Point3 = [0, 0, 0];
const RED = "#ff0000";
const RED_CHANNELS = [1, 0, 0];

describe("JSCADColors", () => {
    let jscad: Jscad;
    let kernel: typeof Modeling;

    beforeAll(async () => {
        ({ jscad, kernel } = await getJscad());
    });

    describe("colorize", () => {
        it("should attach the colour without altering the geometry", () => {
            // Arrange
            const cube = jscad.shapes.cube(new Inputs.JSCAD.CubeDto(ORIGIN, CUBE_SIDE));
            const inputs = new Inputs.JSCAD.ColorizeDto(cube, RED);

            // Act
            const coloured = jscad.colors.colorize(inputs);

            // Assert
            expect(Array.from(coloured.color).slice(0, RED_CHANNELS.length)).toEqual(RED_CHANNELS);
            expect(kernel.measurements.measureVolume(coloured)).toBeCloseTo(CUBE_VOLUME, 6);
        });
    });
});
