import * as Inputs from "../inputs";
import { Polyline } from "./polyline";
import { Vector } from "./vector";

/**
 * Geometry on plain triangle meshes: a mesh is a list of triangles, each three points. The methods
 * here work out the plane of a triangle, the distance from a point to a plane, and where two meshes
 * cut through each other, as segments, as polylines or as point lists. They need no CAD kernel, so
 * they run on any triangulated data.
 */
export class MeshBitByBit {
    constructor(private readonly vector: Vector, private readonly polyline: Polyline) { }

    /**
     * Measures how far a point is from a plane, with a sign: positive on the side the normal points
     * to, negative on the other.
     *
     * Example: point [0,5,0] and the XZ plane with normal [0,1,0] -> 5
     * @param inputs - The point and the plane
     * @returns The signed distance in model units
     * @group base
     * @shortname signed dist to plane
     * @drawable false
     * @example
     * ```typescript
     * const above = bitbybit.mesh.signedDistanceToPlane({ point: [0, 5, 0], plane: { normal: [0, 1, 0], d: 0 } });
     * ```
     */
    signedDistanceToPlane(inputs: Inputs.Mesh.SignedDistanceFromPlaneToPointDto): number {
        return this.vector.dot({ first: inputs.plane.normal, second: inputs.point }) - inputs.plane.d;
    }

    /**
     * Finds the plane a triangle lies in: its unit normal and its distance from the origin along
     * that normal.
     *
     * The normal follows the right-hand rule around the triangle's points. A triangle with no area,
     * whose points are on one line, has no plane and gives undefined.
     * Example: [[0,0,0], [1,0,0], [0,1,0]] -> { normal: [0,0,1], d: 0 }
     * @param inputs - The triangle and the tolerance below which its area counts as zero
     * @returns The plane, or undefined for a flat triangle
     * @group traingle
     * @shortname triangle plane
     * @drawable false
     * @example
     * ```typescript
     * const plane = bitbybit.mesh.calculateTrianglePlane({ triangle: [[0, 0, 0], [1, 0, 0], [0, 1, 0]], tolerance: 1e-7 });
     * ```
     */
    calculateTrianglePlane(inputs: Inputs.Mesh.TriangleToleranceDto): Inputs.Base.TrianglePlane3 | undefined {
        const EPSILON_SQ = (inputs.tolerance || 1e-7) ** 2;

        const edge1 = this.vector.sub({ first: inputs.triangle[1], second: inputs.triangle[0] });
        const edge2 = this.vector.sub({ first: inputs.triangle[2], second: inputs.triangle[0] });
        const normal = this.vector.cross({ first: edge1, second: edge2 });

        if (this.vector.lengthSq({ vector: normal as Inputs.Base.Vector3 }) < EPSILON_SQ) {
            return undefined;
        }

        const normalizedNormal = this.vector.normalized({ vector: normal }) as Inputs.Base.Vector3;
        const d = this.vector.dot({ first: normalizedNormal, second: inputs.triangle[0] });
        return { normal: normalizedNormal, d: d };
    }

    /**
     * Finds the segment where two triangles cut through each other.
     *
     * Triangles that do not touch, are parallel, or lie in the same plane give undefined.
     * Example: a triangle in the XY plane and one standing across it -> the segment where they
     * cross
     * @param inputs - The two triangles and the tolerance
     * @returns The crossing segment, or undefined when there is none
     * @group traingle
     * @shortname triangle-triangle int
     * @drawable false
     * @example
     * ```typescript
     * const cut = bitbybit.mesh.triangleTriangleIntersection({
     *     triangle1: [[0, 0, 0], [2, 0, 0], [1, 2, 0]],
     *     triangle2: [[1, -1, 1], [1, 1, 1], [1, 1, -1]],
     *     tolerance: 1e-7,
     * });
     * ```
     */
    triangleTriangleIntersection(inputs: Inputs.Mesh.TriangleTriangleToleranceDto): Inputs.Base.Segment3 | undefined {
        const t1 = inputs.triangle1;
        const t2 = inputs.triangle2;
        const EPSILON = inputs.tolerance || 1e-7;
        const p1 = t1[0], p2 = t1[1], p3 = t1[2];
        const q1 = t2[0], q2 = t2[1], q3 = t2[2];

        const plane1 = this.calculateTrianglePlane({ triangle: t1, tolerance: EPSILON });
        const plane2 = this.calculateTrianglePlane({ triangle: t2, tolerance: EPSILON });

        if (!plane1 || !plane2) return undefined;

        const distQ_Plane1: [number, number, number] = [
            this.signedDistanceToPlane({ point: q1, plane: plane1 }),
            this.signedDistanceToPlane({ point: q2, plane: plane1 }),
            this.signedDistanceToPlane({ point: q3, plane: plane1 }),
        ];

        if ((distQ_Plane1[0] > EPSILON && distQ_Plane1[1] > EPSILON && distQ_Plane1[2] > EPSILON) ||
            (distQ_Plane1[0] < -EPSILON && distQ_Plane1[1] < -EPSILON && distQ_Plane1[2] < -EPSILON)) {
            return undefined;
        }

        const distP_Plane2: [number, number, number] = [
            this.signedDistanceToPlane({ point: p1, plane: plane2 }),
            this.signedDistanceToPlane({ point: p2, plane: plane2 }),
            this.signedDistanceToPlane({ point: p3, plane: plane2 }),
        ];

        if ((distP_Plane2[0] > EPSILON && distP_Plane2[1] > EPSILON && distP_Plane2[2] > EPSILON) ||
            (distP_Plane2[0] < -EPSILON && distP_Plane2[1] < -EPSILON && distP_Plane2[2] < -EPSILON)) {
            return undefined;
        }

        const allDistPZero = distP_Plane2.every(d => Math.abs(d) < EPSILON);
        const allDistQZero = distQ_Plane1.every(d => Math.abs(d) < EPSILON);

        if (allDistPZero && allDistQZero) {
            return undefined;
        }

        const lineDir = this.vector.cross({ first: plane1.normal, second: plane2.normal }) as Inputs.Base.Vector3;
        const det = this.vector.dot({ first: lineDir, second: lineDir });

        if (det < EPSILON * EPSILON) {
            return undefined;
        }

        const t1_intersection_points_3d: Inputs.Base.Point3[] = [];
        const t2_intersection_points_3d: Inputs.Base.Point3[] = [];

        const edges1: Inputs.Base.Segment3[] = [[p1, p2], [p2, p3], [p3, p1]];
        const dists1 = distP_Plane2;
        for (let i = 0; i < 3; ++i) {
            const u = edges1[i]![0];
            const v = edges1[i]![1];
            const du = dists1[i]!;
            const dv = dists1[(i + 1) % 3]!;

            if (Math.abs(du) < EPSILON) t1_intersection_points_3d.push(u);

            if ((du * dv) < 0 && Math.abs(du - dv) > EPSILON) {
                const t = du / (du - dv);
                t1_intersection_points_3d.push(this.computeIntersectionPoint(u, v, t));
            }
        }

        const edges2: Inputs.Base.Segment3[] = [[q1, q2], [q2, q3], [q3, q1]];
        const dists2 = distQ_Plane1;
        for (let i = 0; i < 3; ++i) {
            const u = edges2[i]![0];
            const v = edges2[i]![1];
            const du = dists2[i]!;
            const dv = dists2[(i + 1) % 3]!;

            if (Math.abs(du) < EPSILON) t2_intersection_points_3d.push(u);

            if ((du * dv) < 0 && Math.abs(du - dv) > EPSILON) {
                const t = du / (du - dv);
                t2_intersection_points_3d.push(this.computeIntersectionPoint(u, v, t));
            }
        }

        if (t1_intersection_points_3d.length < 2 || t2_intersection_points_3d.length < 2) {
            return undefined;
        }

        const n1 = plane1.normal;
        const n2 = plane2.normal;
        const d1 = plane1.d;
        const d2 = plane2.d;
        const term1 = this.vector.mul({ vector: n2, scalar: d1 });
        const term2 = this.vector.mul({ vector: n1, scalar: d2 });
        const termSub = this.vector.sub({ first: term1, second: term2 });
        const crossTerm = this.vector.cross({ first: termSub, second: lineDir });
        const lineOrigin = this.vector.mul({ vector: crossTerm, scalar: 1.0 / det }) as Inputs.Base.Point3;


        const t1_params = t1_intersection_points_3d.map(p =>
            this.vector.dot({ first: this.vector.sub({ first: p, second: lineOrigin }), second: lineDir })
        );
        const t2_params = t2_intersection_points_3d.map(p =>
            this.vector.dot({ first: this.vector.sub({ first: p, second: lineOrigin }), second: lineDir })
        );

        const t1Interval: [number, number] = [Math.min(...t1_params), Math.max(...t1_params)];
        const t2Interval: [number, number] = [Math.min(...t2_params), Math.max(...t2_params)];

        const intersectionMinParam = Math.max(t1Interval[0], t2Interval[0]);
        const intersectionMaxParam = Math.min(t1Interval[1], t2Interval[1]);

        if (intersectionMinParam < intersectionMaxParam - (EPSILON * det)) {
            const point1 = this.vector.add({ first: lineOrigin, second: this.vector.mul({ vector: lineDir, scalar: intersectionMinParam / det }) }) as Inputs.Base.Point3;
            const point2 = this.vector.add({ first: lineOrigin, second: this.vector.mul({ vector: lineDir, scalar: intersectionMaxParam / det }) }) as Inputs.Base.Point3;

            const segVec = this.vector.sub({ first: point1, second: point2 });
            if (this.vector.lengthSq({ vector: segVec as Inputs.Base.Vector3 }) > EPSILON * EPSILON) {
                return [point1, point2];
            } else {
                return undefined;
            }
        } else {
            return undefined;
        }
    }

    /**
     * Finds every segment where the surfaces of two meshes cut through each other, testing each
     * triangle of one against each triangle of the other.
     *
     * Example: a cube mesh and a sphere mesh -> the segments that together trace their intersection
     * curve
     * @param inputs - The two meshes and the tolerance
     * @returns The crossing segments, in no particular order
     * @group mesh
     * @shortname mesh-mesh int segments
     * @drawable false
     * @example
     * ```typescript
     * const segments = bitbybit.mesh.meshMeshIntersectionSegments({ mesh1: cubeTriangles, mesh2: sphereTriangles, tolerance: 1e-7 });
     * ```
     */
    meshMeshIntersectionSegments(inputs: Inputs.Mesh.MeshMeshToleranceDto): Inputs.Base.Segment3[] {
        const mesh1 = inputs.mesh1;
        const mesh2 = inputs.mesh2;
        const intersectionSegments: Inputs.Base.Segment3[] = [];

        for (let i = 0; i < mesh1.length; ++i) {
            for (let j = 0; j < mesh2.length; ++j) {
                const triangle1 = mesh1[i]!;
                const triangle2 = mesh2[j]!;

                const segment = this.triangleTriangleIntersection({ triangle1, triangle2, tolerance: inputs.tolerance });

                if (segment) {
                    intersectionSegments.push(segment);
                }
            }
        }

        return intersectionSegments;
    }

    /**
     * Finds where the surfaces of two meshes cut through each other and joins the pieces into
     * polylines, closed where the curve loops.
     *
     * Example: a cube mesh and a sphere mesh -> closed polylines where the two surfaces meet
     * @param inputs - The two meshes and the tolerance
     * @returns The intersection curves as polylines
     * @group mesh
     * @shortname mesh-mesh int polylines
     * @drawable true
     * @example
     * ```typescript
     * const curves = bitbybit.mesh.meshMeshIntersectionPolylines({ mesh1: cubeTriangles, mesh2: sphereTriangles, tolerance: 1e-7 });
     * ```
     */
    meshMeshIntersectionPolylines(inputs: Inputs.Mesh.MeshMeshToleranceDto): Inputs.Base.Polyline3[] {
        const segments = this.meshMeshIntersectionSegments(inputs);
        return this.polyline.sortSegmentsIntoPolylines({ segments, tolerance: inputs.tolerance });
    }

    /**
     * Finds where the surfaces of two meshes cut through each other, as one list of points per
     * curve.
     *
     * A closed curve repeats its first point at the end so the loop is explicit.
     * Example: a cube mesh and a sphere mesh -> point lists tracing where the two surfaces meet
     * @param inputs - The two meshes and the tolerance
     * @returns One point list per intersection curve
     * @group mesh
     * @shortname mesh-mesh int points
     * @drawable false
     * @example
     * ```typescript
     * const curves = bitbybit.mesh.meshMeshIntersectionPoints({ mesh1: cubeTriangles, mesh2: sphereTriangles, tolerance: 1e-7 });
     * ```
     */
    meshMeshIntersectionPoints(inputs: Inputs.Mesh.MeshMeshToleranceDto): Inputs.Base.Point3[][] {
        const polylines = this.meshMeshIntersectionPolylines(inputs);
        return polylines.map(polyline => {
            if(polyline.isClosed){
                return [...polyline.points, polyline.points[0]!];
            } else {
                return polyline.points;
            }
        });
    }

    private computeIntersectionPoint(u: Inputs.Base.Point3, v: Inputs.Base.Point3, t: number) {
        return this.vector.add(
            {
                first: u,
                second: this.vector.mul({
                    vector: this.vector.sub({
                        first: v,
                        second: u
                    }),
                    scalar: t
                })
            }) as Inputs.Base.Point3;
    }
}
