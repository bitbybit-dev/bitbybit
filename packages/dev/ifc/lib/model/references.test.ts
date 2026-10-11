import { describe, expect, it } from "vitest";
import { PLACED_WALL_ROWS, WALL_GLOBAL_ID, emptyIfc4Model, ifcFile } from "../__test__/model-fixtures";
import type { IfcEntity } from "../step/step-types";
import { ref } from "../step/values";
import { IdMap } from "./id-map";
import { ModelSnapshot } from "./snapshot";
import { readModel } from "./io";
import { checkReferences } from "./references";

const ASSOCIATION_GLOBAL_ID = "0$9GJWJuaHqveC0mNeB3C1";

function modelOf(entities: readonly IfcEntity[]): ModelSnapshot {
    const base = emptyIfc4Model();
    return new ModelSnapshot({ ...base.parts, overlay: IdMap.empty<IfcEntity | null>().withChanges(entities.map((entity) => [entity.id, entity] as const)), nextId: entities.length + 1 });
}

function point(id: number): IfcEntity {
    return { id, type: "IfcCartesianPoint", args: [[0, 0, 0]] };
}

function direction(id: number): IfcEntity {
    return { id, type: "IfcDirection", args: [[0, 0, 1]] };
}

function axes(id: number, location: number): IfcEntity {
    return { id, type: "IfcAxis2Placement3D", args: [ref(location), null, null] };
}

function localPlacement(id: number, relativeTo: number | null, relativePlacement: number): IfcEntity {
    return { id, type: "IfcLocalPlacement", args: [relativeTo === null ? null : ref(relativeTo), ref(relativePlacement)] };
}

function wall(id: number): IfcEntity {
    return { id, type: "IfcWall", args: [WALL_GLOBAL_ID, null, "Wall", null, null, null, null, null, null] };
}

function material(id: number): IfcEntity {
    return { id, type: "IfcMaterial", args: ["Concrete", null, null] };
}

function materialAssociation(id: number, objects: readonly number[], relatingMaterial: number): IfcEntity {
    return { id, type: "IfcRelAssociatesMaterial", args: [ASSOCIATION_GLOBAL_ID, null, null, null, objects.map(ref), ref(relatingMaterial)] };
}

describe("checkReferences", () => {
    it("should accept references to entities of the declared types", () => {
        // Arrange
        const model = modelOf([point(1), direction(2), { id: 3, type: "IfcAxis2Placement3D", args: [ref(1), ref(2), ref(2)] }, localPlacement(4, null, 3)]);

        // Act & Assert
        expect(() => checkReferences(model, [3, 4], [])).not.toThrow();
    });

    it("should refuse a reference to an entity the model does not hold", () => {
        // Arrange
        const model = modelOf([point(1), localPlacement(2, null, 99)]);

        // Act & Assert
        expect(() => checkReferences(model, [2], [])).toThrow("#2 IfcLocalPlacement.RelativePlacement refers to #99, which the model does not hold");
    });

    it("should refuse a reference to an entity of a type the attribute does not take", () => {
        // Arrange
        const model = modelOf([direction(1), axes(2, 1)]);

        // Act & Assert
        expect(() => checkReferences(model, [2], [])).toThrow("#2 IfcAxis2Placement3D.Location refers to #1, an IfcDirection, where IfcCartesianPoint is expected");
    });

    it("should refuse a reference to an entity no member of a select takes", () => {
        // Arrange
        const model = modelOf([point(1), localPlacement(2, null, 1)]);

        // Act & Assert
        expect(() => checkReferences(model, [2], [])).toThrow("#2 IfcLocalPlacement.RelativePlacement refers to #1, an IfcCartesianPoint, where IfcAxis2Placement is expected");
    });

    it("should accept a subtype where its supertype is declared", () => {
        // Arrange
        const model = modelOf([point(1), axes(2, 1), localPlacement(3, null, 2), localPlacement(4, 3, 2)]);

        // Act & Assert
        expect(() => checkReferences(model, [4], [])).not.toThrow();
    });

    it("should accept a material where a material select is declared", () => {
        // Arrange
        const model = modelOf([wall(1), material(2), materialAssociation(3, [1], 2)]);

        // Act & Assert
        expect(() => checkReferences(model, [3], [])).not.toThrow();
    });

    it("should refuse an entity that is no material where a material select is declared", () => {
        // Arrange
        const model = modelOf([wall(1), point(2), materialAssociation(3, [1], 2)]);

        // Act & Assert
        expect(() => checkReferences(model, [3], [])).toThrow("#3 IfcRelAssociatesMaterial.RelatingMaterial refers to #2, an IfcCartesianPoint, where IfcMaterialSelect is expected");
    });

    it("should accept a member of a select nested inside another select", () => {
        // Arrange
        const colour: IfcEntity = { id: 1, type: "IfcColourRgb", args: [null, 1, 0.5, 0] };
        const fillStyle: IfcEntity = { id: 2, type: "IfcFillAreaStyle", args: ["Red", [ref(1)], null] };
        const model = modelOf([colour, fillStyle]);

        // Act & Assert
        expect(() => checkReferences(model, [2], [])).not.toThrow();
    });

    it("should name the position of a wrong reference inside a list", () => {
        // Arrange
        const polyline: IfcEntity = { id: 3, type: "IfcPolyline", args: [[ref(1), ref(2)]] };
        const model = modelOf([point(1), direction(2), polyline]);

        // Act & Assert
        expect(() => checkReferences(model, [3], [])).toThrow("#3 IfcPolyline.Points[1] refers to #2, an IfcDirection, where IfcCartesianPoint is expected");
    });

    it("should check each member of a set against its select", () => {
        // Arrange
        const model = modelOf([wall(1), point(2), material(3), materialAssociation(4, [1, 2], 3)]);

        // Act & Assert
        expect(() => checkReferences(model, [4], [])).toThrow("#4 IfcRelAssociatesMaterial.RelatedObjects[1] refers to #2, an IfcCartesianPoint, where IfcDefinitionSelect is expected");
    });

    it("should check only the entities it is given", () => {
        // Arrange
        const model = modelOf([point(1), localPlacement(2, null, 1), axes(3, 1)]);

        // Act & Assert
        expect(() => checkReferences(model, [1, 3], [])).not.toThrow();
        expect(() => checkReferences(model, [2], [])).toThrow("where IfcAxis2Placement is expected");
    });

    it("should refuse a deletion while other entities still refer to the entity, naming them all", () => {
        // Arrange
        const polyline: IfcEntity = { id: 3, type: "IfcPolyline", args: [[ref(1), ref(4)]] };
        const model = modelOf([axes(2, 1), polyline, point(4)]);

        // Act & Assert
        expect(() => checkReferences(model, [], [1])).toThrow("#1 cannot be deleted while #2, #3 still refer to it");
    });

    it("should accept a deletion nothing refers to", () => {
        // Arrange
        const model = modelOf([point(1), axes(2, 1)]);

        // Act & Assert
        expect(() => checkReferences(model, [], [4])).not.toThrow();
    });

    it("should check entities read from a file the same way", () => {
        // Arrange
        const model = readModel(ifcFile([...PLACED_WALL_ROWS, "#40=IFCLOCALPLACEMENT(#10,#5);"]));

        // Act & Assert
        expect(() => checkReferences(model, [3, 10, 20, 30], [])).not.toThrow();
        expect(() => checkReferences(model, [40], [])).toThrow("#40 IfcLocalPlacement.RelativePlacement refers to #5, an IfcCartesianPoint, where IfcAxis2Placement is expected");
    });
});

describe("checkReferences inside typed values and towards unknown types", () => {
    it("should check the references a typed select value holds", () => {
        // Arrange
        const wall: IfcEntity = { id: 1, type: "IfcWall", args: [WALL_GLOBAL_ID, null, null, null, null, null, null, null, null] };
        const property: IfcEntity = { id: 2, type: "IfcPropertySingleValue", args: ["Fire", null, null, null] };
        const relationship: IfcEntity = { id: 3, type: "IfcRelDefinesByProperties", args: [ASSOCIATION_GLOBAL_ID, null, null, null, [ref(1)], { type: "IfcPropertySetDefinitionSet", value: [ref(2)] }] };
        const model = modelOf([wall, property, relationship]);

        // Act & Assert
        expect(() => checkReferences(model, [3], [])).toThrow("#3 IfcRelDefinesByProperties.RelatingPropertyDefinition[0] refers to #2, an IfcPropertySingleValue, where IfcPropertySetDefinition is expected");
    });

    it("should say that a reference names an entity of a type the schema does not define", () => {
        // Arrange
        const model = readModel(ifcFile(["#7=IFCNOTATHING((1.));", "#8=IFCPOLYLINE((#7));"]));

        // Act & Assert
        expect(() => checkReferences(model, [8], [])).toThrow("#8 IfcPolyline.Points[0] refers to #7, a IFCNOTATHING, which IFC4 does not define");
    });
});
