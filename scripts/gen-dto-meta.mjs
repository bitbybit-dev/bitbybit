#!/usr/bin/env node
/**
 * Generate each kernel's operation registry from its surface.
 *
 * A kernel method takes one inputs DTO, and a caller - an object literal from a script, a message
 * that crossed to a worker, a request to a server - rarely spells out every property of it. The
 * registry lists every public operation of a kernel by the dotted path a caller names it with, and
 * the DTO class it takes, so that one call before the kernel runs (`resolveInputs` in the base
 * package) lays the caller's properties over the DTO's defaults. A property of that DTO holding
 * another DTO is listed as nested, and gets that DTO's defaults the same way.
 *
 * The surface is walked from the kernel's root class exactly as a dotted path resolves at run
 * time (scripts/lib/kernel-surface.mjs, shared with the worker generator). A parameter typed
 * `Inputs.<Namespace>.<Class>`, with or without type arguments, names its DTO; a method with no
 * parameter is listed with none.
 *
 *   node scripts/gen-dto-meta.mjs           write the registries
 *   node scripts/gen-dto-meta.mjs --check   write nothing; fail if a registry would change
 */
import ts from "typescript";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { ROOT, sourceFiles, parse, classesUnder } from "./lib/surface.mjs";
import { kernelSurface } from "./lib/kernel-surface.mjs";

const check = process.argv.includes("--check");

const KERNELS = [
    { name: "occt", label: "OCCT", kernelDir: "packages/dev/occt/lib", kernelRoot: "OCCTService", out: "packages/dev/occt/lib/api/dto-registry.ts", constant: "occtDtoRegistry" },
    { name: "jscad", label: "JSCAD", kernelDir: "packages/dev/jscad/lib", kernelRoot: "Jscad", out: "packages/dev/jscad/lib/api/dto-registry.ts", constant: "jscadDtoRegistry" },
    { name: "manifold", label: "Manifold", kernelDir: "packages/dev/manifold/lib", kernelRoot: "ManifoldService", out: "packages/dev/manifold/lib/api/dto-registry.ts", constant: "manifoldDtoRegistry" },
];

const BASE_INPUTS = "packages/dev/base/lib/api/inputs";

/** `Namespace.Class` -> { props: [{ name, type }], extends } for every class inside an exported namespace of the files. */
function dtoClasses(files) {
    const classes = new Map();
    for (const file of files) {
        const sf = parse(file);
        const visit = (node, namespace) => {
            if (ts.isModuleDeclaration(node) && node.body && ts.isModuleBlock(node.body)) {
                for (const statement of node.body.statements) visit(statement, node.name.text);
                return;
            }
            if (namespace && ts.isClassDeclaration(node) && node.name) {
                const heritage = (node.heritageClauses || []).find((c) => c.token === ts.SyntaxKind.ExtendsKeyword);
                const parent = heritage && heritage.types[0] ? heritage.types[0].expression.getText(sf) : undefined;
                const props = node.members
                    .filter((m) => ts.isPropertyDeclaration(m) && m.name && ts.isIdentifier(m.name))
                    .map((m) => ({ name: m.name.text, type: m.type ? m.type.getText(sf) : "" }));
                classes.set(`${namespace}.${node.name.text}`, { namespace, props, parent });
            }
            if (ts.isSourceFile(node)) node.statements.forEach((s) => visit(s, namespace));
        };
        visit(sf, undefined);
    }
    return classes;
}

const bare = (type) => type.replace(/\s+/g, "").split("|").filter((t) => t !== "undefined").join("|").replace(/<.*>$/, "");

/** Every property of a DTO class, its ancestors' first. */
function allProps(classes, key, seen = new Set()) {
    const entry = classes.get(key);
    if (!entry || seen.has(key)) return [];
    seen.add(key);
    const parentKey = entry.parent ? (entry.parent.includes(".") ? entry.parent : `${entry.namespace}.${entry.parent}`) : undefined;
    return [...(parentKey ? allProps(classes, parentKey, seen) : []), ...entry.props];
}

/** The properties of a DTO that hold a single DTO of their own, by the class they hold. */
function nestedOf(classes, key) {
    const { namespace } = classes.get(key);
    const nested = [];
    for (const prop of allProps(classes, key)) {
        const type = bare(prop.type);
        const target = type.includes(".") ? type : `${namespace}.${type}`;
        if (type && !type.includes("|") && !type.endsWith("]") && classes.has(target) && target !== key) nested.push([prop.name, target]);
    }
    return nested;
}

function generate(kernel) {
    const kernelFiles = sourceFiles(path.join(ROOT, kernel.kernelDir, "api/inputs"));
    const classes = dtoClasses([...kernelFiles, ...sourceFiles(path.join(ROOT, BASE_INPUTS))]);
    const surface = kernelSurface(classesUnder(path.join(ROOT, kernel.kernelDir)), kernel.kernelRoot);
    const rows = [];
    for (const cls of surface.values()) {
        for (const method of cls.methods) {
            if (method.params.length === 0) {
                rows.push([method.path, "{}"]);
                continue;
            }
            const match = /^Inputs\.(\w+)\.(\w+)(<.*>)?$/.exec(method.params[0].type.replace(/\s+/g, ""));
            if (!match) throw new Error(`${kernel.name}: ${method.path} takes ${method.params[0].type}, not an inputs DTO`);
            const key = `${match[1]}.${match[2]}`;
            if (!classes.has(key)) throw new Error(`${kernel.name}: ${method.path} takes Inputs.${key}, which is not a class in the inputs namespaces`);
            const nested = nestedOf(classes, key);
            const nestedText = nested.length ? `, nested: { ${nested.map(([name, target]) => `${name}: Inputs.${target}`).join(", ")} }` : "";
            rows.push([method.path, `{ dto: Inputs.${key}${nestedText} }`]);
        }
    }
    rows.sort((a, b) => a[0].localeCompare(b[0]));
    return [
        `// GENERATED by scripts/gen-dto-meta.mjs from the ${kernel.kernelRoot} surface - do not edit.`,
        "// Regenerate with `npm run gen:dto-meta` at the repository root.",
        "import { DtoRegistry } from \"@bitbybit-dev/base\";",
        "import * as Inputs from \"./inputs\";",
        "",
        "/**",
        ` * Every public operation of the ${kernel.label} kernel by its dotted path, and the inputs DTO it`,
        " * takes. `resolveInputs` from the base package reads it to lay a caller's properties over that",
        " * DTO's defaults before the kernel runs.",
        " */",
        `export const ${kernel.constant}: DtoRegistry = {`,
        ...rows.map(([p, entry]) => `    "${p}": ${entry},`),
        "};",
        "",
    ].join("\n");
}

let changed = 0;
for (const kernel of KERNELS) {
    const text = generate(kernel);
    const abs = path.join(ROOT, kernel.out);
    const current = existsSync(abs) ? readFileSync(abs, "utf8") : null;
    const count = text.split("\n").filter((l) => /^ {4}"/.test(l)).length;
    if (current === text) {
        console.log(`${kernel.out} is what the ${kernel.kernelRoot} surface generates (${count} operations)`);
        continue;
    }
    changed++;
    if (check) console.log(`  would change: ${kernel.out}${current === null ? " (new)" : ""}`);
    else {
        writeFileSync(abs, text);
        console.log(`${kernel.out} written (${count} operations)`);
    }
}
if (check && changed) {
    console.error(`\nDTO registry check FAILED - ${changed} registry(ies) differ from what the kernel surfaces generate; run \`npm run gen:dto-meta\` and commit the result`);
    process.exit(1);
}
