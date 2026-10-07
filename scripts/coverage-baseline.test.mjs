import { describe, it, afterEach } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT = join(dirname(fileURLToPath(import.meta.url)), "coverage-baseline.mjs");
const NETWORK = "BITBYBIT_MCP_NETWORK";
const created = [];

const summaryOf = (pct) => ({ total: Object.fromEntries(["lines", "branches", "functions", "statements"].map((c) => [c, { pct, covered: pct, total: 100 }])) });
const recorded = (pct, tests) => ({ runner: "vitest", tests, suites: 1, lines: pct, branches: pct, functions: pct, statements: pct });

function tree(packages, baseline) {
    const root = mkdtempSync(join(tmpdir(), "coverage-baseline-"));
    created.push(root);
    mkdirSync(join(root, "scripts"));
    cpSync(SCRIPT, join(root, "scripts", "coverage-baseline.mjs"));
    for (const [name, { pct, tests }] of Object.entries(packages)) {
        const dir = join(root, "packages", "dev", name);
        mkdirSync(join(dir, "coverage"), { recursive: true });
        mkdirSync(join(dir, "test-results"));
        writeFileSync(join(dir, "package.json"), "{}");
        writeFileSync(join(dir, "test-results", "vitest.json"), JSON.stringify({ numTotalTests: tests, testResults: [{}] }));
        writeFileSync(join(dir, "coverage", "coverage-summary.json"), JSON.stringify(summaryOf(pct)));
    }
    writeFileSync(join(root, "packages", "dev", "coverage-baseline.json"), JSON.stringify({ measured: "2026-01-01", history: [], packages: baseline }));
    return root;
}

function check(root, network, ...args) {
    const env = { ...process.env };
    delete env[NETWORK];
    if (network) {
        env[NETWORK] = "1";
    }
    const run = spawnSync(process.execPath, [join(root, "scripts", "coverage-baseline.mjs"), ...args], { env, encoding: "utf8" });
    return { code: run.status, output: `${run.stdout}${run.stderr}` };
}

afterEach(() => {
    created.splice(0).forEach((root) => rmSync(root, { recursive: true, force: true }));
});

describe("coverage-baseline", () => {
    it("should not compare the MCP suite's coverage while its network switch is off", () => {
        // Arrange
        const root = tree({ mcp: { pct: 40, tests: 10 } }, { mcp: recorded(90, 10) });

        // Act
        const { code, output } = check(root, false);

        // Assert
        assert.equal(code, 0);
        assert.match(output, /mcp\s+10 tests\s+coverage not compared: BITBYBIT_MCP_NETWORK is off/);
    });

    it("should still count the MCP suite's tests while its network switch is off", () => {
        // Arrange
        const root = tree({ mcp: { pct: 90, tests: 9 } }, { mcp: recorded(90, 10) });

        // Act
        const { code, output } = check(root, false);

        // Assert
        assert.equal(code, 1);
        assert.match(output, /mcp: 10 tests before, 9 now/);
    });

    it("should allow the MCP suite two points of slack when the network is on, and no more", () => {
        // Arrange
        const within = tree({ mcp: { pct: 88, tests: 10 } }, { mcp: recorded(90, 10) });
        const beyond = tree({ mcp: { pct: 87.9, tests: 10 } }, { mcp: recorded(90, 10) });

        // Act
        const allowed = check(within, true);
        const refused = check(beyond, true);

        // Assert
        assert.equal(allowed.code, 0);
        assert.match(allowed.output, /mcp\s+10 tests\s+lines -2/);
        assert.equal(refused.code, 1);
        assert.match(refused.output, /mcp: lines 90% before, 87.9% now/);
    });

    it("should give a suite that is not opt-in no slack", () => {
        // Arrange
        const root = tree({ base: { pct: 89.9, tests: 10 }, mcp: { pct: 90, tests: 10 } }, { base: recorded(90, 10), mcp: recorded(90, 10) });

        // Act
        const { code, output } = check(root, true);

        // Assert
        assert.equal(code, 1);
        assert.match(output, /base: lines 90% before, 89.9% now/);
    });

    it("should keep the MCP suite's recorded coverage on --save while the network is off, and record it when on", () => {
        // Arrange
        const off = tree({ mcp: { pct: 40, tests: 12 } }, { mcp: recorded(90, 10) });
        const on = tree({ mcp: { pct: 40, tests: 12 } }, { mcp: recorded(90, 10) });
        const savedIn = (root) => JSON.parse(readFileSync(join(root, "packages", "dev", "coverage-baseline.json"), "utf8")).packages.mcp;

        // Act
        check(off, false, "--save");
        check(on, true, "--save");

        // Assert
        assert.deepEqual(savedIn(off), recorded(90, 12));
        assert.deepEqual(savedIn(on), recorded(40, 12));
    });
});
