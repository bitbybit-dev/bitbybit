import * as Inputs from "../../inputs";
import * as Manifold3D from "manifold-3d";

export class MeshEvaluate {

    private manifold: Manifold3D.ManifoldToplevel;

    constructor(wasm: Manifold3D.ManifoldToplevel) {
        this.manifold = wasm;
    }

    position(inputs: Inputs.Manifold.MeshVertexIndexDto<Manifold3D.Mesh>): Inputs.Base.Point3 {
        const res = inputs.mesh.position(inputs.vertexIndex);
        return [res[0], res[1], res[2]];
    }

    tangent(inputs: Inputs.Manifold.MeshHalfEdgeIndexDto<Manifold3D.Mesh>): number[] {
        const res = inputs.mesh.tangent(inputs.halfEdgeIndex);
        return [res[0], res[1], res[2], res[4]];
    }

    verts(inputs: Inputs.Manifold.MeshTriangleIndexDto<Manifold3D.Mesh>): number[] {
        const res = inputs.mesh.verts(inputs.triangleIndex);
        return [res[0], res[1], res[2]];
    }

    extras(inputs: Inputs.Manifold.MeshVertexIndexDto<Manifold3D.Mesh>): number[] {
        const res = inputs.mesh.extras(inputs.vertexIndex);
        return [...res];
    }

    transform(inputs: Inputs.Manifold.MeshTriangleRunIndexDto<Manifold3D.Mesh>): number[] {
        const res = inputs.mesh.transform(inputs.triangleRunIndex);
        return [...res];
    }

    numProp(inputs: Inputs.Manifold.MeshDto<Manifold3D.Mesh>): number {
        return inputs.mesh.numProp;
    }

    numVert(inputs: Inputs.Manifold.MeshDto<Manifold3D.Mesh>): number {
        return inputs.mesh.numVert;
    }

    numTri(inputs: Inputs.Manifold.MeshDto<Manifold3D.Mesh>): number {
        return inputs.mesh.numTri;
    }

    numRun(inputs: Inputs.Manifold.MeshDto<Manifold3D.Mesh>): number {
        return inputs.mesh.numRun;
    }

}
