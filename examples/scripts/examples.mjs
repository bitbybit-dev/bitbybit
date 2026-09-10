#!/usr/bin/env node
// Runs every example the way a consumer would - install from the registry, build, audit - and
// reports each one on its own, so one broken example names itself instead of hiding the rest.
//
//   node scripts/examples.mjs list                     every example found, and why any is skipped
//   node scripts/examples.mjs install [--only <part>]  npm ci in each (npm install where no lockfile)
//   node scripts/examples.mjs build   [--only <part>]  npm run build in each that has a build script
//   node scripts/examples.mjs verify  [--only <part>]  install, then build
//   node scripts/examples.mjs audit   [--only <part>]  npm audit at the moderate level, lockfile only
//
// `audit` is npm's view and is not the whole picture: npm resolves advisories from its own feed,
// which has diverged from the database Dependabot reads - multer@1.4.5-lts.2 reported "found 0
// vulnerabilities" here while GitHub held fifteen advisories against it. ../scripts/check-advisories.mjs
// covers that gap and runs beside this one; neither replaces the other.
//   node scripts/examples.mjs refresh [--only <part>]  move each lockfile to the newest versions its manifest allows, then apply audit fixes
//
// Examples are found by scripts/discover.mjs, which the local lane shares: any directory here with
// a package.json, generated output and node_modules aside. verify.config.json lists the ones to
// skip, each with a reason, and the frameworks whose builds are too heavy for every run: those
// install on every run and build only with --heavy. A run exits non-zero when any example failed;
// per-example logs go to .verify-logs/.
import { spawnSync } from "node:child_process";
import { appendFileSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { ROOT, selected } from "./discover.mjs";

const LOGS = path.join(ROOT, ".verify-logs");

const args = process.argv.slice(2);
const command = args[0];
const heavy = args.includes("--heavy");

const examples = selected(args);

function run(example, step, cmd, cmdArgs, { failureIsInformation = false } = {}) {
    const log = path.join(LOGS, `${example.path.replaceAll("/", "__")}.${step}.log`);
    mkdirSync(LOGS, { recursive: true });
    const started = Date.now();
    const r = spawnSync(cmd, cmdArgs, { cwd: path.join(ROOT, example.path), encoding: "utf8", env: { ...process.env, CI: "1", NO_COLOR: "1" } });
    writeFileSync(log, `$ ${cmd} ${cmdArgs.join(" ")}\n${r.stdout ?? ""}${r.stderr ?? ""}`);
    const seconds = ((Date.now() - started) / 1000).toFixed(0);
    const ok = r.status === 0;
    console.log(`${ok ? "ok  " : failureIsInformation ? "note" : "FAIL"}  ${step.padEnd(8)} ${example.path}  (${seconds}s)`);
    if (!ok && !failureIsInformation) console.log((r.stdout + r.stderr).split("\n").slice(-25).map((l) => `        ${l}`).join("\n"));
    return { example: example.path, step, ok, seconds, log };
}

const steps = {
    install: (e) => run(e, "install", "npm", e.lockfile ? ["ci", "--no-audit", "--no-fund"] : ["install", "--no-audit", "--no-fund"]),
    build: (e) => {
        if (!e.build) return { example: e.path, step: "build", ok: true, seconds: "0", note: "no build script" };
        if (e.heavy && !heavy) return { example: e.path, step: "build", ok: true, seconds: "0", note: "heavy framework, built only with --heavy" };
        return run(e, "build", "npm", ["run", "build"]);
    },
    audit: (e) => {
        if (!e.lockfile) return { example: e.path, step: "audit", ok: true, seconds: "0", note: "no lockfile" };
        return run(e, "audit", "npm", ["audit", "--package-lock-only", "--audit-level=moderate"]);
    },
    refresh: (e) => {
        if (!e.lockfile) return { example: e.path, step: "refresh", ok: true, seconds: "0", note: "no lockfile" };
        const first = run(e, "refresh", "npm", ["update", "--package-lock-only", "--no-audit", "--no-fund"]);
        if (!first.ok) return first;
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
    for (const e of examples) console.log(`${e.skip ? "skip" : "run "}  ${e.path}${e.lockfile ? "" : "  (no lockfile)"}${e.build ? "" : "  (no build)"}${e.heavy ? "  (heavy)" : ""}${e.skip ? `  - ${e.skip}` : ""}`);
    process.exit(0);
}

const results = [];
for (const e of examples) {
    if (e.skip) { console.log(`skip  ${e.path} - ${e.skip}`); continue; }
    for (const step of plans[command]) {
        const r = steps[step](e);
        results.push(r);
        if (!r.ok) break;
    }
}

const failed = results.filter((r) => !r.ok);
const summary = [
    `| Example | Step | Result | Time |`,
    `| --- | --- | --- | --- |`,
    ...results.map((r) => `| ${r.example} | ${r.step} | ${r.ok ? (r.note ? `skipped (${r.note})` : "ok") : "FAILED"} | ${r.seconds}s |`),
].join("\n");
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `## Examples - ${command}\n\n${summary}\n\n`);
console.log(`\n${results.length - failed.length} step(s) passed, ${failed.length} failed${failed.length ? ":\n  " + failed.map((r) => `${r.example} (${r.step}) - see ${path.relative(ROOT, r.log)}`).join("\n  ") : ""}`);
process.exit(failed.length ? 1 : 0);
