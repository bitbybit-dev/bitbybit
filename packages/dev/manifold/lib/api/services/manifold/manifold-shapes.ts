import * as Inputs from "../../inputs/manifold-inputs";
import * as Manifold3D from "manifold-3d";

/**
 * The grid a vertex is snapped onto before it is used as a de-duplication key.
 *
 * Vertices arriving from separate triangles of the same surface differ in the last bits after any
 * floating-point arithmetic has touched them, and keying on the exact coordinates left every such
 * pair as two vertices - which is what made a mesh built from polygon points non-watertight along a
 * seam that looks closed. Snapping to a grid merges them.
 *
 * The value is absolute, not relative: it is chosen to be far above the noise of double arithmetic on
 * ordinary CAD magnitudes and far below any distance a model means to express. Two vertices that
 * genuinely sit closer together than this are merged, and two that straddle a grid boundary are not -
 * that is inherent to snapping, and the alternative, a neighborhood search, costs more than it is
 * worth here.
 */
const VERTEX_MERGE_TOLERANCE = 1e-7;

/** Snaps a coordinate onto the merge grid, normalizing a negative zero so it keys the same as zero. */
const quantize = (coordinate: number): number => Math.round(coordinate / VERTEX_MERGE_TOLERANCE) || 0;

/**
 * Building Manifold solids: the cube, sphere, cylinder and tetrahedron primitives, and solids from
 * triangle meshes or lists of triangles. The kernel keeps Z as its up axis, so a cylinder stands
 * along Z and a cube's `size` runs along X, Y and Z; every solid comes back as a closed triangle
 * mesh.
 */
export class ManifoldShapes {

    private manifold: Manifold3D.ManifoldToplevel;

    constructor(wasm: Manifold3D.ManifoldToplevel) {
        this.manifold = wasm;
    }

    /**
     * Builds a solid from plain mesh data, the form `manifoldToMesh` hands out, so a mesh can make
     * a round trip through other tools.
     *
     * The mesh must be closed and consistently oriented, or an error is thrown; degenerate
     * triangles and unneeded vertices are removed on the way in.
     * @param inputs - The mesh data
     * @returns The solid
     * @group create
     * @shortname manifold from mesh
     * @drawable true
     * @example
     * ```typescript
     * const solid = await bitbybit.manifold.manifold.shapes.manifoldFromMesh({ mesh });
     * ```
     */
    manifoldFromMesh(inputs: Inputs.Manifold.CreateFromMeshDto): Manifold3D.Manifold {
        const { Manifold } = this.manifold;
        return new Manifold(inputs.mesh as Manifold3D.Mesh);
    }

    /**
     * Builds a solid from a list of triangles, each given as three points, merging points that
     * coincide.
     *
     * The triangles must form a closed, consistently oriented surface; entries that are not three
     * points are skipped, and points with missing coordinates throw an error.
     * @param inputs - The triangles as lists of three points
     * @returns The solid
     * @group create
     * @shortname from polygon points
     * @drawable true
     * @example
     * ```typescript
     * const solid = await bitbybit.manifold.manifold.shapes.fromPolygonPoints({ polygonPoints: triangles });
     * ```
     */
    fromPolygonPoints(inputs: Inputs.Manifold.FromPolygonPointsDto): Manifold3D.Manifold {
        const { Manifold } = this.manifold;
        const polygons = inputs.polygonPoints;
        const vertexMap = new Map<string, number>();

        const uniqueVertexCoords: number[] = [];
        const triangleIndices: number[] = [];

        let vertexIndexCounter = 0;

        for (const triangle of polygons) {
            if (!triangle || triangle.length !== 3) {
                console.warn(`Skipping invalid polygon data (expected 3 vertices): ${JSON.stringify(triangle)}`);
                continue;
            }

            for (const point of triangle) {
                if (!point || point.length !== 3 || point.some(isNaN)) {
                    console.warn(`Skipping invalid point data in triangle: ${JSON.stringify(point)}`);
                    throw new Error(`Invalid point data encountered: ${JSON.stringify(point)} in triangle ${JSON.stringify(triangle)}`);
                }

                const vertexKey = `${quantize(point[0])},${quantize(point[1])},${quantize(point[2])}`;

                let index: number;

                if (vertexMap.has(vertexKey)) {
                     
                    index = vertexMap.get(vertexKey)!;
                } else {
                    index = vertexIndexCounter;
                    vertexMap.set(vertexKey, index);
                    uniqueVertexCoords.push(point[0], point[1], point[2]);
                    vertexIndexCounter++;
                }

                triangleIndices.push(index);
            }
        }

        const numProp = 3;

        const vertProperties = Float32Array.from(uniqueVertexCoords);
        const triVerts = Uint32Array.from(triangleIndices);

        const meshDto = new Inputs.Manifold.DecomposedManifoldMeshDto();
        meshDto.numProp = numProp;
        meshDto.vertProperties = vertProperties;
        meshDto.triVerts = triVerts;

        return new Manifold(meshDto as Manifold3D.Mesh);
    }

    /**
     * Creates a box solid with the given size along X, Y and Z.
     *
     * With `center` true the box is centered on the origin; otherwise its corner sits on the origin
     * and it extends along the positive axes.
     * @param inputs - The size along each axis and whether to center it
     * @returns The box solid
     * @group primitives
     * @shortname cube
     * @drawable true
     * @example
     * ```typescript
     * const box = await bitbybit.manifold.manifold.shapes.cube({ size: 10, center: true });
     * ```
     */
    cube(inputs: Inputs.Manifold.CubeDto): Manifold3D.Manifold {
        const { Manifold } = this.manifold;
        const { cube } = Manifold;
        return cube(inputs.size, inputs.center);
    }

    /**
     * Creates a sphere solid of the given radius, centered on the origin.
     *
     * `circularSegments` is the number of segments around the sphere; it is rounded up to a
     * multiple of four, since the sphere is built by refining an octahedron.
     * @param inputs - The radius and the number of segments around the sphere
     * @returns The sphere solid
     * @group primitives
     * @shortname sphere
     * @drawable true
     * @example
     * ```typescript
     * const ball = await bitbybit.manifold.manifold.shapes.sphere({ radius: 5, circularSegments: 32 });
     * ```
     */
    sphere(inputs: Inputs.Manifold.SphereDto): Manifold3D.Manifold {
        const { Manifold } = this.manifold;
        const { sphere } = Manifold;
        return sphere(inputs.radius, inputs.circularSegments);
    }

    /**
     * Creates a tetrahedron solid centered on the origin, with one corner at `[1, 1, 1]` and the
     * others placed symmetrically.
     * @returns The tetrahedron solid
     * @group primitives
     * @shortname tetrahedron
     * @drawable true
     * @example
     * ```typescript
     * const tetra = await bitbybit.manifold.manifold.shapes.tetrahedron();
     * ```
     */
    tetrahedron(): Manifold3D.Manifold {
        const { Manifold } = this.manifold;
        const { tetrahedron } = Manifold;
        return tetrahedron();
    }

    /**
     * Creates a cylinder solid standing along Z, or a cone when the top radius differs from the
     * bottom one.
     *
     * `radiusLow` is the bottom radius and must be above 0, `radiusHigh` the top radius, which may
     * be 0 for a point; `circularSegments` sets how round the sides are. `center` centers the
     * cylinder on the origin instead of standing it on it.
     * @param inputs - The height, the bottom and top radii, the number of segments and whether to center it
     * @returns The cylinder or cone solid
     * @group primitives
     * @shortname cylinder
     * @drawable true
     * @example
     * ```typescript
     * const cone = await bitbybit.manifold.manifold.shapes.cylinder({ height: 10, radiusLow: 4, radiusHigh: 1, circularSegments: 32, center: false });
     * ```
     */
    cylinder(inputs: Inputs.Manifold.CylinderDto): Manifold3D.Manifold {
        const { Manifold } = this.manifold;
        const { cylinder } = Manifold;
        return cylinder(inputs.height, inputs.radiusLow, inputs.radiusHigh, inputs.circularSegments, inputs.center);
    }

}
