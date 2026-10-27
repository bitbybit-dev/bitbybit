import { describe, it, expect, beforeAll } from "vitest";
import { InputError } from "@bitbybit-dev/base";
import createBitbybitOcct from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";

describe("SolidsService", () => {
    let helper: OccHelper;

    beforeAll(async () => {
        helper = new OccHelper(await createBitbybitOcct());
    });

    describe("createCylindersOnLines", () => {
        it("should name the line of no length it cannot build a cylinder along", () => {
            // Act
            const act = (): unknown => helper.solidsService.createCylindersOnLines({ lines: [{ start: [0, 0, 0], end: [0, 1, 0] }, { start: [1, 0, 0], end: [1, 0, 0] }], radius: 1 });

            // Assert
            expect(act).toThrow(new InputError("`lines` at position 1 starts and ends at the same point, so there is no cylinder along it.", "lines"));
        });
    });
});
