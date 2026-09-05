#!/usr/bin/env node
// Holds every package's strict baseline to what its code produces today, in both directions. Each
// package typechecks with tsconfig.strict.json - its build config plus the flags in
// tsconfig.base.cad-strict.json - and tsc-baseline records the errors in .tsc-baseline.json as a count
// per file and error code (`--ignoreMessages`: a message can embed an absolute path into the pnpm
// store, which would tie the hash to one machine), so the count can only go down: one more error of a
// code a file already has is new and fails, and an error that was fixed without
// `npm run typecheck:strict:save` leaves a stale entry, which fails here too, so every fix lands with
// the baseline that documents it. Saving is deterministic, which is what makes a byte comparison of a
// fresh save against the committed file the check.
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
    if (!existsSync(committed)) { stale.push(`${name}: no .tsc-baseline.json - run \`npm run typecheck:strict:save\` there`); continue; }
    const tsc = spawnSync(join(ROOT, "node_modules", ".bin", "tsc"), ["-p", "tsconfig.strict.json", "--pretty", "false"], { cwd: dir, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
    const fresh = join(scratch, `${name}.json`);
    execFileSync(join(ROOT, "node_modules", ".bin", "tsc-baseline"), ["--ignoreMessages", "save", "-p", fresh], { cwd: dir, input: tsc.stdout, stdio: ["pipe", "ignore", "inherit"] });
    const before = JSON.parse(readFileSync(committed, "utf8"));
    const after = JSON.parse(readFileSync(fresh, "utf8"));
    const count = (b) => Object.values(b.errors).reduce((n, e) => n + e.count, 0);
    total += count(after);
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
