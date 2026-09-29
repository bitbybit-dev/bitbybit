import { createRequire } from "node:module";
import { readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import initOpenCascade from "@bitbybit-dev/occt/bitbybit-dev-occt/index.js";
import { OCCTService, OccHelper, VectorHelperService, ShapesHelperService } from "@bitbybit-dev/occt";

export async function loadKernel(): Promise<OCCTService> {
    const require = createRequire(import.meta.url);
    const kernelDir = dirname(require.resolve("@bitbybit-dev/occt/bitbybit-dev-occt/index.js"));
    const wasmFile = readdirSync(kernelDir).find((file) => file.endsWith(".wasm"));
    if (!wasmFile) throw new Error(`no OCCT kernel (.wasm) found in ${kernelDir}`);
    const occ = await initOpenCascade({ locateFile: (file: string) => (file.endsWith(".wasm") ? join(kernelDir, wasmFile) : file) });
    return new OCCTService(occ, new OccHelper(new VectorHelperService(), new ShapesHelperService(), occ));
}
