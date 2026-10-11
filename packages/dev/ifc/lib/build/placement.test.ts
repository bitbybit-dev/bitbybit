import { describe, expect, it } from "vitest";
import { addRightWall, expressIdOf, groundFloor, writingIntoNewModel } from "../__test__/build-setup";
import { rounded } from "../__test__/build-geometry";
import { ref } from "../step/values";
import { absoluteFrame, axisPlacementFrame, numbersOf, objectPlacementOf } from "./placement";

describe("absoluteFrame", () => {
    it("should compose a wall's placement with its storey's and the building's", () => {
        // Arrange
        const { ifc, model: ground } = groundFloor();
        let model = ifc.spatial.addStorey({ model: ground, id: "first", elevation: 3000 });
        model = addRightWall(ifc, model, "upper", [2000, 1000], [2000, 6000], "first");

        // Act
        const frame = absoluteFrame(model, objectPlacementOf(model, expressIdOf(model, "upper")));

        // Assert
        expect(rounded([frame.origin, frame.x, frame.y, frame.z])).toEqual([[2000, 1000, 3000], [0, 1, 0], [-1, 0, 0], [0, 0, 1]]);
    });

    it("should refuse a placement that is relative to itself", () => {
        // Arrange
        const { tx, writer } = writingIntoNewModel();
        const placement = writer.localPlacement(undefined, { origin: [0, 0, 0], x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1] });
        tx.update(placement, { PlacementRelTo: ref(placement) });

        // Act & Assert
        expect(() => absoluteFrame(tx, placement)).toThrow(`The placement #${placement} is relative to itself`);
    });
});

describe("axisPlacementFrame", () => {
    it("should read a plan placement as a frame turned about Z", () => {
        // Arrange
        const { tx, writer } = writingIntoNewModel();
        const placement = writer.placement2([10, 20], [0, 1]);

        // Act
        const frame = axisPlacementFrame(tx, placement);

        // Assert
        expect(rounded([frame.origin, frame.x, frame.y, frame.z])).toEqual([[10, 20, 0], [0, 1, 0], [-1, 0, 0], [0, 0, 1]]);
    });

    it("should take Y as the X axis of a placement whose Z runs along X and which gives no X", () => {
        // Arrange
        const { tx, writer } = writingIntoNewModel();
        const placement = writer.create("IfcAxis2Placement3D", { Location: ref(writer.point([0, 0, 0])), Axis: ref(writer.direction([1, 0, 0])) });

        // Act
        const frame = axisPlacementFrame(tx, placement);

        // Assert
        expect(rounded([frame.x, frame.z])).toEqual([[0, 1, 0], [1, 0, 0]]);
    });

    it("should refuse a placement of a kind it cannot read as a frame", () => {
        // Arrange
        const { tx, writer } = writingIntoNewModel();
        const axisOnly = writer.create("IfcAxis1Placement", { Location: ref(writer.point([0, 0, 0])) });

        // Act & Assert
        expect(() => axisPlacementFrame(tx, axisOnly)).toThrow(`#${axisOnly} is an IfcAxis1Placement, not an axis placement`);
    });

    it("should refuse an entity that is no placement at all, naming its type", () => {
        // Arrange
        const { tx, writer } = writingIntoNewModel();
        const point = writer.point([0, 0, 0]);

        // Act & Assert
        expect(() => axisPlacementFrame(tx, point)).toThrow(`#${point} is an IfcCartesianPoint, not an axis placement`);
    });
});

describe("numbersOf and objectPlacementOf", () => {
    it("should refuse a list holding something other than finite numbers", () => {
        // Act & Assert
        expect(() => numbersOf([1, "two"], "The point")).toThrow("The point is not a list of finite numbers");
        expect(() => numbersOf([1, Number.NaN], "The point")).toThrow("The point is not a list of finite numbers");
        expect(numbersOf([1, 2], "The point")).toEqual([1, 2]);
    });

    it("should refuse a product without a placement", () => {
        // Arrange
        const { tx } = writingIntoNewModel();
        const wall = tx.create("IfcWall", { GlobalId: tx.globalId("floating") });

        // Act & Assert
        expect(() => objectPlacementOf(tx, wall)).toThrow(`#${wall} has no placement`);
    });
});
