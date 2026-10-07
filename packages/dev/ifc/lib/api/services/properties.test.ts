import { describe, expect, it } from "vitest";
import type { Fixture } from "../../__test__/fixture-types";
import { addRightWall, errorFrom, expressIdOf, groundFloor, notAModel, oneWall, TIME_STAMP } from "../../__test__/build-setup";
import { countOf, onlyOf, refOf, refsOf, typedOf } from "../../__test__/build-geometry";
import type { IfcModel } from "../../model/model-types";
import { IfcValueError } from "../../step/errors";
import type * as Inputs from "../inputs";

function twoWalls(): Fixture {
    const { ifc, model } = oneWall();
    return { ifc, model: addRightWall(ifc, model, "east", [10000, 0], [10000, 8000]) };
}

function nominalValues(model: IfcModel): Record<string, { type: string; value: unknown }> {
    const values: Record<string, { type: string; value: unknown }> = {};
    for (const property of model.byType("IfcPropertySingleValue")) {
        const name = model.attribute(property.id, "Name");
        if (typeof name === "string") {
            values[name] = typedOf(model.attribute(property.id, "NominalValue"));
        }
    }
    return values;
}

describe("IFCProperties.addSet", () => {
    it("should type each value by its kind: a label, a boolean, an integer or a real", () => {
        // Arrange
        const { ifc, model } = oneWall();

        // Act
        const changed = ifc.properties.addSet({
            model,
            elements: ["south"],
            name: "Pset_WallCommon",
            properties: [
                { name: "FireRating", value: "REI 60" },
                { name: "IsExternal", value: true },
                { name: "Storeys", value: 2 },
                { name: "Ratio", value: 0.35 },
                { name: "Huge", value: 2 ** 60 },
            ],
        });

        // Assert
        expect(nominalValues(changed)).toEqual({
            FireRating: { type: "IfcLabel", value: "REI 60" },
            IsExternal: { type: "IfcBoolean", value: true },
            Storeys: { type: "IfcInteger", value: 2 },
            Ratio: { type: "IfcReal", value: 0.35 },
            Huge: { type: "IfcReal", value: 2 ** 60 },
        });
    });

    it("should write a value as the type it is given", () => {
        // Arrange
        const { ifc, model } = oneWall();

        // Act
        const changed = ifc.properties.addSet({ model, elements: ["south"], name: "Pset_WallCommon", properties: [{ name: "ThermalTransmittance", value: 0.25, type: "IfcThermalTransmittanceMeasure" }] });

        // Assert
        expect(nominalValues(changed)).toEqual({ ThermalTransmittance: { type: "IfcThermalTransmittanceMeasure", value: 0.25 } });
        expect(ifc.model.write({ model: changed, timeStamp: TIME_STAMP })).toContain("IFCPROPERTYSINGLEVALUE('ThermalTransmittance',$,IFCTHERMALTRANSMITTANCEMEASURE(0.25),$);");
    });

    it("should refuse a type the IFC schema does not have as a value", () => {
        // Arrange
        const { ifc, model } = oneWall();

        // Act
        const error = errorFrom(() => ifc.properties.addSet({ model, elements: ["south"], properties: [{ name: "Speed", value: 3, type: "IfcWarpSpeed" }] }));

        // Assert
        expect(error).toBeInstanceOf(IfcValueError);
        expect(error.message).toContain("IfcWarpSpeed is not one of the types IfcValue accepts");
    });

    it("should refuse a value that its given type cannot hold", () => {
        // Arrange
        const { ifc, model } = oneWall();

        // Act & Assert
        expect(() => ifc.properties.addSet({ model, elements: ["south"], properties: [{ name: "Width", value: "wide", type: "IfcLengthMeasure" }] })).toThrow(IfcValueError);
    });

    it("should attach the set to its elements through one relationship", () => {
        // Arrange
        const { ifc, model } = twoWalls();

        // Act
        const changed = ifc.properties.addSet({ model, elements: ["south", "east"], name: "Pset_WallCommon", properties: [{ name: "IsExternal", value: true }] });

        // Assert
        const rel = onlyOf(changed, "IfcRelDefinesByProperties");
        expect(countOf(changed, "IfcPropertySet")).toBe(1);
        expect(refsOf(changed.attribute(rel, "RelatedObjects"))).toEqual([expressIdOf(changed, "south"), expressIdOf(changed, "east")]);
        expect(refOf(changed.attribute(rel, "RelatingPropertyDefinition"))).toBe(onlyOf(changed, "IfcPropertySet"));
    });

    it("should name the set Properties by default and give it a GlobalId", () => {
        // Arrange
        const { ifc, model } = oneWall();

        // Act
        const changed = ifc.properties.addSet({ model, elements: ["south"], properties: [{ name: "Note", value: "x" }] });

        // Assert
        const set = onlyOf(changed, "IfcPropertySet");
        expect(changed.attribute(set, "Name")).toBe("Properties");
        expect(changed.attribute(set, "GlobalId")).toMatch(/^[0-3][0-9A-Za-z_$]{21}$/);
    });

    it("should name a property Property by default", () => {
        // Arrange
        const { ifc, model } = oneWall();

        // Act
        const changed = ifc.properties.addSet({ model, elements: ["south"], properties: [{ value: 1 }] });

        // Assert
        expect(ifc.properties.getSets({ model: changed, element: "south" })).toEqual([{ name: "Properties", properties: { Property: 1 } }]);
    });

    it("should attach a set to a type as to an element", () => {
        // Arrange
        const { ifc, model: walled } = oneWall();
        const model = ifc.doors.addType({ model: walled, id: "door" });

        // Act
        const changed = ifc.properties.addSet({ model, elements: ["door"], name: "Pset_DoorCommon", properties: [{ name: "FireRating", value: "EI 30" }] });

        // Assert
        expect(ifc.properties.getSets({ model: changed, element: "door" })).toEqual([{ name: "Pset_DoorCommon", properties: { FireRating: "EI 30" } }]);
    });

    it("should refuse a property named twice", () => {
        // Arrange
        const { ifc, model } = oneWall();

        // Act & Assert
        expect(() => ifc.properties.addSet({ model, elements: ["south"], properties: [{ name: "IsExternal", value: true }, { name: "IsExternal", value: false }] }))
            .toThrow("The property set names 'IsExternal' twice");
    });

    it("should refuse an empty list of properties", () => {
        // Arrange
        const { ifc, model } = oneWall();

        // Act & Assert
        expect(() => ifc.properties.addSet({ model, elements: ["south"], properties: [] })).toThrow("A property set needs at least one property");
    });

    it("should refuse properties that are not a list with a TypeError", () => {
        // Arrange
        const { ifc, model } = oneWall();
        const notAList: unknown = { name: "IsExternal", value: true };

        // Act & Assert
        expect(() => ifc.properties.addSet({ model, elements: ["south"], properties: notAList as Inputs.IFC.PropertyDto[] })).toThrow(TypeError);
    });

    it("should refuse an empty list of elements with a TypeError", () => {
        // Arrange
        const { ifc, model } = oneWall();

        // Act & Assert
        expect(() => ifc.properties.addSet({ model, elements: [], properties: [{ name: "IsExternal", value: true }] })).toThrow(TypeError);
    });

    it.each([Number.NaN, Infinity])("should refuse a value of %s with a TypeError", (value) => {
        // Arrange
        const { ifc, model } = oneWall();

        // Act & Assert
        expect(() => ifc.properties.addSet({ model, elements: ["south"], properties: [{ name: "Odd", value }] })).toThrow("The property 'Odd' needs a text, a finite number, or true or false");
    });

    it("should refuse a missing value with a TypeError", () => {
        // Arrange
        const { ifc, model } = oneWall();
        const nothing: unknown = null;

        // Act & Assert
        expect(() => ifc.properties.addSet({ model, elements: ["south"], properties: [{ name: "Odd", value: nothing as string }] })).toThrow(TypeError);
    });

    it("should refuse an element the model does not hold, naming it", () => {
        // Arrange
        const { ifc, model } = oneWall();

        // Act & Assert
        expect(() => ifc.properties.addSet({ model, elements: ["south", "chimney"], properties: [{ name: "IsExternal", value: true }] })).toThrow("The model has no object 'chimney'");
    });

    it("should refuse an element named twice, since a set of related objects holds each once", () => {
        // Arrange
        const { ifc, model } = oneWall();
        const globalId = ifc.model.globalIdOf({ model, id: "south" });

        // Act & Assert
        expect(() => ifc.properties.addSet({ model, elements: ["south", globalId], properties: [{ name: "IsExternal", value: true }] })).toThrow(IfcValueError);
    });

    it("should leave the model it was given as it was", () => {
        // Arrange
        const { ifc, model } = oneWall();

        // Act
        ifc.properties.addSet({ model, elements: ["south"], properties: [{ name: "IsExternal", value: true }] });

        // Assert
        expect(countOf(model, "IfcPropertySet")).toBe(0);
        expect(ifc.properties.getSets({ model, element: "south" })).toEqual([]);
    });

    it("should refuse an input that is not a model with a TypeError", () => {
        // Arrange
        const { ifc } = groundFloor();

        // Act & Assert
        expect(() => ifc.properties.addSet({ model: notAModel(), elements: ["south"], properties: [{ name: "IsExternal", value: true }] })).toThrow(TypeError);
    });
});

describe("IFCProperties.get", () => {
    it("should read every set of an element with each value by its name", () => {
        // Arrange
        const { ifc, model: walls } = twoWalls();
        let model = ifc.properties.addSet({
            model: walls,
            elements: ["south", "east"],
            name: "Pset_WallCommon",
            properties: [{ name: "IsExternal", value: true }, { name: "FireRating", value: "REI 60" }, { name: "ThermalTransmittance", value: 0.25, type: "IfcThermalTransmittanceMeasure" }],
        });
        model = ifc.properties.addSet({ model, elements: ["south"], name: "Acoustics", properties: [{ name: "Rating", value: 52 }] });

        // Act
        const south = ifc.properties.getSets({ model, element: "south" });
        const east = ifc.properties.getSets({ model, element: "east" });

        // Assert
        expect(south).toEqual([
            { name: "Pset_WallCommon", properties: { IsExternal: true, FireRating: "REI 60", ThermalTransmittance: 0.25 } },
            { name: "Acoustics", properties: { Rating: 52 } },
        ]);
        expect(east).toEqual([{ name: "Pset_WallCommon", properties: { IsExternal: true, FireRating: "REI 60", ThermalTransmittance: 0.25 } }]);
    });

    it("should read no sets of an element without any", () => {
        // Arrange
        const { ifc, model } = oneWall();

        // Act
        const sets = ifc.properties.getSets({ model, element: "south" });

        // Assert
        expect(sets).toEqual([]);
    });

    it("should read the sets of a model read back from its file", () => {
        // Arrange
        const { ifc, model: walled } = oneWall();
        const model = ifc.properties.addSet({ model: walled, elements: ["south"], name: "Pset_WallCommon", properties: [{ name: "IsExternal", value: true }, { name: "Layers", value: 3 }] });
        const back = ifc.model.read({ data: ifc.model.write({ model, timeStamp: TIME_STAMP }) });

        // Act
        const sets = ifc.properties.getSets({ model: back, element: "south" });

        // Assert
        expect(sets).toEqual([{ name: "Pset_WallCommon", properties: { IsExternal: true, Layers: 3 } }]);
    });

    it("should refuse an element the model does not hold, naming it", () => {
        // Arrange
        const { ifc, model } = oneWall();

        // Act & Assert
        expect(() => ifc.properties.getSets({ model, element: "chimney" })).toThrow("The model has no object 'chimney'");
    });

    it("should refuse an input that is not a model with a TypeError", () => {
        // Arrange
        const { ifc } = groundFloor();

        // Act & Assert
        expect(() => ifc.properties.getSets({ model: notAModel(), element: "south" })).toThrow(TypeError);
    });
});
