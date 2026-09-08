import { describe, it, expect, beforeAll } from "vitest";
import { getManifold } from "../../__test__/kernel";
import type { ManifoldService } from "../../manifold-service";
import * as Inputs from "../../inputs";

const CUBE_SIZE = 2;
const CUBE_VOLUME = 8;
const CUBE_SURFACE_AREA = 24;
const CUBE_VERTICES = 8;
const CUBE_TRIANGLES = 12;
const GENUS_OF_A_BALL = 0;

const SPHERE_RADIUS = 1;
const SPHERE_SEGMENTS = 128;
const SPHERE_VOLUME_TOLERANCE = 0.01;

const CYLINDER_HEIGHT = 4;
const CYLINDER_RADIUS = 2;
const CYLINDER_SEGMENTS = 256;
const CYLINDER_VOLUME_TOLERANCE = 0.01;

describe("ManifoldShapes", () => {
    let manifold: ManifoldService;

    beforeAll(async () => {
        manifold = await getManifold();
    }, 120_000);

    describe("cube", () => {
        it("should build a cube of the given size with the topology of a ball", () => {
            // Arrange
            const inputs = new Inputs.Manifold.CubeDto(true, CUBE_SIZE);

            // Act
            const cube = manifold.manifold.shapes.cube(inputs);

            // Assert
            const measure = new Inputs.Manifold.ManifoldDto(cube);
            expect(manifold.manifold.evaluate.volume(measure)).toBeCloseTo(CUBE_VOLUME, 6);
            expect(manifold.manifold.evaluate.surfaceArea(measure)).toBeCloseTo(CUBE_SURFACE_AREA, 6);
            expect(manifold.manifold.evaluate.numVert(measure)).toBe(CUBE_VERTICES);
            expect(manifold.manifold.evaluate.numTri(measure)).toBe(CUBE_TRIANGLES);
            expect(manifold.manifold.evaluate.genus(measure)).toBe(GENUS_OF_A_BALL);
        });

        it("should sit on the origin when centred and above it when not", () => {
            // Arrange
            const centred = new Inputs.Manifold.CubeDto(true, CUBE_SIZE);
            const corner = new Inputs.Manifold.CubeDto(false, CUBE_SIZE);

            // Act
            const [centredMin, centredMax] = manifold.manifold.evaluate.boundingBox(new Inputs.Manifold.ManifoldDto(manifold.manifold.shapes.cube(centred))) as [Inputs.Base.Vector3, Inputs.Base.Vector3];
            const [cornerMin, cornerMax] = manifold.manifold.evaluate.boundingBox(new Inputs.Manifold.ManifoldDto(manifold.manifold.shapes.cube(corner))) as [Inputs.Base.Vector3, Inputs.Base.Vector3];

            // Assert
            expect(centredMin).toEqual([-CUBE_SIZE / 2, -CUBE_SIZE / 2, -CUBE_SIZE / 2]);
            expect(centredMax).toEqual([CUBE_SIZE / 2, CUBE_SIZE / 2, CUBE_SIZE / 2]);
            expect(cornerMin).toEqual([0, 0, 0]);
            expect(cornerMax).toEqual([CUBE_SIZE, CUBE_SIZE, CUBE_SIZE]);
        });
    });

    describe("sphere", () => {
        it("should approach the analytic volume of its radius from below", () => {
            // Arrange
            const inputs = new Inputs.Manifold.SphereDto(SPHERE_RADIUS, SPHERE_SEGMENTS);
            const analyticVolume = (4 / 3) * Math.PI * SPHERE_RADIUS ** 3;

            // Act
            const sphere = manifold.manifold.shapes.sphere(inputs);

            // Assert
            const volume = manifold.manifold.evaluate.volume(new Inputs.Manifold.ManifoldDto(sphere));
            expect(volume).toBeLessThan(analyticVolume);
            expect(analyticVolume - volume).toBeLessThan(SPHERE_VOLUME_TOLERANCE);
        });
    });

    describe("cylinder", () => {
        it("should approach the analytic volume and stand the given height", () => {
            // Arrange
            const inputs = new Inputs.Manifold.CylinderDto(CYLINDER_HEIGHT, CYLINDER_RADIUS, CYLINDER_RADIUS, CYLINDER_SEGMENTS, true);
            const analyticVolume = Math.PI * CYLINDER_RADIUS ** 2 * CYLINDER_HEIGHT;

            // Act
            const cylinder = manifold.manifold.shapes.cylinder(inputs);

            // Assert
            const measure = new Inputs.Manifold.ManifoldDto(cylinder);
            const volume = manifold.manifold.evaluate.volume(measure);
            expect(analyticVolume - volume).toBeLessThan(CYLINDER_VOLUME_TOLERANCE);
            const [min, max] = manifold.manifold.evaluate.boundingBox(measure) as [Inputs.Base.Vector3, Inputs.Base.Vector3];
            expect(max[2] - min[2]).toBeCloseTo(CYLINDER_HEIGHT, 6);
        });

        it("should taper to a cone when the top radius is zero", () => {
            // Arrange
            const inputs = new Inputs.Manifold.CylinderDto(CYLINDER_HEIGHT, CYLINDER_RADIUS, 0, CYLINDER_SEGMENTS, true);
            const analyticVolume = (1 / 3) * Math.PI * CYLINDER_RADIUS ** 2 * CYLINDER_HEIGHT;

            // Act
            const cone = manifold.manifold.shapes.cylinder(inputs);

            // Assert
            const volume = manifold.manifold.evaluate.volume(new Inputs.Manifold.ManifoldDto(cone));
            expect(analyticVolume - volume).toBeLessThan(CYLINDER_VOLUME_TOLERANCE);
        });
    });

    describe("tetrahedron", () => {
        it("should build a solid with four triangular faces", () => {
            // Act
            const shape = manifold.manifold.shapes.tetrahedron();

            // Assert
            expect(manifold.manifold.evaluate.numTri(new Inputs.Manifold.ManifoldDto(shape))).toBe(4);
            expect(manifold.manifold.evaluate.volume(new Inputs.Manifold.ManifoldDto(shape))).toBeGreaterThan(0);
        });
    });

    describe("fromPolygonPoints", () => {
        it("should build the solid the polygon points enclose", () => {
            const polygonPoints: Inputs.Base.Point3[][] = [
                [[0, 0, 0], [0, 2, 0], [2, 0, 0]],
                [[0, 0, 0], [2, 0, 0], [0, 0, 2]],
                [[0, 0, 0], [0, 0, 2], [0, 2, 0]],
                [[2, 0, 0], [0, 2, 0], [0, 0, 2]],
            ];

            // Act
            const shape = manifold.manifold.shapes.fromPolygonPoints(new Inputs.Manifold.FromPolygonPointsDto(polygonPoints));

            expect(manifold.manifold.evaluate.volume(new Inputs.Manifold.ManifoldDto(shape))).toBeCloseTo(8 / 6, 5);
        });

        it("should give a shared corner one vertex rather than one per polygon", () => {
            // Arrange
            const polygonPoints: Inputs.Base.Point3[][] = [
                [[0, 0, 0], [0, 2, 0], [2, 0, 0]],
                [[0, 0, 0], [2, 0, 0], [0, 0, 2]],
                [[0, 0, 0], [0, 0, 2], [0, 2, 0]],
                [[2, 0, 0], [0, 2, 0], [0, 0, 2]],
            ];

            // Act
            const shape = manifold.manifold.shapes.fromPolygonPoints(new Inputs.Manifold.FromPolygonPointsDto(polygonPoints));

            // Assert
            expect(manifold.manifold.evaluate.numVert(new Inputs.Manifold.ManifoldDto(shape))).toBe(4);
        });
    });

    describe("manifoldFromMesh", () => {
        it("should rebuild the solid a mesh was taken from", () => {
            // Arrange
            const cube = manifold.manifold.shapes.cube(new Inputs.Manifold.CubeDto(true, CUBE_SIZE));
            const mesh = manifold.manifold.manifoldToMesh(new Inputs.Manifold.ManifoldToMeshDto(cube));

            // Act
            const rebuilt = manifold.manifold.shapes.manifoldFromMesh({ mesh });

            // Assert
            expect(manifold.manifold.evaluate.volume(new Inputs.Manifold.ManifoldDto(rebuilt))).toBeCloseTo(CUBE_VOLUME, 5);
        });
    });

    describe("fromPolygonPoints given data it cannot use", () => {
        it("should skip a polygon that is not a triangle", () => {
            const warned: unknown[] = [];
            const consoleWarn = console.warn;
            console.warn = (message: unknown) => { warned.push(message); };
            const polygonPoints: Inputs.Base.Point3[][] = [
                [[0, 0, 0], [0, 2, 0], [2, 0, 0]],
                [[0, 0, 0], [2, 0, 0], [0, 0, 2]],
                [[0, 0, 0], [0, 0, 2], [0, 2, 0]],
                [[2, 0, 0], [0, 2, 0], [0, 0, 2]],
                [[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0]],
            ];

            // Act
            const shape = manifold.manifold.shapes.fromPolygonPoints(new Inputs.Manifold.FromPolygonPointsDto(polygonPoints));
            console.warn = consoleWarn;

            expect(warned).toHaveLength(1);
            expect(manifold.manifold.evaluate.volume(new Inputs.Manifold.ManifoldDto(shape))).toBeCloseTo(8 / 6, 5);
        });

        it("should refuse a point that is not a point at all", () => {
            // Arrange
            const consoleWarn = console.warn;
            console.warn = () => undefined;
            const polygonPoints = [[[0, 0, 0], [0, 2, 0], [Number.NaN, 0, 0]]] as Inputs.Base.Point3[][];

            // Act & Assert
            expect(() => manifold.manifold.shapes.fromPolygonPoints(new Inputs.Manifold.FromPolygonPointsDto(polygonPoints)))
                .toThrow("Invalid point data encountered");
            console.warn = consoleWarn;
        });
    });

    describe("manifoldsToMeshes", () => {
        it("should turn every solid it was given into a mesh", () => {
            // Arrange
            const cube = manifold.manifold.shapes.cube(new Inputs.Manifold.CubeDto(true, CUBE_SIZE));

            // Act
            const meshes = manifold.manifold.manifoldsToMeshes(new Inputs.Manifold.ManifoldsToMeshesDto([cube, cube]));

            // Assert
            expect(meshes).toHaveLength(2);
            expect(manifold.mesh.evaluate.numTri(new Inputs.Manifold.MeshDto(meshes[0]))).toBe(CUBE_TRIANGLES);
        });

        it("should hand each solid the normal channel that lines up with it", () => {
            // Arrange
            const cube = manifold.manifold.shapes.cube(new Inputs.Manifold.CubeDto(true, CUBE_SIZE));
            const withNormals = manifold.manifold.operations.calculateNormals(new Inputs.Manifold.CalculateNormalsDto(cube, 3, 60));

            // Act
            const meshes = manifold.manifold.manifoldsToMeshes(new Inputs.Manifold.ManifoldsToMeshesDto([withNormals], [3]));

            // Assert
            expect(manifold.mesh.evaluate.numProp(new Inputs.Manifold.MeshDto(meshes[0]))).toBeGreaterThan(3);
        });
    });
});
