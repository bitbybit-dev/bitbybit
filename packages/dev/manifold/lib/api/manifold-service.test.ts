import type { Base } from "@bitbybit-dev/base";
import type { Mesh as Manifold3DMesh } from "manifold-3d";
import { describe, it, expect, beforeAll } from "vitest";
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

        it("should give a moved and turned solid normals that face the way its faces do", () => {
            // Arrange
            const square = manifold.crossSection.shapes.square(new Inputs.Manifold.SquareDto(false, 1));
            const box = manifold.crossSection.operations.extrude({ crossSection: square, height: 2 });
            const moved = manifold.manifold.transforms.transform({ manifold: box, transform: [0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 1, 0, 10, 0, 0, 1] });
            const turned = manifold.manifold.transforms.rotate({ manifold: moved, vector: [30, 0, 0] });

            // Act
            const decomposed = manifold.decomposeManifoldOrCrossSection({ manifoldOrCrossSection: turned, minSharpAngle: 40 }) as Manifold3DMesh;

            // Assert
            const position = (vertex: number): number[] => [0, 1, 2].map((axis) => decomposed.vertProperties[vertex * 6 + axis]!);
            const agreements: number[] = [];
            for (let at = 0; at < decomposed.triVerts.length; at += 3) {
                const [a, b, c] = [0, 1, 2].map((corner) => position(decomposed.triVerts[at + corner]!)) as [number[], number[], number[]];
                const u = [b[0]! - a[0]!, b[1]! - a[1]!, b[2]! - a[2]!];
                const v = [c[0]! - a[0]!, c[1]! - a[1]!, c[2]! - a[2]!];
                const face = [u[1]! * v[2]! - u[2]! * v[1]!, u[2]! * v[0]! - u[0]! * v[2]!, u[0]! * v[1]! - u[1]! * v[0]!];
                for (let corner = 0; corner < 3; corner++) {
                    const vertex = decomposed.triVerts[at + corner]!;
                    const normal = [3, 4, 5].map((channel) => decomposed.vertProperties[vertex * 6 + channel]!);
                    agreements.push((face[0]! * normal[0]! + face[1]! * normal[1]! + face[2]! * normal[2]!) / Math.hypot(...face));
                }
            }
            expect(decomposed.numProp).toBe(6);
            expect(Math.min(...agreements)).toBeCloseTo(1, 5);
        });

        it("should give a thin slab built from a recipe and turned upright one normal per face, each facing out", () => {
            // Arrange
            const recipe: Base.Recipe = {
                format: "bitbybit.recipe", version: 1, millimetresPerUnit: 1, tolerance: 0.001,
                buffers: { f64: new Float64Array([11, -0.4, 14.6, -0.4, 14.6, 8.8, 11, 8.8]), i32: new Int32Array(0) },
                nodes: [{ op: "polygon", points: [0, 8], holes: [] }, { op: "extrude", profile: 0, direction: [0, 0, 1], depth: 0.04 }],
                roots: [{ node: 1, matrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 3.24, 1], tag: {} }],
            };
            const [slab] = manifold.recipes.build({ recipe, adjustZtoY: true });

            // Act
            const decomposed = manifold.decomposeManifoldOrCrossSection({ manifoldOrCrossSection: slab!, minSharpAngle: 40 }) as Manifold3DMesh;

            // Assert
            const centre = [12.8, 3.26, -4.2];
            const outward = Array.from({ length: decomposed.vertProperties.length / 6 }, (_, vertex) => {
                const at = vertex * 6;
                const offset = [0, 1, 2].map((axis) => decomposed.vertProperties[at + axis]! - centre[axis]!);
                return offset[0]! * decomposed.vertProperties[at + 3]! + offset[1]! * decomposed.vertProperties[at + 4]! + offset[2]! * decomposed.vertProperties[at + 5]!;
            });
            expect(decomposed.vertProperties.length / 6).toBe(24);
            expect(Math.min(...outward)).toBeGreaterThan(0);
        });

        it("should read the positions of a solid that carries other values per vertex, giving it fresh normals", () => {
            // Arrange
            const cube = manifold.manifold.shapes.cube(new Inputs.Manifold.CubeDto(true, CUBE_SIZE));
            const carrying = cube.calculateNormals(0, 90);

            // Act
            const decomposed = manifold.decomposeManifoldOrCrossSection({ manifoldOrCrossSection: carrying, minSharpAngle: 40 }) as Manifold3DMesh;

            // Assert
            const corners = new Set(Array.from({ length: decomposed.vertProperties.length / 6 }, (_, vertex) => [0, 1, 2].map((axis) => decomposed.vertProperties[vertex * 6 + axis]).join(",")));
            expect(carrying.getMesh().numProp).toBe(6);
            expect(decomposed.vertProperties.length / 6).toBe(24);
            expect(corners.size).toBe(8);
            expect([...corners].every((corner) => corner.split(",").every((value) => Math.abs(Math.abs(Number(value)) - CUBE_SIZE / 2) < 1e-6))).toBe(true);
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
