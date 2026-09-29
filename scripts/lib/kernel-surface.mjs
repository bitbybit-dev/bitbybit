/**
 * A kernel's public surface, walked from its root class exactly as a dotted path is resolved at
 * run time: every API class by the dotted prefix that reaches it, with its documented properties
 * and methods. The worker generator emits the worker API from it, and the DTO registry generator
 * the table of operations each kernel takes.
 */
import ts from "typescript";
import path from "node:path";
import { ROOT, isPublic, nameOf, jsdocOf } from "./surface.mjs";

/** prefix -> { className, file, doc, props: [{name, className}], methods: [{name, path, doc, params, returns}] }, walked from the root. */
export function kernelSurface(classes, rootName) {
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
