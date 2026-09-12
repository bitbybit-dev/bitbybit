import * as Inputs from "../../inputs";
import * as Manifold3D from "manifold-3d";

/**
 * Reading Manifold mesh data: the position and extra properties of a vertex, the vertices of a
 * triangle, the tangent of a half-edge, the transform of a triangle run, and the counts of
 * properties, vertices, triangles and runs. Indexes count from 0.
 */
export class MeshEvaluate {

    constructor(_wasm: Manifold3D.ManifoldToplevel) {
    }

    /**
     * Reads the position of one vertex of a mesh.
     * @param inputs - The mesh and the vertex index
     * @returns The vertex position
     * @group basic
     * @shortname position
     * @drawable true
     * @example
     * ```typescript
     * const point = await bitbybit.manifold.mesh.evaluate.position({ mesh, vertexIndex: 0 });
     * ```
     */
    position(inputs: Inputs.Manifold.MeshVertexIndexDto<Manifold3D.Mesh>): Inputs.Base.Point3 {
        const res = inputs.mesh.position(inputs.vertexIndex);
        return [res[0]!, res[1]!, res[2]!];
    }

    /**
     * Reads the three vertex indexes of one triangle of a mesh, in counterclockwise order.
     * @param inputs - The mesh and the triangle index
     * @returns The three vertex indexes
     * @group basic
     * @shortname verts
     * @drawable false
     * @example
     * ```typescript
     * const corners = await bitbybit.manifold.mesh.evaluate.verts({ mesh, triangleIndex: 0 });
     * ```
     */
    verts(inputs: Inputs.Manifold.MeshTriangleIndexDto<Manifold3D.Mesh>): number[] {
        const res = inputs.mesh.verts(inputs.triangleIndex);
        return [res[0]!, res[1]!, res[2]!];
    }

    /**
     * Reads the tangent of one half-edge of a smoothed mesh: the direction the surface leaves the
     * edge's start vertex in, as three numbers plus a weight.
     *
     * Half-edge three times the triangle index plus `j` is the edge of triangle `t` that starts at
     * its `j`-th vertex; a mesh without smoothing tangents has none.
     * @param inputs - The mesh and the half-edge index
     * @returns The tangent as `[x, y, z, weight]`
     * @group basic
     * @shortname tangent
     * @drawable true
     * @example
     * ```typescript
     * const tangent = await bitbybit.manifold.mesh.evaluate.tangent({ mesh: smoothedMesh, halfEdgeIndex: 0 });
     * ```
     */
    tangent(inputs: Inputs.Manifold.MeshHalfEdgeIndexDto<Manifold3D.Mesh>): number[] {
        const res = inputs.mesh.tangent(inputs.halfEdgeIndex);
        return [res[0]!, res[1]!, res[2]!, res[4]!];
    }

    /**
     * Reads the properties of one vertex beyond its position, such as normals or colors stored in
     * extra channels.
     * @param inputs - The mesh and the vertex index
     * @returns The extra property values, in channel order
     * @group basic
     * @shortname extras
     * @drawable false
     * @example
     * ```typescript
     * const props = await bitbybit.manifold.mesh.evaluate.extras({ mesh, vertexIndex: 0 });
     * ```
     */
    extras(inputs: Inputs.Manifold.MeshVertexIndexDto<Manifold3D.Mesh>): number[] {
        const res = inputs.mesh.extras(inputs.vertexIndex);
        return [...res];
    }

    /**
     * Reads the column-major 4x4 matrix that carries the original mesh onto one run of triangles,
     * the placement of that instance.
     * @param inputs - The mesh and the run index
     * @returns The 16 numbers of the matrix
     * @group basic
     * @shortname transform 4x4 matrix
     * @drawable false
     * @example
     * ```typescript
     * const placement = await bitbybit.manifold.mesh.evaluate.transform({ mesh, triangleRunIndex: 0 });
     * ```
     */
    transform(inputs: Inputs.Manifold.MeshTriangleRunIndexDto<Manifold3D.Mesh>): number[] {
        const res = inputs.mesh.transform(inputs.triangleRunIndex);
        return [...res];
    }

    /**
     * Counts the property channels each vertex of a mesh carries; the position alone takes three.
     * @param inputs - The mesh
     * @returns The number of properties per vertex
     * @group basic
     * @shortname number props
     * @drawable false
     * @example
     * ```typescript
     * const channels = await bitbybit.manifold.mesh.evaluate.numProp({ mesh });
     * ```
     */
    numProp(inputs: Inputs.Manifold.MeshDto<Manifold3D.Mesh>): number {
        return inputs.mesh.numProp;
    }

    /**
     * Counts the property vertices of a mesh, which can exceed the geometric vertices where
     * neighboring triangles carry different properties.
     * @param inputs - The mesh
     * @returns The number of vertices
     * @group basic
     * @shortname number vertices
     * @drawable false
     * @example
     * ```typescript
     * const vertices = await bitbybit.manifold.mesh.evaluate.numVert({ mesh });
     * ```
     */
    numVert(inputs: Inputs.Manifold.MeshDto<Manifold3D.Mesh>): number {
        return inputs.mesh.numVert;
    }

    /**
     * Counts the triangles of a mesh, which together make its whole surface.
     * @param inputs - The mesh
     * @returns The number of triangles
     * @group basic
     * @shortname number triangles
     * @drawable false
     * @example
     * ```typescript
     * const triangles = await bitbybit.manifold.mesh.evaluate.numTri({ mesh });
     * ```
     */
    numTri(inputs: Inputs.Manifold.MeshDto<Manifold3D.Mesh>): number {
        return inputs.mesh.numTri;
    }

    /**
     * Counts the triangle runs of a mesh: each run is a stretch of consecutive triangles that came
     * from the same instance of the same input shape.
     * @param inputs - The mesh
     * @returns The number of runs
     * @group basic
     * @shortname number runs
     * @drawable false
     * @example
     * ```typescript
     * const runs = await bitbybit.manifold.mesh.evaluate.numRun({ mesh });
     * ```
     */
    numRun(inputs: Inputs.Manifold.MeshDto<Manifold3D.Mesh>): number {
        return inputs.mesh.numRun;
    }

}
