import { describe, it, expect, beforeAll } from "vitest";
import createBitbybitOcct from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import { VectorHelperService } from "../../api/vector-helper.service";
import { ShapesHelperService } from "../../api/shapes-helper.service";
import { OCCTService } from "../../occ-service";
import type { BenchmarkReport } from "./__test__/naming-benchmark";
import { runBenchmark, statusOf, summaryLine } from "./__test__/naming-benchmark";
import { NAMING_CORPUS } from "./__test__/naming-corpus";

describe("the naming benchmark", () => {
    let report: BenchmarkReport;

    beforeAll(async () => {
        const kernel = await createBitbybitOcct();
        const occt = new OCCTService(kernel, new OccHelper(new VectorHelperService(), new ShapesHelperService(), kernel));
        report = runBenchmark(NAMING_CORPUS, occt, kernel);
        console.info(summaryLine(report, NAMING_CORPUS.length));
    }, 600_000);

    it("should classify a reference by the elements it finds against those intended", () => {
        // Act
        const statuses = [
            statusOf([1, 2], [1, 2]),
            statusOf(undefined, []),
            statusOf(undefined, [3]),
            statusOf([1], [1, 2]),
            statusOf([1, 2, 3], [1, 2]),
            statusOf([1, 5], [1, 2]),
            statusOf([4], []),
            statusOf([4], [5]),
        ];

        // Assert
        expect(statuses).toEqual(["kept", "kept", "lost", "lost", "ambiguous", "wrong", "wrong", "wrong"]);
    });

    it("should build every variation of every case", () => {
        // Assert
        expect(report.unbuilt).toEqual([]);
    });

    it("should hold the results recorded for the corpus, so a change in any count is accepted on purpose", async () => {
        // Arrange
        const lines = report.results.map(result => `  ${JSON.stringify([result.case, result.variation, result.reference, result.status, result.hinted])}`);

        // Act
        const written = `{\n  "totals": ${JSON.stringify(report.totals)},\n  "hintedTotals": ${JSON.stringify(report.hintedTotals)},\n  "results": [\n${lines.join(",\n")}\n  ]\n}\n`;

        // Assert
        await expect(written).toMatchFileSnapshot("./naming-benchmark.json");
    });
});
