import { describe, expect, it } from "vitest";
import { inlineJsonSchemaReferences } from "./json-schema.js";

const OPTIONS = { type: "object", properties: { formats: { type: "array", items: { type: "string" } } }, required: ["formats"] };

describe("inlineJsonSchemaReferences", () => {
    it("replaces every local reference with its definition and drops the definitions table", () => {
        // Arrange
        const schema = {
            type: "object",
            properties: { first: { $ref: "#/$defs/Options", description: "first" }, second: { $ref: "#/$defs/Options" }, list: { type: "array", items: { $ref: "#/$defs/Options" } } },
            $defs: { Options: OPTIONS },
        };

        // Act
        const inlined = inlineJsonSchemaReferences(schema);

        // Assert
        expect(inlined).toEqual({
            type: "object",
            properties: { first: { ...OPTIONS, description: "first" }, second: OPTIONS, list: { type: "array", items: OPTIONS } },
        });
        expect(JSON.stringify(inlined)).not.toContain("$ref");
    });

    it("keeps a cyclic reference in place together with the definitions it needs", () => {
        // Arrange
        const schema = {
            type: "object",
            properties: { node: { $ref: "#/$defs/Node" } },
            $defs: { Node: { type: "object", properties: { children: { type: "array", items: { $ref: "#/$defs/Node" } } } } },
        };

        // Act
        const inlined = inlineJsonSchemaReferences(schema);

        // Assert
        const node = (inlined["properties"] as Record<string, Record<string, unknown>>)["node"];
        expect(node?.["type"]).toBe("object");
        expect(JSON.stringify(node)).toContain("\"$ref\":\"#/$defs/Node\"");
        expect(inlined["$defs"]).toEqual(schema.$defs);
    });

    it("leaves a reference that points nowhere, and a remote one, untouched", () => {
        // Arrange
        const schema = { properties: { missing: { $ref: "#/$defs/Missing" }, remote: { $ref: "https://example.test/schema.json" } } };

        // Act
        const inlined = inlineJsonSchemaReferences(schema);

        // Assert
        expect(inlined).toEqual(schema);
    });

    it("decodes the escaped characters of a JSON pointer", () => {
        // Arrange
        const schema = { properties: { odd: { $ref: "#/$defs/a~1b~0c" } }, $defs: { "a/b~c": { type: "string" } } };

        // Act
        const inlined = inlineJsonSchemaReferences(schema);

        // Assert
        expect(inlined).toEqual({ properties: { odd: { type: "string" } } });
    });
});
