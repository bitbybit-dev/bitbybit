#!/usr/bin/env node
// Writes the package's manifest into dist/ - the directory npm publishes - and refuses one that
// could only resolve inside this workspace. The manifests link as siblings through exact pins,
// never through the workspace: protocol, so a link:, file: or workspace: specifier reaching a
// published manifest is a mistake, and pnpm would not rewrite it on the way out of dist/. It also
// writes the .npmignore that keeps tsc's build info out of the tarball: the build info lives in
// dist/ so that deleting dist/ deletes it too (tsc -b trusts it over the outputs when it decides a
// project is up to date), and npm must not ship it.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const dir = process.cwd();
const text = readFileSync(join(dir, "package.json"), "utf8");
const manifest = JSON.parse(text);
const offenders = [];
for (const field of ["dependencies", "peerDependencies", "optionalDependencies"]) {
    for (const [name, spec] of Object.entries(manifest[field] ?? {})) {
        if (/^(workspace|link|file|portal):/.test(String(spec))) offenders.push(`${field}.${name} = ${spec}`);
    }
}
if (offenders.length) {
    console.error(`${manifest.name}: the published manifest may only carry registry specifiers, found:\n  ${offenders.join("\n  ")}`);
    process.exit(1);
}
if (!existsSync(join(dir, "dist"))) mkdirSync(join(dir, "dist"));
writeFileSync(join(dir, "dist", "package.json"), text);
writeFileSync(join(dir, "dist", ".npmignore"), "*.tsbuildinfo\n");
