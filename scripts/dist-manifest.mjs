#!/usr/bin/env node
// Derives the manifest npm publishes from the package's own and writes it into dist/ - the
// directory npm publishes - refusing one that could only resolve inside this workspace. The
// published manifest is not a copy: it drops
//
//   - `exports`. Every source manifest carries the same map, with the `@bitbybit-dev/source`
//     condition first in each entry: a consumer that declares the condition resolves the TypeScript
//     sources (each package's jest does, through `customExportConditions`, so a test sees a sibling's
//     edit without a rebuild), and one that does not resolves dist/. A published package keeps
//     resolving through `main` and `types`, as every version so far has. An exports map in the
//     tarball would also make TypeScript and esbuild resolve each subpath as the exact file it names,
//     refusing the extensionless deep imports the examples and users' projects make
//     (`@bitbybit-dev/occt/bitbybit-dev-occt/bitbybit-dev-occt`, `<package>/lib/api/inputs`), and
//     scripts/check-tarballs.mjs imports the packed packages exactly that way. The condition name
//     never leaves this repository.
//   - `devDependencies`, `jest` and `scripts`: they describe building and testing this tree, not
//     using the package.
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
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const SOURCE_CONDITION = "@bitbybit-dev/source";
export const DROPPED_FIELDS = ["exports", "devDependencies", "jest", "scripts"];
export const JEST_CONDITIONS = [SOURCE_CONDITION, "node", "node-addons"];
export const expectedExports = () => ({
    ".": { [SOURCE_CONDITION]: "./index.ts", types: "./dist/index.d.ts", default: "./dist/index.js" },
    "./*": { [SOURCE_CONDITION]: "./*", types: "./dist/*", default: "./dist/*" },
});

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
    const expected = JSON.stringify(expectedExports());
    if (JSON.stringify(manifest.exports) !== expected) problems.push(`exports must be exactly ${expected}, with ${SOURCE_CONDITION} first in every entry`);
    if (!existsSync(join(dir, "index.ts"))) problems.push("index.ts must exist at the package root - the exports map names it as the source entry");
    if (manifest.jest && JSON.stringify(manifest.jest.testEnvironmentOptions?.customExportConditions) !== JSON.stringify(JEST_CONDITIONS)) {
        problems.push(`jest.testEnvironmentOptions.customExportConditions must be ${JSON.stringify(JEST_CONDITIONS)} so the tests resolve sibling sources through the exports map`);
    }
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
