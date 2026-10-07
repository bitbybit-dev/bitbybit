import { expect, it } from "vitest";
import { writeFileSync } from "node:fs";
import { benchCases } from "./cases";
import type { BenchRow } from "./bench-types";

const DEFAULT_RUNS = 3;

const runsWanted = (): number => {
    const runs = Number(process.env["BENCH_RUNS"] ?? DEFAULT_RUNS);
    if (!Number.isSafeInteger(runs) || runs < 1) {
        throw new Error(`BENCH_RUNS is how many times each case runs, a whole number of at least 1, not ${process.env["BENCH_RUNS"]}`);
    }
    return runs;
};

const RUNS = runsWanted();

const median = (values: number[]): number => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)]!;

it("measures every case within its budget", () => {
    const rows: BenchRow[] = benchCases.map((benchCase) => {
        const fingerprint = benchCase.run().join(" ");
        const times: number[] = [];
        for (let run = 0; run < RUNS; run++) {
            const start = performance.now();
            const again = benchCase.run().join(" ");
            times.push(performance.now() - start);
            if (again !== fingerprint) {
                throw new Error(`"${benchCase.name}" gave ${again} after ${fingerprint}: it is not deterministic`);
            }
        }
        return { case: benchCase.name, medianMs: Math.round(median(times) * 10) / 10, budgetMs: benchCase.budgetMs, fingerprint };
    });
    const report = { runs: RUNS, totalMs: Math.round(rows.reduce((sum, row) => sum + row.medianMs, 0)), rows };
    console.log(JSON.stringify(report, null, 2));
    const out = process.env["BENCH_OUT"];
    if (out) {
        writeFileSync(out, JSON.stringify(report, null, 2));
    }
    expect(rows.filter((row) => row.medianMs > row.budgetMs)).toEqual([]);
}, 1_800_000);
