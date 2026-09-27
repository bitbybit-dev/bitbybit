import { describe, it, expect, beforeAll } from "vitest";
import createBitbybitOcct, { BitbybitOcctModule, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import { VectorHelperService } from "../../api/vector-helper.service";
import { ShapesHelperService } from "../../api/shapes-helper.service";

describe("OCCT shape getters unit tests", () => {
    let occt: BitbybitOcctModule;
    let occHelper: OccHelper;

    beforeAll(async () => {
        occt = await createBitbybitOcct();
        occHelper = new OccHelper(new VectorHelperService(), new ShapesHelperService(), occt);
    });

    const boxTwice = (): { box: TopoDS_Shape, twice: TopoDS_Shape } => {
        const box = occHelper.entitiesService.bRepPrimAPIMakeBox(1, 2, 3, [0, 0, 0]);
        return { box, twice: occHelper.converterService.makeCompound({ shapes: [box, box] }) };
    };

    describe("a compound that holds the same box twice", () => {
        it("should give every placement of its faces, wires and solids", () => {
            // Arrange
            const { twice } = boxTwice();

            // Act
            const counts = [
                occHelper.shapeGettersService.getFaces({ shape: twice }).length,
                occHelper.shapeGettersService.getWires({ shape: twice }).length,
                occHelper.shapeGettersService.getSolids({ shape: twice }).length,
            ];

            // Assert
            expect(counts).toEqual([12, 12, 2]);
        });

        it("should give each of its edges once", () => {
            // Arrange
            const { twice } = boxTwice();

            // Act
            const edges = occHelper.shapeGettersService.getEdges({ shape: twice });

            // Assert
            expect(edges).toHaveLength(12);
        });

        it("should number faces over every placement, so the seventh is the second copy's first", () => {
            // Arrange
            const { box, twice } = boxTwice();
            const first = occHelper.shapeGettersService.getFace({ shape: box, index: 0 });

            // Act
            const seventh = occHelper.shapeGettersService.getFace({ shape: twice, index: 6 });

            // Assert
            expect(seventh.IsSame(first)).toBe(true);
        });
    });

    describe("indexes past the last", () => {
        it.each([
            ["face", () => occHelper.shapeGettersService.getFace({ shape: occHelper.entitiesService.bRepPrimAPIMakeBox(1, 2, 3, [0, 0, 0]), index: 6 }), "Face index is out of range"],
            ["wire", () => occHelper.shapeGettersService.getWire({ shape: occHelper.entitiesService.bRepPrimAPIMakeBox(1, 2, 3, [0, 0, 0]), index: 6 }), "Wire not found"],
            ["edge", () => occHelper.shapeGettersService.getEdge({ shape: occHelper.entitiesService.bRepPrimAPIMakeBox(1, 2, 3, [0, 0, 0]), index: 12 }), "Edge can not be found for shape on index 12"],
        ] as [string, () => unknown, string][])("should refuse a %s index one past the last", (_what, act, message) => {
            // Act
            const attempt = act;

            // Assert
            expect(attempt).toThrow(message);
        });
    });
});
