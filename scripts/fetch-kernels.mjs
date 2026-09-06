#!/usr/bin/env node
/**
 * Fetch the OCCT kernels the occt package ships, unless they are already on disk.
 *
 * The three wasm kernels (~35 MB each, a new set on every kernel rebuild) are not tracked in this
 * repository: packages/dev/occt/kernels.json records, per variant directory, the content-hashed
 * file name the emscripten glue references, its size, its SHA-256 and where it is published, and
 * this script materialises them. The manifest is written by the kernel build when it deploys a
 * fresh wasm into a variant directory, so on a machine that builds the kernel the file is already
 * there and this is a no-op; on a clone it downloads. Either way the SHA-256 in the manifest is
 * what decides: a file that exists with the right hash is kept, a file that exists with another
 * hash is an error (never silently overwritten - the deploy folder is the source of truth, and a
 * mismatch means the manifest was not updated), a missing file is downloaded and verified.
 *
 *   node scripts/fetch-kernels.mjs            fetch what is missing, verify what is present
 *   node scripts/fetch-kernels.mjs --check    verify only; exit 1 if anything is missing or differs
 *
 * A kernel whose manifest entry has no url yet was built but not published: the build writes the
 * entry, publishing fills in the url. On the building machine that is fine (the file is present);
 * anywhere else it is a hard stop that names the file, which is the point.
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, renameSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OCCT = path.join(ROOT, "packages/dev/occt");
const MANIFEST = path.join(OCCT, "kernels.json");
const check = process.argv.includes("--check");
const RETRIES = 3;

const sha256 = (file) => createHash("sha256").update(readFileSync(file)).digest("hex");

function verifyGlue(entry) {
    const glue = path.join(OCCT, entry.dir, `${entry.dir}.js`);
    if (!existsSync(glue)) return `${entry.dir}/${entry.dir}.js is missing`;
    if (!readFileSync(glue, "utf8").includes(entry.file)) return `${entry.dir}/${entry.dir}.js does not reference ${entry.file} - the glue and the manifest disagree`;
    return null;
}

async function download(entry, target) {
    let last = "";
    for (let attempt = 1; attempt <= RETRIES; attempt++) {
        try {
            const res = await fetch(entry.url, { redirect: "follow" });
            if (!res.ok) { last = `HTTP ${res.status}`; if (res.status === 404) break; continue; }
            const buf = Buffer.from(await res.arrayBuffer());
            const digest = createHash("sha256").update(buf).digest("hex");
            if (digest !== entry.sha256) return `downloaded ${entry.file} has sha256 ${digest}, the manifest says ${entry.sha256}`;
            mkdirSync(path.dirname(target), { recursive: true });
            const tmp = `${target}.part`;
            writeFileSync(tmp, buf);
            renameSync(tmp, target);
            return null;
        } catch (e) {
            last = e.message;
        }
        await new Promise((r) => setTimeout(r, 2000 * attempt));
    }
    return `could not download ${entry.file} from ${entry.url}: ${last}`;
}

const { kernels } = JSON.parse(readFileSync(MANIFEST, "utf8"));
const problems = [];
let fetched = 0, present = 0;
for (const entry of kernels) {
    const glueProblem = verifyGlue(entry);
    if (glueProblem) { problems.push(glueProblem); continue; }
    const target = path.join(OCCT, entry.dir, entry.file);
    if (existsSync(target)) {
        const bytes = statSync(target).size;
        const digest = sha256(target);
        if (bytes !== entry.bytes || digest !== entry.sha256) problems.push(`${entry.dir}/${entry.file} is on disk with sha256 ${digest} (${bytes} bytes) but the manifest says ${entry.sha256} (${entry.bytes} bytes) - a kernel build that did not update kernels.json`);
        else present++;
        continue;
    }
    if (check) { problems.push(`${entry.dir}/${entry.file} is missing - run npm run kernels:fetch`); continue; }
    if (!entry.url) { problems.push(`${entry.dir}/${entry.file} is missing and has no url in kernels.json - it was built but never published`); continue; }
    console.log(`fetching ${entry.dir}/${entry.file} (${(entry.bytes / 1048576).toFixed(1)} MB)`);
    const problem = await download(entry, target);
    if (problem) problems.push(problem); else fetched++;
}
if (problems.length) {
    for (const p of problems) console.error(`kernels: ${p}`);
    process.exit(1);
}
console.log(`kernels: ${kernels.length} verified (${present} present, ${fetched} fetched)`);
