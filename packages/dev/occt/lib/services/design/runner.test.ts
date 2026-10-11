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

class KeepingCache extends DesignCache {
    readonly kept: string[] = [];
    override keep(hash: string, outcome: Parameters<DesignCache["keep"]>[1]): void {
        this.kept.push(hash);
        super.keep(hash, outcome);
    }
}

const SQUARE: Models.OCCT.DesignPenCommand[] = [{ type: "hLine", length: 4 }, { type: "vLine", length: 4 }, { type: "hLine", length: -4 }, { type: "close" }];

const rounded: Models.OCCT.DesignPartDocument = {
    schemaVersion: 1,
    features: [
        { id: "base", type: "sketch", on: { plane: "XY" }, pen: SQUARE },
        { id: "block", type: "extrude", profile: "base", distance: 2 },
        { id: "round", type: "fillet", body: "block", radius: 0.5, edges: { between: [{ of: "block", role: "end" }, { of: "block", role: "side" }], count: 4 } },
    ],
};

const purgedInPlace: Models.OCCT.DesignFeature = { id: "purged", type: "operation", operation: "occt.shapes.shape.purgeInternalEdges", params: { shape: { body: "block" } }, body: "block" };

const purgedAside: Models.OCCT.DesignFeature = { id: "aside", type: "operation", operation: "occt.shapes.shape.purgeInternalEdges", params: { shape: { body: "block" } } };

const topSketch: Models.OCCT.DesignFeature = { id: "top", type: "sketch", on: { face: { of: "block", role: "end", count: 1 } }, pen: SQUARE };

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

    it("should make nothing before the outcome the caller supplies for a part's last feature, and build the same part from it", () => {
        // Arrange
        const first = runDesign(rounded, {}, { occt, occ: kernel, base, cache: new DesignCache(0) });
        const part = first.parts[0]!;
        const cache = new KeepingCache(256);

        // Act
        const again = runDesign(rounded, {}, { occt, occ: kernel, base, cache, outcomes: [{ hash: part.shapeHash, shape: part.shape, names: part.faceNames }] });

        // Assert
        expect(again.report.map(entry => [entry.id, entry.status, entry.cached])).toEqual([["base", "ok", true], ["block", "ok", true], ["round", "ok", false]]);
        expect(cache.kept).toEqual([part.shapeHash]);
        expect(again.parts[0]!.faceNames).toEqual(part.faceNames);
        expect(again.parts[0]!.shapeHash).toBe(part.shapeHash);
        expect(occt.shapes.solid.getSolidVolume({ shape: again.parts[0]!.shape })).toBeCloseTo(occt.shapes.solid.getSolidVolume({ shape: part.shape }), 6);
    });

    it("should still make a feature nothing reads and what it is drawn on, so a failure in one is reported", () => {
        // Arrange
        const [sketch, block, round] = rounded.features;
        const document: Models.OCCT.DesignPartDocument = { schemaVersion: 1, features: [sketch!, block!, { id: "mark", type: "sketch", on: { face: { of: "block", role: "end", count: 1 } }, pen: SQUARE }, round!, { id: "stray", type: "sketch", on: { face: { of: "block", role: "end", count: 3 } }, pen: SQUARE }] };
        const first = runDesign(document, {}, { occt, occ: kernel, base, cache: new DesignCache(0) });
        const part = first.parts[0]!;

        // Act
        const again = runDesign(document, {}, { occt, occ: kernel, base, cache: new DesignCache(256), outcomes: [{ hash: part.shapeHash, shape: part.shape, names: part.faceNames }] });

        // Assert
        expect(again.report.map(entry => [entry.id, entry.status, entry.cached])).toEqual([["base", "ok", false], ["block", "ok", false], ["mark", "ok", false], ["round", "ok", false], ["stray", "failed", false]]);
    });

    it("should make the sketches a build hands back, and what they are drawn on, but nothing only the supplied part needs", () => {
        // Arrange
        const document: Models.OCCT.DesignPartDocument = { ...rounded, features: [...rounded.features, { id: "top", type: "sketch", on: { face: { of: "block", role: "end", count: 1 } }, pen: SQUARE }] };
        const first = runDesign(document, {}, { occt, occ: kernel, base, cache: new DesignCache(0) });
        const part = first.parts[0]!;

        // Act
        const again = runDesign(document, {}, { occt, occ: kernel, base, cache: new DesignCache(256), sketches: true, outcomes: [{ hash: part.shapeHash, shape: part.shape, names: part.faceNames }] });

        // Assert
        expect(again.report.map(entry => [entry.id, entry.status, entry.cached])).toEqual([["base", "ok", false], ["block", "ok", true], ["round", "ok", false], ["top", "ok", false]]);
        expect(again.sketches?.map(sketch => sketch.id)).toEqual(["base", "top"]);
    });

    it("should make nothing the cache's outcomes cover, even when it lost the ones before them", () => {
        // Arrange
        const [sketch, block, round] = rounded.features;
        const document: Models.OCCT.DesignPartDocument = { schemaVersion: 1, features: [sketch!, block!, topSketch, round!] };
        const cache = new KeepingCache(3);
        runDesign(document, {}, { occt, occ: kernel, base, cache });
        runDesign({ schemaVersion: 1, features: [{ id: "other", type: "sketch", on: { plane: "XZ" }, pen: SQUARE }] }, {}, { occt, occ: kernel, base, cache });
        const keptBefore = cache.kept.length;

        // Act
        const again = runDesign(document, {}, { occt, occ: kernel, base, cache });

        // Assert
        expect(cache.kept.length).toBe(keptBefore);
        expect(again.report.map(entry => [entry.status, entry.cached])).toEqual([["ok", true], ["ok", true], ["ok", true], ["ok", true]]);
    });

    it("should keep what a suppressed feature reads on a body the build did not make", () => {
        // Arrange
        const [sketch, block, round] = rounded.features;
        const soft: Models.OCCT.DesignFeature = { id: "soft", type: "fillet", body: "block", radius: 0.2, edges: { between: [{ of: "block", role: "end" }, { of: "block", role: "side" }], count: 4 }, suppressed: "!plain" };
        const document: Models.OCCT.DesignPartDocument = { schemaVersion: 1, parameters: { plain: false }, features: [sketch!, block!, soft, round!] };
        const first = runDesign(document, {}, { occt, occ: kernel, base, cache: new DesignCache(0) });
        const part = first.parts[0]!;

        // Act
        const again = runDesign(document, {}, { occt, occ: kernel, base, cache: new DesignCache(256), outcomes: [{ hash: part.shapeHash, shape: part.shape, names: part.faceNames }] });

        // Assert
        expect(again.report.map(entry => [entry.status, entry.cached])).toEqual([["ok", true], ["ok", true], ["suppressed", false], ["ok", false]]);
        expect(again.parts[0]!.itemKey).toBe(part.itemKey);
    });

    it("should read a body the build skipped as it was last written, even where an older one was made", () => {
        // Arrange
        const [sketch, block, round] = rounded.features;
        const document: Models.OCCT.DesignPartDocument = { schemaVersion: 1, features: [sketch!, block!, topSketch, round!, purgedInPlace] };
        const first = runDesign(document, {}, { occt, occ: kernel, base, cache: new DesignCache(0) });
        const part = first.parts[0]!;

        // Act
        const again = runDesign(document, {}, { occt, occ: kernel, base, cache: new DesignCache(256), sketches: true, outcomes: [{ hash: part.shapeHash, shape: part.shape, names: part.faceNames }] });

        // Assert
        expect(again.report.map(entry => [entry.id, entry.cached])).toEqual([["base", false], ["block", false], ["top", false], ["round", true], ["purged", false]]);
        expect(again.parts.map(each => each.shapeHash)).toEqual([part.shapeHash]);
    });

    it("should read a body the build made from a supplied outcome as that outcome, not as the skipped one before it", () => {
        // Arrange
        const [sketch, block, round] = rounded.features;
        const document: Models.OCCT.DesignPartDocument = { schemaVersion: 1, features: [sketch!, block!, round!, topSketch, purgedAside] };
        const first = runDesign(document, {}, { occt, occ: kernel, base, cache: new DesignCache(0) });
        const prefix = runDesign(rounded, {}, { occt, occ: kernel, base, cache: new DesignCache(0) });
        const outcomes = [...first.parts, ...prefix.parts].map(part => ({ hash: part.shapeHash, shape: part.shape, names: part.faceNames }));

        // Act
        const again = runDesign(document, {}, { occt, occ: kernel, base, cache: new DesignCache(256), sketches: true, outcomes });

        // Assert
        expect(again.report.map(entry => [entry.id, entry.cached])).toEqual([["base", false], ["block", true], ["round", false], ["top", false], ["aside", false]]);
        expect(again.parts.map(each => each.shapeHash)).toEqual(first.parts.map(each => each.shapeHash));
    });

    it("should skip a body a supplied outcome used up as a tool, as it skips the one it changed", () => {
        // Arrange
        const document: Models.OCCT.DesignPartDocument = {
            schemaVersion: 1,
            features: [
                { id: "base", type: "sketch", on: { plane: "XY" }, pen: SQUARE },
                { id: "block", type: "extrude", profile: "base", distance: 2 },
                { id: "dot", type: "sketch", on: { plane: "XY" }, start: [1, 1], pen: [{ type: "hLine", length: 1 }, { type: "vLine", length: 1 }, { type: "hLine", length: -1 }, { type: "close" }] },
                { id: "pin", type: "extrude", profile: "dot", distance: 5 },
                { id: "cut", type: "boolean", operation: "difference", body: "block", tools: ["pin"] },
            ],
        };
        const first = runDesign(document, {}, { occt, occ: kernel, base, cache: new DesignCache(0) });
        const part = first.parts[0]!;
        const cache = new KeepingCache(256);

        // Act
        const again = runDesign(document, {}, { occt, occ: kernel, base, cache, outcomes: [{ hash: part.shapeHash, shape: part.shape, names: part.faceNames }] });

        // Assert
        expect(first.parts.map(each => each.id)).toEqual(["block"]);
        expect(cache.kept).toEqual([part.shapeHash]);
        expect(again.report.map(entry => entry.cached)).toEqual([true, true, true, true, false]);
    });

    it("should make every feature when a build traces, whatever it is given", () => {
        // Arrange
        const first = runDesign(rounded, {}, { occt, occ: kernel, base, cache: new DesignCache(0) });
        const part = first.parts[0]!;
        const trace = new Map();

        // Act
        const { report } = runFeatures(rounded, {}, { occt, occ: kernel, base, cache: new DesignCache(256), outcomes: [{ hash: part.shapeHash, shape: part.shape, names: part.faceNames }] }, trace);

        // Assert
        expect(report.map(entry => entry.cached)).toEqual([false, false, false]);
        expect(trace.has("/features/0")).toBe(true);
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
