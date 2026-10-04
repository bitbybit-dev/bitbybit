import { describe, it, expect, beforeAll } from "vitest";
import createBitbybitOcct, { BitbybitOcctModule } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import { VectorHelperService } from "../../api/vector-helper.service";
import { ShapesHelperService } from "../../api/shapes-helper.service";
import { OCCTService } from "../../occ-service";
import * as Models from "../../api/models";

type Document = Models.OCCT.DesignPartDocument;

const plate = (connectors: Models.OCCT.DesignConnector[], extra: Models.OCCT.DesignFeature[] = []): Document => ({
    schemaVersion: 1,
    parameters: { height: 10 },
    features: [
        { id: "base", type: "sketch", on: { plane: "XY" }, pen: [{ type: "hLine", id: "front", length: 40 }, { type: "vLine", id: "right", length: 20 }, { type: "hLine", id: "back", length: -40 }, { type: "close", id: "left" }] },
        { id: "plate", type: "extrude", profile: "base", distance: "height" },
        ...extra,
    ],
    parts: [{ id: "plate", body: "plate", connectors }],
});

const top: Models.OCCT.DesignFaceReference = { of: "plate", role: "end", count: 1 };

describe("frames on faces", () => {
    let kernel: BitbybitOcctModule;
    let occt: OCCTService;

    beforeAll(async () => {
        kernel = await createBitbybitOcct();
        occt = new OCCTService(kernel, new OccHelper(new VectorHelperService(), new ShapesHelperService(), kernel));
    }, 120_000);

    const frameOf = (document: Document, parameters: Record<string, number> = {}, connector = 0): Models.OCCT.DesignBuiltConnector["frame"] => occt.design.build({ document, parameters }).parts[0]!.connectors[connector]!.frame;

    it("should put a frame left without an origin where the document's origin meets the face, not at the face's centre", () => {
        // Arrange
        const document = plate([{ id: "top", on: top }]);

        // Act
        const frame = frameOf(document);

        // Assert
        expect(frame.origin).toEqual([0, 0, 10]);
        expect(frame.normal).toEqual([0, 0, 1]);
    });

    it("should keep that origin when a feature changes the face's outline", () => {
        // Arrange
        const notch: Models.OCCT.DesignFeature[] = [
            { id: "cut", type: "sketch", on: { plane: "XY" }, start: [30, 0], pen: [{ type: "hLine", length: 10 }, { type: "vLine", length: 20 }, { type: "hLine", length: -10 }, { type: "close" }] },
            { id: "notch", type: "extrude", profile: "cut", distance: 20, body: "plate", join: "cut" },
        ];

        // Act
        const plain = frameOf(plate([{ id: "top", on: top }]));
        const notched = frameOf(plate([{ id: "top", on: top }], notch));

        // Assert
        expect(notched.origin).toEqual(plain.origin);
    });

    it("should project a given origin onto the face, so it follows the face when a parameter moves it", () => {
        // Arrange
        const document = plate([{ id: "top", on: top, origin: [20, 10, 0] }]);

        // Act
        const low = frameOf(document);
        const high = frameOf(document, { height: 15 });

        // Assert
        expect(low.origin).toEqual([20, 10, 10]);
        expect(high.origin).toEqual([20, 10, 15]);
    });

    it("should run the default x axis along X on faces facing along Y or Z, and along Y on faces facing along X", () => {
        // Arrange
        const document = plate([
            { id: "top", on: top },
            { id: "front", on: { of: "plate", role: "side", from: "base.front" } },
            { id: "right", on: { of: "plate", role: "side", from: "base.right" } },
        ]);

        // Act
        const connectors = occt.design.build({ document }).parts[0]!.connectors;

        // Assert
        expect(connectors.map(connector => [connector.frame.normal, connector.frame.direction])).toEqual([
            [[0, 0, 1], [1, 0, 0]],
            [[0, -1, 0], [1, 0, 0]],
            [[1, 0, 0], [0, 1, 0]],
        ]);
    });

    it("should ask for a direction on a face that is not square to a world axis, and take one given", () => {
        // Arrange
        const wedge = (direction?: Models.OCCT.DesignPoint): Document => ({
            schemaVersion: 1,
            features: [
                { id: "base", type: "sketch", on: { plane: "XY" }, pen: [{ type: "hLine", id: "floor", length: 10 }, { type: "line", id: "slope", to: [0, 10] }, { type: "close", id: "wall" }] },
                { id: "wedge", type: "extrude", profile: "base", distance: 5 },
            ],
            parts: [{ id: "wedge", body: "wedge", connectors: [{ id: "slope", on: { of: "wedge", role: "side", from: "base.slope" }, ...(direction === undefined ? {} : { direction }) }] }],
        });

        // Act
        const without = occt.design.build({ document: wedge() });
        const given = occt.design.build({ document: wedge([0, 0, 1]) });

        // Assert
        expect(without.issues).toEqual([{ path: "/parts/0/connectors/0/direction", message: "the face is not square to a world axis, so its frame needs a direction" }]);
        expect(without.parts[0]!.connectors).toEqual([]);
        expect(given.parts[0]!.connectors[0]!.frame.direction).toEqual([0, 0, 1]);
        expect(given.parts[0]!.connectors[0]!.frame.origin.map(value => Math.round(value * 1e9) / 1e9)).toEqual([5, 5, 0]);
    });

    it("should name a profile's faces after the commands that have ids, and give the others only their role", () => {
        // Arrange
        const document: Document = {
            schemaVersion: 1,
            features: [
                { id: "base", type: "sketch", on: { plane: "XY" }, pen: [{ type: "hLine", id: "front", length: 4 }, { type: "vLine", length: 4 }, { type: "hLine", length: -4 }, { type: "close" }] },
                { id: "block", type: "extrude", profile: "base", distance: 2 },
            ],
        };

        // Act
        const names = occt.design.build({ document }).parts[0]!.faceNames.flat();

        // Assert
        expect(names.filter(name => name.startsWith("block:side")).sort()).toEqual(["block:side", "block:side", "block:side", "block:side", "block:side:base.front"]);
    });

    describe("connectors on holes and circles", () => {
        const holes: Models.OCCT.DesignFeature = { id: "holes", type: "hole", body: "plate", on: top, at: [{ id: "left", x: 10, y: 5 }, { id: "right", x: 30, y: 5 }], diameter: 4 };
        const rounded = (point: readonly number[]): number[] => point.map(value => Math.round(value * 1e9) / 1e9 + 0);

        it("should make one connector per position of a hole whose walls an axis names, where each axis crosses the face, following the face", () => {
            // Arrange
            const document = plate([{ id: "bolt", on: top, axis: { of: "holes", role: "wall" } }], [holes]);

            // Act
            const low = occt.design.build({ document }).parts[0]!.connectors;
            const high = occt.design.build({ document, parameters: { height: 15 } }).parts[0]!.connectors;

            // Assert
            expect(low.map(connector => [connector.id, rounded(connector.frame.origin), connector.frame.normal])).toEqual([["bolt.left", [10, 5, 10], [0, 0, 1]], ["bolt.right", [30, 5, 10], [0, 0, 1]]]);
            expect(high.map(connector => rounded(connector.frame.origin))).toEqual([[10, 5, 15], [30, 5, 15]]);
        });

        it("should put a connector at the centre of the circular edge its centre names", () => {
            // Arrange
            const document = plate([{ id: "rim", on: top, centre: { between: [{ of: "holes", role: "wall", from: "right" }, top], count: 1 } }], [holes]);

            // Act
            const connectors = occt.design.build({ document }).parts[0]!.connectors;

            // Assert
            expect(connectors.map(connector => [connector.id, rounded(connector.frame.origin)])).toEqual([["rim", [30, 5, 10]]]);
        });

        it("should find the axis of a counterbored hole, whose wall name also marks its counterbore", () => {
            // Arrange
            const bored: Models.OCCT.DesignFeature = { ...holes, counterbore: { diameter: 8, depth: 2 } };
            const blind: Models.OCCT.DesignFeature = { ...holes, depth: 5 };

            // Act
            const counterbored = occt.design.build({ document: plate([{ id: "bolt", on: top, axis: { of: "holes", role: "wall" } }], [bored]) }).parts[0]!.connectors;
            const drilled = occt.design.build({ document: plate([{ id: "bolt", on: top, axis: { of: "holes", role: "wall" } }], [blind]) }).parts[0]!.connectors;

            // Assert
            expect(counterbored.map(connector => rounded(connector.frame.origin))).toEqual([[10, 5, 10], [30, 5, 10]]);
            expect(drilled.map(connector => rounded(connector.frame.origin))).toEqual([[10, 5, 10], [30, 5, 10]]);
        });

        it("should report an axis on a face that is not a cylinder, and refuse two sources of an origin and a set over positions without ids", () => {
            // Arrange
            const flat = plate([{ id: "bad", on: top, axis: { of: "plate", role: "start", count: 1 } }], [holes]);
            const unnamed: Models.OCCT.DesignFeature = { ...holes, at: [[10, 5], { id: "right", x: 30, y: 5 }] };

            // Act
            const built = occt.design.build({ document: flat });
            const both = occt.design.validate({ document: plate([{ id: "two", on: top, origin: [0, 0, 0], axis: { of: "holes", role: "wall", from: "left", count: 1 } }], [holes]) });
            const loose = occt.design.validate({ document: plate([{ id: "set", on: top, axis: { of: "holes", role: "wall" } }], [unnamed]) });

            // Assert
            expect(built.issues).toEqual([{ path: "/parts/0/connectors/0/axis", message: "a cylindrical face is needed here, and this one is a plane" }]);
            expect(both).toEqual([{ path: "/parts/0/connectors/0/axis", message: "a connector's origin comes from one of origin, axis and centre" }]);
            expect(loose).toEqual([{ path: "/parts/0/connectors/0/axis", message: "a connector on every wall of \"holes\" is named by the ids of its positions: give each position of \"holes\" one" }]);
        });
    });
});
