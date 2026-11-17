import { describe, it, expect, beforeAll } from "vitest";
import type { TopoDS_Shape, TopoDS_Wire } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import createBitbybitOcct from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OCCTService } from "../../occ-service";

describe("OCCT faces whose holes sit a hair off the outline's plane", () => {
    let occt: OCCTService;

    beforeAll(async () => {
        occt = new OCCTService(await createBitbybitOcct());
    }, 120_000);

    const PLATE = 400;
    const HOLE_RADIUS = 5;
    const DEPTH = 2;
    const holeArea = Math.PI * HOLE_RADIUS * HOLE_RADIUS;
    const plateArea = PLATE * PLATE - holeArea;
    const plate = (): TopoDS_Wire => occt.shapes.wire.createSquareWire({ size: PLATE, center: [0, 0, 0], direction: [0, 0, 1] });
    const holeAt = (x: number, offPlane: number): TopoDS_Wire => occt.shapes.wire.createCircleWire({ radius: HOLE_RADIUS, center: [x, 0, offPlane], direction: [0, 0, 1] });
    const areaOf = (shape: TopoDS_Shape): number => occt.shapes.face.getFaceArea({ shape: occt.shapes.face.getFace({ shape, index: 0 }) });
    const volumeOf = (shape: TopoDS_Shape): number => occt.shapes.solid.getSolidVolume({ shape: occt.shapes.solid.getSolids({ shape })[0]! });

    it("should build a plate with a hole a hair off its plane wherever on the plate the hole sits, and extrude it", () => {
        // Arrange
        const placements = [0, 40, 80, 150].flatMap(x => [5e-8, 1.5e-7, 5e-7, 1e-5].map(offPlane => ({ x, offPlane })));

        // Act
        const plates = placements.map(({ x, offPlane }) => occt.shapes.face.createFaceFromWires({ shapes: [plate(), holeAt(x, offPlane)], planar: true }));
        const solids = plates.map(shape => occt.operations.extrude({ shape, direction: [0, 0, DEPTH] }));

        // Assert
        plates.forEach((face, index) => {
            expect(occt.shapeFix.isValid({ shape: face }), JSON.stringify(placements[index])).toBe(true);
            expect(areaOf(face) / plateArea - 1).toBeCloseTo(0, 9);
        });
        solids.forEach((solid, index) => {
            expect(occt.shapeFix.isValid({ shape: solid }), JSON.stringify(placements[index])).toBe(true);
            expect(volumeOf(solid) / (plateArea * DEPTH) - 1).toBeCloseTo(0, 6);
        });
    });

    it("should still refuse a hole that crosses the outline, a hair off the plane or not", () => {
        // Arrange
        const crossing = occt.shapes.wire.createCircleWire({ radius: HOLE_RADIUS, center: [PLATE / 2, 0, 1.5e-7], direction: [0, 0, 1] });

        // Act
        const act = (): unknown => occt.shapes.face.createFaceFromWires({ shapes: [plate(), crossing], planar: true });

        // Assert
        expect(act).toThrow(expect.objectContaining({ name: "InputError", property: "shapes" }));
    });

    describe("holes offset from an open wire", () => {
        const sCurve = (): TopoDS_Wire => occt.shapes.wire.interpolatePoints({ points: [[0, 0, 0], [2, 1, 0], [4, -1, 0], [6, 0, 0]], periodic: false, tolerance: 1e-7 });
        const aroundTheCurve = (distance: number): TopoDS_Wire => occt.operations.offset({ shape: sCurve(), distance, tolerance: 0.1 });
        const lone = (wire: TopoDS_Wire): number => areaOf(occt.shapes.face.createFaceFromWire({ shape: wire, planar: true }));
        const band = (distance: number): number => 2 * distance * occt.shapes.wire.getWireLength({ shape: sCurve() }) + Math.PI * distance * distance;

        it("should build a ring between two offsets of one open curve, of the area between them", () => {
            // Arrange
            const outline = aroundTheCurve(0.4);
            const hole = aroundTheCurve(0.2);

            // Act
            const ring = occt.shapes.face.createFaceFromWires({ shapes: [outline, hole], planar: true });

            // Assert
            expect(occt.shapeFix.isValid({ shape: ring })).toBe(true);
            expect(areaOf(ring) / (lone(outline) - lone(hole)) - 1).toBeCloseTo(0, 6);
            expect(areaOf(ring) / (band(0.4) - band(0.2)) - 1).toBeCloseTo(0, 3);
            expect(occt.shapeFix.isValid({ shape: occt.operations.extrude({ shape: ring, direction: [0, 0, 1] }) })).toBe(true);
        });

        it("should build a disc with an offset of an open curve as its hole", () => {
            // Arrange
            const disc = occt.shapes.wire.createCircleWire({ radius: 4, center: [3, 0, 0], direction: [0, 0, 1] });
            const hole = aroundTheCurve(0.2);

            // Act
            const pierced = occt.shapes.face.createFaceFromWires({ shapes: [disc, hole], planar: true });

            // Assert
            expect(occt.shapeFix.isValid({ shape: pierced })).toBe(true);
            expect(areaOf(pierced) / (16 * Math.PI - lone(hole)) - 1).toBeCloseTo(0, 6);
            expect(areaOf(pierced) / (16 * Math.PI - band(0.2)) - 1).toBeCloseTo(0, 3);
        });
    });
});
