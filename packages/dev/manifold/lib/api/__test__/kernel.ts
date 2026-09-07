import Module from "manifold-3d";
import { ManifoldService } from "../manifold-service";

// One kernel per process. Manifold's wasm is set up once and shared by every suite in a file; the
// service holds no state of its own beyond the kernel it wraps.
let loaded: ManifoldService | undefined;

export async function getManifold(): Promise<ManifoldService> {
    if (!loaded) {
        const wasm = await Module();
        wasm.setup();
        loaded = new ManifoldService(wasm);
    }
    return loaded;
}
