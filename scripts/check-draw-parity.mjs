// Fails when a declaration the renderers share has drifted between them.
//
// The three renderer packages each own a copy of `export namespace Draw`, and they have to: a
// namespace cannot be merged across modules, and the declarations name types - the renderer's own
// scene object, its extended Base - that resolve differently in each package. Sharing the source is
// therefore not available. What is available is holding the copies to each other.
//
// So every declaration that appears in more than one renderer must be identical once documentation
// is stripped, unless scripts/draw-parity.allow.json says why it differs. A declaration that stops
// differing must come off that list, so the list only shrinks - the same discipline the lint
// suppressions follow.
//
// Documentation is deliberately not compared. Doc drift is worth fixing but it changes nothing a
// consumer runs, and failing on it would make the gate noisy enough to be routed around.
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RENDERERS = ["babylonjs", "threejs", "playcanvas"];
const DECL = /^ {4}export (?:type|interface|class|enum|const) (\w+)/;

/** Every top-level declaration of a renderer's Draw namespace, by name, as written. */
function declarations(renderer) {
    const file = path.join(ROOT, `packages/dev/${renderer}/lib/api/inputs/draw-inputs.ts`);
    const source = readFileSync(file, "utf8");
    const open = source.indexOf("export namespace Draw {");
    if (open === -1) throw new Error(`${renderer}: draw-inputs.ts declares no Draw namespace`);
    const body = source.slice(open + "export namespace Draw {".length, source.lastIndexOf("}"));
    const found = new Map();
    let name;
    let lines = [];
    for (const line of body.split("\n")) {
        const match = DECL.exec(line);
        if (match) {
            if (name) found.set(name, lines.join("\n"));
            name = match[1];
            lines = [line];
        } else if (name) {
            lines.push(line);
        }
    }
    if (name) found.set(name, lines.join("\n"));
    return found;
}

/** A declaration's type text: what it says, with the documentation and the formatting taken out. */
function typeText(declaration) {
    return declaration
        .replace(/\/\*\*[\s\S]*?\*\//g, "")
        .replace(/\/\/[^\n]*/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

/** The first place two versions of a declaration stop agreeing, with enough either side to read it. */
function divergence(a, b) {
    let i = 0;
    while (i < a.length && i < b.length && a[i] === b[i]) i++;
    const from = Math.max(0, i - 40);
    return { a: a.slice(from, i + 60), b: b.slice(from, i + 60) };
}

const allow = JSON.parse(readFileSync(path.join(ROOT, "scripts/draw-parity.allow.json"), "utf8")).allow;
const byRenderer = Object.fromEntries(RENDERERS.map((r) => [r, declarations(r)]));
const names = [...new Set(RENDERERS.flatMap((r) => [...byRenderer[r].keys()]))];

const drifted = [];
const gated = [];
const single = [];
for (const name of names) {
    const present = RENDERERS.filter((r) => byRenderer[r].has(name));
    if (present.length < 2) { single.push(name); continue; }
    const texts = present.map((r) => [r, typeText(byRenderer[r].get(name))]);
    const agrees = new Set(texts.map(([, t]) => t)).size === 1;
    if (agrees) {
        if (allow[name]) drifted.push({ name, stale: true });
        else gated.push(name);
    } else if (!allow[name]) {
        drifted.push({ name, present, texts });
    }
}

const unknown = Object.keys(allow).filter((n) => !names.includes(n));

for (const entry of drifted) {
    if (entry.stale) {
        console.error(`${entry.name}: the renderers now agree on this, so it must come out of scripts/draw-parity.allow.json`);
        continue;
    }
    console.error(`${entry.name}: the renderers disagree, and scripts/draw-parity.allow.json does not say why`);
    const [first, ...rest] = entry.texts;
    for (const other of rest) {
        if (other[1] === first[1]) continue;
        const { a, b } = divergence(first[1], other[1]);
        console.error(`    ${first[0]}: ...${a}...`);
        console.error(`    ${other[0]}: ...${b}...`);
        break;
    }
}
for (const name of unknown) {
    console.error(`scripts/draw-parity.allow.json names ${name}, which no renderer declares`);
}

if (drifted.length || unknown.length) {
    console.error(`\ndraw parity FAILED - ${drifted.length + unknown.length} problem(s). A declaration shared by the renderers must be identical in each, or say in scripts/draw-parity.allow.json why it cannot be.`);
    process.exit(1);
}
console.log(`draw parity: ${gated.length} shared declarations agree across the renderers, ${Object.keys(allow).length} differ for a declared reason, ${single.length} belong to one renderer`);
