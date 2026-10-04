import { describe, it, expect, beforeAll } from "vitest";
import createBitbybitOcct, { BitbybitOcctModule } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import { VectorHelperService } from "../../api/vector-helper.service";
import { ShapesHelperService } from "../../api/shapes-helper.service";
import { OCCTService } from "../../occ-service";
import * as Models from "../../api/models";

type Document = Models.OCCT.DesignPartDocument;

const grid = (copy: Models.OCCT.DesignFaceReference["copy"]): Document => ({
    schemaVersion: 1,
    features: [
        { id: "base", type: "sketch", on: { plane: "XY" }, pen: [{ type: "hLine", length: 4 }, { type: "vLine", length: 4 }, { type: "hLine", length: -4 }, { type: "close" }] },
        { id: "block", type: "extrude", profile: "base", distance: 2 },
        { id: "rowX", type: "linearPattern", body: "block", direction: [1, 0, 0], spacing: 10, count: 3 },
        { id: "gridY", type: "linearPattern", body: "block", direction: [0, 1, 0], spacing: 10, count: 2 },
    ],
    parts: [{ id: "block", body: "block", appearance: { faces: [{ faces: { of: "block", role: "end", ...(copy === undefined ? {} : { copy }) }, color: "#ff0000" }] } }],
});

describe("references to copies", () => {
    let kernel: BitbybitOcctModule;
    let occt: OCCTService;

    beforeAll(async () => {
        kernel = await createBitbybitOcct();
        occt = new OCCTService(kernel, new OccHelper(new VectorHelperService(), new ShapesHelperService(), kernel));
    }, 120_000);

    const coloured = (copy: Models.OCCT.DesignFaceReference["copy"]): number => occt.design.build({ document: grid(copy) }).parts[0]!.appearance!.faces[0]!.indexes.length;

    it("should find the original at every level a reference does not list", () => {
        // Act
        const original = coloured(undefined);
        const secondRowOnly = coloured({ of: "gridY", index: 1 });
        const exact = coloured([{ of: "rowX", index: 2 }, { of: "gridY", index: 1 }]);

        // Assert
        expect([original, secondRowOnly, exact]).toEqual([1, 1, 1]);
    });

    it("should find every copy of a level, with its original, through all", () => {
        // Act
        const wholeRow = coloured([{ of: "rowX", index: "all" }, { of: "gridY", index: 1 }]);
        const firstRow = coloured({ of: "rowX", index: "all" });
        const everything = coloured([{ of: "rowX", index: "all" }, { of: "gridY", index: "all" }]);

        // Assert
        expect([wholeRow, firstRow, everything]).toEqual([3, 3, 6]);
    });

    it("should refuse a copy level that is listed twice, empty, or not a copy", () => {
        // Act
        const issues = [
            [{ of: "rowX", index: 1 }, { of: "rowX", index: 2 }],
            [],
            { of: "rowX", index: 0 },
            { of: "block", index: 1 },
        ].map(copy => occt.design.validate({ document: grid(copy as Models.OCCT.DesignFaceReference["copy"]) }));

        // Assert
        expect(issues).toEqual([
            [{ path: "/parts/0/appearance/faces/0/faces/copy/1", message: "\"rowX\" is listed twice: give each level once" }],
            [{ path: "/parts/0/appearance/faces/0/faces/copy", message: "copy is { of, index } or a list of them, one per level" }],
            [{ path: "/parts/0/appearance/faces/0/faces/copy", message: "a copy is { of: <pattern or mirror id>, index: 1 or more, or \"all\" }" }],
            [{ path: "/parts/0/appearance/faces/0/faces/copy", message: "a copy is { of: <pattern or mirror id>, index: 1 or more, or \"all\" }" }],
        ]);
    });
});
