import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { isZip, zipEntries, zipEntryData } from "@bitbybit-dev/base/lib/api/services/helpers/files/zip";
import { IFCService } from "@bitbybit-dev/ifc";
import { ManifoldService } from "@bitbybit-dev/manifold";
import { editForValidation } from "./ifc-corpus-edit.mjs";
import { canonicalSets, compareBoxes, compareSemantics, compareVolumes, cutHost, joinBoxes, nodeShape, oracleByGlobalId, oracleInMetres, problemKinds, sameDataSection } from "./ifc-corpus.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BATCH = 2000;
const POINT3_SIZE = 3;
const SET_SAMPLE = 5000;
const EXACT_BOX_DEFLECTION = 1e-4;
const MILLIMETRES_PER_METRE = 1000;
const KILOBYTES_PER_MEGABYTE = 1024;
const BYTES_PER_MEGABYTE = 1024 * 1024;

const args = process.argv.slice(2);
const file = args[0];
const oraclePath = args.includes("--oracle") ? args[args.indexOf("--oracle") + 1] : undefined;
const exact = args.includes("--exact");
const editedFolder = args.includes("--edited") ? args[args.indexOf("--edited") + 1] : undefined;

process.on("uncaughtException", (error) => {
    console.log(JSON.stringify({ failed: error instanceof Error ? error.message : String(error) }));
    process.exit(1);
});

function timed(run) {
    const start = performance.now();
    const value = run();
    return [value, Math.round(performance.now() - start)];
}

async function manifoldService() {
    const { default: Module } = await import(pathToFileURL(path.join(ROOT, "packages/dev/manifold/node_modules/manifold-3d/manifold.js")).href);
    const wasm = await Module();
    wasm.setup();
    return new ManifoldService(wasm);
}

async function occtService() {
    const { OCCTService } = await import("@bitbybit-dev/occt");
    const { default: initOpenCascade } = await import("@bitbybit-dev/occt/bitbybit-dev-occt/index.js");
    const occ = await initOpenCascade({ print: () => undefined, printErr: () => undefined });
    return new OCCTService(occ);
}

function batches(ids) {
    const out = [];
    for (let at = 0; at < ids.length; at += BATCH) { out.push(ids.slice(at, at + BATCH)); }
    return out;
}

const SETTLE_MS = 250;

async function settledBytes() {
    globalThis.gc?.();
    await new Promise((resolve) => setTimeout(resolve, SETTLE_MS));
    globalThis.gc?.();
    const usage = process.memoryUsage();
    return usage.heapUsed + usage.external;
}

const ifc = new IFCService();
const bytes = readFileSync(file);
const beforeStore = await settledBytes();
const [model, openMs] = timed(() => ifc.model.read({ data: bytes }));
const [summary, summaryMs] = timed(() => ifc.model.summary({ model }));
const [elements, queryMs] = timed(() => ifc.model.elements({ model, type: "IfcElement" }));
const owners = new Map();
elements.forEach((element) => owners.set(element.globalId, (owners.get(element.globalId) ?? 0) + 1));
function setsOf(globalId) {
    try {
        return ifc.properties.getSets({ model, element: globalId });
    } catch {
        return undefined;
    }
}
const first = elements.find((element) => owners.get(element.globalId) === 1);
const [, psetsMs] = timed(() => (first === undefined ? [] : setsOf(first.globalId)));
const stride = Math.max(1, Math.ceil(elements.length / SET_SAMPLE));
const sample = elements.filter((element, at) => at % stride === 0 && owners.get(element.globalId) === 1);
const [sampleSets, sampleSetsMs] = timed(() => new Map(sample.flatMap((element) => {
    const sets = setsOf(element.globalId);
    return sets === undefined ? [] : [[element.globalId, canonicalSets(sets)]];
})));
const refusedSets = sample.length - sampleSets.size;
const queryRssMb = Math.round(process.memoryUsage().rss / BYTES_PER_MEGABYTE);
const storeMb = Math.round(((await settledBytes()) - beforeStore) / BYTES_PER_MEGABYTE);
const [recipe, recipeMs] = timed(() => ifc.geometry.recipe({ model }));
const [unsupported] = timed(() => ifc.geometry.unsupported({ model }));
const ids = [...new Set(recipe.roots.map((root) => String(root.tag["globalId"])))];
const metresPerUnit = recipe.millimetresPerUnit / MILLIMETRES_PER_METRE;
const scale = metresPerUnit ** 3;

function boxOf(solid) {
    const { min, max } = solid.boundingBox();
    return { min: min.map((value) => value * metresPerUnit), max: max.map((value) => value * metresPerUnit) };
}

const manifold = await manifoldService();
const volumes = new Map();
const boxes = new Map();
let manifoldMs = 0;
let emptySolids = 0;
let surfaceRoots = 0;
let failedBatches = 0;
const lost = [];
let cutAway = 0;

function boxOfPositions(positions) {
    const min = [Infinity, Infinity, Infinity];
    const max = [-Infinity, -Infinity, -Infinity];
    for (let at = 0; at < positions.length; at += POINT3_SIZE) {
        for (let axis = 0; axis < POINT3_SIZE; axis++) {
            min[axis] = Math.min(min[axis], positions[at + axis] * metresPerUnit);
            max[axis] = Math.max(max[axis], positions[at + axis] * metresPerUnit);
        }
    }
    return { min, max };
}
for (const batch of batches(ids)) {
    const part = ifc.geometry.recipe({ model, elements: batch });
    const start = performance.now();
    let solids = [];
    try {
        solids = manifold.recipes.build({ recipe: part, emptyWhenFailed: true });
    } catch {
        failedBatches++;
    }
    manifoldMs += performance.now() - start;
    const empty = [];
    solids.forEach((solid, index) => {
        const id = String(part.roots[index]?.tag["globalId"]);
        if (solid.isEmpty()) {
            emptySolids++;
            empty.push(index);
        } else {
            volumes.set(id, (volumes.get(id) ?? 0) + Math.abs(solid.volume()) * scale);
            boxes.set(id, joinBoxes(boxes.get(id), boxOf(solid)));
        }
        solid.delete();
    });
    const surfaces = empty.length ? manifold.recipes.surfaceMeshes({ recipe: part, roots: empty }) : [];
    const unbuilt = [];
    surfaces.forEach((surface, at) => {
        const root = part.roots[empty[at]];
        if (surface.triVerts.length > 0) {
            surfaceRoots++;
            const id = String(root?.tag["globalId"]);
            boxes.set(id, joinBoxes(boxes.get(id), boxOfPositions(surface.vertProperties)));
        } else {
            unbuilt.push(root);
        }
    });
    const hosts = unbuilt.map((root) => cutHost(part.nodes, root.node));
    const asked = hosts.flatMap((host, at) => (host === undefined ? [] : [{ node: host, matrix: unbuilt[at].matrix, tag: {} }]));
    const builtHosts = asked.length ? manifold.recipes.build({ recipe: { ...part, roots: asked }, emptyWhenFailed: true }) : [];
    let hostAt = 0;
    unbuilt.forEach((root, at) => {
        const host = hosts[at] === undefined ? undefined : builtHosts[hostAt++];
        if (host !== undefined && !host.isEmpty()) {
            cutAway++;
        } else {
            lost.push(`${String(root.tag["type"])} ${nodeShape(part.nodes, root.node)}`);
        }
    });
    builtHosts.forEach((host) => host.delete());
}

function meshedBoxOf(occt, shape) {
    const loose = occt.operations.boundingBoxOfShape({ shape });
    const precision = Math.max(Math.hypot(...loose.size) * EXACT_BOX_DEFLECTION, Number.EPSILON);
    const min = [Infinity, Infinity, Infinity];
    const max = [-Infinity, -Infinity, -Infinity];
    for (const face of occt.shapeToMesh({ shape, precision, adjustYtoZ: false }).faceList) {
        boxOfPositionsInto(face.vertexCoord, min, max);
    }
    return { min: min.map((value) => value * metresPerUnit), max: max.map((value) => value * metresPerUnit) };
}

function boxOfPositionsInto(positions, min, max) {
    for (let at = 0; at < positions.length; at += POINT3_SIZE) {
        for (let axis = 0; axis < POINT3_SIZE; axis++) {
            min[axis] = Math.min(min[axis], positions[at + axis]);
            max[axis] = Math.max(max[axis], positions[at + axis]);
        }
    }
}

let exactMs;
let exactEmpty;
const exactVolumes = new Map();
const exactBoxes = new Map();
if (exact) {
    const occt = await occtService();
    exactEmpty = 0;
    let building = 0;
    for (const batch of batches(ids)) {
        const part = ifc.geometry.recipe({ model, elements: batch });
        const start = performance.now();
        const shapes = occt.recipes.build({ recipe: part, emptyWhenFailed: true, facetedMeshes: false });
        building += performance.now() - start;
        shapes.forEach((shape, index) => {
            const id = String(part.roots[index]?.tag["globalId"]);
            const faces = occt.shapes.face.getFaces({ shape });
            if (faces.length === 0) {
                exactEmpty++;
            } else {
                const solids = occt.shapes.solid.getSolids({ shape });
                if (solids.length > 0) {
                    exactVolumes.set(id, (exactVolumes.get(id) ?? 0) + solids.reduce((sum, solid) => sum + Math.abs(occt.shapes.solid.getSolidVolume({ shape: solid })), 0) * scale);
                }
                solids.forEach((solid) => solid.delete());
                exactBoxes.set(id, joinBoxes(exactBoxes.get(id), meshedBoxOf(occt, shape)));
            }
            faces.forEach((face) => face.delete());
            shape.delete();
        });
    }
    exactMs = Math.round(building);
}

const [written, writeMs] = timed(() => ifc.model.writeBytes({ model, fileName: path.basename(file) }));
const read = isZip(bytes) ? zipEntryData(bytes, zipEntries(bytes).find((entry) => entry.name.toLowerCase().endsWith(".ifc"))) : bytes;
const oracle = oraclePath === undefined ? undefined : JSON.parse(readFileSync(oraclePath, "utf8"));
const inMetres = oracle === undefined ? undefined : oracleInMetres(oracle, metresPerUnit);
const oracleElements = inMetres === undefined ? undefined : oracleByGlobalId(inMetres.elements);
const sharedGlobalIds = elements.length - new Set(elements.map((element) => element.globalId)).size;

function editedFiles(folder) {
    const { baseline, edited, edits } = editForValidation(ifc, model, recipe.millimetresPerUnit);
    writeFileSync(path.join(folder, "baseline.ifc"), baseline === model ? read : ifc.model.writeBytes({ model: baseline, fileName: "baseline.ifc" }));
    writeFileSync(path.join(folder, "edited.ifc"), ifc.model.writeBytes({ model: edited, fileName: "edited.ifc" }));
    return { edits, editable: edited.editable };
}

const [editing, editMs] = editedFolder === undefined ? [undefined, undefined] : timed(() => editedFiles(editedFolder));

console.log(JSON.stringify({
    bytes: bytes.byteLength,
    schema: summary.schema,
    editable: summary.editable,
    storeys: summary.storeys.length,
    storeMb,
    elements: elements.length,
    sharedGlobalIds,
    openMs,
    summaryMs,
    queryMs,
    psetsMs,
    sampleSetsMs,
    refusedSets,
    queryRssMb,
    recipeMs,
    roots: recipe.roots.length,
    unsupported: unsupported.length,
    unsupportedKinds: problemKinds(unsupported.map((problem) => problem.message)),
    cutAway,
    lostKinds: problemKinds(lost),
    manifoldMs: Math.round(manifoldMs),
    failedBatches,
    emptySolids,
    surfaceRoots,
    exactMs,
    exactEmpty,
    writeMs,
    dataIdentical: sameDataSection(read, written),
    peakRssMb: Math.round(process.resourceUsage().maxRSS / KILOBYTES_PER_MEGABYTE),
    heapMb: Math.round(process.memoryUsage().heapUsed / BYTES_PER_MEGABYTE),
    oracleVersion: oracle?.ifcopenshell,
    unitsAgree: inMetres?.unitsAgree,
    volumes: oracleElements === undefined ? undefined : compareVolumes(volumes, oracleElements),
    boxes: oracleElements === undefined ? undefined : compareBoxes(boxes, oracleElements),
    exactVolumes: oracleElements === undefined || !exact ? undefined : compareVolumes(exactVolumes, oracleElements),
    exactBoxes: oracleElements === undefined || !exact ? undefined : compareBoxes(exactBoxes, oracleElements),
    editing: editing === undefined ? undefined : { ...editing, editMs },
    semantics: oracle?.semantics === undefined ? undefined : compareSemantics({ counts: summary.elementCounts, storeys: new Map(elements.map((element) => [element.globalId, element.storey])), sets: sampleSets }, oracle.semantics),
}));
