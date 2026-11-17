import { describe, it, expect, beforeAll, afterEach, vi } from "vitest";
import type { BitbybitOcctModule } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import createBitbybitOcct from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OCCTService } from "../../occ-service";
import type * as Models from "../../api/models";
import { isKeptNotValid } from "../base/booleans.service";
import { KEPT_NOT_VALID_NOTE } from "./helpers";

type Document = Models.OCCT.DesignPartDocument;

const KEPT_ALERT = "BitbybitBool_AlertInvalidResultKept";

const square = (id: string, x: number): Models.OCCT.DesignSketchFeature => ({
    id,
    type: "sketch",
    on: { plane: "XY" },
    start: [x, 0],
    pen: [{ type: "hLine", length: 10 }, { type: "vLine", length: 10 }, { type: "hLine", length: -10 }, { type: "close" }],
});

const twoBlocks = (cut: Models.OCCT.DesignFeature): Document => ({
    schemaVersion: 1,
    features: [
        square("aSketch", 0),
        { id: "a", type: "extrude", profile: "aSketch", distance: 5 },
        square("bSketch", 5),
        { id: "b", type: "extrude", profile: "bSketch", distance: 5 },
        cut,
    ],
});

const BOOLEAN_CUT: Models.OCCT.DesignFeature = { id: "cut", type: "boolean", operation: "difference", body: "a", tools: ["b"] };

const OPERATION_CUT: Models.OCCT.DesignFeature = { id: "cut", type: "operation", operation: "occt.booleans.difference", params: { shape: { body: "a" }, shapes: [{ body: "b" }] }, body: "a" };

describe("a boolean the kernel kept although it is not valid", () => {
    let kernel: BitbybitOcctModule;

    beforeAll(async () => {
        kernel = await createBitbybitOcct();
    }, 120_000);

    afterEach(() => {
        vi.restoreAllMocks();
    });

    const keptByTheKernel = (): void => {
        const cutWithHistory = kernel.BooleanCutWithHistory.bind(kernel);
        const cut = kernel.BooleanCut.bind(kernel);
        vi.spyOn(kernel, "BooleanCutWithHistory").mockImplementation((...args: Parameters<typeof cutWithHistory>) => ({ ...cutWithHistory(...args), errorAlerts: KEPT_ALERT }));
        vi.spyOn(kernel, "BooleanCut").mockImplementation((...args: Parameters<typeof cut>) => ({ ...cut(...args), errorAlerts: KEPT_ALERT }));
    };
    const cutReport = (built: Models.OCCT.DesignBuildResult<unknown>): Models.OCCT.DesignFeatureReport => built.report.find(entry => entry.id === "cut")!;

    it("should hand the shape back from the public booleans, tagged as kept, and tag nothing the kernel did not keep", () => {
        // Arrange
        const occt = new OCCTService(kernel);
        const plate = occt.shapes.solid.createBox({ width: 10, length: 10, height: 5, center: [0, 0, 0] });
        const tool = occt.shapes.solid.createBox({ width: 10, length: 10, height: 5, center: [5, 0, 0] });

        // Act
        const plain = occt.booleans.difference({ shape: plate, shapes: [tool] });
        keptByTheKernel();
        const kept = occt.booleans.difference({ shape: plate, shapes: [tool] });
        const keptWithHistory = occt.booleans.differenceWithHistory({ shape: plate, shapes: [tool] });

        // Assert
        expect([isKeptNotValid(plain), isKeptNotValid(kept), isKeptNotValid(keptWithHistory.shape)]).toEqual([false, true, true]);
        expect(occt.shapes.solid.getSolidVolume({ shape: kept })).toBeCloseTo(250, 6);
    });

    it("should say so on the line of a boolean feature, and still say so when the feature comes from the cache", () => {
        // Arrange
        const occt = new OCCTService(kernel);
        const document = twoBlocks(BOOLEAN_CUT);

        // Act
        keptByTheKernel();
        const made = occt.design.build({ document });
        vi.restoreAllMocks();
        const cached = occt.design.build({ document });

        // Assert
        expect(cutReport(made)).toEqual(expect.objectContaining({ status: "ok", cached: false, messages: [KEPT_NOT_VALID_NOTE] }));
        expect(cutReport(cached)).toEqual(expect.objectContaining({ status: "ok", cached: true, messages: [KEPT_NOT_VALID_NOTE] }));
        expect(made.report.filter(entry => entry.id !== "cut").flatMap(entry => entry.messages)).toEqual([]);
    });

    it("should say so on the line of an operation feature that names a boolean", () => {
        // Arrange
        const occt = new OCCTService(kernel);

        // Act
        keptByTheKernel();
        const built = occt.design.build({ document: twoBlocks(OPERATION_CUT) });

        // Assert
        expect(cutReport(built)).toEqual(expect.objectContaining({ status: "ok", messages: [KEPT_NOT_VALID_NOTE] }));
    });

    it("should say nothing on a boolean feature whose result came back valid", () => {
        // Arrange
        const occt = new OCCTService(kernel);

        // Act
        const built = occt.design.build({ document: twoBlocks(BOOLEAN_CUT) });

        // Assert
        expect(cutReport(built)).toEqual(expect.objectContaining({ status: "ok", messages: [] }));
    });
});
