import { describe, expect, it } from "vitest";
import { addRightWall, expressIdOf, groundFloor, oneWall, writingInto } from "../__test__/build-setup";
import { refOf, representationNamed } from "../__test__/build-geometry";
import { emptyIfc4Model } from "../__test__/model-fixtures";
import { modelOf } from "../api/services/service-support";
import type { IfcModel } from "../model/model-types";
import { isIfcModel } from "../model/is-model";
import { enumValue, ref } from "../step/values";
import { AXIS_CONTEXT, bodyContext, findContext } from "./contexts";
import { RecipeBuilder } from "../geometry/recipe-builder";

function withoutAxisContexts(model: IfcModel): IfcModel {
    const snapshot = modelOf(model);
    const { tx } = writingInto(model);
    snapshot.byType("IfcGeometricRepresentationSubContext")
        .filter((context) => snapshot.attribute(context.id, "ContextIdentifier") === AXIS_CONTEXT.identifier)
        .forEach((context) => tx.delete(context.id));
    return tx.commit();
}

describe("representation contexts the model lacks", () => {
    it("should add an Axis context under the plan context when the model has no Axis context at all", () => {
        // Arrange
        const { ifc, model: ground } = groundFloor();
        const model = withoutAxisContexts(ground);

        // Act
        const changed = addRightWall(ifc, model, "south", [0, 0], [4000, 0]);

        // Assert
        const context = refOf(changed.attribute(representationNamed(changed, expressIdOf(changed, "south"), "Axis"), "ContextOfItems"));
        expect(changed.attribute(context, "ContextIdentifier")).toBe("Axis");
        expect(changed.attribute(refOf(changed.attribute(context, "ParentContext")), "ContextType")).toBe("Plan");
        expect(findContext(modelOf(changed), AXIS_CONTEXT)).toBe(context);
    });

    it("should refuse to add a representation to a model without any geometric context", () => {
        // Arrange
        const { tx, writer } = writingInto(emptyIfc4Model());

        // Act & Assert
        expect(() => bodyContext(tx, writer)).toThrow("The model has no geometric representation context to hold its Body representations");
    });
});

describe("types other tools made", () => {
    it("should refuse a wall of a type whose material is not a layer set", () => {
        // Arrange
        const { ifc, model: ground } = groundFloor();
        let model = ifc.materials.add({ model: ground, name: "Brick" });
        model = ifc.materials.addLayerSet({ model, name: "Layers", layers: [{ material: "Brick", thickness: 250 }] });
        model = ifc.walls.addType({ model, id: "plain", name: "Plain", layerSet: "Layers" });
        const typed = modelOf(model);
        const association = typed.byType("IfcRelAssociatesMaterial").find((rel) => refOf(typed.attribute(rel.id, "RelatingMaterial")) === typed.byType("IfcMaterialLayerSet")[0]!.id)!;
        const { tx } = writingInto(model);
        tx.update(association.id, { RelatingMaterial: ref(typed.byType("IfcMaterial")[0]!.id) });
        const changed = tx.commit();

        // Act & Assert
        expect(() => ifc.walls.add({ model: changed, storey: "ground", start: [0, 0], end: [4000, 0], wallType: "plain" })).toThrow("The wall type 'plain' has no layer set");
    });

    it("should refuse a door type without a representation map, or without geometry it can size", () => {
        // Arrange
        const { ifc, model } = oneWall();
        const { tx, writer } = writingInto(model);
        tx.create("IfcDoorType", { GlobalId: tx.globalId("bare"), Name: "Bare", PredefinedType: enumValue("DOOR"), OperationType: enumValue("SINGLE_SWING_LEFT") });
        const block = writer.create("IfcBlock", { Position: ref(writer.placement3({ origin: [0, 0, 0], x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1] })), XLength: 900, YLength: 50, ZLength: 2100 });
        const body = writer.shapeRepresentation(bodyContext(tx, writer), "Body", "CSG", [block]);
        const map = writer.create("IfcRepresentationMap", { MappingOrigin: ref(writer.placement3({ origin: [0, 0, 0], x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1] })), MappedRepresentation: ref(body) });
        tx.create("IfcDoorType", { GlobalId: tx.globalId("block"), Name: "Block", RepresentationMaps: [ref(map)], PredefinedType: enumValue("DOOR"), OperationType: enumValue("SINGLE_SWING_LEFT") });
        const withTypes = tx.commit();

        // Act & Assert
        expect(() => ifc.doors.add({ model: withTypes, wall: "south", doorType: "bare" })).toThrow("has no representation map");
        expect(() => ifc.doors.add({ model: withTypes, wall: "south", doorType: "block" })).toThrow("has no geometry this library can size");
    });
});

describe("small pieces of the model API", () => {
    it("should tell a model from anything else and name its schema", () => {
        // Arrange
        const { model } = groundFloor();

        // Act & Assert
        expect([isIfcModel(model), isIfcModel({ hash: 1, type: "ifc-model" }), isIfcModel(undefined)]).toEqual([true, false, false]);
        expect(model.schemaName).toBe("IFC4");
    });

    it("should grow a recipe's buffers past their first size and keep every number", () => {
        // Arrange
        const builder = new RecipeBuilder();
        const many = Array.from({ length: 100_000 }, (_, index) => index);

        // Act
        const numbers = builder.numbers(many);
        const indices = builder.indices(many);
        const recipe = builder.build(1, 0.001);

        // Assert
        expect([numbers, indices]).toEqual([[0, many.length], [0, many.length]]);
        expect(recipe.buffers.f64[many.length - 1]).toBe(many.length - 1);
        expect(recipe.buffers.i32.length).toBe(many.length);
    });
});
