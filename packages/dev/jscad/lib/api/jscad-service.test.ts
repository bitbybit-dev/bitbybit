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
const CUBE_TRIANGLES = 12;
const SHIFT_X = 10;
const IDENTITY_MATRIX: Inputs.Base.TransformMatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
const TRANSLATE_X_MATRIX: Inputs.Base.TransformMatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, SHIFT_X, 0, 0, 1];
const IDENTITY: Inputs.Base.TransformMatrixes = [IDENTITY_MATRIX];
const TRANSLATE_X: Inputs.Base.TransformMatrixes = [TRANSLATE_X_MATRIX];


const meshData = (positions: number[], indices: number[]): Inputs.JSCAD.JSCADMeshData => ({
    positions,
    indices,
    normals: [],
    transforms: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
});

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

        it("should carry one unit normal for every position, which the declared type promises", () => {
            // Arrange
            const inputs = new Inputs.JSCAD.MeshDto(cube);

            // Act
            const mesh = jscad.shapeToMesh(inputs);

            // Assert
            expect(mesh.normals).toHaveLength(mesh.positions.length);
            const lengths = [];
            for (let i = 0; i < mesh.normals.length; i += COORDINATES_PER_POINT) {
                const x = mesh.normals[i]!, y = mesh.normals[i + 1]!, z = mesh.normals[i + 2]!;
                lengths.push(Math.sqrt(x * x + y * y + z * z));
            }
            lengths.forEach(length => expect(length).toBeCloseTo(1));
        });

        it("should point a cube's normals along the axes its faces face", () => {
            // Arrange
            const inputs = new Inputs.JSCAD.MeshDto(cube);

            // Act
            const mesh = jscad.shapeToMesh(inputs);

            // Assert
            const distinct = new Set<string>();
            for (let i = 0; i < mesh.normals.length; i += COORDINATES_PER_POINT) {
                distinct.add([mesh.normals[i]!, mesh.normals[i + 1]!, mesh.normals[i + 2]!]
                    .map(component => Math.round(component)).join(","));
            }
            expect([...distinct].sort()).toStrictEqual([
                "-1,0,0", "0,-1,0", "0,0,-1", "0,0,1", "0,1,0", "1,0,0",
            ]);
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
            const inputs = new Inputs.JSCAD.TransformSolidDto(cube, TRANSLATE_X_MATRIX as unknown as Inputs.Base.TransformMatrixes);

            // Act
            const moved = jscad.transformSolid(inputs);

            // Assert
            expect(kernel.measurements.measureCenter(moved)).toEqual([SHIFT_X, 0, 0]);
        });

        it("should apply every matrix in a list, in order", () => {
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

    describe("toPolygonPoints of mesh data holding no triangles", () => {
        let reading: Jscad;

        beforeAll(async () => {
            const loaded = await getJscad();
            reading = Object.create(loaded.jscad) as Jscad;
        });

        const readingBack = (positions: number[], indices: number[]): Jscad => {
            reading.shapeToMesh = () => meshData(positions, indices);
            return reading;
        };

        it("should give no points for mesh data holding no triangles", () => {
            expect(readingBack([0, 0, 0, 1, 1, 1, 2, 2, 2], []).toPolygonPoints({ mesh: cube })).toEqual([]);
        });

    });

    describe("shapeToMesh of a two dimensional shape", () => {
        it("should give it a thickness so that it has polygons at all", () => {
            // Arrange
            const circle = jscad.polygon.circle(new Inputs.JSCAD.CircleDto([0, 0], 1, 16));

            // Act
            const mesh = jscad.shapeToMesh({ mesh: circle });

            // Assert
            expect(mesh.positions.length).toBeGreaterThan(0);
            expect(mesh.indices.length % 3).toBe(0);
        });
    });

    describe("the download serialisers", () => {
        it("should write a solid as a binary stl blob", () => {
            // Act
            const { blob } = jscad.downloadSolidSTL(new Inputs.JSCAD.DownloadSolidDto(cube, "part"));

            // Assert
            expect(blob.type).toBe("application/sla");
            expect(blob.size).toBeGreaterThan(0);
        });

        it("should write several solids into one stl blob", () => {
            // Act
            const { blob } = jscad.downloadSolidsSTL(new Inputs.JSCAD.DownloadSolidsDto([cube, cube], "parts"));

            // Assert
            expect(blob.size).toBeGreaterThan(0);
        });

        it("should write a geometry as a dxf blob", () => {
            // Arrange
            const circle = jscad.polygon.circle(new Inputs.JSCAD.CircleDto([0, 0], 1, 16));

            // Act
            const { blob } = jscad.downloadGeometryDxf(new Inputs.JSCAD.DownloadGeometryDto(circle, "drawing"));

            // Assert
            expect(blob.size).toBeGreaterThan(0);
        });

        it("should write a geometry as a 3mf blob", () => {
            // Act
            const { blob } = jscad.downloadGeometry3MF(new Inputs.JSCAD.DownloadGeometryDto(cube, "part"));

            // Assert
            expect(blob.size).toBeGreaterThan(0);
        });
    });

    describe("the shapes an operation cannot take", () => {
        it("should say which operation wanted a solid when given a flat shape", () => {
            // Arrange
            const circle = jscad.polygon.circle(new Inputs.JSCAD.CircleDto([0, 0], 1, 16));

            // Act & Assert
            expect(() => jscad.transformSolid({ mesh: circle, transformation: IDENTITY }))
                .toThrow("transformSolid needs a 3D solid, but was given a 2D geometry or a path.");
        });
    });

    describe("a geometry in the shape the first version of JSCAD handed back", () => {
        it("should read its polygons through the method it carries", () => {
            const triangle: Inputs.JSCAD.JSCADPoly3 = { vertices: [[0, 0, 0], [1, 0, 0], [0, 1, 0]] };
            const legacy = Object.assign(jscad.path.createEmpty(), { toPolygons: () => [triangle] });

            // Act
            const mesh = jscad.shapeToMesh({ mesh: legacy });

            // Assert
            expect(mesh.positions).toEqual([0, 0, 0, 1, 0, 0, 0, 1, 0]);
        });
    });

    describe("the serialisers, given options of their own", () => {
        it("should hand the dxf serialiser the options it was given", () => {
            // Act
            const { blob } = jscad.downloadGeometryDxf(
                new Inputs.JSCAD.DownloadGeometryDto(jscad.polygon.circle(new Inputs.JSCAD.CircleDto([0, 0], 1, 16)), "drawing", { unit: "mm" }));

            // Assert
            expect(blob.size).toBeGreaterThan(0);
        });

        it("should hand the 3mf serialiser the options it was given", () => {
            // Act
            const { blob } = jscad.downloadGeometry3MF(new Inputs.JSCAD.DownloadGeometryDto(cube, "part", { unit: "millimeter" }));

            // Assert
            expect(blob.size).toBeGreaterThan(0);
        });
    });
});
