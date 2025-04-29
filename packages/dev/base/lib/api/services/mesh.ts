import * as Inputs from "../inputs";
import { Polyline } from "./polyline";
import { Vector } from "./vector";

/**
 * Contains various mesh helper methods that are not necessarily present in higher level CAD kernels that bitbybit is using.
 */
export class MeshBitByBit {
    constructor(private readonly vector: Vector, private readonly polyline: Polyline) { }

    /**
     * Computes the signed distance from a point to a plane.
     * @param inputs a point and a plane
     * @returns signed distance
     * @group base
     * @shortname signed dist to plane
     * @drawable false
     */
    signedDistanceToPlane(inputs: Inputs.Mesh.SignedDistanceFromPlaneToPointDto): number {
        return this.vector.dot({ first: inputs.plane.normal, second: inputs.point }) - inputs.plane.d;
    }

    /**
     * Calculates the triangle plane from triangle.
     * @param inputs triangle and tolerance
     * @returns triangle plane
     * @group traingle
     * @shortname triangle plane
     * @drawable false
     */
    calculateTrianglePlane(inputs: Inputs.Mesh.TriangleToleranceDto): Inputs.Base.TrianglePlane3 | undefined {
        const EPSILON_SQ = (inputs.tolerance || 1e-7) ** 2;

        const edge1 = this.vector.sub({ first: inputs.triangle[1], second: inputs.triangle[0] });
        const edge2 = this.vector.sub({ first: inputs.triangle[2], second: inputs.triangle[0] });
        const normal = this.vector.cross({ first: edge1, second: edge2 });

        if (this.vector.lengthSq({ vector: normal as Inputs.Base.Vector3 }) < EPSILON_SQ) {
            return undefined; // Degenerate triangle
        }

        // Defensive copy if normalize modifies in-place, otherwise remove .slice()
        const normalizedNormal = this.vector.normalized({ vector: normal }) as Inputs.Base.Vector3;
        const d = this.vector.dot({ first: normalizedNormal, second: inputs.triangle[0] });
        return { normal: normalizedNormal, d: d };
    }

    /**
     * Calculates the intersection of two triangles.
     * @param inputs first triangle, second triangle, and tolerance
     * @returns intersection segment or undefined if no intersection
     * @group traingle
     * @shortname triangle-triangle int
     * @drawable false
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

        const distQ_Plane1 = [
            this.signedDistanceToPlane({ point: q1, plane: plane1 }),
            this.signedDistanceToPlane({ point: q2, plane: plane1 }),
            this.signedDistanceToPlane({ point: q3, plane: plane1 }),
        ];

        if ((distQ_Plane1[0] > EPSILON && distQ_Plane1[1] > EPSILON && distQ_Plane1[2] > EPSILON) ||
            (distQ_Plane1[0] < -EPSILON && distQ_Plane1[1] < -EPSILON && distQ_Plane1[2] < -EPSILON)) {
            return undefined;
        }

        const distP_Plane2 = [
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
            // console.warn("Coplanar case detected, not handled.");
            return undefined; // Explicitly not handling coplanar intersection areas
        }

        const lineDir = this.vector.cross({ first: plane1.normal, second: plane2.normal }) as Inputs.Base.Vector3;
        const det = this.vector.dot({ first: lineDir, second: lineDir }); // det = |lineDir|^2

        if (det < EPSILON * EPSILON) {
            // console.warn("Planes are parallel or near parallel.");
            return undefined; // Planes parallel, no line intersection (coplanar case handled above)
        }

        // --- Calculate Interval Projections ---

        // Store the 3D points that define the intervals on the line
        const t1_intersection_points_3d: Inputs.Base.Point3[] = [];
        const t2_intersection_points_3d: Inputs.Base.Point3[] = [];

        const edges1: Inputs.Base.Segment3[] = [[p1, p2], [p2, p3], [p3, p1]];
        const dists1 = distP_Plane2;
        for (let i = 0; i < 3; ++i) {
            const u = edges1[i][0];
            const v = edges1[i][1];
            const du = dists1[i];
            const dv = dists1[(i + 1) % 3];

            if (Math.abs(du) < EPSILON) t1_intersection_points_3d.push(u); // Start vertex is on plane2
            // Removed the redundant check for dv here, handled by next edge start

            if ((du * dv) < 0 && Math.abs(du - dv) > EPSILON) { // Edge crosses plane2
                const t = du / (du - dv);
                t1_intersection_points_3d.push(this.computeIntersectionPoint(u, v, t));
            }
        }

        const edges2: Inputs.Base.Segment3[] = [[q1, q2], [q2, q3], [q3, q1]];
        const dists2 = distQ_Plane1;
        for (let i = 0; i < 3; ++i) {
            const u = edges2[i][0];
            const v = edges2[i][1];
            const du = dists2[i];
            const dv = dists2[(i + 1) % 3];

            if (Math.abs(du) < EPSILON) t2_intersection_points_3d.push(u); // Start vertex is on plane1
            // Removed redundant check for dv

            if ((du * dv) < 0 && Math.abs(du - dv) > EPSILON) { // Edge crosses plane1
                const t = du / (du - dv);
                t2_intersection_points_3d.push(this.computeIntersectionPoint(u, v, t));
            }
        }

        // We expect exactly two points for each triangle in the standard piercing case.
        // Handle potential duplicates or edge cases if more points are generated (e.g., edge lies on plane)
        // A simple check for the common case:
        if (t1_intersection_points_3d.length < 2 || t2_intersection_points_3d.length < 2) {
            // This can happen if triangles touch at a vertex or edge without crossing planes,
            // or due to numerical precision near edges/vertices.
            // console.log("Intersection appears to be edge/vertex contact or numerical issue.");
            return undefined; // Treat touch as no intersection segment for now
        }

        // Calculate a robust origin ON the intersection line
        const n1 = plane1.normal;
        const n2 = plane2.normal;
        const d1 = plane1.d;
        const d2 = plane2.d;
        // Point P = ( (d1 * N2 - d2 * N1) x D ) / (D dot D)
        const term1 = this.vector.mul({ vector: n2, scalar: d1 });
        const term2 = this.vector.mul({ vector: n1, scalar: d2 });
        const termSub = this.vector.sub({ first: term1, second: term2 });
        const crossTerm = this.vector.cross({ first: termSub, second: lineDir });
        const lineOrigin = this.vector.mul({ vector: crossTerm, scalar: 1.0 / det }) as Inputs.Base.Point3;


        // Project the 3D intersection points onto the lineDir, relative to lineOrigin
        // param = dot(point - lineOrigin, lineDir)
        const t1_params = t1_intersection_points_3d.map(p =>
            this.vector.dot({ first: this.vector.sub({ first: p, second: lineOrigin }), second: lineDir })
        );
        const t2_params = t2_intersection_points_3d.map(p =>
            this.vector.dot({ first: this.vector.sub({ first: p, second: lineOrigin }), second: lineDir })
        );

        // Find the intervals
        const t1Interval = [Math.min(...t1_params), Math.max(...t1_params)];
        const t2Interval = [Math.min(...t2_params), Math.max(...t2_params)];

        // Find the overlap of the two intervals
        const intersectionMinParam = Math.max(t1Interval[0], t2Interval[0]);
        const intersectionMaxParam = Math.min(t1Interval[1], t2Interval[1]);

        // Check if the overlap is valid
        if (intersectionMinParam < intersectionMaxParam - (EPSILON * det)) { // Let's use scaled epsilon for robustness against small det values.
            // Convert the final parameters back to 3D points using the lineOrigin
            // P = lineOrigin + dir * (param / det)
            const point1 = this.vector.add({ first: lineOrigin, second: this.vector.mul({ vector: lineDir, scalar: intersectionMinParam / det }) }) as Inputs.Base.Point3;
            const point2 = this.vector.add({ first: lineOrigin, second: this.vector.mul({ vector: lineDir, scalar: intersectionMaxParam / det }) }) as Inputs.Base.Point3;

            // Check if the resulting segment has non-zero length
            const segVec = this.vector.sub({ first: point1, second: point2 });
            if (this.vector.lengthSq({ vector: segVec as Inputs.Base.Vector3 }) > EPSILON * EPSILON) {
                return [point1, point2];
            } else {
                return undefined; // Degenerate segment
            }
        } else {
            return undefined; // Intervals do not overlap
        }
    }

    /**
     * Computes the intersection segments of two meshes.
     * @param inputs first mesh, second mesh, and tolerance
     * @returns array of intersection segments
     * @group mesh
     * @shortname mesh-mesh int segments
     * @drawable false
     */
    meshMeshIntersectionSegments(inputs: Inputs.Mesh.MeshMeshToleranceDto): Inputs.Base.Segment3[] {
        const mesh1 = inputs.mesh1;
        const mesh2 = inputs.mesh2;
        const intersectionSegments: Inputs.Base.Segment3[] = [];

        for (let i = 0; i < mesh1.length; ++i) {
            for (let j = 0; j < mesh2.length; ++j) {
                const triangle1 = mesh1[i];
                const triangle2 = mesh2[j];

                const segment = this.triangleTriangleIntersection({ triangle1, triangle2, tolerance: inputs.tolerance });

                if (segment) {
                    intersectionSegments.push(segment);
                }
            }
        }

        return intersectionSegments;
    }

    /**
     * Computes the intersection polylines of two meshes.
     * @param inputs first mesh, second mesh, and tolerance
     * @returns array of intersection polylines
     * @group mesh
     * @shortname mesh-mesh int polylines
     * @drawable true
     */
    meshMeshIntersectionPolylines(inputs: Inputs.Mesh.MeshMeshToleranceDto): Inputs.Base.Polyline3[] {
        const segments = this.meshMeshIntersectionSegments(inputs);
        return this.polyline.sortSegmentsIntoPolylines({ segments, tolerance: inputs.tolerance });
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
