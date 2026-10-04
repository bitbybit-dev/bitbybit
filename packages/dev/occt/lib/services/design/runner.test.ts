import { describe, it, expect, beforeAll } from "vitest";
import createBitbybitOcct, { BitbybitOcctModule } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import { VectorHelperService } from "../../api/vector-helper.service";
import { ShapesHelperService } from "../../api/shapes-helper.service";
import { OCCTService } from "../../occ-service";
import * as Models from "../../api/models";
import { DesignCache } from "./cache";
import { runDesign } from "./runner";

const withPurge = (id: string): Models.OCCT.DesignPartDocument => ({
    schemaVersion: 1,
    features: [
        { id: "base", type: "sketch", on: { plane: "XY" }, pen: [{ type: "hLine", length: 3 }, { type: "vLine", length: 3 }, { type: "hLine", length: -3 }, { type: "close" }] },
        { id: "block", type: "extrude", profile: "base", distance: 3 },
        { id, type: "operation", operation: "occt.shapes.shape.purgeInternalEdges", params: { shape: { body: "block" } } },
    ],
});

describe("design runner", () => {
    let kernel: BitbybitOcctModule;
    let occt: OCCTService;

    beforeAll(async () => {
        kernel = await createBitbybitOcct();
        const helper = new OccHelper(new VectorHelperService(), new ShapesHelperService(), kernel);
        occt = new OCCTService(kernel, helper);
    }, 120_000);

    it("should keep its own handle on a shape an operation hands back unchanged, so freeing one outcome never frees another", () => {
        // Arrange
        const cache = new DesignCache(0);
        runDesign(withPurge("first"), {}, { occt, occ: kernel, cache });

        // Act
        const second = runDesign(withPurge("second"), {}, { occt, occ: kernel, cache });
        const third = runDesign(withPurge("third"), {}, { occt, occ: kernel, cache });

        // Assert
        expect(second.report.map(entry => [entry.status, entry.cached])).toEqual([["ok", true], ["ok", true], ["ok", false]]);
        expect(third.report.map(entry => entry.status)).toEqual(["ok", "ok", "ok"]);
        expect(occt.shapes.solid.getSolidVolume({ shape: third.parts[1]!.shape })).toBeCloseTo(27, 6);
        expect(cache.size).toBe(3);
    });

    it("should free what the last build did not use beyond the capacity", () => {
        // Arrange
        const cache = new DesignCache(0);
        runDesign(withPurge("first"), {}, { occt, occ: kernel, cache });

        // Act
        runDesign({ schemaVersion: 1, features: [] }, {}, { occt, occ: kernel, cache });

        // Assert
        expect(cache.size).toBe(0);
    });
});
