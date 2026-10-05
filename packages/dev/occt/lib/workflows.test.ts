import { describe, it, expect, beforeAll } from "vitest";
import type { TopoDS_Face, TopoDS_Shape, TopoDS_Wire } from "../bitbybit-dev-occt/bitbybit-dev-occt";
import createBitbybitOcct from "../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "./occ-helper";
import { VectorHelperService } from "./api/vector-helper.service";
import { ShapesHelperService } from "./api/shapes-helper.service";
import { OCCTService } from "./occ-service";
import type { Base } from "./api/inputs";

describe("workflows built from several operations", () => {
    let occt: OCCTService;

    beforeAll(async () => {
        const kernel = await createBitbybitOcct();
        occt = new OCCTService(kernel, new OccHelper(new VectorHelperService(), new ShapesHelperService(), kernel));
    }, 120_000);

    function volume(shape: TopoDS_Shape): number {
        return occt.shapes.solid.getSolidVolume({ shape });
    }

    function valid(shape: TopoDS_Shape): boolean {
        return occt.shapeFix.isValid({ shape });
    }

    describe("a cube cut by six spheres that all meet at its centre, then chamfered along every edge", () => {
        function cubeCutBySpheres(): TopoDS_Shape {
            const cube = occt.shapes.solid.createCube({ size: 6, center: [0, 0, 0], originOnCenter: true });
            const centres: Base.Point3[] = [[0, 2.1, 0], [0, -2.1, 0], [2.1, 0, 0], [-2.1, 0, 0], [0, 0, -2.1], [0, 0, 2.1]];
            const spheres = centres.map(center => occt.shapes.solid.createSphere({ radius: 2.1, center }));
            return occt.booleans.difference({ shape: cube, shapes: spheres, keepEdges: true });
        }

        it("should leave the material outside every sphere, a valid solid of 17 faces", () => {
            // Act
            const cut = cubeCutBySpheres();

            // Assert
            expect(volume(cut)).toBeCloseTo(76.2286, 3);
            expect(occt.shapes.face.getFaces({ shape: cut })).toHaveLength(17);
            expect(valid(cut)).toBe(true);
        });

        it("should chamfer every edge of the cut into a valid solid of 74 faces", () => {
            // Arrange
            const cut = cubeCutBySpheres();

            // Act
            const chamfered = occt.fillets.chamferEdges({ shape: cut, distance: 0.35 });

            // Assert
            expect(volume(chamfered)).toBeCloseTo(65.1930, 3);
            expect(occt.shapes.face.getFaces({ shape: chamfered })).toHaveLength(74);
            expect(valid(chamfered)).toBe(true);
        });
    });

    describe("a disc with ten circular bites, its outline rounded at every corner", () => {
        function bittenOutline(): TopoDS_Wire {
            const circle = occt.shapes.wire.createCircleWire({ radius: 10, center: [0, 0, 0], direction: [0, 1, 0] });
            const points = occt.shapes.wire.divideWireByParamsToPoints({ shape: circle, nrOfDivisions: 10, removeStartPoint: false, removeEndPoint: true });
            const bites = points.map(center => occt.shapes.face.createCircleFace({ radius: 2, center, direction: [0, 1, 0] }));
            const disc = occt.shapes.face.createFaceFromWire({ shape: circle, planar: true });
            const bitten = occt.booleans.difference({ shape: disc, shapes: bites, keepEdges: false });
            return occt.shapes.wire.getWire({ shape: bitten, index: 0 });
        }

        it("should round all twenty corners where the bites meet the rim", () => {
            // Arrange
            const outline = bittenOutline();

            // Act
            const rounded = occt.fillets.fillet2d({ shape: outline, radius: 0.4 });

            // Assert
            const face = occt.shapes.face.createFaceFromWire({ shape: rounded, planar: true });
            expect(occt.shapes.edge.getEdges({ shape: rounded })).toHaveLength(40);
            expect(occt.shapes.wire.isWireClosed({ shape: rounded })).toBe(true);
            expect(occt.shapes.wire.getWireLength({ shape: rounded })).toBeCloseTo(77.9553, 3);
            expect(occt.shapes.face.getFaceArea({ shape: face })).toBeCloseTo(253.3105, 3);
        });
    });

    describe("a lofted surface perforated by rounded rectangular holes, then thickened", () => {
        function perforatedLoft(): TopoDS_Face[] {
            const rows: Base.Point3[][] = [
                [[-10, 0, -10], [0, 3, -10], [10, -1, -10], [20, 2, -10]],
                [[-10, -5, 0], [0, -3, 0], [10, 1, 0], [20, -2, 0]],
                [[-10, 0, 10], [0, 3, 10], [10, -1, 10], [20, 2, 10]],
            ];
            const sections = rows.map(points => occt.shapes.wire.interpolatePoints({ points, periodic: false, tolerance: 1e-7 })).reverse();
            const loft = occt.operations.loft({ shapes: sections, makeSolid: false });
            const surface = occt.shapes.face.getFace({ shape: occt.transforms.translate({ shape: loft, translation: [0, 8, 0] }), index: 0 });
            return occt.shapes.face.subdivideToRectangleHoles({
                shape: surface,
                nrRectanglesU: 16,
                nrRectanglesV: 16,
                holesToFaces: true,
                offsetFromBorderU: 0,
                offsetFromBorderV: 0,
                scalePatternU: [0.9, 0.5, 0.7],
                scalePatternV: [0.9, 0.5, 0.7],
                filletPattern: [0.5],
                inclusionPattern: [false, true, true, true, true],
            });
        }

        it("should cut the 204 holes the inclusion pattern keeps and return a face for each after the perforated face", () => {
            // Act
            const [perforated, ...holes] = perforatedLoft();

            // Assert
            expect(holes).toHaveLength(204);
            expect(occt.shapes.wire.getWires({ shape: perforated! })).toHaveLength(205);
            expect(occt.shapes.face.getFaceArea({ shape: perforated! })).toBeCloseTo(421.47, 1);
        });

        it("should thicken the perforated face into a valid solid about as large as its area times the offset", () => {
            // Arrange
            const [perforated] = perforatedLoft();
            const area = occt.shapes.face.getFaceArea({ shape: perforated! });

            // Act
            const plate = occt.operations.makeThickSolidSimple({ shape: perforated!, offset: 0.5 });

            // Assert
            expect(valid(plate)).toBe(true);
            expect(Math.abs(volume(plate) / (area * 0.5) - 1)).toBeLessThan(0.01);
        });
    });
});
