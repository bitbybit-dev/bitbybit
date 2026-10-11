#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const PACKAGES = join(ROOT, "packages", "dev");
const BUILD_CONFIG = "tsconfig.bitbybit.json";
const ROOT_CONFIG = "tsconfig.build.json";
const BUILD_INFO = "./dist/tsconfig.bitbybit.tsbuildinfo";
const STRICT_CONFIG = "tsconfig.strict.json";
const EDITOR_CONFIG = "tsconfig.json";
const check = process.argv.includes("--check");

function readJson(file) {
    try {
        return JSON.parse(readFileSync(file, "utf8"));
    } catch (error) {
        throw new Error(`${relative(ROOT, file)}: ${error.message}`, { cause: error });
    }
}

const packages = readdirSync(PACKAGES, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .filter((entry) => existsSync(join(PACKAGES, entry.name, "package.json")) && existsSync(join(PACKAGES, entry.name, BUILD_CONFIG)))
    .map((entry) => ({ dir: entry.name, manifest: readJson(join(PACKAGES, entry.name, "package.json")) }))
    .sort((a, b) => a.dir.localeCompare(b.dir));
const dirByName = new Map(packages.map((p) => [p.manifest.name, p.dir]));

const outputs = [];
let referenceCount = 0;
for (const { dir, manifest } of packages) {
    const declared = Object.keys({ ...manifest.dependencies, ...manifest.peerDependencies });
    const siblings = declared.filter((name) => dirByName.has(name)).map((name) => dirByName.get(name)).sort();
    referenceCount += siblings.length;
    const file = join(PACKAGES, dir, BUILD_CONFIG);
    const { references: _previous, ...config } = readJson(file);
    const { composite: _c, tsBuildInfoFile: _b, ...own } = config.compilerOptions ?? {};
    const next = {
        ...config,
        compilerOptions: { composite: true, tsBuildInfoFile: BUILD_INFO, ...own },
        references: siblings.map((sibling) => ({ path: `../${sibling}/${BUILD_CONFIG}` })),
    };
    outputs.push({ file, text: `${JSON.stringify(next, null, 4)}\n` });
    outputs.push({
        file: join(PACKAGES, dir, STRICT_CONFIG),
        text: `${JSON.stringify({ extends: `./${BUILD_CONFIG}`, compilerOptions: { noEmit: true }, references: next.references }, null, 4)}\n`,
    });
    const { outDir, baseUrl, paths } = next.compilerOptions;
    outputs.push({
        file: join(PACKAGES, dir, EDITOR_CONFIG),
        text: `${JSON.stringify({
            extends: next.extends,
            compileOnSave: false,
            compilerOptions: { outDir, baseUrl, paths },
        }, null, 4)}\n`,
    });
}
outputs.push({
    file: join(ROOT, ROOT_CONFIG),
    text: `${JSON.stringify({ files: [], references: packages.map((p) => ({ path: `./packages/dev/${p.dir}/${BUILD_CONFIG}` })) }, null, 4)}\n`,
});

const stale = outputs.filter((o) => !existsSync(o.file) || readFileSync(o.file, "utf8") !== o.text);
if (check) {
    if (stale.length) {
        console.error(`generated TypeScript configs are out of date in:\n  ${stale.map((o) => relative(ROOT, o.file)).join("\n  ")}\nrun \`npm run gen:references\` and commit the result`);
        process.exit(1);
    }
    console.log(`generated TypeScript configs are up to date (${packages.length} packages, ${referenceCount} references)`);
} else {
    for (const o of stale) {
        writeFileSync(o.file, o.text);
    }
    console.log(`${packages.length} packages, ${referenceCount} references, ${stale.length} file(s) written`);
}
