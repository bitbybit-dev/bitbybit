import type * as Manifold3D from "manifold-3d";
import { handlesIn, ledgerRun, namesOf, watchConstructorOf, watchModule, watchSurface } from "../../../../__test__/embind-ledger";
import { MANIFOLD_LEDGER } from "../../../../__test__/kernel-ledger-options";

export { handlesIn, ledgerRun, namesOf, MANIFOLD_LEDGER };

export async function watchManifold(wasm: Manifold3D.ManifoldToplevel, context?: () => string | undefined): Promise<Manifold3D.ManifoldToplevel> {
    const [{ ManifoldService }, { manifoldDtoRegistry }] = await Promise.all([
        import("../manifold-service"),
        import("../dto-registry"),
    ]);
    const setup = wasm.setup;
    wasm.setup = (): void => {
        setup.call(wasm);
        watchModule(wasm, MANIFOLD_LEDGER);
        watchConstructorOf(wasm.Manifold.prototype);
        watchSurface({ root: new ManifoldService(wasm), paths: Object.keys(manifoldDtoRegistry), ...(context === undefined ? {} : { context }) });
    };
    return wasm;
}
