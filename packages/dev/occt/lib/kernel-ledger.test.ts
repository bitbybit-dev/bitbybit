import { describe, it, expect, beforeAll, afterEach, vi } from "vitest";
import type { BitbybitOcctModule } from "../bitbybit-dev-occt/bitbybit-dev-occt";
import createBitbybitOcct from "../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "./occ-helper";
import { OCCTService } from "./occ-service";
import { handlesIn, ledgerReport, openWindow, talliesDuring, watchSurface } from "../../__test__/embind-ledger";
import { partialRunOf } from "../../__test__/ledger-report-file";
import type { LedgerRunFilters } from "../../__test__/embind-ledger-types";
import { DesignCache } from "./services/design/cache";
import { releaseDesignCaches } from "./release-design-caches";
import type * as Models from "./api/models";
import { readKernelException } from "./kernel-exception";

describe("the kernel ledger", () => {
    let kernel: BitbybitOcctModule;
    let occt: OCCTService;

    beforeAll(async () => {
        kernel = await createBitbybitOcct();
        occt = new OCCTService(kernel, new OccHelper(kernel));
    }, 120_000);

    afterEach(() => {
        vi.restoreAllMocks();
        releaseDesignCaches(occt);
    });

    const kernelException = (): unknown => {
        const point = new kernel.gp_Pnt(1, 2, 3);
        const maker = new kernel.BRepBuilderAPI_MakeEdge(point, point);
        try {
            return maker.Edge();
        } catch (error) {
            return error;
        } finally {
            maker.delete();
            point.delete();
        }
    };

    const plate: Models.OCCT.DesignPartDocument = {
        schemaVersion: 1,
        features: [
            { id: "base", type: "sketch", on: { plane: "XY" }, start: [0, 0], pen: [{ type: "hLine", length: 40 }, { type: "vLine", length: 20 }, { type: "hLine", length: -40 }, { type: "close" }] },
            { id: "plate", type: "extrude", profile: "base", distance: 8 },
        ],
    };

    it("should count a clone among the kernel objects a call made, since a clone owns its own handle", () => {
        // Arrange
        const box = occt.shapes.solid.createBox({ width: 1, length: 1, height: 1, center: [0, 0, 0] });
        const opened = openWindow();

        // Act
        const copy = box.clone();
        opened.close();

        // Assert
        expect(opened.made()).toContain(copy);
        copy.delete();
        box.delete();
    });

    it("should count the object a property hands out among the kernel objects a call made, since each read makes a new one", () => {
        // Arrange
        const edge = occt.shapes.edge.line({ start: [0, 0, 0], end: [10, 0, 0] });
        const evaluated = kernel.EvaluateEdgeCurve(edge, 0.5);
        const opened = openWindow();

        // Act
        const point = evaluated.Point;
        opened.close();

        // Assert
        expect(opened.made()).toContain(point);
        point.delete();
        evaluated.delete();
        edge.delete();
    });

    it("should judge a public call that drops a clone it made as leaving it alive, naming the path that made it", () => {
        // Arrange
        const make = kernel.MakeBoxFromPntAndDims.bind(kernel);
        vi.spyOn(kernel, "MakeBoxFromPntAndDims").mockImplementation((...args: Parameters<BitbybitOcctModule["MakeBoxFromPntAndDims"]>) => {
            const box = make(...args);
            box.clone();
            return box;
        });

        // Act
        const judged = talliesDuring(() => occt.shapes.solid.createBox({ width: 1, length: 1, height: 1, center: [0, 0, 0] }).delete());

        // Assert
        const tally = judged.get("shapes.solid.createBox")?.ok;
        expect([tally?.calls, tally?.leakedCalls, tally?.leaked, tally?.leakedIn]).toEqual([1, 1, { TopoDS_Shape: 1 }, { "shapes.solid.createBox": { TopoDS_Shape: 1 } }]);
        expect(tally?.firstLeak).toBe(expect.getState().currentTestName);
    });

    it("should keep the most of each class one call left beside the totals of all the calls of a path", () => {
        // Arrange
        const make = kernel.MakeBoxFromPntAndDims.bind(kernel);
        let clones = 0;
        vi.spyOn(kernel, "MakeBoxFromPntAndDims").mockImplementation((...args: Parameters<BitbybitOcctModule["MakeBoxFromPntAndDims"]>) => {
            const box = make(...args);
            clones += 1;
            Array.from({ length: clones }, () => box.clone());
            return box;
        });

        // Act
        const judged = talliesDuring(() => [1, 2].forEach(() => occt.shapes.solid.createBox({ width: 1, length: 1, height: 1, center: [0, 0, 0] }).delete()));

        // Assert
        const tally = judged.get("shapes.solid.createBox")?.ok;
        expect([tally?.leakedCalls, tally?.leaked, tally?.leakedMost]).toEqual([2, { TopoDS_Shape: 3 }, { TopoDS_Shape: 2 }]);
    });

    it("should keep the ledger errors and the nested calls raised inside talliesDuring out of the file's report", () => {
        // Arrange
        const before = ledgerReport("kernel-ledger.test.ts");
        const make = kernel.MakeBoxFromPntAndDims.bind(kernel);
        vi.spyOn(kernel, "MakeBoxFromPntAndDims").mockImplementation((...args: Parameters<BitbybitOcctModule["MakeBoxFromPntAndDims"]>) => {
            occt.shapes.edge.line({ start: [0, 0, 0], end: [1, 0, 0] }).delete();
            return make(...args);
        });
        let raised = before;

        // Act
        talliesDuring(() => {
            watchSurface({ root: occt, paths: ["shapes.solid.noSuchMethod"] });
            occt.shapes.solid.createBox({ width: 1, length: 1, height: 1, center: [0, 0, 0] }).delete();
            raised = ledgerReport("kernel-ledger.test.ts");
        });

        // Assert
        const after = ledgerReport("kernel-ledger.test.ts");
        expect(raised.ledgerErrors).toContain("shapes.solid.noSuchMethod is not a method of its own service class");
        expect(raised.nested["shapes.edge.line"]).toBe((before.nested["shapes.edge.line"] ?? 0) + 1);
        expect([after.ledgerErrors, after.nested]).toEqual([before.ledgerErrors, before.nested]);
    });

    it.each([
        ["an error of its own", (): unknown => new Error("refused")],
        ["a C++ exception, which is no trap", (): unknown => kernelException()],
    ])("should judge a public call that throws %s after dropping an object it made as leaving it alive when it threw", (_name, thrown) => {
        // Arrange
        const make = kernel.MakeBoxFromPntAndDims.bind(kernel);
        vi.spyOn(kernel, "MakeBoxFromPntAndDims").mockImplementation((...args: Parameters<BitbybitOcctModule["MakeBoxFromPntAndDims"]>) => {
            make(...args);
            throw thrown();
        });

        // Act
        const judged = talliesDuring(() => {
            try {
                occt.shapes.solid.createBox({ width: 1, length: 1, height: 1, center: [0, 0, 0] });
            } catch (error) {
                readKernelException(kernel, error);
            }
        });

        // Assert
        const outcomes = judged.get("shapes.solid.createBox");
        expect([outcomes?.threw?.calls, outcomes?.threw?.leakedCalls, outcomes?.threw?.leaked, outcomes?.trapped, outcomes?.ok]).toEqual([1, 1, { TopoDS_Shape: 1 }, undefined, undefined]);
    });

    it("should judge a public call that drops the object a property handed out as leaving it alive", () => {
        // Arrange
        const evaluate = kernel.EvaluateEdgeCurve.bind(kernel);
        vi.spyOn(kernel, "EvaluateEdgeCurve").mockImplementation((...args: Parameters<BitbybitOcctModule["EvaluateEdgeCurve"]>) => {
            const evaluated = evaluate(...args);
            void evaluated.Point;
            return evaluated;
        });
        const edge = occt.shapes.edge.line({ start: [0, 0, 0], end: [10, 0, 0] });

        // Act
        const judged = talliesDuring(() => occt.shapes.edge.pointOnEdgeAtParam({ shape: edge, param: 0.5 }));

        // Assert
        const tally = judged.get("shapes.edge.pointOnEdgeAtParam")?.ok;
        expect([tally?.leakedCalls, tally?.leaked]).toEqual([1, { gp_Pnt: 1 }]);
        edge.delete();
    });

    it("should excuse what the design builder's own caches keep, and judge what a cache made for one call keeps when the call drops it", () => {
        // Arrange
        const keptByTheBuilder = talliesDuring(() => handlesIn(occt.design.build({ document: plate })).forEach(handle => handle.delete()));
        vi.spyOn(DesignCache.prototype, "clear").mockImplementation(() => undefined);

        // Act
        const droppedByHints = talliesDuring(() => occt.design.withHints({ document: plate }));

        // Assert
        const build = keptByTheBuilder.get("design.build")?.ok;
        const hints = droppedByHints.get("design.withHints")?.ok;
        expect([build?.leakedCalls, (build?.retained ?? 0) > 0]).toEqual([0, true]);
        expect(hints?.leakedCalls).toBe(1);
    });
});

describe("the completeness of a ledger report", () => {
    const spec = { filepath: "/package/lib/a.test.ts", testLocations: [] };
    const unfiltered = { testNamePattern: undefined, tagsFilter: undefined };
    const cases: [string, LedgerRunFilters, string, string][] = [
        ["picks tests by name", { spec, config: { testNamePattern: /splits/, tagsFilter: undefined } }, "", "the run picked tests by name (/splits/)"],
        ["picks tests by name for this file alone", { spec: { ...spec, testNamePattern: /joins/ }, config: unfiltered }, "", "the run picked tests by name (/joins/)"],
        ["picks tests by line", { spec: { ...spec, testLocations: [12, 40] }, config: unfiltered }, "", "the run picked tests by line (12, 40)"],
        ["picks tests by id", { spec: { ...spec, testIds: ["a1b2"] }, config: unfiltered }, "", "the run picked tests by id"],
        ["picks tests by tag", { spec, config: { testNamePattern: undefined, tagsFilter: ["slow"] } }, "", "the run picked tests by tag (slow)"],
        ["runs a file that focuses tests with only", { spec, config: unfiltered }, "describe(\"a\", () => { it.only(\"b\", () => {}); });", "the file focuses some of its tests with .only, so the others were skipped"],
        ["is not one the runner names", { spec: undefined, config: unfiltered }, "", "the test runner names no specification for the file, so whether its run was filtered is unknown"],
    ];

    it.each(cases)("should mark a report partial when the run %s", (_name, filters, source, why) => {
        // Act
        const partial = partialRunOf(filters, source);

        // Assert
        expect(partial).toBe(why);
    });

    it("should not take a focus modifier quoted in a string for one", () => {
        // Arrange
        const source = "const name = \"it.only\"; const other = `describe.only`; it(name, () => {});";

        // Act
        const partial = partialRunOf({ spec, config: unfiltered }, source);

        // Assert
        expect(partial).toBeUndefined();
    });

    it("should mark a report complete when the run picks no tests and the file focuses none, whatever it skips itself", () => {
        // Arrange
        const source = "it.skip(\"a\", () => {}); it(\"b\", () => {}); it.todo(\"c\");";

        // Act
        const partial = partialRunOf({ spec, config: unfiltered }, source);

        // Assert
        expect(partial).toBeUndefined();
    });
});
