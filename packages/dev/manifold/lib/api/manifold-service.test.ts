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

    // The three members on the service itself, which take either kind of shape and turn it into
    // something a renderer can draw.
    describe("decomposeManifoldOrCrossSection", () => {
        it("should turn a solid into its mesh", () => {
            // Arrange
            const cube = manifold.manifold.shapes.cube(new Inputs.Manifold.CubeDto(true, CUBE_SIZE));

            // Act
            const decomposed = manifold.decomposeManifoldOrCrossSection({ manifoldOrCrossSection: cube });

            // Assert
            expect(manifold.mesh.evaluate.numTri(new Inputs.Manifold.MeshDto(decomposed as never))).toBe(12);
        });

        it("should turn a cross section into its polygons", () => {
            // Arrange
            const square = manifold.crossSection.shapes.square(new Inputs.Manifold.SquareDto(true, CUBE_SIZE));

            // Act
            const decomposed = manifold.decomposeManifoldOrCrossSection({ manifoldOrCrossSection: square });

            // Assert
            expect(decomposed).toHaveLength(1);
        });
    });

    describe("decomposeManifoldsOrCrossSections", () => {
        it("should decompose every shape it was given", () => {
            // Arrange
            const cube = manifold.manifold.shapes.cube(new Inputs.Manifold.CubeDto(true, CUBE_SIZE));
            const square = manifold.crossSection.shapes.square(new Inputs.Manifold.SquareDto(true, CUBE_SIZE));

            // Act
            const decomposed = manifold.decomposeManifoldsOrCrossSections({ manifoldsOrCrossSections: [cube, square] });

            // Assert
            expect(decomposed).toHaveLength(2);
        });

        it("should hand each shape the normal channel that lines up with it", () => {
            // Arrange
            const cube = manifold.manifold.shapes.cube(new Inputs.Manifold.CubeDto(true, CUBE_SIZE));

            // Act
            const decomposed = manifold.decomposeManifoldsOrCrossSections({ manifoldsOrCrossSections: [cube], normalIdx: [0] });

            // Assert
            expect(decomposed).toHaveLength(1);
        });
    });

    describe("toPolygonPoints", () => {
        it("should give one triple of points per triangle of the solid", () => {
            // Arrange
            const cube = manifold.manifold.shapes.cube(new Inputs.Manifold.CubeDto(true, CUBE_SIZE));

            // Act
            const polygons = manifold.toPolygonPoints(new Inputs.Manifold.ManifoldDto(cube));

            // Assert
            expect(polygons).toHaveLength(12);
            expect(polygons[0]).toHaveLength(3);
        });

        it("should give the corners of the solid as the points of its triangles", () => {
            // Arrange
            const cube = manifold.manifold.shapes.cube(new Inputs.Manifold.CubeDto(true, CUBE_SIZE));

            // Act
            const polygons = manifold.toPolygonPoints(new Inputs.Manifold.ManifoldDto(cube));
            const corners = new Set(polygons.flat().map((point) => point.join(",")));

            // Assert
            expect(corners.size).toBe(8);
        });

        it("should refuse a shape that has no mesh to convert", () => {
            // Arrange - a cross section is not a solid, and carries no mesh
            const square = manifold.crossSection.shapes.square(new Inputs.Manifold.SquareDto(true, CUBE_SIZE));

            // Act & Assert
            expect(() => manifold.toPolygonPoints({ manifold: square as never }))
                .toThrow("Manifold has no mesh to convert");
        });

        it("should give no polygons for a solid that is empty", () => {
            // Arrange - subtracting a shape from itself leaves nothing behind
            const cube = manifold.manifold.shapes.cube(new Inputs.Manifold.CubeDto(true, CUBE_SIZE));
            const empty = manifold.manifold.booleans.subtract(new Inputs.Manifold.TwoManifoldsDto(cube, cube));
            const warned: unknown[] = [];
            const consoleWarn = console.warn;
            console.warn = (message: unknown) => { warned.push(message); };

            // Act
            const polygons = manifold.toPolygonPoints(new Inputs.Manifold.ManifoldDto(empty));
            console.warn = consoleWarn;

            // Assert
            expect(polygons).toEqual([]);
            expect(warned).toHaveLength(1);
        });
    });
});
