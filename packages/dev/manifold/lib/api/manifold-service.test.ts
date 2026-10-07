import type { Manifold as Manifold3DManifold, Mesh as Manifold3DMesh } from "manifold-3d";
import { describe, it, expect, beforeAll, vi } from "vitest";
import Module from "manifold-3d";
import { ManifoldService } from "./manifold-service";
import * as Inputs from "./inputs";

const CUBE_SIZE = 1;
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
        const inputs = new Inputs.Manifold.CubeDto();

        // Act
        const cube = manifold.manifold.shapes.cube(inputs);

        // Assert
        expect(inputs.size).toBe(DEFAULT_CUBE_SIZE);
        expect(inputs.center).toBe(true);
        expect(cube.volume()).toBeCloseTo(DEFAULT_CUBE_SIZE ** 3, 6);
    });

    function normalsOf(mesh: Manifold3DMesh): number[][] {
        const normals: number[][] = [];
        for (let at = 0; at < mesh.vertProperties.length; at += mesh.numProp) {
            normals.push([mesh.vertProperties[at + 3]!, mesh.vertProperties[at + 4]!, mesh.vertProperties[at + 5]!]);
        }
        return normals;
    }

    describe("decomposeManifoldOrCrossSection", () => {
        it("should turn a solid into its mesh", () => {
            // Arrange
            const cube = manifold.manifold.shapes.cube(new Inputs.Manifold.CubeDto(true, CUBE_SIZE));

            // Act
            const decomposed = manifold.decomposeManifoldOrCrossSection({ manifoldOrCrossSection: cube });

            // Assert
            expect(manifold.mesh.evaluate.numTri(new Inputs.Manifold.MeshDto(decomposed as never))).toBe(12);
        });

        it("should give a cube's mesh normals that stay sharp at its edges, one per face at each corner", () => {
            // Arrange
            const cube = manifold.manifold.shapes.cube(new Inputs.Manifold.CubeDto(true, CUBE_SIZE));

            // Act
            const decomposed = manifold.decomposeManifoldOrCrossSection({ manifoldOrCrossSection: cube, minSharpAngle: 40 }) as Manifold3DMesh;
            const normals = normalsOf(decomposed);

            // Assert
            expect(decomposed.numProp).toBe(6);
            expect(decomposed.vertProperties.length / 6).toBe(24);
            expect(new Set(normals.map((normal) => normal.map((value) => Math.round(value)).join(","))).size).toBe(6);
            expect(normals.every((normal) => Math.abs(Math.hypot(...normal) - 1) < 1e-6 && normal.filter((value) => Math.abs(value) > 1e-6).length === 1)).toBe(true);
        });

        it("should give a sphere's mesh normals that point out from its centre, and every face flat at an angle of 0", () => {
            // Arrange
            const sphere = manifold.manifold.shapes.sphere(new Inputs.Manifold.SphereDto(CUBE_SIZE, 32));

            // Act
            const smooth = manifold.decomposeManifoldOrCrossSection({ manifoldOrCrossSection: sphere, minSharpAngle: 40 }) as Manifold3DMesh;
            const flat = manifold.decomposeManifoldOrCrossSection({ manifoldOrCrossSection: sphere, minSharpAngle: 0 }) as Manifold3DMesh;
            const outward = normalsOf(smooth).map((normal, at) => {
                const [x, y, z] = [smooth.vertProperties[at * 6]!, smooth.vertProperties[at * 6 + 1]!, smooth.vertProperties[at * 6 + 2]!];
                return (normal[0]! * x + normal[1]! * y + normal[2]! * z) / Math.hypot(x, y, z);
            });

            // Assert
            expect(Math.min(...outward)).toBeGreaterThan(0.99);
            expect(flat.vertProperties.length / 6).toBeGreaterThan(smooth.vertProperties.length / 6 * 2);
        });

        it("should release the copy it computed the normals on", () => {
            // Arrange
            const cube = manifold.manifold.shapes.cube(new Inputs.Manifold.CubeDto(true, CUBE_SIZE));
            const prototype = Object.getPrototypeOf(cube) as Manifold3DManifold;
            const calculate = vi.spyOn(prototype, "calculateNormals");
            const release = vi.spyOn(prototype, "delete");

            // Act
            manifold.decomposeManifoldOrCrossSection({ manifoldOrCrossSection: cube, minSharpAngle: 40 });
            const computed: unknown = calculate.mock.results[0]?.value;
            const released = [...release.mock.contexts];
            calculate.mockRestore();
            release.mockRestore();

            // Assert
            expect(computed).toBeDefined();
            expect(released).toContain(computed);
        });

        it("should refuse a sharp angle that is not a finite angle of at least 0", () => {
            // Arrange
            const cube = manifold.manifold.shapes.cube(new Inputs.Manifold.CubeDto(true, CUBE_SIZE));

            // Act & Assert
            expect(() => manifold.decomposeManifoldOrCrossSection({ manifoldOrCrossSection: cube, minSharpAngle: -1 })).toThrow("minSharpAngle must be a finite angle of at least 0 degrees, got -1");
            expect(() => manifold.decomposeManifoldOrCrossSection({ manifoldOrCrossSection: cube, minSharpAngle: Number.NaN })).toThrow(RangeError);
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
            const decomposed = manifold.decomposeManifoldsOrCrossSections({ manifoldsOrCrossSections: [cube, square], minSharpAngle: 40 });

            // Assert
            expect(decomposed).toHaveLength(2);
        });

        it("should pass the sharp angle on to every shape, so each mesh carries its normals", () => {
            // Arrange
            const cube = manifold.manifold.shapes.cube(new Inputs.Manifold.CubeDto(true, CUBE_SIZE));

            // Act
            const [decomposed] = manifold.decomposeManifoldsOrCrossSections({ manifoldsOrCrossSections: [cube], minSharpAngle: 40 }) as Manifold3DMesh[];

            // Assert
            expect(decomposed!.numProp).toBe(6);
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
            const square = manifold.crossSection.shapes.square(new Inputs.Manifold.SquareDto(true, CUBE_SIZE));

            // Act & Assert
            expect(() => manifold.toPolygonPoints({ manifold: square as never }))
                .toThrow("Manifold has no mesh to convert");
        });

        it("should give no polygons for a solid that is empty", () => {
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

        it("should refuse a mesh with fewer than three numbers per vertex", () => {
            // Arrange
            const flat = { getMesh: () => ({ numProp: 2, vertProperties: new Float32Array([0, 0, 1, 0, 0, 1]), triVerts: new Uint32Array([0, 1, 2]) }) };

            // Act & Assert
            expect(() => manifold.toPolygonPoints({ manifold: flat as never }))
                .toThrow("Expected numProp >= 3 (for x, y, z), but found 2");
        });

        it("should refuse triangle indexes that do not come in threes", () => {
            // Arrange
            const torn = { getMesh: () => ({ numProp: 3, vertProperties: new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]), triVerts: new Uint32Array([0, 1, 2, 0]) }) };

            // Act & Assert
            expect(() => manifold.toPolygonPoints({ manifold: torn as never }))
                .toThrow("triVerts length (4) is not a multiple of 3");
        });

        it("should skip a triangle that points past the last vertex and keep the rest", () => {
            // Arrange
            const mesh = { getMesh: () => ({ numProp: 3, vertProperties: new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]), triVerts: new Uint32Array([0, 1, 2, 0, 1, 7]) }) };
            const logged: unknown[] = [];
            const consoleError = console.error;
            console.error = (message: unknown) => { logged.push(message); };

            // Act
            const polygons = manifold.toPolygonPoints({ manifold: mesh as never });
            console.error = consoleError;

            // Assert
            expect(polygons).toEqual([[[0, 0, 0], [1, 0, 0], [0, 1, 0]]]);
            expect(logged).toHaveLength(1);
        });
    });
});
