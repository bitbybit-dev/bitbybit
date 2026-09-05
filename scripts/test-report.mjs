#!/usr/bin/env node
// One report over every test suite of the repository.
//
// Each runner writes its results as JSON into a test-results/ folder next to the code it tested
// (jest and vitest share one shape, Playwright has its own), and the coverage tools leave
// coverage/coverage-summary.json beside it. This script collects those files, renders one markdown
// report - a table per suite, the failures with their messages, the skipped tests, the slowest files -
// and writes it to stdout and, on GitHub Actions, to the job summary of the run.
//
//   node scripts/test-report.mjs [--root DIR] [--expect GLOB]... [--title TEXT]
//
// --expect names directories (one `*` per path segment) whose package.json has a `test` or `test-c`
// script; each must have left results, so a suite that silently stopped running is reported and
// fails the step. Exit code 1 on any failed test or missing expected suite, 0 otherwise.
import { appendFileSync, existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const SKIP_DIRS = new Set(["node_modules", ".git", "dist", "coverage", "docs", "examples", ".angular", ".cache", "build", "out", ".pnpm", "playwright-report"]);
const MAX_DEPTH = 8;
const RESULTS_DIR = "test-results";
const MAX_MESSAGE_LINES = 60;

const options = { root: process.cwd(), expect: [], title: "Test report" };
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--root") options.root = path.resolve(argv[++i]);
    else if (a === "--expect") options.expect.push(argv[++i]);
    else if (a === "--title") options.title = argv[++i];
    else { console.error(`unknown argument ${a}`); process.exit(2); }
}

// Suites are named by their path from the working directory (the repository root in CI), so a
// report over one unit still says which unit it is.
const rel = (p) => {
    const fromCwd = path.relative(process.cwd(), p);
    const r = fromCwd.startsWith("..") ? path.relative(options.root, p) : fromCwd;
    return r.split(path.sep).join("/") || ".";
};
const ANSI = new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, "g");
const stripAnsi = (s) => String(s ?? "").replace(ANSI, "");
const escapeHtml = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const fmtMs = (ms) => {
    if (!Number.isFinite(ms) || ms < 0) return "-";
    if (ms < 1000) return `${Math.round(ms)} ms`;
    const s = ms / 1000;
    if (s < 60) return `${s.toFixed(1)} s`;
    const m = Math.floor(s / 60);
    return `${m} min ${Math.round(s - m * 60)} s`;
};
const fmtPct = (n) => (typeof n === "number" ? `${n.toFixed(1)}%` : "-");
const fmtN = (n) => n.toLocaleString("en-US");

function findResultFiles(dir, depth = 0) {
    const out = [];
    let entries;
    try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return out; }
    for (const e of entries) {
        if (!e.isDirectory() || SKIP_DIRS.has(e.name)) continue;
        const full = path.join(dir, e.name);
        if (e.name === RESULTS_DIR) {
            for (const f of readdirSync(full)) if (f.endsWith(".json")) out.push(path.join(full, f));
        } else if (depth < MAX_DEPTH) {
            out.push(...findResultFiles(full, depth + 1));
        }
    }
    return out;
}

function fromJestLike(json, suiteDir) {
    const suite = { files: 0, tests: 0, passed: 0, failed: 0, skipped: 0, durationMs: 0, failures: [], skippedTests: [], fileTimes: [] };
    let start = Number.isFinite(json.startTime) ? json.startTime : Infinity;
    let end = -Infinity;
    for (const tr of json.testResults) {
        suite.files++;
        const file = path.isAbsolute(tr.name) ? path.relative(suiteDir, tr.name).split(path.sep).join("/") : tr.name;
        const s = tr.perfStats?.start ?? tr.startTime;
        const e = tr.perfStats?.end ?? tr.endTime;
        if (Number.isFinite(s)) start = Math.min(start, s);
        if (Number.isFinite(e)) end = Math.max(end, e);
        if (Number.isFinite(s) && Number.isFinite(e)) suite.fileTimes.push({ file, ms: e - s });
        let failedHere = 0;
        for (const a of tr.assertionResults ?? []) {
            suite.tests++;
            const name = [...(a.ancestorTitles ?? []), a.title].filter(Boolean).join(" › ") || a.fullName;
            if (a.status === "passed") suite.passed++;
            else if (a.status === "failed") {
                suite.failed++;
                failedHere++;
                suite.failures.push({ file, name, message: (a.failureMessages ?? []).map(stripAnsi).join("\n\n") });
            } else {
                suite.skipped++;
                suite.skippedTests.push({ file, name, status: a.status });
            }
        }
        if (tr.status === "failed" && failedHere === 0) {
            suite.tests++;
            suite.failed++;
            suite.failures.push({ file, name: "(the file failed to run)", message: stripAnsi(tr.message || tr.failureMessage || "") });
        }
    }
    suite.durationMs = Number.isFinite(start) && Number.isFinite(end) && end > start ? end - start : suite.fileTimes.reduce((t, f) => t + f.ms, 0);
    return suite;
}

function fromPlaywright(json) {
    const suite = { files: 0, tests: 0, passed: 0, failed: 0, skipped: 0, durationMs: json.stats?.duration ?? 0, failures: [], skippedTests: [], fileTimes: [] };
    const perFile = new Map();
    const walk = (s, titles) => {
        for (const spec of s.specs ?? []) {
            const file = spec.file || s.file || "?";
            const name = [...titles, spec.title].filter(Boolean).join(" › ");
            for (const t of spec.tests ?? []) {
                suite.tests++;
                const ms = (t.results ?? []).reduce((a, r) => a + (r.duration ?? 0), 0);
                perFile.set(file, (perFile.get(file) ?? 0) + ms);
                if (t.status === "expected" || t.status === "flaky") suite.passed++;
                else if (t.status === "skipped") {
                    suite.skipped++;
                    suite.skippedTests.push({ file, name, status: "skipped" });
                } else {
                    suite.failed++;
                    const errors = (t.results ?? []).flatMap((r) => r.errors ?? (r.error ? [r.error] : [])).map((e) => stripAnsi(e.message ?? e.value ?? ""));
                    suite.failures.push({ file, name: t.projectName ? `${name} [${t.projectName}]` : name, message: errors.join("\n\n") });
                }
                if (t.status === "flaky") suite.skippedTests.push({ file, name: `${name} (passed on retry)`, status: "flaky" });
            }
        }
        for (const child of s.suites ?? []) walk(child, s.title && s.title !== s.file ? [...titles, s.title] : titles);
    };
    for (const top of json.suites ?? []) walk(top, []);
    suite.files = perFile.size;
    suite.fileTimes = [...perFile].map(([file, ms]) => ({ file, ms }));
    return suite;
}

// Coverage counts only when the same run wrote it: a summary left by an earlier run must not be
// read as this run's.
const SAME_RUN_MS = 15 * 60 * 1000;
function readCoverage(dir, resultsWrittenAt) {
    const file = path.join(dir, "coverage", "coverage-summary.json");
    if (!existsSync(file)) return null;
    if (Math.abs(statSync(file).mtimeMs - resultsWrittenAt.getTime()) > SAME_RUN_MS) return null;
    try {
        const t = JSON.parse(readFileSync(file, "utf8")).total;
        return { lines: t.lines?.pct, branches: t.branches?.pct, functions: t.functions?.pct, statements: t.statements?.pct };
    } catch {
        return null;
    }
}

function collect() {
    const suites = [];
    for (const file of findResultFiles(options.root).sort()) {
        let json;
        try { json = JSON.parse(readFileSync(file, "utf8")); } catch { continue; }
        const suiteDir = path.dirname(path.dirname(file));
        let parsed = null;
        if (Array.isArray(json.testResults) && typeof json.numTotalTests === "number") parsed = fromJestLike(json, suiteDir);
        else if (json.config && Array.isArray(json.suites)) parsed = fromPlaywright(json);
        if (!parsed) continue;
        suites.push({ dir: rel(suiteDir), absDir: suiteDir, runner: path.basename(file, ".json"), writtenAt: statSync(file).mtime, ...parsed });
    }
    for (const s of suites) {
        const siblings = suites.filter((o) => o.dir === s.dir);
        s.coverage = siblings.length === 1 || ["jest", "vitest"].includes(s.runner) ? readCoverage(s.absDir, s.writtenAt) : null;
    }
    return suites;
}

// One `*` per path segment; a match counts when its package.json has a test or test-c script.
function expand(pattern) {
    let dirs = [options.root];
    for (const seg of pattern.split("/")) {
        if (!seg || seg === ".") continue;
        const next = [];
        for (const d of dirs) {
            if (seg === "*") {
                try {
                    for (const e of readdirSync(d, { withFileTypes: true })) if (e.isDirectory() && !SKIP_DIRS.has(e.name)) next.push(path.join(d, e.name));
                } catch { /* not a directory */ }
            } else if (existsSync(path.join(d, seg))) next.push(path.join(d, seg));
        }
        dirs = next;
    }
    return dirs.filter((d) => {
        try {
            const scripts = JSON.parse(readFileSync(path.join(d, "package.json"), "utf8")).scripts ?? {};
            return "test" in scripts || "test-c" in scripts;
        } catch {
            return false;
        }
    });
}

function render(suites, missing) {
    const total = { files: 0, tests: 0, passed: 0, failed: 0, skipped: 0, durationMs: 0 };
    const rows = [];
    for (const s of suites) {
        for (const k of Object.keys(total)) total[k] += s[k];
        const icon = s.failed ? "❌" : "✅";
        const cov = s.coverage ? `${fmtPct(s.coverage.lines)} / ${fmtPct(s.coverage.branches)}` : "";
        rows.push(`| ${icon} \`${s.dir}\` · ${s.runner} | ${fmtN(s.files)} | ${fmtN(s.tests)} | ${fmtN(s.passed)} | ${fmtN(s.failed)} | ${fmtN(s.skipped)} | ${fmtMs(s.durationMs)} | ${cov} |`);
    }
    for (const d of missing) rows.push(`| ⚠️ \`${d}\` | no results | | | | | | |`);
    const out = [`## ${options.title}`, ""];
    if (!suites.length && !missing.length) {
        out.push(`No test results were found under \`${options.root}\` (looked for \`${RESULTS_DIR}/*.json\`).`, "");
        return out.join("\n");
    }
    out.push("| Suite | Files | Tests | Passed | Failed | Skipped | Time | Coverage lines / branches |", "|---|--:|--:|--:|--:|--:|--:|--:|", ...rows);
    if (suites.length > 1) out.push(`| **Total** | **${fmtN(total.files)}** | **${fmtN(total.tests)}** | **${fmtN(total.passed)}** | **${fmtN(total.failed)}** | **${fmtN(total.skipped)}** | **${fmtMs(total.durationMs)}** | |`);
    out.push("");
    const failures = suites.flatMap((s) => s.failures.map((f) => ({ ...f, suite: s.dir })));
    if (failures.length) {
        out.push(`### Failures (${failures.length})`, "");
        for (const f of failures) {
            const lines = f.message.split("\n");
            const body = lines.length > MAX_MESSAGE_LINES ? [...lines.slice(0, MAX_MESSAGE_LINES), `... ${lines.length - MAX_MESSAGE_LINES} more lines`] : lines;
            out.push("<details open>", `<summary>❌ <code>${f.suite}</code> · ${escapeHtml(f.file)} › ${escapeHtml(f.name)}</summary>`, "", "```", ...body, "```", "</details>", "");
        }
    }
    const skipped = suites.flatMap((s) => s.skippedTests.map((t) => ({ ...t, suite: s.dir })));
    if (skipped.length) {
        out.push("<details>", `<summary>Skipped tests (${skipped.length})</summary>`, "");
        for (const t of skipped) out.push(`- \`${t.suite}\` · ${t.file} › ${t.name}${t.status && t.status !== "skipped" ? ` (${t.status})` : ""}`);
        out.push("", "</details>", "");
    }
    const slow = suites.flatMap((s) => s.fileTimes.map((f) => ({ ...f, suite: s.dir }))).sort((a, b) => b.ms - a.ms).slice(0, 8);
    if (slow.length) {
        out.push("<details>", "<summary>Slowest test files</summary>", "");
        for (const f of slow) out.push(`- ${fmtMs(f.ms)} · \`${f.suite}\` · ${f.file}`);
        out.push("", "</details>", "");
    }
    if (missing.length) out.push(`⚠️ ${missing.length === 1 ? "One expected suite" : `${missing.length} expected suites`} left no results: ${missing.map((d) => `\`${d}\``).join(", ")}.`, "");
    return out.join("\n");
}

const suites = collect();
const expected = options.expect.flatMap(expand).map(rel);
const missing = expected.filter((d) => !suites.some((s) => s.dir === d));
const report = render(suites, missing);
process.stdout.write(report + "\n");
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, report + "\n");
process.exit(suites.some((s) => s.failed) || missing.length ? 1 : 0);
