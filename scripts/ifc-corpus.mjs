#!/usr/bin/env node
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { createReadStream, createWriteStream, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, renameSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { Readable, Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const CORPUS = path.join(ROOT, "packages/dev/ifc/corpus");
export const MANIFEST = path.join(CORPUS, "corpus.json");
export const FILES = path.join(CORPUS, "files");
export const CACHE = path.join(CORPUS, ".cache");
const ORACLE = path.join(CORPUS, "oracle.py");
const VALIDATE = path.join(CORPUS, "validate.py");
const MEASURE = path.join(ROOT, "scripts/ifc-corpus-measure.mjs");
const RESOLVE = path.join(ROOT, "scripts/lib/dist-resolve.mjs");
const PRIVATE_VARIABLE = "IFC_PRIVATE_CORPUS";
const PYTHON = process.env["IFC_PYTHON"] ?? "python3";
export const USER_AGENT = "bitbybit-ifc-corpus (+https://github.com/bitbybit-dev/bitbybit)";
const RETRIES = 3;
const RETRY_WAIT_MS = 2000;
const OUTPUT_LIMIT = 1024 * 1024 * 1024;
const MEASURE_HEAP_MB = 16384;
const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SHA256 = /^[0-9a-f]{64}$/;
const SCHEMAS = new Set(["IFC2X3", "IFC4", "IFC4X3", "IFC4X3_ADD2"]);
export const VOLUME_TOLERANCE = 0.01;
export const VOLUME_FLOOR_M3 = 1e-6;
export const BOX_TOLERANCE = 0.01;
export const BOX_FLOOR_M = 0.001;
const UNIT_TOLERANCE = 1e-9;
const WORST_LISTED = 10;
const ORACLE_FAILURE_KEPT = 600;
const ORACLE_LINE = "{\"ifcopenshell\"";
const VALIDATION_LINE = "{\"baselineErrors\"";
const EDITED_SCHEMAS = new Set(["IFC2X3", "IFC4", "IFC4X3_ADD2"]);
const EDITED_BYTES_LIMIT = 20 * 1024 * 1024;
const DATA_START = "\nDATA;";
const DATA_END = "\nENDSEC;";

export function manifestProblems(manifest) {
    if (!manifest || !Array.isArray(manifest.files)) {
        return ["the manifest has no files list"];
    }
    const problems = [];
    const seen = new Set();
    manifest.files.forEach((entry, index) => {
        const where = `files[${index}]${typeof entry?.id === "string" ? ` (${entry.id})` : ""}`;
        if (typeof entry?.id !== "string" || !ID.test(entry.id)) { problems.push(`${where}: the id is not kebab-case`); }
        else if (seen.has(entry.id)) { problems.push(`${where}: the id is used twice`); }
        else { seen.add(entry.id); }
        if (typeof entry?.url !== "string" || !entry.url.startsWith("https://")) { problems.push(`${where}: the url is not https`); }
        if (typeof entry?.sha256 !== "string" || !SHA256.test(entry.sha256)) { problems.push(`${where}: the sha256 is not 64 hexadecimal digits`); }
        if (!Number.isSafeInteger(entry?.bytes) || entry.bytes <= 0) { problems.push(`${where}: bytes is not a positive whole number`); }
        if (!SCHEMAS.has(entry?.schema)) { problems.push(`${where}: the schema ${String(entry?.schema)} is not one the library reads`); }
        if (typeof entry?.licence !== "string" || entry.licence.trim() === "") { problems.push(`${where}: the licence is not stated`); }
        if (!Array.isArray(entry?.features)) { problems.push(`${where}: features is not a list`); }
    });
    return problems;
}

const IFC_EXTENSION = ".ifc";
const ARCHIVE_EXTENSION = ".ifczip";
const extensionOf = (url) => (new URL(url).pathname.toLowerCase().endsWith(ARCHIVE_EXTENSION) ? ARCHIVE_EXTENSION : IFC_EXTENSION);
export const fileOf = (entry) => path.join(FILES, `${entry.id}${extensionOf(entry.url)}`);

export function hashFile(file) {
    return new Promise((resolve, reject) => {
        const hash = createHash("sha256");
        createReadStream(file).on("data", (chunk) => hash.update(chunk)).on("error", reject).on("end", () => resolve(hash.digest("hex")));
    });
}

export async function verify(entry, file) {
    if (!existsSync(file)) {
        return `${entry.id} is missing`;
    }
    const size = statSync(file).size;
    if (size !== entry.bytes) {
        return `${entry.id} has ${size} bytes, the manifest says ${entry.bytes}`;
    }
    const digest = await hashFile(file);
    return digest === entry.sha256 ? null : `${entry.id} has sha256 ${digest}, the manifest says ${entry.sha256}`;
}

export async function download(entry, target, fetchImpl = fetch, wait = RETRY_WAIT_MS) {
    let last = "";
    for (let attempt = 1; attempt <= RETRIES; attempt++) {
        const part = `${target}.part`;
        try {
            const response = await fetchImpl(entry.url, { redirect: "follow", headers: { "user-agent": USER_AGENT } });
            if (!response.ok || response.body === null) {
                last = `HTTP ${response.status}`;
                if (response.status === 404) { break; }
            } else {
                mkdirSync(path.dirname(target), { recursive: true });
                const hash = createHash("sha256");
                const hashing = new Transform({ transform(chunk, _encoding, done) { hash.update(chunk); done(null, chunk); } });
                await pipeline(Readable.fromWeb(response.body), hashing, createWriteStream(part));
                const digest = hash.digest("hex");
                const size = statSync(part).size;
                if (digest !== entry.sha256 || size !== entry.bytes) {
                    rmSync(part, { force: true });
                    return `${entry.id} downloaded with sha256 ${digest} and ${size} bytes, the manifest says ${entry.sha256} and ${entry.bytes}`;
                }
                renameSync(part, target);
                return null;
            }
        } catch (error) {
            rmSync(part, { force: true });
            last = error instanceof Error ? error.message : String(error);
        }
        await new Promise((resolve) => setTimeout(resolve, wait * attempt));
    }
    return `${entry.id} could not be downloaded from ${entry.url}: ${last}`;
}

export function privateFiles(dir) {
    if (!dir) { return []; }
    return readdirSync(dir).filter((name) => [IFC_EXTENSION, ARCHIVE_EXTENSION].some((extension) => name.toLowerCase().endsWith(extension))).sort().map((name, index) => ({ id: `private-${index + 1}`, file: path.join(dir, name), private: true }));
}

export function joinBoxes(a, b) {
    if (!a) { return b; }
    if (!b) { return a; }
    return { min: a.min.map((value, axis) => Math.min(value, b.min[axis])), max: a.max.map((value, axis) => Math.max(value, b.max[axis])) };
}

function joinOracle(known, element) {
    const ok = known.status === "ok" && element.status === "ok";
    const status = known.status === "ok" ? element.status : known.status;
    const box = ok ? joinBoxes(known.min ? known : undefined, element.min ? element : undefined) : undefined;
    const closed = known.closed !== false && element.closed !== false;
    return { globalId: known.globalId, type: known.type, entities: known.entities + 1, status, ...(ok ? { closed, volume: known.volume + element.volume, min: box?.min ?? null, max: box?.max ?? null } : {}) };
}

export function oracleByGlobalId(elements) {
    const byGlobalId = new Map();
    for (const element of elements) {
        const known = byGlobalId.get(element.globalId);
        byGlobalId.set(element.globalId, known === undefined ? { ...element, entities: 1 } : joinOracle(known, element));
    }
    return [...byGlobalId.values()];
}

export function oracleInMetres(oracle, ourMetresPerUnit) {
    const metres = oracle.metresPerUnit ?? ourMetresPerUnit;
    const scaled = (point) => (Array.isArray(point) ? point.map((value) => value * metres) : point);
    return {
        unitsAgree: oracle.metresPerUnit === null || oracle.metresPerUnit === undefined ? undefined : relativeDifference(ourMetresPerUnit, oracle.metresPerUnit) < UNIT_TOLERANCE,
        elements: oracle.elements.map((element) => (element.status === "ok" ? { ...element, volume: element.volume * metres ** 3, area: element.area * metres ** 2, min: scaled(element.min), max: scaled(element.max) } : element)),
    };
}

export function relativeDifference(ours, theirs) {
    return Math.abs(ours - theirs) / Math.max(Math.abs(theirs), VOLUME_FLOOR_M3);
}

export function compareVolumes(ours, oracle) {
    const built = oracle.filter((element) => element.status === "ok");
    const measured = built.filter((element) => element.closed !== false);
    const rows = measured.filter((element) => ours.has(element.globalId)).map((element) => {
        const volume = ours.get(element.globalId);
        return { globalId: element.globalId, type: element.type, ours: volume, theirs: element.volume, difference: relativeDifference(volume, element.volume) };
    });
    const tiny = rows.filter((row) => Math.abs(row.ours - row.theirs) <= VOLUME_FLOOR_M3);
    const agreeing = rows.filter((row) => row.difference <= VOLUME_TOLERANCE || tiny.includes(row));
    return {
        oracleElements: oracle.length,
        oracleFailed: oracle.length - built.length,
        oracleOpen: built.length - measured.length,
        compared: rows.length,
        missing: measured.filter((element) => !ours.has(element.globalId)).length,
        agreeing: agreeing.length,
        worst: rows.filter((row) => !agreeing.includes(row)).sort((a, b) => b.difference - a.difference).slice(0, WORST_LISTED),
    };
}

export function boxOffset(ours, theirs) {
    const diagonal = Math.hypot(...theirs.max.map((value, axis) => value - theirs.min[axis]));
    const offsets = theirs.min.flatMap((value, axis) => [Math.abs(ours.min[axis] - value), Math.abs(ours.max[axis] - theirs.max[axis])]);
    return { offset: Math.max(...offsets), allowed: Math.max(diagonal * BOX_TOLERANCE, BOX_FLOOR_M) };
}

export function compareBoxes(ours, oracle) {
    const measured = oracle.filter((element) => element.status === "ok" && Array.isArray(element.min) && Array.isArray(element.max));
    const rows = measured.filter((element) => ours.has(element.globalId)).map((element) => ({ globalId: element.globalId, type: element.type, ...boxOffset(ours.get(element.globalId), element) }));
    const differing = rows.filter((row) => row.offset > row.allowed);
    return { compared: rows.length, agreeing: rows.length - differing.length, missing: measured.length - rows.length, worst: differing.sort((a, b) => b.offset - a.offset).slice(0, WORST_LISTED) };
}

export function canonicalSets(sets) {
    return sets.map((set) => `${set.name}:${Object.keys(set.properties).length}`).sort();
}

export function compareSemantics(ours, theirs) {
    const types = [...new Set([...Object.keys(ours.counts), ...Object.keys(theirs.counts)])];
    const owners = new Map();
    theirs.elements.forEach((element) => owners.set(element.globalId, (owners.get(element.globalId) ?? 0) + 1));
    const unique = theirs.elements.filter((element) => owners.get(element.globalId) === 1);
    const placed = unique.filter((element) => ours.storeys.has(element.globalId));
    const described = unique.filter((element) => ours.sets.has(element.globalId));
    const differences = [
        ...types.filter((type) => (ours.counts[type] ?? 0) !== (theirs.counts[type] ?? 0)).map((type) => ({ kind: "count", type, ours: ours.counts[type] ?? 0, theirs: theirs.counts[type] ?? 0 })),
        ...placed.filter((element) => ours.storeys.get(element.globalId) !== element.storey).map((element) => ({ kind: "storey", globalId: element.globalId, ours: ours.storeys.get(element.globalId), theirs: element.storey })),
        ...described.filter((element) => ours.sets.get(element.globalId).join("|") !== element.sets.join("|")).map((element) => ({ kind: "sets", globalId: element.globalId, ours: ours.sets.get(element.globalId), theirs: element.sets })),
    ];
    const differing = (kind) => differences.filter((difference) => difference.kind === kind).length;
    return {
        types: { compared: types.length, agreeing: types.length - differing("count") },
        storeys: { compared: placed.length, agreeing: placed.length - differing("storey"), missing: unique.length - placed.length },
        propertySets: { compared: described.length, agreeing: described.length - differing("sets") },
        sharedGlobalIds: theirs.elements.length - unique.length,
        worst: differences.slice(0, WORST_LISTED),
    };
}

export function dataSection(bytes) {
    const text = Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const start = text.indexOf(DATA_START);
    const end = text.lastIndexOf(DATA_END);
    return start < 0 || end < start ? undefined : text.subarray(start, end);
}

export function sameDataSection(a, b) {
    const left = dataSection(a);
    const right = dataSection(b);
    return left !== undefined && right !== undefined && left.equals(right);
}

const readManifest = () => JSON.parse(readFileSync(MANIFEST, "utf8"));

function selected(entries, args) {
    const only = args.includes("--only") ? args[args.indexOf("--only") + 1] : undefined;
    return only === undefined ? entries : entries.filter((entry) => entry.id.includes(only));
}

function available(args) {
    const listed = readManifest().files.map((entry) => ({ ...entry, file: fileOf(entry) })).filter((entry) => existsSync(entry.file));
    return selected([...listed, ...privateFiles(process.env[PRIVATE_VARIABLE])], args);
}

async function fetchAll(args, checkOnly) {
    const manifest = readManifest();
    const problems = manifestProblems(manifest);
    let fetched = 0;
    let present = 0;
    for (const entry of problems.length ? [] : selected(manifest.files, args)) {
        const target = fileOf(entry);
        const problem = await verify(entry, target);
        if (problem === null) {
            present++;
        } else if (checkOnly || existsSync(target)) {
            problems.push(problem);
        } else {
            const failure = await download(entry, target);
            if (failure === null) { fetched++; }
            else { problems.push(failure); }
        }
    }
    console.log(`ifc corpus: ${present} present, ${fetched} downloaded, ${problems.length} problem(s)`);
    problems.forEach((problem) => console.log(`  ${problem}`));
    return problems.length === 0;
}

const GLOBAL_ID = /(?<![0-9A-Za-z_$])[0-9A-Za-z_$]{22}(?![0-9A-Za-z_$])/g;

export function withoutPath(entry, text) {
    return entry.private ? text.split(entry.file).join(entry.id).split(path.basename(entry.file)).join(entry.id).replace(GLOBAL_ID, "<GlobalId>") : text;
}

const ENTITY_ID = /#\d+/g;
const ENTITY_NAME = /^Ifc[A-Z][A-Za-z0-9]*$/;

export function problemKinds(messages) {
    const kinds = new Map();
    for (const message of messages) {
        const kind = message.replace(GLOBAL_ID, (token) => (ENTITY_NAME.test(token) ? token : "<GlobalId>")).replace(ENTITY_ID, "#n");
        kinds.set(kind, (kinds.get(kind) ?? 0) + 1);
    }
    return Object.fromEntries([...kinds].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])));
}

export function nodeShape(nodes, index) {
    const node = nodes[index];
    switch (node?.op) {
        case undefined: return "missing";
        case "transform": return nodeShape(nodes, node.of);
        case "voids": return `voids(${nodeShape(nodes, node.host)})`;
        case "difference": return `difference(${nodeShape(nodes, node.of)})`;
        case "compound": return `compound(${[...new Set(node.of.map((child) => nodeShape(nodes, child)))].sort().join(",")})`;
        default: return node.op;
    }
}

export function cutHost(nodes, index) {
    const node = nodes[index];
    switch (node?.op) {
        case "transform": return cutHost(nodes, node.of);
        case "voids": return node.host;
        case "difference": return node.of;
        default: return undefined;
    }
}

const withoutWorst = (comparison) => (comparison === undefined ? undefined : { ...comparison, worst: undefined });

export function reportRow(entry, result) {
    const row = { id: entry.id, private: entry.private === true, schema: entry.schema, exporter: entry.exporter, ...result };
    if (!entry.private) { return row; }
    const scrubbed = (text) => (text === undefined ? undefined : withoutPath(entry, text));
    const editing = row.editing === undefined ? undefined : { ...row.editing, sample: undefined, edits: row.editing.edits?.map((edit) => ({ ...edit, refused: scrubbed(edit.refused) })) };
    return { ...row, editing, failed: scrubbed(result.failed), oracleFailed: scrubbed(result.oracleFailed), volumes: withoutWorst(row.volumes), boxes: withoutWorst(row.boxes), exactVolumes: withoutWorst(row.exactVolumes), exactBoxes: withoutWorst(row.exactBoxes), semantics: withoutWorst(row.semantics) };
}

export function oracleJsonOf(stdout) {
    return stdout.split("\n").reverse().find((line) => line.startsWith(ORACLE_LINE));
}

export function oracleCacheDir(entry) {
    return entry.private ? path.join(path.dirname(entry.file), ".bitbybit-oracle") : path.join(CACHE, "oracle");
}

async function oracleOf(entry) {
    const [digest, oracleDigest] = await Promise.all([hashFile(entry.file), hashFile(ORACLE)]);
    const cached = path.join(oracleCacheDir(entry), `${digest.slice(0, 16)}-${oracleDigest.slice(0, 8)}.json`);
    if (existsSync(cached)) { return cached; }
    const run = spawnSync(PYTHON, [ORACLE, entry.file], { encoding: "utf8", maxBuffer: OUTPUT_LIMIT });
    if (run.error !== undefined || run.status !== 0) {
        throw new Error(withoutPath(entry, `IfcOpenShell could not measure ${entry.id} with '${PYTHON}'. Set IFC_PYTHON to a Python with IfcOpenShell 0.9.\n${run.error?.message ?? run.stderr.slice(-2000)}`));
    }
    const json = oracleJsonOf(run.stdout);
    if (json === undefined) {
        throw new Error(`IfcOpenShell wrote no measurements for ${entry.id}`);
    }
    mkdirSync(path.dirname(cached), { recursive: true });
    writeFileSync(cached, `${json}\n`);
    return cached;
}

export function isEdited(entry, bytes) {
    return EDITED_SCHEMAS.has(entry.schema) && bytes <= EDITED_BYTES_LIMIT;
}

function validatedEdits(entry, folder) {
    const run = spawnSync(PYTHON, [VALIDATE, path.join(folder, "baseline.ifc"), path.join(folder, "edited.ifc")], { encoding: "utf8", maxBuffer: OUTPUT_LIMIT });
    const line = run.stdout?.split("\n").reverse().find((text) => text.startsWith(VALIDATION_LINE));
    if (run.error !== undefined || run.status !== 0 || line === undefined) {
        return { validationFailed: withoutPath(entry, (run.error?.message ?? run.stderr ?? "").slice(-ORACLE_FAILURE_KEPT)) };
    }
    return JSON.parse(line);
}

export function editsFailed(row) {
    return row.editing !== undefined && (row.editing.validationFailed !== undefined || row.editing.added > 0);
}

async function measureAll(args) {
    const rows = [];
    for (const entry of available(args)) {
        let oracle;
        let oracleFailed;
        try {
            oracle = args.includes("--no-oracle") ? undefined : await oracleOf(entry);
        } catch (error) {
            oracleFailed = error instanceof Error ? error.message : String(error);
        }
        const folder = args.includes("--edits") && isEdited(entry, statSync(entry.file).size) ? mkdtempSync(path.join(tmpdir(), "ifc-corpus-edits-")) : undefined;
        const measure = [`--max-old-space-size=${MEASURE_HEAP_MB}`, "--expose-gc", "--import", RESOLVE, MEASURE, entry.file, ...(oracle ? ["--oracle", oracle] : []), ...(args.includes("--exact") ? ["--exact"] : []), ...(folder ? ["--edited", folder] : [])];
        const run = spawnSync(process.execPath, measure, { encoding: "utf8", maxBuffer: OUTPUT_LIMIT });
        const line = run.stdout.split("\n").reverse().find((text) => text.startsWith("{"));
        const measured = line === undefined ? { failed: (run.stderr || `exit ${run.status}`).slice(-500) } : JSON.parse(line);
        const result = folder === undefined || measured.editing === undefined ? measured : { ...measured, editing: { ...measured.editing, ...validatedEdits(entry, folder) } };
        if (folder !== undefined) {
            rmSync(folder, { recursive: true, force: true });
        }
        const row = reportRow(entry, oracleFailed === undefined ? result : { ...result, oracleFailed: oracleFailed.slice(-ORACLE_FAILURE_KEPT) });
        rows.push(row);
        console.log(summaryLine(row));
    }
    mkdirSync(CACHE, { recursive: true });
    writeFileSync(path.join(CACHE, "report.json"), `${JSON.stringify({ when: new Date().toISOString(), node: process.version, rows }, null, 2)}\n`);
    return rows.every((row) => row.failed === undefined && !editsFailed(row));
}

function summaryLine(row) {
    if (row.failed !== undefined) { return `${row.id}: failed - ${row.failed}`; }
    const volumes = row.volumes ? `, volumes ${row.volumes.agreeing}/${row.volumes.compared} and boxes ${row.boxes.agreeing}/${row.boxes.compared} agree, ${row.boxes.missing} built by IfcOpenShell only` : "";
    const oracle = row.oracleFailed === undefined ? "" : `, IfcOpenShell failed: ${row.oracleFailed.trim().split("\n").pop()}`;
    const units = row.unitsAgree === false ? ", length unit read differently from IfcOpenShell" : "";
    const exact = row.exactMs === undefined ? "" : `, exact ${row.exactMs} ms with ${row.exactEmpty} empty${row.exactVolumes ? `, exact volumes ${row.exactVolumes.agreeing}/${row.exactVolumes.compared} and boxes ${row.exactBoxes.agreeing}/${row.exactBoxes.compared} agree` : ""}`;
    const edits = row.editing === undefined ? "" : `, edits ${row.editing.edits.filter((edit) => edit.refused === undefined).length}/${row.editing.edits.length} made${row.editing.validationFailed === undefined ? ` with ${row.editing.added} new validator errors (${row.editing.baselineErrors} before)` : `, validation failed: ${row.editing.validationFailed.trim().split("\n").pop()}`}`;
    const semantics = row.semantics ? `, types ${row.semantics.types.agreeing}/${row.semantics.types.compared}, storeys ${row.semantics.storeys.agreeing}/${row.semantics.storeys.compared}, property sets ${row.semantics.propertySets.agreeing}/${row.semantics.propertySets.compared}` : "";
    return `${row.id}: ${Math.round(row.bytes / 1e6)} MB, ${row.elements} elements, open ${row.openMs} ms, recipe ${row.recipeMs} ms, manifold ${row.manifoldMs} ms, ${row.unsupported} unsupported, ${row.emptySolids} empty (${row.surfaceRoots} drawn as surfaces, ${row.cutAway ?? 0} cut away entirely, ${row.emptySolids - row.surfaceRoots - (row.cutAway ?? 0)} lost), data ${row.dataIdentical ? "identical" : "changed"} on write, peak ${row.peakRssMb} MB, store ${row.storeMb} MB beside the file's${volumes}${exact}${edits}${semantics}${units}${oracle}`;
}

async function main(args) {
    const command = args[0];
    if (command === "fetch" || command === "check") { return fetchAll(args, command === "check"); }
    if (command === "run") { return measureAll(args); }
    if (command === "manifest") {
        const problems = manifestProblems(readManifest());
        problems.forEach((problem) => console.log(problem));
        return problems.length === 0;
    }
    console.log("usage: node scripts/ifc-corpus.mjs fetch | check | manifest | run [--only <id part>] [--exact] [--edits] [--no-oracle]");
    return false;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    process.exit((await main(process.argv.slice(2))) ? 0 : 1);
}
