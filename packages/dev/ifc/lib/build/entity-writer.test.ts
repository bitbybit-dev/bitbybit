import { describe, expect, it } from "vitest";
import { writingIntoNewModel } from "../__test__/build-setup";
import { enumOf, refOf, refsOf, rounded } from "../__test__/build-geometry";
import { planeFrame } from "./entity-writer";

describe("EntityWriter", () => {
    it("should write negative zero coordinates as zero", () => {
        // Arrange
        const { tx, writer } = writingIntoNewModel();

        // Act
        const point = writer.point([-0, 5, -0]);

        // Assert
        const coordinates = tx.attribute(point, "Coordinates");
        expect(coordinates).toEqual([0, 5, 0]);
        expect(Array.isArray(coordinates) && Object.is(coordinates[0], -0)).toBe(false);
    });

    it("should leave the axes of a placement with the standard axes unset", () => {
        // Arrange
        const { tx, writer } = writingIntoNewModel();

        // Act
        const placement = writer.placement3({ origin: [1, 2, 3], x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1] });

        // Assert
        expect(tx.attribute(placement, "Axis")).toBe(null);
        expect(tx.attribute(placement, "RefDirection")).toBe(null);
        expect(tx.attribute(refOf(tx.attribute(placement, "Location")), "Coordinates")).toEqual([1, 2, 3]);
    });

    it("should write both axes of a turned placement", () => {
        // Arrange
        const { tx, writer } = writingIntoNewModel();

        // Act
        const placement = writer.placement3({ origin: [0, 0, 0], x: [0, 1, 0], y: [-1, 0, 0], z: [0, 0, 1] });

        // Assert
        expect(tx.attribute(refOf(tx.attribute(placement, "Axis")), "DirectionRatios")).toEqual([0, 0, 1]);
        expect(tx.attribute(refOf(tx.attribute(placement, "RefDirection")), "DirectionRatios")).toEqual([0, 1, 0]);
    });

    it("should leave the direction of a plan placement unset unless one is given", () => {
        // Arrange
        const { tx, writer } = writingIntoNewModel();

        // Act
        const plain = writer.placement2([5, 6]);
        const turned = writer.placement2([5, 6], [0, 1]);

        // Assert
        expect(tx.attribute(plain, "RefDirection")).toBe(null);
        expect(tx.attribute(refOf(tx.attribute(turned, "RefDirection")), "DirectionRatios")).toEqual([0, 1]);
    });

    it("should close a poly curve by returning to its first point and leave an open one open", () => {
        // Arrange
        const { tx, writer } = writingIntoNewModel();

        // Act
        const closed = writer.polyCurve2([[0, 0], [1, 0], [1, 1]], true);
        const open = writer.polyCurve2([[0, 0], [1, 0]], false);

        // Assert
        expect(tx.attribute(closed, "Segments")).toEqual([{ type: "IfcLineIndex", value: [1, 2, 3, 1] }]);
        expect(tx.attribute(open, "Segments")).toEqual([{ type: "IfcLineIndex", value: [1, 2] }]);
        expect(tx.attribute(closed, "SelfIntersect")).toBe(false);
    });

    it("should write a profile with holes as a profile with voids", () => {
        // Arrange
        const { tx, writer } = writingIntoNewModel();

        // Act
        const solid = writer.profile({ outer: [[0, 0], [4, 0], [4, 4]], holes: [] }, "Plate");
        const holed = writer.profile({ outer: [[0, 0], [4, 0], [4, 4], [0, 4]], holes: [[[1, 1], [1, 2], [2, 2]]] });

        // Assert
        expect(tx.entity(solid).type).toBe("IfcArbitraryClosedProfileDef");
        expect(tx.attribute(solid, "ProfileName")).toBe("Plate");
        expect(enumOf(tx.attribute(solid, "ProfileType"))).toBe("AREA");
        expect(tx.entity(holed).type).toBe("IfcArbitraryProfileDefWithVoids");
        expect(tx.attribute(holed, "ProfileName")).toBe(null);
        expect(refsOf(tx.attribute(holed, "InnerCurves"))).toHaveLength(1);
    });

    it("should extrude up the Z axis unless told otherwise", () => {
        // Arrange
        const { tx, writer } = writingIntoNewModel();
        const profile = writer.profile({ outer: [[0, 0], [4, 0], [4, 4]], holes: [] });

        // Act
        const solid = writer.extrusion(profile, { origin: [0, 0, 0], x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1] }, 250);

        // Assert
        expect(tx.attribute(refOf(tx.attribute(solid, "ExtrudedDirection")), "DirectionRatios")).toEqual([0, 0, 1]);
        expect(tx.attribute(solid, "Depth")).toBe(250);
    });

    it("should write a half space whose plane faces along the normal, its material on the normal's side", () => {
        // Arrange
        const { tx, writer } = writingIntoNewModel();

        // Act
        const halfSpace = writer.halfSpace([0, 0, 2600], [0, 0, 2], [1, 0, 0]);

        // Assert
        const plane = refOf(tx.attribute(halfSpace, "BaseSurface"));
        expect(tx.entity(plane).type).toBe("IfcPlane");
        expect(tx.attribute(halfSpace, "AgreementFlag")).toBe(false);
        expect(tx.attribute(refOf(tx.attribute(refOf(tx.attribute(plane, "Position")), "Location")), "Coordinates")).toEqual([0, 0, 2600]);
    });

    it("should subtract the second operand of a clipping from the first", () => {
        // Arrange
        const { tx, writer } = writingIntoNewModel();
        const profile = writer.profile({ outer: [[0, 0], [4, 0], [4, 4]], holes: [] });
        const solid = writer.extrusion(profile, { origin: [0, 0, 0], x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1] }, 10);
        const halfSpace = writer.halfSpace([0, 0, 5], [0, 0, 1], [1, 0, 0]);

        // Act
        const clipping = writer.clipping(solid, halfSpace);

        // Assert
        expect(enumOf(tx.attribute(clipping, "Operator"))).toBe("DIFFERENCE");
        expect([refOf(tx.attribute(clipping, "FirstOperand")), refOf(tx.attribute(clipping, "SecondOperand"))]).toEqual([solid, halfSpace]);
    });
});

describe("planeFrame", () => {
    it("should take the normal as Z and the hint, projected off it, as X", () => {
        // Act
        const frame = planeFrame([1, 2, 3], [0, -1, 1], [1, 1, 0]);

        // Assert
        expect(rounded([frame.origin, frame.z])).toEqual(rounded([[1, 2, 3], [0, -Math.SQRT1_2, Math.SQRT1_2]]));
        expect(rounded([frame.x])).toEqual(rounded([[Math.sqrt(2 / 3), Math.sqrt(1 / 6), Math.sqrt(1 / 6)]]));
    });

    it.each([
        [[1, 0, 0], [0, 1, 0]],
        [[0, 1, 0], [1, 0, 0]],
        [[0, 0, 1], [0, 1, 0]],
    ])("should fall back to a world axis when the hint lies along the normal %j", (normal, x) => {
        // Arrange
        const along: [number, number, number] = [normal[0] ?? 0, normal[1] ?? 0, normal[2] ?? 0];

        // Act
        const frame = planeFrame([0, 0, 0], along, along);

        // Assert
        expect(rounded([frame.x])).toEqual([x]);
    });
});
