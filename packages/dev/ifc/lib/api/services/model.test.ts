import { describe, expect, it } from "vitest";
import type { Fixture } from "../../__test__/fixture-types";
import { modelOf } from "./service-support";
import { addRightWall, errorFrom, expressIdOf, groundFloor, notAModel, oneWall, TIME_STAMP } from "../../__test__/build-setup";
import { enumOf, onlyOf } from "../../__test__/build-geometry";
import { IfcValueError } from "../../step/errors";
import { IFCService } from "../ifc-service";
import * as Inputs from "../inputs";

const GLOBAL_ID_LENGTH = 22;

function smallHouseText(seed: string | undefined): string {
    const ifc = new IFCService();
    let model = ifc.model.create(seed === undefined ? { name: "House" } : { name: "House", seed });
    model = ifc.spatial.addStorey({ model, id: "ground", elevation: 0 });
    model = addRightWall(ifc, model, "south", [0, 0], [10000, 0]);
    model = addRightWall(ifc, model, "east", [10000, 0], [10000, 8000]);
    model = ifc.walls.connect({ model, wall: "south", other: "east" });
    model = ifc.doors.addType({ model, id: "door" });
    model = ifc.doors.add({ model, wall: "south", doorType: "door", id: "front", offset: 2000 });
    return ifc.model.write({ model, timeStamp: TIME_STAMP });
}

describe("IFCModels.create", () => {
    it("should start an empty IFC4 project in millimetres", () => {
        // Arrange
        const ifc = new IFCService();

        // Act
        const model = ifc.model.create({});

        // Assert
        expect(ifc.model.summary({ model })).toEqual({
            schema: "IFC4",
            editable: true,
            project: "Project",
            millimetresPerUnit: 1,
            entities: model.size,
            storeys: [],
            elementCounts: {},
        });
    });

    it("should name the project, its site and its building", () => {
        // Arrange
        const ifc = new IFCService();

        // Act
        const model = ifc.model.create({ name: "House", siteName: "Plot 7", buildingName: "Main" });

        // Assert
        expect(ifc.model.summary({ model }).project).toBe("House");
        expect(model.attribute(onlyOf(model, "IfcSite"), "Name")).toBe("Plot 7");
        expect(model.attribute(onlyOf(model, "IfcBuilding"), "Name")).toBe("Main");
    });

    it.each([
        [Inputs.IFC.lengthUnitEnum.millimetre, 1],
        [Inputs.IFC.lengthUnitEnum.centimetre, 10],
        [Inputs.IFC.lengthUnitEnum.metre, 1000],
    ])("should count the millimetres per unit of a model in %s", (lengthUnit, millimetres) => {
        // Arrange
        const ifc = new IFCService();

        // Act
        const model = ifc.model.create({ lengthUnit });

        // Assert
        expect(ifc.model.summary({ model }).millimetresPerUnit).toBe(millimetres);
    });

    it("should refuse a length unit it does not know rather than write the model in metres", () => {
        // Arrange
        const ifc = new IFCService();
        const inch: unknown = "INCH";
        const lowerCase: unknown = "MILLIMETRE";

        // Act & Assert
        expect(() => ifc.model.create({ lengthUnit: inch as Inputs.IFC.lengthUnitEnum })).toThrow("INCH");
        expect(() => ifc.model.create({ lengthUnit: lowerCase as Inputs.IFC.lengthUnitEnum })).toThrow("MILLIMETRE");
    });

    it("should write the length unit as an SI metre with the unit's prefix", () => {
        // Arrange
        const ifc = new IFCService();

        // Act
        const texts = [Inputs.IFC.lengthUnitEnum.millimetre, Inputs.IFC.lengthUnitEnum.centimetre, Inputs.IFC.lengthUnitEnum.metre]
            .map((lengthUnit) => ifc.model.write({ model: ifc.model.create({ lengthUnit, seed: "units" }), timeStamp: TIME_STAMP }));

        // Assert
        expect(texts[0]).toContain("IFCSIUNIT(*,.LENGTHUNIT.,.MILLI.,.METRE.)");
        expect(texts[1]).toContain("IFCSIUNIT(*,.LENGTHUNIT.,.CENTI.,.METRE.)");
        expect(texts[2]).toContain("IFCSIUNIT(*,.LENGTHUNIT.,$,.METRE.)");
    });

    it("should hold a model and a plan context with the body, axis, box and footprint sub-contexts", () => {
        // Arrange
        const ifc = new IFCService();

        // Act
        const model = ifc.model.create({});

        // Assert
        const contexts = model.byType("IfcGeometricRepresentationContext", false).map((context) => model.attribute(context.id, "ContextType"));
        const subContexts = model.byType("IfcGeometricRepresentationSubContext").map((context) => [
            model.attribute(context.id, "ContextType"),
            model.attribute(context.id, "ContextIdentifier"),
            enumOf(model.attribute(context.id, "TargetView")),
        ]);
        expect(contexts).toEqual(["Model", "Plan"]);
        expect(subContexts).toEqual([
            ["Model", "Body", "MODEL_VIEW"],
            ["Model", "Axis", "GRAPH_VIEW"],
            ["Model", "Box", "MODEL_VIEW"],
            ["Plan", "Axis", "GRAPH_VIEW"],
            ["Plan", "FootPrint", "PLAN_VIEW"],
        ]);
    });

    it("should write the same file twice from the same seed, calls and time stamp", () => {
        // Act
        const first = smallHouseText("house-1");
        const second = smallHouseText("house-1");

        // Assert
        expect(second).toBe(first);
    });

    it("should write different files from different seeds", () => {
        // Act
        const first = smallHouseText("house-1");
        const second = smallHouseText("house-2");

        // Assert
        expect(second).not.toBe(first);
    });

    it("should give random GlobalIds without a seed", () => {
        // Arrange
        const ifc = new IFCService();

        // Act
        const first = ifc.model.create({});
        const second = ifc.model.create({});

        // Assert
        expect(modelOf(first).keySeed).toHaveLength(GLOBAL_ID_LENGTH);
        expect(modelOf(second).keySeed).not.toBe(modelOf(first).keySeed);
        expect(ifc.model.globalIdOf({ model: second, id: "south" })).not.toBe(ifc.model.globalIdOf({ model: first, id: "south" }));
    });

    it("should write the author and the organization into the header", () => {
        // Arrange
        const ifc = new IFCService();
        const model = ifc.model.create({ seed: "header", author: "Ada", organization: "Bit by bit" });

        // Act
        const text = ifc.model.write({ model, fileName: "house.ifc", timeStamp: TIME_STAMP });

        // Assert
        expect(text).toContain(`FILE_NAME('house.ifc','${TIME_STAMP}',('Ada'),('Bit by bit'),'@bitbybit-dev/ifc','@bitbybit-dev/ifc','');`);
        expect(text).toContain("FILE_SCHEMA(('IFC4'));");
        expect(text).toContain("FILE_DESCRIPTION(('ViewDefinition [DesignTransferView_V1.0]'),'2;1');");
    });
});

describe("IFCModels.read and write", () => {
    it("should write the same text again after reading back what it wrote", () => {
        // Arrange
        const ifc = new IFCService();
        const text = smallHouseText("round-trip");

        // Act
        const model = ifc.model.read({ data: text });

        // Assert
        expect(ifc.model.write({ model, timeStamp: TIME_STAMP })).toBe(text);
    });

    it("should read the bytes of a file as it reads its text", () => {
        // Arrange
        const ifc = new IFCService();
        const text = smallHouseText("bytes");

        // Act
        const model = ifc.model.read({ data: new TextEncoder().encode(text) });

        // Assert
        expect(ifc.model.write({ model, timeStamp: TIME_STAMP })).toBe(text);
    });

    it("should find objects by the ids they were added with after reading a file back", () => {
        // Arrange
        const { ifc, model } = oneWall("ids");
        const text = ifc.model.write({ model, timeStamp: TIME_STAMP });

        // Act
        const back = ifc.model.read({ data: text });

        // Assert
        expect(ifc.model.element({ model: back, element: "south" })).toEqual(ifc.model.element({ model, element: "south" }));
    });

    it("should summarise a model read back as the model it was written from", () => {
        // Arrange
        const ifc = new IFCService();
        const text = smallHouseText("summary");

        // Act
        const back = ifc.model.read({ data: text });

        // Assert
        expect(ifc.model.summary({ model: back }).elementCounts).toEqual({ IfcWall: 2, IfcDoor: 1, IfcOpeningElement: 1 });
    });

    it("should write as bytes the file it writes as text, its file name and time stamp in the header", () => {
        // Arrange
        const ifc = new IFCService();
        const model = ifc.model.read({ data: smallHouseText("as-bytes") });

        // Act
        const bytes = ifc.model.writeBytes({ model, fileName: "house.ifc", timeStamp: TIME_STAMP });

        // Assert
        expect(bytes).toEqual(new TextEncoder().encode(ifc.model.write({ model, fileName: "house.ifc", timeStamp: TIME_STAMP })));
        expect(new TextDecoder().decode(bytes)).toContain(`FILE_NAME('house.ifc','${TIME_STAMP}',`);
    });

    it("should record the current time when no time stamp is given to write as bytes", () => {
        // Arrange
        const ifc = new IFCService();
        const model = ifc.model.create({});

        // Act
        const bytes = ifc.model.writeBytes({ model });

        // Assert
        expect(new TextDecoder().decode(bytes)).toMatch(/FILE_NAME\('model\.ifc','\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}',/);
    });

    it("should record the current time when no time stamp is given", () => {
        // Arrange
        const ifc = new IFCService();
        const model = ifc.model.create({});

        // Act
        const text = ifc.model.write({ model });

        // Assert
        expect(text).toMatch(/FILE_NAME\('model\.ifc','\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}',/);
    });

    it("should end the file with the data section closed", () => {
        // Arrange
        const ifc = new IFCService();
        const model = ifc.model.create({});

        // Act
        const text = ifc.model.write({ model, timeStamp: TIME_STAMP });

        // Assert
        expect(text.startsWith("ISO-10303-21;\nHEADER;\n")).toBe(true);
        expect(text.endsWith("ENDSEC;\nEND-ISO-10303-21;\n")).toBe(true);
    });

    it("should refuse data that is neither a text nor bytes", () => {
        // Arrange
        const ifc = new IFCService();
        const notData: unknown = 42;

        // Act & Assert
        expect(() => ifc.model.read({ data: notData as string })).toThrow(TypeError);
    });
});

describe("IFCModels.summary", () => {
    it("should count the elements by type and list the storeys lowest first", () => {
        // Arrange
        const { ifc, model: ground } = groundFloor();
        let model = ifc.spatial.addStorey({ model: ground, id: "first", name: "First", elevation: 3000 });
        model = addRightWall(ifc, model, "south", [0, 0], [10000, 0]);
        model = addRightWall(ifc, model, "upper", [0, 0], [10000, 0], "first");
        model = ifc.slabs.add({ model, storey: "ground", outline: [[0, 0], [10000, 0], [10000, 8000], [0, 8000]] });

        // Act
        const summary = ifc.model.summary({ model });

        // Assert
        expect(summary.elementCounts).toEqual({ IfcWall: 2, IfcSlab: 1 });
        expect(summary.storeys).toEqual([
            { globalId: ifc.model.globalIdOf({ model, id: "ground" }), name: "Ground", elevation: 0 },
            { globalId: ifc.model.globalIdOf({ model, id: "first" }), name: "First", elevation: 3000 },
        ]);
        expect(summary.entities).toBe(model.size);
    });
});

describe("IFCModels.elements", () => {
    function twoStoreys(): Fixture {
        const { ifc, model: ground } = groundFloor();
        let model = ifc.spatial.addStorey({ model: ground, id: "first", elevation: 3000 });
        model = addRightWall(ifc, model, "south", [0, 0], [10000, 0]);
        model = addRightWall(ifc, model, "upper", [0, 0], [10000, 0], "first");
        model = ifc.slabs.add({ model, storey: "ground", id: "floor", outline: [[0, 0], [10000, 0], [10000, 8000], [0, 8000]] });
        return { ifc, model };
    }

    it("should list every building element by default", () => {
        // Arrange
        const { ifc, model } = twoStoreys();

        // Act
        const elements = ifc.model.elements({ model });

        // Assert
        expect(elements.map((element) => element.globalId)).toEqual(["south", "upper", "floor"].map((id) => ifc.model.globalIdOf({ model, id })));
    });

    it("should list the elements of one type", () => {
        // Arrange
        const { ifc, model } = twoStoreys();

        // Act
        const walls = ifc.model.elements({ model, type: "IfcWall" });

        // Assert
        expect(walls.map((wall) => wall.type)).toEqual(["IfcWall", "IfcWall"]);
    });

    it("should list only the elements one storey contains", () => {
        // Arrange
        const { ifc, model } = twoStoreys();

        // Act
        const walls = ifc.model.elements({ model, type: "IfcWall", storey: "first" });

        // Assert
        expect(walls).toEqual([{ globalId: ifc.model.globalIdOf({ model, id: "upper" }), type: "IfcWall", name: "", storey: ifc.model.globalIdOf({ model, id: "first" }) }]);
    });

    it("should read the type's name in any case", () => {
        // Arrange
        const { ifc, model } = twoStoreys();

        // Act
        const walls = ifc.model.elements({ model, type: "IFCWALL" });

        // Assert
        expect(walls.map((wall) => wall.type)).toEqual(["IfcWall", "IfcWall"]);
    });

    it("should list objects that are not elements, such as storeys, by their type", () => {
        // Arrange
        const { ifc, model } = twoStoreys();

        // Act
        const storeys = ifc.model.elements({ model, type: "IfcBuildingStorey" });

        // Assert
        expect(storeys.map((storey) => storey.globalId)).toEqual(["ground", "first"].map((id) => ifc.model.globalIdOf({ model, id })));
        expect(storeys.map((storey) => storey.storey)).toEqual(["", ""]);
    });

    it("should refuse a type the schema does not define", () => {
        // Arrange
        const { ifc, model } = twoStoreys();

        // Act & Assert
        expect(() => ifc.model.elements({ model, type: "IfcSpaceship" })).toThrow("IfcSpaceship is not an IFC type with a GlobalId");
    });

    it("should refuse a type without a GlobalId", () => {
        // Arrange
        const { ifc, model } = twoStoreys();

        // Act & Assert
        expect(() => ifc.model.elements({ model, type: "IfcCartesianPoint" })).toThrow("IfcCartesianPoint is not an IFC type with a GlobalId");
    });

    it("should refuse a storey the model does not hold, naming it", () => {
        // Arrange
        const { ifc, model } = twoStoreys();

        // Act & Assert
        expect(() => ifc.model.elements({ model, storey: "attic" })).toThrow("'attic'");
    });
});

describe("IFCModels.element", () => {
    it("should describe a wall found by the id it was added with", () => {
        // Arrange
        const { ifc, model: ground } = groundFloor();
        const model = ifc.walls.add({ model: ground, storey: "ground", id: "south", name: "South wall", start: [0, 0], end: [10000, 0] });

        // Act
        const wall = ifc.model.element({ model, element: "south" });

        // Assert
        expect(wall).toEqual({
            globalId: ifc.model.globalIdOf({ model, id: "south" }),
            type: "IfcWall",
            name: "South wall",
            storey: ifc.model.globalIdOf({ model, id: "ground" }),
        });
    });

    it("should find an object by its GlobalId as by its id", () => {
        // Arrange
        const { ifc, model } = oneWall();
        const globalId = ifc.model.globalIdOf({ model, id: "south" });

        // Act
        const wall = ifc.model.element({ model, element: globalId });

        // Assert
        expect(wall.globalId).toBe(globalId);
    });

    it("should refuse an object the model does not hold, naming it", () => {
        // Arrange
        const { ifc, model } = oneWall();

        // Act & Assert
        expect(() => ifc.model.element({ model, element: "chimney" })).toThrow("The model has no object 'chimney'");
    });

    it("should refuse an empty id with a TypeError", () => {
        // Arrange
        const { ifc, model } = oneWall();

        // Act & Assert
        expect(() => ifc.model.element({ model, element: "" })).toThrow(TypeError);
    });
});

describe("IFCModels.setAttribute", () => {
    it.each(["Name", "Description", "Tag"])("should set a wall's %s to a text", (attribute) => {
        // Arrange
        const { ifc, model } = oneWall();

        // Act
        const changed = ifc.model.setAttribute({ model, element: "south", attribute, value: "Load bearing" });

        // Assert
        expect(changed.attribute(expressIdOf(changed, "south"), attribute)).toBe("Load bearing");
    });

    it("should set the Name when no attribute is named", () => {
        // Arrange
        const { ifc, model } = oneWall();

        // Act
        const changed = ifc.model.setAttribute({ model, element: "south", value: "South" });

        // Assert
        expect(ifc.model.element({ model: changed, element: "south" }).name).toBe("South");
    });

    it("should leave the model it was given as it was", () => {
        // Arrange
        const { ifc, model } = oneWall();

        // Act
        ifc.model.setAttribute({ model, element: "south", attribute: "Name", value: "South" });

        // Assert
        expect(model.attribute(expressIdOf(model, "south"), "Name")).toBe(null);
    });

    it("should write an enumeration attribute set by the name of its value", () => {
        // Arrange
        const { ifc, model } = oneWall();

        // Act
        const changed = ifc.model.setAttribute({ model, element: "south", attribute: "PredefinedType", value: "SHEAR" });

        // Assert
        const text = ifc.model.write({ model: changed, timeStamp: TIME_STAMP });
        const line = text.split("\n").find((row) => row.startsWith(`#${expressIdOf(changed, "south")}=`));
        expect(line?.endsWith(",.SHEAR.);")).toBe(true);
    });

    it("should hold an enumeration attribute set by name as the value a read of its file gives", () => {
        // Arrange
        const { ifc, model } = oneWall();

        // Act
        const changed = ifc.model.setAttribute({ model, element: "south", attribute: "PredefinedType", value: "shear" });
        const back = ifc.model.read({ data: ifc.model.write({ model: changed, timeStamp: TIME_STAMP }) });

        // Assert
        expect(back.attribute(expressIdOf(back, "south"), "PredefinedType")).toEqual({ enum: "SHEAR" });
        expect(changed.attribute(expressIdOf(changed, "south"), "PredefinedType")).toEqual({ enum: "SHEAR" });
    });

    it("should refuse a name that is not a value of the enumeration", () => {
        // Arrange
        const { ifc, model } = oneWall();

        // Act & Assert
        expect(() => ifc.model.setAttribute({ model, element: "south", attribute: "PredefinedType", value: "WOBBLY" })).toThrow(IfcValueError);
    });

    it("should refuse to change a GlobalId", () => {
        // Arrange
        const { ifc, model } = oneWall();

        // Act & Assert
        expect(() => ifc.model.setAttribute({ model, element: "south", attribute: "GlobalId", value: "0123456789012345678901" })).toThrow("cannot be changed");
    });

    it("should refuse a text for an attribute that holds a reference", () => {
        // Arrange
        const { ifc, model } = oneWall();

        // Act
        const error = errorFrom(() => ifc.model.setAttribute({ model, element: "south", attribute: "ObjectPlacement", value: "elsewhere" }));

        // Assert
        expect(error).toBeInstanceOf(IfcValueError);
        expect(error.message).toContain("expected a reference to an IfcObjectPlacement");
    });

    it("should refuse an attribute the object does not have", () => {
        // Arrange
        const { ifc, model } = oneWall();

        // Act & Assert
        expect(() => ifc.model.setAttribute({ model, element: "south", attribute: "Colour", value: "red" })).toThrow("IfcWall has no attribute Colour");
    });

    it("should refuse a number for an attribute that holds a text", () => {
        // Arrange
        const { ifc, model } = oneWall();

        // Act & Assert
        expect(() => ifc.model.setAttribute({ model, element: "south", attribute: "Name", value: 5 })).toThrow(IfcValueError);
    });

    it("should refuse a value that is not a text, a number, or true or false", () => {
        // Arrange
        const { ifc, model } = oneWall();
        const list: unknown = ["a"];

        // Act & Assert
        expect(() => ifc.model.setAttribute({ model, element: "south", attribute: "Name", value: list as string })).toThrow(TypeError);
    });

    it("should set a number attribute of a door", () => {
        // Arrange
        const { ifc, model: walled } = oneWall();
        let model = ifc.doors.addType({ model: walled, id: "door" });
        model = ifc.doors.add({ model, wall: "south", doorType: "door", id: "front" });

        // Act
        const changed = ifc.model.setAttribute({ model, element: "front", attribute: "OverallHeight", value: 2000 });

        // Assert
        expect(changed.attribute(expressIdOf(changed, "front"), "OverallHeight")).toBe(2000);
    });

    it("should refuse an input that is not a model with a TypeError", () => {
        // Arrange
        const ifc = new IFCService();

        // Act & Assert
        expect(() => ifc.model.setAttribute({ model: notAModel(), element: "south", attribute: "Name", value: "South" })).toThrow(TypeError);
    });

    it("should refuse an object the model does not hold, naming it", () => {
        // Arrange
        const { ifc, model } = oneWall();

        // Act & Assert
        expect(() => ifc.model.setAttribute({ model, element: "north", attribute: "Name", value: "North" })).toThrow("'north'");
    });
});

describe("IFCModels.globalIdOf", () => {
    it("should give the GlobalId an object added with the id carries", () => {
        // Arrange
        const { ifc, model } = oneWall();

        // Act
        const globalId = ifc.model.globalIdOf({ model, id: "south" });

        // Assert
        expect(globalId).toHaveLength(GLOBAL_ID_LENGTH);
        expect(model.attribute(expressIdOf(model, "south"), "GlobalId")).toBe(globalId);
    });

    it("should give the same GlobalId whether or not the model holds the object yet", () => {
        // Arrange
        const { ifc, model } = groundFloor();
        const before = ifc.model.globalIdOf({ model, id: "south" });

        // Act
        const after = ifc.model.globalIdOf({ model: addRightWall(ifc, model, "south", [0, 0], [10000, 0]), id: "south" });

        // Assert
        expect(after).toBe(before);
    });

    it("should let a GlobalId stand for itself", () => {
        // Arrange
        const { ifc, model } = oneWall();
        const globalId = ifc.model.globalIdOf({ model, id: "south" });

        // Act
        const same = ifc.model.globalIdOf({ model, id: globalId });

        // Assert
        expect(same).toBe(globalId);
    });

    it("should give different GlobalIds for the same id in models of different seeds", () => {
        // Arrange
        const ifc = new IFCService();
        const first = ifc.model.create({ seed: "a" });
        const second = ifc.model.create({ seed: "b" });

        // Act
        const ids = [first, second].map((model) => ifc.model.globalIdOf({ model, id: "south" }));

        // Assert
        expect(ids[1]).not.toBe(ids[0]);
    });

    it("should refuse an empty id with a TypeError", () => {
        // Arrange
        const { ifc, model } = oneWall();

        // Act & Assert
        expect(() => ifc.model.globalIdOf({ model, id: "" })).toThrow(TypeError);
    });
});

describe("IFCModels.upgradeToIfc4", () => {
    it("should open an IFC2X3 file to show, refuse to change it, and change it once it is upgraded", () => {
        // Arrange
        const ifc = new IFCService();
        const written = ifc.model.write({ model: oneWall().model, fileName: "wall.ifc", timeStamp: TIME_STAMP });
        const old = ifc.model.read({ data: written.replace("FILE_SCHEMA(('IFC4'));", "FILE_SCHEMA(('IFC2X3'));") });
        const walls = ifc.model.elements({ model: old, type: "IfcWall" });
        const wall = walls[0]!.globalId;

        // Act
        const before = ifc.model.summary({ model: old });
        const refused = errorFrom(() => ifc.model.setAttribute({ model: old, element: wall, attribute: "Name", value: "Renamed" }));
        const model = ifc.model.upgradeToIfc4({ model: old });
        const renamed = ifc.model.setAttribute({ model, element: wall, attribute: "Name", value: "Renamed" });

        // Assert
        expect(walls).toHaveLength(1);
        expect([before.schema, before.editable]).toEqual(["IFC2X3", false]);
        expect(refused.message).toBe("This IFC2X3 file is read through the IFC4 schema, so it can be shown and queried but not changed");
        expect([ifc.model.summary({ model }).schema, ifc.model.summary({ model }).editable]).toEqual(["IFC4", true]);
        expect(ifc.model.getAttribute({ model: renamed, element: wall, attribute: "Name" })).toBe("Renamed");
    });

    it("should refuse what is not a model", () => {
        // Arrange
        const ifc = new IFCService();

        // Act & Assert
        expect(() => ifc.model.upgradeToIfc4({ model: notAModel() })).toThrow(TypeError);
    });
});
