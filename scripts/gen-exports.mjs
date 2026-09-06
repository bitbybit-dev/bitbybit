#!/usr/bin/env node
// Writes each dist-published package's exports map from its tree (the derivation lives in
// scripts/dist-manifest.mjs, which also drops the map from the published manifest). Run it after
// adding a directory index under lib/, a kernel module or a root JavaScript module;
// `npm run check:exports` fails until the manifest matches. Formatting is kept: the map is placed
// after "types", the rest of the manifest untouched.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { expectedExports } from "./dist-manifest.mjs";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const noComments = (text) => text.split("\n").filter((line) => !line.trimStart().startsWith("//")).join("\n");
const projects = JSON.parse(noComments(readFileSync(join(ROOT, "tsconfig.build.json"), "utf8"))).references
    .map((r) => join(ROOT, dirname(r.path)));
let written = 0;
for (const dir of projects) {
    const file = join(dir, "package.json");
    const text = readFileSync(file, "utf8");
    const indent = (text.match(/^[ \t]+(?=")/m) ?? ["  "])[0];
    const manifest = JSON.parse(text);
    const exports = expectedExports(dir);
    if (JSON.stringify(manifest.exports) === JSON.stringify(exports)) continue;
    const next = {};
    for (const [key, value] of Object.entries(manifest)) {
        if (key === "exports") continue;
        next[key] = value;
        if (key === "types") next.exports = exports;
    }
    if (!next.exports) throw new Error(`${relative(ROOT, file)} has no "types" key to place exports after`);
    writeFileSync(file, `${JSON.stringify(next, null, indent)}\n`);
    written += 1;
    console.log(`wrote ${relative(ROOT, file)} (${Object.keys(exports).length} entries)`);
}
console.log(`${projects.length} packages, ${written} manifest(s) written`);
