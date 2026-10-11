import Module from "manifold-3d";
import { ManifoldService } from "../manifold-service";

let sharedKernel: ManifoldService | undefined;

export async function getManifold(): Promise<ManifoldService> {
    if (!sharedKernel) {
        const wasm = await Module();
        wasm.setup();
        sharedKernel = new ManifoldService(wasm);
    }
    return sharedKernel;
}
