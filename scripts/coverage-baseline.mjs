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
            return { runner: n.replace(/\.json$/, ""), tests: j.numTotalTests, suites: (j.testResults || []).length, at: statSync(join(d, n)).mtimeMs };
        }
    }
    return null;
};

const measure = () => {
    const out = {};
    for (const name of readdirSync(DEV).sort()) {
        const dir = join(DEV, name);
        if (!existsSync(join(dir, "package.json"))) continue;
        const summaryPath = join(dir, "coverage", "coverage-summary.json");
        const summary = readJson(summaryPath);
        const counts = testCounts(dir);
        if (!summary && !counts) continue;
        const entry = {};
        if (counts) Object.assign(entry, counts);
        if (summary?.total) for (const c of COLUMNS) entry[c] = summary.total[c].pct;
        if (summary?.total) entry.counts = Object.fromEntries(COLUMNS.map((c) => [c, { covered: summary.total[c].covered, total: summary.total[c].total }]));
        // Kept out of the record; only the comparison uses them, to tell a coverage report written
        // by this run from one left behind by an earlier one.
        entry.at = counts?.at;
        entry.coverageAt = summary ? statSync(summaryPath).mtimeMs : undefined;
        out[name] = entry;
    }
    return out;
};

const current = measure();
const RECORDED = new Set(["runner", "tests", "suites", ...COLUMNS]);
const HISTORY_KEPT = 24;

/** Coverage over every package at once, summed rather than averaged, plus the run's test count. */
const overall = (packages) => {
    const out = { tests: 0 };
    for (const entry of Object.values(packages)) out.tests += entry.tests ?? 0;
    for (const c of COLUMNS) {
        let covered = 0, total = 0;
        for (const entry of Object.values(packages)) {
            const counts = entry.counts?.[c];
            if (!counts) continue;
            covered += counts.covered; total += counts.total;
        }
        if (total > 0) out[c] = +((covered / total) * 100).toFixed(2);
    }
    return out;
};
const forRecord = (entry) => Object.fromEntries(Object.entries(entry).filter(([k, v]) => RECORDED.has(k) && v !== undefined));

if (save) {
    // A floor may not shrink by omission. A partial run - one suite crashed, or only one package was
    // run - measures fewer packages than the baseline holds, and writing that would drop the missing
    // ones out of the gate silently and for good.
    const previous = readJson(BASELINE);
    const dropped = previous ? Object.keys(previous.packages).filter((name) => !current[name]) : [];
    if (dropped.length) {
        console.error(`refusing to record a baseline that drops ${dropped.join(", ")}: no results for ${dropped.length === 1 ? "it" : "them"} in this run.`);
        console.error("Run the full suite first. A package that should genuinely leave the floor is removed from coverage-baseline.json by hand, with the reason.");
        process.exit(1);
    }
    writeFileSync(BASELINE, JSON.stringify({
        note: "Measured coverage and test counts per package. A floor, not a target: it may rise, never fall. Rewrite it with --save only to record a deliberate, reviewed change - and never to make a drop go away. Two cases are not a drop and do need a re-measure. A change of coverage tool: percentages from different instruments count different things. And the deletion of covered dead code: removing lines the tests did reach lowers a ratio that sits above 50% even though nothing stopped being tested, so keeping dead code to protect a number is the worse trade. Both have to be argued in the change that re-records the floor, and the test counts here are the check that nothing was quietly lost.",
        measured: new Date().toISOString().slice(0, 10),
        // The floors this one replaced, newest last and bounded, so the report can show which way
        // coverage has been going without a deep clone or a second file to keep in step.
        history: [...(previous?.history ?? []), { measured: new Date().toISOString().slice(0, 10), ...overall(current) }].slice(-HISTORY_KEPT),
        packages: Object.fromEntries(Object.entries(current).map(([name, entry]) => [name, forRecord(entry)])),
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
    // A coverage report much older than the run that sits beside it is the previous run's, and its
    // numbers say nothing about this one.
    const STALE_AFTER_MS = 15 * 60 * 1000;
    if (now.at && now.coverageAt && now.at - now.coverageAt > STALE_AFTER_MS) {
        problems.push(`${name}: the coverage report predates this run's results by more than 15 minutes - rerun its suite with coverage`);
        continue;
    }
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
