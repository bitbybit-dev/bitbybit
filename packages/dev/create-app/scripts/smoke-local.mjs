#!/usr/bin/env node
// The same scaffold-and-smoke as scripts/smoke.mjs, against the packages built in this repository
// instead of the ones on the registry, so a breaking change in packages/dev/* surfaces before it
// is published rather than in a user's first install. Each project is scaffolded and installed
// from the registry as a user would (that fetches every third-party dependency), and then every
// @bitbybit-dev package it installed is replaced by a copy of the workspace's dist - a copy, not a
// symlink, so nothing resolves through this repository's node_modules. Build the packages first
// (`npm run build-packages` at the repository root).
//
//   npm run build && node scripts/smoke-local.mjs [--keep] [--dir <path>] [--only <case-name-substring>]
//
// Without --keep the scaffolds go to a temporary directory and are deleted at the end. With --keep
// they land in .local/smoke-local/ inside this package (ignored by git, npm and the linter) and stay, so
// each can be started with its own dev command; --dir <path> puts them anywhere else instead.
import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const REPO = path.resolve(ROOT, "../../..");
const CLI = path.join(ROOT, "dist/index.js");
if (!existsSync(CLI)) { console.error("smoke:local: dist/index.js is missing - run npm run build first"); process.exit(2); }

const only = process.argv.includes("--only") ? process.argv[process.argv.indexOf("--only") + 1] : "";
const keep = process.argv.includes("--keep") || process.argv.includes("--dir");
const chosenDir = process.argv.includes("--dir") ? path.resolve(process.argv[process.argv.indexOf("--dir") + 1] ?? "") : path.join(ROOT, ".local", "smoke-local");

// Where a package's publishable tree is: the CAD packages publish dist/, the root-published ones
// (cad-cloud-sdk, mcp, create-app) publish their own directory through the files allowlist.
function publishedDir(name) {
    const dir = path.join(REPO, "packages/dev", name);
    const manifest = path.join(dir, "package.json");
    if (!existsSync(manifest)) return null;
    const { files } = JSON.parse(readFileSync(manifest, "utf8"));
    return Array.isArray(files) ? dir : path.join(dir, "dist");
}

function replaceWithWorkspace(projectDir) {
    const scope = path.join(projectDir, "node_modules", "@bitbybit-dev");
    if (!existsSync(scope)) return [];
    const replaced = [];
    for (const entry of readdirSync(scope)) {
        const source = publishedDir(entry);
        if (!source || !existsSync(path.join(source, "package.json"))) { console.log(`skip  ${entry}: no built package at ${source ?? "?"} - build the packages first`); continue; }
        const target = path.join(scope, entry);
        rmSync(target, { recursive: true, force: true });
        cpSync(source, target, { recursive: true, filter: (p) => !p.includes(`${path.sep}node_modules${path.sep}`) && !p.endsWith(`${path.sep}node_modules`) });
        replaced.push(entry);
    }
    return replaced;
}

const cases = [
    ...["threejs", "babylonjs", "playcanvas"].map((engine) => ({ name: `frontend-${engine}`, args: ["-t", "frontend", "-e", engine, "-o", "32"], npm: ["."] })),
    ...["hono-sdk", "hono-rest", "nodejs-sdk", "nodejs-rest"].map((backend) => ({ name: `cloud-${backend}`, args: ["-t", "cloud", "-b", backend], npm: ["frontend", "backend"] })),
    ...["product-configurator", "laser-cut-box", "sheet-metal-unfold", "step-to-gltf-cli"].map((template) => ({ name: `app-${template}`, args: ["-t", "app", "-T", template], npm: ["."] })),
].filter((c) => c.name.includes(only));

const work = keep ? chosenDir : mkdtempSync(path.join(tmpdir(), "create-app-smoke-local-"));
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
    else if (label.startsWith("smoke")) console.log((r.stdout || "").trim().split("\n").filter((l) => l.startsWith("{")).map((l) => `        ${l.slice(0, 200)}`).join("\n"));
    return r.status === 0;
}
for (const c of cases) {
    if (!step(`scaffold ${c.name}`, "node", [CLI, c.name, ...c.args], work)) continue;
    for (const dir of c.npm) {
        const target = path.join(work, c.name, dir);
        if (!step(`install  ${c.name}/${dir}`, "npm", ["install", "--no-audit", "--no-fund"], target)) continue;
        const replaced = [...replaceWithWorkspace(target), ...readdirSync(target).filter((d) => existsSync(path.join(target, d, "node_modules"))).flatMap((d) => replaceWithWorkspace(path.join(target, d)))];
        console.log(`link  ${c.name}/${dir}: ${replaced.length ? replaced.join(", ") : "nothing to replace"} from the workspace`);
        step(`smoke    ${c.name}/${dir}`, "npm", ["run", "smoke"], target);
    }
}
if (!keep) rmSync(work, { recursive: true, force: true });
if (failures.length) { console.error(`\nsmoke:local: ${failures.length} failure(s): ${failures.join(", ")}`); process.exit(1); }
console.log(`\nsmoke:local: every template passes its smoke on the workspace packages (${cases.length} projects)`);
if (keep) console.log(`kept in ${work}: cd into a project there and run its dev command (see the README of each)`);
