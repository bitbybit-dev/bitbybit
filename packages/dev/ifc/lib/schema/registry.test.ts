import { describe, expect, it } from "vitest";
import { SUPPORTED_SCHEMAS, readingSchemaFor, schemaNamed } from "./registry";
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

    it("should read the identifier in any case and around space, handing back the one cached schema", () => {
        // Act
        const schemas = [schemaNamed("IFC4"), schemaNamed("ifc4"), schemaNamed("  Ifc4 \n")];

        // Assert
        expect(schemas[1]).toBe(schemas[0]);
        expect(schemas[2]).toBe(schemas[0]);
    });

    it("should refuse a schema it does not support, naming the ones it does", () => {
        // Act & Assert
        expect(() => schemaNamed("IFC2X3")).toThrow("The IFC schema IFC2X3 is not supported; supported: IFC4");
    });

    it("should refuse an empty identifier", () => {
        // Act & Assert
        expect(() => schemaNamed("")).toThrow("The IFC schema  is not supported; supported: IFC4");
    });
});

describe("SUPPORTED_SCHEMAS", () => {
    it("should list IFC4 alone", () => {
        // Assert
        expect(SUPPORTED_SCHEMAS).toEqual(["IFC4"]);
    });

    it("should read an IFC2X3 file through the IFC4 table and know no table for an unknown schema", () => {
        // Act
        const schemas = [readingSchemaFor("IFC2X3"), readingSchemaFor(" ifc4 "), readingSchemaFor("IFC4X3")];

        // Assert
        expect(schemas[0]).toBe(schemaNamed("IFC4"));
        expect(schemas[1]).toBe(schemaNamed("IFC4"));
        expect(schemas[2]).toBeUndefined();
    });
});
