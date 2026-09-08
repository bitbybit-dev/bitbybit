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
 * that is inherent to snapping, and the alternative, a neighbourhood search, costs more than it is
 * worth here.
 */
const VERTEX_MERGE_TOLERANCE = 1e-7;

/** Snaps a coordinate onto the merge grid, normalising a negative zero so it keys the same as zero. */
const quantize = (coordinate: number): number => Math.round(coordinate / VERTEX_MERGE_TOLERANCE) || 0;

/**
 * Contains various functions for Solid meshes from Manifold library https://github.com/elalish/manifold
 * Thanks Manifold community for developing this kernel
 */
export class ManifoldShapes {

    private manifold: Manifold3D.ManifoldToplevel;

    constructor(wasm: Manifold3D.ManifoldToplevel) {
        this.manifold = wasm;
    }

    /**
     * Convert a Mesh into a Manifold, retaining its properties and merging only
     * the positions according to the merge vectors. Will throw an error if the
     * result is not an oriented 2-manifold. Will collapse degenerate triangles
     * and unnecessary vertices.
     *
     * All fields are read, making this structure suitable for a lossless
     * round-trip of data from manifoldToMesh(). For multi-material input, use
     * reserveIDs() to set a unique originalID for each material, and sort the
     * materials into triangle runs.
     * @param inputs mesh definition
     * @returns manifold
     * @group create
     * @shortname manifold from mesh
     * @drawable true
     */
    manifoldFromMesh(inputs: Inputs.Manifold.CreateFromMeshDto): Manifold3D.Manifold {
        const { Manifold } = this.manifold;
        return new Manifold(inputs.mesh as Manifold3D.Mesh);
    }

    /**
     * Create a Manifold from a set of polygon points describing triangles.
     * @param inputs Polygon points
     * @returns Manifold
     * @group create
     * @shortname from polygon points
     * @drawable true
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
     * Create a 3D cube shape
     * @param inputs Cube parameters
     * @returns Cube solid
     * @group primitives
     * @shortname cube
     * @drawable true
     */
    cube(inputs: Inputs.Manifold.CubeDto): Manifold3D.Manifold {
        const { Manifold } = this.manifold;
        const { cube } = Manifold;
        return cube(inputs.size, inputs.center);
    }

    /**
     * Create a 3D sphere shape
     * @param inputs Sphere parameters
     * @returns Sphere solid
     * @group primitives
     * @shortname sphere
     * @drawable true
     */
    sphere(inputs: Inputs.Manifold.SphereDto): Manifold3D.Manifold {
        const { Manifold } = this.manifold;
        const { sphere } = Manifold;
        return sphere(inputs.radius, inputs.circularSegments);
    }

    /**
     * Create a 3D tetrahedron shape
     * @returns Tetrahedron solid
     * @group primitives
     * @shortname tetrahedron
     * @drawable true
     */
    tetrahedron(): Manifold3D.Manifold {
        const { Manifold } = this.manifold;
        const { tetrahedron } = Manifold;
        return tetrahedron();
    }

    /**
     * Create a 3D cylinder shape
     * @param inputs Cylinder parameters
     * @returns Cylinder solid
     * @group primitives
     * @shortname cylinder
     * @drawable true
     */
    cylinder(inputs: Inputs.Manifold.CylinderDto): Manifold3D.Manifold {
        const { Manifold } = this.manifold;
        const { cylinder } = Manifold;
        return cylinder(inputs.height, inputs.radiusLow, inputs.radiusHigh, inputs.circularSegments, inputs.center);
    }

}
