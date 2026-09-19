import { describe, expect, it } from "vitest";
import { z } from "zod";
import { Registry, TOOL_CEILING, inputJsonSchema, toHttp } from "./registry.js";
import type { ToolDefinition } from "./registry.js";

interface EchoContext {
    prefix: string;
}

const echoInput = z.object({ text: z.string(), times: z.number().int().min(1).optional() });

const echo: ToolDefinition<typeof echoInput, EchoContext> = {
    name: "echo",
    description: "Repeats the text",
    annotations: { title: "Echo", readOnlyHint: true, destructiveHint: false },
    input: echoInput,
    where: "server",
    handler: (args, context) => ({ text: `${context.prefix}${args.text.repeat(args.times ?? 1)}`, structured: { times: args.times ?? 1 } }),
};

const declaredOnly: ToolDefinition<typeof echoInput, EchoContext> = {
    name: "browser_only",
    description: "Answered by the client application",
    annotations: { title: "Browser only", readOnlyHint: true, destructiveHint: false },
    input: echoInput,
    where: "browser",
};

describe("Registry", () => {
    it("lists tools in registration order and finds them by name", () => {
        // Arrange
        const registry = new Registry<EchoContext>().register(echo).register(declaredOnly);

        // Act
        const names = registry.list().map((definition) => definition.name);

        // Assert
        expect(names).toEqual(["echo", "browser_only"]);
        expect(registry.get("echo")?.description).toBe("Repeats the text");
        expect(registry.get("missing")).toBeUndefined();
        expect(registry.size).toBe(2);
    });

    it("refuses a second tool of the same name", () => {
        // Arrange
        const registry = new Registry<EchoContext>().register(echo);

        // Act & Assert
        expect(() => registry.register(echo)).toThrow("already registered");
    });

    it("keeps the ceiling at eight tools", () => {
        // Assert
        expect(TOOL_CEILING).toBe(8);
    });
});

describe("toHttp", () => {
    it("serves only tools with a handler, with their JSON schema", () => {
        // Arrange
        const registry = new Registry<EchoContext>().register(echo).register(declaredOnly);

        // Act
        const tools = toHttp(registry, { prefix: "" });

        // Assert
        expect(tools.map((tool) => tool.name)).toEqual(["echo"]);
        expect(tools[0]?.inputSchema).toMatchObject({ type: "object", required: ["text"] });
        expect(Object.keys(tools[0]?.inputSchema["properties"] ?? {})).toEqual(["text", "times"]);
    });

    it("calls the handler with parsed arguments and the context", async () => {
        // Arrange
        const registry = new Registry<EchoContext>().register(echo);
        const [tool] = toHttp(registry, { prefix: "> " });

        // Act
        const result = await tool?.call({ text: "ab", times: 2 });

        // Assert
        expect(result).toEqual({ text: "> abab", structured: { times: 2 } });
    });

    it("answers invalid arguments with an error result instead of throwing", async () => {
        // Arrange
        const registry = new Registry<EchoContext>().register(echo);
        const [tool] = toHttp(registry, { prefix: "" });

        // Act
        const result = await tool?.call({ times: 0 });

        // Assert
        expect(result?.isError).toBe(true);
        expect(result?.text).toContain("Invalid arguments for echo");
    });

    it("applies a filter", () => {
        // Arrange
        const registry = new Registry<EchoContext>().register(echo);

        // Act
        const tools = toHttp(registry, { prefix: "" }, (definition) => definition.name !== "echo");

        // Assert
        expect(tools).toEqual([]);
    });

    it("renders draft 2020-12 JSON schema for an input", () => {
        // Act
        const schema = inputJsonSchema(echoInput);

        // Assert
        expect(schema["$schema"]).toBe("https://json-schema.org/draft/2020-12/schema");
        expect(schema["type"]).toBe("object");
    });

    it("inlines the definitions a registered id turns into references, and the pointers a reused schema turns into", () => {
        // Arrange
        const options = z.object({ formats: z.array(z.string()) }).meta({ id: "InlineTestOptions" });
        const reused = z.object({ format: z.string() });
        const body = z.object({ fileId: z.string(), outputs: options.optional(), first: reused, second: reused }).meta({ id: "InlineTestBody" });

        // Act
        const schema = inputJsonSchema(body);

        // Assert
        expect(schema["type"]).toBe("object");
        expect(schema["$defs"]).toBeUndefined();
        expect((schema["properties"] as Record<string, Record<string, unknown>>)["outputs"]?.["type"]).toBe("object");
        expect((schema["properties"] as Record<string, Record<string, unknown>>)["second"]?.["type"]).toBe("object");
        expect(JSON.stringify(schema)).not.toContain("$ref");
    });
});
