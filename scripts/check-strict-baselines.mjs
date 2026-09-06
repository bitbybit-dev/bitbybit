#!/usr/bin/env node
// Holds every package at zero strict errors. Each package typechecks with tsconfig.strict.json - its build
// config, whose shared base carries the whole strict set, with nothing emitted. While the packages were
// being ratcheted, each carried a .tsc-baseline.json recorded by tsc-baseline (`--ignoreMessages`: a
// message can embed an absolute path into the pnpm store, which would tie the hash to one machine), and
// this script held that baseline to the code in both directions: a fresh save had to match the committed
// file byte for byte, so the count could only go down. No package has a baseline any more, so the check
// reduces to "no errors": a package with errors and no baseline fails, and a baseline that reappears is
// still held to the code the same way, so the ratchet can restart for a single package if it ever must.
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const noComments = (text) => text.split("\n").filter((line) => !line.trimStart().startsWith("//")).join("\n");
const projects = JSON.parse(noComments(readFileSync(join(ROOT, "tsconfig.build.json"), "utf8"))).references
    .map((r) => join(ROOT, dirname(r.path)));
const scratch = mkdtempSync(join(tmpdir(), "bitbybit-strict-baselines-"));
process.on("exit", () => rmSync(scratch, { recursive: true, force: true }));

const stale = [];
let total = 0;
for (const dir of projects) {
    const name = relative(join(ROOT, "packages", "dev"), dir);
    const committed = join(dir, ".tsc-baseline.json");
    const tsc = spawnSync(join(ROOT, "node_modules", ".bin", "tsc"), ["-p", "tsconfig.strict.json", "--pretty", "false"], { cwd: dir, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
    const fresh = join(scratch, `${name}.json`);
    execFileSync(join(ROOT, "node_modules", ".bin", "tsc-baseline"), ["--ignoreMessages", "save", "-p", fresh], { cwd: dir, input: tsc.stdout, stdio: ["pipe", "ignore", "inherit"] });
    const count = (b) => Object.values(b.errors).reduce((n, e) => n + e.count, 0);
    // tsc-baseline writes nothing for a clean package: no errors means no file.
    const after = existsSync(fresh) ? JSON.parse(readFileSync(fresh, "utf8")) : { errors: {} };
    total += count(after);
    if (!existsSync(committed)) {
        if (count(after) === 0) continue;
        stale.push(`${name}: ${count(after)} strict errors and no .tsc-baseline.json - run \`npm run typecheck:strict:save\` there`);
        continue;
    }
    const before = JSON.parse(readFileSync(committed, "utf8"));
    if (count(after) === 0) { stale.push(`${name}: baseline ${count(before)} errors, code 0 - the package is strict; delete its .tsc-baseline.json`); continue; }
    if (readFileSync(committed, "utf8") !== readFileSync(fresh, "utf8")) {
        const gone = Object.keys(before.errors).filter((h) => !after.errors[h]).length;
        const added = Object.keys(after.errors).filter((h) => !before.errors[h]).length;
        stale.push(`${name}: baseline ${count(before)} errors, code ${count(after)} (${added} new hash${added === 1 ? "" : "es"}, ${gone} no longer occurring) - \`npm run typecheck:strict\` there shows the new ones; \`npm run typecheck:strict:save\` records a fix`);
    }
}
if (stale.length) {
    console.error(`strict baselines do not match the code:\n  ${stale.join("\n  ")}`);
    process.exit(1);
}
console.log(`strict baselines match the code in ${projects.length} packages (${total} errors still to fix)`);
