import { createRequire } from "node:module";
import { readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import initOpenCascade from "@bitbybit-dev/occt/bitbybit-dev-occt/index.js";
import { OCCTService } from "@bitbybit-dev/occt";
import { buildModel, defaultParams, type Occt } from "../src/model.ts";

function inProcess(service: object): Occt {
    return service as Occt;
}

const require = createRequire(import.meta.url);
const kernelDir = dirname(require.resolve("@bitbybit-dev/occt/bitbybit-dev-occt/index.js"));
const wasmFile = readdirSync(kernelDir).find((file) => file.endsWith(".wasm"));
if (!wasmFile) throw new Error(`no Bitbybit OCCT Kernel (.wasm) found in ${kernelDir}`);
const occ = await initOpenCascade({ locateFile: (file: string) => (file.endsWith(".wasm") ? join(kernelDir, wasmFile) : file) });
const occt = inProcess(new OCCTService(occ));

const shape = await buildModel(occt, defaultParams);
const info = await occt.shapes.solid.debugInfo({ shape });
const valid = await occt.shapeFix.isValid({ shape });
const bbox = await occt.analysis.measure.tightBoundingBox({ shape });
const round = (n: number): number => Math.round(n * 1000) / 1000;

console.log(JSON.stringify({
    template: "vite-threejs",
    params: defaultParams,
    valid,
    faces: info.nbFaces,
    edges: info.nbEdges,
    volume: round(info.volume),
    area: round(info.area),
    bbox: { min: bbox.min.map(round), max: bbox.max.map(round) },
}));

const problems: string[] = [];
if (!valid) problems.push("the model is not a valid solid");
if (!(info.volume > 0)) problems.push("the model has no volume");
if (problems.length) {
    console.error(`smoke: ${problems.join("; ")}`);
    process.exit(1);
}
