#!/usr/bin/env node
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export const TEMPLATE_SOURCES = [
    {
        example: "examples/vite/threejs/ifc-house",
        template: "packages/dev/create-app/templates/apps/ifc-house",
        paths: ["index.html", "public", "src"],
    },
];

const IGNORED = new Set(["node_modules", "dist", ".DS_Store"]);

function filesUnder(root, relative) {
    const full = path.join(root, relative);
    if (!existsSync(full)) {
        return [];
    }
    if (statSync(full).isFile()) {
        return [relative];
    }
    return readdirSync(full)
        .filter((name) => !IGNORED.has(name))
        .sort()
        .flatMap((name) => filesUnder(root, path.join(relative, name)));
}

export function differences(root, source) {
    const exampleDir = path.join(root, source.example);
    const templateDir = path.join(root, source.template);
    const fromExample = new Set(source.paths.flatMap((relative) => filesUnder(exampleDir, relative)));
    const inTemplate = new Set(source.paths.flatMap((relative) => filesUnder(templateDir, relative)));
    const missing = [...fromExample].filter((file) => !inTemplate.has(file));
    const extra = [...inTemplate].filter((file) => !fromExample.has(file));
    const changed = [...fromExample].filter((file) => inTemplate.has(file) && !readFileSync(path.join(exampleDir, file)).equals(readFileSync(path.join(templateDir, file))));
    return { missing, extra, changed };
}

export function sync(root, source) {
    const exampleDir = path.join(root, source.example);
    const templateDir = path.join(root, source.template);
    const { missing, extra, changed } = differences(root, source);
    for (const file of [...missing, ...changed]) {
        mkdirSync(path.dirname(path.join(templateDir, file)), { recursive: true });
        copyFileSync(path.join(exampleDir, file), path.join(templateDir, file));
    }
    for (const file of extra) {
        rmSync(path.join(templateDir, file));
    }
    return missing.length + changed.length + extra.length;
}

function main() {
    const check = process.argv.includes("--check");
    const stale = [];
    for (const source of TEMPLATE_SOURCES) {
        if (!existsSync(path.join(ROOT, source.example))) {
            throw new Error(`${source.example} does not exist; scripts/sync-templates.mjs copies a template from it`);
        }
        const { missing, extra, changed } = differences(ROOT, source);
        const lines = [
            ...missing.map((file) => `${source.template}/${file} is missing`),
            ...changed.map((file) => `${source.template}/${file} differs from ${source.example}/${file}`),
            ...extra.map((file) => `${source.template}/${file} is not in ${source.example}`),
        ];
        if (!lines.length) {
            continue;
        }
        stale.push(...lines);
        if (!check) {
            console.log(`${source.template}: ${sync(ROOT, source)} file(s) copied or removed from ${source.example}`);
        }
    }
    if (check && stale.length) {
        console.error(`the templates copied from examples are out of date:\n  ${stale.join("\n  ")}\nedit the example, never the template's copy, and run \`npm run sync:templates\``);
        process.exit(1);
    }
    console.log(check ? `the templates copied from examples are up to date (${TEMPLATE_SOURCES.length})` : `${stale.length ? "templates synced" : "nothing to sync"} (${TEMPLATE_SOURCES.length})`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    main();
}
