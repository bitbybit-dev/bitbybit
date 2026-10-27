import type * as Manifold3D from "manifold-3d";
import type { KernelManifoldConstructor, ManifoldErrorConstructor } from "./manifold-of-mesh-types";

export function manifoldOfMesh(wasm: Manifold3D.ManifoldToplevel, mesh: Manifold3D.Mesh): Manifold3D.Manifold {
    const KernelManifold = Reflect.get(wasm.Manifold.prototype, "constructor") as KernelManifoldConstructor;
    const solid = new KernelManifold(mesh);
    const status = solid.status();
    if (status === "NoError") {
        return solid;
    }
    solid.delete();
    const ManifoldError = Reflect.get(wasm, "ManifoldError") as ManifoldErrorConstructor;
    throw new ManifoldError(status);
}
