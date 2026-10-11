import { describe, expect, it } from "vitest";
import { modelOf } from "./service-support";
import { expressIdOf, groundFloor, notAModel } from "../../__test__/build-setup";
import { countOf, enumOf, extrusionOf, materialOf, objectPlacementOf, placementOf, rounded, sweptAreaOf } from "../../__test__/build-geometry";
import type { AxisPlacement } from "../../__test__/fixture-types";
import { findMaterial } from "../../build/materials";
import type { Base } from "@bitbybit-dev/base";
import * as Inputs from "../inputs";

function profileUp(placement: AxisPlacement): number[] {
    const [zx = 0, zy = 0, zz = 0] = placement.axis ?? [0, 0, 1];
    const [xx = 0, xy = 0, xz = 0] = placement.refDirection ?? [1, 0, 0];
    return rounded([[zy * xz - zz * xy, zz * xx - zx * xz, zx * xy - zy * xx]])[0] ?? [];
}

describe("IFCBeams.add", () => {
    it("should run a beam along +X with its axis along +X and its section's X level", () => {
        // Arrange
        const { ifc, model } = groundFloor();

        // Act
        const changed = ifc.beams.add({ model, storey: "ground", id: "b1", start: [0, 4000, 2850], end: [5000, 4000, 2850] });

        // Assert
        const placement = placementOf(changed, expressIdOf(changed, "b1"));
        expect(placement.relativeTo).toBe(objectPlacementOf(changed, expressIdOf(changed, "ground")));
        expect(placement.location).toEqual([0, 4000, 2850]);
        expect(rounded([placement.axis ?? [], placement.refDirection ?? []])).toEqual([[1, 0, 0], [0, 1, 0]]);
        expect(profileUp(placement)).toEqual([0, 0, 1]);
    });

    it("should extrude the section along the beam by its length", () => {
        // Arrange
        const { ifc, model } = groundFloor();

        // Act
        const changed = ifc.beams.add({ model, storey: "ground", id: "b1", start: [0, 0, 2850], end: [3000, 4000, 2850] });

        // Assert
        expect(extrusionOf(changed, expressIdOf(changed, "b1"))).toEqual({
            position: { location: [0, 0, 0], axis: null, refDirection: null },
            direction: [0, 0, 1],
            depth: 5000,
        });
    });

    it("should keep the section's Y up on a beam along +Y", () => {
        // Arrange
        const { ifc, model } = groundFloor();

        // Act
        const changed = ifc.beams.add({ model, storey: "ground", id: "b1", start: [0, 0, 2850], end: [0, 4000, 2850] });

        // Assert
        const placement = placementOf(changed, expressIdOf(changed, "b1"));
        expect(rounded([placement.axis ?? [], placement.refDirection ?? []])).toEqual([[0, 1, 0], [-1, 0, 0]]);
        expect(profileUp(placement)).toEqual([0, 0, 1]);
    });

    it("should keep the section's X level and its Y leaning up on a sloping beam", () => {
        // Arrange
        const { ifc, model } = groundFloor();

        // Act
        const changed = ifc.beams.add({ model, storey: "ground", id: "rafter", start: [0, 0, 0], end: [3000, 0, 4000] });

        // Assert
        const placement = placementOf(changed, expressIdOf(changed, "rafter"));
        expect(rounded([placement.axis ?? [], placement.refDirection ?? []])).toEqual([[0.6, 0, 0.8], [0, 1, 0]]);
        expect(profileUp(placement)).toEqual([-0.8, 0, 0.6]);
        expect(extrusionOf(changed, expressIdOf(changed, "rafter")).depth).toBe(5000);
    });

    it("should write a vertical beam with the standard axes", () => {
        // Arrange
        const { ifc, model } = groundFloor();

        // Act
        const changed = ifc.beams.add({ model, storey: "ground", id: "post", start: [100, 200, 0], end: [100, 200, 3000] });

        // Assert
        expect(placementOf(changed, expressIdOf(changed, "post"))).toEqual({
            relativeTo: objectPlacementOf(changed, expressIdOf(changed, "ground")),
            location: [100, 200, 0],
            axis: null,
            refDirection: null,
        });
    });

    it("should turn the section about the beam's axis by its rotation", () => {
        // Arrange
        const { ifc, model } = groundFloor();

        // Act
        const changed = ifc.beams.add({ model, storey: "ground", id: "b1", start: [0, 0, 2850], end: [5000, 0, 2850], rotation: 90 });

        // Assert
        const placement = placementOf(changed, expressIdOf(changed, "b1"));
        expect(rounded([placement.axis ?? [], placement.refDirection ?? []])).toEqual([[1, 0, 0], [0, 0, 1]]);
    });

    it("should write the section the profile names", () => {
        // Arrange
        const { ifc, model } = groundFloor();
        const start: Base.Point3 = [0, 0, 2850];
        const end: Base.Point3 = [5000, 0, 2850];

        // Act
        let changed = ifc.beams.add({ model, storey: "ground", id: "rect", start, end, width: 200, depth: 400 });
        changed = ifc.beams.add({ model: changed, storey: "ground", id: "round", start, end, profile: Inputs.IFC.profileKindEnum.circle, radius: 80 });
        changed = ifc.beams.add({ model: changed, storey: "ground", id: "steel", start, end, profile: Inputs.IFC.profileKindEnum.iShape, width: 150, depth: 300, webThickness: 7, flangeThickness: 11 });

        // Assert
        const rect = sweptAreaOf(changed, expressIdOf(changed, "rect"));
        const round = sweptAreaOf(changed, expressIdOf(changed, "round"));
        const steel = sweptAreaOf(changed, expressIdOf(changed, "steel"));
        expect([changed.typeOf(rect), changed.attribute(rect, "XDim"), changed.attribute(rect, "YDim")]).toEqual(["IfcRectangleProfileDef", 200, 400]);
        expect([changed.typeOf(round), changed.attribute(round, "Radius")]).toEqual(["IfcCircleProfileDef", 80]);
        expect([changed.typeOf(steel), ...["OverallWidth", "OverallDepth", "WebThickness", "FlangeThickness"].map((name) => changed.attribute(steel, name))])
            .toEqual(["IfcIShapeProfileDef", 150, 300, 7, 11]);
    });

    it("should mark the element a beam contained in its storey", () => {
        // Arrange
        const { ifc, model } = groundFloor();

        // Act
        const changed = ifc.beams.add({ model, storey: "ground", id: "b1", start: [0, 0, 2850], end: [5000, 0, 2850] });

        // Assert
        const beam = expressIdOf(changed, "b1");
        expect(changed.typeOf(beam)).toBe("IfcBeam");
        expect(enumOf(changed.attribute(beam, "PredefinedType"))).toBe("BEAM");
        expect(ifc.model.element({ model: changed, element: "b1" }).storey).toBe(ifc.model.globalIdOf({ model, id: "ground" }));
    });

    it("should associate the beam with its material by name", () => {
        // Arrange
        const { ifc, model: ground } = groundFloor();
        const model = ifc.materials.add({ model: ground, name: "Steel", category: "steel" });

        // Act
        const changed = ifc.beams.add({ model, storey: "ground", id: "b1", start: [0, 0, 2850], end: [5000, 0, 2850], material: "Steel" });

        // Assert
        expect(materialOf(changed, expressIdOf(changed, "b1"))).toBe(findMaterial(modelOf(changed), "Steel"));
    });

    it("should share one material association between members of the same material", () => {
        // Arrange
        const { ifc, model: ground } = groundFloor();
        let model = ifc.materials.add({ model: ground, name: "Steel" });
        model = ifc.columns.add({ model, storey: "ground", id: "c1", material: "Steel" });

        // Act
        const changed = ifc.beams.add({ model, storey: "ground", id: "b1", start: [0, 0, 2850], end: [5000, 0, 2850], material: "Steel" });

        // Assert
        expect(countOf(changed, "IfcRelAssociatesMaterial")).toBe(1);
        expect(materialOf(changed, expressIdOf(changed, "b1"))).toBe(materialOf(changed, expressIdOf(changed, "c1")));
    });

    it("should refuse a material the model does not have, naming it", () => {
        // Arrange
        const { ifc, model } = groundFloor();

        // Act & Assert
        expect(() => ifc.beams.add({ model, storey: "ground", start: [0, 0, 0], end: [1000, 0, 0], material: "Oak" })).toThrow("The model has no material named 'Oak'");
    });

    it("should refuse a beam whose start and end are the same point", () => {
        // Arrange
        const { ifc, model } = groundFloor();

        // Act & Assert
        expect(() => ifc.beams.add({ model, storey: "ground", start: [1000, 0, 2850], end: [1000, 0, 2850] })).toThrow("A member's start and end must be apart");
    });

    it("should refuse an I section that does not hold together", () => {
        // Arrange
        const { ifc, model } = groundFloor();

        // Act & Assert
        expect(() => ifc.beams.add({ model, storey: "ground", start: [0, 0, 0], end: [1000, 0, 0], profile: Inputs.IFC.profileKindEnum.iShape, width: 150, webThickness: 200 })).toThrow("web must be thinner");
        expect(() => ifc.beams.add({ model, storey: "ground", start: [0, 0, 0], end: [1000, 0, 0], profile: Inputs.IFC.profileKindEnum.iShape, depth: 20, flangeThickness: 10 })).toThrow("two flanges must be thinner");
    });

    it("should refuse an end that is not three finite numbers with a TypeError", () => {
        // Arrange
        const { ifc, model } = groundFloor();
        const twoNumbers: unknown = [1000, 0];

        // Act & Assert
        expect(() => ifc.beams.add({ model, storey: "ground", start: [0, 0, 0], end: twoNumbers as Base.Point3 })).toThrow("The end must be three finite numbers");
        expect(() => ifc.beams.add({ model, storey: "ground", start: [0, Number.NaN, 0], end: [1000, 0, 0] })).toThrow("The start must be three finite numbers");
    });

    it("should refuse a rotation that is not finite", () => {
        // Arrange
        const { ifc, model } = groundFloor();

        // Act & Assert
        expect(() => ifc.beams.add({ model, storey: "ground", start: [0, 0, 0], end: [1000, 0, 0], rotation: Infinity })).toThrow(RangeError);
    });

    it("should refuse a storey the model does not hold, naming it", () => {
        // Arrange
        const { ifc, model } = groundFloor();

        // Act & Assert
        expect(() => ifc.beams.add({ model, storey: "attic", start: [0, 0, 0], end: [1000, 0, 0] })).toThrow("The model has no storey 'attic'");
    });

    it("should leave the model it was given as it was", () => {
        // Arrange
        const { ifc, model } = groundFloor();

        // Act
        ifc.beams.add({ model, storey: "ground", id: "b1", start: [0, 0, 2850], end: [5000, 0, 2850] });

        // Assert
        expect(countOf(model, "IfcBeam")).toBe(0);
    });

    it("should refuse an input that is not a model with a TypeError", () => {
        // Arrange
        const { ifc } = groundFloor();

        // Act & Assert
        expect(() => ifc.beams.add({ model: notAModel(), storey: "ground", start: [0, 0, 0], end: [1000, 0, 0] })).toThrow(TypeError);
    });
});
