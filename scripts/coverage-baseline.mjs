#!/usr/bin/env node
// The measured coverage of every package suite, recorded so a change can be held to it.
//
// A refactor, and above all a change of test runner, must not quietly lose coverage: the same tests
// should still run and still reach the same code. This records what each suite reaches today and
// compares a later run against it.
//
//   node scripts/coverage-baseline.mjs           compare the last run's results with the baseline
//   node scripts/coverage-baseline.mjs --save    record the last run's results as the new baseline
//
// It reads what the suites already leave behind - coverage/coverage-summary.json and
// test-results/*.json beside each package - so it needs a `npm test` at the root first and never
// runs a suite itself. A package whose numbers fell, or which lost tests, fails the comparison; one
// that improved is reported and does not, because the baseline is a floor, not a target.
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const DEV = join(ROOT, "packages", "dev");
const BASELINE = join(DEV, "coverage-baseline.json");
const COLUMNS = ["lines", "branches", "functions", "statements"];
const save = process.argv.includes("--save");

const readJson = (p) => (existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : null);

// Every runner writes one JSON file per run into test-results/, named for the runner, so this reads
// whichever is there rather than assuming which one produced it. The most recently written wins:
// a package that changed runner leaves the previous runner's file behind, and reading that one
// would report the old run's numbers as though they were this one's.
const testCounts = (dir) => {
    const d = join(dir, "test-results");
    if (!existsSync(d)) return null;
    const candidates = readdirSync(d).filter((n) => n.endsWith(".json"))
        .map((n) => ({ n, at: statSync(join(d, n)).mtimeMs }))
        .sort((a, b) => b.at - a.at);
    for (const { n } of candidates) {
        const j = readJson(join(d, n));
        if (j && typeof j.numTotalTests === "number") {
            return { runner: n.replace(/\.json$/, ""), tests: j.numTotalTests, suites: (j.testResults || []).length };
        }
    }
    return null;
};

const measure = () => {
    const out = {};
    for (const name of readdirSync(DEV).sort()) {
        const dir = join(DEV, name);
        if (!existsSync(join(dir, "package.json"))) continue;
        const summary = readJson(join(dir, "coverage", "coverage-summary.json"));
        const counts = testCounts(dir);
        if (!summary && !counts) continue;
        const entry = {};
        if (counts) Object.assign(entry, counts);
        if (summary?.total) for (const c of COLUMNS) entry[c] = summary.total[c].pct;
        out[name] = entry;
    }
    return out;
};

const current = measure();

if (save) {
    writeFileSync(BASELINE, JSON.stringify({
        note: "Measured coverage and test counts per package. A floor, not a target: it may rise, never fall. Rewrite it with --save only to record a deliberate, reviewed change - and never to make a drop go away. Two cases are not a drop and do need a re-measure. A change of coverage tool: percentages from different instruments count different things. And the deletion of covered dead code: removing lines the tests did reach lowers a ratio that sits above 50% even though nothing stopped being tested, so keeping dead code to protect a number is the worse trade. Both have to be argued in the change that re-records the floor, and the test counts here are the check that nothing was quietly lost.",
        measured: new Date().toISOString().slice(0, 10),
        packages: current,
    }, null, 4) + "\n");
    console.log(`recorded ${Object.keys(current).length} packages`);
    process.exit(0);
}

const baseline = readJson(BASELINE);
if (!baseline) { console.error(`no baseline yet - run with --save after a full test run`); process.exit(1); }

const problems = [];
const rows = [];
for (const [name, was] of Object.entries(baseline.packages)) {
    const now = current[name];
    if (!now) { problems.push(`${name}: left no results at all`); continue; }
    if (was.tests !== undefined && now.tests !== undefined && now.tests < was.tests) {
        problems.push(`${name}: ${was.tests} tests before, ${now.tests} now`);
    }
    const moved = [];
    for (const c of COLUMNS) {
        if (was[c] === undefined || now[c] === undefined) continue;
        const delta = +(now[c] - was[c]).toFixed(2);
        if (delta < 0) problems.push(`${name}: ${c} ${was[c]}% before, ${now[c]}% now`);
        if (delta !== 0) moved.push(`${c} ${delta > 0 ? "+" : ""}${delta}`);
    }
    const runner = was.runner && now.runner && was.runner !== now.runner ? ` ${was.runner}->${now.runner}` : "";
    rows.push(`  ${name.padEnd(18)} ${String(now.tests ?? "-").padStart(5)} tests${runner}${moved.length ? `  ${moved.join(", ")}` : "  unchanged"}`);
}
console.log(`coverage against the baseline of ${baseline.measured}:\n${rows.join("\n")}`);
if (problems.length) {
    console.error(`\ncoverage or tests fell:\n  ${problems.join("\n  ")}`);
    process.exit(1);
}
console.log(`\nno package lost tests or coverage`);
