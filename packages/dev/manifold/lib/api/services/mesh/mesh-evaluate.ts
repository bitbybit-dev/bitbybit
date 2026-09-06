import * as Inputs from "../../inputs";
import * as Manifold3D from "manifold-3d";

/**
 * Contains various functions for Solid meshes from Manifold library https://github.com/elalish/manifold
 * Thanks Manifold community for developing this kernel
 */
export class MeshEvaluate {

    constructor(_wasm: Manifold3D.ManifoldToplevel) {
    }

    /**
     * Get position on mesh vertex index
     * @param inputs mesh
     * @returns point
     * @group basic
     * @shortname position
     * @drawable true
     */
    position(inputs: Inputs.Manifold.MeshVertexIndexDto<Manifold3D.Mesh>): Inputs.Base.Point3 {
        const res = inputs.mesh.position(inputs.vertexIndex);
        return [res[0]!, res[1]!, res[2]!];
    }

    /**
     * Gets the tangent vector starting at verts(tri)[j] pointing to the next
     * Bezier point along the CCW edge. The fourth value is its weight.
     * @param inputs mesh
     * @returns tangent
     * @group basic
     * @shortname tangent
     * @drawable true
     */
    tangent(inputs: Inputs.Manifold.MeshHalfEdgeIndexDto<Manifold3D.Mesh>): number[] {
        const res = inputs.mesh.tangent(inputs.halfEdgeIndex);
        return [res[0]!, res[1]!, res[2]!, res[4]!];
    }

    /**
     * Gets the three vertex indices of this triangle in CCW order.
     * @param inputs mesh
     * @returns verts
     * @group basic
     * @shortname verts
     * @drawable false
     */
    verts(inputs: Inputs.Manifold.MeshTriangleIndexDto<Manifold3D.Mesh>): number[] {
        const res = inputs.mesh.verts(inputs.triangleIndex);
        return [res[0]!, res[1]!, res[2]!];
    }

    /**
     * Gets any other properties associated with this vertex.
     * @param inputs mesh
     * @returns extras
     * @group basic
     * @shortname extras
     * @drawable false
     */
    extras(inputs: Inputs.Manifold.MeshVertexIndexDto<Manifold3D.Mesh>): number[] {
        const res = inputs.mesh.extras(inputs.vertexIndex);
        return [...res];
    }

    /**
     * Gets the column-major 4x4 matrix transform from the original mesh to these
     * related triangles.
     * @param inputs mesh
     * @returns transform matrix
     * @group basic
     * @shortname transform 4x4 matrix
     * @drawable false
     */
    transform(inputs: Inputs.Manifold.MeshTriangleRunIndexDto<Manifold3D.Mesh>): number[] {
        const res = inputs.mesh.transform(inputs.triangleRunIndex);
        return [...res];
    }

    /**
     * Number of properties per vertex, always >= 3.
     * @param inputs mesh
     * @returns number of properties
     * @group basic
     * @shortname number props
     * @drawable false
     */
    numProp(inputs: Inputs.Manifold.MeshDto<Manifold3D.Mesh>): number {
        return inputs.mesh.numProp;
    }

    /**
     * Number of property vertices
     * @param inputs mesh
     * @returns number of vertices
     * @group basic
     * @shortname number vertices
     * @drawable false
     */
    numVert(inputs: Inputs.Manifold.MeshDto<Manifold3D.Mesh>): number {
        return inputs.mesh.numVert;
    }

    /**
     * Get number of triangles on mesh
     * @param inputs mesh
     * @returns number of triangles
     * @group basic
     * @shortname number triangles
     * @drawable false
     */
    numTri(inputs: Inputs.Manifold.MeshDto<Manifold3D.Mesh>): number {
        return inputs.mesh.numTri;
    }

    /**
     * Number of triangle runs. Each triangle run is a set of consecutive
     * triangles that all come from the same instance of the same input mesh.
     * @param inputs mesh
     * @returns number of runs
     * @group basic
     * @shortname number runs
     * @drawable false
     */
    numRun(inputs: Inputs.Manifold.MeshDto<Manifold3D.Mesh>): number {
        return inputs.mesh.numRun;
    }

}
