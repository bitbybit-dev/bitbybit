#!/usr/bin/env node
import ts from "typescript";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { ROOT, sourceFiles, parse, isPublic, nameOf, jsdocOf, classesUnder } from "./lib/surface.mjs";

const SNAPSHOT = path.join(ROOT, "scripts/worker-parity.snapshot.json");
const ALLOW = path.join(ROOT, "scripts/worker-parity.allow.json");
const update = process.argv.includes("--update");

const PAIRS = [
    { name: "occt", kernelDir: "packages/dev/occt/lib", kernelRoot: "OCCTService", workerDir: "packages/dev/occt-worker/lib/api", workerRoot: "OCCT", reservedConstants: "packages/dev/occt-worker/lib/occ-worker/constants.ts" },
    { name: "jscad", kernelDir: "packages/dev/jscad/lib", kernelRoot: "Jscad", workerDir: "packages/dev/jscad-worker/lib/api", workerRoot: "JSCAD" },
    { name: "manifold", kernelDir: "packages/dev/manifold/lib", kernelRoot: "ManifoldService", workerDir: "packages/dev/manifold-worker/lib/api", workerRoot: "ManifoldBitByBit" },
    { name: "ifc", kernelDir: "packages/dev/ifc/lib", kernelRoot: "IFCService", workerDir: "packages/dev/ifc-worker/lib/api", workerRoot: "IFCBitByBit" },
];

const typeText = (node, sf) => (node ? node.getText(sf).replace(/\s+/g, "") : "");
const normaliseDoc = (doc) => (doc ? doc.split(/\r?\n/).map((l) => l.trim()).join("\n") : "");

function classSurface(classes, rootName) {
    const surface = new Map();
    const classDocs = new Map();
    const visitClass = (className, prefix, seen) => {
        const entry = classes.get(className);
        if (!entry || seen.has(className)) {
            return;
        }
        seen = new Set([...seen, className]);
        const { node, sf } = entry;
        if (!classDocs.has(prefix)) {
            classDocs.set(prefix, { className, doc: jsdocOf(node, sf), file: path.relative(ROOT, entry.file) });
        }
        for (const clause of node.heritageClauses || []) {
            if (clause.token !== ts.SyntaxKind.ExtendsKeyword) {
                continue;
            }
            for (const t of clause.types) {
                if (ts.isIdentifier(t.expression)) {
                    visitClass(t.expression.text, prefix, seen);
                }
            }
        }
        const members = [...node.members];
        const ctor = members.find(ts.isConstructorDeclaration);
        const parameterProperties = ctor ? ctor.parameters.filter((p) => ts.getCombinedModifierFlags(p) & ts.ModifierFlags.ParameterPropertyModifier) : [];
        for (const member of [...members, ...parameterProperties]) {
            const name = nameOf(member);
            if (!name || !isPublic(member)) {
                continue;
            }
            const full = prefix ? `${prefix}.${name}` : name;
            if (ts.isMethodDeclaration(member)) {
                surface.set(full, { params: member.parameters.map((p) => typeText(p.type, sf)), returns: typeText(member.type, sf), doc: jsdocOf(member, sf), file: path.relative(ROOT, entry.file) });
            } else if (ts.isPropertyDeclaration(member) || ts.isParameter(member)) {
                const t = member.type;
                if (t && ts.isTypeReferenceNode(t) && ts.isIdentifier(t.typeName) && classes.has(t.typeName.text)) {
                    visitClass(t.typeName.text, full, seen);
                }
            }
        }
    };
    visitClass(rootName, "", new Set());
    return { surface, classDocs };
}

function workerSurface(dir) {
    const surface = new Map();
    for (const file of sourceFiles(dir)) {
        const sf = parse(file);
        const visit = (node, method) => {
            if (ts.isMethodDeclaration(node)) {
                method = node;
            }
            if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)
                && node.expression.name.text === "genericCallToWorkerPromise"
                && node.arguments.length && ts.isStringLiteral(node.arguments[0])) {
                const p = node.arguments[0].text;
                const sig = method ? { params: method.parameters.map((x) => typeText(x.type, sf)), returns: typeText(method.type, sf), doc: jsdocOf(method, sf) } : { params: [], returns: "", doc: null };
                if (!surface.has(p)) {
                    surface.set(p, { ...sig, file: path.relative(ROOT, file) });
                }
            }
            ts.forEachChild(node, (child) => visit(child, method));
        };
        visit(sf, null);
    }
    return surface;
}

function normalise(t) {
    let s = t.replace(/\s+/g, "");
    const promise = s.match(/^Promise<(.*)>$/);
    if (promise) {
        s = promise[1];
    }
    s = s
        .replace(/Inputs\.(OCCT|JSCAD|Manifold|IFC)\.\w+Pointer\b/g, "PTR")
        .replace(/\bIfcModel\b/g, "PTR")
        .replace(/\b(TopoDS_\w+|Handle_\w+|Geom2d_\w+|Geom_\w+|gp_\w+|TDocStd_\w+|TDF_\w+|Poly_\w+|BRep\w+)\b/g, "PTR")
        .replace(/\bManifold3D\.(Manifold|CrossSection|Mesh)\b/g, "PTR")
        .replace(/\bManifold3D\.SimplePolygon\b/g, "Inputs.Base.Vector2[]")
        .replace(/\bManifold3D\.Polygons\b/g, "Inputs.Base.Vector2[][]")
        .replace(/\bInputs\.\w+\.JSCADEntity\b/g, "PTR")
        .replace(/\bJSCADEntity\b/g, "PTR")
        .replace(/(?<![\w.])Base\./g, "Inputs.Base.")
        .replace(/<any>/g, "<PTR>");
    return s;
}

const allow = existsSync(ALLOW) ? JSON.parse(readFileSync(ALLOW, "utf8")) : {};
const snapshot = existsSync(SNAPSHOT) ? JSON.parse(readFileSync(SNAPSHOT, "utf8")) : null;
const nextSnapshot = {};
const failures = [];
const problem = (pair, kind, detail) => failures.push(`${pair}: ${kind}: ${detail}`);

for (const pair of PAIRS) {
    const classes = classesUnder(path.join(ROOT, pair.kernelDir));
    const dup = [...classes.values()].filter((c) => c.duplicates.length);
    for (const d of dup) {
        problem(pair.name, "duplicate kernel class name (walk is by name)", `${nameOf(d.node)} in ${path.relative(ROOT, d.file)} and ${d.duplicates.map((f) => path.relative(ROOT, f)).join(", ")}`);
    }
    if (!classes.has(pair.kernelRoot)) { problem(pair.name, "kernel root class not found", pair.kernelRoot); continue; }
    const workerClasses = classesUnder(path.join(ROOT, pair.workerDir));
    if (!workerClasses.has(pair.workerRoot)) { problem(pair.name, "worker root class not found", pair.workerRoot); continue; }

    const { surface: kernel, classDocs: kernelClassDocs } = classSurface(classes, pair.kernelRoot);
    const worker = workerSurface(path.join(ROOT, pair.workerDir));
    const { classDocs: workerClassDocs } = classSurface(workerClasses, pair.workerRoot);
    const allowed = allow[pair.name] || {};
    const workerOnlyAllowed = new Set(Object.keys(allowed.workerOnly || {}));
    const kernelOnlyAllowed = new Set(Object.keys(allowed.kernelOnly || {}));
    const signatureAllowed = allowed.signature || {};
    const docsAllowed = allowed.docs || {};

    const workerOnly = [...worker.keys()].filter((p) => !kernel.has(p) && !workerOnlyAllowed.has(p)).sort();
    const kernelOnly = [...kernel.keys()].filter((p) => !worker.has(p) && !kernelOnlyAllowed.has(p)).sort();
    const staleAllow = [
        ...[...workerOnlyAllowed].filter((p) => !worker.has(p) || kernel.has(p)),
        ...[...kernelOnlyAllowed].filter((p) => !kernel.has(p) || worker.has(p)),
    ].sort();
    const drifts = [];
    const driftsAllowedButAgreeing = [];
    for (const [p, w] of worker) {
        const k = kernel.get(p);
        if (!k) {
            continue;
        }
        const wr = normalise(w.returns), kr = normalise(k.returns);
        const wp = w.params.map(normalise).join(","), kp = k.params.map(normalise).join(",");
        const returnsDiffer = wr && kr && wr !== "any" && kr !== "any" && wr !== kr;
        const paramsDiffer = w.params.length && k.params.length && wp !== kp;
        if (signatureAllowed[p]) {
            if (!returnsDiffer && !paramsDiffer) {
                driftsAllowedButAgreeing.push(p);
            }
            continue;
        }
        if (returnsDiffer) {
            drifts.push(`${p}: worker returns ${w.returns} / kernel returns ${k.returns}  (${w.file})`);
        }
        if (paramsDiffer) {
            drifts.push(`${p}: worker takes ${w.params.join(", ")} / kernel takes ${k.params.join(", ")}  (${w.file})`);
        }
    }

    const docDrifts = [];
    const docsAllowedButAgreeing = [];
    let docsCompared = 0;
    for (const [p, w] of worker) {
        const k = kernel.get(p);
        if (!k) {
            continue;
        }
        docsCompared++;
        const same = normaliseDoc(w.doc) === normaliseDoc(k.doc);
        if (docsAllowed[p]) {
            if (same) {
                docsAllowedButAgreeing.push(p);
            }
            continue;
        }
        if (!same) {
            docDrifts.push(`${p}: ${w.doc ? "worker" : "worker has no doc"}${k.doc ? "" : ", kernel has no doc"}  (${w.file} / ${k.file})`);
        }
    }
    for (const p of Object.keys(docsAllowed)) {
        if (!worker.has(p) || !kernel.has(p)) {
            docDrifts.push(`${p}: docs allow-list entry names a path that is not mirrored`);
        }
    }
    const classDocDrifts = [];
    for (const [prefix, w] of workerClassDocs) {
        const k = kernelClassDocs.get(prefix);
        if (!k) { classDocDrifts.push(`"${prefix}": worker class ${w.className} has no kernel class at that prefix`); continue; }
        if (normaliseDoc(w.doc) !== normaliseDoc(k.doc)) {
            classDocDrifts.push(`"${prefix}": ${w.className} (${w.file}) / ${k.className} (${k.file})`);
        }
    }

    console.log(`${pair.name}: kernel ${kernel.size} paths, worker ${worker.size} paths, ${docsCompared} docs and ${workerClassDocs.size} class docs compared; allow-listed: ${workerOnlyAllowed.size} worker-only, ${kernelOnlyAllowed.size} kernel-only, ${Object.keys(signatureAllowed).length} signatures, ${Object.keys(docsAllowed).length} docs`);
    for (const p of workerOnly) {
        problem(pair.name, "worker sends a path the kernel does not have (runtime throw)", `${p}  (${worker.get(p).file})`);
    }
    for (const p of kernelOnly) {
        problem(pair.name, "kernel method not mirrored by the worker and not allow-listed", p);
    }
    for (const p of staleAllow) {
        problem(pair.name, "allow-list entry no longer needed", p);
    }
    for (const p of driftsAllowedButAgreeing) {
        problem(pair.name, "signature allow-list entry no longer needed (both sides agree)", p);
    }
    for (const d of drifts) {
        problem(pair.name, "signature drift", d);
    }
    for (const p of docsAllowedButAgreeing) {
        problem(pair.name, "docs allow-list entry no longer needed (both sides read the same)", p);
    }
    for (const d of docDrifts) {
        problem(pair.name, "method doc differs between kernel and worker", d);
    }
    for (const d of classDocDrifts) {
        problem(pair.name, "class doc differs between kernel and worker", d);
    }
    if (pair.reservedConstants) {
        const sf = parse(path.join(ROOT, pair.reservedConstants));
        const reserved = new Set();
        const visit = (node) => {
            if (ts.isVariableDeclaration(node) && nameOf(node) === "ReservedFunctions" && node.initializer) {
                const literal = ts.isAsExpression(node.initializer) ? node.initializer.expression : node.initializer;
                if (ts.isObjectLiteralExpression(literal)) {
                    for (const p of literal.properties) {
                        if (ts.isPropertyAssignment(p) && ts.isStringLiteral(p.initializer)) {
                            reserved.add(p.initializer.text);
                        }
                    }
                }
            }
            ts.forEachChild(node, visit);
        };
        visit(sf);
        if (!reserved.size) {
            problem(pair.name, "ReservedFunctions not found", pair.reservedConstants);
        }
        for (const p of workerOnlyAllowed) {
            if (!reserved.has(p)) {
                problem(pair.name, "reserved command sent by the worker API is not declared in ReservedFunctions (the worker thread would look for it in the kernel)", `${p}  (${pair.reservedConstants})`);
            }
        }
    }

    nextSnapshot[pair.name] = [...worker.keys()].sort();
    if (!update) {
        const previous = snapshot && snapshot[pair.name];
        if (!previous) {
            problem(pair.name, "no snapshot", "run with --update to record the surface");
        } else {
            const cur = new Set(nextSnapshot[pair.name]), prev = new Set(previous);
            for (const p of previous) {
                if (!cur.has(p)) {
                    problem(pair.name, "path removed from the worker surface (a persisted key in users' scripts)", p);
                }
            }
            for (const p of nextSnapshot[pair.name]) {
                if (!prev.has(p)) {
                    problem(pair.name, "path added to the worker surface (update the snapshot deliberately)", p);
                }
            }
        }
    }
}

if (update) {
    writeFileSync(SNAPSHOT, JSON.stringify(nextSnapshot, null, 2) + "\n");
    console.log(`snapshot written: ${Object.entries(nextSnapshot).map(([k, v]) => `${k} ${v.length}`).join(", ")}`);
}
if (failures.length) {
    console.error(`\nworker parity FAILED - ${failures.length} problem(s)`);
    for (const f of failures) {
        console.error(`  ${f}`);
    }
    process.exit(1);
}
console.log("worker parity passed");
