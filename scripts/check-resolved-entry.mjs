#!/usr/bin/env node
/**
 * Fails when a public method takes a DTO with defaults and does not lay its inputs over them first.
 *
 * Only `new Dto()` runs a DTO's initializers, and a caller - a script's object literal, a message
 * that crossed from a worker, a server request - rarely builds one; it passes a plain object that
 * leaves the defaulted properties out, or sets them to undefined. So a public method whose DTO has
 * a default starts with `const resolved = resolveDto(Inputs.X.Dto, inputs) as Resolved.X.Dto;` and
 * reads `resolved` from then on (packages/dev/CLAUDE.md). Read the raw inputs once more and the
 * default is lost again for that one property, silently: the call still works when every property
 * is spelled out, which is how the tests usually call it.
 *
 * For every public method of every class, and every exported function, under the library trees of
 * base, core, the three kernels and the three renderers whose first parameter is typed
 * `Inputs.<Namespace>.<Dto>` (or `<Namespace>.<Dto>` where the namespace is imported directly) -
 * with or without type arguments, or as the DTO of an `Omit`, a `Pick` or an intersection - where
 * that DTO, its abstract parents included, has at least one property with an initializer, this
 * holds that:
 *
 *   - the body's first statement resolves that parameter against that same DTO class:
 *     `const <name> = resolveDto(Inputs.<Namespace>.<Dto>, <parameter>)`, optionally cast to its
 *     `Resolved` mirror (or an `Omit`, `Pick` or intersection of it, never another DTO's), or
 *     `return resolveDto(...)` directly;
 *   - after that statement the raw parameter is never read again, a type position aside.
 *
 * The worker packages are not walked: their API classes are generated from the kernels and forward
 * a call unresolved, and the worker lays the inputs over the defaults on the other side of the
 * boundary (`resolveInputs`), so the contract there is held by check:worker-api and the kernel.
 *
 * A method that is handed a partial object on purpose and resolves it later, or passes its options
 * on to a helper that resolves them itself, is listed in scripts/resolved-entry.allow.json with the
 * reason. An entry that no longer matches a method, or whose method now passes, also fails, so the
 * list only shrinks.
 *
 *   node scripts/check-resolved-entry.mjs            check every method (exit 1 on any finding)
 *   node scripts/check-resolved-entry.mjs --verbose  also print every method checked
 */
import ts from "typescript";
import { readFileSync } from "node:fs";
import path from "node:path";
import { ROOT, sourceFiles } from "./lib/surface.mjs";

const verbose = process.argv.includes("--verbose");
const DEV = path.join(ROOT, "packages/dev");
const ALLOW_FILE = "scripts/resolved-entry.allow.json";

/**
 * The packages walked, each with the packages whose inputs its `Inputs` namespace re-exports, its
 * own first: a namespace declared in two of them (the renderers' `Draw`) resolves to the nearest.
 */
const PACKAGES = {
    base: ["base"],
    occt: ["occt", "base"],
    jscad: ["jscad", "base"],
    manifold: ["manifold", "base"],
    core: ["core", "occt", "jscad", "manifold", "base"],
    babylonjs: ["babylonjs", "core", "occt", "jscad", "manifold", "base"],
    threejs: ["threejs", "core", "occt", "jscad", "manifold", "base"],
    playcanvas: ["playcanvas", "core", "occt", "jscad", "manifold", "base"],
};

const inputsDir = (pkg) => path.join(DEV, pkg, "lib/api/inputs");

/**
 * `Namespace.Class` -> { defaulted, parent } for every class inside an exported namespace of a
 * package's inputs, and on the side every other name a namespace declares (its enums and types).
 */
function dtoClassesOf(pkg) {
    const classes = new Map();
    const others = new Set();
    for (const file of sourceFiles(inputsDir(pkg))) {
        const sf = ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true);
        const visit = (node, namespace) => {
            if (ts.isModuleDeclaration(node) && node.body && ts.isModuleBlock(node.body)) {
                for (const statement of node.body.statements) visit(statement, node.name.text);
                return;
            }
            if (namespace && (ts.isEnumDeclaration(node) || ts.isTypeAliasDeclaration(node) || ts.isInterfaceDeclaration(node)) && node.name) others.add(`${namespace}.${node.name.text}`);
            if (namespace && ts.isClassDeclaration(node) && node.name) {
                const heritage = (node.heritageClauses || []).find((c) => c.token === ts.SyntaxKind.ExtendsKeyword);
                const parent = heritage && heritage.types[0] ? heritage.types[0].expression.getText(sf) : undefined;
                const defaulted = node.members.filter((m) => ts.isPropertyDeclaration(m) && m.initializer && !(ts.getCombinedModifierFlags(m) & ts.ModifierFlags.Static)).map((m) => m.name.getText(sf));
                classes.set(`${namespace}.${node.name.text}`, { namespace, defaulted, parent });
            }
            if (ts.isSourceFile(node)) node.statements.forEach((s) => visit(s, namespace));
        };
        visit(sf, undefined);
    }
    return { classes, others };
}

const dtosByPackage = new Map(Object.keys(PACKAGES).map((pkg) => [pkg, dtoClassesOf(pkg)]));

/** The DTO class a package's `Inputs.<key>` names, searched along its re-export chain. */
function findDto(pkg, key) {
    for (const source of PACKAGES[pkg]) {
        const found = dtosByPackage.get(source).classes.get(key);
        if (found) return { ...found, pkg: source };
    }
    return undefined;
}

/** Whether a package's `Inputs.<key>` names an enum or a type rather than a class: a value, not a DTO. */
const isNotAClass = (pkg, key) => PACKAGES[pkg].some((source) => dtosByPackage.get(source).others.has(key));

/** The defaulted property names of a DTO, its parents' included. */
function defaultsOf(pkg, key, seen = new Set()) {
    const dto = findDto(pkg, key);
    if (!dto || seen.has(key)) return [];
    seen.add(key);
    const parentKey = dto.parent ? (dto.parent.includes(".") ? dto.parent : `${dto.namespace}.${dto.parent}`) : undefined;
    return [...dto.defaulted, ...(parentKey ? defaultsOf(dto.pkg, parentKey, seen) : [])];
}

/** `Inputs.A.B` as a dotted name, from a type name or an expression; null for anything else. */
function dotted(node) {
    if (ts.isIdentifier(node)) return node.text;
    if (ts.isQualifiedName(node)) { const left = dotted(node.left); return left === null ? null : `${left}.${node.right.text}`; }
    if (ts.isPropertyAccessExpression(node) && ts.isIdentifier(node.name)) { const left = dotted(node.expression); return left === null ? null : `${left}.${node.name.text}`; }
    return null;
}

const WRAPPERS = new Set(["Omit", "Pick"]);

/**
 * The DTO references a type holds: a reference to `Inputs.<Namespace>.<Dto>` or `<Namespace>.<Dto>`
 * (a namespace imported directly), with or without type arguments, or the DTO of an `Omit`, a `Pick`
 * or an intersection holding one. Each as { written, key, explicit }: the dotted name as written, the
 * `Namespace.Dto` it names, and whether it named the `root` (`Inputs` or `Resolved`) explicitly.
 */
function dtoRefsOf(type, root) {
    if (!type) return [];
    if (ts.isParenthesizedTypeNode(type)) return dtoRefsOf(type.type, root);
    if (ts.isIntersectionTypeNode(type)) return type.types.flatMap((t) => dtoRefsOf(t, root));
    if (!ts.isTypeReferenceNode(type)) return [];
    const written = dotted(type.typeName);
    if (!written) return [];
    if (WRAPPERS.has(written) && type.typeArguments && type.typeArguments.length) return dtoRefsOf(type.typeArguments[0], root);
    const rooted = new RegExp(`^${root}\\.(\\w+\\.\\w+)$`).exec(written);
    if (rooted) return [{ written, key: rooted[1], explicit: true }];
    if (/^\w+\.\w+$/.test(written)) return [{ written, key: written, explicit: false }];
    return [];
}

/**
 * The one DTO class a parameter's type names in a package: `{ key }`, `{ problem }` when the type
 * names `Inputs.<x>` that is no class the package reaches or names several classes, or null when it
 * names no DTO at all.
 */
function dtoOfParam(pkg, type) {
    const refs = dtoRefsOf(type, "Inputs");
    const classes = refs.filter((r) => findDto(pkg, r.key));
    const unknown = refs.filter((r) => r.explicit && !findDto(pkg, r.key) && !isNotAClass(pkg, r.key));
    if (unknown.length) return { problem: `takes ${unknown[0].written}, which is not a class in the inputs ${pkg} reaches` };
    if (classes.length > 1) return { problem: `its first parameter intersects several DTOs (${classes.map((c) => c.written).join(", ")}); say which one it resolves` };
    return classes.length ? { key: classes[0].key } : null;
}

/** An expression with its parentheses, `as` casts and non-null assertions taken off. */
function unwrap(expr) {
    let e = expr;
    while (e && (ts.isParenthesizedExpression(e) || ts.isAsExpression(e) || ts.isNonNullExpression(e) || ts.isSatisfiesExpression(e))) e = e.expression;
    return e;
}

/** Every cast on the way down to the inner expression, outermost first. */
function castsOf(expr) {
    const casts = [];
    let e = expr;
    while (e && (ts.isParenthesizedExpression(e) || ts.isAsExpression(e) || ts.isNonNullExpression(e) || ts.isSatisfiesExpression(e))) {
        if (ts.isAsExpression(e)) casts.push(e.type);
        e = e.expression;
    }
    return casts;
}

const isResolveCall = (e) => e && ts.isCallExpression(e) && ts.isIdentifier(e.expression) && e.expression.text === "resolveDto";

/**
 * What the body's first statement does with the parameter: `{ ok }` when it resolves it against the
 * parameter's own DTO, or `{ problem }` saying how it falls short.
 */
function entryOf(method, paramName, dtoKey, sf) {
    const first = method.body.statements[0];
    if (!first) return { problem: "has an empty body" };
    let init;
    if (ts.isVariableStatement(first) && first.declarationList.declarations.length === 1) init = first.declarationList.declarations[0].initializer;
    else if (ts.isReturnStatement(first)) init = first.expression;
    const call = init && unwrap(init);
    if (!isResolveCall(call)) {
        const anywhere = [];
        const find = (node) => { if (isResolveCall(node)) anywhere.push(node); ts.forEachChild(node, find); };
        find(method.body);
        const text = first.getText(sf).split("\n")[0].slice(0, 100);
        return { problem: anywhere.length ? `resolves its inputs, but not as its first statement (first: \`${text}\`)` : `never resolves its inputs (first statement: \`${text}\`)` };
    }
    const [dtoArg, inputsArg] = call.arguments;
    const resolvedAgainst = dtoArg && dotted(dtoArg);
    if (!resolvedAgainst || resolvedAgainst.replace(/^Inputs\./, "") !== dtoKey) return { problem: `takes ${dtoKey} but resolves against ${dtoArg ? dtoArg.getText(sf) : "nothing"}` };
    if (!inputsArg || !ts.isIdentifier(inputsArg) || inputsArg.text !== paramName) return { problem: `resolves ${inputsArg ? inputsArg.getText(sf) : "nothing"}, not its parameter \`${paramName}\`` };
    for (const cast of castsOf(init)) {
        const mirrors = dtoRefsOf(cast, "Resolved").filter((r) => r.explicit);
        if (!mirrors.length) {
            if (/\bResolved\./.test(cast.getText(sf))) return { problem: `casts the resolved inputs to \`${cast.getText(sf)}\`, which does not read as the Resolved mirror of ${dtoKey}` };
            continue;
        }
        const other = mirrors.find((m) => m.key !== dtoKey);
        if (other) return { problem: `resolves ${dtoKey} but casts it to ${other.written}` };
    }
    return { ok: call };
}

/** Every read of the parameter in the method after the call that resolved it. */
function rawReads(method, param, resolveCall, checker, sf) {
    const symbol = checker.getSymbolAtLocation(param.name);
    const reads = [];
    const visit = (node) => {
        if (node === resolveCall.arguments[1] || ts.isTypeNode(node)) return;
        if (ts.isIdentifier(node) && node.text === param.name.text && node !== param.name) {
            const parent = node.parent;
            const isName = (ts.isPropertyAccessExpression(parent) && parent.name === node)
                || (ts.isPropertyAssignment(parent) && parent.name === node)
                || (ts.isQualifiedName(parent) && parent.right === node);
            const target = ts.isShorthandPropertyAssignment(parent) ? checker.getShorthandAssignmentValueSymbol(parent) : isName ? undefined : checker.getSymbolAtLocation(node);
            if (symbol && target === symbol) reads.push(sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1);
        }
        ts.forEachChild(node, visit);
    };
    visit(method.body);
    return reads;
}

const allow = JSON.parse(readFileSync(path.join(ROOT, ALLOW_FILE), "utf8")).allow;

const files = Object.keys(PACKAGES).flatMap((pkg) => sourceFiles(path.join(DEV, pkg, "lib")).map((file) => ({ pkg, file })));
const program = ts.createProgram(files.map((f) => f.file), { noResolve: true, noLib: true, types: [], target: ts.ScriptTarget.Latest });
const checker = program.getTypeChecker();

const findings = [];
const allowed = [];
const passing = [];
const seenKeys = new Set();
let withoutDefaults = 0;

/** Checks one public method or exported function, recording where it stands. */
function checkCallable(pkg, sf, relFile, owner, callable) {
    const param = callable.parameters[0];
    if (!param || !callable.body) return;
    const dto = dtoOfParam(pkg, param.type);
    if (dto === null) return;
    const name = owner ? `${owner}.${callable.name.text}` : callable.name.text;
    const key = `${relFile}#${name}`;
    const where = `${relFile}:${sf.getLineAndCharacterOfPosition(callable.getStart(sf)).line + 1} ${name}`;
    if (dto.problem) { findings.push({ key, where, problem: dto.problem }); return; }
    if (defaultsOf(pkg, dto.key).length === 0) { withoutDefaults++; return; }
    seenKeys.add(key);
    const problems = [];
    if (!ts.isIdentifier(param.name)) problems.push("destructures its inputs in the parameter list, so they are read before any default applies");
    else {
        const entry = entryOf(callable, param.name.text, dto.key, sf);
        if (entry.problem) problems.push(entry.problem);
        else {
            const reads = rawReads(callable, param, entry.ok, checker, sf);
            if (reads.length) problems.push(`reads the raw \`${param.name.text}\` after resolving it (line ${[...new Set(reads)].join(", ")})`);
        }
    }
    if (!problems.length) {
        passing.push(where);
        if (allow[key]) findings.push({ key, where, problem: `now resolves its inputs on entry, so it must come out of ${ALLOW_FILE}` });
    } else if (allow[key]) {
        allowed.push(where);
    } else {
        for (const problem of problems) findings.push({ key, where, problem });
    }
}

const isHidden = (node) => ts.getCombinedModifierFlags(node) & (ts.ModifierFlags.Private | ts.ModifierFlags.Protected);
const isExported = (node) => ts.getCombinedModifierFlags(node) & ts.ModifierFlags.Export;

for (const { pkg, file } of files) {
    const sf = program.getSourceFile(file);
    const relFile = path.relative(DEV, file).split(path.sep).join("/");
    for (const statement of sf.statements) {
        if (ts.isFunctionDeclaration(statement) && statement.name && isExported(statement)) checkCallable(pkg, sf, relFile, null, statement);
    }
    const visit = (node) => {
        if (ts.isClassDeclaration(node) && node.name) {
            for (const member of node.members) {
                if (ts.isMethodDeclaration(member) && member.name && ts.isIdentifier(member.name) && !isHidden(member)) checkCallable(pkg, sf, relFile, node.name.text, member);
            }
        }
        ts.forEachChild(node, visit);
    };
    visit(sf);
}

for (const key of Object.keys(allow)) {
    if (!seenKeys.has(key)) findings.push({ key, where: key, problem: `${ALLOW_FILE} names a method that does not exist or takes no DTO with defaults` });
}

if (verbose) for (const where of passing) console.log(`  ok  ${where}`);
const summary = `${passing.length} public methods and functions resolve their DTO on entry, ${allowed.length} are allowed not to for a declared reason, ${withoutDefaults} take a DTO without defaults`;

if (findings.length) {
    for (const { where, problem } of findings) console.error(`${where}: ${problem}`);
    console.error(`\n${summary}`);
    console.error(`resolved entry FAILED - ${findings.length} problem(s). A public method whose DTO has defaults starts with \`const resolved = resolveDto(Inputs.X.Dto, inputs) as Resolved.X.Dto;\` and reads only \`resolved\` after it (packages/dev/CLAUDE.md), or ${ALLOW_FILE} says why it cannot.`);
    process.exit(1);
}
console.log(`resolved entry: ${summary}`);
