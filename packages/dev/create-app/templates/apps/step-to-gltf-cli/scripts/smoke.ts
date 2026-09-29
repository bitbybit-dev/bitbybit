import { spawnSync, type SpawnSyncReturns } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { convertFile, isGlb } from "../src/convert.js";
import { CAD_CLOUD_URL, NO_KEY_EXIT, STUDIO_KEYS_URL } from "../src/cloud.js";
import { expandInputs, parseArgs } from "../src/cli.js";
import { loadKernel } from "../src/kernel.js";

const SAMPLE = "samples/bracket.step";
const EXPECTED: { solids: number; faces: number; edges: number; volume: number; bbox: { min: [number, number, number]; max: [number, number, number] } } = { solids: 1, faces: 39, edges: 84, volume: 11837.245, bbox: { min: [-30, 0, -20], max: [30, 12, 20] } };
const problems: string[] = [];
const close = (a: number, b: number): boolean => Math.abs(a - b) <= Math.max(1e-3, Math.abs(b) * 1e-6);
const matches = (actual: number[], expected: [number, number, number]): boolean => expected.every((value, i) => close(actual[i] ?? Number.NaN, value));

const occt = await loadKernel();
const converted = convertFile(occt, "bracket.step", readFileSync(SAMPLE, "utf8"));
const s = converted.stats;
if (!isGlb(converted.glb) || converted.glb.byteLength < 1000) problems.push(`the GLB is not a glTF binary (${converted.glb.byteLength} bytes)`);
if (!converted.stl?.startsWith("solid")) problems.push("the STL does not start with an ASCII solid record");
if (s.solids !== EXPECTED.solids || s.faces !== EXPECTED.faces || s.edges !== EXPECTED.edges) problems.push(`counts ${s.solids}/${s.faces}/${s.edges} (solids/faces/edges), expected ${EXPECTED.solids}/${EXPECTED.faces}/${EXPECTED.edges}`);
if (!close(s.volume, EXPECTED.volume)) problems.push(`volume ${s.volume}, expected ${EXPECTED.volume}`);
if (!matches(s.bbox.min, EXPECTED.bbox.min) || !matches(s.bbox.max, EXPECTED.bbox.max)) problems.push(`bounding box ${JSON.stringify(s.bbox)}, expected ${JSON.stringify(EXPECTED.bbox)}`);

const parsed = parseArgs(["samples", "--out", "x", "--precision", "0.01", "--no-stl"]);
if (parsed.out !== "x" || parsed.options.meshPrecision !== 0.01 || parsed.options.stl || parsed.cloud) problems.push(`arguments parsed as ${JSON.stringify(parsed)}`);
if (expandInputs(["samples"]).length !== 1) problems.push("a directory does not expand to its CAD files");

const out = mkdtempSync(join(tmpdir(), "step-to-gltf-"));
const run = (args: string[], env: NodeJS.ProcessEnv): SpawnSyncReturns<string> => spawnSync("npx", ["tsx", "src/cli.ts", ...args], { encoding: "utf8", env: { ...process.env, ...env } });
const local = run([SAMPLE, "--out", out], {});
if (local.status !== 0) problems.push(`the CLI failed on the sample: ${local.stderr}`);
for (const file of ["bracket.glb", "bracket.stl", "bracket.json"]) if (!existsSync(join(out, file))) problems.push(`the CLI did not write ${file}`);
const written = existsSync(join(out, "bracket.json")) ? (JSON.parse(readFileSync(join(out, "bracket.json"), "utf8")) as { faces: number; source: string }) : null;
if (written?.faces !== EXPECTED.faces || written.source !== "in-process") problems.push(`the stats file says ${JSON.stringify(written)}`);

const cloudEnv: NodeJS.ProcessEnv = { ...process.env };
delete cloudEnv["BITBYBIT_API_KEY"];
const cloud = spawnSync("npx", ["tsx", "src/cli.ts", SAMPLE, "--cloud", "--out", out], { encoding: "utf8", env: cloudEnv });
if (cloud.status !== NO_KEY_EXIT) problems.push(`--cloud without a key exited ${String(cloud.status)}, expected ${NO_KEY_EXIT}`);
if (!cloud.stderr.includes(CAD_CLOUD_URL) || !cloud.stderr.includes(STUDIO_KEYS_URL)) problems.push("--cloud without a key does not say where to get one");
if (!cloud.stderr.includes("in-process")) problems.push("--cloud without a key does not say that the local conversion is the free answer");
rmSync(out, { recursive: true, force: true });

console.log(JSON.stringify({ template: "step-to-gltf-cli", sample: s, cli: { exit: local.status, files: 3 }, cloudWithoutKey: { exit: cloud.status } }));
if (problems.length) {
    console.error(`smoke: ${problems.join("; ")}`);
    process.exit(1);
}
