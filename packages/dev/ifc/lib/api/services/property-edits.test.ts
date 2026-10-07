import { describe, expect, it } from "vitest";
import { addRightWall, errorFrom, expressIdOf, groundFloor, writingInto } from "../../__test__/build-setup";
import { countOf, refsOf } from "../../__test__/build-geometry";
import type { Fixture } from "../../__test__/fixture-types";
import { addPropertySet } from "../../build/properties";
import type { IfcModel } from "../../model/model-types";
import { ref, typed as typedValue } from "../../step/values";
import type { IFCService } from "../ifc-service";

function twoWalls(): Fixture {
    const { ifc, model: ground } = groundFloor();
    let model = addRightWall(ifc, ground, "south", [0, 0], [10000, 0]);
    model = addRightWall(ifc, model, "north", [0, 8000], [10000, 8000]);
    return { ifc, model };
}

function withCommon(elements: string[]): Fixture {
    const { ifc, model } = twoWalls();
    return {
        ifc,
        model: ifc.properties.addSet({ model, elements, name: "Pset_WallCommon", properties: [{ name: "IsExternal", value: true }, { name: "FireRating", value: "REI 60" }] }),
    };
}

function typed(): Fixture {
    const { ifc, model: ground } = groundFloor();
    let model = ifc.materials.addLayerSet({ model: ground, name: "Typed", layers: [{ thickness: 200 }] });
    model = ifc.walls.addType({ model, id: "type", layerSet: "Typed" });
    model = ifc.walls.add({ model, storey: "ground", id: "south", start: [0, 0], end: [5000, 0], wallType: "type" });
    return { ifc, model: ifc.properties.addSet({ model, elements: ["type"], name: "Pset_WallCommon", properties: [{ name: "FireRating", value: "REI 30" }] }) };
}

function setNamed(model: IfcModel, name: string): number {
    return model.byType("IfcPropertySet").find((set) => model.attribute(set.id, "Name") === name)!.id;
}

function setsOfSets(): Fixture {
    const { ifc, model } = twoWalls();
    const { tx, writer } = writingInto(model);
    const sets = ["Pset_A", "Pset_B"].map((name) => addPropertySet(tx, writer, [], name, [{ name: "Value", value: name, type: undefined }]));
    writer.create("IfcRelDefinesByProperties", {
        GlobalId: tx.globalId(undefined),
        RelatedObjects: ["south", "north"].map((id) => ref(expressIdOf(model, id))),
        RelatingPropertyDefinition: typedValue("IfcPropertySetDefinitionSet", sets.map(ref)),
    });
    return { ifc, model: tx.commit() };
}

function sharedWithType(holder: "occurrence" | "second type"): Fixture {
    const { ifc, model: one } = typed();
    const model = holder === "second type" ? ifc.walls.addType({ model: one, id: "other", layerSet: "Typed" }) : one;
    const { tx, writer } = writingInto(model);
    const set = setNamed(model, "Pset_WallCommon");
    if (holder === "second type") {
        tx.update(expressIdOf(model, "other"), { HasPropertySets: [ref(set)] });
    } else {
        writer.create("IfcRelDefinesByProperties", { GlobalId: tx.globalId(undefined), RelatedObjects: [ref(expressIdOf(model, "south"))], RelatingPropertyDefinition: ref(set) });
    }
    return { ifc, model: tx.commit() };
}

function valuesOf(ifc: IFCService, model: IfcModel, element: string): Record<string, Record<string, string | number | boolean>> {
    return Object.fromEntries(ifc.properties.getSets({ model, element }).map((set) => [set.name, set.properties]));
}

describe("IFCProperties.setValues", () => {
    it("should make the set when the object has none of that name", () => {
        // Arrange
        const { ifc, model } = twoWalls();

        // Act
        const changed = ifc.properties.setValues({ model, element: "south", name: "Custom", properties: [{ name: "Count", value: 3 }] });

        // Assert
        expect(valuesOf(ifc, changed, "south")).toEqual({ Custom: { Count: 3 } });
    });

    it("should change one value, add another and keep the rest, and leave the model it was given as it was", () => {
        // Arrange
        const { ifc, model } = withCommon(["south"]);

        // Act
        const changed = ifc.properties.setValues({ model, element: "south", name: "Pset_WallCommon", properties: [{ name: "FireRating", value: "REI 90" }, { name: "LoadBearing", value: false }] });

        // Assert
        expect(valuesOf(ifc, changed, "south")).toEqual({ Pset_WallCommon: { IsExternal: true, FireRating: "REI 90", LoadBearing: false } });
        expect(valuesOf(ifc, model, "south")).toEqual({ Pset_WallCommon: { IsExternal: true, FireRating: "REI 60" } });
        expect(countOf(changed, "IfcPropertySingleValue")).toBe(3);
    });

    it("should give an object its own copy of a set it shares, so the others keep their values", () => {
        // Arrange
        const { ifc, model } = withCommon(["south", "north"]);

        // Act
        const changed = ifc.properties.setValues({ model, element: "south", name: "Pset_WallCommon", properties: [{ name: "FireRating", value: "REI 90" }] });

        // Assert
        expect(valuesOf(ifc, changed, "south")).toEqual({ Pset_WallCommon: { IsExternal: true, FireRating: "REI 90" } });
        expect(valuesOf(ifc, changed, "north")).toEqual({ Pset_WallCommon: { IsExternal: true, FireRating: "REI 60" } });
        expect(countOf(changed, "IfcPropertySet")).toBe(2);
    });

    it("should keep a shared set's description on the copy and share with it the properties it did not change", () => {
        // Arrange
        const { ifc, model: plain } = withCommon(["south", "north"]);
        const { tx } = writingInto(plain);
        tx.update(setNamed(plain, "Pset_WallCommon"), { Description: "Common to the walls" });
        const model = tx.commit();

        // Act
        const changed = ifc.properties.setValues({ model, element: "south", name: "Pset_WallCommon", properties: [{ name: "FireRating", value: "REI 90" }] });

        // Assert
        const [first, second] = changed.byType("IfcPropertySet").map((set) => set.id);
        const shared = refsOf(changed.attribute(first!, "HasProperties")).filter((property) => refsOf(changed.attribute(second!, "HasProperties")).includes(property));
        expect([changed.attribute(first!, "Description"), changed.attribute(second!, "Description")]).toEqual(["Common to the walls", "Common to the walls"]);
        expect([shared.map((property) => changed.attribute(property, "Name")), countOf(changed, "IfcPropertySingleValue")]).toEqual([["IsExternal"], 3]);
    });

    it.each(["occurrence", "second type"] as const)("should copy a set a type shares with an %s before changing the type's values", (holder) => {
        // Arrange
        const { ifc, model } = sharedWithType(holder);
        const other = holder === "occurrence" ? "south" : "other";

        // Act
        const changed = ifc.properties.setValues({ model, element: "type", name: "Pset_WallCommon", properties: [{ name: "FireRating", value: "REI 120" }] });

        // Assert
        expect([valuesOf(ifc, changed, "type"), valuesOf(ifc, changed, other)]).toEqual([{ Pset_WallCommon: { FireRating: "REI 120" } }, { Pset_WallCommon: { FireRating: "REI 30" } }]);
    });

    it("should copy one set of a set of sets before changing it, keeping the object's others and leaving the other objects the whole", () => {
        // Arrange
        const { ifc, model } = setsOfSets();

        // Act
        const changed = ifc.properties.setValues({ model, element: "south", name: "Pset_A", properties: [{ name: "Value", value: "changed" }] });

        // Assert
        expect(valuesOf(ifc, changed, "south")).toEqual({ Pset_A: { Value: "changed" }, Pset_B: { Value: "Pset_B" } });
        expect(valuesOf(ifc, changed, "north")).toEqual({ Pset_A: { Value: "Pset_A" }, Pset_B: { Value: "Pset_B" } });
    });

    it("should set the values of a type's own set", () => {
        // Arrange
        const { ifc, model } = typed();

        // Act
        const changed = ifc.properties.setValues({ model, element: "type", name: "Pset_WallCommon", properties: [{ name: "FireRating", value: "REI 120" }] });

        // Assert
        expect(valuesOf(ifc, changed, "type")).toEqual({ Pset_WallCommon: { FireRating: "REI 120" } });
    });

    it("should give an occurrence a set of its own beside its type's, and leave the type's as it was", () => {
        // Arrange
        const { ifc, model } = typed();

        // Act
        const changed = ifc.properties.setValues({ model, element: "south", name: "Pset_WallCommon", properties: [{ name: "FireRating", value: "REI 60" }] });

        // Assert
        expect([valuesOf(ifc, changed, "south"), valuesOf(ifc, changed, "type")]).toEqual([{ Pset_WallCommon: { FireRating: "REI 60" } }, { Pset_WallCommon: { FireRating: "REI 30" } }]);
    });

    it.each([
        [[], "Give at least one property to set"],
        [[{ name: "A", value: 1 }, { name: "A", value: 2 }], "The property set names 'A' twice"],
    ])("should refuse the properties %j", (properties, message) => {
        // Arrange
        const { ifc, model } = withCommon(["south"]);

        // Act
        const error = errorFrom(() => ifc.properties.setValues({ model, element: "south", name: "Pset_WallCommon", properties }));

        // Assert
        expect(error.message).toBe(message);
    });

    it("should refuse properties that are not a list", () => {
        // Arrange
        const { ifc, model } = twoWalls();
        const notAList: unknown = "IsExternal";

        // Act
        const error = errorFrom(() => ifc.properties.setValues({ model, element: "south", name: "Custom", properties: notAList as [] }));

        // Assert
        expect(error.message).toBe("Expected the properties as a list");
    });
});

describe("IFCProperties.removeValues", () => {
    it("should take the named properties out and keep the rest", () => {
        // Arrange
        const { ifc, model } = withCommon(["south"]);

        // Act
        const changed = ifc.properties.removeValues({ model, element: "south", name: "Pset_WallCommon", names: ["FireRating"] });

        // Assert
        expect(valuesOf(ifc, changed, "south")).toEqual({ Pset_WallCommon: { IsExternal: true } });
        expect(countOf(changed, "IfcPropertySingleValue")).toBe(1);
    });

    it("should take the set away once none of its properties are left", () => {
        // Arrange
        const { ifc, model } = withCommon(["south"]);

        // Act
        const changed = ifc.properties.removeValues({ model, element: "south", name: "Pset_WallCommon", names: ["FireRating", "IsExternal"] });

        // Assert
        expect([valuesOf(ifc, changed, "south"), countOf(changed, "IfcPropertySet"), countOf(changed, "IfcRelDefinesByProperties"), countOf(changed, "IfcPropertySingleValue")]).toEqual([{}, 0, 0, 0]);
    });

    it("should copy a shared set before taking properties out of it", () => {
        // Arrange
        const { ifc, model } = withCommon(["south", "north"]);

        // Act
        const changed = ifc.properties.removeValues({ model, element: "south", name: "Pset_WallCommon", names: ["FireRating"] });

        // Assert
        expect([valuesOf(ifc, changed, "south"), valuesOf(ifc, changed, "north")]).toEqual([{ Pset_WallCommon: { IsExternal: true } }, { Pset_WallCommon: { IsExternal: true, FireRating: "REI 60" } }]);
    });

    it("should refuse a property the set does not hold and a set the object does not have", () => {
        // Arrange
        const { ifc, model } = withCommon(["south"]);

        // Act
        const property = errorFrom(() => ifc.properties.removeValues({ model, element: "south", name: "Pset_WallCommon", names: ["Colour"] }));
        const set = errorFrom(() => ifc.properties.removeValues({ model, element: "north", name: "Pset_WallCommon", names: ["FireRating"] }));

        // Assert
        expect(property.message).toMatch(/^The property set 'Pset_WallCommon' of the IfcWall \S+ has no property named 'Colour'$/);
        expect(set.message).toMatch(/^the IfcWall \S+ has no property set named 'Pset_WallCommon'$/);
    });

    it("should refuse names that are not a list of texts", () => {
        // Arrange
        const { ifc, model } = withCommon(["south"]);

        // Act
        const error = errorFrom(() => ifc.properties.removeValues({ model, element: "south", name: "Pset_WallCommon", names: [] }));

        // Assert
        expect(error.message).toBe("Expected the names of the properties as a list of at least one text");
    });
});

describe("IFCProperties.removeSet", () => {
    it("should take a set away from the one object that had it, with its properties", () => {
        // Arrange
        const { ifc, model } = withCommon(["south"]);

        // Act
        const changed = ifc.properties.removeSet({ model, element: "south", name: "Pset_WallCommon" });

        // Assert
        expect([countOf(changed, "IfcPropertySet"), countOf(changed, "IfcRelDefinesByProperties"), countOf(changed, "IfcPropertySingleValue")]).toEqual([0, 0, 0]);
    });

    it("should leave a shared set with the other objects", () => {
        // Arrange
        const { ifc, model } = withCommon(["south", "north"]);

        // Act
        const changed = ifc.properties.removeSet({ model, element: "south", name: "Pset_WallCommon" });

        // Assert
        expect([valuesOf(ifc, changed, "south"), valuesOf(ifc, changed, "north")]).toEqual([{}, { Pset_WallCommon: { IsExternal: true, FireRating: "REI 60" } }]);
    });

    it("should take one set of a set of sets from an object, leaving it the others and the other objects the whole", () => {
        // Arrange
        const { ifc, model } = setsOfSets();

        // Act
        const changed = ifc.properties.removeSet({ model, element: "south", name: "Pset_A" });

        // Assert
        expect([valuesOf(ifc, changed, "south"), valuesOf(ifc, changed, "north")]).toEqual([{ Pset_B: { Value: "Pset_B" } }, { Pset_A: { Value: "Pset_A" }, Pset_B: { Value: "Pset_B" } }]);
    });

    it("should take a type's last set away and leave it with none", () => {
        // Arrange
        const { ifc, model } = typed();

        // Act
        const changed = ifc.properties.removeSet({ model, element: "type", name: "Pset_WallCommon" });

        // Assert
        expect([ifc.model.getAttribute({ model: changed, element: "type", attribute: "HasPropertySets" }), countOf(changed, "IfcPropertySet")]).toEqual([null, 0]);
    });
});
