import { describe, it, expect, beforeAll } from "vitest";
import createBitbybitOcct from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import { VectorHelperService } from "../../api/vector-helper.service";
import { ShapesHelperService } from "../../api/shapes-helper.service";
import { OCCTService } from "../../occ-service";
import type * as Models from "../../api/models";
import { InputError } from "@bitbybit-dev/base";

const PLATE_ID = "11111111-1111-4111-8111-111111111111";
const POST_ID = "22222222-2222-4222-8222-222222222222";

const square = (id: string, width: number, depth: number, start: [number, number] = [0, 0]): Models.OCCT.DesignSketchFeature => ({
    id,
    type: "sketch",
    on: { plane: "XY" },
    start,
    pen: [{ type: "hLine", length: width }, { type: "vLine", length: depth }, { type: "hLine", length: -width }, { type: "close" }],
});

const plate: Models.OCCT.DesignPartDocument = {
    schemaVersion: 1,
    id: PLATE_ID,
    features: [square("base", 40, 20), { id: "plate", type: "extrude", profile: "base", distance: 10 }],
    parts: [{ id: "plate", body: "plate", connectors: [{ id: "top", on: { of: "plate", role: "end" }, origin: [20, 10, 10] }] }],
};

const post: Models.OCCT.DesignPartDocument = {
    schemaVersion: 1,
    id: POST_ID,
    features: [square("base", 4, 4, [-2, -2]), { id: "post", type: "extrude", profile: "base", distance: 6 }],
    parts: [{ id: "post", body: "post", connectors: [{ id: "bottom", on: { of: "post", role: "start" } }] }],
};

const stand = (extra: Models.OCCT.DesignComponent[]): Models.OCCT.DesignAssemblyDocument => ({
    schemaVersion: 1,
    kind: "assembly",
    components: [
        { id: "plate", source: { document: PLATE_ID, part: "plate" } },
        { id: "upright", source: { document: POST_ID, part: "post" } },
        ...extra,
    ],
    joints: [{ id: "uprightOnPlate", type: "fastened", component: "upright", connector: "bottom", to: { component: "plate", connector: "top" } }],
});

describe("clashes in a design build", () => {
    let occt: OCCTService;

    beforeAll(async () => {
        const kernel = await createBitbybitOcct();
        occt = new OCCTService(kernel, new OccHelper(new VectorHelperService(), new ShapesHelperService(), kernel));
    }, 120_000);

    it("should find nothing where the only contact is the one a joint asks for", () => {
        // Act
        const clashes = occt.design.clashes({ document: stand([]), documents: [plate, post] });

        // Assert
        expect(clashes).toEqual([]);
    });

    it("should list a part placed into another with the volume they share, and one placed beside it within the clearance", () => {
        // Arrange
        const document = stand([
            { id: "sunk", source: { document: POST_ID, part: "post" }, at: { origin: [5, 5, 7], normal: [0, 0, 1], direction: [1, 0, 0] } },
            { id: "near", source: { document: POST_ID, part: "post" }, at: { origin: [43, 10, 0], normal: [0, 0, 1], direction: [1, 0, 0] } },
        ]);

        // Act
        const touching = occt.design.clashes({ document, documents: [plate, post] });
        const roomy = occt.design.clashes({ document, documents: [plate, post], clearance: 2 });

        // Assert
        expect(touching.map(clash => [clash.components, clash.joined])).toEqual([[["plate", "sunk"], false]]);
        expect(touching[0]?.volume).toBeCloseTo(4 * 4 * 3, 6);
        expect(touching[0]?.distance).toBe(0);
        expect(roomy.map(clash => clash.components)).toEqual([["plate", "sunk"], ["plate", "near"]]);
        expect(roomy[1]?.distance).toBeCloseTo(1, 6);
        expect(roomy[1]?.volume).toBe(0);
    });

    it("should list an overlap between joined parts, and check a part document's parts where they were built", () => {
        // Arrange
        const sunk: Models.OCCT.DesignAssemblyDocument = { ...stand([]), joints: [{ id: "uprightInPlate", type: "slider", component: "upright", connector: "bottom", to: { component: "plate", connector: "top" }, offset: -1 }] };
        const pair: Models.OCCT.DesignPartDocument = { schemaVersion: 1, features: [square("a", 4, 4), { id: "first", type: "extrude", profile: "a", distance: 2 }, square("b", 4, 4, [3, 0]), { id: "second", type: "extrude", profile: "b", distance: 2 }] };

        // Act
        const joinedOverlap = occt.design.clashes({ document: sunk, documents: [plate, post] });
        const parts = occt.design.clashes({ document: pair });

        // Assert
        expect(joinedOverlap.map(clash => [clash.components, clash.joined])).toEqual([[["plate", "upright"], true]]);
        expect(joinedOverlap[0]?.volume).toBeCloseTo(16, 6);
        expect(parts.map(clash => clash.components)).toEqual([["first", "second"]]);
        expect(parts[0]?.volume).toBeCloseTo(2 * 4 * 1, 6);
    });

    it("should check the parts inside a sub-assembly and leave a joint to a fixed frame out of the joined pairs", () => {
        // Arrange
        const STAND_ID = "33333333-3333-4333-8333-333333333333";
        const inner: Models.OCCT.DesignAssemblyDocument = { ...stand([]), id: STAND_ID };
        const rig: Models.OCCT.DesignAssemblyDocument = {
            schemaVersion: 1,
            kind: "assembly",
            components: [
                { id: "stand", source: { document: STAND_ID } },
                { id: "pin", source: { document: POST_ID, part: "post" } },
            ],
            joints: [{ id: "pinHeld", type: "fastened", component: "pin", connector: "bottom", to: { frame: { origin: [20, 10, 8], normal: [0, 0, 1], direction: [1, 0, 0] } } }],
        };

        // Act
        const clashes = occt.design.clashes({ document: rig, documents: [inner, plate, post] });

        // Assert
        expect(clashes.map(clash => [clash.components, clash.joined])).toEqual([[["stand/plate", "pin"], false], [["stand/upright", "pin"], false]]);
        expect(clashes[0]?.volume).toBeCloseTo(4 * 4 * 2, 6);
    });

    it("should refuse a clearance below 0", () => {
        // Act
        const negative = (): unknown => occt.design.clashes({ document: stand([]), documents: [plate, post], clearance: -1 });

        // Assert
        expect(negative).toThrow(InputError);
        expect(negative).toThrow("The clearance is a number from 0, not -1.");
    });
});
