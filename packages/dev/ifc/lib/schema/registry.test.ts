import { describe, expect, it } from "vitest";
import { SUPPORTED_SCHEMAS, describeSupportedSchemas, isEditableSchema, readingSchemaFor, schemaNamed } from "./registry";
import { IfcSchema } from "./schema";

describe("schemaNamed", () => {
    it("should load the IFC4 schema", () => {
        // Act
        const schema = schemaNamed("IFC4");

        // Assert
        expect(schema).toBeInstanceOf(IfcSchema);
        expect(schema.name).toBe("IFC4");
        expect(schema.release).toBe("IFC4 ADD2 TC1");
    });

    it("should load the IFC4X3 ADD2 schema, with the entities IFC 4.3 added", () => {
        // Act
        const schema = schemaNamed("IFC4X3_ADD2");

        // Assert
        expect([schema.name, schema.release, schema.hasEntity("IfcAlignment"), schema.hasEntity("IfcBuildingElement")]).toEqual(["IFC4X3_ADD2", "IFC4X3 ADD2", true, false]);
        expect(schema.isSubtypeOf("IfcWall", "IfcBuiltElement")).toBe(true);
    });

    it("should read the identifier in any case and around space, handing back the one cached schema", () => {
        // Act
        const schemas = [schemaNamed("IFC4"), schemaNamed("ifc4"), schemaNamed("  Ifc4 \n")];

        // Assert
        expect(schemas[1]).toBe(schemas[0]);
        expect(schemas[2]).toBe(schemas[0]);
    });

    it("should refuse a schema it does not support, naming the ones it does", () => {
        // Act & Assert
        expect(() => schemaNamed("IFC2X3")).toThrow("The IFC schema IFC2X3 is not supported; supported: IFC4, IFC4X3_ADD2");
    });

    it("should refuse an empty identifier", () => {
        // Act & Assert
        expect(() => schemaNamed("")).toThrow("The IFC schema  is not supported; supported: IFC4, IFC4X3_ADD2");
    });
});

describe("SUPPORTED_SCHEMAS", () => {
    it("should list IFC4 and IFC4X3 ADD2, and say which other identifiers are read through them", () => {
        // Assert
        expect(SUPPORTED_SCHEMAS).toEqual(["IFC4", "IFC4X3_ADD2"]);
        expect(describeSupportedSchemas()).toBe("IFC4 and IFC4X3_ADD2, with IFC2X3 through IFC4 and IFC4X3 through IFC4X3_ADD2");
    });

    it("should read IFC2X3 through IFC4 and a bare IFC4X3 through IFC4X3 ADD2, and know no table for an unknown schema", () => {
        // Act
        const schemas = [readingSchemaFor("IFC2X3"), readingSchemaFor(" ifc4 "), readingSchemaFor("IFC4X3"), readingSchemaFor("ifc4x3_add2"), readingSchemaFor("IFC4X3_RC4")];

        // Assert
        expect(schemas.map((schema) => schema?.name)).toEqual(["IFC4", "IFC4", "IFC4X3_ADD2", "IFC4X3_ADD2", undefined]);
    });

    it("should allow changes to IFC4 models only", () => {
        // Assert
        expect([isEditableSchema("IFC4"), isEditableSchema(" ifc4 "), isEditableSchema("IFC4X3_ADD2"), isEditableSchema("IFC2X3")]).toEqual([true, true, false, false]);
    });
});
