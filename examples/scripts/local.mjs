#!/usr/bin/env node
import { spawn, spawnSync } from "node:child_process";
import { createServer } from "node:http";
import { cpSync, existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import path from "node:path";
import { ROOT, REPO, discover, manifestOf, config } from "./discover.mjs";

const LOCAL = path.join(ROOT, ".local");
const BACKUP = "node_modules/.bitbybit-installed";
const GENERATED_CONFIG = "vite.config.bitbybit-local.mts";
const SCOPE = "@bitbybit-dev/";

const ENGINE_LIBS = ["three", "playcanvas", "@babylonjs/core", "@babylonjs/gui", "@babylonjs/havok", "@babylonjs/loaders", "@babylonjs/materials", "@babylonjs/serializers", "earcut"];

const PORT_FLAG = { vite: ["--port", "%p", "--strictPort"], next: ["-p", "%p"], nuxt: ["--port", "%p"], ng: ["--port", "%p"], webpack: ["--port", "%p"] };

const args = process.argv.slice(2);
const command = args[0];
const only = args.includes("--only") ? args[args.indexOf("--only") + 1] : null;
const forceDist = args.includes("--dist");
const basePort = args.includes("--port") ? Number(args[args.indexOf("--port") + 1]) : 5300;

function workspacePackages() {
    const dir = path.join(REPO, "packages/dev");
    const map = new Map();
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        if (!entry.isDirectory()) {
            continue;
        }
        const home = path.join(dir, entry.name);
        const manifestPath = path.join(home, "package.json");
        if (!existsSync(manifestPath)) {
            continue;
        }
        const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
        const dist = path.join(home, "dist");
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

function installedScope(rel) {
    const dir = path.join(ROOT, rel, "node_modules", SCOPE.slice(0, -1));
    if (!existsSync(dir)) {
        return [];
    }
    return readdirSync(dir).filter((name) => !name.startsWith(".")).sort().map((name) => `${SCOPE}${name}`);
}

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
    if (skip) {
        reason = skip.reason;
    } else if (!declared.length) {
        reason = "declares no package from this workspace";
    } else if (!ours.length) {
        reason = `declares only ${declared.join(", ")}, which this workspace does not publish`;
    } else if (!existsSync(path.join(ROOT, rel, "node_modules"))) {
        reason = "not installed yet - run `npm run install:all` first";
    } else {
        const stale = ours.map((n) => [n, declared.includes(n) ? manifest.dependencies?.[n] ?? manifest.devDependencies?.[n] : null])
            .find(([n, pinned]) => pinned && pinned !== workspace.get(n).version);
        if (stale) {
            reason = `pins ${stale[0]}@${stale[1]}, this workspace is at ${workspace.get(stale[0]).version}`;
        } else {
            mode = forceDist || tool !== "vite" ? "dist" : "source";
        }
    }
    return { path: rel, manifest, script, tool, packages: ours, mode, reason, state, server: Boolean(PORT_FLAG[tool]) };
}

const MARKER = ".bitbybit-local.json";

function isSymlink(target) {
    try {
        return lstatSync(target).isSymbolicLink();
    } catch {
        return false;
    }
}

function linkState(rel, names) {
    let source = 0;
    let dist = 0;
    for (const name of names) {
        const target = path.join(ROOT, rel, "node_modules", name);
        if (!existsSync(target) && !existsSync(path.dirname(target))) {
            continue;
        }
        if (isSymlink(target)) { source++; continue; }
        if (existsSync(path.join(target, MARKER))) {
            dist++;
        }
    }
    if (!source && !dist) {
        return "installed";
    }
    return source ? "local (source)" : "local (dist)";
}

function setAside(rel, name) {
    const target = path.join(ROOT, rel, "node_modules", name);
    const kept = path.join(ROOT, rel, BACKUP, name.slice(SCOPE.length));
    if (!existsSync(target)) {
        return;
    }
    const isLink = lstatSync(target).isSymbolicLink();
    if (isLink || existsSync(path.join(target, MARKER))) { rmSync(target, { recursive: true, force: true }); return; }
    if (existsSync(kept)) { rmSync(target, { recursive: true, force: true }); return; }
    mkdirSync(path.dirname(kept), { recursive: true });
    renameSync(target, kept);
}

function copyTree(from, entries, to) {
    mkdirSync(to, { recursive: true });
    const sources = entries ? entries.map((e) => path.join(from, e)) : [`${from}/.`];
    if (process.platform === "darwin" && spawnSync("cp", ["-Rc", ...sources, to], { stdio: "ignore" }).status === 0) {
        return;
    }
    if (entries) {
        for (const e of entries) {
            cpSync(path.join(from, e), path.join(to, e), { recursive: true, dereference: true });
        }
    } else {
        cpSync(from, to, { recursive: true, dereference: true });
    }
}

function link(p) {
    const missing = p.packages.filter((n) => p.mode === "dist" && !workspace.get(n).built);
    if (missing.length) {
        return { ok: false, note: `${missing.map((n) => n.slice(SCOPE.length)).join(", ")} not built - run \`npm run build-packages\` in the repository root` };
    }

    for (const name of p.packages) {
        const pkg = workspace.get(name);
        const target = path.join(ROOT, p.path, "node_modules", name);
        setAside(p.path, name);
        mkdirSync(path.dirname(target), { recursive: true });
        if (p.mode === "source") {
            symlinkSync(pkg.home, target, "dir");
        } else {
            copyTree(pkg.publishes.from, pkg.publishes.entries, target);
            writeFileSync(path.join(target, MARKER), JSON.stringify({ mode: "dist", from: path.relative(ROOT, pkg.publishes.from) }, null, 4));
        }
    }
    if (p.mode === "source") {
        writeViteConfig(p);
    } else {
        rmSync(path.join(ROOT, p.path, GENERATED_CONFIG), { force: true });
    }
    rmSync(path.join(ROOT, p.path, "node_modules/.vite"), { recursive: true, force: true });
    return { ok: true };
}

function unlink(p) {
    for (const name of p.packages) {
        const target = path.join(ROOT, p.path, "node_modules", name);
        const kept = path.join(ROOT, p.path, BACKUP, name.slice(SCOPE.length));
        if (isSymlink(target) || (existsSync(target) && existsSync(path.join(target, MARKER)))) {
            rmSync(target, { recursive: true, force: true });
        }
        if (existsSync(kept) && !existsSync(target)) {
            renameSync(kept, target);
        }
    }
    const backup = path.join(ROOT, p.path, BACKUP);
    if (existsSync(backup) && !readdirSync(backup).length) {
        rmSync(backup, { recursive: true, force: true });
    }
    rmSync(path.join(ROOT, p.path, GENERATED_CONFIG), { force: true });
    rmSync(path.join(ROOT, p.path, "node_modules/.vite"), { recursive: true, force: true });
    const restored = p.packages.filter((n) => existsSync(path.join(ROOT, p.path, "node_modules", n)));
    return { ok: true, note: restored.length === p.packages.length ? undefined : "some packages have no installed copy to put back - run `npm ci` in the example" };
}

function writeViteConfig(p) {
    const own = ["vite.config.ts", "vite.config.mts", "vite.config.js", "vite.config.mjs"].find((f) => existsSync(path.join(ROOT, p.path, f)));
    const port = ports.get(p.path);
    const body = `// GENERATED by examples/scripts/local.mjs - not tracked; removed by \`npm run unlink:local\`.
import { defineConfig, mergeConfig${own ? ", loadConfigFromFile" : ""} } from "vite";

const local = {
    resolve: {
        conditions: ["@bitbybit-dev/source", "module", "browser", "development|production"],
        dedupe: ${JSON.stringify(ENGINE_LIBS)},
    },
    optimizeDeps: { exclude: ${JSON.stringify(p.packages)} },
    server: {
        port: ${port},
        strictPort: true,
        fs: { allow: [${JSON.stringify(REPO)}] },
    },
};

export default defineConfig(async (env) => {
${own ? `    const own = await loadConfigFromFile(env, ${JSON.stringify(path.join(ROOT, p.path, own))});\n    return mergeConfig(own?.config ?? {}, local);` : "    return local;"}
});
`;
    writeFileSync(path.join(ROOT, p.path, GENERATED_CONFIG), body);
}

const all = discover().map(plan);
const examples = all.filter((e) => !only || e.path.includes(only));
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

if (command === "link") {
    runLinkable(link, (e) => `${e.mode}, ${e.packages.length} package(s)`);
}
if (command === "unlink") {
    runLinkable(unlink, () => "installed copies restored");
}

if (command === "build") {
    mkdirSync(LOCAL, { recursive: true });
    const rows = [];
    for (const e of examples) {
        if (!e.mode) { console.log(`skip  ${e.path.padEnd(42)} ${e.reason}`); continue; }
        if (e.mode === "dist" && !e.manifest.scripts?.build) { console.log(`skip  ${e.path.padEnd(42)} has no build script`); continue; }
        const linked = link(e);
        if (!linked.ok) { console.log(`FAIL  ${e.path.padEnd(42)} ${linked.note}`); rows.push({ ...linked, path: e.path }); continue; }
        const [cmd, cmdArgs] = e.mode === "source"
            ? ["npx", ["vite", "build", "--config", GENERATED_CONFIG]]
            : ["npm", ["run", "build"]];
        const started = Date.now();
        const r = spawnSync(cmd, cmdArgs, { cwd: path.join(ROOT, e.path), encoding: "utf8", env: { ...process.env, CI: "1", NO_COLOR: "1" } });
        const log = path.join(LOCAL, `${e.path.replaceAll("/", "__")}.build.log`);
        writeFileSync(log, `$ ${cmd} ${cmdArgs.join(" ")}\n${r.stdout ?? ""}${r.stderr ?? ""}`);
        const ok = r.status === 0;
        console.log(`${ok ? "ok  " : "FAIL"}  ${e.path.padEnd(42)} ${e.mode}  (${((Date.now() - started) / 1000).toFixed(0)}s)`);
        if (!ok) {
            console.log((r.stdout + r.stderr).split("\n").slice(-20).map((l) => `        ${l}`).join("\n"));
        }
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
        child.on("exit", (code) => {
            if (code) {
                console.log(`  ${e.path.padEnd(42)} exited with ${code}`);
            }
        });
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
    for (const e of running) {
        console.log(`    ${String(e.port).padEnd(6)} ${e.mode.padEnd(7)} ${e.path}`);
    }
    console.log("\nCtrl-C stops them all. `npm run unlink:local` puts the installed packages back.\n");

    const stop = () => {
        index.close();
        for (const e of running) {
            e.child.kill("SIGTERM");
        }
        process.exit(0);
    };
    process.on("SIGINT", stop);
    process.on("SIGTERM", stop);
}

if (!["status", "link", "unlink", "dev", "build"].includes(command)) {
    console.error("usage: local.mjs <status|link|unlink|dev|build> [--only <part>] [--dist] [--port <base>]");
    process.exit(2);
}
