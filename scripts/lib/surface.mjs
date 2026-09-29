/**
 * The TypeScript surface the repository's checks and generators walk: which files count as
 * source, how they are parsed, and how the classes in them are found by name.
 *
 * Three scripts read the kernel classes - the worker generator (gen-worker-api.mjs), the parity
 * check (worker-parity.mjs) and the documentation check (check-api-docs.mjs) - and each once carried
 * its own copy of this, drifting in what it skipped. This is the one copy. What differs between
 * them, on purpose, stays with each script: how the class tree is walked from its root (the docs
 * check follows type names, the parity check follows `extends`, the generator refuses `extends`).
 */
import ts from "typescript";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { targets } from "../inputs.config.mjs";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

/** The inputs fragment directories: they duplicate the DTO classes of the assembled inputs files (gen-inputs.mjs). */
export const FRAGMENT_DIRS = new Set(targets.map((t) => path.join(ROOT, t.dir)));

/** Directories that hold test support rather than the library: never part of the surface. */
const TEST_SUPPORT_DIRS = new Set(["__mocks__", "__test__"]);

/**
 * The hand-written part of the three worker packages, relative to packages/dev: the members the
 * worker generator merges into its generated classes, and the init classes it does not generate.
 * They run on the calling thread, so the documentation check audits them file by file and the
 * resolved-entry check walks them as it walks the kernels.
 */
export const HAND_DIRS = ["occt-worker/lib/api-hand", "jscad-worker/lib/api-hand", "manifold-worker/lib/api-hand"];
export const HAND_FILES = ["occt-worker/lib/api/bitbybit-occt.ts", "jscad-worker/lib/api/bitbybit-jscad.ts", "manifold-worker/lib/api/bitbybit-manifold.ts"];

/**
 * The packages with inputs DTOs, each with the packages whose inputs its `Inputs` namespace
 * re-exports, its own first: a DTO name declared in two of them (the renderers' `Draw`) means the
 * nearest one.
 */
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

/**
 * Every source file under `dir`, sorted: `.ts` that is not a test, a declaration file, a dependency,
 * a build output or test support. The inputs fragments are left out unless `fragments` is set - a
 * walk of the classes wants each DTO once, from the assembled file; the documentation check wants
 * the fragments, which are where the DTOs are authored. A missing directory is an empty surface.
 */
export function sourceFiles(dir, { fragments = false } = {}) {
    const out = [];
    const walk = (d) => {
        if (!existsSync(d)) return;
        for (const entry of readdirSync(d, { withFileTypes: true })) {
            if (entry.name === "node_modules" || entry.name === "dist" || TEST_SUPPORT_DIRS.has(entry.name) || entry.name.startsWith(".")) continue;
            const p = path.join(d, entry.name);
            if (entry.isDirectory()) {
                if (fragments || !FRAGMENT_DIRS.has(p)) walk(p);
            } else if (entry.name.endsWith(".ts") && !entry.name.endsWith(".test.ts") && !entry.name.endsWith(".d.ts")) {
                out.push(p);
            }
        }
    };
    walk(dir);
    return out.sort();
}

const parsed = new Map();
/** The parsed source file, read once per process. */
export function parse(file) {
    if (!parsed.has(file)) parsed.set(file, ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true));
    return parsed.get(file);
}

export const isPublic = (node) => !(ts.getCombinedModifierFlags(node) & (ts.ModifierFlags.Private | ts.ModifierFlags.Protected | ts.ModifierFlags.Static));
export const nameOf = (node) => (node.name && ts.isIdentifier(node.name) ? node.name.text : null);

/** The JSDoc block directly above a declaration, as written, or null. */
export function jsdocOf(node, sf) {
    const blocks = (ts.getLeadingCommentRanges(sf.text, node.getFullStart()) || []).filter((r) => sf.text.substring(r.pos, r.pos + 3) === "/**");
    return blocks.length ? sf.text.substring(blocks[blocks.length - 1].pos, blocks[blocks.length - 1].end) : null;
}

/**
 * Every class declared under the given directories, by name, the first declaration winning and the
 * files of any later one recorded in `duplicates` - class names are unique per package, and a walk
 * by name has to be told when they are not.
 */
export function classesUnder(dirs) {
    const classes = new Map();
    for (const dir of Array.isArray(dirs) ? dirs : [dirs]) {
        for (const file of sourceFiles(dir)) {
            const sf = parse(file);
            const visit = (node) => {
                if (ts.isClassDeclaration(node) && node.name) {
                    if (classes.has(node.name.text)) classes.get(node.name.text).duplicates.push(file);
                    else classes.set(node.name.text, { node, sf, file, duplicates: [] });
                }
                ts.forEachChild(node, visit);
            };
            visit(sf);
        }
    }
    return classes;
}
