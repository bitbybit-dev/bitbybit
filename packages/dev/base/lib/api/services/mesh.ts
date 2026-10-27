import * as Inputs from "../inputs";
import type { Polyline } from "./polyline";
import type { Vector } from "./vector";
import { InputError, resolveDto } from "../kernel-calls";
import { signedVolumeOf } from "./helpers/mesh/mesh-measures";
import { pointInTree, treesNested, treesWithin, triangleTree } from "./helpers/mesh/mesh-proximity";
import type { MeshArrays, TriangleTree } from "./helpers/helper-types";
import { triangulateFace } from "./helpers/geometry/triangulation";
import { frustum, icosphere } from "./helpers/mesh/mesh-primitives";
import { axesAlong, isTriple, pointToWorld } from "./helpers/geometry/frame-axes";
import { add3, scale3 } from "./helpers/geometry/vectors";
import { computeVertexNormals, creasedVertices } from "./helpers/mesh/mesh-normals";
import { windingComponents, windingRepairs } from "./helpers/mesh/mesh-orientation";
import { uniqueVectors } from "./helpers/geometry/vector-grid";
import type * as Resolved from "../resolved-inputs";

const TRIANGLE_CORNERS = 3;
const MAX_ICOSPHERE_DETAIL = 6;
const MIN_FRUSTUM_SIDES = 3;
const POINT_SIZE = 3;
const MAX_CREASE_ANGLE = 180;

function arraysOf(mesh: Inputs.Base.Mesh3): MeshArrays {
    const positions = mesh.flat(2);
    return { positions, indices: Array.from({ length: positions.length / TRIANGLE_CORNERS }, (_, at) => at) };
}

function trianglesOf({ positions, indices }: MeshArrays, place: (position: Inputs.Base.Point3) => Inputs.Base.Point3): Inputs.Base.Mesh3 {
    const corner = (index: number): Inputs.Base.Point3 =>
        place([positions[index * TRIANGLE_CORNERS]!, positions[index * TRIANGLE_CORNERS + 1]!, positions[index * TRIANGLE_CORNERS + 2]!]);
    return Array.from({ length: indices.length / TRIANGLE_CORNERS }, (_, at): Inputs.Base.Triangle3 =>
        [corner(indices[at * TRIANGLE_CORNERS]!), corner(indices[at * TRIANGLE_CORNERS + 1]!), corner(indices[at * TRIANGLE_CORNERS + 2]!)]);
}

function centerOf(center: unknown): Inputs.Base.Point3 {
    if (!isTriple(center)) {
        throw new InputError("`center` is not a point of three finite numbers.", "center");
    }
    return center;
}

function cornersOf(mesh: unknown, property: string): Inputs.Base.Point3[] {
    if (!Array.isArray(mesh) || !mesh.every(triangle => Array.isArray(triangle) && triangle.length === TRIANGLE_CORNERS && triangle.every(isTriple))) {
        throw new InputError(`\`${property}\` is not a list of triangles of three points each, every point three finite numbers.`, property);
    }
    return (mesh as Inputs.Base.Mesh3).flat();
}

function indexedOf(mesh: unknown): MeshArrays {
    const { positions, indices } = (typeof mesh === "object" && mesh !== null ? mesh : {}) as Partial<Record<"positions" | "indices", unknown>>;
    if (!Array.isArray(positions) || positions.length % POINT_SIZE !== 0 || !positions.every(Number.isFinite)) {
        throw new InputError("`mesh` does not hold `positions` as finite numbers, three for each point.", "mesh");
    }
    const pointCount = positions.length / POINT_SIZE;
    if (!Array.isArray(indices) || indices.length % TRIANGLE_CORNERS !== 0 || !indices.every(index => Number.isInteger(index) && index >= 0 && index < pointCount)) {
        throw new InputError("`mesh` does not hold `indices` as point numbers from 0 to one less than its point count, three for each triangle.", "mesh");
    }
    return { positions: positions as number[], indices: indices as number[] };
}

function treeOf(mesh: unknown, property: string): TriangleTree {
    const corners = cornersOf(mesh, property);
    return triangleTree(corners.flat(), Array.from({ length: corners.length }, (_, at) => at));
}

/**
 * Geometry on plain triangle meshes: a mesh is a list of triangles, each three points. The methods
 * here work out the plane of a triangle, the distance from a point to a plane, and where two meshes
 * cut through each other, as segments, as polylines or as point lists, measure the volume a closed
 * mesh holds, and build simple meshes (an icosphere, a frustum). Indexed meshes, which store each
 * point once, convert to and from triangle lists and take smooth or creased normals and consistent
 * winding. They need no CAD kernel, so they run on any triangulated data.
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
        const resolved = resolveDto(Inputs.Mesh.TriangleToleranceDto, inputs) as Resolved.Mesh.TriangleToleranceDto;
        const EPSILON_SQ = (resolved.tolerance || 1e-7) ** 2;

        const edge1 = this.vector.sub({ first: resolved.triangle[1], second: resolved.triangle[0] });
        const edge2 = this.vector.sub({ first: resolved.triangle[2], second: resolved.triangle[0] });
        const normal = this.vector.cross({ first: edge1, second: edge2 });

        if (this.vector.lengthSq({ vector: normal as Inputs.Base.Vector3 }) < EPSILON_SQ) {
            return undefined;
        }

        const normalizedNormal = this.vector.normalized({ vector: normal }) as Inputs.Base.Vector3;
        const d = this.vector.dot({ first: normalizedNormal, second: resolved.triangle[0] });
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
        const resolved = resolveDto(Inputs.Mesh.TriangleTriangleToleranceDto, inputs) as Resolved.Mesh.TriangleTriangleToleranceDto;
        const t1 = resolved.triangle1;
        const t2 = resolved.triangle2;
        const EPSILON = resolved.tolerance || 1e-7;
        const p1 = t1[0], p2 = t1[1], p3 = t1[2];
        const q1 = t2[0], q2 = t2[1], q3 = t2[2];

        const plane1 = this.calculateTrianglePlane({ triangle: t1, tolerance: EPSILON });
        const plane2 = this.calculateTrianglePlane({ triangle: t2, tolerance: EPSILON });

        if (!plane1 || !plane2) {
            return undefined;
        }

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

            if (Math.abs(du) < EPSILON) {
                t1_intersection_points_3d.push(u);
            }

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

            if (Math.abs(du) < EPSILON) {
                t2_intersection_points_3d.push(u);
            }

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
        const resolved = resolveDto(Inputs.Mesh.MeshMeshToleranceDto, inputs) as Resolved.Mesh.MeshMeshToleranceDto;
        const mesh1 = resolved.mesh1;
        const mesh2 = resolved.mesh2;
        const intersectionSegments: Inputs.Base.Segment3[] = [];

        for (let i = 0; i < mesh1.length; ++i) {
            for (let j = 0; j < mesh2.length; ++j) {
                const triangle1 = mesh1[i]!;
                const triangle2 = mesh2[j]!;

                const segment = this.triangleTriangleIntersection({ triangle1, triangle2, tolerance: resolved.tolerance });

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
        const resolved = resolveDto(Inputs.Mesh.MeshMeshToleranceDto, inputs) as Resolved.Mesh.MeshMeshToleranceDto;
        const segments = this.meshMeshIntersectionSegments(resolved);
        return this.polyline.sortSegmentsIntoPolylines({ segments, tolerance: resolved.tolerance });
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
        const resolved = resolveDto(Inputs.Mesh.MeshMeshToleranceDto, inputs) as Resolved.Mesh.MeshMeshToleranceDto;
        const polylines = this.meshMeshIntersectionPolylines(resolved);
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

    /**
     * Cuts a flat polygon, with any holes through it, into triangles.
     *
     * Every corner stays a corner of a triangle, so neighbouring polygons give a mesh closed along
     * the edges they share. The triangles face the way the outline turns, by the right-hand rule;
     * holes may run either way.
     * Example: a 4 by 4 square -> two triangles
     * @param inputs - The outline and its holes
     * @returns The triangles, each three points
     * @group polygon
     * @shortname triangulate polygon
     * @drawable false
     * @example
     * ```typescript
     * const triangles = bitbybit.mesh.triangulatePolygon({ points: [[0, 0, 0], [4, 0, 0], [4, 4, 0], [0, 4, 0]], holes: [[[1, 1, 0], [3, 1, 0], [3, 3, 0], [1, 3, 0]]] });
     * ```
     */
    triangulatePolygon(inputs: Inputs.Mesh.PolygonWithHolesDto): Inputs.Base.Mesh3 {
        const loops = [inputs.points, ...(inputs.holes ?? [])];
        const corners = loops.flat();
        const positions = corners.flat();
        let next = 0;
        const indices = loops.map((loop) => loop.map(() => next++));
        const triangles = triangulateFace(positions, indices);
        const mesh: Inputs.Base.Mesh3 = [];
        for (let at = 0; at + 2 < triangles.length; at += TRIANGLE_CORNERS) {
            mesh.push([[...corners[triangles[at]!]!], [...corners[triangles[at + 1]!]!], [...corners[triangles[at + 2]!]!]]);
        }
        return mesh;
    }

    /**
     * Measures the volume a closed triangle mesh encloses, with a sign: positive when its triangles
     * face outwards by the right-hand rule, negative when they all face inwards.
     *
     * A mesh that is not closed has no inside, and the number it gives means nothing.
     * Example: a unit cube facing outwards -> 1
     * @param inputs - The mesh
     * @returns The enclosed volume in cubic model units
     * @group measure
     * @shortname signed volume
     * @drawable false
     * @example
     * ```typescript
     * const volume = bitbybit.mesh.signedVolume({ mesh: [[[0, 0, 0], [0, 1, 0], [1, 0, 0]], [[0, 0, 0], [1, 0, 0], [0, 0, 1]], [[0, 0, 0], [0, 0, 1], [0, 1, 0]], [[1, 0, 0], [0, 1, 0], [0, 0, 1]]] });
     * ```
     */
    signedVolume(inputs: Inputs.Mesh.MeshDto): number {
        const { positions, indices } = arraysOf(inputs.mesh);
        return signedVolumeOf(positions, indices);
    }

    /**
     * Tells whether two triangle meshes come within a distance of each other, touching and
     * crossing included, as a quick collision test.
     *
     * It stops at the first triangles close enough; a mesh, or any separate piece of one, wholly
     * inside a closed one counts too.
     * Example: two unit cubes half a unit apart, distance 0.6 -> true; distance 0.4 -> false
     * @param inputs - The two meshes and the distance
     * @returns True when the meshes come within the distance
     * @group measure
     * @shortname meshes within
     * @drawable false
     * @example
     * ```typescript
     * const close = bitbybit.mesh.meshesWithin({ mesh1: bracket, mesh2: bolt, distance: 0.5 });
     * ```
     */
    meshesWithin(inputs: Inputs.Mesh.MeshesWithinDto): boolean {
        const resolved = resolveDto(Inputs.Mesh.MeshesWithinDto, inputs) as Resolved.Mesh.MeshesWithinDto;
        if (!(resolved.distance >= 0)) {
            throw new InputError(`\`distance\` is ${resolved.distance}; it must be a number from 0.`, "distance");
        }
        const first = treeOf(resolved.mesh1, "mesh1");
        const second = treeOf(resolved.mesh2, "mesh2");
        return treesWithin(first, second, resolved.distance) || treesNested(first, second);
    }

    /**
     * Tells whether a point lies inside a closed triangle mesh.
     *
     * Rays from the point in three directions count the triangles they cross; an odd count for
     * most of them means inside. A mesh that is not closed has no inside, and the answer means
     * nothing. Example: [0.5, 0.5, 0.5] in a unit cube -> true
     * @param inputs - The closed mesh and the point
     * @returns True when the point is inside the mesh
     * @group measure
     * @shortname is point inside
     * @drawable false
     * @example
     * ```typescript
     * const inside = bitbybit.mesh.isPointInside({ mesh: housing, point: [0, 0, 5] });
     * ```
     */
    isPointInside(inputs: Inputs.Mesh.MeshPointDto): boolean {
        const point: unknown = inputs.point;
        if (!isTriple(point)) {
            throw new InputError("`point` is not a point of three finite numbers.", "point");
        }
        return pointInTree(treeOf(inputs.mesh, "mesh"), point);
    }

    /**
     * Makes a sphere as an evenly triangulated mesh, the icosahedron split `detail` times.
     *
     * Its triangles are close to equal in size everywhere, unlike a sphere made of latitude and
     * longitude bands, and each faces outward. Each level of detail has four times the triangles.
     * Example: detail 0 -> 20 triangles, detail 2 -> 320
     * @param inputs - The center, the radius and the detail
     * @returns The sphere's triangles
     * @group primitives
     * @shortname icosphere
     * @drawable true
     * @example
     * ```typescript
     * const sphere = bitbybit.mesh.icosphere({ center: [0, 0, 0], radius: 5, detail: 3 });
     * ```
     */
    icosphere(inputs: Inputs.Mesh.IcosphereDto): Inputs.Base.Mesh3 {
        const resolved = resolveDto(Inputs.Mesh.IcosphereDto, inputs) as Resolved.Mesh.IcosphereDto;
        if (!(resolved.radius > 0 && resolved.radius < Infinity)) {
            throw new InputError("`radius` is not a number above 0.", "radius");
        }
        if (!Number.isInteger(resolved.detail) || resolved.detail < 0 || resolved.detail > MAX_ICOSPHERE_DETAIL) {
            throw new InputError(`\`detail\` is not a whole number from 0 to ${MAX_ICOSPHERE_DETAIL}.`, "detail");
        }
        const center = centerOf(resolved.center);
        return trianglesOf(icosphere(resolved.detail), position => add3(center, scale3(position, resolved.radius)));
    }

    /**
     * Makes a cone, a cylinder or a cone with its tip cut off, as a closed triangulated mesh.
     *
     * It stands on `center` and rises along `direction` by `height`, with flat ends and `sides`
     * flat faces around. Equal radii make a cylinder.
     * Example: top radius 0, height 2 -> a cone 2 units tall
     * @param inputs - The bottom center, the direction, the radii, the height and the sides
     * @returns The shape's triangles
     * @group primitives
     * @shortname frustum
     * @drawable true
     * @example
     * ```typescript
     * const cone = bitbybit.mesh.frustum({ center: [0, 0, 0], bottomRadius: 2, topRadius: 0, height: 4, sides: 32 });
     * ```
     */
    frustum(inputs: Inputs.Mesh.FrustumDto): Inputs.Base.Mesh3 {
        const resolved = resolveDto(Inputs.Mesh.FrustumDto, inputs) as Resolved.Mesh.FrustumDto;
        if (!(resolved.bottomRadius >= 0 && resolved.topRadius >= 0 && resolved.bottomRadius + resolved.topRadius > 0)) {
            throw new InputError("`bottomRadius` and `topRadius` are not numbers of 0 or more with at least one above 0.", resolved.bottomRadius >= 0 ? "topRadius" : "bottomRadius");
        }
        if (!(resolved.height > 0 && resolved.height < Infinity)) {
            throw new InputError("`height` is not a number above 0.", "height");
        }
        if (!Number.isInteger(resolved.sides) || resolved.sides < MIN_FRUSTUM_SIDES) {
            throw new InputError(`\`sides\` is not a whole number of at least ${MIN_FRUSTUM_SIDES}.`, "sides");
        }
        const center = centerOf(resolved.center);
        const axes = isTriple(resolved.direction) ? axesAlong(center, resolved.direction) : undefined;
        if (axes === undefined) {
            throw new InputError("`direction` is not a vector of three finite numbers with a length.", "direction");
        }
        return trianglesOf(frustum(resolved.sides, resolved.bottomRadius, resolved.topRadius, resolved.height), position => pointToWorld(axes, position));
    }
    /**
     * Turns a list of triangles into an indexed mesh, which stores each point once.
     *
     * Corners that agree within `tolerance` in every coordinate become one point, kept where it first
     * appears, so triangles that meet share their corners and the mesh knows its neighbours.
     * Example: two triangles that share an edge -> 4 points and 6 indices
     * @param inputs - The triangles and the tolerance
     * @returns The indexed mesh
     * @group indexed
     * @shortname to indexed
     * @drawable false
     * @example
     * ```typescript
     * const indexed = bitbybit.mesh.toIndexed({ mesh: bitbybit.mesh.icosphere({ radius: 1, detail: 1 }) });
     * ```
     */
    toIndexed(inputs: Inputs.Mesh.MeshToIndexedDto): Inputs.Base.IndexedMesh {
        const resolved = resolveDto(Inputs.Mesh.MeshToIndexedDto, inputs) as Resolved.Mesh.MeshToIndexedDto;
        if (!(resolved.tolerance >= 0)) {
            throw new InputError("`tolerance` is not a number of 0 or more.", "tolerance");
        }
        const { kept, indexes } = uniqueVectors(cornersOf(resolved.mesh, "mesh"), resolved.tolerance);
        return { positions: kept.flat(), indices: indexes };
    }

    /**
     * Turns an indexed mesh back into a list of triangles, each written out as its three points.
     *
     * Normals the mesh carries are left out, since a triangle list has no place for them.
     * Example: 4 points and indices [0, 1, 2, 1, 3, 2] -> 2 triangles
     * @param inputs - The indexed mesh
     * @returns The triangles
     * @group indexed
     * @shortname from indexed
     * @drawable true
     * @example
     * ```typescript
     * const triangles = bitbybit.mesh.fromIndexed({ mesh: { positions: [0, 0, 0, 1, 0, 0, 0, 1, 0], indices: [0, 1, 2] } });
     * ```
     */
    fromIndexed(inputs: Inputs.Mesh.IndexedMeshDto): Inputs.Base.Mesh3 {
        return trianglesOf(indexedOf(inputs.mesh), position => position);
    }

    /**
     * Gives an indexed mesh smooth normals, one per point, so it shades without visible facets.
     *
     * Each point's normal sums those of the triangles around it, a large triangle counting for more
     * than a sliver. The points and triangles stay as they are.
     * Example: a welded cube -> 2 corner normals on diagonals, 6 tipped 19.47 degrees
     * @param inputs - The indexed mesh
     * @returns The mesh with `normals` filled in
     * @group indexed
     * @shortname smooth normals
     * @drawable false
     * @example
     * ```typescript
     * const smooth = bitbybit.mesh.smoothNormals({ mesh: bitbybit.mesh.toIndexed({ mesh: bitbybit.mesh.icosphere({ radius: 1, detail: 2 }) }) });
     * ```
     */
    smoothNormals(inputs: Inputs.Mesh.IndexedMeshDto): Inputs.Base.IndexedMesh {
        const { positions, indices } = indexedOf(inputs.mesh);
        return { positions: positions.slice(), indices: indices.slice(), normals: computeVertexNormals(positions, indices) };
    }

    /**
     * Gives an indexed mesh normals that keep its sharp edges sharp and smooth the rest.
     *
     * Where triangles turn from each other by more than `angle`, the point between them is split,
     * one copy per side, so a cube keeps hard edges while a cylinder's side shades smoothly.
     * Example: a welded cube, angle 30 -> 24 points, 4 per face
     * @param inputs - The indexed mesh and the angle of its sharp edges
     * @returns The mesh with its points split at sharp edges and `normals` filled in
     * @group indexed
     * @shortname creased normals
     * @drawable false
     * @example
     * ```typescript
     * const shaded = bitbybit.mesh.creasedNormals({ mesh: indexed, angle: 30 });
     * ```
     */
    creasedNormals(inputs: Inputs.Mesh.CreasedNormalsDto): Inputs.Base.IndexedMesh {
        const resolved = resolveDto(Inputs.Mesh.CreasedNormalsDto, inputs) as Resolved.Mesh.CreasedNormalsDto;
        const { positions, indices } = indexedOf(resolved.mesh);
        if (!(resolved.angle >= 0 && resolved.angle <= MAX_CREASE_ANGLE)) {
            throw new InputError(`\`angle\` is not a number of degrees from 0 to ${MAX_CREASE_ANGLE}.`, "angle");
        }
        const creased = creasedVertices(positions, indices, resolved.angle);
        return {
            positions: Array.from(creased.sources).flatMap(source => positions.slice(source * POINT_SIZE, source * POINT_SIZE + POINT_SIZE)),
            indices: Array.from(creased.indices),
            normals: Array.from(creased.normals),
        };
    }

    /**
     * Splits an indexed mesh into its connected pieces and finds the triangles that wind against
     * the first triangle of their piece.
     *
     * Triangles that share an edge belong to one piece; an edge more than two share is not followed.
     * Example: two separate triangles -> count 2, nothing to turn over
     * @param inputs - The indexed mesh
     * @returns Per triangle, whether to turn it over and its piece, and the number of pieces
     * @group indexed
     * @shortname winding pieces
     * @drawable false
     * @example
     * ```typescript
     * const { count, pieces } = bitbybit.mesh.windingPieces({ mesh: indexed });
     * ```
     */
    windingPieces(inputs: Inputs.Mesh.IndexedMeshDto): Inputs.Base.MeshWindingPieces {
        const { indices } = indexedOf(inputs.mesh);
        const { flips, component, count } = windingComponents(indices);
        return { turnOver: Array.from(flips, flip => flip === 1), pieces: Array.from(component), count };
    }

    /**
     * Turns over the triangles of an indexed mesh that wind against the rest of their piece.
     *
     * Each connected piece keeps the winding most of its area has, so a few triangles written inside
     * out are mended and a piece wound inward on purpose stays.
     * Example: a cube with one face inside out -> every face outward
     * @param inputs - The indexed mesh
     * @returns The mesh with those triangles turned over; normals are left out
     * @group indexed
     * @shortname orient consistently
     * @drawable false
     * @example
     * ```typescript
     * const mended = bitbybit.mesh.orientConsistently({ mesh: indexed });
     * ```
     */
    orientConsistently(inputs: Inputs.Mesh.IndexedMeshDto): Inputs.Base.IndexedMesh {
        const { positions, indices } = indexedOf(inputs.mesh);
        const repairs = windingRepairs(positions, indices);
        const turned = indices.slice();
        repairs.forEach((repair, triangle) => {
            if (repair === 1) {
                turned[triangle * TRIANGLE_CORNERS + 1] = indices[triangle * TRIANGLE_CORNERS + 2]!;
                turned[triangle * TRIANGLE_CORNERS + 2] = indices[triangle * TRIANGLE_CORNERS + 1]!;
            }
        });
        return { positions: positions.slice(), indices: turned };
    }
}
