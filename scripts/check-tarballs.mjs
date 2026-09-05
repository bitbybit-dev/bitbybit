#!/usr/bin/env node
// Packs every built package from dist/ - the directory npm publishes - and installs all the tarballs
// together into an empty project, the way a user's install resolves them, so a package that only
// works inside this workspace fails here and not on a user's machine: a sibling pinned to a version
// no tarball provides, a dependency a manifest forgot to declare, a build info file that slipped
// past .npmignore, a workspace: specifier. A typed probe then imports every package as a consumer
// would. There is no runtime import: the packages compile to extensionless relative imports for
// bundlers, which plain Node's ESM loader refuses, and that is how they have always shipped. Needs
// the dists built first (`npm run build-packages`); no network beyond the third-party dependencies.
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

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
    const manifest = JSON.parse(readFileSync(join(dist, "package.json"), "utf8"));
    for (const field of ["dependencies", "peerDependencies", "optionalDependencies"]) {
        for (const [name, spec] of Object.entries(manifest[field] ?? {})) {
            if (/^(workspace|link|file|portal):/.test(String(spec))) fail(`${manifest.name} ${field}.${name} = ${spec} would only resolve inside this workspace`);
        }
    }
    const [packed] = JSON.parse(run("npm", ["pack", "--json", "--pack-destination", packDir], dist));
    const shipped = packed.files.map((f) => f.path);
    const leaked = shipped.filter((f) => f.endsWith(".tsbuildinfo") || f.endsWith(".npmignore") || f.startsWith("coverage/"));
    if (leaked.length) fail(`${manifest.name} ships build-only files: ${leaked.join(", ")}`);
    packages.push({ name: manifest.name, version: manifest.version, tarball: join(packDir, packed.filename), files: shipped.length });
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

writeFileSync(join(probeDir, "probe.ts"), packages.map((p, i) => `import * as p${i} from "${p.name}";\nvoid p${i};`).join("\n") + "\n");
writeFileSync(join(probeDir, "tsconfig.json"), JSON.stringify({
    compilerOptions: { module: "esnext", moduleResolution: "bundler", target: "es2020", strict: false, skipLibCheck: true, noEmit: true, types: [] },
    files: ["probe.ts"],
}, null, 2));
try {
    run(join(ROOT, "node_modules", ".bin", "tsc"), ["-p", "tsconfig.json"], probeDir);
} catch (error) {
    fail(`a consumer's typed import does not resolve:\n${error.stdout || error.stderr || error.message}`);
}
console.log(`installed the ${packages.length} tarballs together into an empty project; every typed import resolves`);
