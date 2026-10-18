import { beforeAll, describe, expect, it } from "vitest";
import createBitbybitOcct from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OCCTService } from "../../occ-service";
import type * as Models from "../../api/models";

type Document = Models.OCCT.DesignPartDocument;

const PLATE = 40 * 40 * 10;

const plate = (hole: Partial<Models.OCCT.DesignHoleFeature>, parameters: Document["parameters"] = {}): Document => ({
    schemaVersion: 1,
    parameters,
    features: [
        { id: "outline", type: "sketch", on: { plane: "XY" }, start: [-20, -20], pen: [{ type: "hLine", length: 40 }, { type: "vLine", length: 40 }, { type: "hLine", length: -40 }, { type: "close" }] },
        { id: "plate", type: "extrude", profile: "outline", distance: 10 },
        { id: "holes", type: "hole", body: "plate", on: { of: "plate", role: "end" }, at: [{ id: "a", x: 0, y: 0 }], ...hole },
    ],
});

describe("OCCT design: holes sized by their fastener", () => {
    let occt: OCCTService;

    beforeAll(async () => {
        const kernel = await createBitbybitOcct();
        occt = new OCCTService(kernel);
    }, 120_000);

    const built = (document: Document): Models.OCCT.DesignBuiltPart<unknown> => {
        const result = occt.design.build({ document });
        expect(result.report.map(entry => entry.messages).flat()).toEqual([]);
        return result.parts[0]!;
    };
    const volumeOf = (document: Document): number => occt.shapes.solid.getSolidVolume({ shape: built(document).shape as never });
    const hole = (diameter: number, depth: number): number => Math.PI * diameter * diameter / 4 * depth;
    const issuesOf = (document: Document): string[] => occt.design.validate({ document }).map(issue => `${issue.path}: ${issue.message}`);

    it("should drill an M6 clearance hole 6.6 across for a normal fit, 6.4 for a close one and 7 for a loose one, none of them threaded", () => {
        // Act
        const normal = built(plate({ fastener: { size: "M6" } }));
        const close = volumeOf(plate({ fastener: { size: "M6", fit: "close" } }));
        const loose = volumeOf(plate({ fastener: { size: "M6", fit: "loose" } }));

        // Assert
        expect(occt.shapes.solid.getSolidVolume({ shape: normal.shape as never })).toBeCloseTo(PLATE - hole(6.6, 10), 4);
        expect(close).toBeCloseTo(PLATE - hole(6.4, 10), 4);
        expect(loose).toBeCloseTo(PLATE - hole(7, 10), 4);
        expect(normal.faceNames.filter(names => names.includes("holes:thread"))).toEqual([]);
    });

    it("should drill a tapped hole at the thread's nominal diameter and name only its wall at that diameter thread, not its floor", () => {
        // Act
        const part = built(plate({ fastener: { size: "M6", fit: "tapped" }, depth: 8 }));

        // Assert
        const named = (name: string): number[] => part.faceNames.flatMap((names, index) => names.includes(name) ? [index] : []);
        const signatures = occt.analysis.signatures({ shape: part.shape as never }).faces;
        expect(occt.shapes.solid.getSolidVolume({ shape: part.shape as never })).toBeCloseTo(PLATE - hole(6, 8), 4);
        expect(named("holes:wall")).toHaveLength(2);
        expect(named("holes:thread")).toHaveLength(1);
        expect(signatures[named("holes:thread")[0]!]!.type).toBe("cylinder");
        expect(signatures[named("holes:thread")[0]!]!.area).toBeCloseTo(Math.PI * 6 * 8, 6);
    });

    it("should leave a counterbore of a tapped hole out of its thread", () => {
        // Act
        const part = built(plate({ fastener: { size: "M6", fit: "tapped" }, depth: 8, counterbore: { diameter: 10, depth: 2 } }));

        // Assert
        const threads = part.faceNames.flatMap((names, index) => names.includes("holes:thread") ? [index] : []);
        const signatures = occt.analysis.signatures({ shape: part.shape as never }).faces;
        expect(threads).toHaveLength(1);
        expect(signatures[threads[0]!]!.area).toBeCloseTo(Math.PI * 6 * 6, 6);
    });

    it("should sink a socket head with the counterbore DIN 974-1 gives, its head height plus half a millimetre deep", () => {
        // Act
        const volume = volumeOf(plate({ fastener: { size: "M5", head: "socket" } }));

        // Assert
        expect(volume).toBeCloseTo(PLATE - hole(5.5, 10 - 5.5) - hole(10, 5.5), 4);
    });

    it("should take its size from a text parameter", () => {
        // Act
        const volume = volumeOf(plate({ fastener: { size: { expr: "size" } } }, { size: { value: "M8", type: "text" } }));

        // Assert
        expect(volume).toBeCloseTo(PLATE - hole(9, 10), 4);
    });

    it("should refuse a hole with both a diameter and a fastener, one with neither, a size or fit it does not know, a head beside a counterbore or in a tapped hole, and a fastener in a document not in millimetres", () => {
        // Act
        const issues = [
            ...issuesOf(plate({ diameter: 5, fastener: { size: "M6" } })),
            ...issuesOf(plate({})),
            ...issuesOf(plate({ fastener: { size: "M7" } })),
            ...issuesOf(plate({ fastener: { size: "M6", fit: "snug" as "close" } })),
            ...issuesOf(plate({ fastener: { size: "M6", head: "socket" }, counterbore: { diameter: 12, depth: 3 } })),
            ...issuesOf(plate({ fastener: { size: "M6", fit: "tapped", head: "socket" } })),
            ...issuesOf({ ...plate({ fastener: { size: "M6" } }), units: { length: "in" } }),
        ];

        // Assert
        expect(issues).toEqual([
            "/features/2/fastener: a hole is sized by its diameter or by its fastener, one of the two",
            "/features/2: a hole is sized by its diameter or by its fastener, one of the two",
            "/features/2/fastener/size: a fastener's size is one of M1.6, M2, M2.5, M3, M4, M5, M6, M8, M10, M12, M14, M16, M20, M24, or { expr }",
            "/features/2/fastener/fit: a fastener's fit is close, normal, loose, tapped",
            "/features/2/fastener/head: a fastener's head makes the hole's counterbore, so the hole takes no counterbore or countersink of its own",
            "/features/2/fastener/head: a tapped hole takes the screw's thread, so it has no counterbore for its head",
            "/features/2/fastener: a fastener sizes holes in millimetres, and this document is in in: give the hole a diameter",
        ]);
    });
});
