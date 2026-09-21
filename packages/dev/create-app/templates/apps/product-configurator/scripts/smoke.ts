import { createRequire } from "node:module";
import { readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import initOpenCascade from "@bitbybit-dev/occt/bitbybit-dev-occt/index.js";
import { OCCTService, OccHelper, VectorHelperService, ShapesHelperService } from "@bitbybit-dev/occt";
import { bottomSize, buildModel, clampParams, defaultParams, drainageHoleCenters, STYLE, type Occt, type PlanterParams } from "../src/model.ts";
import { PRESETS, quoteFor } from "../src/catalog.ts";

interface PlanterCheck {
    valid: boolean;
    faces: number;
    edges: number;
    volume: number;
    surfaceArea: number;
    price: number;
}

function inProcess(service: object): Occt {
    return service as Occt;
}

const require = createRequire(import.meta.url);
const kernelDir = dirname(require.resolve("@bitbybit-dev/occt/bitbybit-dev-occt/index.js"));
const wasmFile = readdirSync(kernelDir).find((file) => file.endsWith(".wasm"));
if (!wasmFile) throw new Error(`no OCCT kernel (.wasm) found in ${kernelDir}`);
const occ = await initOpenCascade({ locateFile: (file: string) => (file.endsWith(".wasm") ? join(kernelDir, wasmFile) : file) });
const occt = inProcess(new OCCTService(occ, new OccHelper(new VectorHelperService(), new ShapesHelperService(), occ)));

const round = (n: number): number => Math.round(n * 1000) / 1000;
const spans = (box: number[], expected: [number, number, number], tolerance: number): boolean => expected.every((value, i) => Math.abs((box[i] ?? Number.NaN) - value) < tolerance);

const TOLERANCE = STYLE.rimRadius;
const problems: string[] = [];

async function check(name: string, params: PlanterParams): Promise<PlanterCheck> {
    const p = clampParams(params);
    const model = await buildModel(occt, params);
    const info = await occt.shapes.solid.debugInfo({ shape: model.shape });
    const bbox = await occt.operations.boundingBoxOfShape({ shape: model.shape });
    const quote = quoteFor(p, model);
    const expectedMin: [number, number, number] = [-p.width / 2, 0, -p.depth / 2];
    const expectedMax: [number, number, number] = [p.width / 2, p.height, p.depth / 2];
    const within = spans(bbox.min, expectedMin, TOLERANCE) && spans(bbox.max, expectedMax, TOLERANCE);
    const solidVolume = p.width * p.depth * p.height;

    const bottom = bottomSize(p);
    const inside = p.wallThickness + STYLE.lipStep;
    const leastCavity = (bottom.width - 2 * inside) * (bottom.depth - 2 * inside) * (p.height - p.wallThickness);
    if (!info.valid) problems.push(`${name}: the planter is not a valid solid`);
    if (!(model.volume > 0)) problems.push(`${name}: the planter has no volume`);
    if (!(model.volume < solidVolume - leastCavity)) problems.push(`${name}: the planter is not hollow (volume ${round(model.volume)} is not below the block's ${solidVolume} less the least cavity ${round(leastCavity)})`);
    if (!within) problems.push(`${name}: the bounding box ${JSON.stringify([bbox.min, bbox.max])} is not the declared ${JSON.stringify([expectedMin, expectedMax])}`);
    if (!(Number.isFinite(quote.total) && quote.total > 0)) problems.push(`${name}: the quote is ${quote.total}`);
    if (drainageHoleCenters(p).length !== p.drainageHoles) problems.push(`${name}: ${drainageHoleCenters(p).length} hole centers for ${p.drainageHoles} holes`);
    return { valid: info.valid, faces: info.nbFaces, edges: info.nbEdges, volume: round(model.volume), surfaceArea: round(model.surfaceArea), price: quote.total };
}

const summary = {
    template: "product-configurator",
    params: defaultParams,
    default: await check("default", defaultParams),
    presets: Object.fromEntries(await Promise.all(Object.entries(PRESETS).map(async ([id, preset]): Promise<[string, PlanterCheck]> => [id, await check(id, preset.params)]))),
};
console.log(JSON.stringify(summary));

if (problems.length) {
    console.error(`smoke: ${problems.join("; ")}`);
    process.exit(1);
}
