import { describe, it, expect, beforeAll, vi } from "vitest";
import fc from "fast-check";
import type { BitbybitOcctModule } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import createBitbybitOcct from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OCCTService } from "../../occ-service";
import type * as Models from "../../api/models";
import { InputError } from "@bitbybit-dev/base";
import { releaseDesignCaches } from "../../release-design-caches";
import { namesOf, openWindow } from "../../../../__test__/embind-ledger";

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
    let kernel: BitbybitOcctModule;
    let occt: OCCTService;

    beforeAll(async () => {
        kernel = await createBitbybitOcct();
        occt = new OCCTService(kernel);
    }, 120_000);

    const provokedKernelFailure = (): never => {
        const loneTriangles = [0, 1].map(z => kernel.ReadStlFromBytes(new TextEncoder().encode(`solid t\nfacet normal 0 0 1\nouter loop\nvertex 0 0 ${z}\nvertex 1 0 ${z}\nvertex 0 1 ${z}\nendloop\nendfacet\nendsolid t\n`), false));
        try {
            kernel.ClashesBetween(loneTriangles, 2);
        } finally {
            loneTriangles.forEach(triangle => triangle.delete());
        }
        throw new Error("the kernel measured two lone triangles");
    };

    it("should keep nothing of the build it checked once the design caches are released", () => {
        // Arrange
        const opened = openWindow();

        // Act
        try {
            occt.design.clashes({ document: stand([{ id: "near", source: { document: POST_ID, part: "post" }, at: { origin: [43, 10, 0], normal: [0, 0, 1], direction: [1, 0, 0] } }]), documents: [plate, post], clearance: 0.5 });
        } finally {
            opened.close();
        }
        releaseDesignCaches(occt);

        // Assert
        expect(namesOf(opened.made().filter(handle => !handle.isDeleted()))).toEqual([]);
    });

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

    it("should answer a second check of an unchanged assembly from what the first measured, its points placed where the parts now are", () => {
        // Arrange
        const STAND_ID = "33333333-3333-4333-8333-333333333333";
        const document = stand([{ id: "sunk", source: { document: POST_ID, part: "post" }, at: { origin: [7, 6, 7.5], normal: [0, 0, 1], direction: [1, 0, 0] } }]);
        const moved = stand([{ id: "sunk", source: { document: POST_ID, part: "post" }, at: { origin: [15, 5, 8], normal: [0, 0, 1], direction: [1, 0, 0] } }]);
        const shifted: Models.OCCT.DesignAssemblyDocument = { schemaVersion: 1, kind: "assembly", components: [{ id: "stand", source: { document: STAND_ID }, at: { origin: [100, 0, 0], normal: [0, 0, 1], direction: [1, 0, 0] } }] };
        const measured = vi.spyOn(occt.analysis.clashes, "betweenShapes");

        // Act
        const first = occt.design.clashes({ document, documents: [plate, post] });
        const firstMeasured = measured.mock.calls.length;
        const again = occt.design.clashes({ document, documents: [plate, post] });
        const elsewhere = occt.design.clashes({ document: shifted, documents: [{ ...document, id: STAND_ID }, plate, post] });
        const cachedMeasured = measured.mock.calls.length;
        const remeasured = occt.design.clashes({ document: moved, documents: [plate, post] });
        measured.mockRestore();

        // Assert
        expect(firstMeasured).toBeGreaterThan(0);
        expect(cachedMeasured).toBe(firstMeasured);
        expect(again).toEqual(first);
        expect(elsewhere.map(clash => clash.components)).toEqual([["stand/plate", "stand/sunk"]]);
        expect(elsewhere[0]!.pointA).toEqual(first[0]!.pointA.map((value, axis) => expect.closeTo(value + (axis === 0 ? 100 : 0), 9)));
        expect(elsewhere[0]!.pointB).toEqual(first[0]!.pointB.map((value, axis) => expect.closeTo(value + (axis === 0 ? 100 : 0), 9)));
        expect(remeasured[0]?.volume).toBeCloseTo(4 * 4 * 2, 6);
        expect(remeasured[0]!.pointA[0]).toBeGreaterThanOrEqual(13 - 1e-9);
        expect(remeasured[0]!.pointA[0]).toBeLessThanOrEqual(17 + 1e-9);
    });

    it("should measure a part again once its geometry changes, though its id and values stay the same", () => {
        // Arrange
        const postOf = (width: number): Models.OCCT.DesignPartDocument => ({ ...post, features: [square("base", width, width, [-width / 2, -width / 2]), { id: "post", type: "extrude", profile: "base", distance: 6 }] });
        const document = stand([{ id: "pin", source: { document: POST_ID, part: "post" }, at: { origin: [45, 10, 0], normal: [0, 0, 1], direction: [1, 0, 0] } }]);
        const pairOf = (gap: number): Models.OCCT.DesignPartDocument => ({ schemaVersion: 1, features: [square("a", 4, 4), { id: "left", type: "extrude", profile: "a", distance: 2 }, square("b", 4, 4, [4 + gap, 0]), { id: "right", type: "extrude", profile: "b", distance: 2 }] });

        // Act
        const thin = occt.design.clashes({ document, documents: [plate, postOf(4)] });
        const wide = occt.design.clashes({ document, documents: [plate, postOf(20)] });
        const apart = occt.design.clashes({ document: pairOf(6) });
        const overlapping = occt.design.clashes({ document: pairOf(-1) });

        // Assert
        expect(thin).toEqual([]);
        expect(wide.map(clash => clash.components)).toEqual([["plate", "pin"]]);
        expect(wide[0]?.volume).toBeCloseTo(5 * 20 * 6, 6);
        expect(apart).toEqual([]);
        expect(overlapping[0]?.volume).toBeCloseTo(2 * 4 * 1, 6);
    });

    describe("a screw in a tapped hole", () => {
        const TAPPED_ID = "44444444-4444-4444-8444-444444444444";
        const PLAIN_ID = "55555555-5555-4555-8555-555555555555";
        const SCREW_ID = "66666666-6666-4666-8666-666666666666";
        const LARGE_ID = "77777777-7777-4777-8777-777777777777";
        const holed = (id: string, hole: Partial<Models.OCCT.DesignHoleFeature>): Models.OCCT.DesignPartDocument => ({
            schemaVersion: 1,
            id,
            features: [square("outline", 40, 40, [-20, -20]), { id: "plate", type: "extrude", profile: "outline", distance: 10 }, { id: "holes", type: "hole", body: "plate", on: { of: "plate", role: "end" }, at: [{ id: "a", x: 0, y: 0 }], depth: 8, ...hole }],
            parts: [{ id: "plate", body: "plate" }],
        });
        const screw = (id: string, size: string, length = 8): Models.OCCT.DesignPartDocument => ({
            schemaVersion: 1,
            id,
            features: [{ id: "part", type: "operation", operation: "occt.parts.mechanical.fasteners.socketHeadCapScrew", params: { size, length } }],
            parts: [{ id: "screw", body: "part" }],
        });
        const documents = [holed(TAPPED_ID, { fastener: { size: "M6", fit: "tapped" } }), holed(PLAIN_ID, { diameter: 6 }), screw(SCREW_ID, "M6"), screw(LARGE_ID, "M8")];
        const screwed = (plateId: string, screwId: string, seat: number): Models.OCCT.DesignAssemblyDocument => ({
            schemaVersion: 1,
            kind: "assembly",
            components: [
                { id: "plate", source: { document: plateId, part: "plate" } },
                { id: "screw", source: { document: screwId, part: "screw" }, at: { origin: [0, 0, seat], normal: [0, -1, 0], direction: [1, 0, 0] } },
            ],
        });

        it("should leave out the thread resting in its tapped hole, with the hole's rim and the screw's end chamfer, though no joint holds them", () => {
            // Act
            const plain = occt.design.clashes({ document: screwed(PLAIN_ID, SCREW_ID, 11), documents });
            const tapped = occt.design.clashes({ document: screwed(TAPPED_ID, SCREW_ID, 11), documents });
            const roomy = occt.design.clashes({ document: screwed(TAPPED_ID, SCREW_ID, 12.5), documents, clearance: 2 });

            // Assert
            expect(plain.map(clash => [clash.components, clash.distance, clash.volume])).toEqual([[["plate", "screw"], 0, 0]]);
            expect(tapped).toEqual([]);
            expect(roomy).toEqual([]);
        });

        it("should leave out a screw standing out of a hole drilled through, its thread ending where the hole does", () => {
            // Arrange
            const THROUGH_ID = "88888888-8888-4888-8888-888888888888";
            const LONG_ID = "99999999-9999-4999-8999-999999999999";
            const long: Models.OCCT.DesignPartDocument = { ...screw(LONG_ID, "M6"), features: [{ id: "part", type: "operation", operation: "occt.parts.mechanical.fasteners.socketHeadCapScrew", params: { size: "M6", length: 12 } }] };
            const through: Models.OCCT.DesignPartDocument = {
                schemaVersion: 1,
                id: THROUGH_ID,
                features: [square("outline", 40, 40, [-20, -20]), { id: "plate", type: "extrude", profile: "outline", distance: 10 }, { id: "holes", type: "hole", body: "plate", on: { of: "plate", role: "end" }, at: [{ id: "a", x: 0, y: 0 }], fastener: { size: "M6", fit: "tapped" } }],
                parts: [{ id: "plate", body: "plate" }],
            };
            const part = occt.design.build({ document: long }).parts[0]!;
            const thread = part.faceNames.findIndex(names => names.includes("part:thread"));
            const threadEnd = occt.analysis.measure.tightBoundingBox({ shape: occt.shapes.face.getFace({ shape: part.shape, index: thread }) }).min[1];

            // Act
            const clashes = occt.design.clashes({ document: screwed(THROUGH_ID, LONG_ID, -threadEnd), documents: [...documents, long, through] });

            // Assert
            expect(threadEnd).toBeLessThan(-10);
            expect(clashes).toEqual([]);
        });

        it("should still list what a thread does not ask for: a screw near the floor of its hole, one too small for it, a head seated in a counterbore and two screws side by side", () => {
            // Arrange
            const LONG_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
            const SMALL_ID = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
            const BORED_ID = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
            const SHORT_ID = "dddddddd-dddd-4ddd-8ddd-dddddddddddd";
            const extra = [screw(LONG_ID, "M6", 12), screw(SMALL_ID, "M5"), screw(SHORT_ID, "M6", 5), holed(BORED_ID, { fastener: { size: "M6", fit: "tapped" }, counterbore: { diameter: 12, depth: 2 } })];
            const pair: Models.OCCT.DesignAssemblyDocument = {
                schemaVersion: 1,
                kind: "assembly",
                components: [
                    { id: "left", source: { document: SCREW_ID, part: "screw" }, at: { origin: [0, 0, 0], normal: [0, -1, 0], direction: [1, 0, 0] } },
                    { id: "right", source: { document: SCREW_ID, part: "screw" }, at: { origin: [6, 0, 0], normal: [0, -1, 0], direction: [1, 0, 0] } },
                ],
            };

            // Act
            const bottoming = occt.design.clashes({ document: screwed(TAPPED_ID, LONG_ID, 2.3 + 12), documents: [...documents, ...extra], clearance: 1 });
            const loose = occt.design.clashes({ document: screwed(TAPPED_ID, SMALL_ID, 11), documents: [...documents, ...extra], clearance: 0.6 });
            const bored = occt.design.clashes({ document: screwed(BORED_ID, SHORT_ID, 8), documents: [...documents, ...extra] });
            const sideBySide = occt.design.clashes({ document: pair, documents });

            // Assert
            expect(bottoming.map(clash => clash.components)).toEqual([["plate", "screw"]]);
            expect(bottoming[0]?.distance).toBeCloseTo(0.3, 6);
            expect(loose[0]?.distance).toBeCloseTo(0.5, 6);
            expect(bored.map(clash => [clash.distance, clash.volume])).toEqual([[0, 0]]);
            expect(bored[0]?.pointA[2]).toBeCloseTo(8, 6);
            expect(sideBySide.map(clash => [clash.components, clash.distance])).toEqual([[["left", "right"], 0]]);
        });

        it("should list a thread resting in its tapped hole as measured when the kernel fails while telling the thread apart", () => {
            // Arrange
            const failing = new OCCTService(kernel);
            const facesWithin = vi.spyOn(failing.analysis.clashes, "facesWithin").mockImplementation(provokedKernelFailure);

            // Act
            const tapped = failing.design.clashes({ document: screwed(TAPPED_ID, SCREW_ID, 11), documents });

            // Assert
            expect(facesWithin).toHaveBeenCalled();
            expect(tapped.map(clash => [clash.components, clash.distance, clash.volume])).toEqual([[["plate", "screw"], 0, 0]]);
        });

        it("should still list a head seated on the plate, what else comes within the clearance, and a screw too large for its hole", () => {
            // Act
            const seated = occt.design.clashes({ document: screwed(TAPPED_ID, SCREW_ID, 10), documents });
            const near = occt.design.clashes({ document: screwed(TAPPED_ID, SCREW_ID, 11), documents, clearance: 1.5 });
            const large = occt.design.clashes({ document: screwed(TAPPED_ID, LARGE_ID, 11), documents });

            // Assert
            expect(seated.map(clash => [clash.components, clash.distance, clash.volume])).toEqual([[["plate", "screw"], 0, 0]]);
            expect(near.map(clash => clash.components)).toEqual([["plate", "screw"]]);
            expect(near[0]?.distance).toBeCloseTo(1, 6);
            expect(near[0]?.pointA[2]).toBeCloseTo(10, 6);
            expect(near[0]?.pointB[2]).toBeCloseTo(11, 6);
            expect(large[0]?.volume).toBeGreaterThan(100);
        });
    });

    it("should measure a pair exactly when the kernel fails while its meshes are ruling it out, as measuring every pair does", () => {
        // Arrange
        const document = stand([{ id: "sunk", source: { document: POST_ID, part: "post" }, at: { origin: [7, 6, 7.5], normal: [0, 0, 1], direction: [1, 0, 0] } }]);
        const failing = new OCCTService(kernel);
        const meshing = vi.spyOn(failing, "shapeToMesh").mockImplementation(provokedKernelFailure);

        // Act
        const clashes = failing.design.clashes({ document, documents: [plate, post] });

        // Assert
        expect(meshing).toHaveBeenCalled();
        expect(clashes).toEqual(new OCCTService(kernel).design.clashes({ document, documents: [plate, post] }));
        expect(clashes.map(clash => [clash.components, clash.volume])).toEqual([[["plate", "sunk"], expect.closeTo(4 * 4 * 2.5, 6)]]);
    });

    it("should refuse a clearance below 0", () => {
        // Act
        const negative = (): unknown => occt.design.clashes({ document: stand([]), documents: [plate, post], clearance: -1 });

        // Assert
        expect(negative).toThrow(InputError);
        expect(negative).toThrow("The clearance is a number from 0, not -1.");
    });
    describe("against an exact measure of the placed shapes", () => {
        const BLOCK_ID = "e1e1e1e1-e1e1-4e1e-8e1e-e1e1e1e1e1e1";
        const PIN_ID = "f2f2f2f2-f2f2-4f2f-8f2f-f2f2f2f2f2f2";
        const block: Models.OCCT.DesignPartDocument = { schemaVersion: 1, id: BLOCK_ID, features: [square("base", 10, 10, [-5, -5]), { id: "block", type: "extrude", profile: "base", distance: 10 }], parts: [{ id: "block", body: "block" }] };
        const pin: Models.OCCT.DesignPartDocument = {
            schemaVersion: 1,
            id: PIN_ID,
            features: [{ id: "base", type: "sketch", on: { plane: "XY" }, pen: [{ type: "circle", id: "rim", centre: [0, 0], radius: 2 }] }, { id: "pin", type: "extrude", profile: "base", distance: 12 }],
            parts: [{ id: "pin", body: "pin" }],
        };
        const placedPin: Models.OCCT.DesignAssemblyDocument = {
            schemaVersion: 1,
            kind: "assembly",
            parameters: { x: 0, y: 0, z: 0, tilt: 0 },
            components: [
                { id: "block", source: { document: BLOCK_ID, part: "block" } },
                { id: "pin", source: { document: PIN_ID, part: "pin" }, at: { origin: ["x", "y", "z"], normal: ["sin(tilt)", 0, "cos(tilt)"], direction: ["cos(tilt)", 0, "-sin(tilt)"] } },
            ],
        };
        const placement = fc.record({
            x: fc.integer({ min: -100, max: 100 }).map(value => value / 10),
            y: fc.integer({ min: -100, max: 100 }).map(value => value / 10),
            z: fc.integer({ min: -140, max: 120 }).map(value => value / 10),
            tilt: fc.integer({ min: -90, max: 90 }),
            clearance: fc.integer({ min: 0, max: 20 }).map(value => value / 10),
        });
        const exactlyMeasured = (parameters: Record<string, number>, clearance: number): Models.OCCT.Clash[] => {
            const built = occt.design.build({ document: placedPin, documents: [block, pin], parameters });
            const placed = built.components!.map(component => occt.transforms.transformByMatrix({ shape: built.parts.find(part => part.id === component.part)!.shape, transformation: component.world }));
            try {
                return occt.analysis.clashes.betweenShapes({ shapes: placed, clearance, prefilter: false });
            } finally {
                [...placed, ...built.parts.map(part => part.shape)].forEach(shape => shape.delete());
            }
        };
        const summary = (clashes: readonly { distance: number; volume: number }[]): number[][] => clashes.map(clash => [Math.round(clash.distance * 1e6) / 1e6 + 0, Math.round(clash.volume * 1e4) / 1e4 + 0]);

        it("should find exactly the clash an exact measure of the placed parts finds, wherever the pin stands and whatever the clearance, and again from what it kept", () => {
            // Act & Assert
            fc.assert(fc.property(placement, ({ clearance, ...parameters }) => {
                const exact = exactlyMeasured(parameters, clearance);
                const first = occt.design.clashes({ document: placedPin, documents: [block, pin], parameters, clearance });
                const again = occt.design.clashes({ document: placedPin, documents: [block, pin], parameters, clearance });
                expect(summary(first)).toEqual(summary(exact));
                expect(again).toEqual(first);
            }), { seed: 20261018, numRuns: 60 });
        });
    });
});
