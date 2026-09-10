#!/usr/bin/env node
// Runs the examples against the packages in this repository instead of the ones on the registry, so
// an idea can be tried in a real application before it is published. The verification lane beside
// this one (examples.mjs) deliberately installs from the registry; this one deliberately does not.
//
//   node scripts/local.mjs status  [--only <part>]  what each example is pointed at right now
//   node scripts/local.mjs link    [--only <part>]  point them at this repository
//   node scripts/local.mjs unlink  [--only <part>]  put the installed copies back
//   node scripts/local.mjs dev     [--only <part>]  link, then start each on its own port
//   node scripts/local.mjs build   [--only <part>]  link, then build each
//
// An example is linked one of two ways, and which one it gets is derived from the example rather
// than declared anywhere:
//
//   source  - the example's dev script is Vite, so node_modules/@bitbybit-dev/* become symlinks to
//             the package directories and a generated Vite config asks for the
//             "@bitbybit-dev/source" export condition. Vite then serves the TypeScript in
//             packages/dev/*/lib itself: an edit there reaches the browser with no build step at
//             all. This is the mode to work in.
//   dist    - anything else. The packages have to be built (`npm run build-packages` at the
//             repository root, or `npm run watch-packages` to keep them fresh while you work), and
//             what npm would publish is copied into the example. Every bundler understands it, and
//             no example configuration is generated.
//
// Three details decide the shape of all this, and each was measured rather than assumed:
//
//   - A package cannot be reached through a symlink unless whatever resolves it is told to look
//     through the link. Resolution follows a symlink to its real path, so `three` inside a linked
//     @bitbybit-dev/threejs resolves to this repository's copy while the example's own
//     `import ... from "three"` resolves to the example's - two copies of the engine in one page,
//     which breaks as soon as anything is compared by identity. Worse for a typechecking bundler:
//     the real path is a package directory holding both lib/*.ts and dist/*.d.ts, and ts-loader
//     reaches the same class twice and reduces it to `never`. So dist mode copies. In source mode
//     the sources are the point, and Vite's `resolve.dedupe` keeps one engine instead - the
//     generated config lists every engine library for it.
//   - Copying is nearly free where the filesystem can clone (APFS does), which is what makes it
//     affordable to put the 100MB of compiled kernel into each example.
//   - The published packages carry no `exports` map (scripts/dist-manifest.mjs drops it), so the
//     "@bitbybit-dev/source" condition only exists on the package directories in this repository.
//     That is why source mode links the package root.
//
// The kernels are not part of this. The OCCT, JSCAD and Manifold workers are fetched from the CDN
// at run time unless an example passes its own, so linking changes the library the page runs and
// leaves the kernel where it was. A change under packages/dev/*-worker/lib reaches an example
// through this lane; a change to a compiled kernel does not.
//
// Whatever an example was before `link` is kept in node_modules/.bitbybit-installed and put back by
// `unlink`. Nothing tracked by git is written: the generated Vite config and the .local directory
// are both ignored.
import { spawn, spawnSync } from "node:child_process";
import { createServer } from "node:http";
import { cpSync, existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import path from "node:path";
import { ROOT, REPO, discover, manifestOf, config } from "./discover.mjs";

const LOCAL = path.join(ROOT, ".local");
const BACKUP = "node_modules/.bitbybit-installed";
const GENERATED_CONFIG = "vite.config.bitbybit-local.mts";
const SCOPE = "@bitbybit-dev/";

// The libraries an example and a package can both depend on, where a second copy is a bug rather
// than a duplicate. Source mode tells Vite to resolve each of these once; dist mode has no need of
// the list, because a copied package finds them under the example's own node_modules.
const ENGINE_LIBS = ["three", "playcanvas", "@babylonjs/core", "@babylonjs/gui", "@babylonjs/havok", "@babylonjs/loaders", "@babylonjs/materials", "@babylonjs/serializers", "earcut"];

// What each dev server calls its port. Vite is absent because source mode writes the port into the
// generated config, and dist mode reaches it through the same flags as the rest.
const PORT_FLAG = { vite: ["--port", "%p", "--strictPort"], next: ["-p", "%p"], nuxt: ["--port", "%p"], ng: ["--port", "%p"], webpack: ["--port", "%p"] };

const args = process.argv.slice(2);
const command = args[0];
const only = args.includes("--only") ? args[args.indexOf("--only") + 1] : null;
const forceDist = args.includes("--dist");
const basePort = args.includes("--port") ? Number(args[args.indexOf("--port") + 1]) : 5300;

// --- what this repository publishes -------------------------------------------------------------

function workspacePackages() {
    const dir = path.join(REPO, "packages/dev");
    const map = new Map();
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        if (!entry.isDirectory()) continue;
        const home = path.join(dir, entry.name);
        const manifestPath = path.join(home, "package.json");
        if (!existsSync(manifestPath)) continue;
        const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
        const dist = path.join(home, "dist");
        // Most packages publish dist/ as the package root, so a built one has a manifest in there.
        // The two that publish from their own root with a `files` list have none, and what npm would
        // send is those entries beside the manifest.
        const distRooted = existsSync(path.join(dist, "package.json")) || !manifest.files;
        map.set(manifest.name, {
            home,
            dist,
            version: manifest.version,
            built: existsSync(distRooted ? path.join(dist, "package.json") : dist),
            publishes: distRooted ? { from: dist, entries: null } : { from: home, entries: [...manifest.files, "package.json"] },
        });
    }
    return map;
}

const workspace = workspacePackages();

// --- what each example is, and how it can be linked ----------------------------------------------

function installedScope(rel) {
    const dir = path.join(ROOT, rel, "node_modules", SCOPE.slice(0, -1));
    if (!existsSync(dir)) return [];
    return readdirSync(dir).filter((name) => !name.startsWith(".")).sort().map((name) => `${SCOPE}${name}`);
}

// The script that starts the example, whatever it is called here, and the tool it runs - which is
// what says whether this lane can hand it a port.
function devScript(manifest) {
    const name = ["dev", "start", "serve"].find((n) => manifest.scripts?.[n]);
    return { name, tool: name ? manifest.scripts[name].trim().split(/\s+/)[0] : "" };
}

function plan(rel) {
    const manifest = manifestOf(rel);
    const skip = config.skip.find((s) => s.path === rel);
    const { name: script, tool } = devScript(manifest);
    const declared = Object.keys({ ...manifest.dependencies, ...manifest.devDependencies }).filter((n) => n.startsWith(SCOPE));
    const installed = installedScope(rel);
    const names = installed.length ? installed : declared;
    const ours = names.filter((n) => workspace.has(n));
    const state = linkState(rel, ours);

    let mode = null;
    let reason = null;
    if (skip) reason = skip.reason;
    else if (!declared.length) reason = "declares no package from this workspace";
    else if (!ours.length) reason = `declares only ${declared.join(", ")}, which this workspace does not publish`;
    else if (!existsSync(path.join(ROOT, rel, "node_modules"))) reason = "not installed yet - run `npm run install:all` first";
    else {
        const stale = ours.map((n) => [n, declared.includes(n) ? manifest.dependencies?.[n] ?? manifest.devDependencies?.[n] : null])
            .find(([n, pinned]) => pinned && pinned !== workspace.get(n).version);
        if (stale) reason = `pins ${stale[0]}@${stale[1]}, this workspace is at ${workspace.get(stale[0]).version}`;
        else mode = forceDist || tool !== "vite" ? "dist" : "source";
    }
    return { path: rel, manifest, script, tool, packages: ours, mode, reason, state, server: Boolean(PORT_FLAG[tool]) };
}

// Reads back what a previous run did, so `status` is the truth on disk rather than a record this
// script keeps: a symlink says where it points, and a copied package carries the marker below.
const MARKER = ".bitbybit-local.json";

function linkState(rel, names) {
    let source = 0;
    let dist = 0;
    for (const name of names) {
        const target = path.join(ROOT, rel, "node_modules", name);
        if (!existsSync(target) && !existsSync(path.dirname(target))) continue;
        try { if (lstatSync(target).isSymbolicLink()) { source++; continue; } } catch { /* not there */ }
        if (existsSync(path.join(target, MARKER))) dist++;
    }
    if (!source && !dist) return "installed";
    return source ? "local (source)" : "local (dist)";
}

// --- linking --------------------------------------------------------------------------------------

function setAside(rel, name) {
    const target = path.join(ROOT, rel, "node_modules", name);
    const kept = path.join(ROOT, rel, BACKUP, name.slice(SCOPE.length));
    if (!existsSync(target)) return;
    const isLink = lstatSync(target).isSymbolicLink();
    if (isLink || existsSync(path.join(target, MARKER))) { rmSync(target, { recursive: true, force: true }); return; }
    if (existsSync(kept)) { rmSync(target, { recursive: true, force: true }); return; }
    mkdirSync(path.dirname(kept), { recursive: true });
    renameSync(target, kept);
}

// A copy that the filesystem can share the blocks of where it supports that, and an ordinary copy
// where it does not. The kernel package is 100MB, and it goes into every example that links.
function copyTree(from, entries, to) {
    mkdirSync(to, { recursive: true });
    const sources = entries ? entries.map((e) => path.join(from, e)) : [`${from}/.`];
    if (process.platform === "darwin" && spawnSync("cp", ["-Rc", ...sources, to], { stdio: "ignore" }).status === 0) return;
    if (entries) for (const e of entries) cpSync(path.join(from, e), path.join(to, e), { recursive: true, dereference: true });
    else cpSync(from, to, { recursive: true, dereference: true });
}

function link(p) {
    const missing = p.packages.filter((n) => p.mode === "dist" && !workspace.get(n).built);
    if (missing.length) return { ok: false, note: `${missing.map((n) => n.slice(SCOPE.length)).join(", ")} not built - run \`npm run build-packages\` in the repository root` };

    for (const name of p.packages) {
        const pkg = workspace.get(name);
        const target = path.join(ROOT, p.path, "node_modules", name);
        setAside(p.path, name);
        mkdirSync(path.dirname(target), { recursive: true });
        if (p.mode === "source") {
            symlinkSync(pkg.home, target, "dir");
        } else {
            // Copied, not linked, so that nothing resolves past the example - see the header.
            copyTree(pkg.publishes.from, pkg.publishes.entries, target);
            writeFileSync(path.join(target, MARKER), JSON.stringify({ mode: "dist", from: path.relative(ROOT, pkg.publishes.from) }, null, 4));
        }
    }
    if (p.mode === "source") writeViteConfig(p);
    else rmSync(path.join(ROOT, p.path, GENERATED_CONFIG), { force: true });
    // Vite pre-bundles what it finds in node_modules and caches it against the lockfile, which this
    // lane changes underneath it. Dropping the cache is what stops a stale copy being served.
    rmSync(path.join(ROOT, p.path, "node_modules/.vite"), { recursive: true, force: true });
    return { ok: true };
}

function unlink(p) {
    for (const name of p.packages) {
        const target = path.join(ROOT, p.path, "node_modules", name);
        const kept = path.join(ROOT, p.path, BACKUP, name.slice(SCOPE.length));
        let isLink = false;
        try { isLink = lstatSync(target).isSymbolicLink(); } catch { /* not there */ }
        if (isLink || (existsSync(target) && existsSync(path.join(target, MARKER)))) rmSync(target, { recursive: true, force: true });
        if (existsSync(kept) && !existsSync(target)) renameSync(kept, target);
    }
    const backup = path.join(ROOT, p.path, BACKUP);
    if (existsSync(backup) && !readdirSync(backup).length) rmSync(backup, { recursive: true, force: true });
    rmSync(path.join(ROOT, p.path, GENERATED_CONFIG), { force: true });
    rmSync(path.join(ROOT, p.path, "node_modules/.vite"), { recursive: true, force: true });
    const restored = p.packages.filter((n) => existsSync(path.join(ROOT, p.path, "node_modules", n)));
    return { ok: true, note: restored.length === p.packages.length ? undefined : "some packages have no installed copy to put back - run `npm ci` in the example" };
}

// The example's own Vite configuration is loaded and merged rather than replaced, so a plugin an
// example needs - React, or the headers the multithreaded kernel wants - still applies.
function writeViteConfig(p) {
    const own = ["vite.config.ts", "vite.config.mts", "vite.config.js", "vite.config.mjs"].find((f) => existsSync(path.join(ROOT, p.path, f)));
    const port = ports.get(p.path);
    const body = `// Generated by examples/scripts/local.mjs. Not tracked, and removed by \`npm run unlink:local\`.
// It adds three things to ${own ? `./${own}` : "the Vite defaults"}: the export condition that resolves
// @bitbybit-dev packages to their TypeScript sources, one copy of each 3D engine, and the port this
// example was given.
import { defineConfig, mergeConfig${own ? ", loadConfigFromFile" : ""} } from "vite";

const local = {
    resolve: {
        // The default conditions are spelled out because naming any replaces them.
        conditions: ["@bitbybit-dev/source", "module", "browser", "development|production"],
        dedupe: ${JSON.stringify(ENGINE_LIBS)},
    },
    // The linked packages are sources, not a dependency to pre-bundle.
    optimizeDeps: { exclude: ${JSON.stringify(p.packages)} },
    server: {
        port: ${port},
        strictPort: true,
        // The sources are outside this example, so the dev server has to be allowed to read them.
        fs: { allow: [${JSON.stringify(REPO)}] },
    },
};

export default defineConfig(async (env) => {
${own ? `    const own = await loadConfigFromFile(env, ${JSON.stringify(path.join(ROOT, p.path, own))});\n    return mergeConfig(own?.config ?? {}, local);` : "    return local;"}
});
`;
    writeFileSync(path.join(ROOT, p.path, GENERATED_CONFIG), body);
}

// --- commands ---------------------------------------------------------------------------------------

const all = discover().map(plan);
const examples = all.filter((e) => !only || e.path.includes(only));
// Ports are handed out over every example, not over the selection, so `--only` does not move them.
const ports = new Map(all.filter((e) => e.mode && e.server).map((e, i) => [e.path, basePort + 1 + i]));

function report(rows) {
    const failed = rows.filter((r) => !r.ok);
    console.log(`\n${rows.length - failed.length} of ${rows.length} ok${failed.length ? `, ${failed.length} failed` : ""}`);
    process.exit(failed.length ? 1 : 0);
}

function runLinkable(action, label) {
    const rows = [];
    for (const e of examples) {
        if (!e.mode) { console.log(`skip  ${e.path.padEnd(42)} ${e.reason}`); continue; }
        const r = action(e);
        rows.push({ ...r, path: e.path });
        console.log(`${r.ok ? "ok  " : "FAIL"}  ${e.path.padEnd(42)} ${label(e)}${r.note ? `  - ${r.note}` : ""}`);
    }
    report(rows);
}

if (command === "status") {
    for (const e of examples) {
        const where = e.mode ? `${e.state.padEnd(15)} ${e.mode === "source" ? "linkable as source" : "linkable as dist"}${e.server ? `, port ${ports.get(e.path)}` : ""}` : `${"-".padEnd(15)} ${e.reason}`;
        console.log(`${e.path.padEnd(42)} ${where}`);
    }
    process.exit(0);
}

if (command === "link") runLinkable(link, (e) => `${e.mode}, ${e.packages.length} package(s)`);
if (command === "unlink") runLinkable(unlink, () => "installed copies restored");

if (command === "build") {
    mkdirSync(LOCAL, { recursive: true });
    const rows = [];
    for (const e of examples) {
        if (!e.mode) { console.log(`skip  ${e.path.padEnd(42)} ${e.reason}`); continue; }
        if (e.mode === "dist" && !e.manifest.scripts?.build) { console.log(`skip  ${e.path.padEnd(42)} has no build script`); continue; }
        const linked = link(e);
        if (!linked.ok) { console.log(`FAIL  ${e.path.padEnd(42)} ${linked.note}`); rows.push({ ...linked, path: e.path }); continue; }
        // In source mode the build runs Vite directly with the generated config. An example whose
        // own build script also runs tsc keeps that step out of this lane: tsc resolves the
        // packages through their published typings, which is the registry lane's question.
        const [cmd, cmdArgs] = e.mode === "source"
            ? ["npx", ["vite", "build", "--config", GENERATED_CONFIG]]
            : ["npm", ["run", "build"]];
        const started = Date.now();
        const r = spawnSync(cmd, cmdArgs, { cwd: path.join(ROOT, e.path), encoding: "utf8", env: { ...process.env, CI: "1", NO_COLOR: "1" } });
        const log = path.join(LOCAL, `${e.path.replaceAll("/", "__")}.build.log`);
        writeFileSync(log, `$ ${cmd} ${cmdArgs.join(" ")}\n${r.stdout ?? ""}${r.stderr ?? ""}`);
        const ok = r.status === 0;
        console.log(`${ok ? "ok  " : "FAIL"}  ${e.path.padEnd(42)} ${e.mode}  (${((Date.now() - started) / 1000).toFixed(0)}s)`);
        if (!ok) console.log((r.stdout + r.stderr).split("\n").slice(-20).map((l) => `        ${l}`).join("\n"));
        rows.push({ ok, path: e.path });
    }
    report(rows);
}

if (command === "dev") {
    mkdirSync(LOCAL, { recursive: true });
    const running = [];
    for (const e of examples) {
        if (!e.mode) { console.log(`skip  ${e.path.padEnd(42)} ${e.reason}`); continue; }
        if (!e.server) { console.log(`skip  ${e.path.padEnd(42)} \`${e.tool}\` is not a dev server this lane can give a port to`); continue; }
        const linked = link(e);
        if (!linked.ok) { console.log(`FAIL  ${e.path.padEnd(42)} ${linked.note}`); continue; }
        const port = ports.get(e.path);
        const [cmd, cmdArgs] = e.mode === "source"
            ? ["npx", ["vite", "--config", GENERATED_CONFIG]]
            : ["npm", ["run", e.script, "--", ...PORT_FLAG[e.tool].map((f) => f.replace("%p", String(port)))]];
        const child = spawn(cmd, cmdArgs, { cwd: path.join(ROOT, e.path), env: { ...process.env, NO_COLOR: "1", PORT: String(port), FORCE_COLOR: "0" } });
        const prefix = (stream) => stream.on("data", (d) => String(d).split("\n").filter((l) => l.trim()).forEach((l) => console.log(`  ${e.path.padEnd(42)} ${l}`)));
        prefix(child.stdout);
        prefix(child.stderr);
        child.on("exit", (code) => { if (code) console.log(`  ${e.path.padEnd(42)} exited with ${code}`); });
        running.push({ ...e, port, child });
    }

    if (!running.length) { console.log("\nnothing to start"); process.exit(1); }

    const page = `<!doctype html><meta charset="utf-8"><title>Examples on local sources</title>
<style>body{font:14px/1.6 system-ui,sans-serif;margin:3rem auto;max-width:44rem;color:#111}h1{font-size:1.2rem}
li{list-style:none}a{color:#0b5}code{color:#666}</style>
<h1>Examples, running on the packages in this repository</h1>
<ol>${running.map((e) => `<li><a href="http://localhost:${e.port}/">${e.path}</a> <code>${e.mode}</code></li>`).join("")}</ol>`;
    writeFileSync(path.join(LOCAL, "index.html"), page);
    const index = createServer((_, res) => { res.writeHead(200, { "content-type": "text/html; charset=utf-8" }); res.end(page); }).listen(basePort);

    console.log(`\n${running.length} example(s) starting. Every one of them:\n\n    http://localhost:${basePort}/\n`);
    for (const e of running) console.log(`    ${String(e.port).padEnd(6)} ${e.mode.padEnd(7)} ${e.path}`);
    console.log("\nCtrl-C stops them all. `npm run unlink:local` puts the installed packages back.\n");

    const stop = () => { index.close(); for (const e of running) e.child.kill("SIGTERM"); process.exit(0); };
    process.on("SIGINT", stop);
    process.on("SIGTERM", stop);
}

if (!["status", "link", "unlink", "dev", "build"].includes(command)) {
    console.error("usage: local.mjs <status|link|unlink|dev|build> [--only <part>] [--dist] [--port <base>]");
    process.exit(2);
}
