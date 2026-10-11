/* eslint-disable @typescript-eslint/no-namespace */
import type { Base } from "./base-inputs";


/**
 * Parameters for polygonal mesh geometry: vertex, index and normal data, the options for building and
 * inspecting a mesh, and the settings that control conversion between the mesh representations the
 * different kernels and the renderer expect.
 */
export namespace Mesh {
    /**
     * A point and a plane for `mesh.signedDistanceToPlane`.
     */
    export class SignedDistanceFromPlaneToPointDto {
        constructor(point?: Base.Point3, plane?: Base.TrianglePlane3) {
            if (point !== undefined) { this.point = point; }
            if (plane !== undefined) { this.plane = plane; }
        }
        /**
         * The point to measure from.
         * @default undefined
         */
        point!: Base.Point3;
        /**
         * The plane as a unit normal and its distance from the origin along that normal, such as
         * `calculateTrianglePlane` gives.
         * @default undefined
         */
        plane!: Base.TrianglePlane3;
    }

    /**
     * One triangle as three points, for methods that read it.
     */
    export class TriangleDto {
        constructor(triangle?: Base.Triangle3) {
            if (triangle !== undefined) { this.triangle = triangle; }
        }
        /**
         * The triangle as three points.
         * @default undefined
         */
        triangle!: Base.Triangle3;
    }
    /**
     * A triangle and a tolerance for `mesh.calculateTrianglePlane`.
     */
    export class TriangleToleranceDto {
        constructor(triangle?: Base.Triangle3) {
            if (triangle !== undefined) { this.triangle = triangle; }
        }
        /**
         * The triangle as three points.
         * @default undefined
         */
        triangle!: Base.Triangle3;
        /**
         * A triangle whose normal is shorter than this counts as having no area.
         * @default 1e-7
         * @minimum 0
         * @maximum Infinity
         * @step 1e-7
         */
        tolerance?: number | undefined = 1e-7;
    }

    /**
     * Two triangles and a tolerance for `mesh.triangleTriangleIntersection`.
     */
    export class TriangleTriangleToleranceDto {
        constructor(triangle1?: Base.Triangle3, triangle2?: Base.Triangle3, tolerance?: number) {
            if (triangle1 !== undefined) { this.triangle1 = triangle1; }
            if (triangle2 !== undefined) { this.triangle2 = triangle2; }
            if (tolerance !== undefined) { this.tolerance = tolerance; }
        }
        /**
         * The first triangle as three points.
         * @default undefined
         */
        triangle1!: Base.Triangle3;
        /**
         * The second triangle as three points.
         * @default undefined
         */
        triangle2!: Base.Triangle3;
        /**
         * Distances below this, in model units, count as zero when deciding whether the triangles
         * touch.
         * @default 1e-7
         * @minimum 0
         * @maximum Infinity
         * @step 1e-7
         */
        tolerance?: number | undefined = 1e-7;
    }
    /**
     * Two meshes and a tolerance for `mesh.meshMeshIntersectionSegments`,
     * `mesh.meshMeshIntersectionPolylines` and `mesh.meshMeshIntersectionPoints`.
     */
    export class MeshMeshToleranceDto {
        constructor(mesh1?: Base.Mesh3, mesh2?: Base.Mesh3, tolerance?: number) {
            if (mesh1 !== undefined) { this.mesh1 = mesh1; }
            if (mesh2 !== undefined) { this.mesh2 = mesh2; }
            if (tolerance !== undefined) { this.tolerance = tolerance; }
        }
        /**
         * The first mesh, as a list of triangles.
         * @default undefined
         */
        mesh1!: Base.Mesh3;
        /**
         * The second mesh, as a list of triangles.
         * @default undefined
         */
        mesh2!: Base.Mesh3;
        /**
         * Distances below this, in model units, count as zero: when deciding whether triangles
         * touch and when joining segment ends into polylines.
         * @default 1e-7
         * @minimum 0
         * @maximum Infinity
         * @step 1e-7
         */
        tolerance?: number | undefined = 1e-7;
    }
    /**
     * A flat outline and the holes cut through it, for `mesh.triangulatePolygon`.
     */
    export class PolygonWithHolesDto {
        constructor(points?: Base.Point3[], holes?: Base.Point3[][]) {
            if (points !== undefined) { this.points = points; }
            if (holes !== undefined) { this.holes = holes; }
        }
        /**
         * The corners of the outline in order, all in one plane; the last need not repeat the first.
         * @default undefined
         */
        points!: Base.Point3[];
        /**
         * The holes, each a list of corners in the outline's plane and inside the outline.
         * @default undefined
         * @optional true
         */
        holes?: Base.Point3[][] | undefined;
    }
    /**
     * A triangle mesh, for `mesh.signedVolume` and other methods that read one.
     */
    export class MeshDto {
        constructor(mesh?: Base.Mesh3) {
            if (mesh !== undefined) { this.mesh = mesh; }
        }
        /**
         * The mesh, as a list of triangles.
         * @default undefined
         */
        mesh!: Base.Mesh3;
    }
}
