import { createRequire } from "node:module";
import { expect } from "vitest";
import type { WorkerGlobalState } from "vitest";
import { ledgerReport } from "./embind-ledger";
import type { LedgerReportFile, LedgerReportMoment, LedgerRunFilters } from "./embind-ledger-types";

const unmocked = createRequire(import.meta.url);
const FOCUSED_TESTS = /\b(?:describe|suite|it|test)(?:\.\w+)*\.only\b/;
const QUOTED = /(["'`])(?:\\[\s\S]|(?!\1)[^\\])*\1/g;
const WRITTEN_ON_LOAD = "it was written when the file loaded and never after its last test, so the file stopped before its tests finished or every one of them was skipped";
const NO_SPECIFICATION = "the test runner names no specification for the file, so whether its run was filtered is unknown";

export function partialRunOf(filters: LedgerRunFilters, source: string): string | undefined {
    const { spec, config } = filters;
    if (spec === undefined) {
        return NO_SPECIFICATION;
    }
    const namePattern = spec.testNamePattern ?? config.testNamePattern;
    if (namePattern !== undefined) {
        return `the run picked tests by name (${String(namePattern)})`;
    }
    const lines = spec.testLocations ?? [];
    if (lines.length > 0) {
        return `the run picked tests by line (${lines.join(", ")})`;
    }
    if (spec.testIds !== undefined) {
        return "the run picked tests by id";
    }
    const tags = spec.testTagsFilter ?? config.tagsFilter ?? [];
    if (tags.length > 0) {
        return `the run picked tests by tag (${tags.join(", ")})`;
    }
    if (FOCUSED_TESTS.test(source.replace(QUOTED, "\"\""))) {
        return "the file focuses some of its tests with .only, so the others were skipped";
    }
    return undefined;
}

export function writeLedgerReport(moment: LedgerReportMoment): void {
    const fs = unmocked("node:fs") as typeof import("node:fs");
    const path = unmocked("node:path") as typeof import("node:path");
    const testPath = expect.getState().testPath;
    let root = testPath === undefined ? process.cwd() : path.dirname(testPath);
    while (!fs.existsSync(path.join(root, "package.json")) && path.dirname(root) !== root) {
        root = path.dirname(root);
    }
    const file = path.relative(root, testPath ?? "unknown");
    const folder = path.join(root, "test-results", "kernel-ledger");
    const partial = moment === "loaded" ? WRITTEN_ON_LOAD : partialOfThisRun(testPath, (source) => fs.readFileSync(source, "utf8"));
    const report: LedgerReportFile = partial === undefined ? { ...ledgerReport(file), complete: true } : { ...ledgerReport(file), complete: false, partial };
    fs.mkdirSync(folder, { recursive: true });
    fs.writeFileSync(path.join(folder, `${file.split(path.sep).join("__")}.json`), `${JSON.stringify(report, null, 2)}\n`);
}

function partialOfThisRun(testPath: string | undefined, read: (source: string) => string): string | undefined {
    const state: WorkerGlobalState | undefined = Reflect.get(globalThis, "__vitest_worker__");
    if (testPath === undefined || state === undefined) {
        return NO_SPECIFICATION;
    }
    const spec = state.ctx.files.find(candidate => candidate.filepath === testPath);
    return partialRunOf({ spec, config: state.config }, read(testPath));
}
