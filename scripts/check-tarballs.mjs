#!/usr/bin/env node
// Packs every published package the way npm will and installs the tarballs together into an empty
// project, the way a user's install resolves them, so a package that only works inside this
// workspace fails here and not on a user's machine: a sibling pinned to a version no tarball
// provides, a dependency a manifest forgot to declare, a build info file that slipped past
// .npmignore, a workspace: specifier. A typed probe then imports each package as a consumer would:
// its root, and the extensionless subpaths the examples reach into (`<package>/lib/api/inputs`, the
// occt kernels), which an exports map in a published manifest would refuse - so a dist-published
// manifest is held to carry none, nor anything else dist-manifest.mjs drops from the source one.
// There is no runtime import: the packages compile to extensionless relative imports for
// bundlers, which plain Node's ESM loader refuses, and that is how they have always shipped.
//
// Two packages publish from their own root through a files allowlist rather than from a staged
// dist, so tsconfig.build.json does not name them and nothing packed them at all until they were
// listed here. Every defect this file grew to catch - a .gitignore npm silently strips, a source
// map pointing at sources the tarball excludes - was found in exactly that gap.
//
// Needs the dists built first: `npm run build-packages` for the composite ones, and each root
// package's own build. No network beyond the third-party dependencies.
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, posix, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { DROPPED_FIELDS, SOURCE_CONDITION } from "./dist-manifest.mjs";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const noComments = (text) => text.split("\n").filter((line) => !line.trimStart().startsWith("//")).join("\n");
const run = (cmd, args, cwd) => execFileSync(cmd, args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
const fail = (message) => { console.error(`check:tarballs: ${message}`); process.exit(1); };

// npm removes a file of one of these names from every tarball, whatever the files allowlist says,
// and reports nothing. A package that needs one ships it under another name and restores it on use.
const NPM_ALWAYS_STRIPS = new Set([".gitignore", ".npmrc"]);
const BINARY = /\.(wasm|png|jpe?g|gif|webp|ico|svgz|woff2?|ttf|otf|eot|zip|gz|tgz|pdf|mp4|webm|br)$/i;
const SCAN_LIMIT = 4 * 1024 * 1024;
// Shapes that are a credential wherever they appear. Deliberately not "a name that sounds secret
// next to a string": these packages are full of `"x-api-key": this.apiKey`, which is a header name
// reading configuration, and a check that cries wolf on those would be turned off within a week.
const SECRETS = [
    [/-----BEGIN (?:[A-Z ]+ )?PRIVATE KEY-----/, "a private key"],
    [/\bgh[pousr]_[A-Za-z0-9]{30,}/, "a GitHub token"],
    [/\bxox[baprs]-[A-Za-z0-9-]{10,}/, "a Slack token"],
    [/\bAKIA[0-9A-Z]{16}\b/, "an AWS access key id"],
    [/\bnpm_[A-Za-z0-9]{30,}/, "an npm token"],
    [/\beyJ[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{10,}/, "a JSON web token"],
];
// The emscripten glue names its own virtual filesystem root, which is not anybody's home directory.
const HOME_PATHS = /(?:\/Users\/|\/home\/|[A-Za-z]:\\Users\\)[A-Za-z0-9._-]+/g;
const VIRTUAL_HOME = "/home/web_user";

const distProjects = JSON.parse(noComments(readFileSync(join(ROOT, "tsconfig.build.json"), "utf8"))).references
    .map((r) => ({ dir: join(ROOT, dirname(r.path)), fromDist: true }));
const rootProjects = ["cad-cloud-sdk", "create-app"].map((n) => ({ dir: join(ROOT, "packages/dev", n), fromDist: false }));
const packDir = mkdtempSync(join(tmpdir(), "bitbybit-tarballs-"));
const probeDir = mkdtempSync(join(tmpdir(), "bitbybit-tarball-probe-"));
const cleanup = () => { rmSync(packDir, { recursive: true, force: true }); rmSync(probeDir, { recursive: true, force: true }); };
process.on("exit", cleanup);

const walk = (dir, out = []) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        if (entry.name === "node_modules" || entry.name === ".git") continue;
        const p = join(dir, entry.name);
        if (entry.isDirectory()) walk(p, out); else out.push(p);
    }
    return out;
};

function checkNothingSilentlyStripped(name, dir, roots) {
    const doomed = [];
    for (const root of roots) {
        const p = join(dir, root);
        if (!existsSync(p)) continue;
        for (const f of statSync(p).isDirectory() ? walk(p) : [p]) {
            if (NPM_ALWAYS_STRIPS.has(basename(f))) doomed.push(relative(dir, f));
        }
    }
    if (doomed.length) {
        fail(`${name} would publish ${doomed.join(", ")}, and npm strips every file of that name out of a tarball without saying so - stage it under a name npm keeps, such as _gitignore, and restore it where the package writes it out`);
    }
}

function checkSourceMapsResolve(name, publishDir, shipped) {
    const present = new Set(shipped);
    for (const f of shipped.filter((s) => s.endsWith(".map"))) {
        let map;
        try { map = JSON.parse(readFileSync(join(publishDir, f), "utf8")); } catch { continue; }
        const contents = map.sourcesContent ?? [];
        (map.sources ?? []).forEach((source, i) => {
            if (contents[i]) return;
            const target = posix.normalize(posix.join(posix.dirname(f), source));
            if (!present.has(target)) {
                fail(`${name} ships ${f}, whose source ${source} is neither in the tarball nor inlined - a consumer stepping into this package lands on nothing. Ship the sources, or stop emitting the map.`);
            }
        });
    }
}

function checkNoSecrets(name, publishDir, shipped) {
    for (const f of shipped) {
        if (BINARY.test(f)) continue;
        const p = join(publishDir, f);
        if (!existsSync(p) || statSync(p).size > SCAN_LIMIT) continue;
        const text = readFileSync(p, "latin1");
        if (text.includes("\0")) continue;
        for (const [pattern, what] of SECRETS) {
            if (pattern.test(text)) fail(`${name} ships ${f}, which contains what looks like ${what}`);
        }
        const homes = (text.match(HOME_PATHS) ?? []).filter((m) => m !== VIRTUAL_HOME);
        if (homes.length) fail(`${name} ships ${f}, which carries ${homes[0]} - an absolute path from the machine that built it`);
    }
}

const packages = [];
for (const { dir, fromDist } of [...distProjects, ...rootProjects]) {
    const publishDir = fromDist ? join(dir, "dist") : dir;
    const manifestPath = join(publishDir, "package.json");
    if (!existsSync(manifestPath)) fail(`${relative(ROOT, publishDir)} has no package.json - build this package first`);
    const manifestText = readFileSync(manifestPath, "utf8");
    const manifest = JSON.parse(manifestText);
    if (fromDist) {
        if (manifestText.includes(SOURCE_CONDITION)) fail(`${manifest.name} would publish the ${SOURCE_CONDITION} condition`);
        for (const field of DROPPED_FIELDS) if (field in manifest) fail(`${manifest.name} would publish ${field}, which dist-manifest.mjs drops`);
    } else if (!existsSync(join(dir, "dist"))) {
        fail(`${manifest.name} has no dist/ - it publishes from its own root through files, so build it before this check`);
    }
    for (const field of ["dependencies", "peerDependencies", "optionalDependencies"]) {
        for (const [name, spec] of Object.entries(manifest[field] ?? {})) {
            if (/^(workspace|link|file|portal):/.test(String(spec))) fail(`${manifest.name} ${field}.${name} = ${spec} would only resolve inside this workspace`);
        }
    }
    // A published exports map is a closed door: every subpath not named in it is refused. Tooling
    // reads a package's own manifest as a matter of course - the install smoke does - so a map that
    // omits ./package.json breaks consumers in a way no import of the package itself reveals.
    if (manifest.exports && typeof manifest.exports === "object" && !("./package.json" in manifest.exports)) {
        fail(`${manifest.name} publishes an exports map without "./package.json", so anything reading its manifest - tooling, the install smoke - fails with ERR_PACKAGE_PATH_NOT_EXPORTED. Add "./package.json": "./package.json" to it.`);
    }
    checkNothingSilentlyStripped(manifest.name, publishDir, fromDist ? ["."] : (manifest.files ?? ["."]));
    // npm 11.6 answers with an array of one entry; a later npm answers with the entry itself, and
    // destructuring the second as the first throws "object is not iterable" halfway through a
    // release. Take either shape, and say which npm produced a third rather than crashing on it.
    const packOutput = JSON.parse(run("npm", ["pack", "--json", "--ignore-scripts", "--pack-destination", packDir], publishDir));
    const packed = Array.isArray(packOutput) ? packOutput[0] : packOutput;
    if (!packed?.filename || !Array.isArray(packed.files)) {
        fail(`npm ${run("npm", ["--version"]).trim()} answered \`npm pack --json\` in a shape this does not understand: ${JSON.stringify(packOutput).slice(0, 200)}`);
    }
    const shipped = packed.files.map((f) => f.path);
    const leaked = shipped.filter((f) => f.endsWith(".tsbuildinfo") || f.endsWith(".npmignore") || f.startsWith("coverage/") || f.startsWith("babel.config"));
    if (leaked.length) fail(`${manifest.name} ships build-only files: ${leaked.join(", ")}`);
    checkSourceMapsResolve(manifest.name, publishDir, shipped);
    checkNoSecrets(manifest.name, publishDir, shipped);
    const subpaths = fromDist
        ? ["lib", "lib/api/inputs", "lib/api/models"].filter((s) => shipped.includes(`${s}/index.d.ts`))
        : Object.keys(manifest.exports ?? {}).filter((k) => k !== "." && k !== "./package.json").map((k) => k.slice(2));
    if (shipped.includes("jscad-generated.d.ts")) subpaths.push("jscad-generated");
    // create-app is a bin, not a library: it declares no types, so a consumer never imports it and
    // the typed probe has nothing to assert. It is packed and scanned like everything else.
    const probe = fromDist || Boolean(manifest.types ?? manifest.typings);
    packages.push({ name: manifest.name, version: manifest.version, tarball: join(packDir, packed.filename), files: shipped.length, subpaths, probe });
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
console.log("no tarball carries a credential, an absolute build path, a file npm would strip, or a source map pointing outside itself");

const installable = packages.filter((p) => p.probe);
writeFileSync(join(probeDir, "package.json"), JSON.stringify({ name: "bitbybit-tarball-probe", private: true, type: "module" }, null, 2));
try {
    run("npm", ["install", "--ignore-scripts", "--no-audit", "--no-fund", "--legacy-peer-deps", "--loglevel=error", ...installable.map((p) => p.tarball)], probeDir);
} catch (error) {
    fail(`installing the tarballs into an empty project failed:\n${error.stderr || error.stdout || error.message}`);
}
for (const p of installable) {
    const installed = join(probeDir, "node_modules", p.name, "package.json");
    if (!existsSync(installed)) fail(`${p.name} is missing after the install`);
    const version = JSON.parse(readFileSync(installed, "utf8")).version;
    if (version !== p.version) fail(`${p.name} resolved to ${version} from the registry instead of the packed ${p.version} - a sibling pin does not match the tarballs`);
}

writeFileSync(join(probeDir, "probe.ts"), installable.flatMap((p, i) => [
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
const probed = installable.reduce((n, p) => n + p.subpaths.length, 0);
console.log(`installed ${installable.length} of them together into an empty project; every typed import resolves (${installable.length} roots, ${probed} subpaths)`);
