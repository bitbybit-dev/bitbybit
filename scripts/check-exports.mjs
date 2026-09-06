#!/usr/bin/env node
// Holds the packages that publish from dist/ to the manifest shape scripts/dist-manifest.mjs
// derives from: the source manifest carries the exports map with the `@bitbybit-dev/source`
// condition first in every entry (a consumer that declares the condition resolves the TypeScript
// sources, everyone else dist/), its jest block declares the same condition so the tests keep
// exercising sibling sources, and - once built - dist/package.json is byte for byte what the
// derivation writes, so a stale or hand-edited published manifest fails here and not in npm pack.
// Needs no build; `npm test` and verify.yml run it.
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { manifestProblems, publishedManifest } from "./dist-manifest.mjs";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const noComments = (text) => text.split("\n").filter((line) => !line.trimStart().startsWith("//")).join("\n");
const projects = JSON.parse(noComments(readFileSync(join(ROOT, "tsconfig.build.json"), "utf8"))).references
    .map((r) => join(ROOT, dirname(r.path)));

const failures = [];
let built = 0;
for (const dir of projects) {
    const text = readFileSync(join(dir, "package.json"), "utf8");
    const manifest = JSON.parse(text);
    for (const problem of manifestProblems(manifest, dir)) failures.push(`${manifest.name}: ${problem}`);
    const dist = join(dir, "dist", "package.json");
    if (!existsSync(dist)) continue;
    built += 1;
    if (readFileSync(dist, "utf8") !== publishedManifest(text)) failures.push(`${manifest.name}: ${relative(ROOT, dist)} is not what dist-manifest.mjs derives from the source manifest - run \`npm run build-packages\``);
}
if (failures.length) {
    console.error(`check:exports:\n  ${failures.join("\n  ")}`);
    process.exit(1);
}
console.log(`exports maps hold in ${projects.length} packages; ${built} built dist manifest(s) match the derivation`);
