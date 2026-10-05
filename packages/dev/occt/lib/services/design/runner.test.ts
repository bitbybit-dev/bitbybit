import { describe, it, expect, beforeAll } from "vitest";
import type { BitbybitOcctModule } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import createBitbybitOcct from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import { VectorHelperService } from "../../api/vector-helper.service";
import { ShapesHelperService } from "../../api/shapes-helper.service";
import { OCCTService } from "../../occ-service";
import type * as Models from "../../api/models";
import { DesignCache } from "./cache";
import { runDesign, runFeatures } from "./runner";
import { BaseBitByBit } from "../../base";

const base = new BaseBitByBit();

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
        runDesign(withPurge("first"), {}, { occt, occ: kernel, base, cache });

        // Act
        const second = runDesign(withPurge("second"), {}, { occt, occ: kernel, base, cache });
        const third = runDesign(withPurge("third"), {}, { occt, occ: kernel, base, cache });

        // Assert
        expect(second.report.map(entry => [entry.status, entry.cached])).toEqual([["ok", true], ["ok", true], ["ok", false]]);
        expect(third.report.map(entry => entry.status)).toEqual(["ok", "ok", "ok"]);
        expect(occt.shapes.solid.getSolidVolume({ shape: third.parts[1]!.shape })).toBeCloseTo(27, 6);
        expect(cache.size).toBe(3);
    });

    it("should face a sketch of loops along its normal, whichever way round its loops are drawn", () => {
        // Arrange
        const square = (half: number, clockwise: boolean): Models.OCCT.DesignLoop => ({
            start: [-half, -half],
            pen: clockwise
                ? [{ type: "vLine", length: 2 * half }, { type: "hLine", length: 2 * half }, { type: "vLine", length: -2 * half }, { type: "close" }]
                : [{ type: "hLine", length: 2 * half }, { type: "vLine", length: 2 * half }, { type: "hLine", length: -2 * half }, { type: "close" }],
        });
        const framed = (clockwise: boolean): Models.OCCT.DesignPartDocument => ({
            schemaVersion: 1,
            features: [{ id: "s", type: "sketch", on: { plane: "XY" }, loops: [square(10, clockwise), square(2, !clockwise)] }],
        });

        // Act
        const normals = [true, false].map(clockwise => {
            const { run } = runFeatures(framed(clockwise), {}, { occt, occ: kernel, base, cache: new DesignCache(0) });
            return occt.analysis.signatures({ shape: run.sketches.get("s")!.shape }).faces.map(face => face.normal.map(value => value + 0));
        });

        // Assert
        expect(normals).toEqual([[[0, 0, 1]], [[0, 0, 1]]]);
    });

    it("should free what the last build did not use beyond the capacity", () => {
        // Arrange
        const cache = new DesignCache(0);
        runDesign(withPurge("first"), {}, { occt, occ: kernel, base, cache });

        // Act
        runDesign({ schemaVersion: 1, features: [] }, {}, { occt, occ: kernel, base, cache });

        // Assert
        expect(cache.size).toBe(0);
    });
});
