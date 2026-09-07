import { describe, it, expect, beforeAll } from "vitest";
import Module from "manifold-3d";
import { ManifoldService } from "./manifold-service";
import * as Inputs from "./inputs";

// A unit cube: eight corners, six faces of one square unit each.
const CUBE_SIZE = 1;
// The DTO's own default, which a script relies on when it passes nothing.
const DEFAULT_CUBE_SIZE = 1;
const CUBE_VOLUME = 1;
const CUBE_SURFACE_AREA = 6;

describe("Manifold unit tests", () => {
    let manifold: ManifoldService;

    beforeAll(async () => {
        const wasm = await Module();
        wasm.setup();
        manifold = new ManifoldService(wasm);
    }, 120_000);

    it("should build a cube through the real kernel", () => {
        // Arrange
        const inputs = new Inputs.Manifold.CubeDto(true, CUBE_SIZE);

        // Act
        const cube = manifold.manifold.shapes.cube(inputs);

        // Assert
        expect(cube.volume()).toBeCloseTo(CUBE_VOLUME, 6);
        expect(cube.surfaceArea()).toBeCloseTo(CUBE_SURFACE_AREA, 6);
    });

    it("should fall back to the documented defaults when the DTO is built empty", () => {
        // Arrange - the no-argument form is what a script gets when it omits every field
        const inputs = new Inputs.Manifold.CubeDto();

        // Act
        const cube = manifold.manifold.shapes.cube(inputs);

        // Assert
        expect(inputs.size).toBe(DEFAULT_CUBE_SIZE);
        expect(inputs.center).toBe(true);
        expect(cube.volume()).toBeCloseTo(DEFAULT_CUBE_SIZE ** 3, 6);
    });
});
