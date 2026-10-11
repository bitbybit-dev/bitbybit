import { describe, expect, it } from "vitest";
import { modelOf } from "./service-support";
import { expressIdOf, groundFloor, notAModel } from "../../__test__/build-setup";
import { countOf, enumOf, extrusionOf, materialOf, objectPlacementOf, placementOf, refOf, rounded, sweptAreaOf } from "../../__test__/build-geometry";
import { findMaterial } from "../../build/materials";
import type { Base } from "@bitbybit-dev/base";
import * as Inputs from "../inputs";

describe("IFCColumns.add", () => {
    it("should stand the column upright on its position, its base offset above the storey's floor", () => {
        // Arrange
        const { ifc, model } = groundFloor();

        // Act
        const changed = ifc.columns.add({ model, storey: "ground", id: "c1", position: [5000, 4000], height: 2700, baseOffset: 100 });

        // Assert
        expect(placementOf(changed, expressIdOf(changed, "c1"))).toEqual({
            relativeTo: objectPlacementOf(changed, expressIdOf(changed, "ground")),
            location: [5000, 4000, 100],
            axis: null,
            refDirection: null,
        });
    });

    it("should extrude the section up by the column's height", () => {
        // Arrange
        const { ifc, model } = groundFloor();

        // Act
        const changed = ifc.columns.add({ model, storey: "ground", id: "c1", position: [5000, 4000], height: 2700 });

        // Assert
        expect(extrusionOf(changed, expressIdOf(changed, "c1"))).toEqual({
            position: { location: [0, 0, 0], axis: null, refDirection: null },
            direction: [0, 0, 1],
            depth: 2700,
        });
    });

    it("should write a 300 by 300 rectangle centred on the axis by default", () => {
        // Arrange
        const { ifc, model } = groundFloor();

        // Act
        const changed = ifc.columns.add({ model, storey: "ground", id: "c1" });

        // Assert
        const profile = sweptAreaOf(changed, expressIdOf(changed, "c1"));
        const position = refOf(changed.attribute(profile, "Position"));
        expect(changed.typeOf(profile)).toBe("IfcRectangleProfileDef");
        expect([changed.attribute(profile, "XDim"), changed.attribute(profile, "YDim")]).toEqual([300, 300]);
        expect(changed.attribute(refOf(changed.attribute(position, "Location")), "Coordinates")).toEqual([0, 0]);
        expect(placementOf(changed, expressIdOf(changed, "c1")).location).toEqual([0, 0, 0]);
        expect(extrusionOf(changed, expressIdOf(changed, "c1")).depth).toBe(3000);
    });

    it("should write a circular section by its radius", () => {
        // Arrange
        const { ifc, model } = groundFloor();

        // Act
        const changed = ifc.columns.add({ model, storey: "ground", id: "c1", profile: Inputs.IFC.profileKindEnum.circle, radius: 125 });

        // Assert
        const profile = sweptAreaOf(changed, expressIdOf(changed, "c1"));
        expect(changed.typeOf(profile)).toBe("IfcCircleProfileDef");
        expect(changed.attribute(profile, "Radius")).toBe(125);
    });

    it("should write an I section by its width, depth, web and flanges", () => {
        // Arrange
        const { ifc, model } = groundFloor();

        // Act
        const changed = ifc.columns.add({ model, storey: "ground", id: "c1", profile: Inputs.IFC.profileKindEnum.iShape, width: 200, depth: 300, webThickness: 9, flangeThickness: 14 });

        // Assert
        const profile = sweptAreaOf(changed, expressIdOf(changed, "c1"));
        expect(changed.typeOf(profile)).toBe("IfcIShapeProfileDef");
        expect(["OverallWidth", "OverallDepth", "WebThickness", "FlangeThickness"].map((name) => changed.attribute(profile, name))).toEqual([200, 300, 9, 14]);
    });

    it("should turn the section about the column's axis by its rotation", () => {
        // Arrange
        const { ifc, model } = groundFloor();

        // Act
        const changed = ifc.columns.add({ model, storey: "ground", id: "c1", rotation: 90 });

        // Assert
        const placement = placementOf(changed, expressIdOf(changed, "c1"));
        expect(placement.axis).toEqual([0, 0, 1]);
        expect(rounded([placement.refDirection ?? []])).toEqual([[0, 1, 0]]);
    });

    it("should mark the element a column contained in its storey", () => {
        // Arrange
        const { ifc, model } = groundFloor();

        // Act
        const changed = ifc.columns.add({ model, storey: "ground", id: "c1", name: "C1" });

        // Assert
        const column = expressIdOf(changed, "c1");
        expect(changed.typeOf(column)).toBe("IfcColumn");
        expect(enumOf(changed.attribute(column, "PredefinedType"))).toBe("COLUMN");
        expect(ifc.model.element({ model: changed, element: "c1" })).toEqual({
            globalId: ifc.model.globalIdOf({ model, id: "c1" }),
            type: "IfcColumn",
            name: "C1",
            storey: ifc.model.globalIdOf({ model, id: "ground" }),
        });
    });

    it("should associate the column with its material by name", () => {
        // Arrange
        const { ifc, model: ground } = groundFloor();
        const model = ifc.materials.add({ model: ground, name: "Concrete" });

        // Act
        const changed = ifc.columns.add({ model, storey: "ground", id: "c1", material: "Concrete" });

        // Assert
        expect(materialOf(changed, expressIdOf(changed, "c1"))).toBe(findMaterial(modelOf(changed), "Concrete"));
    });

    it("should associate no material when none is named", () => {
        // Arrange
        const { ifc, model } = groundFloor();

        // Act
        const changed = ifc.columns.add({ model, storey: "ground", id: "c1" });

        // Assert
        expect(countOf(changed, "IfcRelAssociatesMaterial")).toBe(0);
    });

    it("should refuse a profile it does not know rather than write a rectangle", () => {
        // Arrange
        const { ifc, model } = groundFloor();
        const hexagon: unknown = "HEXAGON";

        // Act & Assert
        expect(() => ifc.columns.add({ model, storey: "ground", profile: hexagon as Inputs.IFC.profileKindEnum })).toThrow("HEXAGON");
    });

    it("should refuse a material the model does not have, naming it", () => {
        // Arrange
        const { ifc, model } = groundFloor();

        // Act & Assert
        expect(() => ifc.columns.add({ model, storey: "ground", material: "Oak" })).toThrow("The model has no material named 'Oak'");
    });

    it("should refuse an I section whose web is as thick as its flanges are wide", () => {
        // Arrange
        const { ifc, model } = groundFloor();

        // Act & Assert
        expect(() => ifc.columns.add({ model, storey: "ground", profile: Inputs.IFC.profileKindEnum.iShape, width: 100, webThickness: 100 })).toThrow("An I section's web must be thinner than its flanges are wide");
    });

    it("should refuse an I section whose two flanges together are as thick as it is deep", () => {
        // Arrange
        const { ifc, model } = groundFloor();

        // Act & Assert
        expect(() => ifc.columns.add({ model, storey: "ground", profile: Inputs.IFC.profileKindEnum.iShape, depth: 300, flangeThickness: 150 })).toThrow("An I section's two flanges must be thinner together than its depth");
    });

    it.each([
        [Inputs.IFC.profileKindEnum.rectangle, { width: 0 }, "width"],
        [Inputs.IFC.profileKindEnum.rectangle, { depth: -1 }, "depth"],
        [Inputs.IFC.profileKindEnum.circle, { radius: 0 }, "radius"],
        [Inputs.IFC.profileKindEnum.iShape, { webThickness: Number.NaN }, "web thickness"],
        [Inputs.IFC.profileKindEnum.iShape, { flangeThickness: Infinity }, "flange thickness"],
    ])("should refuse a %s section with a %o", (profile, sizes, what) => {
        // Arrange
        const { ifc, model } = groundFloor();

        // Act & Assert
        expect(() => ifc.columns.add({ model, storey: "ground", profile, ...sizes })).toThrow(`The profile's ${what} must be more than zero`);
    });

    it.each([0, -100, Number.NaN])("should refuse a height of %s", (height) => {
        // Arrange
        const { ifc, model } = groundFloor();

        // Act & Assert
        expect(() => ifc.columns.add({ model, storey: "ground", height })).toThrow(RangeError);
    });

    it("should refuse a base offset that is not finite", () => {
        // Arrange
        const { ifc, model } = groundFloor();

        // Act & Assert
        expect(() => ifc.columns.add({ model, storey: "ground", baseOffset: Infinity })).toThrow(RangeError);
    });

    it("should refuse a rotation that is not finite", () => {
        // Arrange
        const { ifc, model } = groundFloor();

        // Act & Assert
        expect(() => ifc.columns.add({ model, storey: "ground", rotation: Number.NaN })).toThrow("The rotation in degrees must be a finite number");
    });

    it("should refuse a position that is not two finite numbers with a TypeError", () => {
        // Arrange
        const { ifc, model } = groundFloor();
        const threeNumbers: unknown = [0, 0, 0];

        // Act & Assert
        expect(() => ifc.columns.add({ model, storey: "ground", position: [Number.NaN, 0] })).toThrow(TypeError);
        expect(() => ifc.columns.add({ model, storey: "ground", position: threeNumbers as Base.Point2 })).toThrow(TypeError);
    });

    it("should refuse a storey the model does not hold, naming it", () => {
        // Arrange
        const { ifc, model } = groundFloor();

        // Act & Assert
        expect(() => ifc.columns.add({ model, storey: "basement" })).toThrow("The model has no storey 'basement'");
    });

    it("should leave the model it was given as it was", () => {
        // Arrange
        const { ifc, model } = groundFloor();

        // Act
        ifc.columns.add({ model, storey: "ground", id: "c1" });

        // Assert
        expect(countOf(model, "IfcColumn")).toBe(0);
    });

    it("should refuse an input that is not a model with a TypeError", () => {
        // Arrange
        const { ifc } = groundFloor();

        // Act & Assert
        expect(() => ifc.columns.add({ model: notAModel(), storey: "ground" })).toThrow(TypeError);
    });
});
