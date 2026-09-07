import { describe, it, expect, beforeAll } from "vitest";
import type * as Modeling from "@jscad/modeling";
import { expectSolid, getJscad } from "./__test__/kernel";
import type { Jscad } from "./jscad-service";
import * as Inputs from "./inputs";

const ORIGIN: Inputs.Base.Point3 = [0, 0, 0];
const CUBE_SIDE = 2;
const CUBE_VOLUME = 8;
const CUBE_FACES = 6;
const COORDINATES_PER_POINT = 3;
const POINTS_PER_TRIANGLE = 3;
// Each of the six square faces becomes two triangles.
const CUBE_TRIANGLES = 12;
const SHIFT_X = 10;
const IDENTITY_MATRIX: Inputs.Base.TransformMatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
const TRANSLATE_X_MATRIX: Inputs.Base.TransformMatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, SHIFT_X, 0, 0, 1];
const IDENTITY: Inputs.Base.TransformMatrixes = [IDENTITY_MATRIX];
const TRANSLATE_X: Inputs.Base.TransformMatrixes = [TRANSLATE_X_MATRIX];

describe("Jscad", () => {
    let jscad: Jscad;
    let kernel: typeof Modeling;
    let cube: Inputs.JSCAD.JSCADEntity;

    beforeAll(async () => {
        ({ jscad, kernel } = await getJscad());
        cube = jscad.shapes.cube(new Inputs.JSCAD.CubeDto(ORIGIN, CUBE_SIDE));
    });

    describe("shapeToMesh", () => {
        it("should triangulate a cube into position and index arrays that agree", () => {
            // Arrange
            const inputs = new Inputs.JSCAD.MeshDto(cube);

            // Act
            const mesh = jscad.shapeToMesh(inputs);

            // Assert
            expect(mesh.positions.length % COORDINATES_PER_POINT).toBe(0);
            expect(mesh.indices).toHaveLength(CUBE_TRIANGLES * POINTS_PER_TRIANGLE);
            expect(mesh.positions).toHaveLength(CUBE_TRIANGLES * POINTS_PER_TRIANGLE * COORDINATES_PER_POINT);
            const highestIndex = Math.max(...mesh.indices);
            expect(highestIndex).toBeLessThan(mesh.positions.length / COORDINATES_PER_POINT);
        });
    });

    describe("shapesToMeshes", () => {
        it("should return one mesh per shape", () => {
            // Arrange
            const second = jscad.shapes.cube(new Inputs.JSCAD.CubeDto([SHIFT_X, 0, 0], CUBE_SIDE));
            const inputs = new Inputs.JSCAD.MeshesDto([cube, second]);

            // Act
            const meshes = jscad.shapesToMeshes(inputs);

            // Assert
            expect(meshes).toHaveLength(2);
            for (const mesh of meshes) expect(mesh.indices).toHaveLength(CUBE_TRIANGLES * POINTS_PER_TRIANGLE);
        });
    });

    describe("toPolygonPoints", () => {
        it("should return one triple of points per triangle", () => {
            // Arrange
            const inputs = new Inputs.JSCAD.MeshDto(cube);

            // Act
            const polygons = jscad.toPolygonPoints(inputs);

            // Assert
            expect(polygons).toHaveLength(CUBE_TRIANGLES);
            for (const triangle of polygons) {
                expect(triangle).toHaveLength(POINTS_PER_TRIANGLE);
                for (const point of triangle) expect(point).toHaveLength(COORDINATES_PER_POINT);
            }
        });

        it("should return nothing for a mesh with no polygons", () => {
            // Arrange
            const inputs = new Inputs.JSCAD.MeshDto({ polygons: [] } as unknown as Inputs.JSCAD.JSCADEntity);

            // Act
            const polygons = jscad.toPolygonPoints(inputs);

            // Assert
            expect(polygons).toHaveLength(0);
        });
    });

    describe("transformSolid", () => {
        it("should move a solid without changing its volume", () => {
            // Arrange
            const inputs = new Inputs.JSCAD.TransformSolidDto(cube, TRANSLATE_X);

            // Act
            const moved = jscad.transformSolid(inputs);

            // Assert
            expect(kernel.measurements.measureVolume(moved)).toBeCloseTo(CUBE_VOLUME, 6);
            expect(kernel.measurements.measureCenter(moved)).toEqual([SHIFT_X, 0, 0]);
        });

        it("should leave a solid where it is under the identity", () => {
            // Arrange
            const inputs = new Inputs.JSCAD.TransformSolidDto(cube, IDENTITY);

            // Act
            const unmoved = expectSolid(jscad.transformSolid(inputs));

            // Assert
            expect(kernel.measurements.measureCenter(unmoved)).toEqual(ORIGIN);
            expect(unmoved.polygons).toHaveLength(CUBE_FACES);
        });
    });

    describe("transformSolid, in each shape it accepts", () => {
        it("should apply a single matrix given on its own", () => {
            // Arrange - a bare matrix, rather than a list of them
            const inputs = new Inputs.JSCAD.TransformSolidDto(cube, TRANSLATE_X_MATRIX as unknown as Inputs.Base.TransformMatrixes);

            // Act
            const moved = jscad.transformSolid(inputs);

            // Assert
            expect(kernel.measurements.measureCenter(moved)).toEqual([SHIFT_X, 0, 0]);
        });

        it("should apply every matrix in a list, in order", () => {
            // Arrange - translating twice by the same matrix lands at twice the distance
            const inputs = new Inputs.JSCAD.TransformSolidDto(cube, [TRANSLATE_X_MATRIX, TRANSLATE_X_MATRIX]);

            // Act
            const moved = jscad.transformSolid(inputs);

            // Assert
            expect(kernel.measurements.measureCenter(moved)).toEqual([2 * SHIFT_X, 0, 0]);
        });

        it("should flatten a list of lists of matrices", () => {
            // Arrange
            const nested = [[TRANSLATE_X_MATRIX], [TRANSLATE_X_MATRIX]] as unknown as Inputs.Base.TransformMatrixes;
            const inputs = new Inputs.JSCAD.TransformSolidDto(cube, nested);

            // Act
            const moved = jscad.transformSolid(inputs);

            // Assert
            expect(kernel.measurements.measureCenter(moved)).toEqual([2 * SHIFT_X, 0, 0]);
        });
    });

    describe("transformSolids", () => {
        it("should apply the same transform to every solid", () => {
            // Arrange
            const second = jscad.shapes.cube(new Inputs.JSCAD.CubeDto([0, SHIFT_X, 0], CUBE_SIDE));
            const inputs = new Inputs.JSCAD.TransformSolidsDto([cube, second], TRANSLATE_X);

            // Act
            const moved = jscad.transformSolids(inputs);

            // Assert
            expect(moved).toHaveLength(2);
            expect(kernel.measurements.measureCenter(expectSolid(moved[0]!))).toEqual([SHIFT_X, 0, 0]);
            expect(kernel.measurements.measureCenter(expectSolid(moved[1]!))).toEqual([SHIFT_X, SHIFT_X, 0]);
        });
    });
});
