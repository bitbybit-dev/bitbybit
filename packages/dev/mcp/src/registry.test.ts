import { describe, expect, it } from "vitest";
import { z } from "zod";
import { INTERNAL_ERROR_CODE, INTERNAL_ERROR_TEXT, Registry, TOOL_CEILING, guarded, inputJsonSchema, toHttp } from "./registry.js";
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

    it("maps every handler into a new registry, leaving handler-less tools and the definitions as they are", async () => {
        // Arrange
        const registry = new Registry<EchoContext>().register(echo).register(declaredOnly);

        // Act
        const shouting = registry.map((handler) => async (args, context) => {
            const result = await handler(args, context);
            return { ...result, text: result.text.toUpperCase() };
        });
        const result = await shouting.get("echo")?.handler?.({ text: "hi", times: 2 }, { prefix: "> " });

        // Assert
        expect(result).toEqual({ text: "> HIHI", structured: { times: 2 } });
        expect(shouting.list().map((definition) => definition.name)).toEqual(["echo", "browser_only"]);
        expect(shouting.get("browser_only")?.handler).toBeUndefined();
        expect(registry.get("echo")?.description).toBe("Repeats the text");
    });

    it("guards a throwing handler into a generic error result and reports the throw with the tool's name", async () => {
        // Arrange
        const reports: { error: unknown; tool: string }[] = [];
        const broken: ToolDefinition<typeof echoInput, EchoContext> = { ...echo, name: "broken", handler: () => { throw new Error("Fetching https://internal.test failed"); } };
        const safe = guarded(new Registry<EchoContext>().register(echo).register(broken), (error, tool) => reports.push({ error, tool }));

        // Act
        const failed = await safe.get("broken")?.handler?.({ text: "x" }, { prefix: "" });
        const fine = await safe.get("echo")?.handler?.({ text: "x" }, { prefix: "" });

        // Assert
        expect(failed).toEqual({ text: INTERNAL_ERROR_TEXT, structured: { code: INTERNAL_ERROR_CODE }, isError: true });
        expect(reports).toEqual([{ error: expect.objectContaining({ message: "Fetching https://internal.test failed" }), tool: "broken" }]);
        expect(fine?.text).toBe("x");
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

    it("renders the JSON schema of an input once and answers the same object afterwards", () => {
        // Act
        const first = inputJsonSchema(echoInput);
        const second = inputJsonSchema(echoInput);

        // Assert
        expect(second).toBe(first);
        expect(toHttp(new Registry<EchoContext>().register(echo), { prefix: "" })[0]?.inputSchema).toBe(first);
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
