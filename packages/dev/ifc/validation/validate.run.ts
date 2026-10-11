import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { IFCService } from "../index";
import { VALIDATION_FIXTURES } from "./fixtures";
import type { MeasuredVolume, RegeneratedWall, ValidationReport } from "./validation-types";

const PYTHON = process.env["IFC_PYTHON"] ?? "python3";
const CHECKER = join(__dirname, "check.py");
const TIME_STAMP = "2026-10-07T12:00:00";
const VOLUME_TOLERANCE = 1e-6;
const VOLUME_FLOOR = 1e-9;
const TESSELLATED_TOLERANCE = 1e-2;
const OUTPUT_LIMIT = 256 * 1024 * 1024;

const folder = mkdtempSync(join(tmpdir(), "ifc-validation-"));
const reports = new Map<string, ValidationReport>();

function reportOf(name: string): ValidationReport {
    const report = reports.get(name);
    if (report === undefined) {
        throw new Error(`IfcOpenShell gave no report for the ${name} file`);
    }
    return report;
}

function relativeDifference(wall: RegeneratedWall): number {
    return Math.abs((wall.regenerated ?? Number.NaN) - wall.ours) / Math.abs(wall.ours);
}

function volumeDifference(volume: MeasuredVolume): number {
    return Math.abs((volume.measured ?? Number.NaN) - volume.ours) / Math.max(Math.abs(volume.ours), VOLUME_FLOOR);
}

beforeAll(() => {
    const ifc = new IFCService();
    const files = VALIDATION_FIXTURES.map((fixture) => {
        const file = join(folder, `${fixture.name}.ifc`);
        const measured = ifc.quantities.compute({ model: fixture.build() });
        writeFileSync(file, ifc.model.write({ model: measured, fileName: `${fixture.name}.ifc`, timeStamp: TIME_STAMP }));
        return file;
    });
    const run = spawnSync(PYTHON, [CHECKER, ...files], { encoding: "utf8", maxBuffer: OUTPUT_LIMIT });
    if (run.error !== undefined || run.status !== 0) {
        throw new Error(`IfcOpenShell could not check the files with '${PYTHON}'. Set IFC_PYTHON to a Python that has IfcOpenShell 0.9 (pip install ifcopenshell).\n${run.error?.message ?? run.stderr}`);
    }
    const parsed: ValidationReport[] = JSON.parse(run.stdout);
    if (parsed.length !== VALIDATION_FIXTURES.length) {
        throw new Error(`IfcOpenShell reported on ${parsed.length} files, where ${VALIDATION_FIXTURES.length} were written`);
    }
    parsed.forEach((report, index) => reports.set(VALIDATION_FIXTURES[index]!.name, report));
});

afterAll(() => {
    rmSync(folder, { recursive: true, force: true });
});

describe.each(VALIDATION_FIXTURES.map((fixture) => fixture.name))("the %s file", (name) => {
    it("should pass IfcOpenShell's validator, its rules included", () => {
        expect(reportOf(name).statements.filter((statement) => statement.level === "error")).toEqual([]);
    });

    it("should give IfcOpenShell a shape for every product it represents", () => {
        expect(reportOf(name).geometryFailures).toEqual([]);
    });

    it("should hold net volumes that IfcOpenShell measures the same from the geometry, curved sections to its tessellation", () => {
        expect(reportOf(name).volumes.filter((volume) => !(volumeDifference(volume) < (volume.curved ? TESSELLATED_TOLERANCE : VOLUME_TOLERANCE)))).toEqual([]);
    });

    it("should hold walls that IfcOpenShell's own wall regeneration rebuilds to the same volume", () => {
        expect(reportOf(name).walls.filter((wall) => wall.problem !== null || !(relativeDifference(wall) < VOLUME_TOLERANCE))).toEqual([]);
    });
});
