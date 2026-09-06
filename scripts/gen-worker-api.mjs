#!/usr/bin/env node
/**
 * Generate the worker API layer from the kernel surface.
 *
 * Each worker package (occt-worker, jscad-worker, manifold-worker) exposes the kernel's API classes
 * as a mirror: the same class tree, the same method names, the same docs, every return wrapped in a
 * Promise, every kernel object type replaced by the opaque pointer the worker hands back, and every
 * method body one call that sends the method's dotted path to the worker thread. That mirror used to
 * be written by hand - about 8,700 lines that drifted from the kernel in names, types and docs. It is
 * now emitted from the kernel sources:
 *
 *   - the class tree, the property and method order, the docs and the signatures come from the
 *     kernel classes (walked from the root exactly as the worker thread resolves a dotted path);
 *   - kernel object types map to pointer types mechanically (TopoDS_Wire -> Inputs.OCCT.TopoDSWirePointer,
 *     Manifold3D.Manifold -> Inputs.Manifold.ManifoldPointer, ...); where the worker deliberately declares
 *     a different type, scripts/worker-api.overrides.json says which and why;
 *   - kernel methods the worker does not expose are those listed as kernelOnly in
 *     scripts/worker-parity.allow.json - one list for the parity check and the generator;
 *   - what cannot be generated (a browser download, File/Blob preparation before the call, a result
 *     the main thread re-hydrates, a command the worker thread handles itself) is written by hand in
 *     lib/api-hand/<same path>.ts as a class with the same name, whose members carry a marker line:
 *       // replaces <dotted path>   emitted at that kernel method's slot instead of the generated one
 *       // after <dotted path>      emitted right after that slot (a private helper, a reserved command)
 *       // first  |  // last        emitted before or after every generated member
 *     A replacing member without its own JSDoc receives the kernel method's doc, so the doc still has
 *     one author. The fragment's imports are merged into the generated file.
 *
 *   node scripts/gen-worker-api.mjs           write the generated files
 *   node scripts/gen-worker-api.mjs --check   write nothing; fail if any generated file would change
 */
import ts from "typescript";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const check = process.argv.includes("--check");
const allow = JSON.parse(readFileSync(path.join(ROOT, "scripts/worker-parity.allow.json"), "utf8"));
const overrides = JSON.parse(readFileSync(path.join(ROOT, "scripts/worker-api.overrides.json"), "utf8"));

const PACKAGES = [
    {
        name: "occt",
        kernelDir: "packages/dev/occt/lib", kernelRoot: "OCCTService",
        workerPkg: "packages/dev/occt-worker", apiDir: "lib/api/occt", rootFile: "lib/api/occt/occt.ts",
        managerClass: "OCCTWorkerManager", managerModule: "lib/occ-worker/occ-worker-manager", managerParam: "occWorkerManager",
        inputsImport: (names) => `import { ${names.join(", ")} } from "@bitbybit-dev/occt";`,
        classNames: { OCCTService: "OCCT" },
        // worker method names that differ from the kernel's: public API, persisted in saved scripts, so they stay
        methodNames: { "assembly.manager.setLabelColor": "setDocLabelColor", "assembly.manager.setLabelName": "setDocLabelName" },
        // the manager is public where a consumer subclass overrides it (core's OCCTW and OCCTWIO)
        managerVisibility: { "": "public readonly", "io": "readonly" },
        typeMap: [
            [/\bTopoDS_(Vertex|Edge|Wire|Face|Shell|Solid|CompSolid|Compound|Shape)\b/g, "Inputs.OCCT.TopoDS$1Pointer"],
            [/\bHandle_Geom2d_\w+\b/g, "Inputs.OCCT.Geom2dCurvePointer"],
            [/\bGeom2d_\w+\b/g, "Inputs.OCCT.Geom2dCurvePointer"],
            [/\bHandle_Geom_\w*Surface\w*\b/g, "Inputs.OCCT.GeomSurfacePointer"],
            [/\bGeom_\w*Surface\w*\b/g, "Inputs.OCCT.GeomSurfacePointer"],
            [/\bHandle_Geom_\w*Curve\w*\b/g, "Inputs.OCCT.GeomCurvePointer"],
            [/\bGeom_\w*Curve\w*\b/g, "Inputs.OCCT.GeomCurvePointer"],
            [/\bHandle_TDocStd_Document\b/g, "Inputs.OCCT.TDocStdDocumentPointer"],
            [/(?<![\w.])Base\./g, "Inputs.Base."],
        ],
    },
    {
        name: "jscad",
        kernelDir: "packages/dev/jscad/lib", kernelRoot: "Jscad",
        workerPkg: "packages/dev/jscad-worker", apiDir: "lib/api", rootFile: "lib/api/jscad.ts",
        managerClass: "JSCADWorkerManager", managerModule: "lib/jscad-worker/jscad-worker-manager", managerParam: "jscadWorkerManager",
        inputsImport: () => "import * as Inputs from \"@bitbybit-dev/jscad/lib/api/inputs\";",
        classNames: { Jscad: "JSCAD" },
        methodNames: {},
        managerVisibility: {},
        typeMap: [[/(?<![\w.])Base\./g, "Inputs.Base."]],
    },
    {
        name: "manifold",
        kernelDir: "packages/dev/manifold/lib", kernelRoot: "ManifoldService",
        workerPkg: "packages/dev/manifold-worker", apiDir: "lib/api", rootFile: "lib/api/manifold-bitbybit.ts",
        managerClass: "ManifoldWorkerManager", managerModule: "lib/manifold-worker/manifold-worker-manager", managerParam: "manifoldWorkerManager",
        inputsImport: () => "import * as Inputs from \"@bitbybit-dev/manifold/lib/api/inputs\";",
        classNames: { ManifoldService: "ManifoldBitByBit", CrossSection: "ManifoldCrossSection" },
        methodNames: {},
        managerVisibility: {},
        typeMap: [
            [/\bManifold3D\.Manifold\b/g, "Inputs.Manifold.ManifoldPointer"],
            [/\bManifold3D\.CrossSection\b/g, "Inputs.Manifold.CrossSectionPointer"],
            [/\bManifold3D\.Mesh\b/g, "Inputs.Manifold.MeshPointer"],
            [/\bManifold3D\.SimplePolygon\b/g, "Inputs.Base.Vector2[]"],
            [/\bManifold3D\.Polygons\b/g, "Inputs.Base.Vector2[][]"],
            [/(?<![\w.])Base\./g, "Inputs.Base."],
        ],
    },
];

const HEADER = (kernelFile, handFile) => [
    `// GENERATED by scripts/gen-worker-api.mjs from ${kernelFile} - do not edit.`,
    `// The kernel class is the source of the docs, the signatures and the member order${handFile ? `; hand-written members come from ${handFile}` : ""}.`,
    "// Regenerate with `npm run gen:worker-api` at the repository root.",
].join("\n");

// ---------------------------------------------------------------- kernel surface

function sourceFiles(dir) {
    const out = [];
    const walk = (d) => {
        for (const entry of readdirSync(d, { withFileTypes: true })) {
            if (entry.name === "node_modules" || entry.name === "dist" || entry.name.startsWith(".")) continue;
            const p = path.join(d, entry.name);
            if (entry.isDirectory()) walk(p);
            else if (entry.name.endsWith(".ts") && !entry.name.endsWith(".test.ts") && !entry.name.endsWith(".d.ts")) out.push(p);
        }
    };
    walk(dir);
    return out.sort();
}
const parse = (file) => ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true);
const isPublic = (node) => !(ts.getCombinedModifierFlags(node) & (ts.ModifierFlags.Private | ts.ModifierFlags.Protected | ts.ModifierFlags.Static));
const nameOf = (node) => (node.name && ts.isIdentifier(node.name) ? node.name.text : null);
function jsdocOf(node, sf) {
    const blocks = (ts.getLeadingCommentRanges(sf.text, node.getFullStart()) || []).filter((r) => sf.text.substring(r.pos, r.pos + 3) === "/**");
    return blocks.length ? sf.text.substring(blocks[blocks.length - 1].pos, blocks[blocks.length - 1].end) : null;
}
const reindent = (doc, indent) => doc.split(/\r?\n/).map((l, i) => (i === 0 ? indent + l.trimStart() : indent + " " + l.trimStart())).join("\n");

function kernelClasses(dir) {
    const classes = new Map();
    for (const file of sourceFiles(dir)) {
        const sf = parse(file);
        const visit = (node) => {
            if (ts.isClassDeclaration(node) && node.name && !classes.has(node.name.text)) classes.set(node.name.text, { node, sf, file });
            ts.forEachChild(node, visit);
        };
        visit(sf);
    }
    return classes;
}

/** prefix -> { className, file, doc, props: [{name, className}], methods: [{name, path, doc, params, returns}] }, walked from the root. */
function kernelSurface(classes, rootName) {
    const byPrefix = new Map();
    const visit = (className, prefix, seen) => {
        const entry = classes.get(className);
        if (!entry || seen.has(className)) return;
        seen = new Set([...seen, className]);
        const { node, sf, file } = entry;
        const cls = { className, prefix, file: path.relative(ROOT, file), doc: jsdocOf(node, sf), props: [], methods: [] };
        byPrefix.set(prefix, cls);
        for (const clause of node.heritageClauses || []) {
            if (clause.token !== ts.SyntaxKind.ExtendsKeyword) continue;
            for (const t of clause.types) if (ts.isIdentifier(t.expression)) throw new Error(`${cls.file}: ${className} extends ${t.expression.text}; the generator emits flat classes`);
        }
        for (const member of node.members) {
            const name = nameOf(member);
            if (!name || !isPublic(member)) continue;
            const full = prefix ? `${prefix}.${name}` : name;
            if (ts.isMethodDeclaration(member)) {
                if (!member.type) throw new Error(`${cls.file}: ${className}.${name} has no return type annotation`);
                if (member.typeParameters) throw new Error(`${cls.file}: ${className}.${name} has type parameters`);
                if (member.parameters.some((p) => p.questionToken || p.initializer || p.dotDotDotToken)) throw new Error(`${cls.file}: ${className}.${name} has an optional, default or rest parameter`);
                cls.methods.push({ name, path: full, doc: jsdocOf(member, sf), params: member.parameters.map((p) => ({ name: p.name.getText(sf), type: p.type ? p.type.getText(sf) : "unknown" })), returns: member.type.getText(sf) });
            } else if (ts.isPropertyDeclaration(member)) {
                const t = member.type;
                if (t && ts.isTypeReferenceNode(t) && ts.isIdentifier(t.typeName) && classes.has(t.typeName.text)) {
                    cls.props.push({ name, className: t.typeName.text });
                    visit(t.typeName.text, full, seen);
                }
            }
        }
    };
    visit(rootName, "", new Set());
    return byPrefix;
}

// ---------------------------------------------------------------- hand-written fragments

/** Members of the fragment class, each with its marker, its own JSDoc (if any) and its text without the marker line. */
function readFragment(file) {
    const sf = parse(file);
    const cls = sf.statements.find(ts.isClassDeclaration);
    if (!cls) throw new Error(`${file}: no class`);
    const imports = sf.statements.filter(ts.isImportDeclaration).map((s) => s.getText(sf));
    const members = [];
    for (const member of cls.members) {
        if (ts.isConstructorDeclaration(member)) continue;
        const ranges = ts.getLeadingCommentRanges(sf.text, member.getFullStart()) || [];
        const marker = ranges.map((r) => sf.text.substring(r.pos, r.end)).find((t) => /^\/\/\s*(replaces|after|first|last)\b/.test(t));
        if (!marker) throw new Error(`${path.relative(ROOT, file)}: ${nameOf(member) || "member"} has no marker line (// replaces <path> | // after <path> | // first | // last)`);
        const m = marker.match(/^\/\/\s*(replaces|after|first|last)\b\s*(\S*)/);
        let text = sf.text.substring(member.getFullStart(), member.end).replace(/^\s*\/\/\s*(replaces|after|first|last)\b[^\n]*\n/m, "");
        text = text.replace(/^\s*\n/, "");
        members.push({ kind: m[1], path: m[2] || null, name: nameOf(member), doc: jsdocOf(member, sf), text: text.replace(/^\n+/, ""), hasDoc: !!jsdocOf(member, sf) });
    }
    return { imports, members, className: cls.name.text };
}

// ---------------------------------------------------------------- emission

const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
function outputFile(pkg, cls, hasChildren) {
    if (cls.prefix === "") return pkg.rootFile;
    const parts = cls.prefix.split(".").map(kebab);
    const rel = hasChildren ? [...parts, parts[parts.length - 1]] : parts;
    return path.posix.join(pkg.apiDir, rel.join("/") + ".ts");
}
const mapType = (t, pkg) => pkg.typeMap.reduce((s, [re, to]) => s.replace(re, to), t);

function generatePackage(pkg) {
    const classes = kernelClasses(path.join(ROOT, pkg.kernelDir));
    if (!classes.has(pkg.kernelRoot)) throw new Error(`${pkg.name}: kernel root class ${pkg.kernelRoot} not found`);
    const surface = kernelSurface(classes, pkg.kernelRoot);
    const kernelOnly = new Set(Object.keys((allow[pkg.name] || {}).kernelOnly || {}));
    const pkgOverrides = overrides[pkg.name] || {};
    const usedOverrides = new Set();
    const files = new Map(); // relative path within the worker package -> text
    const workerName = (kernelClassName) => pkg.classNames[kernelClassName] || kernelClassName;
    const fileOf = new Map(); // prefix -> output file
    for (const cls of surface.values()) fileOf.set(cls.prefix, outputFile(pkg, cls, cls.props.length > 0));

    for (const cls of surface.values()) {
        const out = fileOf.get(cls.prefix);
        const outDir = path.posix.dirname(out);
        const handFile = out.replace(/^lib\/api\//, "lib/api-hand/");
        const fragment = existsSync(path.join(ROOT, pkg.workerPkg, handFile)) ? readFragment(path.join(ROOT, pkg.workerPkg, handFile)) : null;
        if (fragment && fragment.className !== workerName(cls.className)) throw new Error(`${handFile}: class ${fragment.className} does not match ${workerName(cls.className)}`);
        const byReplace = new Map(), byAfter = new Map(), first = [], last = [];
        for (const m of fragment ? fragment.members : []) {
            if (m.kind === "first") first.push(m);
            else if (m.kind === "last") last.push(m);
            else {
                const map = m.kind === "replaces" ? byReplace : byAfter;
                if (!cls.methods.some((k) => k.path === m.path)) throw new Error(`${handFile}: ${m.name} ${m.kind} ${m.path}, which is not a public method of ${cls.className}`);
                if (!map.has(m.path)) map.set(m.path, []);
                map.get(m.path).push(m);
            }
        }

        const lines = [];
        const emitFragmentMember = (m, kernelDoc) => {
            let text = m.text;
            if (!m.hasDoc && kernelDoc) text = reindent(kernelDoc, "    ") + "\n" + text;
            lines.push(text.replace(/\s+$/, ""), "");
        };
        for (const m of first) emitFragmentMember(m, null);
        for (const method of cls.methods) {
            if (kernelOnly.has(method.path)) continue;
            if (byReplace.has(method.path)) {
                for (const m of byReplace.get(method.path)) emitFragmentMember(m, method.doc);
            } else {
                const ov = pkgOverrides[method.path];
                if (ov) usedOverrides.add(method.path);
                const params = method.params.map((p, i) => `${p.name}: ${ov && ov.params && ov.params[i] !== undefined ? ov.params[i] : mapType(p.type, pkg)}`);
                const returns = ov && ov.returns !== undefined ? ov.returns : mapType(method.returns, pkg);
                const unmapped = [...params, returns].join(" ").match(/(?<![\w.])(TopoDS_\w+|Handle_\w+|Geom2?d?_\w+|gp_\w+|Manifold3D\.\w+|JSCAD\.\w+)/);
                if (unmapped) throw new Error(`${cls.file}: ${method.path} uses ${unmapped[1]}, which has no pointer mapping`);
                if (method.doc) lines.push(reindent(method.doc, "    "));
                lines.push(`    ${pkg.methodNames[method.path] || method.name}(${params.join(", ")}): Promise<${returns}> {`);
                lines.push(`        return this.${pkg.managerParam}.genericCallToWorkerPromise("${method.path}", ${method.params.length ? method.params[0].name : "{}"});`);
                lines.push("    }", "");
            }
            for (const m of byAfter.get(method.path) || []) emitFragmentMember(m, null);
        }
        for (const m of last) emitFragmentMember(m, null);
        while (lines.length && lines[lines.length - 1] === "") lines.pop();

        // constructor: containers pass the manager on; classes with methods keep it, private unless configured
        const isContainer = cls.props.length > 0 && cls.methods.filter((m) => !kernelOnly.has(m.path)).length === 0 && !fragment;
        const visibility = pkg.managerVisibility[cls.prefix] !== undefined ? pkg.managerVisibility[cls.prefix] + " " : (isContainer ? "" : "private readonly ");
        const ctor = [];
        for (const p of cls.props) ctor.push(`    public readonly ${p.name}: ${workerName(p.className)};`);
        if (cls.props.length) ctor.push("");
        ctor.push("    constructor(", `        ${visibility}${pkg.managerParam}: ${pkg.managerClass}${cls.props.length ? "" : ","}`, "    ) {");
        for (const p of cls.props) ctor.push(`        this.${p.name} = new ${workerName(p.className)}(${pkg.managerParam});`);
        ctor.push("    }");

        // imports: the API inputs, the manager, child classes, then whatever the fragment brings that is not there yet
        const bodyText = lines.join("\n").replace(/\/\*\*[\s\S]*?\*\//g, "");
        const needsInputs = /\bInputs\./.test(bodyText);
        const inputsNames = [];
        if (needsInputs) inputsNames.push("Inputs");
        if (/\bModels\./.test(bodyText)) inputsNames.push("Models");
        const managerRel = path.posix.relative(outDir, pkg.managerModule);
        const childImports = cls.props.map((p) => {
            const childOut = fileOf.get(cls.prefix ? `${cls.prefix}.${p.name}` : p.name);
            let rel = path.posix.relative(outDir, childOut.replace(/\.ts$/, ""));
            if (!rel.startsWith(".")) rel = "./" + rel;
            return `import { ${workerName(p.className)} } from "${rel}";`;
        });
        const header = [];
        if (inputsNames.length) header.push(pkg.inputsImport(inputsNames));
        header.push(`import { ${pkg.managerClass} } from "${managerRel.startsWith(".") ? managerRel : "./" + managerRel}";`);
        if (/\bIO\./.test(bodyText)) header.push("import { IO } from \"@bitbybit-dev/base/lib/api/inputs\";");
        header.push(...childImports);
        const provided = new Set(header.flatMap((h) => (h.match(/\{([^}]*)\}/) || ["", ""])[1].split(",").map((n) => n.trim()).filter(Boolean)).concat(header.some((h) => /^import \* as Inputs\b/.test(h)) ? ["Inputs"] : []));
        for (const imp of fragment ? fragment.imports : []) {
            const named = imp.match(/^import \{([^}]*)\} from ("[^"]+");$/);
            if (!named) { if (!header.includes(imp)) header.push(imp); continue; }
            const names = named[1].split(",").map((n) => n.trim()).filter((n) => n && !provided.has(n));
            if (names.length) header.push(`import { ${names.join(", ")} } from ${named[2]};`);
        }

        const text = [
            HEADER(cls.file, fragment ? path.posix.join(pkg.workerPkg, handFile) : null),
            ...header,
            "",
            ...(cls.doc ? [cls.doc] : []),
            `export class ${workerName(cls.className)} {`,
            ...ctor,
            ...(lines.length ? ["", ...lines] : []),
            "}",
            "",
        ].join("\n");
        files.set(out, text);
    }

    // one barrel per generated directory, exporting its files in sorted order
    const dirs = new Map();
    for (const out of files.keys()) { const d = path.posix.dirname(out); if (!dirs.has(d)) dirs.set(d, []); dirs.get(d).push(path.posix.basename(out, ".ts")); }
    for (const [d, names] of dirs) {
        if (d === pkg.apiDir && pkg.apiDir === "lib/api") continue; // the package's own barrel is hand-written (it also exports the init class)
        const subdirs = [...dirs.keys()].filter((o) => path.posix.dirname(o) === d).map((o) => path.posix.basename(o));
        const entries = [...names, ...subdirs].sort();
        files.set(path.posix.join(d, "index.ts"), ["// GENERATED by scripts/gen-worker-api.mjs - do not edit.", ...entries.map((n) => `export * from "./${n}";`), ""].join("\n"));
    }

    for (const p of Object.keys(pkgOverrides)) if (!usedOverrides.has(p)) throw new Error(`${pkg.name}: override for ${p} names no generated method`);
    for (const p of Object.keys(pkg.methodNames)) if (![...surface.values()].some((c) => c.methods.some((m) => m.path === p))) throw new Error(`${pkg.name}: method name for ${p} names no kernel method`);
    return files;
}

let changed = 0, written = 0;
for (const pkg of PACKAGES) {
    const files = generatePackage(pkg);
    for (const [rel, text] of files) {
        const abs = path.join(ROOT, pkg.workerPkg, rel);
        const current = existsSync(abs) ? readFileSync(abs, "utf8") : null;
        if (current === text) continue;
        changed++;
        if (check) console.log(`  would change: ${path.posix.join(pkg.workerPkg, rel)}${current === null ? " (new)" : ""}`);
        else { mkdirSync(path.dirname(abs), { recursive: true }); writeFileSync(abs, text); written++; }
    }
    console.log(`${pkg.name}: ${files.size} generated files${check ? "" : `, ${written} written`}`);
    written = 0;
}
if (check && changed) { console.error(`\nworker API generation check FAILED - ${changed} file(s) differ from what the kernel generates; run \`npm run gen:worker-api\` and commit the result`); process.exit(1); }
if (check) console.log("worker API generation check passed");
