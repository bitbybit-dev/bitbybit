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
// --expect names directories (one `*` per path segment) whose package.json has a `test` or
// `test:coverage` script; each must have left results, so a suite that silently stopped running is
// reported and fails the step. Exit code 1 on any failed test or missing expected suite, 0 otherwise.
//
// --baseline points at the recorded coverage floor, and the report then shows what each suite moved
// against it rather than a bare percentage. --logo is a repository-relative image path used to head
// the report; the URL is built from the run's own commit, so the report on a run always shows the
// logo that commit carried, and nothing is fetched from anywhere else.
import { appendFileSync, existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const SKIP_DIRS = new Set(["node_modules", ".git", "dist", "coverage", "docs", "examples", ".angular", ".cache", "build", "out", ".pnpm", "playwright-report"]);
const MAX_DEPTH = 8;
const RESULTS_DIR = "test-results";
const MAX_MESSAGE_LINES = 60;

const options = { root: process.cwd(), expect: [], title: "Test report", baseline: null, logo: null };
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--root") options.root = path.resolve(argv[++i]);
    else if (a === "--expect") options.expect.push(argv[++i]);
    else if (a === "--title") options.title = argv[++i];
    else if (a === "--baseline") options.baseline = path.resolve(argv[++i]);
    else if (a === "--logo") options.logo = argv[++i];
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
        const counts = (m) => (t[m] ? { pct: t[m].pct, covered: t[m].covered, total: t[m].total } : null);
        return { lines: t.lines?.pct, branches: t.branches?.pct, functions: t.functions?.pct, statements: t.statements?.pct, counts: { lines: counts("lines"), branches: counts("branches"), functions: counts("functions"), statements: counts("statements") } };
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

// A bar drawn from block characters rather than an image or a badge service: it renders the same in
// the terminal and in a run summary, needs nothing fetched, and stays readable when a screen reader
// reaches it because the number is right beside it.
const BAR_WIDTH = 12;
function bar(pct) {
    if (pct === undefined || pct === null || Number.isNaN(pct)) return "";
    const filled = Math.round((Math.max(0, Math.min(100, pct)) / 100) * BAR_WIDTH);
    return "\u2588".repeat(filled) + "\u2591".repeat(BAR_WIDTH - filled);
}

/** How a suite moved against the recorded floor: the sign matters more than the digits. */
function movement(now, was) {
    if (was === undefined || now === undefined) return "";
    const delta = +(now - was).toFixed(2);
    if (delta === 0) return "=";
    return `${delta > 0 ? "+" : ""}${delta}`;
}

/** The floor a run is measured against, keyed the way the suite directories are named. */
function readBaseline() {
    if (!options.baseline || !existsSync(options.baseline)) return null;
    try {
        const raw = JSON.parse(readFileSync(options.baseline, "utf8"));
        const byName = raw.packages ?? {};
        const parent = path.relative(options.root, path.dirname(options.baseline));
        const out = {};
        for (const [name, entry] of Object.entries(byName)) out[path.join(parent, name)] = entry;
        return { measured: raw.measured, history: raw.history ?? [], packages: out };
    } catch {
        return null;
    }
}

/** The image that heads the report, taken from the commit under test so it can never drift. */
function logoTag() {
    const { GITHUB_SERVER_URL: server, GITHUB_REPOSITORY: repo, GITHUB_SHA: sha } = process.env;
    if (!options.logo || !server || !repo || !sha) return null;
    return `<img src="${server}/${repo}/raw/${sha}/${options.logo}" height="36" alt="" />`;
}

/** Coverage summed across suites, so one large package cannot be averaged away by several small ones. */
function overallCoverage(suites) {
    const out = {};
    for (const metric of ["lines", "branches", "functions", "statements"]) {
        let covered = 0, total = 0;
        for (const s of suites) {
            const c = s.coverage?.counts?.[metric];
            if (!c || typeof c.total !== "number") continue;
            covered += c.covered; total += c.total;
        }
        if (total > 0) { out[metric] = +((covered / total) * 100).toFixed(2); (out.counts ??= {})[metric] = { covered, total }; }
    }
    return out;
}

/** A sparkline over a series, scaled to its own range so a flat run reads as flat. */
const SPARKS = "\u2581\u2582\u2583\u2584\u2585\u2586\u2587\u2588";
function sparkline(values) {
    const clean = values.filter((v) => typeof v === "number");
    if (clean.length < 2) return "";
    const min = Math.min(...clean), max = Math.max(...clean);
    const span = max - min;
    return clean.map((v) => SPARKS[span === 0 ? 3 : Math.min(SPARKS.length - 1, Math.floor(((v - min) / span) * SPARKS.length))]).join("");
}

// Facts about the codebase that a test count does not carry, each read from the file the tool that
// owns it writes, and each absent from the report when that file is not there. Deliberately nothing
// about dependency advisories: a public report is the wrong place to enumerate unpatched versions.
function qualitySignals(root) {
    const signals = [];

    const suppressions = path.join(root, "eslint-suppressions.json");
    if (existsSync(suppressions)) {
        try {
            const byFile = JSON.parse(readFileSync(suppressions, "utf8"));
            let count = 0, files = 0;
            for (const rules of Object.values(byFile)) {
                files++;
                for (const v of Object.values(rules)) count += v.count ?? 0;
            }
            signals.push(["Lint findings still suppressed", count === 0 ? "none" : `${fmtN(count)} in ${fmtN(files)} files`,
                "A ratchet: a new finding fails the build, and a suppression that is no longer needed fails it too, so this only goes down."]);
        } catch { /* not the shape we expect */ }
    }

    const baselines = findFiles(root, (name) => name === ".tsc-baseline.json");
    signals.push(["Type strictness", baselines.length === 0 ? "fully strict, no package exempt" : `${fmtN(baselines.length)} packages still on a baseline`,
        "Every package compiles under the whole strict set; a package that needed time carried a baseline until it reached zero."]);

    const reports = findFiles(root, (name) => name.endsWith(".api.md"), (dir) => path.basename(dir) === "etc");
    if (reports.length) {
        signals.push(["Public API surface pinned", `${fmtN(reports.length)} packages`,
            "The exported surface of each is committed as a report; changing it takes a deliberate update in the same commit."]);
    }
    return signals;
}

/** Files under root matching a predicate, skipping the directories no report should walk into. */
function findFiles(root, matches, dirMatches = null, depth = 0) {
    if (depth > MAX_DEPTH) return [];
    const out = [];
    let entries;
    try { entries = readdirSync(root, { withFileTypes: true }); } catch { return out; }
    for (const e of entries) {
        const full = path.join(root, e.name);
        if (e.isDirectory()) {
            if (SKIP_DIRS.has(e.name)) continue;
            out.push(...findFiles(full, matches, dirMatches, depth + 1));
        } else if (matches(e.name) && (!dirMatches || dirMatches(root))) {
            out.push(full);
        }
    }
    return out;
}

// What the repository is made of, counted the same way every time: a line is code unless it is blank
// or opens with a comment marker. Generated source is separated from hand-written because this
// repository generates a lot of it - the assembled inputs namespaces, the worker API layer, the SDK
// types - and counting it as authored would overstate both the code and how much of it is tested.
const GENERATED_MARKER = /generated by|do not edit/i;
const isTestFile = (p) => p.endsWith(".test.ts") || p.includes(`${path.sep}__mocks__${path.sep}`)
    || p.includes(`${path.sep}__test__${path.sep}`) || p.endsWith("unit-test-helper.ts");

function codebase(root) {
    const kinds = { source: { files: 0, code: 0, comment: 0 }, generated: { files: 0, code: 0, comment: 0 }, tests: { files: 0, code: 0, comment: 0 } };
    const walk = (dir, depth) => {
        if (depth > MAX_DEPTH) return;
        let entries;
        try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return; }
        for (const e of entries) {
            const full = path.join(dir, e.name);
            if (e.isDirectory()) {
                if (SKIP_DIRS.has(e.name) || e.name.startsWith(".")) continue;
                walk(full, depth + 1);
                continue;
            }
            if (!/\.(ts|mjs|cjs|js)$/.test(e.name) || e.name.endsWith(".d.ts")) continue;
            let text;
            try { text = readFileSync(full, "utf8"); } catch { continue; }
            const kind = isTestFile(full) ? "tests" : (GENERATED_MARKER.test(text.slice(0, 2000)) ? "generated" : "source");
            const b = kinds[kind];
            b.files++;
            for (const line of text.split("\n")) {
                const t = line.trim();
                if (!t) continue;
                if (t.startsWith("//") || t.startsWith("/*") || t.startsWith("*")) b.comment++;
                else b.code++;
            }
        }
    };
    walk(root, 0);
    return kinds;
}

function render(suites, missing) {
    const total = { files: 0, tests: 0, passed: 0, failed: 0, skipped: 0, durationMs: 0 };
    for (const s of suites) for (const k of Object.keys(total)) total[k] += s[k];

    const baseline = readBaseline();
    const logo = logoTag();
    const out = [];
    out.push(logo ? `${logo}\n\n## ${options.title}` : `## ${options.title}`, "");

    if (!suites.length && !missing.length) {
        out.push(`No test results were found under \`${options.root}\` (looked for \`${RESULTS_DIR}/*.json\`).`, "");
        return out.join("\n");
    }

    // The headline: what a reader wants before deciding whether to open anything.
    const overall = overallCoverage(suites);
    const green = total.failed === 0 && !missing.length;
    out.push(
        `### ${green ? "\u2705 All suites green" : "\u274c Something failed"}`,
        "",
        "| Tests | Passed | Failed | Skipped | Suites | Files | Time | Lines covered |",
        "|--:|--:|--:|--:|--:|--:|--:|--:|",
        `| **${fmtN(total.tests)}** | ${fmtN(total.passed)} | ${total.failed ? `**${fmtN(total.failed)}**` : "0"} | ${fmtN(total.skipped)} | ${fmtN(suites.length)} | ${fmtN(total.files)} | ${fmtMs(total.durationMs)} | ${overall.lines === undefined ? "-" : `**${fmtPct(overall.lines)}**`} |`,
        "",
    );

    if (overall.lines !== undefined) {
        out.push(
            "| Coverage, every suite together | Reached | Of | |",
            "|---|--:|--:|---|",
            ...["lines", "statements", "functions", "branches"]
                .filter((m) => overall[m] !== undefined)
                .map((m) => {
                    const c = overall.counts?.[m];
                    return `| ${m[0].toUpperCase()}${m.slice(1)} | ${fmtPct(overall[m])} | ${c ? `${fmtN(c.covered)} of ${fmtN(c.total)}` : ""} | \`${bar(overall[m])}\` |`;
                }),
            "",
            "Those totals are what the packages ask coverage to measure: executable lines inside each",
            "package's declared scope. They are not the size of the codebase, which is below.",
            "",
            "```mermaid",
            "pie showData",
            `    title Lines of the packages, ${fmtPct(overall.lines)} reached`,
            `    "Reached by a test" : ${overall.lines.toFixed(2)}`,
            `    "Not reached" : ${(100 - overall.lines).toFixed(2)}`,
            "```",
            "",
        );
    }

    // Where the floor has been, so a reader sees the direction and not only today's number.
    const history = baseline?.history ?? [];
    if (history.length > 1) {
        const spark = (metric) => sparkline(history.map((h) => h[metric]));
        const move = (metric) => movement(history[history.length - 1]?.[metric], history[0]?.[metric]);
        out.push(
            "<details>",
            `<summary>How the floor has moved (${history.length} recordings, ${history[0].measured} to ${history[history.length - 1].measured})</summary>`,
            "",
            "| | Trend | First | Latest | Change |",
            "|---|---|--:|--:|--:|",
            ...["lines", "branches", "functions", "statements"]
                .filter((m) => history.some((h) => h[m] !== undefined))
                .map((m) => `| ${m[0].toUpperCase()}${m.slice(1)} | \`${spark(m)}\` | ${fmtPct(history[0][m])} | ${fmtPct(history[history.length - 1][m])} | ${move(m)} |`),
            `| Tests | \`${spark("tests")}\` | ${fmtN(history[0].tests)} | ${fmtN(history[history.length - 1].tests)} | ${move("tests")} |`,
            "",
            "</details>",
            "",
        );
    }

    const code = codebase(options.root);
    const ratio = code.source.code ? (code.tests.code / code.source.code).toFixed(2) : null;
    out.push(
        "| The codebase | Files | Code lines | Comment lines |",
        "|---|--:|--:|--:|",
        `| Hand-written source | ${fmtN(code.source.files)} | ${fmtN(code.source.code)} | ${fmtN(code.source.comment)} |`,
        `| Generated source | ${fmtN(code.generated.files)} | ${fmtN(code.generated.code)} | ${fmtN(code.generated.comment)} |`,
        `| Unit tests | ${fmtN(code.tests.files)} | ${fmtN(code.tests.code)} | ${fmtN(code.tests.comment)} |`,
        "",
        ratio ? `That is **${ratio} lines of test per line of hand-written source**. The comment column is large on purpose: the API documentation is a functional input, and the visual editors are generated from it.` : "",
        "",
    );


    // Per suite, with the movement against the floor where there is one to compare with.
    const header = ["| Suite | Tests | Time | Lines | | Branches | Functions |"];
    const align = ["|---|--:|--:|--:|---|--:|--:|"];
    if (baseline) { header[0] += " Moved |"; align[0] += "---|"; }
    const rows = [];
    for (const s of [...suites].sort((a, b) => a.dir.localeCompare(b.dir))) {
        const icon = s.failed ? "\u274c" : "\u2705";
        const cov = s.coverage;
        const was = baseline?.packages[s.dir];
        const moved = baseline
            ? ` ${["lines", "branches", "functions", "statements"]
                .map((m) => movement(cov?.[m], was?.[m]))
                .filter((v) => v && v !== "=")
                .join(", ") || "="} |`
            : "";
        rows.push(`| ${icon} \`${s.dir}\` | ${fmtN(s.tests)}${s.failed ? ` (${fmtN(s.failed)} failed)` : ""} | ${fmtMs(s.durationMs)} | ${cov ? fmtPct(cov.lines) : "-"} | ${cov ? `\`${bar(cov.lines)}\`` : ""} | ${cov ? fmtPct(cov.branches) : "-"} | ${cov ? fmtPct(cov.functions) : "-"} |${moved}`);
    }
    for (const d of missing) rows.push(`| \u26a0\ufe0f \`${d}\` | no results |${" |".repeat(baseline ? 6 : 5)}`);
    out.push(...header, ...align, ...rows, "");
    if (baseline?.measured) out.push(`Movement is against the floor recorded on ${baseline.measured}; a suite may rise and must not fall.`, "");

    const signals = qualitySignals(options.root);
    if (signals.length) {
        out.push("<details>", "<summary>Other quality signals</summary>", "", "| | | |", "|---|---|---|",
            ...signals.map(([name, value, why]) => `| **${name}** | ${value} | ${why} |`), "", "</details>", "");
    }

    const failures = suites.flatMap((s) => s.failures.map((f) => ({ ...f, suite: s.dir })));
    if (failures.length) {
        out.push(`### Failures (${failures.length})`, "");
        for (const f of failures) {
            const lines = f.message.split("\n");
            const body = lines.length > MAX_MESSAGE_LINES ? [...lines.slice(0, MAX_MESSAGE_LINES), `... ${lines.length - MAX_MESSAGE_LINES} more lines`] : lines;
            out.push("<details open>", `<summary>\u274c <code>${f.suite}</code> \u00b7 ${escapeHtml(f.file)} \u203a ${escapeHtml(f.name)}</summary>`, "", "```", ...body, "```", "</details>", "");
        }
    }
    const skipped = suites.flatMap((s) => s.skippedTests.map((t) => ({ ...t, suite: s.dir })));
    if (skipped.length) {
        out.push("<details>", `<summary>Skipped tests (${skipped.length})</summary>`, "");
        for (const t of skipped) out.push(`- \`${t.suite}\` \u00b7 ${t.file} \u203a ${t.name}${t.status && t.status !== "skipped" ? ` (${t.status})` : ""}`);
        out.push("", "</details>", "");
    }
    const slow = suites.flatMap((s) => s.fileTimes.map((f) => ({ ...f, suite: s.dir }))).sort((a, b) => b.ms - a.ms).slice(0, 8);
    if (slow.length) {
        out.push("<details>", "<summary>Slowest test files</summary>", "");
        for (const f of slow) out.push(`- ${fmtMs(f.ms)} \u00b7 \`${f.suite}\` \u00b7 ${f.file}`);
        out.push("", "</details>", "");
    }
    if (missing.length) out.push(`\u26a0\ufe0f ${missing.length === 1 ? "One expected suite" : `${missing.length} expected suites`} left no results: ${missing.map((d) => `\`${d}\``).join(", ")}.`, "");
    return out.join("\n");
}

const suites = collect();
const expected = options.expect.flatMap(expand).map(rel);
const missing = expected.filter((d) => !suites.some((s) => s.dir === d));
const report = render(suites, missing);
process.stdout.write(report + "\n");
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, report + "\n");
process.exit(suites.some((s) => s.failed) || missing.length ? 1 : 0);
