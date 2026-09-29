import { createRequire } from "node:module";
import { readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import initOpenCascade from "@bitbybit-dev/occt/bitbybit-dev-occt/index.js";
import { OCCTService, OccHelper, VectorHelperService, ShapesHelperService } from "@bitbybit-dev/occt";
import { buildModel, clampParams, defaultParams, flatLengthEstimate, profileArea, removedVolume, type Occt, type PartParams } from "../src/model.ts";
import { bendLines, summarize, toScene, type UnfoldSolidReport } from "../src/flat.ts";
import { accessFromResponse, NO_KEY_CODE } from "../src/cloud-access.ts";

interface PartCheck {
    valid: boolean;
    faces: number;
    volume: number;
    holes: number;
    slots: number;
    bends: number;
    flatEstimate: number;
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
const spans = (box: number[], expected: [number, number, number]): boolean => expected.every((value, i) => Math.abs((box[i] ?? Number.NaN) - value) < 0.001);
const problems: string[] = [];

async function check(name: string, params: PartParams): Promise<PartCheck> {
    const p = clampParams(params);
    const model = await buildModel(occt, params);
    const info = await occt.shapes.solid.debugInfo({ shape: model.shape });
    const bbox = await occt.operations.boundingBoxOfShape({ shape: model.shape });
    const expectedVolume = profileArea(p) * p.depth - removedVolume(p);
    const estimate = flatLengthEstimate(p);
    const expectedMin: [number, number, number] = [-p.baseWidth / 2, 0, -p.depth / 2];
    const expectedMax: [number, number, number] = [p.baseWidth / 2, p.flangeHeight, p.depth / 2];
    const within = spans(bbox.min, expectedMin) && spans(bbox.max, expectedMax);
    if (!info.valid) problems.push(`${name}: the part is not a valid solid`);
    if (Math.abs(model.volume - expectedVolume) > expectedVolume * 1e-4) problems.push(`${name}: volume ${round(model.volume)} is not the thickness times the rounded centre line times the depth minus the mounting features (${round(expectedVolume)}); the sheet is not one thickness along its bends or a feature sits in a bend`);
    if (!within) problems.push(`${name}: the part spans ${JSON.stringify([bbox.min.map(round), bbox.max.map(round)])}, expected ${JSON.stringify([expectedMin, expectedMax])}`);
    if (!(estimate.total > 0 && estimate.total < estimate.outerLengths)) problems.push(`${name}: the flat length estimate ${round(estimate.total)} is not below the outer lengths ${round(estimate.outerLengths)}`);
    return { valid: info.valid, faces: info.nbFaces, volume: round(model.volume), holes: model.mounting.baseHoles.length, slots: model.mounting.flangeSlots.length, bends: estimate.bends, flatEstimate: round(estimate.total) };
}

const report: UnfoldSolidReport[] = [
    { solidIndex: 0, ok: true, thickness: 2, kFactor: 0.44, flatBBox: [0, 0, 150.2, 60], flatArea: 9012, bends: [
        { angleDeg: 90, innerRadius: 2, allowance: 4.52, bendDeduction: 3.48, bendLineLength: 60, lineStart: [30, 0, 0], lineEnd: [30, 60, 0], direction: "up" },
        { angleDeg: 90, innerRadius: 2, allowance: 4.52, bendDeduction: 3.48, bendLineLength: 60, lineStart: [120.2, 0, 0], lineEnd: [120.2, 60, 0], direction: "up" },
    ] },
    { solidIndex: 1, ok: false, error: "no constant thickness found" },
];
const lines = bendLines(report);
const summary = summarize(report);
if (lines.length !== 2) problems.push(`${lines.length} bend lines from a report with two bends`);
if (JSON.stringify(toScene([1, 2, 3])) !== JSON.stringify([1, 3, -2])) problems.push("the flat frame is not mapped onto the ground plane");
if (summary.unfolded !== 1 || summary.bends !== 2 || summary.problems.length !== 1 || round(summary.developedLength ?? 0) !== 150.2) problems.push(`the summary is ${JSON.stringify(summary)}`);

const locked = accessFromResponse(503, { code: NO_KEY_CODE, error: "no key" });
const ready = accessFromResponse(200, { taskId: "t" });
const down = accessFromResponse(0, null);
if (locked.state !== "locked") problems.push(`a 503 with ${NO_KEY_CODE} is ${locked.state}, expected locked`);
if (ready.state !== "ready") problems.push(`a 200 is ${ready.state}, expected ready`);
if (down.state !== "unreachable") problems.push(`no answer is ${down.state}, expected unreachable`);

console.log(JSON.stringify({
    template: "sheet-metal-unfold/frontend",
    params: defaultParams,
    default: await check("default", defaultParams),
    noLip: await check("noLip", { ...defaultParams, lipHeight: 0 }),
    thick: await check("thick", { ...defaultParams, thickness: 4, bendRadius: 6, flangeHeight: 80 }),
    cloud: { bendLines: lines.length, summary, access: { locked: locked.state, ready: ready.state, backendDown: down.state } },
}));

if (problems.length) {
    console.error(`smoke: ${problems.join("; ")}`);
    process.exit(1);
}
