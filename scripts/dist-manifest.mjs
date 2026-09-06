#!/usr/bin/env node
// Writes the package's manifest into dist/ - the directory npm publishes - and refuses one that
// could only resolve inside this workspace. The manifests link as siblings through exact pins,
// never through the workspace: protocol, so a link:, file: or workspace: specifier reaching a
// published manifest is a mistake, and pnpm would not rewrite it on the way out of dist/. It also
// writes the .npmignore that keeps tsc's build info out of the tarball: the build info lives in
// dist/ so that deleting dist/ deletes it too (tsc -b trusts it over the outputs when it decides a
// project is up to date), and npm must not ship it. And it holds the manifest to the one repository
// field npm's provenance accepts: the publish workflow runs in github.com/bitbybit-dev/bitbybit and
// the registry compares the published manifest's repository.url against it, so a URL with a
// /tree/... path or without the canonical form fails the publish after the tarball is built.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";

const dir = process.cwd();
const text = readFileSync(join(dir, "package.json"), "utf8");
const manifest = JSON.parse(text);
const offenders = [];
const repository = manifest.repository ?? {};
if (repository.type !== "git" || repository.url !== "git+https://github.com/bitbybit-dev/bitbybit.git" || repository.directory !== `packages/dev/${basename(dir)}`) {
    offenders.push(`repository must be { "type": "git", "url": "git+https://github.com/bitbybit-dev/bitbybit.git", "directory": "packages/dev/${basename(dir)}" } for provenance, found ${JSON.stringify(repository)}`);
}
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
