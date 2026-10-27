import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { checkLedger, mergeReports, testFilesOf, unknownKernelKeys } from "./kernel-ledger.mjs";

const tally = (calls, { leakedCalls = 0, leaked = {}, leakedMost = leaked, firstLeak = undefined, foreignCalls = 0, foreign = {}, foreignMost = foreign } = {}) => ({
    calls,
    made: calls * 2,
    retained: 0,
    leakedCalls,
    leaked,
    leakedMost,
    leakedIn: leakedCalls === 0 ? {} : { "shapes.wire.inner": leaked },
    foreignCalls,
    foreign,
    foreignMost,
    ...(firstLeak === undefined ? {} : { firstLeak }),
});

const report = (file, paths, extra = {}) => ({ kernel: "occt", file, bookkeepingMs: 1, ledgerErrors: [], nested: {}, paths, complete: true, ...extra });

const bound = (reason, mostPerCall) => ({ reason, mostPerCall });

const SURFACE = new Set(["shapes.wire.split", "shapes.wire.join", "io.load"]);
const FILES = ["lib/a.test.ts", "lib/b.test.ts"];

const ALL_REACHED = { "shapes.wire.split": { ok: tally(1) }, "shapes.wire.join": { ok: tally(1) }, "io.load": { ok: tally(1) } };

const check = (reports, { allow = {}, foreign = {}, unreached = {}, testFiles = FILES } = {}) =>
    checkLedger({ kernel: "occt", merged: mergeReports(reports), allow, foreign, unreached, surface: SURFACE, testFiles });

const problemsOf = (result) => result.findings.map(({ key, problem }) => `${key}: ${problem}`);
const problemsBesidesUncalledOf = (result) => problemsOf(result).filter((problem) => !problem.includes("no test calls it"));

describe("kernel ledger gate", () => {
    it("should add up a path's calls and leaks across files and name the first test that leaked with its file", () => {
        // Arrange
        const reports = [
            report("lib/a.test.ts", { "shapes.wire.split": { ok: tally(2) } }),
            report("lib/b.test.ts", { "shapes.wire.split": { ok: tally(3, { leakedCalls: 1, leaked: { TopoDS_Edge: 2 }, firstLeak: "splits a circle" }) } }),
        ];

        // Act
        const merged = mergeReports(reports);

        // Assert
        const ok = merged.paths.get("shapes.wire.split").ok;
        assert.deepEqual([ok.calls, ok.made, ok.leakedCalls, ok.leaked, ok.firstLeak], [5, 10, 1, { TopoDS_Edge: 2 }, "lib/b.test.ts > splits a circle"]);
    });

    it("should keep the most of each class one call left across files, not their sum", () => {
        // Arrange
        const reports = [
            report("lib/a.test.ts", { "shapes.wire.split": { ok: tally(2, { leakedCalls: 2, leaked: { TopoDS_Edge: 3 }, leakedMost: { TopoDS_Edge: 2 }, foreignCalls: 2, foreign: { Vector_vec2: 2 }, foreignMost: { Vector_vec2: 1 } }) } }),
            report("lib/b.test.ts", { "shapes.wire.split": { ok: tally(1, { leakedCalls: 1, leaked: { TopoDS_Edge: 1, TopoDS_Wire: 1 }, foreignCalls: 1, foreign: { Vector_vec2: 3 } }) } }),
        ];

        // Act
        const merged = mergeReports(reports);

        // Assert
        const ok = merged.paths.get("shapes.wire.split").ok;
        assert.deepEqual([ok.leakedMost, ok.foreignCalls, ok.foreign, ok.foreignMost], [{ TopoDS_Edge: 2, TopoDS_Wire: 1 }, 3, { Vector_vec2: 5 }, { Vector_vec2: 3 }]);
    });

    it("should pass what the kernel library left alive itself within the bound foreign sets, and add it up apart from the leaks it judges", () => {
        // Arrange
        const reports = [
            report("lib/a.test.ts", { ...ALL_REACHED, "shapes.wire.split": { ok: tally(2, { foreignCalls: 2, foreign: { Vector_vec2: 2 }, foreignMost: { Vector_vec2: 1 } }) } }),
            report("lib/b.test.ts", { "shapes.wire.join": { threw: tally(1, { foreignCalls: 1, foreign: { Vector_vec2: 1, Vector2_vec2: 1 } }) } }),
        ];
        const foreign = {
            "occt:shapes.wire.split#ok": bound("the library's split never deletes the vector it reads", { Vector_vec2: 1 }),
            "occt:shapes.wire.join#threw": bound("the library's join never deletes its two vectors", { Vector_vec2: 1, Vector2_vec2: 2 }),
        };

        // Act
        const result = check(reports, { foreign });

        // Assert
        assert.deepEqual([result.findings, result.foreign], [[], { Vector_vec2: 3, Vector2_vec2: 1 }]);
    });

    it("should fail what the kernel library left alive on a path foreign does not bound, naming how much, in how many calls and the most one call left", () => {
        // Arrange
        const reports = [
            report("lib/a.test.ts", { ...ALL_REACHED, "shapes.wire.split": { ok: tally(4, { foreignCalls: 2, foreign: { Vector_vec2: 3, Vector_ivec3: 1 }, foreignMost: { Vector_vec2: 2, Vector_ivec3: 1 } }) } }),
            report("lib/b.test.ts", {}),
        ];

        // Act
        const result = check(reports);

        // Assert
        assert.deepEqual(problemsOf(result), [
            "occt:shapes.wire.split#ok: the kernel library's own code left 1 Vector_ivec3, 3 Vector_vec2 alive in 2 of 4 calls, at most 1 Vector_ivec3, 2 Vector_vec2 in one call: bound it under foreign in scripts/kernel-ledger.allow.json, naming the library function that leaks them",
        ]);
    });

    it("should fail a library leak one call of which leaves more of a class than its bound, or a class its bound does not name, and a bound class no call leaves any more", () => {
        // Arrange
        const reports = [
            report("lib/a.test.ts", { ...ALL_REACHED, "shapes.wire.split": { ok: tally(3, { foreignCalls: 3, foreign: { Vector_vec2: 6, Vector_ivec3: 1 }, foreignMost: { Vector_vec2: 4, Vector_ivec3: 1 } }) } }),
            report("lib/b.test.ts", {}),
        ];
        const foreign = { "occt:shapes.wire.split#ok": bound("the library's split never deletes its vectors", { Vector_vec2: 2, Vector2_vec2: 1 }) };

        // Act
        const result = check(reports, { foreign });

        // Assert
        assert.deepEqual(problemsOf(result), [
            "occt:shapes.wire.split#ok: the kernel library's own code left up to 1 Vector_ivec3 alive in one call, which its foreign entry in scripts/kernel-ledger.allow.json does not name",
            "occt:shapes.wire.split#ok: the kernel library's own code left up to 4 Vector_vec2 alive in one call, more than the 2 its foreign entry in scripts/kernel-ledger.allow.json allows",
            "occt:shapes.wire.split#ok: no call leaves Vector2_vec2 alive any more, so it must come out of its foreign entry in scripts/kernel-ledger.allow.json",
        ]);
    });

    it("should fail a foreign entry whose path no longer leaks, that no test reaches, or that names no path and outcome of the kernel", () => {
        // Arrange
        const reports = [report("lib/a.test.ts", { "shapes.wire.split": { ok: tally(2) } }), report("lib/b.test.ts", {})];
        const foreign = {
            "occt:shapes.wire.split#ok": bound("fixed upstream", { Vector_vec2: 1 }),
            "occt:shapes.wire.join#ok": bound("no longer called", { Vector_vec2: 1 }),
            "occt:shapes.wire.gone#ok": bound("renamed", { Vector_vec2: 1 }),
            "occt:io.load#trapped": bound("never judged", { Vector_vec2: 1 }),
            "manifold:shapes.cube#ok": bound("another kernel's key", { Vector_vec2: 1 }),
        };

        // Act
        const result = check(reports, { foreign });

        // Assert
        assert.deepEqual(problemsBesidesUncalledOf(result), [
            "occt:shapes.wire.split#ok: the kernel library's own code no longer leaves anything alive on it, so it must come out of foreign in scripts/kernel-ledger.allow.json",
            "occt:shapes.wire.join#ok: scripts/kernel-ledger.allow.json bounds it under foreign, but no test reaches it any more",
            "occt:shapes.wire.gone#ok: scripts/kernel-ledger.allow.json names no path and outcome of the kernel under foreign (renamed)",
            "occt:io.load#trapped: scripts/kernel-ledger.allow.json names no path and outcome of the kernel under foreign (never judged)",
        ]);
    });

    it("should fail a leak nobody allowed, naming what it left, how often, what made it and where it was first seen", () => {
        // Arrange
        const reports = [
            report("lib/a.test.ts", { ...ALL_REACHED, "shapes.wire.split": { ok: tally(4, { leakedCalls: 2, leaked: { TopoDS_Edge: 3, BRepBuilderAPI_MakeWire: 1 }, firstLeak: "splits a circle" }) } }),
            report("lib/b.test.ts", {}),
        ];

        // Act
        const result = check(reports);

        // Assert
        assert.deepEqual(problemsOf(result), [
            "occt:shapes.wire.split#ok: left 1 BRepBuilderAPI_MakeWire, 3 TopoDS_Edge alive in 2 of 4 calls, made by shapes.wire.inner (1 BRepBuilderAPI_MakeWire, 3 TopoDS_Edge); first in lib/a.test.ts > splits a circle",
        ]);
    });

    it("should pass a leak that is allowed within its bound, and judge a refusal apart from a success of the same path", () => {
        // Arrange
        const reports = [
            report("lib/a.test.ts", { ...ALL_REACHED, "shapes.wire.split": { ok: tally(4), threw: tally(1, { leakedCalls: 1, leaked: { TopoDS_Wire: 1 } }) } }),
            report("lib/b.test.ts", {}),
        ];

        // Act
        const allowed = check(reports, { allow: { "occt:shapes.wire.split#threw": bound("the refusal keeps its wire", { TopoDS_Wire: 1 }) } });
        const refused = check(reports, { allow: { "occt:shapes.wire.split#ok": bound("the success keeps nothing", { TopoDS_Wire: 1 }) } });

        // Assert
        assert.deepEqual(problemsOf(allowed), []);
        assert.equal(refused.findings.length, 2);
        assert.match(problemsOf(refused)[0], /^occt:shapes\.wire\.split#threw: left 1 TopoDS_Wire alive/);
        assert.equal(problemsOf(refused)[1], "occt:shapes.wire.split#ok: no longer leaks, so it must come out of scripts/kernel-ledger.allow.json");
    });

    it("should fail an allowed leak one call of which leaves more of a class than its bound, or a class its bound does not name, and a bound class no call leaves any more", () => {
        // Arrange
        const reports = [
            report("lib/a.test.ts", { ...ALL_REACHED, "shapes.wire.split": { ok: tally(4, { leakedCalls: 2, leaked: { TopoDS_Edge: 5, gp_Pnt: 1 }, leakedMost: { TopoDS_Edge: 3, gp_Pnt: 1 } }) } }),
            report("lib/b.test.ts", {}),
        ];
        const allow = { "occt:shapes.wire.split#ok": bound("the split keeps the edges it fixed", { TopoDS_Edge: 2, TopoDS_Wire: 1 }) };

        // Act
        const result = check(reports, { allow });

        // Assert
        assert.deepEqual(problemsOf(result), [
            "occt:shapes.wire.split#ok: left up to 1 gp_Pnt alive in one call, which its entry in scripts/kernel-ledger.allow.json does not name",
            "occt:shapes.wire.split#ok: left up to 3 TopoDS_Edge alive in one call, more than the 2 its entry in scripts/kernel-ledger.allow.json allows",
            "occt:shapes.wire.split#ok: no call leaves TopoDS_Wire alive any more, so it must come out of its entry in scripts/kernel-ledger.allow.json",
        ]);
    });

    it("should fail an allowed key that no test reaches, that names no kernel path, or that names an outcome it never judges", () => {
        // Arrange
        const reports = [report("lib/a.test.ts", {}), report("lib/b.test.ts", {})];
        const allow = {
            "occt:shapes.wire.join#ok": bound("kept", { TopoDS_Wire: 1 }),
            "occt:shapes.wire.gone#ok": bound("kept", { TopoDS_Wire: 1 }),
            "occt:io.load#trapped": bound("kept", { TopoDS_Wire: 1 }),
            "manifold:shapes.cube#ok": bound("another kernel's key", { Manifold: 1 }),
        };

        // Act
        const result = check(reports, { allow });

        // Assert
        assert.deepEqual(problemsBesidesUncalledOf(result), [
            "occt:shapes.wire.join#ok: scripts/kernel-ledger.allow.json allows it, but no test reaches it any more",
            "occt:shapes.wire.gone#ok: scripts/kernel-ledger.allow.json names no path and outcome of the kernel (kept)",
            "occt:io.load#trapped: scripts/kernel-ledger.allow.json names no path and outcome of the kernel (kept)",
        ]);
    });

    it("should fail an allow or foreign entry that is not a reason with a whole positive bound for each class", () => {
        // Arrange
        const reports = [
            report("lib/a.test.ts", { ...ALL_REACHED, "shapes.wire.split": { ok: tally(1, { leakedCalls: 1, leaked: { TopoDS_Wire: 1 }, foreignCalls: 1, foreign: { Vector_vec2: 1 } }) } }),
            report("lib/b.test.ts", {}),
        ];
        const allow = { "occt:shapes.wire.split#ok": "a reason with no bound" };
        const foreign = {
            "occt:shapes.wire.split#ok": bound("a bound below one", { Vector_vec2: 0 }),
            "occt:shapes.wire.join#ok": bound("", { Vector_vec2: 1 }),
            "occt:io.load#ok": bound("a fractional bound", { Vector_vec2: 1.5 }),
        };

        // Act
        const result = check(reports, { allow, foreign });

        // Assert
        const shape = "must be { reason, mostPerCall }: a reason, and for each class the most one call may leave alive, a whole number above zero";
        assert.deepEqual(problemsOf(result), [
            `occt:shapes.wire.split#ok: its entry in scripts/kernel-ledger.allow.json ${shape}`,
            `occt:shapes.wire.split#ok: its foreign entry in scripts/kernel-ledger.allow.json ${shape}`,
            `occt:shapes.wire.join#ok: its foreign entry in scripts/kernel-ledger.allow.json ${shape}`,
            `occt:io.load#ok: its foreign entry in scripts/kernel-ledger.allow.json ${shape}`,
        ]);
    });

    it("should count the kernel paths reached and fail every path no test calls, however many others are reached", () => {
        // Arrange
        const reports = [
            report("lib/a.test.ts", { "shapes.wire.split": { ok: tally(1) }, "io.load": { trapped: tally(1) } }),
            report("lib/b.test.ts", {}),
        ];

        // Act
        const result = check(reports);

        // Assert
        assert.deepEqual([result.reached, result.of], [2, 3]);
        assert.deepEqual(problemsOf(result), [
            "occt:shapes.wire.join: no test calls it from outside the kernel's own services, so the ledger never judges it: add a lifetime case, or list it under unreached with the reason",
            "occt:io.load: every call that reached it trapped, so the ledger never judged it: add a case that reaches it without a trap",
        ]);
    });

    it("should pass a path no test calls when it is listed as unreached with its reason, and fail a listed path a test calls or the kernel does not have", () => {
        // Arrange
        const reports = [report("lib/a.test.ts", { "shapes.wire.split": { ok: tally(1) }, "io.load": { ok: tally(1) } }), report("lib/b.test.ts", {})];
        const unreached = { "occt:shapes.wire.join": "only a host calls it", "occt:io.load": "listed before a test reached it", "occt:shapes.wire.gone": "renamed", "manifold:cube": "another kernel's key" };

        // Act
        const result = check(reports, { unreached });

        // Assert
        assert.deepEqual(problemsOf(result), [
            "occt:io.load: a test calls it now, so it must come out of unreached in scripts/kernel-ledger.allow.json",
            "occt:shapes.wire.gone: unreached in scripts/kernel-ledger.allow.json names no path of the kernel (renamed)",
        ]);
    });

    it("should fail a path every test reached only by calls that trapped, since none of them was judged", () => {
        // Arrange
        const reports = [report("lib/a.test.ts", { ...ALL_REACHED, "io.load": { trapped: tally(3) } }), report("lib/b.test.ts", {})];

        // Act
        const result = check(reports);

        // Assert
        assert.deepEqual(problemsOf(result), ["occt:io.load: every call that reached it trapped, so the ledger never judged it: add a case that reaches it without a trap"]);
    });

    it("should name every key of the allow file whose kernel the gate does not know, in any of its lists", () => {
        // Arrange
        const config = {
            allow: { "occt:io.load#ok": bound("kept", { TopoDS_Shape: 1 }), "jscad:x#ok": bound("another package", { Geom3: 1 }), "load#ok": bound("no kernel", { TopoDS_Shape: 1 }) },
            foreign: { "manifold:cube#ok": bound("known", { Vector_vec2: 1 }), "Manifold:cube#ok": bound("wrong case", { Vector_vec2: 1 }) },
            unreached: { "OCCT:io.load": "wrong case", "manifold:cube": "known" },
        };

        // Act
        const unknown = unknownKernelKeys(config, ["occt", "manifold"]);

        // Assert
        assert.deepEqual(unknown, [
            { key: "jscad:x#ok", problem: "names no kernel the gate checks (another package)" },
            { key: "load#ok", problem: "names no kernel the gate checks (no kernel)" },
            { key: "OCCT:io.load", problem: "names no kernel the gate checks (wrong case)" },
            { key: "Manifold:cube#ok", problem: "names no kernel the gate checks (wrong case)" },
        ]);
    });

    it("should fail a test file that left no report, a report of a file that is gone, and a path the kernel does not have", () => {
        // Arrange
        const reports = [report("lib/a.test.ts", { "shapes.wire.renamed": { ok: tally(1) } }), report("lib/old.test.ts", {})];

        // Act
        const result = check(reports);

        // Assert
        assert.deepEqual(problemsBesidesUncalledOf(result), [
            "occt:shapes.wire.renamed: was reported but is not a path of the kernel",
            "occt:lib/b.test.ts: left no ledger report: did the suite run with the ledger?",
            "occt:lib/old.test.ts: has a ledger report but is no test file of the package: clear the report folder",
        ]);
    });

    it("should fail a report not marked complete, naming the file and why, and a report a ledger wrote without the mark", () => {
        // Arrange
        const reports = [
            report("lib/a.test.ts", ALL_REACHED, { complete: false, partial: "the run picked tests by name (/splits/)" }),
            { kernel: "occt", file: "lib/b.test.ts", bookkeepingMs: 1, ledgerErrors: [], nested: {}, paths: {} },
        ];

        // Act
        const result = check(reports);

        // Assert
        assert.deepEqual(problemsOf(result), [
            "occt:lib/a.test.ts: has a partial ledger report, so the gate cannot judge it: the run picked tests by name (/splits/); run the package's whole suite again",
            "occt:lib/b.test.ts: has a partial ledger report, so the gate cannot judge it: it carries no mark that the file's whole run wrote it; run the package's whole suite again",
        ]);
    });

    it("should fail a call the ledger could not judge and an error inside the ledger itself", () => {
        // Arrange
        const reports = [
            report("lib/a.test.ts", { "io.load": { deferred: tally(1) } }),
            report("lib/b.test.ts", {}, { ledgerErrors: ["io.load is not a method of its own service class"] }),
        ];

        // Act
        const result = check(reports);

        // Assert
        assert.deepEqual(problemsBesidesUncalledOf(result), [
            "occt:deferred: lib/a.test.ts: io.load returned a promise or an iterator, which the ledger cannot judge",
            "occt:ledger: lib/b.test.ts: io.load is not a method of its own service class",
        ]);
    });

    it("should list a package's test files under lib, nested folders included, and nothing else", () => {
        // Arrange
        const packageDir = mkdtempSync(path.join(tmpdir(), "kernel-ledger-"));
        mkdirSync(path.join(packageDir, "lib", "services", "shapes"), { recursive: true });
        writeFileSync(path.join(packageDir, "lib", "occ-service.test.ts"), "");
        writeFileSync(path.join(packageDir, "lib", "services", "shapes", "wire.test.ts"), "");
        writeFileSync(path.join(packageDir, "lib", "services", "shapes", "wire.ts"), "");

        // Act
        const files = testFilesOf(packageDir);

        // Assert
        rmSync(packageDir, { recursive: true, force: true });
        assert.deepEqual(files, [path.join("lib", "occ-service.test.ts"), path.join("lib", "services", "shapes", "wire.test.ts")]);
    });
});
