#!/usr/bin/env node
// Derives the manifest npm publishes from the package's own and writes it into dist/ - the
// directory npm publishes - refusing one that could only resolve inside this workspace. The
// published manifest is not a copy: it drops
//
//   - `exports`. Every source manifest carries the map scripts/gen-exports.mjs derives from the
//     package's tree, with the `@bitbybit-dev/source` condition first in each entry: a consumer that
//     declares the condition resolves the TypeScript sources (each package's test configuration
//     does, so a suite sees a sibling's edit without a rebuild; a linked application can), and one
//     that does not resolves dist/. TypeScript, esbuild and Vite resolve an
//     exports target as the exact file it names, so the map spells out every subpath a sibling or a
//     consumer imports without an extension - each directory index under lib, each kernel module -
//     and maps the rest by pattern: an extensionless request to the .ts source, a .js request to the
//     module of that name. A published package keeps resolving through `main` and `types`, as every
//     version so far has: an exports map in the tarball would refuse the extensionless deep imports
//     the examples and users' projects make, and scripts/check-tarballs.mjs imports the packed
//     packages exactly that way. The condition name never leaves this repository.
//   - `devDependencies` and `scripts`: they describe building and testing this tree, not using
//     the package.
//
// The manifests link as siblings through exact pins, never through the workspace: protocol, so a
// link:, file: or workspace: specifier reaching a published manifest is a mistake, and pnpm would
// not rewrite it on the way out of dist/. The script also writes the .npmignore that keeps tsc's
// build info out of the tarball: the build info lives in dist/ so that deleting dist/ deletes it too
// (tsc -b trusts it over the outputs when it decides a project is up to date), and npm must not ship
// it. And it holds the manifest to the one repository field npm's provenance accepts: the publish
// workflow runs in github.com/bitbybit-dev/bitbybit and the registry compares the published
// manifest's repository.url against it, so a URL with a /tree/... path or without the canonical form
// fails the publish after the tarball is built.
//
// scripts/check-exports.mjs imports what is exported here to hold every source manifest to the
// expected map and every built dist/package.json to exactly this derivation.
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const SOURCE_CONDITION = "@bitbybit-dev/source";
export const DROPPED_FIELDS = ["exports", "devDependencies", "scripts"];
// The map a package's tree implies. Exact entries first (they win over patterns): the root, every
// directory index under lib/, every JavaScript module with typings beside it (the kernels, the
// generated jscad module), then the patterns for everything else.
export function expectedExports(dir) {
    const entry = (source, stem) => ({ [SOURCE_CONDITION]: source, types: `./dist/${stem}.d.ts`, default: `./dist/${stem}.js` });
    const map = { ".": entry("./index.ts", "index") };
    const indexDirs = [];
    const walk = (rel) => {
        const abs = join(dir, rel);
        if (existsSync(join(abs, "index.ts"))) indexDirs.push(rel);
        for (const e of readdirSync(abs, { withFileTypes: true })) if (e.isDirectory() && e.name !== "node_modules") walk(`${rel}/${e.name}`);
    };
    if (existsSync(join(dir, "lib"))) walk("lib");
    for (const rel of indexDirs.sort()) map[`./${rel}`] = entry(`./${rel}/index.ts`, `${rel}/index`);
    const jsModules = (rel) => readdirSync(join(dir, rel)).filter((f) => f.endsWith(".js") && existsSync(join(dir, rel, f.replace(/\.js$/, ".d.ts")))).sort()
        .map((f) => (rel === "." ? f.slice(0, -3) : `${rel}/${f.slice(0, -3)}`));
    const kernelDirs = existsSync(join(dir, "kernels.json")) ? JSON.parse(readFileSync(join(dir, "kernels.json"), "utf8")).kernels.map((k) => k.dir).sort() : [];
    for (const k of kernelDirs) {
        for (const stem of jsModules(k)) map[`./${stem}`] = { [SOURCE_CONDITION]: `./${stem}.js`, types: `./dist/${stem}.d.ts`, default: `./dist/${stem}.js` };
        map[`./${k}/*`] = { [SOURCE_CONDITION]: `./${k}/*`, types: `./dist/${k}/*`, default: `./dist/${k}/*` };
    }
    for (const stem of jsModules(".")) map[`./${stem}`] = { [SOURCE_CONDITION]: `./${stem}.js`, types: `./dist/${stem}.d.ts`, default: `./dist/${stem}.js` };
    map["./package.json"] = "./package.json";
    map["./*.js"] = { [SOURCE_CONDITION]: "./*.js", types: "./dist/*.d.ts", default: "./dist/*.js" };
    map["./*"] = { [SOURCE_CONDITION]: "./*.ts", types: "./dist/*.d.ts", default: "./dist/*.js" };
    return map;
}

// What keeps the source manifest of a dist-published package out of dist/: an empty list means it
// may be published. `dir` is the package directory, whose basename must match repository.directory.
export function manifestProblems(manifest, dir) {
    const problems = [];
    const repository = manifest.repository ?? {};
    if (repository.type !== "git" || repository.url !== "git+https://github.com/bitbybit-dev/bitbybit.git" || repository.directory !== `packages/dev/${basename(dir)}`) {
        problems.push(`repository must be { "type": "git", "url": "git+https://github.com/bitbybit-dev/bitbybit.git", "directory": "packages/dev/${basename(dir)}" } for provenance, found ${JSON.stringify(repository)}`);
    }
    for (const field of ["dependencies", "peerDependencies", "optionalDependencies"]) {
        for (const [name, spec] of Object.entries(manifest[field] ?? {})) {
            if (/^(workspace|link|file|portal):/.test(String(spec))) problems.push(`${field}.${name} = ${spec} may only be a registry specifier`);
        }
    }
    if (JSON.stringify(manifest.exports) !== JSON.stringify(expectedExports(dir))) problems.push("exports is not the map the package's tree implies - run `npm run gen:exports`");
    if (!existsSync(join(dir, "index.ts"))) problems.push("index.ts must exist at the package root - the exports map names it as the source entry");
    return problems;
}

// The text of dist/package.json derived from the source manifest's text, keeping its indentation.
export function publishedManifest(text) {
    const manifest = JSON.parse(text);
    for (const field of DROPPED_FIELDS) delete manifest[field];
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
    if (!existsSync(join(dir, "dist"))) mkdirSync(join(dir, "dist"));
    writeFileSync(join(dir, "dist", "package.json"), publishedManifest(text));
    writeFileSync(join(dir, "dist", ".npmignore"), "*.tsbuildinfo\n");
}
