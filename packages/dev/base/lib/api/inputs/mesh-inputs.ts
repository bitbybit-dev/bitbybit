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
     * Two triangle meshes and how close they may come, for `mesh.meshesWithin`.
     */
    export class MeshesWithinDto {
        constructor(mesh1?: Base.Mesh3, mesh2?: Base.Mesh3, distance?: number) {
            if (mesh1 !== undefined) { this.mesh1 = mesh1; }
            if (mesh2 !== undefined) { this.mesh2 = mesh2; }
            if (distance !== undefined) { this.distance = distance; }
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
         * How close the meshes may come, in model units; 0 asks whether they touch or cross.
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        distance?: number | undefined = 0;
    }
    /**
     * A closed triangle mesh and a point, for `mesh.isPointInside`.
     */
    export class MeshPointDto {
        constructor(mesh?: Base.Mesh3, point?: Base.Point3) {
            if (mesh !== undefined) { this.mesh = mesh; }
            if (point !== undefined) { this.point = point; }
        }
        /**
         * The closed mesh, as a list of triangles.
         * @default undefined
         */
        mesh!: Base.Mesh3;
        /**
         * The point to test.
         * @default undefined
         */
        point!: Base.Point3;
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
    /**
     * Where `mesh.icosphere` puts its sphere, how large it is and how finely it is triangulated.
     */
    export class IcosphereDto {
        constructor(center?: Base.Point3, radius?: number, detail?: number) {
            if (center !== undefined) { this.center = center; }
            if (radius !== undefined) { this.radius = radius; }
            if (detail !== undefined) { this.detail = detail; }
        }
        /**
         * The sphere's center.
         * @default [0, 0, 0]
         */
        center?: Base.Point3 | undefined = [0, 0, 0];
        /**
         * The sphere's radius, in model units.
         * @default 1
         * @minimum 0
         * @exclusiveMinimum true
         * @maximum Infinity
         * @step 0.1
         */
        radius?: number | undefined = 1;
        /**
         * How many times each triangle of the starting icosahedron is split in four, from 0 (20
         * triangles) to 6 (81,920 triangles).
         * @default 2
         * @minimum 0
         * @maximum 6
         * @step 1
         */
        detail?: number | undefined = 2;
    }
    /**
     * The size and the number of sides of the cone or cylinder `mesh.frustum` makes.
     */
    export class FrustumDto {
        constructor(center?: Base.Point3, direction?: Base.Vector3, bottomRadius?: number, topRadius?: number, height?: number, sides?: number) {
            if (center !== undefined) { this.center = center; }
            if (direction !== undefined) { this.direction = direction; }
            if (bottomRadius !== undefined) { this.bottomRadius = bottomRadius; }
            if (topRadius !== undefined) { this.topRadius = topRadius; }
            if (height !== undefined) { this.height = height; }
            if (sides !== undefined) { this.sides = sides; }
        }
        /**
         * The center of the bottom.
         * @default [0, 0, 0]
         */
        center?: Base.Point3 | undefined = [0, 0, 0];
        /**
         * The direction the shape rises in from `center`; its length does not matter.
         * @default [0, 1, 0]
         */
        direction?: Base.Vector3 | undefined = [0, 1, 0];
        /**
         * The radius at the bottom, in model units; 0 makes a point.
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        bottomRadius?: number | undefined = 1;
        /**
         * The radius at the top, in model units; 0 makes a point, the bottom radius a cylinder.
         * @default 0.5
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        topRadius?: number | undefined = 0.5;
        /**
         * How tall the shape is, in model units.
         * @default 2
         * @minimum 0
         * @exclusiveMinimum true
         * @maximum Infinity
         * @step 0.1
         */
        height?: number | undefined = 2;
        /**
         * How many flat sides go around the shape, at least 3.
         * @default 24
         * @minimum 3
         * @maximum Infinity
         * @step 1
         */
        sides?: number | undefined = 24;
    }
    /**
     * A list of triangles and a tolerance for `mesh.toIndexed`.
     */
    export class MeshToIndexedDto {
        constructor(mesh?: Base.Mesh3, tolerance?: number) {
            if (mesh !== undefined) { this.mesh = mesh; }
            if (tolerance !== undefined) { this.tolerance = tolerance; }
        }
        /**
         * The mesh, as a list of triangles.
         * @default undefined
         */
        mesh!: Base.Mesh3;
        /**
         * Corners closer than this in every coordinate, in model units, become one point; 0 joins
         * none.
         * @default 1e-7
         * @minimum 0
         * @maximum Infinity
         * @step 1e-7
         */
        tolerance?: number | undefined = 1e-7;
    }
    /**
     * An indexed mesh for `mesh.fromIndexed`, `mesh.smoothNormals`, `mesh.windingPieces` and
     * `mesh.orientConsistently`.
     */
    export class IndexedMeshDto {
        constructor(mesh?: Base.IndexedMesh) {
            if (mesh !== undefined) { this.mesh = mesh; }
        }
        /**
         * The mesh, with its points stored once and its triangles as point numbers.
         * @default undefined
         */
        mesh!: Base.IndexedMesh;
    }
    /**
     * An indexed mesh and the angle of its sharp edges for `mesh.creasedNormals`.
     */
    export class CreasedNormalsDto {
        constructor(mesh?: Base.IndexedMesh, angle?: number) {
            if (mesh !== undefined) { this.mesh = mesh; }
            if (angle !== undefined) { this.angle = angle; }
        }
        /**
         * The mesh, with its points stored once and its triangles as point numbers.
         * @default undefined
         */
        mesh!: Base.IndexedMesh;
        /**
         * Triangles that turn from each other by more than this, in degrees, keep a sharp edge
         * between them; 0 shades every triangle flat and 180 smooths across every edge.
         * @default 30
         * @minimum 0
         * @maximum 180
         * @step 1
         */
        angle?: number | undefined = 30;
    }
}
