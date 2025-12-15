import { GeometryHelper } from "./geometry-helper";
import { MathBitByBit } from "./math";
import { Point } from "./point";
import { Polyline } from "./polyline";
import { Transforms } from "./transforms";
import { Vector } from "./vector";
import * as Inputs from "../inputs";
import { MeshBitByBit } from "./mesh";
import { TOLERANCE, UnitTestHelper } from "../unit-test-helper";
import { Line } from "./line";
import { Lists } from "./lists";

describe("Mesh unit tests", () => {
    const uh = new UnitTestHelper();

    let geometryHelper: GeometryHelper;
    let math: MathBitByBit;
    let vector: Vector;
    let transforms: Transforms;
    let point: Point;
    let line: Line;
    let lists: Lists;
    let polyline: Polyline;
    let meshBitByBit: MeshBitByBit;


    beforeAll(() => {
        geometryHelper = new GeometryHelper();
        math = new MathBitByBit();
        vector = new Vector(math, geometryHelper);
        transforms = new Transforms(vector, math);
        lists = new Lists();
        point = new Point(geometryHelper, transforms, vector, lists);
        line = new Line(vector, point, geometryHelper);
        polyline = new Polyline(vector, point, line, geometryHelper);
        meshBitByBit = new MeshBitByBit(vector, polyline);
    });

    // Simple plane definitions
    const xyPlane: Inputs.Base.TrianglePlane3 = { normal: [0, 0, 1], d: 0 }; // Z=0 plane
    const xyPlaneOffset: Inputs.Base.TrianglePlane3 = { normal: [0, 0, 1], d: 5 }; // Z=5 plane
    const slantedPlane: Inputs.Base.TrianglePlane3 = { normal: uh.vector.normalized({ vector: [1, 1, 1] }) as Inputs.Base.Vector3, d: 0 }; // X+Y+Z=0 plane through origin

    // Simple triangles
    const triXY1: Inputs.Base.Triangle3 = [[0, 0, 0], [1, 0, 0], [0, 1, 0]]; // On XY plane, normal ~[0,0,1]
    const triXY2: Inputs.Base.Triangle3 = [[2, 0, 0], [3, 0, 0], [2, 1, 0]]; // On XY plane, normal ~[0,0,1]
    const triXYOffset: Inputs.Base.Triangle3 = [[0, 0, 5], [1, 0, 5], [0, 1, 5]]; // On Z=5 plane, normal ~[0,0,1]
    const triXZ: Inputs.Base.Triangle3 = [[0, 0, 0], [1, 0, 0], [0, 0, 1]]; // On XZ plane, normal ~[0,-1,0]
    const triSlanted: Inputs.Base.Triangle3 = [[1, 0, 0], [0, 1, 0], [0, 0, 1]]; // On X+Y+Z=1 plane
    const triDegenerateCollinear: Inputs.Base.Triangle3 = [[0, 0, 0], [1, 1, 1], [2, 2, 2]];
    const triDegenerateCoincident: Inputs.Base.Triangle3 = [[0, 0, 0], [0, 0, 0], [1, 1, 1]];

    describe("signedDistanceToPlane", () => {
        it("should return 0 for a point on the plane", () => {
            const p: Inputs.Base.Point3 = [10, 20, 0];
            const dist = meshBitByBit.signedDistanceToPlane({ point: p, plane: xyPlane });
            expect(dist).toBeCloseTo(0, TOLERANCE);
        });

        it("should return positive distance for point on normal side", () => {
            const p: Inputs.Base.Point3 = [5, 5, 3];
            const dist = meshBitByBit.signedDistanceToPlane({ point: p, plane: xyPlane });
            expect(dist).toBeCloseTo(3, TOLERANCE);
        });

        it("should return negative distance for point on opposite side", () => {
            const p: Inputs.Base.Point3 = [5, 5, -2];
            const dist = meshBitByBit.signedDistanceToPlane({ point: p, plane: xyPlane });
            expect(dist).toBeCloseTo(-2, TOLERANCE);
        });

        it("should work for offset planes", () => {
            const p: Inputs.Base.Point3 = [1, 1, 7];
            const dist = meshBitByBit.signedDistanceToPlane({ point: p, plane: xyPlaneOffset });
            expect(dist).toBeCloseTo(2, TOLERANCE);
        });

        it("should work for slanted planes", () => {
            const p: Inputs.Base.Point3 = [1, 1, 1];
            const dist = meshBitByBit.signedDistanceToPlane({ point: p, plane: slantedPlane });
            expect(dist).toBeCloseTo(Math.sqrt(3), TOLERANCE);
        });
    });

    describe("calculateTrianglePlane", () => {
        it("should calculate plane for simple XY triangle", () => {
            const plane = meshBitByBit.calculateTrianglePlane({ triangle: triXY1 });
            uh.expectPlaneCloseTo(plane, xyPlane);
        });

        it("should calculate plane for offset XY triangle", () => {
            const plane = meshBitByBit.calculateTrianglePlane({ triangle: triXYOffset });
            uh.expectPlaneCloseTo(plane, xyPlaneOffset);
        });

        it("should calculate plane for XZ triangle", () => {
            const plane = meshBitByBit.calculateTrianglePlane({ triangle: triXZ });
            const expectedPlane: Inputs.Base.TrianglePlane3 = { normal: [0, -1, 0], d: 0 };
            uh.expectPlaneCloseTo(plane, expectedPlane);
        });

        it("should calculate plane for slanted triangle", () => {
            const plane = meshBitByBit.calculateTrianglePlane({ triangle: triSlanted });
            const expectedNormal = vector.normalized({ vector: [1, 1, 1] }) as Inputs.Base.Vector3;
            const expectedD = vector.dot({ first: expectedNormal, second: [1, 0, 0] });
            const expectedPlane: Inputs.Base.TrianglePlane3 = { normal: expectedNormal, d: expectedD };
            uh.expectPlaneCloseTo(plane, expectedPlane);
        });

        it("should return undefined for degenerate collinear triangle", () => {
            const plane = meshBitByBit.calculateTrianglePlane({ triangle: triDegenerateCollinear });
            expect(plane).toBeUndefined();
        });

        it("should return undefined for degenerate coincident triangle", () => {
            const plane = meshBitByBit.calculateTrianglePlane({ triangle: triDegenerateCoincident });
            expect(plane).toBeUndefined();
        });

        it("should return undefined for triangle degenerate within tolerance", () => {
            const tolerance = 1e-7;
            const smallDist = tolerance * 0.1; // Make it smaller than tolerance
            const triDegenWithinTol: Inputs.Base.Triangle3 = [[0, 0, 0], [1, 0, 0], [2, smallDist, 0]];
            const planeDegen = meshBitByBit.calculateTrianglePlane({ triangle: triDegenWithinTol, tolerance: tolerance });
            expect(planeDegen).toBeUndefined(); // Expect undefined because it IS degenerate within tolerance
        });

        it("should calculate plane for triangle near-degenerate but outside tolerance", () => {
            const tolerance = 1e-7;
            const deviation = tolerance;
            const triBarelyValid: Inputs.Base.Triangle3 = [[0, 0, 0], [1, 0, 0], [2, deviation, 0]];
            const plane = meshBitByBit.calculateTrianglePlane({ triangle: triBarelyValid, tolerance: tolerance });

            expect(plane).toBeDefined();
            if (plane) {
                const normalMagnitude = Math.sign(plane.normal[2]);
                uh.expectPointCloseTo(plane.normal, [0, 0, 1 * normalMagnitude]);
                expect(plane.d).toBeCloseTo(0, TOLERANCE);
            }
        });

        it("should return undefined for the second degenerate case within tolerance", () => {
            const degenTol = 1e-3;
            const triDegenWithinTol2: Inputs.Base.Triangle3 = [[0, 0, 0], [1, 0, 0], [2, degenTol * 0.1, 0]];
            const planeDegen = meshBitByBit.calculateTrianglePlane({ triangle: triDegenWithinTol2, tolerance: degenTol });
            expect(planeDegen).toBeUndefined();
        });
    });

    describe("triangleTriangleIntersection", () => {
        it("should return undefined for far-apart triangles", () => {
            const triFar: Inputs.Base.Triangle3 = [[10, 10, 10], [11, 10, 10], [10, 11, 10]];
            const result = meshBitByBit.triangleTriangleIntersection({ triangle1: triXY1, triangle2: triFar });
            expect(result).toBeUndefined();
        });

        it("should return undefined for parallel, non-coplanar triangles", () => {
            const result = meshBitByBit.triangleTriangleIntersection({ triangle1: triXY1, triangle2: triXYOffset });
            expect(result).toBeUndefined();
        });

        it("should return undefined if one triangle is fully \"above\" the others plane", () => {
            const triPlaneSep: Inputs.Base.Triangle3 = [[-1, 0, 0], [-1, 1, 0], [-1, 0, 1]];
            const triPositiveX: Inputs.Base.Triangle3 = [[1, 0, 0], [1, 1, 0], [1, 0, 1]];
            const result = meshBitByBit.triangleTriangleIntersection({ triangle1: triPlaneSep, triangle2: triPositiveX });
            expect(result).toBeUndefined();
        });

        it("should return undefined for coplanar triangles (explicitly not handled)", () => {
            const result = meshBitByBit.triangleTriangleIntersection({ triangle1: triXY1, triangle2: triXY2 });
            expect(result).toBeUndefined();
        });

        it("should return undefined for degenerate input triangles", () => {
            const result1 = meshBitByBit.triangleTriangleIntersection({ triangle1: triDegenerateCollinear, triangle2: triXY1 });
            const result2 = meshBitByBit.triangleTriangleIntersection({ triangle1: triXY1, triangle2: triDegenerateCoincident });
            expect(result1).toBeUndefined();
            expect(result2).toBeUndefined();
        });

        it("should return undefined for triangles touching at an edge", () => {
            const triTouchingEdge: Inputs.Base.Triangle3 = [[1, 0, 0], [1, 1, 0], [0, 0, 0]];
            const result = meshBitByBit.triangleTriangleIntersection({ triangle1: triXY1, triangle2: triTouchingEdge });
            expect(result).toBeUndefined();
        });

        it("should return undefined for triangles touching at a vertex", () => {
            const triTouchingVertex: Inputs.Base.Triangle3 = [[0, 0, 0], [-1, 0, 0], [0, -1, 0]];
            const result = meshBitByBit.triangleTriangleIntersection({ triangle1: triXY1, triangle2: triTouchingVertex });
            expect(result).toBeUndefined();
        });

        it("should return correct segment for simple orthogonal intersection (XY and XZ)", () => {
            const expectedSegment: Inputs.Base.Segment3 = [[0, 0, 0], [1, 0, 0]];
            const result = meshBitByBit.triangleTriangleIntersection({ triangle1: triXY1, triangle2: triXZ });
            uh.expectSegmentCloseTo(result, expectedSegment);
        });

        it("should return correct segment for shifted orthogonal intersection", () => {
            const triXZ_Shifted: Inputs.Base.Triangle3 = [[0.5, 0, 0], [1.5, 0, 0], [0.5, 0, 1]]; // Y=0 plane, X from 0.5 to 1.5
            const expectedSegment: Inputs.Base.Segment3 = [[0.5, 0, 0], [1.0, 0, 0]];
            const result = meshBitByBit.triangleTriangleIntersection({ triangle1: triXY1, triangle2: triXZ_Shifted });
            uh.expectSegmentCloseTo(result, expectedSegment);
        });

        it("should return correct segment for piercing intersection", () => {
            const triPiercing: Inputs.Base.Triangle3 = [[1, -1, -1], [1, 1, 1], [1, 3, -1]]; // On X=1 plane
            const expectedSegment: Inputs.Base.Segment3 = [[1, 0, 0], [1, 1, 0]];
            const result = meshBitByBit.triangleTriangleIntersection({ triangle1: [[0, 0, 0], [2, 0, 0], [0, 2, 0]], triangle2: triPiercing });
            uh.expectSegmentCloseTo(result, expectedSegment);
        });

    });

    // Cube 1 centered at origin, side 2 (-1 to 1)
    const cube1Tris: Inputs.Base.Triangle3[] = [
        [[1, -1, -1], [1, 1, -1], [1, 1, 1]], [[1, -1, -1], [1, 1, 1], [1, -1, 1]],
        [[-1, -1, -1], [-1, -1, 1], [-1, 1, 1]], [[-1, -1, -1], [-1, 1, 1], [-1, 1, -1]],
        [[-1, -1, 1], [1, -1, 1], [1, 1, 1]], [[-1, -1, 1], [1, 1, 1], [-1, 1, 1]],
        [[-1, -1, -1], [-1, 1, -1], [1, 1, -1]], [[-1, -1, -1], [1, 1, -1], [1, -1, -1]],
        [[-1, 1, -1], [-1, 1, 1], [1, 1, 1]], [[-1, 1, -1], [1, 1, 1], [1, 1, -1]],
        [[-1, -1, -1], [1, -1, -1], [1, -1, 1]], [[-1, -1, -1], [1, -1, 1], [-1, -1, 1]],
    ];
    // Cube 2 centered at (1.5, 0, 0), side 2 (0.5 to 2.5) - Intersects cube1
    const cube2Tris: Inputs.Base.Triangle3[] = cube1Tris.map(tri => tri.map(p => [p[0] + 1.5, p[1], p[2]]) as Inputs.Base.Triangle3);
    // Non-intersecting cube
    const cube3Tris: Inputs.Base.Triangle3[] = cube1Tris.map(tri => tri.map(p => [p[0] + 5, p[1], p[2]]) as Inputs.Base.Triangle3);

    describe("meshMeshIntersectionSegments", () => {


        it("should return an empty array for non-intersecting meshes", () => {
            const result = meshBitByBit.meshMeshIntersectionSegments({ mesh1: cube1Tris, mesh2: cube3Tris, tolerance: TOLERANCE });
            expect(result).toEqual([]);
        });

        it("should return intersection segments for intersecting meshes", () => {
            const result = meshBitByBit.meshMeshIntersectionSegments({ mesh1: cube1Tris, mesh2: cube2Tris });
            expect(result.length).toBe(24);
        });

        it("should handle empty mesh inputs", () => {
            const result1 = meshBitByBit.meshMeshIntersectionSegments({ mesh1: [], mesh2: cube2Tris });
            const result2 = meshBitByBit.meshMeshIntersectionSegments({ mesh1: cube1Tris, mesh2: [] });
            const result3 = meshBitByBit.meshMeshIntersectionSegments({ mesh1: [], mesh2: [] });
            expect(result1).toEqual([]);
            expect(result2).toEqual([]);
            expect(result3).toEqual([]);
        });
    });
    describe("meshMeshIntersectionPolylines", () => {
        const intersectionTolerance = 1e-6;

        it("should return an empty array for non-intersecting meshes", () => {
            const result = meshBitByBit.meshMeshIntersectionPolylines({ mesh1: cube1Tris, mesh2: cube3Tris, tolerance: intersectionTolerance });
            expect(result).toEqual([]);
        });

        it("should return intersection polylines for intersecting meshes", () => {
            const result = meshBitByBit.meshMeshIntersectionPolylines({ mesh1: cube1Tris, mesh2: cube2Tris });
            expect(result.length).toBe(4);
        });

        it("should handle empty mesh inputs", () => {
            const result1 = meshBitByBit.meshMeshIntersectionPolylines({ mesh1: [], mesh2: cube2Tris, tolerance: intersectionTolerance });
            const result2 = meshBitByBit.meshMeshIntersectionPolylines({ mesh1: cube1Tris, mesh2: [], tolerance: intersectionTolerance });
            const result3 = meshBitByBit.meshMeshIntersectionPolylines({ mesh1: [], mesh2: [], tolerance: intersectionTolerance });
            expect(result1).toEqual([]);
            expect(result2).toEqual([]);
            expect(result3).toEqual([]);
        });

    });

    describe("meshMeshIntersectionPoints", () => {
        const intersectionTolerance = 1e-6;

        it("should return an empty array for non-intersecting meshes", () => {
            const result = meshBitByBit.meshMeshIntersectionPoints({ mesh1: cube1Tris, mesh2: cube3Tris, tolerance: intersectionTolerance });
            expect(result).toEqual([]);
        });

        it("should return intersection points for intersecting meshes", () => {
            const result = meshBitByBit.meshMeshIntersectionPoints({ mesh1: cube1Tris, mesh2: cube2Tris });
            // Should return 4 polylines worth of points (same as polylines count)
            expect(result.length).toBe(4);
            expect(result).toEqual([
                [
                    [1, -0.5, -1],
                    [1, 1, -1],
                    [1, 1, -0.5],
                    [1, 1, 1],
                    [1, -0.5, 1],
                    [1, -1, 1],
                    [1, -1, -0.5],
                    [1, -1, -1],
                    [1, -0.5, -1]
                ],
                [
                    [0.5, 0.5, 1], [0.5, -1, 1],
                    [1, -1, 1], [0.5, -1, 1],
                    [0.5, -1, 0.5], [0.5, -1, -1],
                    [0.5, 0.5, -1], [0.5, 1, -1],
                    [1, 1, -1], [0.5, 1, -1],
                    [0.5, 1, 0.5], [0.5, 1, 1],
                    [0.5, 0.5, 1]
                ],
                [[1, 1, 1], [0.5, 1, 1], [1, 1, 1]],
                [[1, -1, -1], [0.5, -1, -1], [1, -1, -1]]
            ]);
        });

        it("should return arrays of points for each polyline", () => {
            const result = meshBitByBit.meshMeshIntersectionPoints({ mesh1: cube1Tris, mesh2: cube2Tris });
            // Each element should be an array of points
            result.forEach(pointArray => {
                expect(Array.isArray(pointArray)).toBe(true);
                expect(pointArray.length).toBeGreaterThan(0);
                // Each point should be a 3D coordinate
                pointArray.forEach(point => {
                    expect(point.length).toBe(3);
                    expect(typeof point[0]).toBe("number");
                    expect(typeof point[1]).toBe("number");
                    expect(typeof point[2]).toBe("number");
                });
            });
        });

        it("should include closing point for closed polylines", () => {
            const result = meshBitByBit.meshMeshIntersectionPoints({ mesh1: cube1Tris, mesh2: cube2Tris });
            // For closed polylines, first and last point should be the same
            result.forEach(pointArray => {
                if (pointArray.length > 1) {
                    const firstPoint = pointArray[0];
                    const lastPoint = pointArray[pointArray.length - 1];
                    // Check if the polyline is closed (first equals last)
                    const isClosed =
                        Math.abs(firstPoint[0] - lastPoint[0]) < intersectionTolerance &&
                        Math.abs(firstPoint[1] - lastPoint[1]) < intersectionTolerance &&
                        Math.abs(firstPoint[2] - lastPoint[2]) < intersectionTolerance;
                    // Cube-cube intersection should produce closed loops
                    expect(isClosed).toBe(true);
                }
            });
        });

        it("should handle empty mesh inputs", () => {
            const result1 = meshBitByBit.meshMeshIntersectionPoints({ mesh1: [], mesh2: cube2Tris, tolerance: intersectionTolerance });
            const result2 = meshBitByBit.meshMeshIntersectionPoints({ mesh1: cube1Tris, mesh2: [], tolerance: intersectionTolerance });
            const result3 = meshBitByBit.meshMeshIntersectionPoints({ mesh1: [], mesh2: [], tolerance: intersectionTolerance });
            expect(result1).toEqual([]);
            expect(result2).toEqual([]);
            expect(result3).toEqual([]);
        });

        it("should return points that lie on intersection plane X=0.5", () => {
            const result = meshBitByBit.meshMeshIntersectionPoints({ mesh1: cube1Tris, mesh2: cube2Tris });
            // Cube1 is from -1 to 1, Cube2 is from 0.5 to 2.5
            // Intersection should be at X=0.5 or X=1 depending on the faces
            result.forEach(pointArray => {
                pointArray.forEach(point => {
                    // Points should be at X=0.5 (left face of cube2) or X=1 (right face of cube1)
                    const xIsValid = Math.abs(point[0] - 0.5) < 0.01 || Math.abs(point[0] - 1) < 0.01;
                    expect(xIsValid).toBe(true);
                });
            });
        });

        it("should return points within the Y and Z bounds of both cubes", () => {
            const result = meshBitByBit.meshMeshIntersectionPoints({ mesh1: cube1Tris, mesh2: cube2Tris });
            result.forEach(pointArray => {
                pointArray.forEach(point => {
                    // Y and Z should be within [-1, 1] range (shared by both cubes)
                    expect(point[1]).toBeGreaterThanOrEqual(-1 - intersectionTolerance);
                    expect(point[1]).toBeLessThanOrEqual(1 + intersectionTolerance);
                    expect(point[2]).toBeGreaterThanOrEqual(-1 - intersectionTolerance);
                    expect(point[2]).toBeLessThanOrEqual(1 + intersectionTolerance);
                });
            });
        });

        it("should produce more points than polylines (due to closing point)", () => {
            const polylines = meshBitByBit.meshMeshIntersectionPolylines({ mesh1: cube1Tris, mesh2: cube2Tris });
            const points = meshBitByBit.meshMeshIntersectionPoints({ mesh1: cube1Tris, mesh2: cube2Tris });

            expect(points.length).toBe(polylines.length);

            // For closed polylines, points array should have one more point than polyline.points
            for (let i = 0; i < polylines.length; i++) {
                if (polylines[i].isClosed) {
                    expect(points[i].length).toBe(polylines[i].points.length + 1);
                } else {
                    expect(points[i].length).toBe(polylines[i].points.length);
                }
            }
        });

        it("should handle single triangle meshes that intersect", () => {
            const singleTri1: Inputs.Base.Triangle3[] = [[[0, 0, 0], [2, 0, 0], [0, 2, 0]]]; // XY plane
            const singleTri2: Inputs.Base.Triangle3[] = [[[0, 0, 0], [2, 0, 0], [0, 0, 2]]]; // XZ plane
            const result = meshBitByBit.meshMeshIntersectionPoints({ mesh1: singleTri1, mesh2: singleTri2 });
            expect(result.length).toBe(1);
            expect(result[0].length).toBe(2); // Open polyline with 2 points
        });

        it("should return points as valid 3D coordinates", () => {
            const result = meshBitByBit.meshMeshIntersectionPoints({ mesh1: cube1Tris, mesh2: cube2Tris });
            result.forEach(pointArray => {
                pointArray.forEach(point => {
                    expect(Number.isFinite(point[0])).toBe(true);
                    expect(Number.isFinite(point[1])).toBe(true);
                    expect(Number.isFinite(point[2])).toBe(true);
                    expect(Number.isNaN(point[0])).toBe(false);
                    expect(Number.isNaN(point[1])).toBe(false);
                    expect(Number.isNaN(point[2])).toBe(false);
                });
            });
        });
    });
});

