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
 * What is walked: every public method of every class - declared as a method, or as a property
 * holding an arrow function or a function expression - and every exported function - declared, or an
 * exported `const` holding one, at the top level or inside a namespace - under the library trees of
 * base, core, the three kernels and the three renderers, and in the hand-written files of the three
 * worker packages (HAND_DIRS and HAND_FILES in scripts/lib/surface.mjs).
 *
 * Every parameter is read for the DTO it takes: a type `Inputs.<Namespace>.<Dto>`, or
 * `<Namespace>.<Dto>` where the namespace is imported directly, under whatever local name the file
 * imports either by - with or without type arguments, with `| undefined` or `| null`, as the DTO of
 * an `Omit`, `Pick`, `Partial`, `Readonly`, `Required`, `NonNullable` or an intersection, or through a
 * type alias, whether the library file or the inputs declare it. Where that DTO, its abstract parents
 * included, has at least one property with an initializer, this holds that:
 *
 *   - the body opens with one statement per such parameter that resolves it against that same DTO
 *     class: `const <name> = resolveDto(Inputs.<Namespace>.<Dto>, <parameter>)`, optionally cast to its
 *     `Resolved` mirror (or an `Omit`, `Pick` or intersection of it, never another DTO's), or
 *     `return resolveDto(...)` directly;
 *   - after that the raw parameter is never read again, a type position aside, and no parameter is
 *     read through `arguments`.
 *
 * It fails closed. A parameter whose type names a DTO with defaults in any other form - a list of
 * them, a union of several, one inside a generic, a tuple or an object type, a name it cannot place
 * - is a finding, since this check cannot tell whether the defaults reach it; so is a parameter the
 * type checker cannot follow, whose reads cannot be counted.
 *
 * The generated API classes of the worker packages are not walked: they forward a call unresolved,
 * and the worker lays the inputs over the defaults on the other side of the boundary
 * (`resolveInputs`), so check:worker-api and the kernel hold them. Their hand-written members are
 * walked: they run on the calling thread and read the caller's object there - a file name, a
 * download flag - where nothing has resolved it. Their `Inputs` is the kernel package's.
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
import { existsSync, readFileSync, realpathSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ROOT, HAND_DIRS, HAND_FILES, INPUTS_CHAINS, sourceFiles } from "./lib/surface.mjs";

const DEV = path.join(ROOT, "packages/dev");
export const ALLOW_FILE = "scripts/resolved-entry.allow.json";

/** The library packages walked, each with the inputs chain its `Inputs` reaches (scripts/lib/surface.mjs). */
export const PACKAGES = INPUTS_CHAINS;

/** The worker packages, walked in their hand-written files only, each reading the `Inputs` of its kernel. */
export const WORKERS = {
    "occt-worker": PACKAGES.occt,
    "jscad-worker": PACKAGES.jscad,
    "manifold-worker": PACKAGES.manifold,
};

const parseFile = (file) => ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true);

/**
 * `Namespace.Class` -> { namespace, defaulted, parent } for every class inside a namespace of the
 * inputs files; `Namespace.Alias` -> { namespace, type, sf } for every type alias there, which a
 * parameter type is followed through; and every other name a namespace declares (its enums, aliases
 * and interfaces). A file is a path or a source file already parsed.
 */
export function dtoClassesOf(files) {
    const classes = new Map();
    const aliases = new Map();
    const others = new Set();
    for (const file of files) {
        const sf = typeof file === "string" ? parseFile(file) : file;
        const visit = (node, namespace) => {
            if (ts.isModuleDeclaration(node) && node.body && ts.isModuleBlock(node.body)) {
                for (const statement of node.body.statements) visit(statement, node.name.text);
                return;
            }
            if (namespace && (ts.isEnumDeclaration(node) || ts.isTypeAliasDeclaration(node) || ts.isInterfaceDeclaration(node)) && node.name) others.add(`${namespace}.${node.name.text}`);
            if (namespace && ts.isTypeAliasDeclaration(node)) aliases.set(`${namespace}.${node.name.text}`, { namespace, type: node.type, sf });
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
    return { classes, aliases, others };
}

/**
 * The DTO lookups of a set of packages: `chains` names, per walked package, the packages whose
 * inputs its `Inputs` reaches, nearest first; `bySource` holds each of those packages' dtoClassesOf.
 */
export function inputsModel(chains, bySource) {
    const table = (source) => bySource.get(source) ?? { classes: new Map(), aliases: new Map(), others: new Set() };
    const nearest = (pkg, pick) => {
        for (const source of chains[pkg] ?? []) {
            const found = pick(table(source));
            if (found) return { ...found, pkg: source };
        }
        return undefined;
    };
    const findDto = (pkg, key) => nearest(pkg, (t) => t.classes.get(key));
    const findAlias = (pkg, key) => (findDto(pkg, key) ? undefined : nearest(pkg, (t) => t.aliases.get(key)));
    const isNotAClass = (pkg, key) => (chains[pkg] ?? []).some((source) => table(source).others.has(key));
    const classNamed = (pkg, name) => {
        for (const source of chains[pkg] ?? []) {
            for (const key of table(source).classes.keys()) if (key.split(".").pop() === name) return key;
        }
        return undefined;
    };
    const defaultsOf = (pkg, key, seen = new Set()) => {
        const dto = findDto(pkg, key);
        if (!dto || seen.has(key)) return [];
        seen.add(key);
        const parentKey = dto.parent ? (dto.parent.includes(".") ? dto.parent : `${dto.namespace}.${dto.parent}`) : undefined;
        return [...dto.defaulted, ...(parentKey ? defaultsOf(dto.pkg, parentKey, seen) : [])];
    };
    return { findDto, findAlias, isNotAClass, classNamed, defaultsOf };
}

/** `Inputs.A.B` as a dotted name, from a type name or an expression; null for anything else. */
export function dotted(node) {
    if (ts.isIdentifier(node)) return node.text;
    if (ts.isQualifiedName(node)) { const left = dotted(node.left); return left === null ? null : `${left}.${node.right.text}`; }
    if (ts.isPropertyAccessExpression(node) && ts.isIdentifier(node.name)) { const left = dotted(node.expression); return left === null ? null : `${left}.${node.name.text}`; }
    return null;
}

/**
 * The local names a file gives the inputs roots and namespaces, each -> the dotted name it stands
 * for: `import { Inputs as I }`, `import { Base as B }`, `import * as I from "./inputs"` (or from a
 * `resolved-inputs` module, for `Resolved`), and `import D = Inputs.OCCT.BoxDto`.
 */
export function importAliasesOf(sf) {
    const aliases = new Map();
    for (const statement of sf.statements) {
        if (ts.isImportDeclaration(statement) && statement.importClause && statement.importClause.namedBindings) {
            const bindings = statement.importClause.namedBindings;
            const specifier = ts.isStringLiteral(statement.moduleSpecifier) ? statement.moduleSpecifier.text : "";
            if (ts.isNamespaceImport(bindings)) {
                const root = /(^|\/)resolved-inputs(\/|$)/.test(specifier) ? "Resolved" : /(^|\/)inputs(\/|$)|-inputs$/.test(specifier) ? "Inputs" : undefined;
                if (root && bindings.name.text !== root) aliases.set(bindings.name.text, root);
            } else {
                for (const element of bindings.elements) if (element.propertyName && element.propertyName.text !== element.name.text) aliases.set(element.name.text, element.propertyName.text);
            }
        }
        if (ts.isImportEqualsDeclaration(statement) && !ts.isExternalModuleReference(statement.moduleReference)) {
            const target = dotted(statement.moduleReference);
            if (target) aliases.set(statement.name.text, target);
        }
    }
    return aliases;
}

/** A dotted name with its first segment replaced by what the file's import aliases say it stands for. */
export function canonicalName(written, aliases) {
    let name = written;
    for (let i = 0; i < 5; i++) {
        const [head, ...rest] = name.split(".");
        const target = aliases.get(head);
        if (!target || target === head) return name;
        name = [target, ...rest].join(".");
    }
    return name;
}

const WRAPPERS = new Set(["Omit", "Pick", "Partial", "Readonly", "Required", "NonNullable"]);
const LISTS = new Set(["Array", "ReadonlyArray"]);
const NOT_INPUTS = new Set(["Resolved", "Models"]);

const isNullish = (t) => t.kind === ts.SyntaxKind.UndefinedKeyword || t.kind === ts.SyntaxKind.VoidKeyword || t.kind === ts.SyntaxKind.NullKeyword || (ts.isLiteralTypeNode(t) && t.literal.kind === ts.SyntaxKind.NullKeyword);

/**
 * Reads a parameter's type for the DTOs it takes. Returns `refs`, the DTO classes named in a form
 * this check follows, each { written, key, explicit, list }; `unread`, the DTO classes named in any
 * other form, each { written, key }; and `unknown`, the `Inputs.<x>` names that are no class, alias,
 * enum or interface the package reaches.
 *
 * `ctx` is { pkg, model, checker, aliasesOf }: the walked package, its inputsModel, the program's type
 * checker, and the import aliases of a source file.
 */
export function readParamType(type, ctx) {
    const out = { refs: [], unread: [], unknown: [] };
    const sf = type ? type.getSourceFile() : undefined;
    read(type, { aliases: sf ? ctx.aliasesOf(sf) : new Map(), namespace: undefined, list: false, seen: new Set() }, ctx, out, true);
    return out;
}

/** The DTO key a written type name points at, and whether it is in a form this check follows. */
function placeName(name, env, ctx, ref) {
    const segments = name.split(".");
    if (NOT_INPUTS.has(segments[0])) return { skip: true };
    if (segments[0] === "Inputs" && segments.length === 3) return { key: `${segments[1]}.${segments[2]}`, explicit: true, followed: true };
    if (segments.length === 2) return { key: name, explicit: false, followed: true };
    if (segments.length === 1 && env.namespace) {
        const inNamespace = `${env.namespace}.${name}`;
        if (ctx.model.findDto(ctx.pkg, inNamespace) || ctx.model.findAlias(ctx.pkg, inNamespace) || ctx.model.isNotAClass(ctx.pkg, inNamespace)) return { key: inNamespace, explicit: false, followed: true };
    }
    if (segments.length === 1) {
        if (ref && ctx.checker) {
            const symbol = ctx.checker.getSymbolAtLocation(ref.typeName);
            const own = ts.SymbolFlags.Class | ts.SymbolFlags.Interface | ts.SymbolFlags.Enum | ts.SymbolFlags.TypeParameter | ts.SymbolFlags.TypeAlias;
            if (symbol && symbol.declarations?.length && symbol.flags & own) return { skip: true };
        }
        const key = ctx.model.classNamed(ctx.pkg, name);
        return key ? { key, explicit: false, followed: false } : { skip: true };
    }
    return { key: segments.slice(-2).join("."), explicit: false, followed: false };
}

/** The declaration of a type alias a type reference names, when it is declared in a file of the program. */
function localAlias(ref, ctx) {
    if (!ctx.checker) return undefined;
    let symbol = ctx.checker.getSymbolAtLocation(ref.typeName);
    if (symbol && symbol.flags & ts.SymbolFlags.Alias) symbol = ctx.checker.getAliasedSymbol(symbol);
    const declaration = symbol && symbol.flags & ts.SymbolFlags.TypeAlias ? symbol.declarations?.find(ts.isTypeAliasDeclaration) : undefined;
    return declaration;
}

function read(type, env, ctx, out, followed) {
    if (!type) return;
    if (!followed) { scan(type, env, ctx, out); return; }
    if (ts.isParenthesizedTypeNode(type)) return read(type.type, env, ctx, out, true);
    if (ts.isIntersectionTypeNode(type)) { type.types.forEach((t) => read(t, env, ctx, out, true)); return; }
    if (ts.isUnionTypeNode(type)) {
        const kept = type.types.filter((t) => !isNullish(t));
        if (kept.length === 1) read(kept[0], env, ctx, out, true);
        else kept.forEach((t) => scan(t, env, ctx, out));
        return;
    }
    if (ts.isArrayTypeNode(type)) return read(type.elementType, { ...env, list: true }, ctx, out, true);
    if (ts.isTypeOperatorNode(type)) {
        if (type.operator === ts.SyntaxKind.ReadonlyKeyword) read(type.type, env, ctx, out, true);
        return;
    }
    if (ts.isTypeQueryNode(type) || ts.isIndexedAccessTypeNode(type) || ts.isLiteralTypeNode(type) || ts.isTypePredicateNode(type)) return;
    if (!ts.isTypeReferenceNode(type)) { scan(type, env, ctx, out); return; }
    readReference(type, env, ctx, out, true);
}

function readReference(ref, env, ctx, out, followed) {
    const written = dotted(ref.typeName);
    const args = ref.typeArguments ?? [];
    if (!written) { args.forEach((a) => scan(a, env, ctx, out)); return; }
    const name = canonicalName(written, env.aliases);
    if (followed && WRAPPERS.has(name) && args.length) { read(args[0], env, ctx, out, true); return; }
    if (followed && LISTS.has(name) && args.length) { read(args[0], { ...env, list: true }, ctx, out, true); return; }
    const declaration = localAlias(ref, ctx);
    if (declaration) {
        if (env.seen.has(declaration)) return;
        const seen = new Set([...env.seen, declaration]);
        read(declaration.type, { ...env, aliases: ctx.aliasesOf(declaration.getSourceFile()), namespace: undefined, seen }, ctx, out, followed);
        return;
    }
    const placed = placeName(name, env, ctx, ref);
    if (placed.skip) { args.forEach((a) => scan(a, env, ctx, out)); return; }
    const { key } = placed;
    if (ctx.model.findDto(ctx.pkg, key)) {
        if (followed && placed.followed) out.refs.push({ written, key, explicit: placed.explicit, list: env.list });
        else out.unread.push({ written, key });
        return;
    }
    const alias = ctx.model.findAlias(ctx.pkg, key);
    if (alias) {
        const marker = `${alias.pkg}:${key}`;
        if (env.seen.has(marker)) return;
        const seen = new Set([...env.seen, marker]);
        read(alias.type, { ...env, aliases: ctx.aliasesOf(alias.sf), namespace: alias.namespace, seen }, ctx, out, followed && placed.followed);
        return;
    }
    if (placed.explicit && !ctx.model.isNotAClass(ctx.pkg, key)) out.unknown.push({ written });
    args.forEach((a) => scan(a, env, ctx, out));
}

/** Every type name inside a type this check does not follow, recorded as unread where it names a DTO. */
function scan(type, env, ctx, out) {
    const visit = (node) => {
        if (ts.isTypeQueryNode(node) || ts.isIndexedAccessTypeNode(node)) return;
        if (ts.isTypeReferenceNode(node)) { readReference(node, env, ctx, out, false); return; }
        ts.forEachChild(node, visit);
    };
    visit(type);
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
 * The DTO references a cast holds: `Resolved.<Namespace>.<Dto>` (or `<Namespace>.<Dto>`), with or
 * without type arguments, or the DTO of an `Omit`, a `Pick` or an intersection holding one.
 */
function mirrorRefsOf(type, aliases) {
    if (!type) return [];
    if (ts.isParenthesizedTypeNode(type)) return mirrorRefsOf(type.type, aliases);
    if (ts.isIntersectionTypeNode(type)) return type.types.flatMap((t) => mirrorRefsOf(t, aliases));
    if (!ts.isTypeReferenceNode(type)) return [];
    const written = dotted(type.typeName);
    if (!written) return [];
    const name = canonicalName(written, aliases);
    if (WRAPPERS.has(name) && type.typeArguments && type.typeArguments.length) return mirrorRefsOf(type.typeArguments[0], aliases);
    const rooted = /^Resolved\.(\w+\.\w+)$/.exec(name);
    return rooted ? [{ written, key: rooted[1] }] : [];
}

/** The body of a callable as statements: a concise arrow body reads as one `return`. */
const statementsOf = (fn) => (ts.isBlock(fn.body) ? [...fn.body.statements] : [fn.body]);

/** The resolveDto call a leading statement makes, and the expression it sits in. */
function resolutionOf(statement) {
    let init;
    if (ts.isVariableStatement(statement) && statement.declarationList.declarations.length === 1) init = statement.declarationList.declarations[0].initializer;
    else if (ts.isReturnStatement(statement)) init = statement.expression;
    else if (ts.isExpression(statement)) init = statement;
    const call = init && unwrap(init);
    return isResolveCall(call) ? { init, call } : undefined;
}

const firstLine = (node, sf) => node.getText(sf).split("\n")[0].slice(0, 100);

/**
 * Whether one statement resolves the parameter against its own DTO: `{ ok }` with the call, or
 * `{ problem }` saying how it falls short.
 */
function entryOf(statement, paramName, dtoKey, sf, aliases) {
    const resolution = resolutionOf(statement);
    if (!resolution) return { problem: `never resolves its inputs (first statement: \`${firstLine(statement, sf)}\`)` };
    const { init, call } = resolution;
    const [dtoArg, inputsArg] = call.arguments;
    const resolvedAgainst = dtoArg && dotted(dtoArg);
    if (!resolvedAgainst || canonicalName(resolvedAgainst, aliases).replace(/^Inputs\./, "") !== dtoKey) return { problem: `takes ${dtoKey} but resolves against ${dtoArg ? dtoArg.getText(sf) : "nothing"}` };
    if (!inputsArg || !ts.isIdentifier(inputsArg) || inputsArg.text !== paramName) return { problem: `resolves ${inputsArg ? inputsArg.getText(sf) : "nothing"}, not its parameter \`${paramName}\`` };
    for (const cast of castsOf(init)) {
        const mirrors = mirrorRefsOf(cast, aliases);
        if (!mirrors.length) {
            if (/\bResolved\./.test(cast.getText(sf))) return { problem: `casts the resolved inputs to \`${cast.getText(sf)}\`, which does not read as the Resolved mirror of ${dtoKey}` };
            continue;
        }
        const other = mirrors.find((m) => m.key !== dtoKey);
        if (other) return { problem: `resolves ${dtoKey} but casts it to ${other.written}` };
    }
    return { ok: call };
}

/** Every resolveDto call in a body, so a late one can be told from none. */
function resolveCallsIn(body) {
    const calls = [];
    const find = (node) => { if (isResolveCall(node)) calls.push(node); ts.forEachChild(node, find); };
    find(body);
    return calls;
}

/**
 * The lines on which a callable reads a parameter after the call that resolved it, or null when the
 * type checker gives the parameter no symbol to follow.
 */
function rawReads(fn, param, resolveCall, checker, sf) {
    const symbol = checker.getSymbolAtLocation(param.name);
    if (!symbol) return null;
    const reads = [];
    const visit = (node) => {
        if (node === resolveCall.arguments[1] || ts.isTypeNode(node)) return;
        if (ts.isIdentifier(node) && node.text === param.name.text && node !== param.name) {
            const parent = node.parent;
            const isName = (ts.isPropertyAccessExpression(parent) && parent.name === node)
                || (ts.isPropertyAssignment(parent) && parent.name === node)
                || (ts.isQualifiedName(parent) && parent.right === node);
            const target = ts.isShorthandPropertyAssignment(parent) ? checker.getShorthandAssignmentValueSymbol(parent) : isName ? undefined : checker.getSymbolAtLocation(node);
            if (target === symbol) reads.push(sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1);
        }
        ts.forEachChild(node, visit);
    };
    visit(fn.body);
    return reads;
}

/** The lines on which a function reads its own `arguments`, a nested function's own aside. */
function argumentsReads(fn, sf) {
    if (ts.isArrowFunction(fn)) return [];
    const reads = [];
    const visit = (node) => {
        if (node !== fn && (ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node) || ts.isMethodDeclaration(node) || ts.isAccessor(node) || ts.isConstructorDeclaration(node))) return;
        if (ts.isIdentifier(node) && node.text === "arguments" && !(ts.isPropertyAccessExpression(node.parent) && node.parent.name === node)) reads.push(sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1);
        ts.forEachChild(node, visit);
    };
    visit(fn.body);
    return reads;
}

const isHidden = (node) => ts.getCombinedModifierFlags(node) & (ts.ModifierFlags.Private | ts.ModifierFlags.Protected);
const isExported = (node) => ts.getCombinedModifierFlags(node) & ts.ModifierFlags.Export;

/** The function a property or a variable holds: an arrow function or a function expression, in parentheses or a cast. */
function functionOf(initializer) {
    const e = unwrap(initializer);
    return e && (ts.isArrowFunction(e) || ts.isFunctionExpression(e)) ? e : undefined;
}

const memberName = (member, sf) => (member.name ? (ts.isIdentifier(member.name) || ts.isStringLiteral(member.name) || ts.isNumericLiteral(member.name) ? member.name.text : member.name.getText(sf)) : undefined);

/**
 * The callables of a file this check walks, each { owner, name, node, fn }: the public methods of
 * every class and the public properties holding a function, and the exported functions and exported
 * `const`s holding a function, at the top level or inside namespaces, the namespace path as owner.
 */
export function callablesOf(sf) {
    const out = [];
    const fromStatements = (statements, owner) => {
        for (const statement of statements) {
            if (ts.isFunctionDeclaration(statement) && statement.body && isExported(statement)) out.push({ owner, name: statement.name ? statement.name.text : "default", node: statement, fn: statement });
            else if (ts.isVariableStatement(statement) && isExported(statement)) {
                for (const declaration of statement.declarationList.declarations) {
                    const fn = declaration.initializer && functionOf(declaration.initializer);
                    if (fn && ts.isIdentifier(declaration.name)) out.push({ owner, name: declaration.name.text, node: declaration, fn });
                }
            } else if (ts.isModuleDeclaration(statement)) {
                let module = statement;
                let path = owner ? `${owner}.${module.name.text}` : module.name.text;
                while (module.body && ts.isModuleDeclaration(module.body)) { module = module.body; path = `${path}.${module.name.text}`; }
                if (module.body && ts.isModuleBlock(module.body)) fromStatements(module.body.statements, path);
            }
        }
    };
    fromStatements(sf.statements, null);
    const visit = (node) => {
        if (ts.isClassDeclaration(node)) {
            const owner = node.name ? node.name.text : "default";
            for (const member of node.members) {
                if (isHidden(member) || (member.name && ts.isPrivateIdentifier(member.name))) continue;
                const name = memberName(member, sf);
                if (!name) continue;
                if (ts.isMethodDeclaration(member) && member.body) out.push({ owner, name, node: member, fn: member });
                else if (ts.isPropertyDeclaration(member) && member.initializer) {
                    const fn = functionOf(member.initializer);
                    if (fn) out.push({ owner, name, node: member, fn });
                }
            }
        }
        ts.forEachChild(node, visit);
    };
    visit(sf);
    return out;
}

/**
 * Checks one callable. Returns null when no parameter names a DTO; `{ withoutDefaults }` when every
 * DTO it names has no default; otherwise `{ problems }`, empty when it resolves on entry.
 */
export function checkCallable(fn, sf, ctx) {
    const aliases = ctx.aliasesOf(sf);
    const problems = [];
    const dtoParams = [];
    let namesDto = false;
    for (const param of fn.parameters) {
        if (ts.isIdentifier(param.name) && param.name.text === "this") continue;
        const label = ts.isIdentifier(param.name) ? `\`${param.name.text}\`` : "a destructured parameter";
        const { refs, unread, unknown } = readParamType(param.type, ctx);
        if (unknown.length) { problems.push(`takes ${unknown[0].written}, which is not a class in the inputs ${ctx.pkg} reaches`); continue; }
        const withDefaults = (key) => ctx.model.defaultsOf(ctx.pkg, key).length > 0;
        for (const u of unread.filter((x) => withDefaults(x.key))) problems.push(`its parameter ${label} names ${u.written}, a DTO with defaults, in \`${param.type.getText(sf).replace(/\s+/g, " ")}\`, a form this check does not follow to a resolveDto call`);
        if (refs.length) namesDto = true;
        if (refs.length > 1) { problems.push(`its parameter ${label} intersects several DTOs (${refs.map((c) => c.written).join(", ")}); say which one it resolves`); continue; }
        const [ref] = refs;
        if (!ref || !withDefaults(ref.key)) continue;
        if (ref.list) { problems.push(`its parameter ${label} is a list of ${ref.written}, a DTO with defaults; this check follows only a resolveDto call on the parameter itself`); continue; }
        dtoParams.push({ param, key: ref.key });
    }
    if (!problems.length && !dtoParams.length) return namesDto ? { withoutDefaults: true } : null;
    const statements = statementsOf(fn);
    const lead = statements.slice(0, dtoParams.length);
    if (dtoParams.length && !statements.length) problems.push("has an empty body");
    for (const { param, key } of dtoParams) {
        if (!statements.length) break;
        if (!ts.isIdentifier(param.name)) { problems.push("destructures its inputs in the parameter list, so they are read before any default applies"); continue; }
        const name = param.name.text;
        let entry;
        if (dtoParams.length === 1) {
            entry = entryOf(statements[0], name, key, sf, aliases);
            if (entry.problem && !resolutionOf(statements[0]) && resolveCallsIn(fn.body).length) entry = { problem: `resolves its inputs, but not as its first statement (first: \`${firstLine(statements[0], sf)}\`)` };
        } else {
            const own = lead.find((s) => { const r = resolutionOf(s); const arg = r && r.call.arguments[1]; return arg && ts.isIdentifier(arg) && arg.text === name; });
            if (own) entry = entryOf(own, name, key, sf, aliases);
            else {
                const late = resolveCallsIn(fn.body).some((c) => c.arguments[1] && ts.isIdentifier(c.arguments[1]) && c.arguments[1].text === name);
                entry = { problem: `${late ? "resolves" : "never resolves"} \`${name}\`${late ? ", but not" : ""} in its first ${dtoParams.length} statements, one per parameter taking a DTO with defaults` };
            }
        }
        if (entry.problem) { problems.push(entry.problem); continue; }
        const reads = rawReads(fn, param, entry.ok, ctx.checker, sf);
        if (reads === null) problems.push(`its parameter \`${name}\` has no symbol the type checker can follow, so its raw reads cannot be counted`);
        else if (reads.length) problems.push(`reads the raw \`${name}\` after resolving it (line ${[...new Set(reads)].join(", ")})`);
    }
    if (dtoParams.length && statements.length) {
        const through = argumentsReads(fn, sf);
        if (through.length) problems.push(`reads its parameters through \`arguments\` (line ${[...new Set(through)].join(", ")})`);
    }
    return { problems };
}

/**
 * Checks every callable of the given files. `entries` are { pkg, file, relFile }, each `pkg` a key of
 * `model`'s chains; `allow` maps `<relFile>#<owner>.<name>` to its reason. Returns the findings, each
 * { key, where, problem }, the passing and allowed methods, and how many named only DTOs without
 * defaults. An allow entry that names no checked method, or one that passes, is itself a finding.
 */
export function checkEntries({ entries, program, model, allow = {} }) {
    const checker = program.getTypeChecker();
    const aliasCache = new Map();
    const aliasesOf = (sf) => { if (!aliasCache.has(sf)) aliasCache.set(sf, importAliasesOf(sf)); return aliasCache.get(sf); };
    const findings = [];
    const allowed = [];
    const passing = [];
    const seenKeys = new Set();
    let withoutDefaults = 0;
    for (const { pkg, file, relFile } of entries) {
        const sf = program.getSourceFile(file);
        if (!sf) throw new Error(`${relFile} is not in the program`);
        const ctx = { pkg, model, checker, aliasesOf };
        for (const { owner, name: callableName, node, fn } of callablesOf(sf)) {
            const result = checkCallable(fn, sf, ctx);
            if (result === null) continue;
            if (result.withoutDefaults) { withoutDefaults++; continue; }
            const name = owner ? `${owner}.${callableName}` : callableName;
            const key = `${relFile}#${name}`;
            const where = `${relFile}:${sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1} ${name}`;
            seenKeys.add(key);
            if (!result.problems.length) {
                passing.push(where);
                if (allow[key]) findings.push({ key, where, problem: `now resolves its inputs on entry, so it must come out of ${ALLOW_FILE}` });
            } else if (allow[key]) {
                allowed.push(where);
            } else {
                for (const problem of result.problems) findings.push({ key, where, problem });
            }
        }
    }
    for (const key of Object.keys(allow)) {
        if (!seenKeys.has(key)) findings.push({ key, where: key, problem: `${ALLOW_FILE} names a method that does not exist or takes no DTO with defaults` });
    }
    return { findings, passing, allowed, withoutDefaults };
}

/** The files walked: each library package whole, and each worker package's hand-written files. */
export function walkedEntries() {
    const library = Object.keys(PACKAGES).flatMap((pkg) => sourceFiles(path.join(DEV, pkg, "lib")).map((file) => ({ pkg, file })));
    const hand = [...HAND_DIRS.flatMap((dir) => sourceFiles(path.join(DEV, dir))), ...HAND_FILES.map((f) => path.join(DEV, f)).filter((f) => existsSync(f))]
        .map((file) => ({ pkg: path.relative(DEV, file).split(path.sep)[0], file }));
    for (const { pkg, file } of hand) if (!WORKERS[pkg]) throw new Error(`${path.relative(ROOT, file)} is hand-written worker code of a package WORKERS does not name`);
    return [...library, ...hand].map((e) => ({ ...e, relFile: path.relative(DEV, e.file).split(path.sep).join("/") }));
}

function main() {
    const verbose = process.argv.includes("--verbose");
    const chains = { ...PACKAGES, ...WORKERS };
    const inputsFiles = new Map([...new Set(Object.values(chains).flat())].map((pkg) => [pkg, sourceFiles(path.join(DEV, pkg, "lib/api/inputs"))]));
    const entries = walkedEntries();
    const program = ts.createProgram([...new Set([...entries.map((e) => e.file), ...[...inputsFiles.values()].flat()])], { noResolve: true, noLib: true, types: [], target: ts.ScriptTarget.Latest });
    const model = inputsModel(chains, new Map([...inputsFiles].map(([pkg, files]) => [pkg, dtoClassesOf(files.map((f) => program.getSourceFile(f)))])));
    const allow = JSON.parse(readFileSync(path.join(ROOT, ALLOW_FILE), "utf8")).allow;
    const { findings, passing, allowed, withoutDefaults } = checkEntries({ entries, program, model, allow });

    if (verbose) for (const where of passing) console.log(`  ok  ${where}`);
    const summary = `${passing.length} public methods and functions resolve their DTO on entry, ${allowed.length} are allowed not to for a declared reason, ${withoutDefaults} take a DTO without defaults`;

    if (findings.length) {
        for (const { where, problem } of findings) console.error(`${where}: ${problem}`);
        console.error(`\n${summary}`);
        console.error(`resolved entry FAILED - ${findings.length} problem(s). A public method whose DTO has defaults starts with \`const resolved = resolveDto(Inputs.X.Dto, inputs) as Resolved.X.Dto;\` and reads only \`resolved\` after it (packages/dev/CLAUDE.md), or ${ALLOW_FILE} says why it cannot.`);
        process.exit(1);
    }
    console.log(`resolved entry: ${summary}`);
}

if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) main();
