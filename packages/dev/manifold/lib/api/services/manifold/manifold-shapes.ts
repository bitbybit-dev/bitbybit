import * as Inputs from "../../inputs/manifold-inputs";
import type * as Manifold3D from "manifold-3d";
import { resolveDto } from "@bitbybit-dev/base";
import type * as Resolved from "../../resolved-inputs";

const VERTEX_MERGE_TOLERANCE = 1e-7;

const snapToMergeGrid = (coordinate: number): number => Math.round(coordinate / VERTEX_MERGE_TOLERANCE) || 0;

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

                const vertexKey = `${snapToMergeGrid(point[0])},${snapToMergeGrid(point[1])},${snapToMergeGrid(point[2])}`;

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
     * Creates a cube solid with the given side length.
     *
     * With `center` true the cube is centered on the origin; otherwise its corner sits on the origin
     * and it extends along the positive axes.
     * @param inputs - The side length and whether to center it
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
        const resolved = resolveDto(Inputs.Manifold.CubeDto, inputs) as Resolved.Manifold.CubeDto;
        const { Manifold } = this.manifold;
        return Manifold.cube(resolved.size, resolved.center);
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
        const resolved = resolveDto(Inputs.Manifold.SphereDto, inputs) as Resolved.Manifold.SphereDto;
        const { Manifold } = this.manifold;
        return Manifold.sphere(resolved.radius, resolved.circularSegments);
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
        return Manifold.tetrahedron();
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
        const resolved = resolveDto(Inputs.Manifold.CylinderDto, inputs) as Resolved.Manifold.CylinderDto;
        const { Manifold } = this.manifold;
        return Manifold.cylinder(resolved.height, resolved.radiusLow, resolved.radiusHigh, resolved.circularSegments, resolved.center);
    }

}
