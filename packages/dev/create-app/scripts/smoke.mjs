#!/usr/bin/env node
// Scaffolds every template the CLI offers into a temporary directory, installs each result the way
// a user's first `npx @bitbybit-dev/create-app` does, and runs each project's own `npm run smoke`.
// The templates pin the published packages, so a version bump that did not reach them fails here
// rather than on a user's machine, and a template whose code drifted from the packages fails in
// its smoke rather than in a user's editor. The .NET backend is built only where `dotnet` exists.
//
//   npm run build && node scripts/smoke.mjs [--keep] [--dir <path>] [--only <case-name-substring>]
//
// Without --keep the scaffolds go to a temporary directory and are deleted at the end. With --keep
// they land in .local/smoke/ inside this package (ignored by git, npm and the linter) and stay, so
// each can be started with its own dev command; --dir <path> puts them anywhere else instead.
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CLI = path.join(ROOT, "dist/index.js");
if (!existsSync(CLI)) { console.error("smoke: dist/index.js is missing - run npm run build first"); process.exit(2); }

const only = process.argv.includes("--only") ? process.argv[process.argv.indexOf("--only") + 1] : "";
const keep = process.argv.includes("--keep") || process.argv.includes("--dir");
const chosenDir = process.argv.includes("--dir") ? path.resolve(process.argv[process.argv.indexOf("--dir") + 1] ?? "") : path.join(ROOT, ".local", "smoke");
const hasDotnet = spawnSync("dotnet", ["--version"], { encoding: "utf8" }).status === 0;

const cases = [
    ...["threejs", "babylonjs", "playcanvas"].map((engine) => ({ name: `frontend-${engine}`, args: ["-t", "frontend", "-e", engine, "-o", "32"], npm: ["."], dotnet: [] })),
    ...["hono-sdk", "hono-rest", "nodejs-sdk", "nodejs-rest"].map((backend) => ({ name: `cloud-${backend}`, args: ["-t", "cloud", "-b", backend], npm: ["frontend", "backend"], dotnet: [] })),
    { name: "cloud-dotnet-rest", args: ["-t", "cloud", "-b", "dotnet-rest"], npm: ["frontend"], dotnet: ["backend"] },
    ...["product-configurator", "laser-cut-box", "sheet-metal-unfold", "step-to-gltf-cli", "drone-assembly"].map((template) => ({ name: `app-${template}`, args: ["-t", "app", "-T", template], npm: ["."], dotnet: [] })),
].filter((c) => c.name.includes(only));

const work = keep ? chosenDir : mkdtempSync(path.join(tmpdir(), "create-app-smoke-"));
if (keep) {
    for (const c of cases) rmSync(path.join(work, c.name), { recursive: true, force: true });
    mkdirSync(work, { recursive: true });
    console.log(`scaffolding into ${work} (kept after the run)\n`);
}
const failures = [];
function step(label, cmd, args, cwd) {
    const r = spawnSync(cmd, args, { cwd, encoding: "utf8", env: { ...process.env, CI: "1", NO_COLOR: "1" } });
    console.log(`${r.status === 0 ? "ok  " : "FAIL"}  ${label}`);
    if (r.status !== 0) { console.log((r.stdout + r.stderr).split("\n").slice(-20).map((l) => `        ${l}`).join("\n")); failures.push(label); }
    else if (label.startsWith("smoke")) console.log((r.stdout || "").trim().split("\n").slice(-1).map((l) => `        ${l}`).join("\n"));
    return r.status === 0;
}
for (const c of cases) {
    if (!step(`scaffold ${c.name}`, "node", [CLI, c.name, ...c.args], work)) continue;
    for (const dir of c.npm) {
        const target = path.join(work, c.name, dir);
        if (!existsSync(path.join(target, "package.json"))) { console.log(`FAIL  ${c.name}/${dir} has no package.json`); failures.push(`${c.name}/${dir}`); continue; }
        if (!step(`install  ${c.name}/${dir}`, "npm", ["install", "--no-audit", "--no-fund"], target)) continue;
        step(`smoke    ${c.name}/${dir}`, "npm", ["run", "smoke"], target);
    }
    for (const dir of c.dotnet) {
        if (!hasDotnet) { console.log(`skip  ${c.name}/${dir}: dotnet is not installed here`); continue; }
        step(`build    ${c.name}/${dir}`, "dotnet", ["build", "--nologo"], path.join(work, c.name, dir));
    }
}
if (!keep) rmSync(work, { recursive: true, force: true });
if (failures.length) { console.error(`\nsmoke: ${failures.length} failure(s): ${failures.join(", ")}`); process.exit(1); }
console.log(`\nsmoke: every template scaffolds, installs and passes its own smoke (${cases.length} projects)`);
if (keep) console.log(`kept in ${work}: cd into a project there and run its dev command (see the README of each)`);
