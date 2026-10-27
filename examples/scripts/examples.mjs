#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { REPO, ROOT, selected } from "./discover.mjs";

const LOGS = path.join(ROOT, ".verify-logs");
const ALLOW_FILE = path.join(REPO, "scripts", "advisories.allow.json");
const AUDIT_RANK = { info: 0, low: 0, moderate: 1, high: 2, critical: 3 };
const allowed = new Set((existsSync(ALLOW_FILE) ? JSON.parse(readFileSync(ALLOW_FILE, "utf8")).allow ?? [] : []).map((a) => `${a.ghsa}|${a.package}`));

const args = process.argv.slice(2);
const command = args[0];
const heavy = args.includes("--heavy");

const examples = selected(args);

function lastLinesOnFailure(r) {
    return r.status === 0 ? [] : (r.stdout + r.stderr).split("\n").slice(-25);
}

function unallowedAdvisories(r) {
    let report;
    try {
        report = JSON.parse(r.stdout);
    } catch {
        return lastLinesOnFailure(r);
    }
    if (report.error) {
        return [JSON.stringify(report.error)];
    }
    const advisories = Object.values(report.vulnerabilities ?? {}).flatMap((v) => v.via.filter((via) => typeof via === "object"));
    const lines = advisories
        .filter((a) => (AUDIT_RANK[a.severity] ?? 0) >= AUDIT_RANK.moderate && !allowed.has(`${a.url.split("/").pop()}|${a.name}`))
        .map((a) => `${a.severity.padEnd(8)} ${a.name} ${a.range}  ${a.url.split("/").pop()}  ${a.title}`);
    return [...new Set(lines)];
}

function run(example, step, cmd, cmdArgs, { failureIsInformation = false, problemsOf = lastLinesOnFailure } = {}) {
    const log = path.join(LOGS, `${example.path.replaceAll("/", "__")}.${step}.log`);
    mkdirSync(LOGS, { recursive: true });
    const started = Date.now();
    const r = spawnSync(cmd, cmdArgs, { cwd: path.join(ROOT, example.path), encoding: "utf8", env: { ...process.env, CI: "1", NO_COLOR: "1" } });
    writeFileSync(log, `$ ${cmd} ${cmdArgs.join(" ")}\n${r.stdout ?? ""}${r.stderr ?? ""}`);
    const seconds = ((Date.now() - started) / 1000).toFixed(0);
    const problems = problemsOf(r);
    const ok = problems.length === 0;
    console.log(`${ok ? "ok  " : failureIsInformation ? "note" : "FAIL"}  ${step.padEnd(8)} ${example.path}  (${seconds}s)`);
    if (!ok && !failureIsInformation) {
        console.log(problems.map((l) => `        ${l}`).join("\n"));
    }
    return { example: example.path, step, ok, seconds, log };
}

const steps = {
    install: (e) => run(e, "install", "npm", e.lockfile ? ["ci", "--no-audit", "--no-fund"] : ["install", "--no-audit", "--no-fund"]),
    build: (e) => {
        if (!e.build) {
            return { example: e.path, step: "build", ok: true, seconds: "0", note: "no build script" };
        }
        if (e.heavy && !heavy) {
            return { example: e.path, step: "build", ok: true, seconds: "0", note: "heavy framework, built only with --heavy" };
        }
        return run(e, "build", "npm", ["run", "build"]);
    },
    audit: (e) => {
        if (!e.lockfile) {
            return { example: e.path, step: "audit", ok: true, seconds: "0", note: "no lockfile" };
        }
        return run(e, "audit", "npm", ["audit", "--package-lock-only", "--json"], { problemsOf: unallowedAdvisories });
    },
    refresh: (e) => {
        if (!e.lockfile) {
            return { example: e.path, step: "refresh", ok: true, seconds: "0", note: "no lockfile" };
        }
        const first = run(e, "refresh", "npm", ["update", "--package-lock-only", "--no-audit", "--no-fund"]);
        if (!first.ok) {
            return first;
        }
        const fix = run(e, "audit-fix", "npm", ["audit", "fix", "--package-lock-only", "--no-fund"], { failureIsInformation: true });
        return { ...fix, ok: true, note: fix.ok ? undefined : "advisories remain after audit fix; run audit to see which count" };
    },
};
const plans = { list: [], install: ["install"], build: ["build"], verify: ["install", "build"], audit: ["audit"], refresh: ["refresh"] };
if (!plans[command]) {
    console.error(`usage: examples.mjs <${Object.keys(plans).join("|")}> [--only <part>] [--heavy]`);
    process.exit(2);
}

if (command === "list") {
    for (const e of examples) {
        console.log(`${e.skip ? "skip" : "run "}  ${e.path}${e.lockfile ? "" : "  (no lockfile)"}${e.build ? "" : "  (no build)"}${e.heavy ? "  (heavy)" : ""}${e.skip ? `  - ${e.skip}` : ""}`);
    }
    process.exit(0);
}

const results = [];
for (const e of examples) {
    if (e.skip) { console.log(`skip  ${e.path} - ${e.skip}`); continue; }
    for (const step of plans[command]) {
        const r = steps[step](e);
        results.push(r);
        if (!r.ok) {
            break;
        }
    }
}

const failed = results.filter((r) => !r.ok);
const summary = [
    `| Example | Step | Result | Time |`,
    `| --- | --- | --- | --- |`,
    ...results.map((r) => `| ${r.example} | ${r.step} | ${r.ok ? (r.note ? `skipped (${r.note})` : "ok") : "FAILED"} | ${r.seconds}s |`),
].join("\n");
if (process.env.GITHUB_STEP_SUMMARY) {
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, `## Examples - ${command}\n\n${summary}\n\n`);
}
console.log(`\n${results.length - failed.length} step(s) passed, ${failed.length} failed${failed.length ? ":\n  " + failed.map((r) => `${r.example} (${r.step}) - see ${path.relative(ROOT, r.log)}`).join("\n  ") : ""}`);
process.exit(failed.length ? 1 : 0);
