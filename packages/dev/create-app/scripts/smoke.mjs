#!/usr/bin/env node
// Scaffolds every template the CLI offers into a temporary directory and installs each result,
// the way a user's first `npx @bitbybit-dev/create-app` does. The templates pin the published
// packages, so a version bump that did not reach them fails here rather than on a user's machine.
//
//   npm run build && node scripts/smoke.mjs [--keep]
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CLI = path.join(ROOT, "dist/index.js");
if (!existsSync(CLI)) { console.error("smoke: dist/index.js is missing - run npm run build first"); process.exit(2); }

const cases = [
    ...["threejs", "babylonjs", "playcanvas"].map((engine) => ({ name: `frontend-${engine}`, args: ["-t", "frontend", "-e", engine, "-o", "32"], install: ["."] })),
    ...["hono-sdk", "hono-rest", "nodejs-sdk", "nodejs-rest"].map((backend) => ({ name: `cloud-${backend}`, args: ["-t", "cloud", "-b", backend], install: ["frontend", "backend"] })),
];

const work = mkdtempSync(path.join(tmpdir(), "create-app-smoke-"));
const failures = [];
function step(label, cmd, args, cwd) {
    const r = spawnSync(cmd, args, { cwd, encoding: "utf8", env: { ...process.env, CI: "1", NO_COLOR: "1" } });
    console.log(`${r.status === 0 ? "ok  " : "FAIL"}  ${label}`);
    if (r.status !== 0) { console.log((r.stdout + r.stderr).split("\n").slice(-20).map((l) => `        ${l}`).join("\n")); failures.push(label); }
    return r.status === 0;
}
for (const c of cases) {
    if (!step(`scaffold ${c.name}`, "node", [CLI, c.name, ...c.args], work)) continue;
    for (const dir of c.install) {
        const target = path.join(work, c.name, dir);
        if (!existsSync(path.join(target, "package.json"))) { console.log(`FAIL  ${c.name}/${dir} has no package.json`); failures.push(`${c.name}/${dir}`); continue; }
        step(`install  ${c.name}/${dir}`, "npm", ["install", "--no-audit", "--no-fund"], target);
    }
}
if (!process.argv.includes("--keep")) rmSync(work, { recursive: true, force: true });
else console.log(`kept ${work}`);
if (failures.length) { console.error(`\nsmoke: ${failures.length} failure(s): ${failures.join(", ")}`); process.exit(1); }
console.log(`\nsmoke: every template scaffolds and installs (${cases.length} projects)`);
