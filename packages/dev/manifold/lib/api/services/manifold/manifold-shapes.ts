import * as Inputs from "../../inputs/manifold-inputs";
import * as Manifold3D from "manifold-3d";

export class ManifoldShapes {

    private manifold: Manifold3D.ManifoldToplevel;

    constructor(wasm: Manifold3D.ManifoldToplevel) {
        this.manifold = wasm;
    }

    manifoldFromMesh(inputs: Inputs.Manifold.CreateFromMeshDto): Manifold3D.Manifold {
        const { Manifold } = this.manifold;
        return new Manifold(inputs.mesh as Manifold3D.Mesh);
    }

    fromPolygonPoints(inputs: Inputs.Manifold.FromPolygonPointsDto): Manifold3D.Manifold {
        const { Manifold } = this.manifold;
        const polygons = inputs.polygonPoints;
        // Map to store unique vertices and their assigned index.
        // Key: string representation "x,y,z"
        // Value: index in the unique vertex list
        const vertexMap = new Map<string, number>();

        const uniqueVertexCoords: number[] = [];
        const triangleIndices: number[] = [];

        let vertexIndexCounter = 0;

        // --- Iterate, Deduplicate, and Store Unique Vertices/Indices ---
        for (const triangle of polygons) {
            if (!triangle || triangle.length !== 3) {
                console.warn(`Skipping invalid polygon data (expected 3 vertices): ${JSON.stringify(triangle)}`);
                continue; // Skip malformed triangles
            }

            for (const point of triangle) {
                if (!point || point.length !== 3 || point.some(isNaN)) {
                    // Handle potential malformed point data more robustly
                    console.warn(`Skipping invalid point data in triangle: ${JSON.stringify(point)}`);
                    // Let's throw an error for clearer failure:
                    throw new Error(`Invalid point data encountered: ${JSON.stringify(point)} in triangle ${JSON.stringify(triangle)}`);
                }

                // Create a unique key for the vertex based on its coordinates
                // Using string concatenation is simple for exact matches.
                // Be aware of potential floating-point precision issues if vertices
                // might be *very* slightly different but should be treated as the same.
                const vertexKey = `${point[0]},${point[1]},${point[2]}`;

                let index: number;

                // Check if this vertex has already been seen
                if (vertexMap.has(vertexKey)) {
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    index = vertexMap.get(vertexKey)!;
                } else {
                    // It's a new unique vertex
                    index = vertexIndexCounter;
                    vertexMap.set(vertexKey, index);
                    uniqueVertexCoords.push(point[0], point[1], point[2]);
                    vertexIndexCounter++;
                }

                // Add the index (either existing or new) to the triangle indices list
                triangleIndices.push(index);
            }
        }

        // --- Create TypedArrays ---

        // Number of properties per vertex (x, y, z)
        // If we had normals, UVs etc., this would be higher, we're not dealing with that here when making meshes from simple polygon points.
        const numProp = 3;

        const vertProperties = Float32Array.from(uniqueVertexCoords);
        const triVerts = Uint32Array.from(triangleIndices);

        // --- Populate the DTO ---
        const meshDto = new Inputs.Manifold.DecomposedManifoldMeshDto();
        meshDto.numProp = numProp;
        meshDto.vertProperties = vertProperties;
        meshDto.triVerts = triVerts;

        return new Manifold(meshDto as Manifold3D.Mesh);
    }

    cube(inputs: Inputs.Manifold.CubeDto): Manifold3D.Manifold {
        const { Manifold } = this.manifold;
        const { cube } = Manifold;
        return cube(inputs.size, inputs.center);
    }

    sphere(inputs: Inputs.Manifold.SphereDto): Manifold3D.Manifold {
        const { Manifold } = this.manifold;
        const { sphere } = Manifold;
        return sphere(inputs.radius, inputs.circularSegments);
    }

    tetrahedron(): Manifold3D.Manifold {
        const { Manifold } = this.manifold;
        const { tetrahedron } = Manifold;
        return tetrahedron();
    }

    cylinder(inputs: Inputs.Manifold.CylinderDto): Manifold3D.Manifold {
        const { Manifold } = this.manifold;
        const { cylinder } = Manifold;
        return cylinder(inputs.height, inputs.radiusLow, inputs.radiusHigh, inputs.circularSegments, inputs.center);
    }

}
