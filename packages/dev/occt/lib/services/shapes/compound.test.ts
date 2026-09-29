import { describe, it, expect, beforeAll } from "vitest";
import createBitbybitOcct, { BitbybitOcctModule } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import * as Inputs from "../../api/inputs";
import { VectorHelperService } from "../../api/vector-helper.service";
import { ShapesHelperService } from "../../api/shapes-helper.service";
import { OCCTSolid } from "./solid";
import { OCCTCompound } from "./compound";

describe("OCCT compound unit tests", () => {
    let occt: BitbybitOcctModule;
    let solid: OCCTSolid;
    let compound: OCCTCompound;
    let occHelper: OccHelper;

    beforeAll(async () => {
        occt = await createBitbybitOcct();
        const vec = new VectorHelperService();
        const s = new ShapesHelperService();
        occHelper = new OccHelper(vec, s, occt);
        solid = new OCCTSolid(occt, occHelper);
        compound = new OCCTCompound(occt, occHelper);
    });

    it("should compound any shapes", () => {
        const box = solid.createBox({ width: 2, height: 2, length: 2, center: [0, 0, 0] });
        const cylinder = solid.createCylinder({ radius: 2, height: 2, center: [0, 0, 0], direction: [0, 0, 1] });
        const c = compound.makeCompound({ shapes: [box, cylinder] });
        expect(c).toBeDefined();
        expect(occHelper.enumService.getShapeTypeEnum(c)).toBe(Inputs.OCCT.shapeTypeEnum.compound);
        box.delete();
        cylinder.delete();
    });

    it("holds the shapes it was given, in order, rather than copies of them", () => {
        // Arrange
        const box = solid.createBox({ width: 2, height: 2, length: 2, center: [0, 0, 0] });
        const cylinder = solid.createCylinder({ radius: 2, height: 2, center: [5, 0, 0], direction: [0, 0, 1] });

        // Act
        const c = compound.makeCompound({ shapes: [box, cylinder] });

        // Assert
        const held = compound.getShapesOfCompound({ shape: c });
        expect(held.map((shape, index) => shape.IsEqual([box, cylinder][index]!))).toEqual([true, true]);
    });

    it("keeps the edges its faces share, so the faces of a box still meet along twelve edges", () => {
        // Arrange
        const box = solid.createBox({ width: 2, height: 3, length: 4, center: [0, 0, 0] });
        const faces = occHelper.shapeGettersService.getFaces({ shape: box });

        // Act
        const c = compound.makeCompound({ shapes: faces });

        // Assert
        expect(occHelper.shapeGettersService.getEdges({ shape: c })).toHaveLength(12);
    });

    it("stays whole after the shapes it holds are deleted", () => {
        // Arrange
        const box = solid.createBox({ width: 2, height: 3, length: 4, center: [0, 0, 0] });
        const cylinder = solid.createCylinder({ radius: 1, height: 2, center: [5, 0, 0], direction: [0, 1, 0] });
        const c = compound.makeCompound({ shapes: [box, cylinder] });

        // Act
        box.delete();
        cylinder.delete();

        // Assert
        expect(compound.getShapesOfCompound({ shape: c }).map(shape => solid.getSolidVolume({ shape }))).toEqual([expect.closeTo(24, 9), expect.closeTo(2 * Math.PI, 9)]);
    });

});
