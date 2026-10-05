import ts from "typescript";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { targets } from "../inputs.config.mjs";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

export const FRAGMENT_DIRS = new Set(targets.map((t) => path.join(ROOT, t.dir)));

const TEST_SUPPORT_DIRS = new Set(["__mocks__", "__test__"]);

export const HAND_DIRS = ["occt-worker/lib/api-hand", "jscad-worker/lib/api-hand", "manifold-worker/lib/api-hand"];
export const HAND_FILES = ["occt-worker/lib/api/bitbybit-occt.ts", "jscad-worker/lib/api/bitbybit-jscad.ts", "manifold-worker/lib/api/bitbybit-manifold.ts"];

export const INPUTS_CHAINS = {
    base: ["base"],
    occt: ["occt", "base"],
    jscad: ["jscad", "base"],
    manifold: ["manifold", "base"],
    core: ["core", "occt", "jscad", "manifold", "base"],
    babylonjs: ["babylonjs", "core", "occt", "jscad", "manifold", "base"],
    threejs: ["threejs", "core", "occt", "jscad", "manifold", "base"],
    playcanvas: ["playcanvas", "core", "occt", "jscad", "manifold", "base"],
};

export function sourceFiles(dir, { fragments = false } = {}) {
    const out = [];
    const walk = (d) => {
        if (!existsSync(d)) {
            return;
        }
        for (const entry of readdirSync(d, { withFileTypes: true })) {
            if (entry.name === "node_modules" || entry.name === "dist" || TEST_SUPPORT_DIRS.has(entry.name) || entry.name.startsWith(".")) {
                continue;
            }
            const p = path.join(d, entry.name);
            if (entry.isDirectory()) {
                if (fragments || !FRAGMENT_DIRS.has(p)) {
                    walk(p);
                }
            } else if (entry.name.endsWith(".ts") && !entry.name.endsWith(".test.ts") && !entry.name.endsWith(".d.ts")) {
                out.push(p);
            }
        }
    };
    walk(dir);
    return out.sort();
}

const parsed = new Map();
export function parse(file) {
    if (!parsed.has(file)) {
        parsed.set(file, ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true));
    }
    return parsed.get(file);
}

export const isPublic = (node) => !(ts.getCombinedModifierFlags(node) & (ts.ModifierFlags.Private | ts.ModifierFlags.Protected | ts.ModifierFlags.Static));
export const nameOf = (node) => (node.name && ts.isIdentifier(node.name) ? node.name.text : null);

export function jsdocOf(node, sf) {
    const blocks = (ts.getLeadingCommentRanges(sf.text, node.getFullStart()) || []).filter((r) => sf.text.substring(r.pos, r.pos + 3) === "/**");
    return blocks.length ? sf.text.substring(blocks[blocks.length - 1].pos, blocks[blocks.length - 1].end) : null;
}

export function classesUnder(dirs) {
    const classes = new Map();
    for (const dir of Array.isArray(dirs) ? dirs : [dirs]) {
        for (const file of sourceFiles(dir)) {
            const sf = parse(file);
            const visit = (node) => {
                if (ts.isClassDeclaration(node) && node.name) {
                    if (classes.has(node.name.text)) {
                        classes.get(node.name.text).duplicates.push(file);
                    } else {
                        classes.set(node.name.text, { node, sf, file, duplicates: [] });
                    }
                }
                ts.forEachChild(node, visit);
            };
            visit(sf);
        }
    }
    return classes;
}
