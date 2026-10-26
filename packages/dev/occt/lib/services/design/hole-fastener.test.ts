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

    it("should refuse a hole with both a diameter and a fastener, one with neither, a size or fit it does not know, and a head beside a counterbore or in a tapped hole", () => {
        // Act
        const issues = [
            ...issuesOf(plate({ diameter: 5, fastener: { size: "M6" } })),
            ...issuesOf(plate({})),
            ...issuesOf(plate({ fastener: { size: "M7" } })),
            ...issuesOf(plate({ fastener: { size: "M6", fit: "snug" as "close" } })),
            ...issuesOf(plate({ fastener: { size: "M6", head: "socket" }, counterbore: { diameter: 12, depth: 3 } })),
            ...issuesOf(plate({ fastener: { size: "M6", fit: "tapped", head: "socket" } })),
        ];

        // Assert
        expect(issues).toEqual([
            "/features/2/fastener: a hole is sized by its diameter or by its fastener, one of the two",
            "/features/2: a hole is sized by its diameter or by its fastener, one of the two",
            "/features/2/fastener/size: an ISO fastener's size is one of M1.6, M2, M2.5, M3, M4, M5, M6, M8, M10, M12, M14, M16, M20, M24, or { expr }",
            "/features/2/fastener/fit: a fastener's fit is close, normal, loose, tapped",
            "/features/2/fastener/head: a fastener's head makes the hole's counterbore, so the hole takes no counterbore or countersink of its own",
            "/features/2/fastener/head: a tapped hole takes the screw's thread, so it has no counterbore for its head",
        ]);
    });

    it("should size an M6 hole and its socket head's counterbore in an inch document in inches, as the millimetres they are", () => {
        // Arrange
        const inches = (document: Document): Document => ({ ...document, units: { length: "in" }, features: document.features.map(feature => feature.type === "extrude" ? { ...feature, distance: 0.5 } : feature.type === "sketch" ? { ...feature, start: [-1, -1], pen: [{ type: "hLine", length: 2 }, { type: "vLine", length: 2 }, { type: "hLine", length: -2 }, { type: "close" }] } : feature) });

        // Act
        const clearance = volumeOf(inches(plate({ fastener: { size: "M6" } })));
        const counterbored = volumeOf(inches(plate({ fastener: { size: "M6", head: "socket" } })));

        // Assert
        expect(clearance).toBeCloseTo(2 * 2 * 0.5 - hole(6.6 / 25.4, 0.5), 9);
        expect(counterbored).toBeCloseTo(2 * 2 * 0.5 - hole(6.6 / 25.4, 0.5 - 6.5 / 25.4) - hole(11 / 25.4, 6.5 / 25.4), 9);
    });

    describe("ANSI fasteners", () => {
        const inchPlate = (hole: Partial<Models.OCCT.DesignHoleFeature>): Document => {
            const document = plate(hole);
            return { ...document, units: { length: "in" }, features: document.features.map(feature => feature.type === "extrude" ? { ...feature, distance: 0.5 } : feature.type === "sketch" ? { ...feature, start: [-1, -1], pen: [{ type: "hLine", length: 2 }, { type: "vLine", length: 2 }, { type: "hLine", length: -2 }, { type: "close" }] } : feature) };
        };
        const INCH_PLATE = 2 * 2 * 0.5;

        it("should drill a 1/4 clearance hole, a tapped one and a socket head's counterbore from the inch tables", () => {
            // Act
            const clearance = volumeOf(inchPlate({ fastener: { standard: "ansi", size: "1/4" } }));
            const tapped = volumeOf(inchPlate({ fastener: { standard: "ansi", size: "1/4", fit: "tapped" } }));
            const counterbored = volumeOf(inchPlate({ fastener: { standard: "ansi", size: "1/4", head: "socket" } }));

            // Assert
            expect(clearance).toBeCloseTo(INCH_PLATE - hole(0.281, 0.5), 9);
            expect(tapped).toBeCloseTo(INCH_PLATE - hole(0.25, 0.5), 9);
            expect(counterbored).toBeCloseTo(INCH_PLATE - hole(0.281, 0.23) - hole(0.4375, 0.27), 9);
        });

        it("should size an ANSI hole in a millimetre document as the inches it is", () => {
            // Act
            const volume = volumeOf(plate({ fastener: { standard: "ansi", size: "#10", fit: "close" } }));

            // Assert
            expect(volume).toBeCloseTo(PLATE - hole(0.206 * 25.4, 10), 6);
        });

        it("should tap a #0 hole only in the fine series, its only one, naming the series when asked for the coarse", () => {
            // Arrange
            const coarse = inchPlate({ fastener: { standard: "ansi", size: "#0", fit: "tapped" } });

            // Act
            const fine = volumeOf(inchPlate({ fastener: { standard: "ansi", size: "#0", series: "UNF", fit: "tapped" } }));
            const refused = occt.design.build({ document: coarse }).report.flatMap(entry => entry.messages);

            // Assert
            expect(fine).toBeCloseTo(INCH_PLATE - hole(0.06, 0.5), 9);
            expect(refused.join(" ")).toMatch(/#0 has no coarse thread/);
        });

        it("should refuse an ISO size under the ANSI standard, a series on an ISO fastener and a standard it does not know", () => {
            // Act
            const issues = [
                ...issuesOf(plate({ fastener: { standard: "ansi", size: "M6" } })),
                ...issuesOf(plate({ fastener: { size: "M6", series: "UNC" } })),
                ...issuesOf(plate({ fastener: { standard: "din" as "iso", size: "M6" } })),
            ];

            // Assert
            expect(issues).toEqual([
                "/features/2/fastener/size: an ANSI fastener's size is one of #0, #1, #2, #3, #4, #5, #6, #8, #10, #12, 1/4, 5/16, 3/8, 7/16, 1/2, 9/16, 5/8, 3/4, 7/8, 1, or { expr }",
                "/features/2/fastener/series: a series names an ANSI thread's pitch; an ISO fastener has none",
                "/features/2/fastener/standard: a fastener's standard is iso, ansi",
            ]);
        });
    });
});

