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
 * Beside the registries it writes each package's `Resolved` mirror of its inputs
 * (lib/api/resolved-inputs): every DTO as `resolveDto` leaves it, the properties with a default
 * present and never undefined. Code that reads a DTO after resolving it is typed against the mirror;
 * code that takes one from a caller is typed against `Inputs`, where a defaulted property may be
 * left out.
 *
 *   node scripts/gen-dto-meta.mjs           write the registries and the mirrors
 *   node scripts/gen-dto-meta.mjs --check   write nothing; fail if any of them would change
 */
import ts from "typescript";
import { existsSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ROOT, sourceFiles, parse, classesUnder } from "./lib/surface.mjs";
import { kernelSurface } from "./lib/kernel-surface.mjs";

const check = process.argv.includes("--check");

const KERNELS = [
    { name: "occt", label: "OCCT", kernelDir: "packages/dev/occt/lib", kernelRoot: "OCCTService", out: "packages/dev/occt/lib/api/dto-registry.ts", constant: "occtDtoRegistry" },
    { name: "jscad", label: "JSCAD", kernelDir: "packages/dev/jscad/lib", kernelRoot: "Jscad", out: "packages/dev/jscad/lib/api/dto-registry.ts", constant: "jscadDtoRegistry" },
    { name: "manifold", label: "Manifold", kernelDir: "packages/dev/manifold/lib", kernelRoot: "ManifoldService", out: "packages/dev/manifold/lib/api/dto-registry.ts", constant: "manifoldDtoRegistry" },
];

const BASE_INPUTS = "packages/dev/base/lib/api/inputs";

/**
 * The finite range a number property's JSDoc gives it: `@minimum` and `@maximum`, each made
 * exclusive by `@exclusiveMinimum true` or `@exclusiveMaximum true`. An infinite bound is no bound.
 */
export function boundsOf(member) {
    const docs = ts.getJSDocCommentsAndTags(member).filter(ts.isJSDoc);
    const tags = new Map((docs[docs.length - 1]?.tags ?? []).map((t) => [t.tagName.text, (ts.getTextOfJSDocComment(t.comment) ?? "").trim()]));
    const finite = (name) => (tags.has(name) && Number.isFinite(Number(tags.get(name))) ? Number(tags.get(name)) : undefined);
    const bounds = { min: finite("minimum"), max: finite("maximum") };
    if (bounds.min !== undefined && tags.get("exclusiveMinimum") === "true") bounds.exclusiveMin = true;
    if (bounds.max !== undefined && tags.get("exclusiveMaximum") === "true") bounds.exclusiveMax = true;
    const entries = Object.entries(bounds).filter(([, v]) => v !== undefined);
    return entries.length ? `{ ${entries.map(([k, v]) => `${k}: ${v}`).join(", ")} }` : undefined;
}

/**
 * `Namespace.Class` -> { props: [{ name, type }], extends } for every class inside an exported namespace
 * of the files, and on the side every name each namespace declares, for qualifying a type parameter's
 * constraint outside the namespace. A file is a path, or a source file already parsed.
 */
export function dtoClasses(files, declared = new Map(), enums = new Map()) {
    const classes = new Map();
    for (const file of files) {
        const sf = typeof file === "string" ? parse(file) : file;
        const visit = (node, namespace) => {
            if (ts.isModuleDeclaration(node) && node.body && ts.isModuleBlock(node.body)) {
                for (const statement of node.body.statements) visit(statement, node.name.text);
                return;
            }
            if (namespace && (ts.isTypeAliasDeclaration(node) || ts.isInterfaceDeclaration(node) || ts.isEnumDeclaration(node) || ts.isClassDeclaration(node)) && node.name) {
                if (!declared.has(namespace)) declared.set(namespace, new Set());
                declared.get(namespace).add(node.name.text);
            }
            if (namespace && ts.isEnumDeclaration(node)) {
                const values = node.members.map((m) => (m.initializer && ts.isStringLiteral(m.initializer) ? m.initializer.text : undefined));
                if (values.every((v) => v !== undefined)) enums.set(`${namespace}.${node.name.text}`, values);
            }
            if (namespace && ts.isClassDeclaration(node) && node.name) {
                const heritage = (node.heritageClauses || []).find((c) => c.token === ts.SyntaxKind.ExtendsKeyword);
                const parent = heritage && heritage.types[0] ? heritage.types[0].expression.getText(sf) : undefined;
                const props = node.members
                    .filter((m) => ts.isPropertyDeclaration(m) && m.name && ts.isIdentifier(m.name))
                    .map((m) => ({ name: m.name.text, type: m.type ? m.type.getText(sf) : "", defaulted: !!m.initializer, required: !!m.exclamationToken, bounds: boundsOf(m) }));
                const typeParams = (node.typeParameters || []).map((tp) => ({ name: tp.name.text, text: tp.getText(sf) }));
                const abstract = (node.modifiers || []).some((m) => m.kind === ts.SyntaxKind.AbstractKeyword);
                classes.set(`${namespace}.${node.name.text}`, { namespace, name: node.name.text, props, parent, typeParams, abstract });
            }
            if (ts.isSourceFile(node)) node.statements.forEach((s) => visit(s, namespace));
        };
        visit(sf, undefined);
    }
    return classes;
}

export const bare = (type) => type.replace(/\s+/g, "").split("|").filter((t) => t !== "undefined").join("|").replace(/<.*>$/, "");

/**
 * Every property of a DTO class, each once, in the order the API index lists them: a concrete
 * parent's first, an abstract parent's after the class's own. A property the class redeclares is
 * the class's declaration, in the place its parent gives it.
 */
export function allProps(classes, key, seen = new Set()) {
    const entry = classes.get(key);
    if (!entry || seen.has(key)) return [];
    seen.add(key);
    const parentKey = entry.parent ? (entry.parent.includes(".") ? entry.parent : `${entry.namespace}.${entry.parent}`) : undefined;
    const inherited = parentKey ? allProps(classes, parentKey, seen) : [];
    const own = new Map(entry.props.map((p) => [p.name, p]));
    if (classes.get(parentKey)?.abstract) return [...entry.props, ...inherited.filter((p) => !own.has(p.name))];
    const inheritedNames = new Set(inherited.map((p) => p.name));
    return [...inherited.map((p) => own.get(p.name) ?? p), ...entry.props.filter((p) => !inheritedNames.has(p.name))];
}

/** The properties of a DTO that hold a single DTO of their own, by the class they hold. */
export function nestedOf(classes, key) {
    const { namespace } = classes.get(key);
    const nested = [];
    for (const prop of allProps(classes, key)) {
        const type = bare(prop.type);
        const target = type.includes(".") ? type : `${namespace}.${type}`;
        if (type && !type.includes("|") && !type.endsWith("]") && classes.has(target) && target !== key) nested.push([prop.name, target]);
    }
    return nested;
}

/**
 * What a property accepts, from its declared type: the kinds `validateInputs` checks - a number,
 * a flag, text, a hex color, a point or vector of two or three numbers, a list of any of them, a
 * value of a string enum - and `opaque` for everything else, which is checked only for presence.
 */
export function constraintOf(type, namespace, enums) {
    const t = type.replace(/\s+/g, " ").trim().replace(/ \| undefined$/, "");
    if (t === "number" || t === "boolean" || t === "string") return `k.${t}`;
    if (/^(Base\.)?Color$/.test(t)) return "k.color";
    const tuple = /^(?:Base\.)?(Point|Vector)([23])$/.exec(t);
    if (tuple) return `k.${tuple[1].toLowerCase()}${tuple[2]}`;
    if (/^"[^"]*"( \| "[^"]*")+$/.test(t)) return `k.oneOf([${[...t.matchAll(/"([^"]*)"/g)].map((m) => JSON.stringify(m[1])).join(", ")}])`;
    if (/^(Base\.)?Point2 \| (Base\.)?Point3$|^(Base\.)?Point3 \| (Base\.)?Point2$/.test(t)) return "k.point";
    const grouped = /^\((.+)\)\[\]$/.exec(t);
    if (grouped) return `k.list(${constraintOf(grouped[1], namespace, enums)})`;
    if (t.endsWith("[]") && !t.includes("|") && !t.includes("(")) return `k.list(${constraintOf(t.slice(0, -2), namespace, enums)})`;
    const values = enums.get(t.includes(".") ? t : `${namespace}.${t}`);
    if (values) return `k.oneOf([${values.map((v) => JSON.stringify(v)).join(", ")}])`;
    return "k.opaque";
}

/** The constraint table of one DTO, as the source of a `DtoConstraints` object. */
export function constraintsOf(classes, key, enums) {
    const { namespace } = classes.get(key);
    const seen = new Set();
    const entries = [];
    for (const prop of allProps(classes, key)) {
        if (seen.has(prop.name)) continue;
        seen.add(prop.name);
        let constraint = constraintOf(prop.type, namespace, enums);
        if (prop.bounds && constraint === "k.number") constraint = `k.between(k.number, ${prop.bounds})`;
        if (prop.bounds && constraint === "k.list(k.number)") constraint = `k.list(k.between(k.number, ${prop.bounds}))`;
        entries.push(`${prop.name}: ${prop.required ? `k.required(${constraint})` : constraint}`);
    }
    return `{ ${entries.join(", ")} }`;
}

function generate(kernel) {
    const kernelFiles = sourceFiles(path.join(ROOT, kernel.kernelDir, "api/inputs"));
    const enums = new Map();
    const classes = dtoClasses([...kernelFiles, ...sourceFiles(path.join(ROOT, BASE_INPUTS))], new Map(), enums);
    return registryText(kernel, classes, enums, kernelSurface(classesUnder(path.join(ROOT, kernel.kernelDir)), kernel.kernelRoot));
}

/** The registry source of one kernel, from its DTO classes, its string enums and its surface. */
export function registryText(kernel, classes, enums, surface) {
    const constraintNames = new Map();
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
            const constant = `${match[1]}_${match[2]}`;
            constraintNames.set(constant, key);
            rows.push([method.path, `{ dto: Inputs.${key}${nestedText}, constraints: ${constant} }`]);
        }
    }
    rows.sort((a, b) => a[0].localeCompare(b[0]));
    return [
        `// GENERATED by scripts/gen-dto-meta.mjs from the ${kernel.kernelRoot} surface - do not edit.`,
        "// Regenerate with `npm run gen:dto-meta` at the repository root.",
        "import { constraintKinds as k, DtoConstraints, DtoRegistry } from \"@bitbybit-dev/base\";",
        "import * as Inputs from \"./inputs\";",
        "",
        ...[...constraintNames].sort((a, b) => a[0].localeCompare(b[0])).map(([constant, key]) => `const ${constant}: DtoConstraints = ${constraintsOf(classes, key, enums)};`),
        "",
        "/**",
        ` * Every public operation of the ${kernel.label} kernel by its dotted path, the inputs DTO it`,
        " * takes, and what each property of that DTO accepts. `resolveInputs` from the base package reads",
        " * it to lay a caller's properties over that DTO's defaults before the kernel runs, and",
        " * `validateInputs` to check what the call was given.",
        " */",
        `export const ${kernel.constant}: DtoRegistry = {`,
        ...rows.map(([p, entry]) => `    "${p}": ${entry},`),
        "};",
        "",
    ].join("\n");
}

/**
 * The packages whose inputs DTOs get a `Resolved` mirror: each DTO as a caller's inputs look once
 * its defaults are laid over them, every defaulted property present. A package's `Inputs` also
 * re-exports namespaces of the packages below it, and its mirror re-exports their mirrors the same
 * way: the re-exports are read from the package's `inputs/index.ts`, so the two cannot drift. The
 * order is the dependency order, a mirror's re-exports naming only namespaces a lower mirror has.
 */
const RESOLVED = [
    { name: "base", inputsDir: BASE_INPUTS, withDefaults: "../kernel-calls" },
    { name: "occt", inputsDir: "packages/dev/occt/lib/api/inputs" },
    { name: "jscad", inputsDir: "packages/dev/jscad/lib/api/inputs" },
    { name: "manifold", inputsDir: "packages/dev/manifold/lib/api/inputs" },
    { name: "core", inputsDir: "packages/dev/core/lib/api/inputs" },
    { name: "babylonjs", inputsDir: "packages/dev/babylonjs/lib/api/inputs" },
    { name: "threejs", inputsDir: "packages/dev/threejs/lib/api/inputs" },
    { name: "playcanvas", inputsDir: "packages/dev/playcanvas/lib/api/inputs" },
].map((target) => ({ withDefaults: "@bitbybit-dev/base", ...target, out: target.inputsDir.replace(/inputs$/, "resolved-inputs/index.ts") }));

/** The namespaces each package's mirror exports, filled in as the mirrors are generated in order. */
const mirrorNamespaces = new Map();

/**
 * What a package's inputs index re-exports from other packages, as lines of its mirror, given the
 * namespaces the mirrors generated before it export.
 */
export function mirrorReexports(target, sf = parse(path.join(ROOT, target.inputsDir, "index.ts")), namespaces = mirrorNamespaces) {
    const lines = [];
    for (const statement of sf.statements) {
        if (!ts.isExportDeclaration(statement) || !statement.moduleSpecifier) continue;
        const specifier = statement.moduleSpecifier.text;
        const match = /^(@bitbybit-dev\/[\w-]+)\/lib\/api\/inputs$/.exec(specifier);
        if (!match) continue;
        const available = namespaces.get(match[1]);
        if (!available) throw new Error(`${target.name}: its inputs re-export ${specifier}, which has no mirror generated before it`);
        const from = `${match[1]}/lib/api/resolved-inputs`;
        if (!statement.exportClause) {
            lines.push(`export * from "${from}";`);
            available.forEach((n) => target.namespaces.add(n));
            continue;
        }
        const names = statement.exportClause.elements.map((e) => e.name.text).filter((n) => available.has(n));
        if (names.length) {
            lines.push(`export type { ${names.join(", ")} } from "${from}";`);
            names.forEach((n) => target.namespaces.add(n));
        }
    }
    return lines;
}

/**
 * The `Resolved` mirror of one package's inputs. The inputs files, the parsed inputs index and the
 * namespaces of the mirrors before it default to the package's own and to this run's.
 */
export function generateResolved(target, { files = sourceFiles(path.join(ROOT, target.inputsDir)), index, namespaces = mirrorNamespaces } = {}) {
    const declared = new Map();
    const classes = dtoClasses(files, declared);
    const qualify = (text, namespace) => text.replace(/(^|[^.\w])([A-Za-z_]\w*)\b/g, (whole, lead, name) => (declared.get(namespace)?.has(name) ? `${lead}Inputs.${namespace}.${name}` : whole));
    const byNamespace = new Map();
    for (const [key, entry] of classes) {
        const defaulted = [...new Set(allProps(classes, key).filter((p) => p.defaulted).map((p) => p.name))];
        const params = entry.typeParams.length ? `<${entry.typeParams.map((t) => qualify(t.text, entry.namespace)).join(", ")}>` : "";
        const args = entry.typeParams.length ? `<${entry.typeParams.map((t) => t.name).join(", ")}>` : "";
        const source = `Inputs.${entry.namespace}.${entry.name}${args}`;
        const alias = defaulted.length ? `WithDefaults<${source}, ${defaulted.map((d) => `"${d}"`).join(" | ")}>` : source;
        if (!byNamespace.has(entry.namespace)) byNamespace.set(entry.namespace, []);
        byNamespace.get(entry.namespace).push([entry.name, `    export type ${entry.name}${params} = ${alias};`]);
    }
    target.namespaces = new Set(byNamespace.keys());
    const lines = [
        "// GENERATED by scripts/gen-dto-meta.mjs from the inputs DTOs - do not edit.",
        "// Regenerate with `npm run gen:dto-meta` at the repository root.",
        "/* eslint-disable @typescript-eslint/no-namespace */",
        `import { WithDefaults } from "${target.withDefaults}";`,
        "import * as Inputs from \"../inputs\";",
        ...mirrorReexports(target, index, namespaces),
    ];
    for (const namespace of [...byNamespace.keys()].sort()) {
        lines.push(
            "",
            "/**",
            ` * The ${namespace} inputs DTOs as their defaults leave them: every property with a default is present,`,
            " * the way `resolveDto` hands a DTO to the code that reads it.",
            " */",
            `export namespace ${namespace} {`,
            ...byNamespace.get(namespace).sort((a, b) => a[0].localeCompare(b[0])).map(([, line]) => line),
            "}",
        );
    }
    namespaces.set(`@bitbybit-dev/${target.name}`, target.namespaces);
    return lines.join("\n") + "\n";
}

if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
    const outputs = [
        ...KERNELS.map((kernel) => ({ out: kernel.out, text: generate(kernel), what: `the ${kernel.kernelRoot} surface`, count: (t) => `${t.split("\n").filter((l) => /^ {4}"/.test(l)).length} operations` })),
        ...RESOLVED.map((target) => ({ out: target.out, text: generateResolved(target), what: `the ${target.name} inputs`, count: (t) => `${t.split("\n").filter((l) => /^ {4}export type /.test(l)).length} DTOs` })),
    ];

    let changed = 0;
    for (const { out, text, what, count } of outputs) {
        const kernel = { out, kernelRoot: what };
        const abs = path.join(ROOT, kernel.out);
        const current = existsSync(abs) ? readFileSync(abs, "utf8") : null;
        if (current === text) {
            console.log(`${kernel.out} is what ${kernel.kernelRoot} generate (${count(text)})`);
            continue;
        }
        changed++;
        if (check) console.log(`  would change: ${kernel.out}${current === null ? " (new)" : ""}`);
        else {
            mkdirSync(path.dirname(abs), { recursive: true });
            writeFileSync(abs, text);
            console.log(`${kernel.out} written (${count(text)})`);
        }
    }
    if (check && changed) {
        console.error(`\nDTO meta check FAILED - ${changed} generated file(s) differ from what the kernel surfaces and inputs generate; run \`npm run gen:dto-meta\` and commit the result`);
        process.exit(1);
    }
}
