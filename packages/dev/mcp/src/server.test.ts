import { describe, expect, it } from "vitest";
import { Client, InMemoryTransport } from "@modelcontextprotocol/client";
import { createMcpServer, createRequestHandler } from "./server.js";
import { createDocsRegistry } from "./tools/index.js";
import { z } from "zod";
import { Registry, toHttp } from "./registry.js";
import { ok } from "./results.js";
import { DESCRIPTIONS, SERVER_INSTRUCTIONS, TOOL_NAMES } from "./descriptions.js";
import { FIXTURE_VERSION, fixtureContext } from "./__fixtures__/load.js";

async function connectedClient(): Promise<Client> {
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    const server = createMcpServer(createDocsRegistry(), fixtureContext(), { name: "bitbybit", version: FIXTURE_VERSION, instructions: SERVER_INSTRUCTIONS });
    await server.connect(serverTransport);
    const client = new Client({ name: "test-client", version: "0.0.0" });
    await client.connect(clientTransport);
    return client;
}

describe("the MCP binding", () => {
    it("lists the seven tools with their titles, descriptions and read-only annotations", async () => {
        // Arrange
        const client = await connectedClient();

        // Act
        const { tools } = await client.listTools();

        // Assert
        expect(tools.map((tool) => tool.name)).toEqual([...TOOL_NAMES]);
        for (const tool of tools) {
            const expected = DESCRIPTIONS[tool.name as keyof typeof DESCRIPTIONS];
            expect(tool.title).toBe(expected.title);
            expect(tool.description).toBe(expected.description);
            expect(tool.annotations).toMatchObject({ readOnlyHint: true, destructiveHint: false, openWorldHint: false });
        }
    });

    it("advertises the same argument shapes the HTTP binding does", async () => {
        // Arrange
        const client = await connectedClient();
        const http = toHttp(createDocsRegistry(), fixtureContext());

        // Act
        const { tools } = await client.listTools();

        // Assert
        for (const tool of tools) {
            const twin = http.find((candidate) => candidate.name === tool.name);
            const mcpProperties = Object.keys(tool.inputSchema.properties ?? {}).sort();
            const httpProperties = Object.keys(twin?.inputSchema["properties"] ?? {}).sort();
            expect(mcpProperties).toEqual(httpProperties);
            expect(tool.inputSchema.required ?? []).toEqual(twin?.inputSchema["required"] ?? []);
        }
    });

    it("advertises the inlined JSON schema of the HTTP binding, not a reference-laden one", async () => {
        // Arrange
        const client = await connectedClient();
        const http = toHttp(createDocsRegistry(), fixtureContext());

        // Act
        const { tools } = await client.listTools();

        // Assert
        for (const tool of tools) {
            const twin = http.find((candidate) => candidate.name === tool.name);
            expect(tool.inputSchema).toEqual(twin?.inputSchema);
        }
        expect(JSON.stringify(tools)).not.toContain("\"$ref\":");
    });

    it("does not serve a tool the filter hides, so calling it is not found rather than refused", async () => {
        // Arrange
        const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
        const server = createMcpServer(createDocsRegistry(), fixtureContext(), { name: "bitbybit", version: FIXTURE_VERSION, filter: (definition) => definition.name !== "describe" });
        await server.connect(serverTransport);
        const client = new Client({ name: "test-client", version: "0.0.0" });
        await client.connect(clientTransport);

        // Act
        const listed = (await client.listTools()).tools.map((tool) => tool.name);
        const attempt = client.callTool({ name: "describe", arguments: { path: "occt" } });

        // Assert
        expect(listed).not.toContain("describe");
        await expect(attempt).rejects.toThrow(/not found/);
    });

    it("answers describe with text and structured content carrying the version", async () => {
        // Arrange
        const client = await connectedClient();

        // Act
        const result = await client.callTool({ name: "describe", arguments: { path: "occt.shapes.solid.createBox" } });

        // Assert
        const content = result.content as { type: string; text: string }[];
        expect(content[0]?.type).toBe("text");
        expect(content[0]?.text).toContain("createBox(");
        expect((result.structuredContent as { version: string }).version).toBe(FIXTURE_VERSION);
        expect(result.isError).toBeFalsy();
    });

    it("hands a tool's links over as resource links after its text", async () => {
        // Arrange
        const registry = new Registry<Record<string, never>>().register({
            name: "produce",
            description: "Produces a file",
            annotations: { title: "Produce", readOnlyHint: false, destructiveHint: false },
            input: z.object({}),
            where: "server",
            handler: () => ({ text: "done", links: [{ uri: "https://files.test/result.glb", name: "result.glb", mimeType: "model/gltf-binary", description: "expires in 1 hour" }] }),
        });
        const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
        await createMcpServer(registry, {}, { name: "t", version: "0.0.0" }).connect(serverTransport);
        const client = new Client({ name: "test-client", version: "0.0.0" });
        await client.connect(clientTransport);

        // Act
        const result = await client.callTool({ name: "produce", arguments: {} });

        // Assert
        expect(result.content).toEqual([
            { type: "text", text: "done" },
            { type: "resource_link", uri: "https://files.test/result.glb", name: "result.glb", mimeType: "model/gltf-binary", description: "expires in 1 hour" },
        ]);
    });

    it("carries the server instructions", async () => {
        // Arrange
        const client = await connectedClient();

        // Act
        const instructions = client.getInstructions();

        // Assert
        expect(instructions).toBe(SERVER_INSTRUCTIONS);
    });
});

interface Caller {
    who: string;
}

function callerRegistry(): Registry<Caller> {
    return new Registry<Caller>()
        .register({
            name: "whoami",
            description: "Names the caller",
            annotations: { title: "Who am I", readOnlyHint: true, destructiveHint: false },
            input: z.object({}),
            where: "server",
            handler: (_args, context) => ok(context.who),
        })
        .register({
            name: "secret",
            description: "Members only",
            annotations: { title: "Secret", readOnlyHint: true, destructiveHint: false },
            input: z.object({}),
            where: "server",
            handler: () => ok("the secret"),
        });
}

function rpc(method: string, params: Record<string, unknown> = {}): Request {
    return new Request("https://mcp.test/mcp", {
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json, text/event-stream" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    });
}

async function reply(response: Response): Promise<{ result?: Record<string, unknown>; error?: { message: string } }> {
    const text = await response.text();
    const data = text.split("\n").find((line) => line.startsWith("data: "));
    return JSON.parse(data === undefined ? text : data.slice("data: ".length)) as { result?: Record<string, unknown>; error?: { message: string } };
}

describe("the request handler", () => {
    it("serves every request through one handler with the context that request carries", async () => {
        // Arrange
        const handler = createRequestHandler(callerRegistry(), {
            name: "t",
            version: "0.0.0",
            filterFor: (context) => (definition) => context.who !== "guest" || definition.name !== "secret",
        });

        // Act
        const member = await reply(await handler.fetch(rpc("tools/list"), { who: "member" }));
        const guest = await reply(await handler.fetch(rpc("tools/list"), { who: "guest" }));
        const named = await reply(await handler.fetch(rpc("tools/call", { name: "whoami", arguments: {} }), { who: "alice" }));
        const hidden = await reply(await handler.fetch(rpc("tools/call", { name: "secret", arguments: {} }), { who: "guest" }));

        // Assert
        const names = (listed: Record<string, unknown> | undefined): string[] => ((listed?.["tools"] ?? []) as { name: string }[]).map((tool) => tool.name);
        expect(names(member.result)).toEqual(["whoami", "secret"]);
        expect(names(guest.result)).toEqual(["whoami"]);
        expect((named.result?.["content"] as { text: string }[])[0]?.text).toBe("alice");
        expect(hidden.error?.message).toContain("secret");
    });

    it("carries the server name, version and instructions", async () => {
        // Arrange
        const handler = createRequestHandler(callerRegistry(), { name: "bitbybit", version: FIXTURE_VERSION, instructions: SERVER_INSTRUCTIONS });

        // Act
        const initialized = await reply(await handler.fetch(rpc("initialize", { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "test-client", version: "0.0.0" } }), { who: "member" }));

        // Assert
        expect(initialized.result?.["serverInfo"]).toMatchObject({ name: "bitbybit", version: FIXTURE_VERSION });
        expect(initialized.result?.["instructions"]).toBe(SERVER_INSTRUCTIONS);
    });
});
