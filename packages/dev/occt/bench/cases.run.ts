import { it } from "vitest";
import { writeFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import type { BitbybitOcctModule } from "../bitbybit-dev-occt/bitbybit-dev-occt";
import createBitbybitOcct from "../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../lib/occ-helper";
import { OCCTService } from "../lib/occ-service";
import { VectorHelperService } from "../lib/api/vector-helper.service";
import { ShapesHelperService } from "../lib/api/shapes-helper.service";
import { benchCases } from "./cases";

const RUNS = Number(process.env["BENCH_RUNS"] ?? 5);

const loadKernel = async (): Promise<{ label: string; occ: BitbybitOcctModule }> => {
    const directory = process.env["BENCH_KERNEL"];
    if (!directory) {
        return { label: "package", occ: await createBitbybitOcct() };
    }
    const folder = resolve(directory);
    const wasm = readdirSync(folder).find(file => file.endsWith(".wasm"));
    if (!wasm) {
        throw new Error(`BENCH_KERNEL names ${folder}, which holds no .wasm`);
    }
    const glue: unknown = await import(pathToFileURL(join(folder, `${wasm.split(".")[0]!}.js`)).href);
    const factory = (glue as { default: (options: object) => Promise<BitbybitOcctModule> }).default;
    const occ = await factory({ locateFile: (file: string): string => (file.endsWith(".wasm") ? join(folder, wasm) : join(folder, file)) });
    return { label: folder, occ };
};

const fingerprintOf = (values: number[]): string => values.map(value => Number(value.toPrecision(10))).join(" ");

const median = (values: number[]): number => {
    const sorted = [...values].sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length / 2)]!;
};

it("measures every case", async () => {
    const { label, occ } = await loadKernel();
    if (process.env["BENCH_PARALLEL"] === "off") {
        occ.SetRunsInParallel(false);
    }
    const occt = new OCCTService(occ, new OccHelper(new VectorHelperService(), new ShapesHelperService(), occ));
    const rows = benchCases.map(benchCase => {
        const fingerprint = fingerprintOf(benchCase.run(occt));
        const times: number[] = [];
        for (let run = 0; run < RUNS; run++) {
            const start = performance.now();
            const again = fingerprintOf(benchCase.run(occt));
            times.push(performance.now() - start);
            if (again !== fingerprint) {
                throw new Error(`"${benchCase.name}" gave ${again} after ${fingerprint}: it is not deterministic`);
            }
        }
        return { case: benchCase.name, medianMs: Math.round(median(times) * 10) / 10, fingerprint };
    });
    const report = { kernel: label, parallel: occ.RunsInParallel(), runs: RUNS, totalMs: Math.round(rows.reduce((sum, row) => sum + row.medianMs, 0)), rows };
    console.log(JSON.stringify(report, null, 2));
    const out = process.env["BENCH_OUT"];
    if (out) {
        writeFileSync(out, JSON.stringify(report, null, 2));
    }
}, 1_800_000);
