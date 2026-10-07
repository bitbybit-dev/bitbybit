import { describe, expect, it } from "vitest";
import { ifcFile } from "../__test__/model-fixtures";
import { errorThrownBy } from "../__test__/thrown";
import { StepSyntaxError } from "../step/errors";
import { indexStep } from "../step/file-index";
import { RowsById } from "./rows-by-id";

function rowsOf(rows: readonly string[]): RowsById {
    return new RowsById(indexStep(new TextEncoder().encode(ifcFile(rows))));
}

describe("RowsById", () => {
    it.each([
        ["close together", ["#3=IFCCARTESIANPOINT((0.,0.,0.));", "#1=IFCCARTESIANPOINT((1.,0.,0.));"], [3, 1], 3],
        ["far apart", ["#3=IFCCARTESIANPOINT((0.,0.,0.));", "#2000000000=IFCCARTESIANPOINT((1.,0.,0.));"], [3, 2000000000], 2000000000],
    ] as const)("should find each row by its id when the ids lie %s", (_spread, rows, ids, maxId) => {
        // Act
        const found = rowsOf(rows);

        // Assert
        expect([...ids.map((id) => found.rowOf(id)), found.maxId]).toEqual([0, 1, maxId]);
    });

    it.each([
        ["close together", 7],
        ["far apart", 2000000000],
    ] as const)("should find no row for an id the file lacks, a negative one or a fraction when the ids lie %s", (_spread, farId) => {
        // Arrange
        const found = rowsOf(["#5=IFCCARTESIANPOINT((0.,0.,0.));", `#${farId}=IFCCARTESIANPOINT((1.,0.,0.));`]);

        // Act
        const rows = [6, -5, 5.5, 2147483647].map((id) => found.rowOf(id));

        // Assert
        expect(rows).toEqual([-1, -1, -1, -1]);
    });

    it.each([
        ["close together", "#2"],
        ["far apart", "#2000000000"],
    ] as const)("should refuse an id held twice, at its second row, when the ids lie %s", (_spread, far) => {
        // Arrange
        const rows = [`${far}=IFCCARTESIANPOINT((0.,0.,0.));`, "#1=IFCCARTESIANPOINT((1.,0.,0.));", "#1=IFCDIRECTION((1.,0.,0.));"];
        const at = ifcFile(rows).lastIndexOf("#1=");

        // Act
        const error = errorThrownBy(StepSyntaxError, () => rowsOf(rows));

        // Assert
        expect([error.message, error.offset]).toEqual([`The file holds entity #1 twice at byte ${at}`, at]);
    });
});
