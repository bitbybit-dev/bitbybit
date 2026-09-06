#!/usr/bin/env node
// Packs every built package from dist/ - the directory npm publishes - and installs all the tarballs
// together into an empty project, the way a user's install resolves them, so a package that only
// works inside this workspace fails here and not on a user's machine: a sibling pinned to a version
// no tarball provides, a dependency a manifest forgot to declare, a build info file that slipped
// past .npmignore, a workspace: specifier. A typed probe then imports every package as a consumer
// would: its root, and the extensionless subpaths the examples reach into (`<package>/lib/api/inputs`,
// the occt kernels), which an exports map in a published manifest would refuse - so the published
// manifest is held to carry none, nor anything else dist-manifest.mjs drops from the source one.
// There is no runtime import: the packages compile to extensionless relative imports for
// bundlers, which plain Node's ESM loader refuses, and that is how they have always shipped. Needs
// the dists built first (`npm run build-packages`); no network beyond the third-party dependencies.
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { DROPPED_FIELDS, SOURCE_CONDITION } from "./dist-manifest.mjs";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const noComments = (text) => text.split("\n").filter((line) => !line.trimStart().startsWith("//")).join("\n");
const run = (cmd, args, cwd) => execFileSync(cmd, args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
const fail = (message) => { console.error(`check:tarballs: ${message}`); process.exit(1); };

const projects = JSON.parse(noComments(readFileSync(join(ROOT, "tsconfig.build.json"), "utf8"))).references
    .map((r) => join(ROOT, dirname(r.path)));
const packDir = mkdtempSync(join(tmpdir(), "bitbybit-tarballs-"));
const probeDir = mkdtempSync(join(tmpdir(), "bitbybit-tarball-probe-"));
const cleanup = () => { rmSync(packDir, { recursive: true, force: true }); rmSync(probeDir, { recursive: true, force: true }); };
process.on("exit", cleanup);

const packages = [];
for (const dir of projects) {
    const dist = join(dir, "dist");
    if (!existsSync(join(dist, "package.json"))) fail(`${relative(ROOT, dist)} has no package.json - run \`npm run build-packages\` first`);
    const manifestText = readFileSync(join(dist, "package.json"), "utf8");
    const manifest = JSON.parse(manifestText);
    if (manifestText.includes(SOURCE_CONDITION)) fail(`${manifest.name} would publish the ${SOURCE_CONDITION} condition`);
    for (const field of DROPPED_FIELDS) if (field in manifest) fail(`${manifest.name} would publish ${field}, which dist-manifest.mjs drops`);
    for (const field of ["dependencies", "peerDependencies", "optionalDependencies"]) {
        for (const [name, spec] of Object.entries(manifest[field] ?? {})) {
            if (/^(workspace|link|file|portal):/.test(String(spec))) fail(`${manifest.name} ${field}.${name} = ${spec} would only resolve inside this workspace`);
        }
    }
    const [packed] = JSON.parse(run("npm", ["pack", "--json", "--pack-destination", packDir], dist));
    const shipped = packed.files.map((f) => f.path);
    const leaked = shipped.filter((f) => f.endsWith(".tsbuildinfo") || f.endsWith(".npmignore") || f.startsWith("coverage/") || f.startsWith("babel.config"));
    if (leaked.length) fail(`${manifest.name} ships build-only files: ${leaked.join(", ")}`);
    const subpaths = ["lib", "lib/api/inputs", "lib/api/models"].filter((s) => shipped.includes(`${s}/index.d.ts`));
    if (shipped.includes("jscad-generated.d.ts")) subpaths.push("jscad-generated");
    packages.push({ name: manifest.name, version: manifest.version, tarball: join(packDir, packed.filename), files: shipped.length, subpaths });
    if (manifest.name === "@bitbybit-dev/occt") {
        const kernels = JSON.parse(readFileSync(join(dir, "kernels.json"), "utf8")).kernels;
        subpaths.push(...kernels.flatMap((k) => [`${k.dir}/${k.dir}`, `${k.dir}/cdn`]));
        const required = [
            "NOTICE", "licenses/LGPL-2.1.txt", "licenses/OCCT-LGPL-exception.txt", "licenses/Draco-Apache-2.0.txt",
            ...kernels.flatMap((k) => [`${k.dir}/${k.file}`, `${k.dir}/${k.dir}.js`, `${k.dir}/${k.dir}.d.ts`, `${k.dir}/index.js`, `${k.dir}/index.d.ts`, `${k.dir}/cdn.js`]),
        ];
        const missing = required.filter((f) => !shipped.includes(f));
        if (missing.length) fail(`${manifest.name} tarball lacks ${missing.join(", ")} - the kernels, their typings and the license notices must ship`);
        const stray = shipped.filter((f) => /\.wasm$/.test(f) && !kernels.some((k) => f === `${k.dir}/${k.file}`));
        if (stray.length) fail(`${manifest.name} tarball ships kernels kernels.json does not list: ${stray.join(", ")}`);
    }
}
console.log(`packed ${packages.length} tarballs: ${packages.map((p) => `${p.name.replace("@bitbybit-dev/", "")} (${p.files} files)`).join(", ")}`);

writeFileSync(join(probeDir, "package.json"), JSON.stringify({ name: "bitbybit-tarball-probe", private: true, type: "module" }, null, 2));
try {
    run("npm", ["install", "--ignore-scripts", "--no-audit", "--no-fund", "--legacy-peer-deps", "--loglevel=error", ...packages.map((p) => p.tarball)], probeDir);
} catch (error) {
    fail(`installing the tarballs into an empty project failed:\n${error.stderr || error.stdout || error.message}`);
}
for (const p of packages) {
    const installed = join(probeDir, "node_modules", p.name, "package.json");
    if (!existsSync(installed)) fail(`${p.name} is missing after the install`);
    const version = JSON.parse(readFileSync(installed, "utf8")).version;
    if (version !== p.version) fail(`${p.name} resolved to ${version} from the registry instead of the packed ${p.version} - a sibling pin does not match the tarballs`);
}

writeFileSync(join(probeDir, "probe.ts"), packages.flatMap((p, i) => [
    `import * as p${i} from "${p.name}";\nvoid p${i};`,
    ...p.subpaths.map((s, j) => `import * as p${i}_${j} from "${p.name}/${s}";\nvoid p${i}_${j};`),
]).join("\n") + "\n");
writeFileSync(join(probeDir, "tsconfig.json"), JSON.stringify({
    compilerOptions: { module: "esnext", moduleResolution: "bundler", target: "es2020", strict: false, skipLibCheck: true, noEmit: true, types: [] },
    files: ["probe.ts"],
}, null, 2));
try {
    run(join(ROOT, "node_modules", ".bin", "tsc"), ["-p", "tsconfig.json"], probeDir);
} catch (error) {
    fail(`a consumer's typed import does not resolve:\n${error.stdout || error.stderr || error.message}`);
}
const probed = packages.reduce((n, p) => n + p.subpaths.length, 0);
console.log(`installed the ${packages.length} tarballs together into an empty project; every typed import resolves (${packages.length} roots, ${probed} subpaths)`);
