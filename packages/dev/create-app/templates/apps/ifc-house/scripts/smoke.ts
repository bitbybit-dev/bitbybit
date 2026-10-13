import { createRequire } from "node:module";
import { readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import Module from "manifold-3d";
import initOpenCascade from "@bitbybit-dev/occt/bitbybit-dev-occt/index.js";
import { OCCTService, OccHelper, VectorHelperService, ShapesHelperService } from "@bitbybit-dev/occt";
import { ManifoldService } from "@bitbybit-dev/manifold";
import { IFCService } from "@bitbybit-dev/ifc";
import { HouseAuthor } from "../src/house/build-house.ts";
import { ROOMS } from "../src/house/house-plan.ts";
import type { HouseIfc, HouseModel } from "../src/house/house-types.ts";

const TIME_STAMP = "2026-01-01T12:00:00";
const STEP_HEADER = "ISO-10303-21";
const REQUIRED: readonly (readonly [string, number])[] = [["IfcWall", 1], ["IfcWindow", 1], ["IfcDoor", 1], ["IfcSlab", 1], ["IfcRoof", 1], ["IfcMember", 1], ["IfcGeographicElement", 1]];

function inProcess(service: object): HouseIfc {
    return service as HouseIfc;
}

const ifc = inProcess(new IFCService());
const problems: string[] = [];
const quiet = (): void => undefined;

async function authorHouse(): Promise<HouseModel> {
    return new HouseAuthor(ifc, quiet).build();
}

function equalBytes(a: Uint8Array, b: Uint8Array): boolean {
    return a.length === b.length && a.every((value, index) => value === b[index]);
}

const authorStarted = Date.now();
const house = await authorHouse();
const authorMs = Date.now() - authorStarted;
const model = house.model;

const summary = await ifc.model.summary({ model });
const counts = summary.elementCounts;
for (const [type, least] of REQUIRED) {
    if ((counts[type] ?? 0) < least) {
        problems.push(`the house has ${String(counts[type] ?? 0)} ${type}, expected at least ${String(least)}`);
    }
}

const unsupported = await ifc.geometry.unsupported({ model });
for (const problem of unsupported) {
    problems.push(`${problem.type} ${problem.globalId} has geometry the recipe cannot describe: ${problem.message}`);
}

const spaces = await ifc.spaces.list({ model });
if (spaces.length !== ROOMS.length) {
    problems.push(`the house has ${String(spaces.length)} rooms, the plan ${String(ROOMS.length)}`);
}
for (const space of spaces.filter((candidate) => candidate.area <= 0)) {
    problems.push(`room ${space.name} has no area`);
}
const netArea = spaces.reduce((sum, space) => sum + space.area, 0);

const recipe = await ifc.geometry.recipe({ model });
const wasm = await Module();
wasm.setup();
const manifold = new ManifoldService(wasm);
const manifoldStarted = Date.now();
const solids = manifold.recipes.build({ recipe, adjustZtoY: true, emptyWhenFailed: true });
const manifoldMs = Date.now() - manifoldStarted;
const empty = recipe.roots.filter((_, index) => solids[index]?.isEmpty() ?? true);
for (const root of empty) {
    problems.push(`Manifold built nothing for ${String(root.tag["type"])} ${String(root.tag["name"])} (${String(root.tag["globalId"])})`);
}
for (const solid of solids) {
    solid.delete();
}

const ifcBytes = await ifc.model.writeBytes({ model, fileName: "house.ifc", timeStamp: TIME_STAMP });
const again = await ifc.model.writeBytes({ model: (await authorHouse()).model, fileName: "house.ifc", timeStamp: TIME_STAMP });
const deterministic = equalBytes(ifcBytes, again);
if (!deterministic) {
    problems.push("two runs wrote different files: something in the house depends on more than its own plan");
}

const require = createRequire(import.meta.url);
const kernelDir = dirname(require.resolve("@bitbybit-dev/occt/bitbybit-dev-occt/index.js"));
const wasmFile = readdirSync(kernelDir).find((file) => file.endsWith(".wasm"));
if (!wasmFile) throw new Error(`no Bitbybit OCCT Kernel (.wasm) found in ${kernelDir}`);
const occ = await initOpenCascade({ locateFile: (file: string): string => (file.endsWith(".wasm") ? join(kernelDir, wasmFile) : file), print: (): void => undefined });
const occt = new OCCTService(occ, new OccHelper(new VectorHelperService(), new ShapesHelperService(), occ));
const stepStarted = Date.now();
const document = occt.recipes.buildDocument({ recipe, name: "Family house", facetedMeshes: true });
const step = occt.assembly.manager.exportDocumentToStep({ document, fileName: "house.step" });
document.delete();
const stepMs = Date.now() - stepStarted;
if (!new TextDecoder().decode(step.subarray(0, STEP_HEADER.length)).startsWith(STEP_HEADER)) {
    problems.push("the STEP export does not start with a STEP header");
}

console.log(JSON.stringify({
    template: "ifc-house",
    schema: summary.schema,
    elements: Object.values(counts).reduce((sum, count) => sum + count, 0),
    walls: counts["IfcWall"] ?? 0,
    windows: counts["IfcWindow"] ?? 0,
    doors: counts["IfcDoor"] ?? 0,
    rooms: spaces.length,
    netArea: Math.round(netArea * 10) / 10,
    recipeRoots: recipe.roots.length,
    emptySolids: empty.length,
    authorMs,
    manifoldMs,
    ifcBytes: ifcBytes.length,
    deterministic,
    stepBytes: step.length,
    stepMs,
    problems,
}));
if (problems.length) {
    process.exit(1);
}
