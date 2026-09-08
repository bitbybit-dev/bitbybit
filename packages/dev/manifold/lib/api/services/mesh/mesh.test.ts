import { describe, it, expect, beforeAll } from "vitest";
import { getManifold } from "../../__test__/kernel";
import type { ManifoldService } from "../../manifold-service";
import type * as Manifold3D from "manifold-3d";
import * as Inputs from "../../inputs";

const CUBE_SIZE = 2;
const CUBE_TRIANGLES = 12;
const CUBE_VERTICES = 8;
const COORDINATES_PER_POINT = 3;
const POINTS_PER_TRIANGLE = 3;

describe("the mesh services", () => {
    let manifold: ManifoldService;
    let mesh: Manifold3D.Mesh;

    beforeAll(async () => {
        manifold = await getManifold();
        const cube = manifold.manifold.shapes.cube(new Inputs.Manifold.CubeDto(true, CUBE_SIZE));
        mesh = manifold.manifold.manifoldToMesh(new Inputs.Manifold.ManifoldToMeshDto(cube));
    }, 120_000);

    describe("numProp", () => {
        it("should report the three coordinates each vertex carries", () => {
            expect(manifold.mesh.evaluate.numProp(new Inputs.Manifold.MeshDto(mesh))).toBe(COORDINATES_PER_POINT);
        });
    });

    describe("numVert", () => {
        it("should report the eight corners of a cube", () => {
            expect(manifold.mesh.evaluate.numVert(new Inputs.Manifold.MeshDto(mesh))).toBe(CUBE_VERTICES);
        });
    });

    describe("numTri", () => {
        it("should report two triangles per face of a cube", () => {
            expect(manifold.mesh.evaluate.numTri(new Inputs.Manifold.MeshDto(mesh))).toBe(CUBE_TRIANGLES);
        });
    });

    describe("numRun", () => {
        it("should report the single run a cube built from one primitive has", () => {
            expect(manifold.mesh.evaluate.numRun(new Inputs.Manifold.MeshDto(mesh))).toBe(1);
        });
    });

    describe("position", () => {
        it("should give a corner of the cube for a vertex of it", () => {
            // Act
            const position = manifold.mesh.evaluate.position(new Inputs.Manifold.MeshVertexIndexDto(mesh, 0));

            expect(position.map(Math.abs)).toEqual([1, 1, 1]);
        });
    });

    describe("verts", () => {
        it("should give the three vertices a triangle is built from", () => {
            // Act
            const verts = manifold.mesh.evaluate.verts(new Inputs.Manifold.MeshTriangleIndexDto(mesh, 0));

            // Assert
            expect(verts).toHaveLength(POINTS_PER_TRIANGLE);
            expect(new Set(verts).size).toBe(POINTS_PER_TRIANGLE);
        });
    });

    describe("extras", () => {
        it("should give the property channels beyond the position of a vertex", () => {
            // Act
            const extras = manifold.mesh.evaluate.extras(new Inputs.Manifold.MeshVertexIndexDto(mesh, 0));

            expect(extras).toEqual([]);
        });
    });

    describe("transform", () => {
        it("should read the placement of a run out of the mesh's own window on it", () => {
            // Act
            const transform = manifold.mesh.evaluate.transform(new Inputs.Manifold.MeshTriangleRunIndexDto(mesh, 0));

            // Assert
            expect(transform.filter((value) => value !== undefined)).toEqual([1]);
        });
    });

    describe("merge", () => {
        it("should report that a mesh with no split vertices needed no merging", () => {
            expect(manifold.mesh.operations.merge(new Inputs.Manifold.MeshDto(mesh))).toBe(false);
        });
    });

    describe("tangent", () => {
        it("should read the tangent of a half edge out of the mesh's window on it", () => {
            // Act
            const tangent = manifold.mesh.evaluate.tangent(new Inputs.Manifold.MeshHalfEdgeIndexDto(mesh, 0));

            // Assert
            expect(tangent).toHaveLength(4);
        });
    });
});
