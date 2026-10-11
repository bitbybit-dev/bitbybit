#!/usr/bin/env node
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const SOURCE_CONDITION = "@bitbybit-dev/source";
export const DROPPED_FIELDS = ["exports", "devDependencies", "scripts"];
export function expectedExports(dir) {
    const entry = (source, stem) => ({ [SOURCE_CONDITION]: source, types: `./dist/${stem}.d.ts`, default: `./dist/${stem}.js` });
    const map = { ".": entry("./index.ts", "index") };
    const indexDirs = [];
    const walk = (rel) => {
        const abs = join(dir, rel);
        if (existsSync(join(abs, "index.ts"))) {
            indexDirs.push(rel);
        }
        for (const e of readdirSync(abs, { withFileTypes: true })) {
            if (e.isDirectory() && e.name !== "node_modules") {
                walk(`${rel}/${e.name}`);
            }
        }
    };
    if (existsSync(join(dir, "lib"))) {
        walk("lib");
    }
    for (const rel of indexDirs.sort()) {
        map[`./${rel}`] = entry(`./${rel}/index.ts`, `${rel}/index`);
    }
    const jsModules = (rel, typingsBeside = true) => readdirSync(join(dir, rel)).filter((f) => f.endsWith(".js") && (!typingsBeside || existsSync(join(dir, rel, f.replace(/\.js$/, ".d.ts"))))).sort()
        .map((f) => (rel === "." ? f.slice(0, -3) : `${rel}/${f.slice(0, -3)}`));
    const kernelDirs = existsSync(join(dir, "kernels.json")) ? JSON.parse(readFileSync(join(dir, "kernels.json"), "utf8")).kernels.map((k) => k.dir).sort() : [];
    for (const k of kernelDirs) {
        for (const stem of jsModules(k)) {
            map[`./${stem}`] = { [SOURCE_CONDITION]: `./${stem}.js`, types: `./dist/${stem}.d.ts`, default: `./dist/${stem}.js` };
        }
        map[`./${k}/*`] = { [SOURCE_CONDITION]: `./${k}/*`, types: `./dist/${k}/*`, default: `./dist/${k}/*` };
    }
    for (const stem of jsModules(".", false)) {
        map[`./${stem}`] = { [SOURCE_CONDITION]: `./${stem}.js`, types: `./dist/${stem}.d.ts`, default: `./dist/${stem}.js` };
    }
    map["./package.json"] = "./package.json";
    map["./*.js"] = { [SOURCE_CONDITION]: "./*.js", types: "./dist/*.d.ts", default: "./dist/*.js" };
    map["./*"] = { [SOURCE_CONDITION]: "./*.ts", types: "./dist/*.d.ts", default: "./dist/*.js" };
    return map;
}

export function manifestProblems(manifest, dir) {
    const problems = [];
    const repository = manifest.repository ?? {};
    if (repository.type !== "git" || repository.url !== "git+https://github.com/bitbybit-dev/bitbybit.git" || repository.directory !== `packages/dev/${basename(dir)}`) {
        problems.push(`repository must be { "type": "git", "url": "git+https://github.com/bitbybit-dev/bitbybit.git", "directory": "packages/dev/${basename(dir)}" } for provenance, found ${JSON.stringify(repository)}`);
    }
    for (const field of ["dependencies", "peerDependencies", "optionalDependencies"]) {
        for (const [name, spec] of Object.entries(manifest[field] ?? {})) {
            if (/^(workspace|link|file|portal):/.test(String(spec))) {
                problems.push(`${field}.${name} = ${spec} may only be a registry specifier`);
            }
        }
    }
    if (JSON.stringify(manifest.exports) !== JSON.stringify(expectedExports(dir))) {
        problems.push("exports is not the map the package's tree implies - run `npm run gen:exports`");
    }
    if (!existsSync(join(dir, "index.ts"))) {
        problems.push("index.ts must exist at the package root - the exports map names it as the source entry");
    }
    return problems;
}

export function publishedManifest(text) {
    const manifest = JSON.parse(text);
    for (const field of DROPPED_FIELDS) {
        delete manifest[field];
    }
    const indent = (text.match(/^[ \t]+(?=")/m) ?? ["  "])[0];
    return `${JSON.stringify(manifest, null, indent)}\n`;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    const dir = process.cwd();
    const text = readFileSync(join(dir, "package.json"), "utf8");
    const manifest = JSON.parse(text);
    const problems = manifestProblems(manifest, dir);
    if (problems.length) {
        console.error(`${manifest.name}: the manifest cannot be published:\n  ${problems.join("\n  ")}`);
        process.exit(1);
    }
    if (!existsSync(join(dir, "dist"))) {
        mkdirSync(join(dir, "dist"));
    }
    writeFileSync(join(dir, "dist", "package.json"), publishedManifest(text));
    writeFileSync(join(dir, "dist", ".npmignore"), "*.tsbuildinfo\n");
}
