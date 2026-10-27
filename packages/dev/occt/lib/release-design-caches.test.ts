import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import createBitbybitOcct from "../bitbybit-dev-occt/bitbybit-dev-occt";
import type { BitbybitOcctModule, TopoDS_Shape } from "../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "./occ-helper";
import { OCCTService } from "./occ-service";
import type * as Inputs from "./api/inputs";
import type * as Models from "./api/models";
import { releaseDesignCaches } from "./release-design-caches";
import { handlesIn, namesOf, openWindow } from "../../__test__/embind-ledger";
import type { LedgerWindow } from "../../__test__/embind-ledger-types";

const ACROSS_X_AT_10: Inputs.Base.Frame = { origin: [10, 0, 0], normal: [1, 0, 0], direction: [0, 1, 0] };
const CLOSE = 6;

const plateDocument: Models.OCCT.DesignPartDocument = {
    schemaVersion: 1,
    features: [
        { id: "base", type: "sketch", on: { plane: "XY" }, start: [0, 0], pen: [{ type: "hLine", length: 40 }, { type: "vLine", length: 20 }, { type: "hLine", length: -40 }, { type: "close" }] },
        { id: "plate", type: "extrude", profile: "base", distance: 10 },
    ],
    parts: [{ id: "plate", body: "plate" }],
};

describe("releaseDesignCaches", () => {
    let kernel: BitbybitOcctModule;
    let occt: OCCTService;

    beforeAll(async () => {
        kernel = await createBitbybitOcct();
    }, 120_000);

    beforeEach(() => {
        occt = new OCCTService(kernel, new OccHelper(kernel));
    });

    const madeWhile = (act: () => void): LedgerWindow => {
        const opened = openWindow();
        try {
            act();
        } finally {
            opened.close();
        }
        return opened;
    };
    const aliveOf = (opened: LedgerWindow): string[] => namesOf(opened.made().filter(handle => !handle.isDeleted()));
    const freed = (made: object): void => {
        handlesIn(made).forEach(handle => { handle.delete(); });
    };
    const sectionOf = (built: Models.OCCT.DesignBuildResult<TopoDS_Shape>): Models.OCCT.DesignSection<TopoDS_Shape> =>
        occt.design.section({ build: built, frame: ACROSS_X_AT_10, cut: true });
    const builtAndCut = (): { cached: boolean[]; volume: number | undefined; sizes: (number | undefined)[] } => {
        const built = occt.design.build({ document: plateDocument });
        const section = sectionOf(built);
        freed(section);
        freed(built);
        return { cached: built.report.map(entry => entry.cached), volume: built.parts[0]?.volume, sizes: section.parts.map(part => part.area ?? part.volume) };
    };

    it("should free the shapes the design builder kept from a build", () => {
        // Arrange
        const opened = madeWhile(() => freed(occt.design.build({ document: plateDocument })));
        const keptByTheBuild = aliveOf(opened);

        // Act
        releaseDesignCaches(occt);

        // Assert
        expect(keptByTheBuild).toEqual(["TopoDS_Face", "TopoDS_Shape"]);
        expect(aliveOf(opened)).toEqual([]);
    });

    it("should free the cap and the piece a section kept", () => {
        // Arrange
        const built = occt.design.build({ document: plateDocument });
        const opened = madeWhile(() => freed(sectionOf(built)));
        freed(built);
        const keptByTheSection = aliveOf(opened);

        // Act
        releaseDesignCaches(occt);

        // Assert
        expect(keptByTheSection).toEqual(["TopoDS_Compound", "TopoDS_Compound"]);
        expect(aliveOf(opened)).toEqual([]);
    });

    it("should leave the parts a build and a section returned to the caller whole", () => {
        // Arrange
        const built = occt.design.build({ document: plateDocument });
        const section = sectionOf(built);

        // Act
        releaseDesignCaches(occt);
        const sizes = [...built.parts, ...section.parts].map(part => occt.operations.boundingBoxOfShape({ shape: part.shape }).size.map(Math.round));
        freed(section);
        freed(built);

        // Assert
        expect(sizes).toEqual([[40, 20, 10], [0, 20, 10], [10, 20, 10]]);
    });

    it("should build every feature and cut every section again after the release, to the same sizes", () => {
        // Arrange
        const first = builtAndCut();
        releaseDesignCaches(occt);

        // Act
        const again = builtAndCut();

        // Assert
        expect(first.cached).toEqual([false, false]);
        expect(again.cached).toEqual([false, false]);
        expect(again.volume).toBeCloseTo(8000, CLOSE);
        expect(again.sizes).toHaveLength(2);
        expect(again.sizes[0]).toBeCloseTo(200, CLOSE);
        expect(again.sizes[1]).toBeCloseTo(2000, CLOSE);
    });

    it("should reuse every feature of a build again when nothing released what it kept", () => {
        // Arrange
        builtAndCut();

        // Act
        const again = builtAndCut();

        // Assert
        expect(again.cached).toEqual([true, true]);
    });

    it("should do nothing to a service that kept nothing, which then builds as usual", () => {
        // Act
        releaseDesignCaches(occt);
        const built = builtAndCut();

        // Assert
        expect(built.cached).toEqual([false, false]);
        expect(built.volume).toBeCloseTo(8000, CLOSE);
    });

    it("should leave nothing a build and a section kept alive, and the service able to build, when it is called twice", () => {
        // Arrange
        const opened = madeWhile(() => builtAndCut());

        // Act
        releaseDesignCaches(occt);
        releaseDesignCaches(occt);
        const again = builtAndCut();

        // Assert
        expect(aliveOf(opened)).toEqual([]);
        expect(again.cached).toEqual([false, false]);
        expect(again.sizes[0]).toBeCloseTo(200, CLOSE);
    });
});
