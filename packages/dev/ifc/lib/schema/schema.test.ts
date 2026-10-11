import { describe, expect, it } from "vitest";
import { schemaNamed } from "./registry";
import { IfcSchema, SIMPLE_TYPES } from "./schema";
import type { CompactSchema, IfcAggregateSpec } from "./schema-types";

const ifc4 = (): IfcSchema => schemaNamed("IFC4");

const TINY_TABLE: CompactSchema = {
    name: "TINY",
    release: "TINY 1",
    types: {
        Length: { t: "REAL" },
        PositiveLength: { t: "Length" },
        Side: { e: ["LEFT", "RIGHT"] },
        Anything: { s: ["Length", "Thing"] },
    },
    entities: {
        Thing: { p: null, a: [["Name", "STRING"], ["Size", "Length", 1]], abs: 1 },
        Part: { p: "Thing", a: [["Side", "Side"]], d: ["Size"] },
        SmallPart: { p: "Part", a: [["Weight", "PositiveLength", 1]] },
    },
};

const WALL_ATTRIBUTES = ["GlobalId", "OwnerHistory", "Name", "Description", "ObjectType", "ObjectPlacement", "Representation", "Tag", "PredefinedType"];
const SUB_CONTEXT_ATTRIBUTES = [
    "ContextIdentifier",
    "ContextType",
    "CoordinateSpaceDimension",
    "Precision",
    "WorldCoordinateSystem",
    "TrueNorth",
    "ParentContext",
    "TargetScale",
    "TargetView",
    "UserDefinedTargetView",
];

describe("IfcSchema", () => {
    it("should take its name and release from the table", () => {
        // Act
        const schema = new IfcSchema(TINY_TABLE);

        // Assert
        expect([schema.name, schema.release]).toEqual(["TINY", "TINY 1"]);
    });
});

describe("IfcSchema.entity", () => {
    it("should find an entity in any case and give its name in the schema's spelling", () => {
        // Act
        const info = ifc4().entity("IFCWALL");

        // Assert
        expect(info.name).toBe("IfcWall");
        expect(info.supertype).toBe("IfcBuildingElement");
    });

    it("should flatten the attributes in file order, inherited ones first", () => {
        // Act
        const info = ifc4().entity("IfcWall");

        // Assert
        expect(info.attributes.map((attribute) => attribute.name)).toEqual(WALL_ATTRIBUTES);
    });

    it("should keep each attribute's type as the schema states it", () => {
        // Act
        const info = ifc4().entity("IfcWall");

        // Assert
        expect(info.attributes.map((attribute) => attribute.type)).toEqual([
            "IfcGloballyUniqueId",
            "IfcOwnerHistory",
            "IfcLabel",
            "IfcText",
            "IfcLabel",
            "IfcObjectPlacement",
            "IfcProductRepresentation",
            "IfcIdentifier",
            "IfcWallTypeEnum",
        ]);
    });

    it("should mark the optional attributes", () => {
        // Act
        const info = ifc4().entity("IfcWall");

        // Assert
        expect(info.attributes.map((attribute) => attribute.optional)).toEqual([false, true, true, true, true, true, true, true, true]);
    });

    it("should map each attribute name to its position", () => {
        // Act
        const info = ifc4().entity("IfcWall");

        // Assert
        expect([...info.positions.entries()]).toEqual(WALL_ATTRIBUTES.map((name, position) => [name, position]));
        expect(info.positions.get("Tag")).toBe(7);
    });

    it("should mark the inherited attributes a sub context derives", () => {
        // Act
        const info = ifc4().entity("IfcGeometricRepresentationSubContext");

        // Assert
        expect(info.attributes.map((attribute) => attribute.name)).toEqual(SUB_CONTEXT_ATTRIBUTES);
        expect(info.attributes.map((attribute) => attribute.derived)).toEqual([false, false, true, true, true, true, false, false, false, false]);
    });

    it("should leave the same attributes underived on the supertype that declares them", () => {
        // Act
        const info = ifc4().entity("IfcGeometricRepresentationContext");

        // Assert
        expect(info.attributes.map((attribute) => attribute.derived)).toEqual([false, false, false, false, false, false]);
    });

    it("should mark Dimensions derived on IfcSIUnit", () => {
        // Act
        const info = ifc4().entity("IfcSIUnit");

        // Assert
        expect(info.attributes.map((attribute) => [attribute.name, attribute.derived, attribute.optional])).toEqual([
            ["Dimensions", true, false],
            ["UnitType", false, false],
            ["Prefix", false, true],
            ["Name", false, false],
        ]);
    });

    it("should keep an attribute derived in a subtype of the entity that derives it", () => {
        // Act
        const info = new IfcSchema(TINY_TABLE).entity("SmallPart");

        // Assert
        expect(info.attributes).toEqual([
            { name: "Name", type: "STRING", optional: false, derived: false },
            { name: "Size", type: "Length", optional: true, derived: true },
            { name: "Side", type: "Side", optional: false, derived: false },
            { name: "Weight", type: "PositiveLength", optional: true, derived: false },
        ]);
    });

    it("should say an entity is abstract", () => {
        // Act
        const flags = ["IfcProduct", "IfcRoot", "IfcBuildingElement", "IfcWall", "IfcCartesianPoint"].map((name) => ifc4().entity(name).abstract);

        // Assert
        expect(flags).toEqual([true, true, true, false, false]);
    });

    it("should give a root entity no supertype", () => {
        // Act
        const info = ifc4().entity("IfcRoot");

        // Assert
        expect(info.supertype).toBeNull();
    });

    it("should hand back the same description each time it is asked", () => {
        // Arrange
        const schema = ifc4();

        // Act
        const infos = [schema.entity("IfcWall"), schema.entity("ifcwall")];

        // Assert
        expect(infos[1]).toBe(infos[0]);
    });

    it("should refuse an entity the schema does not have", () => {
        // Act & Assert
        expect(() => ifc4().entity("IfcNothing")).toThrow("IFC4 has no entity named IfcNothing");
    });

    it("should refuse a type name where an entity name belongs", () => {
        // Act & Assert
        expect(() => ifc4().entity("IfcLabel")).toThrow("IFC4 has no entity named IfcLabel");
    });
});

describe("IfcSchema.isSubtypeOf", () => {
    it("should say a wall is an element", () => {
        // Act
        const result = ifc4().isSubtypeOf("IfcWall", "IfcElement");

        // Assert
        expect(result).toBe(true);
    });

    it("should say a wall is not a slab", () => {
        // Act
        const result = ifc4().isSubtypeOf("IfcWall", "IfcSlab");

        // Assert
        expect(result).toBe(false);
    });

    it("should count an entity as a subtype of itself and of its root, in any case", () => {
        // Act
        const results = [ifc4().isSubtypeOf("IfcWall", "IfcWall"), ifc4().isSubtypeOf("ifcwallstandardcase", "IFCROOT")];

        // Assert
        expect(results).toEqual([true, true]);
    });

    it("should not count a supertype as a subtype of its subtype", () => {
        // Act
        const result = ifc4().isSubtypeOf("IfcElement", "IfcWall");

        // Assert
        expect(result).toBe(false);
    });

    it("should say no for a name the schema does not have", () => {
        // Act
        const results = [ifc4().isSubtypeOf("IfcNothing", "IfcRoot"), ifc4().isSubtypeOf("IfcWall", "IfcNothing")];

        // Assert
        expect(results).toEqual([false, false]);
    });
});

describe("IfcSchema.subtypesOf", () => {
    it("should list the entity itself with every subtype below it", () => {
        // Act
        const subtypes = ifc4().subtypesOf("IfcBuildingElement");

        // Assert
        expect(subtypes).toContain("IfcBuildingElement");
        expect(subtypes).toContain("IfcWall");
        expect(subtypes).toContain("IfcWallStandardCase");
        expect(subtypes).toContain("IfcSlab");
        expect(subtypes).not.toContain("IfcElement");
        expect(subtypes).not.toContain("IfcFurnishingElement");
    });

    it("should list a wall's own family exactly", () => {
        // Act
        const subtypes = ifc4().subtypesOf("ifcwall");

        // Assert
        expect([...subtypes].sort()).toEqual(["IfcWall", "IfcWallElementedCase", "IfcWallStandardCase"]);
    });

    it("should list a leaf entity alone", () => {
        // Act
        const subtypes = ifc4().subtypesOf("IfcWallStandardCase");

        // Assert
        expect(subtypes).toEqual(["IfcWallStandardCase"]);
    });

    it("should list nothing for a name the schema does not have", () => {
        // Act
        const subtypes = ifc4().subtypesOf("IfcNothing");

        // Assert
        expect(subtypes).toEqual([]);
    });

    it("should list every subtype of a small table", () => {
        // Act
        const subtypes = new IfcSchema(TINY_TABLE).subtypesOf("Thing");

        // Assert
        expect([...subtypes].sort()).toEqual(["Part", "SmallPart", "Thing"]);
    });
});

describe("IfcSchema.underlying", () => {
    it("should resolve IfcLabel to STRING", () => {
        // Act
        const spec = ifc4().underlying("IfcLabel");

        // Assert
        expect(spec).toBe("STRING");
    });

    it("should resolve IfcPositiveLengthMeasure through IfcLengthMeasure to REAL", () => {
        // Act
        const spec = ifc4().underlying("IfcPositiveLengthMeasure");

        // Assert
        expect(spec).toBe("REAL");
    });

    it("should stop at an aggregate", () => {
        // Act
        const spec = ifc4().underlying("IfcLineIndex");

        // Assert
        expect(spec).toEqual(["LIST", 2, null, "IfcPositiveInteger"]);
    });

    it("should hand an aggregate spec back as it is", () => {
        // Arrange
        const list: IfcAggregateSpec = ["LIST", 1, 3, "IfcLengthMeasure"];

        // Act
        const spec = ifc4().underlying(list);

        // Assert
        expect(spec).toBe(list);
    });

    it("should leave enumerations, selects, entities, simple types and unknown names as they are", () => {
        // Act
        const specs = ["IfcSIPrefix", "IfcValue", "IfcWall", "REAL", "IfcNothing"].map((name) => ifc4().underlying(name));

        // Assert
        expect(specs).toEqual(["IfcSIPrefix", "IfcValue", "IfcWall", "REAL", "IfcNothing"]);
    });
});

describe("IfcSchema name lookups", () => {
    it("should give a type's name in the schema's spelling and nothing for an entity", () => {
        // Act
        const names = [ifc4().typeName("IFCLABEL"), ifc4().typeName("ifcsiprefix"), ifc4().typeName("IfcWall")];

        // Assert
        expect(names).toEqual(["IfcLabel", "IfcSIPrefix", undefined]);
    });

    it("should give an entity's name in the schema's spelling and nothing for a type", () => {
        // Act
        const names = [ifc4().entityName("ifcwall"), ifc4().entityName("IFCSIUNIT"), ifc4().entityName("IfcLabel")];

        // Assert
        expect(names).toEqual(["IfcWall", "IfcSIUnit", undefined]);
    });

    it("should say whether it has an entity, in any case", () => {
        // Act
        const results = [ifc4().hasEntity("IFCWALL"), ifc4().hasEntity("IfcLabel"), ifc4().hasEntity("IfcNothing")];

        // Assert
        expect(results).toEqual([true, false, false]);
    });

    it("should hand back a defined type, an enumeration and a select as the table holds them", () => {
        // Act
        const label = ifc4().type("ifclabel");
        const prefix = ifc4().type("IfcSIPrefix");
        const value = ifc4().type("IFCVALUE");

        // Assert
        expect(label).toEqual({ t: "STRING" });
        expect(prefix).toEqual({ e: ["EXA", "PETA", "TERA", "GIGA", "MEGA", "KILO", "HECTO", "DECA", "DECI", "CENTI", "MILLI", "MICRO", "NANO", "PICO", "FEMTO", "ATTO"] });
        expect(value).toEqual({ s: ["IfcDerivedMeasureValue", "IfcMeasureValue", "IfcSimpleValue"] });
    });

    it("should hand back nothing for an entity or an unknown type", () => {
        // Act
        const types = [ifc4().type("IfcWall"), ifc4().type("IfcNothing")];

        // Assert
        expect(types).toEqual([undefined, undefined]);
    });
});

describe("SIMPLE_TYPES", () => {
    it("should list the seven simple types of EXPRESS", () => {
        // Assert
        expect([...SIMPLE_TYPES].sort()).toEqual(["BINARY", "BOOLEAN", "INTEGER", "LOGICAL", "NUMBER", "REAL", "STRING"]);
    });
});
