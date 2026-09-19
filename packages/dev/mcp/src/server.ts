import { McpServer } from "@modelcontextprotocol/server";
import type { StandardSchemaWithJSON } from "@modelcontextprotocol/server";
import type { z } from "zod";
import { inputJsonSchema } from "./registry.js";
import type { AnyToolDefinition, Registry, ToolInput, ToolResult } from "./registry.js";

export interface McpServerOptions<TContext> {
    name: string;
    version: string;
    instructions?: string;
    filter?: (definition: AnyToolDefinition<TContext>) => boolean;
}

type TextContent = { type: "text"; text: string };
type LinkContent = { type: "resource_link"; uri: string; name: string; mimeType?: string; description?: string };

function toCallToolResult(result: ToolResult): { content: (TextContent | LinkContent)[]; structuredContent?: Record<string, unknown>; isError?: boolean } {
    const links: LinkContent[] = (result.links ?? []).map((link) => ({
        type: "resource_link",
        uri: link.uri,
        name: link.name,
        ...(link.mimeType === undefined ? {} : { mimeType: link.mimeType }),
        ...(link.description === undefined ? {} : { description: link.description }),
    }));
    return {
        content: [{ type: "text", text: result.text }, ...links],
        ...(result.structured ? { structuredContent: result.structured } : {}),
        ...(result.isError ? { isError: true } : {}),
    };
}

function advertised<TInput extends ToolInput>(input: TInput): StandardSchemaWithJSON<z.input<TInput>, z.output<TInput>> {
    const json = inputJsonSchema(input);
    const standard = input["~standard"] as StandardSchemaWithJSON<z.input<TInput>, z.output<TInput>>["~standard"];
    return { "~standard": { ...standard, jsonSchema: { input: () => json, output: () => json } } };
}

export function bindRegistry<TContext>(
    server: McpServer,
    registry: Registry<TContext>,
    context: TContext,
    filter?: (definition: AnyToolDefinition<TContext>) => boolean,
): string[] {
    const bound: string[] = [];
    for (const definition of registry.list()) {
        const { handler } = definition;
        if (!handler || (filter && !filter(definition))) continue;
        const { annotations } = definition;
        server.registerTool(
            definition.name,
            {
                title: annotations.title,
                description: definition.description,
                inputSchema: advertised(definition.input),
                annotations: {
                    title: annotations.title,
                    readOnlyHint: annotations.readOnlyHint,
                    destructiveHint: annotations.destructiveHint,
                    ...(annotations.idempotentHint === undefined ? {} : { idempotentHint: annotations.idempotentHint }),
                    ...(annotations.openWorldHint === undefined ? {} : { openWorldHint: annotations.openWorldHint }),
                },
            },
            async (args) => toCallToolResult(await handler(args, context)),
        );
        bound.push(definition.name);
    }
    return bound;
}

export function createMcpServer<TContext>(registry: Registry<TContext>, context: TContext, options: McpServerOptions<TContext>): McpServer {
    const server = new McpServer(
        { name: options.name, version: options.version },
        options.instructions === undefined ? {} : { instructions: options.instructions },
    );
    bindRegistry(server, registry, context, options.filter);
    return server;
}
